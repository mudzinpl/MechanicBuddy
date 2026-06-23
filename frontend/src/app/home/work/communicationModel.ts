export interface IWorkCommunicationEntry {
    id: string;
    workId: string;
    category: string;
    subject?: string | null;
    note: string;
    status: string;
    documentId?: string | null;
    documentFileName?: string | null;
    authorByEmployeeId?: string | null;
    authorName?: string | null;
    occurredOn: string;
    createdOn: string;
    changedOn: string;
    integrationChannel?: string | null;
    externalMessageId?: string | null;
    externalThreadId?: string | null;
}

export const communicationCategories = [
    { value: 'phone_to_client', label: 'Telefon do klienta' },
    { value: 'phone_from_client', label: 'Telefon od klienta' },
    { value: 'phone_to_insurer', label: 'Telefon do ubezpieczyciela' },
    { value: 'phone_from_insurer', label: 'Telefon od ubezpieczyciela' },
    { value: 'email', label: 'E-mail' },
    { value: 'sms', label: 'Wiadomość SMS' },
    { value: 'meeting', label: 'Spotkanie' },
    { value: 'internal_note', label: 'Notatka wewnętrzna' },
    { value: 'other', label: 'Inne' },
] as const;

export const communicationStatuses = [
    { value: 'information', label: 'Informacja' },
    { value: 'waiting_for_response', label: 'Oczekuje na odpowiedź' },
    { value: 'answered', label: 'Odpowiedziano' },
    { value: 'closed', label: 'Zamknięte' },
] as const;

export function getCommunicationCategoryLabel(category?: string | null) {
    return communicationCategories.find(item => item.value === category)?.label ?? category ?? '';
}

export function getCommunicationStatusLabel(status?: string | null) {
    return communicationStatuses.find(item => item.value === status)?.label ?? status ?? '';
}

export function getCommunicationStatusClass(status?: string | null) {
    switch (status) {
        case 'waiting_for_response':
            return 'bg-yellow-50 text-yellow-800 ring-yellow-600/20';
        case 'answered':
            return 'bg-blue-50 text-blue-700 ring-blue-600/20';
        case 'closed':
            return 'bg-green-50 text-green-700 ring-green-600/20';
        default:
            return 'bg-gray-50 text-gray-700 ring-gray-500/10';
    }
}
