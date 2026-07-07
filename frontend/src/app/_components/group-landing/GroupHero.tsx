"use client"

import { Container } from "@/_components/layout/Container"
import { Bars3Icon, ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from "@heroicons/react/24/outline"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import type { TouchEvent } from "react"
import { AppraLogo } from "../landing/AppraLogo"

const navLinks = [
    { name: "Główna", href: "#home", active: true },
    { name: "O grupie", href: "#o-grupie" },
    { name: "Spółki", href: "#oferta" },
    { name: "Jak pracujemy", href: "#jak-pracujemy" },
    { name: "Kontakt", href: "#kontakt" },
]

const heroSlides = [
    {
        label: "APPRA Rzeczoznawstwo",
        image: "/assets/images/why-appra-damage-detail.png",
    },
    {
        label: "RED LINE",
        image: "/assets/images/hero-damaged-car.jpg",
    },
    {
        label: "APPRA Serwis",
        image: "/assets/images/why-appra-damage-detail.jpg",
    },
]

export function GroupHero() {
    const [activeSlide, setActiveSlide] = useState(0)
    const [isPaused, setIsPaused] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const touchStartX = useRef<number | null>(null)

    const goToPreviousSlide = () => {
        setActiveSlide((current) => (current === 0 ? heroSlides.length - 1 : current - 1))
    }

    const goToNextSlide = () => {
        setActiveSlide((current) => (current + 1) % heroSlides.length)
    }

    useEffect(() => {
        if (isPaused) {
            return
        }

        const interval = window.setInterval(() => {
            setActiveSlide((current) => (current + 1) % heroSlides.length)
        }, 7000)

        return () => window.clearInterval(interval)
    }, [isPaused])

    const handleTouchStart = (event: TouchEvent<HTMLElement>) => {
        touchStartX.current = event.touches[0]?.clientX ?? null
    }

    const handleTouchEnd = (event: TouchEvent<HTMLElement>) => {
        if (touchStartX.current === null) {
            return
        }

        const touchEndX = event.changedTouches[0]?.clientX ?? touchStartX.current
        const distance = touchStartX.current - touchEndX
        touchStartX.current = null

        if (Math.abs(distance) < 45) {
            return
        }

        if (distance > 0) {
            goToNextSlide()
        } else {
            goToPreviousSlide()
        }
    }

    return (
        <section
            id="home"
            className="relative min-h-[690px] overflow-hidden bg-[#1F1F21] text-white"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            <header className="absolute inset-x-0 top-0 z-50 text-white">
                <Container className="max-w-[1240px] px-4 md:px-6 lg:px-6">
                    <nav className="flex min-h-[120px] items-center justify-between py-4 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-start">
                        <div className="hidden lg:block" />
                        <div className="flex translate-y-10 flex-col items-center gap-4">
                            <a href="#home" aria-label="GRUPA APPRA - strona główna" className="-translate-y-3">
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

            {heroSlides.map((slide, index) => (
                <div
                    key={slide.label}
                    className={[
                        "absolute inset-0 transition-opacity duration-[900ms] ease-out",
                        index === activeSlide ? "opacity-100" : "opacity-0",
                    ].join(" ")}
                    aria-hidden={index !== activeSlide}
                >
                    <Image
                        src={slide.image}
                        alt=""
                        fill
                        priority={index === 0}
                        sizes="100vw"
                        className="landing-hero-image object-cover object-[72%_center] opacity-90"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(31,31,33,0.76)_0%,rgba(31,31,33,0.64)_42%,rgba(31,31,33,0.36)_72%,rgba(31,31,33,0.70)_100%)]" />
                </div>
            ))}

            <button
                type="button"
                aria-label="Poprzedni slajd"
                onClick={goToPreviousSlide}
                className="absolute left-4 top-1/2 z-20 hidden size-14 -translate-y-1/2 items-center justify-center rounded-full bg-[#222222]/85 text-white shadow-[0_10px_24px_rgba(0,0,0,0.18)] transition-all duration-[250ms] hover:bg-[#8C2626] hover:shadow-[0_14px_32px_rgba(0,0,0,0.24)] lg:flex"
            >
                <ChevronLeftIcon className="size-8" />
            </button>
            <button
                type="button"
                aria-label="Następny slajd"
                onClick={goToNextSlide}
                className="absolute right-4 top-1/2 z-20 hidden size-14 -translate-y-1/2 items-center justify-center rounded-full bg-[#222222]/85 text-white shadow-[0_10px_24px_rgba(0,0,0,0.18)] transition-all duration-[250ms] hover:bg-[#8C2626] hover:shadow-[0_14px_32px_rgba(0,0,0,0.24)] lg:flex"
            >
                <ChevronRightIcon className="size-8" />
            </button>

            <Container className="relative z-10 flex min-h-[720px] max-w-[1240px] items-center px-4 pt-40 md:px-6 md:pt-52 lg:px-6">
                <div className="w-full max-w-[760px] lg:ml-[120px]">
                    <p className="text-sm font-bold uppercase tracking-[0.28em] text-[#C79797]">zintegrowany ekosystem marek</p>
                    <h1 className="mt-5 text-[48px] font-bold uppercase leading-[1.08] tracking-tight sm:text-[68px] lg:text-[82px]">
                        GRUPA APPRA
                    </h1>
                    <p className="mt-7 max-w-[680px] text-[22px] font-bold leading-8 text-white">
                        Zintegrowane marki motoryzacyjne działające w jednym standardzie jakości.
                    </p>
                    <p className="mt-6 max-w-[720px] text-[18px] font-medium leading-8 text-white/90">
                        Rzeczoznawstwo, obsługa szkód, naprawy, diagnostyka oraz zaplecze techniczne tworzą wspólny
                        ekosystem usług dla klientów indywidualnych, firm i partnerów biznesowych.
                    </p>
                    <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                        <a
                            href="#oferta"
                            className="inline-flex h-12 w-fit items-center justify-center rounded-[5px] bg-[#8C2626] px-8 text-sm font-bold text-white shadow-[0_10px_24px_rgba(0,0,0,0.18)] transition-all duration-[250ms] hover:-translate-y-0.5 hover:bg-[#A83232] hover:shadow-[0_14px_32px_rgba(140,38,38,0.26)]"
                        >
                            Poznaj spółki
                        </a>
                        <a
                            href="#kontakt"
                            className="inline-flex h-12 w-fit items-center justify-center rounded-[5px] border border-white/50 px-8 text-sm font-bold text-white transition-all duration-[250ms] hover:-translate-y-0.5 hover:border-white hover:bg-white/10"
                        >
                            Skontaktuj się
                        </a>
                    </div>
                    <div className="mt-10 flex flex-wrap gap-3 text-sm font-bold text-white/80">
                        {heroSlides.map((slide, index) => (
                            <button
                                key={slide.label}
                                type="button"
                                onClick={() => setActiveSlide(index)}
                                className={[
                                    "rounded-full border px-4 py-2 transition-all duration-[250ms]",
                                    index === activeSlide ? "border-[#8C2626] bg-[#8C2626]" : "border-white/25 bg-black/20 hover:border-[#8C2626]",
                                ].join(" ")}
                            >
                                {slide.label}
                            </button>
                        ))}
                    </div>
                </div>
            </Container>

            <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-3">
                {heroSlides.map((slide, index) => (
                    <button
                        key={slide.label}
                        type="button"
                        aria-label={`Przejdź do slajdu ${index + 1}`}
                        aria-current={index === activeSlide}
                        onClick={() => setActiveSlide(index)}
                        className={[
                            "size-3 rounded-full border-2 transition-colors duration-[250ms]",
                            index === activeSlide ? "border-[#8C2626] bg-[#8C2626]" : "border-white bg-transparent hover:border-[#8C2626]",
                        ].join(" ")}
                    />
                ))}
            </div>
        </section>
    )
}
