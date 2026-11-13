# AegisVault MySQL setup

The website no longer connects directly to MySQL. MySQL is accessed only by the PHP API hosted on your PHP hosting account.

1. Create an empty MySQL database and dedicated database user.
2. Import `database/schema.mysql.sql` into that database.
3. Deploy the PHP backend in `php-api/`; follow `php-api/README.md`.
4. Configure `AEGIS_API_URL` and `AEGIS_API_SECRET` in Vercel.

Do not set `DATABASE_URL` in Vercel. Do not upload `php-api/config.php` to GitHub.
