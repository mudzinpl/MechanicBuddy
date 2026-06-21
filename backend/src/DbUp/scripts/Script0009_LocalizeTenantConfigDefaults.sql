-- Localize untouched tenant configuration values created by older versions.
-- Customized tenant data is preserved by matching the original defaults.

UPDATE tenant_config.requisites
SET name = 'Nazwa firmy'
WHERE name = 'Default Company';

UPDATE tenant_config.requisites
SET phone = '+48123456789'
WHERE phone = '+1234567890';

UPDATE tenant_config.requisites
SET address = 'ul. Przykładowa 1, 00-001 Warszawa'
WHERE address = '123 Main St';

UPDATE tenant_config.requisites
SET email = 'kontakt@example.pl'
WHERE email = 'info@example.com';

UPDATE tenant_config.requisites
SET bank_account = 'PL00123456789012345678901234'
WHERE bank_account = 'EE123456789012';

UPDATE tenant_config.requisites
SET reg_nr = 'REGON123456789'
WHERE reg_nr = 'REG12345';

UPDATE tenant_config.requisites
SET tax_id = 'PL1234567890'
WHERE tax_id IN ('VAT123456', 'KMKR123456');

UPDATE tenant_config.pricing
SET surcharge = 'Dopłata'
WHERE surcharge = 'Default Surcharge';

UPDATE tenant_config.pricing
SET disclaimer = 'Zastrzeżenie'
WHERE disclaimer = 'Default Disclaimer';

UPDATE tenant_config.pricing
SET invoice_email_content = 'Dziękujemy za skorzystanie z naszych usług. W załączeniu przesyłamy fakturę.'
WHERE invoice_email_content = 'Thank you for your business. Please find your invoice attached.';

UPDATE tenant_config.pricing
SET estimate_email_content = 'Dziękujemy za zainteresowanie ofertą. W załączeniu przesyłamy wycenę.'
WHERE estimate_email_content = 'Thank you for your interest. Please find your estimate attached.';

UPDATE domain.employee
SET firstname = 'Administrator',
    lastname = 'Systemowy',
    description = 'Domyślny administrator systemu'
WHERE description = 'Default system administrator';
