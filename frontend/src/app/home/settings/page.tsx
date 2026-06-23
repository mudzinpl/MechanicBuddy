import { httpGet } from "@/_lib/server/query-api";
import { IUserOptions } from "./model";
import SettingsTabs from "@/_components/SettingsTabs";
import Main from "../_components/Main";
import Link from "next/link";
import { DescriptionItem } from "@/_components/DescriptionItem";

export default async function Page() {

    const data = await httpGet('options');
    const options = await data.json() as IUserOptions;
 
    return (

        <Main header={
            <SettingsTabs>
            </SettingsTabs>
        } narrow={true}>
              
            <div className="  px-0">
                <h3 className="text-base/7 font-semibold text-gray-900  my-4">Dane firmy</h3> 
            </div>
            <div className="mt-6 border-t border-gray-100">
                <dl className="divide-y divide-gray-100">
                    <DescriptionItem label='Nazwa' value={options.requisites.name}></DescriptionItem>
                    <DescriptionItem label='Telefon' value={options.requisites.phone}></DescriptionItem>
                    <DescriptionItem label='Adres' value={options.requisites.address}></DescriptionItem>
                    <DescriptionItem label='Email' value={options.requisites.email}></DescriptionItem>
                    <DescriptionItem label='Konto bankowe' value={options.requisites.bankAccount}></DescriptionItem>
                    <DescriptionItem label='Numer rejestrowy' value={options.requisites.regNr}></DescriptionItem>
                    <DescriptionItem label='NIP' value={options.requisites.kmkr}></DescriptionItem>
                </dl>
            </div>
            <div className=" pt-8   px-0">
                <h3 className="text-base/7 font-semibold text-gray-900">Ustawienia faktury</h3> 
            </div>
            <div className="mt-6 border-t border-gray-100">
                <dl className="divide-y divide-gray-100">
                    <DescriptionItem label='Stawka VAT' value={options.pricing.invoice.vatRate}></DescriptionItem>
                    <DescriptionItem label='Dopłata' value={options.pricing.invoice.surCharge}></DescriptionItem>
                    <DescriptionItem label='Zastrzeżenie' className="whitespace-pre-line" value={options.pricing.invoice.disclaimer}></DescriptionItem>
                    <DescriptionItem label='Miejsce na podpis' value={(options.pricing.invoice.signatureLine?'Tak':'Nie')}></DescriptionItem>
                    <DescriptionItem label='Treść wiadomości e-mail'  className="whitespace-pre-line" value={options.pricing.invoice.emailContent}></DescriptionItem> 
                </dl>
            </div>
            <div className=" pt-8   px-0">
                <h3 className="text-base/7 font-semibold text-gray-900">Ustawienia oferty</h3>
                <p className="mt-1 max-w-2xl text-sm/6 text-gray-500">Ustawienia oferty</p>
            </div>
            <div className="mt-6 border-t border-gray-100">
                <dl className="divide-y divide-gray-100"> 
                    <DescriptionItem label='Treść wiadomości e-mail' className="whitespace-pre-line" value={options.pricing.estimate.emailContent}></DescriptionItem> 
                </dl>
            </div>
            <div className="pt-8 px-0">
                <h3 className="text-base/7 font-semibold text-gray-900">Integracje</h3>
                <p className="mt-1 max-w-2xl text-sm/6 text-gray-500">Konfiguracja przyszłych połączeń z Fakturownią, pocztą e-mail, Audanet / Audatex, dostawcami części i bankiem.</p>
                <div className="mt-4">
                    <Link href="/home/settings/integrations" className="text-sm/6 font-semibold text-indigo-600 hover:text-indigo-500">
                        Przejdź do integracji
                    </Link>
                </div>
            </div>
             <div className="mt-6 flex items-center justify-end gap-x-6">
                <Link href={`/home/settings/edit`}
                    type="button"
                    className="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                    Edytuj
                </Link>
            </div>
        </Main>
    )

}
