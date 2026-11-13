# AegisVault PHP API (PHP 8.2+)

This API connects the Next.js website to the MySQL database. Database credentials remain on the PHP host.

## 1. Upload and configure

1. Upload the contents of this folder to the API directory configured for your domain.
2. Copy `config.example.php` to `config.php`.
3. Edit `config.php` with your cPanel MySQL host, database name, username and password.
4. Enable PHP 8.2+ and PDO MySQL (`pdo_mysql`). The API supports hosts without `mbstring`, although enabling it is recommended for full UTF-8 string handling.
5. Enable HTTPS on the API domain before using real accounts.

## 2. Prepare MySQL

Import `database/schema.mysql.sql` from the repository into an empty database. It creates the users, sessions, wallet requests, backup requests and activity events tables.

## 3. API address

The website currently uses the API address embedded in `src/lib/api.ts`: `http://pinetnow.com/api`. No API URL or shared API secret environment variables are required in Vercel.

## 4. Authentication and security

- Registration and login create expiring bearer session tokens. Only SHA-256 token hashes are stored in MySQL.
- Authenticated user routes require a valid session token; administrative routes also check the user's admin role.
- Keep `config.php` private and never commit database credentials.
- Use HTTPS. The currently configured HTTP URL does not encrypt traffic and should be changed to HTTPS as soon as SSL is enabled.
- Passwords are hashed with PHP `password_hash()` and verified using `password_verify()`.
- Never collect wallet seed phrases, private keys or signing secrets. Only public wallet addresses and backup-practice attestations are accepted.
