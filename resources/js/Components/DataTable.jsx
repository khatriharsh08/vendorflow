// Professional Data Table with refined styling
const TableHeader = ({ columns, stickyHeader }) => (
    <thead className={stickyHeader ? 'sticky top-0 z-10' : ''}>
        <tr className="bg-gray-50/95 border-b border-gray-100 shadow-sm backdrop-blur-sm">
            {columns.map((col, idx) => (
                <th
                    key={idx}
                    className={`
                        px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider
                        ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}
                    `}
                >
                    {col.header}
                </th>
            ))}
        </tr>
    </thead>
);

const TableRow = ({ row, columns, onRowClick }) => (
    <tr
        className={`
            transition-colors duration-150
            ${onRowClick ? 'cursor-pointer hover:bg-indigo-50/50' : 'hover:bg-gray-50/50'}
        `}
        onClick={() => onRowClick?.(row)}
    >
        {columns.map((col, colIdx) => (
            <td
                key={colIdx}
                className={`
                    px-5 py-4 text-sm text-gray-700
                    ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}
                `}
            >
                {col.render ? col.render(row) : row[col.accessor]}
            </td>
        ))}
    </tr>
);

export default function DataTable({
    columns,
    data = [],
    emptyIcon = '📭',
    emptyMessage = 'No data found',
    onRowClick = null,
    stickyHeader = false,
}) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div
                className={`overflow-x-auto ${stickyHeader ? 'max-h-[600px] overflow-y-auto' : ''}`}
            >
                <table className="w-full relative border-collapse">
                    <TableHeader columns={columns} stickyHeader={stickyHeader} />
                    <tbody className="divide-y divide-gray-50">
                        {data.map((row, rowIdx) => (
                            <TableRow
                                key={row.id || rowIdx}
                                row={row}
                                columns={columns}
                                onRowClick={onRowClick}
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Empty State */}
            {data.length === 0 && (
                <div className="py-16 text-center">
                    <span className="text-5xl block mb-4 opacity-80">{emptyIcon}</span>
                    <p className="text-gray-500 font-medium">{emptyMessage}</p>
                </div>
            )}
        </div>
    );
}

// Card component with professional styling
export function Card({
    title,
    action = null,
    actions = null,
    children,
    className = '',
    noPadding = false,
}) {
    return (
        <div
            className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden ${className}`}
        >
            {title && (
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">{title}</h3>
                    {action || actions}
                </div>
            )}
            <div className={noPadding ? '' : ''}>{children}</div>
        </div>
    );
}

// List card for simple list displays
export function ListCard({
    title,
    actions = null,
    items = [],
    emptyIcon = '✅',
    emptyMessage = 'Nothing here',
}) {
    return (
        <Card title={title} actions={actions}>
            <div className="divide-y divide-gray-50">
                {items.length > 0 ? (
                    items.map((item, idx) => (
                        <div
                            key={item.id || idx}
                            className="px-5 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
                        >
                            {item.content}
                        </div>
                    ))
                ) : (
                    <div className="py-12 text-center">
                        <span className="text-4xl mb-3 block opacity-80">{emptyIcon}</span>
                        <p className="text-gray-500 font-medium">{emptyMessage}</p>
                    </div>
                )}
            </div>
        </Card>
    );
}
