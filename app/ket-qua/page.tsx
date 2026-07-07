"use client";

import Link from "next/link";
import { useState } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────
interface CardResult {
  id: string;
  position: string;
  name: string;
  subtitle: string;
  tribe: string;
  tribeColor: string;
  emoji: string;
  gradient: string;
  glowColor: string;
  reversed: boolean;
  interpretation: string;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────
const cards: CardResult[] = [
  {
    id: "ban-than",
    position: "BẢN THÂN",
    name: "Sứ Giả bậc 8",
    subtitle: "Eight of Cups",
    tribe: "Tộc Thuỷ Nguyệt",
    tribeColor: "#06b6d4",
    emoji: "🌊",
    gradient: "linear-gradient(160deg, #0c2040 0%, #1e5080 60%, #0a1e35 100%)",
    glowColor: "#06b6d4",
    reversed: false,
    interpretation:
      "Ngươi đang mệt mỏi và muốn tìm kiếm điều trọn vẹn hơn. Linh hồn ngươi như dòng nước bị ngăn trở, khao khát được hoà mình vào biển lớn nhưng sợ hãi sự tan biến.",
  },
  {
    id: "doi-phuong",
    position: "ĐỐI PHƯƠNG",
    name: "Học Trò",
    subtitle: "Page of Swords",
    tribe: "Tộc Phong Kiếm",
    tribeColor: "#94a3b8",
    emoji: "⚔️",
    gradient: "linear-gradient(160deg, #0f172a 0%, #1e293b 60%, #0a0f1e 100%)",
    glowColor: "#94a3b8",
    reversed: true,
    interpretation:
      "Người đó say tính lý trí, đa đặt với sự tổn thương cũ. Những vết sẹo từ quá khứ khiến thanh kiếm của họ luôn ở trạng thái phòng thủ, dù trong lòng vẫn còn những con gió ấm.",
  },
  {
    id: "moi-quan-he",
    position: "MỐI QUAN HỆ",
    name: "Sứ Giả Ngọn Lửa",
    subtitle: "Sự Đổi",
    tribe: "Tộc Diễm Hoả",
    tribeColor: "#f97316",
    emoji: "🔥",
    gradient: "linear-gradient(160deg, #3a0e00 0%, #8b3100 60%, #1a0600 100%)",
    glowColor: "#f97316",
    reversed: false,
    interpretation:
      "Mối quan hệ đứng trước cú chuyển mình đột ngột. Một ngọn lửa bùng lên đủ thiêu rụi những gì đã mục rỗng, dọn đường cho mầm xanh mới nảy từ đống tro tàn.",
  },
];

// ─── Small Tarot Card ─────────────────────────────────────────────────────────
function SmallCard({
  card,
  active,
}: {
  card: CardResult;
  active: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      {/* Position label */}
      <span className="font-display text-[9px] tracking-[0.2em] text-white/40 uppercase">
        {card.position}
      </span>

      {/* Card */}
      <div
        className="rounded-lg overflow-hidden relative transition-all duration-500"
        style={{
          width: "88px",
          height: "130px",
          background: card.gradient,
          border: active
            ? `1.5px solid ${card.glowColor}80`
            : `1px solid ${card.glowColor}30`,
          boxShadow: active
            ? `0 0 24px ${card.glowColor}50, 0 0 48px ${card.glowColor}25`
            : `0 0 12px ${card.glowColor}20`,
          transform: card.reversed ? "rotate(180deg)" : undefined,
        }}
      >
        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-between p-2">
          <span
            className="font-display text-[6px] tracking-widest uppercase self-start"
            style={{ color: `${card.glowColor}aa` }}
          >
            {card.tribe}
          </span>
          <span className="text-2xl">{card.emoji}</span>
          <div className="w-full">
            <div
              className="w-full h-px mb-1"
              style={{ background: `${card.glowColor}30` }}
            />
            <span
              className="font-display text-[7px] text-center block leading-tight"
              style={{ color: `${card.glowColor}cc` }}
            >
              {card.name}
            </span>
          </div>
        </div>

        {/* Shimmer */}
        <div className="absolute inset-0 shimmer opacity-20 pointer-events-none" />

        {/* Corner ornaments */}
        {["top-1 left-1", "top-1 right-1", "bottom-1 left-1", "bottom-1 right-1"].map(
          (pos, i) => (
            <div
              key={i}
              className={`absolute ${pos} w-2 h-2`}
              style={{
                borderTop: i < 2 ? `1px solid ${card.glowColor}40` : undefined,
                borderBottom: i >= 2 ? `1px solid ${card.glowColor}40` : undefined,
                borderLeft: i % 2 === 0 ? `1px solid ${card.glowColor}40` : undefined,
                borderRight: i % 2 === 1 ? `1px solid ${card.glowColor}40` : undefined,
              }}
            />
          )
        )}
      </div>

      {/* NGƯỢC label */}
      {card.reversed && (
        <span
          className="font-display text-[8px] tracking-widest px-2 py-0.5 rounded-full"
          style={{
            background: "rgba(148, 163, 184, 0.1)",
            border: "1px solid rgba(148, 163, 184, 0.3)",
            color: "#94a3b8",
          }}
        >
          NGƯỢC
        </span>
      )}

      {/* Card name under */}
      {!card.reversed && (
        <span className="font-display text-[8px] text-white/40 text-center leading-tight max-w-[90px]">
          {card.name}
          <br />
          {card.tribe}
        </span>
      )}
    </div>
  );
}

// ─── Expandable Interpretation ───────────────────────────────────────────────
function InterpretationBlock({ card }: { card: CardResult }) {
  const [open, setOpen] = useState(false);

  return (
    <button
      onClick={() => setOpen(!open)}
      className="w-full text-left rounded-xl overflow-hidden transition-all duration-300"
      style={{
        background: open ? `${card.glowColor}08` : "rgba(15, 22, 41, 0.6)",
        border: open
          ? `1px solid ${card.glowColor}30`
          : "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: card.glowColor, boxShadow: `0 0 6px ${card.glowColor}` }}
        />
        <div className="flex flex-col gap-0 flex-1 text-left">
          <span className="font-display text-xs text-white/80">{card.position}:</span>
          <span
            className="font-display text-xs"
            style={{ color: `${card.glowColor}cc` }}
          >
            {card.tribe}
          </span>
        </div>
        <span className="text-white/30 text-xs">{open ? "∧" : "∨"}</span>
      </div>

      {/* Body */}
      {open && (
        <div className="px-4 pb-4">
          <p className="font-body text-sm text-white/65 leading-relaxed italic">
            {card.interpretation}
          </p>
        </div>
      )}
    </button>
  );
}

// ─── Combo Badge ─────────────────────────────────────────────────────────────
function ComboBadge() {
  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-2"
      style={{
        background: "rgba(212, 168, 67, 0.06)",
        border: "1px solid rgba(212, 168, 67, 0.25)",
      }}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-6 h-6 rounded-md flex items-center justify-center text-xs"
          style={{ background: "rgba(212,168,67,0.15)", border: "1px solid rgba(212,168,67,0.3)" }}
        >
          ⛓
        </div>
        <span className="font-display text-xs text-amber-300 tracking-wide">
          Sự Dây Giải Thoát
        </span>
        <span
          className="ml-auto text-[9px] font-sans px-2 py-0.5 rounded-full"
          style={{ background: "rgba(212,168,67,0.1)", border: "1px solid rgba(212,168,67,0.2)", color: "#d4a843" }}
        >
          COMBO
        </span>
      </div>
      <p className="font-body text-sm text-white/55 italic leading-relaxed">
        "Đó vũ này là cần thiết để giải thoát cho cả hai."
      </p>
    </div>
  );
}

// ─── Vong Final Quote ─────────────────────────────────────────────────────────
function VongFinalQuote() {
  return (
    <div className="flex flex-col gap-3">
      <div
        className="rounded-xl p-4 relative overflow-hidden"
        style={{
          background: "rgba(15, 10, 35, 0.8)",
          border: "1px solid rgba(139,92,246,0.2)",
        }}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm pulse-glow"
            style={{
              background: "linear-gradient(135deg, rgba(139,92,246,0.3), rgba(109,40,217,0.4))",
              border: "1px solid rgba(167,139,250,0.4)",
            }}
          >
            👁
          </div>
          <div>
            <span className="font-display text-[9px] text-purple-300/60 tracking-widest block mb-2">
              VỌNG
            </span>
            <p className="font-body text-sm text-white/70 italic leading-relaxed">
              "Toà tháp đã đổ, lữ khách. Định rời đi hay ở lại?"
            </p>
          </div>
        </div>
      </div>

      {/* Choices */}
      <div className="flex flex-col gap-2">
        {[
          { text: "Ta mệt rồi, ta muốn bước đi...", icon: "🚪" },
          { text: "Ta vẫn muốn đi thêm, dù biết là khó đại.", icon: "⏳" },
          { text: "Ta cảm thấy rối bời, không biết nên đi hay ở.", icon: "💫" },
        ].map((choice, i) => (
          <button
            key={i}
            className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 group transition-all duration-300 hover:scale-[1.01] active:scale-95"
            style={{
              background: "rgba(15, 22, 41, 0.8)",
              border: "1px solid rgba(139,92,246,0.12)",
            }}
          >
            <span className="font-body text-sm text-white/65 italic flex-1 leading-relaxed">
              {choice.text}
            </span>
            <span className="text-base opacity-40 group-hover:opacity-70 transition-opacity flex-shrink-0">
              {choice.icon}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function KetQuaPage() {
  const [activeCard, setActiveCard] = useState(1);

  return (
    <div className="relative flex flex-col min-h-screen">
      {/* Ambient */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 20% 10%, rgba(6,182,212,0.1) 0%, transparent 40%), radial-gradient(ellipse at 80% 60%, rgba(249,115,22,0.08) 0%, transparent 40%)",
        }}
      />

      <div className="relative z-10 flex flex-col pb-28">
        {/* Top header */}
        <header className="flex items-center justify-between px-4 py-4">
          <Link href="/trai-bai" className="flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors">
            <span className="text-sm">‹</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-base">👁</span>
            <span className="font-display text-xs text-white/60 tracking-widest">CÕI VÔ THỊ</span>
          </div>
          <div className="w-5" />
        </header>

        {/* ── NPC Intro ──────────────────────────────────── */}
        <div className="px-4 mb-4">
          <div
            className="rounded-xl p-3 flex items-start gap-3"
            style={{
              background: "rgba(15,10,35,0.85)",
              border: "1px solid rgba(139,92,246,0.2)",
            }}
          >
            <div
              className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center text-xl"
              style={{ background: "rgba(15,22,41,0.9)", border: "1px solid rgba(139,92,246,0.3)" }}
            >
              🦋
            </div>
            <div>
              <span className="font-display text-[9px] text-white/40 tracking-widest block mb-1">
                NGƯ QẠC ĐÊM
              </span>
              <p className="font-body text-xs text-white/65 italic leading-relaxed">
                "Đếm đã sâu rồi lữ khách Tộc Thuỷ Nguyệt… Tô nghe tiếng sóng lòng ngươi xao động."
              </p>
            </div>
          </div>
        </div>

        {/* ── Cards Section ──────────────────────────────── */}
        <div className="px-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-display text-[9px] tracking-[0.2em] text-white/30 uppercase">
              QUẺ TRẢI HIỆN TẠI
            </span>
            <span className="font-display text-[9px] tracking-[0.15em] text-amber-400/60 uppercase">
              3 CẢNH ĐỊNH MỆNH
            </span>
          </div>

          <div className="flex justify-around items-end gap-2">
            {cards.map((card, i) => (
              <button key={card.id} onClick={() => setActiveCard(i)}>
                <SmallCard card={card} active={activeCard === i} />
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="px-4 mb-4">
          <div className="h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
        </div>

        {/* ── Combo ─────────────────────────────────────── */}
        <div className="px-4 mb-4">
          <ComboBadge />
        </div>

        {/* ── Individual Interpretations ─────────────────── */}
        <div className="px-4 flex flex-col gap-2 mb-4">
          {cards.map((card) => (
            <InterpretationBlock key={card.id} card={card} />
          ))}
        </div>

        {/* ── Vong Final Quote + Choices ─────────────────── */}
        <div className="px-4 mb-6">
          <VongFinalQuote />
        </div>

        {/* ── Save Button ────────────────────────────────── */}
        <div className="px-4">
          <button
            className="w-full flex items-center justify-center gap-3 py-4 rounded-xl font-sans font-semibold text-sm tracking-widest text-white transition-all hover:scale-[1.02] active:scale-95"
            style={{
              background: "linear-gradient(135deg, rgba(16,185,129,0.7), rgba(5,150,105,0.8))",
              border: "1px solid rgba(16,185,129,0.4)",
              boxShadow: "0 0 24px rgba(16,185,129,0.25)",
            }}
          >
            <span>📖</span>
            <span className="tracking-[0.1em]">LƯU VÀO NHẬT KÝ</span>
          </button>
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
            { href: "/", icon: "🗺️", label: "Map" },
            { href: "/chon-trai-bai", icon: "🃏", label: "Bói" },
            { href: "/nhat-ky", icon: "📖", label: "Journal", active: true },
            { href: "/cai-dat", icon: "⚙️", label: "Cài đặt" },
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
