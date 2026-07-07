"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { speakText, stopSpeaking } from "@/lib/speech";
import { playCardFlip, playCardRustle, playCardSlide, triggerHaptic } from "@/lib/audio";
import { getCelestialEvents } from "@/lib/lunar";

// ─── Types ──────────────────────────────────────────────────────────────────
interface TarotCard {
  id: string;
  name: string;
  englishName: string;
  clan: string;
  isReversed: boolean;
  revealed: boolean;
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
  cards: TarotCard[];
  combo: { name: string; description: string } | null;
  elementalRelation: { relation: string; orientation: string } | null;
  commentary: string;
  outro: string;
  choices: Choice[];
  fatefulIndex?: number;
  newlyUnlockedMemories?: number[];
  canInitiatePact?: boolean;
  pactCardId?: string | null;
  shardAwarded?: number | null;
}

// --- Helpers ----------------------------------------------------------------
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

const PRESET_CATEGORIES = [
  {
    id: "love",
    label: "❤️ Tình Duyên",
    questions: [
      "Liệu mối lương duyên này có bền lâu?",
      "Khi nào tri kỷ thực sự của ta sẽ xuất hiện?",
      "Làm sao để thấu hiểu người ấy hơn?"
    ]
  },
  {
    id: "career",
    label: "💼 Sự Nghiệp",
    questions: [
      "Lối đi nào tốt nhất cho công việc hiện tại?",
      "Có nên mạo hiểm thực hiện dự án mới?",
      "Làm cách nào để vượt qua áp lực bế tắc?"
    ]
  },
  {
    id: "self",
    label: "🌌 Bản Thân",
    questions: [
      "Năng lượng tiêu cực nào đang cản trở ta?",
      "Thông điệp của Sứ Giả dành cho ta hôm nay.",
      "Bài học lớn nhất ta cần học lúc này là gì?"
    ]
  }
];

// --- Tarot Card Back ---------------------------------------------------------
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

// --- Tarot Card Front --------------------------------------------------------
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

// ─── Small Tarot Card for results view ─────────────────────────────────────────
function SmallCard({
  card,
  active,
  positionName,
}: {
  card: TarotCard;
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
        className="rounded-lg overflow-hidden relative transition-all duration-500 cursor-pointer"
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
            className="font-display text-[6px] tracking-widest uppercase self-start drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]"
            style={{ color: `${color}cc` }}
          >
            {tribeName}
          </span>
          <div className="w-full">
            <div className="w-full h-px mb-1" style={{ background: `${color}40` }} />
            <span
              className="font-display text-[7.5px] text-center block leading-tight font-semibold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]"
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

// --- Position Label ----------------------------------------------------------
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

// --- Vong Dialogue -----------------------------------------------------------
function VongDialogue({
  text,
  visible,
  erc = 0,
  isEclipse = false,
}: {
  text: string;
  visible: boolean;
  erc?: number;
  isEclipse?: boolean;
}) {
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

  // Voice synthesis effect
  useEffect(() => {
    if (visible && text) {
      speakText(text);
    }

    return () => {
      stopSpeaking();
    };
  }, [text, visible]);

  useEffect(() => {
    setDisplayedText("");
    setCharIndex(0);
  }, [text]);

  if (!visible) return null;

  // Determine styles dynamically based on Vọng's persona & celestial events
  let tag = "VỌNG";
  let icon = "👁";
  let borderColor = "rgba(139, 92, 246, 0.25)";
  let glowShadow = "none";
  let background = "rgba(15, 10, 35, 0.85)";
  let tagColorClass = "text-purple-300/70";

  if (isEclipse) {
    tag = "V̵O̵N̵G̵";
    icon = "🌀";
    borderColor = "rgba(139, 92, 246, 0.45)";
    glowShadow = "0 0 25px rgba(139, 92, 246, 0.35)";
    background = "rgba(15, 10, 35, 0.9)";
    tagColorClass = "text-purple-400 animate-pulse";
  } else if (erc >= 30) {
    tag = "QUANG VỌNG 🌟";
    icon = "✨";
    borderColor = "rgba(212, 168, 67, 0.4)";
    glowShadow = "0 0 25px rgba(212, 168, 67, 0.2)";
    background = "rgba(25, 20, 15, 0.9)";
    tagColorClass = "text-amber-300 font-bold";
  } else if (erc <= -30) {
    tag = "HẮC VỌNG ⚔️";
    icon = "👿";
    borderColor = "rgba(239, 68, 68, 0.35)";
    glowShadow = "0 0 25px rgba(239, 68, 68, 0.2)";
    background = "rgba(15, 10, 10, 0.95)";
    tagColorClass = "text-red-400 font-bold";
  }

  return (
    <div
      className="mx-4 rounded-xl p-4 relative overflow-hidden animate-fade-in"
      style={{
        background,
        border: `1px solid ${borderColor}`,
        boxShadow: glowShadow,
        backdropFilter: "blur(16px)",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-base pulse-glow"
          style={{
            background: isEclipse
              ? "linear-gradient(135deg, rgba(139,92,246,0.3), rgba(239,68,68,0.4))"
              : erc >= 30
              ? "linear-gradient(135deg, rgba(212,168,67,0.3), rgba(200,146,45,0.4))"
              : erc <= -30
              ? "linear-gradient(135deg, rgba(239,68,68,0.3), rgba(15,10,25,0.4))"
              : "linear-gradient(135deg, rgba(139,92,246,0.3), rgba(109,40,217,0.4))",
            border: `1px solid ${borderColor}`,
          }}
        >
          {icon}
        </div>
        <div className="flex flex-col gap-1 text-left">
          <span className={`font-display text-[10px] tracking-widest ${tagColorClass}`}>{tag}</span>
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

// ─── Scratch Card Overlay Component ──────────────────────────────────────────
function ScratchCard({ onReveal }: { onReveal: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth || 144;
    canvas.height = canvas.offsetHeight || 224;

    // Draw mystical fog
    ctx.fillStyle = "rgba(22, 28, 45, 0.96)"; // dark fog
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Star dust particles
    ctx.fillStyle = "rgba(139, 92, 246, 0.25)";
    for (let i = 0; i < 25; i++) {
      ctx.beginPath();
      ctx.arc(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * 15 + 4,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    ctx.fillStyle = "rgba(212, 168, 67, 0.15)";
    for (let i = 0; i < 15; i++) {
      ctx.beginPath();
      ctx.arc(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * 10 + 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Text instructions
    ctx.fillStyle = "rgba(212, 168, 67, 0.6)";
    ctx.font = "bold 9px Cinzel, serif";
    ctx.textAlign = "center";
    ctx.fillText("VUỐT ĐỂ XÓA SƯƠNG", canvas.width / 2, canvas.height / 2 - 5);
    
    ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
    ctx.font = "italic 8px Cormorant Garamond, serif";
    ctx.fillText("Giải trừ sương mù để lật bài", canvas.width / 2, canvas.height / 2 + 10);
  }, []);

  const getClearedPercent = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    try {
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;
      let cleared = 0;
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] === 0) cleared++;
      }
      return (cleared / (width * height)) * 100;
    } catch (e) {
      return 0;
    }
  };

  const clickCount = useRef(0);

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 25, 0, Math.PI * 2);
    ctx.fill();

    const percent = getClearedPercent(ctx, canvas.width, canvas.height);
    if (percent > 60) {
      onReveal();
    }
  };

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={(e) => {
        e.preventDefault();
        isDrawing.current = true;
      }}
      onPointerUp={(e) => {
        e.preventDefault();
        isDrawing.current = false;
      }}
      onPointerLeave={() => {
        isDrawing.current = false;
      }}
      onPointerMove={draw}
      onClick={() => {
        clickCount.current += 1;
        if (clickCount.current >= 3) {
          onReveal();
        }
      }}
      className="absolute inset-0 w-full h-full rounded-xl z-20 cursor-pointer touch-none"
    />
  );
}

// --- Main Page ---------------------------------------------------------------
export default function TraiBaiPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<'input' | 'spread' | 'draw' | 'result'>('input');
  
  // Phase 1 states
  const [question, setQuestion] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isShuffling, setIsShuffling] = useState(false);
  const [selectedCardIndices, setSelectedCardIndices] = useState<number[]>([]);
  const [isFullMoon, setIsFullMoon] = useState(false);
  const [isNewMoon, setIsNewMoon] = useState(false);
  const [isMercuryRetrograde, setIsMercuryRetrograde] = useState(false);
  
  // Phase 2 states
  const [cards, setCards] = useState<TarotCard[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [apiResponse, setApiResponse] = useState<ReadingPayload | null>(null);
  const [showDialogue, setShowDialogue] = useState(false);
  const [currentDialogue, setCurrentDialogue] = useState("");
  const [userErc, setUserErc] = useState(0);
  const [isEclipse, setIsEclipse] = useState(false);
  const [pactAccepted, setPactAccepted] = useState(false);
  const [acceptingPact, setAcceptingPact] = useState(false);

  // Common states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Phase 3 states (moved from results page)
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [selectedChoiceId, setSelectedChoiceId] = useState<"A" | "B" | "C" | null>(null);
  const [choiceReply, setChoiceReply] = useState("");
  const [loadingChoice, setLoadingChoice] = useState(false);
  const [whisperText, setWhisperText] = useState("");
  const [submittingWhisper, setSubmittingWhisper] = useState(false);
  const [whisperSubmitted, setWhisperSubmitted] = useState(false);
  const [ercToast, setErcToast] = useState<{ value: number; message: string } | null>(null);
  const [unlockedMemoryPopup, setUnlockedMemoryPopup] = useState<{ index: number; title: string } | null>(null);

  const getPositionName = (idx: number) => {
    const total = cards.length;
    if (total === 1) return "THÔNG ĐIỆP CHỈ DẪN";
    if (total === 5) {
      const fivePositions = ["BẢN THÂN", "QUÁ KHỨ", "TƯƠNG LAI", "NGUYÊN NHÂN", "KẾT QUẢ"];
      return fivePositions[idx] || `LÁ BÀI ${idx + 1}`;
    }
    const threePositions = ["BẢN THÂN", "ĐỐI PHƯƠNG", "MỐI QUAN HỆ"];
    return threePositions[idx] || `LÁ BÀI ${idx + 1}`;
  };

  // Stop speaking when unmounting
  useEffect(() => {
    const events = getCelestialEvents();
    setIsFullMoon(events.isFullMoon);
    setIsNewMoon(events.isNewMoon);
    setIsMercuryRetrograde(events.isMercuryRetrograde);
    setIsEclipse(events.isEclipse);

    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUserErc(parsed.erc || 0);
      } catch (e) {}
    }

    return () => {
      stopSpeaking();
    };
  }, []);

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
          currentHour: new Date().getHours(),
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
      setPactAccepted(false);

      if (data.shardAwarded) {
        setErcToast({
          value: 0,
          message: `✨ Ngươi tìm thấy Mảnh Gương Vỡ #${data.shardAwarded} trôi dạt trong sương mù.`
        });
        setTimeout(() => {
          setErcToast(null);
        }, 4000);
      }
      setCards(
        data.cards.map((c: any) => ({
          id: c.id,
          name: c.name,
          englishName: c.englishName,
          clan: c.clan,
          isReversed: c.isReversed,
          revealed: false,
          keywords: c.keywords || [],
        }))
      );
      
      setIsShuffling(true);
      setSelectedCardIndices([]);
      try { playCardRustle(); } catch (e) {}

      setTimeout(() => {
        setIsShuffling(false);
        setPhase('spread');
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const revealCard = (index: number) => {
    if (cards[index].revealed || !apiResponse) return;

    try {
      playCardFlip();
      triggerHaptic(60);
    } catch (e) {}

    const newCards = [...cards];
    newCards[index] = { ...newCards[index], revealed: true };
    setCards(newCards);

    const newCount = revealedCount + 1;
    setRevealedCount(newCount);

    const drawnCard = apiResponse.cards[index];
    const cardDirection = drawnCard.isReversed ? " ngược" : " xuôi";
    const cardKeywords = drawnCard.keywords ? drawnCard.keywords.slice(0, 3).join(", ") : "";
    
    // 1. Vọng lập tức đọc tên lá bài và các từ khóa tiếng Việt bằng giọng AI
    const voiceText = `Lá bài ${getPositionName(index)}: Sứ Giả ${drawnCard.name}${cardDirection}. Từ khóa chính: ${cardKeywords}.`;
    speakText(voiceText);

    // 2. Cập nhật dòng thoại phụ trên màn hình
    setCurrentDialogue(`Lá bài ${getPositionName(index)} đã hé mở: Sứ Giả ${drawnCard.name} (${drawnCard.englishName}) mang thông điệp về: ${cardKeywords}.`);
    setShowDialogue(true);
  };

  const handleGoToResult = () => {
    if (apiResponse) {
      stopSpeaking();
      setPhase('result');
      // Tự động phát luận giải chi tiết khi vào màn hình kết quả
      if (apiResponse.commentary) {
        speakText(apiResponse.commentary);
      }
      if (apiResponse.newlyUnlockedMemories && apiResponse.newlyUnlockedMemories.length > 0) {
        const firstUnlockedIndex = apiResponse.newlyUnlockedMemories[0];
        const memoryTitles: Record<number, string> = {
          1: 'Ngưỡng cửa không tuổi',
          2: 'Người đồng hành đầu tiên',
          3: 'Sự lựa chọn bên rìa vực thẳm',
          4: 'Khoảnh khắc đổ vỡ',
          5: 'Cái chết của một lời hứa',
          6: 'Sự ra đời của các Sứ Giả',
          7: 'Kẻ đợi chờ ngàn năm',
        };
        setUnlockedMemoryPopup({
          index: firstUnlockedIndex,
          title: memoryTitles[firstUnlockedIndex] || `Mảnh Hồi Ức ${firstUnlockedIndex}`
        });
      }
    }
  };

  const handleSelectChoice = async (choiceId: "A" | "B" | "C") => {
    if (selectedChoiceId || !apiResponse || loadingChoice) return;
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
          readingId: apiResponse.readingId,
          choiceId,
          fatefulIndex: apiResponse.fatefulIndex,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể lưu lựa chọn.");

      setSelectedChoiceId(choiceId);
      setChoiceReply(data.reply);
      setUserErc(data.newErc);

      // Update cached user ERC
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          parsed.erc = data.newErc;
          localStorage.setItem("user", JSON.stringify(parsed));
        } catch (e) {}
      }

      const selectedChoice = apiResponse.choices.find((c) => c.id === choiceId);
      const ercChange = selectedChoice ? selectedChoice.ercChange : 0;

      let ercMessage = "Vọng gật đầu trầm ngâm...";
      if (ercChange > 0) {
        ercMessage = `Vọng cảm nhận được sự ấm áp của ngươi... (+${ercChange} ERC)`;
      } else if (ercChange < 0) {
        ercMessage = `Vọng thấy sự dứt khoát trong bước chân ngươi... (${ercChange} ERC)`;
      }

      setErcToast({ value: ercChange, message: ercMessage });
      setTimeout(() => {
        setErcToast(null);
      }, 4000);
      
      // Đọc to phản hồi lựa chọn của Vọng
      speakText(data.reply);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingChoice(false);
    }
  };

  const handleAcceptPact = async () => {
    if (!apiResponse || !apiResponse.pactCardId || acceptingPact || pactAccepted) return;
    setAcceptingPact(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/user/pact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cardId: apiResponse.pactCardId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể tiếp nhận khế ước.");

      setPactAccepted(true);
      triggerHaptic([100, 50, 100]);

      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          parsed.activePactCardId = apiResponse.pactCardId;
          parsed.activePactTarget = data.activePact.target;
          parsed.activePactExpiresAt = data.activePact.expiresAt;
          localStorage.setItem("user", JSON.stringify(parsed));
        } catch (e) {}
      }

      setErcToast({
        value: 0,
        message: "📜 Ký khế ước thành công! Sứ giả đang đợi ngươi tại Cõi Giới."
      });
      setTimeout(() => {
        setErcToast(null);
      }, 4000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAcceptingPact(false);
    }
  };

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

  const resetReading = () => {
    stopSpeaking();
    setPhase('input');
    setCards([]);
    setRevealedCount(0);
    setApiResponse(null);
    setShowDialogue(false);
    setQuestion("");
    setCurrentDialogue("");
    setSelectedChoiceId(null);
    setChoiceReply("");
    setWhisperText("");
    setWhisperSubmitted(false);
    setError("");
  };

  const activeCard = apiResponse?.cards[activeCardIndex];

  return (
    <div className="relative flex flex-col min-h-screen overflow-x-hidden">
      {/* Mystical backgrounds */}
      <div
        className="fixed inset-0 pointer-events-none transition-all duration-1000"
        style={{
          background:
            phase === 'result'
              ? "radial-gradient(ellipse at 50% 20%, rgba(139,92,246,0.1) 0%, transparent 60%)"
              : "radial-gradient(ellipse at 20% 30%, rgba(88,28,135,0.18) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(30,58,138,0.12) 0%, transparent 50%)",
        }}
      />

      <div className="relative z-10 flex flex-col pb-28">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-4">
          <Link href="/" onClick={stopSpeaking} className="flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm border border-purple-500/30 hover:border-purple-400/60 transition-colors">
              ‹
            </div>
            <span className="font-display text-xs text-white/60 tracking-widest uppercase">
              CÕI VÔ THƯỜNG
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-base">🔮</span>
            <span className="font-display text-[9px] text-white/40 tracking-[0.2em] uppercase">Tarot</span>
          </div>
        </header>

        {/* --- PHASE 1: INPUT QUESTION --------------------------------------------- */}
        {phase === 'input' && (
          <div className="px-4 py-2 mt-4 flex flex-col gap-6 animate-fade-in">
            {isShuffling ? (
              <div className="glass rounded-2xl p-10 flex flex-col gap-6 text-center justify-center items-center min-h-[300px] relative overflow-hidden">
                <style dangerouslySetInnerHTML={{__html: `
                  @keyframes mystical-shuffle {
                    0% { transform: translate(0, 0) rotate(0deg); }
                    50% { transform: translate(25px, 3px) rotate(8deg); }
                    100% { transform: translate(-25px, -3px) rotate(-8deg); }
                  }
                `}} />
                <div className="absolute inset-0 bg-radial-gradient from-purple-500/10 to-transparent animate-pulse" />
                <div className="relative w-24 h-36 flex items-center justify-center">
                  {[1, 2, 3, 4, 5].map((cardNum) => (
                    <div
                      key={cardNum}
                      className="absolute w-20 h-32 rounded-lg bg-gradient-to-br from-purple-900 to-indigo-950 border border-purple-500/40 shadow-lg flex items-center justify-center transition-all duration-300"
                      style={{
                        animation: `mystical-shuffle ${0.6 + cardNum * 0.12}s infinite ease-in-out alternate`,
                        zIndex: cardNum,
                        opacity: 0.85,
                      }}
                    >
                      <span className="text-xl text-purple-400/20">👁</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-1.5 z-10">
                  <span className="font-display text-xs text-amber-300 tracking-widest uppercase font-bold animate-pulse">
                    Đang triệu hồi các Sứ Giả...
                  </span>
                  <p className="font-body text-[10px] text-white/40 italic">
                    "Sương mù đang xáo trộn số mệnh, hãy giữ cõi lòng thanh tịnh."
                  </p>
                </div>
              </div>
            ) : (
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
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 text-xs text-rose-400 text-left">
                  {error}
                </div>
              )}

              <form onSubmit={handleStartReading} className="flex flex-col gap-4 text-left">
                {/* Spiritual Preset Questions */}
                <div className="flex flex-col gap-2">
                  <span className="font-display text-[9px] tracking-widest text-white/40 uppercase pl-1">
                    Gợi ý nỗi niềm tâm linh
                  </span>
                  <div className="flex gap-2">
                    {PRESET_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                        className={`flex-1 py-1.5 rounded-lg border text-[10px] font-sans transition-all cursor-pointer ${
                          activeCategory === cat.id
                            ? "bg-purple-500/25 border-purple-500/40 text-purple-300"
                            : "bg-white/2 border-white/5 text-white/45 hover:border-white/10"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                  
                  {activeCategory && (
                    <div className="flex flex-col gap-1.5 p-2 bg-purple-950/20 border border-purple-500/10 rounded-xl animate-fade-in">
                      {PRESET_CATEGORIES.find((c) => c.id === activeCategory)?.questions.map((q, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setQuestion(q);
                            try { playCardSlide(); } catch (e) {}
                          }}
                          className="w-full text-left p-2 rounded-lg bg-black/40 hover:bg-white/5 border border-transparent hover:border-white/5 text-[11px] font-body text-white/70 italic transition-all cursor-pointer"
                        >
                          "{q}"
                        </button>
                      ))}
                    </div>
                  )}
                </div>

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

                {/* Celestial Events (Auto-detected) */}
                <div className="flex flex-col gap-2 border-t border-white/5 pt-3">
                  <span className="font-display text-[9px] tracking-widest text-white/40 uppercase pl-1">
                    Chu Kỳ Thiên Văn Hiện Tại
                  </span>

                  <div className="flex flex-wrap gap-2">
                    {isFullMoon && (
                      <span className="py-1 px-3 rounded-full text-[10px] font-sans text-center border bg-amber-400/10 border-amber-400/30 text-amber-300">
                        🌕 Đêm Trăng Tròn
                      </span>
                    )}
                    {isNewMoon && (
                      <span className="py-1 px-3 rounded-full text-[10px] font-sans text-center border bg-purple-500/10 border-purple-500/30 text-purple-300">
                        🌑 Đêm Trăng Non
                      </span>
                    )}
                    {isMercuryRetrograde && (
                      <span className="py-1 px-3 rounded-full text-[10px] font-sans text-center border bg-rose-500/10 border-rose-500/30 text-rose-300 animate-pulse">
                        🌀 Thủy Tinh Nghịch Hành
                      </span>
                    )}
                    {!isFullMoon && !isNewMoon && !isMercuryRetrograde && (
                      <span className="py-1 px-3 rounded-full text-[10px] font-sans text-center border bg-white/5 border-white/10 text-white/40">
                        🌙 Trăng Khuyết (Bình Thường)
                      </span>
                    )}
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
            )}
          </div>
        )}

        {phase === 'spread' && apiResponse && (
          <div className="px-4 py-2 mt-4 flex flex-col gap-6 animate-fade-in text-center">
            <div className="glass rounded-2xl p-5 flex flex-col gap-4 text-center">
              <div>
                <span className="font-display text-[9px] tracking-widest text-amber-300 uppercase font-bold">
                  Nghi Thức Chọn Bài
                </span>
                <h1 className="font-display text-sm font-semibold tracking-widest text-white mt-1">
                  HÃY CHỌN {apiResponse.cards.length} LÁ BÀI HỮU DUYÊN
                </h1>
                <p className="font-body text-[10px] text-white/40 italic mt-0.5">
                  "Lướt qua các lá bài dưới đây, chạm để rút lá bài định mệnh của ngươi."
                </p>
              </div>

              {/* Slots representing selected cards */}
              <div className="flex justify-center gap-3 my-2">
                {Array.from({ length: apiResponse.cards.length }).map((_, idx) => {
                  const isFilled = selectedCardIndices.length > idx;
                  return (
                    <div
                      key={idx}
                      className={`w-14 h-20 rounded-lg flex flex-col items-center justify-center border transition-all duration-300 ${
                        isFilled
                          ? "border-purple-500/40 bg-purple-950/20 text-purple-300 shadow-[0_0_10px_rgba(139,92,246,0.15)] animate-scale-up"
                          : "border-dashed border-white/10 bg-white/2 text-white/10"
                      }`}
                    >
                      <span className="text-[8px] font-display tracking-widest mb-1 text-white/30">
                        LÁ {idx + 1}
                      </span>
                      {isFilled ? (
                        <span className="text-sm">👁</span>
                      ) : (
                        <span className="text-xs text-white/20">?</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* The 78-card horizontal scroll deck */}
              <div className="relative w-full py-4 border-t border-b border-white/5 bg-black/20 rounded-xl overflow-x-auto scrollbar-none flex gap-2 px-6 snap-x">
                {Array.from({ length: 78 }).map((_, idx) => {
                  const isSelected = selectedCardIndices.includes(idx);
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isSelected || selectedCardIndices.length >= apiResponse.cards.length}
                      onClick={() => {
                        setSelectedCardIndices([...selectedCardIndices, idx]);
                        try {
                          playCardSlide();
                          triggerHaptic(50);
                        } catch (e) {}
                      }}
                      className={`relative w-14 h-24 rounded-lg flex-shrink-0 bg-gradient-to-b from-[#2d1065] to-[#0f0820] border transition-all duration-300 flex items-center justify-center text-purple-400/20 font-display text-xs hover:border-purple-400/50 cursor-pointer ${
                        isSelected
                          ? "opacity-20 scale-95 border-purple-900"
                          : "border-purple-500/20 hover:scale-105"
                      }`}
                    >
                      <span>👁</span>
                      <div className="absolute top-1 left-1 text-[8px] text-white/10">
                        {idx + 1}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Next phase validation */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={resetReading}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-[10px] font-display tracking-widest text-white/50 hover:text-white transition-all cursor-pointer"
                >
                  Huỷ Trải Bài
                </button>
                <button
                  type="button"
                  disabled={selectedCardIndices.length < apiResponse.cards.length}
                  onClick={() => {
                    setCurrentDialogue(apiResponse.greeting || "Sương mù cuộn lên... Hãy chạm để lật mở từng lá bài số mệnh.");
                    setShowDialogue(true);
                    setPhase('draw');
                  }}
                  className="flex-[2] py-3 rounded-xl font-display text-[10px] tracking-widest font-bold text-white transition-all text-center flex items-center justify-center bg-gradient-to-r from-purple-500/70 to-purple-600/80 border border-purple-500/40 shadow-[0_0_15px_rgba(139,92,246,0.2)] disabled:opacity-50 cursor-pointer"
                >
                  TIẾN VÀO GIẢI BÀI
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- PHASE 2: DRAWING CEREMONY ------------------------------------------- */}
        {phase === 'draw' && (
          <div className="flex flex-col gap-6 px-4 mt-2 animate-fade-in">
            {/* Cards Layout */}
            <div className="flex flex-col gap-5">
              {cards.map((card, i) => (
                <div key={i} className="flex flex-col items-center">
                  <PositionLabel label={getPositionName(i)} />
                  <div
                    className="w-36 h-56 relative"
                    style={{
                      opacity: revealedCount >= i ? 1 : 0.35,
                      pointerEvents: revealedCount >= i ? "auto" : "none",
                    }}
                  >
                    <div className="w-full h-full rounded-xl overflow-hidden transition-all duration-500">
                      {card.revealed ? <CardFront card={card} /> : <CardBack />}
                    </div>
                    {!card.revealed && revealedCount >= i && (
                      <ScratchCard onReveal={() => revealCard(i)} />
                    )}
                  </div>

                  {/* Hiển thị nhanh tên lá và từ khóa ngay khi lật ở Phase 2 */}
                  {card.revealed && (
                    <div className="mt-2.5 px-3 py-1.5 rounded-lg border border-purple-500/20 bg-purple-500/5 text-center max-w-[240px] animate-fade-in flex flex-col items-center gap-1">
                      <span className="font-display text-[10px] text-purple-300 font-bold block">
                        {card.name}
                      </span>
                      <span className={`text-[8px] font-sans px-1.5 py-0.5 rounded border flex items-center gap-0.5 ${
                        card.isReversed 
                          ? "text-rose-300 bg-rose-950/40 border-rose-500/20" 
                          : "text-amber-300 bg-amber-950/40 border-amber-500/20"
                      }`}>
                        {card.isReversed ? "🔄 Chiều Ngược" : "🌟 Chiều Xuôi"}
                      </span>
                      <span className="font-sans text-[8px] text-white/45 italic leading-tight block mt-0.5">
                        ({card.keywords.slice(0, 2).join(", ")})
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Vọng Dialogue */}
            {showDialogue && (
              <div className="mt-2">
                <VongDialogue text={currentDialogue} visible={showDialogue} />
              </div>
            )}

            {/* Transition Action to Result Screen */}
            {revealedCount === cards.length && (
              <div className="flex gap-3 w-full mt-4 animate-fade-in">
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

        {/* ── PHASE 3: REVELATION & DETAILED READING ───────────────── */}
        {phase === 'result' && apiResponse && (
          <div className="flex flex-col gap-5 px-4 mt-2 animate-fade-in">
            {/* 1. Luận giải chi tiết */}
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
                {apiResponse.commentary}
              </p>
            </div>

            {/* 2. Quẻ Trải Thẻ Bài (Lật Nhỏ) */}
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <span className="font-display text-[9px] tracking-[0.2em] text-white/30 uppercase">
                  QUẺ TRẢI SỐ MỆNH
                </span>
                <span className="font-display text-[9px] tracking-[0.15em] text-amber-400/60 uppercase">
                  3 LÁ BÀI
                </span>
              </div>

              <div className="flex justify-around items-end gap-2">
                {cards.map((card, i) => (
                  <button key={card.id} onClick={() => setActiveCardIndex(i)} className="focus:outline-none">
                    <SmallCard card={card} active={activeCardIndex === i} positionName={getPositionName(i)} />
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Chi tiết Từ khóa Thẻ bài được chọn */}
            {activeCard && (
              <div className="flex flex-col gap-2">
                <div className="rounded-xl p-4 border border-white/5 text-left bg-white/2">
                  <span className="font-display text-[9px] tracking-widest text-white/40 block mb-1">
                    CHI TIẾT LÁ {getPositionName(activeCardIndex)} ({activeCard.name})
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

            {/* 4. Combo Đặc biệt (nếu có) */}
            {apiResponse.combo && (
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
                    Combo: {apiResponse.combo.name}
                  </span>
                  <span className="ml-auto text-[9px] font-sans px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400">
                    ĐẶC BIỆT
                  </span>
                </div>
                <p className="font-body text-xs text-white/55 italic leading-relaxed">
                  "{apiResponse.combo.description}"
                </p>
              </div>
            )}

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />

            {/* 5. Câu hỏi định mệnh & Lựa chọn phản hồi */}
            <div className="flex flex-col gap-4">
              {(() => {
                const isFateful = apiResponse.outro.startsWith("[CÂU HỎI ĐỊNH MỆNH]");
                const cleanOutro = isFateful ? apiResponse.outro.replace("[CÂU HỎI ĐỊNH MỆNH]: ", "") : apiResponse.outro;
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

              {/* Danh sách lựa chọn A/B/C */}
              {!selectedChoiceId ? (
                <div className="flex flex-col gap-2">
                  {apiResponse.choices.map((choice) => {
                    const isFateful = apiResponse.outro.startsWith("[CÂU HỎI ĐỊNH MỆNH]");
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
                    className="rounded-xl p-4 text-left border animate-fade-in"
                    style={{
                      background: userErc >= 30
                        ? "rgba(212, 168, 67, 0.06)"
                        : userErc <= -30
                        ? "rgba(239, 68, 68, 0.06)"
                        : "rgba(139, 92, 246, 0.05)",
                      borderColor: userErc >= 30
                        ? "rgba(212, 168, 67, 0.25)"
                        : userErc <= -30
                        ? "rgba(239, 68, 68, 0.25)"
                        : "rgba(139, 92, 246, 0.2)",
                    }}
                  >
                    <span className="font-display text-[9px] block mb-1 font-bold" style={{ color: userErc >= 30 ? "#fcd34d" : userErc <= -30 ? "#f87171" : "#c084fc" }}>
                      {isEclipse ? "PHẢN HỒI CỦA V̵O̵N̵G̵" : userErc >= 30 ? "PHẢN HỒI CỦA QUANG VỌNG 🌟" : userErc <= -30 ? "PHẢN HỒI CỦA HẮC VỌNG ⚔️" : "PHẢN HỒI CỦA VỌNG"}
                    </span>
                    <p className="font-body text-xs text-white/75 italic leading-relaxed">
                      "{choiceReply}"
                    </p>
                  </div>

                  {/* Khung thả thông điệp ẩn danh */}
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

                  {/* Khế ước sứ giả option */}
                  {apiResponse.canInitiatePact && !pactAccepted && (
                    <div
                      className="rounded-xl p-4 flex flex-col gap-3 text-left border animate-fade-in mt-3"
                      style={{
                        background: "rgba(212, 168, 67, 0.04)",
                        borderColor: "rgba(212, 168, 67, 0.25)",
                      }}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs">📜</span>
                        <span className="font-display text-[9px] text-amber-300 tracking-widest uppercase font-bold">
                          Khế Ước Định Mệnh của Sứ Giả
                        </span>
                      </div>
                      <p className="font-body text-[10px] text-white/55 leading-relaxed italic">
                        "Sứ Giả Hoàng Gia từ lá bài vừa lật muốn thiết lập một giao kèo định mệnh 3 ngày cùng ngươi để thử thách lòng tin cõi sương."
                      </p>
                      <button
                        onClick={handleAcceptPact}
                        disabled={acceptingPact}
                        className="w-full py-3 rounded-xl bg-amber-500/25 hover:bg-amber-500/35 border border-amber-500/35 text-[10px] font-display font-semibold tracking-widest text-amber-200 transition-all cursor-pointer"
                      >
                        {acceptingPact ? "Đang ký khế ước..." : "KÝ GIAO KÈO SỨ GIẢ"}
                      </button>
                    </div>
                  )}

                  {pactAccepted && (
                    <div
                      className="rounded-xl p-4 flex items-center gap-3 text-left text-xs text-amber-300 border animate-fade-in mt-3 bg-amber-500/5 border-amber-500/20"
                    >
                      <span>📜</span>
                      <span className="italic font-body">Khế ước đã được ký kết. Sứ Giả đã di chuyển đến Cõi Giới của bạn...</span>
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

            {/* 6. Nút Lưu - Quay về */}
            <div className="mt-4 flex gap-3">
              <button
                onClick={resetReading}
                className="flex-1 py-4 rounded-xl border border-white/10 text-xs font-display tracking-widest text-white/50 hover:text-white transition-all"
              >
                Trải bài mới
              </button>
              <button
                onClick={() => {
                  stopSpeaking();
                  router.push("/nhat-ky");
                }}
                className="flex-2 flex-grow-[2] flex items-center justify-center gap-3 py-4 rounded-xl font-sans font-semibold text-xs tracking-widest text-white transition-all hover:scale-[1.02] active:scale-95"
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
        )}
      </div>

      {ercToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border bg-black/95 text-[11px] text-white/90 border-purple-500/40 shadow-[0_0_20px_rgba(139,92,246,0.3)] animate-slide-up">
          <span className="text-sm">⚡</span>
          <span>{ercToast.message}</span>
        </div>
      )}

      {unlockedMemoryPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-5 animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl p-6 border text-center flex flex-col gap-4 text-white relative bg-[#0f1629] border-amber-500/40 shadow-[0_0_40px_rgba(212,168,67,0.25)]">
            <span className="text-4xl animate-bounce text-amber-500">📖</span>
            <div className="flex flex-col gap-1">
              <span className="font-display text-[10px] tracking-[0.25em] text-amber-400 uppercase font-semibold">
                MẢNH HỒI ỨC KHAI MỞ
              </span>
              <h2 className="font-display text-lg font-bold text-white tracking-wide">
                Mảnh {unlockedMemoryPopup.index}: {unlockedMemoryPopup.title}
              </h2>
            </div>
            <p className="font-body text-xs text-white/50 leading-relaxed italic">
              "Một dòng hồi ức nữa của Vọng đã hiện hình trong sương mù. Hãy đến góc Hồi Ức để thấu suốt."
            </p>
            <div className="flex flex-col gap-2 mt-2">
              <Link
                href="/hoi-uc"
                onClick={() => {
                  stopSpeaking();
                  setUnlockedMemoryPopup(null);
                }}
                className="w-full py-3 rounded-xl font-display text-xs tracking-widest font-semibold text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:scale-[1.02] active:scale-95 transition-all text-center"
              >
                XEM HỒI ỨC NGAY
              </Link>
              <button
                onClick={() => setUnlockedMemoryPopup(null)}
                className="w-full py-3 rounded-xl border border-white/10 text-xs font-display tracking-widest text-white/50 hover:text-white transition-all"
              >
                Đóng lại
              </button>
            </div>
          </div>
        </div>
      )}

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
            { href: "/ban-do", icon: "🗺️", label: "Cõi Giới" },
            { href: "/thanh-dia", icon: "🔥", label: "Thánh Địa" },
            { href: "/chon-trai-bai", icon: "🔮", label: "Trải Bài", active: true },
            { href: "/nhat-ky", icon: "📋", label: "Nhật Ký" },
            { href: "/ho-so", icon: "👤", label: "Hồ Sơ" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={stopSpeaking}
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
