'use client'

import { query } from '@/_lib/client/query-api';
import { CheckCircleIcon, ClockIcon, CubeIcon, ExclamationTriangleIcon, WrenchScrewdriverIcon } from '@heroicons/react/20/solid';
import React from 'react';
import { getCommunicationCategoryLabel, IWorkCommunicationEntry } from '../communicationModel';
import { getDamageStatusLabel, IProduct, IWorkData, IWorkDocument } from '../model';

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

interface FlowAlert {
  label: string;
  description: string;
  tone: 'red' | 'amber' | 'blue' | 'gray';
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
  'Diagnostyka',
  'Oświetlenie',
  'ADAS / kalibracja',
  'Zdjęcia końcowe',
  'Czystość pojazdu',
];

const flowAlertClasses = {
  red: 'border-red-200 bg-red-50 text-red-900',
  amber: 'border-amber-200 bg-amber-50 text-amber-900',
  blue: 'border-blue-200 bg-blue-50 text-blue-900',
  gray: 'border-gray-200 bg-gray-50 text-gray-800',
} as const;

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

function getReleaseNextStep(missingItems: string[]) {
  if (missingItems.includes('brak dokumentów') || missingItems.includes('brak cesji') || missingItems.includes('brak pełnomocnictwa')) {
    return 'Uzupełnij dokumentację.';
  }

  if (missingItems.includes('brak kontroli jakości')) {
    return 'Wykonaj kontrolę jakości.';
  }

  if (missingItems.includes('brak kosztorysu')) {
    return 'Uzupełnij kosztorys.';
  }

  if (missingItems.includes('brak decyzji TU')) {
    return 'Uzyskaj decyzję ubezpieczyciela.';
  }

  if (missingItems.includes('nierozliczona dopłata')) {
    return 'Sprawdź rozliczenie dopłaty.';
  }

  return 'Przygotuj protokół wydania.';
}

function daysSince(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
}

function buildFlowAlerts(work: IWorkData, parts: WorkPartOrder[], documents: IWorkDocument[], communication: IWorkCommunicationEntry[]) {
  const alerts: FlowAlert[] = [];
  const sentEstimateDays = daysSince(work.estimateSentOn);
  const latestContactDays = communication.length > 0
    ? Math.min(...communication.map(entry => daysSince(entry.occurredOn || entry.createdOn)).filter((value): value is number => value !== null))
    : null;
  const needsParts = ['accepted', 'parts_pending', 'repair', 'paint_shop', 'quality_control'].includes(work.damageStatus || '') || work.estimateStatus === 'accepted' || Boolean(work.estimateAcceptedOn);
  const readyToRelease = ['ready_for_pickup', 'released', 'settled'].includes(work.damageStatus || '');

  if (latestContactDays !== null && latestContactDays > 7) {
    alerts.push({ label: 'Brak kontaktu z klientem', description: `Ostatni kontakt zapisano ${latestContactDays} dni temu.`, tone: 'amber' });
  }

  if (needsParts && parts.length === 0) {
    alerts.push({ label: 'Brak zamówionych części', description: 'Sprawa wygląda na gotową do etapu części, ale nie ma przypisanych zamówień.', tone: 'amber' });
  }

  if (sentEstimateDays !== null && sentEstimateDays > 3 && !work.insurerDecisionOn && !work.estimateAcceptedOn) {
    alerts.push({ label: 'Brak decyzji TU > 3 dni', description: `Kosztorys wysłano ${sentEstimateDays} dni temu.`, tone: 'red' });
  }

  if (readyToRelease) {
    alerts.push({ label: 'Gotowe do wydania', description: 'Status sprawy wskazuje przygotowanie wydania albo zakończenie naprawy.', tone: 'blue' });
  }

  if (!work.assignmentOfClaimSigned) {
    alerts.push({ label: 'Brak cesji', description: 'Uzupełnij dokument formalny przed zamknięciem sprawy.', tone: 'amber' });
  }

  if (!work.powerOfAttorneySigned) {
    alerts.push({ label: 'Brak pełnomocnictwa', description: 'Sprawdź komplet dokumentów do obsługi szkody.', tone: 'amber' });
  }

  if (documents.length === 0) {
    alerts.push({ label: 'Brak dokumentów', description: 'Do sprawy nie dodano jeszcze dokumentów szkody.', tone: 'amber' });
  }

  return alerts;
}

function FlowAlertsPanel({ alerts }: { alerts: FlowAlert[] }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-xs">
      <div className="mb-3 flex items-center gap-2">
        <ExclamationTriangleIcon className="size-5 text-amber-500" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold text-gray-900">Przepływ sprawy</p>
          <p className="text-xs text-gray-500">Proste alerty na podstawie danych zlecenia.</p>
        </div>
      </div>
      {alerts.length === 0 ? (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm font-medium text-green-700">Nie wykryto prostych blokad przepływu sprawy.</p>
      ) : (
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {alerts.slice(0, 6).map(alert => (
            <div key={`${alert.label}-${alert.description}`} className={`rounded-md border px-3 py-2 text-sm ${flowAlertClasses[alert.tone]}`}>
              <p className="font-semibold">{alert.label}</p>
              <p className="mt-1 text-xs opacity-80">{alert.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function RepairOrderOverview({ work, products }: { work: IWorkData; products: IProduct[] }) {
  const [parts, setParts] = React.useState<WorkPartOrder[]>([]);
  const [tasks, setTasks] = React.useState<WorkTask[]>([]);
  const [checklist, setChecklist] = React.useState<ChecklistItem[]>([]);
  const [communication, setCommunication] = React.useState<IWorkCommunicationEntry[]>([]);
  const [documents, setDocuments] = React.useState<IWorkDocument[]>([]);

  React.useEffect(() => {
    query({ url: `work/${work.id}/part-orders`, method: 'GET', onSuccess: (result: WorkPartOrder[]) => setParts(result || []), onFailure: () => setParts([]) });
    query({ url: `work/${work.id}/tasks`, method: 'GET', onSuccess: (result: WorkTask[]) => setTasks(result || []), onFailure: () => setTasks([]) });
    query({ url: `work/${work.id}/quality-checklist`, method: 'GET', onSuccess: (result: ChecklistItem[]) => setChecklist(result || []), onFailure: () => setChecklist([]) });
    query({ url: `work/${work.id}/communication`, method: 'GET', onSuccess: (result: IWorkCommunicationEntry[]) => setCommunication(result || []), onFailure: () => setCommunication([]) });
    query({ url: `work/${work.id}/documents`, method: 'GET', onSuccess: (result: IWorkDocument[]) => setDocuments(result || []), onFailure: () => setDocuments([]) });
  }, [work.id]);

  const activeStep = statusToStepIndex[work.damageStatus || 'new'] ?? 0;
  const progress = Math.round(((activeStep + 1) / repairSteps.length) * 100);
  const completedChecklist = checklist.filter(item => item.isCompleted).length;
  const estimatedRbg = (work.estimateLaborMechanicalRbg ?? 0) + (work.estimateLaborPaintRbg ?? 0);
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const remainingTasks = Math.max(tasks.length - completedTasks, 0);
  const rbgProgress = estimatedRbg > 0 && completedTasks > 0 ? Math.min(100, Math.round((completedTasks / estimatedRbg) * 100)) : null;
  const releaseMissingItems = [
    !work.assignmentOfClaimSigned ? 'brak cesji' : '',
    !work.powerOfAttorneySigned ? 'brak pełnomocnictwa' : '',
    !work.audatexEstimateNumber ? 'brak kosztorysu' : '',
    !work.insurerDecisionOn ? 'brak decyzji TU' : '',
    documents.length === 0 ? 'brak dokumentów' : '',
    checklist.length === 0 || completedChecklist < checklist.length ? 'brak kontroli jakości' : '',
    work.clientPaysVat && !work.paymentReceivedOn && work.settlementStatus !== 'settled' ? 'nierozliczona dopłata' : '',
  ].filter(Boolean);
  const hasHardReleaseBlocker = !work.audatexEstimateNumber || !work.insurerDecisionOn || checklist.length === 0 || completedChecklist < checklist.length;
  const releaseReadiness = !work.damageStatus
    ? {
        label: 'Nie można jeszcze określić gotowości wydania.',
        className: 'border-gray-200 bg-gray-50 text-gray-700',
        badgeClassName: 'bg-gray-100 text-gray-700 ring-gray-500/10',
      }
    : releaseMissingItems.length === 0
      ? {
          label: 'Gotowe do wydania',
          className: 'border-green-200 bg-green-50 text-green-900',
          badgeClassName: 'bg-green-100 text-green-800 ring-green-600/20',
        }
      : hasHardReleaseBlocker
        ? {
            label: 'Nie można wydać pojazdu',
            className: 'border-red-200 bg-red-50 text-red-900',
            badgeClassName: 'bg-red-100 text-red-800 ring-red-600/20',
          }
        : {
            label: 'Wymaga uzupełnienia',
            className: 'border-amber-200 bg-amber-50 text-amber-900',
            badgeClassName: 'bg-amber-100 text-amber-800 ring-amber-600/20',
          };
  const releaseNextStep = getReleaseNextStep(releaseMissingItems);
  const flowAlerts = buildFlowAlerts(work, parts, documents, communication);
  const blockedStepKeys = new Set<string>();
  if (!work.audatexEstimateNumber) blockedStepKeys.add('estimate_sent');
  if (!work.insurerDecisionOn) blockedStepKeys.add('approval_pending');
  if (checklist.length === 0 || completedChecklist < checklist.length) blockedStepKeys.add('quality_control');
  if (documents.length === 0 || !work.assignmentOfClaimSigned || !work.powerOfAttorneySigned || releaseMissingItems.includes('nierozliczona dopłata')) blockedStepKeys.add('ready_for_pickup');
  const latestNotes = [
    ...tasks.filter(task => task.comment).map(task => ({ id: `task-${task.id}`, title: task.title, text: task.comment || '' })),
    ...communication.slice(0, 3).map(entry => ({ id: `communication-${entry.id}`, title: getCommunicationCategoryLabel(entry.category), text: entry.note })),
  ].slice(0, 4);

  return (
    <section className="mb-6 space-y-5 rounded-lg border border-gray-200 bg-white p-4 shadow-xs">
      <div className={`rounded-xl border px-5 py-4 shadow-xs ${releaseReadiness.className}`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide">Status gotowości wydania</p>
            <h2 className="mt-1 text-2xl font-semibold">{releaseReadiness.label}</h2>
          </div>
          <span className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${releaseReadiness.badgeClassName}`}>
            {releaseMissingItems.length === 0 ? 'Kompletne' : `${releaseMissingItems.length} braków`}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <p className="text-sm font-semibold">Braki do usunięcia</p>
            {releaseMissingItems.length > 0 ? (
              <ul className="mt-2 grid grid-cols-1 gap-1 text-sm sm:grid-cols-2">
                {releaseMissingItems.map(item => <li key={item}>□ {item}</li>)}
              </ul>
            ) : (
              <p className="mt-2 text-sm">Nie wykryto braków blokujących wydanie pojazdu.</p>
            )}
          </div>
          <div className="rounded-lg bg-white/60 px-3 py-2 text-sm">
            <p className="font-semibold">Następny krok</p>
            <p className="mt-1">{releaseNextStep}</p>
          </div>
        </div>
      </div>

      <FlowAlertsPanel alerts={flowAlerts} />

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
            const problem = blockedStepKeys.has(step.key) && index >= activeStep;
            const className = problem
              ? 'border-red-200 bg-red-50 text-red-700'
              : current
                ? 'border-blue-200 bg-blue-50 text-blue-700'
                : completed
                  ? 'border-green-200 bg-green-50 text-green-700'
                  : 'border-gray-200 bg-gray-50 text-gray-500';
            return (
              <div key={step.key} className={`rounded-md border px-3 py-2 text-xs font-medium ${className}`}>
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

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-md border border-gray-200 p-3">
          <p className="text-sm font-semibold text-gray-900">RBG</p>
          {estimatedRbg > 0 ? (
            <div className="mt-2 space-y-3">
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
          ) : emptyState('Brak danych RBG.', 'Uzupełnij RBG w kosztorysie, żeby kierownik widział zakres i pozostałą pracę.')}
        </div>

        <div className="rounded-md border border-gray-200 p-3 xl:col-span-2">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
            <CheckCircleIcon className="size-5 text-gray-400" aria-hidden="true" />
            Kontrola jakości
          </div>
          {checklist.length === 0 ? emptyState(
            'Checklista jakości nie została jeszcze uzupełniona.',
            'Przed wydaniem sprawdź minimum poniższe punkty. To tylko podpowiedź, bez zapisu do systemu.',
            <ul className="grid grid-cols-1 gap-1 text-sm text-gray-600 sm:grid-cols-2">
              {emptyQualityChecklist.map(item => <li key={item}>□ {item}</li>)}
            </ul>
          ) : (
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
