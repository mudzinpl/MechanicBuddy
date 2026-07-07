import { ArrowRightIcon } from "@heroicons/react/24/outline"
import Image from "next/image"

export const redLineUrl =
    "https://motointegrator.com/pl/pl/warsztat/gdynia/6vbvmrxd-red-line-stacja-kontroli-pojazdow-i-mechanika"

const companies = [
    {
        name: "APPRA Rzeczoznawstwo",
        title: "Ekspertyzy i szkody",
        description:
            "Rzeczoznawstwo, oględziny, opinie techniczne, kosztorysy i wsparcie w procesach likwidacji szkód.",
        href: "https://appra.eu",
        image: "/assets/images/why-appra-damage-detail.png",
    },
    {
        name: "APPRA Serwis",
        title: "Obsługa szkód",
        description:
            "Obsługa szkód komunikacyjnych, organizacja napraw, pojazdy zastępcze i prowadzenie procesu od zgłoszenia do odbioru.",
        href: "https://appraserwis.pl",
        image: "/assets/images/hero-damaged-car.jpg",
    },
    {
        name: "RED LINE",
        title: "Diagnostyka i SKP",
        description:
            "Stacja kontroli pojazdów, mechanika, diagnostyka oraz zaplecze techniczne dla klientów i partnerów Grupy APPRA.",
        href: redLineUrl,
        image: "/assets/images/why-appra-damage-detail.jpg",
    },
]

export function GroupCompanies() {
    return (
        <section id="oferta" className="landing-reveal bg-[#F5F5F5] py-16 text-[#222222] lg:py-24">
            <div className="mx-auto max-w-[1240px] px-4 md:px-6 lg:px-6">
                <div>
                    <div className="mb-5 text-sm font-semibold text-[#222222]">
                        <span className="inline-block border-b-2 border-[#8C2626] pb-2">Nasze spółki</span>
                    </div>
                    <h2 className="text-[34px] font-bold leading-tight md:text-[40px]">Marki tworzące Grupę APPRA</h2>
                </div>
                <div id="spolki" className="mt-10 grid gap-9 md:grid-cols-3">
                    {companies.map((company) => (
                        <article
                            key={company.name}
                            className="group relative min-h-[250px] overflow-hidden rounded-[10px] bg-[#1F1F21] text-white shadow-[0_12px_34px_rgba(0,0,0,0.14)] transition-all duration-[250ms] hover:-translate-y-1 hover:shadow-[0_18px_46px_rgba(0,0,0,0.20)]"
                        >
                            <Image
                                src={company.image}
                                alt=""
                                fill
                                sizes="(min-width: 768px) 33vw, 100vw"
                                className="object-cover opacity-[0.72] transition-all duration-[250ms] group-hover:scale-[1.03] group-hover:opacity-[0.82]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/82 via-black/36 to-transparent" />
                            <div className="relative z-10 flex min-h-[250px] flex-col justify-end p-7">
                                <p className="text-sm font-bold uppercase tracking-[0.14em] text-white/80">{company.title}</p>
                                <h3 className="mt-3 max-w-[260px] text-[28px] font-bold leading-tight">{company.name}</h3>
                                <p className="mt-4 max-w-md text-[15px] font-medium leading-7 text-white/90">{company.description}</p>
                                <a
                                    href={company.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-6 flex size-10 shrink-0 items-center justify-center rounded-full bg-[#8C2626] text-white shadow-[0_8px_18px_rgba(0,0,0,0.20)] transition-all duration-[250ms] group-hover:-translate-y-0.5 group-hover:bg-[#A83232]"
                                    aria-label={`Przejdź do strony ${company.name}`}
                                >
                                    <ArrowRightIcon className="size-5" />
                                </a>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    )
}
