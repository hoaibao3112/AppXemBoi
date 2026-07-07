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

export default function NhatKyPage() {
  const router = useRouter();
  const [readings, setReadings] = useState<Reading[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [clanFilter, setClanFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedReading, setExpandedReading] = useState<string | null>(null);

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

  return (
    <div className="relative flex flex-col min-h-screen">
      {/* Background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 10%, rgba(139,92,246,0.12) 0%, transparent 50%)",
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
              return (
                <div
                  key={reading.id}
                  className="rounded-2xl overflow-hidden border transition-all duration-300"
                  style={{
                    background: "rgba(15,22,41,0.7)",
                    borderColor: isExpanded ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.06)",
                  }}
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

                    <h3 className="font-display text-sm text-white/90 leading-snug line-clamp-1">
                      {reading.question}
                    </h3>

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
                          <span className="font-display text-[9px] text-white/30 tracking-widest uppercase">
                            Lời dẫn của Vọng
                          </span>
                          <p className="font-body text-sm text-white/65 italic leading-relaxed whitespace-pre-line">
                            {reading.response}
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
            { href: "/", icon: "🗺️", label: "Map" },
            { href: "/chon-trai-bai", icon: "📖", label: "Bói" },
            { href: "/nhat-ky", icon: "📋", label: "Journal", active: true },
            { href: "/cai-dat", icon: "⚙️", label: "Cài đặt" },
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
