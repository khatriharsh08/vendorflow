import { useForm } from '@inertiajs/react';
import { GuestLayout } from '@/Components';

export default function Contact() {
    const form = useForm({
        name: '',
        email: '',
        subject: '',
        message: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        form.post('/contact', {
            onSuccess: () => {
                form.reset();
            }
        });
    };

    return (
        <GuestLayout title="Contact Us - VendorFlow">
            <div className="relative min-h-screen bg-gray-50/50">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-purple-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

                <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-24">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* Left Side: Info */}
                        <div className="max-w-xl">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 mb-8">
                                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                                <span className="text-sm font-medium text-indigo-700">We're here to help</span>
                            </div>

                            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 tracking-tight mb-6">
                                Let's start the<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">conversation</span>
                            </h1>
                            
                            <p className="text-lg text-gray-600 mb-12 leading-relaxed">
                                Have questions about our platform? Need a custom quote? 
                                Or just want to say hello? We'd love to hear from you.
                            </p>

                            <div className="space-y-8">
                                {[
                                    { title: 'Email Us', info: 'support@vendorflow.com', desc: 'We usually reply within 24 hours', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
                                    { title: 'Call Us', info: '+91 98765 43210', desc: 'Mon-Fri, 9am - 6pm IST', icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' },
                                    { title: 'Visit Us', info: 'Bangalore, India', desc: '123 Business Park, Tech City', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex gap-5">
                                        <div className="w-12 h-12 rounded-xl bg-white shadow-md border border-gray-100 flex items-center justify-center text-indigo-600 shrink-0">
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{item.title}</h3>
                                            <p className="text-indigo-600 font-medium">{item.info}</p>
                                            <p className="text-sm text-gray-500 mt-0.5">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Side: Form Card */}
                        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 lg:p-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-8">Send us a message</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 ml-1">Your Name</label>
                                        <input
                                            type="text"
                                            value={form.data.name}
                                            onChange={(e) => form.setData('name', e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all bg-gray-50 focus:bg-white"
                                            placeholder="John Doe"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 ml-1">Email Address</label>
                                        <input
                                            type="email"
                                            value={form.data.email}
                                            onChange={(e) => form.setData('email', e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all bg-gray-50 focus:bg-white"
                                            placeholder="you@company.com"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">Subject</label>
                                    <input
                                        type="text"
                                        value={form.data.subject}
                                        onChange={(e) => form.setData('subject', e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all bg-gray-50 focus:bg-white"
                                        placeholder="How can we help?"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">Message</label>
                                    <textarea
                                        value={form.data.message}
                                        onChange={(e) => form.setData('message', e.target.value)}
                                        rows={4}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all bg-gray-50 focus:bg-white resize-none"
                                        placeholder="Tell us about your project..."
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-200 transform active:scale-[0.98] disabled:opacity-70"
                                >
                                    {form.processing ? 'Sending...' : 'Send Message'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
