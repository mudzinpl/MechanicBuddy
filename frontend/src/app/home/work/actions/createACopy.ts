'use server';
import { pushToast } from "@/_lib/server/pushToast";
import { httpPost } from "@/_lib/server/query-api";
import { redirect } from "next/navigation";


export async function createACopy(workId: string) {

    const response = await httpPost({
        url: `work/${workId}/makecopy`,
        body: {}
    });
    const newWorkId = await response.json();
    pushToast('Utworzono kopię zlecenia.')
    redirect(`/home/work/${newWorkId}`);
}




