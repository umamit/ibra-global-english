// FinanceSearchToolbar.tsx - Filter & pencarian tagihan SPP
interface Props {
  searchQuery: string; setSearchQuery: (v: string) => void;
  programFilter: string; setProgramFilter: (v: string) => void;
  filteredCount: number; totalCount: number;
}

export default function FinanceSearchToolbar({ searchQuery, setSearchQuery, programFilter, setProgramFilter, filteredCount, totalCount }: Props) {
  return (
    <div className="portal-card" style={{ padding: "1.25rem", marginBottom: "1.5rem", display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", flex: 1, maxWidth: "650px" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
          <input type="text" className="form-input" style={{ width: "100%", padding: "0.6rem 0.6rem 0.6rem 2.2rem" }} placeholder="Cari siswa atau nama orang tua..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-gray-400)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </div>
        <select className="form-input" style={{ width: "200px", padding: "0.6rem" }} value={programFilter} onChange={(e) => setProgramFilter(e.target.value)}>
          <option value="All">Semua Program</option>
          <option value="A1 Foundation">A1 Foundation</option>
          <option value="A2 Bridge">A2 Bridge</option>
          <option value="B1 Communicator">B1 Communicator</option>
          <option value="B2 Achiever">B2 Achiever</option>
          <option value="C1 Professional">C1 Professional</option>
          <option value="Kids Program">Kids Program</option>
          <option value="Teens Program">Teens Program</option>
          <option value="Fun Calistung">Fun Calistung</option>
        </select>
      </div>
      <div style={{ fontSize: "0.9rem", fontWeight: "600", color: "var(--color-gray-500)" }}>Menampilkan {filteredCount} dari {totalCount} siswa</div>
    </div>
  );
}
