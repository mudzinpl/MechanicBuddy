import { AppraLogo } from "../landing/AppraLogo"
import { redLineUrl } from "./GroupCompanies"

export function GroupFooter() {
    return (
        <footer className="bg-[#8C2626] px-4 py-10 text-white md:px-6 lg:px-6">
            <div className="mx-auto grid max-w-[1240px] gap-10 md:grid-cols-[0.8fr_2.2fr]">
                <div>
                    <AppraLogo className="[&>img]:max-h-[72px] [&>img]:max-w-[250px]" />
                    <div className="mt-5 h-px w-40 bg-white/35" />
                </div>
                <div className="grid gap-6 sm:grid-cols-3">
                    <div>
                        <h3 className="font-bold">Spółki</h3>
                        <ul className="mt-4 space-y-2 text-sm text-white/75">
                            <li><a href="https://appra.eu" className="hover:text-white">APPRA Rzeczoznawstwo</a></li>
                            <li><a href="https://appraserwis.pl" className="hover:text-white">APPRA Serwis</a></li>
                            <li><a href={redLineUrl} className="hover:text-white">RED LINE</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold">Informacje</h3>
                        <ul className="mt-4 space-y-2 text-sm text-white/75">
                            <li><a href="/polityka-prywatnosci" className="hover:text-white">Polityka prywatności</a></li>
                            <li><a href="/polityka-cookies" className="hover:text-white">Polityka cookies</a></li>
                            <li><a href="#kontakt" className="hover:text-white">Kontakt</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold">GRUPA APPRA</h3>
                        <p className="mt-4 text-sm leading-6 text-white/75">
                            Wyspecjalizowane firmy motoryzacyjne działające według jednego standardu jakości.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    )
}
