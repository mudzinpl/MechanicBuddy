import PrimaryButton from "@/_components/PrimaryButton";
import { httpGet } from "@/_lib/server/query-api";
import Link from "next/link";
import Main from "../_components/Main";
import { SearchCardHeader } from "../_components/SearchCardHeader";
import SearchInput from "../_components/SearchInput";

type ClientRow = Record<string, unknown>;

type ClientView = "all" | "active" | "history" | "company";

type ClientType = "Firma" | "Flota" | "Indywidualny";

interface ClientsPageResult {
  hasMore: boolean;
  items: ClientRow[];
}

const relationStyles: Record<string, string> = {
  "Aktywna naprawa": "bg-blue-50 text-blue-700 ring-blue-200",
  "Historia": "bg-gray-50 text-gray-700 ring-gray-200",
  "Zaległość / nierozliczone": "bg-amber-50 text-amber-800 ring-amber-200",
};

const clientTypeStyles: Record<ClientType, string> = {
  "Firma": "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "Flota": "bg-indigo-50 text-indigo-700 ring-indigo-200",
  "Indywidualny": "bg-slate-50 text-slate-700 ring-slate-200",
};

const viewLabels: Record<ClientView, string> = {
  all: "Wszyscy",
  active: "Aktywni",
  history: "Historia",
  company: "Firmy",
};

function firstValue(item: ClientRow, keys: string[]) {
  for (const key of keys) {
    const value = item[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
}

function getString(item: ClientRow, keys: string[]) {
  const value = firstValue(item, keys);
  return value === undefined ? "" : String(value);
}

function getNumber(item: ClientRow, keys: string[]) {
  const value = firstValue(item, keys);
  if (value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function isCompanyClient(item: ClientRow) {
  const type = getString(item, ["type", "clientType", "customerType", "kind"]).toLowerCase();
  const name = getString(item, ["name", "displayName", "companyName"]);
  return Boolean(
    getString(item, ["nip", "taxNumber", "regon", "companyName"]) ||
    type.includes("firm") ||
    type.includes("company") ||
    type.includes("firma") ||
    /sp\.?\s*z\s*o\.?o\.?|s\.a\.|spolka|spółka|warsztat|firma/i.test(name)
  );
}

function getActiveWorkCount(item: ClientRow) {
  return getNumber(item, ["activeWorks", "activeWorkCount", "activeCases", "activeCasesCount", "activeOrders", "openWorks", "openWorksCount"]);
}

function getHistoryCount(item: ClientRow) {
  return getNumber(item, ["workCount", "worksCount", "casesCount", "ordersCount", "historyCount", "totalWorks", "totalCases"]);
}

function hasDebt(item: ClientRow) {
  const amount = getNumber(item, ["overdueAmount", "unpaidAmount", "debtAmount", "balanceDue", "underpaymentAmount"]);
  const status = getString(item, ["settlementStatus", "paymentStatus", "invoiceStatus"]).toLowerCase();
  return Boolean((amount !== undefined && amount > 0) || status.includes("zaleg") || status.includes("nierozlic"));
}

function getClientType(item: ClientRow): ClientType {
  const historyCount = getHistoryCount(item) ?? 0;
  const type = getString(item, ["type", "clientType", "customerType", "kind", "relation"]).toLowerCase();

  if (type.includes("fleet") || type.includes("flota") || historyCount >= 3) return "Flota";
  if (isCompanyClient(item)) return "Firma";
  return "Indywidualny";
}

function getClientRelation(item: ClientRow) {
  const activeWorks = getActiveWorkCount(item) ?? 0;
  const historyCount = getHistoryCount(item) ?? activeWorks;

  if (hasDebt(item)) return "Zaległość / nierozliczone";
  if (activeWorks > 0) return "Aktywna naprawa";
  if (historyCount > 0) return "Historia";
  return "Historia";
}

function matchesView(item: ClientRow, view: ClientView) {
  const relation = getClientRelation(item);
  if (view === "all") return true;
  if (view === "active") return relation === "Aktywna naprawa";
  if (view === "history") return relation === "Historia";
  if (view === "company") return isCompanyClient(item) || getClientType(item) === "Flota";
  return true;
}

function shortenAddress(address: string) {
  if (!address) return "Brak adresu";

  const parts = address.split(/[\n,]/).map(x => x.trim()).filter(Boolean);
  const city = parts.find(part => /\d{2}-\d{3}\s+/.test(part));
  if (city) return city.replace(/^\d{2}-\d{3}\s+/, "");

  return parts.length > 1 ? parts[parts.length - 1] : address;
}

function formatDate(value: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}.${month}.${date.getFullYear()}`;
}

function getLastVisit(item: ClientRow) {
  const value = getString(item, ["lastWorkDate", "lastCaseDate", "lastVisit", "lastVisitOn", "changedOn", "createdOn"]);
  return formatDate(value);
}

function buildHref(baseParams: Record<string, string>, view: ClientView) {
  const params = new URLSearchParams(baseParams);
  params.delete("offset");
  if (view === "all") params.delete("view");
  else params.set("view", view);
  const query = params.toString();
  return query ? `/home/clients?${query}` : "/home/clients";
}

export default async function Page(
  { searchParams }: { searchParams: Promise<Record<string, string>> }) {

  const options = await searchParams;
  const offset = parseInt(options.offset ?? "0");
  const limit = parseInt(options.limit ?? "30");
  const view = (["all", "active", "history", "company"].includes(options.view) ? options.view : "all") as ClientView;

  const apiOptions: Record<string, string> = Object.fromEntries(
    Object.entries(options).filter(([key]) => key !== "view")
  );
  apiOptions.offset = offset.toString();
  apiOptions.limit = limit.toString();

  const response = await httpGet(`clients/page?${new URLSearchParams(apiOptions).toString()}`);
  const data = (await response.json()) as ClientsPageResult;
  const clients = (data.items || []).filter(item => matchesView(item, view));

  const pageParams = {
    ...options,
    offset: offset.toString(),
    limit: limit.toString(),
  };
  const prevParams = new URLSearchParams({ ...pageParams, offset: Math.max(0, offset - limit).toString() });
  const nextParams = new URLSearchParams({ ...pageParams, offset: (offset + limit).toString() });

  return <Main header={
    <SearchCardHeader title="Klienci" pageName="clients">
    </SearchCardHeader>
  } narrow={false}>
    <form method="GET" className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      {view !== "all" && <input type="hidden" name="view" value={view} />}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 flex-1">
          <SearchInput searchParams={searchParams} placeholder="nazwa, adres, e-mail lub telefon ..." />
        </div>
        <PrimaryButton id="btnSubmit" className="w-full lg:w-auto">Szukaj</PrimaryButton>
      </div>
      <div className="mt-4 flex flex-wrap gap-2" aria-label="Filtry klientów">
        {(Object.keys(viewLabels) as ClientView[]).map(filterView => (
          <Link
            key={filterView}
            href={buildHref(options, filterView)}
            className={filterView === view
              ? "rounded-full bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-xs"
              : "rounded-full bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-700 ring-1 ring-gray-200 ring-inset hover:bg-gray-100"}
          >
            {viewLabels[filterView]}
          </Link>
        ))}
      </div>
    </form>

    <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      {clients.length === 0 ?
        <div className="px-6 py-10 text-center">
          <h3 className="text-sm font-semibold text-gray-900">Brak klientów dla wybranego filtra.</h3>
          <p className="mt-1 text-sm text-gray-500">Zmień filtr albo wyszukaj klienta.</p>
        </div> :
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 pr-3 pl-4 text-left text-xs font-semibold tracking-wide text-gray-600 uppercase sm:pl-6">Klient</th>
                <th className="px-3 py-3 text-left text-xs font-semibold tracking-wide text-gray-600 uppercase">Relacja</th>
                <th className="px-3 py-3 text-left text-xs font-semibold tracking-wide text-gray-600 uppercase">Typ</th>
                <th className="px-3 py-3 text-left text-xs font-semibold tracking-wide text-gray-600 uppercase">Kontakt</th>
                <th className="px-3 py-3 text-left text-xs font-semibold tracking-wide text-gray-600 uppercase">Miejscowość</th>
                <th className="px-3 py-3 text-left text-xs font-semibold tracking-wide text-gray-600 uppercase">Aktywne sprawy</th>
                <th className="px-3 py-3 text-left text-xs font-semibold tracking-wide text-gray-600 uppercase">Historia</th>
                <th className="px-3 py-3 text-left text-xs font-semibold tracking-wide text-gray-600 uppercase">Ostatnia sprawa</th>
                <th className="relative py-3 pr-4 pl-3 sm:pr-6"><span className="sr-only">Akcje</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {clients.map(item => {
                const id = getString(item, ["id"]);
                const name = getString(item, ["name", "displayName", "companyName"]) || "Klient bez nazwy";
                const phone = getString(item, ["phone", "phoneNumber", "mobile"]);
                const email = getString(item, ["email", "emailAddress"]);
                const address = getString(item, ["address", "fullAddress"]);
                const relation = getClientRelation(item);
                const clientType = getClientType(item);
                const activeWorks = getActiveWorkCount(item);
                const historyCount = getHistoryCount(item);
                const relationClass = relationStyles[relation] || relationStyles["Historia"];
                const clientTypeClass = clientTypeStyles[clientType];

                return <tr key={id} className="hover:bg-gray-50">
                  <td className="py-3 pr-3 pl-4 align-top sm:pl-6">
                    <Link href={`/home/clients/${id}`} className="font-semibold text-gray-900 hover:text-indigo-700">
                      {name}
                    </Link>
                  </td>
                  <td className="px-3 py-3 align-top">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${relationClass}`}>
                      {relation}
                    </span>
                  </td>
                  <td className="px-3 py-3 align-top">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${clientTypeClass}`}>
                      {clientType}
                    </span>
                  </td>
                  <td className="px-3 py-3 align-top text-sm text-gray-600">
                    <div>{phone || "Brak telefonu"}</div>
                    <div className="max-w-48 truncate text-xs text-gray-500">{email || "Brak e-maila"}</div>
                  </td>
                  <td className="max-w-44 px-3 py-3 align-top text-sm text-gray-600">
                    <span className="block truncate" title={address}>{shortenAddress(address)}</span>
                  </td>
                  <td className="px-3 py-3 align-top text-sm font-medium text-gray-900">
                    {activeWorks !== undefined ? activeWorks : "-"}
                  </td>
                  <td className="px-3 py-3 align-top text-sm text-gray-600">
                    {historyCount !== undefined ? historyCount : "-"}
                  </td>
                  <td className="px-3 py-3 align-top text-sm text-gray-600">
                    {getLastVisit(item)}
                  </td>
                  <td className="py-3 pr-4 pl-3 align-top text-right text-sm font-medium sm:pr-6">
                    <div className="flex flex-col items-end gap-1 whitespace-nowrap">
                      <Link href={`/home/clients/${id}`} className="text-indigo-700 hover:text-indigo-500">Szczegóły</Link>
                      <Link href={`/home/clients/edit/${id}`} className="text-gray-600 hover:text-gray-900">Edytuj</Link>
                      {id && <Link href={`/home/work?clientId=${id}`} className="text-gray-600 hover:text-gray-900">Zlecenia</Link>}
                      {id && <Link href={`/home/vehicles?clientId=${id}`} className="text-gray-600 hover:text-gray-900">Pojazdy</Link>}
                    </div>
                  </td>
                </tr>
              })}
            </tbody>
          </table>
        </div>
      }
      <nav
        aria-label="Paginacja"
        className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6"
      >
        <div className="hidden sm:block">
          <p className="text-sm text-gray-700">
            Wyświetlanie <span className="font-medium">{offset + 1}</span> do <span className="font-medium">{offset + limit}</span>
          </p>
        </div>
        <div className="flex flex-1 justify-between sm:justify-end">
          <Link href={`/home/clients?${prevParams.toString()}`}
            className={offset <= 0
              ? "pointer-events-none relative inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-400 ring-1 ring-gray-300 ring-inset"
              : "relative inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-gray-300 ring-inset hover:bg-gray-50"}
          >Poprzednia</Link>
          <Link href={`/home/clients?${nextParams.toString()}`}
            className={!data.hasMore
              ? "pointer-events-none relative ml-3 inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-400 ring-1 ring-gray-300 ring-inset"
              : "relative ml-3 inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-gray-300 ring-inset hover:bg-gray-50"}
          >Następna</Link>
        </div>
      </nav>
    </div>
  </Main>
}
