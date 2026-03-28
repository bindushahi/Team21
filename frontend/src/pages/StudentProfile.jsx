import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getStudent,
  getStudentCheckins,
  getObservations,
  getInterventions,
  analyzeRisk,
  getConversationStarters,
  getWatchlist,
} from "../api";
import {
  ArrowLeft,
  MessageCircle,
  TrendingDown,
  TrendingUp,
  Minus,
  Loader2,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

// Tag labels
const TAG_LABELS = {
  grade_drop: "Grade drop",
  distracted: "Distracted",
  withdrawn: "Withdrawn",
  absent: "Absent",
  aggressive: "Aggressive",
  tearful: "Tearful",
};

// Risk alert component
function RiskAlert({ level }) {
  const colors =
    level === "high" || level === "crisis"
      ? "bg-red-50 border-red-500 text-red-700 animate-pulse"
      : "bg-yellow-50 border-yellow-500 text-yellow-700 animate-pulse";

  return (
    <div className={`p-4 rounded-xl mb-6 border-l-4 ${colors} shadow-md`}>
      <p className="text-sm font-medium">
        This student may be experiencing distress. Consider follow-up.
      </p>
    </div>
  );
}

export default function StudentProfile() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [checkins, setCheckins] = useState([]);
  const [observations, setObservations] = useState([]);
  const [interventions, setInterventions] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [starters, setStarters] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [loadingStarters, setLoadingStarters] = useState(false);

  useEffect(() => {
    // fetch student + checkins + observations + interventions + watchlist
    Promise.all([
      getStudent(id),
      getStudentCheckins(id),
      getObservations(id),
      getInterventions(id),
      getWatchlist(),
    ])
      .then(([s, c, o, i, w]) => {
        setStudent(s);
        setCheckins(c);
        setObservations(o);
        setInterventions(i);
        setWatchlist(w);
      })
      .catch(console.error);
  }, [id]);

  async function runAnalysis() {
    setLoadingAI(true);
    try {
      const result = await analyzeRisk(id);
      setAnalysis(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAI(false);
    }
  }

  async function loadStarters() {
    setLoadingStarters(true);
    try {
      const result = await getConversationStarters(id);
      setStarters(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStarters(false);
    }
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-gray-400">Loading...</p>
      </div>
    );
  }

  // Risk level from AI or rule-based
  const riskLevel =
    analysis?.ai_assessment?.risk_level ||
    analysis?.rule_based?.risk_level ||
    "low";

  // Check if the student is in the watchlist
  const onWatchlist = watchlist.some(
    (w) => w.id === student.id || w.name === student.name
  );

  // Prepare chart data
  const chartData = checkins.map((c) => ({
    date: c.date.slice(5),
    mood: c.mood,
  }));

  const last3 = checkins.slice(-3);
  const avgRecent =
    last3.length > 0
      ? (last3.reduce((s, c) => s + c.mood, 0) / last3.length).toFixed(1)
      : "—";

  const trendIcon =
    checkins.length >= 4
      ? (() => {
          const r = checkins.slice(-3).reduce((s, c) => s + c.mood, 0) / 3;
          const e =
            checkins.slice(-6, -3).reduce((s, c) => s + c.mood, 0) /
            Math.min(3, checkins.slice(-6, -3).length || 1);
          if (r - e < -0.5) return TrendingDown;
          if (r - e > 0.5) return TrendingUp;
          return Minus;
        })()
      : Minus;
  const TrendIcon = trendIcon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6 font-sans">
      {/* Back Link */}
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Back to dashboard
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{student.name}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Class {student.class} · Age {student.age}
          </p>
        </div>
        <button
          onClick={runAnalysis}
          disabled={loadingAI}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {loadingAI && <Loader2 size={14} className="animate-spin" />}
          {loadingAI ? "Analyzing..." : "Run AI Analysis"}
        </button>
      </div>

      {/* Risk Alert - ONLY if student is on watchlist and risk moderate/high/crisis */}
      {onWatchlist &&
        ["moderate", "high", "crisis"].includes(riskLevel) && (
          <RiskAlert level={riskLevel} />
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow hover:shadow-lg transition-transform hover:-translate-y-1">
          <p className="text-xs text-gray-400 mb-1">Recent Avg. Mood</p>
          <p className="text-2xl font-bold text-gray-900">
            {avgRecent} <span className="text-gray-300 text-base font-normal">/ 5</span>
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow hover:shadow-lg transition-transform hover:-translate-y-1">
          <p className="text-xs text-gray-400 mb-1">Trend</p>
          <div className="flex items-center gap-2">
            <TrendIcon size={20} className="text-gray-500" />
            <span className="text-sm text-gray-700">
              {TrendIcon === TrendingDown
                ? "Declining"
                : TrendIcon === TrendingUp
                ? "Improving"
                : "Stable"}
            </span>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow hover:shadow-lg transition-transform hover:-translate-y-1">
          <p className="text-xs text-gray-400 mb-1">Check-ins (14d)</p>
          <p className="text-2xl font-bold text-gray-900">{checkins.length}</p>
        </div>
      </div>

      {/* Mood Chart */}
      {chartData.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-8 shadow hover:shadow-lg transition-transform hover:-translate-y-1">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Mood History</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                axisLine={{ stroke: "#E5E7EB" }}
                tickLine={false}
              />
              <YAxis
                domain={[1, 5]}
                ticks={[1, 2, 3, 4, 5]}
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                axisLine={{ stroke: "#E5E7EB" }}
                tickLine={false}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: "1px solid #E5E7EB",
                  boxShadow: "none",
                }}
              />
              <Line
                type="monotone"
                dataKey="mood"
                stroke="#4F46E5"
                strokeWidth={3}
                dot={{ r: 5, fill: "#4F46E5" }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Conversation Starters */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-8 shadow hover:shadow-lg transition-transform hover:-translate-y-1">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900">Conversation Starters</h2>
          <button
            onClick={loadStarters}
            disabled={loadingStarters}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <MessageCircle size={14} />
            {loadingStarters ? "Generating..." : "Generate"}
          </button>
        </div>
        {starters?.starters ? (
          <div className="space-y-3">
            {starters.starters.map((s, i) => (
              <div key={i} className="p-3 bg-indigo-50 rounded-lg">
                <p className="text-sm text-gray-900">{s.nepali}</p>
                <p className="text-xs text-gray-500 mt-1">{s.english}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">
            Click Generate to get AI-powered conversation openers for this student.
          </p>
        )}
      </div>

      {/* Recent Check-ins */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-8 shadow hover:shadow-lg transition-transform hover:-translate-y-1">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Recent Check-ins</h2>
        <div className="space-y-2">
          {checkins.slice().reverse().slice(0, 10).map((c) => (
            <div
              key={c.id}
              className="flex items-start justify-between py-2 px-3 border rounded-lg border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">Mood: {c.mood}/5</span>
                  <span className="text-xs text-gray-400">Energy: {c.energy}</span>
                </div>
                {c.note && <p className="text-sm text-gray-500 mt-1">{c.note}</p>}
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap ml-4">{c.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Teacher Observations */}
      {observations.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-8 shadow hover:shadow-lg transition-transform hover:-translate-y-1">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Teacher Observations</h2>
          <div className="space-y-3">
            {observations.map((o) => (
              <div key={o.id} className="py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-700">{o.teacher}</span>
                  <span className="text-xs text-gray-400">{o.date}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-1">
                  {o.tags.map((t) => (
                    <span key={t} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                      {TAG_LABELS[t] || t}
                    </span>
                  ))}
                </div>
                {o.note && <p className="text-sm text-gray-500">{o.note}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interventions */}
      {interventions.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow hover:shadow-lg transition-transform hover:-translate-y-1">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Interventions</h2>
          <div className="space-y-3">
            {interventions.map((i) => (
              <div key={i.id} className="py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-700">{i.counselor}</span>
                  <span className="text-xs text-gray-400">{i.date}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      i.status === "in_progress"
                        ? "bg-blue-50 text-blue-600"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {i.status.replace("_", " ")}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{i.note}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}