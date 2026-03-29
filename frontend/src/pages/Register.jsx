import { useState } from "react";
import { registerUser } from "../api";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const inputStyle = {
  width: "100%", padding: "11px 14px",
  border: "1.5px solid var(--border-strong)",
  borderRadius: 10, fontSize: 14,
  color: "var(--ink)", background: "#fff",
  transition: "all 0.2s",
};

export default function Register({ onSwitch }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("teacher");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await registerUser({ email, full_name: fullName, phone_number: phone, password, role });
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <AuthShell>
        <div style={cardStyle} className="animate-scale-in">
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%",
              background: "var(--emerald-light)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px",
            }}>
              <CheckCircle2 size={26} color="var(--emerald)" strokeWidth={1.8} />
            </div>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 500, color: "var(--ink)", marginBottom: 10 }}>
              Registration submitted
            </h2>
            <p style={{ fontSize: 13.5, color: "var(--ink-faint)", lineHeight: 1.6, marginBottom: 24 }}>
              Your account is pending admin approval. You'll be able to sign in once approved.
            </p>
            <button
              onClick={onSwitch}
              style={{
                padding: "11px 24px", background: "var(--ink)", color: "#fff",
                border: "none", borderRadius: 12, fontSize: 14, fontWeight: 500, cursor: "pointer",
              }}
            >
              Back to sign in
            </button>
          </div>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div style={{ ...cardStyle, maxWidth: 420 }} className="animate-scale-in">
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--saffron)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>🎓</div>
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: 15, fontWeight: 500, color: "var(--ink)" }}>हाम्रो विद्यार्थी</span>
          </div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 400, color: "var(--ink)", marginBottom: 4 }}>Create account</h1>
          <p style={{ fontSize: 13.5, color: "var(--ink-faint)" }}>Your account will need admin approval before access.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 13 }}>
          <Field label="FULL NAME">
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required placeholder="Ram Kumar Shrestha" style={inputStyle} />
          </Field>
          <Field label="EMAIL">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@school.edu.np" style={inputStyle} />
          </Field>
          <Field label="PHONE NUMBER" hint="OTP will be sent to this number">
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required placeholder="+977 98XXXXXXXX" style={inputStyle} />
          </Field>
          <Field label="PASSWORD">
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} placeholder="At least 6 characters" style={inputStyle} />
          </Field>

          <div>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 500, color: "var(--ink-muted)", marginBottom: 8, letterSpacing: "0.02em" }}>I AM A</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {["teacher", "counselor"].map(r => (
                <button
                  key={r} type="button" onClick={() => setRole(r)}
                  style={{
                    padding: "11px 16px", borderRadius: 10, border: "1.5px solid",
                    borderColor: role === r ? "var(--saffron)" : "var(--border-strong)",
                    background: role === r ? "var(--saffron-light)" : "#fff",
                    color: role === r ? "var(--saffron-dark)" : "var(--ink-muted)",
                    fontSize: 13.5, fontWeight: role === r ? 500 : 400,
                    cursor: "pointer", textTransform: "capitalize",
                    transition: "all 0.15s",
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div style={{ background: "var(--red-light)", border: "1px solid rgba(153,27,27,0.15)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "var(--red)" }}>
              {error}
            </div>
          )}

          <button
            type="submit" disabled={loading}
            style={{
              padding: "13px 20px", background: loading ? "var(--cream-dark)" : "var(--ink)",
              color: loading ? "var(--ink-faint)" : "#fff",
              border: "none", borderRadius: 12, fontSize: 14, fontWeight: 500,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "all 0.2s",
            }}
          >
            {loading ? "Submitting..." : "Register"}
            {!loading && <ArrowRight size={15} />}
          </button>
        </form>

        <div style={{ marginTop: 18, paddingTop: 18, borderTop: "1px solid var(--border)", textAlign: "center" }}>
          <span style={{ fontSize: 13, color: "var(--ink-faint)" }}>Already have an account? </span>
          <button onClick={onSwitch} style={{ fontSize: 13, fontWeight: 500, color: "var(--saffron)", background: "none", border: "none", cursor: "pointer" }}>
            Sign in
          </button>
        </div>
      </div>
    </AuthShell>
  );
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12.5, fontWeight: 500, color: "var(--ink-muted)", marginBottom: 6, letterSpacing: "0.02em" }}>{label}</label>
      {children}
      {hint && <p style={{ fontSize: 11.5, color: "var(--ink-faint)", marginTop: 4 }}>{hint}</p>}
    </div>
  );
}

function AuthShell({ children }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, position: "relative" }}>
      <div style={{ position: "fixed", top: -120, right: -120, width: 480, height: 480, borderRadius: "50%", background: "radial-gradient(circle, rgba(224,123,57,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: -120, left: -120, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(61,61,143,0.10) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "relative", zIndex: 1, width: "100%", display: "flex", justifyContent: "center" }}>{children}</div>
    </div>
  );
}

const cardStyle = {
  background: "#fff", borderRadius: 20, padding: "40px 36px",
  border: "1px solid var(--border)", boxShadow: "var(--shadow-lg)",
  width: "100%", maxWidth: 400,
};
