// 34 đơn vị hành chính cấp tỉnh của Việt Nam
// Theo Nghị quyết sắp xếp ĐVHC cấp tỉnh năm 2025 (có hiệu lực từ 12/06/2025)

// 6 Thành phố trực thuộc Trung ương
export const centralCities = [
  'Hà Nội',
  'Huế',
  'Hải Phòng',
  'Đà Nẵng',
  'TP Hồ Chí Minh',
  'Cần Thơ',
];

// 28 Tỉnh
export const provincesOnly = [
  'An Giang',
  'Bắc Ninh',
  'Cà Mau',
  'Cao Bằng',
  'Đắk Lắk',
  'Điện Biên',
  'Đồng Nai',
  'Đồng Tháp',
  'Gia Lai',
  'Hà Tĩnh',
  'Hưng Yên',
  'Khánh Hòa',
  'Lai Châu',
  'Lâm Đồng',
  'Lạng Sơn',
  'Lào Cai',
  'Nghệ An',
  'Ninh Bình',
  'Phú Thọ',
  'Quảng Ngãi',
  'Quảng Ninh',
  'Quảng Trị',
  'Sơn La',
  'Tây Ninh',
  'Thái Nguyên',
  'Thanh Hóa',
  'Tuyên Quang',
  'Vĩnh Long',
];

// Tổng hợp 34 đơn vị — sắp xếp A-Z
export const provinces: string[] = [
  ...centralCities,
  ...provincesOnly,
].sort((a, b) => a.localeCompare(b, 'vi'));
