ALTER TABLE domain.work
    ADD COLUMN IF NOT EXISTS inspectionperformedon timestamptz,
    ADD COLUMN IF NOT EXISTS inspectionvinverified boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS inspectiondamagescopeconfirmed boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS inspectionvehiclephotoscomplete boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS inspectiondamagephotoscomplete boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS inspectionvinphotocomplete boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS inspectionnotes text;
