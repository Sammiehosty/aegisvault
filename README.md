# AegisVault

AegisVault is a Next.js security dashboard backed by a separate PHP 8.2+ API and MySQL database.

## Architecture

- Frontend: Next.js 16 hosted on Vercel.
- Backend: PHP 8.2+ REST API hosted on your PHP web hosting account.
- Database: MySQL 8.0+ hosted alongside the PHP API.
- Vercel never connects directly to MySQL. All database operations go through the PHP API over HTTPS.

## Deployment

1. Import `database/schema.mysql.sql` into an empty MySQL database on your PHP hosting account.
2. Upload the contents of `php-api/` to a folder such as `public_html/aegis-api/`.
3. Copy `php-api/config.example.php` to `php-api/config.php` and fill in the database details plus a long random `server_secret` (at least 32 characters).
4. Make sure HTTPS, PHP 8.2+, PDO MySQL and mbstring are enabled.
5. In Vercel → Project → Settings → Environment Variables, set `AEGIS_API_URL` to the API base URL (without trailing slash) and `AEGIS_API_SECRET` to the exact same secret as PHP `server_secret`.
6. Redeploy the Vercel project.

See `php-api/README.md` for detailed instructions and the API health test. Do not set `DATABASE_URL` on Vercel; it is no longer used by the website.

## Local frontend development

Copy `.env.example` to `.env.local`, set the API URL and secret, then run:

```bash
npm install
npm run dev
```

## Security

The PHP API requires a private server-to-server key and a bearer session token. The Next.js server stores the session token in a Secure, HttpOnly cookie. MySQL credentials and the API shared secret must never be exposed to browser code or committed to GitHub. AegisVault must never ask users for wallet seed phrases, private keys or signing secrets.
