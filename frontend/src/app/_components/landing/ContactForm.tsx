'use client'

import { useState } from "react"

export function ContactForm() {
    const [sent, setSent] = useState(false)

    return (
        <form
            className="rounded-sm border border-white/12 bg-white/[0.06] p-6 shadow-[0_22px_70px_rgba(0,0,0,0.28)] backdrop-blur-sm sm:p-8"
            onSubmit={(event) => {
                event.preventDefault()
                setSent(true)
            }}
        >
            <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                    <span className="text-sm font-semibold text-white">Imię i nazwisko</span>
                    <input
                        name="name"
                        type="text"
                        required
                        className="mt-2 h-12 w-full rounded-sm border border-white/12 bg-white px-4 text-base text-zinc-950 outline-none transition-colors focus:border-red-500"
                    />
                </label>
                <label className="block">
                    <span className="text-sm font-semibold text-white">Telefon</span>
                    <input
                        name="phone"
                        type="tel"
                        required
                        className="mt-2 h-12 w-full rounded-sm border border-white/12 bg-white px-4 text-base text-zinc-950 outline-none transition-colors focus:border-red-500"
                    />
                </label>
                <label className="block sm:col-span-2">
                    <span className="text-sm font-semibold text-white">E-mail</span>
                    <input
                        name="email"
                        type="email"
                        className="mt-2 h-12 w-full rounded-sm border border-white/12 bg-white px-4 text-base text-zinc-950 outline-none transition-colors focus:border-red-500"
                    />
                </label>
                <label className="block sm:col-span-2">
                    <span className="text-sm font-semibold text-white">Opis szkody</span>
                    <textarea
                        name="damageDescription"
                        rows={4}
                        required
                        className="mt-2 w-full resize-y rounded-sm border border-white/12 bg-white px-4 py-3 text-base text-zinc-950 outline-none transition-colors focus:border-red-500"
                    />
                </label>
            </div>
            <button
                type="submit"
                className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-sm border border-white/25 bg-white/10 px-7 text-sm font-bold uppercase tracking-wide text-white transition-all duration-300 hover:border-white/45 hover:bg-white/15 hover:shadow-[0_0_24px_rgba(255,255,255,0.10)] sm:w-auto"
            >
                Wyślij zgłoszenie
            </button>
            {sent && (
                <p className="mt-4 rounded-sm border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-white">
                    Dziękujemy. Skontaktujemy się z Tobą najszybciej jak to możliwe.
                </p>
            )}
        </form>
    )
}

