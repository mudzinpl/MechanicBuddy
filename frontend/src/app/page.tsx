import { Navigation } from "./_components/landing/Navigation"
import { AboutSection, ClientIndustrySection, ContactSection, Footer, HeroSection, OfferSection, TaglineSection } from "./_components/landing/Sections"

export default function Home() {
    return (
        <div className="bg-[#1F1F21]">
            <div className="landing-page mx-auto w-full max-w-[1440px] overflow-hidden bg-[#1F1F21] shadow-[0_0_80px_rgba(0,0,0,0.35)]">
                <Navigation />
                <main>
                    <HeroSection />
                    <AboutSection />
                    <TaglineSection />
                    <OfferSection />
                    <ContactSection />
                    <ClientIndustrySection />
                </main>
                <Footer />
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

                .landing-page .landing-fade-in {
                    animation: landingFadeIn 900ms ease-out both;
                }

                .landing-page .landing-slide-up {
                    animation: landingSlideUp 900ms ease-out 160ms both;
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

                @keyframes landingFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes landingSlideUp {
                    from { opacity: 0; transform: translateY(18px); }
                    to { opacity: 1; transform: translateY(0); }
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
                    .landing-page .landing-fade-in,
                    .landing-page .landing-slide-up,
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
