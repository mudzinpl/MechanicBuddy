'use client'

import {
  ArrowDownTrayIcon,
  DocumentIcon,
  EyeIcon,
  PaperClipIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/20/solid';
import { useRouter } from 'next/navigation';
import { FormEvent, useRef, useState, useTransition } from 'react';
import { IWorkDocument } from '../model';

const categories = [
  { value: 'vehicle_photos', label: 'Zdjęcia pojazdu' },
  { value: 'audatex_estimates', label: 'Kosztorys Audatex' },
  { value: 'audanet_estimates', label: 'Kosztorys Audanet' },
  { value: 'manual_calculations', label: 'Kalkulacja własna' },
  { value: 'insurer_verifications', label: 'Weryfikacja ubezpieczyciela' },
  { value: 'insurer_decisions', label: 'Decyzja ubezpieczyciela' },
  { value: 'claim_assignments', label: 'Cesja' },
  { value: 'authorizations', label: 'Pełnomocnictwo' },
  { value: 'payment_demands', label: 'Wezwanie do dopłaty' },
  { value: 'transfer_confirmations', label: 'Potwierdzenie przelewu' },
  { value: 'invoices', label: 'Faktura VAT' },
  { value: 'notes', label: 'Nota księgowa' },
  { value: 'client_documents', label: 'Dokument klienta' },
  { value: 'other', label: 'Inne' },
] as const;

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function WorkDocuments({
  workId,
  documents,
}: {
  workId: string;
  documents: IWorkDocument[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const [preview, setPreview] = useState<IWorkDocument | null>(null);
  const [isDeleting, startDeleting] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  const upload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsUploading(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/work-documents/${workId}`, {
        method: 'POST',
        body: new FormData(event.currentTarget),
      });
      if (!response.ok) throw new Error(await response.text());
      formRef.current?.reset();
      setMessage({ text: 'Dokumenty zostały dodane.', error: false });
      router.refresh();
    } catch (error) {
      console.error('Nie udało się dodać dokumentów:', error);
      setMessage({ text: 'Nie udało się dodać dokumentów. Sprawdź format i rozmiar plików.', error: true });
    } finally {
      setIsUploading(false);
    }
  };

  const remove = (document: IWorkDocument) => {
    if (!window.confirm(`Czy na pewno usunąć plik „${document.fileName}”?`)) return;
    startDeleting(async () => {
      setMessage(null);
      const response = await fetch(`/api/work-documents/${workId}/${document.id}`, { method: 'DELETE' });
      if (response.ok) {
        if (preview?.id === document.id) setPreview(null);
        setMessage({ text: 'Dokument został usunięty.', error: false });
        router.refresh();
      } else {
        setMessage({ text: 'Nie udało się usunąć dokumentu.', error: true });
      }
    });
  };

  return (
    <section className="border-t border-gray-200 px-5 py-6" aria-labelledby="documents-heading">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <PaperClipIcon className="size-5 text-gray-400" aria-hidden="true" />
          <h2 id="documents-heading" className="font-semibold text-gray-900">Dokumenty</h2>
        </div>
        <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
          {documents.length}
        </span>
      </div>

      <form
        ref={formRef}
        onSubmit={upload}
        className="mb-5 space-y-3 rounded-lg bg-gray-50 p-3"
      >
        <div>
          <label htmlFor="document-category" className="block text-sm font-medium text-gray-700">Kategoria</label>
          <select
            id="document-category"
            name="category"
            required
            className="mt-1 block w-full rounded-md border-0 bg-white py-2 pr-8 pl-3 text-sm text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600"
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>{category.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="work-documents" className="block text-sm font-medium text-gray-700">Pliki</label>
          <input
            id="work-documents"
            name="files"
            type="file"
            multiple
            required
            accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx,.txt"
            className="mt-1 block w-full text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-white file:px-3 file:py-2 file:text-sm file:font-semibold file:text-indigo-700 hover:file:bg-indigo-50"
          />
          <p className="mt-1 text-xs text-gray-500">PDF, obrazy i dokumenty biurowe, maksymalnie 25 MB na plik.</p>
        </div>
        <button
          type="submit"
          disabled={isUploading}
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 disabled:cursor-wait disabled:opacity-60"
        >
          {isUploading ? 'Dodawanie…' : 'Dodaj pliki'}
        </button>
      </form>

      {message && (
        <p role="status" className={`mb-4 rounded-md px-3 py-2 text-sm ${message.error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {message.text}
        </p>
      )}

      {documents.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 px-4 py-8 text-center">
          <DocumentIcon className="mx-auto size-9 text-gray-300" aria-hidden="true" />
          <p className="mt-2 text-sm font-medium text-gray-600">Brak dokumentów</p>
          <p className="mt-1 text-xs text-gray-400">Dodaj pierwszy dokument do tej sprawy.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {categories.map(category => {
            const items = documents.filter(document => document.category === category.value);
            if (items.length === 0) return null;
            return (
              <div key={category.value}>
                <h3 className="mb-2 text-sm font-semibold text-gray-700">{category.label} ({items.length})</h3>
                <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200">
                  {items.map(document => {
                    const contentUrl = `/api/work-documents/${workId}/${document.id}`;
                    const canPreview = document.contentType === 'application/pdf' || document.contentType.startsWith('image/');
                    return (
                      <li key={document.id} className="p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-gray-900" title={document.fileName}>{document.fileName}</p>
                            <p className="mt-1 text-xs text-gray-500">
                              {new Intl.DateTimeFormat('pl-PL', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(document.uploadedOn))}
                              {' · '}{document.uploadedByName}{' · '}{formatSize(document.fileSize)}
                            </p>
                          </div>
                          <div className="flex shrink-0 gap-1">
                            {canPreview && (
                              <button type="button" onClick={() => setPreview(document)} title="Podgląd" className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-indigo-600">
                                <EyeIcon className="size-4" aria-hidden="true" />
                              </button>
                            )}
                            <a href={`${contentUrl}?download=1`} title="Pobierz" className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-indigo-600">
                              <ArrowDownTrayIcon className="size-4" aria-hidden="true" />
                            </a>
                            <button type="button" disabled={isDeleting} onClick={() => remove(document)} title="Usuń" className="rounded p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50">
                              <TrashIcon className="size-4" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      )}

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/75 p-4" role="dialog" aria-modal="true" aria-label={`Podgląd pliku ${preview.fileName}`}>
          <div className="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <p className="truncate text-sm font-semibold text-gray-900">{preview.fileName}</p>
              <button type="button" onClick={() => setPreview(null)} title="Zamknij podgląd" className="rounded p-1 text-gray-500 hover:bg-gray-100">
                <XMarkIcon className="size-6" aria-hidden="true" />
              </button>
            </div>
            <div className="min-h-0 flex-1 bg-gray-100 p-3">
              {preview.contentType === 'application/pdf'
                ? <iframe src={`/api/work-documents/${workId}/${preview.id}`} title={preview.fileName} className="h-full w-full rounded bg-white" />
                // This authenticated application route is intentionally used instead of an external image loader.
                // eslint-disable-next-line @next/next/no-img-element
                : <img src={`/api/work-documents/${workId}/${preview.id}`} alt={`Podgląd: ${preview.fileName}`} className="h-full w-full object-contain" />}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
