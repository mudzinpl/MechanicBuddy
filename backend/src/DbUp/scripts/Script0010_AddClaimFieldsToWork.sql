-- Additional work-order details for body shops and insurance claim handling.
-- Existing work orders remain valid; text fields are nullable and flags default to false.

ALTER TABLE domain.work
    ADD COLUMN IF NOT EXISTS claimnumber VARCHAR(100),
    ADD COLUMN IF NOT EXISTS insurer VARCHAR(200),
    ADD COLUMN IF NOT EXISTS damagetype VARCHAR(30),
    ADD COLUMN IF NOT EXISTS damagestatus VARCHAR(100),
    ADD COLUMN IF NOT EXISTS assignmentofclaimsigned BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS clientpaysvat BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS audatexestimatenumber VARCHAR(100),
    ADD COLUMN IF NOT EXISTS insurernotes TEXT;

CREATE INDEX IF NOT EXISTS idx_work_claimnumber ON domain.work(claimnumber);
