import { useState } from "react";
import { loginUser, verifyOtp } from "../api";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../i18n";

export default function Login({ onSwitch }) {
  const { login } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  // ---------- OTP SCREEN ----------
  if (userId) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6 bg-cover bg-center"
        style={{ backgroundImage: "url('/LandingBg.png')" }}
      >
        <div className="w-full max-w-sm bg-white/30 backdrop-blur-md border border-white/20 rounded-xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-black tracking-tight">
              {t("auth_enter_otp")}
            </h1>
            <p className="text-sm text-black/80 mt-1">
              {sentVia === "sms" ? t("auth_otp_sent_sms") : t("auth_otp_generated")}
            </p>
          </div>

          {sentVia === "sms" && (
            <div className="bg-emerald-50/30 border border-emerald-200/40 rounded-lg px-3 py-2 mb-4">
              <p className="text-xs text-emerald-700">{t("auth_check_phone")}</p>
            </div>
          )}

          {demoOtp && (
            <div className="bg-amber-50/30 border border-amber-200/40 rounded-lg px-3 py-2 mb-4">
              <p className="text-xs text-amber-700">
                {t("auth_demo_otp")}{" "}
                <span className="font-mono font-bold">{demoOtp}</span>
              </p>
            </div>
          )}

          <form onSubmit={handleOtp} className="space-y-4">
            <div>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                autoFocus
                className="w-full px-3 py-3 border border-white/40 rounded-lg text-center text-lg font-mono tracking-widest focus:outline-none focus:border-black bg-black/10 text-black placeholder-black/70"
                placeholder="000000"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-600/20 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors"
            >
              {loading ? t("auth_verifying") : t("auth_verify")}
            </button>
          </form>

          <p className="text-center text-sm text-white/70 mt-6">
            <button
              onClick={() => {
                setUserId(null);
                setOtp("");
                setDemoOtp(null);
                setSentVia(null);
                setError("");
              }}
              className="text-black font-medium hover:underline"
            >
              {t("auth_back_signin")}
            </button>
          </p>
        </div>
      </div>
    );
  }

  // ---------- LOGIN SCREEN ----------
  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 bg-cover bg-center"
      style={{ backgroundImage: "url('/LandingBg.png')" }}
    >
      <div className="w-full max-w-sm bg-white/30 backdrop-blur-md border border-white/20 rounded-xl p-8 shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-black tracking-tight">
            {t("app_title")}
          </h1>
          <p className="text-sm text-black/80 mt-1">{t("app_subtitle")}</p>
        </div>

        <form onSubmit={handlePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black/90 mb-1">{t("auth_email")}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2.5 border border-black/40 rounded-lg text-sm text-black placeholder-gray/70 focus:outline-none focus:border-white/80 bg-white/10"
              placeholder={t("auth_email_placeholder")}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black/90 mb-1">{t("auth_password")}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2.5 border border-black/40 rounded-lg text-sm text-black placeholder-gray/70 focus:outline-none focus:border-white/80 bg-white/10"
              placeholder={t("auth_password_placeholder")}
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-600/20 px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-black disabled:opacity-50 transition-colors"
          >
            {loading ? t("auth_signing_in") : t("auth_sign_in")}
          </button>
        </form>

        <p className="text-center text-sm text-black/70 mt-6">
          {t("auth_no_account")}{" "}
          <button onClick={onSwitch} className="text-blue-600 font-medium hover:underline">
            {t("auth_register")}
          </button>
        </p>
      </div>
    </div>
  );
}
