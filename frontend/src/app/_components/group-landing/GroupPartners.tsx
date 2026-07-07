const cooperationAreas = [
    "Klienci indywidualni",
    "Firmy",
    "Floty",
    "Towarzystwa ubezpieczeniowe",
    "Leasingi",
    "Partnerzy motoryzacyjni",
]

export function GroupPartners() {
    return (
        <section id="partnerzy" className="landing-reveal bg-[#F5F5F5] px-4 py-16 md:px-6 lg:px-6 lg:py-24">
            <div className="mx-auto max-w-[1240px]">
                <div className="mx-auto max-w-3xl text-center">
                    <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#8C2626]">Obszary współpracy</p>
                    <h2 className="mt-5 text-[34px] font-bold leading-tight md:text-[40px]">Pracujemy dla różnych grup klientów i partnerów.</h2>
                    <p className="mt-5 text-[17px] font-medium leading-7 text-[#555]">
                        Grupa APPRA łączy kompetencje marek tak, aby obsługiwać zarówno klientów indywidualnych, jak i
                        organizacje wymagające spójnego standardu współpracy.
                    </p>
                </div>
                <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
                    {cooperationAreas.map((area) => (
                        <div
                            key={area}
                            className="group flex h-24 items-center justify-center rounded-[10px] border border-[#1F1F21]/10 bg-white px-4 text-center shadow-[0_12px_34px_rgba(0,0,0,0.06)] transition-all duration-[250ms] hover:-translate-y-1 hover:border-[#8C2626]/35 hover:shadow-[0_18px_46px_rgba(0,0,0,0.12)]"
                        >
                            <span className="text-xl font-bold tracking-tight text-[#777777] grayscale transition-colors duration-[250ms] group-hover:text-[#8C2626]">
                                {area}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
