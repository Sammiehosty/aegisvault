# AegisVault PHP API (PHP 8.2+)

The Next.js/Vercel application now uses this API for all database-backed operations. MySQL credentials stay on the PHP host; Vercel never connects to MySQL directly.

## 1. Upload the API

1. Create a folder on your PHP hosting account, for example `public_html/aegis-api/`.
2. Upload the contents of this `php-api` folder into it (`index.php`, `.htaccess`, `config.example.php`).
3. Copy `config.example.php` to `config.php` using your hosting File Manager.
4. Edit `config.php` with the MySQL host, database name, database username and password.
5. Set `server_secret` to a long random string (at least 32 characters). Use the exact same string for `AEGIS_API_SECRET` in Vercel.
6. Ensure PHP 8.2+, PDO MySQL (`pdo_mysql`) and mbstring are enabled. Enable HTTPS for the API domain.

The API folder must be reachable at an HTTPS URL such as `https://api.example.com/aegis-api` or `https://example.com/aegis-api`.

## 2. Prepare MySQL

Create an empty MySQL database and import the existing project file `database/schema.mysql.sql`. This creates `users`, `sessions`, `wallet_requests`, `backup_requests`, and `activity_events`.

## 3. Configure Vercel

In Vercel → Project → Settings → Environment Variables, add:

- `AEGIS_API_URL` = the API base URL, with no trailing slash, e.g. `https://api.example.com/aegis-api`
- `AEGIS_API_SECRET` = the same long random value configured as `server_secret` in PHP `config.php`

Apply to Production and Preview as needed, save, then redeploy. Do not set `DATABASE_URL` in Vercel; the frontend no longer uses a direct database connection.

## 4. Test the API

The health endpoint is protected by the server key. Test it from a trusted terminal (not a browser):

```bash
curl -H 'X-Aegis-Server-Key: YOUR_LONG_SECRET' https://api.example.com/aegis-api/health
```

Expected response:

```json
{"ok":true,"service":"aegisvault-api"}
```

## Security notes

- The PHP API requires the shared server secret on every request. Keep it private and never prefix it with `NEXT_PUBLIC_`.
- Browser CORS is intentionally not enabled; only the Next.js server should call this API.
- User sessions are random 256-bit tokens; only SHA-256 token hashes are stored in MySQL. The browser receives the token only in a Secure, HttpOnly, SameSite=Lax cookie set by Next.js.
- Passwords are hashed with PHP `password_hash()` and verified using `password_verify()`.
- API errors do not expose SQL errors or stack traces; details are written to the PHP error log.
- AegisVault must never collect wallet seed phrases, private keys or signing secrets. Only public addresses and backup-practice attestations are accepted.

## Existing database compatibility

No new application tables are required. The API uses the five tables already defined in `database/schema.mysql.sql`.
