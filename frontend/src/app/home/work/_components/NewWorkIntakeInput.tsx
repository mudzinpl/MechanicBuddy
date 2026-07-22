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

type PreparationCheckKey =
    | 'authorizationPrepared'
    | 'authorizationSent'
    | 'authorizationReceived'
    | 'vehiclePhotos'
    | 'damagePhotos'
    | 'registrationDocumentPhoto'
    | 'drivingLicencePhoto'
    | 'incidentStatement'
    | 'responsiblePartyData'
    | 'policyNumber';

const initialPreparationChecks: Record<PreparationCheckKey, boolean> = {
    authorizationPrepared: false,
    authorizationSent: false,
    authorizationReceived: false,
    vehiclePhotos: false,
    damagePhotos: false,
    registrationDocumentPhoto: false,
    drivingLicencePhoto: false,
    incidentStatement: false,
    responsiblePartyData: false,
    policyNumber: false,
};

const documentationChecklist: { key: PreparationCheckKey, label: string, optional?: boolean }[] = [
    { key: 'vehiclePhotos', label: 'Zdjęcia pojazdu' },
    { key: 'damagePhotos', label: 'Zdjęcia uszkodzeń' },
    { key: 'registrationDocumentPhoto', label: 'Zdjęcie dowodu rejestracyjnego' },
    { key: 'drivingLicencePhoto', label: 'Zdjęcie prawa jazdy', optional: true },
    { key: 'incidentStatement', label: 'Oświadczenie o zdarzeniu', optional: true },
    { key: 'responsiblePartyData', label: 'Dane sprawcy', optional: true },
    { key: 'policyNumber', label: 'Numer polisy', optional: true },
];

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
            Zapisano szkic etapu
        </span>
    );
}

function ChecklistItem({
    name,
    label,
    checked,
    optional = false,
    hint,
    onChange,
}: {
    name: PreparationCheckKey,
    label: string,
    checked: boolean,
    optional?: boolean,
    hint?: string,
    onChange: (name: PreparationCheckKey, checked: boolean) => void,
}) {
    return (
        <label className="flex cursor-pointer items-start gap-3 rounded-md border border-gray-200 bg-white p-3 hover:border-indigo-200">
            <input
                type="checkbox"
                name={name}
                checked={checked}
                onChange={(event) => onChange(name, event.currentTarget.checked)}
                className="mt-0.5 size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
            />
            <span className="min-w-0 text-sm text-gray-800">
                <span className="font-medium">{label}</span>
                {optional && <span className="ml-2 text-xs font-normal text-gray-500">jeśli dotyczy</span>}
                {hint && <span className="mt-1 block text-xs text-gray-500">{hint}</span>}
            </span>
        </label>
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
    const [inspectionDate, setInspectionDate] = useState('');
    const [inspectionTime, setInspectionTime] = useState('');
    const [visitorName, setVisitorName] = useState('');
    const [remoteClientEmail, setRemoteClientEmail] = useState('');
    const [preparationChecks, setPreparationChecks] = useState(initialPreparationChecks);
    const [savedStage, setSavedStage] = useState('');

    const updatePreparationCheck = (name: PreparationCheckKey, checked: boolean) => {
        setPreparationChecks(current => ({ ...current, [name]: checked }));
    };

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
            __inspectionMode: formData.get('inspectionMode')?.toString() || inspectionMode,
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
        setInspectionDate(draft.inspectionDate || '');
        setInspectionTime(draft.inspectionTime || '');
        setVisitorName(draft.inspectionVisitorName || '');
        setRemoteClientEmail(draft.remoteClientEmail || '');
        setPreparationChecks(Object.keys(initialPreparationChecks).reduce((checks, key) => ({
            ...checks,
            [key]: draft[key] === 'on',
        }), initialPreparationChecks));
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

    const missingDocumentation = documentationChecklist
        .filter(item => !item.optional && !preparationChecks[item.key])
        .map(item => item.label);
    const workshopMissingActions = [
        !inspectionDate ? 'ustal datę przyjazdu' : null,
        !inspectionTime ? 'ustal godzinę przyjazdu' : null,
        !visitorName ? 'wpisz osobę, która przyjedzie' : null,
        !preparationChecks.authorizationPrepared ? 'przygotuj upoważnienie' : null,
    ].filter(Boolean) as string[];
    const remoteMissingActions = [
        !remoteClientEmail ? 'uzupełnij e-mail klienta' : null,
        !preparationChecks.authorizationPrepared ? 'przygotuj upoważnienie' : null,
        !preparationChecks.authorizationSent ? 'wyślij upoważnienie' : null,
        !preparationChecks.authorizationReceived ? 'odbierz upoważnienie' : null,
        ...missingDocumentation.map(item => `odbierz: ${item.toLocaleLowerCase('pl-PL')}`),
    ].filter(Boolean) as string[];
    const missingActions = inspectionMode === 'remote' ? remoteMissingActions : workshopMissingActions;
    const plannedInspectionOn = inspectionDate
        ? `${inspectionDate}${inspectionTime ? `T${inspectionTime}` : ''}`
        : '';

    return (
        <>
            <div ref={rootRef} className="space-y-6" onChange={() => saveDraft('automatycznie', false)}>
                <input type="hidden" name="damageStatus" value="inspection_pending" />
                <input type="hidden" name="plannedInspectionOn" value={plannedInspectionOn} />
                <input type="hidden" name="inspectionPreparationProvided" value="true" />

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
                    <StageHeader number={5} title="Przygotowanie oględzin" description="Ustal sposób obsługi i zbierz materiały potrzebne do wykonania oględzin." />
                    <div className={stageGridClass}>
                        <div className={fieldColumnClass}>
                            <FormLabel name="inspectionMode" label="Tryb oględzin" />
                            <div className="mt-2 grid grid-cols-1">
                                <Select name="inspectionMode" value={inspectionMode} onChange={(event) => setInspectionMode(event.currentTarget.value)}>
                                    <option value="workshop">Klient przyjedzie do warsztatu</option>
                                    <option value="remote">Obsługa zdalna</option>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {inspectionMode === 'workshop' ? <div className="mt-5 rounded-md border border-gray-200 bg-gray-50 p-4">
                        <h3 className="text-sm font-semibold text-gray-900">Planowany przyjazd</h3>
                        <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                            <FormInput
                                name="inspectionDate"
                                type="date"
                                label="Data przyjazdu / oględzin"
                                value={inspectionDate}
                                onInputChange={(event) => setInspectionDate(event.currentTarget.value)}
                            />
                            <FormInput
                                name="inspectionTime"
                                type="time"
                                label="Godzina"
                                value={inspectionTime}
                                onInputChange={(event) => setInspectionTime(event.currentTarget.value)}
                            />
                            <FormInput
                                name="inspectionVisitorName"
                                label="Osoba, która przyjedzie"
                                placeholder="Imię i nazwisko"
                                value={visitorName}
                                onInputChange={(event) => setVisitorName(event.currentTarget.value)}
                            />
                            <FormInput name="inspectionContactPhone" label="Telefon kontaktowy (jeśli nie podano wcześniej)" placeholder="Numer telefonu" />
                        </div>
                        <div className="mt-4">
                            <ChecklistItem
                                name="authorizationPrepared"
                                label="Upoważnienie przygotowane"
                                checked={preparationChecks.authorizationPrepared}
                                onChange={updatePreparationCheck}
                            />
                        </div>
                    </div> : <div className="mt-5 rounded-md border border-gray-200 bg-gray-50 p-4">
                        <h3 className="text-sm font-semibold text-gray-900">Obsługa zdalna</h3>
                        <div className="mt-3 max-w-xl">
                            <FormInput
                                name="remoteClientEmail"
                                type="email"
                                label="E-mail klienta"
                                placeholder="adres@email.pl"
                                value={remoteClientEmail}
                                onInputChange={(event) => setRemoteClientEmail(event.currentTarget.value)}
                            />
                        </div>
                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <ChecklistItem
                                name="authorizationPrepared"
                                label="Upoważnienie przygotowane"
                                checked={preparationChecks.authorizationPrepared}
                                onChange={updatePreparationCheck}
                            />
                            <ChecklistItem
                                name="authorizationSent"
                                label="Upoważnienie wysłane"
                                checked={preparationChecks.authorizationSent}
                                onChange={updatePreparationCheck}
                            />
                            <ChecklistItem
                                name="authorizationReceived"
                                label="Upoważnienie odebrane"
                                checked={preparationChecks.authorizationReceived}
                                onChange={updatePreparationCheck}
                            />
                        </div>
                    </div>}

                    <div className="mt-5">
                        <h3 className="text-sm font-semibold text-gray-900">Dokumentacja od klienta</h3>
                        <p className="mt-1 text-xs text-gray-500">Pozycje oznaczone „jeśli dotyczy” nie blokują zapisania sprawy.</p>
                        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {documentationChecklist.map(item => <ChecklistItem
                                key={item.key}
                                name={item.key}
                                label={item.label}
                                optional={item.optional}
                                hint={item.key === 'policyNumber' ? 'OC: polisa sprawcy. AC: polisa klienta.' : undefined}
                                checked={preparationChecks[item.key]}
                                onChange={updatePreparationCheck}
                            />)}
                        </div>
                    </div>

                    <SaveStageButton onClick={() => saveDraft('Przygotowanie oględzin')} />
                    <StageSavedConfirmation active={savedStage === 'Przygotowanie oględzin'} />
                </div>

                <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-5">
                    <StageHeader number={6} title="Podsumowanie i następne działanie" description="Sprawdź, czego brakuje przed przejściem do oględzin." />
                    <div className="mt-4 rounded-md bg-white/70 p-4 text-sm text-indigo-950 ring-1 ring-indigo-200">
                        {inspectionMode === 'workshop' ? <>
                            <p className="font-semibold">Klient przyjedzie do warsztatu</p>
                            <p className="mt-1">Termin: {inspectionDate || 'nie ustalono'}{inspectionTime ? `, godz. ${inspectionTime}` : ''}</p>
                            <p className="mt-1">Upoważnienie: {preparationChecks.authorizationPrepared ? 'przygotowane' : 'do przygotowania'}</p>
                            {missingActions.length === 0
                                ? <p className="mt-3 font-medium text-green-700">Oczekiwanie na przyjazd klienta.</p>
                                : <p className="mt-3 font-medium">Brakujące działania:</p>}
                        </> : <>
                            <p className="font-semibold">Obsługa zdalna</p>
                            <p className="mt-1">Upoważnienie: {preparationChecks.authorizationReceived ? 'odebrane' : preparationChecks.authorizationSent ? 'wysłane, oczekuje na zwrot' : preparationChecks.authorizationPrepared ? 'przygotowane' : 'do przygotowania'}</p>
                            {missingActions.length === 0
                                ? <p className="mt-3 font-medium text-green-700">Dokumentacja klienta jest kompletna.</p>
                                : <p className="mt-3 font-medium">Oczekiwanie na dokumentację od klienta:</p>}
                        </>}
                        {missingActions.length > 0 && <ul className="mt-2 list-disc space-y-1 pl-5 text-indigo-900">
                            {missingActions.map(action => <li key={action}>{action}</li>)}
                        </ul>}
                    </div>
                    <p className="mt-3 text-xs text-indigo-800">
                        Tryb oględzin, termin, dane kontaktowe, status upoważnienia, checklista oraz uwagi zostaną zapisane w sprawie. Lokalny szkic nadal chroni formularz przed przypadkową utratą danych przed zapisem.
                    </p>
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
