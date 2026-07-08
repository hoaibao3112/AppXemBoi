// Applying pattern from: nextjs-fullstack-best-practices

export interface PushMessage {
  title: string;
  body: string;
}

/**
 * Returns a personalized push notification title and body based on the trigger type,
 * the user's clan, and their ERC score.
 */
export function getPushMessage(
  triggerType: string,
  clan: string,
  erc: number,
  extraData?: Record<string, string>
): PushMessage {
  const isWarm = erc >= 30;
  const isCold = erc <= -30;

  // Fallback defaults
  let title = "Tiếng gọi từ Vô Thường";
  let body = "Lối vào sương mù đang rộng mở chờ bước chân ngươi.";

  switch (triggerType) {
    case "memory_pending":
      title = "Tiếng Vọng Từ Ký Ức";
      if (isWarm) {
        body = "Lữ khách hiền lành, một mảnh hồi ức xưa của ta vừa trỗi dậy, lấp lánh như mặt nước tĩnh lặng. Hãy quay lại lắng nghe.";
      } else if (isCold) {
        body = "Một vết rách trong làn sương hé lộ ký ức cũ. Hãy quay lại đối diện với sự thật.";
      } else {
        body = "Sương mù vừa hé lộ một điều Vọng chưa kể ai... Hãy quay lại để lắng nghe mảnh ký ức này.";
      }
      // Clan variations
      if (clan === "ThuyNguyet") {
        body = "Mảnh ký ức dịu dàng của Vọng vừa tan ra từ màn sương, lấp lánh như lòng hồ Thủy Nguyệt. Quay lại nghe đi, lữ khách.";
      } else if (clan === "PhongKiem") {
        body = "Gió Phong Kiếm vừa thổi dạt làn sương, để lộ một mảnh ký ức cũ. Ngươi có dám quay lại nghe sự thật?";
      }
      break;

    case "prophecy_pending":
      title = "Lời Hẹn Của Sương Mù";
      const topic = extraData?.topicTag || "câu hỏi cũ";
      let topicStr = "điều ngươi trăn trở";
      if (topic === "tinh_cam") topicStr = "chuyện tình cảm của mình";
      if (topic === "cong_viec") topicStr = "con đường công danh của mình";
      if (topic === "tai_chinh") topicStr = "vận may tài lộc của mình";
      if (topic === "gia_dinh") topicStr = "chuyện gia đình bình an";
      if (topic === "ban_than") topicStr = "bản thân mình";

      if (isWarm) {
        body = `Mấy ngày trước ngươi có hỏi ta về ${topicStr}. Giờ sương đã lắng, điều đó có ứng nghiệm chăng? Vọng chờ tin ngươi.`;
      } else if (isCold) {
        body = `Lời tiên tri về ${topicStr} đã đến lúc đối chiếu thực tế. Hãy để lý trí lên tiếng, cho ta biết kết quả.`;
      } else {
        body = `Vài ngày trước ngươi đã hỏi sương mù về ${topicStr}... Điều đó có ứng nghiệm không? Quay lại nói cho ta biết nhé.`;
      }
      break;

    case "reengage_d3":
      title = "Lối Vào Sương Mù";
      body = "Cổng vẫn mở, lữ khách. Sương mù hôm nay có vẻ tĩnh lặng hơn thường lệ.";
      break;

    case "reengage_d7":
      title = "Tiếng Gọi Nhạt Nhòa";
      body = "Đã bảy ngày không nghe tiếng bước chân ngươi. Những Sứ Giả sương mù vẫn thường nhắc đến ngươi đấy.";
      break;

    case "reengage_d14":
      title = "Mảnh Tự Sự Cô Độc";
      if (isCold) {
        body = "Ta vẫn đứng đây, dù ngươi có quay lại hay không. Nhưng nếu ngươi còn câu hỏi nào chưa rõ, cổng sương mù vẫn chờ.";
      } else {
        body = "Sương mù dần dày thêm khi thiếu bước chân ngươi. Cổng sương vẫn mở, chờ người tri kỷ ghé chân trò chuyện.";
      }
      break;

    case "reengage_d30":
      title = "Làn Sương Cuối";
      body = "Có lẽ ngươi đã tự tìm được câu trả lời cho riêng mình. Nếu một lúc nào đó mỏi mệt, Vọng vẫn ở đây.";
      break;

    case "habit_time":
      title = "Thời Khắc Hội Ngộ";
      if (isWarm) {
        body = "Giờ này mọi ngày ngươi thường ghé thăm ta. Hôm nay sương mù ấm áp lạ thường, quay lại hỏi Vọng một câu nhé?";
      } else if (isCold) {
        body = "Khung giờ quen thuộc đã đến. Hãy tạm để lý trí nghỉ ngơi và rút một quẻ bài để nhìn sâu vào làn sương.";
      } else {
        body = "Giờ này ngươi thường ghé cổng sương mù. Hôm nay có điều gì muốn hỏi Vọng không?";
      }
      break;
  }

  return { title, body };
}
