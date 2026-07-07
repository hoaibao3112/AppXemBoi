"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// ─── Types ──────────────────────────────────────────────────────────────────
interface TarotCard {
  id: string;
  name: string;
  englishName: string;
  tribe: string;
  emoji: string;
  gradient: string;
  glowColor: string;
  reversed: boolean;
  revealed: boolean;
}

// ─── Initial Cards ───────────────────────────────────────────────────────────
const initialCards: TarotCard[] = [
  {
    id: "ban-than",
    name: "Học Trò Diễm Hoả",
    englishName: "Page of Wands",
    tribe: "Tộc Diễm Hoả",
    emoji: "🔥",
    gradient: "linear-gradient(160deg, #1a0a00 0%, #4a1500 40%, #2d0e00 100%)",
    glowColor: "#f97316",
    reversed: false,
    revealed: false,
  },
  {
    id: "doi-phuong",
    name: "Kẻ Ẩn Dật",
    englishName: "The Hermit",
    tribe: "Major Arcana",
    emoji: "🌑",
    gradient: "linear-gradient(160deg, #0a0a14 0%, #1a1a3e 40%, #0d0d28 100%)",
    glowColor: "#8b5cf6",
    reversed: false,
    revealed: false,
  },
  {
    id: "moi-quan-he",
    name: "Kẻ Đặt Tháp",
    englishName: "The Tower",
    tribe: "Major Arcana",
    emoji: "⚡",
    gradient: "linear-gradient(160deg, #14000a 0%, #3e0020 40%, #280010 100%)",
    glowColor: "#ec4899",
    reversed: true,
    revealed: false,
  },
];

// ─── Tarot Card Back ─────────────────────────────────────────────────────────
function CardBack() {
  return (
    <div
      className="w-full h-full rounded-xl flex items-center justify-center relative overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #0d0a1e 0%, #1a1040 50%, #0a0818 100%)",
        border: "1px solid rgba(139, 92, 246, 0.3)",
      }}
    >
      {/* Center ornament */}
      <div className="relative flex items-center justify-center">
        {/* Outer ring */}
        <div
          className="absolute w-20 h-20 rounded-full border"
          style={{ borderColor: "rgba(212, 168, 67, 0.25)" }}
        />
        {/* Inner ring */}
        <div
          className="absolute w-14 h-14 rounded-full border"
          style={{ borderColor: "rgba(139, 92, 246, 0.3)" }}
        />
        {/* Eye */}
        <svg viewBox="0 0 40 40" className="w-8 h-8 relative">
          <ellipse cx="20" cy="20" rx="12" ry="8" stroke="rgba(212,168,67,0.6)" strokeWidth="1" fill="none" />
          <circle cx="20" cy="20" r="5" fill="rgba(139,92,246,0.4)" />
          <circle cx="20" cy="20" r="2" fill="rgba(167,139,250,0.9)" />
          <circle cx="21.5" cy="18.5" r="0.8" fill="white" opacity="0.7" />
          {/* Rays */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
            <line
              key={i}
              x1="20" y1="20"
              x2={20 + Math.cos((angle * Math.PI) / 180) * 16}
              y2={20 + Math.sin((angle * Math.PI) / 180) * 16}
              stroke="rgba(212,168,67,0.2)"
              strokeWidth="0.5"
            />
          ))}
        </svg>
      </div>

      {/* Corner decorations */}
      {["top-2 left-2", "top-2 right-2", "bottom-2 left-2", "bottom-2 right-2"].map((pos, i) => (
        <div
          key={i}
          className={`absolute ${pos} w-4 h-4 flex items-center justify-center`}
        >
          <svg viewBox="0 0 10 10" className="w-3 h-3">
            <path d="M5 0 L5.5 4.5 L10 5 L5.5 5.5 L5 10 L4.5 5.5 L0 5 L4.5 4.5 Z" fill="rgba(212,168,67,0.3)" />
          </svg>
        </div>
      ))}

      {/* Subtle moon phases */}
      <div className="absolute top-2 right-0 left-0 flex justify-center gap-1.5 opacity-20">
        {["🌑", "🌒", "🌕", "🌘", "🌑"].map((moon, i) => (
          <span key={i} className="text-[8px]">{moon}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Tarot Card Front ────────────────────────────────────────────────────────
function CardFront({ card }: { card: TarotCard }) {
  return (
    <div
      className="w-full h-full rounded-xl flex flex-col items-center justify-between p-3 relative overflow-hidden"
      style={{
        background: card.gradient,
        border: `1px solid ${card.glowColor}40`,
        boxShadow: `0 0 30px ${card.glowColor}30`,
        transform: card.reversed ? "rotate(180deg)" : undefined,
      }}
    >
      {/* Top label */}
      <div className="w-full flex justify-between items-start">
        <span
          className="font-display text-[7px] tracking-[0.15em] uppercase"
          style={{ color: `${card.glowColor}cc` }}
        >
          {card.tribe}
        </span>
        {card.reversed && (
          <span className="text-[7px] font-sans text-white/30">↺</span>
        )}
      </div>

      {/* Main image area */}
      <div className="flex flex-col items-center gap-1.5">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-3xl"
          style={{
            background: `${card.glowColor}15`,
            boxShadow: `0 0 20px ${card.glowColor}30`,
          }}
        >
          {card.emoji}
        </div>
      </div>

      {/* Bottom name */}
      <div className="w-full flex flex-col items-center gap-0.5">
        <div className="w-full h-px" style={{ background: `${card.glowColor}30` }} />
        <span
          className="font-display text-[8px] text-center leading-tight tracking-wider mt-1"
          style={{ color: `${card.glowColor}dd`, textShadow: `0 0 8px ${card.glowColor}` }}
        >
          {card.name}
        </span>
        <span className="font-sans text-[6px] text-white/30 italic">{card.englishName}</span>
      </div>

      {/* Shimmer */}
      <div className="absolute inset-0 shimmer opacity-20 pointer-events-none" />
    </div>
  );
}

// ─── Position Label ──────────────────────────────────────────────────────────
function PositionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-purple-500/20" />
      <span className="font-display text-[10px] tracking-[0.25em] text-purple-300/60 uppercase">
        {label}
      </span>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-purple-500/20" />
    </div>
  );
}

// ─── Vong Dialogue ───────────────────────────────────────────────────────────
function VongDialogue({ text, visible }: { text: string; visible: boolean }) {
  const [displayedText, setDisplayedText] = useState("");
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    if (!visible) {
      setDisplayedText("");
      setCharIndex(0);
      return;
    }

    if (charIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[charIndex]);
        setCharIndex((prev) => prev + 1);
      }, 25);
      return () => clearTimeout(timeout);
    }
  }, [visible, charIndex, text]);

  useEffect(() => {
    setDisplayedText("");
    setCharIndex(0);
  }, [text]);

  if (!visible) return null;

  return (
    <div
      className="mx-4 rounded-xl p-4 relative overflow-hidden"
      style={{
        background: "rgba(15, 10, 35, 0.85)",
        border: "1px solid rgba(139, 92, 246, 0.25)",
        backdropFilter: "blur(16px)",
      }}
    >
      {/* Avatar */}
      <div className="flex items-start gap-3">
        <div
          className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-base pulse-glow"
          style={{
            background: "linear-gradient(135deg, rgba(139,92,246,0.3), rgba(109,40,217,0.4))",
            border: "1px solid rgba(167,139,250,0.4)",
          }}
        >
          👁
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-display text-[10px] text-purple-300/70 tracking-widest">VỌNG</span>
          <p className="font-body text-sm text-white/75 leading-relaxed italic">
            {displayedText}
            {charIndex < text.length && (
              <span className="inline-block w-0.5 h-3.5 bg-purple-400 ml-0.5 animate-pulse align-text-bottom" />
            )}
          </p>
        </div>
      </div>

      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.08) 0%, transparent 60%)",
        }}
      />
    </div>
  );
}

// ─── Choice Button ───────────────────────────────────────────────────────────
interface ChoiceProps {
  text: string;
  icon?: string;
  delay?: number;
}

function ChoiceButton({ text, icon, delay = 0 }: ChoiceProps) {
  const [pressed, setPressed] = useState(false);

  return (
    <button
      onClick={() => setPressed(!pressed)}
      className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 group transition-all duration-300 hover:scale-[1.02] active:scale-95"
      style={{
        background: pressed
          ? "rgba(139, 92, 246, 0.2)"
          : "rgba(15, 22, 41, 0.8)",
        border: pressed
          ? "1px solid rgba(167, 139, 250, 0.5)"
          : "1px solid rgba(139, 92, 246, 0.15)",
        animationDelay: `${delay}ms`,
      }}
    >
      <span className="font-body text-sm text-white/70 group-hover:text-white/90 flex-1 leading-relaxed italic">
        {text}
      </span>
      {icon && (
        <span className="text-base flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
          {icon}
        </span>
      )}
    </button>
  );
}

// ─── Progress Bar ────────────────────────────────────────────────────────────
function RealmProgress() {
  return (
    <div
      className="flex items-center gap-2 mx-4 px-4 py-2.5 rounded-full"
      style={{
        background: "rgba(8, 11, 20, 0.9)",
        border: "1px solid rgba(139, 92, 246, 0.2)",
      }}
    >
      <span className="text-sm">🗺️</span>
      <span className="font-display text-xs text-white/60 tracking-widest flex-1">
        TRẢI BÀI TAM TRỤ
      </span>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function TrungBaiPage() {
  const [cards, setCards] = useState<TarotCard[]>(initialCards);
  const [revealedCount, setRevealedCount] = useState(0);
  const [showDialogue, setShowDialogue] = useState(false);
  const [showChoices, setShowChoices] = useState(false);
  const [currentDialogue, setCurrentDialogue] = useState(
    "Gió đã đổi chiều, ô khách. Những lời nói rất rõ ràng nhưng những liệu pháp đó lại đủ sáng để nghe sự thật chưa?"
  );

  const revealCard = (index: number) => {
    if (cards[index].revealed) return;

    const newCards = [...cards];
    newCards[index] = { ...newCards[index], revealed: true };
    setCards(newCards);

    const newCount = revealedCount + 1;
    setRevealedCount(newCount);

    // Update dialogue
    if (newCount === 1) {
      setCurrentDialogue(
        "Lá bài đầu tiên lên tiếng... Ngươi thấy gì trong tấm gương sương mù đó, lữ khách?"
      );
      setShowDialogue(true);
    } else if (newCount === 2) {
      setCurrentDialogue(
        "Và bên kia... đối phương của ngươi mang theo cái bóng của Kẻ Ẩn Dật. Cô đơn tự nguyện hay cô đơn bị buộc?"
      );
    } else if (newCount === 3) {
      setCurrentDialogue(
        "Toà tháp đã đổ, lữ khách. Mối quan hệ này đang đứng trước một biến cố lớn. Ngươi chọn đứng lại hay bước đi?"
      );
      setTimeout(() => setShowChoices(true), 2000);
    }
  };

  const resetReading = () => {
    setCards(initialCards.map((c) => ({ ...c, revealed: false })));
    setRevealedCount(0);
    setShowDialogue(false);
    setShowChoices(false);
    setCurrentDialogue(
      "Gió đã đổi chiều, ô khách. Những lời nói rất rõ ràng nhưng những liệu pháp đó lại đủ sáng để nghe sự thật chưa?"
    );
  };

  return (
    <div className="relative flex flex-col min-h-screen overflow-hidden">
      {/* Background orbs */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 20% 30%, rgba(88,28,135,0.2) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(30,58,138,0.15) 0%, transparent 50%)",
        }}
      />

      {/* Page content */}
      <div className="relative z-10 flex flex-col pb-28">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm border border-purple-500/30 hover:border-purple-400/60 transition-colors">
              ‹
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-base">👁</span>
              <span className="font-display text-xs text-white/60 tracking-widest">
                CÕI VÔ THỊ
              </span>
            </div>
          </Link>

          <button className="w-8 h-8 rounded-full flex items-center justify-center border border-white/10 text-white/40 hover:text-white/70 transition-colors">
            ⚙
          </button>
        </header>

        {/* Section title */}
        <div className="px-5 mb-6">
          <RealmProgress />
        </div>

        {/* ── Card Positions ───────────────────────────── */}
        <div className="flex flex-col gap-6 px-4">

          {/* Card 1: Bản Thân */}
          <div>
            <PositionLabel label="BẢN THÂN" />
            <div
              className="mx-auto cursor-pointer float"
              style={{ width: "160px", height: "240px" }}
              onClick={() => revealCard(0)}
            >
              <div
                className="w-full h-full rounded-xl overflow-hidden transition-all duration-700"
                style={{
                  boxShadow: cards[0].revealed
                    ? `0 0 40px ${cards[0].glowColor}50, 0 0 80px ${cards[0].glowColor}25`
                    : "0 0 30px rgba(139,92,246,0.2)",
                }}
              >
                {cards[0].revealed ? (
                  <CardFront card={cards[0]} />
                ) : (
                  <CardBack />
                )}
              </div>
              {!cards[0].revealed && (
                <p className="text-center text-[10px] font-sans text-white/30 mt-2">
                  Chạm để lật bài
                </p>
              )}
            </div>
          </div>

          {/* Card 2: Đối Phương */}
          <div>
            <PositionLabel label="ĐỐI PHƯƠNG" />
            <div
              className="mx-auto cursor-pointer"
              style={{
                width: "160px",
                height: "240px",
                opacity: revealedCount >= 1 ? 1 : 0.5,
                pointerEvents: revealedCount >= 1 ? "auto" : "none",
              }}
              onClick={() => revealCard(1)}
            >
              <div
                className="w-full h-full rounded-xl overflow-hidden transition-all duration-700"
                style={{
                  boxShadow: cards[1].revealed
                    ? `0 0 40px ${cards[1].glowColor}50, 0 0 80px ${cards[1].glowColor}25`
                    : "0 0 20px rgba(139,92,246,0.1)",
                }}
              >
                {cards[1].revealed ? (
                  <CardFront card={cards[1]} />
                ) : (
                  <CardBack />
                )}
              </div>
              {!cards[1].revealed && revealedCount >= 1 && (
                <p className="text-center text-[10px] font-sans text-white/30 mt-2">
                  Chạm để lật bài
                </p>
              )}
            </div>
          </div>

          {/* Card 3: Mối Quan Hệ */}
          <div>
            <PositionLabel label="MỐI QUAN HỆ" />
            <div
              className="mx-auto cursor-pointer"
              style={{
                width: "160px",
                height: "240px",
                opacity: revealedCount >= 2 ? 1 : 0.5,
                pointerEvents: revealedCount >= 2 ? "auto" : "none",
              }}
              onClick={() => revealCard(2)}
            >
              <div
                className="w-full h-full rounded-xl overflow-hidden transition-all duration-700"
                style={{
                  boxShadow: cards[2].revealed
                    ? `0 0 40px ${cards[2].glowColor}50, 0 0 80px ${cards[2].glowColor}25`
                    : "0 0 20px rgba(139,92,246,0.1)",
                }}
              >
                {cards[2].revealed ? (
                  <CardFront card={cards[2]} />
                ) : (
                  <CardBack />
                )}
              </div>
              {!cards[2].revealed && revealedCount >= 2 && (
                <p className="text-center text-[10px] font-sans text-white/30 mt-2">
                  Chạm để lật bài
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Vong Dialogue ─────────────────────────────── */}
        {showDialogue && (
          <div className="mt-8 flex flex-col gap-3">
            <VongDialogue text={currentDialogue} visible={showDialogue} />
          </div>
        )}

        {/* ── Choices ───────────────────────────────────── */}
        {showChoices && (
          <div className="mt-6 px-4 flex flex-col gap-3">
            <div className="flex items-center gap-3 mb-1">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
              <span className="font-display text-[10px] tracking-[0.25em] text-white/40 uppercase">
                LỰA CHỌN
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
            </div>

            <ChoiceButton
              text="Ta muốn rời đi... Toà tháp đổ, tôi định rời đi hay ở lại?"
              icon="🚪"
              delay={0}
            />
            <ChoiceButton
              text="Ta vẫn muốn đi thêm..."
              icon="⏳"
              delay={100}
            />
            <ChoiceButton
              text="Ta cảm thấy vô bao..."
              icon="💫"
              delay={200}
            />
          </div>
        )}

        {/* ── Action Buttons ────────────────────────────── */}
        {revealedCount === 3 && (
          <div className="mt-6 px-4 flex gap-3">
            <button
              onClick={resetReading}
              className="flex-1 py-3 rounded-xl font-sans text-sm text-white/60 hover:text-white/90 transition-colors border border-white/10 hover:border-white/20"
            >
              Trải lại
            </button>
            <Link
              href="/oracle"
              className="flex-2 flex-grow-[2] py-3 rounded-xl font-sans text-sm text-white text-center transition-all hover:scale-105"
              style={{
                background: "linear-gradient(135deg, rgba(139,92,246,0.8), rgba(109,40,217,0.9))",
                border: "1px solid rgba(167,139,250,0.4)",
              }}
            >
              Hỏi Oracle
            </Link>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: "rgba(8, 11, 20, 0.95)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(139, 92, 246, 0.2)",
        }}
      >
        <div className="flex items-center justify-around py-3 px-4">
          {[
            { href: "/thanh-dia", icon: "🗺️", label: "Map" },
            { href: "/nhat-ky", icon: "📖", label: "Journal", active: true },
            { href: "/kho-bau", icon: "💎", label: "Vault" },
            { href: "/oracle", icon: "✨", label: "Oracle" },
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
