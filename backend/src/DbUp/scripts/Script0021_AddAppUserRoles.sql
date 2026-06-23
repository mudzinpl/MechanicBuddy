ALTER TABLE public.user
ADD COLUMN IF NOT EXISTS app_role varchar(64) NULL;

UPDATE public.user
SET app_role = CASE
    WHEN COALESCE(is_default_admin, false) THEN 'administrator'
    ELSE 'manager'
END
WHERE app_role IS NULL OR app_role = '';

ALTER TABLE public.user
ALTER COLUMN app_role SET DEFAULT 'manager';

ALTER TABLE public.user
ALTER COLUMN app_role SET NOT NULL;

ALTER TABLE public.user
    DROP CONSTRAINT IF EXISTS ck_user_app_role;

ALTER TABLE public.user
    ADD CONSTRAINT ck_user_app_role
    CHECK (app_role IN (
        'administrator',
        'manager',
        'board',
        'office',
        'technician',
        'assessor',
        'readonly'
    ));

UPDATE public.user
SET app_role = 'administrator'
WHERE COALESCE(is_default_admin, false);
