/* ===========================================================================
   PHỐ BẢNG HIỆU — the wall.

   LAYOUT MODEL. The board is a split tree. A node is either a SIGN (leaf) or a
   CONTAINER holding children stacked in a row or a column. Every child carries
   a `size` used directly as flex-grow, so the children of a container always
   consume exactly the space the container has — the wall is full by
   construction, at any viewport, at any moment during a drag.

   Dragging a seam moves space between the two signs it separates and leaves
   every other sign alone: their flex-grow never changes, so nothing else on
   the wall moves. Resizing the window changes no `size` at all — the whole
   board just re-proportions, then re-fits its type.

   TYPE FITTING. Cells here range from a business card to half the screen, so
   nothing can be sized in rem. Each sign is measured at a probe cap-height,
   then scaled once by the ratio that makes the block fit its cell (cap-height
   sizing is linear, so one pass is exact). Small cells drop lines rather than
   shrink into illegibility — the way a real sign reads from far away.
   ========================================================================= */
(function () {
'use strict';

var $ = function (sel, root) { return (root || document).querySelector(sel); };

/* The wall speaks to whichever type system the current theme names. Both
   js/utm-fonts.js and js/sg85-fonts.js expose the same surface, so everything
   below — recipes, pickers, cap-height fitting — works against either. */
var type = null;

/* ===========================================================================
   1. THE SHOPS
   Each entry carries several names / taglines / footers so a reshuffle turns
   up a different business, not the same one in new colours. `like` borrows the
   type recipe of a catalogued category (see type.recipes).
   ========================================================================= */
var SHOPS = {
  'khach-san': { label: 'Khách sạn', icon: 'KS', cat: 'KHÁCH SẠN', pal: ['yellow', 'light', 'green'],
    name: ['MƯỜI EM', 'THANH BÌNH', 'HOÀNG YẾN', 'MINH CHÂU'],
    tagline: ['PHỤC VỤ 24/24', 'PHÒNG MÁY LẠNH', 'NHẬN KHÁCH ĐOÀN'],
    footer: ['GIÁ BÌNH DÂN', 'CÓ CHỖ ĐẬU XE', '☎ 0913 456 789'] },

  'nha-tro': { label: 'Nhà trọ', icon: 'NT', cat: 'NHÀ TRỌ', pal: ['light', 'blue'],
    name: ['CÔ BA', 'SỐ 7', 'HUỲNH GIA'],
    tagline: ['PHÒNG SẠCH · AN NINH', 'GIỜ GIẤC TỰ DO', 'CÓ GÁC LỬNG'],
    footer: ['0909 222 333', 'THÁNG 1TR2', 'CÒN PHÒNG TRỐNG'] },

  'quan-com': { label: 'Cơm tấm', icon: '●', cat: 'CƠM TẤM', pal: ['light', 'red'],
    name: ['SƯỜN QUE', 'BÀ TÁM', 'CÔ HAI'],
    tagline: ['GIAO HÀNG TẬN NƠI', 'CƠM · BÚN · PHỞ', 'BÁN TỪ 6H SÁNG'],
    footer: ['☎ 0909 123 456', '25K / DĨA', 'MỞ CẢ NGÀY'] },

  'banh-mi': { label: 'Bánh mì', icon: '◆', cat: 'BÁNH MÌ · XÔI', pal: ['light', 'yellow', 'orange'],
    name: ['CÔ TÁM', 'XÍU MẠI', 'BẢY HIỀN'],
    tagline: ['NÓNG GIÒN MỖI SÁNG', 'THỊT NGUỘI · CHẢ LỤA', 'XÔI MẶN · XÔI NGỌT'],
    footer: ['5K — 15K', 'BÁN TỪ 5H', 'GÓI MANG ĐI'] },

  'ca-phe': { label: 'Cà phê', icon: '☕', cat: 'CÀ PHÊ · TRÀ ĐÁ', pal: ['light', 'purple'],
    name: ['CHÚ TƯ', 'VỈA HÈ', 'SỐ 33'],
    tagline: ['VỈA HÈ MÁT MẺ', 'PHIN · SỮA ĐÁ', 'WIFI MIỄN PHÍ'],
    footer: ['GIÁ SINH VIÊN', '12K — 20K', 'MỞ 5H – 22H'] },

  'hot-toc': { label: 'Hớt tóc', icon: 'HT', cat: 'HỚT TÓC NAM', pal: ['purple', 'blue'],
    name: ['Salon Hải', 'Tuấn', 'Ngọc Anh'],
    tagline: ['CẮT · GỘI · UỐN · NHUỘM', 'CẠO MẶT · LẤY RÁY TAI', 'CÓ MÁY LẠNH'],
    footer: ['ĐẶC BIỆT: RÁY TAI', '50K / LƯỢT', '0938 111 222'] },

  'nail-spa': { label: 'Nail & spa', icon: 'NS', cat: 'NAIL · SPA', pal: ['pink', 'purple'],
    name: ['Mỹ Tiên', 'Kim Chi', 'Ngọc'],
    tagline: ['LÀM ĐẸP TRỌN GÓI', 'NỐI MI · PHUN XĂM', 'GỘI ĐẦU DƯỠNG SINH'],
    footer: ['ƯU ĐÃI THÁNG NÀY', 'ĐẶT LỊCH 0977 888 999'] },

  'sua-xe': { label: 'Sửa xe', icon: 'SX', cat: 'SỬA XE MÁY', pal: ['blue', 'orange', 'green'],
    name: ['GARA ANH HAI', 'TÁM XE', 'THÀNH ĐẠT'],
    tagline: ['ĐỒNG SƠN · MÁY · ĐIỆN', 'VÁ ÉP · THAY NHỚT', 'RỬA XE 20K'],
    footer: ['0938 456 789', 'MỞ 7H – 19H', 'CỨU HỘ TẬN NƠI'] },

  'sua-dt': { label: 'Điện thoại', icon: 'ĐT', cat: 'SỬA ĐIỆN THOẠI', pal: ['blue', 'teal'],
    name: ['AN TÂM', 'HOÀNG PHÁT', '24H'],
    tagline: ['SỬA NHANH LẤY LIỀN', 'THAY MÀN HÌNH · PIN', 'ÉP KÍNH LẤY NGAY'],
    footer: ['BẢO HÀNH 1 NĂM', 'MUA BÁN MÁY CŨ'] },

  'giat-ui': { label: 'Giặt ủi', icon: 'GU', cat: 'GIẶT ỦI', pal: ['light', 'teal'],
    name: ['SẠCH NHANH', 'TÍN NGHĨA', '3 GIỜ'],
    tagline: ['LẤY LIỀN TRONG NGÀY', 'GIẶT SẤY · ỦI HƠI', 'NHẬN CHĂN MÀN'],
    footer: ['GIAO TẬN NHÀ', '15K / KG'] },

  'cam-do': { label: 'Cầm đồ', icon: 'CĐ', cat: 'CẦM ĐỒ', pal: ['green', 'yellow', 'red'],
    name: ['UY TÍN', 'PHÚ QUÝ', 'THÀNH TÍN'],
    tagline: ['LÃI SUẤT THẤP NHẤT', 'CẦM XE · VÀNG · ĐIỆN THOẠI', 'THỦ TỤC NHANH GỌN'],
    footer: ['HỖ TRỢ NHANH', '0911 555 777'] },

  'bia-tuoi': { label: 'Bia tươi', icon: 'BT', cat: 'BIA TƯƠI', pal: ['blue', 'red', 'green'],
    name: ['BIVA', 'HAI LÚA', '555'],
    tagline: ['PHỤC VỤ CÁC MÓN ĂN', 'MỒI NGON · BIA LẠNH', 'LẨU · NƯỚNG'],
    footer: ['BÌNH DÂN', 'MỞ ĐẾN KHUYA'] },

  'thuoc-tay': { label: 'Thuốc tây', icon: '✚', cat: 'NHÀ THUỐC TÂY', pal: ['light', 'teal'],
    name: ['SỐ 1', 'MINH CHÂU', 'AN KHANG'],
    tagline: ['TƯ VẤN MIỄN PHÍ', 'ĐO HUYẾT ÁP MIỄN PHÍ', 'THUỐC TÂY · THỰC PHẨM CHỨC NĂNG'],
    footer: ['MỞ CỬA 24/24', 'GIAO THUỐC TẬN NƠI'] },

  'karaoke': { label: 'Karaoke', icon: 'KR', cat: 'KARAOKE', pal: ['dark', 'purple'],
    name: ['NGÔI SAO', 'HOÀNG CUNG', 'ĐÊM MÀU HỒNG'],
    tagline: ['PHÒNG VIP · MÁY LẠNH', 'ÂM THANH 5 TẤC', 'MÀN HÌNH LED'],
    footer: ['GIỜ VÀNG GIẢM 50%', 'ĐẶT PHÒNG 0900 123'] },

  'tap-hoa': { label: 'Tạp hóa', icon: 'TH', cat: 'TẠP HÓA', like: 'quan-com', pal: ['yellow', 'light', 'orange'],
    name: ['DÌ NĂM', 'PHƯƠNG', 'BÌNH AN'],
    tagline: ['BÁN SỈ & LẺ', 'GAS · NƯỚC SUỐI', 'THẺ CÀO · SIM SỐ'],
    footer: ['GIAO TẬN NHÀ', 'MỞ 6H – 22H'] },

  'photocopy': { label: 'Photocopy', icon: 'PH', cat: 'PHOTOCOPY · IN ẤN', like: 'sua-dt', pal: ['teal', 'blue'],
    name: ['NHANH', 'HỒNG ĐỨC', 'SỐ 9'],
    tagline: ['IN MÀU · ÉP PLASTIC', 'ĐÁNH MÁY · SCAN', 'IN NHANH LẤY LIỀN'],
    footer: ['200Đ / TRANG', 'NHẬN IN FILE ZALO'] },

  'vlxd': { label: 'Vật liệu XD', icon: 'XD', cat: 'VẬT LIỆU XÂY DỰNG', like: 'sua-xe', pal: ['orange', 'green', 'blue'],
    name: ['HAI THÀNH', 'ĐẠI PHÁT', 'TRUNG NAM'],
    tagline: ['XI MĂNG · CÁT · ĐÁ', 'SẮT THÉP · GẠCH ỐNG', 'GIAO HÀNG CÔNG TRÌNH'],
    footer: ['0912 333 444', 'GIÁ TẬN GỐC'] },

  'nuoc-mia': { label: 'Nước mía', icon: 'NM', cat: 'NƯỚC MÍA SIÊU SẠCH', like: 'ca-phe', pal: ['light', 'yellow'],
    name: ['CÔ LAN', 'MÍA VÀNG', 'SỐ 1'],
    tagline: ['MÍA TƯƠI MỖI NGÀY', 'SINH TỐ · TRÀ TẮC', 'ĐÁ SẠCH'],
    footer: ['10K / LY', 'MANG ĐI'] },

  'may-do': { label: 'May đo', icon: 'MĐ', cat: 'MAY ĐO · SỬA QUẦN ÁO', like: 'nail-spa', pal: ['pink', 'purple'],
    name: ['Chị Thu', 'Kim Loan', 'Thời Trang Hạnh'],
    tagline: ['LÊN LAI · BÓP EO', 'ÁO DÀI · VEST', 'NHẬN HÀNG GẤP'],
    footer: ['LẤY TRONG NGÀY', '0908 777 111'] },

  'sua-khoa': { label: 'Sửa khóa', icon: 'SK', cat: 'SỬA KHÓA · MÀI DAO', like: 'sua-xe', pal: ['red', 'orange', 'light'],
    name: ['CHÚ BẢY', 'LƯU ĐỘNG', 'TÂN TIẾN'],
    tagline: ['CHÌA KHÓA XE · NHÀ', 'MỞ KHÓA TẬN NƠI', 'MÀI DAO KÉO'],
    footer: ['CÓ MẶT SAU 15 PHÚT', '0977 246 802'] }
};

/* ===========================================================================
   2. PALETTES
   Two sets, one per theme. A shop names the colour *families* it belongs in
   (`pal` above) rather than a palette index, so switching theme keeps every
   sign's colour intent and just re-casts it in the other era's inks.

   NAY — today's vinyl: saturated, clashing, hard-shadowed.
   ========================================================================= */
var MODERN = [
  /* LAN ANH MÓNG NAIL — hot red board, gold name, a different ink per line */
  { bg: '#E8272C', inks: ['#FFE22E', '#FFFFFF', '#3BE86B', '#4AC7F0'],
    stroke: '#FFFFFF', deep: '#7A0F12', footerBg: '#FFE22E', footerColor: '#C4151A', fam: 'red' },

  /* ĐỒ SI TRẺ EM THỦY — signal green, white script name, red and blue services */
  { bg: '#3FC23F', inks: ['#FFFFFF', '#2B2BC4', '#8C1216', '#FFE22E'],
    stroke: '#FFFFFF', deep: '#14611A', footerBg: '#2B2BC4', footerColor: '#FFFFFF', fam: 'green' },

  /* CƠM TẤM SƯỜN QUE — the cheapest, loudest pair there is */
  { bg: '#F5E625', inks: ['#E8272C', '#E8272C', '#2B2BC4'],
    stroke: '#FFFFFF', deep: '#8C1216', footerBg: '#E8272C', footerColor: '#FFE22E', fam: 'yellow' },

  /* NGỌC SANG — yellow over black, red name keylined in blue */
  { bg: '#FFD400', inks: ['#151515', '#E8272C', '#151515'],
    stroke: '#FFFFFF', deep: '#1B5BC4', footerBg: '#151515', footerColor: '#FFD400', fam: 'yellow' },

  /* the LED box — black board, one bulb colour per line, and the chrome
     rainbow that karaoke fronts actually use */
  { bg: '#111114', inks: ['#FFFFFF', '#3BE86B', '#FFE22E', '#FF3B4E'],
    stroke: '#000000', deep: '#000000', footerBg: '#FFE22E', footerColor: '#111114',
    grad: 'linear-gradient(92deg,#FF214D,#FFE22E,#3BE8D0,#4AC7F0)', fam: 'dark' },

  /* MẮT KÍNH SỐ 1 — black and bulb yellow */
  { bg: '#0D0D10', inks: ['#FFE22E', '#FFE22E', '#FFFFFF'],
    stroke: '#4A3D00', deep: '#000000', footerBg: '#FFE22E', footerColor: '#0D0D10', fam: 'dark' },

  /* QUÁN NHẬU LẨU DÊ — yellow board with a red name banner across the top */
  { bg: '#FFD400', inks: ['#E8272C', '#1B5BC4', '#0A8A3C'],
    stroke: '#FFFFFF', deep: '#8C1216', banner: '#E8272C', bannerInk: '#FFFFFF',
    footerBg: '#0A8A3C', footerColor: '#FFFFFF', fam: 'yellow' },

  /* ĐTDĐ KHÁNH HOẠ — white board, every service line a different colour */
  { bg: '#FFFFFF', inks: ['#E8272C', '#3B1BC4', '#0A8A3C', '#F58220'],
    stroke: '#FFFFFF', deep: '#F58220', footerBg: '#E8272C', footerColor: '#FFFFFF', fam: 'light' },

  /* KA LONG CẦM ĐỒ — red board, navy name banner, gold display */
  { bg: '#D6161C', inks: ['#FFE22E', '#FFFFFF', '#FFE22E'],
    stroke: '#5A0508', deep: '#5A0508', banner: '#16266E', bannerInk: '#FFFFFF',
    footerBg: '#16266E', footerColor: '#FFE22E', fam: 'red' },

  /* BÃI GIỮ XE — red and gold, black keyline */
  { bg: '#E01B22', inks: ['#FFE22E', '#FFFFFF', '#FFE22E'],
    stroke: '#151515', deep: '#151515', footerBg: '#FFE22E', footerColor: '#D6161C', fam: 'red' },

  /* cobalt and gold — the phone-repair and giặt ủi standard */
  { bg: '#1B5BC4', inks: ['#FFE22E', '#FFFFFF', '#FFE22E'],
    stroke: '#0A2E6B', deep: '#0A2E6B', footerBg: '#FFE22E', footerColor: '#1B5BC4', fam: 'blue' },

  /* orange and cobalt */
  { bg: '#F58220', inks: ['#FFFFFF', '#2B2BC4', '#7A2E05'],
    stroke: '#FFFFFF', deep: '#8C4208', footerBg: '#2B2BC4', footerColor: '#FFFFFF', fam: 'orange' },

  /* nail, spa, may đo — shocking pink */
  { bg: '#FF3F8E', inks: ['#FFFFFF', '#5C0A2E', '#FFE22E'],
    stroke: '#FFFFFF', deep: '#8C0A42', footerBg: '#FFFFFF', footerColor: '#E01B6B', fam: 'pink' },

  /* teal and gold */
  { bg: '#00A9A5', inks: ['#FFFFFF', '#0A3B39', '#FFE22E'],
    stroke: '#00504E', deep: '#00504E', footerBg: '#FFE22E', footerColor: '#00706E', fam: 'teal' },

  /* white board, primaries — the print-shop default */
  { bg: '#F2F5F7', inks: ['#1B5BC4', '#E8272C', '#0A8A3C', '#F58220'],
    stroke: '#FFFFFF', deep: '#AEBDCB', footerBg: '#1B5BC4', footerColor: '#FFFFFF', fam: 'light' }
];


/* 1985 — enamel, oil paint and sun. Every pair below is lifted off a surviving
   Saigon shopfront: the oxide red and navy of HIỀN KHÁNH, the faded works blue
   of CHỈ SƠN, the maroon and gold of HỒNG KÝ MÌ GIA, the ivory and vermilion of
   PHÁT TÀI. Lower chroma, warmer whites, and shadows that are the sign's own
   colour darkened rather than plain black. */
var VINTAGE = [
  /* TIỆM SẮT VĨNH TƯỜNG — sky blue board, navy trade line, red name on a pale
     pink slab, service band in bottle green */
  { bg: '#6FC3E3', cat: '#14479B', name: '#E22B18', tagline: '#14479B',
    footerBg: '#2E7D6E', footerColor: '#FFFFFF',
    deep: '#F0A79E', stroke: '#FFFFFF', rule: '#14479B', fam: 'blue' },

  /* TUYẾT PHẤN, Hội An — aged cream, rust letters lifted on pale blue */
  { bg: '#E9DCC2', cat: '#1B1B1B', name: '#C4551F', tagline: '#1B4B6B',
    footerBg: '#F5EEDD', footerColor: '#1B1B1B',
    deep: '#A9C6CE', stroke: '#F7F1E2', rule: '#C4551F', fam: 'light' },

  /* TIỆM CÀ PHÊ NĂM LIỆU — flat cobalt, white script, red dot */
  { bg: '#1A6FC4', cat: '#F5C518', name: '#FFFFFF', tagline: '#DCEBF8',
    footerBg: '#FFFFFF', footerColor: '#14508F',
    deep: '#0E4C8A', stroke: '#0E4C8A', fam: 'blue' },

  /* MỸ TIÊN PHOTOCOPY — cream, red caps on a bottle-green slab */
  { bg: '#EDE8DC', cat: '#2C4A3E', name: '#C0392B', tagline: '#2C4A3E',
    footerBg: '#C0392B', footerColor: '#FDF6E8',
    deep: '#2C4A3E', stroke: '#F6F1E4', fam: 'light' },

  /* TỔNG ĐẠI LÝ VÉ SỐ — the orange band, white caps packed tight */
  { bg: '#E8912A', cat: '#FFF6DA', name: '#FFFFFF', tagline: '#1B4B8F',
    footerBg: '#1B4B8F', footerColor: '#F0EAD8',
    deep: '#B4620F', stroke: '#B4620F', fam: 'orange' },

  /* KIM HƯNG — whitewash, vermilion name, small print in ink */
  { bg: '#F2EFE4', cat: '#8B1A1A', name: '#CE2A22', tagline: '#2E2E2E',
    footerBg: '#2E2E2E', footerColor: '#F2EFE4',
    deep: '#F0B9A8', stroke: '#FFFFFF', rule: '#CE2A22', fam: 'light' },

  /* ĐÁNH BÓNG LƯ ĐỒNG — white board, navy rule, red name on black */
  { bg: '#FFFFFF', cat: '#1B3F8B', name: '#D62828', tagline: '#1B3F8B',
    footerBg: '#1B3F8B', footerColor: '#FFFFFF',
    deep: '#1A1A1A', stroke: '#FFFFFF', rule: '#1B3F8B', fam: 'light' },

  /* NHÀ MAY QUỲNH TIÊN — two-tone blue, red script outlined in white */
  { bg: '#2E86B8', cat: '#F4F4F4', name: '#D8342A', tagline: '#FFFFFF',
    footerBg: '#A9D6E8', footerColor: '#14507A',
    deep: '#8C1E16', stroke: '#FFFFFF', fam: 'teal' },

  /* RỬA XE — dirty white, red over a mint-green slab */
  { bg: '#F2EDE2', cat: '#2C5F8A', name: '#C0392B', tagline: '#2C5F8A',
    footerBg: '#86BEB0', footerColor: '#1C3F5A',
    deep: '#86BEB0', stroke: '#F7F3E9', fam: 'green' },

  /* BARBER SHOP XUÂN HƯƠNG — pale blue wash, ink navy script */
  { bg: '#E8F0F2', cat: '#1B3A6B', name: '#14294F', tagline: '#1B3A6B',
    footerBg: '#1B3A6B', footerColor: '#E8F0F2',
    deep: '#9FB4C4', stroke: '#FFFFFF', fam: 'light' },

  /* night trade — lacquer black, gold and hot red */
  { bg: '#1C1C22', cat: '#F5C518', name: '#E8452C', tagline: '#F5C518',
    footerBg: '#F5C518', footerColor: '#1C1C22',
    deep: '#7A1A10', stroke: '#F5EEDD', fam: 'dark' },

  /* nail, may đo — powder pink and maroon */
  { bg: '#F2C9D6', cat: '#8B2252', name: '#C0224A', tagline: '#8B2252',
    footerBg: '#8B2252', footerColor: '#F9E8EE',
    deep: '#8B2252', stroke: '#FFFFFF', rule: '#8B2252', fam: 'pink' },

  /* nhà thuốc — chalk green, pharmacy green, a red warning line */
  { bg: '#E9EFE2', cat: '#1F7A4A', name: '#1F7A4A', tagline: '#C0392B',
    footerBg: '#1F7A4A', footerColor: '#F2F7EE',
    deep: '#A8CDB4', stroke: '#FFFFFF', rule: '#1F7A4A', fam: 'green' },

  /* chợ vàng — mustard ground, oxide red, navy detail */
  { bg: '#F2C230', cat: '#B4321E', name: '#C0392B', tagline: '#1B3A6B',
    footerBg: '#B4321E', footerColor: '#FFF6DA',
    deep: '#8C2314', stroke: '#FFF6DA', fam: 'yellow' },

  /* karaoke, hội trường — grape and gold */
  { bg: '#5B3A8E', cat: '#F5C518', name: '#FFFFFF', tagline: '#E8C6F0',
    footerBg: '#F5C518', footerColor: '#3A2060',
    deep: '#2E1A52', stroke: '#F5C518', fam: 'purple' },

  /* bottle green and cream, the co-operative shopfront */
  { bg: '#2E7D6E', cat: '#FFF6DA', name: '#F2C230', tagline: '#FFFFFF',
    footerBg: '#FFF6DA', footerColor: '#1E5A4E',
    deep: '#14493F', stroke: '#14493F', fam: 'teal' },

  /* lacquer red and gold — cầm đồ, bia hơi, anything that wants to shout */
  { bg: '#C0281E', cat: '#FFF6DA', name: '#F5C518', tagline: '#FFE9C0',
    footerBg: '#FFF6DA', footerColor: '#A81E14',
    deep: '#7A1109', stroke: '#7A1109', fam: 'red' }
];


/* ===========================================================================
   3. THEMES — an era is a type system plus a set of inks plus wall dressing.
   ========================================================================= */
var THEMES = {
  sg85: {
    label: 'SÀI GÒN 1985', short: '1985', other: 'nay',
    system: 'SG85', palettes: VINTAGE, gut: 11, mat: true,
    justify: true, extrude: true, track: 0.16,
    brand: 'Sàigòn 1985', tagline: 'BỘ PHÔNG CHỮ BIỂN HIỆU SÀI GÒN XƯA',
    note: function (report, system) {
      return report.genuine + '/' + report.total + ' mặt chữ Sài Gòn 1985 đã nạp. ' +
        (report.genuine ? system.credit
                        : 'Chưa thấy thư mục fonts/saigon1985 — tạm dùng phông thay thế.');
    }
  },
  nay: {
    label: 'PHỐ HÔM NAY', short: 'NAY', other: 'sg85',
    system: 'UTM', palettes: MODERN, gut: 7, mat: false,
    justify: true, track: 0.22, rotate: true, outline: true, dropShadow: true,
    brand: 'PHỐ BẢNG HIỆU', tagline: 'KÉO MÉP ĐỂ ĐỔI CỠ · BẤM VÀO CHỮ ĐỂ SỬA',
    note: function (report) {
      return report.genuine + '/' + report.total + ' mặt chữ UTM thật có sẵn trên máy này. ' +
        'Thiếu font thật thì hệ thống dùng bản thay thế mở, đủ dấu tiếng Việt.';
    }
  }
};
var themeKey = 'sg85';
function theme() { return THEMES[themeKey]; }
function palettes() { return theme().palettes; }

/* ===========================================================================
   4. SIGN MODEL
   ========================================================================= */
var SHOP_KEYS = Object.keys(SHOPS);
var LINES = ['cat', 'name', 'tagline', 'footer'];
var seq = 0;

function pick(list) { return list[Math.floor(Math.random() * list.length)]; }
function rnd(a, b) { return a + Math.random() * (b - a); }
function nid() { return 'n' + (++seq); }
function recipeFor(key) { return type.recipes[SHOPS[key].like || key] || type.recipes['quan-com']; }

/* Shops are dealt from a shuffled deck rather than drawn at random: a real
   street has one pharmacy, not three in a row. The deck refills only once every
   trade has had its turn. */
var deck = [];
function dealShop() {
  if (!deck.length) {
    deck = SHOP_KEYS.slice();
    for (var i = deck.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)), swap = deck[i];
      deck[i] = deck[j]; deck[j] = swap;
    }
  }
  return deck.pop();
}

function makeSign(key) {
  var sign = { tilt: rnd(-1.5, 1.5) };
  dressShop(sign, key || dealShop());
  return sign;
}

/* Put a whole different business on this sign: copy, type recipe, palette. */
function dressShop(sign, key) {
  var shop = SHOPS[key];
  sign.key = key;
  sign.badge = shop.icon;
  sign.text = { cat: shop.cat, name: pick(shop.name), tagline: pick(shop.tagline), footer: pick(shop.footer) };
  dressRecipe(sign);
  dressMood(sign);
  return sign;
}

/* Take the type recipe the active era prescribes for this trade. Called again
   on every sign when the theme changes, which is what re-letters the wall. */
function dressRecipe(sign) {
  var recipe = recipeFor(sign.key);
  sign.hero = recipe.hero;
  sign.faces = Object.assign({}, recipe.faces);
  sign.scale = Object.assign({}, recipe.scale);
  sign.tweak = JSON.parse(JSON.stringify(recipe.tweak || {}));
  sign.order = Object.assign({ cat: 1, name: 2, tagline: 3 }, recipe.order || {});
}

/* A sign stores the colour *family* it wants plus a seed, not a palette index,
   so the same sign can be re-inked in either era. One shop in five takes a
   family from outside its own convention — the wall should look like a street,
   not a swatch library — and never the same family twice in a row, since two
   neighbours in one colour read as a single wide sign. */
var ALL_FAMS = ['light', 'blue', 'green', 'red', 'yellow', 'orange', 'dark', 'pink', 'teal', 'purple'];
var lastFam = '';
function dressMood(sign) {
  var shop = SHOPS[sign.key];
  for (var tries = 0; tries < 5; tries++) {
    sign.fam = Math.random() < 0.2 ? pick(ALL_FAMS) : pick(shop.pal);
    if (sign.fam !== lastFam) break;
  }
  lastFam = sign.fam;
  sign.seed = Math.random();
}

/* Resolve that intent against whichever palette set is loaded. */
function moodFor(sign) {
  var byFam = function (fam) {
    return palettes().filter(function (p) { return p.fam === fam; });
  };
  var list = byFam(sign.fam);
  /* An era need not stock every colour — no modern shop prints a purple
     standee. Fall back to the other families this trade already declared
     before resorting to the whole rack, so the sign keeps its character. */
  if (!list.length) {
    var alts = (SHOPS[sign.key].pal || []).filter(function (f) { return f !== sign.fam; });
    for (var i = 0; i < alts.length && !list.length; i++) list = byFam(alts[i]);
  }
  if (!list.length) list = palettes();
  return list[Math.floor(sign.seed * list.length) % list.length];
}

/* Type shuffle: keep each line in a face that suits its role, but let the shop
   name swing between block caps and script the way real shops do. */
function dressType(sign) {
  var script = Math.random() < 0.32;
  LINES.forEach(function (key) {
    var pool = type.facesFor(key);
    if (key === 'name') {
      var wanted = pool.filter(function (f) {
        var isScript = f.group === 'script' || f.group === 'brush';
        return script ? isScript : !isScript;
      });
      if (wanted.length) pool = wanted;
    }
    if (pool.length) sign.faces[key] = pick(pool).id;
  });
  sign.tweak = {};
  sign.tilt = rnd(-1.1, 1.1);
}

/* ===========================================================================
   4. THE SPLIT TREE
   ========================================================================= */
var GUT = 7, MIN_CELL = 40;
var wall = $('#wall');
var tree = null, selected = null;

function isLeaf(node) { return !!node.sign; }
function leafNode(sign) { return { id: nid(), size: 1, sign: sign || makeSign() }; }

function eachLeaf(node, out) {
  out = out || [];
  if (isLeaf(node)) out.push(node);
  else node.children.forEach(function (c) { eachLeaf(c, out); });
  return out;
}

function parentOf(node, root, from) {
  root = root || tree;
  if (isLeaf(root)) return null;
  if (root.children.indexOf(node) !== -1) return root;
  for (var i = 0; i < root.children.length; i++) {
    var hit = parentOf(node, root.children[i]);
    if (hit) return hit;
  }
  return from || null;
}

/* Turn a leaf into a container holding the old sign plus a new one. */
function splitLeaf(node, dir, ratio, sign) {
  var keep = { id: nid(), size: ratio, sign: node.sign };
  var added = { id: nid(), size: 1 - ratio, sign: sign || makeSign() };
  delete node.sign;
  node.dir = dir;
  node.children = [keep, added];
  return added;
}

function dropLeaf(node) {
  if (eachLeaf(tree).length < 2) return false;
  var parent = parentOf(node);
  if (!parent) return false;
  parent.children.splice(parent.children.indexOf(node), 1);
  if (parent.children.length === 1) {           /* collapse the empty split */
    var only = parent.children[0], size = parent.size, id = parent.id;
    delete parent.children; delete parent.dir; delete parent.sign;
    if (isLeaf(only)) parent.sign = only.sign;
    else { parent.dir = only.dir; parent.children = only.children; }
    parent.size = size; parent.id = id;
  }
  return true;
}

/* Walk the tree in pixels — used to pick sensible cells to split. */
function survey(node, w, h, out) {
  out = out || [];
  if (isLeaf(node)) { out.push({ node: node, w: w, h: h, area: w * h }); return out; }
  var horiz = node.dir === 'row';
  var avail = (horiz ? w : h) - GUT * (node.children.length - 1);
  var total = node.children.reduce(function (s, c) { return s + c.size; }, 0) || 1;
  node.children.forEach(function (c) {
    var px = avail * c.size / total;
    survey(c, horiz ? px : w, horiz ? h : px, out);
  });
  return out;
}

function wallBox() {
  return { w: Math.max(80, wall.clientWidth - GUT * 2), h: Math.max(80, wall.clientHeight - GUT * 2) };
}

/* A shop sign is a landscape or near-square object. Nothing here may be turned
   on its side to fit, so the generator has to hand out cells that a horizontal
   line actually fits in: it only accepts a split when BOTH halves stay inside
   the aspect band below, and it takes the widest choice available. */
var MAX_ASPECT = 2.3, MIN_ASPECT = 0.62;

function aspectOK(w, h) {
  var a = w / h;
  return a <= MAX_ASPECT && a >= MIN_ASPECT;
}

/* Every split this cell could take, best (most usable pair) first. */
function splitOptions(cell) {
  var out = [];
  ['row', 'col'].forEach(function (dir) {
    for (var r = 0.34; r <= 0.66; r += 0.04) {
      var aw = dir === 'row' ? cell.w * r : cell.w;
      var ah = dir === 'row' ? cell.h : cell.h * r;
      var bw = dir === 'row' ? cell.w * (1 - r) : cell.w;
      var bh = dir === 'row' ? cell.h : cell.h * (1 - r);
      if (Math.min(aw, bw) < 150 || Math.min(ah, bh) < 90) continue;
      if (!aspectOK(aw, ah) || !aspectOK(bw, bh)) continue;
      out.push({ dir: dir, ratio: r });
    }
  });
  return out;
}

function buildLayout(target) {
  var box = wallBox();
  var root = leafNode();
  root.size = 1;
  for (var guard = 0; guard < 80; guard++) {
    var cells = survey(root, box.w, box.h);
    if (cells.length >= target) break;
    cells.sort(function (a, b) { return b.area - a.area; });
    /* try the biggest cells in turn; stop once none of them can be split
       without producing something too narrow to letter */
    var done = false;
    for (var i = 0; i < Math.min(4, cells.length) && !done; i++) {
      var options = splitOptions(cells[i]);
      if (!options.length) continue;
      var choice = pick(options);
      splitLeaf(cells[i].node, choice.dir, choice.ratio);
      done = true;
    }
    if (!done) break;
  }
  return root;
}

function targetCount() {
  var box = wallBox();
  return Math.max(5, Math.min(18, Math.round(box.w * box.h / 92000)));
}

/* ===========================================================================
   5. DOM
   ========================================================================= */
var TOOLS = [
  ['dice', '🎲', 'Đổi tiệm khác'],
  ['col', '⬍', 'Tách trên / dưới'],
  ['row', '⬌', 'Tách trái / phải'],
  ['close', '✕', 'Bỏ bảng này']
];

function buildDOM() {
  wall.textContent = '';
  wall.appendChild(renderNode(tree));
  paintAll();
  cancelAnimationFrame(fitFrame);   /* this rebuild fits everything itself */
  fitFrame = 0;
  fitQueue = null;
  fitAll();
}

function renderNode(node) {
  if (isLeaf(node)) return renderSign(node);
  var el = document.createElement('div');
  el.className = 'split ' + node.dir;
  node.el = el;
  node.children.forEach(function (child, i) {
    if (i) el.appendChild(renderGutter(node, i));
    var childEl = renderNode(child);
    childEl.style.flexGrow = child.size;
    el.appendChild(childEl);
  });
  el.style.flexGrow = node.size;
  return el;
}

function renderGutter(node, index) {
  var el = document.createElement('div');
  el.className = 'gutter';
  el.setAttribute('role', 'separator');
  el.setAttribute('aria-orientation', node.dir === 'row' ? 'vertical' : 'horizontal');
  el.title = 'Kéo để đổi cỡ · bấm đúp để chia đều';
  el.addEventListener('pointerdown', function (ev) { startDrag(ev, el, node, index); });
  el.addEventListener('dblclick', function () {
    var a = node.children[index - 1], b = node.children[index], sum = a.size + b.size;
    a.size = b.size = sum / 2;
    a.el.style.flexGrow = a.size; b.el.style.flexGrow = b.size;
    scheduleFit([a, b]);
  });
  return el;
}

function renderSign(node) {
  var el = document.createElement('article');
  el.className = 'sign';
  el.dataset.id = node.id;
  el.style.flexGrow = node.size;

  var badge = document.createElement('span');
  badge.className = 'badge';

  var body = document.createElement('div');
  body.className = 'sign-body';
  var stack = document.createElement('div');
  stack.className = 'stack';
  body.appendChild(stack);

  node.lineEls = {};
  ['cat', 'name', 'tagline'].forEach(function (key) {
    var line = document.createElement('div');
    line.className = 'line ' + key;
    line.contentEditable = 'true';
    line.spellcheck = false;
    line.dataset.line = key;
    node.lineEls[key] = line;
    stack.appendChild(line);
  });

  var strip = document.createElement('div');
  strip.className = 'footer-strip';
  var footer = document.createElement('div');
  footer.className = 'line footer';
  footer.contentEditable = 'true';
  footer.spellcheck = false;
  footer.dataset.line = 'footer';
  strip.appendChild(footer);
  node.lineEls.footer = footer;

  var tools = document.createElement('div');
  tools.className = 'sign-tools';
  TOOLS.forEach(function (spec) {
    var button = document.createElement('button');
    button.type = 'button';
    button.dataset.tool = spec[0];
    button.textContent = spec[1];
    button.title = spec[2];
    button.setAttribute('aria-label', spec[2]);
    tools.appendChild(button);
  });

  el.append(badge, body, strip, tools);
  node.el = el; node.bodyEl = body; node.stackEl = stack;
  node.stripEl = strip; node.badgeEl = badge;
  wireSign(node);
  return el;
}

/* relative luminance, good enough to ask "is this ink light or dark?" */
function lum(hex) {
  var c = String(hex).trim().replace('#', '');
  if (c.length === 3) c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
  var n = parseInt(c, 16);
  if (!isFinite(n)) return 0.5;
  return (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255;
}
function contrast(a, b) {
  var x = lum(a) + 0.05, y = lum(b) + 0.05;
  return x > y ? x / y : y / x;
}
function keyline(ink, preferred) {
  if (preferred && contrast(ink, preferred) >= 2.4) return preferred;
  return lum(ink) > 0.5 ? '#151515' : '#FFFFFF';
}

function paintAll() { eachLeaf(tree).forEach(paintSign); }

function paintSign(node) {
  var sign = node.sign, mood = moodFor(sign), el = node.el;
  el.style.setProperty('--bg', mood.bg);
  el.style.setProperty('--footer-bg', mood.footerBg);
  el.style.setProperty('--footer-color', mood.footerColor);
  el.style.setProperty('--name-shadow', mood.shadow || 'transparent');
  el.classList.toggle('outline', !!mood.outline);
  /* The chrome-rainbow name belongs to karaoke fronts specifically, not to
     every shop that happens to land on a black board. */
  var grad = mood.grad && sign.key === 'karaoke';
  el.classList.toggle('gradient-name', !!grad);
  el.classList.toggle('ruled', !!mood.rule);
  if (mood.rule) el.style.setProperty('--rule', mood.rule);
  el.style.setProperty('--deep', mood.deep || 'transparent');
  el.style.setProperty('--stroke', mood.stroke || 'transparent');
  if (mood.outline) el.style.setProperty('--outline', mood.outline);

  /* A printed standee does not keep three fixed roles the way a painted board
     does — it gives every line its own ink and cycles through a hot set. The
     sign's seed picks where in the cycle it starts, so no two neighbours on the
     wall land on the same run of colours. */
  var inks = theme().rotate && mood.inks;
  if (inks) {
    var start = Math.floor(sign.seed * inks.length);
    ['cat', 'name', 'tagline'].forEach(function (key, i) {
      /* Walk on round the cycle if this ink would sink into the board. Block
         caps carry a keyline thick enough to separate them, so they only need
         to clear the board a little; a thin script has nothing but its own
         colour to work with, and needs real contrast. If nothing in the
         palette clears the bar, take the strongest thing there is — never
         whichever one the walk happened to stop on. */
      var script = /script|brush/.test(type.face(sign.faces[key]).group);
      var floor = script ? 2.4 : 1.4;
      var ink = null, best = null, bestC = -1;
      for (var n = 0; n < inks.length; n++) {
        var candidate = inks[(start + i + n) % inks.length];
        var c = contrast(candidate, mood.bg);
        if (c > bestC) { bestC = c; best = candidate; }
        if (c >= floor) { ink = candidate; break; }
      }
      if (!ink) ink = best;
      el.style.setProperty('--' + key, ink);
      /* This is what makes a standee readable while its colours clash: the
         keyline runs opposite to the letter, so a pale ink gets a dark edge and
         a dark one gets a light edge — and it reads against any board it lands
         on. The palette's own keyline is kept whenever it already does that. */
      node.lineEls[key].style.setProperty('--stroke', keyline(ink, mood.stroke));
    });
  } else {
    el.style.setProperty('--cat', mood.cat);
    el.style.setProperty('--tagline', mood.tagline);
    el.style.setProperty('--name', mood.name);
  }

  /* the shop-name banner: KA LONG's navy block, QUÁN NHẬU's red one */
  var banner = theme().rotate && mood.banner;
  el.classList.toggle('bannered', !!banner);
  if (banner) {
    el.style.setProperty('--banner', mood.banner);
    el.style.setProperty('--cat', mood.bannerInk || '#fff');
  }
  if (grad) el.style.setProperty('--name-grad', mood.grad);

  node.badgeEl.textContent = sign.badge;
  LINES.forEach(function (key) {
    if (node.lineEls[key].textContent !== sign.text[key]) node.lineEls[key].textContent = sign.text[key];
    if (key !== 'footer') node.lineEls[key].style.order = sign.order[key];
  });
}

/* ===========================================================================
   6. TYPE FITTING
   Probe at a fixed cap height, measure, scale once. Reads and writes are kept
   in separate passes over all signs so a drag costs two layout flushes, not
   two per sign.
   ========================================================================= */
var PROBE = 60;

function applyLine(el, sign, key, capPx) {
  var tweak = sign.tweak[key] || {};
  var tune = Object.assign({}, type.face(sign.faces[key]).tune, tweak);
  var size = type.applyFace(el, sign.faces[key], Math.max(4, capPx), tweak);
  el.dataset.sx = tune.sx || 1;
  return size;
}

/* Letter-spacing is added after every character, the last one included, so a
   tracked line sits off-centre by exactly one space. Painters did not have that
   problem; we cancel it. */
function setTracking(el, px) {
  el.style.letterSpacing = px.toFixed(2) + 'px';
  el.style.marginRight = (-px).toFixed(2) + 'px';
}

/* Which lines a cell is big enough to carry. A small sign says one thing. */
function linesFor(sign, level) {
  var hero = sign.hero === 'name' ? 'name' : 'cat';
  var other = hero === 'name' ? 'cat' : 'name';
  if (level <= 0) return [];
  if (level === 1) return [hero];
  if (level === 2) return [hero, other];
  return ['cat', 'name', 'tagline'];
}

function prepare(plan) {
  var node = plan.node, sign = node.sign, el = node.el, w = plan.w, h = plan.h;

  /* Every line reads left to right. Nothing on this wall is ever turned on its
     side: a shop sign you have to tilt your head for is a failed shop sign, and
     the layout is generated to keep cells wide enough that it never has to be.
     Width is therefore the binding constraint, since the text cannot wrap. */
  var area = w * h;
  var level = 3;
  if (h < 120 || w < 170 || area < 34000) level = 2;
  if (h < 74 || w < 104 || area < 13000) level = 1;
  /* Past a point there is no legible sign left. Show bare painted board rather
     than type too small to read — an offcut of vinyl is honest, tiny text is
     not. A narrow cell hits this on width alone, however tall it is. */
  if (w < 76 || h < 26) level = 0;

  el.dataset.level = level;
  el.classList.toggle('is-tiny', w < 76 || h < 58);

  var keys = linesFor(sign, level).filter(function (key) { return sign.text[key]; });
  plan.keys = keys;
  var hero = sign.hero === 'name' ? 'name' : 'cat';
  plan.heroKey = keys.indexOf(hero) === -1 ? keys[0] : hero;
  ['cat', 'name', 'tagline'].forEach(function (key) {
    node.lineEls[key].hidden = keys.indexOf(key) === -1;
  });

  /* 1985 signs are shown as photographs pinned to a board: a painted mat and a
     keyline eat into the cell, so the type has to be told about them. */
  var mat = theme().mat ? Math.max(3, Math.min(11, Math.min(w, h) * 0.035)) : 0;
  el.style.setProperty('--mat', mat.toFixed(1) + 'px');

  var footerH = (level === 3 && h >= 155 && sign.text.footer) ? Math.min(64, Math.max(22, h * 0.16)) : 0;
  plan.footerH = footerH;
  node.stripEl.style.display = footerH ? 'flex' : 'none';
  node.stripEl.style.height = footerH + 'px';
  el.style.setProperty('--footer-h', footerH + 'px');   /* so the painted rule can stop above the band */

  var pad = mat + Math.min(30, Math.max(5, Math.min(w, h) * 0.07));
  plan.pad = pad;
  plan.boxW = Math.max(12, w - pad * 2);
  plan.boxH = Math.max(12, h - footerH - pad * 2);

  node.bodyEl.style.width = plan.boxW + 'px';
  node.bodyEl.style.height = plan.boxH + 'px';
  node.bodyEl.style.left = (w / 2) + 'px';
  node.bodyEl.style.top = ((h - footerH) / 2) + 'px';
  node.bodyEl.style.transform = 'translate(-50%,-50%) rotate(' + sign.tilt + 'deg)';

  keys.forEach(function (key) { applyLine(node.lineEls[key], sign, key, PROBE * (sign.scale[key] || 0.5)); });
  if (footerH) applyLine(node.lineEls.footer, sign, 'footer', PROBE * 0.5);
}

function measure(plan) {
  var node = plan.node, width = 1;
  plan.line = {};
  plan.keys.forEach(function (key) {
    var el = node.lineEls[key];
    var w = Math.max(el.offsetWidth, el.scrollWidth) * (parseFloat(el.dataset.sx) || 1);
    width = Math.max(width, w);
    /* Everything the justifier needs, measured once: the width the face gives
       this string at the probe size, how many characters that width is spread
       over, and the face's own tracking (which justification replaces). */
    var size = parseFloat(el.style.fontSize) || 1;
    var chars = Math.max(1, Array.from(el.textContent).length);
    var track = parseFloat(el.style.letterSpacing) || 0;
    plan.line[key] = {
      w: w, size: size, chars: chars,
      bare: Math.max(1, w - track * chars),          /* width at zero tracking */
      lh: parseFloat(el.style.lineHeight) || 1.1,
      script: /script|brush/.test(type.face(node.sign.faces[key]).group)
    };
  });
  plan.mw = width;
  plan.mh = Math.max(1, node.stackEl.offsetHeight);
  if (plan.footerH) {
    var footer = node.lineEls.footer;
    plan.fw = Math.max(1, Math.max(footer.offsetWidth, footer.scrollWidth) * (parseFloat(footer.dataset.sx) || 1));
    plan.fh = Math.max(1, footer.offsetHeight);
  }
}

/* ---------------------------------------------------------------------------
   OPTICAL JUSTIFICATION — how a painted sign is actually built.

   The board has one measure, and every line is made to span it. A short line is
   tracked open until it reaches the edges; a long line is squeezed, and if it
   still will not go, it is painted smaller. That is why the tracking on these
   signs runs backwards from print convention: the big name is tight enough to
   touch, the little service line is wide open, and both end flush.

   Two things are never tracked. Scripts, because the letters are joined — those
   are scaled to the measure instead, exactly as a painter would draw them
   bigger. And anything already at the clamp, because a line stretched past
   about 0.4 em stops reading as a word and starts reading as loose letters.
   ------------------------------------------------------------------------- */
var TRACK_MIN = -0.055, TRACK_MAX = 0.16;   /* em; a theme may open the ceiling */
function trackMax() { return theme().track || TRACK_MAX; }

function justify(plan) {
  var node = plan.node, sign = node.sign, keys = plan.keys;
  var extrude = !!theme().extrude;
  var rad = Math.abs(sign.tilt) * Math.PI / 180, cos = Math.cos(rad), sin = Math.sin(rad);
  var hero = plan.heroKey, heroLine = plan.line[hero];

  var measureW = plan.boxW * 0.99;
  /* the slab hangs off the hero letters to the lower right; keep it on board */
  var heroTarget = measureW * (extrude ? 0.95 : 1);

  /* 1. The size at which each line would span the measure on its own. This is
        the painter's first decision and it is driven by the character count:
        a long service line simply lands smaller than a short shop name. */
  var fill = {};
  keys.forEach(function (key) {
    var L = plan.line[key];
    fill[key] = L.size * ((key === hero ? heroTarget : measureW) / L.bare);
  });

  /* 2. Hierarchy is a ceiling, not a size. The hero fills; every other line
        takes the smaller of its own fill size and its recipe share of the
        hero. The probe sizes already carry both the cap ratio and the face's
        own cap height, so their ratio is the share. */
  var size = {}, blockH = 0;
  keys.forEach(function (key) {
    var L = plan.line[key];
    size[key] = key === hero ? fill[hero]
                             : Math.min(fill[key], fill[hero] * L.size / heroLine.size);
    blockH += size[key] * (L.lh + 0.08);    /* .line carries .04em margins */
  });

  /* 3. Fit the stack to the board's height — never upward, which would push the
        lines past the measure they were just sized to. */
  var roomH = (plan.boxH - measureW * sin) / cos * (extrude ? 0.94 : 0.98);
  var factor = Math.min(1, roomH / Math.max(1, blockH));

  /* 4. Whatever width that lost, tracking makes up — within the range a painter
        would actually open a word to. Past the clamp the line simply sits short
        and centred, the way the small lines on a real board do. */
  var out = {};
  blockH = 0;
  keys.forEach(function (key) {
    var L = plan.line[key], s = size[key] * factor;
    var target = key === hero ? heroTarget : measureW;
    var bare = L.bare * (s / L.size);
    var track = L.script ? 0 : (target - bare) / L.chars;
    track = Math.max(TRACK_MIN * s, Math.min(trackMax() * s, track));
    if (!L.script && bare + track * L.chars > target) {   /* squeezed out */
      var shrink = target / (bare + track * L.chars);
      s *= shrink; track *= shrink;
    }
    out[key] = { size: s, track: track };
    blockH += s * (L.lh + 0.08);
  });

  keys.forEach(function (key) {
    var el = node.lineEls[key], L = plan.line[key], o = out[key];
    applyLine(el, sign, key, PROBE * (sign.scale[key] || 0.5) * (o.size / L.size));
    setTracking(el, o.track);
    dressHero(el, sign, key === hero, o.size, L.script);
  });

  plan.blockH = blockH;
  plan.slack = Math.max(0, plan.boxH - blockH);
  return out;
}

/* How a line is finished, which is where the two eras part company.

   1985 paints a slab: a hard extrusion stepped down-right in the palette's
   contrast colour — pink under red, mint under red, bottle green under red —
   on the hero word only, everything else flat.

   A printed standee outlines *every* line, because on vinyl an outline costs
   nothing, and drops one hard offset shadow under the big one. No blur in
   either era: this is ink, not light. */
function dressHero(el, sign, isHero, size, script) {
  var t = theme();
  el.classList.toggle('is-hero', isHero);

  /* A keyline scaled for block caps will swallow a brush script whole — the
     stroke is thicker than the thin part of the letter. Joined faces get a
     hairline instead. */
  var w = script ? 0.008 : (isHero ? 0.028 : 0.018);
  if (t.outline) el.style.setProperty('--stroke-w', (size * w).toFixed(2) + 'px');
  else if (isHero && t.extrude) el.style.setProperty('--stroke-w', (size * (script ? 0.008 : 0.022)).toFixed(2) + 'px');
  else el.style.removeProperty('--stroke-w');

  if (isHero && t.extrude) {
    var depth = size * 0.085;
    var steps = Math.max(3, Math.min(16, Math.round(depth)));
    var slab = [];
    for (var i = 1; i <= steps; i++) {
      var d = (depth * i / steps).toFixed(2);
      slab.push(d + 'px ' + d + 'px 0 var(--deep)');
    }
    el.style.textShadow = slab.join(',');
  } else if (isHero && t.dropShadow) {
    var off = (size * 0.055).toFixed(2);
    el.style.textShadow = off + 'px ' + off + 'px 0 var(--deep)';
  } else {
    el.style.textShadow = '';
  }
}

function settle(plan) {
  var node = plan.node, sign = node.sign;

  if (theme().justify) {
    justify(plan);
    var lead = plan.keys.length > 1
      ? Math.min(plan.slack * 0.45 / (plan.keys.length - 1), plan.line[plan.heroKey].size * 0.22)
      : 0;
    node.stackEl.style.gap = lead.toFixed(2) + 'px';
    if (plan.footerH) fitFooter(plan);
    return;
  }

  /* the block is tilted, so it needs the bounding box of the rotated block */
  var rad = Math.abs(sign.tilt) * Math.PI / 180, cos = Math.cos(rad), sin = Math.sin(rad);
  var needW = plan.mw * cos + plan.mh * sin;
  var needH = plan.mw * sin + plan.mh * cos;
  var factor = Math.min(plan.boxW / needW, plan.boxH / needH) * 0.98;
  plan.keys.forEach(function (key) {
    applyLine(node.lineEls[key], sign, key, PROBE * (sign.scale[key] || 0.5) * factor);
    setTracking(node.lineEls[key], parseFloat(node.lineEls[key].style.letterSpacing) || 0);
    dressHero(node.lineEls[key], sign, false, 0, false);
  });
  /* A block held back by its widest line leaves air above and below. Sign
     painters spend that on leading, not on margin — so do we, up to a limit. */
  var lead = 0;
  if (plan.keys.length > 1) {
    var slack = Math.max(0, plan.boxH - needH * factor);
    lead = Math.min(slack * 0.55 / (plan.keys.length - 1), PROBE * factor * 0.45);
  }
  node.stackEl.style.gap = lead.toFixed(2) + 'px';
  if (plan.footerH) fitFooter(plan);
}

/* The address band. In the 1985 theme it is justified like every other line —
   those bands run edge to edge on the real signs — but it is never allowed to
   grow past the band, so it fills on tracking alone. */
function fitFooter(plan) {
  var node = plan.node, sign = node.sign, el = node.lineEls.footer;
  var band = plan.w - plan.pad * 2;
  var room = Math.min(band / plan.fw, plan.footerH * 0.8 / plan.fh);
  var size = applyLine(el, sign, 'footer', PROBE * 0.5 * room);
  var track = 0;
  if (theme().justify) {
    var chars = Math.max(1, Array.from(el.textContent).length);
    var bare = Math.max(1, plan.fw * room - (parseFloat(el.style.letterSpacing) || 0) * chars);
    track = Math.max(0, Math.min(trackMax() * size, (band - bare) / chars));
  }
  setTracking(el, track || (parseFloat(el.style.letterSpacing) || 0));
}

function fitLeaves(nodes) {
  var plans = [];
  nodes.forEach(function (node) {
    /* A queued node can go stale before the frame runs: splitting turns a leaf
       into a container, removing one detaches its element. Skip both. */
    if (!node.sign || !node.el || !node.el.isConnected) return;
    var rect = node.el.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return;
    plans.push({ node: node, w: rect.width, h: rect.height });
  });
  plans.forEach(prepare);   /* write: structure + probe type */
  plans.forEach(measure);   /* read:  one flush for the whole wall */
  plans.forEach(settle);    /* write: final type */
}

function fitAll() { fitLeaves(eachLeaf(tree)); }

var fitFrame = 0, fitQueue = null;
function scheduleFit(nodes) {
  if (!tree) return;
  if (nodes) {
    var list = [];
    nodes.forEach(function (n) { eachLeaf(n, list); });
    fitQueue = fitQueue ? fitQueue.concat(list) : list;
  } else fitQueue = null;
  if (fitFrame) return;
  fitFrame = requestAnimationFrame(function () {
    fitFrame = 0;
    var queue = fitQueue; fitQueue = null;
    fitLeaves(queue || eachLeaf(tree));
  });
}

/* ===========================================================================
   7. DRAG A SEAM
   Only the two neighbours change: their combined flex-grow is redistributed,
   so every other sign on the wall keeps the exact size it had.
   ========================================================================= */
function startDrag(ev, el, node, index) {
  if (ev.button > 0) return;
  var horiz = node.dir === 'row';
  var a = node.children[index - 1], b = node.children[index];
  var ra = a.el.getBoundingClientRect(), rb = b.el.getBoundingClientRect();
  var aPx = horiz ? ra.width : ra.height;
  var bPx = horiz ? rb.width : rb.height;
  var span = aPx + bPx, grow = a.size + b.size;
  var origin = horiz ? ev.clientX : ev.clientY;
  if (span < 4) return;

  el.setPointerCapture(ev.pointerId);
  el.classList.add('live');
  document.body.classList.add('dragging');
  document.body.style.cursor = horiz ? 'col-resize' : 'row-resize';

  function move(e) {
    var delta = (horiz ? e.clientX : e.clientY) - origin;
    var lo = Math.min(MIN_CELL, span / 2), hi = span - lo;
    var next = Math.max(lo, Math.min(hi, aPx + delta));
    a.size = grow * next / span;
    b.size = grow - a.size;
    a.el.style.flexGrow = a.size;
    b.el.style.flexGrow = b.size;
    scheduleFit([a, b]);
  }
  function up() {
    el.removeEventListener('pointermove', move);
    el.removeEventListener('pointerup', up);
    el.removeEventListener('pointercancel', up);
    el.classList.remove('live');
    document.body.classList.remove('dragging');
    document.body.style.cursor = '';
    scheduleFit([a, b]);
  }
  el.addEventListener('pointermove', move);
  el.addEventListener('pointerup', up);
  el.addEventListener('pointercancel', up);
  ev.preventDefault();
}

/* ===========================================================================
   8. PER-SIGN INTERACTION
   ========================================================================= */
function wireSign(node) {
  var el = node.el;

  el.addEventListener('pointerdown', function (ev) {
    if (ev.target.closest('.sign-tools')) return;
    select(node);
  });

  el.addEventListener('click', function (ev) {
    var button = ev.target.closest('.sign-tools button');
    if (!button) return;
    var tool = button.dataset.tool;
    if (tool === 'dice') {
      dressShop(node.sign, dealShop());
      if (Math.random() < 0.5) dressType(node.sign);
      paintSign(node); scheduleFit([node]); syncDrawer();
    } else if (tool === 'row' || tool === 'col') {
      var rect = el.getBoundingClientRect();
      if (Math.min(rect.width, rect.height) < MIN_CELL * 2.4) { say('Bảng này hết chỗ để tách.'); return; }
      splitLeaf(node, tool, 0.5);
      buildDOM(); select(null); say('Đã thêm một bảng mới.');
    } else if (tool === 'close') {
      if (dropLeaf(node)) { buildDOM(); select(null); }
      else say('Phải chừa lại ít nhất một bảng.');
    }
  });

  LINES.forEach(function (key) {
    var line = node.lineEls[key];
    line.addEventListener('input', function () {
      node.sign.text[key] = line.textContent;
      scheduleFit([node]);
    });
    line.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter') { ev.preventDefault(); line.blur(); }
      if (ev.key === 'Escape') line.blur();
    });
    line.addEventListener('focus', function () { select(node); });
  });
}

function select(node) {
  if (selected && selected.el) selected.el.classList.remove('is-selected');
  selected = node;
  if (node && node.el) node.el.classList.add('is-selected');
  syncDrawer();
}

/* ===========================================================================
   9. CHROME — dock, font drawer, toast, keys
   ========================================================================= */
var toastTimer = 0;
function say(message) {
  var toast = $('#toast');
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('show');
  toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2400);
}

function shuffleWall() {
  eachLeaf(tree).forEach(function (node) {
    dressShop(node.sign, dealShop());
    if (Math.random() < 0.45) dressType(node.sign);
    paintSign(node);
  });
  scheduleFit();
  syncDrawer();
  say('Cả phố đã đổi bảng.');
}

function newLayout() {
  tree = buildLayout(targetCount());
  selected = null;
  buildDOM();
  say('Bố cục mới · ' + eachLeaf(tree).length + ' bảng.');
}

/* Change era. The layout, the shops and every hand edit survive: only the type
   system and the inks are swapped, then each sign is re-lettered from the new
   era's recipe and re-inked from the palette family it already wanted. */
function setTheme(key, quiet) {
  themeKey = key;
  type = window[theme().system];
  document.body.dataset.theme = key;
  var brand = $('#brand'), note = $('#brandNote'), button = $('[data-act="theme"]');
  brand.textContent = theme().brand;
  note.textContent = theme().tagline;
  button.querySelector('span').textContent = THEMES[theme().other].short;
  button.title = 'Chuyển sang ' + THEMES[theme().other].label;
  $('#dropzone').hidden = key !== 'nay';
  document.documentElement.style.setProperty('--gut', theme().gut + 'px');
  GUT = theme().gut;

  if (tree) {
    eachLeaf(tree).forEach(function (node) {
      dressRecipe(node.sign);
      paintSign(node);
    });
    scheduleFit();
  }
  refreshPickers();
  Promise.resolve(type.init()).then(function () { updateStatus(); scheduleFit(); });
  if (!quiet) say('Đã chuyển sang ' + theme().label + '.');
}

function addSign() {
  var box = wallBox();
  var cells = survey(tree, box.w, box.h).sort(function (a, b) { return b.area - a.area; });
  /* prefer a cell that can be halved without either side going narrow */
  var target = null, choice = null;
  for (var i = 0; i < cells.length && !choice; i++) {
    var options = splitOptions(cells[i]);
    if (options.length) { target = cells[i]; choice = pick(options); }
  }
  if (!choice) {
    target = cells[0];
    if (!target || Math.min(target.w, target.h) < MIN_CELL * 2.4) { say('Hết chỗ trên tường rồi.'); return; }
    choice = { dir: target.w > target.h ? 'row' : 'col', ratio: 0.5 };
  }
  splitLeaf(target.node, choice.dir, choice.ratio);
  buildDOM();
  say('Đã treo thêm một bảng.');
}

/* --- font drawer -------------------------------------------------------- */
var pickers = { cat: $('#faceCat'), name: $('#faceName'), tagline: $('#faceTagline'), footer: $('#faceFooter') };

function fillPicker(select, role) {
  select.textContent = '';
  var groups = {};
  type.facesFor(role).forEach(function (face) {
    (groups[face.group] = groups[face.group] || []).push(face);
  });
  Object.keys(groups).forEach(function (group) {
    var optgroup = document.createElement('optgroup');
    optgroup.label = type.groups[group] ? type.groups[group].vi : group;
    groups[group].forEach(function (face) {
      var option = document.createElement('option');
      option.value = face.id;
      option.textContent = face.utm + (type.isGenuine(face.id) ? ' · font thật' : ' → ' + face.sub.replace(/'/g, ''));
      optgroup.appendChild(option);
    });
    select.appendChild(optgroup);
  });
}

function syncDrawer() {
  var hint = $('#drawerHint');
  var has = !!selected;
  hint.textContent = has
    ? 'Đang sửa: ' + SHOPS[selected.sign.key].label + ' — ' + selected.sign.text.name
    : 'Bấm vào một bảng trên tường để chọn, rồi đổi mặt chữ ở đây.';
  LINES.forEach(function (key) {
    var select = pickers[key];
    select.disabled = !has;
    var extra = select.querySelector('option[data-extra]');
    if (extra) select.removeChild(extra);
    if (!has) return;
    /* Some type recipes deliberately put a face on a line outside its declared
       role (a footer set in a text face, say). Show what is actually on the
       sign rather than leaving the picker blank. */
    var id = selected.sign.faces[key];
    if (!select.querySelector('option[value="' + id + '"]')) {
      var option = document.createElement('option');
      option.value = id;
      option.dataset.extra = '1';
      option.textContent = type.face(id).utm + ' · ngoài nhóm';
      select.insertBefore(option, select.firstChild);
    }
    select.value = id;
  });
  $('#shuffleFace').disabled = !has;
  $('#resetFace').disabled = !has;
}

function refreshPickers() {
  LINES.forEach(function (key) { fillPicker(pickers[key], key); });
  syncDrawer();
}

function updateStatus() {
  $('#fontStatus').textContent = theme().note(type.report(), type);
}

function ingest(files) {
  if (!type.adoptFiles) return;
  type.adoptFiles(files).then(function (results) {
    var matched = results.filter(function (r) { return r.matched; }).length;
    refreshPickers(); updateStatus(); scheduleFit();
    say('Đã nạp ' + results.length + ' file · nhận diện ' + matched + ' face type.');
  });
}

function wireChrome() {
  document.querySelectorAll('.dock button').forEach(function (button) {
    button.addEventListener('click', function () {
      var act = button.dataset.act;
      if (act === 'shuffle') shuffleWall();
      else if (act === 'add') addSign();
      else if (act === 'relayout') newLayout();
      else if (act === 'theme') setTheme(theme().other);
      else if (act === 'fonts') toggleDrawer();
      else if (act === 'hide') { document.body.classList.add('chrome-off'); }
    });
  });
  $('#peek').addEventListener('click', function () { document.body.classList.remove('chrome-off'); });
  $('#drawerClose').addEventListener('click', function () { toggleDrawer(false); });

  LINES.forEach(function (key) {
    pickers[key].addEventListener('change', function (ev) {
      if (!selected) return;
      selected.sign.faces[key] = ev.target.value;
      delete selected.sign.tweak[key];
      scheduleFit([selected]);
    });
  });
  $('#shuffleFace').addEventListener('click', function () {
    if (!selected) return;
    dressType(selected.sign); scheduleFit([selected]); syncDrawer();
  });
  $('#resetFace').addEventListener('click', function () {
    if (!selected) return;
    var recipe = recipeFor(selected.sign.key);
    selected.sign.faces = Object.assign({}, recipe.faces);
    selected.sign.tweak = JSON.parse(JSON.stringify(recipe.tweak || {}));
    scheduleFit([selected]); syncDrawer();
    say('Đã về đúng công thức chữ của loại tiệm.');
  });

  var input = $('#fontFiles'), drop = $('#dropzone');
  $('#pickFonts').addEventListener('click', function () { input.click(); });
  input.addEventListener('change', function (ev) { ingest(ev.target.files); });
  ['dragenter', 'dragover'].forEach(function (type) {
    drop.addEventListener(type, function (ev) { ev.preventDefault(); drop.classList.add('over'); });
  });
  ['dragleave', 'drop'].forEach(function (type) {
    drop.addEventListener(type, function (ev) { ev.preventDefault(); drop.classList.remove('over'); });
  });
  drop.addEventListener('drop', function (ev) { ingest(ev.dataTransfer.files); });

  document.addEventListener('keydown', function (ev) {
    var el = document.activeElement;
    if (el && (el.isContentEditable || el.tagName === 'SELECT' || el.tagName === 'INPUT')) return;
    if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
    var key = ev.key.toLowerCase();
    if (key === 'r') shuffleWall();
    else if (key === 'n') newLayout();
    else if (key === 'a') addSign();
    else if (key === 't') setTheme(theme().other);
    else if (key === 'f') toggleDrawer();
    else if (key === 'h') document.body.classList.toggle('chrome-off');
    else if (key === 'escape') select(null);
  });

}

function toggleDrawer(force) {
  var drawer = $('#drawer'), button = document.querySelector('[data-act="fonts"]');
  var open = force === undefined ? drawer.hidden : force;
  drawer.hidden = !open;
  button.setAttribute('aria-pressed', String(open));
  if (open) syncDrawer();
}

/* ===========================================================================
   10. BOOT
   ========================================================================= */
/* The mosaic is generated from the wall's real pixel size, so it must not be
   built before the wall has one — on a cold load the first frame can measure
   zero. Build on the first resize observation that reports usable space. */
var built = false;
function ensureBoard() {
  if (built) return true;
  if (wall.clientWidth < 140 || wall.clientHeight < 140) return false;
  built = true;
  tree = buildLayout(targetCount());
  buildDOM();
  return true;
}

function boot() {
  wireChrome();
  Object.keys(THEMES).forEach(function (key) {
    var system = window[THEMES[key].system];
    system.onchange(function () {
      if (type !== system) return;      /* a late load in the era we left */
      refreshPickers(); updateStatus(); scheduleFit();
    });
  });
  setTheme(themeKey, true);
  new ResizeObserver(function () {
    if (built) scheduleFit(); else ensureBoard();
  }).observe(wall);
  ensureBoard();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { scheduleFit(); });
}

boot();
})();
