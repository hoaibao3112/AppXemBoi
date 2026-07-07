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

const unlockHints: Record<number, string> = {
  1: "Mở khoá tự động sau lượt bói thứ 3.",
  2: "Mở khoá tự động sau lượt bói thứ 7.",
  3: "Mở khoá khi rút được lá Song Sinh Trái Tim (The Lovers).",
  4: "Mở khoá khi rút được lá Ngọn Lửa Sụp Đổ (The Tower).",
  5: "Mở khoá khi rút được lá Cánh Cửa Khép Lại (Death).",
  6: "Mở khoá sau khi gặp đủ 4 Tộc Người trong cõi sương mù.",
  7: "Mở khoá sau khi lữ khách đã hoàn thành 15 lượt bói.",
};

export default function HoiUcPage() {
  const router = useRouter();
  const [unlocked, setUnlocked] = useState<UnlockedMemory[]>([]);
  const [locked, setLocked] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeMemory, setActiveMemory] = useState<number | null>(null);

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
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể tải thư viện Hồi Ức.");

      setUnlocked(data.unlocked);
      setLocked(data.locked);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, [router]);

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
          <Link href="/" className="w-9 h-9 rounded-full flex items-center justify-center border border-white/10 text-white/50 hover:text-white/80 transition-all text-sm">
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
            {[1, 2, 3, 4, 5, 6, 7].map((index) => {
              const unlockedMem = unlocked.find((m) => m.index === index);
              const isUnlocked = !!unlockedMem;
              const isExpanded = activeMemory === index;

              if (isUnlocked && unlockedMem) {
                return (
                  <div
                    key={index}
                    className="rounded-2xl overflow-hidden border transition-all duration-300 shadow-lg"
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
                  className="rounded-2xl p-4 flex items-center gap-3 border"
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
            { href: "/", icon: "🗺️", label: "Map" },
            { href: "/chon-trai-bai", icon: "📖", label: "Bói" },
            { href: "/nhat-ky", icon: "📋", label: "Journal" },
            { href: "/hoi-uc", icon: "🔮", label: "Memory", active: true },
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
