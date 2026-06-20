'use client'

import {   useState } from 'react'
import { Field, Label } from '@headlessui/react'
import FormInput from '@/_components/FormInput'; 
import ClientAddress from './ClientAddressInput'; 
import { useRouter } from 'next/navigation';
import ClientEmailsInput from './ClientEmailsInput';
import FormTextArea from '@/_components/FormTextArea';
import PrimaryButton from '@/_components/PrimaryButton';
import SecondaryButton from '@/_components/SecondaryButton';
import FormCheckBox from '@/_components/FormCheckbox';
import FormSwitch from '@/_components/FormSwitch';  
import { IClientData } from '../model';
import BlueBadge from '@/_components/BlueBadge';


export default function ClientInput({
    client
}: {
    client?: IClientData | undefined
}) {

    const router = useRouter()
     
    const [isCompany, setIsCompany] = useState(!client || client?.isPrivate ? false : true);

    //TODO, makes sense to make validation it more generic?
    const [companyNameRequired, setCompanyNameError] = useState("");
    const [firstNameRequired, setFirstNameError] = useState("");

    const [companyName, setCompanyName] = useState(client?.name);
    const [firstName, setFirstName] = useState(client?.firstName);
    
    function validate(event: React.MouseEvent) {

        if (isCompany && !companyName) {
            setCompanyNameError("Nazwa firmy jest wymagana");
            event.preventDefault();
        }
        if (!isCompany && !firstName) {
            setFirstNameError("Imię jest wymagane");
            event.preventDefault();
        } 
    }

    

    return (
        <>
            <div className="space-y-12">
                <div className="border-b border-gray-900/10 pb-12">
                   <Field className="flex items-center mb-4 ">
                            <FormSwitch 
                            name='isCompany' 
                            checked={isCompany}
                            onChange={(value) => {
                                setIsCompany(value);
                            }}></FormSwitch> 

                            <Label as="span" className="ml-3 text-sm">
                                <BlueBadge  text={isCompany ? 'Firma' : 'Osoba prywatna'}></BlueBadge>{' '}
                            </Label>
                        </Field>
                    <div className=" grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">

                        {isCompany ?
                            <div className="sm:col-span-3">
                                <FormInput name='name'
                                    inputError={companyNameRequired}
                                    onInputChange={(e) => setCompanyName(e.currentTarget.value)}
                                    defaultValue={companyName}
                                    label='Nazwa firmy'></FormInput>
                            </div> : <>
                                <div className="sm:col-span-3">
                                    <FormInput name='first-name'
                                      inputError={firstNameRequired}
                                      onInputChange={(e) => setFirstName(e.currentTarget.value)}
                                     defaultValue={firstName} label='Imię'></FormInput>
                                </div>
                                <div className="sm:col-span-3">
                                    <FormInput name='last-name' defaultValue={client?.lastName} label='Nazwisko'></FormInput>
                                </div>
                            </>
                        }

                        <div className="sm:col-span-3">
                            {isCompany ? <FormInput name='regNr' defaultValue={client?.regNr} label='Kod rejestrowy'></FormInput>
                                : <FormInput name='personal-code' defaultValue={client?.personalCode} label='Numer identyfikacyjny'></FormInput>}

                        </div>
                        <div className="sm:col-span-3">
                            <FormInput name='phone' defaultValue={client?.phone} label='Telefon'></FormInput>
                        </div> 
                        <ClientEmailsInput client={client}></ClientEmailsInput>
                        <ClientAddress address={client?.address} name='street-address'></ClientAddress>
                    </div>
                </div>
            </div>
            <div className="border-b border-gray-900/10 pb-12">
                <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                    <div className="col-span-full">
                        <FormCheckBox name='complicated' label='Klient problematyczny' defaultChecked={client?.isAsshole}></FormCheckBox>
                    </div>
                    <div className="col-span-full">
                        <FormTextArea name='about' label='Uwagi'  defaultValue={client?.description}>
                        </FormTextArea> 
                    </div>
                </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-x-6"> 
                <SecondaryButton  onClick={() => router.back()}>Anuluj</SecondaryButton>
                <PrimaryButton  onClick={validate}>Zapisz</PrimaryButton> 
            </div> 
        </>
    )
}