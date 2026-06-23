ALTER TABLE domain.work
ADD COLUMN IF NOT EXISTS assignmentofclaimsignedon timestamptz NULL,
ADD COLUMN IF NOT EXISTS powerofattorneysigned boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS powerofattorneysignedon timestamptz NULL,
ADD COLUMN IF NOT EXISTS clientvatpercent integer NULL,
ADD COLUMN IF NOT EXISTS clientvatamount numeric(12, 2) NULL,
ADD COLUMN IF NOT EXISTS underpaymentamount numeric(12, 2) NULL,
ADD COLUMN IF NOT EXISTS settlementstatus varchar NULL,
ADD COLUMN IF NOT EXISTS paymentdemandon timestamptz NULL,
ADD COLUMN IF NOT EXISTS paymentreceivedon timestamptz NULL,
ADD COLUMN IF NOT EXISTS settlementnotes text NULL;

UPDATE domain.work
SET clientvatpercent = CASE WHEN clientpaysvat THEN 100 ELSE 0 END
WHERE clientvatpercent IS NULL;

UPDATE domain.work
SET settlementstatus = 'unsettled'
WHERE settlementstatus IS NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ck_work_clientvatpercent'
    ) THEN
        ALTER TABLE domain.work
        ADD CONSTRAINT ck_work_clientvatpercent
        CHECK (clientvatpercent IS NULL OR clientvatpercent IN (0, 50, 100));
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ck_work_settlementstatus'
    ) THEN
        ALTER TABLE domain.work
        ADD CONSTRAINT ck_work_settlementstatus
        CHECK (settlementstatus IS NULL OR settlementstatus IN ('unsettled', 'partially_settled', 'settled'));
    END IF;
END $$;
