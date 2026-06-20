'use server'

import { httpGet } from "@/_lib/server/query-api";
import { ILandingContentOptions } from "../../branding/model";
import SettingsTabs from "@/_components/SettingsTabs";
import Main from "../../../_components/Main";
import Link from "next/link";
import { updateSectionVisibility } from "../../branding/actions";
import FormSwitch from "@/_components/FormSwitch";

interface VisibilityRowProps {
    name: string;
    label: string;
    description: string;
    defaultChecked: boolean;
}

function VisibilityRow({ name, label, description, defaultChecked }: VisibilityRowProps) {
    return (
        <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
            <div>
                <h4 className="text-sm font-medium text-gray-900">{label}</h4>
                <p className="text-sm text-gray-500 mt-0.5">{description}</p>
            </div>
            <FormSwitch
                name={name}
                defaultChecked={defaultChecked}
            />
        </div>
    );
}

export default async function Page() {
    const data = await httpGet('branding/landing-content');
    const content = await data.json() as ILandingContentOptions;
    const visibility = content.sectionVisibility;

    return (
        <Main header={<SettingsTabs />} narrow={true}>
            <div className="mb-6">
                <Link
                    href="/home/settings/landing"
                    className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                    &larr; Wróć do ustawień strony publicznej
                </Link>
            </div>

            <div className="mb-6">
                <h2 className="text-base/7 font-semibold text-gray-900">Widoczność sekcji</h2>
                <p className="mt-1 text-sm text-gray-500">
                    Kontroluj sekcje wyświetlane na publicznej stronie startowej.
                </p>
            </div>

            <form action={updateSectionVisibility}>
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm px-4">
                    <VisibilityRow
                        name="heroVisible"
                        label="Sekcja główna"
                        description="Główny baner z nazwą firmy i przyciskiem działania"
                        defaultChecked={visibility?.heroVisible ?? true}
                    />
                    <VisibilityRow
                        name="servicesVisible"
                        label="Sekcja usług"
                        description="Lista oferowanych usług"
                        defaultChecked={visibility?.servicesVisible ?? true}
                    />
                    <VisibilityRow
                        name="aboutVisible"
                        label="Sekcja „O nas”"
                        description="Opis firmy i najważniejsze wyróżniki"
                        defaultChecked={visibility?.aboutVisible ?? true}
                    />
                    <VisibilityRow
                        name="statsVisible"
                        label="Sekcja statystyk"
                        description="Najważniejsze statystyki i osiągnięcia"
                        defaultChecked={visibility?.statsVisible ?? true}
                    />
                    <VisibilityRow
                        name="tipsVisible"
                        label="Sekcja porad"
                        description="Porady dotyczące pielęgnacji samochodu"
                        defaultChecked={visibility?.tipsVisible ?? true}
                    />
                    <VisibilityRow
                        name="galleryVisible"
                        label="Sekcja galerii"
                        description="Galeria zdjęć prezentująca wykonane prace"
                        defaultChecked={visibility?.galleryVisible ?? true}
                    />
                    <VisibilityRow
                        name="contactVisible"
                        label="Sekcja kontaktowa"
                        description="Formularz kontaktowy i godziny otwarcia"
                        defaultChecked={visibility?.contactVisible ?? true}
                    />
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        type="submit"
                        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        Zapisz zmiany
                    </button>
                </div>
            </form>
        </Main>
    );
}
