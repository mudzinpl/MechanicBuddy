import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
    title: "Polityka cookies",
    description: "Polityka cookies APPRA Serwis: zasady używania plików cookies na stronie.",
    alternates: {
        canonical: "/polityka-cookies",
    },
}

export default function CookiePolicyPage() {
    return (
        <main className="min-h-screen bg-[#F5F5F5] px-4 py-12 text-[#222222]">
            <article className="mx-auto max-w-4xl rounded-[10px] bg-white p-6 shadow-[0_18px_45px_rgba(0,0,0,0.08)] md:p-10">
                <Link href="/" className="text-sm font-bold text-[#8C2626] underline-offset-4 hover:underline">
                    Wróć na stronę główną
                </Link>
                <h1 className="mt-8 text-4xl font-bold">Polityka cookies</h1>
                <div className="mt-8 space-y-7 text-base font-medium leading-8">
                    <section>
                        <h2 className="text-2xl font-bold">Czym są cookies</h2>
                        <p className="mt-3">
                            Cookies to niewielkie pliki zapisywane w urządzeniu użytkownika. Pomagają zapewnić prawidłowe
                            działanie strony oraz zapamiętać wybrane preferencje.
                        </p>
                    </section>
                    <section>
                        <h2 className="text-2xl font-bold">Jakich cookies używamy</h2>
                        <p className="mt-3">
                            APPRA Serwis wykorzystuje cookies niezbędne do działania strony oraz opcjonalne cookies służące do
                            poprawy jakości usług i prowadzenia anonimowych statystyk odwiedzin.
                        </p>
                    </section>
                    <section>
                        <h2 className="text-2xl font-bold">Zarządzanie zgodą</h2>
                        <p className="mt-3">
                            Przy pierwszej wizycie użytkownik może zaakceptować cookies opcjonalne, odrzucić je albo sprawdzić
                            ustawienia. Preferencja jest zapisywana lokalnie w przeglądarce.
                        </p>
                    </section>
                    <section>
                        <h2 className="text-2xl font-bold">Brak sprzedaży danych</h2>
                        <p className="mt-3">
                            Nie wykorzystujemy plików cookies do sprzedaży danych użytkowników ani do działań niezwiązanych z
                            funkcjonowaniem strony APPRA Serwis.
                        </p>
                    </section>
                    <section>
                        <h2 className="text-2xl font-bold">Kontakt</h2>
                        <p className="mt-3">
                            W sprawach dotyczących cookies i prywatności można skontaktować się pod adresem{" "}
                            <a href="mailto:serwis@appra.eu" className="font-bold text-[#8C2626] underline-offset-4 hover:underline">
                                serwis@appra.eu
                            </a>
                            .
                        </p>
                    </section>
                </div>
            </article>
        </main>
    )
}
