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

CREATE INDEX IF NOT EXISTS ix_work_part_order_workid ON domain.work_part_order(workid);
CREATE INDEX IF NOT EXISTS ix_work_part_order_status ON domain.work_part_order(status);
