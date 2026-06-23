ALTER TABLE domain.work
ADD COLUMN IF NOT EXISTS claimhandlername varchar NULL,
ADD COLUMN IF NOT EXISTS claimhandleremail varchar NULL,
ADD COLUMN IF NOT EXISTS claimhandlerphone varchar NULL,
ADD COLUMN IF NOT EXISTS claimreportedon timestamptz NULL,
ADD COLUMN IF NOT EXISTS estimatesenton timestamptz NULL,
ADD COLUMN IF NOT EXISTS insurerdecisionon timestamptz NULL,
ADD COLUMN IF NOT EXISTS supplementpaidon timestamptz NULL;

CREATE INDEX IF NOT EXISTS idx_work_insurer
ON domain.work(insurer);

CREATE INDEX IF NOT EXISTS idx_work_claim_dates
ON domain.work(estimatesenton, insurerdecisionon);
