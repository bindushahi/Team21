import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { getStudents, getWatchlist } from "../api";
import {
  AlertTriangle,
  ChevronRight,
  Search,
  Users,
  TrendingDown,
  ShieldCheck,
  Clock,
} from "lucide-react";

// ── Risk Styles ─────────────────────────────────────────────────────────────
const RISK_STYLE = {
  low:      "bg-emerald-50 text-emerald-700 border border-emerald-100",
  moderate: "bg-amber-50 text-amber-700 border border-amber-100",
  high:     "bg-rose-50 text-rose-700 border border-rose-100",
  crisis:   "bg-rose-100 text-rose-800 border border-rose-200",
};

const RISK_DOT = {
  low:      "bg-emerald-400",
  moderate: "bg-amber-400",
  high:     "bg-rose-400",
  crisis:   "bg-rose-600",
};

function RiskBadge({ level }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium capitalize ${RISK_STYLE[level] || "bg-gray-100 text-gray-500"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${RISK_DOT[level] || "bg-gray-300"}`} />
      {level}
    </span>
  );
}

function MoodDots({ value }) {
  const filled = Math.round(value ?? 0);
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`w-1.5 h-1.5 rounded-full ${i <= filled ? "bg-indigo-500" : "bg-gray-200"}`} />
      ))}
      <span className="ml-1 text-[10px] text-gray-500">{value ?? "—"}/5</span>
    </span>
  );
}

function StatCard({ label, value, icon: Icon, iconBg, iconColor, pill, pillColor, pillText }) {
  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5 hover:shadow-md hover:-translate-y-1 transition-all">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">{label}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon size={16} className={iconColor} />
        </div>
      </div>

      <p className="text-[2.2rem] font-bold text-gray-800 mb-3">{value}</p>

      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${pillColor}`}>
          {pill}
        </span>
        <span className="text-[11px] text-gray-500">{pillText}</span>
      </div>
    </div>
  );
}

function Avatar({ name, size = "sm" }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2);
  const cls = size === "sm"
    ? "w-8 h-8 rounded-lg text-[11px]"
    : "w-9 h-9 rounded-xl text-xs";

  return (
    <div className={`${cls} bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold`}>
      {initials}
    </div>
  );
}

export default function Dashboard() {
  const [students, setStudents]   = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [search, setSearch]       = useState("");
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([getStudents(), getWatchlist()])
      .then(([s, w]) => {
        const normalize = (student) => ({
          ...student,
          risk_level: student.risk_level || student.risk?.risk_level || "low",
        });

        setStudents(s.map(normalize));
        setWatchlist(w.map(normalize));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return students.filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [students, search]);

  const stats = useMemo(() => {
    let highRisk = 0;
    let healthy = 0;

    for (const s of students) {
      if (["high", "crisis"].includes(s.risk_level)) highRisk++;
      if (s.risk_level === "low") healthy++;
    }

    return {
      total: students.length,
      flagged: watchlist.length,
      highRisk,
      healthy,
    };
  }, [students, watchlist]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50">

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* HEADER */}
        <div className="mb-8 bg-white border border-gray-200 shadow-sm rounded-2xl p-5 flex justify-between items-center">
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-500">Student Wellbeing</p>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Overview of all students today</p>
          </div>

          <div className="bg-gray-100 border border-gray-200 rounded-full px-4 py-1.5 text-xs text-gray-600">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Students" value={stats.total} icon={Users}
            iconBg="bg-indigo-100" iconColor="text-indigo-600"
            pill="↑ 4" pillColor="bg-emerald-50 text-emerald-700" pillText="this week"
          />
          <StatCard label="Needs Attention" value={stats.flagged} icon={AlertTriangle}
            iconBg="bg-amber-100" iconColor="text-amber-600"
            pill="↑ 6" pillColor="bg-rose-50 text-rose-600" pillText="from last week"
          />
          <StatCard label="High Risk" value={stats.highRisk} icon={TrendingDown}
            iconBg="bg-rose-100" iconColor="text-rose-600"
            pill="2 crisis" pillColor="bg-rose-50 text-rose-600" pillText="urgent"
          />
          <StatCard label="Healthy" value={stats.healthy} icon={ShieldCheck}
            iconBg="bg-teal-100" iconColor="text-teal-600"
            pill="↑ 18" pillColor="bg-emerald-50 text-emerald-700" pillText="improved"
          />
        </div>

        {/* Watchlist */}
        {watchlist.length > 0 && (
          <section className="mb-8 bg-white border border-gray-200 shadow-sm rounded-2xl p-4">
            <h2 className="text-sm font-semibold text-gray-800 mb-3">Watchlist</h2>

            {watchlist.map((s) => (
              <Link key={s.id} to={`/students/${s.id}`}
                className="flex justify-between items-center px-3 py-3 rounded-xl hover:bg-gray-50 transition">
                
                <div className="flex items-center gap-3">
                  <Avatar name={s.name} />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{s.name}</p>
                    <p className="text-xs text-gray-400">Class {s.class}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <RiskBadge level={s.risk_level} />
                  <ChevronRight size={14} className="text-gray-300" />
                </div>
              </Link>
            ))}
          </section>
        )}

        {/* Students */}
        <section className="bg-white border border-gray-200 shadow-sm rounded-2xl p-4">
          <div className="flex justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-800">
              All Students
              <span className="ml-2 text-xs text-gray-400">{filtered.length}</span>
            </h2>

            <label className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
              <Search size={12} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="text-xs bg-transparent outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((s) => (
              <Link key={s.id} to={`/students/${s.id}`}
                className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition p-4">

                <div className="flex justify-between mb-3">
                  <div className="flex gap-3">
                    <Avatar name={s.name} size="md" />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{s.name}</p>
                      <p className="text-xs text-gray-400">Class {s.class}</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-gray-300" />
                </div>

                <div className="flex justify-between items-center">
                  <MoodDots value={s.last_mood} />
                  <RiskBadge level={s.risk_level} />
                  <span className="text-[10px] text-gray-400 flex items-center gap-1">
                    <Clock size={10} />
                    {s.last_checkin_date || "Never"}
                  </span>
                </div>

              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}