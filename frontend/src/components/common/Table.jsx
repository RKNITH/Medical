import Loader from "./Loader.jsx";

const Table = ({ columns, data, loading, emptyMessage = "No records found." }) => {
    return (
        <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-sm text-left">

                {/* Head */}
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs tracking-wider">
                    <tr>
                        {columns.map((col) => (
                            <th key={col.key} className="px-4 py-3 font-medium whitespace-nowrap">
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>

                {/* Body */}
                <tbody className="divide-y divide-slate-100">
                    {loading ? (
                        <tr>
                            <td colSpan={columns.length} className="py-16">
                                <Loader size="md" />
                            </td>
                        </tr>
                    ) : data?.length === 0 ? (
                        <tr>
                            <td
                                colSpan={columns.length}
                                className="py-16 text-center text-slate-400"
                            >
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        data?.map((row, rowIndex) => (
                            <tr
                                key={row._id || rowIndex}
                                className="hover:bg-slate-50 transition-colors duration-150"
                            >
                                {columns.map((col) => (
                                    <td key={col.key} className="px-4 py-3 text-slate-700 whitespace-nowrap">
                                        {col.render ? col.render(row) : row[col.key] ?? "—"}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Table;