'use server'

import { httpGet } from "@/_lib/server/query-api";
import { ILandingContentOptions } from "../../branding/model";
import SettingsTabs from "@/_components/SettingsTabs";
import Main from "../../../_components/Main";
import FormInput from "@/_components/FormInput";
import FormTextArea from "@/_components/FormTextArea";
import { updateHero } from "../../branding/actions";
import Link from "next/link";

export default async function Page() {
    const data = await httpGet('branding/landing-content');
    const content = await data.json() as ILandingContentOptions;
    const hero = content.hero;

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

            <form action={updateHero}>
                <div className="space-y-12">
                    <div className="border-b border-gray-900/10 pb-12">
                        <h2 className="text-base/7 font-semibold text-gray-900 my-4">Sekcja główna</h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Dostosuj główny baner strony startowej.
                        </p>

                        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                            <div className="sm:col-span-4">
                                <FormInput
                                    name="companyName"
                                    label="Nazwa firmy"
                                    defaultValue={hero.companyName}
                                />
                            </div>

                            <div className="sm:col-span-6">
                                <FormInput
                                    name="tagline"
                                    label="Hasło"
                                    placeholder="np. Twój zaufany serwis samochodowy"
                                    defaultValue={hero.tagline || ''}
                                />
                            </div>

                            <div className="sm:col-span-6">
                                <FormTextArea
                                    name="subtitle"
                                    label="Podtytuł"
                                    rows={2}
                                    defaultValue={hero.subtitle || ''}
                                />
                            </div>

                            <div className="sm:col-span-4">
                                <FormInput
                                    name="specialtyText"
                                    label="Tekst specjalizacji"
                                    placeholder="np. Specjalizujemy się w pojazdach europejskich"
                                    defaultValue={hero.specialtyText || ''}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-b border-gray-900/10 pb-12">
                        <h2 className="text-base/7 font-semibold text-gray-900">Przyciski działania</h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Skonfiguruj przyciski wyświetlane w sekcji głównej.
                        </p>

                        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                            <div className="sm:col-span-3">
                                <FormInput
                                    name="ctaPrimaryText"
                                    label="Tekst przycisku głównego"
                                    defaultValue={hero.ctaPrimaryText}
                                />
                            </div>
                            <div className="sm:col-span-3">
                                <FormInput
                                    name="ctaPrimaryLink"
                                    label="Link przycisku głównego"
                                    placeholder="#services"
                                    defaultValue={hero.ctaPrimaryLink}
                                />
                            </div>

                            <div className="sm:col-span-3">
                                <FormInput
                                    name="ctaSecondaryText"
                                    label="Tekst przycisku dodatkowego"
                                    defaultValue={hero.ctaSecondaryText}
                                />
                            </div>
                            <div className="sm:col-span-3">
                                <FormInput
                                    name="ctaSecondaryLink"
                                    label="Link przycisku dodatkowego"
                                    placeholder="#contact"
                                    defaultValue={hero.ctaSecondaryLink}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-b border-gray-900/10 pb-12">
                        <h2 className="text-base/7 font-semibold text-gray-900">Obraz tła</h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Prześlij obraz tła sekcji głównej.
                        </p>

                        <div className="mt-6">
                            <div className="flex items-center gap-6">
                                {hero.backgroundImageBase64 ? (
                                    <img
                                        src={`data:${hero.backgroundImageMimeType};base64,${hero.backgroundImageBase64}`}
                                        alt="Aktualne tło"
                                        className="h-24 w-auto rounded border border-gray-200"
                                    />
                                ) : (
                                    <div className="flex h-24 w-40 items-center justify-center rounded border border-dashed border-gray-300 bg-gray-50">
                                        <span className="text-xs text-gray-400">Brak obrazu</span>
                                    </div>
                                )}
                                <div>
                                    <label
                                        htmlFor="backgroundImage"
                                        className="cursor-pointer rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                    >
                                        Zmień obraz
                                    </label>
                                    <input
                                        type="file"
                                        id="backgroundImage"
                                        name="backgroundImage"
                                        accept="image/*"
                                        className="sr-only"
                                    />
                                    <p className="mt-2 text-xs text-gray-500">PNG lub JPG. Zalecany rozmiar: 1920 × 1080</p>
                                </div>
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
