'use client'

import { query } from '@/_lib/client/query-api';
import FormInput from '@/_components/FormInput';
import FormLabel from '@/_components/FormLabel';
import FormTextArea from '@/_components/FormTextArea';
import PrimaryButton from '@/_components/PrimaryButton';
import Select from '@/_components/Select';
import { TruckIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';
import React from 'react';
import { IMechanic } from '../model';

interface VehicleReleaseData {
  id: string;
  workId: string;
  plannedReleaseOn?: string | null;
  releasedOn?: string | null;
  releasedByEmployeeId?: string | null;
  releasedByEmployeeName?: string | null;
  receivedByName?: string | null;
  identityDocumentNumber?: string | null;
  mileageOut?: number | null;
  fuelOut?: string | null;
  releaseNotes?: string | null;
  clientReceivedDocuments: boolean;
  clientReceivedInvoiceInfo: boolean;
  vehicleWashed: boolean;
  finalControlCompleted: boolean;
  clientSignaturePlaceholder?: string | null;
}

function toDateInputValue(value?: string | null) {
  return value ? value.slice(0, 10) : '';
}

function numberOrNull(formData: FormData, name: string) {
  const value = formData.get(name)?.toString();
  return value ? Number(value) : null;
}

function dateOrNull(formData: FormData, name: string) {
  const value = formData.get(name)?.toString();
  return value || null;
}

export default function VehicleRelease({ workId }: { workId: string }) {
  const [data, setData] = React.useState<VehicleReleaseData | null>(null);
  const [employees, setEmployees] = React.useState<IMechanic[]>([]);
  const [isSaving, setIsSaving] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    query({
      url: `work/${workId}/vehicle-release`,
      method: 'GET',
      onSuccess: (result: VehicleReleaseData) => setData(result),
      onFailure: () => setMessage('Nie udało się załadować danych wydania pojazdu.'),
    });
  }, [workId]);

  React.useEffect(() => {
    load();
    query({
      url: 'employees',
      method: 'GET',
      onSuccess: (result: IMechanic[]) => setEmployees(result || []),
      onFailure: () => setEmployees([]),
    });
  }, [load]);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setIsSaving(true);
    setMessage(null);

    query({
      url: `work/${workId}/vehicle-release`,
      method: 'PUT',
      body: {
        plannedReleaseOn: dateOrNull(formData, 'plannedReleaseOn'),
        releasedOn: dateOrNull(formData, 'releasedOn'),
        releasedByEmployeeId: formData.get('releasedByEmployeeId')?.toString() || null,
        receivedByName: formData.get('receivedByName')?.toString() || null,
        identityDocumentNumber: formData.get('identityDocumentNumber')?.toString() || null,
        mileageOut: numberOrNull(formData, 'mileageOut'),
        fuelOut: formData.get('fuelOut')?.toString() || null,
        releaseNotes: formData.get('releaseNotes')?.toString() || null,
        clientReceivedDocuments: formData.get('clientReceivedDocuments') === 'on',
        clientReceivedInvoiceInfo: formData.get('clientReceivedInvoiceInfo') === 'on',
        vehicleWashed: formData.get('vehicleWashed') === 'on',
        finalControlCompleted: formData.get('finalControlCompleted') === 'on',
        clientSignaturePlaceholder: formData.get('clientSignaturePlaceholder')?.toString() || null,
      },
      onSuccess: () => {
        setIsSaving(false);
        setMessage('Dane wydania pojazdu zostały zapisane.');
        load();
      },
      onFailure: () => {
        setIsSaving(false);
        setMessage('Nie udało się zapisać danych wydania pojazdu.');
      },
    });
  };

  return (
    <section className="border-t border-gray-900/5 px-5 py-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <TruckIcon className="size-5 text-gray-400" aria-hidden="true" />
          <h2 className="font-semibold text-gray-900">Wydanie pojazdu</h2>
        </div>
        <Link href={`/home/work/vehicle-release-protocol/${workId}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
          Protokół
        </Link>
      </div>

      {!data ? (
        <p className="text-sm text-gray-500">Ładowanie danych wydania...</p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormInput name="plannedReleaseOn" type="date" label="Data planowanego wydania" defaultValue={toDateInputValue(data.plannedReleaseOn)}></FormInput>
            <FormInput name="releasedOn" type="date" label="Data faktycznego wydania" defaultValue={toDateInputValue(data.releasedOn)}></FormInput>

            <div>
              <FormLabel name="releasedByEmployeeId" label="Osoba wydająca"></FormLabel>
              <div className="mt-2 grid grid-cols-1">
                <Select name="releasedByEmployeeId" defaultValue={data.releasedByEmployeeId || ''}>
                  <option value="">Wybierz pracownika</option>
                  {employees.map(employee => <option key={employee.id} value={employee.id}>{employee.name}</option>)}
                </Select>
              </div>
            </div>

            <FormInput name="receivedByName" label="Osoba odbierająca" defaultValue={data.receivedByName ?? ''}></FormInput>
            <FormInput name="identityDocumentNumber" label="Numer dokumentu tożsamości (opcjonalnie)" defaultValue={data.identityDocumentNumber ?? ''}></FormInput>
            <FormInput name="mileageOut" type="number" label="Przebieg przy wydaniu" defaultValue={data.mileageOut ?? ''}></FormInput>
            <FormInput name="fuelOut" label="Stan paliwa" defaultValue={data.fuelOut ?? ''}></FormInput>

            <div className="sm:col-span-2 space-y-2 rounded-md border border-gray-200 p-3 text-sm text-gray-700">
              <label className="flex items-center gap-2">
                <input name="clientReceivedDocuments" type="checkbox" defaultChecked={data.clientReceivedDocuments} className="size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                <span>Klient odebrał dokumenty</span>
              </label>
              <label className="flex items-center gap-2">
                <input name="clientReceivedInvoiceInfo" type="checkbox" defaultChecked={data.clientReceivedInvoiceInfo} className="size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                <span>Klient otrzymał fakturę / informację o dopłacie</span>
              </label>
              <label className="flex items-center gap-2">
                <input name="vehicleWashed" type="checkbox" defaultChecked={data.vehicleWashed} className="size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                <span>Pojazd umyty</span>
              </label>
              <label className="flex items-center gap-2">
                <input name="finalControlCompleted" type="checkbox" defaultChecked={data.finalControlCompleted} className="size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                <span>Wykonano kontrolę końcową</span>
              </label>
            </div>

            <div className="sm:col-span-2">
              <FormTextArea name="releaseNotes" label="Uwagi przy wydaniu" rows={4} defaultValue={data.releaseNotes ?? ''}></FormTextArea>
            </div>
            <div className="sm:col-span-2">
              <FormTextArea name="clientSignaturePlaceholder" label="Podpis klienta" rows={2} defaultValue={data.clientSignaturePlaceholder ?? 'Podpis klienta zbierany poza systemem.'}></FormTextArea>
            </div>
          </div>

          {data.releasedOn && <p className="text-xs text-gray-500">Po zapisaniu faktycznej daty wydania zlecenie jest oznaczane jako „Wydane”.</p>}
          {message && <p className="text-sm text-gray-500">{message}</p>}
          <PrimaryButton id="btnVehicleRelease" disabled={isSaving}>{isSaving ? 'Zapisywanie...' : 'Zapisz wydanie'}</PrimaryButton>
        </form>
      )}
    </section>
  );
}
