'use client'

import clsx from 'clsx';
import moment from 'moment';
import { getDamageStatusLabel, getSettlementStatusLabel, IWorkData, IWorkStatusHistory } from '../model';

type TimelineTone = 'gray' | 'blue' | 'green' | 'red';

type TimelineStep = {
    key: string;
    label: string;
    statuses: string[];
    responsible?: (work: IWorkData) => string;
    startedOn?: (work: IWorkData) => string | null | undefined;
};

const timelineSteps: TimelineStep[] = [
    {
        key: 'new',
        label: 'Nowa szkoda',
        statuses: ['new'],
        startedOn: (work) => work.claimReportedOn || work.startedOn?.toString(),
    },
    {
        key: 'contact',
        label: 'Kontakt z klientem',
        statuses: [],
        responsible: (work) => work.claimHandlerName,
        startedOn: (work) => work.claimReportedOn || work.startedOn?.toString(),
    },
    {
        key: 'inspection',
        label: 'Oględziny',
        statuses: ['inspection_pending', 'inspected'],
        responsible: (work) => work.claimHandlerName,
        startedOn: (work) => work.plannedInspectionOn,
    },
    {
        key: 'estimate',
        label: 'Kosztorys',
        statuses: ['estimate_preparing'],
        responsible: (work) => work.claimHandlerName,
        startedOn: (work) => work.estimatePreparedOn,
    },
    {
        key: 'insurer',
        label: 'Oczekiwanie na TU',
        statuses: ['estimate_sent', 'approval_pending', 'rejected'],
        responsible: (work) => work.claimHandlerName,
        startedOn: (work) => work.estimateSentOn || work.insurerDecisionOn,
    },
    {
        key: 'parts',
        label: 'Części',
        statuses: ['accepted', 'parts_pending'],
        startedOn: (work) => work.estimateAcceptedOn || work.insurerDecisionOn,
    },
    {
        key: 'repair',
        label: 'Naprawa',
        statuses: ['repair', 'paint_shop'],
        responsible: (work) => work.mechanics?.map(item => item.name).filter(Boolean).join(', '),
    },
    {
        key: 'quality',
        label: 'Kontrola jakości',
        statuses: ['quality_control'],
        responsible: (work) => work.mechanics?.map(item => item.name).filter(Boolean).join(', '),
    },
    {
        key: 'release',
        label: 'Gotowe do wydania',
        statuses: ['ready_for_pickup', 'released'],
        responsible: (work) => work.mechanics?.map(item => item.name).filter(Boolean).join(', '),
        startedOn: (work) => work.plannedReleaseOn,
    },
    {
        key: 'settlement',
        label: 'Rozliczenie',
        statuses: ['settled'],
        startedOn: (work) => work.paymentReceivedOn || work.invoicePaymentOn,
    },
    {
        key: 'archive',
        label: 'Archiwum',
        statuses: ['closed'],
    },
];

const toneClasses: Record<TimelineTone, { dot: string; line: string; label: string; panel: string }> = {
    gray: {
        dot: 'bg-gray-100 text-gray-500 ring-gray-200',
        line: 'bg-gray-200',
        label: 'text-gray-500',
        panel: 'border-gray-200 bg-gray-50 text-gray-600',
    },
    blue: {
        dot: 'bg-blue-600 text-white ring-blue-200',
        line: 'bg-blue-200',
        label: 'text-blue-900',
        panel: 'border-blue-200 bg-blue-50 text-blue-900',
    },
    green: {
        dot: 'bg-green-600 text-white ring-green-200',
        line: 'bg-green-200',
        label: 'text-green-900',
        panel: 'border-green-200 bg-green-50 text-green-900',
    },
    red: {
        dot: 'bg-red-600 text-white ring-red-200',
        line: 'bg-red-200',
        label: 'text-red-900',
        panel: 'border-red-200 bg-red-50 text-red-900',
    },
};

function normalizeStatus(status?: string | null) {
    return (status ?? '').toLowerCase();
}

function formatDateTime(value?: string | Date | null) {
    return value ? moment(value).locale('pl').format('DD.MM.YYYY HH:mm') : 'Brak danych';
}

function getCurrentStepIndex(work: IWorkData) {
    const damageStatus = normalizeStatus(work.damageStatus);
    const workStatus = normalizeStatus(work.status);

    if (workStatus === 'closed') return timelineSteps.findIndex(step => step.key === 'archive');

    const index = timelineSteps.findIndex(step => step.statuses.includes(damageStatus));
    if (index >= 0) return index;

    return 0;
}

function getStepHistory(step: TimelineStep, history?: IWorkStatusHistory[]) {
    return (history ?? []).filter(item => {
        const oldStatus = normalizeStatus(item.oldStatus);
        const newStatus = normalizeStatus(item.newStatus);
        return step.statuses.includes(oldStatus) || step.statuses.includes(newStatus);
    });
}

function isReactionStep(step: TimelineStep, work: IWorkData, currentIndex: number, stepIndex: number) {
    if (stepIndex !== currentIndex) return false;
    const damageStatus = normalizeStatus(work.damageStatus);

    if (['on_hold', 'rejected'].includes(damageStatus)) return true;
    if (step.key === 'insurer' && !work.insurerDecisionOn && !work.estimateAcceptedOn) return true;
    if (step.key === 'estimate' && !work.audatexEstimateNumber) return true;
    if (step.key === 'settlement' && getSettlementStatusLabel(work.settlementStatus) !== 'Rozliczone') return true;

    return false;
}

function getStepTone(step: TimelineStep, work: IWorkData, currentIndex: number, stepIndex: number): TimelineTone {
    if (isReactionStep(step, work, currentIndex, stepIndex)) return 'red';
    if (stepIndex < currentIndex) return 'green';
    if (stepIndex === currentIndex) return 'blue';
    return 'gray';
}

function getNextStep(work: IWorkData, currentIndex: number) {
    const missing: string[] = [];
    let text = 'Kontynuuj obsługę sprawy zgodnie z aktualnym etapem.';
    let deadline = '';

    if (!work.claimNumber) missing.push('Numer szkody');
    if (!work.assignmentOfClaimSigned) missing.push('Cesja');
    if (!work.powerOfAttorneySigned) missing.push('Pełnomocnictwo');

    const currentKey = timelineSteps[currentIndex]?.key;
    if (currentKey === 'new' || currentKey === 'contact') {
        text = 'Skontaktuj się z klientem i ustal tryb oględzin.';
    }
    else if (currentKey === 'inspection') {
        text = 'Przygotuj oględziny i uzupełnij dokumentację szkody.';
        deadline = work.plannedInspectionOn ? formatDateTime(work.plannedInspectionOn) : '';
    }
    else if (currentKey === 'estimate') {
        text = 'Przygotuj kosztorys i wyślij go do TU.';
        if (!work.audatexEstimateNumber) missing.push('Kosztorys');
    }
    else if (currentKey === 'insurer') {
        text = 'Oczekiwanie na decyzję TU.';
        if (!work.insurerDecisionOn && !work.estimateAcceptedOn) missing.push('Decyzja TU');
    }
    else if (currentKey === 'parts') {
        text = 'Oczekiwanie na części.';
        missing.push('Potwierdzenie dostępności części');
    }
    else if (currentKey === 'repair') {
        text = 'Doprowadź naprawę do kontroli jakości.';
    }
    else if (currentKey === 'quality') {
        text = 'Wykonaj kontrolę jakości przed wydaniem.';
    }
    else if (currentKey === 'release') {
        text = 'Przygotuj wydanie pojazdu klientowi.';
        deadline = work.plannedReleaseOn ? formatDateTime(work.plannedReleaseOn) : '';
    }
    else if (currentKey === 'settlement') {
        text = 'Zamknij rozliczenie sprawy.';
        if (getSettlementStatusLabel(work.settlementStatus) !== 'Rozliczone') missing.push('Rozliczenie');
    }
    else if (currentKey === 'archive') {
        text = 'Sprawa znajduje się w archiwum.';
    }

    return {
        text,
        missing: Array.from(new Set(missing)),
        deadline,
        requiresAction: missing.length > 0 || isReactionStep(timelineSteps[currentIndex], work, currentIndex, currentIndex),
    };
}

export default function CaseFlowTimeline({ work }: { work: IWorkData }) {
    const currentIndex = getCurrentStepIndex(work);
    const nextStep = getNextStep(work, currentIndex);

    return (
        <section className="border-t border-gray-100 bg-white px-6 py-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Case Flow Timeline</p>
                    <h3 className="text-base font-semibold text-gray-900">Przebieg sprawy</h3>
                </div>
                <p className="text-sm text-gray-500">Aktualny etap: {timelineSteps[currentIndex]?.label ?? getDamageStatusLabel(work.damageStatus)}</p>
            </div>

            <div className="mt-5 overflow-x-auto pb-2">
                <div className="flex min-w-max items-start gap-2">
                    {timelineSteps.map((step, index) => {
                        const tone = getStepTone(step, work, currentIndex, index);
                        const classes = toneClasses[tone];
                        const history = getStepHistory(step, work.statusHistory);
                        const responsible = step.responsible?.(work) || 'Nie przypisano';
                        const startedOn = step.startedOn?.(work) || history[0]?.changedOn;

                        return (
                            <details key={step.key} className="group relative w-32 shrink-0">
                                <summary className="flex cursor-pointer list-none flex-col items-center text-center outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-indigo-500">
                                    <div className="flex w-full items-center">
                                        <span className={clsx('flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ring-4', classes.dot)}>
                                            {index + 1}
                                        </span>
                                        {index < timelineSteps.length - 1 && <span className={clsx('ml-2 h-0.5 flex-1', classes.line)} />}
                                    </div>
                                    <span className={clsx('mt-2 text-xs font-semibold leading-4', classes.label)}>{step.label}</span>
                                </summary>
                                <div className={clsx('mt-3 rounded-md border p-3 text-left text-xs shadow-sm', classes.panel)}>
                                    {tone === 'red' && <p className="mb-2 font-semibold text-red-800">Wymaga działania</p>}
                                    <p><span className="font-semibold">Start:</span> {formatDateTime(startedOn)}</p>
                                    <p><span className="font-semibold">Odpowiedzialny:</span> {responsible}</p>
                                    <div className="mt-2">
                                        <p className="font-semibold">Historia:</p>
                                        {history.length > 0 ? (
                                            <ul className="mt-1 space-y-1">
                                                {history.slice(0, 3).map(item => (
                                                    <li key={item.id}>
                                                        {formatDateTime(item.changedOn)} · {getDamageStatusLabel(item.newStatus)}
                                                        {item.comment ? ` · ${item.comment}` : ''}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="mt-1">Brak wpisów historii dla tego etapu.</p>
                                        )}
                                    </div>
                                </div>
                            </details>
                        );
                    })}
                </div>
            </div>

            <div className={clsx('mt-5 rounded-lg border p-4', nextStep.requiresAction ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50')}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <p className={clsx('text-sm font-semibold', nextStep.requiresAction ? 'text-red-900' : 'text-blue-900')}>
                            Następny krok
                        </p>
                        <p className={clsx('mt-1 text-sm', nextStep.requiresAction ? 'text-red-800' : 'text-blue-800')}>
                            {nextStep.text}
                        </p>
                    </div>
                    {nextStep.requiresAction && <span className="inline-flex w-fit rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800 ring-1 ring-red-600/20">
                        Wymaga działania
                    </span>}
                </div>

                {nextStep.missing.length > 0 && <div className="mt-3">
                    <p className="text-sm font-medium text-gray-900">Brakuje:</p>
                    <ul className="mt-1 space-y-1 text-sm text-gray-700">
                        {nextStep.missing.map(item => <li key={item}>□ {item}</li>)}
                    </ul>
                </div>}

                {nextStep.deadline && <p className="mt-3 text-sm text-gray-700">
                    <span className="font-medium text-gray-900">Termin:</span> {nextStep.deadline}
                </p>}
            </div>
        </section>
    );
}
