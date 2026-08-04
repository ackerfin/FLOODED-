// FLOODED - Survival Categories & Cases Database (Offline)
// Scalable structure: categories → cases
// Total: 9 categories, 110 cases

export interface SurvivalCategory {
  id: string;
  titleVi: string;
  titleEn: string;
  descriptionVi?: string;
  descriptionEn?: string;
  iconName: string;
  order: number;
}

export interface SurvivalStep {
  timeframe: string;
  actionVi: string;
  actionEn: string;
  critical?: boolean;
}

export interface SurvivalCase {
  id: string;
  categoryId: string;
  titleVi: string;
  titleEn: string;
  iconName: string;
  steps: SurvivalStep[];
  donts: string[];
  sosWhen?: string[];
  priorityTags?: string[];
}

// ============ CATEGORIES ============

export const categories: SurvivalCategory[] = [
  {
    id: 'electrical_fire',
    titleVi: 'An toàn điện & cháy nổ',
    titleEn: 'Electrical & Fire Safety',
    descriptionVi: 'Xử lý điện giật, rò rỉ gas, cháy',
    descriptionEn: 'Handle electrocution, gas leaks, fire',
    iconName: 'Zap',
    order: 1,
  },
  {
    id: 'movement_evacuation',
    titleVi: 'Di chuyển & sơ tán',
    titleEn: 'Movement & Evacuation',
    descriptionVi: 'Thoát khỏi vùng nguy hiểm an toàn',
    descriptionEn: 'Safely leave danger zones',
    iconName: 'Route',
    order: 2,
  },
  {
    id: 'building_collapse',
    titleVi: 'Nhà cửa & sập đổ',
    titleEn: 'Building & Collapse',
    descriptionVi: 'Xử lý khi công trình hư hại',
    descriptionEn: 'Handle damaged structures',
    iconName: 'Building',
    order: 3,
  },
  {
    id: 'water_hygiene',
    titleVi: 'Nước sạch & vệ sinh sau lũ',
    titleEn: 'Water & Post-Flood Hygiene',
    descriptionVi: 'Bảo vệ sức khỏe sau ngập',
    descriptionEn: 'Protect health after flooding',
    iconName: 'Droplets',
    order: 4,
  },
  {
    id: 'injury_firstaid',
    titleVi: 'Chấn thương & sơ cứu',
    titleEn: 'Injury & First Aid',
    descriptionVi: 'Xử lý vết thương, gãy xương',
    descriptionEn: 'Handle wounds, fractures',
    iconName: 'HeartPulse',
    order: 5,
  },
  {
    id: 'breathing_drowning',
    titleVi: 'Hô hấp / đuối nước',
    titleEn: 'Breathing / Drowning',
    descriptionVi: 'Cấp cứu hô hấp, đuối nước',
    descriptionEn: 'Respiratory emergency, drowning',
    iconName: 'Wind',
    order: 6,
  },
  {
    id: 'cold_hypothermia',
    titleVi: 'Lạnh / hạ thân nhiệt',
    titleEn: 'Cold / Hypothermia',
    descriptionVi: 'Xử lý khi bị lạnh, ngâm nước',
    descriptionEn: 'Handle cold exposure, wet conditions',
    iconName: 'Snowflake',
    order: 7,
  },
  {
    id: 'vulnerable_groups',
    titleVi: 'Nhóm dễ tổn thương',
    titleEn: 'Vulnerable Groups',
    descriptionVi: 'Trẻ em, người già, bệnh nền',
    descriptionEn: 'Children, elderly, chronic conditions',
    iconName: 'Users',
    order: 8,
  },
  {
    id: 'psychological_support',
    titleVi: 'Hỗ trợ tâm lý – Giữ bình tĩnh',
    titleEn: 'Psychological Support',
    descriptionVi: 'Xử lý hoảng loạn, stress, cô đơn',
    descriptionEn: 'Handle panic, stress, isolation',
    iconName: 'Heart',
    order: 9,
  },
];

// ============ CASES ============

export const cases: SurvivalCase[] = [
  // ========== [1] AN TOÀN ĐIỆN & CHÁY NỔ (13 cases) ==========
  {
    id: 'electrical_leak_water',
    categoryId: 'electrical_fire',
    titleVi: 'Điện rò trong nước',
    titleEn: 'Electrical Leak in Water',
    iconName: 'Zap',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'KHÔNG CHẠM NƯỚC! Lùi xa ít nhất 10m khỏi vùng nước nghi rò điện.',
        actionEn: 'DO NOT TOUCH WATER! Back away at least 10m from suspected area.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Cắt cầu dao tổng nếu có thể tiếp cận an toàn (không qua nước).',
        actionEn: 'Cut main breaker if safely accessible (not through water).',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Cảnh báo mọi người xung quanh. Dùng vật cản chặn lối vào vùng nguy hiểm.',
        actionEn: 'Warn people around. Block entrance to danger zone.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Gọi điện lực 19001006 hoặc 113. Không để ai tiến vào.',
        actionEn: 'Call power company or 113. Keep everyone away.',
      },
    ],
    donts: [
      'KHÔNG bước vào nước nếu nghi có điện',
      'KHÔNG dùng tay không kéo người bị giật',
      'KHÔNG tự sửa đường dây điện',
      'KHÔNG nghĩ nước cạn là hết điện',
    ],
    sosWhen: ['Có người bị điện giật', 'Không cắt được nguồn điện'],
    priorityTags: ['điện', 'nước'],
  },
  {
    id: 'fallen_wire',
    categoryId: 'electrical_fire',
    titleVi: 'Dây điện rơi/đứt',
    titleEn: 'Fallen/Broken Power Line',
    iconName: 'Cable',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'ĐỨNG YÊN nếu gần dây! Không chạy - bước nhảy chân chim ra xa.',
        actionEn: 'FREEZE if near wire! Don\'t run - shuffle feet to move away.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Cách xa tối thiểu 10m. Coi như dây vẫn có điện.',
        actionEn: 'Stay at least 10m away. Assume wire is live.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Chặn khu vực bằng vật chướng ngại. Cảnh báo người khác.',
        actionEn: 'Block area with obstacles. Warn others.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Gọi điện lực hoặc 113. Canh gác không cho ai lại gần.',
        actionEn: 'Call power company or 113. Guard area.',
      },
    ],
    donts: [
      'KHÔNG chạm vào dây điện bằng bất kỳ vật gì',
      'KHÔNG cố di chuyển dây điện',
      'KHÔNG lái xe qua dây điện',
      'KHÔNG tưới nước lên dây điện',
    ],
    priorityTags: ['điện'],
  },
  {
    id: 'wet_electrical_panel',
    categoryId: 'electrical_fire',
    titleVi: 'Tủ điện/ổ cắm bị ướt',
    titleEn: 'Wet Electrical Panel/Outlet',
    iconName: 'PlugZap',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'KHÔNG CHẠM! Tay phải khô, chân đi dép khô, cắt cầu dao tổng NGAY.',
        actionEn: 'DON\'T TOUCH! Dry hands, dry footwear, cut main breaker NOW.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Rút tất cả phích cắm thiết bị (nếu cầu dao đã cắt). Không bật lại điện.',
        actionEn: 'Unplug all devices (after breaker off). Don\'t restore power.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Mở cửa thông gió. Để tủ điện/ổ cắm khô tự nhiên.',
        actionEn: 'Open doors for ventilation. Let panel/outlet dry naturally.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Gọi thợ điện kiểm tra trước khi bật lại. Có thể chập cháy.',
        actionEn: 'Call electrician before restoring power. Risk of short circuit.',
      },
    ],
    donts: [
      'KHÔNG bật lại điện khi còn ướt',
      'KHÔNG dùng máy sấy sấy tủ điện',
      'KHÔNG để trẻ lại gần',
      'KHÔNG bỏ qua - có thể cháy',
    ],
    priorityTags: ['điện', 'cháy'],
  },
  {
    id: 'gas_leak',
    categoryId: 'electrical_fire',
    titleVi: 'Nghi rò gas',
    titleEn: 'Suspected Gas Leak',
    iconName: 'Flame',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'KHÔNG BẬT ĐÈN, KHÔNG BẬT QUẸT! Mở cửa/cửa sổ ngay.',
        actionEn: 'NO LIGHTS, NO SPARKS! Open doors/windows immediately.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Đóng van bình gas. Di chuyển ra ngoài nhà.',
        actionEn: 'Close gas cylinder valve. Move outside.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Đưa mọi người ra xa. Không dùng điện thoại trong vùng nghi rò.',
        actionEn: 'Evacuate everyone. No phone calls in leak area.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Gọi 114 (PCCC) hoặc công ty gas từ xa. Chờ khí tan.',
        actionEn: 'Call 114 (Fire) or gas company from distance. Wait for gas to disperse.',
      },
    ],
    donts: [
      'KHÔNG bật/tắt công tắc điện',
      'KHÔNG sử dụng điện thoại trong nhà',
      'KHÔNG tìm nguồn rò bằng quẹt lửa',
      'KHÔNG bỏ qua mùi khí lạ',
    ],
    priorityTags: ['gas', 'cháy'],
  },
  {
    id: 'carbon_monoxide',
    categoryId: 'electrical_fire',
    titleVi: 'Ngộ độc CO (máy phát điện)',
    titleEn: 'CO Poisoning (Generator)',
    iconName: 'CloudOff',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'TẮT MÁY PHÁT ĐIỆN! Mở hết cửa, di chuyển nạn nhân ra không khí.',
        actionEn: 'TURN OFF GENERATOR! Open all doors, move victim to fresh air.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Kiểm tra hô hấp. Nới lỏng quần áo.',
        actionEn: 'Check breathing. Loosen clothing.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Nếu nạn nhân đau đầu, buồn nôn, chóng mặt - đó là triệu chứng CO.',
        actionEn: 'Headache, nausea, dizziness are CO symptoms.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Gọi 115. Giữ nạn nhân tỉnh táo, tiếp tục thông gió.',
        actionEn: 'Call 115. Keep victim awake, continue ventilation.',
      },
    ],
    donts: [
      'KHÔNG chạy máy phát điện trong nhà/gara',
      'KHÔNG quay lại nhà khi chưa thông gió đủ',
      'KHÔNG bỏ qua triệu chứng nhẹ',
      'KHÔNG cho nạn nhân ngủ nếu nghi ngộ độc',
    ],
    priorityTags: ['khí độc', 'hô hấp'],
  },
  {
    id: 'fire_during_flood',
    categoryId: 'electrical_fire',
    titleVi: 'Cháy trong nhà khi đang ngập',
    titleEn: 'Fire During Flooding',
    iconName: 'Flame',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'RA KHỎI NHÀ! Không dập lửa nếu đã lan rộng.',
        actionEn: 'GET OUT! Don\'t fight fire if already spreading.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Đóng cửa phòng cháy (nếu có thể). Cúi thấp, bò nếu có khói.',
        actionEn: 'Close door to burning room (if possible). Stay low, crawl if smoky.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Di chuyển đến vùng cao hơn nếu nước chặn lối. Đánh dấu vị trí.',
        actionEn: 'Move to higher ground if water blocks exit. Mark your location.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Gọi 114. Vẫy vải sáng. KHÔNG nhảy từ tầng cao.',
        actionEn: 'Call 114. Wave bright cloth. DON\'T jump from height.',
      },
    ],
    donts: [
      'KHÔNG dùng nước lũ dập lửa điện',
      'KHÔNG quay lại lấy đồ',
      'KHÔNG mở cửa nóng (sờ tay nắm trước)',
      'KHÔNG chạy thẳng qua lửa',
    ],
    priorityTags: ['cháy', 'nước'],
  },
  // NEW CASES for electrical_fire
  {
    id: 'power_outage_area',
    categoryId: 'electrical_fire',
    titleVi: 'Mất điện toàn khu',
    titleEn: 'Area-Wide Power Outage',
    iconName: 'PowerOff',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Tắt thiết bị đang cắm. Rút sạc nếu an toàn.',
        actionEn: 'Turn off plugged devices. Unplug chargers if safe.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Bật đèn pin, giữ điện thoại ở chế độ tiết kiệm pin.',
        actionEn: 'Turn on flashlight, keep phone in power saving mode.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Kiểm tra cầu dao nếu KHÔ (không chạm khi ướt).',
        actionEn: 'Check breaker if DRY (don\'t touch when wet).',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Ở khu vực khô, tránh chạm kim loại.',
        actionEn: 'Stay in dry area, avoid touching metal.',
      },
    ],
    donts: [
      'KHÔNG tự sửa điện khi sàn ướt',
      'KHÔNG chạm tủ điện bằng tay ướt',
    ],
    sosWhen: ['Có tia lửa/khét', 'Người bị giật'],
    priorityTags: ['điện', 'mất điện'],
  },
  {
    id: 'smell_burning_outlet',
    categoryId: 'electrical_fire',
    titleVi: 'Mùi khét / tia lửa ổ cắm',
    titleEn: 'Burning Smell / Sparking Outlet',
    iconName: 'Flame',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Ngắt cầu dao tổng (nếu khô). Hô người tránh xa.',
        actionEn: 'Cut main breaker (if dry). Warn people to stay away.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Dùng bình chữa cháy nếu có. Nếu không: phủ khăn dày khô.',
        actionEn: 'Use fire extinguisher if available. Otherwise: cover with thick dry cloth.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Gọi 114/113 nếu cháy lan. Đóng cửa phòng để hạn chế cháy.',
        actionEn: 'Call 114/113 if fire spreads. Close room door to limit fire.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Đứng nơi thoáng, chuẩn bị sơ tán.',
        actionEn: 'Stand in ventilated area, prepare to evacuate.',
      },
    ],
    donts: [
      'KHÔNG đổ nước vào ổ điện',
      'KHÔNG mở cửa phòng cháy liên tục',
    ],
    sosWhen: ['Khói dày, cháy lan nhanh'],
    priorityTags: ['điện', 'cháy'],
  },
  {
    id: 'power_bank_swelling',
    categoryId: 'electrical_fire',
    titleVi: 'Sạc dự phòng/pin phồng nóng',
    titleEn: 'Swelling/Hot Power Bank',
    iconName: 'Battery',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Ngừng sạc, tách khỏi vật dễ cháy.',
        actionEn: 'Stop charging, separate from flammable objects.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Đặt lên nền gạch/kim loại KHÔ, xa người.',
        actionEn: 'Place on dry tile/metal surface, away from people.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Nếu có khói: sơ tán khỏi phòng, gọi 114.',
        actionEn: 'If smoke appears: evacuate room, call 114.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Không dùng lại thiết bị, chờ xử lý an toàn.',
        actionEn: 'Don\'t reuse device, wait for safe disposal.',
      },
    ],
    donts: [
      'KHÔNG chọc/đè pin',
      'KHÔNG bỏ pin vào nước',
    ],
    sosWhen: ['Có khói, lửa, mùi khét'],
    priorityTags: ['pin', 'cháy'],
  },
  {
    id: 'generator_wrong_place',
    categoryId: 'electrical_fire',
    titleVi: 'Máy phát điện đặt sai chỗ',
    titleEn: 'Generator in Wrong Location',
    iconName: 'CloudOff',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Tắt máy. Đưa ra nơi thoáng, ngoài nhà nếu được.',
        actionEn: 'Turn off. Move to ventilated area, outside if possible.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Mở cửa/thoáng khí. Đưa người ra khỏi phòng kín.',
        actionEn: 'Open doors/ventilate. Move people out of enclosed space.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Kiểm tra người có đau đầu/chóng mặt. Gọi hỗ trợ nếu có.',
        actionEn: 'Check if anyone has headache/dizziness. Call for help if so.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Chỉ vận hành máy phát ở ngoài trời, tránh cửa sổ.',
        actionEn: 'Only run generator outdoors, away from windows.',
      },
    ],
    donts: [
      'KHÔNG chạy máy phát trong phòng kín/ban công kín',
    ],
    sosWhen: ['Người lơ mơ, ngất, khó thở'],
    priorityTags: ['khí độc', 'máy phát điện'],
  },
  {
    id: 'water_touching_low_outlet',
    categoryId: 'electrical_fire',
    titleVi: 'Nước ngập chạm ổ điện thấp',
    titleEn: 'Water Touching Low Outlets',
    iconName: 'PlugZap',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'KHÔNG bước xuống nước. Ngắt điện tổng nếu có lối khô.',
        actionEn: 'DON\'T step into water. Cut main power if dry path exists.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Di chuyển lên cao. Cảnh báo người khác.',
        actionEn: 'Move to higher ground. Warn others.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Nếu không ngắt được: giữ khoảng cách, chờ điện lực/cứu hộ.',
        actionEn: 'If cannot disconnect: keep distance, wait for power company/rescue.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Ở tầng cao, tránh chạm kim loại ướt.',
        actionEn: 'Stay on upper floor, avoid touching wet metal.',
      },
    ],
    donts: [
      'KHÔNG lội qua khu có ổ điện/thiết bị ướt',
    ],
    sosWhen: ['Có người bị giật', 'Nước dâng nhanh'],
    priorityTags: ['điện', 'nước'],
  },
  {
    id: 'candle_fire_blackout',
    categoryId: 'electrical_fire',
    titleVi: 'Cháy do nến/đèn dầu',
    titleEn: 'Candle/Oil Lamp Fire',
    iconName: 'Flame',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Tắt nguồn lửa ngay. Dời vật dễ cháy.',
        actionEn: 'Extinguish fire source immediately. Remove flammables.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Dùng khăn ướt/phủ nắp kim loại để dập lửa nhỏ.',
        actionEn: 'Use wet cloth/metal lid to smother small fire.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Nếu cháy lan: gọi 114, sơ tán.',
        actionEn: 'If fire spreads: call 114, evacuate.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Tránh hít khói, đứng nơi thoáng.',
        actionEn: 'Avoid inhaling smoke, stand in ventilated area.',
      },
    ],
    donts: [
      'KHÔNG đặt nến gần rèm/giấy',
      'KHÔNG để trẻ em gần lửa',
    ],
    sosWhen: ['Cháy lan, khói dày'],
    priorityTags: ['cháy'],
  },
  {
    id: 'electric_shock_conscious',
    categoryId: 'electrical_fire',
    titleVi: 'Bị điện giật (còn tỉnh)',
    titleEn: 'Electric Shock (Conscious)',
    iconName: 'Zap',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'NGẮT NGUỒN điện trước. Không chạm người khi chưa chắc chắn.',
        actionEn: 'CUT POWER first. Don\'t touch person until sure it\'s safe.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Kiểm tra bỏng/đau ngực. Cho ngồi yên.',
        actionEn: 'Check for burns/chest pain. Have them sit still.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Gọi 115/114 nếu đau ngực, khó thở, bỏng nặng.',
        actionEn: 'Call 115/114 if chest pain, difficulty breathing, severe burns.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Theo dõi tỉnh táo, giữ ấm.',
        actionEn: 'Monitor alertness, keep warm.',
      },
    ],
    donts: [
      'KHÔNG kéo nạn nhân bằng tay trần khi chưa ngắt điện',
    ],
    sosWhen: ['Ngất, co giật, khó thở'],
    priorityTags: ['điện', 'bị thương'],
  },
  {
    id: 'low_battery_phone',
    categoryId: 'electrical_fire',
    titleVi: 'Thiếu pin điện thoại',
    titleEn: 'Low Phone Battery',
    iconName: 'BatteryLow',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Bật tiết kiệm pin, giảm sáng, tắt rung.',
        actionEn: 'Enable power saving, reduce brightness, disable vibration.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Chỉ giữ 1 kênh liên lạc + app FLOODED.',
        actionEn: 'Keep only 1 communication channel + FLOODED app.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Sạc bằng pin dự phòng (nếu an toàn, khô ráo).',
        actionEn: 'Charge with power bank (if safe and dry).',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Giữ máy khô, bọc túi chống nước.',
        actionEn: 'Keep phone dry, wrap in waterproof bag.',
      },
    ],
    donts: [
      'KHÔNG sạc khi cổng sạc ướt',
    ],
    sosWhen: ['Không thể liên lạc + đang nguy hiểm'],
    priorityTags: ['pin', 'liên lạc'],
  },

  // ========== [2] DI CHUYỂN & SƠ TÁN (13 cases) ==========
  {
    id: 'fast_current_walking',
    categoryId: 'movement_evacuation',
    titleVi: 'Gặp nước xiết khi đi bộ',
    titleEn: 'Fast Current While Walking',
    iconName: 'Waves',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'DỪNG LẠI! Đánh giá dòng chảy. Nếu nước cao ngang đầu gối, KHÔNG qua.',
        actionEn: 'STOP! Assess current. If water is knee-high, DO NOT cross.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Tìm vật bám (cây, cột). Di chuyển nghiêng người, bước nhỏ.',
        actionEn: 'Find something to hold (tree, pole). Move sideways, small steps.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Nếu bị cuốn: NỔI! Nằm ngửa, chân xuôi theo dòng, tay bơi vào bờ.',
        actionEn: 'If swept away: FLOAT! On back, feet downstream, swim to shore.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Bám chặt vào vật nổi hoặc bờ. Hét kêu cứu.',
        actionEn: 'Hold onto floating object or shore. Shout for help.',
      },
    ],
    donts: [
      'KHÔNG đi qua nước xiết',
      'KHÔNG đi một mình qua vùng ngập',
      'KHÔNG cố bơi ngược dòng',
      'KHÔNG buông vật bám',
    ],
    priorityTags: ['nước xiết', 'di chuyển'],
  },
  {
    id: 'motorbike_stalled',
    categoryId: 'movement_evacuation',
    titleVi: 'Xe máy chết máy giữa ngập',
    titleEn: 'Motorbike Stalled in Flood',
    iconName: 'Bike',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'TẮT MÁY, RÚT CHÌA! Đánh giá mức nước và dòng chảy.',
        actionEn: 'TURN OFF, REMOVE KEY! Assess water level and current.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Nếu an toàn, đẩy xe lên vùng cao hơn. Nếu không, BỎ XE.',
        actionEn: 'If safe, push bike to higher ground. If not, LEAVE BIKE.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Di chuyển đến chỗ khô ráo. Gọi người thân báo vị trí.',
        actionEn: 'Move to dry area. Call family to report location.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Đợi nước rút hoặc được hỗ trợ. Không cố khởi động xe ướt.',
        actionEn: 'Wait for water to recede or help. Don\'t try to start wet bike.',
      },
    ],
    donts: [
      'KHÔNG cố khởi động khi ngập pô',
      'KHÔNG ở lại trên xe giữa dòng',
      'KHÔNG bám xe nếu nước xiết',
      'KHÔNG liều di chuyển qua nước sâu',
    ],
    priorityTags: ['xe', 'di chuyển'],
  },
  {
    id: 'car_rising_water',
    categoryId: 'movement_evacuation',
    titleVi: 'Ô tô gặp nước dâng nhanh',
    titleEn: 'Car in Rapidly Rising Water',
    iconName: 'Car',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'THÁO DÂY AN TOÀN! Mở khóa cửa ngay.',
        actionEn: 'UNBUCKLE! Unlock doors immediately.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Hạ cửa kính (điện có thể hỏng). Thoát qua cửa kính nếu cửa không mở.',
        actionEn: 'Lower windows (electric may fail). Exit through window if door stuck.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Nếu kẹt hoàn toàn: ĐỢI nước ngập gần đầy (áp suất cân bằng), rồi mở cửa.',
        actionEn: 'If fully trapped: WAIT for water to almost fill (pressure equalizes), then open door.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Hít sâu, đẩy ra, bơi lên mặt nước hướng về bờ.',
        actionEn: 'Take deep breath, push out, swim to surface toward shore.',
      },
    ],
    donts: [
      'KHÔNG cố mở cửa khi nước mới vào - áp suất lớn',
      'KHÔNG hoảng loạn - bạn có thời gian',
      'KHÔNG bỏ trẻ em - giúp trẻ trước',
      'KHÔNG lấy đồ đạc',
    ],
    priorityTags: ['xe', 'kẹt'],
  },
  {
    id: 'car_swept_away',
    categoryId: 'movement_evacuation',
    titleVi: 'Xe bị cuốn trôi',
    titleEn: 'Vehicle Swept Away',
    iconName: 'Car',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'THÁO DÂY AN TOÀN NGAY! Tập trung thoát, không lấy đồ.',
        actionEn: 'UNBUCKLE NOW! Focus on escape, not belongings.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Nếu xe còn nổi: Trèo lên nóc. Gọi cứu hộ nếu có sóng.',
        actionEn: 'If car still floats: Climb to roof. Call for help if signal.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Nếu xe chìm: Hít sâu, mở cửa kính, bơi lên mặt nước.',
        actionEn: 'If car sinks: Deep breath, open window, swim to surface.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Bám vào vật nổi. Không bơi ngược dòng - bơi chéo về bờ.',
        actionEn: 'Hold onto floating object. Don\'t swim upstream - swim diagonally to shore.',
      },
    ],
    donts: [
      'KHÔNG hoảng loạn',
      'KHÔNG cố cứu xe',
      'KHÔNG bơi ngược dòng xiết',
      'KHÔNG buông vật nổi',
    ],
    priorityTags: ['xe', 'nước xiết'],
  },
  {
    id: 'open_manhole',
    categoryId: 'movement_evacuation',
    titleVi: 'Hố ga mất nắp',
    titleEn: 'Open Manhole',
    iconName: 'CircleAlert',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'ĐỨNG LẠI! Trong nước ngập, dùng gậy/que thăm dò trước khi bước.',
        actionEn: 'STOP! In flooded water, use stick to probe before stepping.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Đánh dấu vị trí bằng vật nổi (chai, phao). Cảnh báo người khác.',
        actionEn: 'Mark location with floating object (bottle, buoy). Warn others.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Tìm đường vòng. Báo chính quyền địa phương.',
        actionEn: 'Find alternative route. Report to local authorities.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Nếu có người rơi: GỌI NGAY 113, không nhảy xuống cứu.',
        actionEn: 'If someone falls in: CALL 113 IMMEDIATELY, don\'t jump in to rescue.',
      },
    ],
    donts: [
      'KHÔNG đi bộ qua nước đục không nhìn thấy đáy',
      'KHÔNG để trẻ em đi trước',
      'KHÔNG nhảy xuống cứu người - nguy hiểm cuốn',
    ],
    priorityTags: ['di chuyển', 'hố ga'],
  },
  {
    id: 'road_landslide',
    categoryId: 'movement_evacuation',
    titleVi: 'Đường sạt lở',
    titleEn: 'Road Landslide',
    iconName: 'TriangleAlert',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'QUAY LẠI! Không cố vượt qua vùng sạt lở.',
        actionEn: 'TURN BACK! Don\'t try to cross landslide area.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Tránh xa vùng đất nứt, cây nghiêng. Tìm nơi cao ổn định.',
        actionEn: 'Stay away from cracked ground, leaning trees. Find stable high ground.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Báo cảnh sát giao thông hoặc chính quyền. Không đậu xe gần vùng sạt.',
        actionEn: 'Report to traffic police or authorities. Don\'t park near slide area.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Tìm đường vòng. Nếu kẹt, đợi cứu hộ ở nơi an toàn.',
        actionEn: 'Find alternative route. If stuck, wait for rescue in safe area.',
      },
    ],
    donts: [
      'KHÔNG cố lái qua',
      'KHÔNG đứng quan sát gần vùng sạt',
      'KHÔNG đậu xe dưới dốc',
    ],
    priorityTags: ['sạt lở', 'di chuyển'],
  },
  // NEW CASES for movement_evacuation
  {
    id: 'trapped_upper_floor',
    categoryId: 'movement_evacuation',
    titleVi: 'Kẹt trên tầng cao, nước dâng',
    titleEn: 'Trapped on Upper Floor',
    iconName: 'Building2',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Lên điểm cao nhất, mang điện thoại/đèn/áo ấm.',
        actionEn: 'Go to highest point, bring phone/light/warm clothes.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Gọi 113/114/115 hoặc gửi SOS. Đánh dấu vị trí (vải sáng).',
        actionEn: 'Call 113/114/115 or send SOS. Mark location (bright cloth).',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Không xuống nước. Chuẩn bị nước uống/đồ khô.',
        actionEn: 'Don\'t go into water. Prepare drinking water/dry food.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Tiết kiệm pin, hạn chế di chuyển.',
        actionEn: 'Save battery, minimize movement.',
      },
    ],
    donts: [
      'KHÔNG nhảy xuống nước',
      'KHÔNG bơi ra ngoài khi nước xiết',
    ],
    sosWhen: ['Nước dâng nhanh', 'Có trẻ em/người già'],
    priorityTags: ['kẹt', 'nước dâng'],
  },
  {
    id: 'night_evacuation',
    categoryId: 'movement_evacuation',
    titleVi: 'Sơ tán ban đêm',
    titleEn: 'Night Evacuation',
    iconName: 'Moon',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Mặc áo/giày kín, mang đèn, giấy tờ cần thiết.',
        actionEn: 'Wear full clothing/shoes, bring flashlight, essential documents.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Đi theo nhóm, kiểm tra lối thoát an toàn.',
        actionEn: 'Move in group, check safe exit route.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Tránh dây điện rơi, tránh vùng nước chảy.',
        actionEn: 'Avoid fallen power lines, avoid flowing water.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Tập trung tại điểm hẹn, điểm sơ tán.',
        actionEn: 'Gather at meeting point, evacuation site.',
      },
    ],
    donts: [
      'KHÔNG đi một mình',
      'KHÔNG cầm đồ cồng kềnh',
    ],
    sosWhen: ['Có người lạc/mất liên lạc'],
    priorityTags: ['sơ tán', 'ban đêm'],
  },
  {
    id: 'stuck_elevator',
    categoryId: 'movement_evacuation',
    titleVi: 'Mắc kẹt trong thang máy',
    titleEn: 'Stuck in Elevator',
    iconName: 'ArrowUpDown',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Bấm nút cứu hộ trong thang, giữ bình tĩnh.',
        actionEn: 'Press emergency button, stay calm.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Gọi người thân/cứu hộ. Tiết kiệm pin.',
        actionEn: 'Call family/rescue. Save battery.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Ngồi xuống, thở đều, chờ hướng dẫn.',
        actionEn: 'Sit down, breathe steadily, wait for instructions.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Chỉ thoát khi có người hỗ trợ.',
        actionEn: 'Only exit with assistance.',
      },
    ],
    donts: [
      'KHÔNG cạy cửa',
      'KHÔNG leo nóc thang',
    ],
    sosWhen: ['Thiếu oxy/khó thở', 'Nước vào thang'],
    priorityTags: ['kẹt', 'thang máy'],
  },
  {
    id: 'slip_fall_evacuation',
    categoryId: 'movement_evacuation',
    titleVi: 'Trượt ngã khi sơ tán',
    titleEn: 'Slip and Fall During Evacuation',
    iconName: 'PersonStanding',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Ngồi yên, kiểm tra đau cổ lưng.',
        actionEn: 'Stay still, check for neck/back pain.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Nếu đau mạnh/choáng: nhờ người giữ bất động.',
        actionEn: 'If severe pain/dizzy: have someone keep you still.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Băng ép nếu chảy máu, cố định nếu nghi gãy.',
        actionEn: 'Apply pressure if bleeding, immobilize if fracture suspected.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Giữ ấm, theo dõi tỉnh táo.',
        actionEn: 'Keep warm, monitor alertness.',
      },
    ],
    donts: [
      'KHÔNG cố đứng dậy khi choáng/đau cột sống',
    ],
    sosWhen: ['Ngất', 'Đau tăng', 'Tê yếu tay chân'],
    priorityTags: ['chấn thương', 'té ngã'],
  },
  {
    id: 'weak_bridge_road',
    categoryId: 'movement_evacuation',
    titleVi: 'Đi qua cầu/đường nghi yếu',
    titleEn: 'Crossing Weak Bridge/Road',
    iconName: 'TriangleAlert',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Dừng lại, không đi tiếp nếu rung/lún/nứt.',
        actionEn: 'Stop, don\'t continue if shaking/sinking/cracked.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Quay lại lối an toàn, tìm đường vòng.',
        actionEn: 'Return to safe route, find alternative path.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Báo cho người khác/nhóm cộng đồng.',
        actionEn: 'Warn others/community group.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Chờ hướng dẫn từ lực lượng địa phương.',
        actionEn: 'Wait for guidance from local authorities.',
      },
    ],
    donts: [
      'KHÔNG đi từng người thử',
      'KHÔNG chạy qua',
    ],
    sosWhen: ['Có người rơi', 'Sập cầu'],
    priorityTags: ['di chuyển', 'nguy hiểm'],
  },
  {
    id: 'child_shallow_flood',
    categoryId: 'movement_evacuation',
    titleVi: 'Dắt trẻ qua vùng ngập nhẹ',
    titleEn: 'Leading Child Through Shallow Flood',
    iconName: 'Baby',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Bế trẻ hoặc giữ sát tay, đi chậm.',
        actionEn: 'Carry child or hold hand tightly, walk slowly.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Tránh nước chảy, tránh hố ga.',
        actionEn: 'Avoid flowing water, avoid manholes.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Nếu nước lên nhanh: quay lại, lên cao.',
        actionEn: 'If water rises fast: turn back, go higher.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Kiểm tra trẻ có lạnh/ướt, lau khô.',
        actionEn: 'Check if child is cold/wet, dry off.',
      },
    ],
    donts: [
      'KHÔNG cho trẻ tự đi trong nước',
    ],
    sosWhen: ['Trẻ bị cuốn/hoảng loạn', 'Nước xiết'],
    priorityTags: ['trẻ em', 'di chuyển'],
  },
  {
    id: 'stuck_in_current',
    categoryId: 'movement_evacuation',
    titleVi: 'Mắc kẹt giữa dòng nước',
    titleEn: 'Stuck in Water Current',
    iconName: 'Waves',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Bám vật chắc (cột, tay vịn). Không chống lại dòng mạnh.',
        actionEn: 'Hold onto solid object (pole, railing). Don\'t fight strong current.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Di chuyển ngang sang nơi nông/chậm (nếu an toàn).',
        actionEn: 'Move sideways to shallower/slower area (if safe).',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Gửi SOS, kêu gọi hỗ trợ.',
        actionEn: 'Send SOS, call for support.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Giữ ấm, giữ sức.',
        actionEn: 'Stay warm, conserve energy.',
      },
    ],
    donts: [
      'KHÔNG cố bơi ngược dòng',
    ],
    sosWhen: ['Bị cuốn', 'Kiệt sức'],
    priorityTags: ['nước xiết', 'kẹt'],
  },
  {
    id: 'no_signal_contact',
    categoryId: 'movement_evacuation',
    titleVi: 'Mất sóng / không liên lạc được',
    titleEn: 'No Signal / Cannot Contact',
    iconName: 'WifiOff',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Bật chế độ tiết kiệm pin, tắt app nền.',
        actionEn: 'Enable power saving mode, close background apps.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Gửi SOS qua kênh offline nếu có (BLE/store-forward).',
        actionEn: 'Send SOS via offline channel if available (BLE/store-forward).',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Đặt điểm hẹn gia đình, ghi giấy nếu cần.',
        actionEn: 'Set family meeting point, write note if needed.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Ở nơi an toàn, không chạy tìm trong hoảng loạn.',
        actionEn: 'Stay in safe place, don\'t run around in panic.',
      },
    ],
    donts: [
      'KHÔNG spam gọi liên tục làm hết pin',
    ],
    sosWhen: ['Bị kẹt/không an toàn'],
    priorityTags: ['liên lạc', 'mất sóng'],
  },

  // ========== [3] NHÀ CỬA & SẬP ĐỔ (13 cases) ==========
  {
    id: 'wall_crack_collapse_risk',
    categoryId: 'building_collapse',
    titleVi: 'Tường nứt, nghi sập nhà',
    titleEn: 'Wall Crack, Collapse Risk',
    iconName: 'Building',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'RA KHỎI NHÀ NGAY! Đưa gia đình ra nơi trống.',
        actionEn: 'GET OUT IMMEDIATELY! Move family to open area.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Tránh xa tường, mái. Cách nhà ít nhất bằng chiều cao nhà.',
        actionEn: 'Stay away from walls, roof. Distance at least building height.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Gọi chính quyền địa phương báo nguy cơ sập.',
        actionEn: 'Call local authorities to report collapse risk.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Không quay lại lấy đồ. Đợi kiểm định an toàn.',
        actionEn: 'Don\'t go back for belongings. Wait for safety inspection.',
      },
    ],
    donts: [
      'KHÔNG ở trong nhà khi thấy vết nứt mới/lớn',
      'KHÔNG cố chống đỡ tường',
      'KHÔNG quay lại khi chưa có kiểm định',
    ],
    priorityTags: ['sập', 'nguy hiểm'],
  },
  {
    id: 'roof_blown_off',
    categoryId: 'building_collapse',
    titleVi: 'Mái tôn bay, gió giật mạnh',
    titleEn: 'Roof Blown Off, Strong Winds',
    iconName: 'Wind',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'VÀO PHÒNG TRONG, tránh cửa sổ! Không ra ngoài.',
        actionEn: 'GO TO INNER ROOM, avoid windows! Don\'t go outside.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Chui xuống gầm bàn chắc hoặc nằm sát sàn.',
        actionEn: 'Get under sturdy table or lie flat on floor.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Che đầu bằng gối, chăn. Theo dõi tiếng gió.',
        actionEn: 'Cover head with pillow, blanket. Listen to wind.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Chờ gió giảm mới di chuyển. Kiểm tra người thân.',
        actionEn: 'Wait for wind to die down before moving. Check on family.',
      },
    ],
    donts: [
      'KHÔNG cố giữ mái',
      'KHÔNG chạy ra ngoài trong gió mạnh',
      'KHÔNG đứng gần cửa kính',
    ],
    priorityTags: ['gió', 'mái'],
  },
  {
    id: 'tree_fallen_near_house',
    categoryId: 'building_collapse',
    titleVi: 'Cây đổ gần nhà',
    titleEn: 'Tree Fallen Near House',
    iconName: 'TreeDeciduous',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'TRÁNH XA! Cây có thể đang đè dây điện.',
        actionEn: 'STAY AWAY! Tree may be on power lines.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Không chạm cây hoặc dây điện gần đó. Coi như có điện.',
        actionEn: 'Don\'t touch tree or nearby wires. Assume they\'re live.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Báo điện lực nếu dây bị ảnh hưởng. Gọi cứu hộ nếu chặn lối.',
        actionEn: 'Report to power company if wires affected. Call rescue if blocking path.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Không tự dọn cây lớn. Đợi thiết bị chuyên dụng.',
        actionEn: 'Don\'t clear large trees yourself. Wait for equipment.',
      },
    ],
    donts: [
      'KHÔNG chui dưới cây đổ',
      'KHÔNG cưa cắt gần dây điện',
      'KHÔNG leo lên cây đổ',
    ],
    priorityTags: ['cây đổ', 'điện'],
  },
  {
    id: 'broken_glass_debris',
    categoryId: 'building_collapse',
    titleVi: 'Kính vỡ/vật sắc rơi',
    titleEn: 'Broken Glass/Sharp Debris',
    iconName: 'TriangleAlert',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'ĐI GIÀY! Không đi chân không. Bước cẩn thận.',
        actionEn: 'WEAR SHOES! Don\'t walk barefoot. Step carefully.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Đeo găng tay (hoặc quấn vải) khi dọn dẹp.',
        actionEn: 'Wear gloves (or wrap cloth) when cleaning.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Thu gom vào hộp cứng/thùng kín. Đánh dấu "NGUY HIỂM".',
        actionEn: 'Collect in hard box/sealed container. Mark "DANGEROUS".',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Nếu bị cắt sâu: ép cầm máu, gọi 115.',
        actionEn: 'If deep cut: apply pressure, call 115.',
      },
    ],
    donts: [
      'KHÔNG dùng chổi quét kính vỡ - dùng giấy ướt hoặc băng dính',
      'KHÔNG để trẻ em vào khu vực',
      'KHÔNG bỏ vào túi nilon mỏng',
    ],
    priorityTags: ['kính vỡ', 'chấn thương'],
  },
  {
    id: 'flooded_basement',
    categoryId: 'building_collapse',
    titleVi: 'Ngập tầng hầm',
    titleEn: 'Flooded Basement',
    iconName: 'ArrowDown',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'KHÔNG XUỐNG HẦM! Có thể có điện trong nước.',
        actionEn: 'DON\'T GO DOWN! May be electricity in water.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Cắt điện tầng hầm từ cầu dao tổng (nếu an toàn).',
        actionEn: 'Cut basement power from main breaker (if safe).',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Đóng van nước nếu có. Chờ nước rút hoặc bơm.',
        actionEn: 'Close water valve if any. Wait for water to recede or pump.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Gọi dịch vụ bơm nước. Kiểm tra an toàn trước khi xuống.',
        actionEn: 'Call water pump service. Check safety before going down.',
      },
    ],
    donts: [
      'KHÔNG bơi trong hầm ngập',
      'KHÔNG bật điện khi hầm còn ướt',
      'KHÔNG để trẻ xuống hầm',
    ],
    priorityTags: ['hầm', 'nước', 'điện'],
  },
  {
    id: 'trapped_in_room',
    categoryId: 'building_collapse',
    titleVi: 'Kẹt trong phòng/không mở cửa',
    titleEn: 'Trapped in Room',
    iconName: 'DoorClosed',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'GỌI TO! Gõ cửa/tường để người ngoài nghe.',
        actionEn: 'SHOUT! Knock on door/wall for people outside to hear.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Gọi điện 113/114/người thân. Báo vị trí chính xác.',
        actionEn: 'Call 113/114/family. Report exact location.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Tìm cửa sổ/ban công thoát nếu cửa chính kẹt.',
        actionEn: 'Find window/balcony exit if main door stuck.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Dùng đèn, vải sáng đánh dấu vị trí. Tiết kiệm sức.',
        actionEn: 'Use light, bright cloth to mark location. Conserve energy.',
      },
    ],
    donts: [
      'KHÔNG hoảng loạn, tiết kiệm oxy nếu không gian nhỏ',
      'KHÔNG cố phá cửa bằng lửa',
    ],
    priorityTags: ['kẹt', 'cứu hộ'],
  },
  // NEW CASES for building_collapse
  {
    id: 'structural_noise',
    categoryId: 'building_collapse',
    titleVi: 'Tiếng rắc / kết cấu kêu',
    titleEn: 'Structural Creaking Noise',
    iconName: 'AlertTriangle',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Rời khỏi khu vực ngay, đưa người ra ngoài.',
        actionEn: 'Leave area immediately, get people outside.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Tránh đứng gần tường/nóc. Chọn nơi trống.',
        actionEn: 'Stay away from walls/roof. Choose open area.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Gọi hỗ trợ địa phương, báo nguy cơ sập.',
        actionEn: 'Call local support, report collapse risk.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Không quay lại lấy đồ.',
        actionEn: 'Don\'t go back for belongings.',
      },
    ],
    donts: [
      'KHÔNG đứng dưới mái',
      'KHÔNG tụ tập gần tường',
    ],
    sosWhen: ['Có người bị kẹt/đè'],
    priorityTags: ['sập', 'nguy hiểm'],
  },
  {
    id: 'debris_hitting_window',
    categoryId: 'building_collapse',
    titleVi: 'Lũ cuốn đồ, va đập cửa kính',
    titleEn: 'Debris Hitting Windows',
    iconName: 'Waves',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Tránh xa cửa kính, đóng rèm nếu có.',
        actionEn: 'Stay away from windows, close curtains if possible.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Chuyển lên tầng cao, tránh mặt tiền.',
        actionEn: 'Move to upper floor, avoid front of building.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Dùng vật chắn tạm (ván/đệm) nếu an toàn.',
        actionEn: 'Use temporary barrier (board/mattress) if safe.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Không đứng quan sát gần cửa.',
        actionEn: 'Don\'t stand watching near windows.',
      },
    ],
    donts: [
      'KHÔNG cố giữ cửa bằng tay',
    ],
    sosWhen: ['Kính vỡ gây thương tích'],
    priorityTags: ['kính vỡ', 'nước'],
  },
  {
    id: 'water_rushing_in',
    categoryId: 'building_collapse',
    titleVi: 'Nước tràn vào nhà nhanh',
    titleEn: 'Water Rushing Into House',
    iconName: 'Waves',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Ngắt điện nếu có thể an toàn.',
        actionEn: 'Cut power if safely possible.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Mang đồ thiết yếu, lên cao.',
        actionEn: 'Bring essentials, go higher.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Gọi cứu hộ, đánh dấu vị trí.',
        actionEn: 'Call rescue, mark your location.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Tiết kiệm pin, ở khu vực an toàn.',
        actionEn: 'Save battery, stay in safe area.',
      },
    ],
    donts: [
      'KHÔNG ở tầng 1 khi nước lên',
    ],
    sosWhen: ['Nước lên quá nhanh', 'Có người không di chuyển được'],
    priorityTags: ['nước', 'ngập nhanh'],
  },
  {
    id: 'door_stuck_water_pressure',
    categoryId: 'building_collapse',
    titleVi: 'Cửa bị kẹt (nước ép)',
    titleEn: 'Door Stuck (Water Pressure)',
    iconName: 'DoorClosed',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Không cố đạp mạnh. Tìm lối thoát khác (cửa sổ/ban công).',
        actionEn: 'Don\'t force it. Find alternative exit (window/balcony).',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Lên cao hơn, gọi hỗ trợ.',
        actionEn: 'Go higher, call for help.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Dùng vật báo hiệu (đèn, vải sáng).',
        actionEn: 'Use signals (light, bright cloth).',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Ở nơi thoáng, tránh hoảng loạn.',
        actionEn: 'Stay in ventilated area, avoid panic.',
      },
    ],
    donts: [
      'KHÔNG cố mở cửa hướng ra nước mạnh',
    ],
    sosWhen: ['Không còn lối thoát', 'Nước dâng tới ngực'],
    priorityTags: ['kẹt', 'nước'],
  },
  {
    id: 'hillside_slide',
    categoryId: 'building_collapse',
    titleVi: 'Sạt lở sau nhà / taluy',
    titleEn: 'Hillside Landslide',
    iconName: 'Mountain',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Rời khỏi khu vực sát taluy, lên nơi trống.',
        actionEn: 'Leave area near hillside, go to open ground.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Tránh đứng dưới dốc, tránh lối mòn sạt.',
        actionEn: 'Don\'t stand below slope, avoid slide paths.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Báo chính quyền/nhóm cứu hộ.',
        actionEn: 'Report to authorities/rescue team.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Không quay lại gần taluy.',
        actionEn: 'Don\'t return near hillside.',
      },
    ],
    donts: [
      'KHÔNG đứng quan sát sát mép sạt',
    ],
    sosWhen: ['Có người bị vùi/kẹt'],
    priorityTags: ['sạt lở', 'nguy hiểm'],
  },
  {
    id: 'roof_blown_debris',
    categoryId: 'building_collapse',
    titleVi: 'Nhà bị tốc mái / vật bay',
    titleEn: 'Roof Blown Off / Flying Debris',
    iconName: 'Wind',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Tránh cửa sổ. Vào phòng trong, thấp.',
        actionEn: 'Avoid windows. Go to inner room, stay low.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Đội mũ/che đầu bằng đồ dày.',
        actionEn: 'Wear helmet/cover head with thick material.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Nếu an toàn: rời nhà sang nơi chắc chắn hơn.',
        actionEn: 'If safe: leave house for sturdier building.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Chờ gió giảm, giữ liên lạc.',
        actionEn: 'Wait for wind to die down, stay in contact.',
      },
    ],
    donts: [
      'KHÔNG leo mái khi gió mạnh',
    ],
    sosWhen: ['Có người bị thương', 'Mái sập'],
    priorityTags: ['gió', 'mái'],
  },
  {
    id: 'sewer_water_rising',
    categoryId: 'building_collapse',
    titleVi: 'Hầm/tầng trệt bị ngập từ cống',
    titleEn: 'Basement Flooded from Sewer',
    iconName: 'ArrowDown',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'KHÔNG xuống hầm. Đóng cửa ngăn nếu có.',
        actionEn: 'DON\'T go to basement. Close barrier door if available.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Chuyển đồ điện lên cao.',
        actionEn: 'Move electrical items higher.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Kiểm tra mùi gas/hóa chất, mở thoáng.',
        actionEn: 'Check for gas/chemical smell, ventilate.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Chờ nước rút/đơn vị xử lý.',
        actionEn: 'Wait for water to recede/professionals to handle.',
      },
    ],
    donts: [
      'KHÔNG bơi/đi xuống hầm',
    ],
    sosWhen: ['Có người kẹt dưới hầm'],
    priorityTags: ['hầm', 'cống'],
  },
  {
    id: 'pet_panic_flood',
    categoryId: 'building_collapse',
    titleVi: 'Chó/mèo hoảng loạn',
    titleEn: 'Pet Panic During Flood',
    iconName: 'PawPrint',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Giữ dây/chuồng, tránh chạy ra nước.',
        actionEn: 'Hold leash/cage, prevent running into water.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Đưa lên cao, tránh nơi đông người.',
        actionEn: 'Bring to higher ground, avoid crowded areas.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Chuẩn bị nước/đồ ăn ít.',
        actionEn: 'Prepare some water/food.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Giữ gần gia đình để tránh lạc.',
        actionEn: 'Keep near family to prevent getting lost.',
      },
    ],
    donts: [
      'KHÔNG thả rông gần nước',
    ],
    sosWhen: ['Bị cắn/người bị thương'],
    priorityTags: ['thú cưng'],
  },

  // ========== [4] NƯỚC SẠCH & VỆ SINH SAU LŨ (12 cases) ==========
  {
    id: 'drank_dirty_water',
    categoryId: 'water_hygiene',
    titleVi: 'Uống nhầm nước bẩn',
    titleEn: 'Drank Contaminated Water',
    iconName: 'Droplets',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Ngừng uống ngay. Súc miệng bằng nước sạch nếu có.',
        actionEn: 'Stop drinking immediately. Rinse mouth with clean water if available.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Uống nước sạch nhiều để pha loãng.',
        actionEn: 'Drink plenty of clean water to dilute.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Theo dõi buồn nôn, đau bụng. Ghi nhớ uống gì.',
        actionEn: 'Monitor nausea, stomach pain. Remember what was consumed.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Nếu nôn nhiều/tiêu chảy: bù nước, gọi 115.',
        actionEn: 'If vomiting/diarrhea: rehydrate, call 115.',
      },
    ],
    donts: [
      'KHÔNG cố móc họng',
      'KHÔNG bỏ qua triệu chứng tiêu chảy',
    ],
    priorityTags: ['nước bẩn', 'ngộ độc'],
  },
  {
    id: 'acute_diarrhea',
    categoryId: 'water_hygiene',
    titleVi: 'Tiêu chảy cấp',
    titleEn: 'Acute Diarrhea',
    iconName: 'CircleAlert',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'BÙ NƯỚC! Dùng ORS hoặc nước muối đường loãng.',
        actionEn: 'REHYDRATE! Use ORS or dilute salt-sugar water.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Uống từng ngụm nhỏ, thường xuyên.',
        actionEn: 'Drink small sips, frequently.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Nghỉ ngơi. Ăn nhẹ (cháo, cơm) nếu không nôn.',
        actionEn: 'Rest. Eat light (porridge, rice) if not vomiting.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Nếu tiêu chảy có máu, sốt cao: gọi 115 ngay.',
        actionEn: 'If bloody diarrhea, high fever: call 115 immediately.',
      },
    ],
    donts: [
      'KHÔNG uống sữa, nước ngọt có gas',
      'KHÔNG dùng thuốc cầm tiêu chảy bừa bãi',
      'KHÔNG ăn đồ dầu mỡ',
    ],
    priorityTags: ['tiêu chảy', 'bù nước'],
  },
  {
    id: 'wound_touched_flood',
    categoryId: 'water_hygiene',
    titleVi: 'Vết thương dính nước lũ',
    titleEn: 'Wound Exposed to Floodwater',
    iconName: 'Droplets',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Rửa vết thương bằng nước sạch + xà phòng ngay.',
        actionEn: 'Wash wound with clean water + soap immediately.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Sát khuẩn bằng cồn hoặc Betadine nếu có.',
        actionEn: 'Disinfect with alcohol or Betadine if available.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Băng kín vết thương. Thay băng khi ướt.',
        actionEn: 'Cover wound with bandage. Change if wet.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Theo dõi sưng đỏ, mủ, sốt → cần khám.',
        actionEn: 'Monitor swelling, pus, fever → need medical check.',
      },
    ],
    donts: [
      'KHÔNG bôi kem đánh răng, dầu',
      'KHÔNG để vết thương hở tiếp xúc nước bẩn',
    ],
    priorityTags: ['vết thương', 'nhiễm trùng'],
  },
  {
    id: 'spoiled_food',
    categoryId: 'water_hygiene',
    titleVi: 'Thực phẩm hỏng (tủ lạnh mất điện)',
    titleEn: 'Spoiled Food (Power Outage)',
    iconName: 'Trash2',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'KHÔNG ăn thịt/cá/sữa để ngoài > 2 tiếng.',
        actionEn: 'DON\'T eat meat/fish/dairy left out > 2 hours.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Kiểm tra mùi, màu, độ nhớt. Nghi ngờ = bỏ.',
        actionEn: 'Check smell, color, texture. When in doubt = throw out.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Ưu tiên ăn đồ khô, đóng hộp, nấu chín kỹ.',
        actionEn: 'Prioritize dry goods, canned items, cook thoroughly.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Bỏ tủ lạnh mở để khô sau khi dọn.',
        actionEn: 'Leave fridge open to dry after cleaning.',
      },
    ],
    donts: [
      'KHÔNG "nếm thử" đồ nghi hỏng',
      'KHÔNG đông lại thịt đã rã đông',
      'KHÔNG ăn trứng bị nứt/bẩn',
    ],
    priorityTags: ['thực phẩm', 'ngộ độc'],
  },
  {
    id: 'mold_in_house',
    categoryId: 'water_hygiene',
    titleVi: 'Nấm mốc trong nhà',
    titleEn: 'Mold in House',
    iconName: 'Cloud',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Mở cửa thông gió. Đeo khẩu trang khi dọn.',
        actionEn: 'Open doors for ventilation. Wear mask when cleaning.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Người hen/dị ứng tránh xa khu vực mốc.',
        actionEn: 'People with asthma/allergies stay away from moldy areas.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Lau bằng nước xà phòng hoặc pha chlorine loãng.',
        actionEn: 'Clean with soapy water or dilute chlorine solution.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Phơi khô vật dụng. Bỏ đồ thấm nước không cứu được.',
        actionEn: 'Sun-dry items. Discard water-logged items that can\'t be saved.',
      },
    ],
    donts: [
      'KHÔNG dùng quạt thổi bào tử mốc',
      'KHÔNG trộn chlorine + ammonia (sinh khí độc)',
    ],
    priorityTags: ['nấm mốc', 'vệ sinh'],
  },
  {
    id: 'chemical_water',
    categoryId: 'water_hygiene',
    titleVi: 'Nước có mùi hoá chất/dầu',
    titleEn: 'Chemical/Oil Smell in Water',
    iconName: 'Skull',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'KHÔNG CHẠM! Rời khỏi vùng nước có mùi lạ.',
        actionEn: 'DON\'T TOUCH! Leave area with strange-smelling water.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Mở thông gió. Không hút thuốc, bật lửa.',
        actionEn: 'Ventilate. No smoking, no flames.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Gọi 114 hoặc chính quyền báo ô nhiễm.',
        actionEn: 'Call 114 or authorities to report contamination.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Nếu tiếp xúc: rửa da bằng nước sạch nhiều lần.',
        actionEn: 'If contact: rinse skin with clean water multiple times.',
      },
    ],
    donts: [
      'KHÔNG dùng nước này để nấu ăn/tắm',
      'KHÔNG vớt dầu bằng tay trần',
    ],
    priorityTags: ['hoá chất', 'ô nhiễm'],
  },
  // NEW CASES for water_hygiene
  {
    id: 'water_shortage_24h',
    categoryId: 'water_hygiene',
    titleVi: 'Thiếu nước uống (sau 24h)',
    titleEn: 'Water Shortage (After 24h)',
    iconName: 'Droplets',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Kiểm kê nước sạch còn lại, chia khẩu phần.',
        actionEn: 'Inventory remaining clean water, ration portions.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Ưu tiên nước đóng chai/nước đun sôi.',
        actionEn: 'Prioritize bottled/boiled water.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Nếu có viên khử khuẩn: dùng đúng hướng dẫn.',
        actionEn: 'If you have purification tablets: use as directed.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Xin hỗ trợ qua cộng đồng/cứu trợ.',
        actionEn: 'Request support from community/relief.',
      },
    ],
    donts: [
      'KHÔNG uống nước lũ/nước có mùi lạ',
    ],
    sosWhen: ['Trẻ nhỏ/người già mất nước, lơ mơ'],
    priorityTags: ['nước sạch', 'thiếu nước'],
  },
  {
    id: 'well_contaminated',
    categoryId: 'water_hygiene',
    titleVi: 'Nghi nhiễm bẩn giếng/bể nước',
    titleEn: 'Suspected Well/Tank Contamination',
    iconName: 'Droplets',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Ngưng sử dụng ngay.',
        actionEn: 'Stop using immediately.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Dán nhãn "KHÔNG DÙNG", tránh nhầm.',
        actionEn: 'Label "DO NOT USE", prevent mistakes.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Dùng nguồn thay thế (nước đóng chai, nước cứu trợ).',
        actionEn: 'Use alternative source (bottled water, relief water).',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Chờ khử trùng/kiểm tra trước khi dùng lại.',
        actionEn: 'Wait for disinfection/testing before reuse.',
      },
    ],
    donts: [
      'KHÔNG "nếm thử" để kiểm tra',
    ],
    sosWhen: ['Nhiều người tiêu chảy/sốt sau uống'],
    priorityTags: ['nước sạch', 'giếng'],
  },
  {
    id: 'hygiene_no_water',
    categoryId: 'water_hygiene',
    titleVi: 'Vệ sinh cá nhân khi thiếu nước',
    titleEn: 'Personal Hygiene Without Water',
    iconName: 'Hand',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Ưu tiên rửa tay trước ăn & sau đi vệ sinh.',
        actionEn: 'Prioritize handwashing before eating & after toilet.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Dùng khăn ướt/gel sát khuẩn nếu có.',
        actionEn: 'Use wet wipes/hand sanitizer if available.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Tách khu vệ sinh khỏi khu ăn uống.',
        actionEn: 'Separate toilet area from eating area.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Giữ rác trong túi kín, tránh ruồi muỗi.',
        actionEn: 'Keep garbage in sealed bags, avoid flies/mosquitoes.',
      },
    ],
    donts: [
      'KHÔNG để trẻ chơi nước bẩn',
    ],
    sosWhen: ['Có dấu hiệu nhiễm trùng/sốt cao'],
    priorityTags: ['vệ sinh', 'thiếu nước'],
  },
  {
    id: 'mosquito_increase',
    categoryId: 'water_hygiene',
    titleVi: 'Muỗi/côn trùng tăng sau lũ',
    titleEn: 'Mosquitoes/Insects After Flood',
    iconName: 'Bug',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Mặc kín, dùng màn nếu có.',
        actionEn: 'Wear full clothing, use mosquito net if available.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Đổ nước đọng quanh nhà (nếu an toàn).',
        actionEn: 'Drain standing water around house (if safe).',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Dùng kem/xịt chống muỗi phù hợp.',
        actionEn: 'Use appropriate mosquito repellent.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Theo dõi sốt, đặc biệt trẻ em.',
        actionEn: 'Monitor for fever, especially in children.',
      },
    ],
    donts: [
      'KHÔNG ngủ nơi ẩm thấp không che chắn',
    ],
    sosWhen: ['Sốt cao, phát ban, lơ mơ'],
    priorityTags: ['muỗi', 'bệnh truyền nhiễm'],
  },
  {
    id: 'dead_animal_debris',
    categoryId: 'water_hygiene',
    titleVi: 'Rác thải / xác động vật trôi',
    titleEn: 'Debris / Dead Animals Floating',
    iconName: 'Trash2',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Tránh tiếp xúc trực tiếp, đeo găng/túi nilon.',
        actionEn: 'Avoid direct contact, wear gloves/plastic bags.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Cô lập khu vực, báo chính quyền nếu có.',
        actionEn: 'Isolate area, report to authorities if possible.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Khử khuẩn tay và vật dụng.',
        actionEn: 'Disinfect hands and items.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Chờ đội vệ sinh môi trường xử lý.',
        actionEn: 'Wait for environmental sanitation team.',
      },
    ],
    donts: [
      'KHÔNG tự kéo xác động vật bằng tay trần',
    ],
    sosWhen: ['Có mùi nồng, nhiều người buồn nôn/choáng'],
    priorityTags: ['vệ sinh', 'xác động vật'],
  },
  {
    id: 'oil_chemical_spill',
    categoryId: 'water_hygiene',
    titleVi: 'Tràn dầu / hoá chất trong nước',
    titleEn: 'Oil / Chemical Spill in Water',
    iconName: 'Droplets',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Rời khỏi khu vực có mùi xăng/dầu.',
        actionEn: 'Leave area with gasoline/oil smell.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Không dùng nước đó để nấu ăn/tắm.',
        actionEn: 'Don\'t use that water for cooking/bathing.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Báo lực lượng địa phương, đánh dấu cảnh báo.',
        actionEn: 'Report to local authorities, mark warning signs.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Chờ xử lý chuyên môn.',
        actionEn: 'Wait for professional handling.',
      },
    ],
    donts: [
      'KHÔNG đốt, không hít sát, không chạm lâu',
    ],
    sosWhen: ['Khó thở, chóng mặt, bỏng rát da'],
    priorityTags: ['hoá chất', 'dầu'],
  },
  {
    id: 'suspected_food_contamination',
    categoryId: 'water_hygiene',
    titleVi: 'Đồ ăn nghi nhiễm',
    titleEn: 'Suspected Food Contamination',
    iconName: 'Utensils',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Không ăn nếu có mùi lạ/đổi màu.',
        actionEn: 'Don\'t eat if strange smell/discoloration.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Ưu tiên đồ khô đóng gói.',
        actionEn: 'Prioritize dry packaged food.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Chia khẩu phần, tránh lãng phí.',
        actionEn: 'Ration portions, avoid waste.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Xin cứu trợ nếu thiếu.',
        actionEn: 'Request relief if running low.',
      },
    ],
    donts: [
      'KHÔNG ăn đồ ngâm nước lũ',
    ],
    sosWhen: ['Nôn/tiêu chảy nặng'],
    priorityTags: ['thực phẩm', 'nhiễm bẩn'],
  },

  // ========== [5] CHẤN THƯƠNG & SƠ CỨU (12 cases) ==========
  {
    id: 'heavy_bleeding',
    categoryId: 'injury_firstaid',
    titleVi: 'Chảy máu nhiều',
    titleEn: 'Heavy Bleeding',
    iconName: 'Droplets',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'ÉP CHẶT vết thương bằng vải sạch. Không buông.',
        actionEn: 'PRESS FIRMLY on wound with clean cloth. Don\'t let go.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Nâng cao phần bị thương (nếu có thể).',
        actionEn: 'Elevate injured part (if possible).',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Nếu máu thấm qua: THÊM vải, không bỏ lớp cũ.',
        actionEn: 'If blood soaks through: ADD cloth, don\'t remove old layer.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Gọi 115. Giữ ấm nạn nhân. Theo dõi tỉnh táo.',
        actionEn: 'Call 115. Keep victim warm. Monitor consciousness.',
      },
    ],
    donts: [
      'KHÔNG buông tay ép để "xem thử"',
      'KHÔNG rút vật đâm ra khỏi vết thương',
      'KHÔNG dùng garo trừ khi cực kỳ cấp bách',
    ],
    priorityTags: ['chảy máu', 'cấp cứu'],
  },
  {
    id: 'broken_arm_leg',
    categoryId: 'injury_firstaid',
    titleVi: 'Gãy tay/gãy chân',
    titleEn: 'Broken Arm/Leg',
    iconName: 'Bone',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'ĐỪNG DI CHUYỂN chi gãy. Giữ nguyên vị trí.',
        actionEn: 'DON\'T MOVE broken limb. Keep in position.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Cố định bằng nẹp (thanh gỗ, báo cuộn, ván) + vải buộc.',
        actionEn: 'Immobilize with splint (wood, rolled newspaper, board) + cloth ties.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Kiểm tra lưu thông máu: đầu chi còn hồng/ấm không.',
        actionEn: 'Check circulation: is fingertip/toe still pink/warm.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Gọi 115. Chườm lạnh giảm sưng. Không cho ăn uống.',
        actionEn: 'Call 115. Ice to reduce swelling. No food/drink.',
      },
    ],
    donts: [
      'KHÔNG cố nắn xương',
      'KHÔNG di chuyển không cần thiết',
      'KHÔNG buộc quá chặt làm tắc máu',
    ],
    priorityTags: ['gãy xương', 'cố định'],
  },
  {
    id: 'sprain_dislocation',
    categoryId: 'injury_firstaid',
    titleVi: 'Bong gân/trật khớp',
    titleEn: 'Sprain/Dislocation',
    iconName: 'Activity',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'NGỪNG vận động ngay. Ngồi/nằm nghỉ.',
        actionEn: 'STOP moving immediately. Sit/lie down to rest.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Chườm lạnh (nếu có). Quấn vải nén nhẹ.',
        actionEn: 'Apply ice (if available). Wrap with light compression.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Nâng cao chân/tay bị thương.',
        actionEn: 'Elevate injured limb.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Nếu biến dạng rõ (trật khớp): KHÔNG tự nắn, gọi 115.',
        actionEn: 'If visible deformity (dislocation): DON\'T reset, call 115.',
      },
    ],
    donts: [
      'KHÔNG cố đi lại khi đau',
      'KHÔNG tự nắn khớp trật',
      'KHÔNG chườm nóng trong 48h đầu',
    ],
    priorityTags: ['bong gân', 'trật khớp'],
  },
  {
    id: 'open_wound',
    categoryId: 'injury_firstaid',
    titleVi: 'Vết thương hở/rách da',
    titleEn: 'Open Wound/Laceration',
    iconName: 'Scissors',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Rửa tay (nếu có thể). Ép vải sạch cầm máu.',
        actionEn: 'Wash hands (if possible). Press clean cloth to stop bleeding.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Rửa vết thương bằng nước sạch. Nhẹ nhàng loại bỏ bụi bẩn.',
        actionEn: 'Rinse wound with clean water. Gently remove dirt.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Sát khuẩn, băng kín.',
        actionEn: 'Disinfect, bandage securely.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Nếu vết rách sâu > 2cm hoặc xương lộ: cần khâu, gọi 115.',
        actionEn: 'If laceration > 2cm deep or bone visible: needs stitches, call 115.',
      },
    ],
    donts: [
      'KHÔNG bôi bột, lá cây',
      'KHÔNG để vết thương hở trong nước lũ',
    ],
    priorityTags: ['vết thương', 'băng bó'],
  },
  {
    id: 'crush_injury',
    categoryId: 'injury_firstaid',
    titleVi: 'Bị đè/va đập mạnh',
    titleEn: 'Crush/Impact Injury',
    iconName: 'AlertCircle',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'GỌI CỨU HỘ TRƯỚC khi nhấc vật đè (nếu đè lâu > 15 phút).',
        actionEn: 'CALL RESCUE BEFORE lifting crushing object (if crushed > 15 min).',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Nếu mới bị đè: nhấc vật ra an toàn, kiểm tra ý thức.',
        actionEn: 'If just crushed: safely remove object, check consciousness.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Theo dõi đau bụng, nước tiểu đỏ → dấu hiệu nội tạng.',
        actionEn: 'Monitor abdominal pain, red urine → internal organ signs.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Giữ ấm, không cho uống nhiều nước.',
        actionEn: 'Keep warm, don\'t give too much water.',
      },
    ],
    donts: [
      'KHÔNG tự nhấc vật nặng đè > 15 phút (nguy hiểm)',
      'KHÔNG bỏ qua vết bầm lớn',
    ],
    priorityTags: ['đè', 'chấn thương'],
  },
  {
    id: 'burn_injury',
    categoryId: 'injury_firstaid',
    titleVi: 'Bỏng (nước nóng/điện)',
    titleEn: 'Burn (Hot Water/Electric)',
    iconName: 'Flame',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'LÀM MÁT bằng nước sạch mát 10–20 phút.',
        actionEn: 'COOL with clean cool water for 10–20 minutes.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Cởi bỏ đồ/trang sức quanh vết bỏng (trước khi sưng).',
        actionEn: 'Remove clothing/jewelry around burn (before swelling).',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Che bằng băng sạch hoặc màng bọc thực phẩm.',
        actionEn: 'Cover with clean bandage or cling wrap.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Nếu bỏng > bàn tay, ở mặt/tay/bẹn: gọi 115.',
        actionEn: 'If burn > palm size, on face/hands/groin: call 115.',
      },
    ],
    donts: [
      'KHÔNG bôi kem đánh răng, dầu, mỡ',
      'KHÔNG chọc vỡ bọng nước',
      'KHÔNG dùng đá lạnh trực tiếp',
    ],
    priorityTags: ['bỏng', 'sơ cứu'],
  },
  // NEW CASES for injury_firstaid
  {
    id: 'impaled_object',
    categoryId: 'injury_firstaid',
    titleVi: 'Vết đâm / vật cắm trong người',
    titleEn: 'Impaled Object',
    iconName: 'Pin',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'KHÔNG rút vật ra. Giữ yên.',
        actionEn: 'DON\'T remove object. Keep still.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Chèn gạc/vải quanh vật để cố định.',
        actionEn: 'Pack gauze/cloth around object to stabilize.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Gọi 115/113. Theo dõi thở.',
        actionEn: 'Call 115/113. Monitor breathing.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Giữ ấm, trấn an.',
        actionEn: 'Keep warm, reassure.',
      },
    ],
    donts: [
      'KHÔNG rút vật',
      'KHÔNG ấn mạnh vào vật',
    ],
    sosWhen: ['Chảy máu nhiều, lơ mơ'],
    priorityTags: ['vật đâm', 'chảy máu'],
  },
  {
    id: 'glass_cut',
    categoryId: 'injury_firstaid',
    titleVi: 'Vết cắt do kính vỡ',
    titleEn: 'Glass Cut',
    iconName: 'Scissors',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Ép cầm máu bằng vải sạch.',
        actionEn: 'Apply pressure with clean cloth.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Nâng cao chi nếu có thể, băng lại.',
        actionEn: 'Elevate limb if possible, bandage.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Rửa quanh vết thương bằng nước sạch (nếu có).',
        actionEn: 'Rinse around wound with clean water (if available).',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Theo dõi dấu nhiễm trùng.',
        actionEn: 'Monitor for infection signs.',
      },
    ],
    donts: [
      'KHÔNG rửa bằng nước bẩn',
      'KHÔNG tháo băng liên tục',
    ],
    sosWhen: ['Máu không cầm sau 10 phút'],
    priorityTags: ['kính vỡ', 'chảy máu'],
  },
  {
    id: 'head_injury',
    categoryId: 'injury_firstaid',
    titleVi: 'Đụng dập đầu (nghi chấn thương sọ)',
    titleEn: 'Head Injury (Suspected Skull Trauma)',
    iconName: 'Brain',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Cho nằm yên, đầu trung tính.',
        actionEn: 'Keep lying still, head in neutral position.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Kiểm tra tỉnh táo, hỏi tên/ngày.',
        actionEn: 'Check alertness, ask name/date.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Nếu nôn, lơ mơ: gọi 115.',
        actionEn: 'If vomiting, confused: call 115.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Theo dõi 30–60 phút, không để ngủ sâu nếu bất thường.',
        actionEn: 'Monitor 30-60 min, don\'t let sleep deeply if abnormal.',
      },
    ],
    donts: [
      'KHÔNG cho uống rượu/cafe',
      'KHÔNG tự lái xe đi xa',
    ],
    sosWhen: ['Ngất, co giật, nôn nhiều'],
    priorityTags: ['đầu', 'chấn thương'],
  },
  {
    id: 'nosebleed_trauma',
    categoryId: 'injury_firstaid',
    titleVi: 'Chảy máu mũi do va đập',
    titleEn: 'Nosebleed from Trauma',
    iconName: 'Droplets',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Ngồi hơi cúi, bóp cánh mũi 10 phút.',
        actionEn: 'Sit leaning forward, pinch nostrils for 10 min.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Thở bằng miệng, chườm lạnh sống mũi.',
        actionEn: 'Breathe through mouth, apply cold to bridge of nose.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Nếu không cầm: gọi hỗ trợ.',
        actionEn: 'If doesn\'t stop: call for help.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Nghỉ ngơi, tránh xì mũi mạnh.',
        actionEn: 'Rest, avoid blowing nose hard.',
      },
    ],
    donts: [
      'KHÔNG ngửa đầu ra sau',
    ],
    sosWhen: ['Máu chảy nhiều, chóng mặt'],
    priorityTags: ['chảy máu', 'mũi'],
  },
  {
    id: 'stepped_on_nail',
    categoryId: 'injury_firstaid',
    titleVi: 'Bị dẫm đinh / vật bẩn',
    titleEn: 'Stepped on Nail / Dirty Object',
    iconName: 'Pin',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Rửa bằng nước sạch nếu có, ép cầm máu nhẹ.',
        actionEn: 'Rinse with clean water if available, apply light pressure.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Băng sạch, giữ khô.',
        actionEn: 'Apply clean bandage, keep dry.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Ghi nhớ thời điểm, cần khám/tư vấn tiêm phòng uốn ván.',
        actionEn: 'Note time, need to consult about tetanus vaccination.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Theo dõi sưng đỏ, đau tăng.',
        actionEn: 'Monitor for swelling, increasing pain.',
      },
    ],
    donts: [
      'KHÔNG đắp lá bẩn',
      'KHÔNG ngâm nước lũ',
    ],
    sosWhen: ['Sưng nhanh, sốt, chảy mủ'],
    priorityTags: ['đinh', 'nhiễm trùng'],
  },
  {
    id: 'heat_exhaustion',
    categoryId: 'injury_firstaid',
    titleVi: 'Say nắng / kiệt sức',
    titleEn: 'Heat Exhaustion',
    iconName: 'Sun',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Đưa vào chỗ mát, nới lỏng quần áo.',
        actionEn: 'Move to cool area, loosen clothing.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Cho uống nước từng ngụm nhỏ (nếu tỉnh).',
        actionEn: 'Give small sips of water (if conscious).',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Lau mát, quạt nhẹ.',
        actionEn: 'Wipe with cool cloth, fan gently.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Nghỉ ngơi, theo dõi.',
        actionEn: 'Rest, monitor.',
      },
    ],
    donts: [
      'KHÔNG dội nước đá lạnh đột ngột',
    ],
    sosWhen: ['Lơ mơ, nôn nhiều, co giật'],
    priorityTags: ['say nắng', 'kiệt sức'],
  },
  {
    id: 'insect_snake_bite',
    categoryId: 'injury_firstaid',
    titleVi: 'Bị cắn (côn trùng/rắn)',
    titleEn: 'Insect/Snake Bite',
    iconName: 'Bug',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Giữ bình tĩnh, hạn chế cử động.',
        actionEn: 'Stay calm, limit movement.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Rửa nhẹ bằng nước sạch nếu có, băng lỏng.',
        actionEn: 'Rinse gently with clean water if available, loose bandage.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Gọi 115 nếu nghi rắn độc/triệu chứng nặng.',
        actionEn: 'Call 115 if venomous snake suspected/severe symptoms.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Giữ chi thấp hơn tim (nếu nghi rắn).',
        actionEn: 'Keep limb lower than heart (if snake suspected).',
      },
    ],
    donts: [
      'KHÔNG rạch/hút nọc',
      'KHÔNG garo chặt',
    ],
    sosWhen: ['Sưng nhanh, khó thở, lơ mơ'],
    priorityTags: ['rắn cắn', 'côn trùng'],
  },

  // ========== [6] HÔ HẤP / ĐUỐI NƯỚC (13 cases) ==========
  {
    id: 'unconscious_breathing',
    categoryId: 'breathing_drowning',
    titleVi: 'Người bất tỉnh (còn thở)',
    titleEn: 'Unconscious (Still Breathing)',
    iconName: 'Heart',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Gọi to, vỗ vai. Nếu không phản ứng: KIỂM TRA THỞ.',
        actionEn: 'Shout, tap shoulder. If no response: CHECK BREATHING.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Nếu còn thở: đặt tư thế nghiêng an toàn (nằm nghiêng, đầu thấp).',
        actionEn: 'If breathing: put in recovery position (on side, head low).',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Gọi 115. Nới lỏng quần áo. Theo dõi thở liên tục.',
        actionEn: 'Call 115. Loosen clothing. Monitor breathing continuously.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Giữ ấm. Không cho ăn uống. Không bỏ đi.',
        actionEn: 'Keep warm. No food/drink. Don\'t leave.',
      },
    ],
    donts: [
      'KHÔNG lay mạnh nếu nghi chấn thương cổ',
      'KHÔNG nằm ngửa (có thể nghẹt thở)',
      'KHÔNG đổ nước vào miệng',
    ],
    priorityTags: ['bất tỉnh', 'hô hấp'],
  },
  {
    id: 'unconscious_not_breathing',
    categoryId: 'breathing_drowning',
    titleVi: 'Người bất tỉnh (không thở)',
    titleEn: 'Unconscious (Not Breathing)',
    iconName: 'HeartOff',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'GỌI 115 NGAY! Bắt đầu ép ngực nếu biết CPR.',
        actionEn: 'CALL 115 NOW! Start chest compressions if trained in CPR.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Ép ngực 30 lần, sâu 5cm, nhanh (100–120/phút).',
        actionEn: 'Compress chest 30 times, 5cm deep, fast (100-120/min).',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Nếu biết: 2 lần thổi ngạt sau mỗi 30 ép. Lặp lại.',
        actionEn: 'If trained: 2 rescue breaths after every 30 compressions. Repeat.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'KHÔNG DỪNG CPR cho đến khi có người thay hoặc nạn nhân tỉnh.',
        actionEn: 'DON\'T STOP CPR until someone takes over or victim recovers.',
      },
    ],
    donts: [
      'KHÔNG trì hoãn CPR',
      'KHÔNG ép yếu hoặc chậm',
      'KHÔNG bỏ cuộc sớm',
    ],
    sosWhen: ['Luôn gọi SOS - đây là cấp cứu tối khẩn'],
    priorityTags: ['ngưng thở', 'CPR'],
  },
  {
    id: 'drowning_rescue',
    categoryId: 'breathing_drowning',
    titleVi: 'Đuối nước (vớt lên)',
    titleEn: 'Drowning (After Rescue)',
    iconName: 'Waves',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Đưa lên cạn. KIỂM TRA THỞ ngay.',
        actionEn: 'Get to shore. CHECK BREATHING immediately.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Nếu không thở: bắt đầu CPR. Nếu còn thở: đặt nghiêng.',
        actionEn: 'If not breathing: start CPR. If breathing: put on side.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Gọi 115. Giữ ấm (cởi đồ ướt, quấn chăn).',
        actionEn: 'Call 115. Keep warm (remove wet clothes, wrap in blanket).',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Dù tỉnh lại cũng cần theo dõi - có thể suy hô hấp muộn.',
        actionEn: 'Even if awake, monitor - delayed respiratory failure possible.',
      },
    ],
    donts: [
      'KHÔNG dốc ngược nạn nhân (không tống nước ra)',
      'KHÔNG ép bụng mạnh',
      'KHÔNG bỏ qua nạn nhân đã tỉnh',
    ],
    priorityTags: ['đuối nước', 'CPR'],
  },
  {
    id: 'smoke_inhalation',
    categoryId: 'breathing_drowning',
    titleVi: 'Hít khói',
    titleEn: 'Smoke Inhalation',
    iconName: 'Cloud',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'ĐƯA RA KHÔNG KHÍ SẠCH ngay lập tức.',
        actionEn: 'MOVE TO FRESH AIR immediately.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Nếu còn tỉnh: cho ngồi thẳng, thở chậm, sâu.',
        actionEn: 'If conscious: sit upright, breathe slowly, deeply.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Nếu ho nhiều, khó thở, tím môi: gọi 115.',
        actionEn: 'If severe coughing, difficulty breathing, blue lips: call 115.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Theo dõi 24h - triệu chứng có thể xuất hiện muộn.',
        actionEn: 'Monitor 24h - symptoms may appear later.',
      },
    ],
    donts: [
      'KHÔNG quay lại vùng khói',
      'KHÔNG bỏ qua triệu chứng nhẹ',
    ],
    priorityTags: ['khói', 'hô hấp'],
  },
  {
    id: 'choking',
    categoryId: 'breathing_drowning',
    titleVi: 'Hóc dị vật (sặc)',
    titleEn: 'Choking',
    iconName: 'AlertTriangle',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Hỏi "Bạn có sao không?". Nếu không nói được: XỬ TRÍ HÓC.',
        actionEn: 'Ask "Are you OK?". If can\'t speak: TREAT CHOKING.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'VỖ LƯNG 5 lần (giữa 2 bả vai). Nếu không ra: ÉP BỤNG 5 lần.',
        actionEn: 'BACK BLOWS 5 times (between shoulder blades). If not out: ABDOMINAL THRUSTS 5 times.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Lặp lại vỗ lưng + ép bụng cho đến khi ra hoặc bất tỉnh.',
        actionEn: 'Repeat back blows + abdominal thrusts until cleared or unconscious.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Nếu bất tỉnh: đặt xuống, bắt đầu CPR, gọi 115.',
        actionEn: 'If unconscious: lay down, start CPR, call 115.',
      },
    ],
    donts: [
      'KHÔNG móc họng nếu không thấy vật',
      'KHÔNG vỗ lưng khi người còn ho được',
    ],
    priorityTags: ['hóc', 'nghẹt thở'],
  },
  {
    id: 'difficulty_breathing_dirty_water',
    categoryId: 'breathing_drowning',
    titleVi: 'Khó thở sau khi hít nước bẩn',
    titleEn: 'Difficulty Breathing After Inhaling Dirty Water',
    iconName: 'Wind',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Đưa ra nơi thoáng. Cho ngồi thẳng.',
        actionEn: 'Move to ventilated area. Sit upright.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Thở chậm, sâu. Nới lỏng quần áo.',
        actionEn: 'Breathe slowly, deeply. Loosen clothing.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Nếu thở rít, tím môi: gọi 115 ngay.',
        actionEn: 'If wheezing, blue lips: call 115 immediately.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Theo dõi liên tục, có thể viêm phổi muộn.',
        actionEn: 'Monitor continuously, delayed pneumonia possible.',
      },
    ],
    donts: [
      'KHÔNG bỏ qua ho kéo dài',
    ],
    priorityTags: ['khó thở', 'nước bẩn'],
  },
  // NEW CASES for breathing_drowning
  {
    id: 'mild_drowning_coughing',
    categoryId: 'breathing_drowning',
    titleVi: 'Đuối nước nhẹ (ho nhiều)',
    titleEn: 'Mild Drowning (Heavy Coughing)',
    iconName: 'Waves',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Đưa ra nơi khô, giữ ấm.',
        actionEn: 'Move to dry area, keep warm.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Cho ngồi nghiêng, ho tống nước, thở chậm.',
        actionEn: 'Sit leaning forward, cough out water, breathe slowly.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Theo dõi khó thở, tím tái.',
        actionEn: 'Monitor for difficulty breathing, cyanosis.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Nếu triệu chứng tăng: gọi 115.',
        actionEn: 'If symptoms worsen: call 115.',
      },
    ],
    donts: [
      'KHÔNG dốc ngược người',
      'KHÔNG "vỗ lưng mạnh" khi không cần',
    ],
    sosWhen: ['Khó thở, lơ mơ'],
    priorityTags: ['đuối nước', 'ho'],
  },
  {
    id: 'inhaled_dirty_water',
    categoryId: 'breathing_drowning',
    titleVi: 'Hít nước bẩn / bùn',
    titleEn: 'Inhaled Dirty Water / Mud',
    iconName: 'Droplets',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Đưa ra chỗ thoáng, ngồi thẳng.',
        actionEn: 'Move to ventilated area, sit upright.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Nới quần áo, trấn an.',
        actionEn: 'Loosen clothing, reassure.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Gọi 115 nếu thở rít, tím môi.',
        actionEn: 'Call 115 if wheezing, blue lips.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Theo dõi liên tục.',
        actionEn: 'Monitor continuously.',
      },
    ],
    donts: [
      'KHÔNG cho uống nhiều một lúc',
    ],
    sosWhen: ['Thở yếu, tím tái'],
    priorityTags: ['hít nước', 'bùn'],
  },
  {
    id: 'inhaled_strange_gas',
    categoryId: 'breathing_drowning',
    titleVi: 'Hít khí lạ (mùi nồng)',
    titleEn: 'Inhaled Strange Gas',
    iconName: 'Cloud',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Rời khỏi phòng ngay.',
        actionEn: 'Leave room immediately.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Hít thở nơi thoáng, mở cửa nếu an toàn.',
        actionEn: 'Breathe in ventilated area, open doors if safe.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Gọi hỗ trợ nếu đau đầu/choáng.',
        actionEn: 'Call for help if headache/dizzy.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Không quay lại nơi nghi khí độc.',
        actionEn: 'Don\'t return to suspected toxic gas area.',
      },
    ],
    donts: [
      'KHÔNG bật lửa/điện trong khu nghi gas',
    ],
    sosWhen: ['Ngất, khó thở'],
    priorityTags: ['khí độc', 'hô hấp'],
  },
  {
    id: 'choking_adult_conscious',
    categoryId: 'breathing_drowning',
    titleVi: 'Hóc dị vật (người lớn còn tỉnh)',
    titleEn: 'Choking (Conscious Adult)',
    iconName: 'AlertTriangle',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Hỏi "có nói được không?". Nếu không: xử trí hóc.',
        actionEn: 'Ask "can you speak?". If not: treat choking.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Vỗ lưng 5 cái + ép bụng 5 cái (nếu đã được học).',
        actionEn: 'Back blows 5 times + abdominal thrusts 5 times (if trained).',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Nếu không ra: gọi 115, tiếp tục theo hướng dẫn.',
        actionEn: 'If not cleared: call 115, continue as instructed.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Theo dõi thở.',
        actionEn: 'Monitor breathing.',
      },
    ],
    donts: [
      'KHÔNG móc họng mù quáng',
    ],
    sosWhen: ['Bất tỉnh, không thở'],
    priorityTags: ['hóc', 'người lớn'],
  },
  {
    id: 'asthma_no_meds',
    categoryId: 'breathing_drowning',
    titleVi: 'Người bị hen / khó thở (thiếu thuốc)',
    titleEn: 'Asthma / Difficulty Breathing (No Meds)',
    iconName: 'Wind',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Cho ngồi thẳng, bình tĩnh.',
        actionEn: 'Sit upright, stay calm.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Dùng thuốc hít nếu có. Tránh khói/bụi.',
        actionEn: 'Use inhaler if available. Avoid smoke/dust.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Nếu không đỡ: gọi 115.',
        actionEn: 'If no improvement: call 115.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Theo dõi nói chuyện có khó không.',
        actionEn: 'Monitor if speaking becomes difficult.',
      },
    ],
    donts: [
      'KHÔNG ép nằm ngửa',
    ],
    sosWhen: ['Tím môi, nói khó, kiệt sức'],
    priorityTags: ['hen', 'khó thở'],
  },
  {
    id: 'unconscious_low_oxygen',
    categoryId: 'breathing_drowning',
    titleVi: 'Bất tỉnh do ngạt (thiếu oxy)',
    titleEn: 'Unconscious from Suffocation',
    iconName: 'HeartOff',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Đưa ra nơi thoáng (nếu an toàn cho người cứu).',
        actionEn: 'Move to ventilated area (if safe for rescuer).',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Gọi 115/113. Kiểm tra thở.',
        actionEn: 'Call 115/113. Check breathing.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Nếu không thở: bắt đầu CPR theo hướng dẫn.',
        actionEn: 'If not breathing: start CPR as instructed.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Tiếp tục theo chỉ dẫn từ cứu hộ.',
        actionEn: 'Continue following rescue instructions.',
      },
    ],
    donts: [
      'KHÔNG vào phòng kín nếu bạn cũng có nguy cơ ngạt',
    ],
    sosWhen: ['Luôn SOS'],
    priorityTags: ['ngạt', 'bất tỉnh'],
  },
  {
    id: 'seizure',
    categoryId: 'breathing_drowning',
    titleVi: 'Co giật',
    titleEn: 'Seizure',
    iconName: 'Activity',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Dọn vật sắc, kê mềm dưới đầu.',
        actionEn: 'Clear sharp objects, cushion under head.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Nghiêng người sang một bên khi hết giật.',
        actionEn: 'Turn person on side when seizure ends.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Gọi 115 nếu giật > 5 phút hoặc lặp lại.',
        actionEn: 'Call 115 if seizure > 5 min or repeats.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Theo dõi thở.',
        actionEn: 'Monitor breathing.',
      },
    ],
    donts: [
      'KHÔNG nhét vật vào miệng',
    ],
    sosWhen: ['Giật kéo dài, bất tỉnh'],
    priorityTags: ['co giật', 'cấp cứu'],
  },

  // ========== [7] LẠNH / HẠ THÂN NHIỆT (12 cases) ==========
  {
    id: 'shivering_wet',
    categoryId: 'cold_hypothermia',
    titleVi: 'Run lập cập sau khi ngâm nước',
    titleEn: 'Shivering After Water Exposure',
    iconName: 'Snowflake',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'ĐƯA VÀO NƠI KÍN GIÓ! Cởi đồ ướt ngay.',
        actionEn: 'GET TO SHELTERED AREA! Remove wet clothes immediately.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Quấn chăn/áo khô. Ủ ấm thân trung tâm (ngực, lưng).',
        actionEn: 'Wrap in blanket/dry clothes. Warm core (chest, back).',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Cho uống nước ấm (nếu tỉnh). KHÔNG uống rượu.',
        actionEn: 'Give warm drink (if conscious). NO alcohol.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Nếu ngừng run đột ngột + lơ mơ: HẠ THÂN NHIỆT NẶNG - gọi 115.',
        actionEn: 'If stops shivering + confused: SEVERE HYPOTHERMIA - call 115.',
      },
    ],
    donts: [
      'KHÔNG chà xát mạnh tay chân',
      'KHÔNG dùng nước quá nóng',
      'KHÔNG cho uống rượu/cafe',
    ],
    priorityTags: ['lạnh', 'run'],
  },
  {
    id: 'severe_hypothermia',
    categoryId: 'cold_hypothermia',
    titleVi: 'Hạ thân nhiệt nặng (lơ mơ)',
    titleEn: 'Severe Hypothermia (Confused)',
    iconName: 'Snowflake',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'GỌI 115 NGAY! Đây là cấp cứu.',
        actionEn: 'CALL 115 NOW! This is an emergency.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Đưa vào nơi kín gió. Cởi đồ ướt, quấn chăn/túi ngủ.',
        actionEn: 'Move to sheltered area. Remove wet clothes, wrap in blanket/sleeping bag.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Ủ ấm CHẬM. Đặt chai nước ấm vào nách, bẹn (không chạm da trực tiếp).',
        actionEn: 'Warm SLOWLY. Put warm bottles in armpits, groin (not direct skin contact).',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Nếu ngừng thở: bắt đầu CPR. KHÔNG bỏ cuộc.',
        actionEn: 'If stops breathing: start CPR. DON\'T give up.',
      },
    ],
    donts: [
      'KHÔNG làm ấm quá nhanh',
      'KHÔNG cho uống gì nếu lơ mơ',
      'KHÔNG xoa bóp tay chân',
    ],
    priorityTags: ['hạ thân nhiệt', 'cấp cứu'],
  },
  {
    id: 'wet_clothes_long',
    categoryId: 'cold_hypothermia',
    titleVi: 'Quần áo ướt lâu',
    titleEn: 'Prolonged Wet Clothes',
    iconName: 'Shirt',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'THAY ĐỒ KHÔ ngay khi có thể.',
        actionEn: 'CHANGE TO DRY CLOTHES as soon as possible.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Nếu không có đồ khô: vắt khô tối đa, quấn túi nilon/áo mưa bên ngoài.',
        actionEn: 'If no dry clothes: wring out maximum, wrap plastic/raincoat outside.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Vận động nhẹ (nếu an toàn) để tạo nhiệt.',
        actionEn: 'Light movement (if safe) to generate heat.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Ưu tiên giữ ấm phần thân. Tránh gió.',
        actionEn: 'Prioritize keeping torso warm. Avoid wind.',
      },
    ],
    donts: [
      'KHÔNG để quần áo ướt áp sát quá lâu',
      'KHÔNG bỏ qua run rẩy',
    ],
    priorityTags: ['ướt', 'lạnh'],
  },
  {
    id: 'child_cold',
    categoryId: 'cold_hypothermia',
    titleVi: 'Trẻ nhỏ bị lạnh',
    titleEn: 'Child Exposure to Cold',
    iconName: 'Baby',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Ôm trẻ sát người để truyền nhiệt. Cởi đồ ướt.',
        actionEn: 'Hold child close for body heat. Remove wet clothes.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Quấn chăn/áo khô. Đội mũ cho trẻ (mất nhiệt qua đầu).',
        actionEn: 'Wrap in blanket/dry clothes. Put hat on child (heat loss through head).',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Cho uống ấm nếu tỉnh và không nôn.',
        actionEn: 'Give warm drink if conscious and not vomiting.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Nếu tím môi, lờ đờ: gọi 115.',
        actionEn: 'If blue lips, lethargic: call 115.',
      },
    ],
    donts: [
      'KHÔNG để trẻ nằm trên nền lạnh',
      'KHÔNG dùng nước nóng',
    ],
    priorityTags: ['trẻ em', 'lạnh'],
  },
  {
    id: 'elderly_cold',
    categoryId: 'cold_hypothermia',
    titleVi: 'Người già bị lạnh',
    titleEn: 'Elderly Exposure to Cold',
    iconName: 'UserRound',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Đưa vào nơi ấm. Cởi đồ ướt nếu có.',
        actionEn: 'Move to warm place. Remove wet clothes if any.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Quấn chăn, ủ ấm. Người già mất nhiệt nhanh hơn.',
        actionEn: 'Wrap in blanket, keep warm. Elderly lose heat faster.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Cho uống ấm từng ngụm nhỏ.',
        actionEn: 'Give warm drink in small sips.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Nếu lú lẫn, nói chậm: nghi hạ thân nhiệt - gọi 115.',
        actionEn: 'If confused, slow speech: suspect hypothermia - call 115.',
      },
    ],
    donts: [
      'KHÔNG để người già ở một mình khi lạnh',
      'KHÔNG làm ấm quá nhanh',
    ],
    priorityTags: ['người già', 'lạnh'],
  },
  {
    id: 'exhaustion_cold_hungry',
    categoryId: 'cold_hypothermia',
    titleVi: 'Kiệt sức do lạnh + đói',
    titleEn: 'Exhaustion from Cold + Hunger',
    iconName: 'Battery',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Cho ngồi/nằm nghỉ. Giữ ấm.',
        actionEn: 'Have them sit/lie down. Keep warm.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Cho ăn nhẹ (đường, bánh) và uống ấm nếu có.',
        actionEn: 'Give light food (sugar, crackers) and warm drink if available.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Theo dõi tỉnh táo, run.',
        actionEn: 'Monitor alertness, shivering.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Nếu ngất, không ăn được: gọi 115.',
        actionEn: 'If faints, can\'t eat: call 115.',
      },
    ],
    donts: [
      'KHÔNG để người kiệt sức tự đi một mình',
      'KHÔNG cho ăn quá no ngay',
    ],
    priorityTags: ['kiệt sức', 'đói', 'lạnh'],
  },
  // NEW CASES for cold_hypothermia
  {
    id: 'wet_rain_wind',
    categoryId: 'cold_hypothermia',
    titleVi: 'Ướt mưa lâu + gió lạnh',
    titleEn: 'Wet from Rain + Cold Wind',
    iconName: 'CloudRain',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Thay đồ khô ngay. Lau khô người.',
        actionEn: 'Change to dry clothes immediately. Dry off.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Quấn chăn/áo ấm, che gió.',
        actionEn: 'Wrap in blanket/warm clothes, block wind.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Uống nước ấm từng ngụm (nếu tỉnh).',
        actionEn: 'Drink warm water in sips (if conscious).',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Theo dõi run/đờ đẫn.',
        actionEn: 'Monitor shivering/lethargy.',
      },
    ],
    donts: [
      'KHÔNG uống rượu',
    ],
    sosWhen: ['Lơ mơ, run không kiểm soát'],
    priorityTags: ['mưa', 'gió', 'lạnh'],
  },
  {
    id: 'hypothermia_after_immersion',
    categoryId: 'cold_hypothermia',
    titleVi: 'Hạ thân nhiệt sau khi ngâm nước',
    titleEn: 'Hypothermia After Water Immersion',
    iconName: 'Snowflake',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Đưa khỏi nước, cởi đồ ướt.',
        actionEn: 'Get out of water, remove wet clothes.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Ủ ấm thân trung tâm (ngực, lưng), không chà xát mạnh.',
        actionEn: 'Warm core (chest, back), don\'t rub vigorously.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Cho uống ấm nếu tỉnh.',
        actionEn: 'Give warm drink if conscious.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Gọi hỗ trợ nếu lơ mơ.',
        actionEn: 'Call for help if confused.',
      },
    ],
    donts: [
      'KHÔNG làm nóng quá nhanh (nước rất nóng)',
    ],
    sosWhen: ['Lú lẫn, thở chậm'],
    priorityTags: ['ngâm nước', 'hạ thân nhiệt'],
  },
  {
    id: 'child_cold_exposure',
    categoryId: 'cold_hypothermia',
    titleVi: 'Trẻ nhỏ bị lạnh (chi tiết)',
    titleEn: 'Child Cold Exposure (Detailed)',
    iconName: 'Baby',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Lau khô, mặc ấm, đội mũ.',
        actionEn: 'Dry off, dress warmly, put on hat.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Ủ ấm sát người lớn.',
        actionEn: 'Warm close to adult body.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Cho uống ấm (nếu phù hợp).',
        actionEn: 'Give warm drink (if appropriate).',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Theo dõi tím môi/lừ đừ.',
        actionEn: 'Monitor for blue lips/lethargy.',
      },
    ],
    donts: [
      'KHÔNG để trẻ nằm nền lạnh',
    ],
    sosWhen: ['Trẻ lơ mơ, tím tái'],
    priorityTags: ['trẻ em', 'lạnh'],
  },
  {
    id: 'elderly_cold_slow',
    categoryId: 'cold_hypothermia',
    titleVi: 'Người già bị lạnh, run, chậm chạp',
    titleEn: 'Elderly Cold, Shivering, Slow',
    iconName: 'UserRound',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Đưa vào nơi kín gió, ủ ấm.',
        actionEn: 'Move to sheltered area, keep warm.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Uống ấm từng ngụm, kiểm tra tỉnh táo.',
        actionEn: 'Drink warm in sips, check alertness.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Theo dõi nhịp thở, mạch.',
        actionEn: 'Monitor breathing, pulse.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Nếu lơ mơ: gọi hỗ trợ.',
        actionEn: 'If confused: call for help.',
      },
    ],
    donts: [
      'KHÔNG để người già ở một mình khi lạnh',
    ],
    sosWhen: ['Lơ mơ, thở yếu'],
    priorityTags: ['người già', 'lạnh'],
  },
  {
    id: 'too_many_wet_clothes',
    categoryId: 'cold_hypothermia',
    titleVi: 'Quá nhiều quần áo ẩm, không có đồ khô',
    titleEn: 'Too Many Wet Clothes, No Dry Ones',
    iconName: 'Shirt',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Vắt khô tối đa, thay lớp trong khô nhất có thể.',
        actionEn: 'Wring out maximum, change to driest inner layer possible.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Tạo "lớp cách nhiệt" bằng túi nilon/áo mưa (không quấn kín mặt).',
        actionEn: 'Create "insulation layer" with plastic bag/raincoat (don\'t cover face).',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Ngồi co gối, giảm mất nhiệt.',
        actionEn: 'Sit hugging knees, reduce heat loss.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Xin chăn/đồ khô từ cộng đồng.',
        actionEn: 'Request blanket/dry clothes from community.',
      },
    ],
    donts: [
      'KHÔNG để quần áo ướt áp sát quá lâu',
    ],
    sosWhen: ['Run mạnh, lơ mơ'],
    priorityTags: ['ướt', 'không có đồ khô'],
  },
  {
    id: 'exhaustion_cold_hunger_detailed',
    categoryId: 'cold_hypothermia',
    titleVi: 'Kiệt sức do lạnh + đói (chi tiết)',
    titleEn: 'Exhaustion from Cold + Hunger (Detailed)',
    iconName: 'Battery',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Ngồi xuống, ủ ấm.',
        actionEn: 'Sit down, keep warm.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Ăn đồ ngọt/nhẹ (nếu có), uống ấm.',
        actionEn: 'Eat sweet/light food (if available), drink warm.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Nghỉ ngơi, tránh làm việc nặng.',
        actionEn: 'Rest, avoid heavy work.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Theo dõi chóng mặt/ngất.',
        actionEn: 'Monitor for dizziness/fainting.',
      },
    ],
    donts: [
      'KHÔNG cố "cày" dọn dẹp khi run',
    ],
    sosWhen: ['Ngất, không ăn uống được'],
    priorityTags: ['kiệt sức', 'đói', 'lạnh'],
  },

  // ========== [8] NHÓM DỄ TỔN THƯƠNG (12 cases) ==========
  {
    id: 'child_lost_evacuation',
    categoryId: 'vulnerable_groups',
    titleVi: 'Trẻ em bị lạc trong sơ tán',
    titleEn: 'Child Lost During Evacuation',
    iconName: 'Baby',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'GHI NHỚ địa điểm mất. Hô to tên trẻ.',
        actionEn: 'REMEMBER location lost. Shout child\'s name.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Nhờ người xung quanh tìm kiếm cùng. Mô tả đặc điểm.',
        actionEn: 'Ask people nearby to search together. Describe features.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Báo ban quản lý điểm sơ tán hoặc công an.',
        actionEn: 'Report to evacuation point management or police.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Giữ liên lạc. Đặt điểm hẹn cố định.',
        actionEn: 'Stay in contact. Set fixed meeting point.',
      },
    ],
    donts: [
      'KHÔNG để trẻ đeo đồ trang sức dễ bị giữ',
      'KHÔNG để trẻ ra xa khỏi tầm mắt',
    ],
    priorityTags: ['trẻ em', 'lạc'],
  },
  {
    id: 'elderly_confused',
    categoryId: 'vulnerable_groups',
    titleVi: 'Người già lú lẫn',
    titleEn: 'Confused Elderly Person',
    iconName: 'UserRound',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Giữ an toàn, không để đi một mình.',
        actionEn: 'Keep safe, don\'t let wander alone.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Nói chậm, rõ. Hỏi tên, địa chỉ, người thân.',
        actionEn: 'Speak slowly, clearly. Ask name, address, family.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Tìm thẻ nhận dạng trong túi/cổ. Báo ban quản lý.',
        actionEn: 'Look for ID card in pocket/around neck. Report to management.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Ở bên cạnh cho đến khi tìm được người thân.',
        actionEn: 'Stay with them until family found.',
      },
    ],
    donts: [
      'KHÔNG hét, gây hoảng sợ',
      'KHÔNG để một mình trong đám đông',
    ],
    priorityTags: ['người già', 'lú lẫn'],
  },
  {
    id: 'chronic_illness_missing_meds',
    categoryId: 'vulnerable_groups',
    titleVi: 'Người bệnh nền thiếu thuốc',
    titleEn: 'Chronic Illness Missing Medication',
    iconName: 'Pill',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Xác định loại thuốc cần. Kiểm tra còn bao nhiêu.',
        actionEn: 'Identify needed medication. Check how much remains.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Hỏi người xung quanh có cùng loại thuốc không.',
        actionEn: 'Ask people nearby if they have same medication.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Báo đội y tế tại điểm sơ tán. Ghi tên thuốc, liều.',
        actionEn: 'Report to medical team at evacuation point. Note drug name, dose.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Theo dõi triệu chứng. Gọi 115 nếu có dấu hiệu nặng.',
        actionEn: 'Monitor symptoms. Call 115 if severe signs.',
      },
    ],
    donts: [
      'KHÔNG tự ý dùng thuốc người khác nếu không chắc',
      'KHÔNG bỏ qua triệu chứng bất thường',
    ],
    priorityTags: ['bệnh nền', 'thuốc'],
  },
  {
    id: 'pregnant_priority',
    categoryId: 'vulnerable_groups',
    titleVi: 'Phụ nữ mang thai cần ưu tiên',
    titleEn: 'Pregnant Woman Needs Priority',
    iconName: 'Heart',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Cho ngồi/nằm nghỉ. Hỏi tuần thai, có đau bụng/ra máu không.',
        actionEn: 'Have her sit/lie down. Ask weeks pregnant, any pain/bleeding.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Ưu tiên di chuyển an toàn. Không để đi bộ xa trong nước.',
        actionEn: 'Prioritize safe transport. Don\'t let walk far in water.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Báo đội y tế. Chuẩn bị nước sạch, đồ khô.',
        actionEn: 'Report to medical team. Prepare clean water, dry food.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Nếu đau bụng, ra máu: gọi 115 ngay - có thể sinh sớm.',
        actionEn: 'If pain, bleeding: call 115 immediately - possible early labor.',
      },
    ],
    donts: [
      'KHÔNG để thai phụ mang vác nặng',
      'KHÔNG bỏ qua đau bụng bất thường',
    ],
    priorityTags: ['thai phụ', 'ưu tiên'],
  },
  {
    id: 'disability_movement_assist',
    categoryId: 'vulnerable_groups',
    titleVi: 'Người khuyết tật cần hỗ trợ',
    titleEn: 'Disabled Person Needs Assistance',
    iconName: 'Accessibility',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'HỎI cần hỗ trợ gì. Đừng tự ý làm.',
        actionEn: 'ASK what help needed. Don\'t assume.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Giúp di chuyển cùng dụng cụ hỗ trợ (xe lăn, gậy).',
        actionEn: 'Help move with assistive devices (wheelchair, cane).',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Đưa đến điểm an toàn. Giữ dụng cụ hỗ trợ bên cạnh.',
        actionEn: 'Take to safe point. Keep assistive devices nearby.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Ở cùng, giải thích tình hình. Đảm bảo nhu cầu cơ bản.',
        actionEn: 'Stay with them, explain situation. Ensure basic needs met.',
      },
    ],
    donts: [
      'KHÔNG tự ý bế/cõng nếu người đó phản đối',
      'KHÔNG tách người khỏi dụng cụ hỗ trợ',
      'KHÔNG nói quá nhanh với người khiếm thính',
      'KHÔNG bỏ đi sau khi đưa đến nơi an toàn',
    ],
    priorityTags: ['khuyết tật', 'hỗ trợ'],
  },
  {
    id: 'panic_attack',
    categoryId: 'vulnerable_groups',
    titleVi: 'Hoảng loạn không kiểm soát',
    titleEn: 'Uncontrolled Panic Attack',
    iconName: 'AlertCircle',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'NÓI CHẬM, BÌNH TĨNH: "Tôi ở đây. Bạn an toàn."',
        actionEn: 'SPEAK SLOWLY, CALMLY: "I\'m here. You\'re safe."',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Hướng dẫn thở: Hít vào 4 giây, giữ 4 giây, thở ra 4 giây.',
        actionEn: 'Guide breathing: Inhale 4 sec, hold 4 sec, exhale 4 sec.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Đưa ra nơi yên tĩnh. Hỏi cần gì, ai cần liên lạc.',
        actionEn: 'Move to quiet place. Ask what they need, who to contact.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Ở bên cạnh. Không ép buộc. Cho uống nước.',
        actionEn: 'Stay nearby. Don\'t force. Offer water.',
      },
    ],
    donts: [
      'KHÔNG la hét, tát vào mặt',
      'KHÔNG nói "bình tĩnh đi" liên tục',
      'KHÔNG bỏ đi khi người đó còn run',
      'KHÔNG chế giễu, phán xét',
    ],
    priorityTags: ['hoảng loạn', 'tâm lý'],
  },
  // NEW CASES for vulnerable_groups
  {
    id: 'child_panic_crying',
    categoryId: 'vulnerable_groups',
    titleVi: 'Trẻ em hoảng loạn, khóc không dừng',
    titleEn: 'Child Panic, Non-Stop Crying',
    iconName: 'Baby',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Ôm giữ an toàn, nói ngắn "đang an toàn".',
        actionEn: 'Hold safely, say briefly "you\'re safe".',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Đưa đến nơi yên, tránh tiếng ồn/đám đông.',
        actionEn: 'Take to quiet place, avoid noise/crowds.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Cho uống ấm, thở cùng trẻ (đếm 1–4).',
        actionEn: 'Give warm drink, breathe with child (count 1-4).',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Gắn thẻ tên/SĐT lên áo trẻ.',
        actionEn: 'Attach name/phone tag to child\'s clothes.',
      },
    ],
    donts: [
      'KHÔNG quát mắng',
      'KHÔNG tách trẻ khỏi người lớn',
    ],
    sosWhen: ['Trẻ có dấu hiệu ngất/khó thở'],
    priorityTags: ['trẻ em', 'hoảng loạn'],
  },
  {
    id: 'elderly_wandering',
    categoryId: 'vulnerable_groups',
    titleVi: 'Người già lú lẫn, đi lạc',
    titleEn: 'Confused Elderly, Wandering',
    iconName: 'UserRound',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Giữ ở nơi an toàn, không để tự đi.',
        actionEn: 'Keep in safe place, don\'t let wander.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Gọi người thân, ghi thông tin nhận dạng.',
        actionEn: 'Call family, note identifying information.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Cho uống nước, ủ ấm.',
        actionEn: 'Give water, keep warm.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Không để một mình.',
        actionEn: 'Don\'t leave alone.',
      },
    ],
    donts: [
      'KHÔNG ép nhớ thông tin khi đang hoảng',
    ],
    sosWhen: ['Ngất, té ngã, yếu liệt'],
    priorityTags: ['người già', 'lú lẫn'],
  },
  {
    id: 'chronic_illness_missing_meds_detailed',
    categoryId: 'vulnerable_groups',
    titleVi: 'Thiếu thuốc bệnh nền (chi tiết)',
    titleEn: 'Missing Chronic Illness Meds (Detailed)',
    iconName: 'Pill',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Kiểm kê thuốc còn lại, dùng đúng liều.',
        actionEn: 'Inventory remaining meds, use correct dose.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Ghi lại tên thuốc/liều, chuẩn bị xin hỗ trợ.',
        actionEn: 'Note drug name/dose, prepare to request support.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Gửi SOS/hỗ trợ cộng đồng để tìm thuốc.',
        actionEn: 'Send SOS/community support to find medication.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Theo dõi triệu chứng bất thường.',
        actionEn: 'Monitor for abnormal symptoms.',
      },
    ],
    donts: [
      'KHÔNG tự tăng liều',
    ],
    sosWhen: ['Lơ mơ, đau ngực, khó thở'],
    priorityTags: ['bệnh nền', 'thuốc'],
  },
  {
    id: 'pregnant_pain_bleeding',
    categoryId: 'vulnerable_groups',
    titleVi: 'Phụ nữ mang thai đau bụng/ra máu',
    titleEn: 'Pregnant Woman with Pain/Bleeding',
    iconName: 'Heart',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Cho nằm nghiêng trái, giữ bình tĩnh.',
        actionEn: 'Lie on left side, stay calm.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Gọi 115/113, chuẩn bị di chuyển an toàn.',
        actionEn: 'Call 115/113, prepare for safe transport.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Ghi thời gian, mức đau, lượng máu.',
        actionEn: 'Note time, pain level, blood amount.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Giữ ấm, không ăn uống quá nhiều.',
        actionEn: 'Keep warm, don\'t eat/drink too much.',
      },
    ],
    donts: [
      'KHÔNG tự di chuyển qua nước xiết',
    ],
    sosWhen: ['Ra máu nhiều', 'Đau tăng', 'Ngất'],
    priorityTags: ['thai phụ', 'cấp cứu'],
  },
  {
    id: 'disabled_evacuation',
    categoryId: 'vulnerable_groups',
    titleVi: 'Người khuyết tật cần sơ tán',
    titleEn: 'Disabled Person Needs Evacuation',
    iconName: 'Accessibility',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Ưu tiên đưa lên cao, chuẩn bị thiết bị hỗ trợ.',
        actionEn: 'Prioritize moving to higher ground, prepare assistive devices.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Đi theo nhóm 2 người, đảm bảo an toàn đường đi.',
        actionEn: 'Move in pairs, ensure safe path.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Gọi hỗ trợ nếu không thể di chuyển.',
        actionEn: 'Call for help if cannot move.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Ở nơi dễ tiếp cận, đánh dấu vị trí.',
        actionEn: 'Stay in accessible location, mark position.',
      },
    ],
    donts: [
      'KHÔNG để người ở lại một mình',
    ],
    sosWhen: ['Không thể sơ tán', 'Nước dâng'],
    priorityTags: ['khuyết tật', 'sơ tán'],
  },
  {
    id: 'panic_breathing_shaking',
    categoryId: 'vulnerable_groups',
    titleVi: 'Người bị panic (thở gấp, run)',
    titleEn: 'Person with Panic (Hyperventilating, Shaking)',
    iconName: 'AlertCircle',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Đưa ra nơi yên. Nói 1 câu lệnh ngắn.',
        actionEn: 'Move to quiet area. Say one short instruction.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Hướng dẫn thở 4-4 (hít 4, thở 4).',
        actionEn: 'Guide breathing 4-4 (inhale 4, exhale 4).',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Cho ngồi, uống nước từng ngụm.',
        actionEn: 'Have them sit, drink water in sips.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Không để một mình.',
        actionEn: 'Don\'t leave alone.',
      },
    ],
    donts: [
      'KHÔNG tranh cãi',
      'KHÔNG dồn dập nhiều câu',
    ],
    sosWhen: ['Ngất', 'Đau ngực', 'Không kiểm soát hành vi'],
    priorityTags: ['hoảng loạn', 'thở gấp'],
  },
  {
    id: 'family_status_report',
    categoryId: 'vulnerable_groups',
    titleVi: 'Người thân ở xa muốn "báo tình trạng"',
    titleEn: 'Remote Family Wants Status Update',
    iconName: 'MessageSquare',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Gửi 1 tin ngắn: "an toàn / cần giúp / vị trí".',
        actionEn: 'Send 1 short message: "safe / need help / location".',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Nếu có mạng: gửi định vị + tình trạng.',
        actionEn: 'If signal: send location + status.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Nếu không mạng: dùng kênh offline trong khu (BLE).',
        actionEn: 'If no signal: use offline channel in area (BLE).',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Cập nhật theo giờ (ví dụ mỗi 2–3h).',
        actionEn: 'Update periodically (e.g., every 2-3h).',
      },
    ],
    donts: [
      'KHÔNG gửi quá dài làm loãng thông tin',
    ],
    sosWhen: ['Không an toàn', 'Cần ưu tiên cứu hộ'],
    priorityTags: ['liên lạc', 'gia đình'],
  },

  // ========== [9] HỖ TRỢ TÂM LÝ – GIỮ BÌNH TĨNH (10 cases) ==========
  {
    id: 'self_panic_overwhelmed',
    categoryId: 'psychological_support',
    titleVi: 'Tôi đang quá hoảng loạn',
    titleEn: 'I\'m Overwhelmed with Panic',
    iconName: 'Heart',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Đặt tay lên ngực. Hít vào 4 giây, thở ra 6 giây.',
        actionEn: 'Place hand on chest. Inhale 4 sec, exhale 6 sec.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Lặp lại hít thở 3 lần. Nhìn quanh 3 vật thể thật.',
        actionEn: 'Repeat breathing 3 times. Look at 3 real objects around you.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Gọi người thân hoặc ghi 1 điều bạn biết ơn.',
        actionEn: 'Call family or write 1 thing you\'re grateful for.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Ngồi tựa tường, nhắm mắt 1 phút. Nhắc: "Mình đang sống. Mình đang cố gắng."',
        actionEn: 'Sit against wall, close eyes 1 min. Remind: "I\'m alive. I\'m trying."',
      },
    ],
    donts: [
      'KHÔNG hét, không cào cấu',
      'KHÔNG làm đau bản thân',
    ],
    sosWhen: ['Mất kiểm soát hành vi', 'Ngất hoặc thở gấp kéo dài'],
    priorityTags: ['hoảng loạn', 'tự giúp'],
  },
  {
    id: 'child_scared_crying',
    categoryId: 'psychological_support',
    titleVi: 'Trẻ em hoảng sợ, khóc không ngừng',
    titleEn: 'Scared Child, Won\'t Stop Crying',
    iconName: 'Baby',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Ôm trẻ sát ngực. Thở cùng trẻ.',
        actionEn: 'Hold child close to chest. Breathe together.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Nói nhỏ: "Mình ở đây rồi, không sao nhé". Xoa nhẹ lưng.',
        actionEn: 'Say softly: "I\'m here, it\'s okay". Gently rub back.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Cho trẻ chơi vật quen thuộc. Kể chuyện đơn giản nếu có thể.',
        actionEn: 'Give child familiar object. Tell simple story if possible.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Đưa trẻ ra nơi ít tiếng ồn.',
        actionEn: 'Move child to quieter area.',
      },
    ],
    donts: [
      'KHÔNG dọa nạt',
      'KHÔNG yêu cầu "im ngay"',
    ],
    sosWhen: ['Trẻ run, khó thở', 'Không phản ứng sau dỗ lâu'],
    priorityTags: ['trẻ em', 'tâm lý'],
  },
  {
    id: 'feeling_alone',
    categoryId: 'psychological_support',
    titleVi: 'Cảm thấy hoàn toàn cô đơn',
    titleEn: 'Feeling Completely Alone',
    iconName: 'User',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Mở mục kết nối nếu có. Nhắn: "Tôi tên A, ai còn đó không?"',
        actionEn: 'Open connection section if available. Message: "My name is A, is anyone there?"',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Nếu không ai trả lời: đọc tên 3 đồ vật quanh mình.',
        actionEn: 'If no response: name 3 objects around you.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Viết 1 câu gửi người thân yêu.',
        actionEn: 'Write 1 message for someone you love.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Đặt tay lên ngực, nhắm mắt 10 giây. Ghi nhật ký 3 điều bạn có.',
        actionEn: 'Put hand on chest, close eyes 10 sec. Journal 3 things you have.',
      },
    ],
    donts: [
      'KHÔNG im lặng hoàn toàn',
      'KHÔNG nhốt kín',
    ],
    sosWhen: ['Muốn tự làm hại', 'Không giao tiếp suốt thời gian dài'],
    priorityTags: ['cô đơn', 'tâm lý'],
  },
  {
    id: 'no_one_answers',
    categoryId: 'psychological_support',
    titleVi: 'Không ai nghe máy – sợ bị bỏ lại',
    titleEn: 'No One Answers – Fear of Being Left Behind',
    iconName: 'PhoneOff',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Nhắn: "Tôi vẫn ổn. Gọi lại nhé". Ngồi xuống.',
        actionEn: 'Text: "I\'m okay. Call me back". Sit down.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Nhắm mắt 3 nhịp thở sâu. Viết lại các bước bạn đã làm để sống sót.',
        actionEn: 'Close eyes, 3 deep breaths. Write steps you took to survive.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Đọc to 1 câu bạn tin tưởng.',
        actionEn: 'Read aloud 1 statement you believe in.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Tự nhủ: "Mình đang cố gắng hết sức". Ghi tên người bạn muốn gặp lại.',
        actionEn: 'Tell yourself: "I\'m doing my best". Write name of person you want to see again.',
      },
    ],
    donts: [
      'KHÔNG phá hủy thiết bị liên lạc',
      'KHÔNG hành động impulsive',
    ],
    sosWhen: ['Quá tải cảm xúc, mất kiểm soát'],
    priorityTags: ['lo lắng', 'mất liên lạc'],
  },
  {
    id: 'family_missing_unknown',
    categoryId: 'psychological_support',
    titleVi: 'Người thân mất liên lạc – không biết họ sống không',
    titleEn: 'Family Missing – Don\'t Know If Alive',
    iconName: 'Users',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Nhắc bản thân: "Mất liên lạc ≠ mất họ".',
        actionEn: 'Remind yourself: "Lost contact ≠ lost them".',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Nhắm mắt, tưởng tượng khuôn mặt người đó. Ghi 1 câu muốn nói với họ.',
        actionEn: 'Close eyes, imagine their face. Write 1 thing you want to say to them.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Ghi lại thời điểm cuối cùng bạn liên lạc.',
        actionEn: 'Note the last time you were in contact.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Thư giãn vai, đặt tay lên tim. Tạo tin nhắn sẵn: "Tôi vẫn ở đây. Tôi chờ bạn".',
        actionEn: 'Relax shoulders, put hand on heart. Create message: "I\'m still here. I\'m waiting for you".',
      },
    ],
    donts: [
      'KHÔNG nghĩ "mọi thứ kết thúc"',
      'KHÔNG tự cô lập',
    ],
    sosWhen: ['Ý định tự tử', 'Khóc không dừng, mất nhận thức thời gian'],
    priorityTags: ['mất liên lạc', 'tâm lý'],
  },
  {
    id: 'post_storm_withdrawal',
    categoryId: 'psychological_support',
    titleVi: 'Sau bão, không muốn gặp ai – stress hậu chấn',
    titleEn: 'Post-Storm Withdrawal – PTSD Symptoms',
    iconName: 'Brain',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Tắt thông tin trong 5 phút. Uống 1 ngụm nước.',
        actionEn: 'Turn off news for 5 min. Drink a sip of water.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Viết 3 điều bạn sống sót được. Cử động nhẹ tay chân.',
        actionEn: 'Write 3 things you survived. Move hands and feet gently.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Gọi 1 người để báo "mình còn sống".',
        actionEn: 'Call 1 person to say "I\'m alive".',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Ra ngoài ánh sáng tự nhiên.',
        actionEn: 'Go out into natural light.',
      },
    ],
    donts: [
      'KHÔNG ở bóng tối quá lâu',
      'KHÔNG dồn nén cảm xúc',
    ],
    sosWhen: ['Mất ngủ 3+ ngày', 'Trầm cảm kéo dài'],
    priorityTags: ['stress hậu chấn', 'tâm lý'],
  },
  {
    id: 'caregiver_exhaustion',
    categoryId: 'psychological_support',
    titleVi: 'Đang chăm người thân nhưng quá kiệt sức',
    titleEn: 'Caregiver Exhaustion',
    iconName: 'Heart',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Rời người thân 2 phút (nếu an toàn). Hít thở sâu.',
        actionEn: 'Step away from patient for 2 min (if safe). Deep breaths.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Viết: "Tôi đang làm tốt nhất có thể".',
        actionEn: 'Write: "I\'m doing the best I can".',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Gọi người thân xin thay phiên.',
        actionEn: 'Call family to take turns.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Ăn nhẹ hoặc ngồi nghỉ có ý thức.',
        actionEn: 'Eat light or consciously rest.',
      },
    ],
    donts: [
      'KHÔNG tự đổ lỗi',
      'KHÔNG quát mắng',
    ],
    sosWhen: ['Lơ mơ, không nhận biết môi trường', 'Phản ứng chậm'],
    priorityTags: ['kiệt sức', 'chăm sóc'],
  },
  {
    id: 'cannot_sleep_fear',
    categoryId: 'psychological_support',
    titleVi: 'Không thể ngủ vì sợ hãi',
    titleEn: 'Cannot Sleep Due to Fear',
    iconName: 'Moon',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Hít sâu 3 lần. Đặt tay lên tim, nhắm mắt.',
        actionEn: 'Deep breath 3 times. Put hand on heart, close eyes.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Nghe tiếng tự nhiên (mưa, gió…). Chạm tay vào vật cứng – nền đất, sàn.',
        actionEn: 'Listen to natural sounds (rain, wind…). Touch something solid – ground, floor.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Ghi lại 3 điều tốt đẹp chờ đợi bạn.',
        actionEn: 'Write 3 good things waiting for you.',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Nằm thoải mái, không ép ngủ ngay.',
        actionEn: 'Lie comfortably, don\'t force immediate sleep.',
      },
    ],
    donts: [
      'KHÔNG xem lại tin tiêu cực',
      'KHÔNG uống nhiều caffein',
    ],
    sosWhen: ['Không ngủ 2 đêm liên tục', 'Rối loạn hoảng sợ'],
    priorityTags: ['mất ngủ', 'sợ hãi'],
  },
  {
    id: 'panic_blackout',
    categoryId: 'psychological_support',
    titleVi: 'Hoảng loạn khi mất điện hoàn toàn',
    titleEn: 'Panic During Complete Blackout',
    iconName: 'PowerOff',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Ngồi xuống, không di chuyển. Sờ vào sàn, xác định vị trí.',
        actionEn: 'Sit down, don\'t move. Touch floor, identify location.',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Nhớ lại sơ đồ nhà/căn phòng.',
        actionEn: 'Recall layout of house/room.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Tìm nguồn sáng nhỏ nếu có (điện thoại, pin).',
        actionEn: 'Find small light source if available (phone, battery).',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Gọi to tên người thân nếu gần.',
        actionEn: 'Call out family member\'s name if nearby.',
      },
    ],
    donts: [
      'KHÔNG chạy',
      'KHÔNG bật đèn chớp loạn',
    ],
    sosWhen: ['Té ngã', 'Không trả lời, bất tỉnh'],
    priorityTags: ['mất điện', 'hoảng loạn'],
  },
  {
    id: 'hopelessness_despair',
    categoryId: 'psychological_support',
    titleVi: 'Cảm giác tuyệt vọng, mất ý chí',
    titleEn: 'Hopelessness and Despair',
    iconName: 'Heart',
    steps: [
      {
        timeframe: '0–30 GIÂY',
        actionVi: 'Hít thật sâu. Nói thầm: "Tôi vẫn còn sống".',
        actionEn: 'Breathe deeply. Whisper: "I\'m still alive".',
        critical: true,
      },
      {
        timeframe: '30 GIÂY – 2 PHÚT',
        actionVi: 'Viết tên 1 người bạn thương. Uống ngụm nước.',
        actionEn: 'Write name of 1 person you love. Drink some water.',
        critical: true,
      },
      {
        timeframe: '2–5 PHÚT',
        actionVi: 'Viết ra: "Tôi cần giúp đỡ".',
        actionEn: 'Write: "I need help".',
      },
      {
        timeframe: 'CHỜ CỨU HỘ',
        actionVi: 'Bạn không cô đơn. Có người đang chờ bạn sống tiếp.',
        actionEn: 'You\'re not alone. Someone is waiting for you to keep going.',
      },
    ],
    donts: [
      'KHÔNG hành động một mình',
      'KHÔNG nghĩ mình vô giá trị',
    ],
    sosWhen: ['Ý định tự hại', 'Không thể phản ứng'],
    priorityTags: ['tuyệt vọng', 'tâm lý'],
  },
];

// ============ HELPER FUNCTIONS ============

export function getCategoriesOrdered(): SurvivalCategory[] {
  return [...categories].sort((a, b) => a.order - b.order);
}

export function getCasesByCategory(categoryId: string): SurvivalCase[] {
  return cases.filter(c => c.categoryId === categoryId);
}

export function getCaseById(caseId: string): SurvivalCase | undefined {
  return cases.find(c => c.id === caseId);
}

export function searchCases(query: string): SurvivalCase[] {
  if (!query.trim()) return cases;
  
  const lowerQuery = query.toLowerCase();
  return cases.filter(c => 
    c.titleVi.toLowerCase().includes(lowerQuery) ||
    c.titleEn.toLowerCase().includes(lowerQuery) ||
    c.priorityTags?.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
    categories.find(cat => cat.id === c.categoryId)?.titleVi.toLowerCase().includes(lowerQuery)
  );
}

export function getCategoryById(categoryId: string): SurvivalCategory | undefined {
  return categories.find(c => c.id === categoryId);
}

// Keyword matching for quick scenario detection
const keywordMap: Record<string, string> = {
  // Electrical & Fire
  'điện': 'electrical_leak_water',
  'điện giật': 'electrical_leak_water',
  'dây điện': 'fallen_wire',
  'tủ điện': 'wet_electrical_panel',
  'gas': 'gas_leak',
  'rò gas': 'gas_leak',
  'ngộ độc': 'carbon_monoxide',
  'máy phát điện': 'carbon_monoxide',
  'cháy': 'fire_during_flood',
  'mất điện': 'power_outage_area',
  'pin phồng': 'power_bank_swelling',
  'nến': 'candle_fire_blackout',
  
  // Movement
  'nước xiết': 'fast_current_walking',
  'xe máy': 'motorbike_stalled',
  'ô tô': 'car_rising_water',
  'xe hơi': 'car_rising_water',
  'cuốn trôi': 'car_swept_away',
  'hố ga': 'open_manhole',
  'sạt lở': 'road_landslide',
  'kẹt tầng cao': 'trapped_upper_floor',
  'thang máy': 'stuck_elevator',
  'mất sóng': 'no_signal_contact',
  
  // Building
  'sập': 'wall_crack_collapse_risk',
  'nứt': 'wall_crack_collapse_risk',
  'mái tôn': 'roof_blown_off',
  'gió': 'roof_blown_off',
  'cây đổ': 'tree_fallen_near_house',
  'kính vỡ': 'broken_glass_debris',
  'tầng hầm': 'flooded_basement',
  'kẹt': 'trapped_in_room',
  'tiếng rắc': 'structural_noise',
  
  // Water & Hygiene
  'uống nhầm': 'drank_dirty_water',
  'nước bẩn': 'drank_dirty_water',
  'tiêu chảy': 'acute_diarrhea',
  'vết thương': 'wound_touched_flood',
  'thực phẩm': 'spoiled_food',
  'nấm mốc': 'mold_in_house',
  'hoá chất': 'chemical_water',
  'thiếu nước': 'water_shortage_24h',
  'muỗi': 'mosquito_increase',
  
  // Injury
  'chảy máu': 'heavy_bleeding',
  'máu': 'heavy_bleeding',
  'gãy': 'broken_arm_leg',
  'gãy xương': 'broken_arm_leg',
  'bong gân': 'sprain_dislocation',
  'trật khớp': 'sprain_dislocation',
  'rách da': 'open_wound',
  'bị đè': 'crush_injury',
  'va đập': 'crush_injury',
  'bỏng': 'burn_injury',
  'say nắng': 'heat_exhaustion',
  'rắn cắn': 'insect_snake_bite',
  
  // Breathing
  'bất tỉnh': 'unconscious_breathing',
  'ngất': 'unconscious_breathing',
  'không thở': 'unconscious_not_breathing',
  'đuối nước': 'drowning_rescue',
  'khói': 'smoke_inhalation',
  'hóc': 'choking',
  'sặc': 'choking',
  'khó thở': 'difficulty_breathing_dirty_water',
  'hen': 'asthma_no_meds',
  'co giật': 'seizure',
  
  // Cold
  'lạnh': 'shivering_wet',
  'run': 'shivering_wet',
  'hạ thân nhiệt': 'severe_hypothermia',
  'ướt': 'wet_clothes_long',
  
  // Vulnerable
  'trẻ em': 'child_lost_evacuation',
  'trẻ lạc': 'child_lost_evacuation',
  'người già': 'elderly_confused',
  'lú lẫn': 'elderly_confused',
  'bệnh nền': 'chronic_illness_missing_meds',
  'thuốc': 'chronic_illness_missing_meds',
  'mang thai': 'pregnant_priority',
  'thai': 'pregnant_priority',
  'khuyết tật': 'disability_movement_assist',
  'hoảng loạn': 'panic_attack',
  'panic': 'panic_attack',
  
  // Psychological
  'sợ': 'self_panic_overwhelmed',
  'tuyệt vọng': 'hopelessness_despair',
  'cô đơn': 'feeling_alone',
  'mất ngủ': 'cannot_sleep_fear',
  'kiệt sức': 'caregiver_exhaustion',
};

export function matchCaseFromText(text: string): string | null {
  const lowerText = text.toLowerCase();
  
  for (const [keyword, caseId] of Object.entries(keywordMap)) {
    if (lowerText.includes(keyword)) {
      return caseId;
    }
  }
  
  return null;
}

// Get all cases
export function getAllCases(): SurvivalCase[] {
  return cases;
}

// Get step labels
export const STEP_LABELS = {
  step1: { vi: '0–30 GIÂY', en: '0-30 SEC', critical: true },
  step2: { vi: '30 GIÂY – 2 PHÚT', en: '30 SEC – 2 MIN', critical: true },
  step3: { vi: '2–5 PHÚT', en: '2–5 MIN', critical: false },
  step4: { vi: 'CHỜ CỨU HỘ', en: 'WAIT FOR RESCUE', critical: false },
};
