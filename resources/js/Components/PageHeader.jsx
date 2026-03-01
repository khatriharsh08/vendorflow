import { Link } from '@inertiajs/react';
import AppIcon from './AppIcon';
import ThemeSwitcher from './ThemeSwitcher';

export default function PageHeader({ title, subtitle, backLink = null, actions = null }) {
    return (
        <header className="sticky top-0 z-40 min-h-[73px] bg-(--color-bg-primary)/85 backdrop-blur-xl border-b border-(--color-border-primary) px-4 sm:px-6 md:px-8 py-3">
            <div className="w-full flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-4">
                    {backLink && (
                        <Link
                            href={backLink}
                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-(--color-text-tertiary) hover:text-(--color-text-primary) hover:bg-(--color-bg-hover) transition-colors"
                        >
                            <AppIcon name="chevron-down" className="h-4 w-4 -rotate-90" />
                            Back
                        </Link>
                    )}
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-(--color-text-primary) tracking-tight">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="text-(--color-text-tertiary) text-sm mt-1">{subtitle}</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap md:justify-end">
                    <ThemeSwitcher compact />
                    {actions && <div className="flex items-center gap-2">{actions}</div>}
                </div>
            </div>
        </header>
    );
}
