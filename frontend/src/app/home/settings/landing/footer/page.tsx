'use server'

import { httpGet } from "@/_lib/server/query-api";
import { ILandingContentOptions } from "../../branding/model";
import SettingsTabs from "@/_components/SettingsTabs";
import Main from "../../../_components/Main";
import FormInput from "@/_components/FormInput";
import FormTextArea from "@/_components/FormTextArea";
import FormSwitch from "@/_components/FormSwitch";
import FormLabel from "@/_components/FormLabel";
import { updateFooter } from "../../branding/actions";
import Link from "next/link";

export default async function Page() {
    const data = await httpGet('branding/landing-content');
    const content = await data.json() as ILandingContentOptions;
    const footer = content.footer;

    return (
        <Main header={<SettingsTabs />} narrow={true}>
            <div className="mb-6">
                <Link
                    href="/home/settings/landing"
                    className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                    ← Wróć do ustawień strony publicznej
                </Link>
            </div>

            <form action={updateFooter}>
                <div className="space-y-12">
                    <div className="border-b border-gray-900/10 pb-12">
                        <h2 className="text-base/7 font-semibold text-gray-900 my-4">Ustawienia stopki</h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Dostosuj stopkę strony startowej.
                        </p>

                        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                            <div className="sm:col-span-6">
                                <FormTextArea
                                    name="companyDescription"
                                    label="Opis firmy"
                                    rows={3}
                                    defaultValue={footer.companyDescription || ''}
                                    placeholder="Krótki opis firmy wyświetlany w stopce..."
                                />
                            </div>

                            <div className="sm:col-span-6">
                                <FormInput
                                    name="copyrightText"
                                    label="Treść praw autorskich"
                                    defaultValue={footer.copyrightText || ''}
                                    placeholder="np. © 2024 Twoja firma. Wszelkie prawa zastrzeżone."
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Pozostaw puste, aby użyć domyślnej treści
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="border-b border-gray-900/10 pb-12">
                        <h2 className="text-base/7 font-semibold text-gray-900">Sekcje stopki</h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Wybierz sekcje wyświetlane w stopce.
                        </p>

                        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                            <div className="sm:col-span-3">
                                <FormLabel name="showQuickLinks" label="Pokaż szybkie linki" />
                                <div className="mt-3">
                                    <FormSwitch name="showQuickLinks" defaultChecked={footer.showQuickLinks} />
                                </div>
                                <p className="mt-1 text-xs text-gray-500">
                                    Wyświetl linki nawigacyjne (Usługi, O nas, Kontakt)
                                </p>
                            </div>

                            <div className="sm:col-span-3">
                                <FormLabel name="showContactInfo" label="Pokaż dane kontaktowe" />
                                <div className="mt-3">
                                    <FormSwitch name="showContactInfo" defaultChecked={footer.showContactInfo} />
                                </div>
                                <p className="mt-1 text-xs text-gray-500">
                                    Wyświetl dane kontaktowe z ustawień firmy
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-x-6">
                    <Link
                        href="/home/settings/landing"
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
