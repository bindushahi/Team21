import { useState } from "react";
import { loginUser, verifyOtp } from "../api";
import { useAuth } from "../contexts/AuthContext";
import { Eye, EyeOff, ArrowRight, Shield } from "lucide-react";

export default function Login({ onSwitch }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState(null);
  const [sentVia, setSentVia] = useState(null);
  const [demoOtp, setDemoOtp] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handlePassword(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await loginUser({ email, password });
      setUserId(res.user_id);
      setSentVia(res.sent_via);
      setDemoOtp(res.demo_otp);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleOtp(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await verifyOtp({ user_id: userId, otp });
      login(res.token, res.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const cardStyle = {
    background: "#fff",
    borderRadius: 20,
    padding: "40px 36px",
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow-lg)",
    width: "100%",
    maxWidth: 400,
  };

  if (userId) {
    return (
      <AuthShell>
        <div style={cardStyle} className="animate-scale-in">
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16,
              background: "var(--saffron-light)", border: "1px solid rgba(224,123,57,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px",
            }}>
              <Shield size={22} color="var(--saffron)" strokeWidth={1.8} />
            </div>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 500, color: "var(--ink)", marginBottom: 6 }}>
              Verify your identity
            </h2>
            <p style={{ fontSize: 13.5, color: "var(--ink-faint)", lineHeight: 1.5 }}>
              {sentVia === "sms" ? "A 6-digit code has been sent to your phone." : "A 6-digit code has been generated below."}
            </p>
          </div>

          {demoOtp && (
            <div style={{
              background: "var(--amber-light)", border: "1px solid rgba(146,64,14,0.15)",
              borderRadius: 10, padding: "10px 14px", marginBottom: 20,
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <span style={{ fontSize: 12, color: "var(--amber)" }}>Demo mode — your OTP is:</span>
              <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 15, color: "var(--amber)", letterSpacing: "0.1em" }}>{demoOtp}</span>
            </div>
          )}

          <form onSubmit={handleOtp} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <input
              type="text"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              maxLength={6}
              autoFocus
              placeholder="000000"
              style={{
                width: "100%", padding: "14px 16px",
                border: "1.5px solid var(--border-strong)",
                borderRadius: 12,
                textAlign: "center",
                fontSize: 22,
                fontFamily: "monospace",
                letterSpacing: "0.3em",
                fontWeight: 600,
                color: "var(--ink)",
                background: "var(--cream)",
              }}
            />
            {error && <ErrorBanner msg={error} />}
            <Btn loading={loading} disabled={otp.length < 6}>Verify code</Btn>
          </form>

          <button
            onClick={() => { setUserId(null); setOtp(""); setDemoOtp(null); setError(""); }}
            style={{ display: "block", margin: "16px auto 0", fontSize: 13, color: "var(--ink-faint)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
          >
            Back to sign in
          </button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div style={cardStyle} className="animate-scale-in">
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: "var(--saffron)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18,
            }}>🎓</div>
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 500, color: "var(--ink)" }}>
              हाम्रो विद्यार्थी
            </span>
          </div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 400, color: "var(--ink)", marginBottom: 6, lineHeight: 1.2 }}>
            Welcome back
          </h1>
          <p style={{ fontSize: 13.5, color: "var(--ink-faint)" }}>Sign in to the student wellbeing system</p>
        </div>

        <form onSubmit={handlePassword} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 500, color: "var(--ink-muted)", marginBottom: 6, letterSpacing: "0.02em" }}>
              EMAIL
            </label>
            <input
              type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              required placeholder="you@school.edu.np"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 500, color: "var(--ink-muted)", marginBottom: 6, letterSpacing: "0.02em" }}>
              PASSWORD
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required placeholder="Enter your password"
                style={{ ...inputStyle, paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--ink-faint)", display: "flex" }}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && <ErrorBanner msg={error} />}
          <Btn loading={loading}>Sign in</Btn>
        </form>

        <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--border)", textAlign: "center" }}>
          <span style={{ fontSize: 13, color: "var(--ink-faint)" }}>Don't have an account? </span>
          <button onClick={onSwitch} style={{ fontSize: 13, fontWeight: 500, color: "var(--saffron)", background: "none", border: "none", cursor: "pointer" }}>
            Register
          </button>
        </div>
      </div>
    </AuthShell>
  );
}

function AuthShell({ children }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--cream)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      position: "relative",
    }}>
      {/* Decorative blobs */}
      <div style={{
        position: "fixed", top: -120, right: -120,
        width: 480, height: 480, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(224,123,57,0.12) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "fixed", bottom: -120, left: -120,
        width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(61,61,143,0.10) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{ position: "relative", zIndex: 1, width: "100%" , display: "flex", justifyContent: "center" }}>
        {children}
      </div>
    </div>
  );
}

function Btn({ children, loading, disabled }) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      style={{
        width: "100%", padding: "13px 20px",
        background: (loading || disabled) ? "var(--cream-dark)" : "var(--ink)",
        color: (loading || disabled) ? "var(--ink-faint)" : "#fff",
        border: "none", borderRadius: 12,
        fontSize: 14, fontWeight: 500,
        cursor: (loading || disabled) ? "not-allowed" : "pointer",
        transition: "all 0.2s",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        letterSpacing: "-0.01em",
      }}
    >
      {children}
      {!loading && !disabled && <ArrowRight size={15} strokeWidth={2} />}
    </button>
  );
}

function ErrorBanner({ msg }) {
  return (
    <div style={{
      background: "var(--red-light)", border: "1px solid rgba(153,27,27,0.15)",
      borderRadius: 10, padding: "10px 14px",
      fontSize: 13, color: "var(--red)",
    }}>
      {msg}
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "11px 14px",
  border: "1.5px solid var(--border-strong)",
  borderRadius: 10, fontSize: 14,
  color: "var(--ink)", background: "#fff",
  transition: "all 0.2s",
};
