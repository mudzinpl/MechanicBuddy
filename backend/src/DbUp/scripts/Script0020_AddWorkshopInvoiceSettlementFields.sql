ALTER TABLE domain.work
    ADD COLUMN IF NOT EXISTS invoicenetamount numeric(12, 2),
    ADD COLUMN IF NOT EXISTS invoicevatamount numeric(12, 2),
    ADD COLUMN IF NOT EXISTS invoicegrossamount numeric(12, 2),
    ADD COLUMN IF NOT EXISTS insurerpaidamount numeric(12, 2),
    ADD COLUMN IF NOT EXISTS clientsurchargeamount numeric(12, 2),
    ADD COLUMN IF NOT EXISTS paymentdueon timestamp,
    ADD COLUMN IF NOT EXISTS invoicepaymenton timestamp,
    ADD COLUMN IF NOT EXISTS invoicepaymentstatus varchar(40),
    ADD COLUMN IF NOT EXISTS externalinvoiceid varchar(200),
    ADD COLUMN IF NOT EXISTS externalinvoicenumber varchar(100),
    ADD COLUMN IF NOT EXISTS invoicesourcesystem varchar(40);

UPDATE domain.work w
SET invoicepaymentstatus = CASE
        WHEN w.invoiceid IS NULL THEN 'not_issued'
        WHEN i.ispaid = TRUE THEN 'paid'
        ELSE 'issued'
    END
FROM domain.invoice i
WHERE i.id = w.invoiceid
  AND COALESCE(NULLIF(TRIM(w.invoicepaymentstatus), ''), '') = '';

UPDATE domain.work
SET invoicepaymentstatus = 'not_issued'
WHERE invoiceid IS NULL
  AND COALESCE(NULLIF(TRIM(invoicepaymentstatus), ''), '') = '';

UPDATE domain.work
SET invoicepaymentstatus = 'issued'
WHERE invoiceid IS NOT NULL
  AND COALESCE(NULLIF(TRIM(invoicepaymentstatus), ''), '') = '';

UPDATE domain.work
SET invoicesourcesystem = 'manual'
WHERE COALESCE(NULLIF(TRIM(invoicesourcesystem), ''), '') = '';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'chk_work_invoice_payment_status'
          AND conrelid = 'domain.work'::regclass
    ) THEN
        ALTER TABLE domain.work
            ADD CONSTRAINT chk_work_invoice_payment_status
            CHECK (invoicepaymentstatus IS NULL OR invoicepaymentstatus IN ('not_issued', 'issued', 'partially_paid', 'paid', 'overdue', 'disputed'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'chk_work_invoice_source_system'
          AND conrelid = 'domain.work'::regclass
    ) THEN
        ALTER TABLE domain.work
            ADD CONSTRAINT chk_work_invoice_source_system
            CHECK (invoicesourcesystem IS NULL OR invoicesourcesystem IN ('manual', 'fakturownia', 'other'));
    END IF;
END $$;
