import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
    title: "Polityka prywatności",
    description: "Polityka prywatności APPRA Serwis: RODO, administrator danych, formularz kontaktowy, Google Maps i cookies.",
    alternates: {
        canonical: "/polityka-prywatnosci",
    },
}

export default function PrivacyPolicyPage() {
    return (
        <main className="min-h-screen bg-[#F5F5F5] px-4 py-12 text-[#222222]">
            <article className="mx-auto max-w-4xl rounded-[10px] bg-white p-6 shadow-[0_18px_45px_rgba(0,0,0,0.08)] md:p-10">
                <Link href="/" className="text-sm font-bold text-[#8C2626] underline-offset-4 hover:underline">
                    Wróć na stronę główną
                </Link>
                <h1 className="mt-8 text-4xl font-bold">Polityka prywatności</h1>
                <div className="mt-8 space-y-7 text-base font-medium leading-8">
                    <section>
                        <h2 className="text-2xl font-bold">Administrator danych</h2>
                        <p className="mt-3">
                            Administratorem danych osobowych jest APPRA Sp. z o.o., ul. Chwarznieńska 140, 81-601 Gdynia.
                            Kontakt w sprawach ochrony danych:{" "}
                            <a href="mailto:serwis@appra.eu" className="font-bold text-[#8C2626] underline-offset-4 hover:underline">
                                serwis@appra.eu
                            </a>
                            .
                        </p>
                    </section>
                    <section>
                        <h2 className="text-2xl font-bold">Zakres i cel przetwarzania danych</h2>
                        <p className="mt-3">
                            Dane przekazane przez formularz kontaktowy przetwarzamy w celu obsługi zgłoszenia, kontaktu z osobą
                            zgłaszającą oraz przygotowania odpowiedzi dotyczącej naprawy lub likwidacji szkody komunikacyjnej.
                        </p>
                    </section>
                    <section>
                        <h2 className="text-2xl font-bold">Podstawa prawna RODO</h2>
                        <p className="mt-3">
                            Dane przetwarzamy na podstawie zgody osoby, której dane dotyczą, oraz prawnie uzasadnionego interesu
                            administratora polegającego na obsłudze zapytań i prowadzeniu komunikacji biznesowej.
                        </p>
                    </section>
                    <section>
                        <h2 className="text-2xl font-bold">Formularz kontaktowy</h2>
                        <p className="mt-3">
                            Formularz może obejmować imię i nazwisko, numer telefonu, adres e-mail, temat oraz treść wiadomości.
                            Podanie danych jest dobrowolne, ale niezbędne do obsługi zgłoszenia.
                        </p>
                    </section>
                    <section>
                        <h2 className="text-2xl font-bold">Google Maps</h2>
                        <p className="mt-3">
                            Strona zawiera link do Google Maps umożliwiający wyznaczenie trasy do siedziby APPRA Serwis. Po
                            kliknięciu linku użytkownik przechodzi do usługi Google, która działa zgodnie z zasadami prywatności
                            Google.
                        </p>
                    </section>
                    <section>
                        <h2 className="text-2xl font-bold">Cookies</h2>
                        <p className="mt-3">
                            Strona wykorzystuje pliki cookies niezbędne do prawidłowego działania strony oraz opcjonalne cookies
                            związane z poprawą jakości usług i anonimowymi statystykami. Szczegóły znajdują się w{" "}
                            <Link href="/polityka-cookies" className="font-bold text-[#8C2626] underline-offset-4 hover:underline">
                                Polityce cookies
                            </Link>
                            .
                        </p>
                    </section>
                    <section>
                        <h2 className="text-2xl font-bold">Prawa użytkownika</h2>
                        <p className="mt-3">
                            Osobie, której dane dotyczą, przysługuje prawo dostępu do danych, sprostowania, usunięcia,
                            ograniczenia przetwarzania, przenoszenia danych, sprzeciwu oraz wycofania zgody. Przysługuje także
                            prawo wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych.
                        </p>
                    </section>
                </div>
            </article>
        </main>
    )
}
