import { httpGet } from "@/_lib/server/query-api";
import { IBrandingOptions } from "./model";
import SettingsTabs from "@/_components/SettingsTabs";
import Main from "../../_components/Main";
import Link from "next/link";

function ColorSwatch({ color }: { color: string }) {
    return (
        <div className="flex items-center gap-3">
            <div
                className="w-8 h-8 rounded border border-gray-300"
                style={{ backgroundColor: color }}
            />
            <span className="text-sm text-gray-600">{color}</span>
        </div>
    );
}

export default async function Page() {
    const data = await httpGet('branding');
    const branding = await data.json() as IBrandingOptions;

    return (
        <Main header={<SettingsTabs />} narrow={true}>
            {/* Logo Section */}
            <div className="px-0">
                <h3 className="text-base/7 font-semibold text-gray-900 my-4">Logo</h3>
            </div>
            <div className="mt-6 border-t border-gray-100">
                <dl className="divide-y divide-gray-100">
                    <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                        <dt className="text-sm/6 font-medium text-gray-900">Logo firmy</dt>
                        <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                            {branding.logoBase64 ? (
                                <img
                                    src={`data:${branding.logoMimeType};base64,${branding.logoBase64}`}
                                    alt="Logo firmy"
                                    className="h-16 w-auto"
                                />
                            ) : (
                                <span className="text-gray-400">Nie przesłano logo</span>
                            )}
                        </dd>
                    </div>
                </dl>
            </div>

            {/* Portal Colors Section */}
            <div className="pt-8 px-0">
                <h3 className="text-base/7 font-semibold text-gray-900">Kolory panelu administracyjnego</h3>
                <p className="mt-1 max-w-2xl text-sm/6 text-gray-500">Kolory używane w panelu administracyjnym</p>
            </div>
            <div className="mt-6 border-t border-gray-100">
                <dl className="divide-y divide-gray-100">
                    <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                        <dt className="text-sm/6 font-medium text-gray-900">Tło paska bocznego</dt>
                        <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                            <ColorSwatch color={branding.portalColors.sidebarBg} />
                        </dd>
                    </div>
                    <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                        <dt className="text-sm/6 font-medium text-gray-900">Tekst paska bocznego</dt>
                        <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                            <ColorSwatch color={branding.portalColors.sidebarText} />
                        </dd>
                    </div>
                    <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                        <dt className="text-sm/6 font-medium text-gray-900">Tło aktywnej pozycji</dt>
                        <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                            <ColorSwatch color={branding.portalColors.sidebarActiveBg} />
                        </dd>
                    </div>
                    <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                        <dt className="text-sm/6 font-medium text-gray-900">Tekst aktywnej pozycji</dt>
                        <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                            <ColorSwatch color={branding.portalColors.sidebarActiveText} />
                        </dd>
                    </div>
                    <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                        <dt className="text-sm/6 font-medium text-gray-900">Kolor akcentu</dt>
                        <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                            <ColorSwatch color={branding.portalColors.accentColor} />
                        </dd>
                    </div>
                    <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                        <dt className="text-sm/6 font-medium text-gray-900">Tło zawartości</dt>
                        <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                            <ColorSwatch color={branding.portalColors.contentBg} />
                        </dd>
                    </div>
                </dl>
            </div>

            {/* Kolory strony publicznej Section */}
            <div className="pt-8 px-0">
                <h3 className="text-base/7 font-semibold text-gray-900">Kolory strony publicznej</h3>
                <p className="mt-1 max-w-2xl text-sm/6 text-gray-500">Kolory używane na publicznej stronie startowej</p>
            </div>
            <div className="mt-6 border-t border-gray-100">
                <dl className="divide-y divide-gray-100">
                    <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                        <dt className="text-sm/6 font-medium text-gray-900">Kolor podstawowy</dt>
                        <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                            <ColorSwatch color={branding.landingColors.primaryColor} />
                        </dd>
                    </div>
                    <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                        <dt className="text-sm/6 font-medium text-gray-900">Kolor dodatkowy</dt>
                        <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                            <ColorSwatch color={branding.landingColors.secondaryColor} />
                        </dd>
                    </div>
                    <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                        <dt className="text-sm/6 font-medium text-gray-900">Kolor akcentu</dt>
                        <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                            <ColorSwatch color={branding.landingColors.accentColor} />
                        </dd>
                    </div>
                    <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                        <dt className="text-sm/6 font-medium text-gray-900">Tło nagłówka</dt>
                        <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                            <ColorSwatch color={branding.landingColors.headerBg} />
                        </dd>
                    </div>
                    <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                        <dt className="text-sm/6 font-medium text-gray-900">Tło stopki</dt>
                        <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                            <ColorSwatch color={branding.landingColors.footerBg} />
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
