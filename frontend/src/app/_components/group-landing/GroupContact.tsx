"use client"

import { EnvelopeIcon, MapPinIcon, PhoneIcon } from "@heroicons/react/24/outline"
import { FormEvent, useState } from "react"

export function GroupContact() {
    const [isSent, setIsSent] = useState(false)

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setIsSent(true)
    }

    return (
        <section id="kontakt" className="landing-reveal bg-[#F5F5F5] px-4 py-20 text-[#222222] md:px-6 lg:px-6">
            <div className="mx-auto grid max-w-[1240px] gap-10 lg:grid-cols-[0.45fr_0.55fr] lg:items-start">
                <div>
                    <div className="mb-5 text-sm font-semibold text-[#222222]">
                        <span className="inline-block border-b-2 border-[#8C2626] pb-2">Kontakt</span>
                    </div>
                    <h2 className="text-[34px] font-bold leading-tight md:text-[40px]">
                        Porozmawiajmy o współpracy w ramach Grupy APPRA.
                    </h2>
                    <div className="mt-10 space-y-5 text-lg font-semibold text-[#444]">
                        <p className="flex gap-3"><PhoneIcon className="size-6 text-[#8C2626]" /> +48 575 889 767</p>
                        <p className="flex gap-3"><EnvelopeIcon className="size-6 text-[#8C2626]" /> kontakt@appra.eu</p>
                        <p className="flex gap-3"><MapPinIcon className="size-6 text-[#8C2626]" /> ul. Chwaszczyńska 140, Gdynia</p>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="rounded-[8px] border border-[#8C2626]/20 bg-white p-6 shadow-[0_16px_42px_rgba(0,0,0,0.10)] md:p-8">
                    <div className="grid gap-5 md:grid-cols-2">
                        <label className="block">
                            <span className="text-sm font-bold">Imię i nazwisko</span>
                            <input required className="mt-2 h-12 w-full rounded-[5px] border border-[#777777]/25 bg-[#F5F5F5] px-4 outline-none transition-colors focus:border-[#8C2626] focus:bg-white" />
                        </label>
                        <label className="block">
                            <span className="text-sm font-bold">Telefon</span>
                            <input type="tel" required className="mt-2 h-12 w-full rounded-[5px] border border-[#777777]/25 bg-[#F5F5F5] px-4 outline-none transition-colors focus:border-[#8C2626] focus:bg-white" />
                        </label>
                        <label className="block">
                            <span className="text-sm font-bold">E-mail</span>
                            <input type="email" required className="mt-2 h-12 w-full rounded-[5px] border border-[#777777]/25 bg-[#F5F5F5] px-4 outline-none transition-colors focus:border-[#8C2626] focus:bg-white" />
                        </label>
                        <label className="block">
                            <span className="text-sm font-bold">Temat</span>
                            <input required className="mt-2 h-12 w-full rounded-[5px] border border-[#777777]/25 bg-[#F5F5F5] px-4 outline-none transition-colors focus:border-[#8C2626] focus:bg-white" />
                        </label>
                        <label className="block md:col-span-2">
                            <span className="text-sm font-bold">Wiadomość</span>
                            <textarea rows={5} required className="mt-2 w-full rounded-[5px] border border-[#777777]/25 bg-[#F5F5F5] px-4 py-3 outline-none transition-colors focus:border-[#8C2626] focus:bg-white" />
                        </label>
                        <label className="flex items-start gap-3 md:col-span-2">
                            <input type="checkbox" required className="mt-1 size-4 rounded border-[#777]/40 accent-[#8C2626]" />
                            <span className="text-sm font-medium leading-6">
                                Wyrażam zgodę na przetwarzanie danych osobowych zgodnie z{" "}
                                <a href="/polityka-prywatnosci" className="font-bold text-[#8C2626] underline-offset-4 hover:underline">
                                    Polityką prywatności
                                </a>
                                .
                            </span>
                        </label>
                    </div>
                    <button type="submit" className="mt-6 inline-flex h-12 items-center rounded-[5px] bg-[#8C2626] px-8 text-sm font-bold text-white transition-all duration-[250ms] hover:-translate-y-0.5 hover:bg-[#A83232]">
                        Wyślij wiadomość
                    </button>
                    {isSent && (
                        <p className="mt-5 rounded-[5px] border border-[#8C2626]/20 bg-[#F5F5F5] px-4 py-3 text-sm font-bold">
                            Dziękujemy. Formularz został przygotowany do integracji z Grupą APPRA.
                        </p>
                    )}
                </form>
            </div>
        </section>
    )
}
