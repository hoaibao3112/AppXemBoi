/**
 * Phát giọng nói bằng tiếng Việt.
 * Ưu tiên sử dụng API phát âm từ Backend để đảm bảo tất cả thiết bị khách hàng đều nghe được
 * giọng đọc tự nhiên chuẩn tiếng Việt (không cần cài đặt gì thêm).
 * Có fallback về Web Speech API (SpeechSynthesis) nếu phát âm qua API bị lỗi.
 */
export function speakText(text: string) {
  if (typeof window === "undefined") return;

  // Tăng sequence ID để đánh dấu lượt phát mới
  const currentSeqId = ((window as any)._speechSeqId || 0) + 1;
  (window as any)._speechSeqId = currentSeqId;

  try {
    // 1. Hủy bất kỳ giọng đọc SpeechSynthesis hoặc Audio đang phát
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    const globalAudio = (window as any)._globalAudio;
    if (globalAudio) {
      globalAudio.pause();
    }

    // 2. Tạo hoặc sử dụng lại phần tử Audio toàn cục
    let audio = (window as any)._globalAudio;
    if (!audio) {
      audio = new Audio();
      (window as any)._globalAudio = audio;
    }

    // 3. Nạp đường dẫn API và phát âm dựa theo cấu hình cài đặt
    let voice = typeof window !== 'undefined' ? (localStorage.getItem("settings_vongVoice") || "male") : "male";
    const speed = typeof window !== 'undefined' ? Number(localStorage.getItem("settings_vongSpeed") || "1.0") : 1.0;

    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          const erc = parsed.erc || 0;
          if (erc >= 30) {
            voice = "female";
          } else if (erc <= -30) {
            voice = "male";
          }
        } catch (e) {}
      }
    }

    audio.src = `/api/tarot/tts?text=${encodeURIComponent(text)}&voice=${voice}`;
    audio.playbackRate = speed;
    
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err: any) => {
        // Nếu chỉ là lỗi ngắt do lượt phát mới đè lên (AbortError), không cần chạy fallback
        if (err.name === "AbortError") return;
        
        // Chỉ chạy fallback nếu đây vẫn là lượt phát mới nhất
        if ((window as any)._speechSeqId === currentSeqId) {
          console.warn("Audio play failed, falling back to Web Speech API:", err);
          speakFallback(text);
        }
      });
    }
  } catch (error) {
    console.error("speakText failed:", error);
    if ((window as any)._speechSeqId === currentSeqId) {
      speakFallback(text);
    }
  }
}

/**
 * Dừng phát âm ngay lập tức
 */
export function stopSpeaking() {
  if (typeof window === "undefined") return;

  // Hủy sequence ID cũ để không cho phép bất kỳ callback nào kích hoạt fallback nữa
  (window as any)._speechSeqId = ((window as any)._speechSeqId || 0) + 1;

  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }

  const globalAudio = (window as any)._globalAudio;
  if (globalAudio) {
    globalAudio.pause();
  }
}

// Fallback sử dụng tính năng Text-to-Speech của trình duyệt
function speakFallback(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  try {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "vi-VN";
    const speed = typeof window !== 'undefined' ? Number(localStorage.getItem("settings_vongSpeed") || "1.0") : 1.0;
    utterance.rate = speed * 0.85; // Scale speed slightly for speech synthesis default speed
    utterance.pitch = 0.85;

    // Tìm giọng đọc tiếng Việt nếu có sẵn
    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find(v => v.lang.toLowerCase().includes("vi"));
    if (viVoice) {
      utterance.voice = viVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.error("SpeechSynthesis fallback failed:", err);
  }
}
