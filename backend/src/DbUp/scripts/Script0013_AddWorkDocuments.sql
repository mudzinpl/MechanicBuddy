CREATE TABLE IF NOT EXISTS domain.workdocument (
    id uuid PRIMARY KEY,
    workid uuid NOT NULL REFERENCES domain.work(id) ON DELETE CASCADE,
    category varchar(40) NOT NULL,
    filename varchar(255) NOT NULL,
    contenttype varchar(150) NOT NULL,
    filesize bigint NOT NULL,
    content bytea NOT NULL,
    uploadedon timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    uploadedbyemployeeid uuid REFERENCES domain.employee(id) ON DELETE SET NULL,
    uploadedbyname varchar(200) NOT NULL,
    CONSTRAINT ck_workdocument_category CHECK (category IN (
        'vehicle_photos',
        'audatex_estimates',
        'insurer_decisions',
        'claim_assignments',
        'authorizations',
        'invoices',
        'client_documents',
        'other'
    )),
    CONSTRAINT ck_workdocument_filesize CHECK (filesize > 0 AND filesize <= 26214400)
);

CREATE INDEX IF NOT EXISTS idx_workdocument_workid ON domain.workdocument(workid);
CREATE INDEX IF NOT EXISTS idx_workdocument_workid_category ON domain.workdocument(workid, category);

