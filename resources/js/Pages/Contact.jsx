import { useForm } from '@inertiajs/react';
import AppIcon from '@/Components/AppIcon';
import GuestLayout from '@/Components/GuestLayout';

const contactCards = [
    {
        title: 'Email',
        value: 'support@vendorflow.com',
        detail: 'Response within one business day',
        icon: 'messages',
    },
    {
        title: 'Phone',
        value: '+91 98765 43210',
        detail: 'Mon-Fri, 9:00 AM to 6:00 PM IST',
        icon: 'profile',
    },
    {
        title: 'Office',
        value: 'Bangalore, India',
        detail: 'Tech corridor, central operations hub',
        icon: 'system',
    },
];

export default function Contact() {
    const form = useForm({
        name: '',
        email: '',
        subject: '',
        message: '',
    });

    const handleSubmit = (event) => {
        event.preventDefault();
        form.post('/contact', {
            onSuccess: () => form.reset(),
        });
    };

    return (
        <GuestLayout title="Contact - VendorFlow">
            <section className="py-16 lg:py-24">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-10">
                        <div className="space-y-8 animate-fade-in">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full border border-(--color-border-primary) bg-(--color-bg-primary)/80 px-4 py-2 text-sm text-(--color-text-secondary)">
                                    <AppIcon name="messages" className="h-4 w-4" />
                                    <span>Contact VendorFlow</span>
                                </div>
                                <h1 className="mt-6 text-4xl lg:text-5xl font-bold text-(--color-text-primary)">
                                    Let us help you simplify vendor operations
                                </h1>
                                <p className="mt-4 text-lg text-(--color-text-tertiary)">
                                    Ask product questions, request a walkthrough, or share your
                                    requirements. We will get back quickly.
                                </p>
                            </div>

                            <div className="space-y-4">
                                {contactCards.map((card) => (
                                    <article key={card.title} className="surface-panel p-5">
                                        <div className="flex items-start gap-3">
                                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-(--color-bg-tertiary) text-(--color-brand-primary)">
                                                <AppIcon name={card.icon} className="h-5 w-5" />
                                            </span>
                                            <div>
                                                <h2 className="text-sm font-semibold text-(--color-text-primary)">
                                                    {card.title}
                                                </h2>
                                                <p className="text-base font-medium text-(--color-text-secondary)">
                                                    {card.value}
                                                </p>
                                                <p className="text-sm text-(--color-text-tertiary)">
                                                    {card.detail}
                                                </p>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>

                        <div className="surface-panel p-6 lg:p-8 animate-scale-in">
                            <h2 className="text-2xl font-bold text-(--color-text-primary)">
                                Send a message
                            </h2>
                            <p className="mt-2 text-sm text-(--color-text-tertiary)">
                                Fields marked here are required.
                            </p>

                            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-(--color-text-secondary)">
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            value={form.data.name}
                                            onChange={(event) =>
                                                form.setData('name', event.target.value)
                                            }
                                            className="input-field"
                                            placeholder="Your name"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-(--color-text-secondary)">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={form.data.email}
                                            onChange={(event) =>
                                                form.setData('email', event.target.value)
                                            }
                                            className="input-field"
                                            placeholder="you@company.com"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-(--color-text-secondary)">
                                        Subject
                                    </label>
                                    <input
                                        type="text"
                                        value={form.data.subject}
                                        onChange={(event) =>
                                            form.setData('subject', event.target.value)
                                        }
                                        className="input-field"
                                        placeholder="What do you need help with?"
                                        required
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-(--color-text-secondary)">
                                        Message
                                    </label>
                                    <textarea
                                        value={form.data.message}
                                        onChange={(event) =>
                                            form.setData('message', event.target.value)
                                        }
                                        rows={5}
                                        className="input-field resize-y"
                                        placeholder="Share your requirements"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="btn-primary w-full justify-center"
                                >
                                    {form.processing ? 'Sending...' : 'Send Message'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </GuestLayout>
    );
}
