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


## 6. Telegram admin notifications and review buttons

The API can send a Telegram message to the configured admin chat whenever a user submits a wallet protection or backup review request. Each message includes the user's name and email, wallet type, network and submitted public address, with **Approve** and **Reject** buttons. Only the configured Telegram user in the configured chat can use those buttons. The decision is saved to MySQL and appears in the AegisVault admin dashboard and user activity history.

### Configure the bot

1. Create a Telegram bot with **@BotFather** and copy its bot token.
2. Open a private chat with your new bot and send `/start`.
3. Obtain your Telegram numeric user ID and chat ID. For a private admin chat these are normally the same number. For a group, use the group's chat ID and your own numeric user ID separately.
4. In the cPanel API directory, copy `config.example.php` to `config.php` if you have not already done so. Add these five settings to your existing `config.php` while preserving all database settings:
   - `telegram_bot_token`: token from BotFather.
   - `telegram_admin_chat_id`: private chat ID or admin group's chat ID.
   - `telegram_admin_telegram_user_id`: the Telegram numeric ID of the person allowed to approve/reject.
   - `telegram_admin_user_id`: the UUID of that same person's AegisVault account, which must have `role='admin'` in the users table.
   - `telegram_webhook_secret`: a long random value containing only letters, numbers, underscores or hyphens.
5. Ensure PHP cURL is enabled on the hosting account.
6. Register the Telegram webhook once, replacing the placeholders with the values from your private config. Run this from a terminal:
   ```bash
   curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -d "url=https://pinetnow.com/api/telegram/webhook" \
     -d "secret_token=<YOUR_WEBHOOK_SECRET>"
   ```
7. Telegram should return `"ok":true`. Submit a test wallet or backup request from a normal user account. The admin chat should receive a message with Approve and Reject buttons.

**Security notes:** Keep `config.php` out of GitHub and never share the bot token publicly. Approval buttons are restricted to the configured Telegram user and chat. Telegram approval uses the configured AegisVault admin account for the audit record. Notifications are best-effort: a Telegram outage will not prevent the user's request from being saved in AegisVault. Only public wallet addresses are included; never request or send seed phrases, private keys or wallet passwords.


## Admin management features

Run `database/migrations/2026_11_13_admin_management.sql` once in phpMyAdmin before using the updated admin console. It creates the `app_settings` table used to store the application name.

The admin console now supports deleting regular user accounts (their wallet requests, backup requests, sessions and activity are removed through the database foreign-key cascades), deleting wallet/backup requests in any status, changing the displayed application name, and changing the admin password. Password changes require the current password and revoke all active sessions, so sign in again afterward.

Telegram request notifications include a **Delete request** button. It deletes the matching wallet or backup request even if it has already been approved or rejected. The Telegram callback remains restricted to the configured Telegram account and configured AegisVault administrator.
