import FormInput from "@/_components/FormInput";
import FormLabel from "@/_components/FormLabel"; 
import { ClientsCombobox, VehiclesCombobox } from "../../_components/SearchCombobox";

export default function SearchParams({
    options
}:{
    options: any // eslint-disable-line @typescript-eslint/no-explicit-any
}){
    return (
        <div className="grid sm:grid-flow-col gap-2">
        
            {options.issued === 'on' && <>
                <div className="col-span-1  ">
                        <FormInput name="invoiceFrom" label="Faktury od" defaultValue={options.invoiceFrom} type="date" ></FormInput>
                      </div>

                      <div className="col-span-1 ">
                        <FormInput name="invoiceTo" label="Faktury do" defaultValue={options.invoiceTo} type="date" ></FormInput>
                      </div>
                  </>  }
                  <div className="col-span-1  ">
                    <FormInput name="workFrom" label="Zlecenia od" defaultValue={options.workFrom} type="date" ></FormInput>
                  </div>

                  <div className="col-span-1  ">
                    <FormInput name="workTo" label="Zlecenia do" defaultValue={options.workTo} type="date" ></FormInput>
                  </div>

                  <div className="col-span-1  ">
                    <FormLabel name='clientiId' label='Klient'></FormLabel>
                    <ClientsCombobox
                      name='clientiId'
                      defaultValue={{
                        text: options['clientiId[text]'], 
                        value: options['clientiId[value]'],
                      }}>
                    </ClientsCombobox>
                  </div>
                  <div className="col-span-1 ">
                    <FormLabel name='vehicleId' label='Pojazd'></FormLabel>
                    <VehiclesCombobox name='vehicleId'
                      defaultValue={{
                        text: options['vehicleId[text]'],
                        value: options['vehicleId[value]'],
                      }}>
                    </VehiclesCombobox>
                  </div>  
        </div>
    )
}