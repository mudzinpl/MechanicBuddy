'use client'

import { query } from '@/_lib/client/query-api';
import FormInput from '@/_components/FormInput';
import FormLabel from '@/_components/FormLabel';
import FormTextArea from '@/_components/FormTextArea';
import PrimaryButton from '@/_components/PrimaryButton';
import Select from '@/_components/Select';
import { ClipboardDocumentListIcon } from '@heroicons/react/20/solid';
import React from 'react';
import { IMechanic } from '../model';

interface WorkTask {
  id: string;
  workId: string;
  title: string;
  description?: string | null;
  taskType: string;
  assignedEmployeeId?: string | null;
  assignedEmployeeName?: string | null;
  status: string;
  priority: string;
  dueOn?: string | null;
  completedOn?: string | null;
  comment?: string | null;
  createdByEmployeeName?: string | null;
}

const taskTypes = [
  { value: 'office', label: 'Biuro' },
  { value: 'inspection', label: 'Oględziny' },
  { value: 'estimate', label: 'Kosztorys' },
  { value: 'parts', label: 'Części' },
  { value: 'body_shop', label: 'Blacharnia' },
  { value: 'mechanic', label: 'Mechanika' },
  { value: 'paint_shop', label: 'Lakiernia' },
  { value: 'quality_control', label: 'Kontrola jakości' },
  { value: 'vehicle_release', label: 'Wydanie pojazdu' },
  { value: 'settlement', label: 'Rozliczenie' },
  { value: 'other', label: 'Inne' },
] as const;

const taskStatuses = [
  { value: 'new', label: 'Nowe' },
  { value: 'in_progress', label: 'W toku' },
  { value: 'on_hold', label: 'Wstrzymane' },
  { value: 'completed', label: 'Zakończone' },
  { value: 'cancelled', label: 'Anulowane' },
] as const;

const priorities = [
  { value: 'low', label: 'Niski' },
  { value: 'normal', label: 'Normalny' },
  { value: 'high', label: 'Wysoki' },
  { value: 'urgent', label: 'Pilne' },
] as const;

function label<T extends readonly { value: string; label: string }[]>(items: T, value?: string | null) {
  return items.find(item => item.value === value)?.label ?? value ?? '';
}

function formatDate(value?: string | null) {
  return value ? new Intl.DateTimeFormat('pl-PL').format(new Date(value)) : '';
}

function toDateInputValue(value?: string | null) {
  return value ? value.slice(0, 10) : '';
}

export default function WorkTasks({ workId }: { workId: string }) {
  const [tasks, setTasks] = React.useState<WorkTask[]>([]);
  const [employees, setEmployees] = React.useState<IMechanic[]>([]);
  const [editing, setEditing] = React.useState<WorkTask | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  const loadTasks = React.useCallback(() => {
    query({
      url: `work/${workId}/tasks`,
      method: 'GET',
      onSuccess: (result: WorkTask[]) => setTasks(result || []),
      onFailure: () => setMessage('Nie udało się załadować zadań.'),
    });
  }, [workId]);

  React.useEffect(() => {
    loadTasks();
    query({
      url: 'employees',
      method: 'GET',
      onSuccess: (result: IMechanic[]) => setEmployees(result || []),
      onFailure: () => setEmployees([]),
    });
  }, [loadTasks]);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const body = {
      title: formData.get('title')?.toString() || '',
      description: formData.get('description')?.toString() || null,
      taskType: formData.get('taskType')?.toString() || 'other',
      assignedEmployeeId: formData.get('assignedEmployeeId')?.toString() || null,
      status: formData.get('status')?.toString() || 'new',
      priority: formData.get('priority')?.toString() || 'normal',
      dueOn: formData.get('dueOn')?.toString() || null,
      completedOn: formData.get('completedOn')?.toString() || null,
      comment: formData.get('comment')?.toString() || null,
    };

    if (!body.title.trim()) {
      setMessage('Podaj tytuł zadania.');
      return;
    }

    setIsSaving(true);
    setMessage(null);
    query({
      url: editing ? `work/${workId}/tasks/${editing.id}` : `work/${workId}/tasks`,
      method: editing ? 'PUT' : 'POST',
      body,
      onSuccess: () => {
        setIsSaving(false);
        setEditing(null);
        setMessage(editing ? 'Zadanie zostało zaktualizowane.' : 'Zadanie zostało dodane.');
        loadTasks();
      },
      onFailure: () => {
        setIsSaving(false);
        setMessage('Nie udało się zapisać zadania.');
      },
    });
  };

  const remove = (task: WorkTask) => {
    query({
      url: `work/${workId}/tasks/${task.id}`,
      method: 'DELETE',
      onSuccess: () => {
        setMessage('Zadanie zostało usunięte.');
        loadTasks();
      },
      onFailure: () => setMessage('Nie udało się usunąć zadania.'),
    });
  };

  return (
    <section className="border-t border-gray-900/5 px-5 py-5">
      <div className="mb-4 flex items-center gap-2">
        <ClipboardDocumentListIcon className="size-5 text-gray-400" aria-hidden="true" />
        <h2 className="font-semibold text-gray-900">Zadania</h2>
      </div>

      {tasks.length === 0 ? (
        <p className="mb-4 text-sm text-gray-500">Brak zadań w zleceniu.</p>
      ) : (
        <div className="mb-5 space-y-3">
          {tasks.map(task => (
            <div key={task.id} className="rounded-md border border-gray-200 p-3 text-sm text-gray-600">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900">{task.title}</p>
                  <p>{label(taskTypes, task.taskType)} · {task.assignedEmployeeName || 'Bez osoby przypisanej'}</p>
                </div>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">{label(taskStatuses, task.status)}</span>
              </div>
              {task.description && <p className="mt-2 whitespace-pre-line">{task.description}</p>}
              <div className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
                <p>Priorytet: {label(priorities, task.priority)}</p>
                <p>Termin: {formatDate(task.dueOn)}</p>
                <p>Zakończono: {formatDate(task.completedOn)}</p>
                <p>Utworzył: {task.createdByEmployeeName || 'Nieznany'}</p>
              </div>
              {task.comment && <p className="mt-2 whitespace-pre-line">Komentarz: {task.comment}</p>}
              <div className="mt-3 flex gap-2">
                <button type="button" className="text-sm font-medium text-indigo-600" onClick={() => setEditing(task)}>Edytuj</button>
                <button type="button" className="text-sm font-medium text-red-600" onClick={() => remove(task)}>Usuń</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <form key={editing?.id ?? 'new'} onSubmit={onSubmit} className="space-y-3 rounded-md bg-gray-50 p-3">
        <p className="text-sm font-semibold text-gray-900">{editing ? 'Edytuj zadanie' : 'Dodaj zadanie'}</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormInput name="title" label="Tytuł" defaultValue={editing?.title ?? ''}></FormInput>
          <div>
            <FormLabel name="taskType" label="Typ zadania"></FormLabel>
            <div className="mt-2 grid grid-cols-1">
              <Select name="taskType" defaultValue={editing?.taskType ?? 'other'}>
                {taskTypes.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
              </Select>
            </div>
          </div>
          <div>
            <FormLabel name="assignedEmployeeId" label="Osoba przypisana"></FormLabel>
            <div className="mt-2 grid grid-cols-1">
              <Select name="assignedEmployeeId" defaultValue={editing?.assignedEmployeeId ?? ''}>
                <option value="">Bez osoby przypisanej</option>
                {employees.map(employee => <option key={employee.id} value={employee.id}>{employee.name}</option>)}
              </Select>
            </div>
          </div>
          <div>
            <FormLabel name="status" label="Status"></FormLabel>
            <div className="mt-2 grid grid-cols-1">
              <Select name="status" defaultValue={editing?.status ?? 'new'}>
                {taskStatuses.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
              </Select>
            </div>
          </div>
          <div>
            <FormLabel name="priority" label="Priorytet"></FormLabel>
            <div className="mt-2 grid grid-cols-1">
              <Select name="priority" defaultValue={editing?.priority ?? 'normal'}>
                {priorities.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
              </Select>
            </div>
          </div>
          <FormInput name="dueOn" type="date" label="Termin wykonania" defaultValue={toDateInputValue(editing?.dueOn)}></FormInput>
          <FormInput name="completedOn" type="date" label="Data zakończenia" defaultValue={toDateInputValue(editing?.completedOn)}></FormInput>
          <div className="sm:col-span-2">
            <FormTextArea name="description" label="Opis" rows={3} defaultValue={editing?.description ?? ''}></FormTextArea>
          </div>
          <div className="sm:col-span-2">
            <FormTextArea name="comment" label="Komentarz" rows={3} defaultValue={editing?.comment ?? ''}></FormTextArea>
          </div>
        </div>
        {message && <p className="text-sm text-gray-500">{message}</p>}
        <div className="flex items-center gap-3">
          <PrimaryButton id="btnWorkTask" disabled={isSaving}>{isSaving ? 'Zapisywanie...' : editing ? 'Zapisz zadanie' : 'Dodaj zadanie'}</PrimaryButton>
          {editing && <button type="button" className="text-sm font-medium text-gray-600" onClick={() => setEditing(null)}>Anuluj edycję</button>}
        </div>
      </form>
    </section>
  );
}
