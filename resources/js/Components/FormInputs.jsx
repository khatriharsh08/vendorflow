import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import AppIcon from './AppIcon';

export function FormInput({
    label,
    type = 'text',
    value,
    onChange,
    error = null,
    placeholder = '',
    required = false,
    disabled = false,
    icon = null,
    className = '',
}) {
    return (
        <div className={className}>
            {label && (
                <label className="text-sm font-semibold text-(--color-text-primary) mb-2 block">
                    {label} {required && <span className="text-(--color-danger)">*</span>}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-text-tertiary)">
                        {typeof icon === 'string' ? (
                            <AppIcon
                                name={icon}
                                className="h-4 w-4"
                                fallback={<span className="leading-none">{icon}</span>}
                            />
                        ) : (
                            icon
                        )}
                    </span>
                )}
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    className={`
                        w-full bg-(--color-bg-primary) border-2 border-(--color-border-primary) rounded-xl px-4 py-3 text-(--color-text-primary)
                        placeholder:text-(--color-text-placeholder) transition-all duration-300
                        focus:outline-none focus:border-(--color-brand-primary) focus:ring-4 focus:ring-(--color-brand-primary)/10
                        hover:border-(--color-border-secondary) disabled:bg-(--color-bg-secondary) disabled:cursor-not-allowed
                        ${icon ? 'pl-10' : ''}
                        ${error ? 'border-(--color-danger) focus:border-(--color-danger) focus:ring-(--color-danger)/10' : ''}
                    `}
                />
            </div>
            {error && (
                <p className="text-sm text-(--color-danger) mt-1.5 flex items-center gap-1">
                    <AppIcon name="warning" className="h-4 w-4" /> {error}
                </p>
            )}
        </div>
    );
}

export function FormTextarea({
    label,
    value,
    onChange,
    error = null,
    placeholder = '',
    required = false,
    disabled = false,
    rows = 4,
    className = '',
}) {
    return (
        <div className={className}>
            {label && (
                <label className="text-sm font-semibold text-(--color-text-primary) mb-2 block">
                    {label} {required && <span className="text-(--color-danger)">*</span>}
                </label>
            )}
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                rows={rows}
                className={`
                    w-full bg-(--color-bg-primary) border-2 border-(--color-border-primary) rounded-xl px-4 py-3 text-(--color-text-primary)
                    placeholder:text-(--color-text-placeholder) transition-all duration-300 resize-none
                    focus:outline-none focus:border-(--color-brand-primary) focus:ring-4 focus:ring-(--color-brand-primary)/10
                    hover:border-(--color-border-secondary) disabled:bg-(--color-bg-secondary) disabled:cursor-not-allowed
                    ${error ? 'border-(--color-danger) focus:border-(--color-danger) focus:ring-(--color-danger)/10' : ''}
                `}
            />
            {error && (
                <p className="text-sm text-(--color-danger) mt-1.5 flex items-center gap-1">
                    <AppIcon name="warning" className="h-4 w-4" /> {error}
                </p>
            )}
        </div>
    );
}

export function FormSelect({
    label,
    value,
    onChange,
    options = [],
    error = null,
    placeholder = 'Select...',
    required = false,
    disabled = false,
    name = '',
    className = '',
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [menuStyle, setMenuStyle] = useState(null);
    const selectRef = useRef(null);
    const menuRef = useRef(null);
    const buttonId = useId();
    const listboxId = `${buttonId}-listbox`;

    const normalizedOptions = useMemo(() => {
        return Array.isArray(options)
            ? options.map((option) => ({
                  value: option?.value ?? '',
                  label: option?.label ?? String(option?.value ?? ''),
              }))
            : [];
    }, [options]);

    const normalizeValue = (nextValue) => String(nextValue ?? '');
    const selectedOption = normalizedOptions.find(
        (option) => normalizeValue(option.value) === normalizeValue(value)
    );
    const selectedLabel = selectedOption?.label ?? placeholder;

    const updateMenuPosition = useCallback(() => {
        if (!selectRef.current || typeof window === 'undefined') {
            return;
        }

        const rect = selectRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
        const viewportPadding = 8;
        const offset = 8;
        const preferredHeight = 240;
        const minimumHeight = 140;

        const spaceBelow = viewportHeight - rect.bottom - viewportPadding;
        const spaceAbove = rect.top - viewportPadding;
        const shouldOpenUpward = spaceBelow < minimumHeight && spaceAbove > spaceBelow;
        const maxHeight = Math.max(
            minimumHeight,
            Math.min(preferredHeight, shouldOpenUpward ? spaceAbove : spaceBelow)
        );
        const width = Math.max(180, Math.min(rect.width, viewportWidth - viewportPadding * 2));
        const left = Math.min(
            Math.max(viewportPadding, rect.left),
            Math.max(viewportPadding, viewportWidth - width - viewportPadding)
        );
        const top = shouldOpenUpward
            ? Math.max(viewportPadding, rect.top - maxHeight - offset)
            : Math.min(viewportHeight - maxHeight - viewportPadding, rect.bottom + offset);

        setMenuStyle({
            left,
            maxHeight,
            top,
            width,
        });
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            const target = event.target;
            const clickedInsideTrigger = selectRef.current?.contains(target);
            const clickedInsideMenu = menuRef.current?.contains(target);

            if (!clickedInsideTrigger && !clickedInsideMenu) {
                setIsOpen(false);
            }
        };

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, []);

    useEffect(() => {
        if (!isOpen || disabled) {
            return;
        }

        updateMenuPosition();

        const handleViewportChange = () => updateMenuPosition();
        window.addEventListener('resize', handleViewportChange);
        window.addEventListener('scroll', handleViewportChange, true);

        return () => {
            window.removeEventListener('resize', handleViewportChange);
            window.removeEventListener('scroll', handleViewportChange, true);
        };
    }, [disabled, isOpen, updateMenuPosition]);

    const handleSelect = (nextValue) => {
        onChange(nextValue);
        setIsOpen(false);
    };

    const isSelected = (optionValue) => normalizeValue(optionValue) === normalizeValue(value);

    const shouldRenderMenu = isOpen && !disabled && menuStyle && typeof document !== 'undefined';

    const menu = shouldRenderMenu
        ? createPortal(
              <div
                  id={listboxId}
                  ref={menuRef}
                  role="listbox"
                  className="z-[120] overflow-y-auto rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) shadow-2xl"
                  style={{
                      left: menuStyle.left,
                      maxHeight: menuStyle.maxHeight,
                      position: 'fixed',
                      top: menuStyle.top,
                      width: menuStyle.width,
                  }}
              >
                  <button
                      type="button"
                      role="option"
                      aria-selected={!selectedOption}
                      onClick={() => handleSelect('')}
                      className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                          !selectedOption
                              ? 'bg-(--color-brand-primary)/10 text-(--color-brand-primary) font-semibold'
                              : 'text-(--color-text-secondary) hover:bg-(--color-bg-secondary)'
                      }`}
                  >
                      {placeholder}
                  </button>

                  {normalizedOptions.map((option) => {
                      const optionSelected = isSelected(option.value);

                      return (
                          <button
                              key={String(option.value)}
                              type="button"
                              role="option"
                              aria-selected={optionSelected}
                              onClick={() => handleSelect(option.value)}
                              className={`w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center justify-between ${
                                  optionSelected
                                      ? 'bg-(--color-brand-primary)/10 text-(--color-brand-primary) font-semibold'
                                      : 'text-(--color-text-secondary) hover:bg-(--color-bg-secondary)'
                              }`}
                          >
                              <span>{option.label}</span>
                              {optionSelected && (
                                  <svg
                                      className="h-4 w-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                      aria-hidden="true"
                                  >
                                      <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          d="M5 13l4 4L19 7"
                                      />
                                  </svg>
                              )}
                          </button>
                      );
                  })}
              </div>,
              document.body
          )
        : null;

    return (
        <div className={`relative ${className}`} ref={selectRef}>
            {label && (
                <label
                    htmlFor={buttonId}
                    className="text-sm font-semibold text-(--color-text-primary) mb-2 block"
                >
                    {label} {required && <span className="text-(--color-danger)">*</span>}
                </label>
            )}

            {name && <input type="hidden" name={name} value={value ?? ''} />}

            <button
                id={buttonId}
                type="button"
                disabled={disabled}
                onClick={() => setIsOpen((prev) => !prev)}
                className={`
                    w-full bg-(--color-bg-primary) border-2 rounded-xl px-4 py-3 text-left
                    transition-colors duration-200 flex items-center justify-between
                    focus-visible:outline-none focus-visible:border-(--color-brand-primary)
                    focus-visible:ring-4 focus-visible:ring-(--color-brand-primary)/10
                    disabled:bg-(--color-bg-secondary) disabled:cursor-not-allowed
                    ${error ? 'border-(--color-danger) focus-visible:border-(--color-danger) focus-visible:ring-(--color-danger)/10' : 'border-(--color-border-primary) hover:border-(--color-border-secondary)'}
                `}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-controls={listboxId}
            >
                <span
                    className={
                        selectedOption
                            ? 'text-(--color-text-primary)'
                            : 'text-(--color-text-placeholder)'
                    }
                >
                    {selectedLabel}
                </span>
                <svg
                    className={`h-4 w-4 text-(--color-text-tertiary) transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </button>
            {menu}

            {error && (
                <p className="text-sm text-(--color-danger) mt-1.5 flex items-center gap-1">
                    <AppIcon name="warning" className="h-4 w-4" /> {error}
                </p>
            )}
        </div>
    );
}

export function FormCheckbox({ label, checked, onChange, className = '' }) {
    return (
        <label
            className={`flex items-center gap-3 text-sm text-(--color-text-secondary) cursor-pointer group ${className}`}
        >
            <div className="relative">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    className="sr-only peer"
                />
                <div className="w-5 h-5 rounded-md border-2 border-(--color-border-primary) bg-(--color-bg-primary) transition-all duration-200 peer-checked:bg-(--color-brand-primary) peer-checked:border-(--color-brand-primary) peer-focus:ring-4 peer-focus:ring-(--color-brand-primary)/20 group-hover:border-(--color-brand-primary)"></div>
                <svg
                    className="absolute top-1 left-1 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        d="M5 13l4 4L19 7"
                    />
                </svg>
            </div>
            <span className="font-medium">{label}</span>
        </label>
    );
}

// Button component for forms
export function FormButton({
    children,
    type = 'button',
    variant = 'primary',
    disabled = false,
    loading = false,
    onClick,
    className = '',
}) {
    const variants = {
        primary:
            'bg-(--color-brand-primary) text-white shadow-lg shadow-(--color-brand-primary)/30 hover:-translate-y-0.5',
        secondary:
            'bg-(--color-bg-primary) text-(--color-text-secondary) border-2 border-(--color-border-primary) hover:border-(--color-brand-primary) hover:text-(--color-brand-primary)',
        success: 'bg-(--color-success) text-white shadow-lg shadow-(--color-success)/30',
        danger: 'bg-(--color-danger) text-white shadow-lg shadow-(--color-danger)/30',
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`
                px-6 py-3 rounded-xl font-semibold transition-all duration-300
                disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                ${variants[variant]} ${className}
            `}
        >
            {loading ? (
                <span className="inline-flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                    Processing...
                </span>
            ) : (
                children
            )}
        </button>
    );
}
