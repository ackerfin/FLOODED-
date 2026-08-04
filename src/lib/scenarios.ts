 // FLOODED - Survival Scenarios Database (Offline)
 import type { SurvivalScenario, ScenarioType } from '@/types';
 
 export const scenarios: SurvivalScenario[] = [
   {
     id: 'house_flooding',
     titleVi: 'Nhà bị ngập nước',
     titleEn: 'House Flooding',
     iconName: 'Home',
     steps: [
       {
         timeframe: '0-30 giây',
         actionVi: 'NGẮT ĐIỆN NGAY! Tìm cầu dao chính và tắt.',
         actionEn: 'CUT POWER NOW! Find main breaker and turn off.',
         critical: true,
       },
       {
         timeframe: '30 giây - 2 phút',
         actionVi: 'Di chuyển lên tầng cao hoặc mái nhà. Mang theo điện thoại, đèn pin.',
         actionEn: 'Move to higher floor or rooftop. Bring phone, flashlight.',
         critical: true,
       },
       {
         timeframe: '2-5 phút',
         actionVi: 'Gọi cứu hộ 113 hoặc 114. Đánh dấu vị trí bằng vải sáng màu.',
         actionEn: 'Call rescue 113 or 114. Mark location with bright cloth.',
       },
       {
         timeframe: 'Chờ cứu hộ',
         actionVi: 'Ở yên tại chỗ an toàn. Tiết kiệm pin điện thoại. Đừng cố bơi ra ngoài.',
         actionEn: 'Stay in safe place. Save phone battery. Do not try to swim out.',
       },
     ],
     doNot: [
       'KHÔNG đi bộ qua nước ngập - dòng chảy có thể cuốn bạn',
       'KHÔNG chạm vào thiết bị điện khi ướt',
       'KHÔNG uống nước ngập - có thể bị ô nhiễm',
       'KHÔNG cố cứu đồ đạc - mạng sống là trên hết',
     ],
   },
   {
     id: 'person_injured',
     titleVi: 'Có người bị thương',
     titleEn: 'Person Injured',
     iconName: 'HeartPulse',
     steps: [
       {
         timeframe: '0-30 giây',
         actionVi: 'Đánh giá: Nạn nhân còn tỉnh không? Có chảy máu nhiều không?',
         actionEn: 'Assess: Is victim conscious? Heavy bleeding?',
         critical: true,
       },
       {
         timeframe: '30 giây - 1 phút',
         actionVi: 'Nếu chảy máu: Dùng vải sạch ép chặt vào vết thương. Giữ cao hơn tim.',
         actionEn: 'If bleeding: Press clean cloth firmly on wound. Keep above heart.',
         critical: true,
       },
       {
         timeframe: '1-3 phút',
         actionVi: 'KHÔNG di chuyển nạn nhân nếu nghi gãy xương cột sống. Giữ ấm.',
         actionEn: 'DO NOT move if suspected spine injury. Keep warm.',
       },
       {
         timeframe: 'Chờ cứu hộ',
         actionVi: 'Nói chuyện nhẹ nhàng với nạn nhân. Theo dõi nhịp thở.',
         actionEn: 'Talk calmly to victim. Monitor breathing.',
       },
     ],
     doNot: [
       'KHÔNG kéo hoặc di chuyển nếu nghi chấn thương cột sống',
       'KHÔNG tháo vật đâm vào cơ thể',
       'KHÔNG cho ăn uống nếu bất tỉnh hoặc nghi chấn thương bụng',
       'KHÔNG thả tay khi đang cầm máu',
     ],
   },
   {
     id: 'person_unconscious',
     titleVi: 'Người bất tỉnh',
     titleEn: 'Person Unconscious',
     iconName: 'UserX',
     steps: [
       {
         timeframe: '0-10 giây',
         actionVi: 'GỌI LỚN: "Anh/Chị ơi! Có nghe không?" Vỗ vai nhẹ.',
         actionEn: 'SHOUT: "Can you hear me?" Tap shoulder gently.',
         critical: true,
       },
       {
         timeframe: '10-30 giây',
         actionVi: 'Kiểm tra thở: Nhìn ngực phồng, nghe hơi thở, cảm nhận gió tại mũi.',
         actionEn: 'Check breathing: Watch chest rise, listen, feel breath at nose.',
         critical: true,
       },
       {
         timeframe: '30 giây - 1 phút',
         actionVi: 'Nếu CÓ thở: Đặt nằm nghiêng an toàn. Nếu KHÔNG thở: Bắt đầu CPR.',
         actionEn: 'If BREATHING: Recovery position. If NOT: Start CPR.',
         critical: true,
       },
       {
         timeframe: 'CPR',
         actionVi: 'Ép ngực 100-120 lần/phút, sâu 5cm. 30 lần ép : 2 lần thổi.',
         actionEn: 'Chest compressions 100-120/min, 5cm deep. 30 compressions : 2 breaths.',
       },
     ],
     doNot: [
       'KHÔNG đổ nước vào mặt để làm tỉnh',
       'KHÔNG cho bất cứ thứ gì vào miệng',
       'KHÔNG bỏ đi - cần theo dõi liên tục',
       'KHÔNG ngừng CPR cho đến khi có người thay hoặc nạn nhân tỉnh',
     ],
   },
   {
     id: 'trapped_vehicle',
     titleVi: 'Kẹt trong xe ngập',
     titleEn: 'Trapped in Flooded Vehicle',
     iconName: 'Car',
     steps: [
       {
         timeframe: '0-10 giây',
         actionVi: 'THÁO DÂY AN TOÀN NGAY! Mở khóa cửa (khóa điện có thể hỏng).',
         actionEn: 'UNBUCKLE NOW! Unlock doors (electric locks may fail).',
         critical: true,
       },
       {
         timeframe: '10-30 giây',
         actionVi: 'Thử mở cửa. Nếu không được, hạ cửa kính hoặc đập góc cửa kính.',
         actionEn: 'Try opening door. If not, lower window or break corner of window.',
         critical: true,
       },
       {
         timeframe: 'Nếu cửa không mở được',
         actionVi: 'ĐỢI! Khi nước ngập gần đầy xe, áp suất sẽ cân bằng, cửa sẽ mở được.',
         actionEn: 'WAIT! When water nearly fills car, pressure equalizes, door will open.',
       },
       {
         timeframe: 'Thoát ra',
         actionVi: 'Hít thở sâu, đẩy mình ra khỏi xe, bơi lên mặt nước.',
         actionEn: 'Take deep breath, push out of car, swim to surface.',
       },
     ],
     doNot: [
       'KHÔNG cố mở cửa khi nước mới bắt đầu ngập - áp suất quá lớn',
       'KHÔNG hoảng loạn - bạn có nhiều thời gian hơn bạn nghĩ',
       'KHÔNG mở điện thoại - tập trung thoát thân',
       'KHÔNG để trẻ em tự thoát - giúp trẻ trước',
     ],
   },
   {
     id: 'building_collapse',
     titleVi: 'Sập nhà/công trình',
     titleEn: 'Building Collapse',
     iconName: 'Building',
     steps: [
       {
         timeframe: '0-5 giây',
         actionVi: 'NẰM XUỐNG! Chui dưới bàn chắc hoặc nằm sát tường chịu lực.',
         actionEn: 'DROP! Get under sturdy table or against load-bearing wall.',
         critical: true,
       },
       {
         timeframe: '5-30 giây',
         actionVi: 'Che đầu và cổ bằng tay. Cuộn người lại nhỏ gọn.',
         actionEn: 'Cover head and neck with arms. Curl into small ball.',
         critical: true,
       },
       {
         timeframe: 'Sau khi ổn định',
         actionVi: 'Kiểm tra bản thân có bị thương không. Di chuyển nhẹ nhàng.',
         actionEn: 'Check yourself for injuries. Move carefully.',
       },
       {
         timeframe: 'Tìm lối thoát',
         actionVi: 'Dùng đèn pin. Gõ vào ống nước để tạo tiếng. KHÔNG hét - tiết kiệm sức.',
         actionEn: 'Use flashlight. Tap on pipes for sound. DON\'T shout - save energy.',
       },
     ],
     doNot: [
       'KHÔNG chạy khi đang sập - nằm xuống ngay',
       'KHÔNG đứng gần cửa kính',
       'KHÔNG sử dụng thang máy',
       'KHÔNG đốt lửa - có thể có rò rỉ gas',
     ],
   },
   {
     id: 'power_outage',
     titleVi: 'Mất điện kéo dài',
     titleEn: 'Extended Power Outage',
     iconName: 'Zap',
     steps: [
       {
         timeframe: '0-5 phút',
         actionVi: 'Kiểm tra cầu dao. Xác nhận mất điện diện rộng hay chỉ nhà mình.',
         actionEn: 'Check breaker. Confirm if widespread or just your home.',
       },
       {
         timeframe: '5-30 phút',
         actionVi: 'Tắt/rút các thiết bị điện lớn. Giữ tủ lạnh đóng kín.',
         actionEn: 'Turn off/unplug large appliances. Keep fridge closed.',
       },
       {
         timeframe: '1-4 giờ',
         actionVi: 'Sử dụng đèn pin, nến (cẩn thận cháy). Sạc điện thoại từ pin dự phòng.',
         actionEn: 'Use flashlight, candles (fire safety). Charge phone from power bank.',
       },
       {
         timeframe: 'Kéo dài',
         actionVi: 'Ưu tiên: Nước uống, thuốc men, thông tin liên lạc. Giữ ấm/mát cơ thể.',
         actionEn: 'Prioritize: Water, medicine, communication. Stay warm/cool.',
       },
     ],
     doNot: [
       'KHÔNG mở tủ lạnh thường xuyên - thực phẩm giữ lạnh 4 giờ nếu đóng kín',
       'KHÔNG sử dụng bếp gas/than trong nhà kín',
       'KHÔNG để nến gần vật liệu dễ cháy',
       'KHÔNG lãng phí pin điện thoại vào game/video',
     ],
   },
   {
     id: 'water_contamination',
     titleVi: 'Nguồn nước bị ô nhiễm',
     titleEn: 'Water Contamination',
     iconName: 'Droplets',
     steps: [
       {
         timeframe: 'Ngay lập tức',
         actionVi: 'NGỪNG sử dụng nước máy để uống, nấu ăn, đánh răng.',
         actionEn: 'STOP using tap water for drinking, cooking, brushing teeth.',
         critical: true,
       },
       {
         timeframe: 'Thu thập nước',
         actionVi: 'Sử dụng nước đóng chai. Thu nước mưa vào vật chứa sạch.',
         actionEn: 'Use bottled water. Collect rainwater in clean containers.',
       },
       {
         timeframe: 'Xử lý nước',
         actionVi: 'Đun sôi ít nhất 3 phút. Hoặc dùng viên lọc nước/clo.',
         actionEn: 'Boil for at least 3 minutes. Or use water purification tablets/chlorine.',
       },
       {
         timeframe: 'Vệ sinh',
         actionVi: 'Rửa tay bằng xà phòng và nước đã xử lý. Tránh nuốt nước khi tắm.',
         actionEn: 'Wash hands with soap and treated water. Avoid swallowing when bathing.',
       },
     ],
     doNot: [
       'KHÔNG uống nước chưa xử lý dù trông trong',
       'KHÔNG rửa vết thương bằng nước ô nhiễm',
       'KHÔNG cho trẻ em chơi trong nước ngập',
       'KHÔNG ăn thực phẩm đã tiếp xúc nước lũ',
     ],
   },
   {
     id: 'medical_emergency',
     titleVi: 'Cấp cứu y tế',
     titleEn: 'Medical Emergency',
     iconName: 'Ambulance',
     steps: [
       {
         timeframe: '0-30 giây',
         actionVi: 'Gọi 115 (cấp cứu). Nói rõ: địa chỉ, tình trạng, số người.',
         actionEn: 'Call 115 (emergency). State: address, condition, number of people.',
         critical: true,
       },
       {
         timeframe: '30 giây - 2 phút',
         actionVi: 'Đánh giá ABC: Airway (đường thở), Breathing (hô hấp), Circulation (tuần hoàn).',
         actionEn: 'Check ABC: Airway, Breathing, Circulation.',
         critical: true,
       },
       {
         timeframe: 'Chờ cứu hộ',
         actionVi: 'Giữ nạn nhân bình tĩnh, nằm yên. Nới lỏng quần áo.',
         actionEn: 'Keep victim calm, lying still. Loosen clothing.',
       },
       {
         timeframe: 'Khi cứu hộ đến',
         actionVi: 'Cung cấp: thuốc đang dùng, tiền sử bệnh, dị ứng.',
         actionEn: 'Provide: current medications, medical history, allergies.',
       },
     ],
     doNot: [
       'KHÔNG cho nạn nhân ngất uống nước',
       'KHÔNG di chuyển nạn nhân trừ khi nguy hiểm tức thì',
       'KHÔNG tự ý cho thuốc',
       'KHÔNG để nạn nhân một mình',
     ],
   },
 ];
 
 export function getScenarioById(id: ScenarioType): SurvivalScenario | undefined {
   return scenarios.find(s => s.id === id);
 }
 
 // Simple keyword matching NLP
 const keywordMap: Record<string, ScenarioType> = {
   'ngập': 'house_flooding',
   'lụt': 'house_flooding',
   'nước': 'house_flooding',
   'flood': 'house_flooding',
   'thương': 'person_injured',
   'injured': 'person_injured',
   'máu': 'person_injured',
   'blood': 'person_injured',
   'gãy': 'person_injured',
   'bất tỉnh': 'person_unconscious',
   'unconscious': 'person_unconscious',
   'không thở': 'person_unconscious',
   'ngất': 'person_unconscious',
   'xe': 'trapped_vehicle',
   'car': 'trapped_vehicle',
   'vehicle': 'trapped_vehicle',
   'ô tô': 'trapped_vehicle',
   'sập': 'building_collapse',
   'collapse': 'building_collapse',
   'đổ': 'building_collapse',
   'điện': 'power_outage',
   'power': 'power_outage',
   'ô nhiễm': 'water_contamination',
   'contaminated': 'water_contamination',
   'bẩn': 'water_contamination',
   'cấp cứu': 'medical_emergency',
   'emergency': 'medical_emergency',
   'đau tim': 'medical_emergency',
 };
 
 export function matchScenarioFromText(text: string): ScenarioType | null {
   const lowerText = text.toLowerCase();
   
   for (const [keyword, scenario] of Object.entries(keywordMap)) {
     if (lowerText.includes(keyword)) {
       return scenario;
     }
   }
   
   return null;
 }