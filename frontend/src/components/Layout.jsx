import { useState, useRef, useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  ClipboardCheck, Eye, LayoutDashboard, LogOut,
  Shield, ArrowLeftRight, ChevronRight,
} from "lucide-react";

const NAV = {
  teacher: [
    { to: "/checkin", label: "Check In", icon: ClipboardCheck },
    { to: "/observe", label: "Observation", icon: Eye },
    { to: "/dashboard", label: "My Class", icon: LayoutDashboard },
  ],
  counselor: [
    { to: "/checkin", label: "Check In", icon: ClipboardCheck },
    { to: "/observe", label: "Observation", icon: Eye },
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ],
  admin: [
    { to: "/admin", label: "Admin Panel", icon: Shield },
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ],
};

const ROLE_COLOR = {
  teacher: "bg-indigo-50 text-indigo-700",
  counselor: "bg-amber-50 text-amber-700",
  admin: "bg-red-50 text-red-700",
};

function getInitials(name) {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

export default function Layout({ role, userName, userEmail, onSignOut, onSwitchAccount }) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const popoverRef = useRef(null);
  const links = NAV[role] || [];

  useEffect(() => {
    function handleClick(e) {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) setPopoverOpen(false);
    }
    if (popoverOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [popoverOpen]);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside style={{
        width: 220,
        background: "#1C1917",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        position: "sticky",
        top: 0,
        height: "100vh",
      }}>
        {/* Logo */}
        <div style={{ padding: "28px 20px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "var(--saffron)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <span style={{ fontSize: 16 }}>🎓</span>
            </div>
            <span style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: 15,
              fontWeight: 500,
              color: "#F7F3EE",
              letterSpacing: "-0.01em",
            }}>
              हाम्रो विद्यार्थी
            </span>
          </div>
          <p style={{ fontSize: 11, color: "rgba(247,243,238,0.35)", marginLeft: 42, marginTop: 2 }}>
            Wellbeing System
          </p>
        </div>

        <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "0 16px 12px" }} />

        {/* Nav */}
        <nav style={{ flex: 1, padding: "4px 10px" }}>
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                borderRadius: 10,
                marginBottom: 2,
                fontSize: 13.5,
                fontWeight: isActive ? 500 : 400,
                color: isActive ? "#F7F3EE" : "rgba(247,243,238,0.45)",
                background: isActive ? "rgba(247,243,238,0.10)" : "transparent",
                textDecoration: "none",
                transition: "all 0.15s",
                letterSpacing: "-0.01em",
              })}
            >
              <Icon size={15} strokeWidth={isActive => isActive ? 2 : 1.8} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User menu */}
        <div style={{ padding: "10px", borderTop: "1px solid rgba(255,255,255,0.06)" }} ref={popoverRef}>
          <button
            onClick={() => setPopoverOpen(v => !v)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              width: "100%",
              padding: "10px 10px",
              borderRadius: 10,
              border: "none",
              background: popoverOpen ? "rgba(255,255,255,0.08)" : "transparent",
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={e => !popoverOpen && (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
            onMouseLeave={e => !popoverOpen && (e.currentTarget.style.background = "transparent")}
          >
            <div style={{
              width: 34, height: 34, borderRadius: "50%",
              background: "var(--saffron)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
              fontSize: 12, fontWeight: 600, color: "#fff",
            }}>
              {getInitials(userName)}
            </div>
            <div style={{ textAlign: "left", minWidth: 0, flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: "#F7F3EE", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {userName}
              </p>
              <p style={{ fontSize: 11, color: "rgba(247,243,238,0.35)", textTransform: "capitalize" }}>
                {role}
              </p>
            </div>
            <ChevronRight size={14} style={{ color: "rgba(247,243,238,0.25)", transform: popoverOpen ? "rotate(90deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }} />
          </button>

          {popoverOpen && (
            <div className="animate-scale-in" style={{
              position: "absolute",
              bottom: 80,
              left: 10,
              right: 10,
              background: "#fff",
              borderRadius: 14,
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-lg)",
              overflow: "hidden",
              zIndex: 50,
            }}>
              <div style={{ padding: "16px", borderBottom: "1px solid var(--border)" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: "50%",
                    background: "var(--saffron)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 600, color: "#fff", flexShrink: 0,
                  }}>
                    {getInitials(userName)}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)" }}>{userName}</p>
                    <p style={{ fontSize: 11.5, color: "var(--ink-faint)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userEmail}</p>
                    <span style={{
                      display: "inline-block", marginTop: 4, padding: "2px 8px",
                      borderRadius: 20, fontSize: 10, fontWeight: 600,
                      background: role === "admin" ? "#FEF2F2" : role === "counselor" ? "#FFFBEB" : "#EEEEF8",
                      color: role === "admin" ? "#991B1B" : role === "counselor" ? "#92400E" : "#3D3D8F",
                      textTransform: "capitalize",
                    }}>
                      {role}
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ padding: 6 }}>
                <MenuBtn icon={ArrowLeftRight} label="Switch account" onClick={() => { setPopoverOpen(false); onSwitchAccount(); }} />
                <MenuBtn icon={LogOut} label="Sign out" onClick={() => { setPopoverOpen(false); onSignOut(); }} danger />
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, background: "var(--cream)", overflowY: "auto" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 32px" }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function MenuBtn({ icon: Icon, label, onClick, danger }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", alignItems: "center", gap: 10, width: "100%",
        padding: "9px 12px", borderRadius: 8, border: "none", cursor: "pointer",
        fontSize: 13, fontWeight: 400,
        color: danger ? "#991B1B" : "var(--ink)",
        background: hover ? (danger ? "#FEF2F2" : "var(--cream)") : "transparent",
        transition: "background 0.15s",
      }}
    >
      <Icon size={14} strokeWidth={1.8} />
      {label}
    </button>
  );
}
