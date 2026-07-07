"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { playCardRustle, playCardFlip, startFireCrackling, stopFireCrackling } from "@/lib/audio";

interface DiscoveredCard {
  cardId: string;
  cardName: string;
  encounterCount: number;
  brightness: number;
}

interface UndiscoveredCard {
  cardId: string;
  cardName: string;
}

interface Region {
  clan: string;
  clanNameVi: string;
  totalCards: number;
  discoveredCards: DiscoveredCard[];
  undiscoveredCards: UndiscoveredCard[];
  discoveredCount: number;
  isCompleted: boolean;
  treasure: string | null;
}

function InteractiveRelic({ clan, treasure }: { clan: string; treasure: string }) {
  const [interacting, setInteracting] = useState(false);
  const [growStage, setGrowStage] = useState(0); // for ThoKim sprout

  useEffect(() => {
    return () => {
      if (clan === "DiemHoa") stopFireCrackling();
    };
  }, [clan]);

  const handleInteract = () => {
    if (interacting) return;
    setInteracting(true);

    if (clan === "DiemHoa") {
      startFireCrackling();
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
      setTimeout(() => {
        stopFireCrackling();
        setInteracting(false);
      }, 3000);
    } else if (clan === "ThuyNguyet") {
      playCardRustle();
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([50, 50, 50]);
      }
      setTimeout(() => {
        setInteracting(false);
      }, 1500);
    } else if (clan === "PhongKiem") {
      playCardRustle();
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(30);
      }
      setTimeout(() => {
        setInteracting(false);
      }, 800);
    } else if (clan === "ThoKim") {
      playCardFlip();
      setGrowStage((prev) => (prev + 1) % 4);
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(60);
      }
      setTimeout(() => {
        setInteracting(false);
      }, 1000);
    } else {
      setInteracting(false);
    }
  };

  return (
    <button
      onClick={handleInteract}
      className={`w-full rounded-xl p-4 flex items-center justify-between border transition-all duration-500 overflow-hidden relative ${
        interacting
          ? "border-amber-400/60 bg-amber-400/10 shadow-[0_0_20px_rgba(212,168,67,0.25)]"
          : "border-amber-400/20 bg-amber-400/5 hover:border-amber-400/40"
      }`}
    >
      <div className="flex items-center gap-3 relative z-10">
        <div className="w-12 h-12 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center text-2xl">
          {clan === "DiemHoa" && (
            <span className={interacting ? "animate-bounce text-red-500" : "text-amber-500"}>🔥</span>
          )}
          {clan === "ThuyNguyet" && (
            <span className={interacting ? "animate-ping text-cyan-400" : "text-cyan-500"}>🌊</span>
          )}
          {clan === "PhongKiem" && (
            <span className={interacting ? "rotate-45 transition-transform duration-200 text-purple-400" : "text-purple-300"}>⚔️</span>
          )}
          {clan === "ThoKim" && (
            <span>
              {growStage === 0 && "🌱"}
              {growStage === 1 && "🌿"}
              {growStage === 2 && "🪴"}
              {growStage === 3 && "🌳"}
            </span>
          )}
        </div>

        <div className="flex flex-col text-left">
          <span className="font-display text-xs text-amber-300 tracking-wider font-semibold">
            Bảo vật của Tộc đã mở
          </span>
          <span className="font-body text-xs text-white/70 italic mt-0.5">
            "{treasure}"
          </span>
          <span className="font-sans text-[8px] text-white/30 mt-0.5 uppercase tracking-widest">
            {interacting ? "Đang tương tác..." : "Chạm để kích hoạt bảo vật"}
          </span>
        </div>
      </div>

      <div className="text-right relative z-10">
        <span className="text-[10px] font-sans text-amber-400 border border-amber-400/30 px-2.5 py-0.5 rounded-full bg-amber-400/10 uppercase tracking-wider">
          {clan === "DiemHoa" && (interacting ? "🔥 Cháy" : "✦ Sẵn sàng")}
          {clan === "ThuyNguyet" && (interacting ? "🌊 Sóng" : "✦ Sẵn sàng")}
          {clan === "PhongKiem" && (interacting ? "⚡ Chém" : "✦ Sẵn sàng")}
          {clan === "ThoKim" && `🌱 Cấp ${growStage + 1}`}
        </span>
      </div>

      {interacting && clan === "DiemHoa" && (
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent pointer-events-none animate-pulse" />
      )}
      {interacting && clan === "ThuyNguyet" && (
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-transparent pointer-events-none animate-pulse" />
      )}
      {interacting && clan === "PhongKiem" && (
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-transparent pointer-events-none" />
      )}
    </button>
  );
}

export default function BanDoPage() {
  const router = useRouter();
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeRegion, setActiveRegion] = useState<string | null>(null);

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/dang-nhap");
          return;
        }

        const res = await fetch("/api/user/map", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Không thể tải bản đồ hành trình.");

        setRegions(data.regions);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMapData();
  }, [router]);

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

  const getClanEmoji = (clanName: string) => {
    const map: Record<string, string> = {
      DiemHoa: "🔥",
      ThuyNguyet: "🌊",
      PhongKiem: "⚔️",
      ThoKim: "🌿",
      VoThuong: "🏛️",
    };
    return map[clanName] || "🔮";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <span className="text-3xl animate-spin text-purple-400">✦</span>
        <span className="font-display text-[9px] text-white/35 tracking-widest uppercase">
          Đang trải bản đồ...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4 text-center">
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 text-xs text-rose-400 max-w-sm">
          {error}
        </div>
        <Link href="/dang-nhap" className="text-xs text-purple-400 hover:underline">
          Quay lại Đăng Nhập
        </Link>
      </div>
    );
  }

  const totalDiscovered = regions.reduce((sum, r) => sum + r.discoveredCount, 0);
  const totalCards = regions.reduce((sum, r) => sum + r.totalCards, 0);

  return (
    <div className="relative flex flex-col min-h-screen">
      {/* Background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(139,92,246,0.12) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 flex flex-col pb-28">
        {/* Header */}
        <header className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="text-purple-400 text-base">🗺️</span>
            <span className="font-display text-sm text-white/70 tracking-widest">
              BẢN ĐỒ HÀNH TRÌNH
            </span>
          </div>
          <div
            className="px-3 py-1 rounded-full text-[10px] font-display border border-purple-500/30 text-purple-300"
            style={{ background: "rgba(139,92,246,0.1)" }}
          >
            ĐÃ GẶP: {totalDiscovered}/{totalCards} Lá
          </div>
        </header>

        {/* Regions list */}
        <div className="flex flex-col gap-4 px-4 py-2">
          {regions.map((region) => {
            const isExpanded = activeRegion === region.clan;
            const clanColor = getClanColor(region.clan);

            return (
              <div
                key={region.clan}
                className="rounded-2xl overflow-hidden border transition-all duration-300"
                style={{
                  background: isExpanded ? `${clanColor}08` : "rgba(15,22,41,0.7)",
                  borderColor: isExpanded ? `${clanColor}45` : "rgba(255,255,255,0.06)",
                  boxShadow: isExpanded ? `0 0 20px ${clanColor}15` : "none",
                }}
              >
                {/* Header click to expand */}
                <div
                  onClick={() => setActiveRegion(isExpanded ? null : region.clan)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/2"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                      style={{
                        background: `${clanColor}15`,
                        border: `1px solid ${clanColor}35`,
                      }}
                    >
                      {getClanEmoji(region.clan)}
                    </div>
                    <div className="flex flex-col text-left">
                      <div className="flex items-center gap-2">
                        <h3
                          className="font-display text-sm font-semibold tracking-wide"
                          style={{ color: isExpanded ? "#ffffff" : `${clanColor}dd` }}
                        >
                          {region.clanNameVi}
                        </h3>
                        <span className="text-[10px] font-sans text-white/35">
                          ({region.discoveredCount}/{region.totalCards})
                        </span>
                      </div>
                      <p className="font-body text-xs text-white/45 mt-0.5 leading-relaxed italic">
                        {region.clan === "VoThuong"
                          ? "Nơi cư ngụ của 22 Sứ Giả Lớn Major Arcana."
                          : `Tộc nguyên tố của các Sứ Giả ${region.clanNameVi.replace("Tộc ", "")}.`}
                      </p>
                    </div>
                  </div>
                  <span className="text-white/20 text-xs">{isExpanded ? "∧" : "∨"}</span>
                </div>

                {/* Region Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-white/5 flex flex-col gap-4">
                    {/* Discovered cards list */}
                    <div className="flex flex-col gap-2">
                      <span className="font-display text-[9px] text-white/35 tracking-widest uppercase">
                        Sứ giả đã gặp
                      </span>

                      {region.discoveredCards.length === 0 ? (
                        <p className="font-body text-xs text-white/25 italic">
                          Chưa gặp Sứ Giả nào của tộc hệ này.
                        </p>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          {region.discoveredCards.map((card) => (
                            <div
                              key={card.cardId}
                              className="rounded-xl p-3 flex flex-col gap-1 border"
                              style={{
                                background: "rgba(255,255,255,0.02)",
                                borderColor: `${clanColor}20`,
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-display text-xs text-white/80 truncate">
                                  {card.cardName}
                                </span>
                                <span className="text-[10px] font-sans text-white/30">
                                  x{card.encounterCount}
                                </span>
                              </div>
                              {/* Brightness indicator */}
                              <div className="flex items-center gap-1.5 mt-1">
                                <div className="h-1.5 flex-1 rounded-full bg-white/5 overflow-hidden">
                                  <div
                                    className="h-full rounded-full"
                                    style={{
                                      width: `${card.brightness * 100}%`,
                                      background: clanColor,
                                    }}
                                  />
                                </div>
                                <span className="text-[8px] font-sans text-white/30">
                                  {Math.round(card.brightness * 100)}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Undiscovered cards list */}
                    {region.undiscoveredCards.length > 0 && (
                      <div className="flex flex-col gap-2 border-t border-white/5 pt-3">
                        <span className="font-display text-[9px] text-white/20 tracking-widest uppercase">
                          Sứ giả chưa gặp
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {region.undiscoveredCards.map((card) => (
                            <span
                              key={card.cardId}
                              className="font-sans text-[10px] px-2.5 py-1 rounded-lg border border-dashed border-white/10 text-white/20 bg-white/1"
                            >
                              {card.cardName}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Treasure Box */}
                    <div className="border-t border-white/5 pt-3 mt-1">
                      {region.isCompleted ? (
                      <InteractiveRelic clan={region.clan} treasure={region.treasure || ""} />
                      ) : (
                        <div className="rounded-xl p-3 flex items-center justify-between border border-dashed border-white/5 bg-white/1 opacity-55">
                          <div className="flex items-center gap-2">
                            <span className="text-base text-white/20">🔒</span>
                            <div className="flex flex-col">
                              <span className="font-display text-xs text-white/30">
                                Bảo vật ẩn giấu
                              </span>
                              <span className="font-sans text-[10px] text-white/20">
                                Gặp đủ {region.totalCards} Sứ Giả để mở khoá.
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
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
            { href: "/ban-do", icon: "🗺️", label: "Map", active: true },
            { href: "/chon-trai-bai", icon: "📖", label: "Bói" },
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
