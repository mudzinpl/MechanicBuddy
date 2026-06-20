 
import Main from "../_components/Main";
import Search from "../_components/Search";
import { SearchCardHeader } from "../_components/SearchCardHeader";
import SimpleSearchBar from "../_components/SimpleSearchBar";
import Link from "next/link";

export default async function Page(
  { searchParams }: { searchParams: Promise<Record<string, string>> }) {


  return <Main header={
    <SearchCardHeader title="Znajdź klientów" pageName="clients">
    </SearchCardHeader>
  } narrow={false}>
    <form method="GET" > <Search
      searchParams={searchParams}
      resourceName="clients"
      columns={[{
        dataField: "name",
        headerText: "Nazwa",
        dataFormatter: ({ id, name }) => {
          return (
            <Link href={'/home/clients/' + id}>
              {name}
            </Link>
          );
        }
      }, {
        dataField: "phone",
        headerText: "Telefon",
      }, {
        dataField: "email",
        headerText: "E-mail",
      }, {
        dataField: "address",
        headerText: "Adres",
      }]}>

      <SimpleSearchBar searchParams={searchParams} placeholder="nazwa, adres lub telefon ..."></SimpleSearchBar>
    </Search></form>

  </Main>


}