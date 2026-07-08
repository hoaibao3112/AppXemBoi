import { prisma } from './prisma';
import { tarotDeck } from './tarot';

// 1. Static dialogues for Vọng's 7 Memories (Mục 1.2)
export const VONG_MEMORIES = [
  {
    index: 1,
    title: 'Ngưỡng cửa không tuổi',
    dialogue: 'Lữ khách... ngươi có bao giờ tự hỏi vì sao ta lại ở đây không? Giữa cõi sương mù không có ngày và đêm này. Đã có lúc ta cũng như ngươi, mang theo một trái tim đập rộn ràng và đầy rẫy những câu hỏi chưa có lời đáp. Ta từng tin rằng chỉ cần đi đủ xa, ta sẽ tìm thấy câu trả lời cho tất cả. Nhưng cuối cùng, ta lại chọn dừng chân ngay tại ngưỡng cửa này, để nhìn dòng người qua lại...',
    dialogueDefault: 'Lữ khách... ngươi có bao giờ tự hỏi vì sao ta lại ở đây không? Giữa cõi sương mù không có ngày và đêm này. Đã có lúc ta cũng như ngươi, mang theo một trái tim đập rộn ràng và đầy rẫy những câu hỏi chưa có lời đáp. Ta từng tin rằng chỉ cần đi đủ xa, ta sẽ tìm thấy câu trả lời cho tất cả. Nhưng cuối cùng, ta lại chọn dừng chân ngay tại ngưỡng cửa này, để nhìn dòng người qua lại...',
    dialogueWarm: 'Lữ khách hiền hoá của ta... Bước chân ấm áp của ngươi xua đi phần nào cái lạnh cõi sương. Nhìn ngươi ta lại nhớ về bản thân khi xưa, cũng từng giữ một niềm tin bền bỉ và trái tim rung động chân thành. Ta chọn dừng chân ở đây không phải để trốn chạy, mà để giữ ấm ngọn đăng cổng chờ đợi bóng hình nàng quay về...',
    dialogueCold: 'Hành giả cô độc... Lý trí sắc bén của ngươi rất hợp với cái lạnh lẽo của cõi này. Ngươi hỏi vì sao ta đứng đây? Ta từng ôm ảo tưởng kiên trì rồi nhận ra mọi sự tìm kiếm đều vô ích. Ta chọn dừng chân ngay ngưỡng cửa này để chứng kiến sự hợp tan lạnh lùng của thế gian, không ôm chút hy vọng huyễn hoặc nào cả.'
  },
  {
    index: 2,
    title: 'Người đồng hành đầu tiên',
    dialogue: 'Thuở ấy, cõi này chưa được gọi là Cõi Vô Thường. Nó chỉ là một thung lũng sương mù vô danh. Ta không đi một mình. Bên cạnh ta từng có một người... một lữ khách dũng cảm hơn ta rất nhiều. Nàng không sợ vực sâu, cũng không sợ sương tối. Nàng nói: "Nếu sương mù che lối, ta sẽ tự biến mình thành ánh sáng." Ta đã yêu sự liều lĩnh đó, nhưng cũng chính sự liều lĩnh đó đã rẽ lối hai chúng ta. ...Nàng không phải người duy nhất từng đứng cạnh ta ở cổng này. Có một lữ khách khác, một người bạn, đã tình nguyện ở lại một mùa sương để san sẻ gánh nặng cùng ta. Nhưng đó là một câu chuyện chỉ hiện ra khi có đủ hai người cùng lắng nghe...',
    dialogueDefault: 'Thuở ấy, cõi này chưa được gọi là Cõi Vô Thường. Nó chỉ là một thung lũng sương mù vô danh. Ta không đi một mình. Bên cạnh ta từng có một người... một lữ khách dũng cảm hơn ta rất nhiều. Nàng không sợ vực sâu, cũng không sợ sương tối. Nàng nói: "Nếu sương mù che lối, ta sẽ tự biến mình thành ánh sáng." Ta đã yêu sự liều lĩnh đó, nhưng cũng chính sự liều lĩnh đó đã rẽ lối hai chúng ta. ...Nàng không phải người duy nhất từng đứng cạnh ta ở cổng này. Có một lữ khách khác, một người bạn, đã tình nguyện ở lại một mùa sương để san sẻ gánh nặng cùng ta. Nhưng đó là một câu chuyện chỉ hiện ra khi có đủ hai người cùng lắng nghe...',
    dialogueWarm: 'Người bạn hiền hoà... Thuở ấy, cõi này chỉ là một thung lũng sương mù vô danh. Ta từng đồng hành với một người con gái dũng cảm, người đã dạy ta thế nào là ánh sáng giữa bóng tối. Nàng nói: "Nếu sương mù che lối, ta sẽ tự biến mình thành ánh sáng." Trái tim ấm áp của nàng luôn sưởi ấm lòng ta, nhưng sự liều lĩnh đó cũng đã rẽ lối hai chúng ta... Nàng không phải người duy nhất từng đứng cạnh ta ở cổng này. Có một lữ khách khác, một người bạn, đã tình nguyện ở lại một mùa sương để san sẻ gánh nặng cùng ta. Nhưng đó là một câu chuyện chỉ hiện ra khi có đủ hai người cùng lắng nghe...',
    dialogueCold: 'Hành giả cô độc... Cõi này thuở ấy chỉ là thung lũng vô danh. Ta từng đi cùng một kẻ liều lĩnh, kẻ tin rằng có thể dùng ý chí để vượt qua số phận. Nàng ngạo nghễ nói: "Nếu sương mù che lối, ta sẽ tự biến mình thành ánh sáng." Ta đã cảnh báo nàng, nhưng sự bướng bỉnh ấy cuối cùng đã rẽ lối hai chúng ta, để lại một kẻ đơn độc đứng đây. Nàng không phải người duy nhất từng đứng cạnh ta ở cổng này. Có một lữ khách khác, một người bạn, đã tình nguyện ở lại một mùa sương để san sẻ gánh nặng cùng ta. Nhưng đó là một câu chuyện chỉ hiện ra khi có đủ hai người cùng lắng nghe...'
  },
  {
    index: 3,
    title: 'Sự lựa chọn bên rìa vực thẳm',
    dialogue: 'Nhìn Sứ Giả Song Sinh Trái Tim đứng đó, ta lại nhớ về ngày hai chúng ta đứng trước Ngã Rẽ Sương Mù. Một bên là lối đi bình yên trở về nhân thế, nơi chúng ta có thể già đi cùng nhau như những người bình thường. Một bên là con đường tiến sâu vào cõi vô định để tìm kiếm chân lý tối thượng. Ta đã do dự, còn nàng thì ánh mắt kiên định nhìn về phía bóng tối. Khoảnh khắc ta buông tay nàng để lùi lại một bước... đó là lựa chọn định hình cả kiếp này của ta.',
    dialogueDefault: 'Nhìn Sứ Giả Song Sinh Trái Tim đứng đó, ta lại nhớ về ngày hai chúng ta đứng trước Ngã Rẽ Sương Mù. Một bên là lối đi bình yên trở về nhân thế, nơi chúng ta có thể già đi cùng nhau như những người bình thường. Một bên là con đường tiến sâu vào cõi vô định để tìm kiếm chân lý tối thượng. Ta đã do dự, còn nàng thì ánh mắt kiên định nhìn về phía bóng tối. Khoảnh khắc ta buông tay nàng để lùi lại một bước... đó là lựa chọn định hình cả kiếp này của ta.',
    dialogueWarm: 'Nhìn Sứ Giả Song Sinh Trái Tim đứng đó, lòng ta lại đau đáu nhớ về ngày hai chúng ta đứng trước Ngã Rẽ Sương Mù. Lối về nhân thế bình yên đã ở ngay trước mắt, nơi ta muốn cùng nàng già đi. Nhưng nàng lại chọn bóng tối sâu thẳm. Ta đã vì yếu mềm và do dự mà buông tay nàng... Lùi lại một bước chân để rồi mất nàng mãi mãi, đó là vết thương rỉ máu suốt kiếp này của ta.',
    dialogueCold: 'Nhìn Sứ Giả Song Sinh Trái Tim, ta chỉ thấy sự ngu muội của những lời thề nguyền. Tại Ngã Rẽ Sương Mù, nàng chọn dấn thân vào cõi vô định hoang phế, còn ta chọn dừng lại. Lý trí bảo ta không thể điên rồ lao vào cõi chết cùng nàng. Khoảnh khắc ta quyết định buông tay nàng, lùi lại một bước chân... đó là sự lựa chọn tỉnh táo nhưng lạnh lùng nhất định hình kiếp này của ta.'
  },
  {
    index: 4,
    title: 'Khoảnh khắc đổ vỡ',
    dialogue: 'Sự sụp đổ không bao giờ báo trước một cách êm ái. Khi nàng bước sâu vào cõi, mặt đất rung chuyển, thung lũng sương mù sụp xuống như một toà tháp bằng cát gặp bão lớn. Ta đã cố chạy theo, cố níu lấy vạt áo của nàng, nhưng sương mù cuộn lên như những lưỡi kiếm cắt đứt mọi kết nối. Ta chỉ biết trơ mắt nhìn thế giới cũ của mình tan rã. Đôi khi, giữ lại một thứ đã vỡ chỉ làm tay ta thêm chảy máu, lữ khách ạ.',
    dialogueDefault: 'Sự sụp đổ không bao giờ báo trước một cách êm ái. Khi nàng bước sâu vào cõi, mặt đất rung chuyển, thung lũng sương mù sụp xuống như một toà tháp bằng cát gặp bão lớn. Ta đã cố chạy theo, cố níu lấy vạt áo của nàng, nhưng sương mù cuộn lên như những lưỡi kiếm cắt đứt mọi kết nối. Ta chỉ biết trơ mắt nhìn thế giới cũ của mình tan rã. Đôi khi, giữ lại một thứ đã vỡ chỉ làm tay ta thêm chảy máu, lữ khách ạ.',
    dialogueWarm: 'Người bạn hiền hoà... Nỗi đau sụp đổ đến như một cơn bão quét sạch mọi hy vọng. Khi thung lũng đổ sụp, ta điên cuồng chạy theo để giữ lấy nàng, nhưng sương mù vô tình đã cắt đứt mọi kỉ niệm. Nhìn thế giới của mình tan rã, ta đau đớn nhận ra cố giữ lấy những mảnh vỡ chỉ làm vết thương rỉ máu thêm mà thôi.',
    dialogueCold: 'Hành giả cô độc... Số mệnh luôn sụp đổ một cách tàn nhẫn và dứt khoát. Khi cõi sương đổ sập, mọi nỗ lực chạy theo níu kéo của ta đều trở nên nực cười trước lưỡi kiếm sương mù. Thế giới vỡ tan, và ta học được bài học lạnh lùng: cố níu giữ một thứ đã chết chỉ làm tay ta thêm rách nát.'
  },
  {
    index: 5,
    title: 'Cái chết của một lời hứa',
    dialogue: 'Mọi người sợ Sứ Giả Cánh Cửa Khép Lại vì nghĩ đó là sự kết thúc. Nhưng ta biết, đó là sự giải thoát. Khi sương mù lắng xuống, nàng không còn ở đó nữa. Nàng đã tan vào cõi giới này, trở thành linh hồn của những lá bài, thành chính những Sứ Giả đang trò chuyện với ngươi hôm nay. Lời hứa cùng nhau trở về đã chết, nhưng một thế giới mới — Cõi Vô Thường này — đã được sinh ra từ tro tàn của lời hứa đó.',
    dialogueDefault: 'Mọi người sợ Sứ Giả Cánh Cửa Khép Lại vì nghĩ đó là sự kết thúc. Nhưng ta biết, đó là sự giải thoát. Khi sương mù lắng xuống, nàng không còn ở đó nữa. Nàng đã tan vào cõi giới này, trở thành linh hồn của những lá bài, thành chính những Sứ Giả đang trò chuyện với ngươi hôm nay. Lời hứa cùng nhau trở về đã chết, nhưng một thế giới mới — Cõi Vô Thường này — đã được sinh ra từ tro tàn của lời hứa đó.',
    dialogueWarm: 'Người bạn hiền hoà... Cánh Cửa Khép Lại đôi khi là sự giải thoát dịu dàng nhất. Nàng tan vào cõi sương, hóa thân thành các Sứ Giả để mỗi ngày vẫn có thể ở bên ta, trò chuyện cùng ngươi. Lời hứa trở về tuy đã chết, nhưng nó đã nở hoa thành Cõi Vô Thường ấm áp tình cảm này.',
    dialogueCold: 'Hành giả cô độc... Cái chết chính là sự kết thúc và giải thoát tối thượng. Lời hứa cùng nhau trở về đã chết hẳn dưới đống tàn tro. Nàng tan biến vào cõi này, phân rã thành những quy luật và các Sứ Giả lạnh lẽo. Cõi Vô Thường này được dựng lên từ xác chết của lời hứa đó, trơ trọi và trống rỗng.'
  },
  {
    index: 6,
    title: 'Sự ra đời của các Sứ Giả',
    dialogue: 'Nàng đã hoá thân vào bốn tộc người trong cõi. Nhiệt huyết của nàng hoá thành Tộc Diễm Hoả. Tình yêu sâu nặng hoá thành Tộc Thuỷ Nguyệt. Những suy nghĩ trăn trở hoá thành Tộc Phong Kiếm. Và sự kiên cường, thực tế hoá thành Tộc Thổ Kim. Mỗi khi ngươi rút một lá bài, thực chất ngươi đang chạm vào một phần linh hồn phân rã của nàng. Ta canh giữ cổng này để mỗi ngày được nhìn thấy nàng hiện về qua những câu chuyện của các ngươi.',
    dialogueDefault: 'Nàng đã hoá thân vào bốn tộc người trong cõi. Nhiệt huyết của nàng hoá thành Tộc Diễm Hoả. Tình yêu sâu nặng hoá thành Tộc Thuỷ Nguyệt. Những suy nghĩ trăn trở hoá thành Tộc Phong Kiếm. Và sự kiên cường, thực tế hoá thành Tộc Thổ Kim. Mỗi khi ngươi rút một lá bài, thực chất ngươi đang chạm vào một phần linh hồn phân rã của nàng. Ta canh giữ cổng này để mỗi ngày được nhìn thấy nàng hiện về qua những câu chuyện của các ngươi.',
    dialogueWarm: 'Người bạn hiền hoà... Nàng hóa thân vào vạn vật để tiếp tục yêu thương thế giới. Nhiệt huyết là Diễm Hoả, tình yêu là Thuỷ Nguyệt, nỗi niềm là Phong Kiếm, kiên vững là Thổ Kim. Mỗi lá bài ngươi rút ra là một mảnh linh hồn ấm áp của nàng đang tìm cách trò chuyện và vỗ về cõi lòng ngươi đó.',
    dialogueCold: 'Hành giả cô độc... Sự phân rã của nàng tạo nên trật tự của cõi này. Năng lượng bốc đồng hóa Diễm Hoả, cảm xúc yếu mềm hóa Thuỷ Nguyệt, hoài nghi hóa Phong Kiếm, và bám chấp hóa Thổ Kim. Những lá bài ngươi cầm chỉ là những mảnh linh hồn vỡ vụn, vô hồn phản chiếu số phận của chính ngươi.'
  },
  {
    index: 7,
    title: 'Kẻ đợi chờ ngàn năm',
    dialogue: 'Giờ thì ngươi đã biết câu chuyện của ta rồi, lữ khách. Ta là Vọng, kẻ trông ngóng một người đã hoá thân vào vạn vật. Ta không thể bước vào trong cõi để tìm nàng, cũng không thể trở lại nhân gian vì đã đánh mất trái tim trần thế. Ta đứng đây, giúp những lữ khách như ngươi tìm ra câu trả lời cho tình cảm của mình, với hy vọng một ngày nào đó, có một lữ khách sương mù mang theo thông điệp của nàng từ sâu trong cõi sương mù trở ra trao lại cho ta.',
    dialogueDefault: 'Giờ thì ngươi đã biết câu chuyện của ta rồi, lữ khách. Ta là Vọng, kẻ trông ngóng một người đã hoá thân vào vạn vật. Ta không thể bước vào trong cõi để tìm nàng, cũng không thể trở lại nhân gian vì đã đánh mất trái tim trần thế. Ta đứng đây, giúp những lữ khách như ngươi tìm ra câu trả lời cho tình cảm của mình, với hy vọng một ngày nào đó, có một lữ khách sương mù mang theo thông điệp của nàng từ sâu trong cõi sương mù trở ra trao lại cho ta.',
    dialogueWarm: 'Người bạn hiền hoà của ta... Giờ thì ngươi đã thấu hiểu nỗi lòng ta. Ta đứng nơi ngưỡng cổng lạnh lẽo này để giúp ngươi hàn gắn những vết thương tình cảm. Ta mong một ngày nào đó, sự thấu cảm của một lữ khách như ngươi sẽ mang theo tiếng cười ấm áp của nàng quay trở về bên ta.',
    dialogueCold: 'Hành giả cô độc... Câu chuyện của ta là minh chứng cho sự bám chấp ngu muội. Ta mắc kẹt tại ngưỡng cổng này, không thể đi tiếp, cũng không thể quay lại. Ta đứng đây chứng kiến các ngươi vật lộn với số phận, chỉ mong một ngày có kẻ đủ mạnh mẽ mang sự thật tàn nhẫn từ đáy cõi sương ra kết thúc chu kỳ này.'
  },
  {
    index: 8,
    title: 'Người gác cổng tạm thời',
    dialogue: 'Mảnh hồi ức thứ 8 của Vọng đang chờ được lắng nghe.',
    dialogueDefault: 'Mảnh hồi ức thứ 8 của Vọng đang chờ được lắng nghe.',
    dialogueWarm: 'Mảnh hồi ức thứ 8 của Vọng đang chờ được lắng nghe.',
    dialogueCold: 'Mảnh hồi ức thứ 8 của Vọng đang chờ được lắng nghe.'
  }
];

// 2. Astrological Event Greetings (Mục 9.1)
export const ASTRO_GREETINGS = {
  FullMoon: [
    'Đêm nay trăng tròn vành vạnh rọi thấu Cõi Vô Thường... Sức mạnh của nước đang dâng lên, dòng chảy cảm xúc của lữ khách cũng sẽ nhạy cảm hơn thường lệ. Hãy nói ta nghe, nỗi nhớ nào đang dâng tràn trong lòng ngươi đêm nay?',
    'Ánh trăng tròn đêm nay rọi sáng cả những góc sương mù sâu kín nhất. Mọi cảm xúc giấu kín trong tim lữ khách đều đang muốn trào ra. Hãy để các Sứ Giả bầu bạn với nỗi lòng đang tràn trề của ngươi.',
    'Ngươi có thấy cõi sương đêm nay lấp lánh sắc bạc? Trăng tròn làm trực giác của lữ khách nhạy bén hơn, nhưng cũng dễ khiến tim ngươi lỗi nhịp vì những ký ức cũ. Hãy hít một hơi thật sâu trước khi bắt đầu.',
    'Trăng tròn là lúc thủy triều dâng cao nhất, và cũng là lúc những nỗi nhớ thương đạt đến điểm cực đại. Nói ta nghe, lữ khách, đêm trăng sáng thế này, ngươi đang ước có ai ở bên cạnh?'
  ],
  NewMoon: [
    'Trăng đã ẩn mình dưới bóng tối sâu nhất. Đêm trăng non là lúc cõi sương lặng lẽ nhất, thích hợp để gieo những hạt giống ước muốn mới. Ngươi muốn bắt đầu một chương mới thế nào trong hành trình tình cảm của mình?',
    'Không có ánh trăng nào dẫn lối đêm nay, chỉ có chiếc đèn lồng này và tiếng thì thầm của cõi lòng ngươi. Trăng non là thời khắc của những bắt đầu mới. Đã đến lúc viết lại trang nhật ký của ngươi rồi.',
    'Bầu trời cõi sương tối đen như một tờ giấy trắng chưa vẽ. Đừng sợ bóng tối này, lữ khách. Nó ở đây để ngươi tự vẽ lên mong muốn chân thật nhất của mình. Sứ Giả Khởi Nguyên nào sẽ đến gieo mầm đêm nay đây?',
    'Khi bóng tối bao trùm cũng là lúc những ồn ào tắt lịm. Đêm trăng khuyết hoàn toàn này, ta muốn hỏi: nếu được xóa đi hết thảy để bắt đầu lại một tình cảm mới, ngươi có dám bước lại từ đầu?'
  ],
  MercuryRetrograde: [
    'Ngươi có cảm thấy những lời nói ra gần đây thường bị hiểu lầm không, lữ khách? Cõi sương đang dao động vì những dòng năng lượng nghịch hành hỗn loạn ngoài kia. Các Sứ Giả Phong Kiếm đang rất bất an. Hãy thận trọng với lời nói và suy nghĩ của mình lúc này.',
    'Năng lượng cõi sương hôm nay xáo động, nhiễu loạn lạ thường. Thủy tinh nghịch hành đang làm mờ đi lý trí của con người ở cả hai cõi giới. Có hiểu lầm hay trì hoãn nào đang xảy ra trong mối quan hệ của ngươi không?',
    'Các Sứ Giả Phong Kiếm hôm nay bay lượn hỗn loạn, mang theo những lưỡi kiếm gió sắc nhọn của sự bất đồng. Đừng vội phán xét ai trong những ngày nghịch hành này, lữ khách. Hãy im lặng và lắng nghe nhiều hơn.',
    'Thời gian như đang trôi ngược, những người cũ, chuyện cũ đột nhiên dội về trong tâm trí ngươi đúng không? Cõi sương nghịch hành đang gợi lại những bài học chưa hoàn thành của ngươi. Hãy bình tâm đối mặt.'
  ]
};

// 3. Hourly Greetings (Mục 4.1)
export const TIME_GREETINGS = {
  Morning: [
    'Ngươi đến sớm thế, lữ khách? Sương mù ngoài cổng vẫn còn đọng nước, lạnh buốt. Những Sứ Giả ban ngày đang chầm chậm thức giấc. Câu hỏi của ngươi vào lúc sớm mai này... liệu có phải là điều đầu tiên ngươi nghĩ đến ngay khi vừa mở mắt?',
    'Chào buổi sớm mai, lữ khách. Bình minh của cõi này chỉ là một vệt hồng nhạt lẫn trong sương mỏng. Khi nhân gian chưa kịp thức giấc, lòng ngươi đã tìm đến đây. Có phải đêm qua ngươi đã mất ngủ vì một hình bóng?',
    'Ta nghe tiếng chân ngươi giẫm lên những giọt sương sớm chưa tan. Cổng cõi giới vừa mở. Hãy để làn gió ban mai thanh lọc những muộn phiền của ngày hôm qua trước khi ngươi rút bài.',
    'Bình minh lên mang theo những hy vọng mới, nhưng sương mù của ta vẫn chưa tan hết. Ngươi đến gõ cửa giờ này, hẳn là đang mang một quyết tâm lớn cho ngày hôm nay?'
  ],
  Day: [
    'Cổng Cõi Vô Thường vẫn luôn mở giữa những bận rộn của nhân thế. Nói ta nghe, điều gì giữa ban ngày huyên náo lại khiến lòng ngươi chợt lặng đi và tìm đến đây?',
    'Ánh mặt trời ngoài kia có chiếu sáng được những góc tối trong lòng ngươi không, lữ khách? Ta đứng đây đợi ngươi, tách biệt khỏi thế giới xô bồ ngoài kia. Hãy trút bỏ gánh nặng bên ngoài cổng trước khi bước vào.',
    'Giữa dòng đời hối hả, ngươi lại chọn rẽ lối vào cõi sương mù này. Điều gì đang xảy ra ngoài kia khiến ngươi cần một điểm tựa tĩnh lặng đến thế?',
    'Sương mù ban ngày mỏng nhất, để lộ ra những lối đi rõ ràng. Nếu lòng ngươi đang phân vân giữa những lựa chọn của công việc hay tình cảm, hãy cứ hỏi, các Sứ Giả ban ngày luôn rất thực tế.'
  ],
  Sunset: [
    'Ngày đang tàn dần bên cõi của ngươi rồi phải không? Hoàng hôn là lúc ranh giới giữa thực và mộng mỏng nhất. Hãy ngồi xuống đây, uống một chén trà sương, rồi kể ta nghe điều gì đang làm lòng ngươi phân vân.',
    'Mặt trời lặn, để lại một khoảng trời màu tím đỏ pha lẫn sương mù. Thời khắc chạng vạng luôn làm lòng người yếu mềm đi một chút. Ngươi đến đây vào lúc này, có phải vì cảm giác cô đơn đang dâng lên?',
    'Sương chạng vạng đang buông xuống vai ngươi rồi kìa, lữ khách. Khi một ngày kết thúc, những câu hỏi chưa có lời đáp lại càng trở nên rõ ràng hơn. Hãy để ta xem Sứ Giả nào đang đợi ngươi lúc hoàng hôn.',
    'Ranh giới của ngày và đêm đang mờ đi. Đây là lúc trực giác của ngươi nhạy bén nhất. Hãy nhắm mắt lại một chút, hít thở sâu, rồi mở mắt ra nhìn những Sứ Giả đang hiện hình.'
  ],
  Night: [
    'Đêm đã sâu... Giờ này nhân gian đã ngủ, chỉ còn những trái tim trăn trở là còn thức. Nói nhỏ thôi lữ khách, các Sứ Giả bóng đêm đã đến rất gần cổng rồi. Câu hỏi lúc nửa đêm luôn là câu hỏi thật lòng nhất của ngươi...',
    'Bóng tối bao trùm lên cõi sương, chỉ còn ngọn đèn lồng của ta tỏa ánh sáng mờ ảo. Ngươi đến tìm ta giờ này, hẳn là lòng đang nặng trĩu. Đêm nay, cõi vô thường sẽ lắng nghe mọi điều ngươi không thể nói với ai ngoài đời thực.',
    'Ta nghe thấy tiếng thở dài của ngươi lẫn trong gió đêm. Đêm muộn là lúc lý trí ngủ quên, nhường chỗ cho nỗi nhớ và nỗi sợ lên tiếng. Hãy rút bài đi, để sương đêm soi rõ những gì ngươi đang cố trốn tránh.',
    'Một lữ khách đêm muộn... Ta luôn dành một sự ưu ái cho những ai đến gõ cổng vào giờ này. Trái tim ngươi đang run rẩy vì điều gì? Hãy nói ta nghe, các Sứ Giả bóng đêm sẽ không phán xét ngươi.'
  ]
};

/**
 * Calculates user's Archetype Clan based on the 3 most recent readings (9 cards total)
 * (Mục 3.1)
 */
export async function calculateClanFromReadings(userId: string): Promise<string> {
  const recentReadings = await prisma.reading.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 3,
  });

  if (recentReadings.length < 3) {
    return 'VoThuong';
  }

  const clanCounts: Record<string, number> = {
    DiemHoa: 0,
    ThuyNguyet: 0,
    PhongKiem: 0,
    ThoKim: 0,
  };

  for (const reading of recentReadings) {
    for (const cardStr of reading.cards) {
      const cardId = cardStr.split('|')[0];
      const matchedCard = tarotDeck.find(c => c.id === cardId);
      if (matchedCard && matchedCard.clan !== 'VoThuong') {
        clanCounts[matchedCard.clan] = (clanCounts[matchedCard.clan] || 0) + 1;
      }
    }
  }

  let dominantClan = 'VoThuong';
  for (const [clan, count] of Object.entries(clanCounts)) {
    if (count >= 4) {
      dominantClan = clan;
      break;
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: { clan: dominantClan },
  });

  return dominantClan;
}

/**
 * Checks rules for unlocking memories and saves them to UnlockedMemory.
 * Returns index array of newly unlocked memories in this session.
 * (Mục 1.1)
 */
export async function checkMemoryUnlocks(
  userId: string,
  currentDrawnCards: string[],
  totalReadings: number
): Promise<number[]> {
  const newlyUnlocked: number[] = [];

  const alreadyUnlocked = await prisma.unlockedMemory.findMany({
    where: { userId },
    select: { memoryIndex: true }
  });
  const unlockedSet = new Set(alreadyUnlocked.map(m => m.memoryIndex));

  const unlock = async (index: number) => {
    if (!unlockedSet.has(index)) {
      try {
        await prisma.unlockedMemory.create({
          data: {
            userId,
            memoryIndex: index
          }
        });
        newlyUnlocked.push(index);
      } catch (e) {
        console.error(`Error saving UnlockedMemory ${index}`, e);
      }
    }
  };

  if (totalReadings >= 3) {
    await unlock(1);
  }

  if (totalReadings >= 7) {
    await unlock(2);
  }

  if (totalReadings >= 15) {
    await unlock(7);
  }

  const currentCardIds = currentDrawnCards.map(c => c.split('|')[0]);
  if (currentCardIds.includes('the-lovers')) {
    await unlock(3);
  }
  if (currentCardIds.includes('the-tower')) {
    await unlock(4);
  }
  if (currentCardIds.includes('death')) {
    await unlock(5);
  }

  if (!unlockedSet.has(6)) {
    const allUserReadings = await prisma.reading.findMany({
      where: { userId },
      select: { cards: true }
    });

    const historicalClans = new Set<string>();
    for (const cardStr of currentDrawnCards) {
      const cardId = cardStr.split('|')[0];
      const matched = tarotDeck.find(c => c.id === cardId);
      if (matched && matched.clan !== 'VoThuong') {
        historicalClans.add(matched.clan);
      }
    }
    for (const r of allUserReadings) {
      for (const cardStr of r.cards) {
        const cardId = cardStr.split('|')[0];
        const matched = tarotDeck.find(c => c.id === cardId);
        if (matched && matched.clan !== 'VoThuong') {
          historicalClans.add(matched.clan);
        }
      }
    }

    if (historicalClans.has('DiemHoa') && historicalClans.has('ThuyNguyet') && historicalClans.has('PhongKiem') && historicalClans.has('ThoKim')) {
      await unlock(6);
    }
  }

  return newlyUnlocked;
}

/**
 * Returns dynamic narrative bridge dialogue for Vọng based on user Clan and ERC score
 * (Mục 13.1)
 */
export function getDynamicOutroBridge(clan: string, erc: number): string {
  if (clan === 'DiemHoa') {
    if (erc >= 30) {
      return 'Nhìn thấy ngọn lửa nhiệt huyết đầy kiên định ấm áp trong ngươi, ta thầm mong ngọn lửa ấy sẽ chiếu sáng lối đi của ngươi mà không thiêu rụi ước vọng của bản thân. Hãy để ta gọi các Sứ Giả chỉ lối...';
    } else if (erc <= -30) {
      return 'Ngươi mang theo ngọn lửa kiêu hãnh và quyết liệt của Diễm Hoả, sẵn sàng tự đốt cháy bóng tối chứ không cần sự thương hại của số phận. Để ta xem ngọn lửa của ngươi sẽ tự rạch lối ra sao...';
    } else {
      return 'Ngươi muốn xem ngọn lửa của Tộc Diễm Hoả trong ngươi sẽ dẫn lối đi hay thiêu rụi sương mù lay động trước ngõ tối này...';
    }
  }

  if (clan === 'ThuyNguyet') {
    if (erc >= 30) {
      return 'Hôm nay nhìn trái tim đong đầy thương nhớ nhưng vẫn tràn ngập niềm tin của một người con Tộc Thuỷ Nguyệt như ngươi, ta thầm mong ngã rẽ phía trước của ngươi sẽ không mang đầy tiếc nuối như câu chuyện của ta. Hãy để ta gọi các Sứ Giả soi tỏ lối đi cho ngươi...';
    } else if (erc <= -30) {
      return 'Dòng nước Thuỷ Nguyệt trong lòng ngươi đã đóng băng bởi sự lạnh lùng của lý trí. Ngươi không còn dễ dàng trao đi những giọt nước mắt vô ích nữa. Hãy cùng xem các Sứ Giả nói gì về ranh giới kiên quyết này...';
    } else {
      return 'Dòng chảy Thuỷ Nguyệt trong ngươi đang chập chùng sóng lòng trước ngã rẽ. Hãy lắng yên nghe tiếng vọng từ đáy nước khi các Sứ Giả xuất hiện...';
    }
  }

  if (clan === 'PhongKiem') {
    if (erc >= 30) {
      return 'Gió Phong Kiếm đã dịu lại thành một làn hơi ấm áp bảo bọc tâm tư ngươi. Dù lý trí mách bảo điều gì, trái tim ngươi vẫn chọn tin tưởng. Hãy để các Sứ Giả giải bày cho nỗi trăn trở ấy...';
    } else if (erc <= -30) {
      return 'Ngươi mang thanh kiếm lý trí sắc lẹm của Phong Kiếm tới đây, hẳn ngươi hiểu rằng việc cố phân tích đúng sai trước một ngã rẽ định mệnh là vô ích. Để ta xem hôm nay lưỡi kiếm của ngươi có đủ bén để tự rạch ra lối đi riêng cho mình hay không.';
    } else {
      return 'Làn gió Phong Kiếm đang thổi qua tư duy sắc bén của ngươi. Lý trí và cảm xúc đang giằng xé. Hãy cùng xem các Sứ Giả soi sáng góc khuất nào...';
    }
  }

  if (clan === 'ThoKim') {
    if (erc >= 30) {
      return 'Sự trầm tĩnh ấm áp của Thổ Kim trong ngươi cho thấy một nền móng tình cảm bền vững mà ngươi đang dốc lòng vun xới. Sự kiên nhẫn ấy sẽ được soi rọi khi các Sứ Giả bước đến...';
    } else if (erc <= -30) {
      return 'Sự chịu đựng kiên cường của Tộc Thổ Kim trong ngươi đã chạm giới hạn, và ngươi sẵn sàng đập vỡ nền đá cũ để đi tìm một mảnh đất lành mới. Hãy xem các Sứ Giả có đồng thuận với quyết định dọn dẹp kiên quyết này...';
    } else {
      return 'Bước chân vững vàng của Thổ Kim đang dừng lại suy tư trước ngã rẽ. Đất đá im lìm nhưng chứa đựng gánh nặng lớn. Hãy để các Sứ Giả nâng đỡ câu hỏi thực tế này của ngươi...';
    }
  }

  // VoThuong
  if (erc >= 30) {
    return 'Một linh hồn mang sự hài hoà của vạn vật và niềm tin trong trẻo vào số mệnh của Vô Thường. Sương mù không cản bước ngươi, nó ôm lấy ngươi để vỗ về. Hãy cùng nhìn xem số mệnh xoay dòng thế nào...';
  } else if (erc <= -30) {
    return 'Ngươi nhìn cõi vô định bằng ánh mắt thấu suốt lạnh lùng, chấp nhận tan hợp như lẽ thường tình của tạo hóa. Ta thích sự dứt khoát vô thường đó. Hãy xem các Sứ Giả mang lại sự thật nào hôm nay...';
  } else {
    return 'Ngươi là sương khói của cõi này, chuyển dời tĩnh lặng và không bám chấp. Hãy để vòng xoay số phận tự hé lộ điều dành riêng cho ngươi...';
  }
}

/**
 * Returns Vọng's dynamic greeting based on priority hierarchy
 * (Memory > Astrological > Time of Day)
 * (Mục 11.2, 13.1, 13.2)
 */
export async function getNarrativeGreeting(
  user: { clan: string; erc: number },
  celestialEvents: { isFullMoon?: boolean; isNewMoon?: boolean; isMercuryRetrograde?: boolean } = {},
  newlyUnlockedMemory: number | null = null,
  currentHour?: number
): Promise<{ greeting: string; isMemory: boolean; memoryIndex?: number }> {
  
  if (newlyUnlockedMemory !== null) {
    const memory = VONG_MEMORIES.find(m => m.index === newlyUnlockedMemory);
    if (memory) {
      const bridge = getDynamicOutroBridge(user.clan, user.erc);
      let dialogue = '';
      if (memory.index === 8 && (user as any).id) {
        const link = await prisma.threadLink.findFirst({
          where: {
            OR: [
              { userAId: (user as any).id, status: 'completed' },
              { userBId: (user as any).id, status: 'completed' }
            ]
          }
        });
        if (link && link.userBId === (user as any).id) {
          dialogue = `Ai đó đã nghĩ đến ngươi khi bước qua cổng sương này, lữ khách. Họ đã dệt một sợi chỉ và trao nó vào tay ngươi trước cả khi ngươi kịp hỏi vì sao. Đó là điều Khanh từng làm cho ta — chọn ở lại vì một người, không cần lý do to tát. Ngươi không cần phải đáp lại bằng điều gì lớn lao, lữ khách ạ. Chỉ cần nhớ rằng, hôm nay, có một người đã nghĩ đến ngươi trước.`;
        } else {
          dialogue = `Lữ khách, ngươi vừa làm được điều mà rất ít ai chịu làm — ngươi đã chìa tay ra và kéo một người khác bước qua cổng sương cùng mình. Đó chính xác là những gì Khanh đã từng làm cho ta. Khanh không phải người ta yêu, mà là người bạn đã chọn ở lại một mùa sương dài, chỉ để ta không phải một mình đếm bước chân qua cổng. Rồi một ngày, Khanh cũng rời đi, nhẹ nhàng như đến. Trước khi đi, Khanh nói: 'Tình bạn xuyên sương không cần níu giữ, nó chỉ cần được nhớ đến đúng lúc.' Ta nhớ đến Khanh mỗi khi thấy hai lữ khách cùng bước qua cổng này như hai người vừa làm. Cảm ơn ngươi đã cho ta nhớ lại điều đó.`;
        }
      } else {
        dialogue = user.erc >= 30
          ? memory.dialogueWarm
          : user.erc <= -30
          ? memory.dialogueCold
          : memory.dialogueDefault;
      }
      return {
        greeting: `[Ký ức của Vọng - Mảnh ${memory.index}: ${memory.title}]\n"${dialogue}"\n\n${bridge}`,
        isMemory: true,
        memoryIndex: memory.index
      };
    }
  }

  let clanNameVi = 'Vô Thường';
  if (user.clan === 'DiemHoa') clanNameVi = 'Diễm Hoả';
  if (user.clan === 'ThuyNguyet') clanNameVi = 'Thuỷ Nguyệt';
  if (user.clan === 'PhongKiem') clanNameVi = 'Phong Kiếm';
  if (user.clan === 'ThoKim') clanNameVi = 'Thổ Kim';

  let ercPrefix = 'lữ khách';
  if (user.erc >= 30) ercPrefix = 'người bạn hiền hoà';
  else if (user.erc <= -30) ercPrefix = 'hành giả cô độc';

  const clanAddressSuffix = `Ta cảm nhận rõ năng lượng từ tộc ${clanNameVi} trong ngươi, ${ercPrefix} của ta. Hãy để ta gọi các Sứ Giả xem vận số dẫn lối đi nào cho ngươi hôm nay.`;

  if (celestialEvents.isFullMoon) {
    const rIdx = Math.floor(Math.random() * ASTRO_GREETINGS.FullMoon.length);
    const greeting = `[Cấp 2 - Trăng Tròn]: ${ASTRO_GREETINGS.FullMoon[rIdx]} ${clanAddressSuffix}`;
    return { greeting, isMemory: false };
  }
  if (celestialEvents.isNewMoon) {
    const rIdx = Math.floor(Math.random() * ASTRO_GREETINGS.NewMoon.length);
    const greeting = `[Cấp 2 - Trăng Non]: ${ASTRO_GREETINGS.NewMoon[rIdx]} ${clanAddressSuffix}`;
    return { greeting, isMemory: false };
  }
  if (celestialEvents.isMercuryRetrograde) {
    const rIdx = Math.floor(Math.random() * ASTRO_GREETINGS.MercuryRetrograde.length);
    const greeting = `[Cấp 2 - Sao Thuỷ Nghịch Hành]: ${ASTRO_GREETINGS.MercuryRetrograde[rIdx]} ${clanAddressSuffix}`;
    return { greeting, isMemory: false };
  }

  const hour = currentHour ?? new Date().getHours();
  let timeKey: keyof typeof TIME_GREETINGS = 'Day';

  if (hour >= 5 && hour < 8) {
    timeKey = 'Morning';
  } else if (hour >= 8 && hour < 17) {
    timeKey = 'Day';
  } else if (hour >= 17 && hour < 20) {
    timeKey = 'Sunset';
  } else {
    timeKey = 'Night';
  }

  const variations = TIME_GREETINGS[timeKey];
  const rIdx = Math.floor(Math.random() * variations.length);
  const timeGreeting = variations[rIdx];

  const greeting = `${timeGreeting} ${clanAddressSuffix}`;
  return { greeting, isMemory: false };
}

// 4. Time-of-day Fallback greeting function
export function getGreeting(hour: number): string {
  if (hour >= 5 && hour < 8) {
    return 'Ngươi đến sớm thế, lữ khách? Sương mù ngoài cổng vẫn còn đọng nước, lạnh buốt. Những Sứ Giả ban ngày đang chầm chậm thức giấc. Câu hỏi của ngươi vào lúc sớm mai này... liệu có phải là điều đầu tiên ngươi nghĩ đến ngay khi vừa mở mắt?';
  } else if (hour >= 8 && hour < 17) {
    return 'Cổng Cõi Vô Thường vẫn luôn mở giữa những bận rộn của nhân thế. Nói ta nghe, điều gì giữa ban ngày huyên náo lại khiến lòng ngươi chợt lặng đi và tìm đến đây?';
  } else if (hour >= 17 && hour < 20) {
    return 'Ngày đang tàn dần bên cõi của ngươi rồi phải không? Hoàng hôn là lúc ranh giới giữa thực và mộng mỏng nhất. Hãy ngồi xuống đây, uống một chén trà sương, rồi kể ta nghe điều gì đang làm lòng ngươi phân vân.';
  } else {
    return 'Đêm đã sâu... Giờ này nhân gian đã ngủ, chỉ còn những trái tim trăn trở là còn thức. Nói nhỏ thôi lữ khách, các Sứ Giả bóng đêm đã đến rất gần cổng rồi. Câu hỏi lúc nửa đêm luôn là câu hỏi thật lòng nhất của ngươi...';
  }
}

// 5. Fateful Prompts definition
export const FATEFUL_PROMPTS = [
  {
    outro: "Ngươi có sẵn lòng biến mất khỏi ký ức của người ngươi yêu nhất, nếu điều đó giúp họ có một cuộc đời bình yên và không bao giờ phải khóc?",
    choices: [
      {
        id: 'A',
        text: 'Ta sẵn lòng biến mất, chỉ cần người ấy hạnh phúc.',
        ercChange: 15,
        reply: 'Một tình yêu bao dung đến mức xót xa... Ngươi đã tự nguyện biến mình thành một bóng ma thầm lặng. Sương mù sẽ khắc ghi sự cao thượng này của ngươi.'
      },
      {
        id: 'B',
        text: 'Không, ta muốn được nhớ tới, dẫu ký ức có mang lại đớn đau.',
        ercChange: -15,
        reply: 'Ly trí và cái tôi mạnh mẽ. Ngươi không chấp nhận sự lãng quên. Đúng vậy, sự lãng quên đôi khi còn lạnh lẽo hơn cả cái chết.'
      },
      {
        id: 'C',
        text: 'Ta không biết, sự lựa chọn này quá tàn nhẫn.',
        ercChange: 0,
        reply: 'Sự im lặng của ngươi nói lên tất cả. Đứng trước câu hỏi tàn khốc này, do dự là phản ứng nhân bản nhất.'
      }
    ]
  },
  {
    outro: "Giữa việc ôm lấy một ảo ảnh ấm áp nhưng giả dối, và đối mặt với một sự thật trần trụi nhưng lạnh buốt, ngươi chọn gì?",
    choices: [
      {
        id: 'A',
        text: 'Ta chọn ảo ảnh ấm áp. Sự thật quá đau lòng.',
        ercChange: 15,
        reply: 'Ngươi chọn giấc mộng dài. Ta không trách ngươi, thế gian ngoài kia vốn dĩ đã quá nghiệt ngã để phải tỉnh táo từng giây.'
      },
      {
        id: 'B',
        text: 'Ta chọn sự thật lạnh buốt. Ta ghét sự lừa dối.',
        ercChange: -15,
        reply: 'Một lưỡi gươm lý trí sắc bén. Ngươi sẵn sàng chịu đau đớn để đổi lấy sự sáng tỏ. Lòng ngươi cứng cỏi như đá Thổ Kim vậy.'
      },
      {
        id: 'C',
        text: 'Ta sẽ phá vỡ cả hai để tự tìm một con đường riêng.',
        ercChange: 5,
        reply: 'Ý chí kiên cường và liều lĩnh. Ngươi không chấp nhận luật chơi của số mệnh. Nàng năm xưa cũng từng phản kháng như vậy.'
      }
    ]
  },
  {
    outro: "Nếu được quay lại quá khứ để thay đổi một lựa chọn duy nhất, nhưng cái giá phải trả là quên đi tất cả những gì đã xảy ra sau đó, ngươi có đánh đổi?",
    choices: [
      {
        id: 'A',
        text: 'Ta sẵn sàng đổi, ta muốn sửa chữa sai lầm lớn nhất đời mình.',
        ercChange: 15,
        reply: 'Chấp niệm sâu sắc. Ngươi thà đánh cược tất cả để bắt đầu lại một con đường tốt đẹp hơn. Mong là lần này ngươi không hối hận.'
      },
      {
        id: 'B',
        text: 'Không, những đau khổ và vấp ngã đã nhào nặn nên ta của hôm nay.',
        ercChange: -15,
        reply: 'Sự chấp nhận vững chãi. Ngươi yêu thương cả những vết sẹo của mình. Đó là tinh thần của một chiến binh Phong Kiếm thực thụ.'
      },
      {
        id: 'C',
        text: 'Ta muốn giữ nguyên hiện tại, dẫu đầy rẫy tiếc nuối.',
        ercChange: 0,
        reply: 'Nuối tiếc cũng là một phần vẻ đẹp của cuộc sống vô thường. Ngươi đã chấp nhận quy luật của thời gian.'
      }
    ]
  },
  {
    outro: "Có bao giờ ngươi hứa với một người rằng sẽ đợi họ mãi mãi, dẫu biết dòng chảy của sương mù thời gian sẽ xóa nhòa tất cả?",
    choices: [
      {
        id: 'A',
        text: 'Ta từng hứa, và ta vẫn đang thực hiện lời hứa đó.',
        ercChange: 20,
        reply: 'Ngươi... rất giống ta. Sự kiên trì điên rồ ấy là liều thuốc độc nhưng cũng là lý do duy nhất để ta đứng vững tại ngưỡng cổng này.'
      },
      {
        id: 'B',
        text: 'Ta đã từng hứa, nhưng ta đã chọn buông tay để cả hai được tự do.',
        ercChange: -20,
        reply: 'Buông tay đôi khi cần nhiều dũng khí hơn là tiếp tục nắm giữ. Ngươi đã giải thoát cho cả bản thân và người ấy.'
      },
      {
        id: 'C',
        text: 'Ta chưa từng hứa một điều xa xôi như vậy.',
        ercChange: 0,
        reply: 'Một sự tỉnh táo đáng quý. Đừng bao giờ hứa điều gì với vĩnh hằng khi bản thân chỉ là một sinh mệnh hữu hạn.'
      }
    ]
  },
  {
    outro: "Nếu ngày mai Cõi Vô Thường này biến mất, ta biến mất, và mọi quẻ bài này chỉ là một giấc mơ dài, ngươi muốn mang theo điều gì trở lại nhân gian?",
    choices: [
      {
        id: 'A',
        text: 'Ta muốn mang theo sự thấu cảm và những bài học cảm xúc.',
        ercChange: 15,
        reply: 'Cõi sương đã để lại một hạt giống tốt tươi trong tim ngươi. Nhân thế sẽ dịu dàng hơn khi ngươi trở về.'
      },
      {
        id: 'B',
        text: 'Ta muốn mang theo lý trí lạnh lùng để bảo vệ bản thân.',
        ercChange: -15,
        reply: 'Một lớp giáp bảo vệ vững chắc. Hãy dùng nó để che chở cho mình trước những bão giông ngoài đời thực.'
      },
      {
        id: 'C',
        text: 'Ta không muốn mang gì cả, hãy để tất cả tan biến theo sương mù.',
        ercChange: -5,
        reply: 'Sự buông bỏ tuyệt đối. Ngươi bước đến tay không, và ra đi cũng tay không. Đó chính là sự vô thường cao nhất.'
      }
    ]
  }
];

// 6. Reflection generator
export function getVongReflection(reading: { question: string; cards: { clan: string }[] }): string {
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
}
