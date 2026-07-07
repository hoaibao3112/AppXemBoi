"use client";

import Link from "next/link";
import { useState } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────
interface SpreadType {
  id: string;
  name: string;
  tagline: string;
  desc: string;
  cardCount: number;
  badge?: string;
  badgeColor?: string;
  recommended?: boolean;
  emoji: string;
  cardVisual: "single" | "triple" | "five";
  href: string;
}

// ─── Spread Data ─────────────────────────────────────────────────────────────
const spreads: SpreadType[] = [
  {
    id: "single",
    name: "Thì thầm của Sứ Giả",
    tagline: "",
    desc: "Rút nhanh 1 lá để nhận thông điệp chỉ dẫn cho ngày hôm nay.",
    cardCount: 1,
    badge: "1 LÁ",
    badgeColor: "#6366f1",
    emoji: "♦",
    cardVisual: "single",
    href: "/trai-bai?type=single",
  },
  {
    id: "triple",
    name: "Ngã rẽ sương mù",
    tagline: "TRẢI BÀI 3 LÁ",
    desc: "Bản thân – Đối phương – Mối quan hệ. Phân tích sâu hơn về sự kết nối.",
    cardCount: 3,
    badge: "Khuyên dùng",
    badgeColor: "#eab308",
    recommended: true,
    emoji: "♦",
    cardVisual: "triple",
    href: "/trai-bai?type=triple",
  },
  {
    id: "five",
    name: "Vòng xoay vô thường",
    tagline: "",
    desc: "Dành cho những quyết định lớn mang tính bước ngoặt cuộc đời. Khai mở 5 chiều không gian.",
    cardCount: 5,
    badge: "PHỨC TẠP",
    badgeColor: "#64748b",
    emoji: "♦",
    cardVisual: "five",
    href: "/trai-bai?type=five",
  },
];

// ─── Card Visual (deck preview) ───────────────────────────────────────────────
function CardVisual({
  type,
  color,
}: {
  type: "single" | "triple" | "five";
  color: string;
}) {
  const cardStyle = {
    background: "rgba(15,22,41,0.9)",
    border: `1px solid ${color}50`,
    borderRadius: "8px",
  };

  const CardFace = ({
    rotate = 0,
    translate = "0,0",
    zIndex = 0,
  }: {
    rotate?: number;
    translate?: string;
    zIndex?: number;
  }) => (
    <div
      className="absolute flex items-center justify-center"
      style={{
        ...cardStyle,
        width: "48px",
        height: "72px",
        transform: `rotate(${rotate}deg) translate(${translate})`,
        zIndex,
        boxShadow: `0 0 12px ${color}30`,
      }}
    >
      <span style={{ color, fontSize: "20px", opacity: 0.7 }}>♦</span>
    </div>
  );

  if (type === "single") {
    return (
      <div className="relative w-[72px] h-[90px] flex items-center justify-center">
        <CardFace zIndex={1} />
      </div>
    );
  }

  if (type === "triple") {
    return (
      <div className="relative w-[90px] h-[90px] flex items-center justify-center">
        <CardFace rotate={-12} translate="-20px,4px" zIndex={0} />
        <CardFace rotate={0} translate="0,0" zIndex={2} />
        <CardFace rotate={12} translate="20px,4px" zIndex={1} />
      </div>
    );
  }

  return (
    <div className="relative w-[100px] h-[90px] flex items-center justify-center">
      <CardFace rotate={-20} translate="-36px,6px" zIndex={0} />
      <CardFace rotate={-10} translate="-18px,2px" zIndex={1} />
      <CardFace rotate={0} translate="0,0" zIndex={4} />
      <CardFace rotate={10} translate="18px,2px" zIndex={2} />
      <CardFace rotate={20} translate="36px,6px" zIndex={1} />
    </div>
  );
}

// ─── Spread Card ─────────────────────────────────────────────────────────────
function SpreadCard({ spread }: { spread: SpreadType }) {
  const [pressed, setPressed] = useState(false);

  const cardColor = spread.recommended
    ? "#eab308"
    : spread.id === "single"
    ? "#6366f1"
    : "#475569";

  return (
    <Link
      href={spread.href}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      className="block relative rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
      style={{
        background: spread.recommended
          ? "rgba(234, 179, 8, 0.05)"
          : "rgba(15, 22, 41, 0.7)",
        border: spread.recommended
          ? "1.5px solid rgba(234, 179, 8, 0.4)"
          : "1px solid rgba(255,255,255,0.07)",
        boxShadow: spread.recommended
          ? "0 0 30px rgba(234,179,8,0.1)"
          : "none",
      }}
    >
      {/* Badge top-right */}
      {spread.badge && (
        <div
          className="absolute top-3 right-3 px-2 py-1 rounded-md text-[9px] font-sans font-semibold tracking-wide flex items-center gap-1"
          style={{
            background: `${spread.badgeColor}20`,
            border: `1px solid ${spread.badgeColor}50`,
            color: spread.badgeColor,
          }}
        >
          {spread.recommended && <span>☆</span>}
          {spread.badge}
        </div>
      )}

      {/* Content */}
      <div className="flex items-center gap-4 p-4">
        {/* Card visual */}
        <div className="flex-shrink-0 flex items-center justify-center w-24 h-24">
          <CardVisual type={spread.cardVisual} color={cardColor} />
        </div>

        {/* Text */}
        <div className="flex flex-col gap-1.5 flex-1 min-w-0 pr-8">
          {spread.tagline && (
            <span
              className="font-display text-[8px] tracking-[0.2em] uppercase"
              style={{ color: cardColor }}
            >
              {spread.tagline}
            </span>
          )}
          <h3
            className="font-display text-lg font-semibold leading-snug"
            style={{ color: spread.recommended ? "#fde047" : "#e8e0d5" }}
          >
            {spread.name}
          </h3>
          <p className="font-body text-xs text-white/50 leading-relaxed">
            {spread.desc}
          </p>
        </div>
      </div>
    </Link>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function ChonTraiBaiPage() {
  const [page, setPage] = useState(1);

  return (
    <div className="relative flex flex-col min-h-screen">
      {/* Background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 20%, rgba(99,102,241,0.1) 0%, transparent 50%)",
        }}
      />

      <div className="relative z-10 flex flex-col pb-28">
        {/* Header */}
        <header className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2">
            <span className="text-purple-400 text-base">✦</span>
            <h1
              className="font-display text-lg font-bold tracking-widest"
              style={{
                background: "linear-gradient(135deg, #a78bfa, #7c3aed)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              CHỌN KIỂU TRẢI BÀI
            </h1>
          </div>
          <button className="w-9 h-9 rounded-full flex items-center justify-center border border-white/10 text-white/40 hover:text-white/70 hover:border-white/20 transition-all">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
          </button>
        </header>

        {/* Spreads list */}
        <div className="flex flex-col gap-3 px-4">
          {spreads.map((spread) => (
            <SpreadCard key={spread.id} spread={spread} />
          ))}
        </div>

        {/* Tagline */}
        <div className="flex flex-col items-center gap-3 mt-8 px-4">
          <p className="font-display text-[10px] tracking-[0.3em] text-white/25 uppercase text-center">
            HÃY TĨNH TÂM VÀ CHỌN THEO TRỰC GIÁC
          </p>
          {/* Dots */}
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-300"
                style={{
                  width: page === i ? "20px" : "6px",
                  height: "6px",
                  background: page === i ? "#8b5cf6" : "rgba(255,255,255,0.2)",
                }}
              />
            ))}
          </div>
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
            { href: "/chon-trai-bai", icon: "📖", label: "Bói", active: true },
            { href: "/nhat-ky", icon: "📋", label: "Journal" },
            { href: "/ho-so", icon: "👤", label: "Profile" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-all ${
                item.active ? "text-purple-400" : "text-white/30 hover:text-white/60"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-sans text-[10px]">{item.label}</span>
              {item.active && <div className="w-1 h-1 rounded-full bg-purple-400" />}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
