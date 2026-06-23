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
  insurer_decision_overdue: 'Brak decyzji ubezpieczyciela po 3 dniach od wysłania kosztorysu',
  approval_overdue: 'Oczekiwanie na akceptację ponad 3 dni',
  repair_overdue: 'Pojazd w naprawie ponad 7 dni',
  replacement_without_return_date: 'Pojazd zastępczy wydany bez terminu zwrotu',
  planned_release_overdue: 'Przekroczony planowany termin wydania',
};

function formatDate(value?: string | null) {
  return value ? moment(value).locale('pl').format('DD.MM.YYYY HH:mm') : 'Bez daty';
}

function WorkItem({ item }: { item: CalendarWorkItem }) {
  const description = [item.clientName, item.regNr].filter(Boolean).join(' · ');

  return (
    <Link href={`/home/work/${item.id}`} className="block rounded-md px-3 py-3 hover:bg-gray-50">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900">Zlecenie nr {item.workNr}</p>
          <p className="mt-1 truncate text-xs text-gray-500">{description || 'Brak danych klienta i pojazdu'}</p>
          <p className="mt-2 text-sm text-gray-700">{kindLabels[item.kind] ?? item.kind}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs font-medium text-gray-500">{formatDate(item.scheduledOn)}</p>
          <div className="mt-2"><DamageStatusBadge status={item.damageStatus}></DamageStatusBadge></div>
        </div>
      </div>
    </Link>
  );
}

function Section({
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
          <div className="divide-y divide-gray-100">{items.map(item => <WorkItem key={`${item.kind}-${item.id}-${item.scheduledOn}`} item={item} />)}</div>
        )}
      </div>
    </section>
  );
}

export default async function Page() {
  const response = await httpGet('work/calendar');
  const data = await response.json() as CalendarData;

  return (
    <main className="lg:pl-62">
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Terminy</h1>
          <p className="mt-1 text-sm text-gray-500">Dzisiejsze, najbliższe i zaległe sprawy warsztatu.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Section
            title="Dzisiejsze terminy"
            description="Przyjęcia, oględziny, wydania i zwroty zaplanowane na dziś."
            items={data.today || []}
            empty="Brak terminów na dziś"
            icon={<CalendarDaysIcon className="size-6 text-indigo-600" aria-hidden="true" />}
          />
          <Section
            title="Zaległe terminy"
            description="Zaplanowane działania, których termin już minął."
            items={data.overdue || []}
            empty="Brak zaległych terminów"
            icon={<ExclamationTriangleIcon className="size-6 text-red-500" aria-hidden="true" />}
          />
          <Section
            title="Najbliższe 7 dni"
            description="Terminy zaplanowane od jutra do kolejnych 7 dni."
            items={data.upcoming || []}
            empty="Brak terminów w najbliższych 7 dniach"
            icon={<ClockIcon className="size-6 text-sky-600" aria-hidden="true" />}
          />
          <Section
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
