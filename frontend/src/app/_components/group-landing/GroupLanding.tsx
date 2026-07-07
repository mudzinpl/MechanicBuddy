import { CookieBanner } from "../landing/CookieBanner"
import { GroupCompanies } from "./GroupCompanies"
import { GroupContact } from "./GroupContact"
import { GroupFooter } from "./GroupFooter"
import { GroupHero } from "./GroupHero"
import { GroupPartners } from "./GroupPartners"
import { GroupProcess } from "./GroupProcess"
import { GroupWhyUs } from "./GroupWhyUs"

export function GroupLanding() {
    return (
        <div className="bg-[#1F1F21]">
            <div className="landing-page mx-auto w-full max-w-[1440px] overflow-hidden bg-[#1F1F21] text-[#222222] shadow-[0_0_80px_rgba(0,0,0,0.35)]">
                <GroupHero />
                <main>
                    <section id="o-grupie" className="landing-reveal relative overflow-hidden bg-[#F5F5F5] text-[#222222]">
                        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(245,245,245,0.96),rgba(245,245,245,0.84))]" />
                        <div className="relative z-10 mx-auto grid max-w-[1240px] gap-12 px-4 py-20 md:px-6 lg:grid-cols-[0.8fr_0.9fr_0.8fr] lg:items-center lg:px-6 lg:py-28">
                            <div>
                                <div className="mb-5 text-sm font-semibold text-[#222222]">
                                    <span className="inline-block border-b-2 border-[#8C2626] pb-2">O grupie</span>
                                </div>
                                <h2 className="max-w-sm text-[36px] font-bold leading-tight lg:text-[42px]">
                                    O Grupie<br />APPRA
                                </h2>
                            </div>
                            <div className="max-w-[650px] space-y-6 text-[17px] font-medium leading-7 text-[#444]">
                                <p>
                                    Grupa APPRA łączy wyspecjalizowane marki motoryzacyjne, które działają niezależnie w swoich
                                    obszarach, ale współpracują w ramach jednego standardu obsługi, jakości i odpowiedzialności.
                                </p>
                                <p>
                                    Każda marka zachowuje własną specjalizację, a wspólnie tworzą uporządkowany ekosystem dla
                                    klientów indywidualnych, firm, flot i partnerów biznesowych.
                                </p>
                            </div>
                            <div className="rounded-[10px] bg-[#8C2626] p-8 shadow-[0_16px_42px_rgba(0,0,0,0.22)] transition-all duration-[250ms] hover:-translate-y-1 hover:shadow-[0_22px_55px_rgba(0,0,0,0.28)]">
                                <h3 className="text-2xl font-bold">Jedna organizacja.</h3>
                                <div className="mt-4 h-px w-24 bg-white/35" />
                                <p className="mt-6 text-[20px] font-bold leading-8 text-white">
                                    Trzy wyspecjalizowane spółki.
                                </p>
                            </div>
                        </div>
                    </section>
                    <section className="landing-reveal bg-[#1F1F21] px-4 py-8 text-center text-white">
                        <p className="mx-auto max-w-4xl text-[24px] font-bold leading-tight md:text-[30px]">
                            Grupa APPRA to doświadczenie, specjalizacja i kompleksowa obsługa,<br className="hidden md:block" /> na której możesz polegać.
                        </p>
                    </section>
                    <GroupCompanies />
                    <GroupProcess />
                    <GroupWhyUs />
                    <GroupPartners />
                    <GroupContact />
                </main>
                <GroupFooter />
                <CookieBanner />
            </div>
            <style>{`
                :root {
                    --appra-primary: #8C2626;
                    --appra-dark: #1F1F21;
                    --appra-gray: #777777;
                    --appra-white: #FFFFFF;
                    --appra-light: #F5F5F5;
                    --appra-black: #222222;
                    --appra-radius: 5px;
                    --appra-radius-pill: 100px;
                }

                .landing-page .landing-hero-image {
                    animation: landingHeroDrift 14s ease-out both;
                    transform-origin: 70% 50%;
                    will-change: transform;
                }

                .landing-page .landing-reveal {
                    opacity: 0;
                    transform: translateY(20px);
                    animation: landingReveal 800ms ease-out both;
                    animation-timeline: view();
                    animation-range: entry 0% cover 28%;
                }

                @keyframes landingHeroDrift {
                    from { transform: translate3d(0, 0, 0); }
                    to { transform: translate3d(-1%, 0, 0); }
                }

                @keyframes landingReveal {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @supports not (animation-timeline: view()) {
                    .landing-page .landing-reveal {
                        opacity: 1;
                        transform: none;
                        animation: none;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .landing-page .landing-hero-image,
                    .landing-page .landing-reveal {
                        opacity: 1;
                        transform: none;
                        animation: none;
                    }
                }
            `}</style>
        </div>
    )
}
