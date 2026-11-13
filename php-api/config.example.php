<?php
// Copy to config.php and fill in real database values. Keep config.php private.
return [
    'db_host' => 'localhost',
    'db_port' => 3306,
    'db_name' => 'YOUR_DATABASE_NAME',
    'db_user' => 'YOUR_DATABASE_USER',
    'db_pass' => 'CHANGE_TO_A_STRONG_DATABASE_PASSWORD',

    // Telegram admin notifications. Replace every YOUR_* value in config.php.
    'telegram_bot_token' => 'YOUR_TELEGRAM_BOT_TOKEN',
    'telegram_admin_chat_id' => 'YOUR_TELEGRAM_ADMIN_CHAT_ID',
    'telegram_admin_telegram_user_id' => 'YOUR_TELEGRAM_USER_ID',
    // Must be the UUID of an existing AegisVault user whose role is admin.
    'telegram_admin_user_id' => 'YOUR_AEGISVAULT_ADMIN_USER_UUID',
    // 1-256 characters; use letters, numbers, underscores or hyphens.
    'telegram_webhook_secret' => 'YOUR_RANDOM_WEBHOOK_SECRET',
];
