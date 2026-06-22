'use client'

import { useRouter } from 'next/navigation';
import FormTextArea from '@/_components/FormTextArea';
import PrimaryButton from '@/_components/PrimaryButton';
import SecondaryButton from '@/_components/SecondaryButton';
import { damageStatuses, getDamageStatusLabel, IWorkData, IMechanic } from '../model';
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


export default function WorkInput({
    work,
    mechanics,
}: {
    work?: IWorkData | undefined,
    mechanics: IMechanic[]
}) {



    const router = useRouter()
   
    const [isOffer, setIsOffer] = useState(false);

    const [onlyClientVehicles, setOnlyClientVehicles] = useState(!work ? true : false);

    const [clientVehicles, setClientVehicles] = useState<IVehicleData[]>([]);
    const [selectedClientVehicleId, setSelectedClientVehicleId] = useState(work?.vehicleId ?? '');
    const [clientUndisclosed, setClientUndisclosed] = useState(!work ? false : !work.clientId);
    const currentDamageStatus = work?.damageStatus || 'new';
    const hasKnownDamageStatus = damageStatuses.some(status => status.value === currentDamageStatus);
    const toDateInputValue = (value?: string) => value ? value.slice(0, 10) : '';
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

                    <div className="grid grid grid-flow-row grid-cols-1  gap-4">
                        {!work && <div>
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

                        <div className=" ">
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
                        <div className='  ' >
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
                            <div className='flex'>

                                <div className="-mr-px grid grow grid-cols-1 focus-within:relative">
                                    <div className= {clsx(onlyClientVehicles&&"mt-2", " sm:col-span-2   grid grid-cols-1")}> 
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
                                <div className='ml-2  '>
                                    <FormInput type='number' placeholder='Wartość przebiegu' name='odo' defaultValue={work?.odo ?? 0}></FormInput>
                                </div>
                            </div>

                        </div>
                       <WorkInputMechanics mechanics={mechanics} work={work}></WorkInputMechanics>
                        <div className="mt-4 border-t border-gray-900/10 pt-8">
                            <h3 className="text-base font-semibold text-gray-900">Likwidacja szkody</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Dane szkody komunikacyjnej i rozliczenia z ubezpieczycielem.
                            </p>

                            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <FormInput
                                    name='claimNumber'
                                    label='Numer szkody'
                                    defaultValue={work?.claimNumber ?? ''}
                                    placeholder='np. PL/123456/2026'>
                                </FormInput>
                                <FormInput
                                    name='insurer'
                                    label='Ubezpieczyciel'
                                    defaultValue={work?.insurer ?? ''}
                                    placeholder='np. PZU'>
                                </FormInput>

                                <div>
                                    <FormLabel name='damageType' label='Rodzaj szkody'></FormLabel>
                                    <div className="mt-2 grid grid-cols-1">
                                        <Select name='damageType' defaultValue={work?.damageType ?? ''}>
                                            <option value=''>Nie wybrano</option>
                                            <option value='OC'>OC</option>
                                            <option value='AC'>AC</option>
                                            <option value='Gotówka'>Gotówka</option>
                                            <option value='Flota'>Flota</option>
                                        </Select>
                                    </div>
                                </div>

                                <div>
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
                                    name='audatexEstimateNumber'
                                    label='Numer kosztorysu Audanet / Audatex'
                                    defaultValue={work?.audatexEstimateNumber ?? ''}
                                    placeholder='Numer kosztorysu'>
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
                                    label='Termin oględzin'
                                    defaultValue={toDateInputValue(work?.plannedInspectionOn)}>
                                </FormInput>

                                <div className="space-y-4 pt-1">
                                    <Field className="flex items-center">
                                        <FormSwitch
                                            name='assignmentOfClaimSigned'
                                            defaultChecked={work?.assignmentOfClaimSigned ?? false}>
                                        </FormSwitch>
                                        <Label as="span" className="ml-3 text-sm text-gray-700">
                                            Klient podpisał cesję
                                        </Label>
                                    </Field>
                                    <Field className="flex items-center">
                                        <FormSwitch
                                            name='clientPaysVat'
                                            defaultChecked={work?.clientPaysVat ?? false}>
                                        </FormSwitch>
                                        <Label as="span" className="ml-3 text-sm text-gray-700">
                                            Klient dopłaca VAT
                                        </Label>
                                    </Field>
                                </div>

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
                        <div className=" ">
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
