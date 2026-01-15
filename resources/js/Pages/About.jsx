import { Link } from '@inertiajs/react';
import { GuestLayout } from '@/Components';

export default function About() {
    return (
        <GuestLayout title="About Us - VendorFlow">
            <div className="relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }} />

                {/* Hero Section */}
                <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 mb-8">
                            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                            <span className="text-sm font-medium text-indigo-700">Our Mission</span>
                        </div>
                        
                        <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 tracking-tight mb-8">
                            Simplifying vendor<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">management for everyone</span>
                        </h1>
                        
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                            We're building the operating system for modern vendor relationships. 
                            Transparency, compliance, and speed — all in one place.
                        </p>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="py-12 border-y border-gray-100 bg-white/50 backdrop-blur-sm">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                            {[
                                { label: 'Active Vendors', value: '10k+' },
                                { label: 'Documents Processed', value: '500k+' },
                                { label: 'Transactions', value: '$2B+' },
                                { label: 'Happy Clients', value: '100+' },
                            ].map((stat, idx) => (
                                <div key={idx} className="space-y-2">
                                    <div className="text-3xl lg:text-4xl font-bold text-gray-900">{stat.value}</div>
                                    <div className="text-sm text-gray-500 font-medium uppercase tracking-wide">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Story & Values */}
                <section className="py-24 relative">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-16 items-start">
                            {/* Left: Sticky Story */}
                            <div className="lg:sticky lg:top-24 space-y-8">
                                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                                    From chaos to clarity
                                </h2>
                                <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                                    <p>
                                        VendorFlow was born out of frustration. After years of managing vendors using spreadsheets, 
                                        emails, and disconnected tools, we knew there had to be a better way.
                                    </p>
                                    <p>
                                        We built the platform we wished we had — one that brings everything together in a single, 
                                        intuitive interface. Today, we help businesses streamline operations, from onboarding to payments.
                                    </p>
                                    <p>
                                        Our goal is simple: to give you back the time you spend on manual processes so you can focus 
                                        on what matters most — growing your business.
                                    </p>
                                </div>
                            </div>

                            {/* Right: Values Cards */}
                            <div className="grid gap-6">
                                {[
                                    { title: 'Simplicity First', desc: 'Powerful features shouldn\'t mean complex interfaces. We design for clarity.', icon: '✨' },
                                    { title: 'Security Always', desc: 'Your vendor data is sensitive. We treat it with enterprise-grade protection.', icon: '🛡️' },
                                    { title: 'Automation Matters', desc: 'Manual work leads to errors. Smart automation leads to peace of mind.', icon: '⚙️' },
                                    { title: 'Support Counts', desc: 'Great software is backed by great people. We\'re here when you need us.', icon: '🤝' },
                                ].map((value, idx) => (
                                    <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-indigo-100 transition-all duration-300 group">
                                        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                            {value.icon}
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                                        <p className="text-gray-600 leading-relaxed">{value.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Built in India Badge */}
                <section className="py-24 bg-gray-50 border-t border-gray-200">
                    <div className="max-w-4xl mx-auto px-6 text-center">
                        <div className="inline-block p-6 rounded-2xl bg-white shadow-xl border border-gray-100 transform hover:-translate-y-1 transition-transform duration-300">
                            <span className="text-6xl mb-4 block">🇮🇳</span>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Built proudly in India</h2>
                            <p className="text-gray-600 max-w-lg mx-auto">
                                Designed specifically for the needs of Indian businesses. 
                                We understand GST compliance, local banking, and the unique challenges you face.
                            </p>
                        </div>
                        
                        <div className="mt-12">
                            <Link 
                                href="/register" 
                                className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl"
                            >
                                Start your journey
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </GuestLayout>
    );
}
