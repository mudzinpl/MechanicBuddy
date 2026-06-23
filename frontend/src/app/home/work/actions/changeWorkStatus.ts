'use server';
import { pushToast } from "@/_lib/server/pushToast";
import { httpPut } from "@/_lib/server/query-api";
import { redirect } from "next/navigation";


export async function changeWorkStatus(workId: string,status:string, comment?: string) {

    const response = await httpPut({
        url: `workstatushistory/${workId}/status/${status}`,
        body:{ comment: comment || null }
    });
    await response.text();
    pushToast('Status został zmieniony.')

    redirect(`/home/work/${workId}`);
}

export async function changeDamageStatus(workId: string, status: string, comment?: string) {
    const response = await httpPut({
        url: `workstatushistory/${workId}/damage-status/${status}`,
        body:{ comment: comment || null }
    });
    await response.text();
    pushToast('Status procesu został zmieniony.')

    redirect(`/home/work/${workId}`);
}
