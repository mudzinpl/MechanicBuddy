import { httpGet } from "@/_lib/server/query-api";
import { IBrandingOptions } from "../model";
import SettingsTabs from "@/_components/SettingsTabs";
import Main from "../../../_components/Main";
import { updateBranding } from "../actions";
import Link from "next/link";

export default async function Page() {
    const data = await httpGet('branding');
    const branding = await data.json() as IBrandingOptions;

    return (
        <Main header={<SettingsTabs />} narrow={true}>
            <form action={updateBranding}>
                <input type="hidden" name="portalSidebarBg" value={branding.portalColors.sidebarBg} />
                <input type="hidden" name="portalSidebarText" value={branding.portalColors.sidebarText} />
                <input type="hidden" name="portalSidebarActiveBg" value={branding.portalColors.sidebarActiveBg} />
                <input type="hidden" name="portalSidebarActiveText" value={branding.portalColors.sidebarActiveText} />
                <input type="hidden" name="portalAccentColor" value={branding.portalColors.accentColor} />
                <input type="hidden" name="portalContentBg" value={branding.portalColors.contentBg} />
                <input type="hidden" name="landingPrimaryColor" value={branding.landingColors.primaryColor} />
                <input type="hidden" name="landingSecondaryColor" value={branding.landingColors.secondaryColor} />
                <input type="hidden" name="landingAccentColor" value={branding.landingColors.accentColor} />
                <input type="hidden" name="landingHeaderBg" value={branding.landingColors.headerBg} />
                <input type="hidden" name="landingFooterBg" value={branding.landingColors.footerBg} />

                <div className="space-y-12">
                    <div className="border-b border-gray-900/10 pb-12">
                        <h2 className="text-base/7 font-semibold text-gray-900 my-4">Identyfikacja wizualna warsztatu</h2>
                        <p className="mt-1 max-w-3xl text-sm text-gray-500">
                            Zarządzaj logo używanym w materiałach warsztatu i dokumentach. Kolory interfejsu APPRA nie są konfigurowane w tym miejscu.
                        </p>

                        <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
                            <div className="sm:col-span-full">
                                <label className="block text-sm/6 font-medium text-gray-900">Logo warsztatu</label>
                                <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                                    {branding.logoBase64 ? (
                                        <img
                                            src={`data:${branding.logoMimeType};base64,${branding.logoBase64}`}
                                            alt="Logo warsztatu"
                                            className="h-16 w-auto rounded border border-gray-200 bg-white p-2"
                                        />
                                    ) : (
                                        <div className="flex h-16 w-32 items-center justify-center rounded border border-dashed border-gray-300 bg-gray-50">
                                            <span className="text-xs text-gray-400">Brak logo</span>
                                        </div>
                                    )}
                                    <div>
                                        <label
                                            htmlFor="logo"
                                            className="cursor-pointer rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                        >
                                            Zmień logo
                                        </label>
                                        <input
                                            type="file"
                                            id="logo"
                                            name="logo"
                                            accept="image/*"
                                            className="sr-only"
                                        />
                                        <p className="mt-2 text-xs text-gray-500">PNG, JPG lub SVG do 2 MB</p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-md border border-gray-200 bg-gray-50 p-4 sm:col-span-full">
                                <h3 className="text-sm font-semibold text-gray-900">Pozostałe elementy marki</h3>
                                <p className="mt-1 text-sm text-gray-600">
                                    Nazwa warsztatu jest edytowana w ustawieniach firmy. Stopki, treści strony startowej i elementy publiczne są dostępne w zakładce Strona startowa.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-x-6">
                    <Link
                        href="/home/settings/branding"
                        className="text-sm font-semibold text-gray-900"
                    >
                        Anuluj
                    </Link>
                    <button
                        type="submit"
                        className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        Zapisz zmiany
                    </button>
                </div>
            </form>
        </Main>
    );
}
