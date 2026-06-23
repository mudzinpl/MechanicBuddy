ALTER TABLE domain.work_replacement_vehicle
ADD COLUMN IF NOT EXISTS plannedreturnon timestamptz NULL;

CREATE INDEX IF NOT EXISTS idx_work_replacement_vehicle_plannedreturnon
ON domain.work_replacement_vehicle(plannedreturnon)
WHERE status = 'issued' AND plannedreturnon IS NOT NULL;
