import './bootstrap';
import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { Suspense, Component, useEffect } from 'react';

// Loading component for lazy-loaded pages - Light theme
const PageLoader = () => (
    <div className="min-h-screen bg-(--gradient-page) flex items-center justify-center">
        <div className="text-center">
            <div className="w-12 h-12 border-2 border-(--color-brand-primary)/30 border-t-(--color-brand-primary) rounded-full animate-spin mx-auto mb-4" />
            <span className="text-(--color-text-tertiary)">Loading...</span>
        </div>
    </div>
);

// Helper to remove the initial HTML loader
function AppWrapper({ children }) {
    useEffect(() => {
        const loader = document.getElementById('page-loader');
        if (loader) {
            loader.classList.add('fade-out');
            setTimeout(() => {
                loader.remove();
            }, 500); // Match CSS transition duration
        }
    }, []);
    return children;
}

// Error Boundary to catch React errors gracefully
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('React Error Boundary caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-(--gradient-page) flex items-center justify-center p-6">
                    <div className="max-w-md w-full text-center">
                        <div className="mb-6 flex justify-center">
                            <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                                <svg
                                    className="w-16 h-16"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-(--color-text-primary) mb-3">
                            Something went wrong
                        </h1>
                        <p className="text-(--color-text-tertiary) mb-8">
                            An unexpected error occurred. Please try refreshing the page.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-3 rounded-xl bg-(--color-brand-primary) text-white font-medium hover:opacity-90 transition-opacity"
                            >
                                Refresh Page
                            </button>
                            <a
                                href="/dashboard"
                                className="px-6 py-3 rounded-xl border border-(--color-border-primary) text-(--color-text-secondary) font-medium hover:bg-(--color-bg-tertiary) transition-colors"
                            >
                                Go to Dashboard
                            </a>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// Page resolver with lazy loading for admin pages
const resolvePageComponent = (name) => {
    const pages = import.meta.glob('./Pages/**/*.jsx');
    const pagePath = `./Pages/${name}.jsx`;

    if (!pages[pagePath]) {
        // Return the Error page for missing pages instead of throwing
        return pages['./Pages/Error.jsx']().then((module) => {
            return { default: (props) => <module.default {...props} status={404} /> };
        });
    }

    return pages[pagePath]();
};

createInertiaApp({
    title: (title) => (title ? `${title} - VendorFlow` : 'VendorFlow'),
    resolve: (name) => resolvePageComponent(name),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(
            <ErrorBoundary>
                <Suspense fallback={<PageLoader />}>
                    <AppWrapper>
                        <App {...props} />
                    </AppWrapper>
                </Suspense>
            </ErrorBoundary>
        );
    },
    progress: {
        color: '#6366f1',
        showSpinner: true,
    },
});
