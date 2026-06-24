import { httpGet } from '@/_lib/server/query-api';
import {
  BanknotesIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ClockIcon,
  ClipboardDocumentListIcon,
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
  insurers: DashboardTile[];
  attention: DashboardWorkItem[];
  today: DashboardWorkItem[];
}

interface ReplacementVehicleDashboardData {
  tiles: DashboardTile[];
  attention: DashboardWorkItem[];
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
  { key: 'damage_oc', label: 'Szkody OC', href: '/home/work', icon: ShieldCheckIcon, color: 'text-blue-700 bg-blue-50' },
  { key: 'damage_ac', label: 'Szkody AC', href: '/home/work', icon: ShieldCheckIcon, color: 'text-indigo-700 bg-indigo-50' },
  { key: 'damage_cash_fleet', label: 'Gotówka / flota', href: '/home/work', icon: BanknotesIcon, color: 'text-emerald-700 bg-emerald-50' },
  { key: 'missing_claim_number', label: 'Bez numeru szkody', href: '/home/work', icon: ExclamationTriangleIcon, color: 'text-red-700 bg-red-50' },
  { key: 'missing_insurer', label: 'Bez ubezpieczyciela', href: '/home/work', icon: ExclamationTriangleIcon, color: 'text-amber-700 bg-amber-50' },
  { key: 'missing_assignment', label: 'Bez cesji', href: '/home/work', icon: ExclamationTriangleIcon, color: 'text-rose-700 bg-rose-50' },
  { key: 'missing_power_of_attorney', label: 'Bez pełnomocnictwa', href: '/home/work', icon: ExclamationTriangleIcon, color: 'text-orange-700 bg-orange-50' },
  { key: 'client_vat_payment', label: 'Dopłaty VAT', href: '/home/work', icon: BanknotesIcon, color: 'text-emerald-700 bg-emerald-50' },
  { key: 'unsettled_cases', label: 'Nierozliczone', href: '/home/work', icon: ClockIcon, color: 'text-slate-700 bg-slate-50' },
  { key: 'estimate_missing', label: 'Bez kosztorysu', href: '/home/work', icon: ExclamationTriangleIcon, color: 'text-red-700 bg-red-50' },
  { key: 'estimate_waiting_approval', label: 'Kosztorysy oczekujące', href: '/home/work', icon: ClockIcon, color: 'text-amber-700 bg-amber-50' },
  { key: 'estimate_accepted_ready', label: 'Zaakceptowane do naprawy', href: '/home/work', icon: CheckCircleIcon, color: 'text-green-700 bg-green-50' },
  { key: 'today_schedule', label: 'Dzisiejsze terminy', href: '/home/calendar', icon: CalendarDaysIcon, color: 'text-indigo-700 bg-indigo-50' },
  { key: 'overdue_schedule', label: 'Zaległe terminy', href: '/home/calendar', icon: ExclamationTriangleIcon, color: 'text-red-700 bg-red-50' },
  { key: 'replacement_returns_due', label: 'Pojazdy zastępcze do zwrotu', href: '/home/calendar', icon: TruckIcon, color: 'text-amber-700 bg-amber-50' },
  { key: 'replacement_returns_overdue', label: 'Pojazdy zastępcze po terminie zwrotu', href: '/home/calendar', icon: ExclamationTriangleIcon, color: 'text-red-700 bg-red-50' },
  { key: 'manager_attention', label: 'Sprawy wymagające reakcji', href: '/home/calendar', icon: ClockIcon, color: 'text-orange-700 bg-orange-50' },
] as const;

const attentionDefinitions = [
  { key: 'vehicle_ready_for_release', label: 'Pojazdy gotowe do wydania' },
  { key: 'vehicle_release_overdue', label: 'Pojazdy po terminie wydania' },
  { key: 'vehicle_release_without_final_checklist', label: 'Wydanie bez checklisty końcowej' },
  { key: 'vehicle_release_without_settlement', label: 'Wydanie bez rozliczenia' },
  { key: 'checklist_incomplete', label: 'Checklista niekompletna' },
  { key: 'ready_for_quality_control', label: 'Gotowe do kontroli jakości' },
  { key: 'quality_control_completed', label: 'Kontrola jakości zakończona' },
  { key: 'my_tasks', label: 'Moje zadania' },
  { key: 'task_overdue', label: 'Zadania po terminie' },
  { key: 'task_urgent', label: 'Pilne zadania' },
  { key: 'task_unassigned', label: 'Zadania bez osoby przypisanej' },
  { key: 'missing_claim_number', label: 'Brak numeru szkody' },
  { key: 'missing_insurer', label: 'Brak ubezpieczyciela' },
  { key: 'missing_claim_handler', label: 'Brak opiekuna szkody' },
  { key: 'missing_estimate', label: 'Brak kosztorysu Audanet / Audatex' },
  { key: 'insurer_decision_overdue', label: 'Brak decyzji ubezpieczyciela po 3 dniach od wysłania kosztorysu' },
  { key: 'estimate_sent_overdue', label: 'Kosztorys wysłany ponad 3 dni temu bez decyzji' },
  { key: 'estimate_rejected_or_correction', label: 'Kosztorys odrzucony lub do poprawy' },
  { key: 'estimate_accepted_ready', label: 'Zaakceptowane do rozpoczęcia naprawy' },
  { key: 'inspection_missing_after_two_days', label: 'Brak oględzin po 2 dniach od zgłoszenia' },
  { key: 'approval_overdue', label: 'Oczekuje na akceptację dłużej niż 3 dni' },
  { key: 'repair_overdue', label: 'Pojazd w naprawie dłużej niż 7 dni' },
  { key: 'replacement_without_return_date', label: 'Pojazd zastępczy wydany bez terminu zwrotu' },
  { key: 'replacement_return_overdue', label: 'Przekroczony termin zwrotu pojazdu zastępczego' },
  { key: 'replacement_issued_over_14_days', label: 'Pojazd zastępczy wydany dłużej niż 14 dni' },
  { key: 'planned_release_overdue', label: 'Przekroczony planowany termin wydania' },
  { key: 'vat_payment', label: 'Dopłata VAT klienta' },
  { key: 'missing_assignment', label: 'Brak podpisanej cesji' },
  { key: 'missing_power_of_attorney', label: 'Brak podpisanego pełnomocnictwa' },
  { key: 'unsettled_case', label: 'Sprawa nierozliczona' },
  { key: 'client_vat_without_payment_date', label: 'Dopłata VAT bez daty zapłaty' },
  { key: 'parts_to_order', label: 'Części do zamówienia' },
  { key: 'parts_ordered_without_delivery_date', label: 'Części zamówione bez daty dostawy' },
  { key: 'parts_delivery_overdue', label: 'Opóźniona dostawa części' },
  { key: 'repair_waiting_for_parts', label: 'Naprawa wstrzymana przez części' },
  { key: 'communication_waiting_client', label: 'Oczekuje na odpowiedź klienta' },
  { key: 'communication_waiting_insurer', label: 'Oczekuje na odpowiedź ubezpieczyciela' },
  { key: 'communication_no_contact_7_days', label: 'Brak kontaktu ponad 7 dni' },
  { key: 'communication_unresolved', label: 'Nierozwiązane wpisy komunikacji' },
] as const;

const todayDefinitions = [
  { key: 'intake', label: 'Przyjęcia pojazdów', empty: 'Brak przyjęć na dziś' },
  { key: 'release', label: 'Wydania pojazdów', empty: 'Brak wydań na dziś' },
  { key: 'inspection', label: 'Oględziny', empty: 'Brak oględzin na dziś' },
  { key: 'replacement_return', label: 'Zwroty pojazdów zastępczych', empty: 'Brak zwrotów na dziś' },
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
  const checklistResponse = await httpGet('work/quality-checklist-alerts');
  const checklistAttention = await checklistResponse.json() as DashboardWorkItem[];
  const releaseResponse = await httpGet('work/vehicle-release-alerts');
  const releaseAttention = await releaseResponse.json() as DashboardWorkItem[];
  const communicationResponse = await httpGet('work/communication-alerts');
  const communicationAttention = await communicationResponse.json() as DashboardWorkItem[];
  const partsResponse = await httpGet('work/part-order-alerts');
  const partsAttention = await partsResponse.json() as DashboardWorkItem[];
  const tasksResponse = await httpGet('work/task-alerts');
  const tasksAttention = await tasksResponse.json() as DashboardWorkItem[];
  const replacementVehicleResponse = await httpGet('work/replacement-vehicle-dashboard');
  const replacementVehicleData = await replacementVehicleResponse.json() as ReplacementVehicleDashboardData;
  const counts = new Map([...(data.tiles || []), ...(replacementVehicleData.tiles || [])].map(tile => [tile.key, tile.count]));
  const insurers = data.insurers || [];
  const attention = [...(data.attention || []), ...(replacementVehicleData.attention || []), ...(releaseAttention || []), ...(checklistAttention || []), ...(tasksAttention || []), ...(partsAttention || []), ...(communicationAttention || [])];
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

        <section className="mt-6 rounded-lg bg-white shadow-sm ring-1 ring-gray-900/5" aria-labelledby="insurers-heading">
          <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
            <ShieldCheckIcon className="size-6 text-blue-600" aria-hidden="true" />
            <div>
              <h2 id="insurers-heading" className="font-semibold text-gray-900">Sprawy według ubezpieczyciela</h2>
              <p className="text-sm text-gray-500">Najczęściej występujący ubezpieczyciele w zleceniach.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
            {insurers.length === 0 ? (
              <p className="text-sm text-gray-500">Brak danych o ubezpieczycielach</p>
            ) : insurers.map(item => (
              <div key={item.key} className="rounded-md border border-gray-100 px-3 py-2">
                <p className="truncate text-sm font-medium text-gray-700">{item.key}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{item.count}</p>
              </div>
            ))}
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
                    <h3 className="mb-1 flex items-center gap-2 px-3 text-sm font-semibold text-gray-700">
                      {group.key.startsWith('communication_') && <ChatBubbleLeftRightIcon className="size-4 text-gray-400" aria-hidden="true" />}
                      {group.key.startsWith('parts_') || group.key === 'repair_waiting_for_parts' ? <CubeIcon className="size-4 text-gray-400" aria-hidden="true" /> : null}
                      {group.key.startsWith('task_') || group.key === 'my_tasks' ? <ClipboardDocumentListIcon className="size-4 text-gray-400" aria-hidden="true" /> : null}
                      {group.key.startsWith('vehicle_') ? <TruckIcon className="size-4 text-gray-400" aria-hidden="true" /> : null}
                      {group.key.startsWith('checklist_') || group.key.includes('quality_control') ? <CheckCircleIcon className="size-4 text-gray-400" aria-hidden="true" /> : null}
                      <span>{group.label} ({items.length})</span>
                    </h3>
                    <div className="divide-y divide-gray-100">{items.map(item => <WorkLink key={`${group.key}-${item.id}-${item.scheduledOn ?? 'brak-daty'}`} item={item} />)}</div>
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
                      : <div className="divide-y divide-gray-100">{items.map(item => <WorkLink key={`${group.key}-${item.id}-${item.scheduledOn ?? 'brak-daty'}`} item={item} />)}</div>}
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
