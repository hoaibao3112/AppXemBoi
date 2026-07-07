"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { speakText, stopSpeaking } from "@/lib/speech";

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
    { label: "Sứ Giả", value: "78" },
    { label: "Tộc Người", value: "4" },
    { label: "Mảnh Hồi Ức", value: "7" },
    { label: "Nghi Thức", value: "∞" },
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

// ─── Soul Card Shadow Widget (Blueprint Mục 7.2) ─────────────────────────────
const SOUL_CARD_ADVICE: Record<string, string[]> = {
  "The Fool": [
    "Hôm nay, hãy để trái tim dẫn lối trước khi lý trí lên tiếng. Mỗi bước chân mới đều bắt đầu từ bờ vực của điều chưa biết.",
    "Sứ Giả Chân Trần nhắc ngươi: đừng gánh quá nhiều hành lý của quá khứ khi bước vào một chương mới.",
  ],
  "The Magician": [
    "Mọi công cụ ngươi cần để thay đổi đã nằm trong tay. Hôm nay là ngày của hành động, không phải chờ đợi.",
    "Sứ Giả Thuật Sĩ nhắc nhở: sức mạnh thật sự nằm ở sự tập trung của ý chí, không phải hoàn cảnh bên ngoài.",
  ],
  "The High Priestess": [
    "Im lặng hôm nay sẽ nói lên nhiều điều hơn ngàn lời. Hãy lắng nghe trực giác sâu thẳm nhất của ngươi.",
    "Sứ Giả Nữ Tư Tế gửi lời: có những sự thật chỉ hiện ra trong bóng tối yên tĩnh của nội tâm.",
  ],
  "The Empress": [
    "Hôm nay là ngày để nuôi dưỡng — bản thân, mối quan hệ, hay ước mơ đang ươm mầm. Hãy kiên nhẫn với sự phát triển.",
    "Sứ Giả Nữ Hoàng nhắc nhở: vẻ đẹp thật sự sinh ra từ sự chăm chút bền bỉ, không từ sự vội vàng.",
  ],
  "The Emperor": [
    "Đặt ra ranh giới rõ ràng và giữ vững lập trường. Hôm nay, sự kiên định của ngươi chính là sức mạnh lớn nhất.",
    "Sứ Giả Đá Nền gửi lời: một nền móng vững chắc không bao giờ được xây trong vội vã.",
  ],
  "The Hierophant": [
    "Hãy tìm về những gì là cốt lõi và có ý nghĩa với ngươi. Đôi khi, con đường đúng đắn nhất là con đường đã được thử thách bởi thời gian.",
    "Sứ Giả Người Dẫn Đường nhắc: truyền thống không phải xiềng xích — đó là nền tảng để ngươi tự do bay cao hơn.",
  ],
  "The Lovers": [
    "Hôm nay mang năng lượng của sự lựa chọn. Hãy chọn bằng trái tim lẫn lý trí — không ai xứng đáng nhận được một nửa con người ngươi.",
    "Song Sinh Trái Tim nhắc nhở: tình yêu thật không đòi ngươi từ bỏ chính mình để thuộc về người khác.",
  ],
  "The Chariot": [
    "Hôm nay ngươi có đủ sức mạnh để điều hướng cả hai nguồn lực đối nghịch trong lòng. Hãy tiến về phía trước với mục tiêu rõ ràng.",
    "Sứ Giả Chiến Xa nhắc: chiến thắng thật sự không phải đánh bại người khác, mà là làm chủ chính mình.",
  ],
  "Strength": [
    "Sức mạnh hôm nay đến từ lòng nhân từ với chính mình. Hãy ôm ấp nỗi sợ thay vì chạy trốn nó.",
    "Sứ Giả Dũng Cảm gửi lời: dũng cảm thật sự là biết rằng mình sợ nhưng vẫn bước tiếp.",
  ],
  "The Hermit": [
    "Hôm nay là thời gian dành riêng cho ngươi. Lui về yên tĩnh, suy nghĩ sâu hơn. Ánh sáng của ẩn nhân chỉ tỏa ra khi có đủ im lặng.",
    "Ẩn Nhân nhắc nhở: đôi khi xa cách không phải cô đơn — đó là cách để ánh sáng nội tâm tụ lại.",
  ],
  "Wheel of Fortune": [
    "Vòng bánh xe đang quay. Hãy tin tưởng vào nhịp điệu của vũ trụ và chuẩn bị sẵn sàng đón nhận những thay đổi bất ngờ.",
    "Bánh Xe Vận Mệnh nhắc: không có gì bất động mãi mãi — cả những đau khổ lẫn hạnh phúc đều sẽ xoay vần.",
  ],
  "Justice": [
    "Hôm nay hãy hành động với sự công tâm và thành thật. Những gì ngươi gieo sẽ gặt đúng thời điểm.",
    "Sứ Giả Cân Bằng nhắc nhở: đừng mong mỏi sự công bằng từ bên ngoài nếu lòng ngươi chưa thật sự ngay thẳng.",
  ],
  "The Hanged Man": [
    "Hôm nay là ngày tạm dừng. Đừng hành động vội — nhìn mọi thứ từ góc độ khác sẽ mang lại sự thông tuệ bất ngờ.",
    "Kẻ Treo Ngược gửi lời: đôi khi buông bỏ quyền kiểm soát chính là hành động dũng cảm nhất.",
  ],
  "Death": [
    "Một điều gì đó đang kết thúc để nhường chỗ cho điều mới. Đừng sợ — đây là sự chuyển hoá, không phải mất mát.",
    "Sứ Giả Cánh Cửa Khép Lại nhắc: mỗi cái chết của thói quen cũ là sự ra đời của một phiên bản tự do hơn của ngươi.",
  ],
  "Temperance": [
    "Hôm nay hãy tìm sự cân bằng giữa các thái cực. Kiên nhẫn và tiết chế là liều thuốc chữa lành mạnh nhất.",
    "Sứ Giả Trung Dung nhắc nhở: dòng nước tĩnh lặng nhất lại chảy xa nhất.",
  ],
  "The Devil": [
    "Hãy nhìn thẳng vào những điều đang giam cầm ngươi. Sợi xích hữu hình thật ra rất dễ tháo nếu ngươi chịu nhìn thấy nó.",
    "Sứ Giả Dây Xích gửi lời: không phải hoàn cảnh giữ chân ngươi — chính nỗi sợ rời đi mới là xiềng xích thật.",
  ],
  "The Tower": [
    "Sự đổ vỡ hôm nay là sự dọn dẹp cần thiết. Đừng cố giữ lại những gì đã lỗi thời — mặt đất mới mẻ chỉ lộ ra sau khi tòa tháp sụp.",
    "Ngọn Lửa Sụp Đổ nhắc: đôi khi sự chuyển mình đến đột ngột nhất lại mang đến tự do triệt để nhất.",
  ],
  "The Star": [
    "Hôm nay hãy tin vào hy vọng. Dù sương mù còn dày, ánh sao đã rọi đến cho ngươi.",
    "Sứ Giả Ánh Sao Hy Vọng gửi lời: chữa lành không cần hoàn hảo — chỉ cần ngươi cho phép bản thân được nghỉ ngơi.",
  ],
  "The Moon": [
    "Hôm nay hãy chú ý đến những giấc mơ và trực giác. Mặt trăng che phủ sự thật nhưng cũng tiết lộ những điều ẩn sâu nhất.",
    "Sứ Giả Ánh Nguyệt nhắc: đừng tin ngay mọi nỗi sợ mà tâm trí vẽ ra trong bóng tối — nhiều thứ sẽ rõ hơn khi bình minh ló dạng.",
  ],
  "The Sun": [
    "Hôm nay mang năng lượng rực rỡ. Hãy để bản thân tỏa sáng và chia sẻ niềm vui chân thật với những người xung quanh.",
    "Sứ Giả Ánh Dương gửi lời: hạnh phúc thật sự không cần lý do — nó chỉ cần ngươi cho phép mình cảm nhận.",
  ],
  "Judgement": [
    "Hôm nay là lúc để tha thứ — cho người khác và đặc biệt là cho chính ngươi. Một chương mới đang gọi tên ngươi.",
    "Tiếng Kèn Phán Xét vang lên: đừng để những phán xét cũ về bản thân kéo ngươi trở lại khi vũ trụ đang mời ngươi bước lên.",
  ],
  "The World": [
    "Hôm nay ngươi đang đứng ở ngưỡng cửa của sự hoàn thành. Hãy trân trọng những gì đã đi qua và sẵn sàng cho vòng xoay tiếp theo.",
    "Sứ Giả Vũ Điệu Vĩnh Cửu gửi lời: mỗi kết thúc đều mang hạt giống của một cuộc hành trình mới trong lòng nó.",
  ],
};

function SoulCardShadow() {
  const [profile, setProfile] = useState<{ soulCard: string | null; name: string | null } | null>(null);
  const [advice, setAdvice] = useState<string | null>(null);
  const [showAdvice, setShowAdvice] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setLoading(false); return; }
    fetch("/api/user/profile", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (data.soulCard) setProfile({ soulCard: data.soulCard, name: data.name });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !profile?.soulCard) return null;

  const soulCardName = profile.soulCard;
  const advicePool = SOUL_CARD_ADVICE[soulCardName] ?? [
    `Sứ Giả Hộ Mệnh ${soulCardName} đang quan sát hành trình của ngươi hôm nay. Hãy đi theo ánh sáng nội tâm của mình.`,
  ];

  const handleTap = () => {
    if (!showAdvice) {
      const idx = Math.floor(Math.random() * advicePool.length);
      setAdvice(advicePool[idx]);
      setShowAdvice(true);
    } else {
      setShowAdvice(false);
    }
  };

  return (
    <div className="mx-5 rounded-xl overflow-hidden animate-fade-in" style={{ border: "1px solid rgba(139,92,246,0.2)" }}>
      <button
        onClick={handleTap}
        id="soul-card-shadow-btn"
        className="w-full relative flex items-center gap-4 p-4 transition-all duration-300 hover:bg-purple-500/5 text-white"
        style={{ background: "rgba(10,8,30,0.6)", backdropFilter: "blur(12px)" }}
      >
        {/* Shadow silhouette */}
        <div className="relative flex-shrink-0">
          <div
            className="w-14 h-20 rounded-lg flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(212,168,67,0.1) 100%)",
              border: "1px solid rgba(139,92,246,0.25)",
              boxShadow: "0 0 20px rgba(139,92,246,0.2)",
            }}
          >
            <div
              className="text-3xl"
              style={{
                filter: showAdvice ? "none" : "blur(0px) drop-shadow(0 0 8px rgba(139,92,246,0.6))",
                opacity: showAdvice ? 1 : 0.4,
                transition: "all 0.5s ease",
              }}
            >
              🔮
            </div>
          </div>
          {/* Pulsing ring */}
          {!showAdvice && (
            <div
              className="absolute -inset-1 rounded-lg animate-pulse"
              style={{ border: "1px solid rgba(139,92,246,0.3)", animationDuration: "2s" }}
            />
          )}
        </div>

        {/* Text content */}
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-display text-[10px] tracking-[0.2em] text-purple-400/70 uppercase">Sứ Giả Hộ Mệnh</span>
          </div>
          <h3 className="font-display text-sm text-amber-300 tracking-wide leading-tight">
            {soulCardName}
          </h3>
          <p className="font-body text-xs text-white/40 mt-0.5">
            {showAdvice ? "Chạm để đóng lại" : "Chạm để nghe lời thì thầm hôm nay"}
          </p>
        </div>

        {/* Tap indicator */}
        <div className="flex-shrink-0">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{
              background: showAdvice ? "rgba(212,168,67,0.2)" : "rgba(139,92,246,0.15)",
              border: `1px solid ${showAdvice ? "rgba(212,168,67,0.4)" : "rgba(139,92,246,0.3)"}`,
              transition: "all 0.3s ease",
            }}
          >
            <span className="text-xs">{showAdvice ? "✕" : "✦"}</span>
          </div>
        </div>
      </button>

      {/* Advice text panel */}
      <div
        style={{
          maxHeight: showAdvice ? "200px" : "0px",
          overflow: "hidden",
          transition: "max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div
          className="px-5 pb-4 pt-2"
          style={{
            background: "linear-gradient(180deg, rgba(139,92,246,0.05) 0%, rgba(0,0,0,0) 100%)",
            borderTop: "1px solid rgba(139,92,246,0.1)",
          }}
        >
          <div className="flex gap-2 items-start">
            <span className="text-amber-400 text-sm mt-0.5 flex-shrink-0">✦</span>
            <p className="font-body text-sm text-white/70 leading-relaxed italic">"{advice}"</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function WhisperInTheMistWidget() {
  const [whisper, setWhisper] = useState<{ content: string; clan: string } | null>(null);
  const [commentary, setCommentary] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setLoading(false); return; }
    fetch("/api/tarot/whisper", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data.success && data.whisper) {
          setWhisper(data.whisper);
          setCommentary(data.commentary);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !whisper) return null;

  const clanNameVi =
    whisper.clan === 'DiemHoa'
      ? 'Diễm Hoả'
      : whisper.clan === 'ThuyNguyet'
      ? 'Thuỷ Nguyệt'
      : whisper.clan === 'PhongKiem'
      ? 'Phong Kiếm'
      : whisper.clan === 'ThoKim'
      ? 'Thổ Kim'
      : 'Vô Thường';

  const clanColor =
    whisper.clan === 'DiemHoa'
      ? '#f97316'
      : whisper.clan === 'ThuyNguyet'
      ? '#06b6d4'
      : whisper.clan === 'PhongKiem'
      ? '#8b5cf6'
      : whisper.clan === 'ThoKim'
      ? '#10b981'
      : '#a78bfa';

  return (
    <div
      className="mx-5 rounded-xl p-4 flex flex-col gap-3 text-left border animate-fade-in"
      style={{
        background: "rgba(10, 8, 30, 0.45)",
        borderColor: "rgba(139, 92, 246, 0.15)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-xs">🌫️</span>
          <span className="font-display text-[9px] text-purple-300 tracking-widest uppercase">
            Thông điệp trong sương
          </span>
        </div>
        <span className="font-display text-[8px] px-2 py-0.5 rounded bg-white/5 uppercase" style={{ color: clanColor, borderColor: `${clanColor}30`, border: "1px solid" }}>
          Tộc {clanNameVi}
        </span>
      </div>

      <p className="font-body text-xs text-white/70 italic leading-relaxed">
        "{whisper.content}"
      </p>

      <div className="h-px bg-white/5 w-full" />

      <div className="flex gap-2 items-start">
        <span className="text-amber-400 text-[10px] mt-0.5">👁️</span>
        <p className="font-body text-[10px] text-white/40 leading-relaxed italic">
          Vọng thì thầm: "{commentary}"
        </p>
      </div>
    </div>
  );
}

// ─── Top Header ─────────────────────────────────────────────────────────────
interface TopHeaderProps {
  onOpenTutorial: () => void;
}

function TopHeader({ onOpenTutorial }: TopHeaderProps) {
  return (
    <header className="flex items-center justify-between px-5 py-4">
      <div className="flex items-center gap-2">
        <LogoIcon />
        <span className="font-display text-sm text-white/80 tracking-widest">
          CÕI VÔ THƯỜNG
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenTutorial}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[10px] font-display tracking-wider text-purple-300 hover:text-white transition-colors"
          style={{
            background: "rgba(139, 92, 246, 0.12)",
            border: "1px solid rgba(139, 92, 246, 0.25)",
          }}
        >
          <span>👁️</span>
          THÌ THẦM LỜI DẪN
        </button>
        <Link
          href="/dang-nhap"
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-sans font-medium text-white/70 hover:text-white transition-colors"
          style={{
            background: "rgba(139, 92, 246, 0.15)",
            border: "1px solid rgba(139, 92, 246, 0.3)",
          }}
        >
          <span>🌙</span>
          ĐĂNG NHẬP
        </Link>
      </div>
    </header>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
const TUTORIAL_SENTENCES = [
  "Chào mừng lữ khách đến với Cõi Vô Thường. Ta là Vọng, kẻ trông giữ ngưỡng cửa không tuổi này.",
  "Hãy lắng nghe ta hướng dẫn cách đi qua cõi sương mù để tìm kiếm câu trả lời cho số mệnh.",
  "Đầu tiên, hãy vào Thánh Địa để bắt đầu trải bài Tarot. Hãy đặt câu hỏi thật lòng và rút ba lá bài.",
  "Ở kết quả trải bài, hãy đưa ra lựa chọn phản hồi. Lựa chọn của ngươi sẽ thay đổi chỉ số Cộng hưởng Cảm xúc ERC, định hình thái độ của ta với ngươi.",
  "Thứ hai, mỗi ngày hãy gõ cửa Thánh Địa, chạm giữ ba giây để thực hiện nghi thức Đốt Lá Thông Khô, nhận Lời Thì Thầm Hộ Mệnh.",
  "Thứ ba, ngươi có thể viết ra tâm sự ẩn danh để thả vào sương mù, hoặc đọc những lời tự sự của những lữ khách khác trôi dạt tại trang chủ.",
  "Cuối cùng, hãy mở Bản Đồ Hành Trình để sưu tầm đủ bảy mươi tám Sứ Giả, mở khóa bảy mảnh hồi ức quá khứ của ta.",
  "Giờ thì hãy nhắm mắt lại, hít một hơi thật sâu, và chạm vào sương mù để bắt đầu."
];

export default function HomePage() {
  const [showTutorial, setShowTutorial] = useState(false);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem("hasSeenTutorial");
    if (!hasSeen) {
      setShowWelcomePopup(true);
    }
  }, []);

  const playNextSentence = (idx: number) => {
    if (idx >= TUTORIAL_SENTENCES.length) {
      handleStop();
      localStorage.setItem("hasSeenTutorial", "true");
      return;
    }
    setSpeakingIdx(idx);
    setIsPlaying(true);

    // Stop any ongoing speech
    stopSpeaking();

    if (typeof window !== "undefined") {
      let audio = (window as any)._globalAudio;
      if (!audio) {
        audio = new Audio();
        (window as any)._globalAudio = audio;
      }

      audio.src = `/api/tarot/tts?text=${encodeURIComponent(TUTORIAL_SENTENCES[idx])}`;
      
      audio.onended = () => {
        playNextSentence(idx + 1);
      };
      
      audio.onerror = () => {
        console.warn("Audio play failed, falling back to Web Speech API");
        const utterance = new SpeechSynthesisUtterance(TUTORIAL_SENTENCES[idx]);
        utterance.lang = "vi-VN";
        utterance.rate = 0.85;
        utterance.pitch = 0.85;
        
        utterance.onend = () => {
          playNextSentence(idx + 1);
        };
        utterance.onerror = () => {
          setIsPlaying(false);
        };
        
        if (window.speechSynthesis) {
          window.speechSynthesis.speak(utterance);
        }
      };

      audio.play().catch(err => {
        console.warn("Audio autoplay blocked or failed, calling fallback:", err);
        // If autoplay fails, we immediately fall back to speechSynthesis
        const utterance = new SpeechSynthesisUtterance(TUTORIAL_SENTENCES[idx]);
        utterance.lang = "vi-VN";
        utterance.rate = 0.85;
        utterance.pitch = 0.85;
        utterance.onend = () => {
          playNextSentence(idx + 1);
        };
        utterance.onerror = () => {
          setIsPlaying(false);
        };
        if (window.speechSynthesis) {
          window.speechSynthesis.speak(utterance);
        }
      });
    }
  };

  const handleStartTutorial = () => {
    setShowWelcomePopup(false);
    setShowTutorial(true);
    playNextSentence(0);
  };

  const handleStop = () => {
    stopSpeaking();
    setSpeakingIdx(null);
    setIsPlaying(false);
    setShowTutorial(false);
  };

  const handleDismissWelcome = () => {
    setShowWelcomePopup(false);
    localStorage.setItem("hasSeenTutorial", "true");
  };

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
        <TopHeader onOpenTutorial={() => { setShowTutorial(true); playNextSentence(0); }} />

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
            <h1 className="font-display text-3xl font-bold leading-tight"
              style={{
                background: "linear-gradient(135deg, #d4a843 0%, #f5e06e 40%, #c8922d 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              CÕI VÔ THƯỜNG<br />ĐANG CHỜ NGƯƠI
            </h1>
            <p className="font-body text-base text-white/60 leading-relaxed italic">
              Bước qua cổng sương mù, để Vọng — kẻ đứng đợi ngàn năm — dẫn lối ngươi qua 78 Sứ Giả. Mỗi lá bài là một phần linh hồn đang chờ để cùng ngươi trò chuyện.
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
            <span className="relative">🔮</span>
            <span className="relative tracking-[0.15em]">BƯỚC VÀO THÁNH ĐỊA</span>
          </Link>
        </section>

        {/* ── Soul Card Shadow Section ────────────────────── */}
        <section className="py-2 flex flex-col gap-2">
          <SoulCardShadow />
          <WhisperInTheMistWidget />
        </section>

        {/* ── Features Section ────────────────────────────── */}
        <section className="px-5 py-4 flex flex-col gap-4">
          <RuneDivider label="BÍ THUẬT KỂ CHUYỆN" />

          <div className="flex flex-col gap-3">
            <FeatureCard
              icon="🔮"
              title="78 SỨ GIẢ LINH THIÊNG"
              desc="Tương tác trực tiếp với các Sứ Giả. Họ mang hình bóng người con gái đã tan vào cõi sương mù của Vọng."
              delay={0}
            />
            <FeatureCard
              icon="⚖️"
              title="HỆ SỐ ERC & ĐỊNH MỆNH"
              desc="Hệ số Cộng Hưởng Cảm Xúc (ERC) phản ánh cõi lòng ngươi và thay đổi cách Vọng luận giải bài Tarot."
              delay={100}
            />
            <FeatureCard
              icon="📖"
              title="7 MẢNH HỒI ỨC VỌNG"
              desc="Theo bước hành trình bói toán, tháo gỡ sương mù để mở khóa câu chuyện tình ngàn năm đầy u uẩn của Vọng."
              delay={200}
            />
          </div>
        </section>

        {/* ── Card Gallery Section ─────────────────────────── */}
        <section className="py-4 flex flex-col gap-4">
          <div className="px-5">
            <RuneDivider label="CÁC SỨ GIẢ NỔI BẬT" />
          </div>

          <div className="px-5 flex items-center justify-between">
            <span className="font-body text-xs text-white/40 italic">Chạm để lật bài</span>
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
              name="SONG SINH TRÁI TIM"
              tribe="Tộc Thuỷ Nguyệt"
              subtitle="The Lovers"
              gradient="linear-gradient(135deg, #1a0a2e 0%, #3d1080 50%, #0f0620 100%)"
              glowColor="#a78bfa"
              imageEmoji="💜"
            />
            <MiniTarotCard
              name="NGỌN LỬA SỤP ĐỔ"
              tribe="Tộc Diễm Hoả"
              subtitle="The Tower"
              gradient="linear-gradient(135deg, #3a0e00 0%, #8b3100 50%, #1a0600 100%)"
              glowColor="#f97316"
              imageEmoji="🔥"
            />
            <MiniTarotCard
              name="ÁNH SAO HY VỌNG"
              tribe="Ngự Điện"
              subtitle="The Star"
              gradient="linear-gradient(135deg, #0a1a3e 0%, #1e3a70 50%, #060e24 100%)"
              glowColor="#06b6d4"
              imageEmoji="⭐"
            />
            <MiniTarotCard
              name="CÁI CHẾT CHUYỂN HOÁ"
              tribe="Ngự Điện"
              subtitle="Death"
              gradient="linear-gradient(135deg, #0a0a1e 0%, #1a1a40 50%, #050510 100%)"
              glowColor="#6366f1"
              imageEmoji="🌙"
            />
            <MiniTarotCard
              name="???"
              locked
              gradient=""
              glowColor=""
              imageEmoji=""
            />
          </div>

          {/* Clan badge row */}
          <div className="px-5 glass mx-5 rounded-xl p-3">
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { icon: "🔥", label: "Diễm Hoả", color: "#f97316" },
                { icon: "💧", label: "Thuỷ Nguyệt", color: "#06b6d4" },
                { icon: "⚔️", label: "Phong Kiếm", color: "#8b5cf6" },
                { icon: "🌿", label: "Thổ Kim", color: "#10b981" },
              ].map(c => (
                <div key={c.label} className="flex flex-col items-center gap-1">
                  <span className="text-lg">{c.icon}</span>
                  <span className="font-display text-[8px] tracking-wide" style={{ color: c.color }}>{c.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Realm / Thánh Địa Section ──────────────────── */}
        <section className="px-5 py-4 flex flex-col gap-4">
          <RuneDivider label="BẢN ĐỒ CÕI GIỚI" />

          <div className="flex flex-col gap-2">
            <RealmZone
              icon="🏛️"
              name="Ngự Điện Trung Tâm"
              desc="Nơi ngự trị của 22 Sứ Giả Lớn — linh hồn tinh tuý của cả cõi"
              color="#8b5cf6"
            />
            <RealmZone
              icon="🔥"
              name="Thung Lũng Lửa"
              desc="Nhiệt huyết và đam mê của Tộc Diễm Hoả — nơi lửa ký ức rực cháy"
              color="#f97316"
            />
            <RealmZone
              icon="💧"
              name="Hồ Nguyệt Thuỷ"
              desc="Dòng cảm xúc và trực giác sâu thẳm của Tộc Thuỷ Nguyệt"
              color="#06b6d4"
            />
            <RealmZone
              icon="⚔️"
              name="Vách Đá Gió"
              desc="Lý trí sắc bén và sự thật trần trụi của Tộc Phong Kiếm"
              color="#8b5cf6"
            />
            <RealmZone
              icon="🌿"
              name="Khu Vườn Đất Ấm"
              desc="Sự kiên cường và thực tế của Tộc Thổ Kim — nền đất bền vững"
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

      {/* ── Welcome Onboarding Prompt ───────────────────── */}
      {showWelcomePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
          <div
            className="w-full max-w-sm rounded-2xl p-6 text-center border animate-fade-in flex flex-col gap-4 text-white"
            style={{
              background: "rgba(15, 12, 35, 0.95)",
              borderColor: "rgba(139, 92, 246, 0.3)",
              boxShadow: "0 0 30px rgba(139, 92, 246, 0.25)",
            }}
          >
            <div className="text-4xl animate-bounce">👁️</div>
            <div className="flex flex-col gap-1">
              <h2 className="font-display text-sm tracking-widest text-amber-300">
                THÌ THẦM CỦA VỌNG
              </h2>
              <p className="font-body text-xs text-white/60 leading-relaxed italic mt-2">
                "Chào lữ khách mới... Ta là Vọng, kẻ giữ cổng Cõi Vô Thường. Ngươi có muốn nghe ta thì thầm hướng dẫn cách đi qua sương mù để tìm kiếm câu trả lời?"
              </p>
            </div>
            <div className="flex gap-2 w-full mt-2">
              <button
                onClick={handleDismissWelcome}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs font-sans text-white/40 hover:text-white/70 transition-all"
              >
                Tự tìm hiểu
              </button>
              <button
                onClick={handleStartTutorial}
                className="flex-1 py-2.5 rounded-xl bg-purple-500/20 text-xs font-sans text-purple-300 border border-purple-500/30 hover:bg-purple-500/35 transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)] font-semibold"
              >
                Nghe Vọng nói
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Voice Tutorial Speech Modal ─────────────────── */}
      {showTutorial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-lg p-6">
          <div
            className="w-full max-w-sm rounded-2xl p-6 text-center border animate-fade-in flex flex-col gap-5 text-white"
            style={{
              background: "rgba(10, 8, 25, 0.98)",
              borderColor: "rgba(139, 92, 246, 0.4)",
              boxShadow: "0 0 40px rgba(139, 92, 246, 0.35)",
            }}
          >
            {/* Character Image of Vọng */}
            <div className="relative w-full h-48 rounded-xl overflow-hidden border border-purple-500/20">
              <style>{`
                @keyframes mouth-talk {
                  0%, 100% { height: 2px; }
                  50% { height: 5px; }
                }
                .animate-talk {
                  animation: mouth-talk 0.18s infinite ease-in-out;
                }
              `}</style>
              <img
                src="/vong_gatekeeper.png"
                alt="Vọng - Gatekeeper"
                className="w-full h-full object-cover object-top filter brightness-[0.85] contrast-[1.05]"
              />
              {/* Talking Mouth Sprite Overlay */}
              {isPlaying && (
                <div
                  className="absolute left-[49.8%] -ml-1.5 top-[58%] w-3 bg-[#2d1212] border border-[#fbcfe8]/10 animate-talk"
                  style={{
                    borderRadius: "50%",
                    boxShadow: "0 0 2px rgba(0,0,0,0.6)",
                  }}
                />
              )}
              {/* Overlay gradient to blend bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              
              {/* Pulsing Visual Waveform */}
              <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-1 h-6">
                {[...Array(9)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-0.5 rounded bg-purple-400/80 ${isPlaying ? "animate-pulse" : "opacity-45"}`}
                    style={{
                      height: isPlaying ? `${Math.sin(i * 0.8) * 35 + 45}%` : "20%",
                      animationDuration: `${0.6 + i * 0.15}s`,
                      transition: "height 0.15s ease",
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="font-display text-[9px] tracking-[0.25em] text-purple-400 uppercase">
                Vọng đang nói
              </span>
              
              {/* Highlighted Sentence display */}
              <div className="min-h-[80px] flex items-center justify-center">
                <p className="font-body text-xs text-amber-100/90 leading-relaxed italic font-medium transition-all duration-300">
                  {speakingIdx !== null ? `"${TUTORIAL_SENTENCES[speakingIdx]}"` : ""}
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-3">
                <div
                  className="h-full bg-purple-400 transition-all duration-300"
                  style={{
                    width: `${((speakingIdx ?? 0) / TUTORIAL_SENTENCES.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="flex justify-center gap-3 mt-2">
              <button
                onClick={handleStop}
                className="px-6 py-2.5 rounded-xl border border-white/10 text-xs font-sans text-white/50 hover:text-white/80 transition-all"
              >
                Bỏ qua
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNav active="Thánh Địa" />
    </div>
  );
}
