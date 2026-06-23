export interface IIntegrationConfiguration {
    id: string;
    integrationType: string;
    displayName: string;
    description: string;
    baseUrl?: string | null;
    secretPlaceholder?: string | null;
    loginEmail?: string | null;
    status: IntegrationStatus;
    lastSyncAt?: string | null;
    enabled: boolean;
    notes?: string | null;
    createdOn: string;
    changedOn: string;
}

export type IntegrationStatus = 'not_configured' | 'configured' | 'active' | 'error';

export const integrationStatusLabels: Record<IntegrationStatus, string> = {
    not_configured: 'Nie skonfigurowano',
    configured: 'Skonfigurowano',
    active: 'Aktywna',
    error: 'Błąd',
};

export function getIntegrationStatusLabel(status: string) {
    return integrationStatusLabels[status as IntegrationStatus] ?? status;
}

export function getIntegrationStatusClass(status: string) {
    switch (status) {
        case 'active':
            return 'bg-green-50 text-green-700 ring-green-600/20';
        case 'configured':
            return 'bg-blue-50 text-blue-700 ring-blue-600/20';
        case 'error':
            return 'bg-red-50 text-red-700 ring-red-600/20';
        default:
            return 'bg-gray-50 text-gray-600 ring-gray-500/10';
    }
}

export function formatIntegrationDate(value?: string | null) {
    if (!value) {
        return 'Nigdy';
    }

    return new Intl.DateTimeFormat('pl-PL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));
}
