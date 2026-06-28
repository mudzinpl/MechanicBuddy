'use client'

import { query } from '@/_lib/client/query-api';
import { CheckCircleIcon, ClockIcon, CubeIcon, ExclamationTriangleIcon, WrenchScrewdriverIcon } from '@heroicons/react/20/solid';
import React from 'react';
import { getCommunicationCategoryLabel, IWorkCommunicationEntry } from '../communicationModel';
import { IProduct, IWorkData, IWorkDocument } from '../model';

interface WorkPartOrder {
  id: string;
  partName: string;
  supplier?: string | null;
  status: string;
  deliveredOn?: string | null;
  notes?: string | null;
  sourceSystem?: string | null;
}

interface WorkTask {
  id: string;
  title: string;
  taskType: string;
  assignedEmployeeName?: string | null;
  status: string;
  comment?: string | null;
}

interface ChecklistItem {
  id: string;
  itemName: string;
  isCompleted: boolean;
  completedByEmployeeName?: string | null;
  completedOn?: string | null;
  notes?: string | null;
  sortOrder: number;
}

const repairSteps = [
  { key: 'intake', label: 'Przyjęcie' },
  { key: 'inspection_pending', label: 'Oględziny' },
  { key: 'estimate_sent', label: 'Kosztorys' },
  { key: 'approval_pending', label: 'Decyzja TU' },
  { key: 'parts_pending', label: 'Części' },
  { key: 'repair', label: 'Blacharnia' },
  { key: 'paint_shop', label: 'Lakiernia' },
  { key: 'assembly', label: 'Montaż' },
  { key: 'quality_control', label: 'Kontrola jakości' },
  { key: 'ready_for_pickup', label: 'Wydanie' },
] as const;

const statusToStepIndex: Record<string, number> = {
  new: 0,
  inspection_pending: 1,
  inspected: 1,
  estimate_preparing: 2,
  estimate_sent: 2,
  approval_pending: 3,
  accepted: 4,
  parts_pending: 4,
  repair: 5,
  paint_shop: 6,
  quality_control: 8,
  ready_for_pickup: 9,
  released: 9,
  settled: 9,
};

const partStatusLabels: Record<string, string> = {
  to_order: 'Do zamówienia',
  ordered: 'Zamówiona',
  in_delivery: 'W dostawie',
  delivered: 'Dostarczona',
  returned: 'Zwrócona',
  cancelled: 'Anulowana',
};

const taskStatusLabels: Record<string, string> = {
  new: 'Nowe',
  in_progress: 'W toku',
  on_hold: 'Wstrzymane',
  completed: 'Zakończone',
  cancelled: 'Anulowane',
};

const taskTypeLabels: Record<string, string> = {
  office: 'Biuro',
  inspection: 'Oględziny',
  estimate: 'Kosztorys',
  parts: 'Części',
  body_shop: 'Blacharnia',
  mechanic: 'Mechanika',
  paint_shop: 'Lakiernia',
  quality_control: 'Kontrola jakości',
  vehicle_release: 'Wydanie pojazdu',
  settlement: 'Rozliczenie',
  other: 'Inne',
};

const emptyQualityChecklist = [
  'Jazda próbna',
  'Oświetlenie',
  'Zdjęcia końcowe',
  'Diagnostyka',
  'ADAS / kalibracja',
  'Czystość pojazdu',
];

function formatCurrency(value?: number | null) {
  return typeof value === 'number'
    ? new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(value).replace(/\u00A0/g, ' ')
    : '';
}

function emptyState(title: string, description: string, children?: React.ReactNode) {
  return (
    <div className="rounded-md border border-dashed border-gray-200 bg-gray-50 px-3 py-4 text-sm">
      <p className="font-medium text-gray-700">{title}</p>
      <p className="mt-1 text-gray-500">{description}</p>
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}

function getReleaseBlockers(work: IWorkData, documents: IWorkDocument[], completedChecklist: number, checklistLength: number) {
  return [
    !work.insurerDecisionOn ? 'decyzji TU' : '',
    documents.length === 0 || !work.assignmentOfClaimSigned || !work.powerOfAttorneySigned ? 'dokumentów' : '',
    work.clientPaysVat && !work.paymentReceivedOn && work.settlementStatus !== 'settled' ? 'dopłaty' : '',
    checklistLength === 0 || completedChecklist < checklistLength ? 'kontroli jakości' : '',
  ].filter(Boolean);
}

function QualityCheckbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.currentTarget.checked)}
        className="size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
      />
      <span>{label}</span>
    </label>
  );
}

export default function RepairOrderOverview({ work, products }: { work: IWorkData; products: IProduct[] }) {
  const [parts, setParts] = React.useState<WorkPartOrder[]>([]);
  const [tasks, setTasks] = React.useState<WorkTask[]>([]);
  const [checklist, setChecklist] = React.useState<ChecklistItem[]>([]);
  const [communication, setCommunication] = React.useState<IWorkCommunicationEntry[]>([]);
  const [documents, setDocuments] = React.useState<IWorkDocument[]>([]);
  const [qualityState, setQualityState] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    query({ url: `work/${work.id}/part-orders`, method: 'GET', onSuccess: (result: WorkPartOrder[]) => setParts(result || []), onFailure: () => setParts([]) });
    query({ url: `work/${work.id}/tasks`, method: 'GET', onSuccess: (result: WorkTask[]) => setTasks(result || []), onFailure: () => setTasks([]) });
    query({ url: `work/${work.id}/quality-checklist`, method: 'GET', onSuccess: (result: ChecklistItem[]) => setChecklist(result || []), onFailure: () => setChecklist([]) });
    query({ url: `work/${work.id}/communication`, method: 'GET', onSuccess: (result: IWorkCommunicationEntry[]) => setCommunication(result || []), onFailure: () => setCommunication([]) });
    query({ url: `work/${work.id}/documents`, method: 'GET', onSuccess: (result: IWorkDocument[]) => setDocuments(result || []), onFailure: () => setDocuments([]) });
  }, [work.id]);

  React.useEffect(() => {
    const initialState: Record<string, boolean> = {};
    checklist.forEach(item => {
      initialState[item.id] = item.isCompleted;
    });
    emptyQualityChecklist.forEach(item => {
      initialState[item] = false;
    });
    setQualityState(initialState);
  }, [checklist]);

  const activeStep = statusToStepIndex[work.damageStatus || 'new'] ?? 0;
  const completedChecklist = checklist.length > 0
    ? checklist.filter(item => qualityState[item.id] ?? item.isCompleted).length
    : emptyQualityChecklist.filter(item => qualityState[item]).length;
  const checklistLength = checklist.length > 0 ? checklist.length : emptyQualityChecklist.length;
  const estimatedRbg = (work.estimateLaborMechanicalRbg ?? 0) + (work.estimateLaborPaintRbg ?? 0);
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const remainingTasks = Math.max(tasks.length - completedTasks, 0);
  const rbgProgress = estimatedRbg > 0 && completedTasks > 0 ? Math.min(100, Math.round((completedTasks / estimatedRbg) * 100)) : null;
  const releaseBlockers = getReleaseBlockers(work, documents, completedChecklist, checklistLength);
  const blockedStepKeys = new Set<string>();
  if (!work.audatexEstimateNumber) blockedStepKeys.add('estimate_sent');
  if (!work.insurerDecisionOn) blockedStepKeys.add('approval_pending');
  if (completedChecklist < checklistLength) blockedStepKeys.add('quality_control');
  if (documents.length === 0 || !work.assignmentOfClaimSigned || !work.powerOfAttorneySigned || releaseBlockers.includes('dopłaty')) blockedStepKeys.add('ready_for_pickup');
  const latestNotes = [
    ...tasks.filter(task => task.comment).map(task => ({ id: `task-${task.id}`, title: task.title, text: task.comment || '' })),
    ...communication.slice(0, 3).map(entry => ({ id: `communication-${entry.id}`, title: getCommunicationCategoryLabel(entry.category), text: entry.note })),
  ].slice(0, 4);

  return (
    <section className="mb-6 space-y-5 rounded-lg border border-gray-200 bg-white p-4 shadow-xs">
      {releaseBlockers.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          <div className="flex items-start gap-2">
            <ExclamationTriangleIcon className="mt-0.5 size-5 shrink-0 text-red-500" aria-hidden="true" />
            <div>
              <p className="font-semibold">Wydanie zablokowane</p>
              <p className="mt-1 text-red-800">Brakuje:</p>
              <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-red-800">
                {releaseBlockers.map(item => <li key={item}>- {item}</li>)}
              </ul>
            </div>
          </div>
        </div>
      )}

      <details className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
        <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-gray-900">
          <ClockIcon className="size-5 text-gray-400" aria-hidden="true" />
          Techniczne etapy naprawy
          <span className="ml-auto text-xs font-medium text-gray-400 group-open:hidden">▶</span>
        </summary>
        <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-5">
          {repairSteps.map((step, index) => {
            const completed = index < activeStep;
            const current = index === activeStep;
            const problem = blockedStepKeys.has(step.key) && index >= activeStep;
            const className = problem
              ? 'border-red-200 bg-red-50 text-red-700'
              : current
                ? 'border-blue-200 bg-blue-50 text-blue-700'
                : completed
                  ? 'border-green-200 bg-green-50 text-green-700'
                  : 'border-gray-200 bg-white text-gray-500';
            return (
              <div key={step.key} className={`rounded-md border px-3 py-2 text-xs font-medium ${className}`}>
                {step.label}
              </div>
            );
          })}
        </div>
      </details>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
            <WrenchScrewdriverIcon className="size-5 text-gray-400" aria-hidden="true" />
            Operacje naprawy
          </div>
          {products.length === 0 && tasks.length === 0 ? emptyState('Brak dodanych operacji naprawy.', 'Dodaj operacje z kosztorysu lub utwórz zadanie dla mechanika.') : (
            <div className="space-y-2">
              {products.slice(0, 5).map(product => (
                <div key={`product-${product.id}`} className="rounded-md border border-gray-200 p-3 text-sm">
                  <p className="font-medium text-gray-900">{product.name || 'Pozycja bez nazwy'}</p>
                  <p className="text-gray-500">Usługa / część · {product.quantity ?? 1} {product.unit || 'szt.'} · {formatCurrency(product.price)}</p>
                </div>
              ))}
              {tasks.slice(0, 5).map(task => (
                <div key={`task-${task.id}`} className="rounded-md border border-gray-200 p-3 text-sm">
                  <p className="font-medium text-gray-900">{task.title}</p>
                  <p className="text-gray-500">{taskTypeLabels[task.taskType] ?? task.taskType} · {task.assignedEmployeeName || 'Bez osoby'} · {taskStatusLabels[task.status] ?? task.status}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
            <CubeIcon className="size-5 text-gray-400" aria-hidden="true" />
            Części
          </div>
          {parts.length === 0 ? emptyState('Brak przypisanych części.', 'Dodaj części wymagane do naprawy albo sprawdź, czy kosztorys zawiera pozycje częściowe.') : (
            <div className="space-y-2">
              {parts.slice(0, 6).map(part => (
                <div key={part.id} className="rounded-md border border-gray-200 p-3 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium text-gray-900">{part.partName}</p>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">{partStatusLabels[part.status] ?? part.status}</span>
                  </div>
                  <p className="mt-1 text-gray-500">{[part.supplier, part.sourceSystem].filter(Boolean).join(' · ') || 'Brak źródła'}</p>
                  {part.notes && <p className="mt-1 text-gray-500">{part.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <details className="rounded-md border border-gray-200 p-3">
        <summary className="cursor-pointer list-none text-sm font-semibold text-gray-900">
          Szczegóły kosztorysu / RBG
        </summary>
        {estimatedRbg > 0 ? (
          <div className="mt-3 space-y-3">
            <dl className="space-y-1 text-sm text-gray-600">
              <div className="flex justify-between"><dt>RBG z kosztorysu</dt><dd>{estimatedRbg}</dd></div>
              <div className="flex justify-between"><dt>RBG wykonane</dt><dd>{completedTasks}</dd></div>
              <div className="flex justify-between"><dt>RBG pozostałe</dt><dd>{remainingTasks}</dd></div>
            </dl>
            {rbgProgress !== null && (
              <div>
                <div className="mb-1 flex justify-between text-xs text-gray-500">
                  <span>Postęp RBG</span>
                  <span>{rbgProgress}%</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100">
                  <div className="h-2 rounded-full bg-blue-500" style={{ width: `${rbgProgress}%` }} />
                </div>
              </div>
            )}
          </div>
        ) : <div className="mt-3">{emptyState('Brak danych RBG.', 'Uzupełnij RBG w kosztorysie, żeby kierownik widział zakres i pozostałą pracę.')}</div>}
      </details>

      <div className="rounded-md border border-gray-200 p-3">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
          <CheckCircleIcon className="size-5 text-gray-400" aria-hidden="true" />
          Kontrola jakości
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {(checklist.length > 0 ? checklist : emptyQualityChecklist.map((item, index) => ({
            id: item,
            itemName: item,
            isCompleted: false,
            sortOrder: index,
          } as ChecklistItem))).map(item => (
            <QualityCheckbox
              key={item.id}
              label={item.itemName}
              checked={qualityState[item.id] ?? item.isCompleted}
              onChange={(checked) => setQualityState(previous => ({ ...previous, [item.id]: checked }))}
            />
          ))}
        </div>
        {checklist.length === 0 && <p className="mt-3 text-xs text-gray-500">Lista działa lokalnie w przeglądarce i nie zapisuje zmian w systemie.</p>}
      </div>

      <div>
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
          <ExclamationTriangleIcon className="size-5 text-gray-400" aria-hidden="true" />
          Uwagi robocze
        </div>
        {latestNotes.length === 0 ? emptyState('Brak uwag roboczych.', 'Dodaj notatkę komunikacji albo komentarz do zadania, jeśli naprawa wymaga dodatkowego wyjaśnienia.') : (
          <div className="space-y-2">
            {latestNotes.map(note => (
              <div key={note.id} className="rounded-md bg-gray-50 px-3 py-2 text-sm">
                <p className="font-medium text-gray-900">{note.title}</p>
                <p className="mt-1 text-gray-600">{note.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
