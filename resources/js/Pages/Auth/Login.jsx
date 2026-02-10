import { Link, useForm } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { Logo } from '@/Components';

export default function Login() {
    const form = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        form.post('/login');
    };

    return (
        <>
            <Head title="Login - VendorFlow" />
            <div className="min-h-screen flex">
                {/* Left Panel - Branding */}
                <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 relative overflow-hidden">
                    {/* Background pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <svg
                            className="w-full h-full"
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                        >
                            <defs>
                                <pattern
                                    id="grid"
                                    width="10"
                                    height="10"
                                    patternUnits="userSpaceOnUse"
                                >
                                    <path
                                        d="M 10 0 L 0 0 0 10"
                                        fill="none"
                                        stroke="white"
                                        strokeWidth="0.5"
                                    />
                                </pattern>
                            </defs>
                            <rect width="100" height="100" fill="url(#grid)" />
                        </svg>
                    </div>

                    <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
                        {/* Logo */}
                        <Link
                            href="/"
                            className="inline-flex items-center gap-3 p-3 rounded-xl"
                            style={{
                                background:
                                    'linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,0.9) 27%, rgba(255,255,255,0) 100%)',
                            }}
                        >
                            <Logo size="2xl" light={false} />
                        </Link>

                        {/* Content */}
                        <div className="space-y-6">
                            <h1 className="text-4xl font-bold leading-tight">
                                Manage your vendors with confidence
                            </h1>
                            <p className="text-indigo-100 text-lg leading-relaxed max-w-md">
                                Streamline onboarding, track compliance, and process payments — all
                                from one powerful platform.
                            </p>

                            {/* Stats */}
                            <div className="flex gap-8 pt-6">
                                <div>
                                    <div className="text-3xl font-bold">500+</div>
                                    <div className="text-indigo-200 text-sm">Active Vendors</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold">₹10Cr+</div>
                                    <div className="text-indigo-200 text-sm">Processed</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold">99.9%</div>
                                    <div className="text-indigo-200 text-sm">Uptime</div>
                                </div>
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
                            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
                            <p className="text-gray-500 mt-2">
                                Enter your credentials to access your account
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={form.data.email}
                                    onChange={(e) => form.setData('email', e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors bg-white"
                                    placeholder="you@company.com"
                                    required
                                />
                                {form.errors.email && (
                                    <p className="mt-1 text-sm text-red-600">{form.errors.email}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={form.data.password}
                                    onChange={(e) => form.setData('password', e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors bg-white"
                                    placeholder="••••••••"
                                    required
                                />
                                {form.errors.password && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {form.errors.password}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.data.remember}
                                        onChange={(e) => form.setData('remember', e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="text-sm text-gray-600">Remember me</span>
                                </label>
                                <Link
                                    href="/forgot-password"
                                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                disabled={form.processing}
                                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {form.processing ? 'Signing in...' : 'Sign in'}
                            </button>
                        </form>

                        <p className="mt-8 text-center text-gray-500">
                            Don't have an account?{' '}
                            <Link
                                href="/register"
                                className="text-indigo-600 hover:text-indigo-700 font-medium"
                            >
                                Create one
                            </Link>
                        </p>

                        {/* Demo credentials - subtle */}
                        <div className="mt-8 p-4 rounded-lg bg-white border border-gray-200">
                            <p className="text-xs font-medium text-gray-500 mb-2">Demo Accounts</p>
                            <div className="grid gap-1 text-xs text-gray-400">
                                <div>Admin: admin@vendorflow.com / password</div>
                                <div>Ops: ops@vendorflow.com / password</div>
                                <div>Finance: finance@vendorflow.com / password</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
