import { Link, usePage } from '@inertiajs/react';

export default function Error({ status }) {
    const { props } = usePage();
    const statusCode = status || props.status || 404;

    const errors = {
        403: {
            title: 'Access Denied',
            description: "You don't have permission to access this page.",
            icon: (
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                    />
                </svg>
            ),
        },
        404: {
            title: 'Page Not Found',
            description: "The page you're looking for doesn't exist or has been moved.",
            icon: (
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
            ),
        },
        500: {
            title: 'Server Error',
            description: 'Something went wrong on our end. Please try again later.',
            icon: (
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                </svg>
            ),
        },
        503: {
            title: 'Service Unavailable',
            description: "We're temporarily offline for maintenance. Please check back soon.",
            icon: (
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                </svg>
            ),
        },
    };

    const { title, description, icon } = errors[statusCode] || errors[404];

    return (
        <div className="min-h-screen bg-(--gradient-page) flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center">
                {/* Error Icon */}
                <div className="mb-6 flex justify-center">
                    <div className="w-24 h-24 rounded-full bg-(--color-danger)/10 flex items-center justify-center text-(--color-danger)">
                        {icon}
                    </div>
                </div>

                {/* Status Code */}
                <div className="mb-4">
                    <span className="text-7xl font-bold bg-gradient-to-r from-(--color-brand-primary) to-(--color-brand-secondary) bg-clip-text text-transparent">
                        {statusCode}
                    </span>
                </div>

                {/* Title & Description */}
                <h1 className="text-2xl font-bold text-(--color-text-primary) mb-3">{title}</h1>
                <p className="text-(--color-text-tertiary) mb-8">{description}</p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={() => window.history.back()}
                        className="px-6 py-3 rounded-xl border border-(--color-border-primary) text-(--color-text-secondary) font-medium hover:bg-(--color-bg-tertiary) transition-colors"
                    >
                        ← Go Back
                    </button>
                    <Link
                        href="/dashboard"
                        className="px-6 py-3 rounded-xl bg-(--color-brand-primary) text-white font-medium hover:opacity-90 transition-opacity"
                    >
                        Go to Dashboard
                    </Link>
                </div>

                {/* Home Link */}
                <div className="mt-6">
                    <Link href="/" className="text-sm text-(--color-brand-primary) hover:underline">
                        Or return to homepage
                    </Link>
                </div>
            </div>
        </div>
    );
}
