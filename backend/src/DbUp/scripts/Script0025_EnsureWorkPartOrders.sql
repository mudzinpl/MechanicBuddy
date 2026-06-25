CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS domain.work_part_order (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    workid uuid NOT NULL REFERENCES domain.work(id) ON DELETE CASCADE,
    partname varchar(300) NOT NULL,
    oemnumber varchar(120),
    supplier varchar(200),
    quantity numeric(12, 2) NOT NULL DEFAULT 1,
    netprice numeric(12, 2),
    vatamount numeric(12, 2),
    grossprice numeric(12, 2),
    status varchar(40) NOT NULL DEFAULT 'to_order',
    orderedon timestamp,
    planneddeliveryon timestamp,
    deliveredon timestamp,
    ordernumber varchar(120),
    notes text,
    externalsupplierid varchar(200),
    externalorderid varchar(200),
    sourcesystem varchar(40) NOT NULL DEFAULT 'manual',
    createdon timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    changedon timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_work_part_order_status CHECK (status IN ('to_order', 'ordered', 'in_delivery', 'delivered', 'returned', 'cancelled')),
    CONSTRAINT chk_work_part_order_source CHECK (sourcesystem IN ('manual', 'inter_cars', 'other'))
);

ALTER TABLE domain.work_part_order ADD COLUMN IF NOT EXISTS id uuid DEFAULT uuid_generate_v4();
ALTER TABLE domain.work_part_order ADD COLUMN IF NOT EXISTS workid uuid;
ALTER TABLE domain.work_part_order ADD COLUMN IF NOT EXISTS partname varchar(300);
ALTER TABLE domain.work_part_order ADD COLUMN IF NOT EXISTS oemnumber varchar(120);
ALTER TABLE domain.work_part_order ADD COLUMN IF NOT EXISTS supplier varchar(200);
ALTER TABLE domain.work_part_order ADD COLUMN IF NOT EXISTS quantity numeric(12, 2) DEFAULT 1;
ALTER TABLE domain.work_part_order ADD COLUMN IF NOT EXISTS netprice numeric(12, 2);
ALTER TABLE domain.work_part_order ADD COLUMN IF NOT EXISTS vatamount numeric(12, 2);
ALTER TABLE domain.work_part_order ADD COLUMN IF NOT EXISTS grossprice numeric(12, 2);
ALTER TABLE domain.work_part_order ADD COLUMN IF NOT EXISTS status varchar(40) DEFAULT 'to_order';
ALTER TABLE domain.work_part_order ADD COLUMN IF NOT EXISTS orderedon timestamp;
ALTER TABLE domain.work_part_order ADD COLUMN IF NOT EXISTS planneddeliveryon timestamp;
ALTER TABLE domain.work_part_order ADD COLUMN IF NOT EXISTS deliveredon timestamp;
ALTER TABLE domain.work_part_order ADD COLUMN IF NOT EXISTS ordernumber varchar(120);
ALTER TABLE domain.work_part_order ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE domain.work_part_order ADD COLUMN IF NOT EXISTS externalsupplierid varchar(200);
ALTER TABLE domain.work_part_order ADD COLUMN IF NOT EXISTS externalorderid varchar(200);
ALTER TABLE domain.work_part_order ADD COLUMN IF NOT EXISTS sourcesystem varchar(40) DEFAULT 'manual';
ALTER TABLE domain.work_part_order ADD COLUMN IF NOT EXISTS createdon timestamp DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE domain.work_part_order ADD COLUMN IF NOT EXISTS changedon timestamp DEFAULT CURRENT_TIMESTAMP;

UPDATE domain.work_part_order SET id = uuid_generate_v4() WHERE id IS NULL;
UPDATE domain.work_part_order SET quantity = 1 WHERE quantity IS NULL;
UPDATE domain.work_part_order SET status = 'to_order' WHERE status IS NULL;
UPDATE domain.work_part_order SET sourcesystem = 'manual' WHERE sourcesystem IS NULL;
UPDATE domain.work_part_order SET createdon = CURRENT_TIMESTAMP WHERE createdon IS NULL;
UPDATE domain.work_part_order SET changedon = CURRENT_TIMESTAMP WHERE changedon IS NULL;

ALTER TABLE domain.work_part_order ALTER COLUMN id SET DEFAULT uuid_generate_v4();
ALTER TABLE domain.work_part_order ALTER COLUMN quantity SET DEFAULT 1;
ALTER TABLE domain.work_part_order ALTER COLUMN status SET DEFAULT 'to_order';
ALTER TABLE domain.work_part_order ALTER COLUMN sourcesystem SET DEFAULT 'manual';
ALTER TABLE domain.work_part_order ALTER COLUMN createdon SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE domain.work_part_order ALTER COLUMN changedon SET DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE domain.work_part_order ALTER COLUMN id SET NOT NULL;
ALTER TABLE domain.work_part_order ALTER COLUMN quantity SET NOT NULL;
ALTER TABLE domain.work_part_order ALTER COLUMN status SET NOT NULL;
ALTER TABLE domain.work_part_order ALTER COLUMN sourcesystem SET NOT NULL;
ALTER TABLE domain.work_part_order ALTER COLUMN createdon SET NOT NULL;
ALTER TABLE domain.work_part_order ALTER COLUMN changedon SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'work_part_order_pkey'
          AND conrelid = 'domain.work_part_order'::regclass
    ) THEN
        ALTER TABLE domain.work_part_order ADD CONSTRAINT work_part_order_pkey PRIMARY KEY (id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'fk_work_part_order_work'
          AND conrelid = 'domain.work_part_order'::regclass
    ) THEN
        ALTER TABLE domain.work_part_order
            ADD CONSTRAINT fk_work_part_order_work FOREIGN KEY (workid) REFERENCES domain.work(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'chk_work_part_order_status'
          AND conrelid = 'domain.work_part_order'::regclass
    ) THEN
        ALTER TABLE domain.work_part_order
            ADD CONSTRAINT chk_work_part_order_status CHECK (status IN ('to_order', 'ordered', 'in_delivery', 'delivered', 'returned', 'cancelled'));
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'chk_work_part_order_source'
          AND conrelid = 'domain.work_part_order'::regclass
    ) THEN
        ALTER TABLE domain.work_part_order
            ADD CONSTRAINT chk_work_part_order_source CHECK (sourcesystem IN ('manual', 'inter_cars', 'other'));
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS ix_work_part_order_workid ON domain.work_part_order(workid);
CREATE INDEX IF NOT EXISTS ix_work_part_order_status ON domain.work_part_order(status);
CREATE INDEX IF NOT EXISTS ix_work_part_order_planneddeliveryon ON domain.work_part_order(planneddeliveryon);
