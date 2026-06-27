

'use client'
import { damageStatuses, getDamageStatusLabel, getEstimateStatusLabel, getEstimateSystemLabel, getSettlementStatusLabel, IWorkData, statusNames } from '../model';
import { BanknotesIcon, ClipboardDocumentListIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/20/solid';
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

type DetailRow = [string, React.ReactNode];

function DetailRows({ rows }: { rows: DetailRow[] }) {
    return (
        <dl className="space-y-1 text-sm/6">
            {rows.map(([label, value]) => (
                <div key={label} className="grid grid-cols-5 gap-2">
                    <dt className="col-span-2 font-medium text-gray-700">{label}</dt>
                    <dd className="col-span-3 text-gray-500">{value}</dd>
                </div>
            ))}
        </dl>
    );
}

function DetailSection({
    title,
    icon: Icon,
    defaultOpen = false,
    children,
}: {
    title: string,
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>,
    defaultOpen?: boolean,
    children: React.ReactNode
}) {
    return (
        <details open={defaultOpen} className="group border-t border-gray-900/5 px-6 py-4">
            <summary className="flex cursor-pointer list-none items-center gap-x-3 text-sm font-semibold text-gray-900">
                <Icon aria-hidden="true" className="h-5 w-5 text-gray-400" />
                <span>{title}</span>
                <span className="ml-auto text-xs font-medium text-gray-400 group-open:hidden">▶</span>
                <span className="ml-auto hidden text-xs font-medium text-gray-400 group-open:inline">▼</span>
            </summary>
            <div className="mt-3 text-sm/6 text-gray-500">
                {children}
            </div>
        </details>
    );
}

export function WorkInformation({
    work,
    hasRepairJobWithProductsOrServices,
    settlementContent,
}: {
    work: IWorkData,
    hasRepairJobWithProductsOrServices: boolean,
    settlementContent?: React.ReactNode
}) {



    const editPath = '/home/work/edit/' + work.id;
 
    const vehicleSummary = [work.vehicleProducer, work.vehicleModel, work.vehicleVin, work.vehicleRegNr].filter(x => x).join(', ');
    const clientSummary = [work.clientName, work.clientPhone, work.clientEmail].filter(x => x).join(', ');
    const formatDate = (value?: string | null) => value ? moment(value).locale('pl').format('DD.MM.YYYY') : '';
    const formatDateTime = (value?: string | null) => value ? moment(value).locale('pl').format('DD.MM.YYYY HH:mm') : '';
    const formatCurrency = (value?: number | null) => typeof value === 'number'
        ? new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(value).replace(/\u00A0/g, ' ')
        : '';
    const hasClaimDetails = Boolean(
        work.claimNumber ||
        work.insurer ||
        work.damageType ||
        work.damageStatus ||
        work.claimHandlerName ||
        work.claimHandlerEmail ||
        work.claimHandlerPhone ||
        work.claimReportedOn ||
        work.insurerDecisionOn ||
        work.supplementPaidOn ||
        work.insurerNotes ||
        work.plannedIntakeOn ||
        work.plannedReleaseOn ||
        work.plannedInspectionOn
    );
    const hasEstimateDetails = Boolean(
        work.audatexEstimateNumber ||
        work.estimateSystem ||
        work.estimateVersion ||
        work.estimatePreparedOn ||
        work.estimateNetAmount ||
        work.estimateVatAmount ||
        work.estimateGrossAmount ||
        work.estimateLaborMechanicalRbg ||
        work.estimateLaborPaintRbg ||
        work.estimateStatus ||
        work.estimateSentOn ||
        work.estimateAcceptedOn ||
        work.estimateNotes
    );
    const claimDetails = [
        ['Numer szkody', work.claimNumber],
        ['Ubezpieczyciel', work.insurer],
        ['Opiekun szkody', work.claimHandlerName],
        ['E-mail opiekuna', work.claimHandlerEmail],
        ['Telefon opiekuna', work.claimHandlerPhone],
        ['Rodzaj szkody', work.damageType],
        ['Status procesu', getDamageStatusLabel(work.damageStatus)],
        ['Data zgłoszenia szkody', formatDate(work.claimReportedOn)],
        ['Data decyzji ubezpieczyciela', formatDate(work.insurerDecisionOn)],
        ['Data dopłaty', formatDate(work.supplementPaidOn)],
        ['Planowane przyjęcie', formatDate(work.plannedIntakeOn)],
        ['Planowane wydanie', formatDate(work.plannedReleaseOn)],
        ['Data oględzin', formatDate(work.plannedInspectionOn)],
    ].filter(([, value]) => value) as DetailRow[];
    const estimateDetails = [
        ['Numer kosztorysu', work.audatexEstimateNumber],
        ['System', getEstimateSystemLabel(work.estimateSystem)],
        ['Wersja kosztorysu', work.estimateVersion],
        ['Data sporządzenia', formatDate(work.estimatePreparedOn)],
        ['Wartość netto', formatCurrency(work.estimateNetAmount)],
        ['VAT', formatCurrency(work.estimateVatAmount)],
        ['Wartość brutto', formatCurrency(work.estimateGrossAmount)],
        ['RBG blacharsko-mechaniczne', work.estimateLaborMechanicalRbg],
        ['RBG lakiernicze', work.estimateLaborPaintRbg],
        ['Status kosztorysu', getEstimateStatusLabel(work.estimateStatus)],
        ['Data wysłania do ubezpieczyciela', formatDate(work.estimateSentOn)],
        ['Data akceptacji', formatDate(work.estimateAcceptedOn)],
    ].filter(([, value]) => value) as DetailRow[];
    const settlementDetails = [
        ['Cesja podpisana', work.assignmentOfClaimSigned ? 'Tak' : 'Nie'],
        ['Data podpisania cesji', formatDate(work.assignmentOfClaimSignedOn)],
        ['Pełnomocnictwo podpisane', work.powerOfAttorneySigned ? 'Tak' : 'Nie'],
        ['Data podpisania pełnomocnictwa', formatDate(work.powerOfAttorneySignedOn)],
        ['Klient dopłaca VAT', work.clientPaysVat ? 'Tak' : 'Nie'],
        ['Procent VAT po stronie klienta', `${work.clientVatPercent ?? (work.clientPaysVat ? 100 : 0)}%`],
        ['Kwota dopłaty VAT', formatCurrency(work.clientVatAmount)],
        ['Kwota niedopłaty', formatCurrency(work.underpaymentAmount)],
        ['Status rozliczenia', getSettlementStatusLabel(work.settlementStatus)],
        ['Data wezwania do dopłaty', formatDate(work.paymentDemandOn)],
        ['Data zapłaty', formatDate(work.paymentReceivedOn)],
    ].filter(([, value]) => value) as DetailRow[];
    const missingItems = [
        !work.assignmentOfClaimSigned ? 'Brak cesji' : '',
        !work.powerOfAttorneySigned ? 'Brak pełnomocnictwa' : '',
        !work.audatexEstimateNumber ? 'Brak kosztorysu' : '',
        !work.insurerDecisionOn ? 'Brak decyzji ubezpieczyciela' : '',
        !work.settlementStatus ? 'Brak statusu rozliczenia' : '',
    ].filter(Boolean);
    const summaryRows = [
        ['Numer', work.number],
        ['Utworzono', formatDateTime(work.startedOn?.toString())],
        ['Status zlecenia', <WorkStatusBadge key="status" status={work.status}></WorkStatusBadge>],
        ['Status procesu', getDamageStatusLabel(work.damageStatus)],
        ['Mechanicy', work.mechanics?.length > 0 ? work.mechanics.map((item) => item.name).join(', ') : 'Nie przypisano'],
        ['Klient', clientSummary || 'Brak danych klienta'],
        ['Pojazd', vehicleSummary || 'Brak danych pojazdu'],
    ].filter(([, value]) => value) as DetailRow[];

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
            <div className="lg:col-start-3 lg:row-end-1 overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-900/5">
                <div className="flex items-start justify-between gap-3 px-6 py-5">
                    <div>
                        <h2 className="text-base font-semibold text-gray-900">Zlecenie nr {work.number}</h2>
                        <p className="mt-1 text-sm text-gray-500">
                            {formatDateTime(work.startedOn?.toString())}
                        </p>
                    </div>
                    <HamburgerMenu options={workMenuOptions}></HamburgerMenu>
                </div>

                {missingItems.length > 0 && <div className="border-t border-red-100 bg-red-50 px-6 py-4">
                    <div className="flex items-start gap-x-3">
                        <ExclamationTriangleIcon aria-hidden="true" className="mt-0.5 h-5 w-5 flex-none text-red-500" />
                        <div>
                            <p className="text-sm font-semibold text-red-900">Wymaga uzupełnienia</p>
                            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-800">
                                {missingItems.map(item => <li key={item}>{item}</li>)}
                            </ul>
                        </div>
                    </div>
                </div>}

                <DetailSection title="Podsumowanie" icon={ClipboardDocumentListIcon}>
                    <DetailRows rows={summaryRows} />
                    {hasClaimDetails && <div className="mt-4 border-t border-gray-100 pt-4">
                        <p className="mb-2 font-semibold text-gray-900">Ubezpieczyciel i szkoda</p>
                        <DetailRows rows={claimDetails} />
                    </div>}
                    {work.insurerNotes && <p className="mt-3 whitespace-pre-line rounded-md bg-gray-50 px-3 py-2">
                        <span className="font-medium text-gray-700">Uwagi do ubezpieczyciela:</span>{' '}
                        {work.insurerNotes}
                    </p>}
                    {work.notes && <p className="mt-3 whitespace-pre-line rounded-md bg-gray-50 px-3 py-2 text-gray-500">{work.notes}</p>}
                    {!work.issuance && <div className="mt-4 max-w-xs">
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
                    <div className="mt-4 flex w-full items-center justify-between gap-3">
                        {!work.issuance && work.status !== 'closed' && <Field className="flex items-center"> 
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
                        </Field>}
                        <div className="ml-auto">
                            {work.issuance ?
                                <ButtonGroup options={issuedButtonOptions}></ButtonGroup>:
                                <ButtonGroup options={editButtonOptions}></ButtonGroup>
                            }
                        </div>
                    </div>
                </DetailSection>

                <DetailSection title="Kosztorys" icon={ClipboardDocumentListIcon}>
                    {hasEstimateDetails ? <DetailRows rows={estimateDetails} /> : <p>Brak kosztorysu.</p>}
                    {work.estimateNotes && <p className="mt-3 whitespace-pre-line rounded-md bg-gray-50 px-3 py-2">
                        <span className="font-medium text-gray-700">Uwagi:</span>{' '}
                        {work.estimateNotes}
                    </p>}
                </DetailSection>

                <DetailSection title="Rozliczenia" icon={BanknotesIcon}>
                    <DetailRows rows={settlementDetails} />
                    {work.settlementNotes && <p className="mt-3 whitespace-pre-line rounded-md bg-gray-50 px-3 py-2">
                        <span className="font-medium text-gray-700">Uwagi do rozliczenia:</span>{' '}
                        {work.settlementNotes}
                    </p>}
                    <div className="mt-4 flex gap-x-2">
                        {work.issuance && <>
                            <PricingDownloadLink name='Faktura' id={work.id} hidePaperClip={false} number={work.issuance.invoiceNumber}></PricingDownloadLink>
                            <IssuanceBadges issueance={work.issuance}></IssuanceBadges>
                        </>}
                    </div>
                    {settlementContent && <div className="mt-4 border-t border-gray-100 pt-4">
                        {settlementContent}
                    </div>}
                </DetailSection>

                <DetailSection title="Historia" icon={ClockIcon} defaultOpen={false}>
                    {(work.statusHistory?.length ?? 0) > 0 ? (
                        <div className="space-y-3">
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
                        <p>Brak historii statusów</p>
                    )}
                </DetailSection>
            </div>
        </>

    )
}
