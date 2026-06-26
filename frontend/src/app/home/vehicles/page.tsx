import clsx from "clsx";
import Search from "../_components/Search";
import 'car-makes-icons/dist/style.css';
import { SearchCardHeader } from "../_components/SearchCardHeader";
import Main from "../_components/Main";
import SimpleSearchBar from "../_components/SimpleSearchBar";
import Link from "next/link";


export default async function Page(
  { searchParams }: { searchParams: Promise<Record<string, string>> }) {

  const options = await searchParams;
  const isReplacementView = options.replacement === 'true';
  const title = isReplacementView ? 'Pojazdy zastępcze' : 'Pojazdy';
  const description = isReplacementView
    ? 'Zarządzaj flotą zastępczą, wydaniami, zwrotami i dostępnością pojazdów.'
    : 'Baza pojazdów powiązanych z klientami i zleceniami.';

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
