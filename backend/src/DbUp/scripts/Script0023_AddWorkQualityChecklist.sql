CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS domain.work_quality_checklist_item (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    workid uuid NOT NULL REFERENCES domain.work(id) ON DELETE CASCADE,
    itemkey varchar(80) NOT NULL,
    groupkey varchar(80) NOT NULL,
    itemname varchar(300) NOT NULL,
    description text,
    iscompleted boolean NOT NULL DEFAULT FALSE,
    completedbyemployeeid uuid REFERENCES domain.employee(id) ON DELETE SET NULL,
    completedon timestamp,
    notes text,
    sortorder int NOT NULL DEFAULT 0,
    createdon timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    changedon timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_work_quality_checklist_item UNIQUE (workid, itemkey),
    CONSTRAINT chk_work_quality_checklist_group CHECK (groupkey IN ('vehicle_intake', 'inspection', 'documents', 'parts', 'body_repair', 'mechanical_repair', 'painting', 'assembly', 'washing', 'final_control', 'vehicle_release'))
);

CREATE INDEX IF NOT EXISTS ix_work_quality_checklist_workid ON domain.work_quality_checklist_item(workid);
CREATE INDEX IF NOT EXISTS ix_work_quality_checklist_completed ON domain.work_quality_checklist_item(iscompleted);
