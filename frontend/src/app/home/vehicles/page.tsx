import clsx from "clsx";
import Search from "../_components/Search";
import 'car-makes-icons/dist/style.css';
import { SearchCardHeader } from "../_components/SearchCardHeader";
import Main from "../_components/Main";
import SimpleSearchBar from "../_components/SimpleSearchBar";
import Link from "next/link";
import { CardHeader } from "@/_components/Card";
import { PlusCircleIcon } from "@heroicons/react/24/outline";


export default async function Page(
  { searchParams }: { searchParams: Promise<Record<string, string>> }) {

  const options = await searchParams;
  const isReplacementView = options.replacement === 'true';
  const title = isReplacementView ? 'Flota pojazdów zastępczych' : 'Pojazdy';
  const description = isReplacementView
    ? 'Tutaj będą widoczne pojazdy należące do floty zastępczej warsztatu.'
    : 'Baza pojazdów powiązanych z klientami i zleceniami.';

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
