export function getElementalRelation(clan1: string, clan2: string): 'Tương Sinh' | 'Tương Khắc' | 'Trung Tính' {
  if (clan1 === 'VoThuong' || clan2 === 'VoThuong') return 'Trung Tính';

  const generative = [
    ['ThuyNguyet', 'ThuyNguyet'],
    ['ThoKim', 'ThoKim'],
    ['DiemHoa', 'DiemHoa'],
    ['PhongKiem', 'PhongKiem'],
    ['ThuyNguyet', 'ThoKim'],
    ['ThoKim', 'ThuyNguyet'],
    ['DiemHoa', 'PhongKiem'],
    ['PhongKiem', 'DiemHoa']
  ];

  const conflicting = [
    ['ThuyNguyet', 'DiemHoa'],
    ['DiemHoa', 'ThuyNguyet'],
    ['PhongKiem', 'ThoKim'],
    ['ThoKim', 'PhongKiem'],
    ['ThuyNguyet', 'PhongKiem'],
    ['PhongKiem', 'ThuyNguyet'],
    ['DiemHoa', 'ThoKim'],
    ['ThoKim', 'DiemHoa']
  ];

  const isGen = generative.some(([a, b]) => a === clan1 && b === clan2);
  if (isGen) return 'Tương Sinh';

  const isConf = conflicting.some(([a, b]) => a === clan1 && b === clan2);
  if (isConf) return 'Tương Khắc';

  return 'Trung Tính';
}

export function getOrientationRelation(r1: boolean, r2: boolean): 'Xuôi - Xuôi' | 'Hỗn Hợp' | 'Ngược - Ngược' {
  if (!r1 && !r2) return 'Xuôi - Xuôi';
  if (r1 && r2) return 'Ngược - Ngược';
  return 'Hỗn Hợp';
}

export function generateFallbackCommentary(
  relation: string,
  orientation: string
): string {
  if (relation === 'Tương Sinh' && orientation === 'Xuôi - Xuôi') {
    return 'Ta nhìn thấy dòng chảy của hai Sứ Giả này đang hòa vào nhau rất êm đềm — như nước mát tưới tắm cho mảnh đất lành dưới chân ngươi. Mọi sự đang tiến triển tự nhiên và nhận được sự đồng thuận từ cõi lòng đến thực tế. Lữ khách, ngươi có đang cảm thấy mọi sự dần trở nên rõ ràng và vững chãi hơn không?';
  }
  if (relation === 'Tương Khắc' && orientation === 'Xuôi - Xuôi') {
    return 'Một bên là ngọn lửa Diễm Hoả hăm hở lao đi, một bên là làn nước Thuỷ Nguyệt sâu lắng đầy cảm xúc. Hai năng lượng này tuy đẹp nhưng lại đang khắc chế nhau, khiến lòng ngươi vừa muốn bùng cháy vừa muốn dịu lại. Có phải ngươi đang cố ép mình phải đưa ra hành động mạnh mẽ trong khi tim ngươi chỉ muốn lặng im cảm nhận?';
  }
  if (relation === 'Tương Khắc' && orientation === 'Hỗn Hợp') {
    return 'Sự sụp đổ lớn của số mệnh đang va đập vào sự chao đảo trong đời sống thực tế của ngươi. Một bên ngoài mặt đã đổ vỡ, nhưng bên trong ngươi vẫn cố gắng xoay xở giữ thăng bằng một cách kiệt quệ. Đừng cố gồng gánh những mảnh vỡ nữa, lữ khách. Hãy buông tay để đất đá rơi xuống, ngươi mới có chỗ để đứng vững.';
  }
  if (relation === 'Tương Sinh' && orientation === 'Ngược - Ngược') {
    return 'Cả hai chiếc chén đều đang úp ngược, sương mù bao phủ lấy những nỗi đau chưa thể gọi tên. Ngươi đang chìm trong dòng nước tù đọng của quá khứ, vừa muốn bỏ đi lại vừa không đành lòng cất bước. Khi cõi lòng đã kiệt quệ như vậy, trì hoãn không giúp ngươi bớt đau, nó chỉ làm sương đêm thấm lạnh thêm vào da thịt. Ngươi có muốn cho bản thân một cơ hội để thực sự khóc một lần rồi buông không?';
  }
  return 'Sương mù cuộn lên che khuất ngõ tối, các Sứ Giả đang đứng tại ngã rẽ cuộc đời ngươi. Năng lượng giữa họ có sự xung đối nhẹ, đòi hỏi ngươi phải chậm lại và lắng nghe tiếng gọi từ tiềm thức sâu thẳm.';
}
