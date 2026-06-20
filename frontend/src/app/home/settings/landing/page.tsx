import { httpGet } from "@/_lib/server/query-api";
import { ILandingContentOptions } from "../branding/model";
import SettingsTabs from "@/_components/SettingsTabs";
import Main from "../../_components/Main";
import Link from "next/link";
import {
    HomeIcon,
    WrenchScrewdriverIcon,
    InformationCircleIcon,
    ChartBarIcon,
    LightBulbIcon,
    PhoneIcon,
    DocumentTextIcon,
    PhotoIcon,
    ShareIcon,
    EyeIcon,
} from "@heroicons/react/24/outline";

interface SectionCardProps {
    title: string;
    description: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    itemCount?: number;
}

function SectionCard({ title, description, href, icon: Icon, itemCount }: SectionCardProps) {
    return (
        <Link
            href={href}
            className="relative flex items-start space-x-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:border-indigo-500 hover:shadow-md transition-all"
        >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
                <Icon className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
                    {itemCount !== undefined && (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                            {itemCount} pozycji
                        </span>
                    )}
                </div>
                <p className="mt-1 text-sm text-gray-500">{description}</p>
            </div>
        </Link>
    );
}

export default async function Page() {
    const data = await httpGet('branding/landing-content');
    const content = await data.json() as ILandingContentOptions;

    const activeServices = content.services.filter(s => s.isActive).length;
    const activeTips = content.tips.filter(t => t.isActive).length;
    const activePhotos = content.galleryPhotos?.filter(p => p.isActive).length || 0;
    const activeSocialLinks = content.socialLinks?.filter(l => l.isActive).length || 0;

    return (
        <Main header={<SettingsTabs />} narrow={true}>
            <div className="px-0">
                <h3 className="text-base/7 font-semibold text-gray-900 my-4">Zawartość strony publicznej</h3>
                <p className="text-sm text-gray-500">
                    Dostosuj treści wyświetlane na publicznej stronie startowej. Kliknij sekcję, aby ją edytować.
                </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <SectionCard
                    title="Sekcja główna"
                    description="Nazwa firmy, hasło i przyciski działania"
                    href="/home/settings/landing/hero"
                    icon={HomeIcon}
                />

                <SectionCard
                    title="Usługi"
                    description="Usługi oferowane klientom"
                    href="/home/settings/landing/services"
                    icon={WrenchScrewdriverIcon}
                    itemCount={activeServices}
                />

                <SectionCard
                    title="O nas"
                    description="Opis firmy i najważniejsze wyróżniki"
                    href="/home/settings/landing/about"
                    icon={InformationCircleIcon}
                    itemCount={content.about.features.length}
                />

                <SectionCard
                    title="Statystyki"
                    description="Najważniejsze statystyki i osiągnięcia"
                    href="/home/settings/landing/stats"
                    icon={ChartBarIcon}
                    itemCount={content.stats.length}
                />

                <SectionCard
                    title="Sekcja porad"
                    description="Porady dotyczące pielęgnacji samochodu"
                    href="/home/settings/landing/tips"
                    icon={LightBulbIcon}
                    itemCount={activeTips}
                />

                <SectionCard
                    title="Kontakt"
                    description="Dane kontaktowe i godziny otwarcia"
                    href="/home/settings/landing/contact"
                    icon={PhoneIcon}
                />

                <SectionCard
                    title="Stopka"
                    description="Treść stopki i szybkie linki"
                    href="/home/settings/landing/footer"
                    icon={DocumentTextIcon}
                />

                <SectionCard
                    title="Galeria zdjęć"
                    description="Prezentacja zdjęć wykonanych prac"
                    href="/home/settings/landing/gallery"
                    icon={PhotoIcon}
                    itemCount={activePhotos}
                />

                <SectionCard
                    title="Linki społecznościowe"
                    description="Media społecznościowe i linki zewnętrzne"
                    href="/home/settings/landing/social"
                    icon={ShareIcon}
                    itemCount={activeSocialLinks}
                />

                <SectionCard
                    title="Widoczność sekcji"
                    description="Pokazuj lub ukrywaj sekcje strony"
                    href="/home/settings/landing/visibility"
                    icon={EyeIcon}
                />
            </div>

            <div className="mt-8 rounded-lg bg-blue-50 p-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <InformationCircleIcon className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">Podgląd zmian</h3>
                        <div className="mt-2 text-sm text-blue-700">
                            <p>
                                Po wprowadzeniu zmian odwiedź stronę publiczną, aby zobaczyć efekt.
                                Zmiany są zapisywane natychmiast.
                            </p>
                        </div>
                        <div className="mt-3">
                            <a
                                href="/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-medium text-blue-800 hover:text-blue-600"
                            >
                                Otwórz stronę publiczną →
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </Main>
    );
}
