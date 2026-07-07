"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function KetQuaPage() {
  const router = useRouter();

  useEffect(() => {
    // Under the unified flow, the reading and results are shown on /trai-bai.
    // We redirect any direct visits to /chon-trai-bai to start a new reading.
    router.replace("/chon-trai-bai");
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-3">
      <span className="text-3xl animate-spin text-purple-400">✦</span>
      <span className="font-display text-[9px] text-white/35 tracking-widest uppercase">
        Đang chuyển hướng...
      </span>
    </div>
  );
}
