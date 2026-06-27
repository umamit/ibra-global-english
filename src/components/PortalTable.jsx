"use client";

/**
 * Komponen PortalTable Reusable
 * Struktur dasar pembungkus tabel admin dengan penanganan state kosong otomatis
 */
export default function PortalTable({
  headers = [], // Bisa berupa array string ['No', 'Nama'] atau array object [{ label: 'Nama', style: {} }]
  rows = [],
  renderRow, // Fungsi kustom rendering (row, index) => <tr>...</tr>
  emptyMessage = "Tidak ada data yang sesuai dengan kriteria filter.",
  style = {}
}) {
  return (
    <div className="table-wrapper" style={style}>
      <table className="portal-table">
        <thead>
          <tr>
            {headers.map((header, idx) => {
              const label = typeof header === "object" ? header.label : header;
              const headerStyle = typeof header === "object" ? header.style : {};
              return (
                <th key={idx} style={headerStyle}>
                  {label}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td 
                colSpan={headers.length} 
                style={{ textAlign: "center", padding: "3rem 0", color: "var(--color-gray-500)" }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, idx) => {
              if (renderRow) {
                return renderRow(row, idx);
              }
              // Fallback jika renderRow tidak disediakan
              return (
                <tr key={row.id || idx}>
                  {Object.values(row).map((cell, cIdx) => (
                    <td key={cIdx}>{String(cell)}</td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
