import Search from "../_components/Search";
import moment from "moment";
import { damageStatuses, IOfferIssuance, IWorkIssuance } from "./model";
import PricingDownloadLink from "./_components/activity/PricingDownloadLink";
import { ArrowDownTrayIcon, PaperClipIcon, TruckIcon } from "@heroicons/react/20/solid";
import Spinner from "@/_components/Spinner";
import BlueBadge from "@/_components/BlueBadge";
import WorkStatusBadge from "./_components/activity/badges/WorkStatusBadge";
import { EmailSentBadge, OverdueBadge } from "./_components/activity/badges/IssuanceBadges";
import { SearchCardHeader } from "../_components/SearchCardHeader";
import { Card } from "@/_components/Card";
import SearchStatusFilter from "./_components/SearchStatusFilter";
import SearchParams from "./_components/SearchParams";
import PrimaryButton from "@/_components/PrimaryButton";
import SearchInput from "../_components/SearchInput";
import FormInput from "@/_components/FormInput";
import Link from "next/link";
import Select from "@/_components/Select";
import FormLabel from "@/_components/FormLabel";
import DamageStatusBadge from "./_components/activity/badges/DamageStatusBadge";

export default async function Page(
  { searchParams }: { searchParams: Promise<Record<string, string>> }) {

  const options = (await searchParams);

  const isInvoiceView = options.issued == 'on';

  const secondColumn = isInvoiceView ? {
    dataField: 'issuance',
    headerText: 'Faktura',

    dataFormatter: ({ issuance, id }: { issuance: IWorkIssuance, id: string }) => {
      return (
        issuance ?
          <div className="flex gap-x-2 ">
            <div>  <PricingDownloadLink
              name='Faktura'
              id={id}
              number={issuance.invoiceNumber}
              downloadingElement={<Spinner></Spinner>}
              hidePaperClip={true}
              clickableElement={<ArrowDownTrayIcon aria-hidden="true" className="h-6 w-5 text-gray-400" ></ArrowDownTrayIcon>} >
            </PricingDownloadLink> </div>
            <div>
              <EmailSentBadge issueance={issuance}></EmailSentBadge>
              <OverdueBadge issueance={issuance}></OverdueBadge></div>
          </div> :
          <></>
      );
    }
  } : {
    dataField: 'offerissuance',
    headerText: 'Naprawa, oferta',

    dataFormatter: ({ offerIssuance, hasRepairs, numberOfOffers }: { hasRepairs: boolean, offerIssuance: IOfferIssuance, numberOfOffers: number }) => {

      return (
        <div className="flex gap-x-2">
          {hasRepairs && <BlueBadge text="Zlecenie naprawy"></BlueBadge>}
          {numberOfOffers > 1 ?
            <BlueBadge text="Wiele ofert"></BlueBadge> :
            <>
              {offerIssuance &&
                <>
                  <div>  <PricingDownloadLink
                    name='Oferta'
                    id={offerIssuance.id}
                    number={offerIssuance.number}
                    downloadingElement={<Spinner></Spinner>}
                    hidePaperClip={true}
                    hideLabel={false}
                    clickableElement={<ArrowDownTrayIcon aria-hidden="true" className="h-6 w-5 text-gray-400" ></ArrowDownTrayIcon>} >
                  </PricingDownloadLink> </div>
                  <div> <h5><EmailSentBadge issueance={offerIssuance}></EmailSentBadge></h5></div>
                </>
              }
            </>
          }</div>

      );
    }
  };

  const columns = [
    {
      dataField: 'workNr',
      headerText: 'Zlecenie',

      dataFormatter: ({
        id,
        workNr,
        status,
        hasActiveReplacementVehicle,
        assignmentOfClaimSigned,
        powerOfAttorneySigned,
        clientPaysVat,
        settlementStatus
      }: {
        id: string,
        status: string,
        workNr: string,
        hasActiveReplacementVehicle: boolean,
        assignmentOfClaimSigned: boolean,
        powerOfAttorneySigned: boolean,
        clientPaysVat: boolean,
        settlementStatus?: string
      }) => {
        const badges = [
          !assignmentOfClaimSigned ? 'Brak cesji' : '',
          !powerOfAttorneySigned ? 'Brak pełnomocnictwa' : '',
          clientPaysVat ? 'Dopłata VAT' : '',
          (settlementStatus || 'unsettled') !== 'settled' ? 'Nierozliczone' : '',
        ].filter(Boolean);

        return (
          <Link href={'/home/work/' + id}>
            <div>
              <h5 className="inline-flex items-center gap-1.5">Zlecenie nr {workNr}
                {' '} {!isInvoiceView && <WorkStatusBadge status={status} ></WorkStatusBadge>}
                {hasActiveReplacementVehicle && <span title="Aktywny pojazd zastępczy" className="inline-flex items-center rounded-full bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-700">
                  <TruckIcon className="mr-1 size-3" aria-hidden="true" />
                  Zastępczy
                </span>}
              </h5>
              {badges.length > 0 && <div className="mt-1 flex flex-wrap gap-1">
                {badges.map(badge => (
                  <span key={badge} className="inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                    {badge}
                  </span>
                ))}
              </div>}
            </div>
          </Link>
        );
      }
    },
    secondColumn,
    {
      dataField: 'damageStatus',
      headerText: 'Status procesu',
      dataFormatter: ({ damageStatus }: { damageStatus: string }) => {
        return <DamageStatusBadge status={damageStatus}></DamageStatusBadge>;
      }
    },
    {
      dataField: 'claimNumber',
      headerText: 'Szkoda',
      dataFormatter: ({ insurer, claimNumber, damageType }: { insurer?: string, claimNumber?: string, damageType?: string }) => (
        <div className="max-w-52 text-sm">
          <p className="font-medium text-gray-900">{insurer || 'Brak ubezpieczyciela'}</p>
          <p className="text-gray-500">{claimNumber || 'Brak numeru szkody'}</p>
          {damageType && <span className="mt-1 inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">{damageType}</span>}
        </div>
      )
    },
    {
      dataField: 'documentCount',
      headerText: 'Dokumenty',
      dataFormatter: ({ documentCount }: { documentCount: number }) => (
        <span className="inline-flex items-center gap-1.5" title={`Liczba dokumentów: ${documentCount}`}>
          <PaperClipIcon className="size-4 text-gray-400" aria-hidden="true" />
          <span>{documentCount}</span>
        </span>
      )
    },
    {
      dataField: 'startedOn',
      headerText: 'Rozpoczęto',//  {moment(activity?.startedOn, true).format('LLL')}
      dataFormatter: ({ startedOn }: { startedOn: Date }) => {
        return (
          moment(startedOn, true).locale('pl').format('DD.MM.YYYY')
        );
      }
    },

    {
      dataField: 'clientId',
      headerText: 'Klient',
      dataFormatter: ({ clientName, clientId }: { clientName: string, clientId: string }) => {
        return (
          <Link href={'/home/clients/' + clientId} >
            <h5 >{clientName}</h5>
          </Link>
        );
      }
    },
    {
      dataField: 'vehicleId',
      headerText: 'Pojazd',
      dataFormatter: ({ regNr, vehicleId }: { regNr: string, vehicleId: string }) => {
        return (
          <Link href={'/home/vehicles/' + vehicleId} >
            <h5 className="mb-0 fs--1">{regNr}</h5>
          </Link>
        );
      }
    },

    {
      dataField: 'mechanicNames',
      headerText: 'Mechanicy',
    },
    {
      dataField: 'notes',
      headerText: 'Opis',
      dataFormatter: ({ notes }: { notes: string }) => {
        return (
          <p title={notes} className="truncate" style={{ maxWidth: '300px', marginBottom: "-5px" }} >
            {notes}
          </p>
        );
      }
    }
  ]


  return <main className=" lg:pl-62   ">
    <form method="GET" >
      <div className=" sm:py-6 px-4 sm:px-8   sm:gap-4">


        <div className="">

          <Card header={
            
            <SearchCardHeader title="Znajdź zlecenia" pageName="work">
            </SearchCardHeader>}  >

            <Search
              searchParams={searchParams}
              resourceName="work"
              idField="id"
              rowClass={(item) => {
                return (item['status'] === 'closed' ? 'line-through' : '')
              }}
              columns={columns}> 
              <div className=" 3xl:flex">
                 <div className="  grid grid-cols-1  md:grid-cols-12 md:grid-flow-row md:gap-x-2 3xl:grid-flow-col  3xl:grid-cols-24   p-0 3xl:gap-x-2  gap-y-2  "> 
                      <div className="3xl:col-span-6 md:col-span-7 "   >
                        <SearchStatusFilter issued={options.issued === 'on'} status={options.status}></SearchStatusFilter>
                        <SearchInput searchParams={searchParams} placeholder="numer, klient, VIN lub nr rejestracyjny pojazdu" ></SearchInput> 
                      </div> 
                      <div className="3xl:col-span-4  md:col-span-5 ">
                         <FormInput name="saleable" label="Produkt lub usługa" placeholder="kod lub nazwa ..." defaultValue={options.saleable}  ></FormInput>
                      </div>
                      <div className="3xl:col-span-6 md:col-span-5">
                        <FormLabel name="damageStatus" label="Status procesu"></FormLabel>
                        <div className="mt-2 grid grid-cols-1">
                          <Select name="damageStatus" defaultValue={options.damageStatus || ''}>
                            <option value="">Wszystkie statusy</option>
                            {damageStatuses.map(status => (
                              <option key={status.value} value={status.value}>{status.label}</option>
                            ))}
                          </Select>
                        </div>
                      </div>
                      <div  className="3xl:col-span-8 md:col-span-12" >
                      <SearchParams options={options}></SearchParams>
                      </div>
                      
                  </div> 
                  <div className="mx-2 text-right mt-8">
                        <PrimaryButton   id="btnSubmit">Szukaj</PrimaryButton>
                   </div>
              </div>
                
            </Search>
          </Card>

        </div>
      </div>
    </form>
  </main>
}
