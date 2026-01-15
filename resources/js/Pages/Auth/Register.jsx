import { Link, useForm } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { Logo } from '@/Components';

export default function Register() {
    const form = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'vendor',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        form.post('/register');
    };

    return (
        <>
            <Head title="Register - VendorFlow" />
            <div className="min-h-screen flex">
                {/* Left Panel - Branding */}
                <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 relative overflow-hidden">
                    {/* Background circles */}
                    <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-0 w-72 h-72 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3"></div>
                    
                    <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
                        {/* Logo */}
                        <Link 
                            href="/" 
                            className="inline-flex items-center gap-3 p-3 rounded-xl"
                            style={{ background: 'linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,0.9) 27%, rgba(255,255,255,0) 100%)' }}
                        >
                            <Logo size="2xl" light={false} />
                        </Link>

                        {/* Content */}
                        <div className="space-y-6">
                            <h1 className="text-4xl font-bold leading-tight">
                                Join thousands of businesses
                            </h1>
                            <p className="text-indigo-100 text-lg leading-relaxed max-w-md">
                                Create your account and start managing vendors efficiently. 
                                Free to get started, upgrade anytime.
                            </p>
                            
                            {/* Benefits */}
                            <div className="space-y-4 pt-6">
                                {[
                                    'Automated document verification',
                                    'Real-time compliance tracking',
                                    'Multi-level payment approvals',
                                    'Performance analytics dashboard'
                                ].map((benefit, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-indigo-100">{benefit}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="text-indigo-200 text-sm">
                            © 2026 VendorFlow. All rights reserved.
                        </div>
                    </div>
                </div>

                {/* Right Panel - Form */}
                <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
                    <div className="w-full max-w-md">
                        {/* Mobile logo */}
                        <div className="lg:hidden flex justify-center mb-8">
                            <Logo size="lg" />
                        </div>

                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
                            <p className="text-gray-500 mt-2">Start managing vendors in minutes</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors bg-white"
                                    placeholder="John Doe"
                                    required
                                />
                                {form.errors.name && <p className="mt-1 text-sm text-red-600">{form.errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={form.data.email}
                                    onChange={(e) => form.setData('email', e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors bg-white"
                                    placeholder="you@company.com"
                                    required
                                />
                                {form.errors.email && <p className="mt-1 text-sm text-red-600">{form.errors.email}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                                <input
                                    type="password"
                                    value={form.data.password}
                                    onChange={(e) => form.setData('password', e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors bg-white"
                                    placeholder="Min 8 characters"
                                    required
                                />
                                {form.errors.password && <p className="mt-1 text-sm text-red-600">{form.errors.password}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                                <input
                                    type="password"
                                    value={form.data.password_confirmation}
                                    onChange={(e) => form.setData('password_confirmation', e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors bg-white"
                                    placeholder="Repeat password"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={form.processing}
                                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                            >
                                {form.processing ? 'Creating Account...' : 'Create Account'}
                            </button>
                        </form>

                        <p className="mt-6 text-center text-gray-500">
                            Already have an account?{' '}
                            <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
                                Sign in
                            </Link>
                        </p>

                        <p className="mt-6 text-center text-xs text-gray-400">
                            By creating an account, you agree to our{' '}
                            <Link href="/terms" className="text-gray-500 hover:text-gray-700">Terms</Link>
                            {' '}and{' '}
                            <Link href="/privacy" className="text-gray-500 hover:text-gray-700">Privacy Policy</Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
