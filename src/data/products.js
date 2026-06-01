import vrImg from '../assets/nexus-vr.png'
import audioImg from '../assets/nexus-audio.png'
import keyboardImg from '../assets/nexus-keyboard.png'
import watchImg from '../assets/nexus-watch.png'
import mouseImg from '../assets/nexus-mouse.png'
import speakerImg from '../assets/nexus-speaker.png'

export const products = [
  {
    id: 'nexus-vr-01',
    name: 'NEXUS Quantum VR Visor',
    category: 'wearables',
    price: 1299,
    rating: 4.9,
    reviewCount: 124,
    tag: 'Hot',
    image: vrImg,
    shortDescription: 'Kính thực tế ảo thế hệ mới với độ phân giải song nhãn 8K, tần số quét 120Hz và góc nhìn siêu rộng 140 độ.',
    description: 'NEXUS Quantum VR Visor mở ra một kỷ nguyên mới của thế giới kỹ thuật số. Trang bị công nghệ thấu kính Pancake siêu mỏng cùng màn hình Micro-OLED 8K sắc nét đến từng chi tiết, sản phẩm mang đến trải nghiệm đắm chìm chân thực tuyệt đối. Hệ thống theo dõi chuyển động tay và mắt bằng AI thế hệ mới giúp các tương tác của bạn mượt mà tự nhiên không độ trễ.',
    specs: {
      'Độ phân giải': '8K Ultra HD (4320 x 4320 mỗi mắt)',
      'Tần số quét': '120Hz / 90Hz',
      'Vi xử lý': 'Qualcomm Snapdragon XR2 Gen 3',
      'Bộ nhớ': '12GB RAM LPDDR5X + 256GB UFS 4.0',
      'Trọng lượng': '380g (siêu nhẹ)',
      'Kết nối': 'Wi-Fi 7, Bluetooth 5.4, USB-C 3.2'
    },
    reviews: [
      { name: 'Nguyễn Minh T.', rating: 5, comment: 'Trải nghiệm đỉnh cao, kính nhẹ đeo lâu không bị mỏi cổ như các hãng khác!' },
      { name: 'Hoàng Lâm A.', rating: 5, comment: 'Độ phân giải quá nét, xem phim hay chơi game VR góc rộng cực đã.' }
    ]
  },
  {
    id: 'nexus-audio-02',
    name: 'NEXUS Soundscape ANC',
    category: 'audio',
    price: 349,
    rating: 4.8,
    reviewCount: 342,
    tag: 'Bán Chạy',
    image: audioImg,
    shortDescription: 'Tai nghe chụp tai không dây chống ồn chủ động Hybrid ANC chuyên sâu, chất âm chuẩn Hi-Res Audio.',
    description: 'Trải nghiệm âm thanh tinh khiết thuần túy nhất với tai nghe chụp tai NEXUS Soundscape ANC. Sở hữu màng loa Dynamic phủ Beryllium đường kính 40mm cao cấp, Soundscape tái hiện âm trầm sâu thẳm đầy uy lực cùng âm cao trong trẻo. Bộ vi xử lý chống ồn chủ động chuyên biệt lọc sạch tới 98% tiếng ồn môi trường xung quanh, giúp bạn tập trung tuyệt đối vào âm nhạc của mình.',
    specs: {
      'Driver': '40mm Dynamic Beryllium',
      'Chống ồn': 'Hybrid ANC chuyên sâu (lên đến 45dB)',
      'Thời lượng pin': 'Hơn 50 giờ chơi nhạc liên tục (38 giờ khi bật ANC)',
      'Kết nối': 'Bluetooth 5.3 Multipoint, cổng 3.5mm',
      'Công nghệ giải mã': 'LDAC, AAC, SBC, aptX Adaptive',
      'Sạc nhanh': 'Sạc 10 phút dùng 5 giờ'
    },
    reviews: [
      { name: 'Phạm Thanh H.', rating: 5, comment: 'Âm thanh chi tiết, âm trầm lực cực thích. Khả năng chống ồn cực tốt khi đi xe bus.' },
      { name: 'Lê Gia B.', rating: 4, comment: 'Thiết kế tối giản đẹp mắt, có đệm tai bằng da êm ái, đeo lâu không bị nóng tai.' }
    ]
  },
  {
    id: 'nexus-keyboard-03',
    name: 'NEXUS CyberType Carbon',
    category: 'computing',
    price: 189,
    rating: 4.7,
    reviewCount: 98,
    tag: 'New',
    image: keyboardImg,
    shortDescription: 'Bàn phím cơ cơ học Gasket Mount 75%, case nhôm CNC anode hóa cao cấp cùng switch cơ học hotswap mượt mà.',
    description: 'NEXUS CyberType Carbon là chiếc bàn phím cơ tối thượng dành cho lập trình viên và game thủ chuyên nghiệp. Cấu trúc Gasket Mount kết hợp cùng 5 lớp foam tiêu âm cao cấp mang lại âm thanh gõ trầm ấm tròn trịa. Bộ Switch cơ học tuyến tính (Linear Switch) được lube sẵn tại nhà máy mang lại cảm giác gõ mượt mà tựa như lướt trên phím.',
    specs: {
      'Bố cục (Layout)': '75% (82 phím gọn gàng)',
      'Chất liệu case': 'Nhôm CNC anode hóa cao cấp nguyên khối',
      'Switch': 'Nexus Red Linear Switch (đã lube, lực nhấn 45g)',
      'Hotswap': 'Hỗ trợ thay switch nóng 3-pin / 5-pin',
      'Đèn LED': 'RGB từng phím điều chỉnh qua phần mềm Nexus Engine',
      'Kết nối': '3 chế độ (Cáp Type-C, Wireless 2.4Ghz, Bluetooth 5.1)'
    },
    reviews: [
      { name: 'Trần Văn K.', rating: 5, comment: 'Bàn phím nặng chịch cầm rất chắc tay, tiếng gõ phím clacky cực kỳ sướng tai!' },
      { name: 'Bùi Mỹ L.', rating: 4, comment: 'Đèn LED RGB rất đẹp mắt, phối tông màu đỏ đen của phím nhìn rất cá tính.' }
    ]
  },
  {
    id: 'nexus-watch-04',
    name: 'NEXUS Chrono Active',
    category: 'wearables',
    price: 279,
    rating: 4.6,
    reviewCount: 156,
    tag: 'Hot',
    image: watchImg,
    shortDescription: 'Đồng hồ thông minh theo dõi sức khỏe chuyên sâu, màn hình AMOLED 1.43 inch luôn hiển thị.',
    description: 'NEXUS Chrono Active kết hợp hoàn hảo giữa phong cách thiết kế tối giản Thụy Sĩ và các tính năng theo dõi sức khỏe hiện đại hàng đầu. Vỏ đồng hồ làm bằng hợp kim titanium siêu cứng bảo vệ màn hình AMOLED sắc nét được bao phủ bởi lớp kính sapphire chống trầy xước. Đồng hồ tích hợp cảm biến đo nhịp tim thế hệ mới, đo nồng độ oxy trong máu SpO2, đo mức độ căng thẳng và theo dõi hơn 120 chế độ luyện tập thể thao.',
    specs: {
      'Màn hình': '1.43 inch AMOLED Always-on Display, 466x466 pixels',
      'Chất liệu vỏ': 'Titanium cấp hàng không vũ trụ',
      'Chống nước': '5ATM (Độ sâu 50 mét)',
      'Định vị': 'GPS băng tần kép độ chính xác cao',
      'Thời lượng pin': 'Lên tới 14 ngày sử dụng bình thường',
      'Cảm biến': 'Nhịp tim PPG, SpO2, Gia tốc kế, Con quay hồi chuyển, Áp suất khí quyển'
    },
    reviews: [
      { name: 'Vũ Anh T.', rating: 5, comment: 'Pin dùng cực trâu, đeo chạy bộ cả tuần không cần sạc. GPS bắt sóng rất nhanh.' },
      { name: 'Đặng Mai P.', rating: 4, comment: 'Form đeo rất ôm tay, giao diện tối giản tinh tế, phối với đồ thể thao hay công sở đều hợp.' }
    ]
  },
  {
    id: 'nexus-mouse-05',
    name: 'NEXUS Apex Wireless Mouse',
    category: 'input',
    price: 129,
    rating: 4.8,
    reviewCount: 215,
    tag: 'Bán Chạy',
    image: mouseImg,
    shortDescription: 'Chuột chơi game không dây siêu nhẹ 54g, cảm biến quang học 30,000 DPI siêu nhạy.',
    description: 'Nổi tiếng với cấu trúc công thái học được tinh chỉnh bởi các game thủ chuyên nghiệp, NEXUS Apex mang lại sự tự do di chuyển tối đa nhờ trọng lượng siêu nhẹ 54g. Chuột trang bị cảm biến quang học tiên tiến hàng đầu thế giới với độ phân giải lên đến 30,000 DPI và khả năng tracking chính xác 99.8%. Switch quang học độc quyền của Nexus tăng độ bền lên tới 90 triệu lần click và triệt tiêu hoàn toàn lỗi double-click.',
    specs: {
      'Trọng lượng': '54g (thiết kế không lỗ)',
      'Cảm biến': 'Nexus Focus Pro 30K Optical Sensor',
      'Độ nhạy': '30,000 DPI',
      'Tốc độ tối đa': '750 IPS',
      'Gia tốc tối đa': '70G',
      'Polling Rate': 'Lên đến 4000Hz ở chế độ không dây',
      'Thời lượng pin': 'Khoảng 90 giờ liên tục ở polling rate 1000Hz'
    },
    reviews: [
      { name: 'Đoàn Quốc D.', rating: 5, comment: 'Chuột siêu nhẹ, lướt trên pad mượt như bay. Chơi game bắn súng FPS thì hết nấc.' },
      { name: 'Nguyễn Quỳnh N.', rating: 5, comment: 'Click phím rất nảy và giòn, không bị ọp ẹp như mấy con chuột nhẹ hãng khác.' }
    ]
  },
  {
    id: 'nexus-speaker-06',
    name: 'NEXUS Prism Studio Monitor',
    category: 'audio',
    price: 499,
    rating: 4.9,
    reviewCount: 86,
    tag: 'Premium',
    image: speakerImg,
    shortDescription: 'Hệ thống loa để bàn Studio Monitor không dây cao cấp, tích hợp mạch DSP chuyên nghiệp và hiệu ứng LED Prism.',
    description: 'Mang không gian âm nhạc chuyên nghiệp của phòng thu về góc làm việc của bạn với NEXUS Prism Studio Monitor. Hệ thống loa sở hữu loa treble vòm lụa 1 inch tái tạo dải âm cao lung linh chi tiết cùng loa bass 4 inch màng Kevlar tái tạo âm trung trầm sâu và đầy uy lực. Loa được tích hợp dải đèn LED Prism RGB tinh tế ở mặt sau, phản xạ ánh sáng đồng điệu theo giai điệu âm nhạc tạo hiệu ứng thị giác tuyệt đỉnh.',
    specs: {
      'Công suất tổng': '120W RMS (60W mỗi loa)',
      'Loa Treble': '1 inch Silk Dome Tweeter',
      'Loa Bass': '4 inch Kevlar Cone Woofer',
      'Dải tần đáp ứng': '45Hz - 22,000Hz',
      'Đầu vào': 'Bluetooth 5.2, USB-DAC, Cáp Quang (Optical), RCA, 3.5mm Aux',
      'Mạch xử lý': 'DSP tích hợp bộ DAC 24-bit/96kHz'
    },
    reviews: [
      { name: 'Nguyễn Tấn L.', rating: 5, comment: 'Chất âm trung thực, sạch sẽ. Tích hợp cổng USB-DAC cắm vào máy tính nghe nhạc đỉnh thực sự.' },
      { name: 'Lê Thu Thủy', rating: 5, comment: 'Loa đẹp như một món đồ decor công nghệ cao cấp. Dải LED hắt tường rất chill buổi tối.' }
    ]
  }
]

export const categories = [
  { id: 'all', name: 'Tất cả' },
  { id: 'wearables', name: 'Thiết bị Đeo' },
  { id: 'audio', name: 'Âm thanh' },
  { id: 'computing', name: 'Máy tính' },
  { id: 'input', name: 'Thiết bị ngoại vi' }
]
