import { httpGet } from "@/_lib/server/query-api";
import { IBrandingOptions } from "./model";
import SettingsTabs from "@/_components/SettingsTabs";
import Main from "../../_components/Main";
import Link from "next/link";

export default async function Page() {
    const data = await httpGet('branding');
    const branding = await data.json() as IBrandingOptions;

    return (
        <Main header={<SettingsTabs />} narrow={true}>
            <div className="px-0">
                <h3 className="text-base/7 font-semibold text-gray-900 my-4">Identyfikacja wizualna</h3>
                <p className="mt-1 max-w-3xl text-sm/6 text-gray-500">
                    Konfiguracja marki warsztatu używanej w dokumentach, stronie startowej i materiałach dla klienta. Kolory interfejsu APPRA pozostają stałe.
                </p>
            </div>

            <div className="mt-6 border-t border-gray-100">
                <dl className="divide-y divide-gray-100">
                    <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                        <dt className="text-sm/6 font-medium text-gray-900">Logo warsztatu</dt>
                        <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                            {branding.logoBase64 ? (
                                <img
                                    src={`data:${branding.logoMimeType};base64,${branding.logoBase64}`}
                                    alt="Logo warsztatu"
                                    className="h-16 w-auto rounded border border-gray-200 bg-white p-2"
                                />
                            ) : (
                                <span className="text-gray-400">Nie przesłano logo</span>
                            )}
                        </dd>
                    </div>
                    <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                        <dt className="text-sm/6 font-medium text-gray-900">Favicon</dt>
                        <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                            Przygotowane miejsce na ikonę strony warsztatu.
                        </dd>
                    </div>
                    <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                        <dt className="text-sm/6 font-medium text-gray-900">Nazwa warsztatu</dt>
                        <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                            Zarządzana w ustawieniach firmy.
                        </dd>
                    </div>
                    <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                        <dt className="text-sm/6 font-medium text-gray-900">Stopki i strona startowa</dt>
                        <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                            Treści publicznej strony i stopki są dostępne w zakładce Strona startowa.
                        </dd>
                    </div>
                    <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                        <dt className="text-sm/6 font-medium text-gray-900">Branding dokumentów</dt>
                        <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                            Logo i dane firmy są wykorzystywane jako podstawa identyfikacji dokumentów warsztatowych.
                        </dd>
                    </div>
                </dl>
            </div>

            <div className="mt-6 flex items-center justify-end gap-x-6">
                <Link
                    href="/home/settings/branding/edit"
                    className="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                    Edytuj
                </Link>
            </div>
        </Main>
    );
}
