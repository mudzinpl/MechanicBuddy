'use client'

import { Container } from "@/_components/layout/Container"
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline"
import { useState } from "react"
import { AppraLogo } from "./AppraLogo"

const navLinks = [
    { name: "Główna", href: "#home", active: true },
    { name: "O firmie", href: "#o-firmie" },
    { name: "Oferta", href: "#oferta" },
    { name: "Kontakt", href: "#kontakt" },
]

export function Navigation() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    return (
        <header className="absolute inset-x-0 top-0 z-50 text-white">
            <Container className="max-w-[1240px] px-4 md:px-6 lg:px-6">
                <nav className="flex min-h-[120px] items-center justify-between py-4 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-start">
                    <div className="hidden lg:block" />
                    <div className="flex translate-y-10 flex-col items-center gap-4">
                        <a href="#start" aria-label="APPRA - strona główna" className="-translate-y-3">
                            <AppraLogo className="[&>img]:max-h-[134px] [&>img]:max-w-[408px]" />
                        </a>
                        <div className="hidden items-center gap-6 text-[15px] font-semibold lg:flex">
                            {navLinks.map((link, index) => (
                                <span key={link.name} className="flex items-center gap-6">
                                    {index > 0 && <span className="text-white/45">|</span>}
                                    <a
                                        href={link.href}
                                        className={[
                                            "border-b-2 pb-1 transition-colors duration-[250ms] hover:border-[#8C2626] hover:text-white",
                                            link.active ? "border-[#8C2626] text-white" : "border-transparent text-white/90",
                                        ].join(" ")}
                                    >
                                        {link.name}
                                    </a>
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end lg:hidden">
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="rounded-full bg-black/55 p-3 text-white shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
                            aria-label="Przełącz menu"
                        >
                            {mobileMenuOpen ? <XMarkIcon className="size-6" /> : <Bars3Icon className="size-6" />}
                        </button>
                    </div>
                </nav>
            </Container>

            {mobileMenuOpen && (
                <div className="border-y border-white/10 bg-[#1F1F21]/95 px-4 py-4 backdrop-blur-md lg:hidden">
                    <div className="mx-auto flex max-w-[1240px] flex-col gap-1">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="rounded-[5px] px-3 py-3 text-base font-semibold text-white transition-colors duration-[250ms] hover:bg-white/10"
                            >
                                {link.name}
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </header>
    )
}
