import { useEffect, useState } from "react";
import { getPendingUsers, getAllUsers, approveUser, rejectUser, getClasses, assignClass } from "../api";
import { Check, X, UserPlus, ChevronDown, Users, ShieldCheck } from "lucide-react";

export default function AdminPanel() {
  const [pending, setPending] = useState([]);
  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigningFor, setAssigningFor] = useState(null);
  const [selectedClass, setSelectedClass] = useState("");

  function refresh() {
    Promise.all([getPendingUsers(), getAllUsers(), getClasses()])
      .then(([p, u, c]) => { setPending(p); setUsers(u); setClasses(c); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }
  useEffect(() => { refresh(); }, []);

  async function handleApprove(userId) { await approveUser(userId); refresh(); }
  async function handleReject(userId) { await rejectUser(userId); refresh(); }
  async function handleAssign(userId) {
    if (!selectedClass) return;
    await assignClass(userId, selectedClass);
    setAssigningFor(null); setSelectedClass(""); refresh();
  }

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
      <div style={{ width: 36, height: 36, border: "3px solid var(--cream-dark)", borderTopColor: "var(--saffron)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 30, fontWeight: 400, color: "var(--ink)", marginBottom: 4 }}>Admin panel</h1>
        <p style={{ fontSize: 14, color: "var(--ink-faint)" }}>Manage users, approvals, and class assignments</p>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 28 }} className="stagger">
        {[
          { label: "Pending approvals", value: pending.length, accent: "#E07B39", icon: UserPlus },
          { label: "Total staff", value: users.length, icon: Users },
          { label: "Classes", value: classes.length, accent: "var(--indigo)", icon: ShieldCheck },
        ].map(({ label, value, accent, icon: Icon }) => (
          <div key={label} className="animate-fade-up" style={{ background: "#fff", borderRadius: 16, padding: "20px 22px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--ink-faint)", letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</span>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: accent || "var(--cream-dark)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={14} color={accent ? "#fff" : "var(--ink-muted)"} strokeWidth={1.8} />
              </div>
            </div>
            <p style={{ fontFamily: "'Fraunces', serif", fontSize: 32, fontWeight: 400, color: "var(--ink)" }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Pending approvals */}
      {pending.length > 0 && (
        <div className="animate-fade-up" style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#E07B39" }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>Pending approval — {pending.length}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {pending.map(u => (
              <div key={u.id} style={{
                background: "#fff", borderRadius: 14, padding: "16px 20px",
                border: "1px solid rgba(224,123,57,0.25)",
                boxShadow: "var(--shadow-sm)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--saffron-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "var(--saffron-dark)" }}>
                    {u.full_name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)" }}>{u.full_name}</p>
                    <p style={{ fontSize: 12.5, color: "var(--ink-faint)" }}>
                      {u.email} · Requesting <span style={{ fontWeight: 600, textTransform: "capitalize", color: "var(--ink-muted)" }}>{u.role}</span> access
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <ActionBtn onClick={() => handleApprove(u.id)} color="#166534" bg="#F0FDF4" border="#86EFAC" icon={Check} label="Approve" />
                  <ActionBtn onClick={() => handleReject(u.id)} color="#991B1B" bg="#FEF2F2" border="#FCA5A5" icon={X} label="Reject" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All staff */}
      <div className="animate-fade-up">
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <Users size={14} color="var(--ink-muted)" />
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>All staff</span>
        </div>
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid var(--border)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Name", "Role", "Status", "Assigned classes", ""].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--ink-faint)", letterSpacing: "0.05em", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id} style={{ borderBottom: i < users.length - 1 ? "1px solid var(--border)" : "none" }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--cream)"}
                  onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                >
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--cream-dark)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "var(--ink-muted)", flexShrink: 0 }}>
                        {u.full_name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontWeight: 500, color: "var(--ink)" }}>{u.full_name}</p>
                        <p style={{ fontSize: 11.5, color: "var(--ink-faint)" }}>{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      display: "inline-block", padding: "3px 10px", borderRadius: 20,
                      fontSize: 11.5, fontWeight: 600, textTransform: "capitalize",
                      background: u.role === "counselor" ? "var(--amber-light)" : "var(--indigo-light)",
                      color: u.role === "counselor" ? "var(--amber)" : "var(--indigo)",
                    }}>{u.role}</span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20,
                      fontSize: 11.5, fontWeight: 600, textTransform: "capitalize",
                      background: u.status === "approved" ? "var(--emerald-light)" : u.status === "pending" ? "var(--amber-light)" : "var(--red-light)",
                      color: u.status === "approved" ? "var(--emerald)" : u.status === "pending" ? "var(--amber)" : "var(--red)",
                    }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor" }} />
                      {u.status}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {u.role === "teacher" ? (
                      u.assigned_classes?.length > 0
                        ? <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                            {u.assigned_classes.map(c => (
                              <span key={c} style={{ padding: "2px 8px", borderRadius: 6, background: "var(--indigo-light)", color: "var(--indigo)", fontSize: 11.5, fontWeight: 700 }}>{c.replace("cls-", "")}</span>
                            ))}
                          </div>
                        : <span style={{ color: "var(--ink-faint)", fontSize: 12 }}>None assigned</span>
                    ) : <span style={{ color: "var(--ink-faint)", fontSize: 12 }}>All classes</span>}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {u.role === "teacher" && u.status === "approved" && (
                      assigningFor === u.id ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ position: "relative" }}>
                            <select
                              value={selectedClass}
                              onChange={e => setSelectedClass(e.target.value)}
                              style={{ paddingLeft: 10, paddingRight: 28, paddingTop: 6, paddingBottom: 6, border: "1.5px solid var(--border-strong)", borderRadius: 8, fontSize: 12, background: "#fff", color: "var(--ink)", appearance: "none" }}
                            >
                              <option value="">Pick class</option>
                              {classes.map(c => <option key={c.id} value={c.id}>{c.grade}{c.section}</option>)}
                            </select>
                            <ChevronDown size={11} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--ink-faint)" }} />
                          </div>
                          <button
                            onClick={() => handleAssign(u.id)} disabled={!selectedClass}
                            style={{ padding: "6px 12px", background: "var(--ink)", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer", opacity: selectedClass ? 1 : 0.4 }}
                          >Assign</button>
                          <button
                            onClick={() => setAssigningFor(null)}
                            style={{ fontSize: 12, color: "var(--ink-faint)", background: "none", border: "none", cursor: "pointer" }}
                          >Cancel</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAssigningFor(u.id)}
                          style={{ fontSize: 12.5, color: "var(--indigo)", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}
                        >+ Assign class</button>
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ActionBtn({ onClick, color, bg, border, icon: Icon, label }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
        borderRadius: 10, border: `1.5px solid ${hover ? color : border}`,
        background: hover ? bg : "#fff",
        color, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
        transition: "all 0.15s",
      }}
    >
      <Icon size={12} strokeWidth={2.5} />
      {label}
    </button>
  );
}
