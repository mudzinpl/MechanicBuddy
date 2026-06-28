'use client'

import { useEffect, useRef, useState } from 'react';
import FormInput from '@/_components/FormInput';
import FormLabel from '@/_components/FormLabel';
import FormSwitch from '@/_components/FormSwitch';
import FormTextArea from '@/_components/FormTextArea';
import PrimaryButton from '@/_components/PrimaryButton';
import SecondaryButton from '@/_components/SecondaryButton';
import Select from '@/_components/Select';
import { Field, Label } from '@headlessui/react';
import { ClientsCombobox, VehiclesCombobox } from '../../_components/SearchCombobox';
import { query } from '@/_lib/client/query-api';
import { IVehicleData } from '../../vehicles/model';
import { insurers } from '../model';

const draftStorageKey = 'appra-new-claim-intake-draft';
const stageClass = 'rounded-lg border border-gray-200 bg-white p-5 shadow-xs';
const stageGridClass = 'mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2';
const fieldColumnClass = 'min-w-0';

function StageHeader({ number, title, description }: { number: number, title: string, description: string }) {
    return (
        <div className="flex items-start gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">{number}</span>
            <div>
                <h2 className="text-base font-semibold text-gray-900">{title}</h2>
                <p className="mt-1 text-sm text-gray-500">{description}</p>
            </div>
        </div>
    );
}

function SaveStageButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="mt-4 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
        >
            Zapisz etap
        </button>
    );
}

function StageSavedConfirmation({ active }: { active: boolean }) {
    if (!active) return null;

    return (
        <span className="ml-3 inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700 ring-1 ring-green-600/20">
            Zapisano etap
        </span>
    );
}

export default function NewWorkIntakeInput() {
    const rootRef = useRef<HTMLDivElement>(null);
    const savedStageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [clientVehicles, setClientVehicles] = useState<IVehicleData[]>([]);
    const [selectedClientVehicleId, setSelectedClientVehicleId] = useState('');
    const [onlyClientVehicles, setOnlyClientVehicles] = useState(true);
    const [createNewClient, setCreateNewClient] = useState(false);
    const [createNewVehicle, setCreateNewVehicle] = useState(false);
    const [newClientType, setNewClientType] = useState('private');
    const [inspectionMode, setInspectionMode] = useState('workshop');
    const [savedStage, setSavedStage] = useState('');

    const populateClientVehicles = (clientId: string) => {
        query({
            url: 'vehicles/client/' + clientId,
            method: 'GET',
            onSuccess: (result: IVehicleData[]) => {
                setClientVehicles(result ?? []);
            },
            onFailure: ({ url, status, text }) => {
                console.log(url);
                console.log(text);
                console.log(status);
            }
        });
    };

    const saveDraft = (stageName: string, showMessage = true) => {
        const form = rootRef.current?.closest('form');
        if (!form || typeof window === 'undefined') return;

        const formData = new FormData(form);
        const draft: Record<string, string> = {
            __createNewClient: createNewClient ? 'true' : 'false',
            __createNewVehicle: createNewVehicle ? 'true' : 'false',
            __newClientType: newClientType,
            __inspectionMode: inspectionMode,
            __onlyClientVehicles: onlyClientVehicles ? 'true' : 'false',
            __selectedClientVehicleId: selectedClientVehicleId,
        };

        formData.forEach((value, key) => {
            if (typeof value === 'string') {
                draft[key] = value;
            }
        });

        window.localStorage.setItem(draftStorageKey, JSON.stringify(draft));
        if (showMessage) {
            setSavedStage(stageName);
            if (savedStageTimeoutRef.current) {
                clearTimeout(savedStageTimeoutRef.current);
            }
            savedStageTimeoutRef.current = setTimeout(() => setSavedStage(''), 2500);
        }
    };

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const rawDraft = window.localStorage.getItem(draftStorageKey);
        if (!rawDraft) return;

        const draft = JSON.parse(rawDraft) as Record<string, string>;
        const restoredCreateNewClient = draft.__createNewClient === 'true';
        const restoredCreateNewVehicle = draft.__createNewVehicle === 'true';
        setCreateNewClient(restoredCreateNewClient);
        setCreateNewVehicle(restoredCreateNewVehicle || restoredCreateNewClient);
        setNewClientType(draft.__newClientType || 'private');
        setInspectionMode(draft.__inspectionMode || 'workshop');
        setOnlyClientVehicles(draft.__onlyClientVehicles !== 'false');
        setSelectedClientVehicleId(draft.__selectedClientVehicleId || '');

        window.requestAnimationFrame(() => {
            const form = rootRef.current?.closest('form');
            if (!form) return;

            Object.entries(draft).forEach(([key, value]) => {
                if (key.startsWith('__')) return;
                const element = form.elements.namedItem(key);
                if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement) {
                    element.value = value;
                }
            });
        });
    }, []);

    useEffect(() => {
        return () => {
            if (savedStageTimeoutRef.current) {
                clearTimeout(savedStageTimeoutRef.current);
            }
        };
    }, []);

    const nextStep = inspectionMode === 'remote'
        ? 'Wyślij klientowi dokumenty i poproś o zdjęcia.'
        : 'Przygotuj upoważnienie i umów oględziny.';

    return (
        <>
            <div ref={rootRef} className="space-y-6" onChange={() => saveDraft('automatycznie', false)}>
                <input type="hidden" name="damageStatus" value="inspection_pending" />

                <div className={stageClass}>
                    <StageHeader number={1} title="Źródło sprawy" description="Określ, skąd pochodzi zgłoszenie szkody." />
                    <div className={stageGridClass}>
                        <div className={fieldColumnClass}>
                            <FormLabel name="caseSource" label="Źródło sprawy" />
                            <div className="mt-2 grid grid-cols-1">
                                <Select name="caseSource" defaultValue="partner_network">
                                    <option value="partner_network">Sieć partnerska</option>
                                    <option value="private_client">Klient prywatny</option>
                                    <option value="other">Inne</option>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <SaveStageButton onClick={() => saveDraft('Źródło sprawy')} />
                    <StageSavedConfirmation active={savedStage === 'Źródło sprawy'} />
                </div>

                <div className={stageClass}>
                    <StageHeader number={2} title="Klient" description="Wybierz klienta z bazy albo dodaj go bez opuszczania formularza." />
                    <div className={stageGridClass}>
                        <div className={fieldColumnClass}>
                            <FormLabel name="clientId" label="Klient" />
                            {!createNewClient && <ClientsCombobox
                                name="clientId"
                                onItemChange={(item) => {
                                    if (item) {
                                        populateClientVehicles(item.value);
                                    }
                                }}
                                defaultValue={{ text: '', value: '' }}>
                            </ClientsCombobox>}
                            <Field className="mt-3 flex items-start">
                                <FormSwitch
                                    name="createNewClient"
                                    checked={createNewClient}
                                    onChange={(value) => {
                                        setCreateNewClient(value);
                                        if (value) {
                                            setCreateNewVehicle(true);
                                            setOnlyClientVehicles(false);
                                        }
                                    }}>
                                </FormSwitch>
                                <Label as="span" className="ml-3 text-sm text-gray-700">
                                    Nowy klient
                                    <span className="block text-xs text-gray-500">Dodaj klienta bez opuszczania formularza szkody.</span>
                                </Label>
                            </Field>
                        </div>
                    </div>

                    {createNewClient && <div className="mt-4 rounded-md border border-gray-200 bg-gray-50 p-4">
                        <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                            <FormInput name="newClientName" label="Imię i nazwisko / nazwa" placeholder="np. Jan Kowalski albo APPRA Sp. z o.o." />
                            <div className={fieldColumnClass}>
                                <FormLabel name="newClientType" label="Typ klienta" />
                                <div className="mt-2 grid grid-cols-1">
                                    <Select name="newClientType" value={newClientType} onChange={(event) => setNewClientType(event.currentTarget.value)}>
                                        <option value="private">Osoba</option>
                                        <option value="company">Firma</option>
                                    </Select>
                                </div>
                            </div>
                            <FormInput name="newClientPhone" label="Telefon" placeholder="Numer telefonu" />
                            <FormInput name="newClientEmail" type="email" label="E-mail" placeholder="adres@email.pl" />
                            {newClientType === 'company' && <FormInput name="newClientRegNr" label="NIP" placeholder="NIP firmy" />}
                        </div>
                    </div>}
                    <SaveStageButton onClick={() => saveDraft('Klient')} />
                    <StageSavedConfirmation active={savedStage === 'Klient'} />
                </div>

                <div className={stageClass}>
                    <StageHeader number={3} title="Pojazd" description="Wybierz pojazd klienta albo dodaj nowy pojazd do sprawy." />
                    <div className={stageGridClass}>
                        <div className={fieldColumnClass}>
                            <FormLabel name="vehicleId" label="Pojazd" />
                            {!createNewVehicle && <>
                                {onlyClientVehicles ?
                                    <div className="mt-2 grid grid-cols-1">
                                        <Select name="vehicleId" value={selectedClientVehicleId} onChange={(event) => setSelectedClientVehicleId(event.currentTarget.value)}>
                                            <option value="">Wybierz pojazd klienta</option>
                                            {clientVehicles.map((item, index) => (
                                                <option key={index} value={item.id}>{[item.producer, item.model].filter(Boolean).join(' ') + (!item.regNr ? '' : ` (${item.regNr})`)}</option>
                                            ))}
                                        </Select>
                                    </div>
                                    : <VehiclesCombobox name="vehicleId" defaultValue={{ text: '', value: '' }}></VehiclesCombobox>}
                                {!createNewClient && <Field className="mt-3 flex items-start">
                                    <FormSwitch
                                        name="onlyClientVehicles"
                                        checked={!onlyClientVehicles}
                                        onChange={(value) => setOnlyClientVehicles(!value)}>
                                    </FormSwitch>
                                    <Label as="span" className="ml-3 text-sm text-gray-700">
                                        Szukaj we wszystkich pojazdach
                                    </Label>
                                </Field>}
                            </>}
                            <Field className="mt-3 flex items-start">
                                <FormSwitch
                                    name="createNewVehicle"
                                    checked={createNewVehicle}
                                    onChange={(value) => {
                                        if (!createNewClient) {
                                            setCreateNewVehicle(value);
                                        }
                                    }}>
                                </FormSwitch>
                                <Label as="span" className="ml-3 text-sm text-gray-700">
                                    Nowy pojazd
                                    <span className="block text-xs text-gray-500">Dodaj pojazd bez opuszczania formularza szkody.</span>
                                </Label>
                            </Field>
                        </div>
                    </div>

                    {createNewVehicle && <div className="mt-4 rounded-md border border-gray-200 bg-gray-50 p-4">
                        {createNewClient && <input type="hidden" name="createNewVehicle" value="on" />}
                        <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                            <FormInput name="newVehicleProducer" label="Marka" placeholder="np. Toyota" />
                            <FormInput name="newVehicleModel" label="Model" placeholder="np. Corolla" />
                            <FormInput name="newVehicleRegNr" label="Numer rejestracyjny" placeholder="np. WA12345" />
                            <FormInput name="newVehicleVin" label="VIN" placeholder="Numer VIN" />
                            <FormInput name="newVehicleOdo" label="Przebieg" placeholder="np. 135000" />
                        </div>
                    </div>}
                    <SaveStageButton onClick={() => saveDraft('Pojazd')} />
                    <StageSavedConfirmation active={savedStage === 'Pojazd'} />
                </div>

                <div className={stageClass}>
                    <StageHeader number={4} title="Dane szkody" description="Wprowadź tylko dane potrzebne na starcie likwidacji." />
                    <div className={stageGridClass}>
                        <FormInput name="claimNumber" label="Numer szkody" placeholder="np. PL/123456/2026" />
                        <div className={fieldColumnClass}>
                            <FormLabel name="insurer" label="Ubezpieczyciel / TU" />
                            <div className="mt-2 grid grid-cols-1">
                                <Select name="insurer" defaultValue="">
                                    <option value="">Nie wybrano</option>
                                    {insurers.map(insurer => <option key={insurer} value={insurer}>{insurer}</option>)}
                                </Select>
                            </div>
                        </div>
                        <div className={fieldColumnClass}>
                            <FormLabel name="damageType" label="Typ szkody" />
                            <div className="mt-2 grid grid-cols-1">
                                <Select name="damageType" defaultValue="OC">
                                    <option value="OC">OC</option>
                                    <option value="AC">AC</option>
                                </Select>
                            </div>
                        </div>
                        <FormInput name="contactPhone" label="Telefon kontaktowy" placeholder="Numer telefonu do kontaktu" />
                        <FormInput name="damageScope" label="Krótki zakres uszkodzeń" placeholder="np. tył, lewy przód" />
                        <FormInput name="reportSource" label="Źródło zgłoszenia" placeholder="np. telefon, e-mail, partner" />
                        <div className={fieldColumnClass}>
                            <FormLabel name="liabilityStatus" label="Status odpowiedzialności" />
                            <div className="mt-2 grid grid-cols-1">
                                <Select name="liabilityStatus" defaultValue="niepotwierdzona">
                                    <option value="niepotwierdzona">Niepotwierdzona</option>
                                    <option value="potwierdzona">Potwierdzona</option>
                                    <option value="sporna">Sporna</option>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <SaveStageButton onClick={() => saveDraft('Dane szkody')} />
                    <StageSavedConfirmation active={savedStage === 'Dane szkody'} />
                </div>

                <div className={stageClass}>
                    <StageHeader number={5} title="Oględziny" description="Ustal sposób wykonania oględzin i dalsze działanie." />
                    <div className={stageGridClass}>
                        <div className={fieldColumnClass}>
                            <FormLabel name="inspectionMode" label="Tryb oględzin" />
                            <div className="mt-2 grid grid-cols-1">
                                <Select name="inspectionMode" value={inspectionMode} onChange={(event) => setInspectionMode(event.currentTarget.value)}>
                                    <option value="workshop">Warsztat</option>
                                    <option value="remote">Zdalnie</option>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <SaveStageButton onClick={() => saveDraft('Oględziny')} />
                    <StageSavedConfirmation active={savedStage === 'Oględziny'} />
                </div>

                <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-5">
                    <StageHeader number={6} title="Następny krok" description="Po zapisaniu sprawy wykonaj kolejne działanie operacyjne." />
                    <p className="mt-4 text-sm font-medium text-indigo-900">{nextStep}</p>
                    <FormTextArea name="about" rows={4} label="Uwagi do przyjęcia szkody" placeholder="Dodatkowe informacje z rozmowy lub zgłoszenia" />
                </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-x-6">
                <SecondaryButton onClick={() => window.history.back()}>Anuluj</SecondaryButton>
                <PrimaryButton onClick={() => saveDraft('Przed zapisem', false)}>Zapisz sprawę</PrimaryButton>
            </div>
        </>
    );
}
