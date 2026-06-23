'use client'

import FormInput from '@/_components/FormInput';
import FormTextArea from '@/_components/FormTextArea';
import PrimaryButton from '@/_components/PrimaryButton';
import SecondaryButton from '@/_components/SecondaryButton';
import { TruckIcon } from '@heroicons/react/20/solid';
import moment from 'moment';
import { useState } from 'react';
import { VehiclesCombobox } from '../../_components/SearchCombobox';
import { IWorkReplacementVehicle } from '../model';
import { addReplacementVehicle, cancelReplacementVehicle, returnReplacementVehicle } from '../actions/replacementVehicle';

const statusLabels: Record<string, string> = {
    planned: 'Planowany',
    issued: 'Wydany',
    returned: 'Zwrócony',
    cancelled: 'Anulowany',
};

function formatDate(value?: string | null) {
    return value ? moment(value).locale('pl').format('DD.MM.YYYY HH:mm') : '';
}

export default function ReplacementVehicle({
    workId,
    rental,
}: {
    workId: string,
    rental?: IWorkReplacementVehicle | null
}) {
    const [showAddForm, setShowAddForm] = useState(false);
    const activeRental = rental && rental.status !== 'returned' && rental.status !== 'cancelled';

    return (
        <section className="border-t border-gray-200 px-5 py-6" aria-labelledby="replacement-vehicle-heading">
            <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <TruckIcon className="size-5 text-gray-400" aria-hidden="true" />
                    <h2 id="replacement-vehicle-heading" className="font-semibold text-gray-900">Pojazd zastępczy</h2>
                </div>
                {rental && <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                    {statusLabels[rental.status] ?? rental.status}
                </span>}
            </div>

            {!rental && !showAddForm && (
                <SecondaryButton onClick={() => setShowAddForm(true)}>Dodaj pojazd zastępczy</SecondaryButton>
            )}

            {(!rental && showAddForm) && (
                <form action={addReplacementVehicle} className="space-y-3 rounded-lg bg-gray-50 p-3">
                    <input type="hidden" name="workId" value={workId} />
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Pojazd zastępczy</label>
                        <VehiclesCombobox name="replacementVehicleId"></VehiclesCombobox>
                    </div>
                    <FormInput name="issuedOn" type="datetime-local" label="Data wydania"></FormInput>
                    <FormInput name="plannedReturnOn" type="datetime-local" label="Termin zwrotu"></FormInput>
                    <FormInput name="mileageOut" type="number" label="Przebieg przy wydaniu"></FormInput>
                    <FormInput name="fuelOut" label="Paliwo przy wydaniu"></FormInput>
                    <FormTextArea name="conditionOut" label="Stan przy wydaniu"></FormTextArea>
                    <FormTextArea name="notes" label="Uwagi"></FormTextArea>
                    <div className="flex gap-2">
                        <PrimaryButton onClick={() => {}}>Zapisz wydanie</PrimaryButton>
                        <SecondaryButton onClick={() => setShowAddForm(false)}>Anuluj</SecondaryButton>
                    </div>
                </form>
            )}

            {rental && (
                <div className="space-y-3 text-sm text-gray-600">
                    <div className="rounded-lg border border-gray-200 p-3">
                        <p className="font-medium text-gray-900">{rental.replacementVehicleName}</p>
                        {rental.issuedOn && <p><span className="font-medium text-gray-700">Wydano:</span> {formatDate(rental.issuedOn)}</p>}
                        {rental.plannedReturnOn && <p><span className="font-medium text-gray-700">Termin zwrotu:</span> {formatDate(rental.plannedReturnOn)}</p>}
                        {rental.returnedOn && <p><span className="font-medium text-gray-700">Zwrócono:</span> {formatDate(rental.returnedOn)}</p>}
                        {rental.mileageOut !== null && <p><span className="font-medium text-gray-700">Przebieg przy wydaniu:</span> {rental.mileageOut}</p>}
                        {rental.mileageIn !== null && <p><span className="font-medium text-gray-700">Przebieg przy zwrocie:</span> {rental.mileageIn}</p>}
                        {rental.fuelOut && <p><span className="font-medium text-gray-700">Paliwo przy wydaniu:</span> {rental.fuelOut}</p>}
                        {rental.fuelIn && <p><span className="font-medium text-gray-700">Paliwo przy zwrocie:</span> {rental.fuelIn}</p>}
                        {rental.conditionOut && <p className="whitespace-pre-line"><span className="font-medium text-gray-700">Stan przy wydaniu:</span> {rental.conditionOut}</p>}
                        {rental.conditionIn && <p className="whitespace-pre-line"><span className="font-medium text-gray-700">Stan przy zwrocie:</span> {rental.conditionIn}</p>}
                        {rental.notes && <p className="whitespace-pre-line"><span className="font-medium text-gray-700">Uwagi:</span> {rental.notes}</p>}
                    </div>

                    {activeRental && (
                        <form action={returnReplacementVehicle} className="space-y-3 rounded-lg bg-gray-50 p-3">
                            <input type="hidden" name="workId" value={workId} />
                            <input type="hidden" name="replacementVehicleRentalId" value={rental.id} />
                            <p className="font-semibold text-gray-900">Zwrot pojazdu</p>
                            <FormInput name="returnedOn" type="datetime-local" label="Data zwrotu"></FormInput>
                            <FormInput name="mileageIn" type="number" label="Przebieg przy zwrocie"></FormInput>
                            <FormInput name="fuelIn" label="Paliwo przy zwrocie"></FormInput>
                            <FormTextArea name="conditionIn" label="Stan przy zwrocie"></FormTextArea>
                            <FormTextArea name="notes" label="Uwagi"></FormTextArea>
                            <div className="flex gap-2">
                                <PrimaryButton onClick={() => {}}>Zapisz zwrot</PrimaryButton>
                                <button
                                    formAction={cancelReplacementVehicle}
                                    className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-red-600 shadow-xs ring-1 ring-red-200 ring-inset hover:bg-red-50"
                                >
                                    Anuluj pojazd zastępczy
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}
        </section>
    );
}
