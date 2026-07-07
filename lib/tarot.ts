export interface TarotCard {
  id: string; // e.g. 'the-fool'
  name: string; // Vietnamese App Name, e.g. 'Sứ Giả Chân Trần'
  englishName: string; // e.g. 'The Fool'
  type: 'major' | 'minor';
  clan: 'DiemHoa' | 'ThuyNguyet' | 'PhongKiem' | 'ThoKim' | 'VoThuong';
  rank: string; // '0'-'21' for major, 'Ace', '2'-'10', 'Page', 'Knight', 'Queen', 'King' for minor
  keywords: string[];
}

export interface DrawnCard {
  card: TarotCard;
  isReversed: boolean;
}

export interface DrawOptions {
  isFullMoon?: boolean;
  isNewMoon?: boolean;
  isMercuryRetrograde?: boolean;
}

// 22 Major Arcana Cards (Sứ Giả Lớn)
const majorArcana: TarotCard[] = [
  { id: 'the-fool', name: 'Sứ Giả Chân Trần', englishName: 'The Fool', type: 'major', clan: 'VoThuong', rank: '0', keywords: ['Khởi đầu', 'Tự do', 'Ngây thơ', 'Liều lĩnh'] },
  { id: 'the-magician', name: 'Sứ Giả Vô Vành', englishName: 'The Magician', type: 'major', clan: 'VoThuong', rank: '1', keywords: ['Sáng tạo', 'Ý chí', 'Tập trung', 'Hành động'] },
  { id: 'the-high-priestess', name: 'Sứ Giả Nữ Tư Tế', englishName: 'The High Priestess', type: 'major', clan: 'VoThuong', rank: '2', keywords: ['Trực giác', 'Bí mật', 'Tiềm thức', 'Tĩnh lặng'] },
  { id: 'the-empress', name: 'Sứ Giả Mẫu Nghi', englishName: 'The Empress', type: 'major', clan: 'VoThuong', rank: '3', keywords: ['Sinh sôi', 'Nuôi dưỡng', 'Thiên nhiên', 'Sung túc'] },
  { id: 'the-emperor', name: 'Sứ Giả Đá Nền', englishName: 'The Emperor', type: 'major', clan: 'VoThuong', rank: '4', keywords: ['Quyền lực', 'Trật tự', 'Kiểm soát', 'Xây dựng'] },
  { id: 'the-hierophant', name: 'Sứ Giả Giáo Hoàng', englishName: 'The Hierophant', type: 'major', clan: 'VoThuong', rank: '5', keywords: ['Truyền thống', 'Niềm tin', 'Giáo dục', 'Định hướng'] },
  { id: 'the-lovers', name: 'Sứ Giả Song Sinh Trái Tim', englishName: 'The Lovers', type: 'major', clan: 'VoThuong', rank: '6', keywords: ['Tình yêu', 'Ngã rẽ', 'Cộng hưởng', 'Lựa chọn'] },
  { id: 'the-chariot', name: 'Sứ Giả Chiến Xa', englishName: 'The Chariot', type: 'major', clan: 'VoThuong', rank: '7', keywords: ['Chiến thắng', 'Kiên trì', 'Ý chí', 'Kiểm soát cảm xúc'] },
  { id: 'strength', name: 'Sứ Giả Sức Mạnh', englishName: 'Strength', type: 'major', clan: 'VoThuong', rank: '8', keywords: ['Bản lĩnh', 'Nhẫn nại', 'Dịu dàng', 'Chế ngự'] },
  { id: 'the-hermit', name: 'Sứ Giả Đèn Lồng Cô Độc', englishName: 'The Hermit', type: 'major', clan: 'VoThuong', rank: '9', keywords: ['Tìm kiếm', 'Im lặng', 'Độc lập', 'Tự soi rọi'] },
  { id: 'wheel-of-fortune', name: 'Sứ Giả Vòng Xoay Số Phận', englishName: 'Wheel of Fortune', type: 'major', clan: 'VoThuong', rank: '10', keywords: ['Thay đổi', 'Vận mệnh', 'Chu kỳ', 'Cơ hội'] },
  { id: 'justice', name: 'Sứ Giả Công Lý', englishName: 'Justice', type: 'major', clan: 'VoThuong', rank: '11', keywords: ['Công bằng', 'Sự thật', 'Nhận quả', 'Cân bằng'] },
  { id: 'the-hanged-man', name: 'Sứ Giả Người Treo Ngược', englishName: 'The Hanged Man', type: 'major', clan: 'VoThuong', rank: '12', keywords: ['Từ bỏ', 'Góc nhìn mới', 'Trì hoãn', 'Chấp nhận'] },
  { id: 'death', name: 'Sứ Giả Cánh Cửa Khép Lại', englishName: 'Death', type: 'major', clan: 'VoThuong', rank: '13', keywords: ['Giải thoát', 'Kết thúc', 'Tái sinh', 'Chuyển biến'] },
  { id: 'temperance', name: 'Sứ Giả Tiết Độ', englishName: 'Temperance', type: 'major', clan: 'VoThuong', rank: '14', keywords: ['Cân bằng', 'Dòng chảy', 'Hòa hợp', 'Kiên nhẫn'] },
  { id: 'the-devil', name: 'Sứ Giả Dây Xích Tự Nguyện', englishName: 'The Devil', type: 'major', clan: 'VoThuong', rank: '15', keywords: ['Ràng buộc', 'Phụ thuộc', 'Bóng tối', 'Độc hại'] },
  { id: 'the-tower', name: 'Sứ Giả Ngọn Lửa Sụp Đổ', englishName: 'The Tower', type: 'major', clan: 'VoThuong', rank: '16', keywords: ['Đổ vỡ', 'Đột ngột', 'Giải phóng', 'Sự thật trần trụi'] },
  { id: 'the-star', name: 'Sứ Giả Ánh Sao Hy Vọng', englishName: 'The Star', type: 'major', clan: 'VoThuong', rank: '17', keywords: ['Hy vọng', 'Chữa lành', 'Bình yên', 'Mơ ước'] },
  { id: 'the-moon', name: 'Sứ Giả Ánh Trăng Ảo Ảnh', englishName: 'The Moon', type: 'major', clan: 'VoThuong', rank: '18', keywords: ['Ảo ảnh', 'Nỗi sợ', 'Mông lung', 'Trực giác'] },
  { id: 'the-sun', name: 'Sứ Giả Ánh Dương Rực Rỡ', englishName: 'The Sun', type: 'major', clan: 'VoThuong', rank: '19', keywords: ['Thành công', 'Vui vẻ', 'Ánh sáng', 'Rõ ràng'] },
  { id: 'judgement', name: 'Sứ Giả Phán Xét', englishName: 'Judgement', type: 'major', clan: 'VoThuong', rank: '20', keywords: ['Thức tỉnh', 'Đánh giá', 'Tiếng gọi', 'Giải phóng'] },
  { id: 'the-world', name: 'Sứ Giả Cõi Giới Trọn Vẹn', englishName: 'The World', type: 'major', clan: 'VoThuong', rank: '21', keywords: ['Trọn vẹn', 'Hoàn thành', 'Hội nhập', 'Thành tựu'] }
];

// Minor Arcana Generation Helpers
const suits = [
  { clan: 'DiemHoa' as const, nameVi: 'Diễm Hoả', englishName: 'Wands', element: 'Lửa' },
  { clan: 'ThuyNguyet' as const, nameVi: 'Thuỷ Nguyệt', englishName: 'Cups', element: 'Nước' },
  { clan: 'PhongKiem' as const, nameVi: 'Phong Kiếm', englishName: 'Swords', element: 'Khí' },
  { clan: 'ThoKim' as const, nameVi: 'Thổ Kim', englishName: 'Pentacles', element: 'Đất' }
];

const ranks = [
  { rank: 'Ace', nameVi: 'Sứ Giả Khởi Nguyên', englishName: 'Ace', keywords: ['Bắt đầu', 'Năng lượng mới', 'Hạt giống', 'Tiềm năng'] },
  { rank: '2', nameVi: 'Sứ Giả bậc 2', englishName: 'Two', keywords: ['Đồng điệu', 'Lựa chọn', 'Kết nối', 'Thăng bằng'] },
  { rank: '3', nameVi: 'Sứ Giả bậc 3', englishName: 'Three', keywords: ['Hợp tác', 'Mở rộng', 'Chúc mừng', 'Hành động đầu tiên'] },
  { rank: '4', nameVi: 'Sứ Giả bậc 4', englishName: 'Four', keywords: ['Ổn định', 'Trì hoãn', 'Bảo vệ', 'Nghỉ ngơi'] },
  { rank: '5', nameVi: 'Sứ Giả bậc 5', englishName: 'Five', keywords: ['Mất mát', 'Mâu thuẫn', 'Tranh đấu', 'Thay đổi khó khăn'] },
  { rank: '6', nameVi: 'Sứ Giả bậc 6', englishName: 'Six', keywords: ['Hài lòng', 'Quá khứ', 'Hòa hợp', 'Chia sẻ'] },
  { rank: '7', nameVi: 'Sứ Giả bậc 7', englishName: 'Seven', keywords: ['Đấu tranh', 'Kiên trì', 'Lựa chọn mập mờ', 'Kế hoạch'] },
  { rank: '8', nameVi: 'Sứ Giả bậc 8', englishName: 'Eight', keywords: ['Hành động nhanh', 'Bước đi', 'Chuyển dịch', 'Rời đi'] },
  { rank: '9', nameVi: 'Sứ Giả bậc 9', englishName: 'Nine', keywords: ['Lo lắng', 'Độc lập', 'Kiên cường', 'Đạt được mục tiêu'] },
  { rank: '10', nameVi: 'Sứ Giả bậc 10', englishName: 'Ten', keywords: ['Đầy đủ', 'Gia đình', 'Gánh nặng', 'Kết thúc chu kỳ'] },
  { rank: 'Page', nameVi: 'Học Trò', englishName: 'Page', keywords: ['Học hỏi', 'Tin nhắn', 'Sự háo hức', 'Tiềm năng chưa mài giũa'] },
  { rank: 'Knight', nameVi: 'Kỵ Sĩ', englishName: 'Knight', keywords: ['Hành động', 'Nồng nhiệt', 'Vội vã', 'Thử thách'] },
  { rank: 'Queen', nameVi: 'Hoàng Hậu', englishName: 'Queen', keywords: ['Nuôi dưỡng', 'Lý trí sâu sắc', 'Cảm xúc phong phú', 'Làm chủ'] },
  { rank: 'King', nameVi: 'Đức Vua', englishName: 'King', keywords: ['Quyền uy', 'Lãnh đạo', 'Ổn định', 'Thành tựu đỉnh cao'] }
];

const generateMinorArcana = (): TarotCard[] => {
  const minor: TarotCard[] = [];
  for (const suit of suits) {
    for (const r of ranks) {
      const id = `${r.englishName.toLowerCase()}-of-${suit.englishName.toLowerCase()}`;
      
      // Customize name formatting: Sứ Giả Khởi Nguyên Tộc Diễm Hoả (no comma for Ace), Sứ Giả bậc 2 Tộc Thuỷ Nguyệt, etc.
      let name = '';
      if (r.rank === 'Ace') {
        name = `Sứ Giả Khởi Nguyên Tộc ${suit.nameVi}`;
      } else {
        name = `${r.nameVi} Tộc ${suit.nameVi}`;
      }

      const englishName = `${r.englishName} of ${suit.englishName}`;

      minor.push({
        id,
        name,
        englishName,
        type: 'minor',
        clan: suit.clan,
        rank: r.rank,
        keywords: [...r.keywords, suit.element]
      });
    }
  }
  return minor;
};

// Complete Deck containing 78 cards
export const tarotDeck: TarotCard[] = [...majorArcana, ...generateMinorArcana()];

/**
 * Draws N unique cards randomly from the 78-card Tarot deck.
 * Supports weighting options for celestial / astronomical events:
 * - isFullMoon: +15% weight for Cups (Tộc Thuỷ Nguyệt)
 * - isNewMoon: +15% weight for Aces (Sứ Giả Khởi Nguyên)
 * - isMercuryRetrograde: 65% reversal rate (otherwise 30% default)
 */
export function drawCards(count: number, options: DrawOptions = {}): DrawnCard[] {
  if (count <= 0 || count > tarotDeck.length) {
    throw new Error(`Invalid card draw count. Must be between 1 and ${tarotDeck.length}`);
  }

  const drawn: DrawnCard[] = [];
  const availableDeck = [...tarotDeck];

  for (let i = 0; i < count; i++) {
    // 1. Calculate weights for remaining cards
    const weights = availableDeck.map(card => {
      let weight = 1.0;

      if (options.isFullMoon && card.clan === 'ThuyNguyet') {
        weight *= 1.15;
      }

      if (options.isNewMoon && card.rank === 'Ace') {
        weight *= 1.15;
      }

      return weight;
    });

    const totalWeight = weights.reduce((sum, w) => sum + w, 0);

    // 2. Select card based on weighted random selection
    let r = Math.random() * totalWeight;
    let selectedIndex = 0;

    for (let j = 0; j < weights.length; j++) {
      r -= weights[j];
      if (r <= 0) {
        selectedIndex = j;
        break;
      }
    }

    const card = availableDeck[selectedIndex];
    // Remove selected card from deck to avoid duplicates
    availableDeck.splice(selectedIndex, 1);

    // 3. Determine card orientation (Upright vs Reversed)
    // Default reversal probability is 30%. Mercury Retrograde increases it to 65%.
    const reversalProbability = options.isMercuryRetrograde ? 0.65 : 0.30;
    const isReversed = Math.random() < reversalProbability;

    drawn.push({
      card,
      isReversed
    });
  }

  return drawn;
}
