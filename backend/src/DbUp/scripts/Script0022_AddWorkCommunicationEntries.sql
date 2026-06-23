CREATE TABLE IF NOT EXISTS domain.work_communication_entry (
    id uuid PRIMARY KEY,
    workid uuid NOT NULL REFERENCES domain.work(id) ON DELETE CASCADE,
    category varchar(64) NOT NULL,
    subject varchar(255),
    note text NOT NULL,
    status varchar(32) NOT NULL DEFAULT 'information',
    documentid uuid NULL REFERENCES domain.workdocument(id) ON DELETE SET NULL,
    authorbyemployeeid uuid NULL REFERENCES domain.employee(id),
    authorname varchar(255),
    occurredon timestamp with time zone NOT NULL,
    createdon timestamp with time zone NOT NULL,
    changedon timestamp with time zone NOT NULL,
    integrationchannel varchar(64),
    externalmessageid varchar(255),
    externalthreadid varchar(255)
);

ALTER TABLE domain.work_communication_entry
    DROP CONSTRAINT IF EXISTS ck_work_communication_category;

ALTER TABLE domain.work_communication_entry
    ADD CONSTRAINT ck_work_communication_category
    CHECK (category IN (
        'phone_to_client',
        'phone_from_client',
        'phone_to_insurer',
        'phone_from_insurer',
        'email',
        'sms',
        'meeting',
        'internal_note',
        'other'
    ));

ALTER TABLE domain.work_communication_entry
    DROP CONSTRAINT IF EXISTS ck_work_communication_status;

ALTER TABLE domain.work_communication_entry
    ADD CONSTRAINT ck_work_communication_status
    CHECK (status IN ('information', 'waiting_for_response', 'answered', 'closed'));

CREATE INDEX IF NOT EXISTS ix_work_communication_entry_workid_occurredon
    ON domain.work_communication_entry(workid, occurredon DESC);

CREATE INDEX IF NOT EXISTS ix_work_communication_entry_status
    ON domain.work_communication_entry(status);
