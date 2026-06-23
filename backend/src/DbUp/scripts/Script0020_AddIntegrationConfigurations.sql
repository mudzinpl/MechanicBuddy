CREATE TABLE IF NOT EXISTS domain.integration_configuration (
    id uuid PRIMARY KEY,
    integrationtype varchar(64) NOT NULL UNIQUE,
    displayname varchar(128) NOT NULL,
    description varchar NOT NULL,
    baseurl varchar,
    secretplaceholder varchar,
    loginemail varchar,
    status varchar(32) NOT NULL DEFAULT 'not_configured',
    lastsyncat timestamp with time zone,
    enabled boolean NOT NULL DEFAULT false,
    notes varchar,
    createdon timestamp with time zone NOT NULL,
    changedon timestamp with time zone NOT NULL
);

ALTER TABLE domain.integration_configuration
    DROP CONSTRAINT IF EXISTS ck_integration_configuration_status;

ALTER TABLE domain.integration_configuration
    ADD CONSTRAINT ck_integration_configuration_status
    CHECK (status IN ('not_configured', 'configured', 'active', 'error'));

INSERT INTO domain.integration_configuration (
    id, integrationtype, displayname, description, status, enabled, createdon, changedon
)
VALUES
    ('11111111-0020-4000-8000-000000000001', 'fakturownia', 'Fakturownia', 'Przyszła integracja do wystawiania i synchronizacji faktur.', 'not_configured', false, now(), now()),
    ('11111111-0020-4000-8000-000000000002', 'email', 'Poczta e-mail', 'Przyszła integracja z Outlook lub Gmail do obsługi korespondencji.', 'not_configured', false, now(), now()),
    ('11111111-0020-4000-8000-000000000003', 'audanet_audatex', 'Audanet / Audatex', 'Przyszła integracja z systemami kosztorysowania szkód.', 'not_configured', false, now(), now()),
    ('11111111-0020-4000-8000-000000000004', 'parts_suppliers', 'Dostawcy części', 'Przyszła integracja z dostawcami części, np. Inter Cars.', 'not_configured', false, now(), now()),
    ('11111111-0020-4000-8000-000000000005', 'bank_payments', 'Bank / płatności', 'Przyszła integracja z bankiem i potwierdzeniami wpływów.', 'not_configured', false, now(), now()),
    ('11111111-0020-4000-8000-000000000006', 'other', 'Inne', 'Miejsce na pozostałe integracje z systemami zewnętrznymi.', 'not_configured', false, now(), now())
ON CONFLICT (integrationtype) DO UPDATE SET
    displayname = EXCLUDED.displayname,
    description = EXCLUDED.description,
    changedon = domain.integration_configuration.changedon;
