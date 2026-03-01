import { Link } from '@inertiajs/react';
import { useState } from 'react';

/**
 * Reusable Logo component for VendorFlow
 * Shows image if available, falls back to text if image fails to load
 * @param {Object} props
 * @param {string} [props.size='md'] - Size: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
 * @param {boolean} [props.light=false] - Light variant for dark backgrounds
 * @param {boolean} [props.linkToHome=true] - Wrap in link to home
 * @param {string} [props.className] - Additional classes
 */
export default function Logo({ size = 'md', light = false, linkToHome = true, className = '' }) {
    const [imageError, setImageError] = useState(false);

    const sizes = {
        sm: 'h-6',
        md: 'h-8',
        lg: 'h-10',
        xl: 'h-12',
        '2xl': 'h-16',
    };

    const textSizes = {
        sm: 'text-lg',
        md: 'text-xl',
        lg: 'text-2xl',
        xl: 'text-3xl',
        '2xl': 'text-4xl',
    };

    const content = (
        <div className={`flex items-center gap-3 ${className}`}>
            {!imageError ? (
                <img
                    src="/images/logo.png"
                    alt="VendorFlow"
                    className={sizes[size] || sizes.md}
                    onError={() => setImageError(true)}
                />
            ) : (
                <span
                    className={`font-bold ${textSizes[size] || textSizes.md} ${light ? 'text-(--color-text-primary)' : 'text-white'}`}
                >
                    VendorFlow
                </span>
            )}
        </div>
    );

    if (linkToHome) {
        return (
            <Link href="/" className="inline-flex">
                {content}
            </Link>
        );
    }

    return content;
}
