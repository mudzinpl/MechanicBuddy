import FormInput from "@/_components/FormInput";
import FormLabel from "@/_components/FormLabel";
import FormSwitch from "@/_components/FormSwitch";
import FormTextArea from "@/_components/FormTextArea";
import SettingsTabs from "@/_components/SettingsTabs";
import { httpGet } from "@/_lib/server/query-api";
import Main from "../../../_components/Main";
import Link from "next/link";
import { saveIntegrationConfiguration } from "../actions";
import { IIntegrationConfiguration, integrationStatusLabels } from "../model";

export default async function Page({ params }: { params: Promise<{ integrationType: string }> }) {
    const { integrationType } = await params;
    const data = await httpGet(`integrations/${integrationType}`);
    const integration = await data.json() as IIntegrationConfiguration;

    return (
        <Main header={<SettingsTabs></SettingsTabs>} narrow={true}>
            <form action={saveIntegrationConfiguration}>
                <input type="hidden" name="integrationType" value={integration.integrationType} />

                <div className="space-y-10">
                    <div className="border-b border-gray-900/10 pb-10">
                        <h2 className="text-base/7 font-semibold text-gray-900 my-4">{integration.displayName}</h2>
                        <p className="mt-1 max-w-3xl text-sm/6 text-gray-500">
                            Konfiguracja jest przygotowaniem pod przyszłą integrację. Test połączenia i realna synchronizacja nie są jeszcze zaimplementowane.
                        </p>

                        <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                            <div className="sm:col-span-3">
                                <FormInput name="displayName" label="Nazwa integracji" defaultValue={integration.displayName} />
                            </div>
                            <div className="sm:col-span-3">
                                <FormLabel name="status" label="Status" />
                                <select
                                    id="status"
                                    name="status"
                                    defaultValue={integration.status}
                                    className="mt-2 block w-full rounded-md bg-white px-3 py-1.5 text-sm/6 text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
                                >
                                    {Object.entries(integrationStatusLabels).map(([value, label]) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="sm:col-span-full">
                                <FormTextArea name="description" label="Opis" defaultValue={integration.description} />
                            </div>
                            <div className="sm:col-span-3">
                                <FormInput name="baseUrl" label="Base URL" defaultValue={integration.baseUrl ?? ''} placeholder="https://api.example.com" />
                            </div>
                            <div className="sm:col-span-3">
                                <FormInput name="loginEmail" label="Login / e-mail" defaultValue={integration.loginEmail ?? ''} />
                            </div>
                            <div className="sm:col-span-3">
                                <FormInput name="secretPlaceholder" type="password" label="API key / token" defaultValue={integration.secretPlaceholder ?? ''} placeholder="Wpisz token, aby zapisać maskę" />
                                <p className="mt-2 text-xs/5 text-gray-500">Pełny sekret nie jest wyświetlany. Na tym etapie system zapisuje tylko bezpieczny placeholder.</p>
                            </div>
                            <div className="sm:col-span-3">
                                <FormLabel name="enabled" label="Aktywna" />
                                <div className="mt-3">
                                    <FormSwitch name="enabled" defaultChecked={integration.enabled} />
                                </div>
                            </div>
                            <div className="sm:col-span-full">
                                <FormTextArea name="notes" label="Uwagi" defaultValue={integration.notes ?? ''} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-x-4">
                    <Link href="/home/settings/integrations" className="text-sm/6 font-semibold text-gray-900">
                        Anuluj
                    </Link>
                    <button type="submit" className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500">
                        Zapisz
                    </button>
                </div>
            </form>
        </Main>
    );
}
