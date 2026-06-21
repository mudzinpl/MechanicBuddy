'use server'

import SettingsTabs from "@/_components/SettingsTabs";
import Main from "../../../../_components/Main";
import Link from "next/link";
import { createSocialLink } from "../../../branding/actions";
import FormSwitch from "@/_components/FormSwitch";
import PlatformSelect from "../_components/PlatformSelect";

export default async function Page() {
    return (
        <Main header={<SettingsTabs />} narrow={true}>
            <div className="mb-6">
                <Link
                    href="/home/settings/landing/social"
                    className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                    &larr; Wróć do linków społecznościowych
                </Link>
            </div>

            <div className="mb-6">
                <h2 className="text-base/7 font-semibold text-gray-900">Dodaj link społecznościowy</h2>
                <p className="mt-1 text-sm text-gray-500">
                    Dodaj link do mediów społecznościowych lub strony zewnętrznej.
                </p>
            </div>

            <form action={createSocialLink} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <div className="space-y-6">
                    <div>
                        <label htmlFor="platform" className="block text-sm font-medium text-gray-700">
                            Platform *
                        </label>
                        <PlatformSelect defaultValue="facebook" />
                    </div>

                    <div>
                        <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                            URL *
                        </label>
                        <input
                            type="url"
                            id="url"
                            name="url"
                            required
                            placeholder="https://facebook.com/twoja-strona"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>

                    <div>
                        <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                            Nazwa wyświetlana (dla własnych linków)
                        </label>
                        <input
                            type="text"
                            id="displayName"
                            name="displayName"
                            placeholder="Moja strona"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Używane tylko dla własnych linków. Pozostaw puste dla standardowych platform.
                        </p>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <label className="text-sm font-medium text-gray-700">Aktywny</label>
                            <p className="text-sm text-gray-500">Pokaż link na stronie startowej</p>
                        </div>
                        <FormSwitch name="isActive" defaultChecked={true} />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <label className="text-sm font-medium text-gray-700">Pokaż w nagłówku</label>
                            <p className="text-sm text-gray-500">Wyświetl link w nagłówku strony</p>
                        </div>
                        <FormSwitch name="showInHeader" defaultChecked={true} />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <label className="text-sm font-medium text-gray-700">Pokaż w stopce</label>
                            <p className="text-sm text-gray-500">Wyświetl link w stopce strony</p>
                        </div>
                        <FormSwitch name="showInFooter" defaultChecked={true} />
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <Link
                        href="/home/settings/landing/social"
                        className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                        Anuluj
                    </Link>
                    <button
                        type="submit"
                        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        Dodaj link
                    </button>
                </div>
            </form>
        </Main>
    );
}
