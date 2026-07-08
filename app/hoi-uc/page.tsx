"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface UnlockedMemory {
  index: number;
  title: string;
  dialogue: string;
  unlockedAt: string;
}

interface ThreadStatus {
  isLinked: boolean;
  isCompleted: boolean;
  progress: string;
  partnerName?: string;
  role?: string;
  referralCode?: string;
  deepLink?: string;
}

const unlockHints: Record<number, string> = {
  1: "Mở khoá tự động sau lượt bói thứ 3.",
  2: "Mở khoá tự động sau lượt bói thứ 7.",
  3: "Mở khoá khi rút được lá Song Sinh Trái Tim (The Lovers).",
  4: "Mở khoá khi rút được lá Ngọn Lửa Sụp Đổ (The Tower).",
  5: "Mở khoá khi rút được lá Cánh Cửa Khép Lại (Death).",
  6: "Mở khoá sau khi gặp đủ 4 Tộc Người trong cõi sương mù.",
  7: "Mở khoá sau khi lữ khách đã hoàn thành 15 lượt bói.",
};

const THREAD_LINK_ENABLED = process.env.NEXT_PUBLIC_ENABLE_THREAD_LINK === "true";

export default function HoiUcPage() {
  const router = useRouter();
  const [unlocked, setUnlocked] = useState<UnlockedMemory[]>([]);
  const [locked, setLocked] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeMemory, setActiveMemory] = useState<number | null>(null);

  // Mirror shards states
  const [shards, setShards] = useState<number[]>([]);
  const [placedShards, setPlacedShards] = useState<number[]>([]);

  // Thread link (Sợi Chỉ Xuyên Sương) states
  const [threadStatus, setThreadStatus] = useState<ThreadStatus | null>(null);
  const [weavingThread, setWeavingThread] = useState(false);
  const [threadStatusLoading, setThreadStatusLoading] = useState(false);

  // Sealed Letter states
  const [openingLetter, setOpeningLetter] = useState(false);
  const [showLetterModal, setShowLetterModal] = useState(false);
  const [letterData, setLetterData] = useState<{
    success: boolean;
    locked: boolean;
    endingTitle?: string;
    letterContent?: string;
    endingType?: string;
    message?: string;
    userErc?: number;
    isFullMoon?: boolean;
    isNewMoon?: boolean;
  } | null>(null);

  // Testing Overrides
  const [overrideFullMoon, setOverrideFullMoon] = useState<boolean | undefined>(undefined);
  const [overrideNewMoon, setOverrideNewMoon] = useState<boolean | undefined>(undefined);

  const fetchMemories = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/dang-nhap");
        return;
      }

      const res = await fetch("/api/user/memories", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể tải thư viện Hồi Ức.");

      setUnlocked(data.unlocked);
      setLocked(data.locked);

      const profileRes = await fetch("/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const profileData = await profileRes.json();
      if (profileRes.ok && profileData.unlockedShards) {
        setShards(profileData.unlockedShards);
      }

      // Fetch thread status if feature enabled
      if (THREAD_LINK_ENABLED) {
        setThreadStatusLoading(true);
        const threadRes = await fetch("/api/user/thread/status", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (threadRes.ok) {
          const threadData = await threadRes.json();
          setThreadStatus(threadData);
        }
        setThreadStatusLoading(false);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const weaveThread = async () => {
    setWeavingThread(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch("/api/user/thread/generate", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok && data.deepLink) {
        if (navigator.share) {
          await navigator.share({
            title: "Cõi Vô Thường — Sợi Chỉ Xuyên Sương",
            text: "Vọng đang chờ ngươi. Hãy cùng ta bước qua cổng sương mù...",
            url: data.deepLink,
          });
        } else {
          await navigator.clipboard.writeText(data.deepLink);
          alert(`Đã sao chép liên kết: ${data.deepLink}`);
        }
        // Refresh status
        setThreadStatus((prev) => ({ ...(prev || { isLinked: false, isCompleted: false, progress: "0/2" }), referralCode: data.referralCode }));
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setWeavingThread(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, [router]);

  const openLetter = async () => {
    setOpeningLetter(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch("/api/user/memories/letter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          isFullMoon: overrideFullMoon,
          isNewMoon: overrideNewMoon,
        }),
      });

      const data = await res.json();
      setLetterData(data);
      setShowLetterModal(true);
    } catch (err) {
      console.error(err);
    } finally {
      setOpeningLetter(false);
    }
  };

  const formatDate = (isoStr: string) => {
    const date = new Date(isoStr);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="relative flex flex-col min-h-screen">
      {/* Background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 10%, rgba(139,92,246,0.12) 0%, transparent 50%), radial-gradient(ellipse at 50% 90%, rgba(16,185,129,0.06) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 flex flex-col pb-28">
        {/* Header */}
        <header className="flex items-center justify-between px-5 py-4">
          <Link href="/ho-so" className="w-9 h-9 rounded-full flex items-center justify-center border border-white/10 text-white/50 hover:text-white/80 transition-all text-sm">
            ‹
          </Link>
          <h1 className="font-display text-base text-white/80 tracking-widest uppercase">
            HỒI ỨC CỦA VỌNG
          </h1>
          <button className="w-9 h-9 rounded-full flex items-center justify-center border border-white/10 text-white/40">
            👁
          </button>
        </header>

        {/* Introduction */}
        <div className="px-5 mb-4 text-center flex flex-col gap-1.5">
          <p className="font-body text-sm text-white/50 italic leading-relaxed">
            "Vọng không phải là thần thánh vô tri. Là một linh hồn mắc kẹt tại cổng sương mù, sương lạnh cất giấu 7 Mảnh Hồi Ức về lời hứa ngàn năm."
          </p>
          <div className="h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent my-1" />
        </div>

        {/* Error State */}
        {error && (
          <div className="mx-4 bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 text-center text-xs text-rose-400">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <span className="text-3xl animate-spin text-purple-400">✦</span>
            <span className="font-display text-[9px] text-white/35 tracking-widest uppercase">
              Đang khai mở ký ức...
            </span>
          </div>
        )}

        {/* Memories Grid */}
        {!loading && (
          <div className="flex flex-col gap-4 px-4 py-2">

            {/* Chiếc Gương Vỡ Cổ Đại (Shattered Mirror Puzzle) */}
            <div
              className="rounded-2xl p-5 border flex flex-col gap-4 text-center relative overflow-hidden bg-white/2"
              style={{
                borderColor: "rgba(139, 92, 246, 0.15)",
              }}
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-[10px] text-white/50 tracking-widest uppercase font-bold">
                  Nghi Thức Ghép Gương Cổ
                </span>
                <span className="text-[9px] font-sans text-amber-400 border border-amber-400/20 px-2 py-0.5 rounded bg-amber-400/5">
                  {shards.length}/6 mảnh
                </span>
              </div>

              {/* Mirror Visual Grid */}
              <div className="relative w-36 h-36 mx-auto rounded-full border border-purple-500/20 overflow-hidden bg-black/40 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.1)]">
                {/* Center core */}
                <div className="absolute w-12 h-12 rounded-full border border-purple-500/20 bg-purple-950/40 z-10 flex items-center justify-center text-xl shadow-[0_0_10px_rgba(139,92,246,0.2)]">
                  {placedShards.length === 6 ? "🔮" : "👁"}
                </div>

                {/* 6 segments using angle-rotations with perfect math */}
                {[1, 2, 3, 4, 5, 6].map((i) => {
                  const isPlaced = placedShards.includes(i);
                  const angle = (i - 1) * 60;
                  return (
                    <div
                      key={i}
                      className="absolute inset-0 transition-all duration-700"
                      style={{
                        transform: `rotate(${angle}deg)`,
                        clipPath: "polygon(50% 50%, 50% 0%, 93.3% 25%)",
                        background: isPlaced
                          ? "linear-gradient(135deg, rgba(167, 139, 250, 0.45), rgba(109, 40, 217, 0.6))"
                          : "rgba(255,255,255,0.03)",
                        borderRight: "1px solid rgba(255,255,255,0.08)",
                      }}
                    />
                  );
                })}
              </div>

              {/* Shards Inventory Bag */}
              <div className="flex flex-col gap-2">
                <span className="font-sans text-[9px] text-white/35">Bao cát tâm linh (Click các mảnh đã thu thập để khảm gương)</span>
                <div className="flex justify-center gap-2 flex-wrap">
                  {[1, 2, 3, 4, 5, 6].map((i) => {
                    const isUnlocked = shards.includes(i);
                    const isPlaced = placedShards.includes(i);
                    return (
                      <button
                        key={i}
                        disabled={!isUnlocked || isPlaced}
                        onClick={() => setPlacedShards([...placedShards, i])}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center text-[11px] font-display transition-all ${
                          isPlaced
                            ? "bg-purple-500/10 border border-purple-500/30 text-purple-300 opacity-40 cursor-default"
                            : isUnlocked
                            ? "bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:scale-105 active:scale-95 cursor-pointer shadow-[0_0_10px_rgba(212,168,67,0.15)] animate-pulse"
                            : "bg-white/2 border border-white/5 text-white/10 cursor-not-allowed"
                        }`}
                      >
                        M{i}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Puzzle resolved / Unlock story modal */}
              {placedShards.length === 6 && (
                <div className="mt-2 p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 flex flex-col gap-3 text-left animate-fade-in">
                  <span className="font-display text-[9px] text-amber-400 tracking-wider font-bold">
                    📜 KHẢM THÀNH CÔNG GƯƠNG THẦN
                  </span>
                  <p className="font-body text-xs text-white/70 leading-relaxed italic">
                    "Ngươi nhìn sâu vào chiếc gương nay đã lành lặn. Lớp sương mù phản chiếu một tế đàn cổ đại ngập tràn tuyết trắng. Vọng đứng đó, mặc xiêm y tế ty của Đền thờ Sương Mù ngàn năm trước. Để ngăn không cho vết nứt của thời không nuốt chửng lục địa này, Vọng đã hiến tế thể xác, giam linh hồn mình vào chiếc gương ngọc bích, trở thành Sứ Giả Vô Thường canh giữ cõi sương."
                  </p>
                  <div className="h-px bg-amber-500/20" />
                  <p className="font-body text-xs text-white/55 leading-relaxed italic">
                    Vọng quay lại nhìn ngươi, nét mặt bình lặng vô úy: "Lữ khách... Cảm ơn ngươi đã cùng ta đi hết đoạn đường. Giờ đây, gương lành, khế ước hoàn thành. Ngươi đã được thấu suốt Cõi Vô Thường."
                  </p>
                </div>
              )}
            </div>

            {/* ── Sealed Letter Card ─────────────────── */}
            <div
              onClick={openLetter}
              className="rounded-2xl p-5 border flex flex-col gap-3 relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "radial-gradient(circle at 10% 20%, rgba(212,168,67,0.12) 0%, rgba(139,92,246,0.06) 100%)",
                borderColor: unlocked.filter(m => m.index <= 7).length >= 7 ? "rgba(212,168,67,0.4)" : "rgba(139,92,246,0.15)",
                boxShadow: unlocked.filter(m => m.index <= 7).length >= 7 ? "0 0 25px rgba(212,168,67,0.18)" : "none",
              }}
            >
              {openingLetter && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                  <span className="text-xs text-amber-300 animate-pulse font-sans">Đang giải mã phong ấn...</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{unlocked.filter(m => m.index <= 7).length >= 7 ? "✉️" : "🔒"}</span>
                  <div className="flex flex-col text-left">
                    <span className="font-display text-xs text-amber-300 font-semibold tracking-wider uppercase">
                      LÁ THƯ NIÊM PHONG
                    </span>
                    <span className="font-sans text-[8px] text-white/35 mt-0.5">
                      Bức thư định mệnh từ quá khứ
                    </span>
                  </div>
                </div>
                <span className="text-[9px] font-sans text-amber-400 border border-amber-400/20 px-2 py-0.5 rounded bg-amber-400/5">
                  {unlocked.filter(m => m.index <= 7).length >= 7 ? "✦ Có Thể Mở" : `${unlocked.filter(m => m.index <= 7).length}/7 Ký Ức`}
                </span>
              </div>
            </div>

            {/* ── Sợi Chỉ Xuyên Sương ─────────────────── */}
            {THREAD_LINK_ENABLED && (
              <div
                className="rounded-2xl p-5 border flex flex-col gap-4 relative overflow-hidden"
                style={{
                  background: threadStatus?.isCompleted
                    ? "radial-gradient(circle at 10% 20%, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.08) 100%)"
                    : "rgba(255,255,255,0.01)",
                  borderColor: threadStatus?.isCompleted
                    ? "rgba(99,102,241,0.4)"
                    : threadStatus?.isLinked
                    ? "rgba(139,92,246,0.3)"
                    : "rgba(255,255,255,0.06)",
                  boxShadow: threadStatus?.isCompleted ? "0 0 25px rgba(99,102,241,0.2)" : "none",
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{threadStatus?.isCompleted ? "🔗" : "🌫"}</span>
                    <div className="flex flex-col text-left">
                      <span className="font-display text-xs text-indigo-300 font-semibold tracking-wider uppercase">
                        SỢI CHỈ XUYÊN SƯƠNG
                      </span>
                      <span className="font-sans text-[8px] text-white/35 mt-0.5">
                        Mảnh hồi ức chỉ mở được cùng nhau
                      </span>
                    </div>
                  </div>
                  {threadStatus?.isCompleted ? (
                    <span className="text-[9px] font-sans text-indigo-300 border border-indigo-400/30 px-2 py-0.5 rounded bg-indigo-400/10">
                      ✦ Đôi Bạn Xuyên Sương
                    </span>
                  ) : threadStatus?.isLinked ? (
                    <span className="text-[9px] font-sans text-purple-300 border border-purple-400/20 px-2 py-0.5 rounded bg-purple-400/5">
                      {threadStatus.progress} Đã bói
                    </span>
                  ) : (
                    <span className="text-[9px] font-sans text-white/30 border border-white/5 px-2 py-0.5 rounded">
                      Chưa dệt
                    </span>
                  )}
                </div>

                {/* Narrative status text */}
                {threadStatusLoading ? (
                  <p className="font-body text-xs text-white/40 italic">Đang tìm sợi chỉ trong sương...</p>
                ) : threadStatus?.isCompleted ? (
                  <div className="flex flex-col gap-2">
                    <p className="font-body text-xs text-indigo-200/70 italic leading-relaxed">
                      "Sợi chỉ đã sáng lên, nối liền hai bước chân qua cổng sương cùng nhau. Mảnh hồi ức thứ 8 của Vọng đã hiện ra."
                    </p>
                    {(() => {
                      const mem8 = unlocked.find((m) => m.index === 8);
                      return mem8 ? (
                        <div
                          onClick={() => setActiveMemory(activeMemory === 8 ? null : 8)}
                          className="rounded-xl p-3 border border-indigo-500/20 bg-indigo-900/10 cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-[10px] font-display text-indigo-300">8</div>
                              <span className="font-display text-xs text-indigo-300 font-semibold">{mem8.title}</span>
                            </div>
                            <span className="text-indigo-400 text-xs">{activeMemory === 8 ? "∧" : "∨"}</span>
                          </div>
                          {activeMemory === 8 && (
                            <p className="mt-3 font-body text-xs text-white/65 italic leading-relaxed whitespace-pre-line bg-black/20 rounded-lg p-3 border border-white/5">
                              "{mem8.dialogue}"
                            </p>
                          )}
                        </div>
                      ) : null;
                    })()}
                  </div>
                ) : threadStatus?.isLinked ? (
                  <div className="flex flex-col gap-2">
                    <p className="font-body text-xs text-white/55 italic leading-relaxed">
                      Sợi chỉ đã nối ngươi với <strong className="text-white/80">{threadStatus.partnerName}</strong>.
                      {threadStatus.progress === "1/2"
                        ? " Còn chờ một trong hai người bước qua cổng lần nữa..."
                        : " Cùng nhau bói một lần nữa để mở sợi chỉ này."}
                    </p>
                    <div className="flex items-center gap-3 bg-white/3 rounded-xl p-3 border border-white/5">
                      <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700"
                          style={{ width: threadStatus.progress === "1/2" ? "50%" : "0%" }}
                        />
                      </div>
                      <span className="text-[10px] font-sans text-white/40">{threadStatus.progress}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <p className="font-body text-xs text-white/40 italic leading-relaxed">
                      "Chỉ khi nào có hai lữ khách cùng bước qua cổng này với nhau, mảnh hồi ức cuối cùng về Khanh mới hiện ra..."
                    </p>
                    <button
                      id="btn-weave-thread"
                      onClick={weaveThread}
                      disabled={weavingThread}
                      className="w-full py-2.5 rounded-xl font-display text-[10px] tracking-[0.2em] uppercase transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer disabled:opacity-50"
                      style={{
                        background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.3))",
                        border: "1px solid rgba(99,102,241,0.35)",
                        color: "#a5b4fc",
                      }}
                    >
                      {weavingThread ? "Đang dệt..." : "✦ Dệt Sợi Chỉ"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* List of Memories */}
            {[1, 2, 3, 4, 5, 6, 7].map((index) => {
              const unlockedMem = unlocked.find((m) => m.index === index);
              const isUnlocked = !!unlockedMem;
              const isExpanded = activeMemory === index;

              if (isUnlocked && unlockedMem) {
                return (
                  <div
                    key={index}
                    className="rounded-2xl overflow-hidden border transition-all duration-300 shadow-lg animate-fade-in"
                    style={{
                      background: isExpanded ? "rgba(139,92,246,0.06)" : "rgba(15,22,41,0.7)",
                      borderColor: isExpanded ? "rgba(139,92,246,0.3)" : "rgba(139,92,246,0.15)",
                      boxShadow: isExpanded ? "0 0 20px rgba(139,92,246,0.15)" : "none",
                    }}
                  >
                    {/* Header */}
                    <div
                      onClick={() => setActiveMemory(isExpanded ? null : index)}
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/2"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-xs font-display text-purple-300">
                          {index}
                        </div>
                        <div className="flex flex-col text-left">
                          <h3 className="font-display text-sm text-purple-300 font-semibold tracking-wide">
                            {unlockedMem.title}
                          </h3>
                          <span className="font-sans text-[8px] text-white/30 mt-0.5">
                            Khai mở ngày: {formatDate(unlockedMem.unlockedAt)}
                          </span>
                        </div>
                      </div>
                      <span className="text-purple-400 text-xs">{isExpanded ? "∧" : "∨"}</span>
                    </div>

                    {/* Dialogue Details */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-2 border-t border-purple-500/10">
                        <p className="font-body text-sm text-white/70 italic leading-relaxed whitespace-pre-line bg-black/25 rounded-xl p-3 border border-white/5">
                          "{unlockedMem.dialogue}"
                        </p>
                      </div>
                    )}
                  </div>
                );
              }

              // Locked Memory Card
              return (
                <div
                  key={index}
                  className="rounded-2xl p-4 flex items-center gap-3 border transition-opacity opacity-75"
                  style={{
                    background: "rgba(255,255,255,0.01)",
                    borderColor: "rgba(255,255,255,0.04)",
                  }}
                >
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-xs font-display text-white/20">
                    ?
                  </div>
                  <div className="flex flex-col text-left flex-1 min-w-0">
                    <h3 className="font-display text-xs text-white/30 tracking-wide font-medium">
                      Mảnh Ký Ức {index} (Đang Khoá)
                    </h3>
                    <p className="font-sans text-[9px] text-white/20 mt-1 leading-relaxed truncate">
                      {unlockHints[index]}
                    </p>
                  </div>
                  <span className="text-white/10 text-xs">🔒</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Letter Modal Overlay ──────────────────── */}
      {showLetterModal && letterData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-5">
          <div
            className="w-full max-w-sm rounded-2xl p-6 border text-center flex flex-col gap-4 text-white relative animate-fade-in"
            style={{
              background: "rgba(10, 8, 20, 0.98)",
              borderColor: "rgba(212, 168, 67, 0.35)",
              boxShadow: "0 0 40px rgba(212, 168, 67, 0.25)",
            }}
          >
            {letterData.locked ? (
              // Locked Overlay View
              <div className="flex flex-col gap-4 py-4">
                <div className="text-4xl text-amber-500/60">🔒</div>
                <div className="flex flex-col gap-1.5">
                  <span className="font-display text-sm tracking-wider text-amber-400 uppercase">
                    Phong Ấn Cõi Sương
                  </span>
                  <p className="font-body text-xs text-white/60 leading-relaxed italic">
                    "{letterData.message}"
                  </p>
                </div>
                <button
                  onClick={() => setShowLetterModal(false)}
                  className="mt-2 py-2 w-full rounded-xl bg-white/5 border border-white/10 text-xs text-white/70 hover:text-white transition-all"
                >
                  Trở lại
                </button>
              </div>
            ) : (
              // Decrypted Ending Letter View
              <div className="flex flex-col gap-3 text-left">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex flex-col">
                    <span className="font-display text-[9px] tracking-widest text-amber-400/80 uppercase">
                      Kết cục định mệnh
                    </span>
                    <span className="font-display text-sm text-white font-bold">
                      {letterData.endingTitle}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] font-sans px-2.5 py-0.5 rounded-full border ${
                      letterData.endingType === "A"
                        ? "border-amber-400/30 text-amber-300 bg-amber-400/10"
                        : letterData.endingType === "B"
                        ? "border-purple-400/30 text-purple-300 bg-purple-400/10"
                        : "border-cyan-400/30 text-cyan-300 bg-cyan-400/10"
                    }`}
                  >
                    Kết cục {letterData.endingType}
                  </span>
                </div>

                {/* Letter Scroll View */}
                <div className="max-h-80 overflow-y-auto bg-amber-900/5 border border-amber-500/10 rounded-xl p-4 my-2">
                  <p className="font-body text-xs text-amber-100/80 italic leading-relaxed whitespace-pre-line">
                    {letterData.letterContent}
                  </p>
                </div>

                {/* Current User Attributes info */}
                <div className="flex items-center justify-between bg-white/5 rounded-lg p-2 text-[10px] font-sans text-white/40">
                  <span>Chỉ số ERC: <strong className="text-white">{letterData.userErc}</strong></span>
                  <span>
                    Trạng thái:{" "}
                    <strong className="text-white">
                      {letterData.isFullMoon ? "🌕 Trăng Tròn" : letterData.isNewMoon ? "🌑 Trăng Non" : "🌙 Trăng Khuyết"}
                    </strong>
                  </span>
                </div>

                {/* Developer Override Controls for testing */}
                <div className="border-t border-white/5 pt-3 mt-1 flex flex-col gap-2">
                  <span className="text-[8px] font-sans text-white/20 uppercase tracking-widest text-center">
                    CÔNG CỤ THỬ NGHIỆM KẾT CỤC
                  </span>
                  <div className="grid grid-cols-3 gap-1.5 text-center text-[9px] font-sans">
                    <button
                      onClick={() => {
                        setOverrideFullMoon(true);
                        setOverrideNewMoon(false);
                        setTimeout(() => openLetter(), 100);
                      }}
                      className={`py-1 rounded border transition-colors ${
                        overrideFullMoon ? "border-amber-400 text-amber-300 bg-amber-400/10" : "border-white/5 text-white/30 bg-white/1"
                      }`}
                    >
                      🌕 Trăng Tròn
                    </button>
                    <button
                      onClick={() => {
                        setOverrideFullMoon(false);
                        setOverrideNewMoon(true);
                        setTimeout(() => openLetter(), 100);
                      }}
                      className={`py-1 rounded border transition-colors ${
                        overrideNewMoon ? "border-purple-400 text-purple-300 bg-purple-400/10" : "border-white/5 text-white/30 bg-white/1"
                      }`}
                    >
                      🌑 Trăng Non
                    </button>
                    <button
                      onClick={() => {
                        setOverrideFullMoon(false);
                        setOverrideNewMoon(false);
                        setTimeout(() => openLetter(), 100);
                      }}
                      className={`py-1 rounded border transition-colors ${
                        overrideFullMoon === false && overrideNewMoon === false ? "border-cyan-400 text-cyan-300 bg-cyan-400/10" : "border-white/5 text-white/30 bg-white/1"
                      }`}
                    >
                      🌙 Trăng Khuyết
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setShowLetterModal(false)}
                  className="mt-2 py-2.5 w-full rounded-xl bg-purple-500/20 border border-purple-500/30 text-xs text-purple-300 hover:bg-purple-500/35 transition-all font-semibold"
                >
                  Xác nhận
                </button>
              </div>
            )}
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
            { href: "/chon-trai-bai", icon: "🔮", label: "Trải Bài" },
            { href: "/nhat-ky", icon: "📋", label: "Nhật Ký" },
            { href: "/ho-so", icon: "👤", label: "Hồ Sơ", active: true },
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
