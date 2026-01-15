import './bootstrap';
import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { lazy, Suspense } from 'react';

// Loading component for lazy-loaded pages - Light theme
const PageLoader = () => (
    <div className="min-h-screen bg-[var(--gradient-page)] flex items-center justify-center">
        <div className="text-center">
            <div className="w-12 h-12 border-2 border-[var(--color-brand-primary)]/30 border-t-[var(--color-brand-primary)] rounded-full animate-spin mx-auto mb-4" />
            <span className="text-[var(--color-text-tertiary)]">Loading...</span>
        </div>
    </div>
);

// Page resolver with lazy loading for admin pages
const resolvePageComponent = (name) => {
    const pages = import.meta.glob('./Pages/**/*.jsx');
    const pagePath = `./Pages/${name}.jsx`;
    
    if (!pages[pagePath]) {
        throw new Error(`Page not found: ${name}`);
    }
    
    return pages[pagePath]();
};

createInertiaApp({
    title: (title) => title ? `${title} - VendorFlow` : 'VendorFlow',
    resolve: (name) => resolvePageComponent(name),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(
            <Suspense fallback={<PageLoader />}>
                <App {...props} />
            </Suspense>
        );
    },
    progress: {
        color: '#6366f1',
        showSpinner: true,
    },
});
