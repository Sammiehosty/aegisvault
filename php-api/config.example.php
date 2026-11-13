<?php
// Copy to config.php and fill in real values. Keep this file private.
return [
    'db_host' => 'localhost',
    'db_port' => 3306,
    'db_name' => 'YOUR_DATABASE_NAME',
    'db_user' => 'YOUR_DATABASE_USER',
    'db_pass' => 'CHANGE_TO_A_STRONG_DATABASE_PASSWORD',
    // Generate a long random secret (at least 32 characters) and also set the
    // same value as AEGIS_API_SECRET in Vercel. Never expose it in frontend JS.
    'server_secret' => 'CHANGE_TO_A_LONG_RANDOM_SECRET',
    'allowed_origin' => 'https://YOUR-VERCEL-DOMAIN.vercel.app',
];
