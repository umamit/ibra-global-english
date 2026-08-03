// LoginRolePicker.tsx - Role selector button group
interface Props { role: string; setRole: (r: string) => void; }

const ROLES = [
  { key: "student", label: "Siswa", icon: <><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></> },
  { key: "parent", label: "Orang Tua", icon: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></> },
  { key: "tutor", label: "Tutor", icon: <><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10"/><path d="M6 10h10"/></> },
  { key: "admin", label: "Admin", icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/> },
];

export default function LoginRolePicker({ role, setRole }: Props) {
  return (
    <div className="auth-role-picker">
      {ROLES.map(r => (
        <button key={r.key} type="button" onClick={() => setRole(r.key)} className={`role-pill ${role === r.key ? "active" : ""}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">{r.icon}</svg>
          <span>{r.label}</span>
        </button>
      ))}
    </div>
  );
}
