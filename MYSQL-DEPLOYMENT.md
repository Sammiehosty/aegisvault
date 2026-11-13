# AegisVault MySQL setup

1. Create an empty MySQL database and a dedicated database user in cPanel.
2. Import `database/schema.mysql.sql` into that database using phpMyAdmin.
3. Upload the contents of `php-api/` to the API directory on your PHP hosting.
4. Copy `config.example.php` to `config.php` and enter the database host, database name, username and password.
5. Ensure PHP 8.2+, PDO MySQL and mbstring are enabled.
6. Deploy the website to Vercel.

The website uses the API URL embedded in `src/lib/api.ts`. No `AEGIS_API_URL`, `AEGIS_API_SECRET` or `DATABASE_URL` environment variables are required. Never upload `config.php` to GitHub.

Use HTTPS for the API before handling real accounts.
