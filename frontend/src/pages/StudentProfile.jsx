import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getStudent, getStudentCheckins, getObservations, getInterventions, analyzeRisk, getConversationStarters } from "../api";
import { ArrowLeft, MessageCircle, TrendingDown, TrendingUp, Minus, AlertTriangle, Loader2, Sparkles, Brain } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from "recharts";

const RISK = {
  low:      { bg: "#F0FDF4", color: "#166534", border: "#86EFAC", dot: "#22C55E", label: "Low risk" },
  moderate: { bg: "#FFFBEB", color: "#92400E", border: "#FCD34D", dot: "#F59E0B", label: "Moderate risk" },
  high:     { bg: "#FEF2F2", color: "#991B1B", border: "#FCA5A5", dot: "#EF4444", label: "High risk" },
  crisis:   { bg: "#FFF1F2", color: "#881337", border: "#FDA4AF", dot: "#E11D48", label: "Crisis" },
};

const TAG_LABELS = {
  grade_drop: "Grade drop", distracted: "Distracted", withdrawn: "Withdrawn",
  absent: "Absent", aggressive: "Aggressive", tearful: "Tearful",
  isolated: "Isolated", disruptive: "Disruptive",
};

function RiskChip({ level }) {
  const s = RISK[level] || { bg: "var(--cream)", color: "var(--ink-faint)", dot: "var(--ink-faint)", border: "var(--border)" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px",
      borderRadius: 20, background: s.bg, border: `1.5px solid ${s.border}`,
      fontSize: 12.5, fontWeight: 600, color: s.color,
    }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.dot }} />
      {s.label || level}
    </span>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 14px", boxShadow: "var(--shadow-md)", fontSize: 13 }}>
      <p style={{ color: "var(--ink-faint)", marginBottom: 4 }}>{label}</p>
      <p style={{ fontWeight: 600, color: "var(--ink)" }}>Mood: {payload[0].value}/5</p>
    </div>
  );
};

export default function StudentProfile() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [checkins, setCheckins] = useState([]);
  const [observations, setObservations] = useState([]);
  const [interventions, setInterventions] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [starters, setStarters] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [loadingStarters, setLoadingStarters] = useState(false);

  useEffect(() => {
    Promise.all([getStudent(id), getStudentCheckins(id), getObservations(id), getInterventions(id)])
      .then(([s, c, o, iv]) => { setStudent(s); setCheckins(c); setObservations(o); setInterventions(iv); })
      .catch(console.error);
  }, [id]);

  async function runAnalysis() {
    setLoadingAI(true);
    try { setAnalysis(await analyzeRisk(id)); }
    catch (err) { console.error(err); }
    finally { setLoadingAI(false); }
  }

  async function loadStarters() {
    setLoadingStarters(true);
    try { setStarters(await getConversationStarters(id)); }
    catch (err) { console.error(err); }
    finally { setLoadingStarters(false); }
  }

  if (!student) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
      <div style={{ width: 36, height: 36, border: "3px solid var(--cream-dark)", borderTopColor: "var(--saffron)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
    </div>
  );

  const chartData = checkins.map(c => ({ date: c.date.slice(5), mood: c.mood }));
  const last3 = checkins.slice(-3);
  const avgRecent = last3.length > 0 ? (last3.reduce((s, c) => s + c.mood, 0) / last3.length).toFixed(1) : null;
  const allAvg = checkins.length > 0 ? checkins.reduce((s, c) => s + c.mood, 0) / checkins.length : null;

  const trendDir = checkins.length >= 4
    ? (() => {
        const r = checkins.slice(-3).reduce((s, c) => s + c.mood, 0) / 3;
        const e = checkins.slice(-6, -3).reduce((s, c) => s + c.mood, 0) / Math.min(3, checkins.slice(-6, -3).length || 1);
        return r - e < -0.5 ? "down" : r - e > 0.5 ? "up" : "flat";
      })()
    : "flat";

  const initials = student.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="animate-fade-up">
      <Link to="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--ink-faint)", textDecoration: "none", marginBottom: 24, padding: "6px 10px", borderRadius: 8, transition: "background 0.15s" }}
        onMouseEnter={e => e.currentTarget.style.background = "var(--cream-dark)"}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
      >
        <ArrowLeft size={15} /> Back to dashboard
      </Link>

      {/* Header */}
      <div style={{ background: "#fff", borderRadius: 18, padding: "24px 28px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--indigo-light)", border: "2px solid rgba(61,61,143,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "var(--indigo)" }}>
            {initials}
          </div>
          <div>
            <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 500, color: "var(--ink)", marginBottom: 4 }}>{student.name}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "2px 10px", borderRadius: 6, background: "var(--indigo-light)", color: "var(--indigo)", fontSize: 12, fontWeight: 700 }}>Class {student.class}</span>
              <span style={{ fontSize: 13, color: "var(--ink-faint)" }}>Age {student.age}</span>
              {student.gender && <span style={{ fontSize: 13, color: "var(--ink-faint)" }}>· {student.gender}</span>}
            </div>
          </div>
        </div>
        <button
          onClick={runAnalysis} disabled={loadingAI}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "11px 20px",
            background: loadingAI ? "var(--cream-dark)" : "var(--ink)",
            color: loadingAI ? "var(--ink-faint)" : "#fff",
            border: "none", borderRadius: 12, fontSize: 13.5, fontWeight: 500, cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          {loadingAI ? <Loader2 size={14} className="animate-spin" /> : <Brain size={14} />}
          {loadingAI ? "Analyzing..." : "Run AI analysis"}
        </button>
      </div>

      {/* Stats row */}
      <div className="stagger" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 20 }}>
        <StatCard label="Recent avg. mood" value={avgRecent ? `${avgRecent}/5` : "—"} />
        <StatCard label="Mood trend" value={
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {trendDir === "down" ? <TrendingDown size={20} color="#EF4444" /> : trendDir === "up" ? <TrendingUp size={20} color="#22C55E" /> : <Minus size={20} color="var(--ink-faint)" />}
            <span style={{ fontSize: 15, color: trendDir === "down" ? "#991B1B" : trendDir === "up" ? "#166534" : "var(--ink-muted)" }}>
              {trendDir === "down" ? "Declining" : trendDir === "up" ? "Improving" : "Stable"}
            </span>
          </span>
        } />
        <StatCard label="Check-ins (14d)" value={checkins.length} />
      </div>

      {/* Mood chart */}
      {chartData.length > 0 && (
        <Card title="Mood history" style={{ marginBottom: 20 }}>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--cream-dark)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--ink-faint)" }} axisLine={false} tickLine={false} />
              <YAxis domain={[1, 5]} ticks={[1,2,3,4,5]} tick={{ fontSize: 11, fill: "var(--ink-faint)" }} axisLine={false} tickLine={false} width={28} />
              <Tooltip content={<CustomTooltip />} />
              {allAvg && <ReferenceLine y={allAvg} stroke="var(--saffron)" strokeDasharray="4 4" strokeWidth={1.5} />}
              <Line type="monotone" dataKey="mood" stroke="var(--ink)" strokeWidth={2.5} dot={{ fill: "#fff", stroke: "var(--ink)", strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: "var(--saffron)", stroke: "#fff", strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
          {allAvg && <p style={{ fontSize: 11.5, color: "var(--ink-faint)", marginTop: 6 }}>Orange dashed line = 14-day average ({allAvg.toFixed(1)})</p>}
        </Card>
      )}

      {/* AI Analysis */}
      {analysis && (
        <Card title="AI risk assessment" style={{ marginBottom: 20 }}>
          {analysis.ai_assessment ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <RiskChip level={analysis.ai_assessment.risk_level} />
                <span style={{ fontSize: 12.5, color: "var(--ink-faint)" }}>Confidence: {Math.round(analysis.ai_assessment.confidence * 100)}%</span>
                {analysis.ai_assessment.escalation_needed && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, background: "#FFF1F2", border: "1px solid #FDA4AF", fontSize: 12, fontWeight: 600, color: "#881337" }}>
                    ⚠ Escalation recommended
                  </span>
                )}
              </div>
              <div style={{ background: "var(--cream)", borderRadius: 12, padding: "14px 16px", borderLeft: "3px solid var(--saffron)" }}>
                <p style={{ fontSize: 14, color: "var(--ink)", lineHeight: 1.7 }}>{analysis.ai_assessment.signal_summary}</p>
              </div>
              {analysis.ai_assessment.signal_summary_np && (
                <p style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.7, fontStyle: "italic" }}>{analysis.ai_assessment.signal_summary_np}</p>
              )}
              {analysis.ai_assessment.primary_concerns?.length > 0 && (
                <div>
                  <p style={{ fontSize: 11.5, fontWeight: 600, color: "var(--ink-faint)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 10 }}>Primary concerns</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {analysis.ai_assessment.primary_concerns.map((c, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13.5, color: "var(--ink-muted)" }}>
                        <AlertTriangle size={14} color="var(--saffron)" style={{ marginTop: 2, flexShrink: 0 }} />
                        {c}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div style={{ padding: "14px 16px", background: "var(--indigo-light)", borderRadius: 12, border: "1px solid rgba(61,61,143,0.15)" }}>
                <p style={{ fontSize: 11.5, fontWeight: 600, color: "var(--indigo)", marginBottom: 6, letterSpacing: "0.03em" }}>RECOMMENDED ACTION</p>
                <p style={{ fontSize: 14, color: "#2A2A6A", lineHeight: 1.6 }}>{analysis.ai_assessment.recommended_action}</p>
              </div>
              {analysis.ai_assessment.trend_analysis && (
                <p style={{ fontSize: 13, color: "var(--ink-faint)", lineHeight: 1.6, padding: "12px 14px", background: "var(--cream)", borderRadius: 10 }}>
                  <span style={{ fontWeight: 600, color: "var(--ink-muted)" }}>Trend: </span>{analysis.ai_assessment.trend_analysis}
                </p>
              )}
            </div>
          ) : (
            <div>
              <div style={{ padding: "10px 14px", background: "var(--amber-light)", borderRadius: 10, marginBottom: 14, fontSize: 13, color: "var(--amber)" }}>
                AI analysis unavailable — showing rule-based assessment
              </div>
              <RiskChip level={analysis.rule_based?.risk_level} />
            </div>
          )}
        </Card>
      )}

      {/* Conversation starters */}
      <Card title="Conversation starters" action={
        <button
          onClick={loadStarters} disabled={loadingStarters}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: loadingStarters ? "var(--cream-dark)" : "var(--indigo-light)", color: loadingStarters ? "var(--ink-faint)" : "var(--indigo)", border: "1px solid rgba(61,61,143,0.2)", borderRadius: 10, fontSize: 12.5, fontWeight: 500, cursor: "pointer" }}
        >
          <Sparkles size={13} />
          {loadingStarters ? "Generating..." : "Generate"}
        </button>
      } style={{ marginBottom: 20 }}>
        {starters?.starters ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {starters.starters.map((s, i) => (
              <div key={i} style={{ padding: "14px 16px", background: "var(--cream)", borderRadius: 12, border: "1px solid var(--border)" }}>
                <p style={{ fontSize: 14, color: "var(--ink)", marginBottom: 6, lineHeight: 1.6 }}>{s.nepali}</p>
                <p style={{ fontSize: 12.5, color: "var(--ink-faint)", lineHeight: 1.5, fontStyle: "italic" }}>{s.english}</p>
                {s.context && <p style={{ fontSize: 11.5, color: "var(--ink-faint)", marginTop: 6 }}>↳ {s.context}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: 13.5, color: "var(--ink-faint)", lineHeight: 1.7 }}>
            Generate AI-powered Nepali conversation openers personalised to this student's recent mood and observations.
          </p>
        )}
      </Card>

      {/* Recent check-ins */}
      <Card title="Recent check-ins" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {checkins.slice().reverse().slice(0, 10).map((c, i, arr) => (
            <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "12px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <MoodPip value={c.mood} />
                  <span style={{ fontSize: 13, color: "var(--ink)" }}>Mood {c.mood}/5</span>
                  <span style={{ fontSize: 11.5, padding: "2px 8px", borderRadius: 6, background: "var(--cream-dark)", color: "var(--ink-muted)", textTransform: "capitalize" }}>{c.energy}</span>
                </div>
                {c.note && <p style={{ fontSize: 13, color: "var(--ink-faint)", lineHeight: 1.6 }}>{c.note}</p>}
              </div>
              <span style={{ fontSize: 11.5, color: "var(--ink-faint)", whiteSpace: "nowrap", marginLeft: 16 }}>{c.date}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Observations */}
      {observations.length > 0 && (
        <Card title="Teacher observations" style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {observations.map((o, i, arr) => (
              <div key={o.id} style={{ padding: "12px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 500, color: "var(--ink)" }}>{o.teacher}</span>
                  <span style={{ fontSize: 12, color: "var(--ink-faint)" }}>· {o.date}</span>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
                  {o.tags.map(t => (
                    <span key={t} style={{ padding: "3px 10px", borderRadius: 20, background: "var(--saffron-light)", border: "1px solid rgba(224,123,57,0.2)", fontSize: 11.5, fontWeight: 500, color: "var(--saffron-dark)" }}>
                      {TAG_LABELS[t] || t}
                    </span>
                  ))}
                </div>
                {o.note && <p style={{ fontSize: 13, color: "var(--ink-faint)", lineHeight: 1.6 }}>{o.note}</p>}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Interventions */}
      {interventions.length > 0 && (
        <Card title="Interventions">
          <div style={{ display: "flex", flexDirection: "column" }}>
            {interventions.map((iv, i, arr) => (
              <div key={iv.id} style={{ padding: "12px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 500, color: "var(--ink)" }}>{iv.counselor}</span>
                  <span style={{ fontSize: 12, color: "var(--ink-faint)" }}>· {iv.date}</span>
                  <span style={{ padding: "2px 10px", borderRadius: 20, fontSize: 11.5, fontWeight: 500, background: iv.status === "in_progress" ? "var(--indigo-light)" : "var(--cream-dark)", color: iv.status === "in_progress" ? "var(--indigo)" : "var(--ink-muted)" }}>
                    {iv.status.replace("_", " ")}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: "var(--ink-faint)", lineHeight: 1.6 }}>{iv.note}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="animate-fade-up" style={{ background: "#fff", borderRadius: 16, padding: "18px 20px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
      <p style={{ fontSize: 11.5, fontWeight: 600, color: "var(--ink-faint)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 10 }}>{label}</p>
      <div style={{ fontFamily: typeof value === "string" ? "'Fraunces', serif" : "inherit", fontSize: typeof value === "string" ? 28 : "inherit", fontWeight: 400, color: "var(--ink)" }}>{value}</div>
    </div>
  );
}

function Card({ title, action, children, style }) {
  return (
    <div style={{ background: "#fff", borderRadius: 18, padding: "22px 24px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", ...style }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{title}</p>
        {action}
      </div>
      {children}
    </div>
  );
}

function MoodPip({ value }) {
  const colors = { 1: "#EF4444", 2: "#F59E0B", 3: "#A8A29E", 4: "#22C55E", 5: "#3B82F6" };
  return <div style={{ width: 10, height: 10, borderRadius: "50%", background: colors[value] || "var(--ink-faint)", flexShrink: 0 }} />;
}
