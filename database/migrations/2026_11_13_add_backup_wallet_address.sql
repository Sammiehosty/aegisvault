-- Run once on the AegisVault production database.
-- Adds the public wallet address and detected network to backup verification requests.
ALTER TABLE backup_requests
  ADD COLUMN address VARCHAR(255) NULL AFTER checklist,
  ADD COLUMN chain VARCHAR(40) NULL AFTER address;
