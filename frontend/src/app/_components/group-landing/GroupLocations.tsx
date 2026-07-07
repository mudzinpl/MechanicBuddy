import {
    BanknotesIcon,
    BuildingOffice2Icon,
    ShieldCheckIcon,
    TruckIcon,
    UserGroupIcon,
    UserIcon,
} from "@heroicons/react/24/outline"

const audiences = [
    { title: "Klienci indywidualni", icon: UserIcon },
    { title: "Firmy", icon: BuildingOffice2Icon },
    { title: "Floty", icon: TruckIcon },
    { title: "Towarzystwa ubezpieczeniowe", icon: ShieldCheckIcon },
    { title: "Leasing", icon: BanknotesIcon },
    { title: "Partnerzy biznesowi", icon: UserGroupIcon },
]

export function GroupLocations() {
    return (
        <section id="dla-kogo" className="landing-reveal bg-[#F5F5F5] px-4 pb-20 text-[#222222] md:px-6 lg:px-6">
            <div className="mx-auto grid max-w-[1240px] gap-10 lg:grid-cols-[0.36fr_0.64fr] lg:items-center">
                <div>
                    <div className="mb-5 text-sm font-semibold text-[#222222]">
                        <span className="inline-block border-b-2 border-[#8C2626] pb-2">Dla kogo pracujemy</span>
                    </div>
                    <p className="max-w-[520px] text-[16px] font-medium leading-7">
                        Obsługujemy klientów indywidualnych, firmy, floty oraz partnerów instytucjonalnych, łącząc
                        specjalizacje spółek APPRA w jeden standard współpracy.
                    </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {audiences.map((audience) => {
                        const Icon = audience.icon
                        return (
                            <article
                                key={audience.title}
                                className="group border-l border-[#1F1F21]/15 bg-white p-6 text-center shadow-[0_10px_28px_rgba(0,0,0,0.04)] transition-all duration-[250ms] hover:-translate-y-1 hover:border-[#8C2626]/45"
                            >
                                <Icon className="mx-auto size-10 text-[#8C2626] transition-transform duration-[250ms] group-hover:scale-105" />
                                <h3 className="mt-5 text-sm font-bold uppercase leading-5 tracking-wide">{audience.title}</h3>
                            </article>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
