'use client'

import { query } from '@/_lib/client/query-api';
import PrimaryButton from '@/_components/PrimaryButton';
import FormInput from '@/_components/FormInput';
import FormLabel from '@/_components/FormLabel';
import FormTextArea from '@/_components/FormTextArea';
import Select from '@/_components/Select';
import { BanknotesIcon } from '@heroicons/react/20/solid';
import React from 'react';
import { getInvoicePaymentStatusLabel, getInvoiceSourceSystemLabel, invoicePaymentStatuses, invoiceSourceSystems } from '../model';

interface InvoiceSettlementData {
  workId: string;
  invoiceNumber?: string | null;
  invoiceIssuedOn?: string | null;
  invoiceNetAmount?: number | null;
  invoiceVatAmount?: number | null;
  invoiceGrossAmount?: number | null;
  insurerPaidAmount?: number | null;
  clientSurchargeAmount?: number | null;
  underpaymentAmount?: number | null;
  paymentDueOn?: string | null;
  invoicePaymentOn?: string | null;
  invoicePaymentStatus?: string | null;
  settlementNotes?: string | null;
  externalInvoiceId?: string | null;
  externalInvoiceNumber?: string | null;
  invoiceSourceSystem?: string | null;
}

function toDateInputValue(value?: string | null) {
  return value ? value.slice(0, 10) : '';
}

function formatDate(value?: string | null) {
  return value ? new Intl.DateTimeFormat('pl-PL').format(new Date(value)) : '';
}

function formatCurrency(value?: number | null) {
  return typeof value === 'number'
    ? new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(value).replace(/\u00A0/g, ' ')
    : '';
}

function numberOrNull(formData: FormData, name: string) {
  const value = formData.get(name)?.toString();
  return value ? Number(value) : null;
}

export default function InvoiceSettlement({ workId }: { workId: string }) {
  const [data, setData] = React.useState<InvoiceSettlementData | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    query({
      url: `work/${workId}/invoice-settlement`,
      method: 'GET',
      onSuccess: (result: InvoiceSettlementData) => setData(result),
      onFailure: () => setMessage('Nie udało się załadować rozliczeń.'),
    });
  }, [workId]);

  React.useEffect(() => {
    load();
  }, [load]);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setIsSaving(true);
    setMessage(null);

    query({
      url: `work/${workId}/invoice-settlement`,
      method: 'PUT',
      body: {
        invoiceNetAmount: numberOrNull(formData, 'invoiceNetAmount'),
        invoiceVatAmount: numberOrNull(formData, 'invoiceVatAmount'),
        invoiceGrossAmount: numberOrNull(formData, 'invoiceGrossAmount'),
        insurerPaidAmount: numberOrNull(formData, 'insurerPaidAmount'),
        clientSurchargeAmount: numberOrNull(formData, 'clientSurchargeAmount'),
        underpaymentAmount: numberOrNull(formData, 'underpaymentAmount'),
        paymentDueOn: formData.get('paymentDueOn')?.toString() || null,
        invoicePaymentOn: formData.get('invoicePaymentOn')?.toString() || null,
        invoicePaymentStatus: formData.get('invoicePaymentStatus')?.toString() || 'not_issued',
        settlementNotes: formData.get('settlementNotes')?.toString() || null,
        externalInvoiceId: formData.get('externalInvoiceId')?.toString() || null,
        externalInvoiceNumber: formData.get('externalInvoiceNumber')?.toString() || null,
        invoiceSourceSystem: formData.get('invoiceSourceSystem')?.toString() || 'manual',
      },
      onSuccess: () => {
        setIsSaving(false);
        setMessage('Rozliczenie zostało zapisane.');
        load();
      },
      onFailure: () => {
        setIsSaving(false);
        setMessage('Nie udało się zapisać rozliczenia.');
      },
    });
  };

  return (
    <section className="border-t border-gray-900/5 px-5 py-5">
      <div className="mb-4 flex items-center gap-2">
        <BanknotesIcon className="size-5 text-gray-400" aria-hidden="true" />
        <h2 className="font-semibold text-gray-900">Faktury i rozliczenia</h2>
      </div>

      {!data ? (
        <p className="text-sm text-gray-500">Ładowanie rozliczeń...</p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2 text-sm text-gray-500">
              <p><span className="font-medium text-gray-700">Numer faktury:</span> {data.invoiceNumber || data.externalInvoiceNumber || 'Brak faktury'}</p>
              <p><span className="font-medium text-gray-700">Data wystawienia:</span> {formatDate(data.invoiceIssuedOn) || 'Brak daty'}</p>
              <p><span className="font-medium text-gray-700">Status płatności:</span> {getInvoicePaymentStatusLabel(data.invoicePaymentStatus)}</p>
              <p><span className="font-medium text-gray-700">Źródło:</span> {getInvoiceSourceSystemLabel(data.invoiceSourceSystem)}</p>
              {formatCurrency(data.underpaymentAmount) && <p><span className="font-medium text-gray-700">Niedopłata:</span> {formatCurrency(data.underpaymentAmount)}</p>}
            </div>

            <FormInput name="externalInvoiceNumber" label="Numer faktury" defaultValue={data.externalInvoiceNumber ?? data.invoiceNumber ?? ''}></FormInput>
            <FormInput name="invoiceNetAmount" type="number" step="0.01" label="Kwota netto" defaultValue={data.invoiceNetAmount ?? ''}></FormInput>
            <FormInput name="invoiceVatAmount" type="number" step="0.01" label="VAT" defaultValue={data.invoiceVatAmount ?? ''}></FormInput>
            <FormInput name="invoiceGrossAmount" type="number" step="0.01" label="Kwota brutto" defaultValue={data.invoiceGrossAmount ?? ''}></FormInput>
            <FormInput name="insurerPaidAmount" type="number" step="0.01" label="Zapłacone przez ubezpieczyciela" defaultValue={data.insurerPaidAmount ?? ''}></FormInput>
            <FormInput name="clientSurchargeAmount" type="number" step="0.01" label="Dopłata klienta" defaultValue={data.clientSurchargeAmount ?? ''}></FormInput>
            <FormInput name="underpaymentAmount" type="number" step="0.01" label="Niedopłata" defaultValue={data.underpaymentAmount ?? ''}></FormInput>
            <FormInput name="paymentDueOn" type="date" label="Termin płatności" defaultValue={toDateInputValue(data.paymentDueOn)}></FormInput>
            <FormInput name="invoicePaymentOn" type="date" label="Data płatności" defaultValue={toDateInputValue(data.invoicePaymentOn)}></FormInput>

            <div>
              <FormLabel name="invoicePaymentStatus" label="Status płatności"></FormLabel>
              <div className="mt-2 grid grid-cols-1">
                <Select name="invoicePaymentStatus" defaultValue={data.invoicePaymentStatus || 'not_issued'}>
                  {invoicePaymentStatuses.map(status => <option key={status.value} value={status.value}>{status.label}</option>)}
                </Select>
              </div>
            </div>

            <div>
              <FormLabel name="invoiceSourceSystem" label="Źródło faktury"></FormLabel>
              <div className="mt-2 grid grid-cols-1">
                <Select name="invoiceSourceSystem" defaultValue={data.invoiceSourceSystem || 'manual'}>
                  {invoiceSourceSystems.map(source => <option key={source.value} value={source.value}>{source.label}</option>)}
                </Select>
              </div>
            </div>

            <FormInput name="externalInvoiceId" label="Zewnętrzny identyfikator faktury" defaultValue={data.externalInvoiceId ?? ''}></FormInput>
            <div className="sm:col-span-2">
              <FormTextArea name="settlementNotes" label="Uwagi do rozliczenia" rows={4} defaultValue={data.settlementNotes ?? ''}></FormTextArea>
            </div>
          </div>

          <p className="text-xs text-gray-500">Fakturownia jest tylko przygotowana jako źródło danych. Połączenie z API nie jest jeszcze zaimplementowane.</p>
          {message && <p className="text-sm text-gray-500">{message}</p>}
          <PrimaryButton id="btnInvoiceSettlement" disabled={isSaving}>{isSaving ? 'Zapisywanie...' : 'Zapisz rozliczenie'}</PrimaryButton>
        </form>
      )}
    </section>
  );
}
