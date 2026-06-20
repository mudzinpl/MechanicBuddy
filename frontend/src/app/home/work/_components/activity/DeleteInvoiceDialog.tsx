'use client'

import BaseDialog, { BaseDialogHandle } from "@/_components/BaseDialog"; 
import {   IWorkData  } from "../../model";  
import { deleteInvoice } from "../../actions/deleteInvoice";

export default function DeleteInvoiceDialog({
    work, 
    dialogRef
}:{
    work: IWorkData, 
    dialogRef: React.RefObject<BaseDialogHandle | null>, 
}){ 
     
    return (
        <BaseDialog ref={dialogRef}
                title="Usuń fakturę"
                description="Czy na pewno chcesz to zrobić? Usunąć można wyłącznie ostatnio utworzoną fakturę."
                center={false}
                yesButtonText="OK" noButtonText="Anuluj"
                onConfirm={async () => {

                    const result =  deleteInvoice(work.id) 
                     result.finally(()=>{
                        dialogRef.current?.close();
                     }) 
                     await result; 
                }}> 
                    <div className="space-y-12"> 
                    </div> 
            </BaseDialog>
    )
}