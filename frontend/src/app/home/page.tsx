import { httpGet } from '@/_lib/server/query-api';
import {
  BanknotesIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  ClipboardDocumentListIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  ShieldCheckIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/20/solid';
import Link from 'next/link';
import DamageStatusBadge from './work/_components/activity/badges/DamageStatusBadge';

interface CommandCenterTile {
  key: string;
  count: number;
  amount?: number | null;
}

interface CommandCenterWorkItem {
  id: string;
  workNr: string;
  clientName: string;
  regNr: string;
  damageStatus: string;
  kind: string;
  scheduledOn?: string | null;
}

interface CommandCenterData {
  kpis: CommandCenterTile[];
  attention: CommandCenterWorkItem[];
  today: CommandCenterWorkItem[];
  process: CommandCenterTile[];
  replacements: CommandCenterTile[];
  finance: CommandCenterTile[];
}

const toneClasses = {
  blue: 'border-blue-200 bg-blue-50 text-blue-700',
  green: 'border-green-200 bg-green-50 text-green-700',
  yellow: 'border-amber-200 bg-amber-50 text-amber-700',
  red: 'border-red-200 bg-red-50 text-red-700',
  slate: 'border-slate-200 bg-slate-50 text-slate-700',
} as const;

const kpiDefinitions = [
  { key: 'active_work', label: 'Aktywne zlecenia', href: '/home/work?status=inprogress', icon: WrenchScrewdriverIcon, tone: 'blue' },
  { key: 'ready_for_pickup', label: 'Gotowe do wydania', href: '/home/work?damageStatus=ready_for_pickup', icon: CheckCircleIcon, tone: 'green' },
  { key: 'parts_waiting', label: 'Czekają na części', href: '/home/work?damageStatus=parts_pending', icon: CubeIcon, tone: 'yellow' },
  { key: 'overdue', label: 'Po terminie', href: '/home/calendar', icon: ExclamationTriangleIcon, tone: 'red' },
  { key: 'missing_estimate', label: 'Bez kosztorysu', href: '/home/work', icon: ClipboardDocumentListIcon, tone: 'red' },
  { key: 'unsettled', label: 'Nierozliczone', href: '/home/work', icon: BanknotesIcon, tone: 'yellow' },
  { key: 'active_replacement_vehicles', label: 'Aktywne pojazdy zastępcze', href: '/home/work', icon: TruckIcon, tone: 'blue' },
  { key: 'task_overdue', label: 'Zadania po terminie', href: '/home/calendar', icon: ClockIcon, tone: 'red' },
] as const;

const attentionDefinitions = [
  { key: 'insurer_decision_overdue', label: 'Brak decyzji ubezpieczyciela ponad 3 dni', icon: ShieldCheckIcon, tone: 'red' },
  { key: 'missing_assignment', label: 'Brak cesji', icon: ClipboardDocumentListIcon, tone: 'yellow' },
  { key: 'missing_power_of_attorney', label: 'Brak pełnomocnictwa', icon: ClipboardDocumentListIcon, tone: 'yellow' },
  { key: 'missing_estimate', label: 'Brak kosztorysu', icon: ClipboardDocumentListIcon, tone: 'red' },
  { key: 'parts_delivery_overdue', label: 'Opóźnione części', icon: CubeIcon, tone: 'red' },
  { key: 'replacement_return_overdue', label: 'Pojazd zastępczy po terminie zwrotu', icon: TruckIcon, tone: 'red' },
  { key: 'payment_overdue', label: 'Zaległa płatność', icon: BanknotesIcon, tone: 'red' },
  { key: 'task_overdue', label: 'Zadanie po terminie', icon: ClockIcon, tone: 'red' },
  { key: 'checklist_incomplete_ready', label: 'Checklista niekompletna przy gotowym pojeździe', icon: CheckCircleIcon, tone: 'yellow' },
] as const;

const todayDefinitions = [
  { key: 'intake', label: 'Przyjęcia', icon: TruckIcon },
  { key: 'inspection', label: 'Oględziny', icon: EyeIcon },
  { key: 'release', label: 'Wydania', icon: CheckCircleIcon },
  { key: 'replacement_return', label: 'Zwroty pojazdów zastępczych', icon: TruckIcon },
  { key: 'payment_due', label: 'Terminy płatności', icon: BanknotesIcon },
  { key: 'task_due', label: 'Zadania', icon: ClipboardDocumentListIcon },
] as const;

const processDefinitions = [
  { key: 'new', label: 'Nowa szkoda', tone: 'blue' },
  { key: 'inspection_pending', label: 'Oczekuje na oględziny', tone: 'yellow' },
  { key: 'estimate_done', label: 'Kosztorys wykonany', tone: 'blue' },
  { key: 'approval_pending', label: 'Oczekuje na decyzję', tone: 'yellow' },
  { key: 'parts_ordered', label: 'Części zamówione', tone: 'yellow' },
  { key: 'repair', label: 'Naprawa w toku', tone: 'blue' },
  { key: 'paint_shop', label: 'Lakiernia', tone: 'blue' },
  { key: 'quality_control', label: 'Kontrola jakości', tone: 'yellow' },
  { key: 'ready_for_pickup', label: 'Gotowe do wydania', tone: 'green' },
  { key: 'released', label: 'Wydane', tone: 'green' },
] as const;

const replacementDefinitions = [
  { key: 'active', label: 'Aktywne', tone: 'blue' },
  { key: 'due_today', label: 'Do zwrotu dzisiaj', tone: 'yellow' },
  { key: 'overdue', label: 'Po terminie', tone: 'red' },
  { key: 'without_return_date', label: 'Bez daty zwrotu', tone: 'yellow' },
] as const;

const financeDefinitions = [
  { key: 'underpayment_total', label: 'Suma niedopłat', tone: 'red', amount: true },
  { key: 'overdue_payments', label: 'Zaległe płatności', tone: 'red' },
  { key: 'not_issued_invoices', label: 'Faktury niewystawione', tone: 'yellow' },
  { key: 'disputed_cases', label: 'Sprawy sporne', tone: 'red' },
  { key: 'vat_payments', label: 'Dopłaty VAT', tone: 'blue' },
] as const;

function countMap(items: CommandCenterTile[]) {
  return new Map((items || []).map(item => [item.key, item]));
}

function formatMoney(value?: number | null) {
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' })
    .format(value || 0)
    .replace(/\u00A0/g, ' ');
}

function formatDate(value?: string | null) {
  if (!value) return '';
  return new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function EmptyState({ text }: { text: string }) {
  return <p className="rounded-md bg-gray-50 px-3 py-4 text-sm text-gray-500">{text}</p>;
}

function KpiCard({ definition, tile }: { definition: typeof kpiDefinitions[number], tile?: CommandCenterTile }) {
  const Icon = definition.icon;
  const count = tile?.count || 0;

  return (
    <Link href={definition.href} className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-900/5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-500">{definition.label}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{count}</p>
        </div>
        <span className={`rounded-lg border p-2 ${toneClasses[definition.tone]}`}>
          <Icon className="size-6" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

function WorkLink({ item }: { item: CommandCenterWorkItem }) {
  const description = [item.clientName, item.regNr].filter(Boolean).join(' · ');

  return (
    <Link href={`/home/work/${item.id}`} className="flex items-center justify-between gap-4 rounded-md px-3 py-2 hover:bg-gray-50">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-900">Zlecenie nr {item.workNr}</p>
        <p className="truncate text-xs text-gray-500">{description || 'Brak danych klienta i pojazdu'}</p>
        {item.scheduledOn && <p className="text-xs text-gray-400">{formatDate(item.scheduledOn)}</p>}
      </div>
      <DamageStatusBadge status={item.damageStatus}></DamageStatusBadge>
    </Link>
  );
}

function SectionHeader({ icon: Icon, title, description }: { icon: typeof ExclamationTriangleIcon, title: string, description: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
      <Icon className="size-6 text-gray-500" aria-hidden="true" />
      <div>
        <h2 className="font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
}

export default async function Page() {
  const response = await httpGet('work/command-center-dashboard');
  const data = await response.json() as CommandCenterData;
  const kpis = countMap(data.kpis || []);
  const process = countMap(data.process || []);
  const replacements = countMap(data.replacements || []);
  const finance = countMap(data.finance || []);
  const attention = data.attention || [];
  const today = data.today || [];
  const processTotal = processDefinitions.reduce((sum, item) => sum + (process.get(item.key)?.count || 0), 0);

  return (
    <main className="lg:pl-62">
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">APPRA</p>
            <h1 className="text-2xl font-bold text-gray-900">Centrum dowodzenia kierownika</h1>
            <p className="mt-1 text-sm text-gray-500">Najważniejsze sprawy warsztatu, szkód i rozliczeń w jednym widoku.</p>
          </div>
          <Link href="/home/calendar" className="inline-flex items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-gray-300 hover:bg-gray-50">
            <CalendarDaysIcon className="mr-2 size-4 text-gray-400" aria-hidden="true" />
            Terminy
          </Link>
        </div>

        <section aria-labelledby="kpi-heading">
          <h2 id="kpi-heading" className="sr-only">Najważniejsze wskaźniki</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {kpiDefinitions.map(item => <KpiCard key={item.key} definition={item} tile={kpis.get(item.key)} />)}
          </div>
        </section>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
          <section className="rounded-lg bg-white shadow-sm ring-1 ring-gray-900/5 xl:col-span-2" aria-labelledby="attention-heading">
            <SectionHeader icon={ExclamationTriangleIcon} title="Wymaga reakcji" description="Sprawy, które powinny trafić na początek dnia." />
            <div className="p-4">
              {attention.length === 0 ? <EmptyState text="Brak spraw wymagających reakcji" /> : attentionDefinitions.map(group => {
                const items = attention.filter(item => item.kind === group.key);
                if (items.length === 0) return null;
                const Icon = group.icon;
                return (
                  <div key={group.key} className="mb-5 last:mb-0">
                    <h3 className="mb-1 flex items-center gap-2 px-3 text-sm font-semibold text-gray-700">
                      <span className={`rounded-md border p-1 ${toneClasses[group.tone]}`}><Icon className="size-4" aria-hidden="true" /></span>
                      <span>{group.label} ({items.length})</span>
                    </h3>
                    <div className="divide-y divide-gray-100">{items.slice(0, 8).map(item => <WorkLink key={`${group.key}-${item.id}-${item.scheduledOn ?? 'brak-daty'}`} item={item} />)}</div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-lg bg-white shadow-sm ring-1 ring-gray-900/5" aria-labelledby="today-heading">
            <SectionHeader icon={CalendarDaysIcon} title="Dzisiaj" description="Terminy, zadania i płatności na dziś." />
            <div className="space-y-5 p-4">
              {today.length === 0 ? <EmptyState text="Na dziś nie ma zaplanowanych pozycji" /> : todayDefinitions.map(group => {
                const items = today.filter(item => item.kind === group.key);
                if (items.length === 0) return null;
                const Icon = group.icon;
                return (
                  <div key={group.key}>
                    <div className="mb-1 flex items-center gap-2 px-3">
                      <Icon className="size-4 text-gray-400" aria-hidden="true" />
                      <h3 className="text-sm font-semibold text-gray-700">{group.label} ({items.length})</h3>
                    </div>
                    <div className="divide-y divide-gray-100">{items.slice(0, 6).map(item => <WorkLink key={`${group.key}-${item.id}-${item.scheduledOn ?? 'brak-daty'}`} item={item} />)}</div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-lg bg-white shadow-sm ring-1 ring-gray-900/5" aria-labelledby="process-heading">
          <SectionHeader icon={WrenchScrewdriverIcon} title="Proces szkody" description="Rozkład spraw według etapu likwidacji i naprawy." />
          <div className="p-5">
            <div className="mb-5 flex h-3 overflow-hidden rounded-full bg-gray-100">
              {processDefinitions.map(item => {
                const count = process.get(item.key)?.count || 0;
                const width = processTotal > 0 ? Math.max((count / processTotal) * 100, count > 0 ? 2 : 0) : 0;
                const color = item.tone === 'green' ? 'bg-green-500' : item.tone === 'yellow' ? 'bg-amber-500' : item.tone === 'red' ? 'bg-red-500' : 'bg-blue-500';
                return <div key={item.key} className={color} style={{ width: `${width}%` }} title={`${item.label}: ${count}`} />;
              })}
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {processDefinitions.map(item => (
                <Link key={item.key} href={item.key === 'estimate_done' ? '/home/work' : `/home/work?damageStatus=${item.key === 'parts_ordered' ? 'parts_pending' : item.key}`}
                  className="rounded-md border border-gray-100 px-3 py-2 hover:bg-gray-50">
                  <p className="text-sm font-medium text-gray-700">{item.label}</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{process.get(item.key)?.count || 0}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <section className="rounded-lg bg-white shadow-sm ring-1 ring-gray-900/5" aria-labelledby="replacement-heading">
            <SectionHeader icon={TruckIcon} title="Pojazdy zastępcze" description="Aktywne najmy i ryzyka zwrotu." />
            <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
              {replacementDefinitions.map(item => (
                <Link key={item.key} href="/home/work" className={`rounded-md border px-4 py-3 ${toneClasses[item.tone]}`}>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="mt-1 text-3xl font-bold text-gray-900">{replacements.get(item.key)?.count || 0}</p>
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-lg bg-white shadow-sm ring-1 ring-gray-900/5" aria-labelledby="finance-heading">
            <SectionHeader icon={BanknotesIcon} title="Finanse" description="Rozliczenia, zaległości i dopłaty klienta." />
            <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
              {financeDefinitions.map(item => {
                const tile = finance.get(item.key);
                const isAmount = 'amount' in item && item.amount;
                return (
                  <Link key={item.key} href="/home/work" className={`rounded-md border px-4 py-3 ${toneClasses[item.tone]}`}>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">{isAmount ? formatMoney(tile?.amount) : (tile?.count || 0)}</p>
                    {isAmount && <p className="mt-1 text-xs text-gray-500">Spraw: {tile?.count || 0}</p>}
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
