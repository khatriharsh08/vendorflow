import { Link } from '@inertiajs/react';

export default function PageHeader({ title, subtitle, backLink = null, actions = null }) {
    return (
        <header className="sticky top-0 z-40 h-[73px] bg-(--color-bg-primary)/90 backdrop-blur-xl border-b border-(--color-border-primary) px-8 flex items-center">
            <div className="w-full flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {backLink && (
                        <Link
                            href={backLink}
                            className="text-(--color-text-tertiary) hover:text-(--color-text-primary) font-medium text-sm transition-colors"
                        >
                            ← Back
                        </Link>
                    )}
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-bold text-(--color-text-primary) tracking-tight">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="text-(--color-text-tertiary) text-sm mt-1">{subtitle}</p>
                        )}
                    </div>
                </div>
                {actions && <div className="flex items-center gap-3">{actions}</div>}
            </div>
        </header>
    );
}
