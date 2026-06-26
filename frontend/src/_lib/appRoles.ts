export type AppRole = 'administrator' | 'manager' | 'board' | 'office' | 'technician' | 'assessor' | 'readonly';

export const appRoleLabels: Record<AppRole, string> = {
    administrator: 'Administrator',
    manager: 'Kierownik',
    board: 'Szef / Zarząd',
    office: 'Pracownik biura',
    technician: 'Mechanik / Lakiernik',
    assessor: 'Rzeczoznawca',
    readonly: 'Podgląd tylko do odczytu',
};

export const appRoleOptions = Object.entries(appRoleLabels).map(([value, label]) => ({ value, label }));

export function normalizeAppRole(role?: string | null): AppRole {
    if (role && role in appRoleLabels) {
        return role as AppRole;
    }

    return 'manager';
}

export function getAppRoleLabel(role?: string | null) {
    return appRoleLabels[normalizeAppRole(role)];
}

export function canAccessMainSection(role: string | null | undefined, section: 'dashboard' | 'work' | 'calendar' | 'clients' | 'vehicles' | 'inventory' | 'requests' | 'settings') {
    const normalized = normalizeAppRole(role);

    if (normalized === 'administrator') {
        return true;
    }

    const permissions: Record<AppRole, string[]> = {
        administrator: ['dashboard', 'work', 'calendar', 'clients', 'vehicles', 'inventory', 'requests', 'settings'],
        manager: ['dashboard', 'work', 'calendar', 'clients', 'vehicles', 'inventory', 'requests'],
        board: ['dashboard', 'work'],
        office: ['dashboard', 'work', 'calendar', 'clients', 'vehicles', 'inventory', 'requests'],
        technician: ['work'],
        assessor: ['work', 'calendar'],
        readonly: ['dashboard', 'work'],
    };

    return permissions[normalized].includes(section);
}

export function canAccessTechnicalSettings(role: string | null | undefined) {
    return normalizeAppRole(role) === 'administrator';
}
