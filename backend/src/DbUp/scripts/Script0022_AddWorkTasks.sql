CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS domain.work_task (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    workid uuid NOT NULL REFERENCES domain.work(id) ON DELETE CASCADE,
    title varchar(300) NOT NULL,
    description text,
    tasktype varchar(40) NOT NULL DEFAULT 'other',
    assignedemployeeid uuid REFERENCES domain.employee(id) ON DELETE SET NULL,
    status varchar(40) NOT NULL DEFAULT 'new',
    priority varchar(40) NOT NULL DEFAULT 'normal',
    dueon timestamp,
    completedon timestamp,
    comment text,
    createdbyemployeeid uuid REFERENCES domain.employee(id) ON DELETE SET NULL,
    createdon timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    changedon timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_work_task_type CHECK (tasktype IN ('office', 'inspection', 'estimate', 'parts', 'body_shop', 'mechanic', 'paint_shop', 'quality_control', 'vehicle_release', 'settlement', 'other')),
    CONSTRAINT chk_work_task_status CHECK (status IN ('new', 'in_progress', 'on_hold', 'completed', 'cancelled')),
    CONSTRAINT chk_work_task_priority CHECK (priority IN ('low', 'normal', 'high', 'urgent'))
);

CREATE INDEX IF NOT EXISTS ix_work_task_workid ON domain.work_task(workid);
CREATE INDEX IF NOT EXISTS ix_work_task_assignedemployeeid ON domain.work_task(assignedemployeeid);
CREATE INDEX IF NOT EXISTS ix_work_task_status ON domain.work_task(status);
CREATE INDEX IF NOT EXISTS ix_work_task_dueon ON domain.work_task(dueon);
