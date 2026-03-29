import { useState } from "react";
import { requestElevate, verifyElevate } from "../api";
import { useAuth } from "../contexts/AuthContext";
import { ShieldCheck, Lock } from "lucide-react";

export default function OtpGate({ children }) {
  const { elevated, elevate } = useAuth();
  const [otp, setOtp] = useState("");
  const [sentVia, setSentVia] = useState(null);
  const [demoOtp, setDemoOtp] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [requested, setRequested] = useState(false);

  if (elevated) return children;

  async function handleRequest() {
    setError(""); setLoading(true);
    try {
      const res = await requestElevate();
      setSentVia(res.sent_via); setDemoOtp(res.demo_otp); setRequested(true);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  async function handleVerify(e) {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const res = await verifyElevate(otp);
      elevate(res.token);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
      <div className="animate-scale-in" style={{
        background: "#fff", borderRadius: 20, padding: "40px 36px",
        border: "1px solid var(--border)", boxShadow: "var(--shadow-md)",
        width: "100%", maxWidth: 360, textAlign: "center",
      }}>
        <div style={{
          width: 54, height: 54, borderRadius: 16,
          background: "var(--indigo-light)", border: "1px solid rgba(61,61,143,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 18px",
        }}>
          <Lock size={22} color="var(--indigo)" strokeWidth={1.8} />
        </div>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 500, color: "var(--ink)", marginBottom: 8 }}>
          Verification required
        </h2>
        <p style={{ fontSize: 13.5, color: "var(--ink-faint)", lineHeight: 1.6, marginBottom: 24 }}>
          This section contains sensitive student data. Verify your identity with an OTP to continue.
        </p>

        {!requested ? (
          <button
            onClick={handleRequest} disabled={loading}
            style={{
              width: "100%", padding: "13px 20px",
              background: "var(--indigo)", color: "#fff",
              border: "none", borderRadius: 12,
              fontSize: 14, fontWeight: 500, cursor: "pointer",
              opacity: loading ? 0.6 : 1, transition: "all 0.2s",
            }}
          >
            {loading ? "Sending code..." : "Send verification code"}
          </button>
        ) : (
          <form onSubmit={handleVerify} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {demoOtp && (
              <div style={{
                background: "var(--amber-light)", border: "1px solid rgba(146,64,14,0.15)",
                borderRadius: 10, padding: "10px 14px", textAlign: "left",
                display: "flex", gap: 10, alignItems: "center",
              }}>
                <span style={{ fontSize: 12, color: "var(--amber)" }}>Demo OTP:</span>
                <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 15, color: "var(--amber)", letterSpacing: "0.1em" }}>{demoOtp}</span>
              </div>
            )}
            <input
              type="text" value={otp}
              onChange={e => setOtp(e.target.value)}
              maxLength={6} autoFocus placeholder="000000"
              style={{
                padding: "14px", border: "1.5px solid var(--border-strong)",
                borderRadius: 12, textAlign: "center",
                fontSize: 22, fontFamily: "monospace",
                letterSpacing: "0.3em", fontWeight: 600,
                color: "var(--ink)", background: "var(--cream)",
              }}
            />
            {error && (
              <div style={{ background: "var(--red-light)", border: "1px solid rgba(153,27,27,0.15)", borderRadius: 10, padding: "10px", fontSize: 13, color: "var(--red)" }}>
                {error}
              </div>
            )}
            <button
              type="submit" disabled={loading || otp.length < 6}
              style={{
                padding: "13px", background: (loading || otp.length < 6) ? "var(--cream-dark)" : "var(--indigo)",
                color: (loading || otp.length < 6) ? "var(--ink-faint)" : "#fff",
                border: "none", borderRadius: 12, fontSize: 14, fontWeight: 500,
                cursor: (loading || otp.length < 6) ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "all 0.2s",
              }}
            >
              {loading ? "Verifying..." : <><ShieldCheck size={15} /> Verify & unlock</>}
            </button>
          </form>
        )}
        {error && !requested && (
          <p style={{ marginTop: 12, fontSize: 13, color: "var(--red)" }}>{error}</p>
        )}
      </div>
    </div>
  );
}
