import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getStudents, getWatchlist, getSchoolAnalytics, getClassAnalytics } from "../api";
import { useAuth } from "../contexts/AuthContext";
import { AlertTriangle, ChevronRight, Search, Users, TrendingDown, ShieldCheck, BarChart3 } from "lucide-react";

const RISK = {
  low:      { bg: "#F0FDF4", color: "#166534", border: "#86EFAC", dot: "#22C55E" },
  moderate: { bg: "#FFFBEB", color: "#92400E", border: "#FCD34D", dot: "#F59E0B" },
  high:     { bg: "#FEF2F2", color: "#991B1B", border: "#FCA5A5", dot: "#EF4444" },
  crisis:   { bg: "#FFF1F2", color: "#881337", border: "#FDA4AF", dot: "#E11D48" },
};

function RiskBadge({ level }) {
  const s = RISK[level] || { bg: "#F7F3EE", color: "var(--ink-faint)", border: "var(--border)", dot: "var(--ink-faint)" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 20,
      background: s.bg, border: `1px solid ${s.border}`,
      fontSize: 11.5, fontWeight: 600, color: s.color,
      textTransform: "capitalize",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
      {level}
    </span>
  );
}

function StatCard({ label, value, icon: Icon, accent }) {
  return (
    <div className="animate-fade-up" style={{
      background: "#fff", borderRadius: 16, padding: "20px 22px",
      border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--ink-faint)", letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</span>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: accent || "var(--cream-dark)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={15} color={accent ? "#fff" : "var(--ink-muted)"} strokeWidth={1.8} />
        </div>
      </div>
      <p style={{ fontFamily: "'Fraunces', serif", fontSize: 34, fontWeight: 400, color: "var(--ink)", lineHeight: 1 }}>{value}</p>
    </div>
  );
}

function MoodBar({ value }) {
  const pct = ((value - 1) / 4) * 100;
  const color = pct < 33 ? "#EF4444" : pct < 66 ? "#F59E0B" : "#22C55E";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 4, background: "var(--cream-dark)", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 4, transition: "width 0.5s ease" }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 500, color: "var(--ink-muted)", minWidth: 24 }}>{value}</span>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const role = user?.role;
  const isCounselor = role === "counselor" || role === "admin";

  const [students, setStudents] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [schoolStats, setSchoolStats] = useState(null);
  const [classBreakdown, setClassBreakdown] = useState([]);

  useEffect(() => {
    const promises = [getStudents(), getWatchlist()];
    if (isCounselor) promises.push(getSchoolAnalytics(), getClassAnalytics());
    Promise.all(promises)
      .then(([s, w, school, classes]) => {
        setStudents(s); setWatchlist(w);
        if (school) setSchoolStats(school);
        if (classes) setClassBreakdown(classes);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isCounselor]);

  const filtered = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
  const stats = {
    total: students.length,
    flagged: watchlist.length,
    highRisk: students.filter(s => ["high", "crisis"].includes(s.risk_level)).length,
    healthy: students.filter(s => s.risk_level === "low").length,
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 40, height: 40, border: "3px solid var(--cream-dark)", borderTopColor: "var(--saffron)", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
        <p style={{ fontSize: 13, color: "var(--ink-faint)" }}>Loading dashboard...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 30, fontWeight: 400, color: "var(--ink)", marginBottom: 4 }}>
          {role === "teacher" ? "My Class" : "Dashboard"}
        </h1>
        <p style={{ fontSize: 14, color: "var(--ink-faint)" }}>
          {role === "teacher" ? "Students assigned to your class" : "School-wide wellbeing overview"}
        </p>
      </div>

      {/* Stat cards */}
      <div className="stagger" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
        <StatCard label="Total Students" value={stats.total} icon={Users} />
        <StatCard label="Needs Attention" value={stats.flagged} icon={AlertTriangle} accent="#E07B39" />
        <StatCard label="High Risk" value={stats.highRisk} icon={TrendingDown} accent="#EF4444" />
        <StatCard label="Healthy" value={stats.healthy} icon={ShieldCheck} accent="#22C55E" />
      </div>

      {/* Class breakdown */}
      {isCounselor && classBreakdown.length > 0 && (
        <div className="animate-fade-up" style={{ marginBottom: 28 }}>
          <SectionHeader icon={BarChart3} label="Class comparison" />
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid var(--border)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Class", "Students", "Avg mood", "Check-ins", "Risk spread"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--ink-faint)", letterSpacing: "0.05em", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {classBreakdown.map((c, i) => (
                  <tr key={c.class} style={{ borderBottom: i < classBreakdown.length - 1 ? "1px solid var(--border)" : "none" }}>
                    <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--ink)" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 8, background: "var(--indigo-light)", color: "var(--indigo)", fontSize: 12, fontWeight: 700 }}>{c.class}</span>
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--ink-muted)" }}>{c.student_count}</td>
                    <td style={{ padding: "12px 16px", minWidth: 120 }}>
                      {c.avg_mood ? <MoodBar value={c.avg_mood} /> : <span style={{ color: "var(--ink-faint)" }}>—</span>}
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--ink-muted)" }}>{c.checkin_count}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: 3, height: 6, borderRadius: 4, overflow: "hidden", minWidth: 100 }}>
                        {[
                          { level: "low", color: "#22C55E" },
                          { level: "moderate", color: "#F59E0B" },
                          { level: "high", color: "#EF4444" },
                          { level: "crisis", color: "#E11D48" },
                        ].map(({ level, color }) => {
                          const pct = ((c.risk_distribution[level] || 0) / c.student_count) * 100;
                          return pct > 0 ? <div key={level} style={{ flex: pct, background: color }} /> : null;
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Watchlist */}
      {watchlist.length > 0 && (
        <div className="animate-fade-up" style={{ marginBottom: 28 }}>
          <SectionHeader icon={AlertTriangle} label={`Watchlist — ${watchlist.length} students`} color="var(--saffron)" />
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid var(--border)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
            {watchlist.map((s, i) => (
              <Link
                key={s.id} to={`/students/${s.id}`}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "14px 18px", textDecoration: "none",
                  borderBottom: i < watchlist.length - 1 ? "1px solid var(--border)" : "none",
                  transition: "background 0.12s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--cream)"}
                onMouseLeave={e => e.currentTarget.style.background = "#fff"}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Avatar name={s.name} risk={s.risk?.risk_level} />
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)", marginBottom: 2 }}>{s.name}</p>
                    <p style={{ fontSize: 12, color: "var(--ink-faint)" }}>
                      Class {s.class}{s.risk?.concerns?.[0] ? ` · ${s.risk.concerns[0]}` : ""}
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <RiskBadge level={s.risk?.risk_level} />
                  <ChevronRight size={16} color="var(--ink-faint)" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* All students */}
      <div className="animate-fade-up">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <SectionHeader icon={Users} label="All students" noMargin />
          <div style={{ position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--ink-faint)" }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search students..."
              style={{
                paddingLeft: 34, paddingRight: 14, paddingTop: 8, paddingBottom: 8,
                border: "1.5px solid var(--border-strong)", borderRadius: 10,
                fontSize: 13, color: "var(--ink)", background: "#fff",
                minWidth: 200,
              }}
            />
          </div>
        </div>
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid var(--border)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Student", "Class", "Mood", "Risk", "Last check-in", ""].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--ink-faint)", letterSpacing: "0.05em", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr
                  key={s.id}
                  style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none", transition: "background 0.12s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--cream)"}
                  onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                >
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar name={s.name} risk={s.risk_level} small />
                      <Link to={`/students/${s.id}`} style={{ fontWeight: 500, color: "var(--ink)", textDecoration: "none" }}>{s.name}</Link>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 30, height: 26, borderRadius: 6, background: "var(--indigo-light)", color: "var(--indigo)", fontSize: 11, fontWeight: 700 }}>{s.class}</span>
                  </td>
                  <td style={{ padding: "12px 16px", width: 120 }}>
                    {s.last_mood ? <MoodBar value={s.last_mood} /> : <span style={{ color: "var(--ink-faint)" }}>—</span>}
                  </td>
                  <td style={{ padding: "12px 16px" }}><RiskBadge level={s.risk_level} /></td>
                  <td style={{ padding: "12px 16px", color: "var(--ink-faint)", fontSize: 12.5 }}>{s.last_checkin_date || "Never"}</td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <Link to={`/students/${s.id}`} style={{ display: "inline-flex" }}>
                      <ChevronRight size={16} color="var(--ink-faint)" />
                    </Link>
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

function Avatar({ name, risk, small }) {
  const s = RISK[risk] || { bg: "var(--cream-dark)", color: "var(--ink-muted)" };
  const size = small ? 30 : 38;
  const initials = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: s.bg, border: `1.5px solid ${s.border || "var(--border)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: small ? 10 : 12, fontWeight: 600, color: s.color }}>
      {initials}
    </div>
  );
}

function SectionHeader({ icon: Icon, label, color, noMargin }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: noMargin ? 0 : 14 }}>
      <Icon size={14} color={color || "var(--ink-muted)"} strokeWidth={1.8} />
      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", letterSpacing: "-0.01em" }}>{label}</span>
    </div>
  );
}
