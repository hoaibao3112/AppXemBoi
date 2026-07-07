"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DangNhapPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const payload = isLogin
        ? { email, password }
        : { email, password, name: name || undefined, birthDate: birthDate || undefined };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Đã xảy ra lỗi. Vui lòng thử lại.");
      }

      // Save token and user details to localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (isLogin) {
        router.push("/");
      } else {
        // First-time register: go to ceremony screen /chao-don
        router.push("/chao-don");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col min-h-screen items-center justify-center p-4">
      {/* Background orbs */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(139,92,246,0.15) 0%, transparent 60%), radial-gradient(ellipse at 50% 80%, rgba(6,182,212,0.1) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 w-full max-w-md flex flex-col gap-6">
        {/* Title */}
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="text-4xl animate-pulse">👁</span>
          <h1
            className="font-display text-2xl font-bold tracking-widest text-glow-gold"
            style={{
              background: "linear-gradient(135deg, #d4a843 0%, #f5e06e 40%, #c8922d 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            CÕI VÔ THƯỜNG
          </h1>
          <p className="font-body text-sm text-white/45 italic">
            "Bước qua ranh giới sương mù, đối diện với vận mệnh của chính mình."
          </p>
        </div>

        {/* Card Form */}
        <div className="glass rounded-2xl p-6 flex flex-col gap-5">
          {/* Tab buttons */}
          <div className="flex bg-white/5 rounded-xl p-1 border border-white/5">
            <button
              onClick={() => {
                setIsLogin(true);
                setError("");
              }}
              className="flex-1 py-2 text-xs font-display tracking-widest rounded-lg transition-all"
              style={{
                background: isLogin ? "rgba(139,92,246,0.2)" : "transparent",
                color: isLogin ? "#c4b5fd" : "rgba(255,255,255,0.4)",
                border: isLogin ? "1px solid rgba(139,92,246,0.3)" : "1px solid transparent",
              }}
            >
              ĐĂNG NHẬP
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError("");
              }}
              className="flex-1 py-2 text-xs font-display tracking-widest rounded-lg transition-all"
              style={{
                background: !isLogin ? "rgba(139,92,246,0.2)" : "transparent",
                color: !isLogin ? "#c4b5fd" : "rgba(255,255,255,0.4)",
                border: !isLogin ? "1px solid rgba(139,92,246,0.3)" : "1px solid transparent",
              }}
            >
              KHỞI TẠO
            </button>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 text-xs text-rose-400 text-center font-sans">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {!isLogin && (
              <div className="flex flex-col gap-1.5">
                <label className="font-display text-[10px] tracking-wider text-white/50 uppercase pl-1">
                  Danh Tính (Tên)
                </label>
                <input
                  type="text"
                  placeholder="Nhập danh xưng của bạn"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white/80 focus:outline-none focus:border-purple-500/50 transition-colors"
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="font-display text-[10px] tracking-wider text-white/50 uppercase pl-1">
                Linh Thư (Email)
              </label>
              <input
                type="email"
                required
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white/80 focus:outline-none focus:border-purple-500/50 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-display text-[10px] tracking-wider text-white/50 uppercase pl-1">
                Mật Khóa (Password)
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white/80 focus:outline-none focus:border-purple-500/50 transition-colors"
              />
            </div>

            {!isLogin && (
              <div className="flex flex-col gap-1.5">
                <label className="font-display text-[10px] tracking-wider text-white/50 uppercase pl-1">
                  Ngày Sinh Nhật (Optional)
                </label>
                <input
                  type="date"
                  placeholder="YYYY-MM-DD"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white/80 focus:outline-none focus:border-purple-500/50 transition-colors"
                />
                <span className="text-[9px] font-sans text-white/30 pl-1">
                  Dùng để tính Thẻ Mệnh (Soul Card) của bạn sau này.
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-3.5 rounded-xl font-display text-xs tracking-[0.2em] font-semibold text-white transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg, rgba(139,92,246,0.8), rgba(109,40,217,0.9))",
                border: "1px solid rgba(167,139,250,0.4)",
                boxShadow: "0 0 20px rgba(139,92,246,0.3)",
              }}
            >
              {loading ? "ĐANG TIẾN VÀO..." : isLogin ? "TIẾN VÀO CÕI SƯƠNG" : "KHỞI TẠO BẢN MỆNH"}
            </button>
          </form>
        </div>

        <Link
          href="/"
          className="text-center font-sans text-xs text-white/35 hover:text-white/60 transition-colors"
        >
          Quay lại Trang Chủ
        </Link>
      </div>
    </div>
  );
}
