import type { Metadata } from "next"
import { GroupLanding } from "../_components/group-landing/GroupLanding"

export const metadata: Metadata = {
    title: "GRUPA APPRA - kompleksowe wsparcie dla motoryzacji",
    description:
        "Grupa APPRA łączy rzeczoznawstwo, likwidację szkód, stację kontroli pojazdów, naprawy powypadkowe i nowoczesne rozwiązania dla motoryzacji.",
    alternates: {
        canonical: "https://appragrupa.pl",
    },
    openGraph: {
        title: "GRUPA APPRA",
        description:
            "Łączymy doświadczenie, wiedzę i nowoczesne rozwiązania, tworząc kompleksowe wsparcie dla motoryzacji.",
        url: "https://appragrupa.pl",
        siteName: "GRUPA APPRA",
        locale: "pl_PL",
        type: "website",
    },
}

export default function AppraGroupPage() {
    return <GroupLanding />
}
