INSERT INTO domain.repairjob(id, workid, ordernr, notes, startedon, starterid)
SELECT gen_random_uuid(), w.id, 0, 'Naprawa demonstracyjna APPRA', w.startedon, w.starterid
FROM domain.work w
WHERE w.notes LIKE '%APPRA_DEMO_DATA%'
  AND NOT EXISTS (SELECT 1 FROM domain.repairjob r WHERE r.workid = w.id)
  AND NOT EXISTS (SELECT 1 FROM domain.offer o WHERE o.workid = w.id);

CREATE OR REPLACE FUNCTION domain.ensure_appra_demo_activity()
RETURNS trigger AS $$
BEGIN
    IF NEW.notes LIKE '%APPRA_DEMO_DATA%'
       AND NOT EXISTS (SELECT 1 FROM domain.repairjob r WHERE r.workid = NEW.id)
       AND NOT EXISTS (SELECT 1 FROM domain.offer o WHERE o.workid = NEW.id) THEN
        INSERT INTO domain.repairjob(id, workid, ordernr, notes, startedon, starterid)
        VALUES (gen_random_uuid(), NEW.id, 0, 'Naprawa demonstracyjna APPRA', NEW.startedon, NEW.starterid);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ensure_appra_demo_activity ON domain.work;

CREATE TRIGGER trg_ensure_appra_demo_activity
AFTER INSERT ON domain.work
FOR EACH ROW
WHEN (NEW.notes LIKE '%APPRA_DEMO_DATA%')
EXECUTE FUNCTION domain.ensure_appra_demo_activity();
