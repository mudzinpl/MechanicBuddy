'use client'

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { IWorkData } from '../model';
import { InspectionPreparationUpdate, updateInspectionPreparation } from '../actions/updateInspectionPreparation';

type BooleanField = Exclude<keyof InspectionPreparationUpdate,
    'inspectionMode' | 'plannedInspectionOn' | 'inspectionVisitorName' | 'inspectionContactPhone' | 'inspectionRemoteEmail'>;

const checklist: { name: BooleanField, label: string, optional?: boolean }[] = [
    { name: 'vehiclePhotosReceived', label: 'Zdjęcia pojazdu' },
    { name: 'damagePhotosReceived', label: 'Zdjęcia uszkodzeń' },
    { name: 'registrationDocumentPhotoReceived', label: 'Zdjęcie dowodu rejestracyjnego' },
    { name: 'drivingLicencePhotoReceived', label: 'Zdjęcie prawa jazdy', optional: true },
    { name: 'incidentStatementReceived', label: 'Oświadczenie o zdarzeniu', optional: true },
    { name: 'responsiblePartyDataReceived', label: 'Dane sprawcy', optional: true },
    { name: 'policyNumberReceived', label: 'Numer polisy', optional: true },
];

function initialState(work: IWorkData): InspectionPreparationUpdate {
    return {
        inspectionMode: work.inspectionMode || 'workshop',
        plannedInspectionOn: work.plannedInspectionOn ? work.plannedInspectionOn.slice(0, 16) : null,
        inspectionVisitorName: work.inspectionVisitorName || null,
        inspectionContactPhone: work.inspectionContactPhone || work.clientPhone || null,
        inspectionRemoteEmail: work.inspectionRemoteEmail || work.clientEmail || null,
        powerOfAttorneyPrepared: work.powerOfAttorneyPrepared,
        powerOfAttorneySent: work.powerOfAttorneySent,
        powerOfAttorneyReceived: work.powerOfAttorneySigned,
        vehiclePhotosReceived: work.vehiclePhotosReceived,
        damagePhotosReceived: work.damagePhotosReceived,
        registrationDocumentPhotoReceived: work.registrationDocumentPhotoReceived,
        drivingLicencePhotoReceived: work.drivingLicencePhotoReceived,
        incidentStatementReceived: work.incidentStatementReceived,
        responsiblePartyDataReceived: work.responsiblePartyDataReceived,
        policyNumberReceived: work.policyNumberReceived,
    };
}

export default function InspectionPreparationEditor({ work }: { work: IWorkData }) {
    const router = useRouter();
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [values, setValues] = useState(() => initialState(work));

    const updateText = (name: keyof InspectionPreparationUpdate, value: string) => {
        setValues(current => ({ ...current, [name]: value || null }));
    };
    const updateBoolean = (name: BooleanField, checked: boolean) => {
        setValues(current => ({ ...current, [name]: checked }));
    };
    const cancel = () => {
        setValues(initialState(work));
        setEditing(false);
    };
    const save = async (event: FormEvent) => {
        event.preventDefault();
        setSaving(true);
        try {
            await updateInspectionPreparation(work.id, values);
            setEditing(false);
            router.refresh();
        }
        finally {
            setSaving(false);
        }
    };

    if (!editing) {
        return (
            <button
                type="button"
                onClick={() => setEditing(true)}
                className="mt-4 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
            >
                Uzupełnij przygotowanie oględzin
            </button>
        );
    }

    const inputClass = 'mt-1 block w-full rounded-md border-0 bg-white px-3 py-2 text-sm text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600';

    return (
        <form onSubmit={save} className="mt-4 rounded-md border border-indigo-200 bg-indigo-50 p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-gray-700">
                    Sposób oględzin
                    <select
                        value={values.inspectionMode}
                        onChange={(event) => updateText('inspectionMode', event.target.value)}
                        className={inputClass}
                    >
                        <option value="workshop">Klient przyjedzie do warsztatu</option>
                        <option value="remote">Obsługa zdalna</option>
                    </select>
                </label>
                {values.inspectionMode === 'workshop' && <label className="text-sm font-medium text-gray-700">
                    Termin przyjazdu
                    <input
                        type="datetime-local"
                        value={values.plannedInspectionOn || ''}
                        onChange={(event) => updateText('plannedInspectionOn', event.target.value)}
                        className={inputClass}
                    />
                </label>}
                {values.inspectionMode === 'workshop' ? <>
                    <label className="text-sm font-medium text-gray-700">
                        Osoba, która przyjedzie
                        <input value={values.inspectionVisitorName || ''} onChange={(event) => updateText('inspectionVisitorName', event.target.value)} className={inputClass} />
                    </label>
                    <label className="text-sm font-medium text-gray-700">
                        Telefon kontaktowy
                        <input value={values.inspectionContactPhone || ''} onChange={(event) => updateText('inspectionContactPhone', event.target.value)} className={inputClass} />
                    </label>
                </> : <label className="text-sm font-medium text-gray-700 sm:col-span-2">
                    E-mail klienta
                    <input type="email" value={values.inspectionRemoteEmail || ''} onChange={(event) => updateText('inspectionRemoteEmail', event.target.value)} className={inputClass} />
                </label>}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {([
                    ['powerOfAttorneyPrepared', 'Upoważnienie przygotowane'],
                    ['powerOfAttorneySent', 'Upoważnienie wysłane'],
                    ['powerOfAttorneyReceived', 'Upoważnienie odebrane'],
                ] as [BooleanField, string][]).map(([name, label]) => (
                    <label key={name} className="flex items-center gap-2 rounded-md bg-white p-3 text-sm text-gray-700 ring-1 ring-gray-200">
                        <input type="checkbox" checked={values[name]} onChange={(event) => updateBoolean(name, event.target.checked)} className="size-4 rounded border-gray-300 text-indigo-600" />
                        {label}
                    </label>
                ))}
            </div>

            <p className="mt-4 text-sm font-semibold text-gray-900">Dokumentacja od klienta</p>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {checklist.map(item => (
                    <label key={item.name} className="flex items-center gap-2 rounded-md bg-white p-3 text-sm text-gray-700 ring-1 ring-gray-200">
                        <input type="checkbox" checked={values[item.name]} onChange={(event) => updateBoolean(item.name, event.target.checked)} className="size-4 rounded border-gray-300 text-indigo-600" />
                        <span>{item.label}{item.optional ? ' (jeśli dotyczy)' : ''}</span>
                    </label>
                ))}
            </div>

            <div className="mt-4 flex justify-end gap-3">
                <button type="button" onClick={cancel} disabled={saving} className="rounded-md px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-white">Anuluj</button>
                <button type="submit" disabled={saving} className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60">
                    {saving ? 'Zapisywanie…' : 'Zapisz przygotowanie'}
                </button>
            </div>
        </form>
    );
}
