"use client";

import Link from "next/link";

// ─── Types ──────────────────────────────────────────────────────────────────
interface LunarEvent {
  id: string;
  type: "full" | "new" | "retrograde" | "special";
  name: string;
  desc: string;
  highlight?: string;
  icon: React.ReactNode;
  gradient?: string;
  borderColor: string;
  glowColor: string;
  active?: boolean;
}

// ─── SVG Icons ───────────────────────────────────────────────────────────────
function SunMandalaIcon({ color = "#06b6d4" }: { color?: string }) {
  return (
    <svg viewBox="0 0 48 48" className="w-12 h-12">
      <circle cx="24" cy="24" r="8" stroke={color} strokeWidth="1.5" fill="none" />
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => (
        <g key={i} transform={`rotate(${deg} 24 24)`}>
          <line x1="24" y1="6" x2="24" y2="12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="24" y1="14" x2="24" y2="16" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.5" />
        </g>
      ))}
      <circle cx="24" cy="24" r="3" fill={color} opacity="0.8" />
      <circle cx="24" cy="24" r="12" stroke={color} strokeWidth="0.5" fill="none" opacity="0.3" strokeDasharray="2 3" />
    </svg>
  );
}

function CrownGateIcon({ color = "#06b6d4" }: { color?: string }) {
  return (
    <svg viewBox="0 0 48 48" className="w-12 h-12" fill="none">
      {/* Gate arch */}
      <path d="M10 38 L10 22 Q10 14 24 14 Q38 14 38 22 L38 38" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      {/* Inner arch */}
      <path d="M16 38 L16 24 Q16 20 24 20 Q32 20 32 24 L32 38" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      {/* Crown top */}
      <path d="M16 14 L20 8 L24 12 L28 8 L32 14" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Dots */}
      <circle cx="16" cy="14" r="1.5" fill={color} />
      <circle cx="24" cy="12" r="1.5" fill={color} />
      <circle cx="32" cy="14" r="1.5" fill={color} />
      {/* Steps */}
      <line x1="8" y1="38" x2="40" y2="38" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function SnowflakeIcon({ color = "#c084fc" }: { color?: string }) {
  return (
    <svg viewBox="0 0 48 48" className="w-12 h-12" fill="none">
      {[0, 60, 120].map((deg, i) => (
        <g key={i} transform={`rotate(${deg} 24 24)`}>
          <line x1="24" y1="6" x2="24" y2="42" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="24" y1="14" x2="18" y2="8" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
          <line x1="24" y1="14" x2="30" y2="8" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
          <line x1="24" y1="34" x2="18" y2="40" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
          <line x1="24" y1="34" x2="30" y2="40" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
          <line x1="24" y1="24" x2="16" y2="18" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.6" />
          <line x1="24" y1="24" x2="32" y2="18" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.6" />
        </g>
      ))}
      <circle cx="24" cy="24" r="2.5" fill={color} />
    </svg>
  );
}

// ─── Lunar Card ───────────────────────────────────────────────────────────────
function LunarCard({ event }: { event: LunarEvent }) {
  const isRetrograde = event.type === "retrograde";

  return (
    <div
      className="rounded-2xl overflow-hidden relative"
      style={{
        background: isRetrograde
          ? event.gradient
          : "rgba(15, 22, 41, 0.75)",
        border: `1px solid ${event.borderColor}`,
        boxShadow: event.active ? `0 0 30px ${event.glowColor}30` : "none",
      }}
    >
      {/* Retrograde blur overlay */}
      {isRetrograde && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 30% 50%, rgba(168,85,247,0.3) 0%, transparent 60%)",
          }}
        />
      )}

      <div className="relative z-10 flex flex-col items-center gap-3 py-8 px-5">
        {/* Icon */}
        <div
          className="flex items-center justify-center"
          style={{
            filter: `drop-shadow(0 0 10px ${event.glowColor}60)`,
          }}
        >
          {event.icon}
        </div>

        {/* Name */}
        <h3
          className="font-display text-lg font-semibold text-center tracking-wide"
          style={{ color: isRetrograde ? "#ffffff" : event.glowColor }}
        >
          {event.name}
        </h3>

        {/* Desc with highlight */}
        <p className="font-body text-sm text-center leading-relaxed"
          style={{ color: isRetrograde ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.5)" }}
        >
          {event.desc.split(event.highlight ?? "||").map((part, i, arr) =>
            i < arr.length - 1 ? (
              <span key={i}>
                {part}
                <span style={{ color: event.glowColor, fontWeight: 600 }}>
                  {event.highlight}
                </span>
              </span>
            ) : (
              <span key={i}>{part}</span>
            )
          )}
        </p>
      </div>

      {/* Active indicator */}
      {event.active && (
        <div
          className="absolute top-3 right-3 w-2 h-2 rounded-full pulse-glow"
          style={{ background: event.glowColor }}
        />
      )}
    </div>
  );
}

// ─── Events Data ─────────────────────────────────────────────────────────────
const lunarEvents: LunarEvent[] = [
  {
    id: "full-moon",
    type: "full",
    name: "Đêm Trăng Tròn",
    desc: "Sức mạnh của nước dâng cao. Tộc Thuỷ Nguyệt nhận được 15% cộng hưởng năng lượng trong các lượt bói.",
    highlight: "Tộc Thuỷ Nguyệt",
    icon: <SunMandalaIcon color="#06b6d4" />,
    borderColor: "rgba(6, 182, 212, 0.2)",
    glowColor: "#06b6d4",
    active: true,
  },
  {
    id: "new-moon",
    type: "new",
    name: "Đêm Trăng Non",
    desc: "Thời khắc gieo mầm ý niệm mới. Tỷ lệ rút được lá bài thuận chiều tăng 20%.",
    icon: <CrownGateIcon color="#22d3ee" />,
    borderColor: "rgba(34, 211, 238, 0.15)",
    glowColor: "#22d3ee",
  },
  {
    id: "retrograde",
    type: "retrograde",
    name: "THUỶ TINH NGHỊCH HÀNH",
    desc: "Năng lượng cõi sương hỗn loan. Thân cẩn thận trong giao tiếp và các quyết định quan trọng.",
    highlight: "hỗn loan",
    icon: <SnowflakeIcon color="#c084fc" />,
    gradient: "linear-gradient(135deg, #1a0a3e 0%, #3b0764 50%, #1a0a3e 100%)",
    borderColor: "rgba(168, 85, 247, 0.35)",
    glowColor: "#c084fc",
  },
];

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function OraclePage() {
  return (
    <div className="relative flex flex-col min-h-screen">
      {/* Background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(6,182,212,0.06) 0%, transparent 50%), radial-gradient(ellipse at 30% 80%, rgba(168,85,247,0.08) 0%, transparent 50%)",
        }}
      />

      <div className="relative z-10 flex flex-col pb-28">
        {/* Header */}
        <header className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 text-base">✦</span>
            <span className="font-display text-sm text-white/70 tracking-widest">
              CÕI VÔ THƯỜNG
            </span>
          </div>
          <button className="w-9 h-9 rounded-full flex items-center justify-center border border-white/10 text-white/40">
            ⚙
          </button>
        </header>

        {/* Lunar phase banner */}
        <div className="px-5 mb-2">
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-full w-fit"
            style={{
              background: "rgba(6,182,212,0.08)",
              border: "1px solid rgba(6,182,212,0.2)",
            }}
          >
            <span className="text-sm">🌕</span>
            <span className="font-display text-[9px] text-cyan-400/80 tracking-[0.2em] uppercase">
              Chu Kỳ Trăng Hiện Tại
            </span>
          </div>
        </div>

        {/* Cards */}
        <div className="flex flex-col gap-4 px-4 py-2">
          {lunarEvents.map((event) => (
            <LunarCard key={event.id} event={event} />
          ))}
        </div>
      </div>

      {/* Bottom Nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: "rgba(8,11,20,0.95)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(139,92,246,0.2)",
        }}
      >
        <div className="flex items-center justify-around py-3 px-4">
          {[
            { href: "/ban-do", icon: "🗺️", label: "Map" },
            { href: "/chon-trai-bai", icon: "📖", label: "Bói" },
            { href: "/nhat-ky", icon: "📋", label: "Journal" },
            { href: "/ho-so", icon: "👤", label: "Profile" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-all text-white/30 hover:text-white/60"
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-sans text-[10px]">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
