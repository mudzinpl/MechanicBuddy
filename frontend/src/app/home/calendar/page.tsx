import { httpGet } from '@/_lib/server/query-api';
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  TruckIcon,
} from '@heroicons/react/20/solid';
import Link from 'next/link';
import moment from 'moment';
import type { ReactNode } from 'react';
import DamageStatusBadge from '../work/_components/activity/badges/DamageStatusBadge';

interface CalendarWorkItem {
  id: string;
  workNr: string;
  clientName: string;
  regNr: string;
  damageStatus: string;
  kind: string;
  scheduledOn?: string | null;
}

interface CalendarData {
  today: CalendarWorkItem[];
  upcoming: CalendarWorkItem[];
  overdue: CalendarWorkItem[];
  alerts: CalendarWorkItem[];
}

const kindLabels: Record<string, string> = {
  intake: 'Przyjęcie pojazdu',
  inspection: 'Oględziny',
  release: 'Planowane wydanie',
  replacement_return: 'Zwrot pojazdu zastępczego',
  missing_claim_number: 'Brak numeru szkody',
  missing_insurer: 'Brak ubezpieczyciela',
  inspection_missing_after_two_days: 'Brak oględzin po 2 dniach od zgłoszenia',
  missing_claim_handler: 'Brak opiekuna szkody',
  missing_estimate: 'Brak kosztorysu',
  insurer_decision_overdue: 'Brak decyzji ubezpieczyciela po 3 dniach od wysłania kosztorysu',
  estimate_sent_overdue: 'Kosztorys wysłany ponad 3 dni temu bez decyzji',
  estimate_rejected_or_correction: 'Kosztorys odrzucony lub do poprawy',
  estimate_accepted_ready: 'Zaakceptowane do rozpoczęcia naprawy',
  approval_overdue: 'Oczekiwanie na akceptację ponad 3 dni',
  repair_overdue: 'Pojazd w naprawie ponad 7 dni',
  replacement_without_return_date: 'Pojazd zastępczy wydany bez terminu zwrotu',
  planned_release_overdue: 'Przekroczony planowany termin wydania',
  missing_assignment: 'Brak podpisanej cesji',
  missing_power_of_attorney: 'Brak podpisanego pełnomocnictwa',
  vat_payment: 'Dopłata VAT klienta',
  unsettled_case: 'Sprawa nierozliczona',
  client_vat_without_payment_date: 'Dopłata VAT bez daty zapłaty',
};

const filterLabels = [
  'Przyjęcia',
  'Oględziny',
  'Wydania',
  'Zwroty',
  'Rozliczenia',
  'Decyzje TU',
];

const planningKindGroups = {
  intake: ['intake'],
  inspection: ['inspection'],
  release: ['release'],
  replacementReturn: ['replacement_return'],
  settlements: ['vat_payment', 'unsettled_case', 'client_vat_without_payment_date'],
  insurerDecisions: ['insurer_decision_overdue', 'estimate_sent_overdue', 'approval_overdue'],
};

function formatDate(value?: string | null) {
  return value ? moment(value).locale('pl').format('DD.MM.YYYY HH:mm') : 'Bez daty';
}

function formatDay(value?: string | null) {
  return value ? moment(value).locale('pl').format('DD.MM.YYYY') : 'Bez daty';
}

function formatTime(value?: string | null) {
  return value ? moment(value).locale('pl').format('HH:mm') : '--:--';
}

function countKinds(items: CalendarWorkItem[], kinds: string[]) {
  return items.filter(item => kinds.includes(item.kind)).length;
}

function SummaryCard({ title, value, tone }: { title: string; value: number | string; tone: 'blue' | 'green' | 'amber' | 'red' }) {
  const toneClass = {
    blue: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    green: 'bg-green-50 text-green-700 ring-green-600/20',
    amber: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    red: 'bg-red-50 text-red-700 ring-red-600/20',
  }[tone];

  return (
    <div className="rounded-lg bg-white px-4 py-3 shadow-sm ring-1 ring-gray-900/5">
      <p className="text-sm text-gray-500">{title}</p>
      <p className={`mt-2 inline-flex min-w-12 justify-center rounded-full px-3 py-1 text-lg font-semibold ring-1 ring-inset ${toneClass}`}>{value}</p>
    </div>
  );
}

function ScheduleItem({ item }: { item: CalendarWorkItem }) {
  const description = [item.clientName, item.regNr].filter(Boolean).join(' · ');

  return (
    <Link href={`/home/work/${item.id}`} className="grid gap-3 rounded-lg border border-gray-100 bg-white px-3 py-3 shadow-xs hover:border-indigo-200 hover:bg-indigo-50/30 sm:grid-cols-[72px_1fr_auto]">
      <div className="text-sm font-semibold text-gray-900">{formatTime(item.scheduledOn)}</div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">{kindLabels[item.kind] ?? item.kind}</span>
          <span className="text-sm font-semibold text-gray-900">Zlecenie nr {item.workNr}</span>
        </div>
        <p className="mt-1 truncate text-sm text-gray-600">{description || 'Brak danych klienta i pojazdu'}</p>
      </div>
      <div className="sm:text-right"><DamageStatusBadge status={item.damageStatus}></DamageStatusBadge></div>
    </Link>
  );
}

function OverdueItem({ item }: { item: CalendarWorkItem }) {
  const description = [item.clientName, item.regNr].filter(Boolean).join(' · ');

  return (
    <Link href={`/home/work/${item.id}`} className="block rounded-lg border border-red-100 bg-white px-4 py-3 shadow-xs hover:bg-red-50/40">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900">Zlecenie nr {item.workNr}</p>
          <p className="mt-1 truncate text-sm text-gray-600">{description || 'Brak danych klienta i pojazdu'}</p>
          <p className="mt-2 text-xs font-medium text-red-700">{kindLabels[item.kind] ?? item.kind}</p>
        </div>
        <div className="shrink-0 text-right">
          <span className="inline-flex rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 ring-1 ring-red-600/20 ring-inset">Zaległe</span>
          <p className="mt-2 text-xs font-medium text-gray-500">{formatDay(item.scheduledOn)}</p>
        </div>
      </div>
    </Link>
  );
}

function CompactSection({
  title,
  description,
  items,
  empty,
  icon,
}: {
  title: string;
  description: string;
  items: CalendarWorkItem[];
  empty: string;
  icon: ReactNode;
}) {
  return (
    <section className="rounded-lg bg-white shadow-sm ring-1 ring-gray-900/5">
      <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
        {icon}
        <div>
          <h2 className="font-semibold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
      <div className="p-3">
        {items.length === 0 ? (
          <div className="py-8 text-center">
            <CheckCircleIcon className="mx-auto size-9 text-green-500" aria-hidden="true" />
            <p className="mt-3 text-sm font-medium text-gray-600">{empty}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {items.map(item => (
              <Link key={`${item.kind}-${item.id}-${item.scheduledOn}`} href={`/home/work/${item.id}`} className="block px-3 py-3 hover:bg-gray-50">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">Zlecenie nr {item.workNr}</p>
                    <p className="mt-1 truncate text-xs text-gray-500">{[item.clientName, item.regNr].filter(Boolean).join(' · ') || 'Brak danych klienta i pojazdu'}</p>
                    <p className="mt-2 text-sm text-gray-700">{kindLabels[item.kind] ?? item.kind}</p>
                  </div>
                  <p className="shrink-0 text-xs font-medium text-gray-500">{formatDate(item.scheduledOn)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default async function Page() {
  const response = await httpGet('work/calendar');
  const data = await response.json() as CalendarData;
  const today = data.today || [];
  const overdue = data.overdue || [];

  return (
    <main className="lg:pl-62">
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Terminy</h1>
            <p className="mt-1 text-sm text-gray-500">Centrum planowania dnia kierownika warsztatu.</p>
          </div>
          <p className="text-sm font-medium text-gray-500">{moment().locale('pl').format('DD.MM.YYYY')}</p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
          <SummaryCard title="Dzisiaj" value={today.length} tone="blue" />
          <SummaryCard title="Przyjęcia" value={countKinds(today, planningKindGroups.intake)} tone="green" />
          <SummaryCard title="Oględziny" value={countKinds(today, planningKindGroups.inspection)} tone="blue" />
          <SummaryCard title="Wydania" value={countKinds(today, planningKindGroups.release)} tone="amber" />
          <SummaryCard title="Zaległe" value={overdue.length} tone={overdue.length > 0 ? 'red' : 'green'} />
        </div>

        <div className="mb-6 rounded-lg bg-white px-4 py-3 shadow-sm ring-1 ring-gray-900/5">
          <p className="mb-3 text-sm font-semibold text-gray-900">Typ wydarzenia</p>
          <div className="flex flex-wrap gap-2">
            {filterLabels.map(label => (
              <span key={label} className="rounded-full bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-700 ring-1 ring-gray-200 ring-inset">
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <section className="rounded-lg bg-white shadow-sm ring-1 ring-gray-900/5">
            <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
              <CalendarDaysIcon className="size-6 text-indigo-600" aria-hidden="true" />
              <div>
                <h2 className="font-semibold text-gray-900">Harmonogram dnia</h2>
                <p className="text-sm text-gray-500">Przyjęcia, oględziny, wydania, zwroty i rozliczenia zaplanowane na dziś.</p>
              </div>
            </div>
            <div className="space-y-3 p-4">
              {today.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-200 px-4 py-10 text-center">
                  <CheckCircleIcon className="mx-auto size-9 text-green-500" aria-hidden="true" />
                  <p className="mt-3 text-sm font-medium text-gray-600">Brak zaplanowanych terminów na dziś.</p>
                </div>
              ) : (
                today.map(item => <ScheduleItem key={`${item.kind}-${item.id}-${item.scheduledOn}`} item={item} />)
              )}
            </div>
          </section>

          <section className="rounded-lg bg-white shadow-sm ring-1 ring-gray-900/5">
            <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
              <ExclamationTriangleIcon className="size-6 text-red-500" aria-hidden="true" />
              <div>
                <h2 className="font-semibold text-gray-900">Zaległe terminy</h2>
                <p className="text-sm text-gray-500">Sprawy po terminie, które wymagają reakcji.</p>
              </div>
            </div>
            <div className="space-y-3 p-4">
              {overdue.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-200 px-4 py-8 text-center">
                  <CheckCircleIcon className="mx-auto size-9 text-green-500" aria-hidden="true" />
                  <p className="mt-3 text-sm font-medium text-gray-600">Brak zaległych terminów.</p>
                </div>
              ) : (
                overdue.map(item => <OverdueItem key={`${item.kind}-${item.id}-${item.scheduledOn}`} item={item} />)
              )}
            </div>
          </section>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <CompactSection
            title="Najbliższe 7 dni"
            description="Terminy zaplanowane od jutra do kolejnych 7 dni."
            items={data.upcoming || []}
            empty="Brak terminów w najbliższych 7 dniach"
            icon={<ClockIcon className="size-6 text-sky-600" aria-hidden="true" />}
          />
          <CompactSection
            title="Alerty kierownika"
            description="Sprawy, które wymagają reakcji niezależnie od kalendarza."
            items={data.alerts || []}
            empty="Brak alertów kierownika"
            icon={<TruckIcon className="size-6 text-amber-500" aria-hidden="true" />}
          />
        </div>
      </div>
    </main>
  );
}
