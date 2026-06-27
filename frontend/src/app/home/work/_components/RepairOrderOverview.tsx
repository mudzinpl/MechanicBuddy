'use client'

import { query } from '@/_lib/client/query-api';
import { CheckCircleIcon, ClockIcon, CubeIcon, ExclamationTriangleIcon, WrenchScrewdriverIcon } from '@heroicons/react/20/solid';
import React from 'react';
import { getCommunicationCategoryLabel, IWorkCommunicationEntry } from '../communicationModel';
import { getDamageStatusLabel, IProduct, IWorkData } from '../model';

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

function formatCurrency(value?: number | null) {
  return typeof value === 'number'
    ? new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(value).replace(/\u00A0/g, ' ')
    : '';
}

function emptyState(text: string) {
  return <p className="rounded-md border border-dashed border-gray-200 px-3 py-4 text-sm text-gray-500">{text}</p>;
}

function getNextStep(work: IWorkData) {
  if (!work.audatexEstimateNumber) return 'Brakuje kosztorysu - nie można rozpocząć naprawy.';
  if (!work.insurerDecisionOn && work.damageStatus === 'approval_pending') return 'Następny krok: decyzja ubezpieczyciela.';
  if (work.damageStatus === 'parts_pending') return 'Następny krok: kompletacja części.';
  if (work.damageStatus === 'repair') return 'Następny krok: lakiernia albo montaż.';
  if (work.damageStatus === 'paint_shop') return 'Następny krok: montaż i kontrola jakości.';
  if (work.damageStatus === 'quality_control') return 'Następny krok: przygotowanie wydania.';
  if (work.damageStatus === 'ready_for_pickup') return 'Można przygotować wydanie pojazdu.';
  if (work.damageStatus === 'released') return 'Pojazd wydany klientowi.';
  return 'Następny krok: uzupełnienie danych i prowadzenie sprawy.';
}

export default function RepairOrderOverview({ work, products }: { work: IWorkData; products: IProduct[] }) {
  const [parts, setParts] = React.useState<WorkPartOrder[]>([]);
  const [tasks, setTasks] = React.useState<WorkTask[]>([]);
  const [checklist, setChecklist] = React.useState<ChecklistItem[]>([]);
  const [communication, setCommunication] = React.useState<IWorkCommunicationEntry[]>([]);

  React.useEffect(() => {
    query({ url: `work/${work.id}/part-orders`, method: 'GET', onSuccess: (result: WorkPartOrder[]) => setParts(result || []), onFailure: () => setParts([]) });
    query({ url: `work/${work.id}/tasks`, method: 'GET', onSuccess: (result: WorkTask[]) => setTasks(result || []), onFailure: () => setTasks([]) });
    query({ url: `work/${work.id}/quality-checklist`, method: 'GET', onSuccess: (result: ChecklistItem[]) => setChecklist(result || []), onFailure: () => setChecklist([]) });
    query({ url: `work/${work.id}/communication`, method: 'GET', onSuccess: (result: IWorkCommunicationEntry[]) => setCommunication(result || []), onFailure: () => setCommunication([]) });
  }, [work.id]);

  const activeStep = statusToStepIndex[work.damageStatus || 'new'] ?? 0;
  const progress = Math.round(((activeStep + 1) / repairSteps.length) * 100);
  const completedChecklist = checklist.filter(item => item.isCompleted).length;
  const estimatedRbg = (work.estimateLaborMechanicalRbg ?? 0) + (work.estimateLaborPaintRbg ?? 0);
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const remainingTasks = Math.max(tasks.length - completedTasks, 0);
  const latestNotes = [
    ...tasks.filter(task => task.comment).map(task => ({ id: `task-${task.id}`, title: task.title, text: task.comment || '' })),
    ...communication.slice(0, 3).map(entry => ({ id: `communication-${entry.id}`, title: getCommunicationCategoryLabel(entry.category), text: entry.note })),
  ].slice(0, 4);

  return (
    <section className="mb-6 space-y-5 rounded-lg border border-gray-200 bg-white p-4 shadow-xs">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900">Status naprawy</p>
          <h2 className="mt-1 text-xl font-semibold text-gray-900">{getDamageStatusLabel(work.damageStatus) || 'Brak statusu'}</h2>
          <p className="mt-1 text-sm text-gray-500">{getNextStep(work)}</p>
        </div>
        <div className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-600">
          <span className="font-semibold text-gray-900">Postęp:</span> {progress}%
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
          <ClockIcon className="size-5 text-gray-400" aria-hidden="true" />
          Etapy naprawy
        </div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
          {repairSteps.map((step, index) => {
            const completed = index < activeStep;
            const current = index === activeStep;
            return (
              <div key={step.key} className={`rounded-md border px-3 py-2 text-xs font-medium ${current ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : completed ? 'border-green-200 bg-green-50 text-green-700' : 'border-gray-200 bg-gray-50 text-gray-500'}`}>
                {step.label}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
            <WrenchScrewdriverIcon className="size-5 text-gray-400" aria-hidden="true" />
            Operacje naprawy
          </div>
          {products.length === 0 && tasks.length === 0 ? emptyState('Brak dodanych operacji naprawy.') : (
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
          {parts.length === 0 ? emptyState('Brak przypisanych części.') : (
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

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-md border border-gray-200 p-3">
          <p className="text-sm font-semibold text-gray-900">RBG</p>
          {estimatedRbg > 0 ? (
            <dl className="mt-2 space-y-1 text-sm text-gray-600">
              <div className="flex justify-between"><dt>Z kosztorysu</dt><dd>{estimatedRbg}</dd></div>
              <div className="flex justify-between"><dt>Wykonane</dt><dd>{completedTasks}</dd></div>
              <div className="flex justify-between"><dt>Pozostałe</dt><dd>{remainingTasks}</dd></div>
            </dl>
          ) : emptyState('Brak danych RBG.')}
        </div>

        <div className="rounded-md border border-gray-200 p-3 xl:col-span-2">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
            <CheckCircleIcon className="size-5 text-gray-400" aria-hidden="true" />
            Kontrola jakości
          </div>
          {checklist.length === 0 ? emptyState('Checklista jakości nie została jeszcze uzupełniona.') : (
            <div>
              <p className="mb-2 text-sm text-gray-600">Wykonano {completedChecklist} z {checklist.length} pozycji.</p>
              <div className="space-y-1">
                {checklist.slice(0, 6).map(item => (
                  <p key={item.id} className="text-sm text-gray-600">
                    <span className={item.isCompleted ? 'text-green-600' : 'text-gray-400'}>{item.isCompleted ? '✓' : '○'}</span>{' '}
                    {item.itemName}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
          <ExclamationTriangleIcon className="size-5 text-gray-400" aria-hidden="true" />
          Uwagi robocze
        </div>
        {latestNotes.length === 0 ? emptyState('Brak uwag roboczych.') : (
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
