import { useEffect, useRef, useState } from 'react';
import AppIcon from './AppIcon';

const STORAGE_KEY = 'vendorflow-theme';
const DEFAULT_THEME = 'aurora';

const THEME_OPTIONS = [
    {
        id: 'aurora',
        label: 'Aurora',
        description: 'Balanced teal',
        icon: 'sparkles',
    },
    {
        id: 'ocean',
        label: 'Ocean',
        description: 'Cool blue tones',
        icon: 'wave',
    },
    {
        id: 'sunset',
        label: 'Sunset',
        description: 'Warm contrast',
        icon: 'sun',
    },
    {
        id: 'midnight',
        label: 'Midnight',
        description: 'Dark workspace',
        icon: 'moon',
    },
];

function applyTheme(theme) {
    const root = document.documentElement;

    root.dataset.theme = theme;

    if (theme === 'midnight') {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
}

function getInitialTheme() {
    if (typeof window === 'undefined') {
        return DEFAULT_THEME;
    }

    return (
        window.localStorage.getItem(STORAGE_KEY) ||
        document.documentElement.dataset.theme ||
        DEFAULT_THEME
    );
}

export default function ThemeSwitcher({ className = '', compact = false, align = 'right' }) {
    const [isOpen, setIsOpen] = useState(false);
    const [theme, setTheme] = useState(() => getInitialTheme());
    const ref = useRef(null);

    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    useEffect(() => {
        const onClick = (event) => {
            if (!ref.current?.contains(event.target)) {
                setIsOpen(false);
            }
        };

        const onKeyDown = (event) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        window.addEventListener('mousedown', onClick);
        window.addEventListener('keydown', onKeyDown);

        return () => {
            window.removeEventListener('mousedown', onClick);
            window.removeEventListener('keydown', onKeyDown);
        };
    }, []);

    const currentOption = THEME_OPTIONS.find((option) => option.id === theme) || THEME_OPTIONS[0];

    const handleSelect = (nextTheme) => {
        setTheme(nextTheme);
        applyTheme(nextTheme);
        window.localStorage.setItem(STORAGE_KEY, nextTheme);
        setIsOpen(false);
    };

    const alignClass = {
        left: 'left-0',
        right: 'right-0',
    };

    return (
        <div ref={ref} className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className={`inline-flex items-center gap-2 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary)/85 text-(--color-text-secondary) hover:text-(--color-text-primary) hover:border-(--color-border-hover) transition-colors ${
                    compact ? 'px-2.5 py-2 text-xs' : 'px-3 py-2 text-sm'
                }`}
                aria-haspopup="menu"
                aria-expanded={isOpen}
                aria-label="Theme options"
            >
                <AppIcon name={currentOption.icon} className={compact ? 'h-4 w-4' : 'h-4 w-4'} />
                {!compact && <span>{currentOption.label}</span>}
                <AppIcon name="chevron-down" className="h-4 w-4" />
            </button>

            {isOpen && (
                <div
                    className={`absolute ${alignClass[align] || alignClass.right} mt-2 w-52 rounded-2xl border border-(--color-border-primary) bg-(--color-bg-primary)/96 backdrop-blur-xl shadow-token-lg p-2 z-50`}
                    role="menu"
                >
                    {THEME_OPTIONS.map((option) => {
                        const isActive = option.id === theme;

                        return (
                            <button
                                key={option.id}
                                type="button"
                                onClick={() => handleSelect(option.id)}
                                className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-left transition-colors ${
                                    isActive
                                        ? 'bg-(--color-brand-primary-light) text-(--color-brand-primary)'
                                        : 'text-(--color-text-secondary) hover:bg-(--color-bg-secondary)'
                                }`}
                                role="menuitem"
                            >
                                <span className="flex items-center gap-2 min-w-0">
                                    <AppIcon name={option.icon} className="h-4 w-4 shrink-0" />
                                    <span className="min-w-0">
                                        <span className="block text-sm font-semibold">
                                            {option.label}
                                        </span>
                                        <span className="block text-xs opacity-80">
                                            {option.description}
                                        </span>
                                    </span>
                                </span>
                                {isActive && (
                                    <AppIcon name="success" className="h-4 w-4 shrink-0" />
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
