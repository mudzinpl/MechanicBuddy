import { ArrowRightIcon } from "@heroicons/react/24/outline"

const processSteps = [
    "Klient lub partner trafia do właściwej marki",
    "Zakres sprawy jest kierowany do odpowiedniego zespołu",
    "Marki współpracują, gdy sprawa wymaga kilku kompetencji",
    "Klient otrzymuje jedną spójną obsługę",
    "Każda marka zachowuje swoją specjalizację i odpowiedzialność",
]

export function GroupProcess() {
    return (
        <section id="jak-pracujemy" className="landing-reveal bg-[#1F1F21] px-4 py-20 text-white md:px-6 lg:px-6 lg:py-24">
            <div className="mx-auto max-w-[1240px]">
                <div className="mb-5 text-sm font-semibold text-white">
                    <span className="inline-block border-b-2 border-[#8C2626] pb-2">Jak współpracują marki</span>
                </div>
                <h2 className="max-w-3xl text-[34px] font-bold leading-tight md:text-[40px]">
                    Wspólny standard obsługi bez odbierania markom ich specjalizacji.
                </h2>
                <div className="mt-12 grid gap-5 lg:grid-cols-5 lg:items-center">
                    {processSteps.map((step, index) => (
                        <div key={step} className="relative">
                            <div className="rounded-[10px] border border-white/10 bg-white/[0.04] p-6 text-center shadow-[0_16px_42px_rgba(0,0,0,0.16)] transition-all duration-[250ms] hover:-translate-y-1 hover:border-[#8C2626]/45">
                                <div className="mx-auto flex size-14 items-center justify-center rounded-full border border-[#8C2626]/55 bg-[#8C2626] text-lg font-bold">
                                    {String(index + 1).padStart(2, "0")}
                                </div>
                                <p className="mt-5 min-h-24 text-[15px] font-bold leading-6">{step}</p>
                            </div>
                            {index < processSteps.length - 1 && (
                                <ArrowRightIcon className="mx-auto mt-5 size-7 rotate-90 text-[#8C2626] lg:absolute lg:-right-7 lg:top-1/2 lg:mt-0 lg:-translate-y-1/2 lg:rotate-0" />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
