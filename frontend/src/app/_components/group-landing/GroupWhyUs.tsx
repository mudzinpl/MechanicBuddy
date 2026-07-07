import {
    BuildingOffice2Icon,
    CheckBadgeIcon,
    CpuChipIcon,
    ShieldCheckIcon,
    SparklesIcon,
    UserGroupIcon,
} from "@heroicons/react/24/outline"

const strengths = [
    { title: "Doświadczenie", icon: CheckBadgeIcon },
    { title: "Kompleksowość", icon: BuildingOffice2Icon },
    { title: "Jakość", icon: ShieldCheckIcon },
    { title: "Nowoczesne technologie", icon: CpuChipIcon },
    { title: "Odpowiedzialność", icon: UserGroupIcon },
    { title: "Zaufanie", icon: SparklesIcon },
]

export function GroupWhyUs() {
    return (
        <section id="dlaczego-my" className="landing-reveal bg-[#F5F5F5] px-4 py-16 text-[#222222] md:px-6 lg:px-6 lg:py-24">
            <div className="mx-auto max-w-[1240px]">
                <div className="mb-5 text-sm font-semibold text-[#222222]">
                    <span className="inline-block border-b-2 border-[#8C2626] pb-2">Dlaczego APPRA</span>
                </div>
                <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
                    <h2 className="text-[34px] font-bold leading-tight md:text-[40px]">
                        Stabilne zaplecze dla klienta indywidualnego i biznesowego.
                    </h2>
                    <div className="grid gap-5 sm:grid-cols-2">
                        {strengths.map((strength) => {
                            const Icon = strength.icon
                            return (
                                <div
                                    key={strength.title}
                                    className="group rounded-[10px] border border-[#1F1F21]/10 bg-white p-7 shadow-[0_12px_34px_rgba(0,0,0,0.08)] transition-all duration-[250ms] hover:-translate-y-1 hover:border-[#8C2626]/35 hover:shadow-[0_18px_46px_rgba(0,0,0,0.14)]"
                                >
                                    <Icon className="size-11 text-[#8C2626] transition-transform duration-[250ms] group-hover:scale-105" />
                                    <p className="mt-6 text-xl font-bold leading-tight">{strength.title}</p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </section>
    )
}
