'use server';

import { pushToast } from "@/_lib/server/pushToast";
import { httpPost, httpPut } from "@/_lib/server/query-api";
import { redirect } from "next/navigation";

function emptyToNull(value: FormDataEntryValue | null) {
    if (!value) return null;
    const text = value.toString().trim();
    return text ? text : null;
}

function numberOrNull(value: FormDataEntryValue | null) {
    const text = emptyToNull(value);
    return text === null ? null : Number(text);
}

export async function addReplacementVehicle(formData: FormData) {
    const workId = formData.get('workId')?.toString();
    const replacementVehicleId = formData.get('replacementVehicleId[value]')?.toString();

    await httpPost({
        url: `work/${workId}/replacement-vehicle`,
        body: {
            replacementVehicleId,
            issuedOn: emptyToNull(formData.get('issuedOn')),
            mileageOut: numberOrNull(formData.get('mileageOut')),
            fuelOut: emptyToNull(formData.get('fuelOut')),
            conditionOut: emptyToNull(formData.get('conditionOut')),
            notes: emptyToNull(formData.get('notes')),
        }
    });

    pushToast('Pojazd zastępczy został dodany.');
    redirect(`/home/work/${workId}`);
}

export async function returnReplacementVehicle(formData: FormData) {
    const workId = formData.get('workId')?.toString();
    const id = formData.get('replacementVehicleRentalId')?.toString();

    await httpPut({
        url: `work/${workId}/replacement-vehicle/${id}/return`,
        body: {
            returnedOn: emptyToNull(formData.get('returnedOn')),
            mileageIn: numberOrNull(formData.get('mileageIn')),
            fuelIn: emptyToNull(formData.get('fuelIn')),
            conditionIn: emptyToNull(formData.get('conditionIn')),
            notes: emptyToNull(formData.get('notes')),
        }
    });

    pushToast('Zwrot pojazdu zastępczego został zapisany.');
    redirect(`/home/work/${workId}`);
}

export async function cancelReplacementVehicle(formData: FormData) {
    const workId = formData.get('workId')?.toString();
    const id = formData.get('replacementVehicleRentalId')?.toString();

    await httpPut({
        url: `work/${workId}/replacement-vehicle/${id}/cancel`,
        body: {}
    });

    pushToast('Pojazd zastępczy został anulowany.');
    redirect(`/home/work/${workId}`);
}
