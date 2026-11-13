-- AegisVault demo seed
-- Admin:    admin@aegisvault.io   / Admin@2026!
-- Demo:     demo@aegisvault.io    / Demo@2026!   (wallet Connected + backup pending)
-- Demo 2:   daniel@aegisvault.io  / Demo@2026!   (pending wallet + pending backup)

INSERT INTO users (full_name, email, password_hash, role, created_at) VALUES
  ('Vault Admin', 'admin@aegisvault.io', '$2b$12$nI54WDcx57gf0szmjBgabOVbG9TsbN1yd6d7SKAAQlCqf/LeaaEca', 'admin', now() - interval '30 days'),
  ('Amara Okafor', 'demo@aegisvault.io', '$2b$12$4LRNo8ky5xvrULPrSlNAweeQnLP8cmunYgrrdhWHGB3zs5gelOGK6', 'user', now() - interval '4 days'),
  ('Daniel Reyes', 'daniel@aegisvault.io', '$2b$12$eya0H24Ri8WYBZAHRTj1ve1ae2fJA3sawAjT3nROnWMFSXju5q.P.', 'user', now() - interval '2 days')
ON CONFLICT (email) DO NOTHING;

-- Wallet connection requests
INSERT INTO wallet_requests (user_id, wallet_type, label, address, chain, status, review_note, reviewed_by, reviewed_at, created_at)
SELECT u.id, 'metamask', 'Main trading wallet', '0x8fE2a49bC3d1F6a7E9b0D4c5A6f7B8e9C0d1E2f3', 'EVM', 'approved',
  'Format verified; screening clean across fraud datasets.', a.id, now() - interval '2 days 3 hours', now() - interval '3 days'
FROM users u, users a
WHERE u.email = 'demo@aegisvault.io' AND a.email = 'admin@aegisvault.io'
ON CONFLICT DO NOTHING;

INSERT INTO wallet_requests (user_id, wallet_type, label, address, chain, status, created_at)
SELECT u.id, 'trust', 'Savings vault', 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', 'Bitcoin', 'pending', now() - interval '6 hours'
FROM users u WHERE u.email = 'demo@aegisvault.io'
ON CONFLICT DO NOTHING;

INSERT INTO wallet_requests (user_id, wallet_type, label, address, chain, status, created_at)
SELECT u.id, 'phantom', NULL, '7YkWXv9Qm2fP4tZ8hR6nB3cD5eA7gJ9kL1mN3oP5qR7s', 'Solana', 'pending', now() - interval '3 hours'
FROM users u WHERE u.email = 'daniel@aegisvault.io'
ON CONFLICT DO NOTHING;

-- Backup verification requests
INSERT INTO backup_requests (user_id, method, wallet_type, status, checklist, review_note, reviewed_by, reviewed_at, created_at)
SELECT u.id, 'steel', 'ledger', 'approved',
  '{"written":true,"two_locations":true,"no_digital":true,"pin":true,"test_recovery":true,"never_typed":true}'::jsonb,
  'Complete hygiene attestation. Approved.', a.id, now() - interval '2 days 2 hours', now() - interval '3 days 1 hour'
FROM users u, users a
WHERE u.email = 'demo@aegisvault.io' AND a.email = 'admin@aegisvault.io'
ON CONFLICT DO NOTHING;

INSERT INTO backup_requests (user_id, method, wallet_type, status, checklist, created_at)
SELECT u.id, 'paper', 'metamask', 'pending',
  '{"written":true,"two_locations":false,"no_digital":true,"pin":true,"test_recovery":true,"never_typed":true}'::jsonb,
  now() - interval '90 minutes'
FROM users u WHERE u.email = 'daniel@aegisvault.io'
ON CONFLICT DO NOTHING;

-- Activity events
INSERT INTO activity_events (user_id, kind, message, is_admin_visible, created_at)
SELECT u.id, v.kind, v.message, v.visible, v.created_at
FROM users u
JOIN (VALUES
  ('auth',   'Account created — welcome to AegisVault.', false, now() - interval '4 days'),
  ('wallet', 'MetaMask protection request submitted (0x8fE2…E2f3) · pending compliance review', true, now() - interval '3 days'),
  ('wallet', 'Wallet protection approved — metamask address is now Connected & monitored', true, now() - interval '2 days 3 hours'),
  ('backup', 'Backup health verification submitted (6/6 practices confirmed) · pending review', true, now() - interval '3 days 1 hour'),
  ('backup', 'Backup health verified — recovery plan marked as Protected', true, now() - interval '2 days 2 hours'),
  ('wallet', 'Trust Wallet protection request submitted (bc1qxy…x0wlh) · pending compliance review', true, now() - interval '6 hours')
) AS v(kind, message, visible, created_at) ON u.email = 'demo@aegisvault.io';

INSERT INTO activity_events (user_id, kind, message, is_admin_visible, created_at)
SELECT u.id, v.kind, v.message, v.visible, v.created_at
FROM users u
JOIN (VALUES
  ('auth',   'Account created — welcome to AegisVault.', false, now() - interval '2 days'),
  ('wallet', 'Phantom protection request submitted (7YkWXv…qR7s) · pending compliance review', true, now() - interval '3 hours'),
  ('backup', 'Backup health verification submitted (5/6 practices confirmed) · pending review', true, now() - interval '90 minutes')
) AS v(kind, message, visible, created_at) ON u.email = 'daniel@aegisvault.io';
