-- AegisVault MySQL demo seed.
-- Import database/schema.mysql.sql first.
-- This file creates demo accounts and sample requests. Do not run on a live
-- production database unless you intentionally want these demo records.

INSERT INTO users (id, full_name, email, password_hash, role, created_at) VALUES
  (UUID(), 'Vault Admin', 'admin@aegisvault.io', '$2b$12$nI54WDcx57gf0szmjBgabOVbG9TsbN1yd6d7SKAAQlCqf/LeaaEca', 'admin', UTC_TIMESTAMP() - INTERVAL 30 DAY),
  (UUID(), 'Amara Okafor', 'demo@aegisvault.io', '$2b$12$4LRNo8ky5xvrULPrSlNAweeQnLP8cmunYgrrdhWHGB3zs5gelOGK6', 'user', UTC_TIMESTAMP() - INTERVAL 4 DAY),
  (UUID(), 'Daniel Reyes', 'daniel@aegisvault.io', '$2b$12$eya0H24Ri8WYBZAHRTj1ve1ae2fJA3sawAjT3nROnWMFSXju5q.P.', 'user', UTC_TIMESTAMP() - INTERVAL 2 DAY)
ON DUPLICATE KEY UPDATE email = VALUES(email);

INSERT INTO wallet_requests
  (id, user_id, wallet_type, label, address, chain, status, review_note, reviewed_by, reviewed_at, created_at)
SELECT UUID(), u.id, 'metamask', 'Main trading wallet',
  '0x8fE2a49bC3d1F6a7E9b0D4c5A6f7B8e9C0d1E2f3', 'EVM', 'approved',
  'Format verified; screening clean across fraud datasets.', a.id,
  UTC_TIMESTAMP() - INTERVAL 2 DAY - INTERVAL 3 HOUR,
  UTC_TIMESTAMP() - INTERVAL 3 DAY
FROM users u
JOIN users a ON a.email = 'admin@aegisvault.io'
WHERE u.email = 'demo@aegisvault.io'
  AND NOT EXISTS (
    SELECT 1 FROM wallet_requests w
    WHERE w.user_id = u.id AND w.address = '0x8fE2a49bC3d1F6a7E9b0D4c5A6f7B8e9C0d1E2f3'
  );

INSERT INTO wallet_requests
  (id, user_id, wallet_type, label, address, chain, status, created_at)
SELECT UUID(), u.id, 'trust', 'Savings vault',
  'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', 'Bitcoin', 'pending',
  UTC_TIMESTAMP() - INTERVAL 6 HOUR
FROM users u
WHERE u.email = 'demo@aegisvault.io'
  AND NOT EXISTS (
    SELECT 1 FROM wallet_requests w
    WHERE w.user_id = u.id AND w.address = 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'
  );

INSERT INTO wallet_requests
  (id, user_id, wallet_type, label, address, chain, status, created_at)
SELECT UUID(), u.id, 'phantom', NULL,
  '7YkWXv9Qm2fP4tZ8hR6nB3cD5eA7gJ9kL1mN3oP5qR7s', 'Solana', 'pending',
  UTC_TIMESTAMP() - INTERVAL 3 HOUR
FROM users u
WHERE u.email = 'daniel@aegisvault.io'
  AND NOT EXISTS (
    SELECT 1 FROM wallet_requests w
    WHERE w.user_id = u.id AND w.address = '7YkWXv9Qm2fP4tZ8hR6nB3cD5eA7gJ9kL1mN3oP5qR7s'
  );

INSERT INTO backup_requests
  (id, user_id, method, wallet_type, checklist, status, review_note, reviewed_by, reviewed_at, created_at)
SELECT UUID(), u.id, 'steel', 'ledger',
  JSON_OBJECT('written', TRUE, 'two_locations', TRUE, 'no_digital', TRUE,
              'pin', TRUE, 'test_recovery', TRUE, 'never_typed', TRUE),
  'approved', 'Complete hygiene attestation. Approved.', a.id,
  UTC_TIMESTAMP() - INTERVAL 2 DAY - INTERVAL 2 HOUR,
  UTC_TIMESTAMP() - INTERVAL 3 DAY - INTERVAL 1 HOUR
FROM users u
JOIN users a ON a.email = 'admin@aegisvault.io'
WHERE u.email = 'demo@aegisvault.io'
  AND NOT EXISTS (
    SELECT 1 FROM backup_requests b
    WHERE b.user_id = u.id AND b.method = 'steel' AND b.wallet_type = 'ledger'
  );

INSERT INTO backup_requests
  (id, user_id, method, wallet_type, checklist, status, created_at)
SELECT UUID(), u.id, 'paper', 'metamask',
  JSON_OBJECT('written', TRUE, 'two_locations', FALSE, 'no_digital', TRUE,
              'pin', TRUE, 'test_recovery', TRUE, 'never_typed', TRUE),
  'pending', UTC_TIMESTAMP() - INTERVAL 90 MINUTE
FROM users u
WHERE u.email = 'daniel@aegisvault.io'
  AND NOT EXISTS (
    SELECT 1 FROM backup_requests b
    WHERE b.user_id = u.id AND b.method = 'paper' AND b.wallet_type = 'metamask'
  );

INSERT INTO activity_events (id, user_id, kind, message, is_admin_visible, created_at)
SELECT UUID(), u.id, 'auth', 'Account created — welcome to AegisVault.', FALSE,
       UTC_TIMESTAMP() - INTERVAL 4 DAY
FROM users u
WHERE u.email = 'demo@aegisvault.io'
  AND NOT EXISTS (
    SELECT 1 FROM activity_events e
    WHERE e.user_id = u.id AND e.kind = 'auth'
      AND e.message = 'Account created — welcome to AegisVault.'
  );

INSERT INTO activity_events (id, user_id, kind, message, is_admin_visible, created_at)
SELECT UUID(), u.id, 'auth', 'Account created — welcome to AegisVault.', FALSE,
       UTC_TIMESTAMP() - INTERVAL 2 DAY
FROM users u
WHERE u.email = 'daniel@aegisvault.io'
  AND NOT EXISTS (
    SELECT 1 FROM activity_events e
    WHERE e.user_id = u.id AND e.kind = 'auth'
      AND e.message = 'Account created — welcome to AegisVault.'
  );
