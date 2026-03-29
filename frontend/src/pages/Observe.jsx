import { useEffect, useState } from "react";
import { getStudents, submitObservation } from "../api";
import { useAuth } from "../contexts/AuthContext";
import { CheckCircle2, ChevronDown } from "lucide-react";

const TAGS = [
  { id: "grade_drop",  label: "Grade drop",  emoji: "📉" },
  { id: "distracted",  label: "Distracted",  emoji: "💭" },
  { id: "withdrawn",   label: "Withdrawn",   emoji: "🚪" },
  { id: "absent",      label: "Absent",      emoji: "📅" },
  { id: "aggressive",  label: "Aggressive",  emoji: "⚡" },
  { id: "tearful",     label: "Tearful",     emoji: "💧" },
  { id: "isolated",    label: "Isolated",    emoji: "🧍" },
  { id: "disruptive",  label: "Disruptive",  emoji: "🔊" },
];

export default function Observe() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { getStudents().then(setStudents).catch(console.error); }, []);

  function toggleTag(tagId) {
    setSelectedTags(prev => prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!studentId || selectedTags.length === 0) return;
    setSubmitting(true);
    try {
      await submitObservation({ student_id: studentId, teacher: user?.full_name || "", tags: selectedTags, note });
      setSubmitted(true);
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  }

  if (submitted) {
    return (
      <div className="animate-fade-up" style={{ maxWidth: 520, margin: "0 auto", paddingTop: 32 }}>
        <div style={{ background: "#fff", borderRadius: 20, padding: 36, border: "1px solid var(--border)", boxShadow: "var(--shadow-md)", textAlign: "center" }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", background: "var(--emerald-light)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
            <CheckCircle2 size={28} color="var(--emerald)" strokeWidth={1.5} />
          </div>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 500, color: "var(--ink)", marginBottom: 8 }}>Observation recorded</h2>
          <p style={{ fontSize: 13.5, color: "var(--ink-faint)", marginBottom: 6 }}>
            {selectedTags.length} behaviour{selectedTags.length > 1 ? "s" : ""} logged for {students.find(s => s.id === studentId)?.name || "student"}
          </p>
          <p style={{ fontSize: 12.5, color: "var(--ink-faint)", marginBottom: 24 }}>Thank you for looking out for your students</p>
          <button
            onClick={() => { setStudentId(""); setSelectedTags([]); setNote(""); setSubmitted(false); }}
            style={{ padding: "11px 24px", background: "var(--ink)", color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 500, cursor: "pointer" }}
          >
            Log another observation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up" style={{ maxWidth: 560, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 400, color: "var(--ink)", marginBottom: 4 }}>Log observation</h1>
        <p style={{ fontSize: 14, color: "var(--ink-faint)" }}>Record behavioural observations for a student</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Card>
          <SectionLabel>Select student</SectionLabel>
          <div style={{ position: "relative" }}>
            <select
              value={studentId}
              onChange={e => setStudentId(e.target.value)}
              style={{ width: "100%", padding: "12px 40px 12px 14px", border: "1.5px solid var(--border-strong)", borderRadius: 10, fontSize: 14, color: "var(--ink)", background: "#fff", appearance: "none", cursor: "pointer" }}
            >
              <option value="">Choose a student...</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name} — Class {s.class}</option>)}
            </select>
            <ChevronDown size={16} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "var(--ink-faint)", pointerEvents: "none" }} />
          </div>
        </Card>

        <Card>
          <SectionLabel>What did you notice?</SectionLabel>
          <p style={{ fontSize: 12.5, color: "var(--ink-faint)", marginBottom: 14, marginTop: -6 }}>Select all that apply</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {TAGS.map(tag => {
              const active = selectedTags.includes(tag.id);
              return (
                <button
                  key={tag.id} type="button" onClick={() => toggleTag(tag.id)}
                  style={{
                    padding: "12px 8px", borderRadius: 12,
                    border: `2px solid ${active ? "var(--saffron)" : "var(--border)"}`,
                    background: active ? "var(--saffron-light)" : "#fff",
                    cursor: "pointer", transition: "all 0.15s",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                    transform: active ? "translateY(-1px)" : "none",
                  }}
                >
                  <span style={{ fontSize: 18 }}>{tag.emoji}</span>
                  <span style={{ fontSize: 11, fontWeight: active ? 600 : 400, color: active ? "var(--saffron-dark)" : "var(--ink-muted)" }}>{tag.label}</span>
                </button>
              );
            })}
          </div>
          {selectedTags.length > 0 && (
            <div style={{ marginTop: 14, padding: "10px 14px", background: "var(--saffron-light)", borderRadius: 10, border: "1px solid rgba(224,123,57,0.2)" }}>
              <p style={{ fontSize: 12, color: "var(--saffron-dark)" }}>
                Selected: {selectedTags.map(id => TAGS.find(t => t.id === id)?.label).join(", ")}
              </p>
            </div>
          )}
        </Card>

        <Card>
          <SectionLabel>Additional notes <span style={{ fontWeight: 400, color: "var(--ink-faint)", textTransform: "none", letterSpacing: 0 }}>(optional)</span></SectionLabel>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            rows={3}
            placeholder="Any context that might help the counselor..."
            style={{ width: "100%", padding: "11px 14px", border: "1.5px solid var(--border-strong)", borderRadius: 10, fontSize: 14, color: "var(--ink)", background: "#fff", resize: "none", fontFamily: "inherit", lineHeight: 1.6 }}
          />
        </Card>

        <button
          type="submit"
          disabled={!studentId || selectedTags.length === 0 || submitting}
          style={{
            padding: "14px 24px",
            background: (!studentId || selectedTags.length === 0 || submitting) ? "var(--cream-dark)" : "var(--ink)",
            color: (!studentId || selectedTags.length === 0 || submitting) ? "var(--ink-faint)" : "#fff",
            border: "none", borderRadius: 14, fontSize: 14.5, fontWeight: 500,
            cursor: (!studentId || selectedTags.length === 0 || submitting) ? "not-allowed" : "pointer",
            transition: "all 0.2s",
          }}
        >
          {submitting ? "Submitting..." : "Submit observation"}
        </button>
      </form>
    </div>
  );
}

function Card({ children }) {
  return <div style={{ background: "#fff", borderRadius: 16, padding: "20px 22px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>{children}</div>;
}
function SectionLabel({ children }) {
  return <p style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 12 }}>{children}</p>;
}
