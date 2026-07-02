"use client"

import { Container } from "@/_components/layout/Container"
import {
    ArrowRightIcon,
    BuildingOffice2Icon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ClockIcon,
    ClipboardDocumentCheckIcon,
    EnvelopeIcon,
    MapPinIcon,
    PhoneIcon,
    ShieldCheckIcon,
    UserGroupIcon,
    UserIcon,
    WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import type { FormEvent, MouseEvent } from "react"
import type { TouchEvent } from "react"
import { AppraLogo } from "./AppraLogo"

const sectionContainer = "max-w-[1240px] px-4 md:px-6 lg:px-6"
const openContactFormEvent = "appra:open-contact-form"
const mapsUrl =
    "https://www.google.com/maps/dir/?api=1&destination=APPRA%20Sp.%20z%20o.o.%2C%20ul.%20Chwarznie%C5%84ska%20140%2C%2081-601%20Gdynia&travelmode=driving"

function PassengerCarIcon({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
        >
            <path d="M4.5 15.5h15" />
            <path d="M6.2 15.5l1.35-4.05A3 3 0 0 1 10.4 9.4h3.2a3 3 0 0 1 2.85 2.05l1.35 4.05" />
            <path d="M7.25 15.5h9.5" />
            <path d="M5.5 15.5v2.1a1 1 0 0 0 1 1h.6a1.25 1.25 0 0 0 1.2-.9l.15-.5h7.1l.15.5a1.25 1.25 0 0 0 1.2.9h.6a1 1 0 0 0 1-1v-2.1" />
            <path d="M7 13.2h1.6" />
            <path d="M15.4 13.2H17" />
        </svg>
    )
}

const offerItems = [
    {
        id: "naprawy-powypadkowe",
        title: "Naprawy powypadkowe",
        icon: WrenchScrewdriverIcon,
        image: "/assets/images/why-appra-damage-detail.png",
        details:
            "Realizujemy naprawy samochodów po kolizjach i wypadkach, obejmujące prace blacharskie, lakiernicze oraz przygotowanie pojazdu do odbioru. Proces prowadzimy w sposób uporządkowany, z naciskiem na jakość wykonania i przejrzystą komunikację z klientem.",
    },
    {
        id: "obsluga-szkody",
        title: "Obsługa szkody z ubezpieczenia",
        icon: ClipboardDocumentCheckIcon,
        image: "/assets/images/hero-damaged-car.jpg",
        details:
            "Pomagamy w obsłudze szkody komunikacyjnej, przygotowaniu dokumentacji, kontakcie z ubezpieczycielem oraz organizacji kolejnych etapów naprawy. Klient otrzymuje wsparcie od zgłoszenia sprawy do zakończenia procesu.",
    },
    {
        id: "samochod-zastepczy",
        title: "Samochód zastępczy",
        icon: PassengerCarIcon,
        image: "/assets/images/hero-damaged-car.jpg",
        details:
            "Na czas naprawy pomagamy w organizacji pojazdu zastępczego, zgodnie z charakterem szkody i dostępnymi możliwościami. Dzięki temu klient może zachować mobilność podczas realizacji naprawy.",
    },
]

const clientGroups = [
    { title: "Klienci indywidualni", icon: UserIcon },
    { title: "Firmy", icon: BuildingOffice2Icon },
    { title: "Floty", icon: UserGroupIcon },
    { title: "Ubezpieczyciele", icon: ShieldCheckIcon },
]

const contactCards = [
    {
        title: "Lokalizacja",
        value: "APPRA Serwis\nul. Chwarznieńska 140\n81-601 Gdynia",
        href: mapsUrl,
        icon: MapPinIcon,
    },
    {
        title: "Telefon",
        value: "+48 575 889 767",
        href: "tel:+48575889767",
        icon: PhoneIcon,
    },
    {
        title: "E-mail",
        value: "serwis@appra.eu",
        href: "mailto:serwis@appra.eu",
        icon: EnvelopeIcon,
    },
    {
        title: "Godziny otwarcia",
        value: "Poniedziałek – Piątek\n08:00 – 16:00\n\nSobota\nNieczynne\n\nNiedziela\nNieczynne",
        icon: ClockIcon,
        accent: true,
    },
]

const heroSlides = [
    {
        title: "Naprawy powypadkowe",
        description:
            "Kompleksowa naprawa samochodów po kolizjach i wypadkach. Przejmujemy cały proces – od zgłoszenia szkody do odbioru gotowego pojazdu.",
        cta: "Zgłoś szkodę",
        href: "#kontakt",
    },
    {
        title: "Bezgotówkowa likwidacja szkody",
        description:
            "Pomagamy w kontakcie z ubezpieczycielem, przygotowujemy dokumentację i prowadzimy sprawę aż do zakończenia naprawy.",
        cta: "Dowiedz się więcej",
        href: "#o-firmie",
    },
    {
        title: "Samochód zastępczy",
        description:
            "Zapewniamy pojazd zastępczy na czas naprawy, zgodnie z warunkami szkody i etapem realizacji naprawy.",
        cta: "Sprawdź możliwości",
        href: "#oferta",
    },
    {
        title: "Jedno miejsce. Pełna obsługa.",
        description: "Oględziny • Kosztorys • Naprawa • Lakiernictwo • Dokumentacja • Odbiór pojazdu",
        cta: "Skontaktuj się z nami",
        href: "#kontakt",
    },
]

const footerColumns = [
    {
        title: "Główna",
        links: [
            { label: "Strona główna", href: "#home" },
            { label: "O nas", href: "#o-firmie" },
            { label: "Oferta", href: "#oferta" },
            { label: "Kontakt", href: "#kontakt" },
        ],
    },
    {
        title: "O firmie",
        links: [
            { label: "O nas", href: "#o-firmie" },
            { label: "Dlaczego my", href: "#o-firmie" },
            { label: "Nasze wartości", href: "#o-firmie" },
        ],
    },
    {
        title: "Oferta",
        links: [
            { label: "Naprawy powypadkowe", href: "#naprawy-powypadkowe" },
            { label: "Obsługa szkody", href: "#obsluga-szkody" },
            { label: "Samochód zastępczy", href: "#samochod-zastepczy" },
        ],
    },
    {
        title: "Kontakt",
        links: [
            { label: "Formularz kontaktowy", href: "#kontakt" },
            { label: "Dane kontaktowe", href: "#kontakt" },
        ],
    },
    {
        title: "Ważne linki",
        links: [
            { label: "Polityka prywatności", href: "/polityka-prywatnosci" },
            { label: "Polityka cookies", href: "/polityka-cookies" },
            { label: "Kontakt", href: "#kontakt" },
        ],
    },
]

function SectionLabel({ children, light = false }: { children: string; light?: boolean }) {
    return (
        <div className={["mb-5 text-sm font-semibold", light ? "text-white" : "text-[#222222]"].join(" ")}>
            <span className="inline-block border-b-2 border-[#8C2626] pb-2">{children}</span>
        </div>
    )
}

export function HeroSection() {
    const [activeSlide, setActiveSlide] = useState(0)
    const [isPaused, setIsPaused] = useState(false)
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
            <Image
                src="/assets/images/hero-damaged-car.jpg"
                alt=""
                fill
                priority
                sizes="100vw"
                className="object-cover object-[72%_center] opacity-90"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(31,31,33,0.72)_0%,rgba(31,31,33,0.62)_38%,rgba(31,31,33,0.34)_72%,rgba(31,31,33,0.66)_100%)]" />
            <button
                type="button"
                aria-label="Poprzedni slajd"
                onClick={goToPreviousSlide}
                className="absolute left-4 top-1/2 z-10 hidden size-14 -translate-y-1/2 items-center justify-center rounded-full bg-[#222222]/85 text-white shadow-[0_10px_24px_rgba(0,0,0,0.18)] transition-all duration-[250ms] hover:bg-[#8C2626] hover:shadow-[0_14px_32px_rgba(0,0,0,0.24)] lg:flex"
            >
                <ChevronLeftIcon className="size-8" />
            </button>
            <button
                type="button"
                aria-label="Następny slajd"
                onClick={goToNextSlide}
                className="absolute right-4 top-1/2 z-10 hidden size-14 -translate-y-1/2 items-center justify-center rounded-full bg-[#222222]/85 text-white shadow-[0_10px_24px_rgba(0,0,0,0.18)] transition-all duration-[250ms] hover:bg-[#8C2626] hover:shadow-[0_14px_32px_rgba(0,0,0,0.24)] lg:flex"
            >
                <ChevronRightIcon className="size-8" />
            </button>
            <Container className={`relative z-10 flex min-h-[720px] items-center pt-40 md:pt-52 ${sectionContainer}`}>
                <div className="relative min-h-[330px] w-full max-w-[650px] lg:ml-[120px]">
                    {heroSlides.map((slide, index) => (
                        <div
                            key={slide.title}
                            className={[
                                "absolute inset-0 flex flex-col justify-center transition-all duration-[800ms] ease-out",
                                index === activeSlide ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0",
                            ].join(" ")}
                            aria-hidden={index !== activeSlide}
                        >
                            <h1 className="text-[44px] font-bold uppercase leading-[1.12] tracking-tight sm:text-[62px] lg:text-[72px]">
                                {slide.title}
                            </h1>
                            <p className="mt-8 max-w-[650px] text-[19px] font-medium leading-8 text-white">
                                {slide.description}
                            </p>
                            <a
                                href={slide.href}
                                className="mt-10 inline-flex h-12 w-fit items-center rounded-[5px] bg-[#8C2626] px-8 text-sm font-bold text-white shadow-[0_10px_24px_rgba(0,0,0,0.18)] transition-all duration-[250ms] hover:-translate-y-0.5 hover:bg-[#A83232] hover:shadow-[0_14px_32px_rgba(140,38,38,0.26)]"
                            >
                                {slide.cta}
                            </a>
                        </div>
                    ))}
                </div>
            </Container>
            <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-3">
                {heroSlides.map((slide, index) => (
                    <button
                        key={slide.title}
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

export function AboutSection() {
    return (
        <section id="o-firmie" className="landing-reveal relative overflow-hidden bg-[#1F1F21] text-white">
            <Image
                src="/assets/images/why-appra-damage-detail.png"
                alt=""
                fill
                sizes="100vw"
                className="object-cover object-left opacity-30"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(31,31,33,0.70),rgba(31,31,33,0.95))]" />
            <Container className={`relative z-10 py-20 lg:py-28 ${sectionContainer}`}>
                <div className="grid gap-12 lg:grid-cols-[0.8fr_0.9fr_0.8fr] lg:items-center">
                    <div>
                        <SectionLabel light>O nas</SectionLabel>
                        <h2 className="max-w-sm text-[36px] font-bold leading-tight lg:text-[42px]">
                            O firmie<br />Appra Serwis
                        </h2>
                    </div>
                    <div className="max-w-[650px] space-y-6 text-[17px] font-medium leading-7 text-white">
                        <p>
                            Appra Serwis to centrum napraw powypadkowych, które kompleksowo prowadzi klienta od zgłoszenia szkody, przez oględziny i kosztorys, aż po odbiór gotowego pojazdu.
                        </p>
                        <p>
                            Obsługujemy szkody komunikacyjne, współpracujemy z klientami indywidualnymi, flotami oraz towarzystwami ubezpieczeniowymi.
                        </p>
                    </div>
                    <div className="rounded-[10px] bg-[#8C2626] p-8 shadow-[0_16px_42px_rgba(0,0,0,0.22)] transition-all duration-[250ms] hover:-translate-y-1 hover:shadow-[0_22px_55px_rgba(0,0,0,0.28)]">
                        <h3 className="text-2xl font-bold">To nie wszystko!</h3>
                        <div className="mt-4 h-px w-24 bg-white/35" />
                        <p className="mt-6 text-[16px] font-medium leading-7 text-white">
                            Zapewniamy wsparcie na każdym etapie naprawy. Pomagamy w formalnościach, organizacji pojazdu zastępczego i kontakcie z ubezpieczycielem.
                        </p>
                        <a
                            href="#kontakt"
                            className="mt-8 inline-flex h-11 items-center rounded-[5px] border border-white/70 px-7 text-sm font-bold text-white transition-all duration-[250ms] hover:-translate-y-0.5 hover:bg-white hover:text-[#8C2626]"
                        >
                            Zobacz więcej
                        </a>
                    </div>
                </div>
            </Container>
        </section>
    )
}

export function TaglineSection() {
    return (
        <section className="landing-reveal bg-[#1F1F21] px-4 py-8 text-center text-white">
            <p className="mx-auto max-w-3xl text-[24px] font-bold leading-tight md:text-[30px]">
                Appra Serwis to pewność, sprawność i jakość,<br className="hidden md:block" /> na której możesz polegać
            </p>
        </section>
    )
}

export function OfferSection() {
    const [expandedOfferId, setExpandedOfferId] = useState<string | null>(null)

    useEffect(() => {
        const expandOfferFromHash = () => {
            const hash = window.location.hash.replace("#", "")
            const offer = offerItems.find((item) => item.id === hash)

            if (!offer) {
                return
            }

            setExpandedOfferId(offer.id)
            window.setTimeout(() => {
                document.getElementById(offer.id)?.scrollIntoView({ behavior: "smooth", block: "center" })
            }, 80)
        }

        expandOfferFromHash()
        window.addEventListener("hashchange", expandOfferFromHash)

        return () => window.removeEventListener("hashchange", expandOfferFromHash)
    }, [])

    return (
        <section id="oferta" className="landing-reveal bg-[#F5F5F5] py-16 text-[#222222] lg:py-24">
            <Container className={sectionContainer}>
                <SectionLabel>Oferta</SectionLabel>
                <h2 className="text-[34px] font-bold leading-tight md:text-[40px]">Nasza oferta</h2>
                <div className="mt-10 grid gap-9 md:grid-cols-3">
                    {offerItems.map((item) => {
                        const Icon = item.icon
                        const isExpanded = expandedOfferId === item.id

                        return (
                            <article id={item.id} key={item.title} className="group relative min-h-[190px] scroll-mt-24 overflow-hidden rounded-[10px] bg-[#1F1F21] text-white shadow-[0_12px_34px_rgba(0,0,0,0.14)] transition-all duration-[250ms] hover:-translate-y-1 hover:shadow-[0_18px_46px_rgba(0,0,0,0.20)]">
                                <Image
                                    src={item.image}
                                    alt=""
                                    fill
                                    sizes="(min-width: 768px) 33vw, 100vw"
                                    className="object-cover opacity-[0.72] transition-opacity duration-[250ms] group-hover:opacity-[0.82]"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/28 to-transparent" />
                                <button
                                    type="button"
                                    aria-expanded={isExpanded}
                                    aria-controls={`${item.id}-details`}
                                    onClick={() => setExpandedOfferId(isExpanded ? null : item.id)}
                                    className="relative z-10 flex min-h-[190px] w-full flex-col justify-end p-7 text-left"
                                >
                                    <Icon className="mb-4 size-8 text-white/90" />
                                    <h3 className="min-h-[58px] max-w-[260px] text-[24px] font-bold leading-tight">{item.title}</h3>
                                    <span className="mt-5 flex size-10 shrink-0 items-center justify-center rounded-full bg-[#8C2626] shadow-[0_8px_18px_rgba(0,0,0,0.20)] transition-all duration-[250ms] group-hover:-translate-y-0.5 group-hover:bg-[#A83232]">
                                        <ArrowRightIcon className="size-5" />
                                    </span>
                                </button>
                                <div
                                    id={`${item.id}-details`}
                                    className={[
                                        "relative z-10 grid border-t border-white/15 bg-[#1F1F21]/92 transition-all duration-[250ms] ease-out",
                                        isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                                    ].join(" ")}
                                >
                                    <div className="overflow-hidden">
                                        <p className="px-7 pb-7 pt-1 text-[15px] font-medium leading-7 text-white/90">
                                            {item.details}
                                        </p>
                                    </div>
                                </div>
                            </article>
                        )
                    })}
                </div>
            </Container>
        </section>
    )
}

export function ContactSection() {
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [isSent, setIsSent] = useState(false)
    const formPanelRef = useRef<HTMLDivElement | null>(null)

    const openFormAndScroll = () => {
        setIsFormOpen(true)
        window.setTimeout(() => {
            formPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
        }, 90)
    }

    useEffect(() => {
        const handleOpenContactForm = () => openFormAndScroll()

        const handleHashChange = () => {
            if (window.location.hash === "#kontakt") {
                openFormAndScroll()
            }
        }

        handleHashChange()
        window.addEventListener(openContactFormEvent, handleOpenContactForm)
        window.addEventListener("hashchange", handleHashChange)

        return () => {
            window.removeEventListener(openContactFormEvent, handleOpenContactForm)
            window.removeEventListener("hashchange", handleHashChange)
        }
    }, [])

    useEffect(() => {
        if (!isFormOpen) {
            return
        }

        const handleOutsideClick = (event: PointerEvent) => {
            const target = event.target

            if (target instanceof Node && formPanelRef.current?.contains(target)) {
                return
            }

            setIsFormOpen(false)
        }

        document.addEventListener("pointerdown", handleOutsideClick)

        return () => document.removeEventListener("pointerdown", handleOutsideClick)
    }, [isFormOpen])

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setIsSent(true)
    }

    return (
        <section id="kontakt" className="landing-reveal relative overflow-hidden bg-[#F5F5F5] py-20 text-[#222222]">
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(245,245,245,0.85),rgba(245,245,245,0.55))]" />
            <Container className={`relative z-10 ${sectionContainer}`}>
                <div className="grid gap-10 lg:grid-cols-[0.45fr_0.55fr] lg:items-center">
                    <h2 className="text-[34px] font-bold leading-tight md:text-[40px]">Skontaktuj się z nami</h2>
                    <div className="rounded-[10px] border border-[#8C2626]/35 bg-white/80 p-8 shadow-[0_12px_30px_rgba(0,0,0,0.08)] transition-all duration-[250ms] hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,0,0,0.12)]">
                        <p className="max-w-[650px] text-[17px] font-medium leading-7">
                            Nasz zespół odpowie na wszystkie pytania i pomoże dobrać najlepszy sposób obsługi naprawy.
                        </p>
                        <button
                            type="button"
                            onClick={openFormAndScroll}
                            className="mt-7 inline-flex h-11 items-center rounded-[5px] bg-[#8C2626] px-8 text-sm font-bold text-white transition-all duration-[250ms] hover:-translate-y-0.5 hover:bg-[#A83232]"
                        >
                            Zobacz więcej
                        </button>
                    </div>
                </div>
                <div
                    ref={formPanelRef}
                    className={[
                        "grid transition-all duration-[350ms] ease-out",
                        isFormOpen ? "mt-10 grid-rows-[1fr] opacity-100" : "mt-0 grid-rows-[0fr] opacity-0",
                    ].join(" ")}
                >
                    <div className="overflow-hidden">
                        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
                            <form
                                onSubmit={handleSubmit}
                                className="rounded-[8px] border border-[#8C2626]/20 bg-white p-6 shadow-[0_16px_42px_rgba(0,0,0,0.10)] md:p-8"
                            >
                                <div className="grid gap-5 md:grid-cols-2">
                                    <label className="block">
                                        <span className="text-sm font-bold text-[#222222]">Imię i nazwisko</span>
                                        <input
                                            name="name"
                                            required
                                            className="mt-2 h-12 w-full rounded-[5px] border border-[#777777]/25 bg-[#F5F5F5] px-4 text-base text-[#222222] outline-none transition-colors focus:border-[#8C2626] focus:bg-white"
                                        />
                                    </label>
                                    <label className="block">
                                        <span className="text-sm font-bold text-[#222222]">Telefon</span>
                                        <input
                                            name="phone"
                                            type="tel"
                                            required
                                            className="mt-2 h-12 w-full rounded-[5px] border border-[#777777]/25 bg-[#F5F5F5] px-4 text-base text-[#222222] outline-none transition-colors focus:border-[#8C2626] focus:bg-white"
                                        />
                                    </label>
                                    <label className="block">
                                        <span className="text-sm font-bold text-[#222222]">E-mail</span>
                                        <input
                                            name="email"
                                            type="email"
                                            required
                                            className="mt-2 h-12 w-full rounded-[5px] border border-[#777777]/25 bg-[#F5F5F5] px-4 text-base text-[#222222] outline-none transition-colors focus:border-[#8C2626] focus:bg-white"
                                        />
                                    </label>
                                    <label className="block">
                                        <span className="text-sm font-bold text-[#222222]">Temat</span>
                                        <input
                                            name="subject"
                                            required
                                            className="mt-2 h-12 w-full rounded-[5px] border border-[#777777]/25 bg-[#F5F5F5] px-4 text-base text-[#222222] outline-none transition-colors focus:border-[#8C2626] focus:bg-white"
                                        />
                                    </label>
                                    <label className="block md:col-span-2">
                                        <span className="text-sm font-bold text-[#222222]">Wiadomość</span>
                                        <textarea
                                            name="message"
                                            rows={5}
                                            required
                                            className="mt-2 w-full resize-y rounded-[5px] border border-[#777777]/25 bg-[#F5F5F5] px-4 py-3 text-base text-[#222222] outline-none transition-colors focus:border-[#8C2626] focus:bg-white"
                                        />
                                    </label>
                                    <label className="flex items-start gap-3 md:col-span-2">
                                        <input
                                            name="consent"
                                            type="checkbox"
                                            required
                                            className="mt-1 size-4 rounded border-[#777777]/40 accent-[#8C2626]"
                                        />
                                        <span className="text-sm font-medium leading-6 text-[#222222]">
                                            Wyrażam zgodę na kontakt w celu obsługi zgłoszenia.
                                        </span>
                                    </label>
                                    <label className="flex items-start gap-3 md:col-span-2">
                                        <input
                                            name="privacyConsent"
                                            type="checkbox"
                                            required
                                            className="mt-1 size-4 rounded border-[#777777]/40 accent-[#8C2626]"
                                        />
                                        <span className="text-sm font-medium leading-6 text-[#222222]">
                                            Wyrażam zgodę na przetwarzanie moich danych osobowych zgodnie z{" "}
                                            <a
                                                href="/polityka-prywatnosci"
                                                className="font-bold text-[#8C2626] underline-offset-4 hover:underline"
                                            >
                                                Polityką Prywatności
                                            </a>
                                            .
                                        </span>
                                    </label>
                                </div>
                                <button
                                    type="submit"
                                    className="mt-6 inline-flex h-11 items-center rounded-[5px] bg-[#8C2626] px-8 text-sm font-bold text-white transition-all duration-[250ms] hover:-translate-y-0.5 hover:bg-[#A83232]"
                                >
                                    Wyślij wiadomość
                                </button>
                                {isSent && (
                                    <p className="mt-5 rounded-[5px] border border-[#8C2626]/25 bg-[#8C2626]/10 px-4 py-3 text-sm font-semibold text-[#222222]">
                                        Dziękujemy. Formularz został przygotowany do integracji z systemem APPRA.
                                    </p>
                                )}
                            </form>
                            <div className="grid gap-4">
                                {contactCards.map((card) => {
                                    const Icon = card.icon
                                    const content = (
                                        <>
                                            <Icon className="size-7 shrink-0 text-[#8C2626]" />
                                            <div>
                                                <h3 className="text-sm font-bold uppercase tracking-wide text-[#222222]">{card.title}</h3>
                                                <p className={["mt-2 whitespace-pre-line text-[15px] font-medium leading-6", card.accent ? "text-[#8C2626]" : "text-[#222222]"].join(" ")}>
                                                    {card.value}
                                                </p>
                                            </div>
                                        </>
                                    )

                                    if (card.href) {
                                        return (
                                            <a
                                                key={card.title}
                                                href={card.href}
                                                className="flex gap-4 rounded-[8px] border border-[#8C2626]/15 bg-white p-5 shadow-[0_10px_26px_rgba(0,0,0,0.06)] transition-all duration-[250ms] hover:-translate-y-0.5 hover:border-[#8C2626]/35"
                                            >
                                                {content}
                                            </a>
                                        )
                                    }

                                    return (
                                        <div
                                            key={card.title}
                                            className="flex gap-4 rounded-[8px] border border-[#8C2626]/15 bg-white p-5 shadow-[0_10px_26px_rgba(0,0,0,0.06)]"
                                        >
                                            {content}
                                        </div>
                                    )
                                })}
                                <div className="rounded-[8px] border border-[#8C2626]/20 bg-white p-5 shadow-[0_10px_26px_rgba(0,0,0,0.06)]">
                                    <h3 className="text-sm font-extrabold uppercase tracking-wide text-[#8C2626]">Nasza lokalizacja</h3>
                                    <p className="mt-3 whitespace-pre-line text-[15px] font-semibold leading-6 text-[#222222]">
                                        APPRA Serwis{"\n"}ul. Chwarznieńska 140{"\n"}81-601 Gdynia
                                    </p>
                                    <div className="mt-5 grid gap-5 sm:grid-cols-[1fr_auto] sm:items-center">
                                        <a
                                            href={mapsUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label="Wyznacz trasę do APPRA Serwis w Google Maps"
                                            className="inline-flex h-11 w-fit items-center rounded-[5px] bg-[#8C2626] px-5 text-sm font-bold text-white transition-all duration-[250ms] hover:-translate-y-0.5 hover:bg-[#A83232] focus:outline-none focus:ring-2 focus:ring-[#8C2626] focus:ring-offset-2"
                                        >
                                            📍 Wyznacz trasę
                                        </a>
                                        <div className="w-fit rounded-[8px] border border-[#777777]/15 bg-[#F5F5F5] p-3 text-center">
                                            <Image
                                                src="/assets/images/appra-maps-qr.svg"
                                                alt="Kod QR prowadzący do lokalizacji APPRA Serwis w Google Maps"
                                                width={132}
                                                height={132}
                                                className="mx-auto rounded-[5px]"
                                            />
                                            <p className="mt-3 text-xs font-semibold leading-5 text-[#222222]">
                                                Zeskanuj telefonem,<br />aby rozpocząć nawigację.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    )
}

export function ClientIndustrySection() {
    return (
        <section className="landing-reveal bg-[#F5F5F5] py-14 text-[#222222]">
            <Container className={sectionContainer}>
                <div className="grid gap-8 lg:grid-cols-[0.42fr_0.58fr] lg:items-center">
                    <div>
                        <SectionLabel>Branża naszych klientów</SectionLabel>
                        <p className="max-w-[650px] text-[16px] font-medium leading-7">
                            Obsługujemy klientów indywidualnych, firmy, floty oraz podmioty współpracujące z towarzystwami ubezpieczeniowymi. Naszym celem jest szybka, przejrzysta i skuteczna realizacja naprawy.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        {clientGroups.map((group) => {
                            const Icon = group.icon
                            return (
                                <div key={group.title} className="rounded-[10px] border border-[#777777]/20 bg-white p-6 text-center shadow-[0_10px_26px_rgba(0,0,0,0.06)] transition-all duration-[250ms] hover:-translate-y-1 hover:border-[#8C2626]/35 hover:shadow-[0_16px_36px_rgba(0,0,0,0.10)]">
                                    <Icon className="mx-auto size-11 text-[#8C2626]" />
                                    <p className="mt-4 text-sm font-extrabold uppercase leading-5">{group.title}</p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </Container>
        </section>
    )
}

export function Footer() {
    const [isCookiesOpen, setIsCookiesOpen] = useState(false)

    useEffect(() => {
        if (!isCookiesOpen) {
            return
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsCookiesOpen(false)
            }
        }

        window.addEventListener("keydown", handleKeyDown)

        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [isCookiesOpen])

    const handleFooterLinkClick = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
        if (href === "#") {
            event.preventDefault()
            setIsCookiesOpen(true)
            return
        }

        if (!href.startsWith("#")) {
            return
        }

        event.preventDefault()
        window.history.pushState(null, "", href)

        if (href === "#kontakt") {
            window.dispatchEvent(new Event(openContactFormEvent))
            return
        }

        window.dispatchEvent(new Event("hashchange"))
        document.getElementById(href.replace("#", ""))?.scrollIntoView({ behavior: "smooth", block: "start" })
    }

    return (
        <footer className="bg-[#8C2626] text-white">
            <Container className={sectionContainer}>
                <div className="grid gap-10 py-12 md:grid-cols-[1fr_2fr] lg:grid-cols-[1.2fr_4fr] lg:py-14">
                    <div>
                        <AppraLogo className="[&>img]:max-h-[107px] [&>img]:max-w-[326px]" />
                    </div>
                    <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-5">
                        {footerColumns.map((column) => (
                            <div key={column.title}>
                                <h3 className="text-sm font-bold">{column.title}</h3>
                                <ul className="mt-3 space-y-1 text-xs text-white/85">
                                    {column.links.map((link) => (
                                        <li key={link.label}>
                                            <a
                                                href={link.href}
                                                onClick={(event) => handleFooterLinkClick(event, link.href)}
                                                className="transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-white/70 focus:ring-offset-2 focus:ring-offset-[#8C2626]"
                                            >
                                                {link.label}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-white/20 py-3 text-center text-xs text-white/80">
                    <a href="/polityka-prywatnosci" className="transition-colors hover:text-white">
                        Polityka prywatności
                    </a>
                    <a href="/polityka-cookies" className="transition-colors hover:text-white">
                        Polityka cookies
                    </a>
                    <a
                        href="#kontakt"
                        onClick={(event) => handleFooterLinkClick(event, "#kontakt")}
                        className="transition-colors hover:text-white"
                    >
                        Kontakt
                    </a>
                </div>
            </Container>
            {isCookiesOpen && (
                <div
                    role="presentation"
                    className="fixed inset-0 z-50 flex items-center justify-center bg-[#1F1F21]/70 px-4 py-8 backdrop-blur-sm"
                    onClick={() => setIsCookiesOpen(false)}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="cookies-title"
                        className="w-full max-w-xl rounded-[10px] bg-white p-6 text-[#222222] shadow-[0_24px_80px_rgba(0,0,0,0.35)] md:p-8"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <h2 id="cookies-title" className="text-2xl font-bold">Polityka Cookies</h2>
                        <div className="mt-5 space-y-4 text-[15px] font-medium leading-7">
                            <p>APPRA Serwis wykorzystuje pliki cookies wyłącznie w celu:</p>
                            <ul className="list-disc space-y-2 pl-6">
                                <li>prawidłowego działania strony,</li>
                                <li>poprawy jakości usług,</li>
                                <li>prowadzenia anonimowych statystyk odwiedzin.</li>
                            </ul>
                            <p>Nie wykorzystujemy plików cookies do sprzedaży danych użytkowników.</p>
                            <p>
                                Kontakt:<br />
                                <a
                                    href="mailto:serwis@appra.eu"
                                    className="font-bold text-[#8C2626] underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-[#8C2626]"
                                >
                                    serwis@appra.eu
                                </a>
                            </p>
                        </div>
                        <button
                            type="button"
                            autoFocus
                            onClick={() => setIsCookiesOpen(false)}
                            className="mt-7 inline-flex h-11 items-center rounded-[5px] bg-[#8C2626] px-8 text-sm font-bold text-white transition-all duration-[250ms] hover:-translate-y-0.5 hover:bg-[#A83232] focus:outline-none focus:ring-2 focus:ring-[#8C2626] focus:ring-offset-2"
                        >
                            Zamknij
                        </button>
                    </div>
                </div>
            )}
        </footer>
    )
}
