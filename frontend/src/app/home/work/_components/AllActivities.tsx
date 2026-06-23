'use client'

import {IActivities, IActivity, IOfferIssuance, IWorkData, IWorkDocument } from '../model'
import { IWorkCommunicationEntry } from '../communicationModel'
import clsx from 'clsx'
import Link from 'next/link'
import { WorkInformation } from './WorkInformation'
import { deleteAnActivity } from "../actions/deleteAnActivity"
import ConfirmDialog, { ConfirmDialogHandle } from '@/_components/ConfirmDialog'
import React  from 'react'
import { IButtonOption } from '@/_components/ButtonGroup' 
import HamburgerMenu from '@/_components/HamburgerMenu'  
import { ActivityCreatedBy } from './activity/ActivityCreatedBy' 
import { getActivityDisplayName } from './activity/getActivityDisplayName' 
import { IssuanceBadges } from './activity/badges/IssuanceBadges' 
import PricingDownloadLink from './activity/PricingDownloadLink' 
import WorkDocuments from './WorkDocuments'
import ReplacementVehicle from './ReplacementVehicle'
import WorkCommunication from './WorkCommunication'
import InvoiceSettlement from './InvoiceSettlement'
import PartOrders from './PartOrders'
import WorkTasks from './WorkTasks'
import QualityChecklist from './QualityChecklist'
import VehicleRelease from './VehicleRelease'

 
export default function Activities({
  work,
  activities,
  issueances,
  documents,
  communicationEntries,
}: {
  work: IWorkData,
  activities: IActivities,
  issueances: IOfferIssuance[]
  documents: IWorkDocument[]
  communicationEntries: IWorkCommunicationEntry[]
}) {
 
  const confirmRemoveActivityRef = React.useRef<ConfirmDialogHandle>(null);
  const containsRepairJobWithProductsOrServices = activities.items.findIndex(x=>!x.isEmpty && x.name == 'repairjob')>-1;
  const items = activities.items??[];
  //todo fix bordering 
  return (
    <aside className="2xl:fixed  pl-0 lg:pl-62 2xl:pl-0    bg-white  border-l-1  border-l-gray-200  overflow-y-auto overflow-x-hidden  inset-y-0 right-0    2xl:w-108    ">
      <ul role="list" className="  mb-0 pb-0   inset-y-0   2xl:w-108">
        <li className='  '>
          <div className="p-5 pb-10">
            <WorkInformation hasRepairJobWithProductsOrServices={containsRepairJobWithProductsOrServices} work={ work} ></WorkInformation>
          </div>
        </li>
        <li>
          <WorkTasks workId={work.id}></WorkTasks>
        </li>
        <li>
          <QualityChecklist workId={work.id}></QualityChecklist>
        </li>
        <li>
          <VehicleRelease workId={work.id}></VehicleRelease>
        </li>
        <li>
          <InvoiceSettlement workId={work.id}></InvoiceSettlement>
        </li>
        <li>
          <PartOrders workId={work.id}></PartOrders>
        </li>
        <li>
          <ReplacementVehicle workId={work.id} rental={work.replacementVehicle}></ReplacementVehicle>
        </li>
        <li>
          <WorkCommunication workId={work.id} entries={communicationEntries} documents={documents}></WorkCommunication>
        </li>
        <li>
          <WorkDocuments workId={work.id} documents={documents}></WorkDocuments>
        </li>
      </ul>
      
      <ul role="list" className="hidden 2xl:block border-b border-gray-900/5 inset-y-0  2xl:w-108">

        {items.length>1 &&items.map((item) => { //do not list if only single activity
          const id = item.id;
          const issuance =  issueances.find(x=>x.id === item.id);
          const name = getActivityDisplayName(item.name,item.number,issuance?.number);
          const isSelected = item.id === activities.current.id;
          const href = `/home/work/${ work.id}/${item.id}`;
          const editRef = href + '/edit';
         
          
          const options =work.issuance?[ ]: [
            { name: 'Edytuj' ,href:editRef},
            { name: 'Usuń',onClick:() => {
              confirmRemoveActivityRef.current?.open({
                title: name,
                description: "Czy na pewno chcesz to usunąć?",
                confirmObj: item
              })
            }}
          ] as IButtonOption[];

        
          return (
            <li key={id} className={clsx(isSelected ? " border  border-gray-900/5  rounded-xl bg-gray-50 " : "  ",
              "  px-4 xl:px-8 flex  m-4   items-center  justify-between gap-x-6 ")}>
               
              <div className="min-w-0  py-5">
                <div className="flex gap-x-1 xl:gap-x-2 ">
                  <p className={clsx(isSelected && "font-semibold", "truncate text-sm/6  text-gray-900")}>
                    <Link href={href}>
                      {name} 
                    </Link>
                  </p> 
                  {issuance&& <PricingDownloadLink name="Oferta"  hideLabel={true} id={issuance.id} number={issuance.number} ></PricingDownloadLink>}
                  {issuance&& <IssuanceBadges issueance={issuance}   ></IssuanceBadges>}
                </div>
                 <ActivityCreatedBy activity={item}></ActivityCreatedBy>  
              </div>  
              {options.length>0 &&
                 <div className="flex flex-none items-center gap-x-4">
                  <HamburgerMenu options={options}></HamburgerMenu> 
              </div>} 
            </li>
          )
        })}
      </ul> 
      <ConfirmDialog ref={confirmRemoveActivityRef} onConfirm={async (activity: IActivity) => {
        await deleteAnActivity(  work.id, activity.number, activity.name)
      }}></ConfirmDialog>
 
    </aside>
  )
}
