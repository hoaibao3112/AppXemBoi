"use client";

import Link from "next/link";
import { useState } from "react";

// ─── Slider Component ─────────────────────────────────────────────────────────
function MysticSlider({
  label,
  icon,
  defaultValue = 60,
}: {
  label: string;
  icon: string;
  defaultValue?: number;
}) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <span className="font-sans text-sm text-white/70">{label}</span>
        <span className="text-base text-white/40">{icon}</span>
      </div>
      <div className="relative h-1.5 rounded-full overflow-visible" style={{ background: "rgba(255,255,255,0.08)" }}>
        {/* Filled track */}
        <div
          className="absolute top-0 left-0 h-full rounded-full transition-all"
          style={{
            width: `${value}%`,
            background: "linear-gradient(90deg, rgba(139,92,246,0.5), rgba(139,92,246,0.9))",
          }}
        />
        {/* Thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 cursor-pointer transition-all hover:scale-110"
          style={{
            left: `calc(${value}% - 10px)`,
            background: "#ffffff",
            borderColor: "#8b5cf6",
            boxShadow: "0 0 8px rgba(139,92,246,0.6)",
          }}
        />
        {/* Invisible range input on top */}
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
        />
      </div>
    </div>
  );
}

// ─── Toggle Switch ────────────────────────────────────────────────────────────
function ToggleSwitch({
  label,
  icon,
  defaultOn = false,
}: {
  label: string;
  icon: string;
  defaultOn?: boolean;
}) {
  const [on, setOn] = useState(defaultOn);

  return (
    <button
      onClick={() => setOn(!on)}
      className="flex items-center gap-3 w-full py-1"
    >
      <span className="text-lg text-white/50">{icon}</span>
      <span className="font-sans text-sm text-white/70 flex-1 text-left">{label}</span>
      {/* Toggle */}
      <div
        className="relative w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0"
        style={{
          background: on
            ? "linear-gradient(90deg, #6366f1, #8b5cf6)"
            : "rgba(255,255,255,0.1)",
          border: on ? "1px solid rgba(139,92,246,0.5)" : "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div
          className="absolute top-0.5 w-5 h-5 rounded-full transition-all duration-300"
          style={{
            left: on ? "calc(100% - 22px)" : "2px",
            background: on ? "#ffffff" : "rgba(255,255,255,0.4)",
            boxShadow: on ? "0 0 6px rgba(139,92,246,0.8)" : "none",
          }}
        />
        {on && (
          <svg
            viewBox="0 0 12 12"
            fill="white"
            className="absolute top-1/2 -translate-y-1/2"
            style={{ left: "6px", width: "10px", height: "10px" }}
          >
            <path d="M1 6l3.5 3.5L11 2" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        )}
      </div>
    </button>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ label }: { label: string }) {
  return (
    <span className="font-display text-[10px] tracking-[0.25em] text-white/35 uppercase">
      {label}
    </span>
  );
}

// ─── Settings Block ───────────────────────────────────────────────────────────
function SettingsBlock({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-4"
      style={{
        background: "rgba(15, 22, 41, 0.7)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {children}
    </div>
  );
}

// ─── Profile Card ─────────────────────────────────────────────────────────────
function ProfileCard() {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "rgba(15, 22, 41, 0.7)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Avatar + info */}
      <div className="flex flex-col items-center gap-3 p-6 pb-4">
        <div
          className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center text-4xl"
          style={{
            background: "linear-gradient(135deg, #0f172a, #1e293b)",
            border: "2px solid rgba(139,92,246,0.3)",
            boxShadow: "0 0 20px rgba(139,92,246,0.2)",
          }}
        >
          🌙
        </div>
        <div className="text-center">
          <h3 className="font-display text-base text-white/90">Lữ Khách Vô Danh</h3>
          <p className="font-sans text-xs text-white/35 mt-1">Khởi hành: 12/05/2024</p>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px mx-4" style={{ background: "rgba(255,255,255,0.05)" }} />

      {/* Reset button */}
      <div className="p-4 flex flex-col gap-2">
        <button
          onClick={() => setShowConfirm(true)}
          className="w-full py-3 rounded-xl font-display text-xs tracking-[0.15em] uppercase transition-all hover:scale-[1.01] active:scale-[0.98]"
          style={{
            background: showConfirm
              ? "rgba(239,68,68,0.2)"
              : "rgba(239,68,68,0.08)",
            border: showConfirm
              ? "1px solid rgba(239,68,68,0.5)"
              : "1px solid rgba(239,68,68,0.2)",
            color: showConfirm ? "#f87171" : "#ef4444",
          }}
        >
          {showConfirm ? "⚠ Xác nhận xoá vĩnh viễn?" : "Reset Dữ Liệu Hành Trình"}
        </button>
        <p className="font-body text-[10px] text-white/25 italic text-center leading-relaxed">
          Thao tác này sẽ xoá vĩnh viễn nhật ký tâm linh của bạn.
        </p>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function CaiDatPage() {
  return (
    <div className="relative flex flex-col min-h-screen">
      {/* Background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(88,28,135,0.1) 0%, transparent 50%)",
        }}
      />

      <div className="relative z-10 flex flex-col pb-28">
        {/* Header */}
        <header className="flex items-center justify-between px-5 py-5">
          <Link
            href="/"
            className="w-9 h-9 rounded-full flex items-center justify-center border border-white/10 text-white/50 hover:text-white/80 hover:border-white/20 transition-all text-sm"
          >
            ‹
          </Link>
          <h1 className="font-display text-base text-white/85 tracking-widest">
            Cài đặt
          </h1>
          <button className="w-9 h-9 rounded-full flex items-center justify-center border border-white/10 text-white/40 hover:text-white/70 transition-all text-sm">
            ?
          </button>
        </header>

        {/* Content */}
        <div className="flex flex-col gap-6 px-4">

          {/* ── Âm Thanh ──────────────────────────────────── */}
          <div className="flex flex-col gap-3">
            <SectionHeader label="Âm Thanh" />
            <SettingsBlock>
              <MysticSlider label="Nhạc nền cõi sương" icon="♪" defaultValue={65} />
              <div className="h-px" style={{ background: "rgba(255,255,255,0.04)" }} />
              <MysticSlider label="Hiệu ứng âm thanh" icon="✦" defaultValue={45} />
            </SettingsBlock>
          </div>

          {/* ── Cảm Biến & Thông Báo ─────────────────────── */}
          <div className="flex flex-col gap-3">
            <SectionHeader label="Cảm Biến & Thông Báo" />
            <SettingsBlock>
              <ToggleSwitch
                label="Rung phản hồi"
                icon="📳"
                defaultOn={true}
              />
              <div className="h-px" style={{ background: "rgba(255,255,255,0.04)" }} />
              <ToggleSwitch
                label="Cảnh báo chu kỳ trăng"
                icon="🌙"
                defaultOn={false}
              />
            </SettingsBlock>
          </div>

          {/* ── Hành Trình Cá Nhân ─────────────────────── */}
          <div className="flex flex-col gap-3">
            <SectionHeader label="Hành Trình Cá Nhân" />
            <ProfileCard />
          </div>

          {/* Spacer */}
          <div className="h-4" />
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
