-- Use stable process-status keys while keeping user-facing labels in the frontend.
-- Unknown custom values are preserved.

ALTER TABLE domain.work
    ALTER COLUMN damagestatus SET DEFAULT 'new';

UPDATE domain.work
SET damagestatus = CASE LOWER(TRIM(damagestatus))
    WHEN 'nowe zgłoszenie' THEN 'new'
    WHEN 'oczekuje na oględziny' THEN 'inspection_pending'
    WHEN 'oględziny wykonane' THEN 'inspected'
    WHEN 'kosztorys w przygotowaniu' THEN 'estimate_preparing'
    WHEN 'kosztorys wysłany do ubezpieczyciela' THEN 'estimate_sent'
    WHEN 'oczekuje na akceptację' THEN 'approval_pending'
    WHEN 'zaakceptowane' THEN 'accepted'
    WHEN 'zaakceptowana do naprawy' THEN 'accepted'
    WHEN 'czeka na części' THEN 'parts_pending'
    WHEN 'w naprawie' THEN 'repair'
    WHEN 'lakiernia' THEN 'paint_shop'
    WHEN 'kontrola jakości' THEN 'quality_control'
    WHEN 'gotowe do odbioru' THEN 'ready_for_pickup'
    WHEN 'wydane' THEN 'released'
    WHEN 'rozliczone' THEN 'settled'
    WHEN 'wstrzymane' THEN 'on_hold'
    WHEN 'odmowa / brak akceptacji' THEN 'rejected'
    ELSE damagestatus
END
WHERE damagestatus IS NOT NULL;

UPDATE domain.work
SET damagestatus = 'new'
WHERE damagestatus IS NULL OR TRIM(damagestatus) = '';

CREATE INDEX IF NOT EXISTS idx_work_damagestatus ON domain.work(damagestatus);
