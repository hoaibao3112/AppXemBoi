"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ─── Types ──────────────────────────────────────────────────────────────────
interface CardResult {
  id: string;
  name: string;
  englishName: string;
  clan: string;
  isReversed: boolean;
  keywords: string[];
}

interface Choice {
  id: "A" | "B" | "C";
  text: string;
  ercChange: number;
  reply: string;
}

interface ReadingPayload {
  readingId: string;
  greeting: string;
  cards: CardResult[];
  combo: { name: string; description: string } | null;
  elementalRelation: { relation: string; orientation: string } | null;
  commentary: string;
  outro: string;
  choices: Choice[];
  fatefulIndex?: number;
}

// ─── Helpers ────────────────────────────────────────────────────────────────
const getClanColor = (clan: string) => {
  const map: Record<string, string> = {
    DiemHoa: "#f97316",
    ThuyNguyet: "#06b6d4",
    PhongKiem: "#94a3b8",
    ThoKim: "#10b981",
    VoThuong: "#a78bfa",
  };
  return map[clan] || "#a78bfa";
};

const getClanGradient = (clan: string) => {
  const map: Record<string, string> = {
    DiemHoa: "linear-gradient(160deg, #3a0e00 0%, #8b3100 60%, #1a0600 100%)",
    ThuyNguyet: "linear-gradient(160deg, #0c2040 0%, #1e5080 60%, #0a1e35 100%)",
    PhongKiem: "linear-gradient(160deg, #0f172a 0%, #1e293b 60%, #0a0f1e 100%)",
    ThoKim: "linear-gradient(160deg, #052e16 0%, #065f46 60%, #022c22 100%)",
    VoThuong: "linear-gradient(160deg, #1a0a3e 0%, #2d1065 60%, #0f0820 100%)",
  };
  return map[clan] || "linear-gradient(160deg, #1a0a3e 0%, #2d1065 60%)";
};

const getClanEmoji = (clan: string) => {
  const map: Record<string, string> = {
    DiemHoa: "🔥",
    ThuyNguyet: "🌊",
    PhongKiem: "⚔️",
    ThoKim: "🌿",
    VoThuong: "👁",
  };
  return map[clan] || "🔮";
};

const getClanNameVi = (clan: string) => {
  const map: Record<string, string> = {
    DiemHoa: "Tộc Diễm Hoả",
    ThuyNguyet: "Tộc Thuỷ Nguyệt",
    PhongKiem: "Tộc Phong Kiếm",
    ThoKim: "Tộc Thổ Kim",
    VoThuong: "Cõi Vô Thường",
  };
  return map[clan] || "Cõi Vô Thường";
};

// ─── Small Tarot Card ─────────────────────────────────────────────────────────
function SmallCard({
  card,
  active,
  positionName,
}: {
  card: CardResult;
  active: boolean;
  positionName: string;
}) {
  const color = getClanColor(card.clan);
  const tribeName = getClanNameVi(card.clan);

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="font-display text-[8px] tracking-[0.2em] text-white/40 uppercase">
        {positionName}
      </span>

      <div
        className="rounded-lg overflow-hidden relative transition-all duration-500"
        style={{
          width: "90px",
          height: "135px",
          border: active ? `1.5px solid ${color}80` : `1px solid ${color}20`,
          boxShadow: active
            ? `0 0 24px ${color}50, 0 0 48px ${color}25`
            : `0 0 12px ${color}15`,
          transform: card.isReversed ? "rotate(180deg)" : undefined,
        }}
      >
        {/* Real Card Illustration Image */}
        <img
          src={`/cards/${card.id}.png`}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = `/cards/${card.clan}.png`;
          }}
          alt={card.name}
          className="absolute inset-0 w-full h-full object-cover filter brightness-[0.7] contrast-[1.05]"
        />

        {/* Overlay content */}
        <div className="absolute inset-0 flex flex-col items-center justify-between p-2 bg-gradient-to-t from-black via-black/10 to-transparent">
          <span
            className="font-display text-[6px] tracking-widest uppercase self-start drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
            style={{ color: `${color}cc` }}
          >
            {tribeName}
          </span>
          <div className="w-full">
            <div className="w-full h-px mb-1" style={{ background: `${color}40` }} />
            <span
              className="font-display text-[7.5px] text-center block leading-tight font-semibold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
            >
              {card.name}
            </span>
          </div>
        </div>

        {["top-1 left-1", "top-1 right-1", "bottom-1 left-1", "bottom-1 right-1"].map((pos, i) => (
          <div
            key={i}
            className={`absolute ${pos} w-2 h-2`}
            style={{
              borderTop: i < 2 ? `1px solid ${color}40` : undefined,
              borderBottom: i >= 2 ? `1px solid ${color}40` : undefined,
              borderLeft: i % 2 === 0 ? `1px solid ${color}40` : undefined,
              borderRight: i % 2 === 1 ? `1px solid ${color}40` : undefined,
            }}
          />
        ))}
      </div>

      {card.isReversed && (
        <span className="font-display text-[7px] tracking-widest px-2 py-0.5 rounded-full bg-slate-500/10 border border-slate-500/30 text-slate-400">
          NGƯỢC
        </span>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function KetQuaPage() {
  const router = useRouter();
  const [reading, setReading] = useState<ReadingPayload | null>(null);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [selectedChoiceId, setSelectedChoiceId] = useState<"A" | "B" | "C" | null>(null);
  const [choiceReply, setChoiceReply] = useState("");
  const [loadingChoice, setLoadingChoice] = useState(false);
  const [error, setError] = useState("");

  const [whisperText, setWhisperText] = useState("");
  const [submittingWhisper, setSubmittingWhisper] = useState(false);
  const [whisperSubmitted, setWhisperSubmitted] = useState(false);

  const handleSendWhisper = async () => {
    if (whisperText.trim().length < 5) {
      setError("Thông điệp phải có ít nhất 5 ký tự.");
      return;
    }
    setSubmittingWhisper(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/tarot/whisper", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: whisperText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Thả thông điệp thất bại.");
      setWhisperSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmittingWhisper(false);
    }
  };

  useEffect(() => {
    const raw = localStorage.getItem("currentReading");
    if (!raw) {
      router.push("/chon-trai-bai");
      return;
    }
    try {
      setReading(JSON.parse(raw));
    } catch {
      router.push("/chon-trai-bai");
    }
  }, [router]);

  const handleSelectChoice = async (choiceId: "A" | "B" | "C") => {
    if (selectedChoiceId || !reading || loadingChoice) return;
    setLoadingChoice(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/dang-nhap");
        return;
      }

      const res = await fetch("/api/tarot/choice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          readingId: reading.readingId,
          choiceId,
          fatefulIndex: reading.fatefulIndex,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể lưu lựa chọn.");

      setSelectedChoiceId(choiceId);
      setChoiceReply(data.reply);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingChoice(false);
    }
  };

  if (!reading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <span className="text-3xl animate-spin text-purple-400">✦</span>
        <span className="font-display text-[9px] text-white/35 tracking-widest uppercase">
          Đang lật mở số mệnh...
        </span>
      </div>
    );
  }

  const positions = ["BẢN THÂN", "ĐỐI PHƯƠNG", "MỐI QUAN HỆ"];
  const activeCard = reading.cards[activeCardIndex];

  return (
    <div className="relative flex flex-col min-h-screen">
      {/* Ambient backgrounds */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 20% 10%, rgba(6,182,212,0.08) 0%, transparent 40%), radial-gradient(ellipse at 80% 60%, rgba(249,115,22,0.06) 0%, transparent 40%)",
        }}
      />

      <div className="relative z-10 flex flex-col pb-28">
        {/* Top header */}
        <header className="flex items-center justify-between px-4 py-4">
          <Link href="/trai-bai" className="flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors">
            <span className="text-xl">‹</span>
            <span className="font-sans text-[10px] uppercase">Rút lại</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-base">👁</span>
            <span className="font-display text-xs text-white/60 tracking-widest">CÕI VÔ THƯỜNG</span>
          </div>
          <div className="w-12" />
        </header>

        {/* ── Dialogue/AI Commentary ──────────────────────── */}
        <div className="px-4 mb-4">
          <div
            className="rounded-xl p-4 flex flex-col gap-3 text-left"
            style={{
              background: "rgba(15,10,35,0.85)",
              border: "1px solid rgba(139,92,246,0.2)",
            }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-sm"
                style={{ background: "rgba(15,22,41,0.9)", border: "1px solid rgba(139,92,246,0.3)" }}
              >
                👁
              </div>
              <span className="font-display text-[9px] text-purple-300 tracking-widest block">
                LUẬN GIẢI CỦA VỌNG
              </span>
            </div>
            <p className="font-body text-xs text-white/70 italic leading-relaxed whitespace-pre-line pl-1">
              {reading.commentary}
            </p>
          </div>
        </div>

        {/* ── Cards Section ──────────────────────────────── */}
        <div className="px-4 mb-5">
          <div className="flex items-center justify-between mb-3">
            <span className="font-display text-[9px] tracking-[0.2em] text-white/30 uppercase">
              QUẺ TRẢI HIỆN TẠI
            </span>
            <span className="font-display text-[9px] tracking-[0.15em] text-amber-400/60 uppercase">
              3 KHÍA CẠNH
            </span>
          </div>

          <div className="flex justify-around items-end gap-2">
            {reading.cards.map((card, i) => (
              <button key={card.id} onClick={() => setActiveCardIndex(i)} className="focus:outline-none">
                <SmallCard card={card} active={activeCardIndex === i} positionName={positions[i]} />
              </button>
            ))}
          </div>
        </div>

        {/* ── Combo Badge ───────────────────────────────── */}
        {reading.combo && (
          <div className="px-4 mb-5">
            <div
              className="rounded-xl p-4 flex flex-col gap-2 text-left"
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
                <span className="font-display text-xs text-amber-300 tracking-wide font-semibold">
                  Combo: {reading.combo.name}
                </span>
                <span className="ml-auto text-[9px] font-sans px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400">
                  ĐẶC BIỆT
                </span>
              </div>
              <p className="font-body text-xs text-white/55 italic leading-relaxed">
                "{reading.combo.description}"
              </p>
            </div>
          </div>
        )}

        {/* ── Selected Card Detailed Keywords ────────────── */}
        {activeCard && (
          <div className="px-4 mb-5 flex flex-col gap-2">
            <div className="rounded-xl p-4 border border-white/5 text-left bg-white/2">
              <span className="font-display text-[9px] tracking-widest text-white/40 block mb-1">
                TỪ KHÓA CỦA {positions[activeCardIndex]} ({activeCard.name})
              </span>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {activeCard.keywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-sans px-2.5 py-1 rounded-lg border text-white/60 bg-white/5"
                    style={{ borderColor: `${getClanColor(activeCard.clan)}30` }}
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="px-4 mb-4">
          <div className="h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
        </div>

        {/* ── Vong Outro & Choices ────────────────────────── */}
        <div className="px-4 mb-6 flex flex-col gap-4">
          {(() => {
            const isFateful = reading.outro.startsWith("[CÂU HỎI ĐỊNH MỆNH]");
            const cleanOutro = isFateful ? reading.outro.replace("[CÂU HỎI ĐỊNH MỆNH]: ", "") : reading.outro;
            return (
              <div
                className="rounded-xl p-4 text-left relative overflow-hidden transition-all duration-500"
                style={{
                  background: isFateful
                    ? "linear-gradient(135deg, rgba(212, 168, 67, 0.15) 0%, rgba(10, 8, 25, 0.95) 100%)"
                    : "rgba(15, 10, 35, 0.8)",
                  border: isFateful ? "1.5px solid rgba(212, 168, 67, 0.45)" : "1px solid rgba(139,92,246,0.2)",
                  boxShadow: isFateful ? "0 0 30px rgba(212, 168, 67, 0.22)" : "none",
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm ${isFateful ? "animate-pulse" : "pulse-glow"}`}
                    style={{
                      background: isFateful
                        ? "linear-gradient(135deg, rgba(212,168,67,0.3), rgba(212,168,67,0.5))"
                        : "linear-gradient(135deg, rgba(139,92,246,0.3), rgba(109,40,217,0.4))",
                      border: isFateful ? "1px solid rgba(212,168,67,0.6)" : "1px solid rgba(167,139,250,0.4)",
                    }}
                  >
                    {isFateful ? "👑" : "👁"}
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className={`font-display text-[9px] tracking-widest block font-bold ${isFateful ? "text-amber-300" : "text-purple-300/60"}`}>
                      {isFateful ? "CÂU HỎI ĐỊNH MỆNH" : "VỌNG HỎI"}
                    </span>
                    <p className={`font-body text-xs leading-relaxed ${isFateful ? "text-amber-100 font-medium" : "text-white/70 italic"}`}>
                      "{cleanOutro}"
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Choices / Reply list */}
          {!selectedChoiceId ? (
            <div className="flex flex-col gap-2">
              {reading.choices.map((choice) => {
                const isFateful = reading.outro.startsWith("[CÂU HỎI ĐỊNH MỆNH]");
                return (
                  <button
                    key={choice.id}
                    onClick={() => handleSelectChoice(choice.id)}
                    disabled={loadingChoice}
                    className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 group transition-all duration-300 hover:scale-[1.01] active:scale-95 border ${
                      isFateful
                        ? "border-amber-400/10 bg-amber-400/5 hover:border-amber-400/40 hover:bg-amber-400/10"
                        : "border-white/5 bg-white/2 hover:border-purple-500/35"
                    }`}
                  >
                    <span className="font-body text-xs text-white/65 italic flex-1 leading-relaxed">
                      {choice.text}
                    </span>
                    <span className={`text-[10px] font-sans px-2 py-0.5 rounded bg-white/5 text-white/30 ${isFateful ? "group-hover:text-amber-300" : "group-hover:text-purple-300"}`}>
                      Lựa chọn {choice.id}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div
                className="rounded-xl p-4 text-left border"
                style={{
                  background: "rgba(139, 92, 246, 0.05)",
                  borderColor: "rgba(139, 92, 246, 0.2)",
                }}
              >
                <span className="font-display text-[9px] text-purple-300 block mb-1">
                  PHẢN HỒI CỦA VỌNG
                </span>
                <p className="font-body text-xs text-white/75 italic leading-relaxed">
                  "{choiceReply}"
                </p>
              </div>

              {!whisperSubmitted ? (
                <div
                  className="rounded-xl p-4 flex flex-col gap-3 text-left border animate-fade-in"
                  style={{
                    background: "rgba(15, 10, 35, 0.8)",
                    borderColor: "rgba(139, 92, 246, 0.15)",
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">🌫️</span>
                    <span className="font-display text-[9px] text-purple-300 tracking-widest uppercase">
                      Thông điệp trong sương
                    </span>
                  </div>
                  <p className="font-body text-[10px] text-white/40 leading-relaxed italic">
                    "Thả nỗi lòng của ngươi vào sương mù ẩn danh. Vọng sẽ đem chia sẻ câu chuyện này đến những lữ khách hữu duyên."
                  </p>
                  <textarea
                    value={whisperText}
                    onChange={(e) => setWhisperText(e.target.value)}
                    placeholder="Viết một dòng tâm tư ẩn danh của ngươi..."
                    className="w-full h-20 bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-purple-500/40"
                    maxLength={500}
                  />
                  <button
                    onClick={handleSendWhisper}
                    disabled={submittingWhisper || whisperText.trim().length < 5}
                    className="self-end px-4 py-2 rounded-lg bg-purple-500/20 text-[10px] font-display tracking-widest text-purple-300 border border-purple-500/30 hover:bg-purple-500/35 transition-all disabled:opacity-40"
                  >
                    {submittingWhisper ? "Đang thả sương..." : "THẢ THÔNG ĐIỆP"}
                  </button>
                </div>
              ) : (
                <div
                  className="rounded-xl p-4 flex items-center gap-3 text-left text-xs text-emerald-400 border animate-fade-in"
                  style={{
                    background: "rgba(16, 185, 129, 0.05)",
                    borderColor: "rgba(16, 185, 129, 0.2)",
                  }}
                >
                  <span>✨</span>
                  <span className="italic font-body">Thông điệp của ngươi đã tan vào sương khói cõi vô thường...</span>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 text-xs text-rose-400">
              {error}
            </div>
          )}
        </div>

        {/* ── Save / Exit Button ─────────────────────────── */}
        <div className="px-4">
          <button
            onClick={() => {
              localStorage.removeItem("currentReading");
              router.push("/nhat-ky");
            }}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-xl font-sans font-semibold text-xs tracking-widest text-white transition-all hover:scale-[1.02] active:scale-95"
            style={{
              background: "linear-gradient(135deg, rgba(16,185,129,0.7), rgba(5,150,105,0.8))",
              border: "1px solid rgba(16,185,129,0.4)",
              boxShadow: "0 0 24px rgba(16,185,129,0.25)",
            }}
          >
            <span>📖</span>
            <span className="tracking-[0.1em]">ĐÃ LƯU - VỀ NHẬT KÝ</span>
          </button>
        </div>
      </div>

      {/* Bottom Nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 safe-bottom"
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
