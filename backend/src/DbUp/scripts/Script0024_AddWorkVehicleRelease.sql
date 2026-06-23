CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS domain.work_vehicle_release (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    workid uuid NOT NULL UNIQUE REFERENCES domain.work(id) ON DELETE CASCADE,
    plannedreleaseon timestamp with time zone,
    releasedon timestamp with time zone,
    releasedbyemployeeid uuid REFERENCES domain.employee(id) ON DELETE SET NULL,
    receivedbyname varchar(200),
    identitydocumentnumber varchar(120),
    mileageout integer,
    fuelout varchar(80),
    releasenotes text,
    clientreceiveddocuments boolean NOT NULL DEFAULT FALSE,
    clientreceivedinvoiceinfo boolean NOT NULL DEFAULT FALSE,
    vehiclewashed boolean NOT NULL DEFAULT FALSE,
    finalcontrolcompleted boolean NOT NULL DEFAULT FALSE,
    clientsignatureplaceholder text,
    createdon timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    changedon timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_work_vehicle_release_workid ON domain.work_vehicle_release(workid);
CREATE INDEX IF NOT EXISTS ix_work_vehicle_release_plannedreleaseon ON domain.work_vehicle_release(plannedreleaseon);
CREATE INDEX IF NOT EXISTS ix_work_vehicle_release_releasedon ON domain.work_vehicle_release(releasedon);
