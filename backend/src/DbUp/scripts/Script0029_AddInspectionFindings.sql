CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS domain.work_inspection_finding (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    workid uuid NOT NULL REFERENCES domain.work(id) ON DELETE CASCADE,
    elementname varchar(200) NOT NULL,
    vehicleside varchar(30) NOT NULL DEFAULT 'not_applicable',
    damagetype varchar(40) NOT NULL DEFAULT 'other',
    recommendedaction varchar(40) NOT NULL DEFAULT 'repair',
    notes text,
    sortorder integer NOT NULL DEFAULT 0,
    createdon timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    changedon timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_work_inspection_finding_side CHECK (
        vehicleside IN ('left', 'right', 'front', 'rear', 'center', 'not_applicable')
    ),
    CONSTRAINT chk_work_inspection_finding_damage CHECK (
        damagetype IN ('dent', 'scratch', 'crack', 'deformation', 'broken', 'missing', 'other')
    ),
    CONSTRAINT chk_work_inspection_finding_action CHECK (
        recommendedaction IN ('repair', 'replace', 'paint', 'polish', 'diagnose', 'none')
    )
);

CREATE INDEX IF NOT EXISTS ix_work_inspection_finding_workid
    ON domain.work_inspection_finding(workid);
