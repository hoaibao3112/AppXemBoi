"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ─── Types ──────────────────────────────────────────────────────────────────
interface TarotCard {
  id: string;
  name: string;
  englishName: string;
  clan: string;
  isReversed: boolean;
  revealed: boolean;
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
      <div className="relative flex items-center justify-center">
        <div
          className="absolute w-20 h-20 rounded-full border animate-pulse"
          style={{ borderColor: "rgba(212, 168, 67, 0.15)" }}
        />
        <div
          className="absolute w-14 h-14 rounded-full border"
          style={{ borderColor: "rgba(139, 92, 246, 0.2)" }}
        />
        <span className="text-2xl text-purple-400/40">👁</span>
      </div>

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
  const color = getClanColor(card.clan);
  const tribeName = getClanNameVi(card.clan);

  return (
    <div
      className="w-full h-full rounded-xl flex flex-col items-center justify-between p-3 relative overflow-hidden"
      style={{
        border: `1px solid ${color}40`,
        boxShadow: `0 0 30px ${color}30`,
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
        className="absolute inset-0 w-full h-full object-cover filter brightness-[0.75] contrast-[1.05]"
      />

      {/* Overlay content */}
      <div className="absolute inset-0 flex flex-col items-center justify-between p-3 bg-gradient-to-t from-black via-black/10 to-transparent z-10">
        <div className="w-full flex justify-between items-start">
          <span
            className="font-display text-[7px] tracking-[0.15em] uppercase drop-shadow-[0_1px_2.5px_rgba(0,0,0,0.85)]"
            style={{ color: `${color}cc` }}
          >
            {tribeName}
          </span>
          {card.isReversed && (
            <span className="text-[7px] font-sans text-white/30 drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]">↺</span>
          )}
        </div>

        <div className="w-full flex flex-col items-center gap-0.5 mt-auto">
          <div className="w-full h-px" style={{ background: `${color}40` }} />
          <span
            className="font-display text-[8.5px] text-center leading-tight tracking-wider mt-1 text-white font-semibold drop-shadow-[0_1px_2.5px_rgba(0,0,0,0.95)]"
          >
            {card.name}
          </span>
          <span className="font-sans text-[6.5px] text-white/40 italic drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]">{card.englishName}</span>
        </div>
      </div>
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
  }, [visible]);

  useEffect(() => {
    if (!visible) return;

    if (charIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[charIndex]);
        setCharIndex((prev) => prev + 1);
      }, 20);
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
        <div className="flex flex-col gap-1 text-left">
          <span className="font-display text-[10px] text-purple-300/70 tracking-widest">VỌNG</span>
          <p className="font-body text-sm text-white/75 leading-relaxed italic">
            {displayedText}
            {charIndex < text.length && (
              <span className="inline-block w-0.5 h-3.5 bg-purple-400 ml-0.5 animate-pulse align-text-bottom" />
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function TraiBaiPage() {
  const router = useRouter();
  const [hasStarted, setHasStarted] = useState(false);
  const [question, setQuestion] = useState("");
  const [isFullMoon, setIsFullMoon] = useState(false);
  const [isNewMoon, setIsNewMoon] = useState(false);
  const [isMercuryRetrograde, setIsMercuryRetrograde] = useState(false);

  const [cards, setCards] = useState<TarotCard[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [apiResponse, setApiResponse] = useState<any>(null);
  
  const [showDialogue, setShowDialogue] = useState(false);
  const [currentDialogue, setCurrentDialogue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStartReading = async (e: React.FormEvent) => {
    e.preventDefault();
    if (question.length < 5) {
      setError("Câu hỏi của ngươi quá ngắn để Sứ Giả nghe rõ.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/dang-nhap");
        return;
      }

      const res = await fetch("/api/tarot/reading", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          question,
          celestialEvents: {
            isFullMoon,
            isNewMoon,
            isMercuryRetrograde,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể khởi tạo trải bài.");

      setApiResponse(data);
      // Map drawn cards to state representation
      setCards(
        data.cards.map((c: any) => ({
          id: c.id,
          name: c.name,
          englishName: c.englishName,
          clan: c.clan,
          isReversed: c.isReversed,
          revealed: false,
        }))
      );
      
      setCurrentDialogue(data.greeting || "Sương mù cuộn lên... Hãy lật mở từng lá bài số mệnh.");
      setShowDialogue(true);
      setHasStarted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const revealCard = (index: number) => {
    if (cards[index].revealed) return;

    const newCards = [...cards];
    newCards[index] = { ...newCards[index], revealed: true };
    setCards(newCards);

    const newCount = revealedCount + 1;
    setRevealedCount(newCount);

    if (newCount === 1) {
      setCurrentDialogue("Lá bài Bản Thân đã hé mở... Một phần sự thật đang hiện hình.");
    } else if (newCount === 2) {
      setCurrentDialogue("Lá bài Đối Phương dậy sóng... Ngươi có nhận thấy sự xáo động?");
    } else if (newCount === 3) {
      setCurrentDialogue("Cánh cửa số mệnh đã rộng mở. Hãy bước tới để nhận lời luận giải chi tiết từ Vọng.");
    }
  };

  const handleGoToResult = () => {
    if (apiResponse) {
      localStorage.setItem("currentReading", JSON.stringify(apiResponse));
      router.push("/ket-qua");
    }
  };

  const resetReading = () => {
    setHasStarted(false);
    setCards([]);
    setRevealedCount(0);
    setApiResponse(null);
    setShowDialogue(false);
    setQuestion("");
    setCurrentDialogue("");
  };

  return (
    <div className="relative flex flex-col min-h-screen overflow-hidden">
      {/* Background orbs */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 20% 30%, rgba(88,28,135,0.18) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(30,58,138,0.12) 0%, transparent 50%)",
        }}
      />

      <div className="relative z-10 flex flex-col pb-28">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm border border-purple-500/30 hover:border-purple-400/60 transition-colors">
              ‹
            </div>
            <span className="font-display text-xs text-white/60 tracking-widest uppercase">
              CÕI VÔ THƯỜNG
            </span>
          </Link>
          <button className="w-8 h-8 rounded-full flex items-center justify-center border border-white/10 text-white/40">
            ⚙
          </button>
        </header>

        {/* ── Phase 1: Input Question & Config ────────────── */}
        {!hasStarted && (
          <div className="px-4 py-2 mt-6 flex flex-col gap-6">
            <div className="glass rounded-2xl p-5 flex flex-col gap-4 text-center">
              <span className="text-3xl animate-pulse">🔮</span>
              <div>
                <h1 className="font-display text-base font-bold tracking-widest text-glow-gold">
                  BẮT ĐẦU TRẢI BÀI TAM TRỤ
                </h1>
                <p className="font-body text-xs text-white/45 italic mt-1 leading-relaxed">
                  "Hãy đặt câu hỏi rõ ràng về bản thân, đối phương và mối quan hệ để sương mù đưa lối."
                </p>
              </div>

              {error && (
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 text-xs text-rose-400">
                  {error}
                </div>
              )}

              <form onSubmit={handleStartReading} className="flex flex-col gap-4 text-left">
                <div className="flex flex-col gap-1.5">
                  <label className="font-display text-[9px] tracking-widest text-white/40 uppercase pl-1">
                    Nỗi niềm của ngươi
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Ví dụ: Liệu mối quan hệ của chúng tôi có bền lâu và vượt qua thử thách này không?"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white/80 focus:outline-none focus:border-purple-500/50 transition-colors"
                  />
                </div>

                {/* Celestial Events Toggles */}
                <div className="flex flex-col gap-2.5 border-t border-white/5 pt-3">
                  <span className="font-display text-[9px] tracking-widest text-white/40 uppercase pl-1">
                    Chu Kỳ Thiên Văn Kích Hoạt
                  </span>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { state: isFullMoon, set: setIsFullMoon, label: "🌕 Trăng Tròn" },
                      { state: isNewMoon, set: setIsNewMoon, label: "🌑 Trăng Non" },
                      {
                        state: isMercuryRetrograde,
                        set: setIsMercuryRetrograde,
                        label: "🌀 Nghịch Hành",
                      },
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => item.set(!item.state)}
                        className="py-2.5 px-1 rounded-xl text-[10px] font-sans text-center transition-all border"
                        style={{
                          background: item.state ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.02)",
                          borderColor: item.state ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.06)",
                          color: item.state ? "#c4b5fd" : "rgba(255,255,255,0.4)",
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full py-4 rounded-xl font-display text-xs tracking-[0.2em] font-semibold text-white transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                  style={{
                    background: "linear-gradient(135deg, rgba(139,92,246,0.8), rgba(109,40,217,0.9))",
                    border: "1px solid rgba(167,139,250,0.4)",
                    boxShadow: "0 0 24px rgba(139,92,246,0.35)",
                  }}
                >
                  {loading ? "ĐANG TRIỆU HỒI SỨ GIẢ..." : "BƯỚC VÀO CÕI SƯƠNG"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ── Phase 2: Drawing Ceremony ───────────────────── */}
        {hasStarted && (
          <div className="flex flex-col gap-6 px-4 mt-2">
            
            {/* Card Position 1 */}
            <div className="flex flex-col items-center">
              <PositionLabel label="BẢN THÂN" />
              <div
                className="w-36 h-56 cursor-pointer relative"
                onClick={() => revealCard(0)}
              >
                <div className="w-full h-full rounded-xl overflow-hidden transition-all duration-500">
                  {cards[0]?.revealed ? <CardFront card={cards[0]} /> : <CardBack />}
                </div>
                {!cards[0]?.revealed && (
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-sans text-white/30 animate-pulse pointer-events-none">
                    Chạm để lật
                  </span>
                )}
              </div>
            </div>

            {/* Card Position 2 */}
            <div className="flex flex-col items-center">
              <PositionLabel label="ĐỐI PHƯƠNG" />
              <div
                className="w-36 h-56 cursor-pointer relative"
                style={{
                  opacity: revealedCount >= 1 ? 1 : 0.4,
                  pointerEvents: revealedCount >= 1 ? "auto" : "none",
                }}
                onClick={() => revealCard(1)}
              >
                <div className="w-full h-full rounded-xl overflow-hidden transition-all duration-500">
                  {cards[1]?.revealed ? <CardFront card={cards[1]} /> : <CardBack />}
                </div>
                {!cards[1]?.revealed && revealedCount >= 1 && (
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-sans text-white/30 animate-pulse pointer-events-none">
                    Chạm để lật
                  </span>
                )}
              </div>
            </div>

            {/* Card Position 3 */}
            <div className="flex flex-col items-center">
              <PositionLabel label="MỐI QUAN HỆ" />
              <div
                className="w-36 h-56 cursor-pointer relative"
                style={{
                  opacity: revealedCount >= 2 ? 1 : 0.4,
                  pointerEvents: revealedCount >= 2 ? "auto" : "none",
                }}
                onClick={() => revealCard(2)}
              >
                <div className="w-full h-full rounded-xl overflow-hidden transition-all duration-500">
                  {cards[2]?.revealed ? <CardFront card={cards[2]} /> : <CardBack />}
                </div>
                {!cards[2]?.revealed && revealedCount >= 2 && (
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-sans text-white/30 animate-pulse pointer-events-none">
                    Chạm để lật
                  </span>
                )}
              </div>
            </div>

            {/* Dialogue feedback */}
            {showDialogue && (
              <div className="mt-2">
                <VongDialogue text={currentDialogue} visible={showDialogue} />
              </div>
            )}

            {/* CTA action to Results */}
            {revealedCount === 3 && (
              <div className="flex gap-3 w-full mt-4">
                <button
                  onClick={resetReading}
                  className="flex-1 py-3.5 rounded-xl border border-white/10 text-xs font-display tracking-widest text-white/60 hover:text-white transition-all"
                >
                  Trải lại
                </button>
                <button
                  onClick={handleGoToResult}
                  className="flex-2 flex-grow-[2] py-3.5 rounded-xl font-display text-xs tracking-widest font-semibold text-white text-center transition-all hover:scale-[1.02] active:scale-95"
                  style={{
                    background: "linear-gradient(135deg, rgba(139,92,246,0.8), rgba(109,40,217,0.9))",
                    border: "1px solid rgba(167,139,250,0.4)",
                    boxShadow: "0 0 20px rgba(139,92,246,0.3)",
                  }}
                >
                  XEM LUẬN GIẢI CHI TIẾT
                </button>
              </div>
            )}
          </div>
        )}
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
