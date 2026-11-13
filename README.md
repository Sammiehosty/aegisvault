# AegisVault

AegisVault is a Next.js security dashboard backed by a PHP 8.2+ API and MySQL.

## Architecture

- Frontend: Next.js 16 hosted on Vercel.
- Backend: PHP 8.2+ REST API hosted on your PHP hosting account.
- Database: MySQL 8.0+ hosted alongside the PHP API.
- API base URL is embedded in the server-side website client as `http://pinetnow.com/api`.

## Deployment

1. Import `database/schema.mysql.sql` into an empty MySQL database.
2. Upload the contents of `php-api/` to the matching API folder on your PHP host.
3. Copy `php-api/config.example.php` to `config.php` on the server and enter your MySQL details.
4. Enable PHP 8.2+, PDO MySQL and mbstring.
5. Deploy this repository to Vercel. No AEGIS_API_URL, AEGIS_API_SECRET or DATABASE_URL environment variables are required.

See `php-api/README.md` for setup details.

## Security

The PHP API uses expiring bearer session tokens for authenticated user operations and checks the user's role for administrative operations. Keep `config.php` private and never commit database credentials. Use HTTPS for the API before handling real accounts. AegisVault must never ask users for wallet seed phrases, private keys or signing secrets.
