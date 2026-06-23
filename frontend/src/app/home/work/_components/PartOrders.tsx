'use client'

import { query } from '@/_lib/client/query-api';
import FormInput from '@/_components/FormInput';
import FormLabel from '@/_components/FormLabel';
import FormTextArea from '@/_components/FormTextArea';
import PrimaryButton from '@/_components/PrimaryButton';
import Select from '@/_components/Select';
import { CubeIcon } from '@heroicons/react/20/solid';
import React from 'react';

interface WorkPartOrder {
  id: string;
  workId: string;
  partName: string;
  oemNumber?: string | null;
  supplier?: string | null;
  quantity: number;
  netPrice?: number | null;
  vatAmount?: number | null;
  grossPrice?: number | null;
  status: string;
  orderedOn?: string | null;
  plannedDeliveryOn?: string | null;
  deliveredOn?: string | null;
  orderNumber?: string | null;
  notes?: string | null;
  externalSupplierId?: string | null;
  externalOrderId?: string | null;
  sourceSystem?: string | null;
}

const partStatuses = [
  { value: 'to_order', label: 'Do zamówienia' },
  { value: 'ordered', label: 'Zamówiona' },
  { value: 'in_delivery', label: 'W dostawie' },
  { value: 'delivered', label: 'Dostarczona' },
  { value: 'returned', label: 'Zwrócona' },
  { value: 'cancelled', label: 'Anulowana' },
] as const;

const sourceSystems = [
  { value: 'manual', label: 'Ręcznie' },
  { value: 'inter_cars', label: 'Inter Cars' },
  { value: 'other', label: 'Inny' },
] as const;

function statusLabel(status?: string | null) {
  return partStatuses.find(item => item.value === status)?.label ?? status ?? 'Do zamówienia';
}

function sourceLabel(source?: string | null) {
  return sourceSystems.find(item => item.value === source)?.label ?? source ?? 'Ręcznie';
}

function formatDate(value?: string | null) {
  return value ? new Intl.DateTimeFormat('pl-PL').format(new Date(value)) : '';
}

function toDateInputValue(value?: string | null) {
  return value ? value.slice(0, 10) : '';
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

export default function PartOrders({ workId }: { workId: string }) {
  const [items, setItems] = React.useState<WorkPartOrder[]>([]);
  const [editing, setEditing] = React.useState<WorkPartOrder | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  const load = React.useCallback(() => {
    query({
      url: `work/${workId}/part-orders`,
      method: 'GET',
      onSuccess: (result: WorkPartOrder[]) => setItems(result || []),
      onFailure: () => setMessage('Nie udało się załadować części.'),
    });
  }, [workId]);

  React.useEffect(() => {
    load();
  }, [load]);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const body = {
      partName: formData.get('partName')?.toString() || '',
      oemNumber: formData.get('oemNumber')?.toString() || null,
      supplier: formData.get('supplier')?.toString() || null,
      quantity: numberOrNull(formData, 'quantity') ?? 1,
      netPrice: numberOrNull(formData, 'netPrice'),
      vatAmount: numberOrNull(formData, 'vatAmount'),
      grossPrice: numberOrNull(formData, 'grossPrice'),
      status: formData.get('status')?.toString() || 'to_order',
      orderedOn: formData.get('orderedOn')?.toString() || null,
      plannedDeliveryOn: formData.get('plannedDeliveryOn')?.toString() || null,
      deliveredOn: formData.get('deliveredOn')?.toString() || null,
      orderNumber: formData.get('orderNumber')?.toString() || null,
      notes: formData.get('notes')?.toString() || null,
      externalSupplierId: formData.get('externalSupplierId')?.toString() || null,
      externalOrderId: formData.get('externalOrderId')?.toString() || null,
      sourceSystem: formData.get('sourceSystem')?.toString() || 'manual',
    };

    if (!body.partName.trim()) {
      setMessage('Podaj nazwę części.');
      return;
    }

    setIsSaving(true);
    setMessage(null);
    query({
      url: editing ? `work/${workId}/part-orders/${editing.id}` : `work/${workId}/part-orders`,
      method: editing ? 'PUT' : 'POST',
      body,
      onSuccess: () => {
        setIsSaving(false);
        setEditing(null);
        setMessage(editing ? 'Pozycja części została zaktualizowana.' : 'Pozycja części została dodana.');
        load();
      },
      onFailure: () => {
        setIsSaving(false);
        setMessage('Nie udało się zapisać pozycji części.');
      },
    });
  };

  const remove = (item: WorkPartOrder) => {
    query({
      url: `work/${workId}/part-orders/${item.id}`,
      method: 'DELETE',
      onSuccess: () => {
        setMessage('Pozycja części została usunięta.');
        load();
      },
      onFailure: () => setMessage('Nie udało się usunąć pozycji części.'),
    });
  };

  return (
    <section className="border-t border-gray-900/5 px-5 py-5">
      <div className="mb-4 flex items-center gap-2">
        <CubeIcon className="size-5 text-gray-400" aria-hidden="true" />
        <h2 className="font-semibold text-gray-900">Części i zamówienia</h2>
      </div>

      {items.length === 0 ? (
        <p className="mb-4 text-sm text-gray-500">Brak części dodanych do zlecenia.</p>
      ) : (
        <div className="mb-5 space-y-3">
          {items.map(item => (
            <div key={item.id} className="rounded-md border border-gray-200 p-3 text-sm text-gray-600">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900">{item.partName}</p>
                  <p>{[item.oemNumber, item.supplier, item.orderNumber].filter(Boolean).join(' · ')}</p>
                </div>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">{statusLabel(item.status)}</span>
              </div>
              <div className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
                <p>Ilość: {item.quantity}</p>
                <p>Netto: {formatCurrency(item.netPrice)}</p>
                <p>VAT: {formatCurrency(item.vatAmount)}</p>
                <p>Brutto: {formatCurrency(item.grossPrice)}</p>
                <p>Data zamówienia: {formatDate(item.orderedOn)}</p>
                <p>Planowana dostawa: {formatDate(item.plannedDeliveryOn)}</p>
                <p>Data dostawy: {formatDate(item.deliveredOn)}</p>
                <p>Źródło: {sourceLabel(item.sourceSystem)}</p>
              </div>
              {item.notes && <p className="mt-2 whitespace-pre-line">Uwagi: {item.notes}</p>}
              <div className="mt-3 flex gap-2">
                <button type="button" className="text-sm font-medium text-indigo-600" onClick={() => setEditing(item)}>Edytuj</button>
                <button type="button" className="text-sm font-medium text-red-600" onClick={() => remove(item)}>Usuń</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <form key={editing?.id ?? 'new'} onSubmit={onSubmit} className="space-y-3 rounded-md bg-gray-50 p-3">
        <p className="text-sm font-semibold text-gray-900">{editing ? 'Edytuj część' : 'Dodaj część'}</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormInput name="partName" label="Nazwa części" defaultValue={editing?.partName ?? ''}></FormInput>
          <FormInput name="oemNumber" label="Numer katalogowy / OEM" defaultValue={editing?.oemNumber ?? ''}></FormInput>
          <FormInput name="supplier" label="Dostawca" defaultValue={editing?.supplier ?? ''}></FormInput>
          <FormInput name="quantity" type="number" step="0.01" label="Ilość" defaultValue={editing?.quantity ?? 1}></FormInput>
          <FormInput name="netPrice" type="number" step="0.01" label="Cena netto" defaultValue={editing?.netPrice ?? ''}></FormInput>
          <FormInput name="vatAmount" type="number" step="0.01" label="VAT" defaultValue={editing?.vatAmount ?? ''}></FormInput>
          <FormInput name="grossPrice" type="number" step="0.01" label="Cena brutto" defaultValue={editing?.grossPrice ?? ''}></FormInput>
          <div>
            <FormLabel name="status" label="Status"></FormLabel>
            <div className="mt-2 grid grid-cols-1">
              <Select name="status" defaultValue={editing?.status ?? 'to_order'}>
                {partStatuses.map(status => <option key={status.value} value={status.value}>{status.label}</option>)}
              </Select>
            </div>
          </div>
          <FormInput name="orderedOn" type="date" label="Data zamówienia" defaultValue={toDateInputValue(editing?.orderedOn)}></FormInput>
          <FormInput name="plannedDeliveryOn" type="date" label="Planowana data dostawy" defaultValue={toDateInputValue(editing?.plannedDeliveryOn)}></FormInput>
          <FormInput name="deliveredOn" type="date" label="Data dostawy" defaultValue={toDateInputValue(editing?.deliveredOn)}></FormInput>
          <FormInput name="orderNumber" label="Numer zamówienia" defaultValue={editing?.orderNumber ?? ''}></FormInput>
          <FormInput name="externalSupplierId" label="Zewnętrzny identyfikator dostawcy" defaultValue={editing?.externalSupplierId ?? ''}></FormInput>
          <FormInput name="externalOrderId" label="Zewnętrzny identyfikator zamówienia" defaultValue={editing?.externalOrderId ?? ''}></FormInput>
          <div>
            <FormLabel name="sourceSystem" label="Źródło"></FormLabel>
            <div className="mt-2 grid grid-cols-1">
              <Select name="sourceSystem" defaultValue={editing?.sourceSystem ?? 'manual'}>
                {sourceSystems.map(source => <option key={source.value} value={source.value}>{source.label}</option>)}
              </Select>
            </div>
          </div>
          <div className="sm:col-span-2">
            <FormTextArea name="notes" label="Uwagi" rows={3} defaultValue={editing?.notes ?? ''}></FormTextArea>
          </div>
        </div>
        <p className="text-xs text-gray-500">Inter Cars jest tylko przygotowany jako źródło danych. Integracja nie jest jeszcze zaimplementowana.</p>
        {message && <p className="text-sm text-gray-500">{message}</p>}
        <div className="flex items-center gap-3">
          <PrimaryButton id="btnPartOrder" disabled={isSaving}>{isSaving ? 'Zapisywanie...' : editing ? 'Zapisz część' : 'Dodaj część'}</PrimaryButton>
          {editing && <button type="button" className="text-sm font-medium text-gray-600" onClick={() => setEditing(null)}>Anuluj edycję</button>}
        </div>
      </form>
    </section>
  );
}
