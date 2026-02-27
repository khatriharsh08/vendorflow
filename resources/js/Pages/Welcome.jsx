import { Link, usePage } from '@inertiajs/react';
import AppIcon from '@/Components/AppIcon';
import GuestLayout from '@/Components/GuestLayout';

const featureCards = [
    {
        title: 'Vendor Onboarding',
        description: 'Collect profiles and documents with guided steps.',
        icon: 'onboarding',
    },
    {
        title: 'Document Tracking',
        description: 'Watch expiry dates and verification status in real time.',
        icon: 'documents',
    },
    {
        title: 'Compliance Checks',
        description: 'Run policy rules and keep every vendor audit ready.',
        icon: 'compliance',
    },
    {
        title: 'Payment Flow',
        description: 'Route approvals from request to paid with full visibility.',
        icon: 'payments',
    },
    {
        title: 'Performance Metrics',
        description: 'Score vendor performance and spot risks early.',
        icon: 'metrics',
    },
    {
        title: 'Operational Reports',
        description: 'Export clear summaries for finance and operations teams.',
        icon: 'reports',
    },
];

export default function Welcome() {
    const { auth } = usePage().props;

    return (
        <GuestLayout title="VendorFlow - Clean Vendor Operations">
            <section className="relative py-16 lg:py-24">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-10 items-center">
                        <div className="space-y-7 animate-fade-in">
                            <div className="inline-flex items-center gap-2 rounded-full border border-(--color-border-primary) bg-(--color-bg-primary)/80 px-4 py-2 text-sm text-(--color-text-secondary)">
                                <span className="inline-flex h-2 w-2 rounded-full bg-(--color-success)" />
                                <span>Built for vendor, ops, and finance teams</span>
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-(--color-text-primary)">
                                Vendor operations
                                <span className="block text-gradient">without clutter</span>
                            </h1>

                            <p className="max-w-xl text-lg text-(--color-text-tertiary)">
                                Manage onboarding, compliance, and payment approvals from one
                                unified workspace with cleaner workflows and faster decisions.
                            </p>

                            <div className="flex flex-wrap gap-3">
                                {auth?.user ? (
                                    <Link href="/dashboard" className="btn-primary">
                                        Open Dashboard
                                        <AppIcon name="trend" className="h-4 w-4" />
                                    </Link>
                                ) : (
                                    <>
                                        <Link href="/register" className="btn-primary">
                                            Get Started
                                            <AppIcon name="trend" className="h-4 w-4" />
                                        </Link>
                                        <Link href="/login" className="btn-secondary">
                                            Sign In
                                        </Link>
                                    </>
                                )}
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3">
                                <div className="surface-panel p-4">
                                    <p className="text-xs uppercase tracking-wide text-(--color-text-muted)">
                                        Active Vendors
                                    </p>
                                    <p className="text-2xl font-bold text-(--color-text-primary)">
                                        500+
                                    </p>
                                </div>
                                <div className="surface-panel p-4">
                                    <p className="text-xs uppercase tracking-wide text-(--color-text-muted)">
                                        Documents
                                    </p>
                                    <p className="text-2xl font-bold text-(--color-text-primary)">
                                        50K+
                                    </p>
                                </div>
                                <div className="surface-panel p-4 col-span-2 sm:col-span-1">
                                    <p className="text-xs uppercase tracking-wide text-(--color-text-muted)">
                                        Payment Value
                                    </p>
                                    <p className="text-2xl font-bold text-(--color-text-primary)">
                                        INR 12Cr+
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 animate-scale-in">
                            <div className="surface-panel p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-semibold text-(--color-text-primary)">
                                        Today Snapshot
                                    </h3>
                                    <span className="text-xs text-(--color-text-tertiary)">
                                        Live
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between rounded-xl bg-(--color-bg-secondary) px-3 py-2">
                                        <span className="text-sm text-(--color-text-secondary)">
                                            Vendor Submissions
                                        </span>
                                        <span className="text-sm font-semibold text-(--color-text-primary)">
                                            14
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-xl bg-(--color-bg-secondary) px-3 py-2">
                                        <span className="text-sm text-(--color-text-secondary)">
                                            Documents Pending
                                        </span>
                                        <span className="text-sm font-semibold text-(--color-text-primary)">
                                            28
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-xl bg-(--color-bg-secondary) px-3 py-2">
                                        <span className="text-sm text-(--color-text-secondary)">
                                            Payments Awaiting
                                        </span>
                                        <span className="text-sm font-semibold text-(--color-text-primary)">
                                            9
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="surface-panel p-5">
                                <h3 className="text-sm font-semibold text-(--color-text-primary) mb-3">
                                    Team Confidence
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <div className="flex justify-between text-xs text-(--color-text-tertiary) mb-1">
                                            <span>Compliance coverage</span>
                                            <span>94%</span>
                                        </div>
                                        <div className="h-2 rounded-full bg-(--color-bg-tertiary)">
                                            <div
                                                className="h-2 rounded-full"
                                                style={{
                                                    width: '94%',
                                                    background: 'var(--gradient-primary)',
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs text-(--color-text-tertiary) mb-1">
                                            <span>Payment turnaround</span>
                                            <span>88%</span>
                                        </div>
                                        <div className="h-2 rounded-full bg-(--color-bg-tertiary)">
                                            <div
                                                className="h-2 rounded-full"
                                                style={{
                                                    width: '88%',
                                                    background: 'var(--gradient-success)',
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-14 lg:py-18">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="mb-10">
                        <h2 className="text-3xl font-bold text-(--color-text-primary)">
                            Focused tools, no extra noise
                        </h2>
                        <p className="mt-2 text-(--color-text-tertiary)">
                            Every module is designed to keep the workflow clear.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {featureCards.map((feature) => (
                            <article key={feature.title} className="surface-panel p-5">
                                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-(--color-bg-tertiary) text-(--color-brand-primary)">
                                    <AppIcon name={feature.icon} className="h-5 w-5" />
                                </div>
                                <h3 className="mt-4 text-lg font-semibold text-(--color-text-primary)">
                                    {feature.title}
                                </h3>
                                <p className="mt-2 text-sm text-(--color-text-tertiary)">
                                    {feature.description}
                                </p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="pb-20 pt-6">
                <div className="max-w-4xl mx-auto px-6 lg:px-8">
                    <div className="surface-panel p-8 lg:p-10 text-center">
                        <h2 className="text-3xl font-bold text-(--color-text-primary)">
                            Ready to clean up your vendor workflow?
                        </h2>
                        <p className="mt-3 text-(--color-text-tertiary)">
                            Start with a lightweight setup and scale as your operations grow.
                        </p>
                        <div className="mt-6 flex flex-wrap justify-center gap-3">
                            {!auth?.user ? (
                                <>
                                    <Link href="/register" className="btn-primary">
                                        Start Free
                                    </Link>
                                    <Link href="/contact" className="btn-secondary">
                                        Talk to Team
                                    </Link>
                                </>
                            ) : (
                                <Link href="/dashboard" className="btn-primary">
                                    Continue to Dashboard
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </GuestLayout>
    );
}
