"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface MappedCard {
  id: string;
  name: string;
  clan: string;
  isReversed: boolean;
  position: number;
}

interface Reading {
  id: string;
  question: string;
  cards: MappedCard[];
  response: string;
  ercChange: number;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const getVongReflection = (reading: Reading) => {
  const isFateful = reading.question.startsWith("[ĐỊNH MỆNH]");
  const cleanQuestion = isFateful ? reading.question.replace("[ĐỊNH MỆNH] ", "") : reading.question;
  const hasDiemHoa = reading.cards.some(c => c.clan === "DiemHoa");
  const hasThuyNguyet = reading.cards.some(c => c.clan === "ThuyNguyet");
  const hasPhongKiem = reading.cards.some(c => c.clan === "PhongKiem");
  const hasThoKim = reading.cards.some(c => c.clan === "ThoKim");
  
  if (isFateful) {
    return `Một điềm báo Định Mệnh hiển hiện rõ rệt đêm nay. Sương mù trong thánh địa cuộn lên cuồn cuộn thành những quầng sáng vàng cổ kính khi hành gia hỏi về việc "${cleanQuestion}". Câu trả lời của họ dứt khoát đến mức làm ta giật mình tự vấn bản thân về chấp niệm ngàn năm qua...`;
  }
  if (hasThuyNguyet && hasDiemHoa) {
    return `Quẻ bài của lữ khách hỏi về "${cleanQuestion}" mang cả Lửa và Nước - Diễm Hoả thiêu đốt và Thuỷ Nguyệt dạt dào. Sự mâu thuẫn giằng xé giữa hành động nhiệt huyết và cảm xúc sâu thẳm trong tim họ... hệt như hai chúng ta đứng trước ngã rẽ sương mù thuở ấy. Có những thứ dẫu biết sẽ tan biến nhưng lòng người vẫn cứ muốn cược lấy một lần.`;
  }
  if (hasThuyNguyet) {
    return `Dòng nước Thuỷ Nguyệt dạt dào dâng cao trong trải bài về việc "${cleanQuestion}". Sự luyến tiếc thương nhớ trong mắt họ làm lòng ta se lại. Nàng năm xưa cũng từng nhìn ta đầy trìu mến như vậy. Ta ước chi mình có đủ dũng cảm để ôm lấy ảo ảnh ấm áp ấy thay vì tiếp tục đứng giữ cửa sương lạnh lẽo này.`;
  }
  if (hasPhongKiem) {
    return `Gió lạnh từ Phong Kiếm rít lên qua những lá bài khi lữ khách trăn trở về việc "${cleanQuestion}". Họ mang lý trí sắc bén, sẵn sàng chịu đau đớn để dứt khoát buông tay. Sự dứt khoát ấy... chính là thứ ta đã thiếu khi buông tay nàng. Có lẽ họ sẽ đi xa hơn ta, thoát khỏi ngục tù của sự tiếc nuối.`;
  }
  if (hasDiemHoa) {
    return `Ngọn lửa của Diễm Hoả bùng cháy rực rỡ, xua tan làn sương mỏng quanh quẻ bài hỏi về "${cleanQuestion}". Sự cuồng nhiệt ấm áp ấy thật đáng ngưỡng mộ, nhưng lửa cháy quá to cũng dễ tự thiêu rụi bản thân. Hy vọng họ không để ngọn lửa đam mê biến thành đống tro tàn hoang lạnh.`;
  }
  if (hasThoKim) {
    return `Mảnh đất lành của Thổ Kim nâng đỡ những lá bài kiên định của lữ khách trăn trở về "${cleanQuestion}". Sự kiên nhẫn và thực tế của họ làm ta hổ thẹn. Ước gì năm xưa khi mặt đất cõi sương sụp đổ, ta cũng có thể bén rễ vững vàng, kiên cường đứng bên nàng thay vì lùi lại một bước chân hèn nhát...`;
  }
  return `Đêm nay, một lữ khách bước qua làn sương mỏng hỏi về việc "${cleanQuestion}". Ta đã thắp chiếc đèn lồng cổ và gõ cửa cõi sương để các Sứ Giả trò chuyện cùng họ. Cõi lòng họ còn trĩu nặng u uẩn lắm, mong rằng lời luận giải của ta có thể xoa dịu đôi phần.`;
};

export default function NhatKyPage() {
  const router = useRouter();
  const [readings, setReadings] = useState<Reading[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [clanFilter, setClanFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedReading, setExpandedReading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"user" | "vong">("user");
  const [userErc, setUserErc] = useState<number>(0);

  const fetchReadings = async (currentPage: number, currentClan: string) => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/dang-nhap");
        return;
      }

      let url = `/api/user/readings?page=${currentPage}&limit=5`;
      if (currentClan) {
        url += `&clan=${currentClan}`;
      }

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể tải nhật ký trải bài.");

      setReadings(data.readings);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReadings(page, clanFilter);
  }, [page, clanFilter]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("/api/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((r) => r.json())
        .then((data) => {
          if (typeof data.erc === "number") {
            setUserErc(data.erc);
          }
        })
        .catch(console.error);
    }
  }, []);

  const handleClanChange = (clan: string) => {
    setClanFilter(clan);
    setPage(1); // Reset to page 1 on filter change
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

  const formatDate = (isoStr: string) => {
    const date = new Date(isoStr);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCardEmoji = (clanName: string) => {
    const map: Record<string, string> = {
      DiemHoa: "🔥",
      ThuyNguyet: "🌊",
      PhongKiem: "⚔️",
      ThoKim: "🌿",
      VoThuong: "👁",
    };
    return map[clanName] || "🔮";
  };

  const getCardStyle = (isExpanded: boolean) => {
    if (userErc >= 50) {
      return {
        background: "rgba(35, 25, 10, 0.75)",
        borderColor: isExpanded ? "rgba(245, 158, 11, 0.5)" : "rgba(245, 158, 11, 0.15)",
        boxShadow: isExpanded ? "0 0 20px rgba(245, 158, 11, 0.25)" : "0 0 10px rgba(245, 158, 11, 0.05)",
      };
    }
    if (userErc <= -50) {
      return {
        background: "rgba(10, 20, 35, 0.75)",
        borderColor: isExpanded ? "rgba(14, 165, 233, 0.5)" : "rgba(14, 165, 233, 0.15)",
        boxShadow: isExpanded ? "0 0 20px rgba(14, 165, 233, 0.25)" : "0 0 10px rgba(14, 165, 233, 0.05)",
      };
    }
    return {
      background: "rgba(15, 22, 41, 0.7)",
      borderColor: isExpanded ? "rgba(139, 92, 246, 0.3)" : "rgba(255, 255, 255, 0.06)",
    };
  };

  const getPageBackgroundStyle = () => {
    if (userErc >= 50) {
      return "radial-gradient(ellipse at 50% 10%, rgba(245, 158, 11, 0.15) 0%, transparent 60%)";
    }
    if (userErc <= -50) {
      return "radial-gradient(ellipse at 50% 10%, rgba(14, 165, 233, 0.15) 0%, transparent 60%)";
    }
    return "radial-gradient(ellipse at 50% 10%, rgba(139, 92, 246, 0.12) 0%, transparent 50%)";
  };

  return (
    <div className="relative flex flex-col min-h-screen">
      {/* Background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: getPageBackgroundStyle(),
        }}
      />

      <div className="relative z-10 flex flex-col pb-28">
        {/* Header */}
        <header className="flex items-center justify-between px-5 py-4">
          <Link href="/" className="w-9 h-9 rounded-full flex items-center justify-center border border-white/10 text-white/50 hover:text-white/85 transition-all text-sm">
            ‹
          </Link>
          <h1 className="font-display text-base text-white/80 tracking-widest uppercase">
            NHẬT KÝ TRẢI BÀI
          </h1>
          <button className="w-9 h-9 rounded-full flex items-center justify-center border border-white/10 text-white/40">
            📖
          </button>
        </header>
        {/* Tab Switcher */}
        <div className="flex border-b border-white/5 mx-4 mb-3">
          <button
            onClick={() => setActiveTab("user")}
            className={`flex-1 py-2.5 font-display text-[10px] tracking-widest transition-all text-center border-b-2 ${
              activeTab === "user" ? "border-purple-400 text-purple-300" : "border-transparent text-white/40"
            }`}
          >
            NHẬT KÝ CỦA BẠN
          </button>
          <button
            onClick={() => setActiveTab("vong")}
            className={`flex-1 py-2.5 font-display text-[10px] tracking-widest transition-all text-center border-b-2 ${
              activeTab === "vong" ? "border-amber-400 text-amber-300" : "border-transparent text-white/40"
            }`}
          >
            THÌ THẦM CỦA VỌNG
          </button>
        </div>
        {/* Clan filters */}
        <div className="flex gap-2 overflow-x-auto px-4 py-2 scrollbar-hide">
          {[
            { value: "", label: "Tất cả" },
            { value: "VoThuong", label: "Vô Thường" },
            { value: "DiemHoa", label: "Diễm Hoả" },
            { value: "ThuyNguyet", label: "Thuỷ Nguyệt" },
            { value: "PhongKiem", label: "Phong Kiếm" },
            { value: "ThoKim", label: "Thổ Kim" },
          ].map((clan) => (
            <button
              key={clan.value}
              onClick={() => handleClanChange(clan.value)}
              className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-sans transition-all"
              style={{
                background: clanFilter === clan.value ? "rgba(139,92,246,0.2)" : "rgba(15,22,41,0.5)",
                border: clanFilter === clan.value ? "1px solid rgba(139,92,246,0.4)" : "1px solid rgba(255,255,255,0.06)",
                color: clanFilter === clan.value ? "#c4b5fd" : "rgba(255,255,255,0.5)",
              }}
            >
              {clan.label}
            </button>
          ))}
        </div>

        {/* Error State */}
        {error && (
          <div className="mx-4 mt-4 bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 text-center text-xs text-rose-400">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <span className="text-3xl animate-spin text-purple-400">✦</span>
            <span className="font-display text-[9px] text-white/35 tracking-widest uppercase">
              Đang mở sổ nhật ký...
            </span>
          </div>
        )}

        {/* Empty State */}
        {!loading && readings.length === 0 && (
          <div className="mx-4 my-12 py-16 glass rounded-2xl flex flex-col items-center justify-center text-center gap-3">
            <span className="text-4xl text-white/10">📖</span>
            <p className="font-body text-sm text-white/40 italic">
              "Trang giấy vẫn trắng tinh khôi. Ngươi chưa thực hiện lượt bói nào thuộc dòng năng lượng này."
            </p>
            <Link
              href="/chon-trai-bai"
              className="mt-2 px-6 py-2.5 rounded-xl font-display text-[10px] tracking-widest text-white border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20"
            >
              RÚT BÀI NGAY
            </Link>
          </div>
        )}

        {/* Readings List */}
        {!loading && readings.length > 0 && (
          <div className="flex flex-col gap-4 px-4 py-2">
            {readings.map((reading) => {
              const isExpanded = expandedReading === reading.id;
              const isFateful = reading.question.startsWith("[ĐỊNH MỆNH]");
              const cleanQuestion = isFateful ? reading.question.replace("[ĐỊNH MỆNH] ", "") : reading.question;
              
              // Custom style overlay if fateful
              const cardStyle = isFateful
                ? {
                    background: "linear-gradient(135deg, rgba(212, 168, 67, 0.1) 0%, rgba(15, 22, 41, 0.85) 100%)",
                    borderColor: isExpanded ? "rgba(212, 168, 67, 0.55)" : "rgba(212, 168, 67, 0.25)",
                    boxShadow: isExpanded ? "0 0 25px rgba(212, 168, 67, 0.2)" : "0 0 10px rgba(212, 168, 67, 0.05)",
                  }
                : getCardStyle(isExpanded);

              return (
                <div
                  key={reading.id}
                  className="rounded-2xl overflow-hidden border transition-all duration-300 shadow-md animate-fade-in"
                  style={cardStyle}
                >
                  {/* Summary Card Header */}
                  <div
                    onClick={() => setExpandedReading(isExpanded ? null : reading.id)}
                    className="p-4 flex flex-col gap-2.5 cursor-pointer hover:bg-white/2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-sans text-[10px] text-white/35">
                        {formatDate(reading.createdAt)}
                      </span>
                      <div className="flex gap-1.5 items-center">
                        {isFateful && (
                          <span className="text-[9px] font-sans px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/30 text-amber-300 uppercase tracking-wider font-semibold">
                            👑 ĐỊNH MỆNH
                          </span>
                        )}
                        <span
                          className="text-[10px] font-sans px-2.5 py-0.5 rounded-full"
                          style={{
                            background: reading.ercChange >= 0 ? "rgba(16,185,129,0.1)" : "rgba(244,63,94,0.1)",
                            border: reading.ercChange >= 0 ? "1px solid rgba(16,185,129,0.25)" : "1px solid rgba(244,63,94,0.25)",
                            color: reading.ercChange >= 0 ? "#34d399" : "#fb7185",
                          }}
                        >
                          ERC: {reading.ercChange >= 0 ? "+" : ""}{reading.ercChange}
                        </span>
                      </div>
                    </div>

                    {activeTab === "vong" ? (
                      <div className="flex flex-col gap-1 text-left">
                        <h3 className="font-display text-xs text-amber-300 font-semibold tracking-wide flex items-center gap-1.5">
                          ✍️ Suy tư ngày {formatDate(reading.createdAt).split(" lúc ")[0]}
                        </h3>
                        <p className="font-body text-[11px] text-white/45 leading-relaxed italic truncate">
                          Lữ khách vấn: "{cleanQuestion}"
                        </p>
                      </div>
                    ) : (
                      <h3 className={`font-display text-sm leading-snug line-clamp-1 text-left ${isFateful ? "text-amber-100 font-semibold" : "text-white/90"}`}>
                        {cleanQuestion}
                      </h3>
                    )}

                    {/* Cards visual preview */}
                    <div className="flex gap-2 mt-1">
                      {reading.cards.map((card) => (
                        <div
                          key={card.position}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px]"
                          style={{
                            background: "rgba(255,255,255,0.03)",
                            border: `1px solid ${getClanColor(card.clan)}20`,
                            color: `${getClanColor(card.clan)}cc`,
                          }}
                        >
                          <span>{getCardEmoji(card.clan)}</span>
                          <span className="font-sans font-medium">{card.name}</span>
                          {card.isReversed && <span className="text-[9px] text-white/30">↺</span>}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Expanded commentary details */}
                  {isExpanded && (
                    <div
                      className="px-4 pb-4 pt-2 border-t"
                      style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.15)" }}
                    >
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-1">
                          <span className={`font-display text-[9px] tracking-widest uppercase ${activeTab === "vong" ? "text-amber-400" : "text-white/30"}`}>
                            {activeTab === "vong" ? "Tự sự của Vọng" : "Lời dẫn của Vọng"}
                          </span>
                          <p className={`font-body text-sm leading-relaxed whitespace-pre-line ${
                            activeTab === "vong" 
                              ? "text-amber-100/80 bg-amber-950/15 p-3 rounded-lg border border-amber-500/10 italic" 
                              : "text-white/65 italic"
                          }`}>
                            {activeTab === "vong" ? getVongReflection(reading) : reading.response}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination buttons */}
        {!loading && pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-3.5 py-1.5 rounded-xl border border-white/10 text-xs text-white/50 disabled:opacity-30 hover:text-white transition-all active:scale-95"
            >
              Trước
            </button>
            <span className="font-sans text-xs text-white/30">
              Trang {pagination.page} / {pagination.totalPages}
            </span>
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3.5 py-1.5 rounded-xl border border-white/10 text-xs text-white/50 disabled:opacity-30 hover:text-white transition-all active:scale-95"
            >
              Tiếp
            </button>
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
            { href: "/ban-do", icon: "🗺️", label: "Cõi Giới" },
            { href: "/thanh-dia", icon: "🔥", label: "Thánh Địa" },
            { href: "/chon-trai-bai", icon: "🔮", label: "Trải Bài" },
            { href: "/nhat-ky", icon: "📋", label: "Nhật Ký", active: true },
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
