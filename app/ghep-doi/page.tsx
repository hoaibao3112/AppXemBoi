// Applying pattern from: nextjs-frontend-best-practices
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { tarotDeck } from "@/lib/tarot";

interface CompatibilityCheck {
  id: string;
  partnerName: string;
  partnerClan: string;
  partnerSoulCard: string;
  relationshipBranch: "harmony" | "tension" | "mirror" | "neutral";
  witnessCard: string;
  resultText: string;
  createdAt: string;
}

export default function CompatibilityPage() {
  const router = useRouter();
  const [partnerName, setPartnerName] = useState("");
  const [partnerBirthDate, setPartnerBirthDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // History of checks
  const [history, setHistory] = useState<CompatibilityCheck[]>([]);
  const [activeCheck, setActiveCheck] = useState<CompatibilityCheck | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Fetch past checks on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/dang-nhap");
      return;
    }

    fetch("/api/compatibility/check", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.checks) {
          setHistory(data.checks);
        }
      })
      .catch(console.error);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerName.trim() || !partnerBirthDate) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/compatibility/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ partnerName, partnerBirthDate }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể thực hiện ghép đôi.");
      }

      setActiveCheck(data.check);
      setHistory((prev) => [data.check, ...prev]);
      
      // Clear inputs
      setPartnerName("");
      setPartnerBirthDate("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getBranchLabel = (branch: string) => {
    const map = {
      harmony: { label: "Đồng Điệu (Tương Sinh) 🌟", color: "text-emerald-400" },
      tension: { label: "Đối Nghịch (Tương Khắc) ⚡", color: "text-rose-400" },
      mirror: { label: "Soi Gương (Cùng Tộc) 🔮", color: "text-purple-400" },
      neutral: { label: "Cân Bằng (Trung Tính) ⏳", color: "text-amber-400" },
    };
    return map[branch as keyof typeof map] || { label: "Trung Tính", color: "text-white" };
  };

  const getClanNameVi = (clan: string) => {
    const map = {
      DiemHoa: "Diễm Hỏa 🔥",
      ThuyNguyet: "Thủy Nguyệt 💧",
      PhongKiem: "Phong Kiếm 🌪️",
      ThoKim: "Thổ Kim ⛰️",
      VoThuong: "Vô Thường 🌫️",
    };
    return map[clan as keyof typeof map] || clan;
  };

  // HTML5 Canvas sharing image exporter
  const exportShareImage = () => {
    if (!activeCheck || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Load fonts or standard styling
    canvas.width = 800;
    canvas.height = 1000;

    // Draw background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 1000);
    grad.addColorStop(0, "#0b0c16");
    grad.addColorStop(0.5, "#130924");
    grad.addColorStop(1, "#070312");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 800, 1000);

    // Decorative sương mù swirls
    ctx.strokeStyle = "rgba(168, 85, 247, 0.08)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(400, 300, 200, 0, Math.PI * 2);
    ctx.stroke();

    // App Title
    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 22px serif";
    ctx.textAlign = "center";
    ctx.fillText("CÕI VÔ THƯỜNG", 400, 80);

    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = "12px sans-serif";
    ctx.fillText("— TƯƠNG HỢP TÂM CAN —", 400, 110);

    // Names and Clans
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 26px sans-serif";
    ctx.fillText("Ngươi", 250, 220);
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.font = "14px sans-serif";
    ctx.fillText("Clan lữ khách", 250, 250);

    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 28px serif";
    ctx.fillText("vs", 400, 230);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 26px sans-serif";
    ctx.fillText(activeCheck.partnerName, 550, 220);
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.font = "14px sans-serif";
    ctx.fillText(`Tộc ${getClanNameVi(activeCheck.partnerClan)}`, 550, 250);

    // Branch Result Title
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.font = "11px sans-serif";
    ctx.fillText("NHÁNH LIÊN KẾT NGUYÊN TỐ", 400, 340);

    const branchInfo = getBranchLabel(activeCheck.relationshipBranch);
    ctx.fillStyle = branchInfo.color.includes("emerald") ? "#34d399" : branchInfo.color.includes("rose") ? "#f43f5e" : branchInfo.color.includes("purple") ? "#c084fc" : "#fbbf24";
    ctx.font = "bold 28px sans-serif";
    ctx.fillText(branchInfo.label.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, ""), 400, 380);

    // Witness Card (Sứ Giả Chứng Giám)
    const witnessCardId = activeCheck.witnessCard.split("|")[0];
    const witnessCardDetails = tarotDeck.find((c) => c.id === witnessCardId);
    const orientationLabel = activeCheck.witnessCard.split("|")[1] === "reversed" ? "Ngược" : "Xuôi";
    const witnessName = witnessCardDetails ? `${witnessCardDetails.name} (${orientationLabel})` : activeCheck.witnessCard;

    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.font = "11px sans-serif";
    ctx.fillText("SỨ GIẢ CHỨNG GIÁM MỐI DUYÊN", 400, 470);

    ctx.fillStyle = "#fbbf24";
    ctx.font = "italic bold 20px serif";
    ctx.fillText(`Lá bài: ${witnessName}`, 400, 505);

    // Box for Vọng's commentary
    ctx.fillStyle = "rgba(255, 255, 255, 0.02)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(80, 560, 640, 280, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText("LỜI THÌ THẦM CỦA VỌNG", 400, 600);

    // Text wrapping helper
    const text = `"${activeCheck.resultText}"`;
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "italic 16px serif";
    
    // Draw wrapped commentary lines
    const words = text.split(" ");
    let line = "";
    let y = 640;
    const maxWidth = 580;
    const lineHeight = 28;

    for (let n = 0; n < words.length; n++) {
      let testLine = line + words[n] + " ";
      let metrics = ctx.measureText(testLine);
      let testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, 400, y);
        line = words[n] + " ";
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 400, y);

    // Branding / QR Code simulation
    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    ctx.font = "11px sans-serif";
    ctx.fillText("Quét mã ghé thăm Cõi Vô Thường", 400, 915);
    ctx.fillText("coivothuong.vn", 400, 935);

    // Trigger download
    const link = document.createElement("a");
    link.download = `ghep-doi-${activeCheck.partnerName}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#070312] text-white flex flex-col relative overflow-x-hidden font-sans pb-28">
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-950/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-950/20 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <button onClick={() => router.back()} className="text-white/60 hover:text-white transition-all text-sm font-sans flex items-center gap-1.5">
          ← Trở về
        </button>
        <h1 className="font-display text-base font-semibold tracking-wider text-amber-400">TƯƠNG HỢP TÂM CAN</h1>
        <div className="w-14" /> {/* balance layout */}
      </header>

      {/* Canvas for image rendering (hidden) */}
      <canvas ref={canvasRef} className="hidden" />

      <main className="flex-1 w-full max-w-md mx-auto px-4 mt-5 flex flex-col gap-6">
        
        {/* Dynamic State Switcher */}
        {!activeCheck ? (
          <>
            {/* Input Form */}
            <div className="p-5 rounded-2xl bg-white/3 border border-white/5 shadow-2xl flex flex-col gap-4">
              <div className="text-center flex flex-col gap-1">
                <h3 className="font-display text-sm font-bold tracking-wide text-white/90">Ghép Đôi Tộc Bản Mệnh</h3>
                <p className="text-[11px] text-white/40 leading-snug">
                  Nhập tên và ngày sinh của người ấy để đối chiếu độ hòa hợp nguyên tố và rút sứ giả chứng giám.
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 text-center">
                  ⚠️ {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[10px] text-white/50 tracking-wider uppercase font-semibold">Tên người ấy</label>
                  <input
                    type="text"
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    placeholder="Nhập tên đối phương..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-purple-500/40 text-sm transition-all"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[10px] text-white/50 tracking-wider uppercase font-semibold">Ngày sinh người ấy</label>
                  <input
                    type="date"
                    value={partnerBirthDate}
                    onChange={(e) => setPartnerBirthDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500/40 text-sm transition-all"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 mt-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-sans text-xs font-bold uppercase tracking-wider shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                  {loading ? "Đang gọi sương mù..." : "Ghép Đôi Tâm Can 🔮"}
                </button>
              </form>
            </div>

            {/* History Checks */}
            {history.length > 0 && (
              <div className="flex flex-col gap-2.5 text-left">
                <h4 className="font-display text-xs text-white/50 tracking-widest uppercase ml-1">Lịch sử tương hợp</h4>
                <div className="flex flex-col gap-3">
                  {history.map((check) => (
                    <div
                      key={check.id}
                      onClick={() => setActiveCheck(check)}
                      className="p-4 rounded-xl bg-white/2 border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all cursor-pointer flex justify-between items-center"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-white/80">{check.partnerName}</span>
                        <span className="text-[10px] text-white/40">Tộc {getClanNameVi(check.partnerClan)}</span>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-[10px] font-semibold ${getBranchLabel(check.relationshipBranch).color}`}>
                          {getBranchLabel(check.relationshipBranch).label.split(" ")[0]}
                        </span>
                        <span className="text-[9px] text-white/20">{new Date(check.createdAt).toLocaleDateString("vi-VN")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Result View */
          <div className="flex flex-col gap-5 text-center animate-fade-in">
            <div className="p-5 rounded-2xl bg-white/3 border border-white/5 shadow-2xl flex flex-col gap-4 items-center">
              
              <div className="w-full flex justify-between items-center text-xs">
                <button
                  onClick={() => setActiveCheck(null)}
                  className="text-white/40 hover:text-white transition-all py-1 px-2.5 rounded border border-white/5 bg-white/2"
                >
                  ✕ Đóng kết quả
                </button>
                <button
                  onClick={exportShareImage}
                  className="text-amber-300 hover:text-amber-200 transition-all font-semibold py-1 px-2.5 rounded border border-amber-500/10 bg-amber-500/5"
                >
                  📥 Xuất ảnh chia sẻ
                </button>
              </div>

              {/* Clans Head-to-Head */}
              <div className="flex justify-between items-center w-full max-w-[280px] mt-4">
                <div className="flex flex-col items-center gap-1.5">
                  <span className="w-12 h-12 rounded-full border border-purple-500/20 bg-purple-950/20 flex items-center justify-center text-xl shadow-inner">👤</span>
                  <span className="text-xs font-bold text-white/95">Ngươi</span>
                  <span className="text-[9px] text-white/40">Tộc của ngươi</span>
                </div>
                
                <span className="font-serif italic text-lg text-amber-500/50">vs</span>
                
                <div className="flex flex-col items-center gap-1.5">
                  <span className="w-12 h-12 rounded-full border border-purple-500/20 bg-purple-950/20 flex items-center justify-center text-xl shadow-inner">👁️</span>
                  <span className="text-xs font-bold text-white/95">{activeCheck.partnerName}</span>
                  <span className="text-[9px] text-white/40">{getClanNameVi(activeCheck.partnerClan)}</span>
                </div>
              </div>

              {/* Branch Result */}
              <div className="flex flex-col gap-1.5 items-center mt-3 pt-3 border-t border-white/5 w-full">
                <span className="text-[9px] text-white/30 tracking-widest uppercase">Nhánh Liên Kết Nguyên Tố</span>
                <span className={`text-base font-bold tracking-wide ${getBranchLabel(activeCheck.relationshipBranch).color}`}>
                  {getBranchLabel(activeCheck.relationshipBranch).label}
                </span>
              </div>

              {/* Sứ giả chứng giám */}
              <div className="flex flex-col gap-1.5 items-center mt-2 w-full">
                <span className="text-[9px] text-white/30 tracking-widest uppercase">Sứ Giả Chứng Giám Mối Duyên</span>
                <span className="text-xs font-serif italic text-amber-300 font-semibold">
                  {(() => {
                    const cardId = activeCheck.witnessCard.split("|")[0];
                    const card = tarotDeck.find((c) => c.id === cardId);
                    const orient = activeCheck.witnessCard.split("|")[1] === "reversed" ? "Ngược" : "Xuôi";
                    return card ? `${card.name} (${orient})` : activeCheck.witnessCard;
                  })()}
                </span>
              </div>

              {/* Commentary */}
              <div className="mt-4 p-4 rounded-xl bg-black/35 border border-white/5 text-left">
                <span className="text-[8px] text-amber-400 font-display tracking-widest uppercase font-semibold">Lời Thì Thầm Của Vọng</span>
                <p className="font-serif text-sm italic leading-relaxed text-amber-100/90 mt-2 whitespace-pre-line">
                  "{activeCheck.resultText}"
                </p>
              </div>

            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/80 backdrop-blur-md"
        style={{
          borderTop: "1px solid rgba(139,92,246,0.2)",
        }}
      >
        <div className="flex items-center justify-around py-3 px-4">
          {[
            { href: "/ban-do", icon: "🗺️", label: "Cõi Giới" },
            { href: "/thanh-dia", icon: "🔥", label: "Thánh Địa" },
            { href: "/chon-trai-bai", icon: "🔮", label: "Trải Bài" },
            { href: "/ghep-doi", icon: "💖", label: "Ghép Đôi", active: true },
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
