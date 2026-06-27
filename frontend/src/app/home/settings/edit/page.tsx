  
 'use server'
 
import SettingsTabs from '@/_components/SettingsTabs'
import Main from '../../_components/Main'
import { httpGet } from '@/_lib/server/query-api';
import { IUserOptions } from '../model';
import FormInput from '@/_components/FormInput'; 
import FormLabel from '@/_components/FormLabel';
import FormTextArea from '@/_components/FormTextArea';
import FormSwitch from '@/_components/FormSwitch';
import { createOrUpdate } from '../createOrUpdate'; 
import Link from 'next/link';

 

export default async function Page( ) {

    const data = await httpGet('options'); 
    const options = await data.json() as IUserOptions; 
   
  return (
 
      <Main  header={
        <SettingsTabs> 
        </SettingsTabs>
      } narrow={true}>
        <form action={createOrUpdate}>
      <div className="space-y-12">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base/7 font-semibold text-gray-900  my-4">Dane firmy</h2>
          

          <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
            <div className="sm:col-span-4">
                <FormInput name='name' label='Nazwa'  defaultValue={options.requisites.name}></FormInput> 
              </div>
              <div className="sm:col-span-3">
                <FormInput name='phone' label='Telefon' defaultValue={options.requisites.phone}></FormInput> 
              </div>
              <div className="sm:col-span-3">
                <FormInput name='address' label='Adres' defaultValue={options.requisites.address}></FormInput> 
              </div>
              <div className="sm:col-span-3">
                <FormInput name='email' label='Email' defaultValue={options.requisites.email}></FormInput> 
              </div>
              <div className="sm:col-span-3">
                <FormInput name='bankAccount' label='Konto bankowe' defaultValue={options.requisites.bankAccount}></FormInput> 
              </div>
              <div className="sm:col-span-3">
                <FormInput name='regNr' label='Numer rejestrowy' defaultValue={options.requisites.regNr}></FormInput> 
              </div>
              <div className="sm:col-span-3">
                <FormInput name='kmkr' label='KMKR' defaultValue={options.requisites.kmkr}></FormInput> 
              </div>
            </div> 
          </div>
         
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base/7 font-semibold text-gray-900">Ustawienia faktury</h2> 

          <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
             <div className="sm:col-span-2">
                <FormInput name='vatRate' label='Stawka VAT' defaultValue={options.pricing.invoice.vatRate}></FormInput> 
              </div>
              <div className="sm:col-span-2">
                <FormInput name='surCharge' label='Dopłata' defaultValue={options.pricing.invoice.surCharge}></FormInput> 
              </div> 
              <div className="sm:col-span-2">
                <FormLabel name="signatureLine" label="Miejsce na podpis"></FormLabel>
                 <div className='mt-3'>
                 <FormSwitch name='signatureLine' defaultChecked={options.pricing.invoice.signatureLine}></FormSwitch>
                 </div>
               
              </div>
              <div className="sm:col-span-full">
                <FormTextArea name='disclaimer' label='Zastrzeżenie' defaultValue={options.pricing.invoice.disclaimer}></FormTextArea> 
              </div>
              <div className="sm:col-span-full">
                <FormTextArea name='emailContent' rows={10} label='Treść wiadomości e-mail' defaultValue={options.pricing.invoice.emailContent}></FormTextArea> 
              </div>
          </div>
        </div>

        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base/7 font-semibold text-gray-900">Ustawienia oferty</h2> 
          <div className="mt-8 space-y-8">
          <div className="sm:col-span-full">
                <FormTextArea name='estimateEmailContent' rows={10} label='Treść wiadomości e-mail' defaultValue={options.pricing.estimate.emailContent}></FormTextArea> 
              </div> 
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6">
        <Link
          href="/home/settings"
          className="text-sm font-semibold text-gray-900"
        >
          Anuluj
        </Link>
        <button
          type="submit"
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Zapisz
        </button>
      </div>
    </form>
      </Main> 
  )

}



