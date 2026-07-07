import { DrawnCard } from './tarot';

export function detectCombo(drawn: DrawnCard[]): { name: string; description: string } | null {
  const ids = drawn.map(d => d.card.id);

  // Tro Tàn Chữa Lành: The Tower + The Star
  if (ids.includes('the-tower') && ids.includes('the-star')) {
    return {
      name: 'Tro Tàn Chữa Lành',
      description: 'Đổ vỡ không phải để huỷ diệt, mà là khoảng trống bắt buộc phải có để ánh sao rọi vào. Sứ Giả Ngọn Lửa Sụp Đổ vừa dọn đi đống đổ nát cũ, thì ngay lập tức Sứ Giả Ánh Sao Hy Vọng đã thắp đèn bước tới.'
    };
  }

  // Sợi Dây Giải Thoát: The Devil + Death
  if (ids.includes('the-devil') && ids.includes('death')) {
    return {
      name: 'Sợi Dây Giải Thoát',
      description: 'Một bên là sợi xích vô hình giữ chân ngươi trong bóng tối, một bên là lưỡi hái sẵn sàng cắt đứt tất cả. Đã đến lúc tự tháo xích bước đi, đừng ngoảnh đầu nhìn lại.'
    };
  }

  // Tiếng Gọi Linh Hồn: The Lovers + 2 of Cups
  if (ids.includes('the-lovers') && ids.includes('two-of-cups')) {
    return {
      name: 'Tiếng Gọi Linh Hồn',
      description: 'Khoảnh khắc hai linh hồn nhận ra nhau giữa vạn người. Đừng để nỗi sợ của lý trí dập tắt sự cộng hưởng hiếm hoi này.'
    };
  }

  // Cơn Bão Lửa: Page of Wands + Knight of Wands
  if (ids.includes('page-of-wands') && ids.includes('knight-of-wands')) {
    return {
      name: 'Cơn Bão Lửa',
      description: 'Năng lượng lửa cực mạnh, nồng nhiệt nhưng bốc đồng và thiếu kiên nhẫn. Hãy cẩn thận kẻo bỏng.'
    };
  }

  // Bức Tường Lý Trí: Queen/King of Swords + 9 of Swords
  if (ids.includes('nine-of-swords') && (ids.includes('queen-of-swords') || ids.includes('king-of-swords'))) {
    return {
      name: 'Bức Tường Lý Trí',
      description: 'Sự tự cô lập, suy nghĩ quá nhiều gây mất ngủ. Gió lạnh của lý trí đang tự giam hãm và làm tổn thương cõi lòng ngươi.'
    };
  }

  // Vườn Xuân Đơm Hoa: The Empress + 10 of Pentacles
  if (ids.includes('the-empress') && ids.includes('ten-of-pentacles')) {
    return {
      name: 'Vườn Xuân Đơm Hoa',
      description: 'Tình cảm cam kết lâu bền, vững chãi đi đến sự bình yên, sum vầy và sung túc gia đạo.'
    };
  }

  return null;
}
