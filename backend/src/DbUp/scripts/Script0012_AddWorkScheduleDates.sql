-- Optional dates used by the workshop manager dashboard.

ALTER TABLE domain.work
    ADD COLUMN IF NOT EXISTS plannedintakeon TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS plannedreleaseon TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS plannedinspectionon TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_work_plannedintakeon ON domain.work(plannedintakeon);
CREATE INDEX IF NOT EXISTS idx_work_plannedreleaseon ON domain.work(plannedreleaseon);
CREATE INDEX IF NOT EXISTS idx_work_plannedinspectionon ON domain.work(plannedinspectionon);
