/**
 * Phát giọng nói bằng tiếng Việt.
 * Ưu tiên sử dụng API phát âm từ Backend để đảm bảo tất cả thiết bị khách hàng đều nghe được
 * giọng đọc tự nhiên chuẩn tiếng Việt (không cần cài đặt gì thêm).
 * Có fallback về Web Speech API (SpeechSynthesis) nếu phát âm qua API bị lỗi.
 */
export function speakText(text: string) {
  if (typeof window === "undefined") return;

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

    // 3. Nạp đường dẫn API và phát âm (Mặc định dùng giọng nam 'male' cho nhân vật Vọng)
    audio.src = `/api/tarot/tts?text=${encodeURIComponent(text)}&voice=male`;
    
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn("Audio play failed, falling back to Web Speech API:", err);
        speakFallback(text);
      });
    }
  } catch (error) {
    console.error("speakText failed:", error);
    speakFallback(text);
  }
}

/**
 * Dừng phát âm ngay lập tức
 */
export function stopSpeaking() {
  if (typeof window === "undefined") return;

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
    utterance.rate = 0.85;
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
