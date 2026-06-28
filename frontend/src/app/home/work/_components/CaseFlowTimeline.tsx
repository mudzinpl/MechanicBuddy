'use client'

import clsx from 'clsx';
import moment from 'moment';
import React from 'react';
import { getDamageStatusLabel, getSettlementStatusLabel, IWorkData, IWorkStatusHistory } from '../model';

type TimelineTone = 'gray' | 'blue' | 'green' | 'red';

type TimelineStep = {
    key: string;
    label: string;
    statuses: string[];
    responsible?: (work: IWorkData) => string;
    startedOn?: (work: IWorkData) => string | null | undefined;
    completedOn?: (work: IWorkData) => string | null | undefined;
};

const timelineSteps: TimelineStep[] = [
    {
        key: 'new',
        label: 'Nowa szkoda',
        statuses: ['new'],
        startedOn: (work) => work.claimReportedOn || work.startedOn?.toString(),
        completedOn: (work) => work.claimReportedOn,
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
        completedOn: (work) => work.plannedInspectionOn,
    },
    {
        key: 'estimate',
        label: 'Kosztorys',
        statuses: ['estimate_preparing'],
        responsible: (work) => work.claimHandlerName,
        startedOn: (work) => work.estimatePreparedOn,
        completedOn: (work) => work.estimateSentOn,
    },
    {
        key: 'insurer',
        label: 'Oczekiwanie na TU',
        statuses: ['estimate_sent', 'approval_pending', 'rejected'],
        responsible: (work) => work.claimHandlerName,
        startedOn: (work) => work.estimateSentOn || work.insurerDecisionOn,
        completedOn: (work) => work.insurerDecisionOn || work.estimateAcceptedOn,
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
        completedOn: (work) => work.plannedReleaseOn,
    },
    {
        key: 'settlement',
        label: 'Rozliczenie',
        statuses: ['settled'],
        startedOn: (work) => work.paymentReceivedOn || work.invoicePaymentOn,
        completedOn: (work) => work.paymentReceivedOn || work.invoicePaymentOn,
    },
    {
        key: 'archive',
        label: 'Archiwum',
        statuses: ['closed'],
    },
];

const toneClasses: Record<TimelineTone, { dot: string; line: string; label: string; meta: string; panel: string; card: string }> = {
    gray: {
        dot: 'bg-gray-100 text-gray-500 ring-gray-200',
        line: 'bg-gray-200',
        label: 'text-gray-600',
        meta: 'text-gray-400',
        panel: 'border-gray-200 bg-gray-50 text-gray-600',
        card: 'border-gray-200 bg-white',
    },
    blue: {
        dot: 'bg-blue-600 text-white ring-blue-200',
        line: 'bg-blue-300',
        label: 'text-blue-950',
        meta: 'text-blue-700',
        panel: 'border-blue-200 bg-blue-50 text-blue-900',
        card: 'border-blue-300 bg-blue-50 shadow-sm',
    },
    green: {
        dot: 'bg-green-600 text-white ring-green-200',
        line: 'bg-green-300',
        label: 'text-green-900',
        meta: 'text-green-700',
        panel: 'border-green-200 bg-green-50 text-green-900',
        card: 'border-green-200 bg-green-50/60',
    },
    red: {
        dot: 'bg-red-600 text-white ring-red-200',
        line: 'bg-red-300',
        label: 'text-red-950',
        meta: 'text-red-700',
        panel: 'border-red-200 bg-red-50 text-red-900',
        card: 'border-red-300 bg-red-50 shadow-sm',
    },
};

function normalizeStatus(status?: string | null) {
    return (status ?? '').toLowerCase();
}

function formatDateTime(value?: string | Date | null) {
    return value ? moment(value).locale('pl').format('DD.MM.YYYY HH:mm') : 'Brak danych';
}

function formatShortDate(value?: string | Date | null) {
    return value ? moment(value).locale('pl').format('DD.MM') : '';
}

function daysSince(value?: string | Date | null) {
    if (!value) return null;
    const date = moment(value);
    if (!date.isValid()) return null;
    const days = moment().startOf('day').diff(date.startOf('day'), 'days');
    return days >= 0 ? days : null;
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

function getStepMeta(step: TimelineStep, work: IWorkData, history: IWorkStatusHistory[]) {
    const startedOn = step.startedOn?.(work) || history[0]?.changedOn;
    const completedOn = step.completedOn?.(work) || history[history.length - 1]?.changedOn;
    const waitDays = daysSince(startedOn);

    return {
        startedOn,
        completedOn,
        shortStartedOn: formatShortDate(startedOn),
        waitDays,
    };
}

function getActionLabel(currentKey?: string) {
    if (currentKey === 'new' || currentKey === 'contact') return 'Wyślij mail';
    if (currentKey === 'inspection') return 'Uzupełnij dokumenty';
    if (currentKey === 'estimate') return 'Uzupełnij dokumenty';
    if (currentKey === 'insurer') return 'Przygotuj ponaglenie';
    if (currentKey === 'parts') return 'Sprawdź części';
    if (currentKey === 'repair' || currentKey === 'quality') return 'Uzupełnij dokumenty';
    if (currentKey === 'release' || currentKey === 'settlement') return 'Sprawdź rozliczenie';
    return 'Sprawdź sprawę';
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
        actionLabel: getActionLabel(currentKey),
        requiresAction: missing.length > 0 || isReactionStep(timelineSteps[currentIndex], work, currentIndex, currentIndex),
    };
}

export default function CaseFlowTimeline({ work }: { work: IWorkData }) {
    const [actionMessage, setActionMessage] = React.useState('');
    const currentIndex = getCurrentStepIndex(work);
    const nextStep = getNextStep(work, currentIndex);

    const showPlaceholderMessage = () => {
        setActionMessage('Funkcja przygotowana do kolejnego etapu rozwoju.');
    };

    return (
        <section className="bg-white px-6 py-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Case Flow Timeline</p>
                    <h3 className="text-xl font-semibold text-gray-900">Przebieg sprawy</h3>
                </div>
                <p className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-900 ring-1 ring-blue-600/20">
                    Aktualny etap: {timelineSteps[currentIndex]?.label ?? getDamageStatusLabel(work.damageStatus)}
                </p>
            </div>

            <div className="mt-6 overflow-x-auto pb-3">
                <div className="flex min-w-max items-stretch gap-3">
                    {timelineSteps.map((step, index) => {
                        const tone = getStepTone(step, work, currentIndex, index);
                        const classes = toneClasses[tone];
                        const history = getStepHistory(step, work.statusHistory);
                        const responsible = step.responsible?.(work) || 'Nie przypisano';
                        const meta = getStepMeta(step, work, history);

                        return (
                            <details key={step.key} className={clsx('group relative w-40 shrink-0 rounded-xl border p-3', classes.card)}>
                                <summary className="flex cursor-pointer list-none flex-col outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-indigo-500">
                                    <div className="flex items-center">
                                        <span className={clsx('flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ring-4', classes.dot)}>
                                            {index + 1}
                                        </span>
                                        {index < timelineSteps.length - 1 && <span className={clsx('ml-3 h-1 flex-1 rounded-full', classes.line)} />}
                                    </div>
                                    <span className={clsx('mt-3 text-sm font-semibold leading-5', classes.label)}>{step.label}</span>
                                    {meta.shortStartedOn && <span className={clsx('mt-1 text-xs', classes.meta)}>od {meta.shortStartedOn}</span>}
                                    {index === currentIndex && meta.waitDays !== null && <span className={clsx('mt-1 text-xs font-medium', classes.meta)}>{meta.waitDays} dni</span>}
                                </summary>
                                <div className={clsx('mt-3 rounded-md border p-3 text-left text-xs shadow-sm', classes.panel)}>
                                    {tone === 'red' && <p className="mb-2 font-semibold text-red-800">Wymaga działania</p>}
                                    <p><span className="font-semibold">Start:</span> {formatDateTime(meta.startedOn)}</p>
                                    {meta.completedOn && <p><span className="font-semibold">Koniec:</span> {formatDateTime(meta.completedOn)}</p>}
                                    {meta.waitDays !== null && <p><span className="font-semibold">Czas oczekiwania:</span> {meta.waitDays} dni</p>}
                                    <p><span className="font-semibold">Odpowiedzialny:</span> {responsible}</p>
                                    <div className="mt-2">
                                        <p className="font-semibold">Historia:</p>
                                        {history.length > 0 ? (
                                            <ul className="mt-1 space-y-1">
                                                {history.slice(0, 3).map(item => (
                                                    <li key={item.id}>
                                                        {formatDateTime(item.changedOn)} · {getDamageStatusLabel(item.newStatus)}
                                                        {item.changedByName ? ` · ${item.changedByName}` : ''}
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

            <div className={clsx('mt-5 rounded-xl border p-4', nextStep.requiresAction ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50')}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <p className={clsx('text-sm font-semibold', nextStep.requiresAction ? 'text-red-900' : 'text-blue-900')}>
                            Następny krok
                        </p>
                        <p className={clsx('mt-1 text-base font-medium', nextStep.requiresAction ? 'text-red-900' : 'text-blue-900')}>
                            {nextStep.text}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {nextStep.requiresAction && <span className="inline-flex w-fit rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800 ring-1 ring-red-600/20">
                            Wymaga działania
                        </span>}
                        <button
                            type="button"
                            onClick={showPlaceholderMessage}
                            className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
                        >
                            {nextStep.actionLabel}
                        </button>
                    </div>
                </div>

                {nextStep.missing.length > 0 && <div className="mt-3">
                    <p className="text-sm font-medium text-gray-900">Brakuje:</p>
                    <ul className="mt-1 grid grid-cols-1 gap-1 text-sm text-gray-700 sm:grid-cols-2">
                        {nextStep.missing.map(item => <li key={item}>□ {item}</li>)}
                    </ul>
                </div>}

                {nextStep.deadline && <p className="mt-3 text-sm text-gray-700">
                    <span className="font-medium text-gray-900">Termin:</span> {nextStep.deadline}
                </p>}

                {actionMessage && <p className="mt-3 rounded-md bg-white/70 px-3 py-2 text-sm text-gray-700">
                    {actionMessage}
                </p>}
            </div>
        </section>
    );
}
