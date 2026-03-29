import { useState, useEffect } from "react";
import { getStudents, submitCheckin } from "../api";
import { CheckCircle2, ChevronDown } from "lucide-react";

const MOODS = [
  { value: 1, label: "Struggling", emoji: "😔", color: "#991B1B", bg: "#FEF2F2", border: "#FCA5A5" },
  { value: 2, label: "Not great",  emoji: "😕", color: "#92400E", bg: "#FFFBEB", border: "#FCD34D" },
  { value: 3, label: "Okay",       emoji: "😐", color: "#57534E", bg: "#F7F3EE", border: "#D6D3D1" },
  { value: 4, label: "Good",       emoji: "🙂", color: "#166534", bg: "#F0FDF4", border: "#86EFAC" },
  { value: 5, label: "Great",      emoji: "😊", color: "#1E3A5F", bg: "#EFF6FF", border: "#93C5FD" },
];

const ENERGY = [
  { value: "low",    label: "Low",    desc: "Tired or disengaged" },
  { value: "medium", label: "Medium", desc: "Somewhat present" },
  { value: "high",   label: "High",   desc: "Alert and engaged" },
];

export default function CheckIn() {
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [mood, setMood] = useState(null);
  const [energy, setEnergy] = useState(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [noteAnalysis, setNoteAnalysis] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => { getStudents().then(setStudents).catch(console.error); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!studentId || !mood || !energy) return;
    setSubmitting(true); setError("");
    try {
      const res = await submitCheckin({ student_id: studentId, mood, energy, note });
      setNoteAnalysis(res.note_analysis);
      setSubmitted(true);
    } catch (err) { setError(err.message); }
    finally { setSubmitting(false); }
  }

  function handleReset() {
    setStudentId(""); setMood(null); setEnergy(null);
    setNote(""); setSubmitted(false); setNoteAnalysis(null); setError("");
  }

  if (submitted) {
    const name = students.find(s => s.id === studentId)?.name || "Student";
    const moodData = MOODS.find(m => m.value === mood);
    return (
      <div className="animate-fade-up" style={{ maxWidth: 520, margin: "0 auto", paddingTop: 32 }}>
        <div style={{ background: "#fff", borderRadius: 20, padding: 36, border: "1px solid var(--border)", boxShadow: "var(--shadow-md)", textAlign: "center" }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", background: "var(--emerald-light)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
            <CheckCircle2 size={28} color="var(--emerald)" strokeWidth={1.5} />
          </div>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 500, color: "var(--ink)", marginBottom: 6 }}>
            Check-in recorded
          </h2>
          <p style={{ fontSize: 13.5, color: "var(--ink-faint)", marginBottom: 20 }}>
            {name} · Mood {mood}/5 · {energy} energy
          </p>

          {noteAnalysis?.distress_detected && (
            <div style={{
              background: noteAnalysis.severity === "crisis" ? "var(--red-light)" : "var(--amber-light)",
              border: `1px solid ${noteAnalysis.severity === "crisis" ? "rgba(153,27,27,0.2)" : "rgba(146,64,14,0.2)"}`,
              borderRadius: 12, padding: "14px 16px", marginBottom: 20, textAlign: "left",
            }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: noteAnalysis.severity === "crisis" ? "var(--red)" : "var(--amber)", marginBottom: 4 }}>
                ⚠ Note analysis: {noteAnalysis.severity} concern detected
              </p>
              {noteAnalysis.english_translation && (
                <p style={{ fontSize: 12.5, color: "var(--ink-muted)" }}>{noteAnalysis.english_translation}</p>
              )}
            </div>
          )}

          <button
            onClick={handleReset}
            style={{
              padding: "11px 24px", background: "var(--ink)", color: "#fff",
              border: "none", borderRadius: 12, fontSize: 14, fontWeight: 500, cursor: "pointer",
            }}
          >
            Check in another student
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up" style={{ maxWidth: 560, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 400, color: "var(--ink)", marginBottom: 4 }}>
          Student check-in
        </h1>
        <p style={{ fontSize: 14, color: "var(--ink-faint)" }}>Record a student's mood and energy for today</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Student selector */}
        <Card>
          <SectionLabel>Select student</SectionLabel>
          <div style={{ position: "relative" }}>
            <select
              value={studentId}
              onChange={e => setStudentId(e.target.value)}
              style={{
                width: "100%", padding: "12px 40px 12px 14px",
                border: "1.5px solid var(--border-strong)", borderRadius: 10,
                fontSize: 14, color: "var(--ink)", background: "#fff",
                appearance: "none", cursor: "pointer",
              }}
            >
              <option value="">Choose a student...</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name} — Class {s.class}</option>
              ))}
            </select>
            <ChevronDown size={16} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "var(--ink-faint)", pointerEvents: "none" }} />
          </div>
        </Card>

        {/* Mood selector */}
        <Card>
          <SectionLabel>How are they feeling?</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
            {MOODS.map(m => (
              <button
                key={m.value} type="button"
                onClick={() => setMood(m.value)}
                style={{
                  padding: "12px 8px",
                  borderRadius: 12,
                  border: `2px solid ${mood === m.value ? m.border : "var(--border)"}`,
                  background: mood === m.value ? m.bg : "#fff",
                  cursor: "pointer", transition: "all 0.15s",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                  transform: mood === m.value ? "translateY(-2px)" : "none",
                  boxShadow: mood === m.value ? "var(--shadow-sm)" : "none",
                }}
              >
                <span style={{ fontSize: 22 }}>{m.emoji}</span>
                <span style={{ fontSize: 11, fontWeight: mood === m.value ? 600 : 400, color: mood === m.value ? m.color : "var(--ink-faint)" }}>{m.label}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Energy selector */}
        <Card>
          <SectionLabel>Energy level</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {ENERGY.map(e => (
              <button
                key={e.value} type="button"
                onClick={() => setEnergy(e.value)}
                style={{
                  padding: "14px 12px",
                  borderRadius: 12,
                  border: `2px solid ${energy === e.value ? "var(--saffron)" : "var(--border)"}`,
                  background: energy === e.value ? "var(--saffron-light)" : "#fff",
                  cursor: "pointer", transition: "all 0.15s",
                  textAlign: "center",
                }}
              >
                <p style={{ fontSize: 13.5, fontWeight: 500, color: energy === e.value ? "var(--saffron-dark)" : "var(--ink)", marginBottom: 3 }}>{e.label}</p>
                <p style={{ fontSize: 11, color: energy === e.value ? "var(--saffron)" : "var(--ink-faint)" }}>{e.desc}</p>
              </button>
            ))}
          </div>
        </Card>

        {/* Notes */}
        <Card>
          <SectionLabel>Notes <span style={{ fontWeight: 400, color: "var(--ink-faint)", textTransform: "none", letterSpacing: 0 }}>(optional)</span></SectionLabel>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            rows={3}
            placeholder="Any observations or student comments... (Nepali is supported)"
            style={{
              width: "100%", padding: "11px 14px",
              border: "1.5px solid var(--border-strong)", borderRadius: 10,
              fontSize: 14, color: "var(--ink)", background: "#fff",
              resize: "none", fontFamily: "inherit", lineHeight: 1.6,
            }}
          />
          <p style={{ fontSize: 11.5, color: "var(--ink-faint)", marginTop: 6 }}>AI will analyze this note for distress signals if provided.</p>
        </Card>

        {error && (
          <div style={{ background: "var(--red-light)", border: "1px solid rgba(153,27,27,0.15)", borderRadius: 10, padding: "12px 14px", fontSize: 13, color: "var(--red)" }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!studentId || !mood || !energy || submitting}
          style={{
            padding: "14px 24px",
            background: (!studentId || !mood || !energy || submitting) ? "var(--cream-dark)" : "var(--ink)",
            color: (!studentId || !mood || !energy || submitting) ? "var(--ink-faint)" : "#fff",
            border: "none", borderRadius: 14, fontSize: 14.5, fontWeight: 500,
            cursor: (!studentId || !mood || !energy || submitting) ? "not-allowed" : "pointer",
            transition: "all 0.2s", letterSpacing: "-0.01em",
          }}
        >
          {submitting ? "Saving check-in..." : "Submit check-in"}
        </button>
      </form>
    </div>
  );
}

function Card({ children }) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: "20px 22px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
      {children}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <p style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 12 }}>
      {children}
    </p>
  );
}
