import clsx from "clsx";
import Search from "../_components/Search";
import 'car-makes-icons/dist/style.css';
import { SearchCardHeader } from "../_components/SearchCardHeader";
import Main from "../_components/Main";
import SimpleSearchBar from "../_components/SimpleSearchBar";
import Link from "next/link";
import { CardHeader } from "@/_components/Card";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { httpGet } from "@/_lib/server/query-api";

interface VehiclesPageResult {
  hasMore: boolean;
  items: VehicleRow[];
}

type VehicleRow = Record<string, unknown>;

type OperationalStatus = "W naprawie" | "Oczekuje" | "Wydane" | "Archiwum" | "Nieaktywny";

const operationalStatusStyles: Record<OperationalStatus, string> = {
  "W naprawie": "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "Oczekuje": "bg-amber-50 text-amber-800 ring-amber-200",
  "Wydane": "bg-blue-50 text-blue-700 ring-blue-200",
  "Archiwum": "bg-gray-50 text-gray-600 ring-gray-200",
  "Nieaktywny": "bg-slate-50 text-slate-600 ring-slate-200",
};

function getString(item: VehicleRow, keys: string[]) {
  for (const key of keys) {
    const value = item[key];
    if (value !== undefined && value !== null && value !== "") return String(value);
  }
  return "";
}

function isClientVehicle(item: VehicleRow, clientId: string) {
  const ownerId = getString(item, ["ownerId", "clientId", "customerId"]);
  return ownerId === clientId;
}

function getActiveWorkId(item: VehicleRow) {
  return getString(item, ["workId", "activeWorkId", "currentWorkId", "activeOrderId", "currentOrderId"]);
}

function getActiveWorkLabel(item: VehicleRow) {
  const number = getString(item, ["workNr", "workNumber", "workNo", "activeWorkNumber", "currentWorkNumber", "orderNumber"]);
  if (number) return number.startsWith("APPRA") ? number : `Zlecenie nr ${number}`;

  const title = getString(item, ["workTitle", "activeWorkTitle", "currentWorkTitle"]);
  if (title) return title;

  return "";
}

function getOperationalStatus(item: VehicleRow): OperationalStatus {
  const status = getString(item, ["vehicleStatus", "status", "workStatus", "currentWorkStatus", "activeWorkStatus", "processStatus", "repairStatus"]).toLowerCase();
  const hasActiveWork = Boolean(getActiveWorkId(item) || getActiveWorkLabel(item));

  if (status.includes("arch") || status.includes("anul")) return "Archiwum";
  if (status.includes("wydan") || status.includes("zako") || status.includes("rozlic")) return "Wydane";
  if (status.includes("oczek") || status.includes("czeka") || status.includes("plan") || status.includes("now")) return "Oczekuje";
  if (status.includes("napraw") || status.includes("toku") || status.includes("lakier") || status.includes("kontrol") || status.includes("blachar") || status.includes("mechan")) return "W naprawie";

  return hasActiveWork ? "W naprawie" : "Nieaktywny";
}

function VehicleStatusBadge({ vehicle }: { vehicle: VehicleRow }) {
  const status = getOperationalStatus(vehicle);
  return (
    <span className={clsx("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset", operationalStatusStyles[status])}>
      {status}
    </span>
  );
}

function ActiveWorkLink({ vehicle }: { vehicle: VehicleRow }) {
  const workId = getActiveWorkId(vehicle);
  const label = getActiveWorkLabel(vehicle);

  if (!workId && !label) return <span className="text-gray-400">—</span>;
  if (!workId) return <span className="text-gray-700">{label}</span>;

  return (
    <Link href={`/home/work/${workId}`} className="font-medium text-indigo-700 hover:text-indigo-500">
      {label || "Zlecenie"}
    </Link>
  );
}

function VehicleProducer({ producer }: { producer: string }) {
  const producerName = producer.trim().replace(" ", "-").toLowerCase();
  return (
    <div className="flex items-center">
      <i className={clsx("pr-2 text-2xl", "car-" + producerName)}> </i>
      <span className="text-sm">{producer || "-"}</span>
    </div>
  );
}

function ClientVehiclesTable({ vehicles }: { vehicles: VehicleRow[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 pr-3 pl-4 text-left text-xs font-semibold tracking-wide text-gray-600 uppercase sm:pl-6">Marka</th>
              <th className="px-3 py-3 text-left text-xs font-semibold tracking-wide text-gray-600 uppercase">Model</th>
              <th className="px-3 py-3 text-left text-xs font-semibold tracking-wide text-gray-600 uppercase">Numer rejestracyjny</th>
              <th className="px-3 py-3 text-left text-xs font-semibold tracking-wide text-gray-600 uppercase">Właściciel</th>
              <th className="px-3 py-3 text-left text-xs font-semibold tracking-wide text-gray-600 uppercase">Status</th>
              <th className="px-3 py-3 text-left text-xs font-semibold tracking-wide text-gray-600 uppercase">Aktywne zlecenie</th>
              <th className="px-3 py-3 text-left text-xs font-semibold tracking-wide text-gray-600 uppercase">VIN</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {vehicles.map(vehicle => {
              const id = getString(vehicle, ["id"]);
              const producer = getString(vehicle, ["producer"]);
              const model = getString(vehicle, ["model"]);
              const regNr = getString(vehicle, ["regNr", "registrationNumber"]);
              const ownerName = getString(vehicle, ["ownerName", "clientName"]);
              const ownerId = getString(vehicle, ["ownerId", "clientId"]);
              const vin = getString(vehicle, ["vin"]);
              const isReplacementVehicle = Boolean(vehicle.isReplacementVehicle);

              return <tr key={id || `${regNr}-${vin}`} className="hover:bg-gray-50">
                <td className="py-3 pr-3 pl-4 align-top font-medium text-gray-900 sm:pl-6">
                  <VehicleProducer producer={producer} />
                </td>
                <td className="px-3 py-3 align-top text-sm text-gray-600">{model || "-"}</td>
                <td className="px-3 py-3 align-top text-sm">
                  {id ? <Link href={`/home/vehicles/${id}`} className="inline-flex items-center gap-2 font-semibold text-gray-900 hover:text-indigo-700">
                    {regNr || "Brak numeru"}
                    {isReplacementVehicle && <span className="rounded-full bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-700">Zastępczy</span>}
                  </Link> : <span className="font-semibold text-gray-900">{regNr || "Brak numeru"}</span>}
                </td>
                <td className="px-3 py-3 align-top text-sm text-gray-600">
                  {ownerName && ownerId ? <Link href={`/home/clients/${ownerId}`} className="text-indigo-700 hover:text-indigo-500">{ownerName}</Link> : ownerName || "Brak właściciela"}
                </td>
                <td className="px-3 py-3 align-top text-sm">
                  <VehicleStatusBadge vehicle={vehicle} />
                </td>
                <td className="max-w-40 px-3 py-3 align-top text-sm">
                  <ActiveWorkLink vehicle={vehicle} />
                </td>
                <td className="px-3 py-3 align-top text-sm text-gray-600">
                  {id ? <Link href={`/home/vehicles/${id}`} className="hover:text-indigo-700">{vin || "-"}</Link> : vin || "-"}
                </td>
              </tr>
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

async function ClientVehiclesView({ searchParams, clientId }: { searchParams: Promise<Record<string, string>>, clientId: string }) {
  const options = await searchParams;
  const apiOptions: Record<string, string> = Object.fromEntries(
    Object.entries(options).filter(([key]) => key !== "replacement")
  );
  apiOptions.offset = "0";
  apiOptions.limit = "200";

  const response = await httpGet(`vehicles/page?${new URLSearchParams(apiOptions).toString()}`);
  const data = (await response.json()) as VehiclesPageResult;
  const vehicles = (data.items || []).filter(item => isClientVehicle(item, clientId));
  const clientName = vehicles.map(item => getString(item, ["ownerName", "clientName"])).find(Boolean);

  return <Main header={
    <CardHeader
      title={clientName ? `Pojazdy klienta: ${clientName}` : "Pojazdy klienta"}
      description="Lista pojazdów powiązanych z wybranym klientem."
    >
      <div className="mt-2 shrink-0">
        <Link
          href="/home/vehicles"
          className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50"
        >
          Pokaż wszystkie pojazdy
        </Link>
      </div>
    </CardHeader>
  } narrow={false}>
    {vehicles.length > 0 ? <ClientVehiclesTable vehicles={vehicles} /> :
      <div className="rounded-md border border-gray-200 bg-white px-4 py-8 text-center shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900">Brak pojazdów przypisanych do tego klienta.</h3>
        <p className="mt-2 text-sm text-gray-500">Wróć do wszystkich pojazdów albo sprawdź kartę klienta.</p>
      </div>}
  </Main>
}

export default async function Page(
  { searchParams }: { searchParams: Promise<Record<string, string>> }) {

  const options = await searchParams;
  const isReplacementView = options.replacement === 'true';
  const clientId = options.clientId;
  const title = isReplacementView ? 'Flota pojazdów zastępczych' : 'Pojazdy';
  const description = isReplacementView
    ? 'Tutaj będą widoczne pojazdy należące do floty zastępczej warsztatu.'
    : 'Baza pojazdów powiązanych z klientami i zleceniami.';

  if (clientId && !isReplacementView) {
    return <ClientVehiclesView searchParams={searchParams} clientId={clientId} />;
  }

  if (isReplacementView) {
    return <Main header={
      <CardHeader title={title} description={description}>
        <div className="mt-2 shrink-0">
          <button
            type="button"
            disabled
            title="Osobny formularz floty zastępczej zostanie dodany w kolejnym etapie."
            className="inline-flex cursor-not-allowed items-center gap-x-1.5 rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-500 ring-1 shadow-xs ring-gray-200 ring-inset"
          >
            <PlusCircleIcon aria-hidden="true" className="-ml-0.5 size-5" />
            Dodaj pojazd do floty
          </button>
        </div>
      </CardHeader>
    } narrow={false}>
      <div className="rounded-md border border-sky-100 bg-sky-50 px-4 py-4 text-sm text-sky-900">
        <p className="font-semibold">Ten obszar będzie służył do ewidencji naszej floty zastępczej warsztatu.</p>
        <p className="mt-2 text-sky-800">
          Nie używamy tutaj formularza zwykłego pojazdu klienta, żeby nie mieszać aut poszkodowanych z flotą warsztatu.
        </p>
        <ul className="mt-3 grid gap-1 text-sky-800 sm:grid-cols-2">
          <li>dostępność pojazdu</li>
          <li>status dostępności</li>
          <li>aktualne zlecenie / klient</li>
          <li>data wydania</li>
          <li>planowana data zwrotu</li>
          <li>liczba dni najmu</li>
          <li>kod usługi / pozycja rozliczeniowa</li>
          <li>historia użycia pojazdu</li>
          <li>raport dla ubezpieczyciela</li>
          <li>dane do faktury po zakończeniu najmu</li>
        </ul>
      </div>
      <div className="mt-4 rounded-md border border-gray-200 bg-white px-4 py-8 text-center">
        <h3 className="text-sm font-semibold text-gray-900">Brak dodanych pojazdów zastępczych.</h3>
        <p className="mt-2 text-sm text-gray-500">
          Dodawanie floty zastępczej wymaga osobnego formularza i nie powinno prowadzić do bazy pojazdów klientów.
        </p>
      </div>
    </Main>
  }

  return <Main header={
    <SearchCardHeader title={title} description={description} pageName="vehicles">
    </SearchCardHeader>
  } narrow={false}>
     <form method="GET" > <Search
      searchParams={searchParams}
      resourceName="vehicles"
      columns={[

        {
          dataField: 'producer',
          headerText: 'Marka',
          dataClasses: () => {
            return "pl-4 font-medium gray-900 whitespace-nowrap";
          },
          dataFormatter: ({ producer }) => {
            const producerName = producer.trim().replace(" ", "-").toLowerCase();
            return (
              <div className="flex items-center " >
                <i className={clsx("pr-2 text-2xl", "car-" + producerName)}>  </i>
                <span className="text-sm">{producer}</span>
              </div>
            );
          }
        },
        {
          dataField: 'model',
          headerText: 'Model',
        },
        {
          dataField: 'regNr',
          headerText: 'Numer rejestracyjny',
          dataFormatter: ({ regNr, id, isReplacementVehicle }) => {
            return (
              <Link href={'/home/vehicles/' + id} >
                <h5 className="inline-flex items-center gap-2 font-semibold">
                  {regNr}
                  {isReplacementVehicle && <span className="rounded-full bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-700">Zastępczy</span>}
                </h5>
              </Link>
            );
          }
        },
        {
          dataField: 'ownerName',
          headerText: 'Właściciel',
          dataFormatter: ({ ownerName, ownerId }) => {
            if (!ownerName) return <p className="font-italic text-gray-400">Brak właściciela</p>;
            return (
              <Link href={'/home/clients/' + ownerId} >
                <h5 >{ownerName}</h5>
              </Link>
            );
          }
        },
        {
          dataField: 'vehicleStatus',
          headerText: 'Status',
          dataClasses: () => {
            return "px-3 py-4 text-sm whitespace-nowrap";
          },
          dataFormatter: (vehicle) => {
            return <VehicleStatusBadge vehicle={vehicle} />;
          }
        },
        {
          dataField: 'activeWork',
          headerText: 'Aktywne zlecenie',
          dataClasses: () => {
            return "max-w-40 px-3 py-4 text-sm whitespace-nowrap";
          },
          dataFormatter: (vehicle) => {
            return <ActiveWorkLink vehicle={vehicle} />;
          }
        },
        {
          dataField: 'vin',
          headerText: 'VIN',
          dataFormatter: ({ vin, id }) => {
            return (
              <Link href={'/home/vehicles/' + id} >
                <h5  >{vin}</h5>
              </Link>
            );
          }
        }
      ]}>
        <SimpleSearchBar searchParams={searchParams} placeholder="VIN, nr rejestracyjny, właściciel lub marka ..."></SimpleSearchBar> 
        </Search></form>
   
  </Main>



}
