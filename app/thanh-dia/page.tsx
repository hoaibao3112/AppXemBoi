"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  playCardFlip,
  startFireCrackling,
  stopFireCrackling,
  startAmbientPad,
  stopAmbientPad,
  triggerHaptic
} from "@/lib/audio";
import { speakText, stopSpeaking } from "@/lib/speech";

interface DrawnCard {
  id: string;
  name: string;
  englishName: string;
  clan: string;
  rank: string;
  keywords: string[];
}

export default function NghiThucDotLaPage() {
  const router = useRouter();
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [isBurned, setIsBurned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [revealedCard, setRevealedCard] = useState<DrawnCard | null>(null);
  const [whisper, setWhisper] = useState("");
  const [error, setError] = useState("");
  
  const [ambientOn, setAmbientOn] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Whisper states
  const [randomWhisper, setRandomWhisper] = useState<any>(null);
  const [whisperCommentary, setWhisperCommentary] = useState("");
  const [showWhisperPopup, setShowWhisperPopup] = useState(false);
  const [loadingWhisper, setLoadingWhisper] = useState(false);
  const [blessed, setBlessed] = useState(false);
  const [blessingLoading, setBlessingLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {}
      }
    }

    return () => {
      stopAmbientPad();
      stopFireCrackling();
      stopSpeaking();
    };
  }, []);

  const handleFetchWhisper = async () => {
    setLoadingWhisper(true);
    setBlessed(false);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/tarot/whisper", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể nghe tiếng thì thầm.");

      setRandomWhisper(data.whisper);
      setWhisperCommentary(data.commentary);
      setShowWhisperPopup(true);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setLoadingWhisper(false);
    }
  };

  const handleBlessWhisper = async () => {
    if (!randomWhisper || blessingLoading || blessed) return;
    setBlessingLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/tarot/whisper/bless", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ whisperId: randomWhisper.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setBlessed(true);
      triggerHaptic([100, 50, 100]);

      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          parsed.erc = Math.min((parsed.erc || 0) + 5, 100);
          localStorage.setItem("user", JSON.stringify(parsed));
          setUser(parsed);
        } catch (e) {}
      }
    } catch (err) {
      console.error("Blessing failed:", err);
    } finally {
      setBlessingLoading(false);
    }
  };

  const toggleAmbient = () => {
    if (ambientOn) {
      try {
        stopAmbientPad();
      } catch (e) {}
      setAmbientOn(false);
    } else {
      try {
        startAmbientPad(user?.clan || "VoThuong");
      } catch (e) {
        console.warn("Ambient play failed:", e);
      }
      setAmbientOn(true);
    }
  };

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startCharging = () => {
    if (isBurned || loading) return;
    setHolding(true);
    setError("");
    setProgress(0);

    // Play ASMR Fire crackling sound safely
    try {
      startFireCrackling();
    } catch (e) {
      console.warn("Failed to play ASMR crackle:", e);
    }

    // Vibrate to indicate start (Haptic feedback)
    triggerHaptic(100);

    const startTime = Date.now();
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min((elapsed / 3000) * 100, 100);
      setProgress(currentProgress);

      // Heartbeat vibration during charge
      if (Math.floor(elapsed / 300) % 2 === 0) {
        triggerHaptic(20);
      }

      if (elapsed >= 3000) {
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        triggerRitual();
      }
    }, 50);
  };

  const stopCharging = () => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    stopFireCrackling();
    setHolding(false);
    setProgress(0);
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (holding) {
      stopCharging();
    } else {
      startCharging();
    }
  };

  const triggerRitual = async () => {
    setHolding(false);
    setLoading(true);
    setIsBurned(true);
    stopFireCrackling();

    // Final ignition vibration
    try {
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([300, 100, 300]);
      }
    } catch (e) {}

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/dang-nhap");
        return;
      }

      const res = await fetch("/api/tarot/ritual", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Nghi thức thất bại. Lực lượng cõi sương chưa chấp thuận.");

      // Play flip sound
      playCardFlip();
      setRevealedCard(data.card);
      setWhisper(data.whisper);

      // Automatically speak the whisper aloud using AI voice
      speakText(data.whisper);
    } catch (err: any) {
      setError(err.message);
      setIsBurned(false); // Let them try again if error
      setProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    stopFireCrackling();
    stopSpeaking();
    setIsBurned(false);
    setRevealedCard(null);
    setWhisper("");
    setProgress(0);
    setError("");
  };

  const getClanColor = (clanName: string) => {
    const map: Record<string, string> = {
      DiemHoa: "#f97316",
      ThuyNguyet: "#06b6d4",
      PhongKiem: "#94a3b8",
      ThoKim: "#10b981",
      VoThuong: "#a78bfa",
    };
    return map[clanName] || "#a78bfa";
  };

  return (
    <div className="relative flex flex-col min-h-screen items-center justify-center p-4">
      {/* Mystical Fog Background */}
      <div
        className="fixed inset-0 pointer-events-none transition-all duration-1000"
        style={{
          background: isBurned && revealedCard
            ? "radial-gradient(ellipse at 50% 30%, rgba(139,92,246,0.15) 0%, transparent 60%)"
            : "radial-gradient(ellipse at 50% 50%, rgba(15,22,41,0.95) 0%, rgba(8,11,20,1) 100%)",
          opacity: isBurned ? 0.8 : 1.0,
        }}
      />

      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-6">
        
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-4">
          <Link href="/" className="w-9 h-9 rounded-full flex items-center justify-center border border-white/10 text-white/50 hover:text-white/80 transition-all text-sm">
            ‹
          </Link>
          <span className="font-display text-xs text-white/60 tracking-widest uppercase">
            NGHI THỨC ĐỐT LÁ
          </span>
          <button
            onClick={toggleAmbient}
            className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all text-xs ${
              ambientOn
                ? "border-purple-400/40 text-purple-400 bg-purple-500/10 shadow-[0_0_10px_rgba(139,92,246,0.3)] animate-pulse"
                : "border-white/10 text-white/40 hover:text-white/70"
            }`}
            title={ambientOn ? "Tắt nhạc sương" : "Bật nhạc sương"}
          >
            🎵
          </button>
        </header>

        {/* ── Step 1: Holding Interaction ─────────────────── */}
        {!isBurned && (
          <div className="flex flex-col items-center gap-6 text-center w-full mt-10">
            <div className="flex flex-col gap-1.5 px-4">
              <h1
                className="font-display text-lg font-bold tracking-widest text-glow-gold"
                style={{
                  background: "linear-gradient(135deg, #d4a843, #f5e06e)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                ĐỐT LÁ THÔNG HỘ MỆNH
              </h1>
              <p className="font-body text-sm text-white/55 leading-relaxed italic">
                "Chạm một lần vào chiếc lá để thắp lửa và bắt đầu nghi thức (nhấn lại để hủy)."
              </p>
            </div>

            {/* Igniter Button */}
            <div className="relative flex items-center justify-center w-52 h-52 my-4">
              {/* Radial charging path */}
              <svg className="absolute w-full h-full transform -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  stroke="rgba(255,255,255,0.03)"
                  strokeWidth="2.5"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  stroke="#d4a843"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray="276"
                  strokeDashoffset={276 - (276 * progress) / 100}
                  className="transition-all duration-75"
                  style={{
                    filter: "drop-shadow(0 0 8px rgba(212,168,67,0.5))",
                  }}
                />
              </svg>

              {/* Center Leaf Plate */}
              <button
                onClick={handleButtonClick}
                className={`w-36 h-36 rounded-full flex flex-col items-center justify-center border transition-all duration-300 select-none ${
                  holding
                    ? "scale-95 border-amber-400/50 bg-amber-400/10 shadow-[0_0_30px_rgba(212,168,67,0.3)]"
                    : "border-white/10 bg-white/2 hover:border-white/20"
                }`}
              >
                {holding ? (
                  <span className="text-4xl animate-bounce">🔥</span>
                ) : (
                  <span className="text-4xl">🍃</span>
                )}
                <span className="font-display text-[8px] text-white/40 tracking-widest uppercase mt-2">
                  {holding ? "Hủy..." : "Chạm để đốt"}
                </span>
              </button>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 text-xs text-rose-400 max-w-sm">
                {error}
              </div>
            )}

            {/* Giếng Thì Thầm Section */}
            <div className="mt-4 flex flex-col items-center gap-3 w-full max-w-xs border-t border-white/5 pt-6">
              <span className="font-display text-[9px] tracking-widest text-white/30 uppercase">
                TÂM SỰ PHƯƠNG XA
              </span>
              <button
                onClick={handleFetchWhisper}
                disabled={loadingWhisper}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border bg-white/2 hover:bg-white/5 border-purple-500/20 text-purple-300 hover:text-purple-200 transition-all font-display text-[10px] tracking-widest cursor-pointer disabled:opacity-40"
              >
                <span>🕯</span>
                <span>{loadingWhisper ? "ĐANG LẮNG NGHE SƯƠNG..." : "LẮNG NGHE THÌ THẦM"}</span>
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Ignition Loading ───────────────────── */}
        {isBurned && loading && (
          <div className="flex flex-col items-center gap-6 text-center my-10 animate-pulse">
            <div className="w-24 h-24 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-4xl shadow-[0_0_50px_rgba(249,115,22,0.4)]">
              🔥
            </div>
            <div className="flex flex-col gap-1.5">
              <h2 className="font-display text-sm tracking-widest text-amber-400">
                KHÓI THIÊNG KHỞI NGUYÊN
              </h2>
              <p className="font-body text-xs text-white/35 italic">
                "Khói bay đang xua tan sương mù che phủ..."
              </p>
            </div>
          </div>
        )}

        {/* ── Step 3: Revealed Card & Whisper ────────────── */}
        {isBurned && !loading && revealedCard && (
          <div className="flex flex-col items-center gap-6 w-full text-center card-reveal mt-10">
            {/* Drawn Card */}
            <div
              className="w-[150px] h-[230px] rounded-xl flex flex-col justify-between p-3.5 border relative overflow-hidden"
              style={{
                borderColor: `${getClanColor(revealedCard.clan)}40`,
                boxShadow: `0 0 35px ${getClanColor(revealedCard.clan)}30`,
              }}
            >
              {/* Real Card Illustration Image */}
              <img
                src={`/cards/${revealedCard.id}.png`}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = `/cards/${revealedCard.clan}.png`;
                }}
                alt={revealedCard.name}
                className="absolute inset-0 w-full h-full object-cover filter brightness-[0.75] contrast-[1.05]"
              />

              {/* Overlay content */}
              <div className="absolute inset-0 flex flex-col justify-between p-3.5 bg-gradient-to-t from-black via-black/10 to-transparent z-10">
                <span
                  className="font-display text-[7px] tracking-widest uppercase self-start drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]"
                  style={{ color: getClanColor(revealedCard.clan) }}
                >
                  {revealedCard.clan === "VoThuong" ? "Major Arcana" : "Minor Arcana"}
                </span>

                <div className="flex flex-col items-center gap-1 w-full mt-auto">
                  <div className="w-full h-px" style={{ background: `${getClanColor(revealedCard.clan)}40` }} />
                  <h3
                    className="font-display text-[10px] font-semibold tracking-wider mt-1 text-white drop-shadow-[0_1px_2.5px_rgba(0,0,0,0.95)]"
                  >
                    {revealedCard.name}
                  </h3>
                  <span className="font-sans text-[6px] text-white/40 italic drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]">
                    ({revealedCard.englishName})
                  </span>
                </div>
              </div>
            </div>

            {/* Whisper Dialogue */}
            <div
              className="mx-4 rounded-xl p-4 relative overflow-hidden"
              style={{
                background: "rgba(15, 10, 35, 0.8)",
                border: "1px solid rgba(139, 92, 246, 0.2)",
              }}
            >
              <span className="font-display text-[9px] text-purple-300/50 tracking-widest block mb-2 text-left">
                LỜI THÌ THẦM CỦA NGÀY
              </span>
              <p className="font-body text-sm text-white/70 italic leading-relaxed text-left">
                "{whisper}"
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 w-full px-4 mt-2">
              <button
                onClick={handleReset}
                className="flex-1 py-3 rounded-xl border border-white/10 text-xs font-sans text-white/60 hover:text-white hover:border-white/20 transition-all"
              >
                Đốt lại
              </button>
              <Link
                href="/ban-do"
                className="flex-1 py-3 rounded-xl bg-purple-500/20 text-xs font-sans text-purple-300 border border-purple-500/30 text-center hover:bg-purple-500/35 transition-all"
              >
                Xem Bản Đồ
              </Link>
            </div>
          </div>
        )}
      </div>

      {showWhisperPopup && randomWhisper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-5 animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl p-6 border text-left flex flex-col gap-4 text-white relative bg-[#0f1629] border-purple-500/30 shadow-[0_0_30px_rgba(139,92,246,0.2)]">
            <div className="flex items-center justify-between">
              <span className="font-display text-[9px] tracking-widest text-purple-400 uppercase font-semibold">
                TIẾNG THÌ THẦM TRONG SƯƠNG
              </span>
              <span className="text-xs opacity-40 font-sans">
                Tộc {randomWhisper.clan === 'DiemHoa' ? 'Diễm Hoả' : randomWhisper.clan === 'ThuyNguyet' ? 'Thuỷ Nguyệt' : randomWhisper.clan === 'PhongKiem' ? 'Phong Kiếm' : randomWhisper.clan === 'ThoKim' ? 'Thổ Kim' : 'Vô Thường'}
              </span>
            </div>
            
            {/* Content card */}
            <div className="rounded-xl p-4 bg-white/5 border border-white/5 italic text-sm text-white/80 font-body leading-relaxed">
              "{randomWhisper.content}"
            </div>

            {/* Vọng commentary */}
            {whisperCommentary && (
              <div className="flex gap-3 items-start border-t border-white/5 pt-3">
                <span className="text-base flex-shrink-0 animate-pulse text-purple-400">👁</span>
                <p className="font-body text-xs text-white/50 leading-relaxed italic">
                  {whisperCommentary}
                </p>
              </div>
            )}

            {/* Bless Option */}
            <div className="flex flex-col gap-2 mt-2">
              <button
                onClick={handleBlessWhisper}
                disabled={blessingLoading || blessed}
                className="w-full py-3.5 rounded-xl font-display text-xs tracking-widest font-semibold text-white transition-all text-center flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                style={{
                  background: blessed
                    ? "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(5,150,105,0.3))"
                    : "linear-gradient(135deg, rgba(212,168,67,0.7), rgba(200,146,45,0.8))",
                  border: blessed ? "1px solid rgba(16,185,129,0.4)" : "1px solid rgba(212,168,67,0.4)",
                  boxShadow: blessed ? "none" : "0 0 20px rgba(212,168,67,0.2)",
                  color: blessed ? "#6ee7b7" : "#ffffff",
                }}
              >
                <span>{blessed ? "🕯 ĐÃ THẮP NẾN CẦU AN" : "🕯 THẮP NẾN CẦU AN (+5 ERC)"}</span>
              </button>
              <button
                onClick={() => setShowWhisperPopup(false)}
                className="w-full py-3 rounded-xl border border-white/10 text-xs font-display tracking-widest text-white/50 hover:text-white transition-all cursor-pointer"
              >
                Quay lại Thánh Địa
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
            { href: "/thanh-dia", icon: "🔥", label: "Thánh Địa", active: true },
            { href: "/chon-trai-bai", icon: "🔮", label: "Trải Bài" },
            { href: "/nhat-ky", icon: "📋", label: "Nhật Ký" },
            { href: "/ho-so", icon: "👤", label: "Hồ Sơ" },
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
