

'use client'
import { damageStatuses, getDamageStatusLabel, IWorkData, statusNames } from '../model';
import { ClockIcon, DocumentTextIcon, ShieldCheckIcon, TruckIcon, UserCircleIcon, WrenchScrewdriverIcon } from '@heroicons/react/20/solid';
import moment from 'moment';
import React from 'react';
import { startAnActivity } from '../actions/startAnActivity';
import ButtonGroup, { IButtonOption } from '@/_components/ButtonGroup';
import HamburgerMenu from '@/_components/HamburgerMenu'; 
import BaseDialog, { BaseDialogHandle } from '@/_components/BaseDialog';
import IssueInvoiceDialog from './activity/IssueInvoiceDialog';
import DeleteInvoiceDialog from './activity/DeleteInvoiceDialog';
import PricingDownloadLink from './activity/PricingDownloadLink';
import WorkStatusBadge from './activity/badges/WorkStatusBadge';
import { IssuanceBadges } from './activity/badges/IssuanceBadges';
import { togglePaid } from '../actions/togglePaid';
import SendPricingDialog from './activity/SendPricingDialog';
import { deleteWork } from '../actions/deleteAnActivity';
import ConfirmDialog, { ConfirmDialogHandle } from '@/_components/ConfirmDialog';
import { createACopy } from '../actions/createACopy';
import FormSwitch from '@/_components/FormSwitch'; 
import { Field, Label } from '@headlessui/react';
import { changeDamageStatus, changeWorkStatus } from '../actions/changeWorkStatus';
import FormTextArea from '@/_components/FormTextArea';


export function WorkInformation({
    work,
    hasRepairJobWithProductsOrServices,
}: {
    work: IWorkData,
    hasRepairJobWithProductsOrServices: boolean
}) {

    const editPath = '/home/work/edit/' + work.id;
 
    const vehicleSummary = [work.vehicleProducer, work.vehicleModel, work.vehicleVin, work.vehicleRegNr].filter(x => x).join(', ');
    const clientSummary = [work.clientName, work.clientPhone, work.clientEmail].filter(x => x).join(', ');
    const hasClaimDetails = Boolean(
        work.claimNumber ||
        work.insurer ||
        work.damageType ||
        work.damageStatus ||
        work.claimHandlerName ||
        work.claimHandlerEmail ||
        work.claimHandlerPhone ||
        work.claimReportedOn ||
        work.assignmentOfClaimSigned ||
        work.clientPaysVat ||
        work.audatexEstimateNumber ||
        work.estimateSentOn ||
        work.insurerDecisionOn ||
        work.supplementPaidOn ||
        work.insurerNotes ||
        work.plannedIntakeOn ||
        work.plannedReleaseOn ||
        work.plannedInspectionOn
    );
    const claimDetails = [
        ['Numer szkody', work.claimNumber],
        ['Ubezpieczyciel', work.insurer],
        ['Opiekun szkody', work.claimHandlerName],
        ['E-mail opiekuna', work.claimHandlerEmail],
        ['Telefon opiekuna', work.claimHandlerPhone],
        ['Rodzaj szkody', work.damageType],
        ['Status procesu', getDamageStatusLabel(work.damageStatus)],
        ['Data zgłoszenia szkody', work.claimReportedOn ? moment(work.claimReportedOn).locale('pl').format('DD.MM.YYYY') : ''],
        ['Cesja podpisana', work.assignmentOfClaimSigned ? 'Tak' : 'Nie'],
        ['Klient dopłaca VAT', work.clientPaysVat ? 'Tak' : 'Nie'],
        ['Kosztorys Audanet / Audatex', work.audatexEstimateNumber],
        ['Data wysłania kosztorysu', work.estimateSentOn ? moment(work.estimateSentOn).locale('pl').format('DD.MM.YYYY') : ''],
        ['Data decyzji ubezpieczyciela', work.insurerDecisionOn ? moment(work.insurerDecisionOn).locale('pl').format('DD.MM.YYYY') : ''],
        ['Data dopłaty', work.supplementPaidOn ? moment(work.supplementPaidOn).locale('pl').format('DD.MM.YYYY') : ''],
        ['Planowane przyjęcie', work.plannedIntakeOn ? moment(work.plannedIntakeOn).locale('pl').format('DD.MM.YYYY') : ''],
        ['Planowane wydanie', work.plannedReleaseOn ? moment(work.plannedReleaseOn).locale('pl').format('DD.MM.YYYY') : ''],
        ['Data oględzin', work.plannedInspectionOn ? moment(work.plannedInspectionOn).locale('pl').format('DD.MM.YYYY') : ''],
    ].filter(([, value]) => value);

    const deleteInvoiceRef = React.useRef<BaseDialogHandle>(null);
    const createInvoiceRef = React.useRef<BaseDialogHandle>(null);
    const sendInvoiceRef = React.useRef<BaseDialogHandle>(null);
    const changeStatusRef = React.useRef<BaseDialogHandle>(null);
    const deleteWorkRef = React.useRef<ConfirmDialogHandle>(null);
    const [statusToChange, setStatusToChange] = React.useState<{ kind: 'work' | 'damage', status: string } | null>(null);
    const [statusComment, setStatusComment] = React.useState('');

    const getStatusName = (status?: string | null) => {
        if (!status) return '';
        const normalizedStatus = status.toLowerCase();
        return statusNames[normalizedStatus] ?? getDamageStatusLabel(normalizedStatus);
    };

    const openStatusDialog = (status: string) => {
        setStatusToChange({ kind: 'work', status });
        setStatusComment('');
        changeStatusRef.current?.open();
    };

    const openDamageStatusDialog = (status: string) => {
        setStatusToChange({ kind: 'damage', status });
        setStatusComment('');
        changeStatusRef.current?.open();
    };
    
    const workMenuOptions = work.issuance ? [] : [
        { name: 'Przygotuj ofertę', onClick: async () => { await startAnActivity(work.id, "offer") } },
        { name: 'Rozpocznij naprawę', onClick: async () => { await startAnActivity(work.id, "repairjob") } },
        { name: 'Edytuj', href: editPath },
        { name: 'Usuń', redText:true, onClick:   () => { deleteWorkRef.current?.open({
            title:'Usuń zlecenie',description:'Czy na pewno chcesz usunąć to zlecenie?',confirmObj:work.id
        })  } },
    ] as IButtonOption[];
   
    workMenuOptions.push({ name: 'Utwórz kopię', onClick: async () => { await createACopy(work.id) } })
        ;

    const issuedButtonOptions = !work.issuance? []: [
        {
            name: 'Usuń fakturę',
            isPrimary:false,
            redText:true,
            inMenu:true,
            onClick:() => { deleteInvoiceRef.current?.open() }
        },
        {
            name: (work.issuance.isPaid?'Nieopłacona':'Płatność otrzymana'),
            isPrimary:!work.issuance.isPaid,
            onClick:async () => { await togglePaid(work.id,!work.issuance.isPaid) }
        } , {
            name: 'Wyślij fakturę',
            isPrimary:false,
            onClick:() => { sendInvoiceRef.current?.open() }
        },
    ] as IButtonOption[];

    const editButtonOptions = []  as IButtonOption[];

    if(!work.issuance){

      
        if(work.status!=='closed'){
            editButtonOptions.push({ 
                name: 'Zamknij',
                onClick: () => openStatusDialog('Closed'),
             });
        }
        else if(work.status==='closed'){
            editButtonOptions.push({ 
                name: 'Otwórz',
                isPrimary: true,
                onClick: () => openStatusDialog('Default'),
             });
        }

        if(hasRepairJobWithProductsOrServices && work.status!=='closed' ){
            editButtonOptions.push({
                name: 'Wystaw fakturę',
                onClick:() => { createInvoiceRef.current?.open() },
                isPrimary:true 
            });
        }
       
    }
    
    return (
        <>
            <IssueInvoiceDialog work={work} dialogRef={createInvoiceRef}></IssueInvoiceDialog>
            <DeleteInvoiceDialog work={work} dialogRef={deleteInvoiceRef}></DeleteInvoiceDialog>
            <SendPricingDialog work={work} dialogRef={sendInvoiceRef}></SendPricingDialog>
            <BaseDialog
                ref={changeStatusRef}
                title="Zmień status"
                description="Możesz dodać krótki komentarz do historii statusów."
                yesButtonText="Zapisz"
                onConfirm={async () => {
                    if (!statusToChange) return;
                    changeStatusRef.current?.loading(true);
                    if (statusToChange.kind === 'damage') {
                        await changeDamageStatus(work.id, statusToChange.status, statusComment);
                    }
                    else {
                        await changeWorkStatus(work.id, statusToChange.status, statusComment);
                    }
                    changeStatusRef.current?.close();
                }}
            >
                <FormTextArea
                    name="statusComment"
                    label="Komentarz"
                    value={statusComment}
                    placeholder="Opcjonalny komentarz"
                    onInputChange={(event) => setStatusComment(event.target.value)}
                />
            </BaseDialog>
            <ConfirmDialog ref={deleteWorkRef} onConfirm={async ()=>{
                await deleteWork(work.id) ;
            }} ></ConfirmDialog>
            <div className="lg:col-start-3 lg:row-end-1">
                <h2 className="sr-only">Podsumowanie</h2>
                <dl className="flex flex-wrap">
                    <div className="flex-auto xl:pt-6 xl:pl-6">
                        <dt className="text-base font-semibold text-gray-900 mr-2">Zlecenie nr {work.number}{' '}
                            <WorkStatusBadge   status={work.status}></WorkStatusBadge> 
                        </dt>
                        <dd className="text-sm/6 text-gray-500">
                            <time dateTime="2023-01-31">{moment(work.startedOn).locale('pl').format('DD.MM.YYYY HH:mm')}</time>
                        </dd>
                    </div>
                     
                    <div className="flex-none  col-span-2 self-end px-2 xl:px-6 pt-4">
                        <dt className="sr-only"></dt>
                        <dd className="inline-flex  ">
                            <HamburgerMenu options={workMenuOptions}></HamburgerMenu>
                        </dd>
                    </div>
                    <div className="mt-6 flex w-full flex-none gap-x-4 border-t border-gray-900/5 px-6 pt-6"></div>
                    {clientSummary &&
                        <div className="mt-4 flex w-full flex-none gap-x-4 xl:px-6">
                            <dt className="flex-none">
                                <span className="sr-only">Klient</span>
                                <UserCircleIcon aria-hidden="true" className="h-6  w-5 text-gray-400" />
                            </dt>
                            <dd className="text-sm/6 font-medium text-gray-900">
                                <span>{clientSummary}</span>
                            </dd> </div>
                    }

                    {vehicleSummary && <div className="mt-4 flex w-full flex-none gap-x-4 xl:px-6">
                        <dt className="flex-none">
                            <TruckIcon aria-hidden="true" className="h-6 w-5 text-gray-400" />
                        </dt>
                        <dd className="text-sm/6 text-gray-500">
                            <time dateTime="2023-01-31">{vehicleSummary}</time>
                        </dd>
                    </div>}
                    {work.mechanics?.length > 0 &&
                        <div className="mt-4 flex w-full flex-none gap-x-4 xl:px-6">
                            <dt className="flex-none">
                                <span className="sr-only">Status</span>
                                <WrenchScrewdriverIcon aria-hidden="true" className="h-6 w-5 text-gray-400" />
                            </dt>
                            <dd className="text-sm/6 text-gray-500">{work.mechanics.map((item) => item.name).join(', ')}</dd>
                        </div>
                    }
                    {work.notes && <div className="mt-4 flex w-full flex-none gap-x-4 xl:px-6">
                        <dt className="flex-none">
                            <span className="sr-only">Notatki</span>
                            <DocumentTextIcon aria-hidden="true" className="h-6 w-5 text-gray-400" />
                        </dt>
                        <dd className="text-sm/6 text-gray-500 whitespace-pre-line">{work.notes}</dd>
                    </div>}
                    {hasClaimDetails && <div className="mt-4 flex w-full flex-none gap-x-4 border-t border-gray-900/5 px-6 pt-4">
                        <dt className="flex-none">
                            <span className="sr-only">Ubezpieczyciel i szkoda</span>
                            <ShieldCheckIcon aria-hidden="true" className="h-6 w-5 text-gray-400" />
                        </dt>
                        <dd className="text-sm/6 text-gray-500">
                            <p className="font-semibold text-gray-900">Ubezpieczyciel i szkoda</p>
                            {claimDetails.map(([label, value]) => (
                                <p key={label}>
                                    <span className="font-medium text-gray-700">{label}:</span> {value}
                                </p>
                            ))}
                            {work.insurerNotes && <p className="mt-2 whitespace-pre-line">
                                <span className="font-medium text-gray-700">Uwagi do ubezpieczyciela:</span>{' '}
                                {work.insurerNotes}
                            </p>}
                            {!work.issuance && <div className="mt-3 max-w-xs">
                                <label htmlFor="damage-status-change" className="block text-sm font-medium text-gray-700">
                                    Zmień status procesu
                                </label>
                                <select
                                    id="damage-status-change"
                                    value={work.damageStatus || 'new'}
                                    onChange={(event) => openDamageStatusDialog(event.target.value)}
                                    className="mt-1 block w-full rounded-md border-0 bg-white py-2 pr-8 pl-3 text-sm text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600"
                                >
                                    {damageStatuses.map(status => (
                                        <option key={status.value} value={status.value}>{status.label}</option>
                                    ))}
                                </select>
                            </div>}
                        </dd>
                    </div>}
                    <div className="mt-4 flex w-full flex-none gap-x-4 border-t border-gray-900/5 px-6 pt-4">
                        <dt className="flex-none">
                            <span className="sr-only">Historia statusów</span>
                            <ClockIcon aria-hidden="true" className="h-6 w-5 text-gray-400" />
                        </dt>
                        <dd className="w-full text-sm/6 text-gray-500">
                            <p className="font-semibold text-gray-900">Historia statusów</p>
                            {(work.statusHistory?.length ?? 0) > 0 ? (
                                <div className="mt-2 space-y-3">
                                    {work.statusHistory?.map((item) => (
                                        <div key={item.id} className="border-l-2 border-gray-200 pl-3">
                                            <p className="font-medium text-gray-900">
                                                {moment(item.changedOn).locale('pl').format('DD.MM.YYYY HH:mm')}
                                            </p>
                                            <p>
                                                <span className="font-medium text-gray-700">Pracownik:</span>{' '}
                                                {item.changedByName || 'Nieznany'}
                                            </p>
                                            <p>
                                                <span className="font-medium text-gray-700">Status:</span>{' '}
                                                {getStatusName(item.oldStatus)} → {getStatusName(item.newStatus)}
                                            </p>
                                            {item.comment && <p className="whitespace-pre-line">
                                                <span className="font-medium text-gray-700">Komentarz:</span>{' '}
                                                {item.comment}
                                            </p>}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="mt-2">Brak historii statusów</p>
                            )}
                        </dd>
                    </div>
                    <div className="mt-6 flex gap-x-2 xl:px-6   ">  
                        {work.issuance && <>
                            
                        <PricingDownloadLink name='Faktura' id={work.id} hidePaperClip={false} number={work.issuance.invoiceNumber}></PricingDownloadLink>
                        <IssuanceBadges issueance={work.issuance}   ></IssuanceBadges></> } 
                    </div>

                    <div className="mt-6 flex w-full xl:px-6 ">
                        <dt className=" flex-auto">
                       {!work.issuance && work.status!=='closed'&&<Field className="flex mt-1 items-center"> 
                            <FormSwitch 
                               name='inprogress' 
                               defaultChecked={work.status === 'inprogress'} 
                               onChange={async (val)=>{
                                   const status = val? 'InProgress':'Default';
                                    await changeWorkStatus(work.id,status);
                               }}
                               >
                               </FormSwitch>
                            <Label as="span" className="ml-3 text-sm"> 
                                <span className="text-gray-500">W toku</span>
                            </Label>
                            </Field> } 
                        </dt>
                        <dd>
                            
                            {work.issuance ?
                                <ButtonGroup options={issuedButtonOptions}></ButtonGroup>:
                                <ButtonGroup options={editButtonOptions}></ButtonGroup>
                                }
                        </dd>
                    </div>

                </dl>

            </div>
        </>

    )
}
