<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

// Allow the deployed AegisVault frontend to call the API directly from the browser.
$allowedOrigins = ['https://aegisvaultx.vercel.app'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && in_array($origin, $allowedOrigins, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, Accept');
}
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    if ($origin === '' || !in_array($origin, $allowedOrigins, true)) {
        http_response_code(403);
        exit;
    }
    http_response_code(204);
    exit;
}

$configPath = __DIR__ . '/config.php';
if (!is_file($configPath)) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'API is not configured. Copy config.example.php to config.php.']);
    exit;
}
$config = require $configPath;

function respond(int $status, array $payload): never {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}
function body(): array {
    $raw = file_get_contents('php://input') ?: '{}';
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}
function textLength(string $value): int {
    return function_exists('mb_strlen') ? mb_strlen($value, 'UTF-8') : strlen($value);
}
function cleanString(mixed $value, int $max = 255): string {
    $value = trim((string)($value ?? ''));
    return function_exists('mb_substr')
        ? mb_substr($value, 0, $max, 'UTF-8')
        : substr($value, 0, $max);
}
function publicUser(array $u): array {
    return ['id'=>$u['id'], 'fullName'=>$u['full_name'], 'email'=>$u['email'], 'role'=>$u['role'], 'createdAt'=>$u['created_at']];
}
function authorizationHeader(): string {
    $header = $_SERVER['HTTP_AUTHORIZATION']
        ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
        ?? '';

    // Some cPanel/Apache + PHP-FPM configurations expose Authorization
    // through getallheaders() instead of $_SERVER.
    if ($header === '' && function_exists('getallheaders')) {
        foreach (getallheaders() ?: [] as $name => $value) {
            if (strcasecmp((string)$name, 'Authorization') === 0) {
                $header = (string)$value;
                break;
            }
        }
    }
    return trim((string)$header);
}

function authUser(PDO $pdo): ?array {
    $header = authorizationHeader();
    if (!preg_match('/^Bearer\s+([a-f0-9]{64})$/i', $header, $m)) return null;
    $hash = hash('sha256', $m[1]);
    $q = $pdo->prepare('SELECT u.* FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at > UTC_TIMESTAMP() LIMIT 1');
    $q->execute([$hash]);
    return $q->fetch(PDO::FETCH_ASSOC) ?: null;
}
function logEvent(PDO $pdo, string $userId, string $kind, string $message, bool $adminVisible=false): void {
    $q = $pdo->prepare('INSERT INTO activity_events (id,user_id,kind,message,is_admin_visible,created_at) VALUES (?,?,?,?,?,UTC_TIMESTAMP())');
    $q->execute([uuid(), $userId, $kind, $message, $adminVisible ? 1 : 0]);
}
function uuid(): string {
    $b = random_bytes(16); $b[6] = chr((ord($b[6]) & 0x0f) | 0x40); $b[8] = chr((ord($b[8]) & 0x3f) | 0x80);
    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($b), 4));
}
function walletChain(string $address): ?string {
    if ($address === '') return null;
    if (preg_match('/^0x[a-fA-F0-9]{40}$/', $address)) return 'EVM';
    if (preg_match('/^(1[a-km-zA-HJ-NP-Z1-9]{25,34}|3[a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{11,71})$/', $address)) return 'Bitcoin';
    if (preg_match('/^[1-9A-HJ-NP-Za-km-z]{32,44}$/', $address)) return 'Solana';
    return 'Other';
}
function walletTypes(): array {
    return [
        'metamask'=>'MetaMask',
        'coinbase'=>'Coinbase Wallet',
        'trust'=>'Trust Wallet',
        'ledger'=>'Ledger',
        'trezor'=>'Trezor',
        'phantom'=>'Phantom',
        'exodus'=>'Exodus',
        'rainbow'=>'Rainbow',
        'binance_web3'=>'Binance Web3 Wallet',
        'okx'=>'OKX Wallet',
        'rabby'=>'Rabby Wallet',
        'safepal'=>'SafePal',
        'uniswap'=>'Uniswap Wallet',
        'zerion'=>'Zerion',
    ];
}
function rows(PDO $pdo, string $sql, array $params=[]): array {
    $q=$pdo->prepare($sql); $q->execute($params); return $q->fetchAll(PDO::FETCH_ASSOC);
}
function camelRows(array $items): array {
    return array_map(function(array $r): array {
        foreach($r as $k=>$v){ $camel=lcfirst(str_replace(' ','',ucwords(str_replace('_',' ',$k)))); if($camel!==$k){$r[$camel]=$v;unset($r[$k]);} }
        if(isset($r['checklist']) && is_string($r['checklist'])) $r['checklist']=json_decode($r['checklist'],true) ?: [];
        return $r;
    }, $items);
}

function telegramConfig(array $config): bool {
    foreach (['telegram_bot_token','telegram_admin_chat_id','telegram_admin_user_id','telegram_admin_telegram_user_id','telegram_webhook_secret'] as $key) {
        if (!isset($config[$key]) || trim((string)$config[$key]) === '' || str_starts_with((string)$config[$key], 'YOUR_')) return false;
    }
    return true;
}
function telegramApi(array $config, string $method, array $payload): array {
    $url = 'https://api.telegram.org/bot' . $config['telegram_bot_token'] . '/' . $method;
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_TIMEOUT => 10,
    ]);
    $raw = curl_exec($ch);
    $error = curl_error($ch);
    $status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($raw === false) throw new RuntimeException('Telegram request failed: '.$error);
    $decoded = json_decode($raw, true);
    if ($status < 200 || $status >= 300 || !is_array($decoded) || empty($decoded['ok'])) {
        throw new RuntimeException('Telegram API returned an unsuccessful response.');
    }
    return $decoded;
}
function notifyTelegramRequest(PDO $pdo, array $config, string $kind, string $requestId): void {
    if (!telegramConfig($config)) return;
    try {
        $table = $kind === 'wallet' ? 'wallet_requests' : 'backup_requests';
        $q = $pdo->prepare("SELECT r.*,u.full_name,u.email FROM {$table} r JOIN users u ON u.id=r.user_id WHERE r.id=? LIMIT 1");
        $q->execute([$requestId]);
        $r = $q->fetch(PDO::FETCH_ASSOC);
        if (!$r) return;
        $title = $kind === 'wallet' ? '🔐 <b>New wallet protection request</b>' : '🛡️ <b>New backup review request</b>';
        $walletName = walletTypes()[$r['wallet_type']] ?? $r['wallet_type'];
        $address = htmlspecialchars((string)($r['address'] ?? 'Not supplied'), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
        $name = htmlspecialchars((string)$r['full_name'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
        $email = htmlspecialchars((string)$r['email'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
        $wallet = htmlspecialchars((string)$walletName, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
        $chain = htmlspecialchars((string)($r['chain'] ?? 'Unknown'), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
        $label = $kind === 'wallet' && !empty($r['label']) ? "\n<b>Label:</b> ".htmlspecialchars((string)$r['label'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') : '';
        $message = $title."\n\n<b>User:</b> {$name}\n<b>Email:</b> {$email}\n<b>Wallet:</b> {$wallet}{$label}\n<b>Network:</b> {$chain}\n<b>Public address:</b> <code>{$address}</code>\n<b>Submitted:</b> ".htmlspecialchars((string)$r['created_at'], ENT_QUOTES, 'UTF-8')."\n\n<i>Review the public address request only. Never ask for a seed phrase or private key.</i>";
        $prefix = $kind === 'wallet' ? 'av:w:' : 'av:b:';
        telegramApi($config, 'sendMessage', [
            'chat_id' => $config['telegram_admin_chat_id'],
            'text' => $message,
            'parse_mode' => 'HTML',
            'disable_web_page_preview' => true,
            'reply_markup' => [
                'inline_keyboard' => [[
                    ['text' => '✅ Approve', 'callback_data' => $prefix.'a:'.$requestId],
                    ['text' => '❌ Reject', 'callback_data' => $prefix.'r:'.$requestId],
                ]],
            ],
        ]);
    } catch (Throwable $e) {
        // Telegram is an optional notification channel; never fail a valid user request because Telegram is unavailable.
        error_log('AegisVault Telegram notification failed: '.$e->getMessage());
    }
}
function handleTelegramWebhook(PDO $pdo, array $config, array $update): void {
    if (!isset($update['callback_query']) || !is_array($update['callback_query'])) return;
    $callback = $update['callback_query'];
    $callbackId = (string)($callback['id'] ?? '');
    $fromId = (string)($callback['from']['id'] ?? '');
    $chatId = (string)($callback['message']['chat']['id'] ?? '');
    $data = (string)($callback['data'] ?? '');
    if ($fromId !== (string)$config['telegram_admin_telegram_user_id'] || $chatId !== (string)$config['telegram_admin_chat_id']) {
        if ($callbackId !== '') telegramApi($config, 'answerCallbackQuery', ['callback_query_id'=>$callbackId,'text'=>'You are not authorised to review requests.','show_alert'=>true]);
        return;
    }
    if (!preg_match('/^av:([wb]):([ar]):([a-f0-9-]{36})$/i', $data, $m)) {
        if ($callbackId !== '') telegramApi($config, 'answerCallbackQuery', ['callback_query_id'=>$callbackId,'text'=>'Invalid review action.','show_alert'=>true]);
        return;
    }
    $kind = $m[1] === 'w' ? 'wallet' : 'backup';
    $decision = $m[2] === 'a' ? 'approved' : 'rejected';
    $id = $m[3];
    $table = $kind === 'wallet' ? 'wallet_requests' : 'backup_requests';
    $q = $pdo->prepare("SELECT * FROM {$table} WHERE id=? LIMIT 1");
    $q->execute([$id]);
    $req = $q->fetch(PDO::FETCH_ASSOC);
    if (!$req || $req['status'] !== 'pending') {
        if ($callbackId !== '') telegramApi($config, 'answerCallbackQuery', ['callback_query_id'=>$callbackId,'text'=>'This request has already been reviewed or no longer exists.','show_alert'=>true]);
        return;
    }
    $adminId = (string)$config['telegram_admin_user_id'];
    $check = $pdo->prepare("SELECT id FROM users WHERE id=? AND role='admin' LIMIT 1");
    $check->execute([$adminId]);
    if (!$check->fetch()) {
        if ($callbackId !== '') telegramApi($config, 'answerCallbackQuery', ['callback_query_id'=>$callbackId,'text'=>'Telegram reviewer is not configured as an admin account.','show_alert'=>true]);
        return;
    }
    $pdo->beginTransaction();
    try {
        $q = $pdo->prepare("UPDATE {$table} SET status=?,review_note=?,reviewed_by=?,reviewed_at=UTC_TIMESTAMP() WHERE id=? AND status='pending'");
        $q->execute([$decision, null, $adminId, $id]);
        if ($q->rowCount() !== 1) {
            $pdo->rollBack();
            if ($callbackId !== '') telegramApi($config, 'answerCallbackQuery', ['callback_query_id'=>$callbackId,'text'=>'This request was already processed.','show_alert'=>true]);
            return;
        }
        if ($kind === 'wallet') $message = $decision === 'approved' ? 'Wallet protection approved — '.$req['wallet_type'].' public address review approved.' : 'Wallet protection request declined by an administrator.';
        else $message = $decision === 'approved' ? 'Backup wallet protection approved — '.$req['wallet_type'].' public address review approved.' : 'Backup wallet protection request declined by an administrator.';
        logEvent($pdo, $req['user_id'], $kind, $message, true);
        $pdo->commit();
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        throw $e;
    }
    if ($callbackId !== '') telegramApi($config, 'answerCallbackQuery', ['callback_query_id'=>$callbackId,'text'=>$decision === 'approved' ? 'Request approved.' : 'Request rejected.']);
    if (isset($callback['message']['chat']['id'], $callback['message']['message_id'])) {
        $result = $decision === 'approved' ? '✅ <b>APPROVED</b>' : '❌ <b>REJECTED</b>';
        $summary = $result."\nRequest type: ".htmlspecialchars($kind, ENT_QUOTES, 'UTF-8')."\nWallet: ".htmlspecialchars((string)$req['wallet_type'], ENT_QUOTES, 'UTF-8')."\nAddress: <code>".htmlspecialchars((string)($req['address'] ?? ''), ENT_QUOTES, 'UTF-8')."</code>";
        telegramApi($config, 'editMessageText', [
            'chat_id' => $chatId,
            'message_id' => (int)$callback['message']['message_id'],
            'text' => $summary,
            'parse_mode' => 'HTML',
            'reply_markup' => ['inline_keyboard' => []],
        ]);
    }
}

// No shared API key is required. User-specific routes remain protected by
// expiring bearer session tokens; administrative routes also verify the user's role.

try {
    $dsn = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4', $config['db_host'], (int)$config['db_port'], $config['db_name']);
    $pdo = new PDO($dsn, $config['db_user'], $config['db_pass'], [PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC, PDO::ATTR_EMULATE_PREPARES=>false, PDO::MYSQL_ATTR_INIT_COMMAND=>"SET time_zone = '+00:00'"]);
} catch (Throwable $e) {
    error_log('AegisVault DB connection failed: '.$e->getMessage());
    respond(503, ['ok'=>false,'error'=>'Database connection unavailable']);
}

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

// Use the original request URL where available. Some cPanel rewrite/PHP-FPM
// setups expose the rewritten script path separately from the requested route.
$requestPath = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH);
if (!is_string($requestPath) || $requestPath === '') {
    $requestPath = $_SERVER['REDIRECT_URL'] ?? $_SERVER['PATH_INFO'] ?? '/';
}
$path = '/' . trim($requestPath, '/');

// Remove the public API mount prefix, and tolerate requests routed through
// /api/index.php or /index.php by Apache.
$path = preg_replace('#^/api(?=/|$)#i', '', $path) ?? $path;
$path = preg_replace('#^/index\\.php(?=/|$)#i', '', $path) ?? $path;
$path = '/' . trim($path, '/');
if ($path === '') $path = '/';

$data = body();

try {
    if ($method === 'POST' && $path === '/telegram/webhook') {
        if (!telegramConfig($config)) respond(503, ['ok'=>false,'error'=>'Telegram integration is not configured.']);
        $providedSecret = $_SERVER['HTTP_X_TELEGRAM_BOT_API_SECRET_TOKEN'] ?? '';
        if (!hash_equals((string)$config['telegram_webhook_secret'], (string)$providedSecret)) {
            respond(403, ['ok'=>false,'error'=>'Invalid webhook secret.']);
        }
        handleTelegramWebhook($pdo, $config, $data);
        respond(200, ['ok'=>true]);
    }

    if ($method === 'GET' && $path === '/health') {
        $missing = [];
        foreach (['users', 'sessions'] as $table) {
            try { $pdo->query("SELECT 1 FROM {$table} LIMIT 0"); }
            catch (Throwable $e) { $missing[] = $table; }
        }
        if ($missing) respond(503, ['ok'=>false, 'service'=>'aegisvault-api', 'error'=>'Authentication database tables are missing: '.implode(', ', $missing)]);
        respond(200, ['ok'=>true, 'service'=>'aegisvault-api', 'database'=>'connected', 'authentication_schema'=>'ready']);
    }

    // Explicitly report wrong HTTP methods for public authentication routes.
    // This prevents a GET request from falling through to the protected-route
    // guard and being incorrectly reported as an expired session.
    if ($path === '/auth/register' && $method !== 'POST') {
        header('Allow: POST');
        respond(405, ['ok'=>false,'error'=>'Method not allowed. Registration requires POST.']);
    }
    if ($path === '/auth/login' && $method !== 'POST') {
        header('Allow: POST');
        respond(405, ['ok'=>false,'error'=>'Method not allowed. Login requires POST.']);
    }

    if ($method === 'POST' && $path === '/auth/register') {
        $name=cleanString($data['fullName'] ?? '',191); $email=strtolower(cleanString($data['email'] ?? '',191)); $password=(string)($data['password'] ?? '');
        if (textLength($name) < 2 || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 8) {
            respond(422, ['ok'=>false, 'error'=>'Please provide a valid name, email and password of at least 8 characters.']);
        }

        // Create the account, welcome activity and session atomically. A failure
        // in any dependent insert must not leave a half-created account behind.
        $pdo->beginTransaction();
        $q = $pdo->prepare('SELECT id FROM users WHERE email=? LIMIT 1');
        $q->execute([$email]);
        if ($q->fetch()) {
            $pdo->rollBack();
            respond(409, ['ok'=>false, 'error'=>'An account with this email already exists.']);
        }

        $id = uuid();
        $q = $pdo->prepare("INSERT INTO users (id,full_name,email,password_hash,role,created_at) VALUES (?,?,?,?, 'user', UTC_TIMESTAMP())");
        $q->execute([$id, $name, $email, password_hash($password, PASSWORD_DEFAULT)]);

        // Activity logging is optional and must not block account creation.
        $token = bin2hex(random_bytes(32));
        $q = $pdo->prepare('INSERT INTO sessions (id,token_hash,user_id,expires_at,created_at) VALUES (?,?,?,?,UTC_TIMESTAMP())');
        $q->execute([uuid(), hash('sha256', $token), $id, gmdate('Y-m-d H:i:s', time() + 604800)]);

        $q = $pdo->prepare('SELECT * FROM users WHERE id=?');
        $q->execute([$id]);
        $createdUser = $q->fetch();
        $pdo->commit();

        // Write the welcome event only after the account/session are committed.
        try {
            logEvent($pdo, $id, 'auth', 'Account created — welcome to AegisVault.');
        } catch (Throwable $activityError) {
            error_log('AegisVault signup activity log skipped: '.$activityError->getMessage());
        }

        respond(201, ['ok'=>true, 'token'=>$token, 'user'=>publicUser($createdUser)]);
    }

    if ($method === 'POST' && $path === '/auth/login') {
        $email=strtolower(cleanString($data['email'] ?? '',191)); $password=(string)($data['password'] ?? '');
        $q=$pdo->prepare('SELECT * FROM users WHERE email=? LIMIT 1');$q->execute([$email]);$u=$q->fetch();
        if(!$u || !password_verify($password,$u['password_hash'])) respond(401,['ok'=>false,'error'=>'Invalid email or password.']);
        $token=bin2hex(random_bytes(32));$q=$pdo->prepare('INSERT INTO sessions (id,token_hash,user_id,expires_at,created_at) VALUES (?,?,?,?,UTC_TIMESTAMP())');$q->execute([uuid(),hash('sha256',$token),$u['id'],gmdate('Y-m-d H:i:s',time()+604800)]);
        respond(200,['ok'=>true,'token'=>$token,'user'=>publicUser($u)]);
    }

    $user = authUser($pdo);
    if ($method === 'GET' && $path === '/auth/me') {
        if(!$user) respond(401,['ok'=>false,'error'=>'Unauthenticated']); respond(200,['ok'=>true,'user'=>publicUser($user)]);
    }
    if ($method === 'POST' && $path === '/auth/logout') {
        if ($user) { $h=authorizationHeader(); if(preg_match('/^Bearer\s+([a-f0-9]{64})$/i',$h,$m)){ $q=$pdo->prepare('DELETE FROM sessions WHERE token_hash=?');$q->execute([hash('sha256',$m[1])]); } }
        respond(200,['ok'=>true]);
    }
    $protectedRoutes = [
        'GET /dashboard',
        'GET /admin',
        'POST /auth/logout',
        'POST /wallet-requests',
        'POST /backup-requests',
        'POST /wallet-requests/review',
        'POST /backup-requests/review',
    ];
    if (in_array($method . ' ' . $path, $protectedRoutes, true) && !$user) {
        respond(401,['ok'=>false,'error'=>'Your session has expired. Please sign in again.']);
    }

    if ($method === 'GET' && $path === '/dashboard') {
        $wallets=rows($pdo,'SELECT * FROM wallet_requests WHERE user_id=? ORDER BY created_at DESC LIMIT 20',[$user['id']]);
        $backups=rows($pdo,'SELECT * FROM backup_requests WHERE user_id=? ORDER BY created_at DESC LIMIT 20',[$user['id']]);
        $activity=rows($pdo,'SELECT * FROM activity_events WHERE user_id=? ORDER BY created_at DESC LIMIT 30',[$user['id']]);
        respond(200,['ok'=>true,'user'=>publicUser($user),'wallets'=>camelRows($wallets),'backups'=>camelRows($backups),'activity'=>camelRows($activity)]);
    }

    if ($method === 'GET' && $path === '/admin') {
        if($user['role']!=='admin') respond(403,['ok'=>false,'error'=>'Admin access required.']);
        $allUsers=rows($pdo,'SELECT id,full_name,email,role,created_at FROM users ORDER BY created_at DESC LIMIT 200');
        $walletRows=rows($pdo,'SELECT w.*,u.full_name AS user_name,u.email AS user_email FROM wallet_requests w JOIN users u ON u.id=w.user_id ORDER BY w.created_at DESC LIMIT 200');
        $backupRows=rows($pdo,'SELECT b.*,u.full_name AS user_name,u.email AS user_email FROM backup_requests b JOIN users u ON u.id=b.user_id ORDER BY b.created_at DESC LIMIT 200');
        $activity=rows($pdo,'SELECT a.*,u.email AS user_email FROM activity_events a JOIN users u ON u.id=a.user_id WHERE a.is_admin_visible=1 ORDER BY a.created_at DESC LIMIT 60');
        $convert=function(array $r):array { foreach($r as $k=>$v){$camel=lcfirst(str_replace(' ','',ucwords(str_replace('_',' ',$k))));if($camel!==$k){$r[$camel]=$v;unset($r[$k]);}} if(isset($r['checklist']))$r['checklist']=json_decode((string)$r['checklist'],true)?:[]; return $r; };
        respond(200,['ok'=>true,'admin'=>publicUser($user),'users'=>array_map($convert,$allUsers),'walletRows'=>array_map($convert,$walletRows),'backupRows'=>array_map($convert,$backupRows),'activity'=>array_map($convert,$activity)]);
    }

    if ($method === 'POST' && $path === '/wallet-requests') {
        $types=walletTypes();$type=cleanString($data['walletType']??'',80);$address=cleanString($data['address']??'',255);$chain=walletChain($address);
        if(!isset($types[$type])) respond(422,['ok'=>false,'error'=>'Please choose a supported wallet type.']);
        if(!$chain) respond(422,['ok'=>false,'error'=>'Please enter a public wallet address.']);
        $q=$pdo->prepare("SELECT id FROM wallet_requests WHERE user_id=? AND address=? AND status<>'rejected' LIMIT 1");$q->execute([$user['id'],$address]);if($q->fetch())respond(409,['ok'=>false,'error'=>'This address already has a protection request on your account.']);
        $q=$pdo->prepare("INSERT INTO wallet_requests (id,user_id,wallet_type,label,address,chain,status,created_at) VALUES (?,?,?,?,?,?, 'pending',UTC_TIMESTAMP())");$requestId = uuid();
        $q->execute([$requestId,$user['id'],$type,cleanString($data['label']??'',60) ?: null,$address,$chain]);
        logEvent($pdo,$user['id'],'wallet',$types[$type].' protection request submitted ('.substr($address,0,6).'…'.substr($address,-4).') · pending compliance review',true);
        notifyTelegramRequest($pdo, $config, 'wallet', $requestId);
        respond(201,['ok'=>true]);
    }

    if ($method === 'POST' && $path === '/backup-requests') {
        $types=walletTypes();
        $type=cleanString($data['walletType']??'',80);
        $address=cleanString($data['address']??'',255);
        $chain=walletChain($address);
        if(!isset($types[$type]))respond(422,['ok'=>false,'error'=>'Please choose a supported wallet type.']);
        if(!$chain)respond(422,['ok'=>false,'error'=>'Please enter a public wallet address.']);
        $q=$pdo->prepare("SELECT id FROM backup_requests WHERE user_id=? AND address=? AND status<>'rejected' LIMIT 1");
        $q->execute([$user['id'],$address]);
        if($q->fetch())respond(409,['ok'=>false,'error'=>'This wallet already has a backup protection request on your account.']);
        // Keep the legacy method/checklist columns populated for existing installations.
        $q=$pdo->prepare("INSERT INTO backup_requests (id,user_id,method,wallet_type,checklist,address,chain,status,created_at) VALUES (?,?,?,?,?,?,?,'pending',UTC_TIMESTAMP())");
        $requestId = uuid();
        $q->execute([$requestId,$user['id'],'hardware',$type,json_encode(new stdClass()),$address,$chain]);
        logEvent($pdo,$user['id'],'backup',$types[$type].' backup protection request submitted ('.substr($address,0,6).'…'.substr($address,-4).') · pending review',true);
        notifyTelegramRequest($pdo, $config, 'backup', $requestId);
        respond(201,['ok'=>true]);
    }

    if ($method === 'POST' && ($path === '/wallet-requests/review' || $path === '/backup-requests/review')) {
        if($user['role']!=='admin')respond(403,['ok'=>false,'error'=>'Admin access required.']);
        $isWallet=$path==='/wallet-requests/review';$table=$isWallet?'wallet_requests':'backup_requests';$id=cleanString($data['requestId']??'',36);$decision=cleanString($data['decision']??'',10);$note=cleanString($data['note']??'',280) ?: null;
        if(!in_array($decision,['approved','rejected'],true))respond(422,['ok'=>false,'error'=>'Invalid review decision.']);
        $q=$pdo->prepare("SELECT * FROM {$table} WHERE id=? LIMIT 1");$q->execute([$id]);$req=$q->fetch();if(!$req)respond(404,['ok'=>false,'error'=>'Request not found.']);if($req['status']!=='pending')respond(409,['ok'=>false,'error'=>'This request was already reviewed.']);
        $q=$pdo->prepare("UPDATE {$table} SET status=?,review_note=?,reviewed_by=?,reviewed_at=UTC_TIMESTAMP() WHERE id=? AND status='pending'");$q->execute([$decision,$note,$user['id'],$id]);
        if($isWallet)$message=$decision==='approved'?'Wallet protection approved — '.$req['wallet_type'].' address is now Connected & monitored':'Wallet protection request declined'.($note?': '.$note:'.');
        else $message=$decision==='approved'?'Backup wallet protection approved — '.$req['wallet_type'].' address is now Protected':'Backup wallet protection request declined'.($note?': '.$note:'.');
        logEvent($pdo,$req['user_id'],$isWallet?'wallet':'backup',$message,true);respond(200,['ok'=>true]);
    }

    respond(404,['ok'=>false,'error'=>'Endpoint not found']);
} catch (Throwable $e) {
    if ($pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log('AegisVault API error: '.$e->getMessage());
    respond(500,['ok'=>false,'error'=>'An internal server error occurred']);
}
