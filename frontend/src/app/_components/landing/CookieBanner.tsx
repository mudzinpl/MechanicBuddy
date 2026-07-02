"use client"

import { useEffect, useState } from "react"

const storageKey = "appra-cookie-preferences"

type CookiePreference = "accepted" | "rejected"

export function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false)
    const [showSettings, setShowSettings] = useState(false)

    useEffect(() => {
        setIsVisible(!localStorage.getItem(storageKey))
    }, [])

    const savePreference = (preference: CookiePreference) => {
        localStorage.setItem(
            storageKey,
            JSON.stringify({
                preference,
                savedAt: new Date().toISOString(),
            }),
        )
        setIsVisible(false)
    }

    if (!isVisible) {
        return null
    }

    return (
        <div
            role="region"
            aria-label="Ustawienia cookies"
            className="fixed inset-x-0 bottom-0 z-[60] bg-[#1F1F21]/95 px-4 py-4 text-white shadow-[0_-18px_55px_rgba(0,0,0,0.28)] backdrop-blur-md"
        >
            <div className="mx-auto grid max-w-[1240px] gap-4 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                    <h2 className="text-base font-bold">Cookies na stronie APPRA Serwis</h2>
                    <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-white/80">
                        Wykorzystujemy pliki cookies niezbędne do prawidłowego działania strony oraz opcjonalne cookies
                        pomagające poprawiać jakość usług i anonimowe statystyki odwiedzin.
                    </p>
                    {showSettings && (
                        <div className="mt-3 rounded-[5px] border border-white/15 bg-white/5 p-3 text-sm text-white/85">
                            Opcjonalne cookies obejmują anonimowe statystyki odwiedzin. Możesz je zaakceptować albo odrzucić.
                        </div>
                    )}
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={() => savePreference("accepted")}
                        className="h-11 rounded-[5px] bg-[#8C2626] px-6 text-sm font-bold text-white transition-all duration-[250ms] hover:-translate-y-0.5 hover:bg-[#A83232] focus:outline-none focus:ring-2 focus:ring-white/80"
                    >
                        Akceptuję
                    </button>
                    <button
                        type="button"
                        onClick={() => savePreference("rejected")}
                        className="h-11 rounded-[5px] border border-white/25 px-6 text-sm font-bold text-white transition-all duration-[250ms] hover:-translate-y-0.5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/80"
                    >
                        Odrzuć opcjonalne
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowSettings((current) => !current)}
                        aria-expanded={showSettings}
                        className="h-11 rounded-[5px] border border-white/25 px-6 text-sm font-bold text-white transition-all duration-[250ms] hover:-translate-y-0.5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/80"
                    >
                        Ustawienia
                    </button>
                </div>
            </div>
        </div>
    )
}
