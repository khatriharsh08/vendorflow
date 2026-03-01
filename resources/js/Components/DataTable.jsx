import { Link } from '@inertiajs/react';
import AppIcon from './AppIcon';

const getHeaderLabel = (column) => column.header ?? column.label ?? column.key ?? '';

const getCellValue = (row, column, rowIndex) => {
    if (typeof column.render === 'function') {
        return column.render(row, rowIndex);
    }

    const accessor = column.accessor ?? column.key;
    return accessor ? row?.[accessor] : null;
};

const isInteractiveTarget = (target) =>
    target instanceof Element &&
    Boolean(
        target.closest(
            'a, button, input, select, textarea, label, [role="button"], [data-stop-row-click]'
        )
    );

const TableHeader = ({ columns, stickyHeader }) => (
    <thead className={stickyHeader ? 'sticky top-0 z-10' : ''}>
        <tr className="bg-(--color-bg-secondary)/95 border-b border-(--color-border-secondary) shadow-token-xs backdrop-blur-sm">
            {columns.map((col, idx) => (
                <th
                    key={idx}
                    className={`
                        px-5 py-3.5 text-xs font-semibold text-(--color-text-tertiary) uppercase tracking-wider
                        ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}
                    `}
                >
                    {getHeaderLabel(col)}
                </th>
            ))}
        </tr>
    </thead>
);

const TableRow = ({ row, rowIndex, columns, onRowClick }) => (
    <tr
        className={`
            transition-colors duration-150
            ${onRowClick ? 'cursor-pointer hover:bg-(--color-brand-primary-light)/35' : 'hover:bg-(--color-bg-hover)'}
        `}
        onClick={(event) => {
            if (!onRowClick || isInteractiveTarget(event.target)) {
                return;
            }

            onRowClick(row, rowIndex, event);
        }}
    >
        {columns.map((col, colIdx) => (
            <td
                key={colIdx}
                className={`
                    px-5 py-4 text-sm text-(--color-text-secondary)
                    ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}
                `}
            >
                {getCellValue(row, col, rowIndex)}
            </td>
        ))}
    </tr>
);

export default function DataTable({
    columns,
    data = [],
    links = [],
    emptyIcon = 'empty',
    emptyMessage = 'No data found',
    onRowClick = null,
    stickyHeader = false,
}) {
    return (
        <div className="bg-(--color-bg-primary) rounded-2xl border border-(--color-border-primary) shadow-token-sm overflow-hidden">
            <div
                className={`overflow-x-auto ${stickyHeader ? 'max-h-[600px] overflow-y-auto' : ''}`}
            >
                <table className="w-full relative border-collapse">
                    <TableHeader columns={columns} stickyHeader={stickyHeader} />
                    <tbody className="divide-y divide-(--color-border-secondary)">
                        {data.map((row, rowIdx) => (
                            <TableRow
                                key={row.id || rowIdx}
                                row={row}
                                rowIndex={rowIdx}
                                columns={columns}
                                onRowClick={onRowClick}
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            {data.length === 0 && (
                <div className="py-16 text-center">
                    <div className="bg-(--color-bg-secondary) w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AppIcon name={emptyIcon} className="w-8 h-8 text-(--color-text-muted)" />
                    </div>
                    <p className="text-(--color-text-tertiary) font-medium">{emptyMessage}</p>
                </div>
            )}

            {links && links.length > 3 && (
                <div className="border-t border-(--color-border-secondary) bg-(--color-bg-secondary)/50 px-4 py-3 flex items-center justify-between sm:px-6">
                    <div className="w-full flex items-center justify-end">
                        <div />
                        <div>
                            <nav
                                className="relative z-0 inline-flex rounded-md shadow-token-xs -space-x-px"
                                aria-label="Pagination"
                            >
                                {links.map((link, key) => {
                                    const baseClass = `
                                            relative inline-flex items-center px-4 py-2 border text-sm font-medium
                                            ${key === 0 ? 'rounded-l-md' : ''}
                                            ${key === links.length - 1 ? 'rounded-r-md' : ''}
                                            ${
                                                link.active
                                                    ? 'z-10 bg-(--color-brand-primary-light) border-(--color-brand-primary) text-(--color-brand-primary-dark)'
                                                    : 'bg-(--color-bg-primary) border-(--color-border-primary) text-(--color-text-tertiary) hover:bg-(--color-bg-hover)'
                                            }
                                        `;

                                    if (!link.url) {
                                        return (
                                            <span
                                                key={key}
                                                aria-disabled="true"
                                                className={`${baseClass} opacity-50 cursor-not-allowed`}
                                            >
                                                <span
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            </span>
                                        );
                                    }

                                    return (
                                        <Link
                                            key={key}
                                            href={link.url}
                                            preserveScroll
                                            className={baseClass}
                                        >
                                            <span
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export function Card({
    title,
    action = null,
    actions = null,
    children,
    className = '',
    noPadding = false,
    allowOverflow = false,
}) {
    return (
        <div
            className={`bg-(--color-bg-primary) rounded-2xl border border-(--color-border-primary) shadow-token-sm ${allowOverflow ? 'overflow-visible' : 'overflow-hidden'} ${className}`}
        >
            {title && (
                <div className="px-5 py-4 border-b border-(--color-border-secondary) flex items-center justify-between">
                    <h3 className="font-semibold text-(--color-text-primary) flex items-center gap-2">
                        {title}
                    </h3>
                    {action || actions}
                </div>
            )}
            <div className={noPadding ? '' : ''}>{children}</div>
        </div>
    );
}

export function ListCard({
    title,
    actions = null,
    items = [],
    emptyIcon = 'success',
    emptyMessage = 'Nothing here',
}) {
    return (
        <Card title={title} actions={actions}>
            <div className="divide-y divide-(--color-border-secondary)">
                {items.length > 0 ? (
                    items.map((item, idx) => (
                        <div
                            key={item.id || idx}
                            className="px-5 py-4 flex items-center justify-between hover:bg-(--color-bg-hover) transition-colors"
                        >
                            {item.content}
                        </div>
                    ))
                ) : (
                    <div className="py-12 text-center">
                        <span className="text-4xl mb-3 block opacity-80 text-(--color-text-muted) inline-flex justify-center w-full">
                            <AppIcon
                                name={emptyIcon}
                                className="h-10 w-10"
                                fallback={<span className="leading-none">{emptyIcon}</span>}
                            />
                        </span>
                        <p className="text-(--color-text-tertiary) font-medium">{emptyMessage}</p>
                    </div>
                )}
            </div>
        </Card>
    );
}
