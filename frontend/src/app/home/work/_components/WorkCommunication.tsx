'use client'

import { ChatBubbleLeftRightIcon, DocumentTextIcon, TrashIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';
import { useRef, useTransition } from 'react';
import { IWorkDocument } from '../model';
import {
    communicationCategories,
    communicationStatuses,
    getCommunicationCategoryLabel,
    getCommunicationStatusClass,
    getCommunicationStatusLabel,
    IWorkCommunicationEntry,
} from '../communicationModel';
import { addCommunicationEntry, deleteCommunicationEntry } from '../actions/communication';

function formatDateTime(value: string) {
    return new Intl.DateTimeFormat('pl-PL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));
}

export default function WorkCommunication({
    workId,
    entries,
    documents,
}: {
    workId: string;
    entries: IWorkCommunicationEntry[];
    documents: IWorkDocument[];
}) {
    const formRef = useRef<HTMLFormElement>(null);
    const [isPending, startTransition] = useTransition();
    const nowLocal = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);

    return (
        <section className="border-t border-gray-200 px-5 py-6" aria-labelledby="communication-heading">
            <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <ChatBubbleLeftRightIcon className="size-5 text-gray-400" aria-hidden="true" />
                    <h2 id="communication-heading" className="font-semibold text-gray-900">Komunikacja</h2>
                </div>
                <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                    {entries.length}
                </span>
            </div>

            <form
                ref={formRef}
                action={(formData) => {
                    startTransition(async () => {
                        await addCommunicationEntry(formData);
                        formRef.current?.reset();
                    });
                }}
                className="mb-5 space-y-3 rounded-lg bg-gray-50 p-3"
            >
                <input type="hidden" name="workId" value={workId} />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                        <label htmlFor="communication-occurred-on" className="block text-sm font-medium text-gray-700">Data i godzina</label>
                        <input
                            id="communication-occurred-on"
                            name="occurredOn"
                            type="datetime-local"
                            defaultValue={nowLocal}
                            className="mt-1 block w-full rounded-md border-0 bg-white px-3 py-2 text-sm text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600"
                        />
                    </div>
                    <div>
                        <label htmlFor="communication-category" className="block text-sm font-medium text-gray-700">Kategoria</label>
                        <select
                            id="communication-category"
                            name="category"
                            required
                            className="mt-1 block w-full rounded-md border-0 bg-white py-2 pr-8 pl-3 text-sm text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600"
                        >
                            {communicationCategories.map(category => (
                                <option key={category.value} value={category.value}>{category.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="communication-status" className="block text-sm font-medium text-gray-700">Status</label>
                        <select
                            id="communication-status"
                            name="status"
                            defaultValue="information"
                            className="mt-1 block w-full rounded-md border-0 bg-white py-2 pr-8 pl-3 text-sm text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600"
                        >
                            {communicationStatuses.map(status => (
                                <option key={status.value} value={status.value}>{status.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="communication-document" className="block text-sm font-medium text-gray-700">Dokument</label>
                        <select
                            id="communication-document"
                            name="documentId"
                            className="mt-1 block w-full rounded-md border-0 bg-white py-2 pr-8 pl-3 text-sm text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600"
                        >
                            <option value="">Bez dokumentu</option>
                            {documents.map(document => (
                                <option key={document.id} value={document.id}>{document.fileName}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div>
                    <label htmlFor="communication-subject" className="block text-sm font-medium text-gray-700">Temat</label>
                    <input
                        id="communication-subject"
                        name="subject"
                        type="text"
                        className="mt-1 block w-full rounded-md border-0 bg-white px-3 py-2 text-sm text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600"
                    />
                </div>
                <div>
                    <label htmlFor="communication-note" className="block text-sm font-medium text-gray-700">Treść notatki</label>
                    <textarea
                        id="communication-note"
                        name="note"
                        required
                        rows={4}
                        className="mt-1 block w-full rounded-md border-0 bg-white px-3 py-2 text-sm text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isPending}
                    className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 disabled:cursor-wait disabled:opacity-60"
                >
                    {isPending ? 'Zapisywanie…' : 'Dodaj wpis'}
                </button>
            </form>

            {entries.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-300 px-4 py-8 text-center">
                    <ChatBubbleLeftRightIcon className="mx-auto size-9 text-gray-300" aria-hidden="true" />
                    <p className="mt-2 text-sm font-medium text-gray-600">Brak wpisów komunikacji</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {entries.map(entry => (
                        <article key={entry.id} className="border-l-2 border-gray-200 pl-3">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="font-medium text-gray-900">{formatDateTime(entry.occurredOn)}</p>
                                    <p className="text-sm font-semibold text-gray-900">{getCommunicationCategoryLabel(entry.category)}</p>
                                </div>
                                <button
                                    type="button"
                                    title="Usuń wpis"
                                    disabled={isPending}
                                    onClick={() => startTransition(() => deleteCommunicationEntry(workId, entry.id))}
                                    className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                >
                                    <TrashIcon className="size-4" aria-hidden="true" />
                                </button>
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                                <span className={clsx('inline-flex items-center rounded-md px-2 py-1 font-medium ring-1 ring-inset', getCommunicationStatusClass(entry.status))}>
                                    {getCommunicationStatusLabel(entry.status)}
                                </span>
                                <span className="text-gray-500">{entry.authorName || 'Nieznany autor'}</span>
                            </div>
                            {entry.subject && <p className="mt-2 text-sm font-medium text-gray-900">{entry.subject}</p>}
                            <p className="mt-1 whitespace-pre-line text-sm/6 text-gray-600">{entry.note}</p>
                            {entry.documentId && (
                                <a
                                    href={`/api/work-documents/${workId}/${entry.documentId}`}
                                    className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-500"
                                >
                                    <DocumentTextIcon className="size-4" aria-hidden="true" />
                                    {entry.documentFileName || 'Powiązany dokument'}
                                </a>
                            )}
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}
