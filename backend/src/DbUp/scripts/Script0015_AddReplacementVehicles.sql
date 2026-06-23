ALTER TABLE domain.vehicle
ADD COLUMN IF NOT EXISTS isreplacementvehicle boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS domain.work_replacement_vehicle (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workid uuid NOT NULL REFERENCES domain.work(id) ON DELETE CASCADE,
    replacementvehicleid uuid NOT NULL REFERENCES domain.vehicle(id),
    issuedon timestamptz NULL,
    returnedon timestamptz NULL,
    mileageout integer NULL,
    mileagein integer NULL,
    fuelout varchar NULL,
    fuelin varchar NULL,
    conditionout text NULL,
    conditionin text NULL,
    notes text NULL,
    status varchar NOT NULL DEFAULT 'planned',
    createdon timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    changedon timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_work_replacement_vehicle_status CHECK (status IN ('planned', 'issued', 'returned', 'cancelled'))
);

CREATE INDEX IF NOT EXISTS idx_work_replacement_vehicle_workid
ON domain.work_replacement_vehicle(workid);

CREATE INDEX IF NOT EXISTS idx_work_replacement_vehicle_active
ON domain.work_replacement_vehicle(workid, status)
WHERE status IN ('planned', 'issued');
