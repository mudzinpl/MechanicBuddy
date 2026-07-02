function classNames(...classes: Array<string | undefined>) {
    return classes.filter(Boolean).join(" ")
}

export function AppraLogo({ className }: { className?: string }) {
    return (
        <span
            className={classNames(
                "inline-flex items-center",
                className,
            )}
        >
            {/* TODO: podmienić logo na wersję jasną/SVG z transparentnym tłem. */}
            <img
                src="/appra-logo.png"
                alt="GRUPA APPRA"
                className="block h-auto max-h-16 w-auto max-w-[190px] select-none object-contain"
            />
        </span>
    )
}
