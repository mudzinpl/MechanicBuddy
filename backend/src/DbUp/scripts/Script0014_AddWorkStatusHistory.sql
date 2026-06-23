CREATE TABLE IF NOT EXISTS domain.work_status_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workid uuid NOT NULL REFERENCES domain.work(id) ON DELETE CASCADE,
    oldstatus varchar NOT NULL,
    newstatus varchar NOT NULL,
    comment text NULL,
    changedbyemployeeid uuid NULL REFERENCES domain.employee(id),
    changedon timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_work_status_history_work_changedon
ON domain.work_status_history(workid, changedon DESC);
