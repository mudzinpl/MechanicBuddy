import SettingsTabs from "@/_components/SettingsTabs";
import Main from "../../_components/Main";
import { httpGet } from "@/_lib/server/query-api";
import Link from "next/link";
import clsx from "clsx";
import { IIntegrationConfiguration, formatIntegrationDate, getIntegrationStatusClass, getIntegrationStatusLabel } from "./model";
import { testIntegrationConnection } from "./actions";

export default async function Page() {
    const data = await httpGet('integrations');
    const integrations = await data.json() as IIntegrationConfiguration[];

    return (
        <Main header={<SettingsTabs></SettingsTabs>} narrow={true}>
            <div className="px-0">
                <h2 className="text-base/7 font-semibold text-gray-900 my-4">Integracje</h2>
                <p className="mt-1 max-w-3xl text-sm/6 text-gray-500">
                    Przygotowanie konfiguracji pod przyszłe połączenia z systemami zewnętrznymi. Realne połączenia API nie są jeszcze aktywne.
                </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
                {integrations.map((integration) => (
                    <div key={integration.integrationType} className="rounded-md border border-gray-200 bg-white p-5 shadow-xs">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <h3 className="text-sm/6 font-semibold text-gray-900">{integration.displayName}</h3>
                                <p className="mt-1 text-sm/6 text-gray-500">{integration.description}</p>
                            </div>
                            <span className={clsx('inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset', getIntegrationStatusClass(integration.status))}>
                                {getIntegrationStatusLabel(integration.status)}
                            </span>
                        </div>

                        <dl className="mt-5 grid grid-cols-1 gap-3 text-sm/6 sm:grid-cols-2">
                            <div>
                                <dt className="font-medium text-gray-900">Ostatnia synchronizacja</dt>
                                <dd className="text-gray-600">{formatIntegrationDate(integration.lastSyncAt)}</dd>
                            </div>
                            <div>
                                <dt className="font-medium text-gray-900">Aktywna</dt>
                                <dd className="text-gray-600">{integration.enabled ? 'Tak' : 'Nie'}</dd>
                            </div>
                            <div>
                                <dt className="font-medium text-gray-900">Adres bazowy</dt>
                                <dd className="break-all text-gray-600">{integration.baseUrl || 'Nie podano'}</dd>
                            </div>
                            <div>
                                <dt className="font-medium text-gray-900">Login / e-mail</dt>
                                <dd className="break-all text-gray-600">{integration.loginEmail || 'Nie podano'}</dd>
                            </div>
                        </dl>

                        <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
                            <form action={testIntegrationConnection}>
                                <input type="hidden" name="integrationType" value={integration.integrationType} />
                                <button type="submit" className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50">
                                    Test połączenia
                                </button>
                            </form>
                            <Link href={`/home/settings/integrations/${integration.integrationType}`} className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500">
                                Konfiguruj
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </Main>
    );
}
