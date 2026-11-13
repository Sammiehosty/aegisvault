<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

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
function cleanString(mixed $value, int $max = 255): string {
    return mb_substr(trim((string)($value ?? '')), 0, $max);
}
function publicUser(array $u): array {
    return ['id'=>$u['id'], 'fullName'=>$u['full_name'], 'email'=>$u['email'], 'role'=>$u['role'], 'createdAt'=>$u['created_at']];
}
function authUser(PDO $pdo): ?array {
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
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
    if (preg_match('/^0x[a-fA-F0-9]{40}$/', $address)) return 'EVM';
    if (preg_match('/^(1[a-km-zA-HJ-NP-Z1-9]{25,34}|3[a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{11,71})$/', $address)) return 'Bitcoin';
    if (preg_match('/^[1-9A-HJ-NP-Za-km-z]{32,44}$/', $address)) return 'Solana';
    return null;
}
function walletTypes(): array {
    return ['metamask'=>'MetaMask','coinbase'=>'Coinbase Wallet','trust'=>'Trust Wallet','ledger'=>'Ledger','trezor'=>'Trezor','phantom'=>'Phantom','exodus'=>'Exodus','rainbow'=>'Rainbow'];
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

// No shared API key is required. User-specific routes remain protected by
// expiring bearer session tokens; administrative routes also verify the user's role.

try {
    $dsn = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4', $config['db_host'], (int)$config['db_port'], $config['db_name']);
    $pdo = new PDO($dsn, $config['db_user'], $config['db_pass'], [PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC, PDO::ATTR_EMULATE_PREPARES=>false, PDO::MYSQL_ATTR_INIT_COMMAND=>"SET time_zone = '+00:00'"]);
} catch (Throwable $e) {
    error_log('AegisVault DB connection failed: '.$e->getMessage());
    respond(503, ['ok'=>false,'error'=>'Database connection unavailable']);
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$base = rtrim(dirname($_SERVER['SCRIPT_NAME'] ?? ''), '/');
if ($base && str_starts_with($path, $base)) $path = substr($path, strlen($base));
$path = '/' . trim($path, '/');
$data = body();

try {
    if ($method === 'GET' && $path === '/health') {
        $pdo->query('SELECT 1'); respond(200, ['ok'=>true,'service'=>'aegisvault-api']);
    }

    if ($method === 'POST' && $path === '/auth/register') {
        $name=cleanString($data['fullName'] ?? '',191); $email=strtolower(cleanString($data['email'] ?? '',191)); $password=(string)($data['password'] ?? '');
        if (mb_strlen($name)<2 || !filter_var($email,FILTER_VALIDATE_EMAIL) || strlen($password)<8) respond(422,['ok'=>false,'error'=>'Please provide a valid name, email and password of at least 8 characters.']);
        $q=$pdo->prepare('SELECT id FROM users WHERE email=? LIMIT 1'); $q->execute([$email]); if($q->fetch()) respond(409,['ok'=>false,'error'=>'An account with this email already exists.']);
        $id=uuid(); $q=$pdo->prepare("INSERT INTO users (id,full_name,email,password_hash,role,created_at) VALUES (?,?,?,?, 'user', UTC_TIMESTAMP())"); $q->execute([$id,$name,$email,password_hash($password,PASSWORD_DEFAULT)]);
        logEvent($pdo,$id,'auth','Account created — welcome to AegisVault.');
        $token=bin2hex(random_bytes(32)); $q=$pdo->prepare('INSERT INTO sessions (id,token_hash,user_id,expires_at,created_at) VALUES (?,?,?,?,UTC_TIMESTAMP())'); $q->execute([uuid(),hash('sha256',$token),$id,gmdate('Y-m-d H:i:s',time()+604800)]);
        $q=$pdo->prepare('SELECT * FROM users WHERE id=?');$q->execute([$id]); respond(201,['ok'=>true,'token'=>$token,'user'=>publicUser($q->fetch())]);
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
        if ($user) { $h=$_SERVER['HTTP_AUTHORIZATION'] ?? ''; if(preg_match('/^Bearer\s+([a-f0-9]{64})$/i',$h,$m)){ $q=$pdo->prepare('DELETE FROM sessions WHERE token_hash=?');$q->execute([hash('sha256',$m[1])]); } }
        respond(200,['ok'=>true]);
    }
    if (!$user) respond(401,['ok'=>false,'error'=>'Your session has expired. Please sign in again.']);

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
        if(!$chain) respond(422,['ok'=>false,'error'=>"That doesn't look like a valid public wallet address (EVM 0x…, Bitcoin, or Solana base58)."]);
        $q=$pdo->prepare("SELECT id FROM wallet_requests WHERE user_id=? AND address=? AND status<>'rejected' LIMIT 1");$q->execute([$user['id'],$address]);if($q->fetch())respond(409,['ok'=>false,'error'=>'This address already has a protection request on your account.']);
        $q=$pdo->prepare("INSERT INTO wallet_requests (id,user_id,wallet_type,label,address,chain,status,created_at) VALUES (?,?,?,?,?,?, 'pending',UTC_TIMESTAMP())");$q->execute([uuid(),$user['id'],$type,cleanString($data['label']??'',60) ?: null,$address,$chain]);
        logEvent($pdo,$user['id'],'wallet',$types[$type].' protection request submitted ('.substr($address,0,6).'…'.substr($address,-4).') · pending compliance review',true);respond(201,['ok'=>true]);
    }

    if ($method === 'POST' && $path === '/backup-requests') {
        $types=walletTypes();$type=cleanString($data['walletType']??'',80);$methodName=cleanString($data['method']??'',20);$check=$data['checklist']??[];
        if(!isset($types[$type]))respond(422,['ok'=>false,'error'=>'Please choose the wallet this backup protects.']);
        if(!in_array($methodName,['paper','steel','hardware','shamir'],true))respond(422,['ok'=>false,'error'=>'Please choose a backup method.']);
        if(!is_array($check) || count($check)<6 || count(array_filter($check,fn($v)=>$v===true))<5)respond(422,['ok'=>false,'error'=>'Please confirm at least 5 of the 6 security practices before requesting verification.']);
        $q=$pdo->prepare("SELECT id FROM backup_requests WHERE user_id=? AND status='pending' LIMIT 1");$q->execute([$user['id']]);if($q->fetch())respond(409,['ok'=>false,'error'=>'You already have a backup verification under review.']);
        $q=$pdo->prepare("INSERT INTO backup_requests (id,user_id,method,wallet_type,checklist,status,created_at) VALUES (?,?,?,?,?,'pending',UTC_TIMESTAMP())");$q->execute([uuid(),$user['id'],$methodName,$type,json_encode($check)]);
        logEvent($pdo,$user['id'],'backup','Backup health verification submitted ('.count(array_filter($check,fn($v)=>$v===true)).'/6 practices confirmed) · pending review',true);respond(201,['ok'=>true]);
    }

    if ($method === 'POST' && ($path === '/wallet-requests/review' || $path === '/backup-requests/review')) {
        if($user['role']!=='admin')respond(403,['ok'=>false,'error'=>'Admin access required.']);
        $isWallet=$path==='/wallet-requests/review';$table=$isWallet?'wallet_requests':'backup_requests';$id=cleanString($data['requestId']??'',36);$decision=cleanString($data['decision']??'',10);$note=cleanString($data['note']??'',280) ?: null;
        if(!in_array($decision,['approved','rejected'],true))respond(422,['ok'=>false,'error'=>'Invalid review decision.']);
        $q=$pdo->prepare("SELECT * FROM {$table} WHERE id=? LIMIT 1");$q->execute([$id]);$req=$q->fetch();if(!$req)respond(404,['ok'=>false,'error'=>'Request not found.']);if($req['status']!=='pending')respond(409,['ok'=>false,'error'=>'This request was already reviewed.']);
        $q=$pdo->prepare("UPDATE {$table} SET status=?,review_note=?,reviewed_by=?,reviewed_at=UTC_TIMESTAMP() WHERE id=? AND status='pending'");$q->execute([$decision,$note,$user['id'],$id]);
        if($isWallet)$message=$decision==='approved'?'Wallet protection approved — '.$req['wallet_type'].' address is now Connected & monitored':'Wallet protection request declined'.($note?': '.$note:'.');
        else $message=$decision==='approved'?'Backup health verified — recovery plan marked as Protected':'Backup verification declined'.($note?': '.$note:'.');
        logEvent($pdo,$req['user_id'],$isWallet?'wallet':'backup',$message,true);respond(200,['ok'=>true]);
    }

    respond(404,['ok'=>false,'error'=>'Endpoint not found']);
} catch (Throwable $e) {
    error_log('AegisVault API error: '.$e->getMessage());
    respond(500,['ok'=>false,'error'=>'An internal server error occurred']);
}
