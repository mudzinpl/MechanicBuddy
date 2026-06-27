'use client'

import { useRouter } from 'next/navigation';
import FormTextArea from '@/_components/FormTextArea';
import PrimaryButton from '@/_components/PrimaryButton';
import SecondaryButton from '@/_components/SecondaryButton';
import { damageStatuses, damageTypes, estimateStatuses, estimateSystems, getDamageStatusLabel, insurers, IWorkData, IMechanic, IWorkDocument, settlementStatuses } from '../model';
import FormLabel from '@/_components/FormLabel';
import { ClientsCombobox, VehiclesCombobox } from '../../_components/SearchCombobox';
import { useState } from 'react';
import FormSwitch from '@/_components/FormSwitch';
import { Field, Label } from '@headlessui/react';
import { query } from '@/_lib/client/query-api';
import { IVehicleData } from '../../vehicles/model';
import FormInput from '@/_components/FormInput';
import Select from '@/_components/Select';
import clsx from 'clsx';
import WorkInputMechanics from './WorkInputMechanics';

const workFormGridClass = 'grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2';
const formSectionGridClass = 'mt-6 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2';
const fieldColumnClass = 'min-w-0';
const switchControlClass = 'mt-2 flex min-h-9 items-center';

export default function WorkInput({
    work,
    mechanics,
    documents = [],
}: {
    work?: IWorkData | undefined,
    mechanics: IMechanic[],
    documents?: IWorkDocument[]
}) {



    const router = useRouter()
   
    const [isOffer, setIsOffer] = useState(false);

    const [onlyClientVehicles, setOnlyClientVehicles] = useState(!work ? true : false);

    const [clientVehicles, setClientVehicles] = useState<IVehicleData[]>([]);
    const [selectedClientVehicleId, setSelectedClientVehicleId] = useState(work?.vehicleId ?? '');
    const [clientUndisclosed, setClientUndisclosed] = useState(!work ? false : !work.clientId);
    const currentDamageStatus = work?.damageStatus || 'new';
    const hasKnownDamageStatus = damageStatuses.some(status => status.value === currentDamageStatus);
    const currentInsurer = work?.insurer || '';
    const hasKnownInsurer = !currentInsurer || insurers.some(insurer => insurer === currentInsurer);
    const currentDamageType = work?.damageType || '';
    const hasKnownDamageType = !currentDamageType || damageTypes.some(type => type === currentDamageType);
    const toDateInputValue = (value?: string) => value ? value.slice(0, 10) : '';
    const estimateDocuments = documents.filter(document =>
        document.contentType === 'application/pdf' ||
        ['audatex_estimates', 'audanet_estimates', 'manual_calculations', 'insurer_verifications'].includes(document.category)
    );
    const populateClientVehicles = (clientId: string) => {
        query({
            url: 'vehicles/client/' + clientId,
            method: 'GET',
            onSuccess: (result: IVehicleData[]) => {
                if (result) {
                    setClientVehicles(result);
                }
                else {
                    console.log(result);
                    return [];
                }
            },
            onFailure: ({ url, status, text }) => {
                console.log(url);
                console.log(text);
                console.log(status);
            }
        });
    }

    return (
        <>
            <div className="space-y-12 ">
                <div className="border-b  border-gray-900/10 pb-12">

                    <div className={workFormGridClass}>
                        {!work && <div className="sm:col-span-2">
                            <FormLabel name='startWith' label='Rozpocznij od'></FormLabel>
                            <Field className="flex mt-2 items-center">
                                <FormSwitch
                                    name='isOffer'
                                    checked={isOffer}
                                    onChange={(value) => {
                                        setIsOffer(value);
                                    }}></FormSwitch>

                                <Label as="span" className="ml-3 text-sm">
                                    Oferta
                                </Label>
                            </Field>
                        </div>}

                        <div className={fieldColumnClass}>
                            <FormLabel name='clientId' label='Klient'>
                                <span className="ml-4 float-right text-gray-500">
                                    Nieujawniony{' '}
                                    <FormSwitch
                                        name='clientUndisclosed'
                                        small={true}
                                        checked={clientUndisclosed}
                                        onChange={(value) => {
                                            setClientUndisclosed(value);
                                            setOnlyClientVehicles(!value);
                                        }}></FormSwitch>
                                </span>
                            </FormLabel>
                            {!clientUndisclosed &&
                                <ClientsCombobox name='clientId'
                                    onItemChange={(item) => {
                                        if (onlyClientVehicles && item) {
                                            populateClientVehicles(item.value);
                                        }
                                    }}
                                    defaultValue={{
                                        text: work?.clientName ?? '',
                                        value: work?.clientId ?? '',
                                    }}>
                                </ClientsCombobox>}

                        </div>
                        <div className={fieldColumnClass}>
                            <FormLabel name='vehicleId' label='Pojazd'>
                                {!clientUndisclosed && <span className="ml-2 float-right text-gray-500">
                                    Szukaj we wszystkich pojazdach{' '}
                                    <FormSwitch
                                        name='onlyClientVehicles'
                                        small={true}
                                        checked={!onlyClientVehicles}
                                        onChange={(value) => {
                                            setOnlyClientVehicles(!value);
                                        }}></FormSwitch>{' '}
                                </span>}

                            </FormLabel>
                            <div className='flex flex-col gap-3 sm:flex-row'>

                                <div className="grid grow grid-cols-1 focus-within:relative">
                                    <div className={clsx(onlyClientVehicles && "mt-2", "grid grid-cols-1")}>
                                        {onlyClientVehicles ?
                                            <Select
                                                name='vehicleId'
                                                value={selectedClientVehicleId}
                                                onChange={(e) => {
                                                    setSelectedClientVehicleId(e.currentTarget.value);
                                                }} >
                                                {clientVehicles?.map((item, index) => {
                                                    return (<option key={index} value={item.id}>{[item?.producer, item?.model].filter(x => x).join(' ') + (!item?.regNr ? '' : ` (${item.regNr})`)}</option>)
                                                })}
                                            </Select> :
                                            <VehiclesCombobox name='vehicleId'

                                                defaultValue={{
                                                    text: [work?.vehicleProducer, work?.vehicleModel].filter(x => x).join(' ') + (!work?.vehicleRegNr ? '' : `(${work?.vehicleRegNr})`),
                                                    value: work?.vehicleId ?? '',
                                                }}>
                                            </VehiclesCombobox>}
                                    </div>
                                </div>
                                <div className='sm:w-40'>
                                    <FormInput type='number' placeholder='Wartość przebiegu' name='odo' defaultValue={work?.odo ?? 0}></FormInput>
                                </div>
                            </div>

                        </div>
                        <div className="sm:col-span-2">
                            <WorkInputMechanics mechanics={mechanics} work={work}></WorkInputMechanics>
                        </div>
                        <div className="mt-4 border-t border-gray-900/10 pt-8 sm:col-span-2">
                            <h3 className="text-base font-semibold text-gray-900">Ubezpieczyciel i szkoda</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Dane szkody komunikacyjnej i rozliczenia z ubezpieczycielem.
                            </p>

                            <div className={formSectionGridClass}>
                                <FormInput
                                    name='claimNumber'
                                    label='Numer szkody'
                                    defaultValue={work?.claimNumber ?? ''}
                                    placeholder='np. PL/123456/2026'>
                                </FormInput>
                                <div className={fieldColumnClass}>
                                    <FormLabel name='insurer' label='Ubezpieczyciel'></FormLabel>
                                    <div className="mt-2 grid grid-cols-1">
                                        <Select name='insurer' defaultValue={currentInsurer}>
                                            <option value=''>Nie wybrano</option>
                                            {!hasKnownInsurer && <option value={currentInsurer}>{currentInsurer}</option>}
                                            {insurers.map(insurer => (
                                                <option key={insurer} value={insurer}>{insurer}</option>
                                            ))}
                                        </Select>
                                    </div>
                                </div>

                                <div className={fieldColumnClass}>
                                    <FormLabel name='damageType' label='Rodzaj szkody'></FormLabel>
                                    <div className="mt-2 grid grid-cols-1">
                                        <Select name='damageType' defaultValue={currentDamageType}>
                                            <option value=''>Nie wybrano</option>
                                            {!hasKnownDamageType && <option value={currentDamageType}>{currentDamageType}</option>}
                                            {damageTypes.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </Select>
                                    </div>
                                </div>

                                <div className={fieldColumnClass}>
                                    <FormLabel name='damageStatus' label='Status procesu'></FormLabel>
                                    <div className="mt-2 grid grid-cols-1">
                                        <Select name='damageStatus' defaultValue={currentDamageStatus}>
                                            {!hasKnownDamageStatus && <option value={currentDamageStatus}>
                                                {getDamageStatusLabel(currentDamageStatus)}
                                            </option>}
                                            {damageStatuses.map(status => (
                                                <option key={status.value} value={status.value}>{status.label}</option>
                                            ))}
                                        </Select>
                                    </div>
                                </div>

                                <FormInput
                                    name='claimHandlerName'
                                    label='Opiekun szkody'
                                    defaultValue={work?.claimHandlerName ?? ''}
                                    placeholder='Imię i nazwisko opiekuna'>
                                </FormInput>

                                <FormInput
                                    name='claimHandlerEmail'
                                    type='email'
                                    label='E-mail opiekuna'
                                    defaultValue={work?.claimHandlerEmail ?? ''}
                                    placeholder='opiekun@example.pl'>
                                </FormInput>

                                <FormInput
                                    name='claimHandlerPhone'
                                    label='Telefon opiekuna'
                                    defaultValue={work?.claimHandlerPhone ?? ''}
                                    placeholder='Numer telefonu'>
                                </FormInput>

                                <FormInput
                                    name='claimReportedOn'
                                    type='date'
                                    label='Data zgłoszenia szkody'
                                    defaultValue={toDateInputValue(work?.claimReportedOn)}>
                                </FormInput>

                                <FormInput
                                    name='plannedIntakeOn'
                                    type='date'
                                    label='Planowane przyjęcie pojazdu'
                                    defaultValue={toDateInputValue(work?.plannedIntakeOn)}>
                                </FormInput>

                                <FormInput
                                    name='plannedReleaseOn'
                                    type='date'
                                    label='Planowane wydanie pojazdu'
                                    defaultValue={toDateInputValue(work?.plannedReleaseOn)}>
                                </FormInput>

                                <FormInput
                                    name='plannedInspectionOn'
                                    type='date'
                                    label='Data oględzin'
                                    defaultValue={toDateInputValue(work?.plannedInspectionOn)}>
                                </FormInput>

                                <FormInput
                                    name='insurerDecisionOn'
                                    type='date'
                                    label='Data decyzji ubezpieczyciela'
                                    defaultValue={toDateInputValue(work?.insurerDecisionOn)}>
                                </FormInput>

                                <FormInput
                                    name='supplementPaidOn'
                                    type='date'
                                    label='Data dopłaty'
                                    defaultValue={toDateInputValue(work?.supplementPaidOn)}>
                                </FormInput>

                                <div className="sm:col-span-2">
                                    <FormTextArea
                                        name='insurerNotes'
                                        rows={4}
                                        label='Uwagi do ubezpieczyciela'
                                        defaultValue={work?.insurerNotes ?? ''}>
                                    </FormTextArea>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 border-t border-gray-900/10 pt-8 sm:col-span-2">
                            <h3 className="text-base font-semibold text-gray-900">Kosztorys naprawy</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Podstawowe dane kosztorysu, kwoty i status akceptacji.
                            </p>

                            <div className={formSectionGridClass}>
                                <FormInput
                                    name='audatexEstimateNumber'
                                    label='Numer kosztorysu'
                                    defaultValue={work?.audatexEstimateNumber ?? ''}
                                    placeholder='Numer kosztorysu'>
                                </FormInput>

                                <FormInput
                                    name='estimateVersion'
                                    label='Wersja'
                                    defaultValue={work?.estimateVersion ?? ''}
                                    placeholder='np. 1, 2, korekta'>
                                </FormInput>

                                <div className={fieldColumnClass}>
                                    <FormLabel name='estimateSystem' label='System kosztorysu'></FormLabel>
                                    <div className="mt-2 grid grid-cols-1">
                                        <Select name='estimateSystem' defaultValue={work?.estimateSystem || ''}>
                                            <option value=''>Nie wybrano</option>
                                            {estimateSystems.map(system => (
                                                <option key={system.value} value={system.value}>{system.label}</option>
                                            ))}
                                        </Select>
                                    </div>
                                </div>

                                <FormInput
                                    name='estimatePreparedOn'
                                    type='date'
                                    label='Data przygotowania kosztorysu'
                                    defaultValue={toDateInputValue(work?.estimatePreparedOn)}>
                                </FormInput>

                                <FormInput
                                    name='estimateNetAmount'
                                    type='number'
                                    step='0.01'
                                    label='Kwota netto'
                                    defaultValue={work?.estimateNetAmount ?? ''}>
                                </FormInput>
                                <FormInput
                                    name='estimateVatAmount'
                                    type='number'
                                    step='0.01'
                                    label='Kwota VAT'
                                    defaultValue={work?.estimateVatAmount ?? ''}>
                                </FormInput>
                                <FormInput
                                    name='estimateGrossAmount'
                                    type='number'
                                    step='0.01'
                                    label='Kwota brutto'
                                    defaultValue={work?.estimateGrossAmount ?? ''}>
                                </FormInput>
                                <FormInput
                                    name='estimateLaborMechanicalRbg'
                                    type='number'
                                    step='0.01'
                                    label='RBG blacharsko-mechaniczne'
                                    defaultValue={work?.estimateLaborMechanicalRbg ?? ''}>
                                </FormInput>
                                <FormInput
                                    name='estimateLaborPaintRbg'
                                    type='number'
                                    step='0.01'
                                    label='RBG lakiernicze'
                                    defaultValue={work?.estimateLaborPaintRbg ?? ''}>
                                </FormInput>

                                <div className={fieldColumnClass}>
                                    <FormLabel name='estimateStatus' label='Status kosztorysu'></FormLabel>
                                    <div className="mt-2 grid grid-cols-1">
                                        <Select name='estimateStatus' defaultValue={work?.estimateStatus || ''}>
                                            <option value=''>Nie wybrano</option>
                                            {estimateStatuses.map(status => (
                                                <option key={status.value} value={status.value}>{status.label}</option>
                                            ))}
                                        </Select>
                                    </div>
                                </div>

                                <FormInput
                                    name='estimateSentOn'
                                    type='date'
                                    label='Data wysłania kosztorysu'
                                    defaultValue={toDateInputValue(work?.estimateSentOn)}>
                                </FormInput>
                                <FormInput
                                    name='estimateAcceptedOn'
                                    type='date'
                                    label='Data akceptacji kosztorysu'
                                    defaultValue={toDateInputValue(work?.estimateAcceptedOn)}>
                                </FormInput>

                                {estimateDocuments.length > 0 && <div className="sm:col-span-2">
                                    <FormLabel name='estimateDocumentId' label='Powiązany dokument PDF'></FormLabel>
                                    <div className="mt-2 grid grid-cols-1">
                                        <Select name='estimateDocumentId' defaultValue={work?.estimateDocumentId ?? ''}>
                                            <option value=''>Nie wybrano</option>
                                            {estimateDocuments.map(document => (
                                                <option key={document.id} value={document.id}>{document.fileName}</option>
                                            ))}
                                        </Select>
                                    </div>
                                </div>}

                                <div className="sm:col-span-2">
                                    <FormTextArea
                                        name='estimateNotes'
                                        rows={4}
                                        label='Uwagi do kosztorysu'
                                        defaultValue={work?.estimateNotes ?? ''}>
                                    </FormTextArea>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 border-t border-gray-900/10 pt-8 sm:col-span-2">
                            <h3 className="text-base font-semibold text-gray-900">Cesja i rozliczenia</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Dokumenty formalne, dopłaty klienta i status rozliczenia.
                            </p>

                            <div className={formSectionGridClass}>
                                <div className={fieldColumnClass}>
                                    <FormLabel name='assignmentOfClaimSigned' label='Cesja'></FormLabel>
                                    <Field className={switchControlClass}>
                                        <FormSwitch
                                            name='assignmentOfClaimSigned'
                                            defaultChecked={work?.assignmentOfClaimSigned ?? false}>
                                        </FormSwitch>
                                        <Label as="span" className="ml-3 text-sm text-gray-700">
                                            Podpisana
                                        </Label>
                                    </Field>
                                </div>
                                <FormInput
                                    name='assignmentOfClaimSignedOn'
                                    type='date'
                                    label='Data podpisania cesji'
                                    defaultValue={toDateInputValue(work?.assignmentOfClaimSignedOn)}>
                                </FormInput>

                                <div className={fieldColumnClass}>
                                    <FormLabel name='powerOfAttorneySigned' label='Pełnomocnictwo'></FormLabel>
                                    <Field className={switchControlClass}>
                                        <FormSwitch
                                            name='powerOfAttorneySigned'
                                            defaultChecked={work?.powerOfAttorneySigned ?? false}>
                                        </FormSwitch>
                                        <Label as="span" className="ml-3 text-sm text-gray-700">
                                            Podpisane
                                        </Label>
                                    </Field>
                                </div>
                                <FormInput
                                    name='powerOfAttorneySignedOn'
                                    type='date'
                                    label='Data podpisania pełnomocnictwa'
                                    defaultValue={toDateInputValue(work?.powerOfAttorneySignedOn)}>
                                </FormInput>

                                <div className={fieldColumnClass}>
                                    <FormLabel name='clientPaysVat' label='Dopłata VAT'></FormLabel>
                                    <Field className={switchControlClass}>
                                        <FormSwitch
                                            name='clientPaysVat'
                                            defaultChecked={work?.clientPaysVat ?? false}>
                                        </FormSwitch>
                                        <Label as="span" className="ml-3 text-sm text-gray-700">
                                            Klient dopłaca VAT
                                        </Label>
                                    </Field>
                                </div>
                                <div className={fieldColumnClass}>
                                    <FormLabel name='clientVatPercent' label='Procent VAT po stronie klienta'></FormLabel>
                                    <div className="mt-2 grid grid-cols-1">
                                        <Select name='clientVatPercent' defaultValue={(work?.clientVatPercent ?? (work?.clientPaysVat ? 100 : 0)).toString()}>
                                            <option value='0'>0%</option>
                                            <option value='50'>50%</option>
                                            <option value='100'>100%</option>
                                        </Select>
                                    </div>
                                </div>

                                <div className={fieldColumnClass}>
                                    <FormLabel name='settlementStatus' label='Status rozliczenia'></FormLabel>
                                    <div className="mt-2 grid grid-cols-1">
                                        <Select name='settlementStatus' defaultValue={work?.settlementStatus || 'unsettled'}>
                                            {settlementStatuses.map(status => (
                                                <option key={status.value} value={status.value}>{status.label}</option>
                                            ))}
                                        </Select>
                                    </div>
                                </div>
                                <FormInput
                                    name='clientVatAmount'
                                    type='number'
                                    step='0.01'
                                    label='Kwota dopłaty VAT'
                                    defaultValue={work?.clientVatAmount ?? ''}>
                                </FormInput>

                                <FormInput
                                    name='underpaymentAmount'
                                    type='number'
                                    step='0.01'
                                    label='Kwota niedopłaty'
                                    defaultValue={work?.underpaymentAmount ?? ''}>
                                </FormInput>
                                <FormInput
                                    name='paymentDemandOn'
                                    type='date'
                                    label='Data wezwania do dopłaty'
                                    defaultValue={toDateInputValue(work?.paymentDemandOn)}>
                                </FormInput>
                                <FormInput
                                    name='paymentReceivedOn'
                                    type='date'
                                    label='Data zapłaty'
                                    defaultValue={toDateInputValue(work?.paymentReceivedOn)}>
                                </FormInput>

                                <div className="sm:col-span-2">
                                    <FormTextArea
                                        name='settlementNotes'
                                        rows={4}
                                        label='Uwagi do rozliczenia'
                                        defaultValue={work?.settlementNotes ?? ''}>
                                    </FormTextArea>
                                </div>
                            </div>
                        </div>
                        <div className="sm:col-span-2">
                            <FormTextArea name='about' rows={8} label='Uwagi' defaultValue={work?.notes}>
                            </FormTextArea>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-x-6">
                <SecondaryButton onClick={() => router.back()}>Anuluj</SecondaryButton>
                <PrimaryButton onClick={() => { }}>Zapisz</PrimaryButton>
            </div>
        </>
    )
}
