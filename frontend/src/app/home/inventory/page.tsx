import { Fragment } from "react";
import Search from "../_components/Search";
import Main from "../_components/Main";
import { SearchCardHeader } from "../_components/SearchCardHeader";
import SimpleSearchBar from "../_components/SimpleSearchBar";
import Link from "next/link";

 
export default async function Page(
  { searchParams }: { searchParams: Promise<Record<string, string>> }) {

  const columns = [
    {
      dataField: 'code',
      headerText: 'Kod produktu',
      dataFormatter: ({ code, id }: { code: string, id: string }) => {
        return (
          <Link href={'/home/inventory/' + id} >
            <h5 className="mb-0 fs--1">{code} </h5>
          </Link>
        );
      }
    },
    {
      dataField: 'name',
      headerText: 'Nazwa',
      dataFormatter: ({ name }: { name: string }) => {
        return <p title={name} className="truncate" style={{ maxWidth: '500px', marginBottom: "-5px" }} >
          {name}
        </p>
      }
    },
    {
      dataField: 'price',
      headerText: 'Cena',
      dataFormatter: ({ price }: { price?: number }) => {
        return (
          <Fragment>
            {price&&'$'}{price?.toFixed(2)} 
          </Fragment>
        )
      },
    },
    {
      dataField: 'quantity',
      headerText: 'Ilość',
    },
    {
      dataField: 'discount',
      headerText: 'Rabat',
      dataFormatter: ({ discount }: { discount?: number }) => {
        return (
          <Fragment>
            {discount?.toFixed(0)} {discount&&'%'} 
          </Fragment>
        )
      },
    },
    {
      dataField: 'storageName',
      headerText: 'Lokalizacja'
    }
  ];
   
  return (
 
      <Main  header={
        <SearchCardHeader title="Znajdź w magazynie" pageName="inventory">
      </SearchCardHeader>
      } narrow={false}>
        <form method="GET" > <Search searchParams={searchParams} pageName="inventory" resourceName="spareparts" columns={columns}>
          <SimpleSearchBar searchParams={searchParams} placeholder="kod lub nazwa ..."></SimpleSearchBar>
          </Search></form>
      </Main> 
  )

} 