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
    owner?: (work: IWorkData) => string | null | undefined;
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
        owner: (work) => work.claimHandlerName,
        startedOn: (work) => work.claimReportedOn || work.startedOn?.toString(),
    },
    {
        key: 'inspection',
        label: 'Oględziny',
        statuses: ['inspection_pending', 'inspected'],
        owner: (work) => work.claimHandlerName,
        startedOn: (work) => work.plannedInspectionOn,
        completedOn: (work) => work.plannedInspectionOn,
    },
    {
        key: 'estimate',
        label: 'Kosztorys',
        statuses: ['estimate_preparing'],
        owner: (work) => work.claimHandlerName,
        startedOn: (work) => work.estimatePreparedOn,
        completedOn: (work) => work.estimateSentOn,
    },
    {
        key: 'insurer',
        label: 'Oczekiwanie na TU',
        statuses: ['estimate_sent', 'approval_pending', 'rejected'],
        owner: (work) => work.claimHandlerName,
        startedOn: (work) => work.estimateSentOn || work.insurerDecisionOn,
        completedOn: (work) => work.insurerDecisionOn || work.estimateAcceptedOn,
    },
    {
        key: 'parts',
        label: 'Części',
        statuses: ['accepted', 'parts_pending'],
        owner: () => 'Karol',
        startedOn: (work) => work.estimateAcceptedOn || work.insurerDecisionOn,
    },
    {
        key: 'repair',
        label: 'Naprawa',
        statuses: ['repair', 'paint_shop'],
        owner: (work) => work.mechanics?.map(item => item.name).filter(Boolean).join(', '),
    },
    {
        key: 'quality',
        label: 'Kontrola jakości',
        statuses: ['quality_control'],
        owner: (work) => work.mechanics?.map(item => item.name).filter(Boolean).join(', '),
    },
    {
        key: 'release',
        label: 'Gotowe do wydania',
        statuses: ['ready_for_pickup', 'released'],
        owner: (work) => work.mechanics?.map(item => item.name).filter(Boolean).join(', '),
        startedOn: (work) => work.plannedReleaseOn,
        completedOn: (work) => work.plannedReleaseOn,
    },
    {
        key: 'settlement',
        label: 'Rozliczenie',
        statuses: ['settled'],
        owner: () => 'Tomek',
        startedOn: (work) => work.paymentReceivedOn || work.invoicePaymentOn,
        completedOn: (work) => work.paymentReceivedOn || work.invoicePaymentOn,
    },
    {
        key: 'completion_pending',
        label: 'Oczekuje na dokończenie',
        statuses: ['on_hold'],
        owner: (work) => work.claimHandlerName,
        startedOn: (work) => work.plannedReleaseOn || work.startedOn?.toString(),
    },
    {
        key: 'archive',
        label: 'Archiwum',
        statuses: ['closed'],
    },
];

const toneClasses: Record<TimelineTone, { dot: string; line: string; label: string; meta: string; badge: string; details: string }> = {
    gray: {
        dot: 'border-gray-300 bg-white text-gray-500',
        line: 'bg-gray-200',
        label: 'text-gray-600',
        meta: 'text-gray-400',
        badge: 'bg-gray-100 text-gray-600 ring-gray-200',
        details: 'border-gray-200 bg-gray-50 text-gray-600',
    },
    blue: {
        dot: 'border-blue-600 bg-blue-600 text-white shadow-sm shadow-blue-200',
        line: 'bg-blue-300',
        label: 'text-blue-950',
        meta: 'text-blue-700',
        badge: 'bg-blue-50 text-blue-800 ring-blue-200',
        details: 'border-blue-200 bg-blue-50 text-blue-900',
    },
    green: {
        dot: 'border-green-600 bg-green-600 text-white',
        line: 'bg-green-300',
        label: 'text-green-900',
        meta: 'text-green-700',
        badge: 'bg-green-50 text-green-800 ring-green-200',
        details: 'border-green-200 bg-green-50 text-green-900',
    },
    red: {
        dot: 'border-red-600 bg-red-600 text-white shadow-sm shadow-red-200',
        line: 'bg-red-300',
        label: 'text-red-950',
        meta: 'text-red-700',
        badge: 'bg-red-50 text-red-800 ring-red-200',
        details: 'border-red-200 bg-red-50 text-red-900',
    },
};

const toneLabels: Record<TimelineTone, string> = {
    gray: 'Oczekuje',
    blue: 'Aktualny',
    green: 'Zakończony',
    red: 'Wymaga reakcji',
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
    if (currentKey === 'inspection') return 'Uzupełnij';
    if (currentKey === 'estimate') return 'Uzupełnij';
    if (currentKey === 'insurer') return 'Przygotuj';
    if (currentKey === 'parts') return 'Sprawdź';
    if (currentKey === 'repair' || currentKey === 'quality') return 'Uzupełnij';
    if (currentKey === 'release' || currentKey === 'settlement') return 'Sprawdź';
    if (currentKey === 'completion_pending') return 'Sprawdź';
    return 'Sprawdź';
}

function getStepRecommendation(currentKey?: string) {
    if (currentKey === 'new' || currentKey === 'contact') return 'Skontaktuj się z klientem.';
    if (currentKey === 'inspection') return 'Uzupełnij dokumenty i potwierdź oględziny.';
    if (currentKey === 'estimate') return 'Przygotuj kosztorys.';
    if (currentKey === 'insurer') return 'Przygotuj ponaglenie.';
    if (currentKey === 'parts') return 'Sprawdź części.';
    if (currentKey === 'repair') return 'Doprowadź naprawę do kontroli jakości.';
    if (currentKey === 'quality') return 'Wykonaj kontrolę jakości.';
    if (currentKey === 'release') return 'Przygotuj wydanie pojazdu.';
    if (currentKey === 'settlement') return 'Zamknij rozliczenie.';
    if (currentKey === 'completion_pending') return 'Wyjaśnij blokadę przed archiwizacją.';
    if (currentKey === 'archive') return 'Sprawa jest w archiwum.';
    return 'Sprawdź sprawę.';
}

function getNextStep(work: IWorkData, currentIndex: number) {
    const missing: string[] = [];
    let reason = 'Sprawa wymaga dalszej obsługi zgodnie z aktualnym etapem.';
    let deadline = '';

    if (!work.claimNumber) missing.push('Numer szkody');
    if (!work.assignmentOfClaimSigned) missing.push('Cesja');
    if (!work.powerOfAttorneySigned) missing.push('Pełnomocnictwo');

    const currentKey = timelineSteps[currentIndex]?.key;
    if (currentKey === 'new' || currentKey === 'contact') {
        reason = 'Brakuje potwierdzenia kolejnego kroku z klientem.';
    }
    else if (currentKey === 'inspection') {
        reason = 'Oględziny wymagają przygotowania albo potwierdzenia.';
        deadline = work.plannedInspectionOn ? formatDateTime(work.plannedInspectionOn) : '';
    }
    else if (currentKey === 'estimate') {
        reason = 'Kosztorys nie jest jeszcze gotowy do dalszej obsługi.';
        if (!work.audatexEstimateNumber) missing.push('Kosztorys');
    }
    else if (currentKey === 'insurer') {
        reason = 'Termin odpowiedzi TU minął albo sprawa oczekuje na decyzję.';
        if (!work.insurerDecisionOn && !work.estimateAcceptedOn) missing.push('Decyzja TU');
    }
    else if (currentKey === 'parts') {
        reason = 'Sprawa zależy od dostępności części.';
        missing.push('Potwierdzenie dostępności części');
    }
    else if (currentKey === 'repair') {
        reason = 'Naprawa jest w toku.';
    }
    else if (currentKey === 'quality') {
        reason = 'Przed wydaniem potrzebna jest kontrola jakości.';
    }
    else if (currentKey === 'release') {
        reason = 'Pojazd można przygotować do wydania po domknięciu formalności.';
        deadline = work.plannedReleaseOn ? formatDateTime(work.plannedReleaseOn) : '';
    }
    else if (currentKey === 'settlement') {
        reason = 'Rozliczenie sprawy nie jest jeszcze zamknięte.';
        if (getSettlementStatusLabel(work.settlementStatus) !== 'Rozliczone') missing.push('Rozliczenie');
    }
    else if (currentKey === 'completion_pending') {
        reason = 'Sprawa czeka na dokończenie po naprawie.';
        missing.push('Element blokujący dokończenie');
    }
    else if (currentKey === 'archive') {
        reason = 'Sprawa znajduje się w archiwum.';
    }

    return {
        reason,
        recommendation: getStepRecommendation(currentKey),
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
    const totalDays = daysSince(work.claimReportedOn || work.startedOn?.toString()) ?? 0;
    const averageDays = 11;
    const deltaDays = totalDays - averageDays;

    const showPlaceholderMessage = () => {
        setActionMessage('Funkcja przygotowana do kolejnego etapu rozwoju.');
    };

    return (
        <section className="bg-white px-6 py-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Case Flow Timeline</p>
                    <h3 className="text-xl font-semibold text-gray-900">Przebieg sprawy</h3>
                    <p className="mt-1 text-sm text-gray-500">Oś procesu pokazuje aktualny etap, blokadę i osobę odpowiedzialną.</p>
                </div>
                <div className="grid grid-cols-3 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 text-sm shadow-xs">
                    <div className="px-4 py-3">
                        <p className="text-xs font-medium text-gray-500">Czas szkody</p>
                        <p className="mt-1 text-lg font-semibold text-gray-900">{totalDays} dni</p>
                    </div>
                    <div className="border-x border-gray-200 px-4 py-3">
                        <p className="text-xs font-medium text-gray-500">Średnia</p>
                        <p className="mt-1 text-lg font-semibold text-gray-900">{averageDays} dni</p>
                    </div>
                    <div className="px-4 py-3">
                        <p className="text-xs font-medium text-gray-500">Różnica</p>
                        <p className={clsx('mt-1 text-lg font-semibold', deltaDays > 0 ? 'text-red-700' : 'text-green-700')}>
                            {deltaDays > 0 ? `+${deltaDays}` : deltaDays} dni
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-6 overflow-x-auto pb-3">
                <div className="flex min-w-max items-start px-1">
                    {timelineSteps.map((step, index) => {
                        const tone = getStepTone(step, work, currentIndex, index);
                        const classes = toneClasses[tone];
                        const history = getStepHistory(step, work.statusHistory);
                        const owner = step.owner?.(work);
                        const meta = getStepMeta(step, work, history);

                        return (
                            <details key={step.key} className="group relative w-40 shrink-0 pr-4">
                                <summary className="cursor-pointer list-none outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-indigo-500">
                                    <div className="flex items-center">
                                        <span className={clsx('z-10 flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold', classes.dot)}>
                                            {index + 1}
                                        </span>
                                        {index < timelineSteps.length - 1 && <span className={clsx('-ml-0.5 h-0.5 flex-1 rounded-full', classes.line)} />}
                                    </div>
                                    <div className="mt-3 pr-2">
                                        <p className={clsx('text-sm font-semibold leading-5', classes.label)}>{step.label}</p>
                                        <div className="mt-1 space-y-0.5 text-xs">
                                            {meta.shortStartedOn && <p className={classes.meta}>od {meta.shortStartedOn}</p>}
                                            {meta.waitDays !== null && <p className={classes.meta}>{meta.waitDays} dni</p>}
                                            {owner && <p className={classes.meta}>Właściciel: {owner}</p>}
                                            <span className={clsx('mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1', classes.badge)}>{toneLabels[tone]}</span>
                                        </div>
                                    </div>
                                </summary>
                                <div className={clsx('mt-3 rounded-lg border p-3 text-xs shadow-sm', classes.details)}>
                                    <p className="font-semibold">Szczegóły</p>
                                    <dl className="mt-2 space-y-1">
                                        <div><dt className="inline font-semibold">Start:</dt> <dd className="inline">{formatDateTime(meta.startedOn)}</dd></div>
                                        {meta.completedOn && <div><dt className="inline font-semibold">Koniec:</dt> <dd className="inline">{formatDateTime(meta.completedOn)}</dd></div>}
                                        {owner && <div><dt className="inline font-semibold">Właściciel:</dt> <dd className="inline">{owner}</dd></div>}
                                    </dl>
                                    {history.length > 0 ? (
                                        <ul className="mt-2 space-y-1">
                                            {history.slice(0, 3).map(item => (
                                                <li key={item.id}>
                                                    {formatShortDate(item.changedOn)} · {getDamageStatusLabel(item.newStatus)}
                                                    {item.comment ? ` · ${item.comment}` : ''}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="mt-2">Brak zapisanej historii etapu.</p>
                                    )}
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
                            APPRA proponuje
                        </p>
                        <p className={clsx('mt-1 text-base font-medium', nextStep.requiresAction ? 'text-red-900' : 'text-blue-900')}>
                            {nextStep.reason}
                        </p>
                        <p className="mt-2 text-xl leading-none text-gray-400">↓</p>
                        <p className="mt-2 text-sm font-semibold text-gray-900">{nextStep.recommendation}</p>
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
