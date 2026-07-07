"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { tarotDeck } from "@/lib/tarot";

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  clan: string;
  erc: number;
  soulCard: string | null;
  birthDate: string | null;
  totalReadings: number;
  unlockedMemories: number[];
  createdAt: string;
}

// ─── ERC Slider (read-only display) ──────────────────────────────────────────
function ERCMeter({ value = 0 }: { value?: number }) {
  // value range: -100 to +100
  const percent = ((value + 100) / 200) * 100;
  const isPositive = value >= 0;

  const getStatusText = (val: number) => {
    if (val > 50) return "Gắn Kết";
    if (val >= 0) return "Ấm Áp";
    if (val > -50) return "Lạnh Lẽo";
    return "Độc Lập";
  };

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: "rgba(15, 22, 41, 0.7)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Title */}
      <div className="flex items-center justify-between mb-1">
        <span className="font-display text-xs text-white/60 tracking-wide">
          Chi Số Cộng Hưởng (ERC)
        </span>
        <span
          className="font-display text-lg font-bold"
          style={{
            color: isPositive ? "#a78bfa" : "#f87171",
            textShadow: `0 0 12px ${isPositive ? "rgba(167,139,250,0.6)" : "rgba(248,113,113,0.6)"}`,
          }}
        >
          {value > 0 ? "+" : ""}{value}
        </span>
      </div>

      <div className="flex items-center justify-between mb-3">
        <span className="font-body text-xs text-white/35 italic">
          Emotional Resonance Coefficient
        </span>
        <span
          className="font-sans text-[10px] px-2 py-0.5 rounded-full"
          style={{
            background: "rgba(167,139,250,0.1)",
            border: "1px solid rgba(167,139,250,0.25)",
            color: "#c4b5fd",
          }}
        >
          {getStatusText(value)}
        </span>
      </div>

      {/* Track */}
      <div className="relative">
        {/* Labels */}
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1">
            <span className="text-xs">❄</span>
            <span className="font-sans text-[9px] text-white/30">Độc Lập</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-sans text-[9px] text-white/30">Tin Tưởng</span>
            <span className="text-xs">❤</span>
          </div>
        </div>

        {/* Gradient bar */}
        <div
          className="relative h-2 rounded-full overflow-hidden"
          style={{
            background: "linear-gradient(90deg, #6366f1 0%, #a78bfa 40%, #fbbf24 70%, #f97316 100%)",
            opacity: 0.7,
          }}
        >
          {/* Center line */}
          <div
            className="absolute top-0 h-full w-px"
            style={{ left: "50%", background: "rgba(255,255,255,0.4)" }}
          />
        </div>

        {/* Thumb */}
        <div
          className="absolute top-0 -translate-y-px w-4 h-4 rounded-full -translate-x-1/2"
          style={{
            left: `${percent}%`,
            background: "#ffffff",
            border: "2px solid #a78bfa",
            boxShadow: "0 0 8px rgba(167,139,250,0.8), 0 0 20px rgba(167,139,250,0.4)",
            top: "1px",
          }}
        />

        {/* Scale */}
        <div className="flex items-center justify-between mt-3">
          <span className="font-sans text-[8px] text-white/25">-100</span>
          <span className="font-sans text-[8px] text-white/25">0</span>
          <span className="font-sans text-[8px] text-white/25">+100</span>
        </div>
      </div>
    </div>
  );
}

// ─── Birth Card ───────────────────────────────────────────────────────────────
function BirthCard({ soulCardId }: { soulCardId: string | null }) {
  const cardDetails = tarotDeck.find((c) => c.id === soulCardId);

  if (!soulCardId || !cardDetails) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="text-purple-400 text-sm">✦</span>
          <span className="font-display text-xs text-white/60 tracking-widest">
            Thẻ Mệnh (Birth Card)
          </span>
        </div>
        <div className="rounded-2xl p-5 text-center bg-white/2 border border-white/5">
          <p className="font-body text-xs text-white/40 italic">
            Chưa thiết lập ngày sinh để tính Thẻ Mệnh.
          </p>
          <Link
            href="/cai-dat"
            className="mt-3 inline-block px-4 py-2 rounded-xl text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 font-display tracking-widest"
          >
            THIẾT LẬP NGAY
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-purple-400 text-sm">✦</span>
        <span className="font-display text-xs text-white/60 tracking-widest">
          Thẻ Mệnh (Birth Card)
        </span>
      </div>

      <div
        className="rounded-2xl p-5 flex flex-col items-center gap-4"
        style={{
          background: "rgba(15, 22, 41, 0.7)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {/* Card visual */}
        <div
          className="w-32 h-48 rounded-xl flex flex-col justify-between p-3 relative overflow-hidden border"
          style={{
            background: "linear-gradient(160deg, #1a0a2e 0%, #2d1060 60%, #0f0820 100%)",
            borderColor: "rgba(236,72,153,0.35)",
            boxShadow: "0 0 30px rgba(236,72,153,0.2)",
          }}
        >
          <span className="font-display text-[7px] text-pink-300/60 tracking-widest self-start uppercase">
            Major Arcana
          </span>

          <div className="flex items-center justify-center text-3xl">
            🔮
          </div>

          <div className="flex flex-col items-center gap-1 w-full">
            <div className="w-full h-px" style={{ background: "rgba(236,72,153,0.3)" }} />
            <span className="font-display text-[9px] text-pink-300/90 text-center leading-tight tracking-wide mt-1">
              {cardDetails.name}
            </span>
            <span className="font-sans text-[7px] text-white/35 italic">({cardDetails.englishName})</span>
          </div>

          <div className="absolute inset-0 shimmer opacity-15 pointer-events-none" />
        </div>

        <p className="font-body text-sm text-white/55 italic text-center leading-relaxed">
          "Sứ Giả Hộ Mệnh dẫn lối cho chặng đường tâm linh của bạn, cất giữ những bài học sâu sắc."
        </p>
      </div>
    </div>
  );
}

// ─── Tribe Hero ────────────────────────────────────────────────────────────────
function TribeHero({ name, clan }: { name: string | null; clan: string }) {
  const getClanColor = (c: string) => {
    const map: Record<string, string> = {
      DiemHoa: "#f97316",
      ThuyNguyet: "#06b6d4",
      PhongKiem: "#94a3b8",
      ThoKim: "#10b981",
      VoThuong: "#a78bfa",
    };
    return map[c] || "#a78bfa";
  };

  const getClanNameVi = (c: string) => {
    const map: Record<string, string> = {
      DiemHoa: "Tộc Diễm Hoả",
      ThuyNguyet: "Tộc Thuỷ Nguyệt",
      PhongKiem: "Tộc Phong Kiếm",
      ThoKim: "Tộc Thổ Kim",
      VoThuong: "Cõi Vô Thường",
    };
    return map[c] || "Cõi Vô Thường";
  };

  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: "rgba(15, 22, 41, 0.8)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div
        className="w-full h-40 relative overflow-hidden flex items-center justify-center"
        style={{
          background: "linear-gradient(160deg, #0a0818 0%, #1a1040 40%, #0d0a28 100%)",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at 50% 60%, ${getClanColor(clan)}15 0%, transparent 60%)`,
          }}
        />
        <div
          className="relative w-24 h-36 rounded-xl overflow-hidden float border"
          style={{
            background: "linear-gradient(160deg, #0d0a1e 0%, #1a1040 50%, #0a0818 100%)",
            borderColor: `${getClanColor(clan)}40`,
            boxShadow: `0 0 30px ${getClanColor(clan)}25`,
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center text-2xl">
            👁
          </div>
          <div className="absolute inset-0 shimmer opacity-20" />
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 px-5 py-5">
        <span className="font-display text-[9px] tracking-[0.25em] text-white/35 uppercase">
          BẢN SẮC TỘC HỆ
        </span>

        <h2
          className="font-display text-xl font-bold text-center leading-tight"
          style={{
            background: `linear-gradient(135deg, #e8e0d5 0%, ${getClanColor(clan)} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {name || "Lữ Khách Vô Danh"}
        </h2>

        <div className="flex items-center gap-2 mt-1">
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{
              background: `${getClanColor(clan)}10`,
              border: `1px solid ${getClanColor(clan)}25`,
            }}
          >
            <span className="text-[9px]" style={{ color: getClanColor(clan) }}>✦</span>
            <span className="font-display text-[9px] tracking-wide" style={{ color: getClanColor(clan) }}>
              {getClanNameVi(clan)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function HoSoPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/dang-nhap");
          return;
        }

        const res = await fetch("/api/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Không thể tải hồ sơ người dùng.");

        setProfile(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <span className="text-3xl animate-spin text-purple-400">✦</span>
        <span className="font-display text-[9px] text-white/35 tracking-widest uppercase">
          Đang chiếu rọi hồ sơ...
        </span>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4 text-center">
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 text-xs text-rose-400 max-w-sm">
          {error || "Không thể lấy thông tin phiên đăng nhập."}
        </div>
        <Link href="/dang-nhap" className="text-xs text-purple-400 hover:underline">
          Quay lại Đăng Nhập
        </Link>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col min-h-screen">
      {/* Background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 20%, rgba(6,182,212,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(236,72,153,0.05) 0%, transparent 50%)",
        }}
      />

      <div className="relative z-10 flex flex-col pb-28">
        {/* Header */}
        <header className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2">
            <span
              className="font-display text-sm font-bold tracking-widest"
              style={{
                background: "linear-gradient(135deg, #a78bfa, #7c3aed)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              V
            </span>
            <span className="font-display text-xs text-white/50 tracking-widest">
              CÕI VÔ THỊ
            </span>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              router.push("/dang-nhap");
            }}
            className="px-3 py-1.5 rounded-lg border border-rose-500/30 text-[10px] font-display text-rose-400 tracking-wider hover:bg-rose-500/10 transition-colors"
          >
            ĐĂNG XUẤT
          </button>
        </header>

        {/* Content */}
        <div className="flex flex-col gap-5 px-4">
          <TribeHero name={profile.name} clan={profile.clan} />
          <ERCMeter value={profile.erc} />
          <BirthCard soulCardId={profile.soulCard} />

          {/* Stats Summary */}
          <div className="glass rounded-xl p-4 grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1 text-center">
              <span className="font-sans text-[10px] text-white/40">Tổng số lượt bói</span>
              <span className="font-display text-lg text-amber-300 font-bold">{profile.totalReadings}</span>
            </div>
            <div className="flex flex-col gap-1 text-center">
              <span className="font-sans text-[10px] text-white/40">Ký ức đã mở</span>
              <span className="font-display text-lg text-amber-300 font-bold">{profile.unlockedMemories.length}/7</span>
            </div>
          </div>

          {/* Action Links */}
          <div className="flex flex-col gap-2">
            <Link
              href="/hoi-uc"
              className="glass rounded-xl p-4 flex items-center justify-between hover:bg-white/5 transition-all border border-white/5"
            >
              <div className="flex items-center gap-3">
                <span className="text-base">🔮</span>
                <span className="font-display text-xs text-white/80 tracking-wider">Thư viện Hồi Ức Vọng</span>
              </div>
              <span className="text-purple-400 text-xs font-semibold">→</span>
            </Link>

            <Link
              href="/cai-dat"
              className="glass rounded-xl p-4 flex items-center justify-between hover:bg-white/5 transition-all border border-white/5"
            >
              <div className="flex items-center gap-3">
                <span className="text-base">⚙</span>
                <span className="font-display text-xs text-white/80 tracking-wider">Cấu hình & Cài đặt</span>
              </div>
              <span className="text-purple-400 text-xs font-semibold">→</span>
            </Link>
          </div>
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
            { href: "/", icon: "🗺️", label: "Map" },
            { href: "/chon-trai-bai", icon: "📖", label: "Bói" },
            { href: "/nhat-ky", icon: "📋", label: "Journal" },
            { href: "/ho-so", icon: "👤", label: "Profile", active: true },
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
