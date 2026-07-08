"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateAmbientVolume, updateFireVolume } from "@/lib/audio";

const THREAD_LINK_ENABLED = process.env.NEXT_PUBLIC_ENABLE_THREAD_LINK === "true";

// ─── Slider Component ─────────────────────────────────────────────────────────
interface MysticSliderProps {
  label: string;
  icon: string;
  defaultValue?: number;
  storageKey: string;
  onChange?: (val: number) => void;
}

function MysticSlider({
  label,
  icon,
  defaultValue = 60,
  storageKey,
  onChange,
}: MysticSliderProps) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    const saved = localStorage.getItem(`settings_${storageKey}`);
    if (saved !== null) {
      setValue(Number(saved));
    }
  }, [storageKey]);

  const handleChange = (val: number) => {
    setValue(val);
    localStorage.setItem(`settings_${storageKey}`, String(val));
    if (onChange) onChange(val);
  };

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <span className="font-sans text-sm text-white/70">{label}</span>
        <span className="text-base text-white/40">{icon}</span>
      </div>
      <div className="relative h-1.5 rounded-full overflow-visible" style={{ background: "rgba(255,255,255,0.08)" }}>
        {/* Filled track */}
        <div
          className="absolute top-0 left-0 h-full rounded-full transition-all"
          style={{
            width: `${value}%`,
            background: "linear-gradient(90deg, rgba(139,92,246,0.5), rgba(139,92,246,0.9))",
          }}
        />
        {/* Thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 cursor-pointer transition-all hover:scale-110"
          style={{
            left: `calc(${value}% - 10px)`,
            background: "#ffffff",
            borderColor: "#8b5cf6",
            boxShadow: "0 0 8px rgba(139,92,246,0.6)",
          }}
        />
        {/* Invisible range input on top */}
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => handleChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
        />
      </div>
    </div>
  );
}

// ─── Mystic Speed Slider ──────────────────────────────────────────────────────
function MysticSpeedSlider({
  label,
  icon,
  defaultValue = 1.0,
  storageKey,
}: {
  label: string;
  icon: string;
  defaultValue?: number;
  storageKey: string;
}) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    const saved = localStorage.getItem(`settings_${storageKey}`);
    if (saved !== null) {
      setValue(Number(saved));
    }
  }, [storageKey]);

  const handleChange = (val: number) => {
    setValue(val);
    localStorage.setItem(`settings_${storageKey}`, String(val));
  };

  // scale 0.5 - 1.5 to 0 - 100 percent
  const percent = ((value - 0.5) / 1.0) * 100;

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <span className="font-sans text-sm text-white/70">{label} ({value.toFixed(1)}x)</span>
        <span className="text-base text-white/40">{icon}</span>
      </div>
      <div className="relative h-1.5 rounded-full overflow-visible" style={{ background: "rgba(255,255,255,0.08)" }}>
        {/* Filled track */}
        <div
          className="absolute top-0 left-0 h-full rounded-full transition-all"
          style={{
            width: `${percent}%`,
            background: "linear-gradient(90deg, rgba(139,92,246,0.5), rgba(139,92,246,0.9))",
          }}
        />
        {/* Thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 cursor-pointer transition-all hover:scale-110"
          style={{
            left: `calc(${percent}% - 10px)`,
            background: "#ffffff",
            borderColor: "#8b5cf6",
            boxShadow: "0 0 8px rgba(139,92,246,0.6)",
          }}
        />
        <input
          type="range"
          min={0.5}
          max={1.5}
          step={0.1}
          value={value}
          onChange={(e) => handleChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
        />
      </div>
    </div>
  );
}

// ─── Toggle Switch ────────────────────────────────────────────────────────────
function ToggleSwitch({
  label,
  icon,
  defaultOn = false,
  storageKey,
}: {
  label: string;
  icon: string;
  defaultOn?: boolean;
  storageKey: string;
}) {
  const [on, setOn] = useState(defaultOn);

  useEffect(() => {
    const saved = localStorage.getItem(`settings_${storageKey}`);
    if (saved !== null) {
      setOn(saved === "true");
    }
  }, [storageKey]);

  const handleToggle = () => {
    const nextOn = !on;
    setOn(nextOn);
    localStorage.setItem(`settings_${storageKey}`, String(nextOn));
    if (storageKey === "hapticEnabled" && nextOn) {
      try {
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate(60);
        }
      } catch (e) {}
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="flex items-center gap-3 w-full py-1 cursor-pointer"
    >
      <span className="text-lg text-white/50">{icon}</span>
      <span className="font-sans text-sm text-white/70 flex-1 text-left">{label}</span>
      {/* Toggle */}
      <div
        className="relative w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0"
        style={{
          background: on
            ? "linear-gradient(90deg, #6366f1, #8b5cf6)"
            : "rgba(255,255,255,0.1)",
          border: on ? "1px solid rgba(139,92,246,0.5)" : "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div
          className="absolute top-0.5 w-5 h-5 rounded-full transition-all duration-300"
          style={{
            left: on ? "calc(100% - 22px)" : "2px",
            background: on ? "#ffffff" : "rgba(255,255,255,0.4)",
            boxShadow: on ? "0 0 6px rgba(139,92,246,0.8)" : "none",
          }}
        />
        {on && (
          <svg
            viewBox="0 0 12 12"
            fill="white"
            className="absolute top-1/2 -translate-y-1/2"
            style={{ left: "6px", width: "10px", height: "10px" }}
          >
            <path d="M1 6l3.5 3.5L11 2" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        )}
      </div>
    </button>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ label }: { label: string }) {
  return (
    <span className="font-display text-[10px] tracking-[0.25em] text-white/35 uppercase">
      {label}
    </span>
  );
}

// ─── Settings Block ───────────────────────────────────────────────────────────
function SettingsBlock({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-4"
      style={{
        background: "rgba(15, 22, 41, 0.7)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {children}
    </div>
  );
}

// ─── Profile Card ─────────────────────────────────────────────────────────────
interface UserProfile {
  name: string | null;
  createdAt: string;
}

function ProfileCard({ profile, onReset }: { profile: UserProfile | null; onReset: () => void }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleReset = async () => {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }

    setResetting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/user/profile", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Reset failed");

      // Successfully reset travel data
      onReset();
      setShowConfirm(false);
    } catch (e) {
      console.error(e);
    } finally {
      setResetting(false);
    }
  };

  const formatDate = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return "12/05/2024";
    }
  };

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "rgba(15, 22, 41, 0.7)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Avatar + info */}
      <div className="flex flex-col items-center gap-3 p-6 pb-4">
        <div
          className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center text-4xl"
          style={{
            background: "linear-gradient(135deg, #0f172a, #1e293b)",
            border: "2px solid rgba(139,92,246,0.3)",
            boxShadow: "0 0 20px rgba(139,92,246,0.2)",
          }}
        >
          🌙
        </div>
        <div className="text-center">
          <h3 className="font-display text-base text-white/90">
            {profile?.name || "Lữ Khách Vô Danh"}
          </h3>
          <p className="font-sans text-xs text-white/35 mt-1">
            Khởi hành: {profile?.createdAt ? formatDate(profile.createdAt) : "Đang tải..."}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px mx-4" style={{ background: "rgba(255,255,255,0.05)" }} />

      {/* Reset button */}
      <div className="p-4 flex flex-col gap-2">
        <button
          onClick={handleReset}
          disabled={resetting}
          className="w-full py-3 rounded-xl font-display text-xs tracking-[0.15em] uppercase transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer disabled:opacity-50"
          style={{
            background: showConfirm
              ? "rgba(239,68,68,0.2)"
              : "rgba(239,68,68,0.08)",
            border: showConfirm
              ? "1px solid rgba(239,68,68,0.5)"
              : "1px solid rgba(239,68,68,0.2)",
            color: showConfirm ? "#f87171" : "#ef4444",
          }}
        >
          {resetting
            ? "Đang xoá..."
            : showConfirm
            ? "⚠ Xác nhận xoá vĩnh viễn?"
            : "Reset Dữ Liệu Hành Trình"}
        </button>
        <p className="font-body text-[10px] text-white/25 italic text-center leading-relaxed">
          Thao tác này sẽ xoá vĩnh viễn nhật ký tâm linh của bạn.
        </p>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function CaiDatPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [vongVoice, setVongVoice] = useState("male");

  const [redeemCode, setRedeemCode] = useState("");
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [redeemError, setRedeemError] = useState("");
  const [redeemSuccess, setRedeemSuccess] = useState("");

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!redeemCode.trim()) return;
    setRedeemLoading(true);
    setRedeemError("");
    setRedeemSuccess("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/user/thread/redeem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: redeemCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gặp lỗi khi liên kết sợi chỉ.");
      }
      setRedeemSuccess(data.message || "Đã nối kết sợi chỉ thành công!");
      setRedeemCode("");
    } catch (err: any) {
      setRedeemError(err.message);
    } finally {
      setRedeemLoading(false);
    }
  };

  const loadProfile = () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("/api/user/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch user profile", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    // Load voice setting
    const savedVoice = localStorage.getItem("settings_vongVoice");
    if (savedVoice) {
      setVongVoice(savedVoice);
    }

    loadProfile();
  }, []);

  const handleResetComplete = () => {
    // Force clear user local caches and restart
    localStorage.removeItem("user");
    router.push("/chao-don");
  };

  return (
    <div className="relative flex flex-col min-h-screen">
      {/* Background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(88,28,135,0.1) 0%, transparent 50%)",
        }}
      />

      <div className="relative z-10 flex flex-col pb-28">
        {/* Header */}
        <header className="flex items-center justify-between px-5 py-5">
          <Link
            href="/ho-so"
            className="w-9 h-9 rounded-full flex items-center justify-center border border-white/10 text-white/50 hover:text-white/80 hover:border-white/20 transition-all text-sm"
          >
            ‹
          </Link>
          <h1 className="font-display text-base text-white/85 tracking-widest uppercase">
            Cài đặt
          </h1>
          <button className="w-9 h-9 rounded-full flex items-center justify-center border border-white/10 text-white/40 hover:text-white/70 transition-all text-sm">
            ?
          </button>
        </header>

        {/* Content */}
        <div className="flex flex-col gap-6 px-4">

          {/* ── Giọng nói của Vọng ─────────────────────────── */}
          <div className="flex flex-col gap-3">
            <SectionHeader label="Giọng nói của Vọng" />
            <SettingsBlock>
              {/* Selector */}
              <div className="flex flex-col gap-2">
                <span className="font-sans text-xs text-white/50">Giọng đọc Sứ Giả</span>
                <div className="flex bg-white/5 rounded-xl p-1 border border-white/5">
                  <button
                    onClick={() => {
                      localStorage.setItem("settings_vongVoice", "male");
                      setVongVoice("male");
                    }}
                    className="flex-1 py-2 text-xs font-display tracking-wider rounded-lg transition-all cursor-pointer"
                    style={{
                      background: vongVoice === "male" ? "rgba(139,92,246,0.2)" : "transparent",
                      color: vongVoice === "male" ? "#c4b5fd" : "rgba(255,255,255,0.4)",
                      border: vongVoice === "male" ? "1px solid rgba(139,92,246,0.3)" : "1px solid transparent",
                    }}
                  >
                    Nam Trầm Ấm 👨
                  </button>
                  <button
                    onClick={() => {
                      localStorage.setItem("settings_vongVoice", "female");
                      setVongVoice("female");
                    }}
                    className="flex-1 py-2 text-xs font-display tracking-wider rounded-lg transition-all cursor-pointer"
                    style={{
                      background: vongVoice === "female" ? "rgba(139,92,246,0.2)" : "transparent",
                      color: vongVoice === "female" ? "#c4b5fd" : "rgba(255,255,255,0.4)",
                      border: vongVoice === "female" ? "1px solid rgba(139,92,246,0.3)" : "1px solid transparent",
                    }}
                  >
                    Nữ Dịu Dàng 👩
                  </button>
                </div>
              </div>
              <div className="h-px" style={{ background: "rgba(255,255,255,0.04)" }} />
              {/* Speech Speed slider */}
              <MysticSpeedSlider label="Tốc độ đọc giọng Vọng" icon="⏱" defaultValue={1.0} storageKey="vongSpeed" />
            </SettingsBlock>
          </div>

          {/* ── Âm Thanh ──────────────────────────────────── */}
          <div className="flex flex-col gap-3">
            <SectionHeader label="Âm Thanh" />
            <SettingsBlock>
              <MysticSlider
                label="Nhạc nền cõi sương"
                icon="♪"
                defaultValue={65}
                storageKey="ambientVolume"
                onChange={(v) => updateAmbientVolume(v)}
              />
              <div className="h-px" style={{ background: "rgba(255,255,255,0.04)" }} />
              <MysticSlider
                label="Hiệu ứng âm thanh"
                icon="✦"
                defaultValue={45}
                storageKey="soundVolume"
                onChange={(v) => updateFireVolume(v)}
              />
            </SettingsBlock>
          </div>

          {/* ── Cảm Biến & Thông Báo ─────────────────────── */}
          <div className="flex flex-col gap-3">
            <SectionHeader label="Cảm Biến & Thông Báo" />
            <SettingsBlock>
              <ToggleSwitch
                label="Rung phản hồi"
                icon="📳"
                defaultOn={true}
                storageKey="hapticEnabled"
              />
              <div className="h-px" style={{ background: "rgba(255,255,255,0.04)" }} />
              <ToggleSwitch
                label="Cảnh báo chu kỳ trăng"
                icon="🌙"
                defaultOn={false}
                storageKey="moonAlertsEnabled"
              />
            </SettingsBlock>
          </div>

          {/* ── Sợi Chỉ Xuyên Sương ─────────────────────── */}
          {THREAD_LINK_ENABLED && (
            <div className="flex flex-col gap-3">
              <SectionHeader label="Sợi Chỉ Xuyên Sương" />
              <SettingsBlock>
                <form onSubmit={handleRedeem} className="flex flex-col gap-3">
                  <p className="font-body text-xs text-white/40 italic leading-relaxed">
                    Nhập mã định mệnh (Referral Code) của người đồng hành để dệt nên sợi chỉ liên kết hai người.
                  </p>
                  <div className="flex gap-2">
                    <input
                      id="input-referral-code"
                      type="text"
                      placeholder="Nhập mã lữ khách..."
                      value={redeemCode}
                      onChange={(e) => setRedeemCode(e.target.value)}
                      disabled={redeemLoading}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-purple-500 transition-all"
                    />
                    <button
                      id="btn-redeem-code"
                      type="submit"
                      disabled={redeemLoading || !redeemCode.trim()}
                      className="px-4 py-2.5 rounded-xl font-display text-[10px] tracking-wider uppercase transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer disabled:opacity-50"
                      style={{
                        background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.3))",
                        border: "1px solid rgba(99,102,241,0.35)",
                        color: "#a5b4fc",
                      }}
                    >
                      {redeemLoading ? "..." : "Liên kết"}
                    </button>
                  </div>
                  {redeemError && (
                    <p className="font-sans text-[10px] text-red-400 mt-1">{redeemError}</p>
                  )}
                  {redeemSuccess && (
                    <p className="font-sans text-[10px] text-green-400 mt-1">{redeemSuccess}</p>
                  )}
                </form>
              </SettingsBlock>
            </div>
          )}

          {/* ── Hành Trình Cá Nhân ─────────────────────── */}
          <div className="flex flex-col gap-3">
            <SectionHeader label="Hành Trình Cá Nhân" />
            <ProfileCard profile={profile} onReset={handleResetComplete} />
          </div>

          {/* Spacer */}
          <div className="h-4" />
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
