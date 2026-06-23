import { httpGet } from '@/_lib/server/query-api';
import {
  BanknotesIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  InboxIcon,
  PauseCircleIcon,
  ShieldCheckIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/20/solid';
import Link from 'next/link';
import DamageStatusBadge from './work/_components/activity/badges/DamageStatusBadge';

interface DashboardTile {
  key: string;
  count: number;
}

interface DashboardWorkItem {
  id: string;
  workNr: string;
  clientName: string;
  regNr: string;
  damageStatus: string;
  kind: string;
  scheduledOn?: string | null;
}

interface DashboardData {
  tiles: DashboardTile[];
  attention: DashboardWorkItem[];
  today: DashboardWorkItem[];
}

const tileDefinitions = [
  { key: 'new', label: 'Nowe zgłoszenia', href: '/home/work?damageStatus=new', icon: InboxIcon, color: 'text-blue-700 bg-blue-50' },
  { key: 'inspection_pending', label: 'Oczekuje na oględziny', href: '/home/work?damageStatus=inspection_pending', icon: EyeIcon, color: 'text-amber-700 bg-amber-50' },
  { key: 'approval_pending', label: 'Oczekuje na akceptację ubezpieczyciela', href: '/home/work?damageStatus=approval_pending', icon: ShieldCheckIcon, color: 'text-violet-700 bg-violet-50' },
  { key: 'parts_pending', label: 'Czeka na części', href: '/home/work?damageStatus=parts_pending', icon: CubeIcon, color: 'text-orange-700 bg-orange-50' },
  { key: 'repair', label: 'W naprawie', href: '/home/work?damageStatus=repair', icon: WrenchScrewdriverIcon, color: 'text-indigo-700 bg-indigo-50' },
  { key: 'ready_for_pickup', label: 'Gotowe do odbioru', href: '/home/work?damageStatus=ready_for_pickup', icon: CheckCircleIcon, color: 'text-green-700 bg-green-50' },
  { key: 'on_hold', label: 'Wstrzymane', href: '/home/work?damageStatus=on_hold', icon: PauseCircleIcon, color: 'text-red-700 bg-red-50' },
  { key: 'settled_this_month', label: 'Rozliczone w tym miesiącu', href: '/home/work?damageStatus=settled', icon: BanknotesIcon, color: 'text-emerald-700 bg-emerald-50' },
  { key: 'active_replacement_vehicles', label: 'Aktywne pojazdy zastępcze', href: '/home/work', icon: TruckIcon, color: 'text-sky-700 bg-sky-50' },
] as const;

const attentionDefinitions = [
  { key: 'missing_claim_number', label: 'Brak numeru szkody' },
  { key: 'missing_insurer', label: 'Brak ubezpieczyciela' },
  { key: 'missing_estimate', label: 'Brak kosztorysu Audanet / Audatex' },
  { key: 'approval_overdue', label: 'Oczekuje na akceptację dłużej niż 3 dni' },
  { key: 'repair_overdue', label: 'Pojazd w naprawie dłużej niż 7 dni' },
  { key: 'vat_payment', label: 'Dopłata VAT klienta' },
  { key: 'missing_assignment', label: 'Brak podpisanej cesji' },
] as const;

const todayDefinitions = [
  { key: 'intake', label: 'Przyjęcia pojazdów', empty: 'Brak przyjęć na dziś' },
  { key: 'release', label: 'Wydania pojazdów', empty: 'Brak wydań na dziś' },
  { key: 'inspection', label: 'Oględziny', empty: 'Brak oględzin na dziś' },
] as const;

function WorkLink({ item }: { item: DashboardWorkItem }) {
  const description = [item.clientName, item.regNr].filter(Boolean).join(' · ');

  return (
    <Link
      href={`/home/work/${item.id}`}
      className="flex items-center justify-between gap-4 rounded-md px-3 py-2 hover:bg-gray-50"
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-900">Zlecenie nr {item.workNr}</p>
        <p className="truncate text-xs text-gray-500">{description || 'Brak danych klienta i pojazdu'}</p>
      </div>
      <DamageStatusBadge status={item.damageStatus}></DamageStatusBadge>
    </Link>
  );
}

export default async function Page() {
  const response = await httpGet('work/dashboard');
  const data = await response.json() as DashboardData;
  const counts = new Map((data.tiles || []).map(tile => [tile.key, tile.count]));
  const attention = data.attention || [];
  const today = data.today || [];

  return (
    <main className="lg:pl-62">
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Pulpit kierownika</h1>
          <p className="mt-1 text-sm text-gray-500">Sprawy, terminy i zlecenia wymagające uwagi.</p>
        </div>

        <section aria-labelledby="summary-heading">
          <h2 id="summary-heading" className="sr-only">Podsumowanie zleceń</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {tileDefinitions.map(tile => {
              const Icon = tile.icon;
              return (
                <Link key={tile.key} href={tile.href} className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-gray-900/5 hover:shadow-md">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">{tile.label}</p>
                      <p className="mt-2 text-3xl font-bold text-gray-900">{counts.get(tile.key) || 0}</p>
                    </div>
                    <span className={`rounded-lg p-2 ${tile.color}`}><Icon className="size-6" aria-hidden="true" /></span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
          <section className="rounded-lg bg-white shadow-sm ring-1 ring-gray-900/5 xl:col-span-2" aria-labelledby="attention-heading">
            <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
              <ExclamationTriangleIcon className="size-6 text-amber-500" aria-hidden="true" />
              <div>
                <h2 id="attention-heading" className="font-semibold text-gray-900">Wymaga uwagi</h2>
                <p className="text-sm text-gray-500">Braki i opóźnienia w prowadzonych sprawach.</p>
              </div>
            </div>

            <div className="p-4">
              {attention.length === 0 ? (
                <div className="py-10 text-center">
                  <CheckCircleIcon className="mx-auto size-10 text-green-500" aria-hidden="true" />
                  <p className="mt-3 text-sm font-medium text-gray-700">Brak spraw wymagających uwagi</p>
                </div>
              ) : attentionDefinitions.map(group => {
                const items = attention.filter(item => item.kind === group.key);
                if (items.length === 0) return null;
                return (
                  <div key={group.key} className="mb-5 last:mb-0">
                    <h3 className="mb-1 px-3 text-sm font-semibold text-gray-700">{group.label} ({items.length})</h3>
                    <div className="divide-y divide-gray-100">{items.map(item => <WorkLink key={`${group.key}-${item.id}`} item={item} />)}</div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-lg bg-white shadow-sm ring-1 ring-gray-900/5" aria-labelledby="today-heading">
            <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
              <CalendarDaysIcon className="size-6 text-indigo-600" aria-hidden="true" />
              <div>
                <h2 id="today-heading" className="font-semibold text-gray-900">Dzisiejsze terminy</h2>
                <p className="text-sm text-gray-500">Plan dnia warsztatu.</p>
              </div>
            </div>

            <div className="space-y-5 p-4">
              {todayDefinitions.map(group => {
                const items = today.filter(item => item.kind === group.key);
                return (
                  <div key={group.key}>
                    <div className="mb-1 flex items-center gap-2 px-3">
                      <ClockIcon className="size-4 text-gray-400" aria-hidden="true" />
                      <h3 className="text-sm font-semibold text-gray-700">{group.label}</h3>
                    </div>
                    {items.length === 0
                      ? <p className="px-3 py-2 text-sm text-gray-400">{group.empty}</p>
                      : <div className="divide-y divide-gray-100">{items.map(item => <WorkLink key={`${group.key}-${item.id}`} item={item} />)}</div>}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
