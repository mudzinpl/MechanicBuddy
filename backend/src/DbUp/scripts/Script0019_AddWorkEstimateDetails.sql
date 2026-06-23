ALTER TABLE domain.work
ADD COLUMN IF NOT EXISTS estimatesystem varchar NULL,
ADD COLUMN IF NOT EXISTS estimateversion varchar NULL,
ADD COLUMN IF NOT EXISTS estimatepreparedon timestamptz NULL,
ADD COLUMN IF NOT EXISTS estimatenetamount numeric(12, 2) NULL,
ADD COLUMN IF NOT EXISTS estimatevatamount numeric(12, 2) NULL,
ADD COLUMN IF NOT EXISTS estimategrossamount numeric(12, 2) NULL,
ADD COLUMN IF NOT EXISTS estimatelabormechanicalrbg numeric(10, 2) NULL,
ADD COLUMN IF NOT EXISTS estimatelaborpaintrbg numeric(10, 2) NULL,
ADD COLUMN IF NOT EXISTS estimatestatus varchar NULL,
ADD COLUMN IF NOT EXISTS estimateacceptedon timestamptz NULL,
ADD COLUMN IF NOT EXISTS estimatenotes text NULL,
ADD COLUMN IF NOT EXISTS estimatedocumentid uuid NULL;

UPDATE domain.work
SET estimatesystem = 'audatex'
WHERE estimatesystem IS NULL
  AND COALESCE(TRIM(audatexestimatenumber), '') <> '';

UPDATE domain.work
SET estimatestatus = CASE
    WHEN insurerdecisionon IS NOT NULL THEN 'accepted'
    WHEN estimatesenton IS NOT NULL THEN 'sent'
    WHEN COALESCE(TRIM(audatexestimatenumber), '') <> '' THEN 'draft'
    ELSE NULL
END
WHERE estimatestatus IS NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_work_estimatedocument'
    ) THEN
        ALTER TABLE domain.work
        ADD CONSTRAINT fk_work_estimatedocument
        FOREIGN KEY (estimatedocumentid) REFERENCES domain.workdocument(id) ON DELETE SET NULL;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ck_work_estimatesystem'
    ) THEN
        ALTER TABLE domain.work
        ADD CONSTRAINT ck_work_estimatesystem
        CHECK (estimatesystem IS NULL OR estimatesystem IN ('audanet', 'audatex', 'manual', 'other'));
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ck_work_estimatestatus'
    ) THEN
        ALTER TABLE domain.work
        ADD CONSTRAINT ck_work_estimatestatus
        CHECK (estimatestatus IS NULL OR estimatestatus IN ('draft', 'sent', 'accepted', 'rejected', 'needs_correction'));
    END IF;
END $$;

ALTER TABLE domain.workdocument DROP CONSTRAINT IF EXISTS ck_workdocument_category;

ALTER TABLE domain.workdocument
ADD CONSTRAINT ck_workdocument_category CHECK (category IN (
    'vehicle_photos',
    'audatex_estimates',
    'audanet_estimates',
    'manual_calculations',
    'insurer_verifications',
    'insurer_decisions',
    'claim_assignments',
    'authorizations',
    'payment_demands',
    'transfer_confirmations',
    'invoices',
    'notes',
    'client_documents',
    'other'
));
