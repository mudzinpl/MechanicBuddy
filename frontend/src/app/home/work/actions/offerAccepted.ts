'use server';
import { pushToast } from "@/_lib/server/pushToast";
import {  httpPut } from "@/_lib/server/query-api";
import { redirect } from "next/navigation";


export async function offerAccepted({
    workId,
    offerNumber, 
    targetJobNumber,
    notes,
}:{
    workId: string, 
    offerNumber: number, 
    targetJobNumber:string,
    notes:string 
}) {
 
    const response = await httpPut({
        url: `work/${workId}/estimate/${offerNumber}/accepted/${targetJobNumber}`,
        body: notes
    });
    const repairJobId= await response.json();
    
    if(targetJobNumber){
        pushToast(`Oferta została zaakceptowana, a zlecenie naprawy zaktualizowane.`)
    }
    else pushToast(`Oferta została zaakceptowana i utworzono nowe zlecenie naprawy.`)
 
    redirect(`/home/work/${workId}/${repairJobId}/edit`);
} 