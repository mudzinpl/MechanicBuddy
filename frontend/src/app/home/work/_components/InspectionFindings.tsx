'use client'

import {
    addInspectionFinding,
    deleteInspectionFinding,
    updateInspectionFinding,
} from '../actions/inspectionFindings';
import { IInspectionFinding } from '../model';
import { useRouter } from 'next/navigation';
import React from 'react';

const sides = [
    { value: 'not_applicable', label: 'Nie dotyczy' },
    { value: 'front', label: 'Przód' },
    { value: 'rear', label: 'Tył' },
    { value: 'left', label: 'Lewa strona' },
    { value: 'right', label: 'Prawa strona' },
    { value: 'center', label: 'Środek' },
] as const;

const damageTypes = [
    { value: 'dent', label: 'Wgniecenie' },
    { value: 'scratch', label: 'Zarysowanie' },
    { value: 'crack', label: 'Pęknięcie' },
    { value: 'deformation', label: 'Odkształcenie' },
    { value: 'broken', label: 'Złamane / rozbite' },
    { value: 'missing', label: 'Brak elementu' },
    { value: 'other', label: 'Inne' },
] as const;

const actions = [
    { value: 'repair', label: 'Naprawa' },
    { value: 'replace', label: 'Wymiana' },
    { value: 'paint', label: 'Lakierowanie' },
    { value: 'polish', label: 'Polerowanie' },
    { value: 'diagnose', label: 'Dalsza diagnostyka' },
    { value: 'none', label: 'Bez działania' },
] as const;

const emptyFinding = {
    elementName: '',
    vehicleSide: 'not_applicable',
    damageType: 'other',
    recommendedAction: 'repair',
    notes: '',
};

function getLabel(items: readonly { value: string; label: string }[], value: string) {
    return items.find(item => item.value === value)?.label ?? value;
}

export default function InspectionFindings({
    workId,
    findings,
}: {
    workId: string;
    findings: IInspectionFinding[];
}) {
    const router = useRouter();
    const [editing, setEditing] = React.useState<IInspectionFinding | null>(null);
    const [form, setForm] = React.useState(emptyFinding);
    const [isSaving, setIsSaving] = React.useState(false);
    const [message, setMessage] = React.useState<string | null>(null);

    const updateForm = (name: keyof typeof emptyFinding, value: string) => {
        setForm(current => ({ ...current, [name]: value }));
    };

    const reset = () => {
        setEditing(null);
        setForm(emptyFinding);
    };

    const edit = (item: IInspectionFinding) => {
        setEditing(item);
        setForm({
            elementName: item.elementName,
            vehicleSide: item.vehicleSide,
            damageType: item.damageType,
            recommendedAction: item.recommendedAction,
            notes: item.notes || '',
        });
    };

    const save = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!form.elementName.trim()) {
            setMessage('Podaj nazwę uszkodzonego elementu.');
            return;
        }

        setIsSaving(true);
        setMessage(null);
        const body = { ...form, notes: form.notes.trim() || null };
        (async () => {
            try {
                if (editing) await updateInspectionFinding(workId, editing.id, body);
                else await addInspectionFinding(workId, body);
                setIsSaving(false);
                setMessage(editing ? 'Ustalenie zostało zaktualizowane.' : 'Uszkodzenie zostało dodane.');
                reset();
                router.refresh();
            } catch (error) {
                console.error(error);
                setIsSaving(false);
                setMessage('Nie udało się zapisać uszkodzenia.');
            }
        })();
    };

    const remove = (item: IInspectionFinding) => {
        if (!window.confirm(`Usunąć z listy: ${item.elementName}?`)) return;
        (async () => {
            try {
                await deleteInspectionFinding(workId, item.id);
                setMessage('Uszkodzenie zostało usunięte.');
                router.refresh();
            } catch (error) {
                console.error(error);
                setMessage('Nie udało się usunąć uszkodzenia.');
            }
        })();
    };

    const inputClass = 'mt-1 block w-full rounded-md border-0 bg-white px-3 py-2 text-sm shadow-xs ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600';

    return (
        <section className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <div>
                <h3 className="text-sm font-semibold text-gray-900">Zakres uszkodzeń</h3>
                <p className="mt-1 text-xs text-gray-500">Lista ustaleń z oględzin. Ceny i pozycje kosztorysu uzupełnimy w kolejnym etapie.</p>
            </div>

            {findings.length === 0 ? (
                <p className="mt-3 rounded-md border border-dashed border-gray-300 bg-white px-3 py-4 text-sm text-gray-500">
                    Brak zapisanych uszkodzeń.
                </p>
            ) : (
                <ul className="mt-3 space-y-2">
                    {findings.map(item => (
                        <li key={item.id} className="rounded-md border border-gray-200 bg-white p-3 text-sm">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="font-semibold text-gray-900">{item.elementName}</p>
                                    <p className="mt-1 text-gray-600">
                                        {getLabel(sides, item.vehicleSide)} · {getLabel(damageTypes, item.damageType)} · {getLabel(actions, item.recommendedAction)}
                                    </p>
                                    {item.notes && <p className="mt-2 whitespace-pre-line text-gray-600">{item.notes}</p>}
                                </div>
                                <div className="flex shrink-0 gap-2">
                                    <button type="button" onClick={() => edit(item)} className="text-xs font-semibold text-indigo-600">Edytuj</button>
                                    <button type="button" onClick={() => remove(item)} className="text-xs font-semibold text-red-600">Usuń</button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            <form onSubmit={save} className="mt-4 space-y-3">
                <p className="text-sm font-semibold text-gray-900">{editing ? 'Edytuj ustalenie' : 'Dodaj uszkodzenie'}</p>
                <label className="block text-sm font-medium text-gray-700">
                    Element
                    <input
                        value={form.elementName}
                        onChange={event => updateForm('elementName', event.target.value)}
                        placeholder="np. zderzak przedni, błotnik lewy"
                        className={inputClass}
                    />
                </label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Strona pojazdu
                        <select value={form.vehicleSide} onChange={event => updateForm('vehicleSide', event.target.value)} className={inputClass}>
                            {sides.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
                        </select>
                    </label>
                    <label className="block text-sm font-medium text-gray-700">
                        Rodzaj uszkodzenia
                        <select value={form.damageType} onChange={event => updateForm('damageType', event.target.value)} className={inputClass}>
                            {damageTypes.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
                        </select>
                    </label>
                    <label className="block text-sm font-medium text-gray-700 sm:col-span-2">
                        Zalecenie
                        <select value={form.recommendedAction} onChange={event => updateForm('recommendedAction', event.target.value)} className={inputClass}>
                            {actions.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
                        </select>
                    </label>
                </div>
                <label className="block text-sm font-medium text-gray-700">
                    Uwagi do elementu
                    <textarea
                        rows={2}
                        value={form.notes}
                        onChange={event => updateForm('notes', event.target.value)}
                        className={inputClass}
                    />
                </label>
                <div className="flex items-center gap-3">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-indigo-700 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-indigo-50 disabled:cursor-wait disabled:opacity-60"
                    >
                        {isSaving ? 'Zapisywanie…' : editing ? 'Zapisz zmianę' : 'Dodaj do listy'}
                    </button>
                    {editing && (
                        <button type="button" onClick={reset} className="text-sm font-semibold text-gray-600">
                            Anuluj
                        </button>
                    )}
                </div>
            </form>

            {message && <p role="status" className="mt-3 rounded-md bg-white px-3 py-2 text-sm text-gray-600">{message}</p>}
        </section>
    );
}
