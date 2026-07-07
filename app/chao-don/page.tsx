"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { tarotDeck } from "@/lib/tarot";

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  clan: string;
  erc: number;
  soulCard: string | null;
  birthDate: string | null;
}

export default function ChaoDonPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [birthDateInput, setBirthDateInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [ceremonyStarted, setCeremonyStarted] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [soulCardDetails, setSoulCardDetails] = useState<any>(null);

  // Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/dang-nhap");
      return;
    }

    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        if (parsed.birthDate) {
          setBirthDateInput(parsed.birthDate.split("T")[0]);
        }
      } catch (e) {
        console.error("Failed to parse user", e);
      }
    }
  }, [router]);

  const triggerCeremony = async (dateStr: string) => {
    setLoading(true);
    setCeremonyStarted(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ birthDate: dateStr }),
      });

      const updatedProfile = await res.json();
      if (!res.ok) throw new Error(updatedProfile.error || "Không thể khởi tạo Thẻ Mệnh.");

      // Save updated user to localStorage
      localStorage.setItem("user", JSON.stringify(updatedProfile));
      setUser(updatedProfile);

      // Find Soul Card details
      if (updatedProfile.soulCard) {
        const cardInfo = tarotDeck.find((c) => c.id === updatedProfile.soulCard);
        setSoulCardDetails(cardInfo || { name: updatedProfile.soulCard, englishName: "Unknown", keywords: [] });
      }

      // Trigger card reveal animation after a delay
      setTimeout(() => {
        setRevealed(true);
      }, 2500);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Đã xảy ra lỗi.");
      setCeremonyStarted(false);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!birthDateInput) return;
    triggerCeremony(birthDateInput);
  };

  // If user already has a birthDate registered, we can auto-ceremony or let them press start
  useEffect(() => {
    if (user?.birthDate && !ceremonyStarted) {
      const formattedDate = user.birthDate.split("T")[0];
      triggerCeremony(formattedDate);
    }
  }, [user]);

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

  const getClanNameVi = (clanName: string) => {
    const map: Record<string, string> = {
      DiemHoa: "Tộc Diễm Hoả",
      ThuyNguyet: "Tộc Thuỷ Nguyệt",
      PhongKiem: "Tộc Phong Kiếm",
      ThoKim: "Tộc Thổ Kim",
      VoThuong: "Cõi Vô Thường",
    };
    return map[clanName] || "Cõi Vô Thường";
  };

  return (
    <div className="relative flex flex-col min-h-screen items-center justify-center p-4">
      {/* Background orbs */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(139,92,246,0.18) 0%, transparent 60%), radial-gradient(ellipse at 50% 80%, rgba(236,72,153,0.08) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-6">
        {/* Step 1: Input Birth Date */}
        {!ceremonyStarted && (
          <div className="glass rounded-2xl p-6 w-full flex flex-col gap-5 text-center">
            <span className="text-4xl animate-bounce">🔮</span>
            <div className="flex flex-col gap-1.5">
              <h1
                className="font-display text-xl font-bold tracking-widest text-glow-gold"
                style={{
                  background: "linear-gradient(135deg, #d4a843, #f5e06e)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                NGHI THỨC KHỞI NGUYÊN
              </h1>
              <p className="font-body text-sm text-white/50 leading-relaxed italic">
                "Nhập ngày sinh của ngươi để liên kết tần số năng lượng với 22 Đại Bí Pháp, triệu hồi Sứ Giả Hộ Mệnh."
              </p>
            </div>

            <form onSubmit={handleStart} className="flex flex-col gap-4 mt-2">
              <input
                type="date"
                required
                value={birthDateInput}
                onChange={(e) => setBirthDateInput(e.target.value)}
                className="w-full text-center px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-base text-white/80 focus:outline-none focus:border-purple-500/50 transition-colors"
              />

              <button
                type="submit"
                disabled={!birthDateInput || loading}
                className="w-full py-4 rounded-xl font-display text-xs tracking-[0.2em] font-semibold text-white transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, rgba(139,92,246,0.8), rgba(109,40,217,0.9))",
                  border: "1px solid rgba(167,139,250,0.4)",
                  boxShadow: "0 0 24px rgba(139,92,246,0.35)",
                }}
              >
                {loading ? "ĐANG LIÊN KẾT..." : "ĐÁNH THỨC SỨ GIẢ HỘ MỆNH"}
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Ceremony Animation */}
        {ceremonyStarted && !revealed && (
          <div className="flex flex-col items-center gap-6 text-center">
            {/* Spinning/pulsing card container */}
            <div className="w-[180px] h-[270px] rounded-xl flex items-center justify-center relative overflow-hidden float border border-purple-500/40 glow-purple">
              <div className="absolute inset-0 bg-gradient-to-br from-[#0d0a1e] via-[#1a1040] to-[#0a0818] flex flex-col items-center justify-center gap-2">
                <span className="text-4xl animate-spin text-purple-400/50">✦</span>
                <span className="font-display text-[9px] text-white/30 tracking-[0.2em] uppercase">
                  Đang triệu hồi...
                </span>
              </div>
              <div className="absolute inset-0 shimmer opacity-30" />
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="font-display text-base text-purple-300 tracking-widest animate-pulse">
                ĐANG GIAO THOA LINH HỒN
              </h2>
              <p className="font-body text-sm text-white/40 italic">
                "Sương mù đang lắng xuống, hình chiếu của Sứ Giả hộ mệnh đang hiện hình..."
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Ceremony Revealed */}
        {ceremonyStarted && revealed && user && soulCardDetails && (
          <div className="flex flex-col items-center gap-6 w-full text-center card-reveal">
            {/* Soul Card */}
            <div
              className="w-[180px] h-[275px] rounded-xl relative overflow-hidden flex flex-col justify-between p-4 border"
              style={{
                background: "linear-gradient(165deg, #1a0a2e 0%, #2d1060 60%, #0f0820 100%)",
                borderColor: `${getClanColor(user.clan)}50`,
                boxShadow: `0 0 40px ${getClanColor(user.clan)}50, 0 0 80px ${getClanColor(user.clan)}20`,
              }}
            >
              <div className="w-full flex justify-between items-start">
                <span
                  className="font-display text-[8px] tracking-widest uppercase"
                  style={{ color: getClanColor(user.clan) }}
                >
                  SỨ GIẢ HỘ MỆNH
                </span>
                <span className="text-[10px] text-white/30">✦</span>
              </div>

              {/* Icon / Emoji placeholder for visual */}
              <div className="flex flex-col items-center gap-2">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
                  style={{
                    background: `${getClanColor(user.clan)}15`,
                    boxShadow: `0 0 20px ${getClanColor(user.clan)}30`,
                  }}
                >
                  👁
                </div>
              </div>

              <div className="flex flex-col items-center gap-1.5 w-full">
                <div className="w-full h-px" style={{ background: `${getClanColor(user.clan)}30` }} />
                <h3
                  className="font-display text-xs font-semibold leading-tight tracking-wider"
                  style={{ color: `${getClanColor(user.clan)}ee` }}
                >
                  {soulCardDetails.name}
                </h3>
                <span className="font-sans text-[7px] text-white/30 italic">
                  ({soulCardDetails.englishName})
                </span>
              </div>

              <div className="absolute inset-0 shimmer opacity-20 pointer-events-none" />
            </div>

            {/* Clan reveal & info */}
            <div className="flex flex-col gap-3 px-4">
              <div className="flex flex-col gap-1">
                <span className="font-display text-[9px] text-white/30 tracking-[0.25em] uppercase">
                  BẢN SẮC TỘC HỆ
                </span>
                <h2
                  className="font-display text-2xl font-bold tracking-wide"
                  style={{
                    color: getClanColor(user.clan),
                    textShadow: `0 0 15px ${getClanColor(user.clan)}60`,
                  }}
                >
                  {getClanNameVi(user.clan)}
                </h2>
              </div>

              <div className="flex justify-center gap-1.5 flex-wrap">
                {soulCardDetails.keywords?.map((keyword: string) => (
                  <span
                    key={keyword}
                    className="font-sans text-[9px] px-2.5 py-1 rounded-full"
                    style={{
                      background: `${getClanColor(user.clan)}10`,
                      border: `1px solid ${getClanColor(user.clan)}25`,
                      color: `${getClanColor(user.clan)}dd`,
                    }}
                  >
                    {keyword}
                  </span>
                ))}
              </div>

              <p className="font-body text-sm text-white/60 leading-relaxed italic mt-2">
                "Chào đón lữ khách của {getClanNameVi(user.clan)}. Ngươi đã thức tỉnh và có thể chính thức bước vào cõi sương mù."
              </p>
            </div>

            {/* CTA to thánh địa */}
            <Link
              href="/thanh-dia"
              className="w-full max-w-xs py-4 px-6 rounded-xl font-display text-xs tracking-[0.2em] font-semibold text-white transition-all hover:scale-[1.02] active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${getClanColor(user.clan)}cc, ${getClanColor(user.clan)}aa)`,
                border: `1px solid ${getClanColor(user.clan)}`,
                boxShadow: `0 0 24px ${getClanColor(user.clan)}35`,
              }}
            >
              TIẾN VÀO THÁNH ĐỊA
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
