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

CREATE OR REPLACE FUNCTION domain.add_work_status_history_on_work_insert()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    initial_status varchar;
BEGIN
    initial_status := COALESCE(NULLIF(NEW.damagestatus, ''), NEW.userstatus::text, 'new');

    INSERT INTO domain.work_status_history
        (workid, oldstatus, newstatus, comment, changedbyemployeeid, changedon)
    VALUES
        (NEW.id, initial_status, initial_status, 'Utworzono zlecenie', NEW.starterid, NEW.startedon);

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_work_status_history_on_work_insert ON domain.work;

CREATE TRIGGER trg_work_status_history_on_work_insert
AFTER INSERT ON domain.work
FOR EACH ROW
EXECUTE FUNCTION domain.add_work_status_history_on_work_insert();
