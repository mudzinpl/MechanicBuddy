ALTER TABLE domain.work
    ADD COLUMN IF NOT EXISTS inspectionmode varchar(20),
    ADD COLUMN IF NOT EXISTS inspectionvisitorname varchar(200),
    ADD COLUMN IF NOT EXISTS inspectioncontactphone varchar(50),
    ADD COLUMN IF NOT EXISTS inspectionremoteemail varchar(200),
    ADD COLUMN IF NOT EXISTS powerofattorneyprepared boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS powerofattorneysent boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS vehiclephotosreceived boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS damagephotosreceived boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS registrationdocumentphotoreceived boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS drivinglicencephotoreceived boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS incidentstatementreceived boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS responsiblepartydatareceived boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS policynumberreceived boolean NOT NULL DEFAULT false;
