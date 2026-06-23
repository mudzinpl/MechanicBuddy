'use client'

import { query } from '@/_lib/client/query-api';
import FormTextArea from '@/_components/FormTextArea';
import PrimaryButton from '@/_components/PrimaryButton';
import { CheckCircleIcon } from '@heroicons/react/20/solid';
import React from 'react';

interface ChecklistItem {
  id: string;
  workId: string;
  itemKey: string;
  groupKey: string;
  itemName: string;
  description?: string | null;
  isCompleted: boolean;
  completedByEmployeeName?: string | null;
  completedOn?: string | null;
  notes?: string | null;
  sortOrder: number;
}

const groups = [
  { key: 'vehicle_intake', label: 'Przyjęcie pojazdu' },
  { key: 'inspection', label: 'Oględziny' },
  { key: 'documents', label: 'Dokumenty' },
  { key: 'parts', label: 'Części' },
  { key: 'body_repair', label: 'Naprawa blacharska' },
  { key: 'mechanical_repair', label: 'Naprawa mechaniczna' },
  { key: 'painting', label: 'Lakierowanie' },
  { key: 'assembly', label: 'Składanie pojazdu' },
  { key: 'washing', label: 'Mycie / przygotowanie' },
  { key: 'final_control', label: 'Kontrola końcowa' },
  { key: 'vehicle_release', label: 'Wydanie pojazdu' },
] as const;

function formatDateTime(value?: string | null) {
  return value ? new Intl.DateTimeFormat('pl-PL', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)) : '';
}

export default function QualityChecklist({ workId }: { workId: string }) {
  const [items, setItems] = React.useState<ChecklistItem[]>([]);
  const [notes, setNotes] = React.useState<Record<string, string>>({});
  const [savingId, setSavingId] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    query({
      url: `work/${workId}/quality-checklist`,
      method: 'GET',
      onSuccess: (result: ChecklistItem[]) => {
        setItems(result || []);
        setNotes(Object.fromEntries((result || []).map(item => [item.id, item.notes || ''])));
      },
      onFailure: () => setMessage('Nie udało się załadować checklisty.'),
    });
  }, [workId]);

  React.useEffect(() => {
    load();
  }, [load]);

  const save = (item: ChecklistItem, isCompleted: boolean) => {
    setSavingId(item.id);
    setMessage(null);
    query({
      url: `work/${workId}/quality-checklist/${item.id}`,
      method: 'PUT',
      body: {
        isCompleted,
        notes: notes[item.id] || null,
      },
      onSuccess: () => {
        setSavingId(null);
        setMessage('Checklista została zaktualizowana.');
        load();
      },
      onFailure: ({ text }) => {
        setSavingId(null);
        setMessage(text || 'Nie udało się zapisać pozycji checklisty.');
      },
    });
  };

  const completed = items.filter(item => item.isCompleted).length;
  const total = items.length;

  return (
    <section className="border-t border-gray-900/5 px-5 py-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CheckCircleIcon className="size-5 text-gray-400" aria-hidden="true" />
          <h2 className="font-semibold text-gray-900">Checklista i kontrola jakości</h2>
        </div>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">{completed}/{total}</span>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-gray-500">Brak pozycji checklisty.</p>
      ) : (
        <div className="space-y-5">
          {groups.map(group => {
            const groupItems = items.filter(item => item.groupKey === group.key);
            if (groupItems.length === 0) return null;

            return (
              <div key={group.key}>
                <h3 className="mb-2 text-sm font-semibold text-gray-900">{group.label}</h3>
                <div className="space-y-3">
                  {groupItems.map(item => (
                    <div key={item.id} className="rounded-md border border-gray-200 p-3 text-sm text-gray-600">
                      <label className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={item.isCompleted}
                          onChange={(event) => save(item, event.currentTarget.checked)}
                          disabled={savingId === item.id}
                          className="mt-1 size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        />
                        <span>
                          <span className="block font-semibold text-gray-900">{item.itemName}</span>
                          {item.description && <span className="block text-gray-500">{item.description}</span>}
                        </span>
                      </label>

                      {item.isCompleted && <p className="mt-2 text-xs text-gray-500">
                        Wykonane przez: {item.completedByEmployeeName || 'Nieznany'}{item.completedOn ? ` · ${formatDateTime(item.completedOn)}` : ''}
                      </p>}

                      <div className="mt-3">
                        <FormTextArea
                          name={`notes-${item.id}`}
                          label="Uwagi"
                          rows={2}
                          value={notes[item.id] || ''}
                          onInputChange={(event) => setNotes(current => ({ ...current, [item.id]: event.target.value }))}
                        />
                        <div className="mt-2">
                          <PrimaryButton id={`saveChecklist-${item.id}`} disabled={savingId === item.id} onClick={(event) => {
                            event.preventDefault();
                            save(item, item.isCompleted);
                          }}>
                            {savingId === item.id ? 'Zapisywanie...' : 'Zapisz uwagi'}
                          </PrimaryButton>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {message && <p className="mt-4 text-sm text-gray-500">{message}</p>}
    </section>
  );
}
