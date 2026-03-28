import { useState, useEffect } from "react";
import { ClipboardCheck, Eye, LayoutDashboard, ChevronRight } from "lucide-react";
import { getStudents } from "../api";

const ROLES = [
  {
    id: "student",
    label: "Student",
    description: "Daily check-ins and creative tasks with your buddy",
    icon: ClipboardCheck,
  },
  {
    id: "teacher",
    label: "Teacher",
    description: "Log behavioral observations for your students",
    icon: Eye,
  },
  {
    id: "counselor",
    label: "Counselor",
    description: "Monitor wellbeing, risks, and manage interventions",
    icon: LayoutDashboard,
  },
];

export default function RoleSelect({ onSelect }) {
  const [pickingStudent, setPickingStudent] = useState(false);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    if (pickingStudent) {
      getStudents().then(setStudents).catch(console.error);
    }
  }, [pickingStudent]);

  if (pickingStudent) {
    return (
      // <div className="min-h-screen flex items-center justify-center p-6 bg-[url('/bg-school.svg')] bg-cover bg-center bg-fixed">
        <div className="w-full max-w-lg bg-white/80 backdrop-blur-xl rounded-2xl border border-white/70 shadow-[0_8px_40px_rgba(90,60,30,0.10)] p-9">
          <button
            onClick={() => setPickingStudent(false)}
            className="text-sm text-[#8A7060] hover:text-[#5A4030] mb-6 transition-colors flex items-center gap-1"
          >
            &larr; Back
          </button>
          <h2 className="text-lg font-semibold text-[#2D1F0F] mb-0.5">
            Who are you?
          </h2>
          <p className="text-sm text-[#9E8060] mb-5">
            Select your name to continue
          </p>
          <div className="space-y-2">
            {students.map((s) => (
              <button
                key={s.id}
                onClick={() => onSelect("student", s.id)}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-white/60 border border-[#D2C3AF]/60 rounded-xl text-sm text-[#2D1F0F] hover:bg-green/200 hover:border-[#4A7C59]/80 transition-colors"
              >
                <span>
                  {s.name}{" "}
                  <span className="text-[#A89880]">— {s.class}</span>
                </span>
                <ChevronRight size={14} className="text-[#C4B090]" />
              </button>
            ))}
          </div>
        </div>
      // </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[url('/bg-school.svg')] bg-cover bg-center bg-fixed">
      <div className="w-full max-w-md text-center backdrop-blur-xl rounded-2xl border border-white/70 shadow-[0_8px_40px_rgba(90,60,30,0.10)] px-10 py-9">

        {/* Mountain motif */}
        <svg width="56" height="20" viewBox="0 0 56 20" className="mx-auto mb-3 opacity-25">
          <polygon points="0,20 11,5 22,13 33,1 44,9 56,4 56,20" fill="#4A7C59" />
        </svg>

        <h1 className="text-2xl font-normal text-[#2D1F0F] tracking-tight">
          हाम्रो विद्यार्थी
        </h1>
        <p className="text-sm text-[#9E8060] mt-1">
          Keeping student wellbeing first
        </p>

        {/* Dhaka stripe */}
        <div
          className="mx-auto mt-3 mb-8 h-1 w-16 rounded-full opacity-60"
          style={{
            background:
              "repeating-linear-gradient(90deg,#A8C5AC 0px,#A8C5AC 4px,transparent 4px,transparent 8px,#C17C5A 8px,#C17C5A 12px,transparent 12px,transparent 16px)",
          }}
        />

        <div className="space-y-2.5">
          {ROLES.map(({ id, label, description, icon: Icon }) => (
            <button
              key={id}
              onClick={() =>
                id === "student" ? setPickingStudent(true) : onSelect(id)
              }
              className="w-full flex items-center gap-3.5 px-4 py-3.5 bg-white/55 border border-[#D2C3AF]/55 rounded-xl text-left hover:bg-white/80 hover:border-[#4A7C59]/30 hover:-translate-y-px transition-all group"
            >
              <div className="w-9 h-9 rounded-xl bg-[#4A7C59]/10 border border-[#4A7C59]/20 flex items-center justify-center shrink-0">
                <Icon size={18} strokeWidth={1.8} className="text-[#4A7C59]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#2D1F0F]">{label}</p>
                <p className="text-xs text-[#9E8060] mt-0.5">{description}</p>
              </div>
              <ChevronRight
                size={14}
                className="text-[#C4B090] group-hover:text-[#8A7060] transition-colors shrink-0"
              />
            </button>
          ))}
        </div>

        <p className="text-[11px] text-[#C4A882] mt-6">
          Nepal Student Wellbeing System
        </p>
      </div>
    </div>
  );
}
