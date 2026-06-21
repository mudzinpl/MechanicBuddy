'use server'

import { httpGet } from "@/_lib/server/query-api";
import { ILandingContentOptions } from "../../branding/model";
import SettingsTabs from "@/_components/SettingsTabs";
import Main from "../../../_components/Main";
import FormInput from "@/_components/FormInput";
import FormTextArea from "@/_components/FormTextArea";
import FormSwitch from "@/_components/FormSwitch";
import FormLabel from "@/_components/FormLabel";
import { updateContact } from "../../branding/actions";
import Link from "next/link";

const DAYS = [
    { key: 'Monday', label: 'Poniedziałek' },
    { key: 'Tuesday', label: 'Wtorek' },
    { key: 'Wednesday', label: 'Środa' },
    { key: 'Thursday', label: 'Czwartek' },
    { key: 'Friday', label: 'Piątek' },
    { key: 'Saturday', label: 'Sobota' },
    { key: 'Sunday', label: 'Niedziela' },
];

function BusinessHoursRow({ fieldName, day, open, close }: { fieldName: string; day: string; open: string; close: string }) {
    return (
        <div className="grid grid-cols-4 gap-4 items-center py-2">
            <div className="text-sm font-medium text-gray-900">{day}</div>
            <div>
                <input
                    type="text"
                    name={`hours_${fieldName}_open`}
                    defaultValue={open}
                    placeholder="9:00"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-sm text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
                />
            </div>
            <div className="text-center text-sm text-gray-500">do</div>
            <div>
                <input
                    type="text"
                    name={`hours_${fieldName}_close`}
                    defaultValue={close}
                    placeholder="17:00"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-sm text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
                />
            </div>
        </div>
    );
}

export default async function Page() {
    const data = await httpGet('branding/landing-content');
    const content = await data.json() as ILandingContentOptions;
    const contact = content.contact;

    // Create a map for easy lookup
    const hoursMap = new Map(contact.businessHours.map(h => [h.day, h]));

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

            <form action={updateContact}>
                <div className="space-y-12">
                    <div className="border-b border-gray-900/10 pb-12">
                        <h2 className="text-base/7 font-semibold text-gray-900 my-4">Sekcja kontaktowa</h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Dostosuj sekcję kontaktową strony startowej.
                        </p>

                        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                            <div className="sm:col-span-3">
                                <FormInput
                                    name="sectionLabel"
                                    label="Etykieta sekcji"
                                    defaultValue={contact.sectionLabel}
                                    placeholder="np. Skontaktuj się"
                                />
                            </div>

                            <div className="sm:col-span-3">
                                <FormInput
                                    name="headline"
                                    label="Nagłówek"
                                    defaultValue={contact.headline}
                                    placeholder="np. Kontakt"
                                />
                            </div>

                            <div className="sm:col-span-6">
                                <FormTextArea
                                    name="description"
                                    label="Opis"
                                    rows={2}
                                    defaultValue={contact.description || ''}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-b border-gray-900/10 pb-12">
                        <h2 className="text-base/7 font-semibold text-gray-900">Pomoc drogowa</h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Wyświetl informację o pomocy drogowej w sekcji kontaktowej.
                        </p>

                        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                            <div className="sm:col-span-3">
                                <FormLabel name="showTowing" label="Pokaż informację o pomocy drogowej" />
                                <div className="mt-3">
                                    <FormSwitch name="showTowing" defaultChecked={contact.showTowing} />
                                </div>
                            </div>

                            <div className="sm:col-span-6">
                                <FormInput
                                    name="towingText"
                                    label="Tekst informacji o pomocy drogowej"
                                    defaultValue={contact.towingText}
                                    placeholder="np. Pomoc drogowa dostępna — zadzwoń do nas!"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-b border-gray-900/10 pb-12">
                        <h2 className="text-base/7 font-semibold text-gray-900">Godziny otwarcia</h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Ustaw godziny pracy. Dla dni wolnych wpisz „Zamknięte”.
                        </p>

                        <div className="mt-10 max-w-xl">
                            <div className="grid grid-cols-4 gap-4 pb-2 border-b border-gray-200">
                                <div className="text-xs font-medium text-gray-500 uppercase">Dzień</div>
                                <div className="text-xs font-medium text-gray-500 uppercase">Otwarcie</div>
                                <div></div>
                                <div className="text-xs font-medium text-gray-500 uppercase">Zamknięcie</div>
                            </div>
                            {DAYS.map(({ key, label }) => {
                                const hours = hoursMap.get(label) || hoursMap.get(key);
                                return (
                                    <BusinessHoursRow
                                        key={key}
                                        fieldName={key}
                                        day={label}
                                        open={hours?.open || 'Zamknięte'}
                                        close={hours?.close || 'Zamknięte'}
                                    />
                                );
                            })}
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
