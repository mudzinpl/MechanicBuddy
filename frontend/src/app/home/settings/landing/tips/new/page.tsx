'use server'

import SettingsTabs from "@/_components/SettingsTabs";
import Main from "../../../../_components/Main";
import FormInput from "@/_components/FormInput";
import FormTextArea from "@/_components/FormTextArea";
import FormSwitch from "@/_components/FormSwitch";
import FormLabel from "@/_components/FormLabel";
import { createTip } from "../../../branding/actions";
import Link from "next/link";

export default async function Page() {
    return (
        <Main header={<SettingsTabs />} narrow={true}>
            <div className="mb-6">
                <Link
                    href="/home/settings/landing/tips"
                    className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                    ← Wróć do porad
                </Link>
            </div>

            <form action={createTip}>
                <div className="space-y-12">
                    <div className="border-b border-gray-900/10 pb-12">
                        <h2 className="text-base/7 font-semibold text-gray-900 my-4">Nowa porada</h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Dodaj poradę wyświetlaną na stronie startowej.
                        </p>

                        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                            <div className="sm:col-span-4">
                                <FormInput
                                    name="title"
                                    label="Tytuł"
                                    placeholder="np. Regularna wymiana oleju"
                                />
                            </div>

                            <div className="sm:col-span-6">
                                <FormTextArea
                                    name="description"
                                    label="Opis"
                                    rows={3}
                                    placeholder="Opisz poradę..."
                                />
                            </div>

                            <div className="sm:col-span-3">
                                <FormLabel name="isActive" label="Aktywna" />
                                <div className="mt-3">
                                    <FormSwitch name="isActive" defaultChecked={true} />
                                </div>
                                <p className="mt-1 text-xs text-gray-500">
                                    Pokaż poradę na stronie startowej
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-x-6">
                    <Link
                        href="/home/settings/landing/tips"
                        className="text-sm font-semibold text-gray-900"
                    >
                        Anuluj
                    </Link>
                    <button
                        type="submit"
                        className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        Utwórz poradę
                    </button>
                </div>
            </form>
        </Main>
    );
}
