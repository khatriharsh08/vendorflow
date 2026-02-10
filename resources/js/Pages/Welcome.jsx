import { Link, usePage } from '@inertiajs/react';
import { GuestLayout } from '@/Components';

export default function Welcome() {
    const { auth } = usePage().props;

    return (
        <GuestLayout title="VendorFlow - Vendor Management Platform">
            {/* Hero - Asymmetric Layout */}
            <section className="min-h-[85vh] flex items-center relative overflow-hidden">
                {/* Subtle grid pattern */}
                <div
                    className="absolute inset-0 opacity-[0.02] pointer-events-none"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                />

                <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* Left content */}
                        <div className="space-y-8">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                <span className="text-sm font-medium text-indigo-700">
                                    Trusted by 500+ businesses
                                </span>
                            </div>

                            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                                Manage vendors
                                <span className="block text-indigo-600">without the chaos</span>
                            </h1>

                            <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
                                From onboarding to payments, VendorFlow handles the entire vendor
                                lifecycle. No spreadsheets, no missed deadlines, no compliance gaps.
                            </p>

                            <div className="flex flex-wrap gap-4">
                                {auth?.user ? (
                                    <Link
                                        href="/dashboard"
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-indigo-200"
                                    >
                                        Open Dashboard
                                        <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M17 8l4 4m0 0l-4 4m4-4H3"
                                            />
                                        </svg>
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href="/register"
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-indigo-200"
                                        >
                                            Start for Free
                                            <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                                                />
                                            </svg>
                                        </Link>
                                        <Link
                                            href="/login"
                                            className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Sign in
                                        </Link>
                                    </>
                                )}
                            </div>

                            {/* Trust badges */}
                            <div className="pt-8 border-t border-gray-200">
                                <p className="text-sm text-gray-500 mb-4">
                                    Built with enterprise-grade security
                                </p>
                                <div className="flex items-center gap-6 text-gray-400">
                                    <div className="flex items-center gap-2">
                                        <svg
                                            className="w-5 h-5"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <span className="text-sm">SOC 2</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <svg
                                            className="w-5 h-5"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <span className="text-sm">256-bit SSL</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <svg
                                            className="w-5 h-5"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                            <path
                                                fillRule="evenodd"
                                                d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <span className="text-sm">GDPR Ready</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right - Visual */}
                        <div className="hidden lg:block relative">
                            <div className="absolute -top-8 -right-8 w-72 h-72 bg-indigo-100 rounded-full opacity-60 blur-3xl"></div>
                            <div className="absolute -bottom-8 -left-8 w-56 h-56 bg-purple-100 rounded-full opacity-60 blur-3xl"></div>

                            {/* Dashboard preview cards */}
                            <div className="relative space-y-4">
                                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 transform rotate-1 hover:rotate-0 transition-transform">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-sm font-medium text-gray-500">
                                            Vendor Approval
                                        </span>
                                        <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
                                            Pending
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white font-bold">
                                            T
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                TechSupply Corp
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                GST Verified • 3 documents
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 transform -rotate-1 hover:rotate-0 transition-transform ml-8">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-sm font-medium text-gray-500">
                                            Payment Request
                                        </span>
                                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                                            Approved
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-2xl font-bold text-gray-900">
                                            ₹2,45,000
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            Invoice #INV-2024-089
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 transform rotate-2 hover:rotate-0 transition-transform">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">
                                                Compliance Score
                                            </span>
                                            <p className="text-3xl font-bold text-gray-900">94%</p>
                                        </div>
                                        <div className="w-16 h-16 rounded-full border-4 border-green-500 flex items-center justify-center">
                                            <svg
                                                className="w-8 h-8 text-green-500"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            How VendorFlow works
                        </h2>
                        <p className="text-gray-600 max-w-xl mx-auto">
                            Three simple steps to transform your vendor operations
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 relative">
                        <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-indigo-200 via-indigo-400 to-indigo-200"></div>

                        {[
                            {
                                step: '01',
                                title: 'Onboard Vendors',
                                desc: 'Vendors self-register with required documents. Automated validation saves you hours.',
                            },
                            {
                                step: '02',
                                title: 'Track Everything',
                                desc: 'Documents, compliance, performance — all tracked automatically with smart alerts.',
                            },
                            {
                                step: '03',
                                title: 'Pay Seamlessly',
                                desc: 'Multi-level approval workflows ensure every payment is verified and audit-ready.',
                            },
                        ].map((item, idx) => (
                            <div
                                key={idx}
                                className="relative bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow"
                            >
                                <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center mb-6 text-sm">
                                    {item.step}
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                    {item.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features - Bento grid */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Everything in one place
                        </h2>
                        <p className="text-gray-600">
                            The tools you need to manage vendors efficiently
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Large feature */}
                        <div className="md:col-span-2 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-3xl p-8 text-white">
                            <div className="max-w-lg">
                                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-6">
                                    <svg
                                        className="w-6 h-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold mb-3">Real-time Analytics</h3>
                                <p className="text-indigo-100 leading-relaxed">
                                    Get instant visibility into vendor performance, compliance
                                    status, and payment trends. Make data-driven decisions with
                                    comprehensive dashboards.
                                </p>
                            </div>
                        </div>

                        {/* Regular features */}
                        {[
                            {
                                title: 'Document Vault',
                                desc: 'Secure storage with automatic expiry tracking',
                                icon: '📁',
                            },
                            {
                                title: 'Compliance Rules',
                                desc: 'Define custom rules for your business',
                                icon: '✓',
                            },
                            {
                                title: 'Payment Approvals',
                                desc: 'Multi-level workflow with audit trail',
                                icon: '💳',
                            },
                            {
                                title: 'Performance Scores',
                                desc: 'Rate and rank your vendors objectively',
                                icon: '⭐',
                            },
                        ].map((f, i) => (
                            <div
                                key={i}
                                className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all group"
                            >
                                <span className="text-3xl block mb-4 group-hover:scale-110 transition-transform">
                                    {f.icon}
                                </span>
                                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                                <p className="text-sm text-gray-600">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 bg-gray-900">
                <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                        Ready to simplify vendor management?
                    </h2>
                    <p className="text-gray-400 mb-8 text-lg">
                        Join hundreds of businesses that trust VendorFlow for their operations.
                    </p>
                    {!auth?.user && (
                        <Link
                            href="/register"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
                        >
                            Get Started — It's Free
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                                />
                            </svg>
                        </Link>
                    )}
                </div>
            </section>
        </GuestLayout>
    );
}
