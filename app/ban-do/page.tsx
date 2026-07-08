"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { playCardRustle, playCardFlip, startFireCrackling, stopFireCrackling, triggerHaptic } from "@/lib/audio";

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
      triggerHaptic([100, 50, 100]);
      setTimeout(() => {
        stopFireCrackling();
        setInteracting(false);
      }, 3000);
    } else if (clan === "ThuyNguyet") {
      playCardRustle();
      triggerHaptic([50, 50, 50]);
      setTimeout(() => {
        setInteracting(false);
      }, 1500);
    } else if (clan === "PhongKiem") {
      playCardRustle();
      triggerHaptic(30);
      setTimeout(() => {
        setInteracting(false);
      }, 800);
    } else if (clan === "ThoKim") {
      playCardFlip();
      setGrowStage((prev) => (prev + 1) % 4);
      triggerHaptic(60);
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
  const [activePact, setActivePact] = useState<any>(null);
  const [claimingPact, setClaimingPact] = useState(false);
  const [showPactModal, setShowPactModal] = useState(false);

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

        // Fetch active pact
        const pactRes = await fetch("/api/user/pact", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const pactData = await pactRes.json();
        if (pactRes.ok && pactData.activePact) {
          setActivePact(pactData.activePact);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMapData();
  }, [router]);

  const handleClaimPact = async () => {
    if (claimingPact || !activePact) return;
    setClaimingPact(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/user/pact", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể nghiệm thu khế ước.");

      // Update cached user profile
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          parsed.activePactCardId = null;
          parsed.activePactTarget = null;
          parsed.activePactExpiresAt = null;
          parsed.unlockedShards = data.unlockedShards;
          localStorage.setItem("user", JSON.stringify(parsed));
        } catch (e) {}
      }

      setActivePact(null);
      setShowPactModal(false);
      
      alert(`Khế ước hoàn tất! Ngươi nhận được Mảnh Gương Vỡ #${data.newShard}`);
    } catch (e: any) {
      alert(e.message || "Bạn chưa hoàn thành mục tiêu khế ước này.");
    } finally {
      setClaimingPact(false);
    }
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

  const getCardClan = (cardId: string) => {
    if (!cardId) return null;
    if (cardId.startsWith("major-") || cardId.includes("major")) return "VoThuong";
    if (cardId.startsWith("wands-") || cardId.includes("wands")) return "DiemHoa";
    if (cardId.startsWith("cups-") || cardId.includes("cups")) return "ThuyNguyet";
    if (cardId.startsWith("swords-") || cardId.includes("swords")) return "PhongKiem";
    if (cardId.startsWith("pentacles-") || cardId.includes("pentacles") || cardId.includes("pents")) return "ThoKim";
    
    const num = parseInt(cardId);
    if (!isNaN(num)) {
      if (num <= 21) return "VoThuong";
      if (num <= 35) return "DiemHoa";
      if (num <= 49) return "ThuyNguyet";
      if (num <= 63) return "PhongKiem";
      return "ThoKim";
    }
    return null;
  };

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

        {/* Graphical Constellation Map Board */}
        <div className="mx-4 my-2 relative w-[calc(100%-2rem)] h-[480px] rounded-2xl border border-purple-500/15 overflow-hidden bg-black/40 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-md">
          {/* Starry night sky effect */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(15,10,35,0.8)_0%,rgba(5,5,10,0.95)_100%)]" />
          
          {/* Constellation SVG Lines connecting nodes */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {/* Pulsing connections to VoThuong */}
            <line x1="50%" y1="50%" x2="20%" y2="22%" stroke="rgba(167, 139, 250, 0.25)" strokeWidth="1.5" strokeDasharray="6,6" className="animate-pulse" />
            <line x1="50%" y1="50%" x2="80%" y2="22%" stroke="rgba(167, 139, 250, 0.25)" strokeWidth="1.5" strokeDasharray="6,6" className="animate-pulse" />
            <line x1="50%" y1="50%" x2="20%" y2="78%" stroke="rgba(167, 139, 250, 0.25)" strokeWidth="1.5" strokeDasharray="6,6" className="animate-pulse" />
            <line x1="50%" y1="50%" x2="80%" y2="78%" stroke="rgba(167, 139, 250, 0.25)" strokeWidth="1.5" strokeDasharray="6,6" className="animate-pulse" />
          </svg>

          {/* Interactive Floating Nodes */}
          {regions.map((region) => {
            const coords: Record<string, { top: string; left: string }> = {
              DiemHoa: { top: '22%', left: '20%' },
              ThuyNguyet: { top: '22%', left: '80%' },
              VoThuong: { top: '50%', left: '50%' },
              PhongKiem: { top: '78%', left: '20%' },
              ThoKim: { top: '78%', left: '80%' }
            };
            const coord = coords[region.clan] || { top: '50%', left: '50%' };
            const clanColor = getClanColor(region.clan);
            
            const pactClan = activePact ? getCardClan(activePact.cardId) : null;
            const hasActivePactHere = pactClan === region.clan;

            return (
              <button
                key={region.clan}
                onClick={() => {
                  setActiveRegion(region.clan);
                  try {
                    playCardFlip();
                    triggerHaptic(50);
                  } catch (e) {}
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 transition-all duration-300 hover:scale-110 group cursor-pointer z-10"
                style={{
                  top: coord.top,
                  left: coord.left,
                }}
              >
                {/* Node circle */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-lg relative shadow-lg transition-all duration-500`}
                  style={{
                    background: "rgba(10, 8, 25, 0.9)",
                    border: `1px solid ${clanColor}45`,
                    boxShadow: `0 0 15px ${clanColor}20`,
                  }}
                >
                  {/* Outer pulse animation for interactive nodes */}
                  <div
                    className="absolute inset-0 rounded-full animate-ping opacity-25"
                    style={{ background: clanColor }}
                  />
                  {getClanEmoji(region.clan)}
                  
                  {hasActivePactHere && (
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-500 border border-amber-300 flex items-center justify-center text-[10px] shadow-[0_0_10px_rgba(245,158,11,0.6)] animate-bounce z-20">
                      📜
                    </div>
                  )}
                </div>

                {/* Region name tag */}
                <div
                  className="px-2.5 py-0.5 rounded-full border text-[9px] font-display font-semibold tracking-wider transition-all"
                  style={{
                    background: "rgba(8, 11, 20, 0.85)",
                    borderColor: `${clanColor}30`,
                    color: clanColor,
                  }}
                >
                  {region.clanNameVi.replace("Tộc ", "")}
                </div>
              </button>
            );
          })}
        </div>

        {/* Dynamic Astrological Events Panel */}
        <div className="mx-4 mt-4 p-4 rounded-2xl border border-purple-500/10 bg-purple-950/5 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-amber-300 text-sm">🌌</span>
            <span className="font-display text-[9px] text-white/80 tracking-widest font-semibold uppercase">
              HIỆN TRẠNG TINH TÚ CÕI GIỚI
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-left">
            <div className="p-3 rounded-xl bg-white/2 border border-white/5 flex flex-col gap-1">
              <span className="text-[8px] font-display text-amber-300 font-bold uppercase tracking-wider">
                🌕 Hiện Trạng Trăng Tròn
              </span>
              <p className="text-[9px] text-white/50 leading-relaxed">
                Trăng sáng vằng vặc: Tăng <strong className="text-amber-300 font-medium">+15%</strong> cơ hội rơi **Mảnh Gương Vỡ** khi lật bài!
              </p>
            </div>
            
            <div className="p-3 rounded-xl bg-white/2 border border-white/5 flex flex-col gap-1">
              <span className="text-[8px] font-display text-cyan-300 font-bold uppercase tracking-wider">
                🌀 Thủy Tinh Nghịch Hành
              </span>
              <p className="text-[9px] text-white/50 leading-relaxed">
                Nhiễu loạn từ trường: Sứ Giả có <strong className="text-rose-300 font-medium">35%</strong> xác suất lật ra ở **Chiều Ngược**!
              </p>
            </div>
          </div>
        </div>

        {/* Region Details Overlay Modal */}
        {activeRegion && (() => {
          const region = regions.find(r => r.clan === activeRegion);
          if (!region) return null;
          const clanColor = getClanColor(region.clan);
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in text-white">
              <div
                className="w-full max-w-md rounded-2xl p-5 border text-left flex flex-col gap-4 relative bg-[#0f1629] overflow-y-auto max-h-[85vh] animate-scale-up"
                style={{
                  borderColor: `${clanColor}40`,
                  boxShadow: `0 0 35px ${clanColor}15`,
                }}
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-base"
                      style={{
                        background: `${clanColor}15`,
                        border: `1px solid ${clanColor}35`,
                      }}
                    >
                      {getClanEmoji(region.clan)}
                    </div>
                    <div>
                      <h3 className="font-display text-sm font-bold tracking-wider" style={{ color: clanColor }}>
                        {region.clanNameVi}
                      </h3>
                      <span className="text-[10px] font-sans text-white/40">
                        Tiến độ tộc hệ: {region.discoveredCount}/{region.totalCards} Sứ Giả
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveRegion(null)}
                    className="w-6 h-6 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Description */}
                <p className="font-body text-xs text-white/55 italic leading-relaxed bg-white/2 p-3 rounded-xl border border-white/5">
                  {region.clan === "VoThuong"
                    ? "Cõi vô định nằm tại tâm điểm vạn vật, là nơi hội tụ của 22 Sứ Giả Lớn đại diện cho các ngã rẽ cuộc đời."
                    : `Vùng đất mang thuộc tính ${region.clanNameVi.replace("Tộc ", "")}. Năng lượng nơi đây đang nuôi dưỡng các Sứ Giả thuộc tộc hệ này.`}
                </p>

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
                          className="rounded-xl p-2.5 flex flex-col gap-1 border"
                          style={{
                            background: "rgba(255,255,255,0.01)",
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

                {(() => {
                  const pactClan = activePact ? getCardClan(activePact.cardId) : null;
                  const hasActivePactHere = pactClan === region.clan;
                  if (!hasActivePactHere) return null;
                  return (
                    <div className="mt-1 p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl flex flex-col gap-2">
                      <span className="font-display text-[9px] text-amber-400 font-bold tracking-widest uppercase">
                        📜 KHẾ ƯỚC SỨ GIẢ DÀNH CHO BẠN
                      </span>
                      <p className="font-body text-[10px] text-amber-100/70 leading-relaxed italic">
                        {activePact.target === "NO_NEGATIVE_ERC"
                          ? "Thử thách: Giữ chỉ số Cộng hưởng (ERC) không được giảm xuống dưới 0."
                          : activePact.target === "REACH_ERC_30"
                          ? "Thử thách: Đưa chỉ số Cộng hưởng (ERC) vượt mốc 30+."
                          : "Thử thách: Giải phóng cõi sương cùng Sứ Giả."}
                      </p>
                      <button
                        onClick={handleClaimPact}
                        disabled={claimingPact}
                        className="w-full py-2.5 rounded-lg font-display text-[9px] tracking-widest font-bold text-white transition-all text-center flex items-center justify-center bg-gradient-to-r from-amber-500 to-amber-600 border border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)] disabled:opacity-50 cursor-pointer"
                      >
                        {claimingPact ? "ĐANG THIÊN ĐỊNH..." : "NGHIỆM THU KHẾ ƯỚC"}
                      </button>
                    </div>
                  );
                })()}

                <button
                  onClick={() => setActiveRegion(null)}
                  className="w-full mt-2 py-3 rounded-xl border border-white/10 text-xs font-display tracking-widest text-white/50 hover:text-white transition-all cursor-pointer"
                >
                  Đóng thông tin
                </button>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Floating Messenger Pact Scroll */}
      {activePact && (
        <button
          onClick={() => setShowPactModal(true)}
          className="fixed top-20 right-4 z-40 w-12 h-12 rounded-full flex items-center justify-center border border-amber-500/30 bg-amber-500/10 shadow-[0_0_15px_rgba(212,168,67,0.3)] animate-bounce cursor-pointer text-lg animate-pulse"
        >
          📜
        </button>
      )}

      {showPactModal && activePact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-5 animate-fade-in text-white">
          <div
            className="w-full max-w-sm rounded-2xl p-6 border text-left flex flex-col gap-4 relative bg-[#0f1629] border-amber-500/30 shadow-[0_0_30px_rgba(212,168,67,0.25)]"
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-[9px] tracking-widest text-amber-400 uppercase font-bold">
                Khế Ước Đang Thực Hiện
              </span>
              <button onClick={() => setShowPactModal(false)} className="text-white/40 hover:text-white text-xs">
                ✕
              </button>
            </div>

            <div className="rounded-xl p-4 bg-white/5 border border-white/5 flex flex-col gap-2">
              <span className="font-display text-[10px] text-white/50">YÊU CẦU KHẾ ƯỚC</span>
              <p className="font-body text-xs text-white/80 leading-relaxed italic">
                {activePact.target === "NO_NEGATIVE_ERC"
                  ? "Giữ cõi lòng không hoài nghi. Chỉ số Cộng hưởng (ERC) không được giảm xuống dưới 0."
                  : activePact.target === "REACH_ERC_30"
                  ? "Tích lũy lòng thiện lành. Đưa chỉ số Cộng hưởng (ERC) vượt mốc 30+."
                  : "Hoàn thành thử thách cõi sương."}
              </p>
              
              <div className="h-px bg-white/5 my-1" />
              <span className="text-[10px] text-white/35 font-sans">
                Hạn chót khế ước: {new Date(activePact.expiresAt).toLocaleDateString("vi-VN")}
              </span>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <button
                onClick={handleClaimPact}
                disabled={claimingPact}
                className="w-full py-3.5 rounded-xl font-display text-xs tracking-widest font-bold text-white transition-all text-center flex items-center justify-center gap-2 cursor-pointer bg-gradient-to-r from-amber-500/70 to-amber-600/80 border border-amber-500/40 shadow-[0_0_15px_rgba(212,168,67,0.2)] disabled:opacity-50"
              >
                {claimingPact ? "Đang nghiệm thu..." : "NGHIỆM THU KHẾ ƯỚC"}
              </button>
              <button
                onClick={() => setShowPactModal(false)}
                className="w-full py-3 rounded-xl border border-white/10 text-xs font-display tracking-widest text-white/50 hover:text-white transition-all cursor-pointer"
              >
                Quay lại Bản Đồ
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
            { href: "/ban-do", icon: "🗺️", label: "Cõi Giới", active: true },
            { href: "/thanh-dia", icon: "🔥", label: "Thánh Địa" },
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
