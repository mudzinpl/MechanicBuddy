'use client'

import { FormEvent, useMemo, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { InspectionExecutionUpdate, updateInspectionExecution } from '../actions/updateInspectionExecution';
import { IInspectionFinding, IWorkData, IWorkDocument } from '../model';
import InspectionFindings from './InspectionFindings';

const checkboxItems: Array<{ key: keyof InspectionExecutionUpdate; label: string }> = [
    { key: 'inspectionVinVerified', label: 'VIN zweryfikowany z pojazdem' },
    { key: 'inspectionDamageScopeConfirmed', label: 'Zakres uszkodzeń potwierdzony' },
    { key: 'inspectionVehiclePhotosComplete', label: 'Komplet zdjęć całego pojazdu' },
    { key: 'inspectionDamagePhotosComplete', label: 'Komplet zdjęć uszkodzeń' },
    { key: 'inspectionVinPhotoComplete', label: 'Zdjęcie VIN wykonane' },
];

function toLocalInput(value?: string | null) {
    if (!value) return '';
    const date = new Date(value);
    const offset = date.getTimezoneOffset() * 60_000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export default function InspectionExecutionEditor({
    work,
    documents,
    findings,
}: {
    work: IWorkData;
    documents: IWorkDocument[];
    findings: IInspectionFinding[];
}) {
    const router = useRouter();
    const uploadFormRef = useRef<HTMLFormElement>(null);
    const [isSaving, startSaving] = useTransition();
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
    const [values, setValues] = useState<InspectionExecutionUpdate>({
        inspectionPerformedOn: toLocalInput(work.inspectionPerformedOn) || null,
        odo: work.odo ?? null,
        inspectionVinVerified: work.inspectionVinVerified,
        inspectionDamageScopeConfirmed: work.inspectionDamageScopeConfirmed,
        inspectionVehiclePhotosComplete: work.inspectionVehiclePhotosComplete,
        inspectionDamagePhotosComplete: work.inspectionDamagePhotosComplete,
        inspectionVinPhotoComplete: work.inspectionVinPhotoComplete,
        inspectionNotes: work.inspectionNotes || null,
    });

    const photoDocuments = useMemo(
        () => documents.filter(document => document.category === 'vehicle_photos'),
        [documents],
    );

    const save = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setMessage(null);
        startSaving(async () => {
            try {
                await updateInspectionExecution(work.id, values);
                setMessage({ text: 'Zapisano dane oględzin.', error: false });
                router.refresh();
            } catch (error) {
                console.error(error);
                setMessage({ text: 'Nie udało się zapisać oględzin.', error: true });
            }
        });
    };

    const upload = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsUploading(true);
        setMessage(null);
        try {
            const body = new FormData(event.currentTarget);
            body.set('category', 'vehicle_photos');
            const response = await fetch(`/api/work-documents/${work.id}`, { method: 'POST', body });
            if (!response.ok) throw new Error(await response.text());
            uploadFormRef.current?.reset();
            setMessage({ text: 'Zdjęcia dodano do dokumentów sprawy.', error: false });
            router.refresh();
        } catch (error) {
            console.error(error);
            setMessage({ text: 'Nie udało się dodać zdjęć.', error: true });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-5 px-5 pb-6">
            <div className={`rounded-lg border p-4 ${work.inspectionExecutionReady ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}>
                <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold text-gray-900">Kompletność oględzin</span>
                    <span className={work.inspectionExecutionReady ? 'font-semibold text-green-700' : 'font-semibold text-amber-700'}>
                        {work.inspectionExecutionCompletionPercent ?? 0}%
                    </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
                    <div
                        className={work.inspectionExecutionReady ? 'h-full bg-green-600' : 'h-full bg-amber-500'}
                        style={{ width: `${Math.min(100, Math.max(0, work.inspectionExecutionCompletionPercent ?? 0))}%` }}
                    />
                </div>
                {work.inspectionExecutionReady ? (
                    <p className="mt-3 text-sm font-medium text-green-800">Można oznaczyć oględziny jako wykonane.</p>
                ) : (
                    <ul className="mt-3 space-y-1 text-sm text-amber-900">
                        {(work.inspectionExecutionBlockers ?? []).map(blocker => <li key={blocker}>□ {blocker}</li>)}
                    </ul>
                )}
            </div>

            <form onSubmit={save} className="space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="text-sm font-medium text-gray-700">
                        Data i godzina oględzin
                        <input
                            type="datetime-local"
                            value={values.inspectionPerformedOn || ''}
                            onChange={event => setValues(current => ({ ...current, inspectionPerformedOn: event.target.value || null }))}
                            className="mt-1 block w-full rounded-md border-0 px-3 py-2 text-sm shadow-xs ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600"
                        />
                    </label>
                    <label className="text-sm font-medium text-gray-700">
                        Przebieg pojazdu
                        <input
                            type="number"
                            min="0"
                            value={values.odo ?? ''}
                            onChange={event => setValues(current => ({ ...current, odo: event.target.value === '' ? null : Number(event.target.value) }))}
                            className="mt-1 block w-full rounded-md border-0 px-3 py-2 text-sm shadow-xs ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600"
                        />
                    </label>
                </div>

                <div className="space-y-2">
                    {checkboxItems.map(item => (
                        <label key={item.key} className="flex items-start gap-3 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700">
                            <input
                                type="checkbox"
                                checked={Boolean(values[item.key])}
                                onChange={event => setValues(current => ({ ...current, [item.key]: event.target.checked }))}
                                className="mt-0.5 size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                            />
                            <span>{item.label}</span>
                        </label>
                    ))}
                </div>

                <label className="block text-sm font-medium text-gray-700">
                    Uwagi z oględzin
                    <textarea
                        rows={3}
                        value={values.inspectionNotes || ''}
                        onChange={event => setValues(current => ({ ...current, inspectionNotes: event.target.value || null }))}
                        placeholder="Zakres uszkodzeń, uwagi do kosztorysu, dodatkowe informacje"
                        className="mt-1 block w-full rounded-md border-0 px-3 py-2 text-sm shadow-xs ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600"
                    />
                </label>

                <button
                    type="submit"
                    disabled={isSaving}
                    className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 disabled:cursor-wait disabled:opacity-60"
                >
                    {isSaving ? 'Zapisywanie…' : 'Zapisz oględziny'}
                </button>
            </form>

            <InspectionFindings workId={work.id} findings={findings} />

            <form ref={uploadFormRef} onSubmit={upload} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                <p className="text-sm font-semibold text-gray-900">Dokumentacja fotograficzna</p>
                <p className="mt-1 text-xs text-gray-500">
                    Zdjęcia są zapisywane w istniejących dokumentach sprawy. Dodano: {photoDocuments.length}.
                </p>
                <input
                    name="files"
                    type="file"
                    multiple
                    required
                    accept=".jpg,.jpeg,.png,.webp,.pdf"
                    className="mt-3 block w-full text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-white file:px-3 file:py-2 file:text-sm file:font-semibold file:text-indigo-700"
                />
                <button
                    type="submit"
                    disabled={isUploading}
                    className="mt-3 rounded-md bg-white px-3 py-2 text-sm font-semibold text-indigo-700 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-indigo-50 disabled:cursor-wait disabled:opacity-60"
                >
                    {isUploading ? 'Dodawanie…' : 'Dodaj zdjęcia'}
                </button>
            </form>

            {message && (
                <p role="status" className={`rounded-md px-3 py-2 text-sm ${message.error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                    {message.text}
                </p>
            )}
        </div>
    );
}
