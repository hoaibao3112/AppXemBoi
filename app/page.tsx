"use client";

import Link from "next/link";
import { useState } from "react";

// ─── Icons ─────────────────────────────────────────────────────────────────
function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17 5.8 21.3l2.4-7.4L2 9.4h7.6z" />
    </svg>
  );
}

function LogoIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7">
      <circle cx="16" cy="16" r="14" stroke="url(#logoGrad)" strokeWidth="1.5" />
      <path d="M16 4 L16 28 M4 16 L28 16" stroke="url(#logoGrad)" strokeWidth="0.75" />
      <path d="M8 8 L24 24 M24 8 L8 24" stroke="url(#logoGrad)" strokeWidth="0.5" opacity="0.5" />
      <circle cx="16" cy="16" r="4" fill="url(#logoGrad)" opacity="0.8" />
      <circle cx="16" cy="16" r="2" fill="#a78bfa" />
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="32" y2="32">
          <stop stopColor="#a78bfa" />
          <stop offset="1" stopColor="#d4a843" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ─── Decorative Divider ─────────────────────────────────────────────────────
function RuneDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
      <span className="font-display text-xs tracking-[0.3em] text-purple-400/70 uppercase">
        {label}
      </span>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
    </div>
  );
}

// ─── Feature Card ───────────────────────────────────────────────────────────
interface FeatureCardProps {
  icon: string;
  title: string;
  desc: string;
  delay?: number;
}

function FeatureCard({ icon, title, desc, delay = 0 }: FeatureCardProps) {
  return (
    <div
      className="rune-border rounded-xl p-4 flex gap-4 items-start group hover:border-purple-500/40 transition-all duration-500"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Icon box */}
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-xl group-hover:bg-purple-500/20 transition-colors duration-300">
        {icon}
      </div>
      <div className="flex flex-col gap-1 min-w-0">
        <h3 className="font-display text-sm text-amber-300 tracking-wide leading-tight">
          {title}
        </h3>
        <p className="font-body text-sm text-white/55 leading-relaxed">
          {desc}
        </p>
      </div>
    </div>
  );
}

// ─── Mini Tarot Card ────────────────────────────────────────────────────────
interface MiniCardProps {
  name: string;
  tribe?: string;
  subtitle?: string;
  gradient: string;
  glowColor: string;
  locked?: boolean;
  imageEmoji?: string;
}

function MiniTarotCard({
  name,
  tribe,
  subtitle,
  gradient,
  glowColor,
  locked,
  imageEmoji,
}: MiniCardProps) {
  const [flipped, setFlipped] = useState(false);

  if (locked) {
    return (
      <div className="relative w-[100px] flex-shrink-0">
        <div
          className="rounded-lg overflow-hidden h-[140px] flex items-center justify-center"
          style={{
            background: "rgba(15, 22, 41, 0.9)",
            border: "1px solid rgba(139, 92, 246, 0.15)",
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white/20">
            <path d="M12 1C9.24 1 7 3.24 7 6v2H5c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2h-2V6c0-2.76-2.24-5-5-5zm0 2c1.66 0 3 1.34 3 3v2H9V6c0-1.66 1.34-3 3-3zm0 9c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative w-[100px] flex-shrink-0 cursor-pointer group"
      onClick={() => setFlipped(!flipped)}
    >
      <div
        className="rounded-lg overflow-hidden h-[140px] relative transition-all duration-500 group-hover:scale-105"
        style={{
          background: gradient,
          boxShadow: `0 0 20px ${glowColor}40, 0 0 40px ${glowColor}20`,
          border: `1px solid ${glowColor}40`,
        }}
      >
        {/* Card background art */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
          <div className="text-3xl mb-1">{imageEmoji}</div>
          <div className="w-8 h-px bg-white/30 mb-1" />
          <span
            className="font-display text-[8px] text-center text-white/80 leading-tight tracking-wider"
            style={{ textShadow: `0 0 8px ${glowColor}` }}
          >
            {name}
          </span>
          {tribe && (
            <span className="font-sans text-[7px] text-white/40 mt-0.5">
              {tribe}
            </span>
          )}
        </div>

        {/* Shimmer overlay */}
        <div className="absolute inset-0 shimmer opacity-40 pointer-events-none" />

        {/* Corner ornaments */}
        <div className="absolute top-1 left-1 w-3 h-3 border-l border-t border-white/20" />
        <div className="absolute top-1 right-1 w-3 h-3 border-r border-t border-white/20" />
        <div className="absolute bottom-1 left-1 w-3 h-3 border-l border-b border-white/20" />
        <div className="absolute bottom-1 right-1 w-3 h-3 border-r border-b border-white/20" />
      </div>

      {subtitle && (
        <div className="mt-1.5 text-center">
          <span className="font-sans text-[9px] text-white/40 leading-tight">
            {subtitle}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Realm Zone ─────────────────────────────────────────────────────────────
interface RealmZoneProps {
  icon: string;
  name: string;
  desc: string;
  unlocked?: number;
  total?: number;
  color: string;
}

function RealmZone({ icon, name, desc, unlocked, total, color }: RealmZoneProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl glass group hover:border-purple-400/30 transition-all duration-300 cursor-pointer">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
        style={{ background: `${color}20`, border: `1px solid ${color}40` }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-display text-xs text-white/90 tracking-wide">{name}</span>
          {unlocked !== undefined && total && (
            <span className="text-[10px] font-sans text-white/40 flex-shrink-0">
              {unlocked}/{total}
            </span>
          )}
        </div>
        <p className="font-body text-xs text-white/40 mt-0.5 truncate">{desc}</p>
      </div>
    </div>
  );
}

// ─── Bottom Nav ─────────────────────────────────────────────────────────────
function BottomNav({ active }: { active: string }) {
  const navItems = [
    { href: "/thanh-dia", label: "Thánh Địa", icon: "🗺️" },
    { href: "/nhat-ky", label: "Nhật Ký", icon: "📖" },
    { href: "/kho-bau", label: "Kho Báu", icon: "💎" },
    { href: "/oracle", label: "Oracle", icon: "✨" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
      <div className="mx-auto max-w-md">
        <div
          className="flex items-center justify-around py-3 px-4"
          style={{
            background: "rgba(8, 11, 20, 0.95)",
            backdropFilter: "blur(20px)",
            borderTop: "1px solid rgba(139, 92, 246, 0.2)",
          }}
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-all duration-300 ${
                active === item.label
                  ? "text-purple-400"
                  : "text-white/30 hover:text-white/60"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-sans text-[10px] tracking-wide">{item.label}</span>
              {active === item.label && (
                <div className="w-1 h-1 rounded-full bg-purple-400" />
              )}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

// ─── Stats Row ───────────────────────────────────────────────────────────────
function StatsBanner() {
  const stats = [
    { label: "Năm thành lập", value: "Cổ Xưa" },
    { label: "Lữ Khách", value: "1.1k+" },
    { label: "Trực tuyến", value: "28" },
    { label: "Hội viên", value: "412" },
  ];
  return (
    <div className="grid grid-cols-4 gap-2 glass rounded-xl p-3">
      {stats.map((s) => (
        <div key={s.label} className="flex flex-col items-center gap-0.5">
          <span className="font-display text-sm text-amber-300">{s.value}</span>
          <span className="font-sans text-[9px] text-white/40 text-center leading-tight">
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Top Header ─────────────────────────────────────────────────────────────
function TopHeader() {
  return (
    <header className="flex items-center justify-between px-5 py-4">
      <div className="flex items-center gap-2">
        <LogoIcon />
        <span className="font-display text-sm text-white/80 tracking-widest">
          ALCHEMY OS
        </span>
      </div>
      <Link
        href="/dang-nhap"
        className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-sans font-medium text-white/70 hover:text-white transition-colors"
        style={{
          background: "rgba(139, 92, 246, 0.15)",
          border: "1px solid rgba(139, 92, 246, 0.3)",
        }}
      >
        <span>⚡</span>
        ĐĂNG NHẬP
      </Link>
    </header>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <div className="relative flex flex-col min-h-screen">
      {/* Ambient orbs */}
      <div
        className="fixed top-0 left-1/4 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="fixed bottom-1/3 right-0 w-64 h-64 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* Page content */}
      <div className="relative z-10 flex flex-col pb-20">
        <TopHeader />

        {/* ── Hero Section ───────────────────────────────── */}
        <section className="px-5 py-4 flex flex-col gap-5">
          {/* Tagline */}
          <div className="flex items-center gap-2">
            <div className="flex gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} />
              ))}
            </div>
          </div>

          {/* Hero text */}
          <div className="flex flex-col gap-3">
            <h1 className="font-display text-3xl font-bold leading-tight text-glow-gold"
              style={{
                background: "linear-gradient(135deg, #d4a843 0%, #f5e06e 40%, #c8922d 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              ĐÁNH THỨC SỨC<br />MẠNH CỔ XƯA
            </h1>
            <p className="font-body text-base text-white/60 leading-relaxed italic">
              Bước vào Thánh Địa và khám phá những huyền thoại của vũ trụ. Để lữ hành trình của bạn trở nên linh thiêng — thuật giả sẽ vô số kết thúc giờ thoa.
            </p>
          </div>

          {/* CTA Button */}
          <Link
            href="/thanh-dia"
            id="cta-enter-realm"
            className="group relative flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-sans font-semibold text-sm tracking-widest text-white overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              background: "linear-gradient(135deg, rgba(139,92,246,0.8) 0%, rgba(109,40,217,0.9) 100%)",
              border: "1px solid rgba(167,139,250,0.5)",
              boxShadow: "0 0 30px rgba(139,92,246,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
            }}
          >
            {/* Shimmer */}
            <div className="absolute inset-0 shimmer opacity-30 group-hover:opacity-60 transition-opacity" />
            <span className="relative">🌙</span>
            <span className="relative tracking-[0.15em]">BƯỚC VÀO THÁNH ĐỊA</span>
          </Link>
        </section>

        {/* ── Features Section ────────────────────────────── */}
        <section className="px-5 py-6 flex flex-col gap-4">
          <RuneDivider label="GIAO THỨC HỆ THỐNG" />

          <div className="flex flex-col gap-3">
            <FeatureCard
              icon="🌙"
              title="CÕI MỆNH MỘNG"
              desc="Khám phá các chuyện về không gian linh thiêng được tạo dựng từ năng lượng của những chiều không gian song hành đặc biệt."
              delay={0}
            />
            <FeatureCard
              icon="⚔️"
              title="CHIẾN ĐẤU KẾT ÁN"
              desc="Lắng nghe những bí thuật chiến đấu của các bài cổ hành vinh về lịch sử và thần thoại thời hoang sơ xa xưa."
              delay={100}
            />
            <FeatureCard
              icon="📜"
              title="TIẾN TRÌNH VÔ HẠN"
              desc="Nâng cấp giao diện này về phần tình trạng cấp bậc của bạn và tăng cương thêm sức phẩm tâm tình và thêm hoa."
              delay={200}
            />
          </div>
        </section>

        {/* ── Card Gallery Section ─────────────────────────── */}
        <section className="py-4 flex flex-col gap-4">
          <div className="px-5">
            <RuneDivider label="THỰC THỂ TINH ANH" />
          </div>

          <div className="px-5 flex items-center justify-between">
            <span className="font-body text-xs text-white/40 italic">ĐÃM VỀ HỬU CÔ</span>
            <div className="flex gap-2">
              <button className="w-7 h-7 rounded-full glass flex items-center justify-center text-white/50 hover:text-white transition-colors text-xs">
                ‹
              </button>
              <button className="w-7 h-7 rounded-full glass flex items-center justify-center text-white/50 hover:text-white transition-colors text-xs">
                ›
              </button>
            </div>
          </div>

          {/* Horizontal scroll cards */}
          <div className="flex gap-3 overflow-x-auto px-5 pb-2 scrollbar-hide">
            <MiniTarotCard
              name="KẺ ĐỘT ĐỘNG TỐI"
              tribe="Tộc Phong Kiếm"
              gradient="linear-gradient(135deg, #1a0a3e 0%, #2d1065 50%, #0f0624 100%)"
              glowColor="#8b5cf6"
              imageEmoji="🌑"
            />
            <MiniTarotCard
              name="SONG SINH TRÁI TIM"
              tribe="Tộc Thuỷ Nguyệt"
              gradient="linear-gradient(135deg, #0c2a4a 0%, #1e5080 50%, #0a1e35 100%)"
              glowColor="#06b6d4"
              imageEmoji="💙"
            />
            <MiniTarotCard
              name="NGỌN LỬA SỤP ĐỔ"
              tribe="Tộc Diễm Hoả"
              gradient="linear-gradient(135deg, #3a0e00 0%, #8b3100 50%, #1a0600 100%)"
              glowColor="#f97316"
              imageEmoji="🔥"
            />
            <MiniTarotCard
              name="???"
              locked
              gradient=""
              glowColor=""
              imageEmoji=""
            />
            <MiniTarotCard
              name="???"
              locked
              gradient=""
              glowColor=""
              imageEmoji=""
            />
          </div>

          {/* Card stats row */}
          <div className="px-5 glass mx-5 rounded-xl p-3">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="font-display text-amber-400 text-xs">BỘ BÌNH (NẶP)</span>
                <div className="mt-1 flex gap-1">
                  <span className="font-sans text-white/40">2.4M - 3.8K</span>
                </div>
              </div>
              <div>
                <span className="font-display text-amber-400 text-xs">ARTHUR QUANA</span>
                <div className="mt-1 flex gap-1">
                  <span className="font-sans text-white/40">5.2K - 1.1K</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Realm / Thánh Địa Section ──────────────────── */}
        <section className="px-5 py-4 flex flex-col gap-4">
          <RuneDivider label="THÁNH ĐỊA" />

          <div className="flex flex-col gap-2">
            <RealmZone
              icon="🏛️"
              name="Ngự Điện Trung Tâm"
              desc="Nơi hội tụ linh khí của 22 Đại Bí Pháp Major Arcana"
              color="#8b5cf6"
            />
            <RealmZone
              icon="🔥"
              name="Thung Lũng Lửa"
              desc="Sức ổn định và thịnh vượng của thể chất"
              unlocked={8}
              total={14}
              color="#f97316"
            />
            <RealmZone
              icon="💧"
              name="Hồ Nguyệt Thuỷ"
              desc="Dòng cảm xúc và trực giác sâu thẳm"
              color="#06b6d4"
            />
            <RealmZone
              icon="🌿"
              name="Khu Vườn Đất Ấm"
              desc="Sức ổn định và thịnh vượng của thể chất"
              color="#10b981"
            />
          </div>
        </section>

        {/* ── Stats Banner ───────────────────────────────── */}
        <section className="px-5 py-4 flex flex-col gap-4">
          <StatsBanner />
        </section>

        {/* ── Footer credit ──────────────────────────────── */}
        <footer className="px-5 py-3 text-center">
          <p className="font-body text-[10px] text-white/20 italic">
            © Cõi Vô Thường 7.07 · Tất cả quyền đã được bảo lưu
          </p>
        </footer>
      </div>

      {/* Bottom Navigation */}
      <BottomNav active="Thánh Địa" />
    </div>
  );
}
