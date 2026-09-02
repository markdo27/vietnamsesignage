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
    justify: true, extrude: true, track: 0.16, leading: 1.02, gapSpend: 0.16,
    brand: 'Sàigòn 1985', tagline: 'BỘ PHÔNG CHỮ BIỂN HIỆU SÀI GÒN XƯA',
    note: function (report, system) {
      return report.genuine + '/' + report.total + ' mặt chữ Sài Gòn 1985 đã nạp. ' +
        (report.genuine ? system.credit
                        : 'Chưa thấy thư mục fonts/saigon1985 — tạm dùng phông thay thế.');
    }
  },
  nay: {
    label: 'PHỐ 2010', short: '2010', other: 'sg85',
    system: 'UTM', palettes: MODERN, gut: 7, mat: false,
    justify: true, track: 0.22, rotate: true, outline: true, dropShadow: true,
    leading: 0.94, gapSpend: 0.07,
    brand: 'Phố 2010', tagline: 'BẢNG HIỆU HIFLEX · IN KỸ THUẬT SỐ',
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

function defaultAdjust() {
  return {
    tracking: 0,
    kerning: 'auto',
    kerningFine: 0,
    wordSpacing: 0,
    lineSpacing: 1.0,
    gap: 0,
    lines: {}
  };
}

function getAdjust(sign, key) {
  if (!sign) return { tracking: 0, kerning: 'auto', kerningFine: 0, wordSpacing: 0, lineSpacing: 1.0, gap: 0 };
  var a = sign.adjust || {};
  var l = (a.lines && a.lines[key]) || {};
  return {
    tracking: (a.tracking || 0) + (l.tracking || 0),
    kerning: (l.kerning && l.kerning !== 'auto') ? l.kerning : (a.kerning || 'auto'),
    kerningFine: (a.kerningFine || 0) + (l.kerningFine || 0),
    wordSpacing: (a.wordSpacing || 0) + (l.wordSpacing || 0),
    lineSpacing: (a.lineSpacing !== undefined ? a.lineSpacing : 1.0) * (l.lineSpacing !== undefined ? l.lineSpacing : 1.0),
    gap: (a.gap || 0)
  };
}

function makeSign(key) {
  var sign = {};
  dressShop(sign, key || dealShop());
  return sign;
}

/* Put a whole different business on this sign: copy, type recipe, palette. */
function dressShop(sign, key) {
  var shop = SHOPS[key];
  sign.key = key;
  sign.badge = shop.icon;
  sign.text = { cat: shop.cat, name: pick(shop.name), tagline: pick(shop.tagline), footer: pick(shop.footer) };
  sign.adjust = sign.adjust || defaultAdjust();
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
/* A street runs on a handful of faces. The catalogue ranks each one by how
   often Vietnamese sign shops actually reach for it — 1 everyday, 2 common,
   3 specialist or too fine to hold up at sign size — and a shuffle deals
   accordingly, so the wall does not read like a specimen book. Face sets with
   no ranking (the 1985 pack, every face of which was traced off a sign) are
   dealt evenly. */
function pickFace(pool) {
  var bag = [];
  pool.forEach(function (face) {
    var n = face.rank === 1 ? 6 : face.rank === 2 ? 3 : 1;
    while (n--) bag.push(face);
  });
  return pick(bag.length ? bag : pool);
}

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
    if (pool.length) sign.faces[key] = pickFace(pool).id;
  });
  sign.tweak = {};
}

/* ===========================================================================
   4. THE SPLIT TREE
   ========================================================================= */
var GUT = 7, MIN_CELL = 40;
var wall = $('#wall');
var tree = null, selected = null;
var STORAGE_KEY = 'pho-bang-hieu-state-v1';
var HISTORY_LIMIT = 40;
var historyPast = [], historyFuture = [], saveTimer = 0;

function nodeData(node) {
  var data = { id: node.id, size: node.size };
  if (isLeaf(node)) data.sign = JSON.parse(JSON.stringify(node.sign));
  else { data.dir = node.dir; data.children = node.children.map(nodeData); }
  return data;
}

function reviveNode(data) {
  if (!data || typeof data !== 'object') return null;
  var id = typeof data.id === 'string' ? data.id : nid();
  var match = /^n(\d+)$/.exec(id);
  if (match) seq = Math.max(seq, Number(match[1]));
  var node = { id: id, size: Number(data.size) > 0 ? Number(data.size) : 1 };
  if (data.sign && SHOPS[data.sign.key]) node.sign = data.sign;
  else if ((data.dir === 'row' || data.dir === 'col') && Array.isArray(data.children)) {
    node.dir = data.dir;
    node.children = data.children.map(reviveNode).filter(Boolean);
    if (!node.children.length) return null;
  } else return null;
  return node;
}

function captureState() {
  return JSON.stringify({ version: 1, theme: themeKey, tree: tree ? nodeData(tree) : null });
}

function saveNow() {
  clearTimeout(saveTimer);
  if (!tree) return;
  try { localStorage.setItem(STORAGE_KEY, captureState()); }
  catch (err) { say('Trình duyệt không thể lưu bản thiết kế này.'); }
}

function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveNow, 180);
}

function restoreSaved() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    var data = JSON.parse(raw);
    if (!data || data.version !== 1 || !THEMES[data.theme]) return false;
    var restored = reviveNode(data.tree);
    if (!restored) return false;
    themeKey = data.theme;
    tree = restored;
    return true;
  } catch (err) { return false; }
}

function syncHistoryButtons() {
  var undoButton = $('[data-act="undo"]'), redoButton = $('[data-act="redo"]');
  if (undoButton) undoButton.disabled = !historyPast.length;
  if (redoButton) redoButton.disabled = !historyFuture.length;
}

function checkpoint() {
  if (!tree) return;
  var current = captureState();
  if (historyPast[historyPast.length - 1] !== current) historyPast.push(current);
  if (historyPast.length > HISTORY_LIMIT) historyPast.shift();
  historyFuture = [];
  syncHistoryButtons();
}

function applyCaptured(serialized) {
  var data;
  try { data = JSON.parse(serialized); } catch (err) { return false; }
  var nextTree = reviveNode(data.tree);
  if (!nextTree || !THEMES[data.theme]) return false;
  tree = null;
  setTheme(data.theme, true, true);
  tree = nextTree;
  selected = null;
  built = true;
  buildDOM();
  saveNow();
  syncHistoryButtons();
  return true;
}

function undoState() {
  if (!historyPast.length || !tree) return;
  historyFuture.push(captureState());
  applyCaptured(historyPast.pop());
  say('Đã hoàn tác.');
}

function redoState() {
  if (!historyFuture.length || !tree) return;
  historyPast.push(captureState());
  applyCaptured(historyFuture.pop());
  say('Đã làm lại.');
}

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
/* A row split halves the width, so both halves clear MIN only when the parent
   is at least 2*MIN wide-ish; a column split halves the height, so it needs the
   parent under MAX/2. Those two windows MUST overlap, or a cell that lands
   between them can never be split at all and sits there hogging the wall while
   everything around it subdivides. 0.6 and 2.7 overlap across 1.20-1.35. */
var MAX_ASPECT = 2.7, MIN_ASPECT = 0.6;

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
      /* favour the more even cuts, or one lopsided split early on leaves a cell
         four times its neighbours for the rest of the build */
      options.sort(function (a, b) {
        return Math.abs(a.ratio - 0.5) - Math.abs(b.ratio - 0.5);
      });
      var choice = pick(options.slice(0, Math.min(4, options.length)));
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
  ['adjust', '🎛', 'Căn chỉnh chữ (J)'],
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
  el.tabIndex = 0;
  updateGutterARIA(el, node, index);
  el.title = 'Kéo để đổi cỡ · bấm đúp để chia đều';
  el.addEventListener('pointerdown', function (ev) { startDrag(ev, el, node, index); });
  el.addEventListener('dblclick', function () {
    var a = node.children[index - 1], b = node.children[index], sum = a.size + b.size;
    checkpoint();
    a.size = b.size = sum / 2;
    a.el.style.flexGrow = a.size; b.el.style.flexGrow = b.size;
    updateGutterARIA(el, node, index);
    scheduleFit([a, b]);
    scheduleSave();
  });
  el.addEventListener('keydown', function (ev) {
    var backward = node.dir === 'row' ? ev.key === 'ArrowLeft' : ev.key === 'ArrowUp';
    var forward = node.dir === 'row' ? ev.key === 'ArrowRight' : ev.key === 'ArrowDown';
    if (!backward && !forward) return;
    var a = node.children[index - 1], b = node.children[index];
    var grow = a.size + b.size;
    var ra = a.el.getBoundingClientRect(), rb = b.el.getBoundingClientRect();
    var span = node.dir === 'row' ? ra.width + rb.width : ra.height + rb.height;
    var minShare = Math.min(.45, Math.max(.02, MIN_CELL / Math.max(span, MIN_CELL * 2)));
    var share = a.size / grow + (forward ? .05 : -.05);
    share = Math.max(minShare, Math.min(1 - minShare, share));
    if (Math.abs(a.size - grow * share) < .0001) return;
    checkpoint();
    a.size = grow * share; b.size = grow - a.size;
    a.el.style.flexGrow = a.size; b.el.style.flexGrow = b.size;
    updateGutterARIA(el, node, index);
    scheduleFit([a, b]);
    scheduleSave();
    ev.preventDefault();
  });
  return el;
}

function updateGutterARIA(el, node, index) {
  var a = node.children[index - 1], b = node.children[index];
  var percent = Math.round(100 * a.size / (a.size + b.size));
  el.setAttribute('aria-orientation', node.dir === 'row' ? 'vertical' : 'horizontal');
  el.setAttribute('aria-label', 'Đổi kích thước hai bảng liền kề');
  el.setAttribute('aria-valuemin', '5');
  el.setAttribute('aria-valuemax', '95');
  el.setAttribute('aria-valuenow', String(percent));
  el.setAttribute('aria-valuetext', 'Bảng trước chiếm ' + percent + ' phần trăm');
}

function renderSign(node) {
  var el = document.createElement('article');
  el.className = 'sign';
  el.dataset.id = node.id;
  el.style.flexGrow = node.size;
  el.setAttribute('aria-label', 'Bảng hiệu ' + SHOPS[node.sign.key].label);

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
    line.setAttribute('role', 'textbox');
    line.setAttribute('aria-multiline', 'false');
    line.tabIndex = 0;
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
  footer.setAttribute('role', 'textbox');
  footer.setAttribute('aria-multiline', 'false');
  footer.tabIndex = 0;
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
  var shopLabel = SHOPS[sign.key].label;
  var lineLabels = { cat: 'Loại hình', name: 'Tên tiệm', tagline: 'Slogan', footer: 'Thông tin chân bảng' };
  el.setAttribute('aria-label', 'Bảng hiệu ' + shopLabel);
  LINES.forEach(function (key) {
    node.lineEls[key].setAttribute('aria-label', lineLabels[key] + ' của ' + shopLabel);
  });
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
  var adj = getAdjust(sign, key);
  /* The era sets how close the lines stack. Scale whatever line-height the face
     declares rather than overriding it, so each face keeps its own rhythm. */
  var baseLh = (parseFloat(el.style.lineHeight) || 1.1) * (theme().leading || 1);
  el.style.lineHeight = (baseLh * adj.lineSpacing).toFixed(3);
  el.style.fontKerning = adj.kerning;
  el.style.wordSpacing = adj.wordSpacing ? adj.wordSpacing.toFixed(2) + 'px' : '';
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
  node.bodyEl.style.transform = 'translate(-50%,-50%)';

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
    blockH += size[key] * L.lh;
  });

  /* 3. Fit the stack to the board's height — never upward, which would push the
        lines past the measure they were just sized to. */
  var roomH = plan.boxH * (extrude ? 0.94 : 0.98);
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
    blockH += s * L.lh;
  });

  keys.forEach(function (key) {
    var el = node.lineEls[key], L = plan.line[key], o = out[key];
    applyLine(el, sign, key, PROBE * (sign.scale[key] || 0.5) * (o.size / L.size));
    var adj = getAdjust(sign, key);
    setTracking(el, o.track + adj.tracking + adj.kerningFine);
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
  var extraGap = (sign.adjust && sign.adjust.gap) || 0;

  if (theme().justify) {
    justify(plan);
    var lead = plan.keys.length > 1
      ? Math.min(plan.slack * 0.35 / (plan.keys.length - 1),
                 plan.line[plan.heroKey].size * (theme().gapSpend || 0))
      : 0;
    node.stackEl.style.gap = Math.max(0, lead + extraGap).toFixed(2) + 'px';
    if (plan.footerH) fitFooter(plan);
    return;
  }

  var factor = Math.min(plan.boxW / plan.mw, plan.boxH / plan.mh) * 0.98;
  plan.keys.forEach(function (key) {
    applyLine(node.lineEls[key], sign, key, PROBE * (sign.scale[key] || 0.5) * factor);
    var adj = getAdjust(sign, key);
    setTracking(node.lineEls[key], (parseFloat(node.lineEls[key].style.letterSpacing) || 0) + adj.tracking + adj.kerningFine);
    dressHero(node.lineEls[key], sign, false, 0, false);
  });
  /* A block held back by its widest line leaves air above and below. Sign
     painters spend that on leading, not on margin — so do we, up to a limit. */
  var lead = 0;
  if (plan.keys.length > 1) {
    var slack = Math.max(0, plan.boxH - needH * factor);
    lead = Math.min(slack * 0.55 / (plan.keys.length - 1), PROBE * factor * 0.45);
  }
  node.stackEl.style.gap = Math.max(0, lead + extraGap).toFixed(2) + 'px';
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
  var adj = getAdjust(sign, 'footer');
  setTracking(el, (track || (parseFloat(el.style.letterSpacing) || 0)) + adj.tracking + adj.kerningFine);
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

  checkpoint();
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
    updateGutterARIA(el, node, index);
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
    scheduleSave();
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
      checkpoint();
      dressShop(node.sign, dealShop());
      if (Math.random() < 0.5) dressType(node.sign);
      paintSign(node); scheduleFit([node]); syncDrawer(); scheduleSave();
    } else if (tool === 'adjust') {
      select(node);
      toggleDrawer(true, 'adjust');
    } else if (tool === 'row' || tool === 'col') {
      var rect = el.getBoundingClientRect();
      if (Math.min(rect.width, rect.height) < MIN_CELL * 2.4) { say('Bảng này hết chỗ để tách.'); return; }
      checkpoint();
      splitLeaf(node, tool, 0.5);
      buildDOM(); select(null); scheduleSave(); say('Đã thêm một bảng mới.');
    } else if (tool === 'close') {
      if (eachLeaf(tree).length < 2) { say('Phải chừa lại ít nhất một bảng.'); return; }
      checkpoint();
      if (dropLeaf(node)) { buildDOM(); select(null); scheduleSave(); }
    }
  });

  LINES.forEach(function (key) {
    var line = node.lineEls[key];
    line.addEventListener('input', function () {
      node.sign.text[key] = line.textContent;
      scheduleFit([node]);
      scheduleSave();
    });
    line.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter') { ev.preventDefault(); line.blur(); }
      if (ev.key === 'Escape') line.blur();
    });
    line.addEventListener('focus', function () { checkpoint(); select(node); });
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
  checkpoint();
  eachLeaf(tree).forEach(function (node) {
    dressShop(node.sign, dealShop());
    if (Math.random() < 0.45) dressType(node.sign);
    paintSign(node);
  });
  scheduleFit();
  syncDrawer();
  scheduleSave();
  say('Cả phố đã đổi bảng.');
}

function newLayout() {
  checkpoint();
  tree = buildLayout(targetCount());
  selected = null;
  buildDOM();
  scheduleSave();
  say('Bố cục mới · ' + eachLeaf(tree).length + ' bảng.');
}

/* Change era. The layout, the shops and every hand edit survive: only the type
   system and the inks are swapped, then each sign is re-lettered from the new
   era's recipe and re-inked from the palette family it already wanted. */
function setTheme(key, quiet, internal) {
  if (!internal && tree) checkpoint();
  themeKey = key;
  type = window[theme().system];
  document.body.dataset.theme = key;
  var brand = $('#brand'), note = $('#brandNote'), button = $('[data-act="theme"]');
  brand.textContent = theme().brand;
  note.textContent = theme().tagline;
  button.querySelector('span').textContent = THEMES[theme().other].short;
  button.title = 'Chuyển sang ' + THEMES[theme().other].label;
  $('#dropzone').hidden = key !== 'nay';
  if ($('#drawerTitle')) $('#drawerTitle').textContent = key === 'sg85' ? 'HỆ FONT SG85' : 'HỆ FONT UTM';
  document.documentElement.style.setProperty('--gut', theme().gut + 'px');
  GUT = theme().gut;

  if (tree && built) {
    eachLeaf(tree).forEach(function (node) {
      dressRecipe(node.sign);
      paintSign(node);
    });
    scheduleFit();
  }
  refreshPickers();
  Promise.resolve(type.init()).then(function () { updateStatus(); scheduleFit(); });
  if (!internal) scheduleSave();
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
  checkpoint();
  splitLeaf(target.node, choice.dir, choice.ratio);
  buildDOM();
  scheduleSave();
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

var activeDrawerTab = 'fonts';

function switchDrawerTab(tab) {
  activeDrawerTab = tab || 'fonts';
  var isFonts = activeDrawerTab === 'fonts';
  var tabFonts = $('#tabFonts'), tabAdjust = $('#tabAdjust');
  var paneFonts = $('#paneFonts'), paneAdjust = $('#paneAdjust');
  if (tabFonts) {
    tabFonts.classList.toggle('is-active', isFonts);
    tabFonts.setAttribute('aria-selected', String(isFonts));
  }
  if (tabAdjust) {
    tabAdjust.classList.toggle('is-active', !isFonts);
    tabAdjust.setAttribute('aria-selected', String(!isFonts));
  }
  if (paneFonts) paneFonts.hidden = !isFonts;
  if (paneAdjust) paneAdjust.hidden = isFonts;

  var fontBtn = document.querySelector('[data-act="fonts"]');
  var adjBtn = document.querySelector('[data-act="adjust"]');
  var drawer = $('#drawer');
  var open = drawer && !drawer.hidden;
  if (fontBtn) fontBtn.setAttribute('aria-pressed', String(open && isFonts));
  if (adjBtn) adjBtn.setAttribute('aria-pressed', String(open && !isFonts));

  if (!isFonts) syncAdjustPane();
}

function syncAdjustPane() {
  var hint = $('#adjustHint');
  var controls = $('#adjustControls');
  var has = !!selected;
  if (hint) {
    hint.textContent = has
      ? 'Đang chỉnh: ' + SHOPS[selected.sign.key].label + ' — ' + selected.sign.text.name
      : 'Bấm vào một bảng trên tường để điều chỉnh.';
  }
  if (controls) controls.classList.toggle('is-disabled', !has);
  if (!has) return;

  var sign = selected.sign;
  if (!sign.adjust) sign.adjust = defaultAdjust();
  var target = ($('#adjTarget') && $('#adjTarget').value) || 'all';

  var tracking = 0, kerning = 'auto', kerningFine = 0, wordSpacing = 0, lineSpacing = 1.0, gap = sign.adjust.gap || 0;
  if (target === 'all') {
    tracking = sign.adjust.tracking || 0;
    kerning = sign.adjust.kerning || 'auto';
    kerningFine = sign.adjust.kerningFine || 0;
    wordSpacing = sign.adjust.wordSpacing || 0;
    lineSpacing = sign.adjust.lineSpacing !== undefined ? sign.adjust.lineSpacing : 1.0;
  } else {
    var l = (sign.adjust.lines && sign.adjust.lines[target]) || {};
    tracking = l.tracking || 0;
    kerning = (l.kerning && l.kerning !== 'auto') ? l.kerning : (sign.adjust.kerning || 'auto');
    kerningFine = l.kerningFine || 0;
    wordSpacing = l.wordSpacing || 0;
    lineSpacing = l.lineSpacing !== undefined ? l.lineSpacing : 1.0;
  }

  var elTrack = $('#adjTracking');
  if (elTrack) {
    elTrack.value = tracking;
    var tv = $('#adjTrackingVal');
    if (tv) tv.textContent = (tracking > 0 ? '+' : '') + tracking + ' px';
  }
  var elKern = $('#adjKerning');
  if (elKern) elKern.value = kerning;

  var elKernFine = $('#adjKerningFine');
  if (elKernFine) {
    elKernFine.value = kerningFine;
    var kfv = $('#adjKerningFineVal');
    if (kfv) kfv.textContent = (kerningFine > 0 ? '+' : '') + kerningFine + ' px';
  }
  var elWs = $('#adjWordSpacing');
  if (elWs) {
    elWs.value = wordSpacing;
    var wsv = $('#adjWordSpacingVal');
    if (wsv) wsv.textContent = (wordSpacing > 0 ? '+' : '') + wordSpacing + ' px';
  }
  var elLh = $('#adjLineHeight');
  if (elLh) {
    elLh.value = lineSpacing;
    var lhv = $('#adjLineHeightVal');
    if (lhv) lhv.textContent = Number(lineSpacing).toFixed(2) + 'x';
  }
  var elGap = $('#adjGap');
  if (elGap) {
    elGap.value = gap;
    var gv = $('#adjGapVal');
    if (gv) gv.textContent = (gap > 0 ? '+' : '') + gap + ' px';
  }
}

function onAdjustInput() {
  if (!selected) return;
  var sign = selected.sign;
  if (!sign.adjust) sign.adjust = defaultAdjust();
  var target = ($('#adjTarget') && $('#adjTarget').value) || 'all';

  var tracking = parseInt($('#adjTracking').value, 10) || 0;
  var kerning = $('#adjKerning').value;
  var kerningFine = parseInt($('#adjKerningFine').value, 10) || 0;
  var wordSpacing = parseInt($('#adjWordSpacing').value, 10) || 0;
  var lineSpacing = parseFloat($('#adjLineHeight').value) || 1.0;
  var gap = parseInt($('#adjGap').value, 10) || 0;

  var tv = $('#adjTrackingVal');
  if (tv) tv.textContent = (tracking > 0 ? '+' : '') + tracking + ' px';
  var kfv = $('#adjKerningFineVal');
  if (kfv) kfv.textContent = (kerningFine > 0 ? '+' : '') + kerningFine + ' px';
  var wsv = $('#adjWordSpacingVal');
  if (wsv) wsv.textContent = (wordSpacing > 0 ? '+' : '') + wordSpacing + ' px';
  var lhv = $('#adjLineHeightVal');
  if (lhv) lhv.textContent = lineSpacing.toFixed(2) + 'x';
  var gv = $('#adjGapVal');
  if (gv) gv.textContent = (gap > 0 ? '+' : '') + gap + ' px';

  if (target === 'all') {
    sign.adjust.tracking = tracking;
    sign.adjust.kerning = kerning;
    sign.adjust.kerningFine = kerningFine;
    sign.adjust.wordSpacing = wordSpacing;
    sign.adjust.lineSpacing = lineSpacing;
    sign.adjust.gap = gap;
  } else {
    if (!sign.adjust.lines) sign.adjust.lines = {};
    if (!sign.adjust.lines[target]) sign.adjust.lines[target] = {};
    sign.adjust.lines[target].tracking = tracking;
    sign.adjust.lines[target].kerning = kerning;
    sign.adjust.lines[target].kerningFine = kerningFine;
    sign.adjust.lines[target].wordSpacing = wordSpacing;
    sign.adjust.lines[target].lineSpacing = lineSpacing;
    sign.adjust.gap = gap;
  }

  scheduleFit([selected]);
  scheduleSave();
}

function onAdjustChange() {
  if (!selected) return;
  checkpoint();
  scheduleSave();
}

function syncDrawer() {
  var hint = $('#drawerHint');
  var has = !!selected;
  if (hint) {
    hint.textContent = has
      ? 'Đang sửa: ' + SHOPS[selected.sign.key].label + ' — ' + selected.sign.text.name
      : 'Bấm vào một bảng trên tường để chọn, rồi đổi mặt chữ ở đây.';
  }
  LINES.forEach(function (key) {
    var select = pickers[key];
    if (!select) return;
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
  if ($('#shuffleFace')) $('#shuffleFace').disabled = !has;
  if ($('#resetFace')) $('#resetFace').disabled = !has;
  syncAdjustPane();
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

/* ===========================================================================
   11. EXPORT
   The first attempt serialised the DOM into a <foreignObject> and drew that as
   an image. That cannot work here: the Google Fonts stylesheet is cross-origin,
   so reading its rules throws SecurityError, and an SVG drawn through an <img>
   may not fetch external resources at all — the canvas comes out tainted and
   toBlob refuses it. ("Tainted canvases may not be exported.")

   So both formats are built from primitives instead. One pass reads the live
   DOM into a flat scene — rectangles and runs of text with their real metrics —
   and two small backends write it out. PNG paints onto a canvas using the faces
   the document has already loaded. SVG writes <rect> and <text> and embeds the
   faces it actually used as base64, so the file opens correctly on a machine
   that has never heard of UTM.

   Either exports the selected sign on its own, or the whole wall when nothing
   is selected.
   ========================================================================= */

var probe = document.createElement('canvas').getContext('2d');
var MAT_FACE = '#f4efe2', MAT_KEYLINE = 'rgba(18,28,26,.5)';

function exportScope() {
  if (selected && selected.el && selected.el.isConnected) {
    return { el: selected.el, nodes: [selected], label: SHOPS[selected.sign.key].label, whole: false };
  }
  return { el: wall, nodes: eachLeaf(tree), label: 'cả tường', whole: true };
}

function slug(text) {
  return String(text).normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'bang-hieu';
}

/* text-shadow resolves to a list we can read back verbatim, which is more
   faithful than recomputing the slab from the rules that drew it */
function readShadows(css) {
  var out = [], re = /(rgba?\([^)]+\))\s+(-?[\d.]+)px\s+(-?[\d.]+)px\s+(-?[\d.]+)px/g, m;
  while ((m = re.exec(css))) out.push({ color: m[1], dx: +m[2], dy: +m[3], blur: +m[4] });
  return out;
}

function lineRun(el, ox, oy) {
  var cs = getComputedStyle(el);
  if (cs.display === 'none' || cs.visibility === 'hidden') return null;
  var text = el.textContent;
  if (cs.textTransform === 'uppercase') text = text.toUpperCase();
  if (!text.trim()) return null;

  var rect = el.getBoundingClientRect();
  var size = parseFloat(cs.fontSize);
  var lh = parseFloat(cs.lineHeight) || size;
  var ls = parseFloat(cs.letterSpacing) || 0;
  var ws = parseFloat(cs.wordSpacing) || 0;
  var fk = cs.fontKerning || 'auto';

  /* the baseline sits half the leading below the top of the line box */
  probe.font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + size + 'px ' + cs.fontFamily;
  var m = probe.measureText(text);
  var asc = m.fontBoundingBoxAscent || size * 0.8;
  var desc = m.fontBoundingBoxDescent || size * 0.2;

  var strokeW = parseFloat(cs.webkitTextStrokeWidth) || 0;
  return {
    text: text,
    cx: rect.left + rect.width / 2 - ox,
    baseline: rect.top + (lh - (asc + desc)) / 2 + asc - oy,
    size: size, family: cs.fontFamily, weight: cs.fontWeight, style: cs.fontStyle,
    letterSpacing: ls,
    wordSpacing: ws,
    fontKerning: fk,
    fill: cs.webkitTextFillColor && cs.webkitTextFillColor !== 'rgba(0, 0, 0, 0)' ? cs.webkitTextFillColor : cs.color,
    gradient: el.closest('.gradient-name') && el.classList.contains('name')
      ? getComputedStyle(el.closest('.sign')).getPropertyValue('--name-grad') : '',
    stroke: strokeW ? cs.webkitTextStrokeColor : '', strokeWidth: strokeW,
    shadows: readShadows(cs.textShadow || '')
  };
}

/* Read the live wall into a flat list of rectangles and text runs. */
function buildScene(scope) {
  var box = scope.el.getBoundingClientRect();
  var ox = box.left, oy = box.top;
  /* The board's colour sits in a multi-layer background shorthand, so reading
     backgroundColor alone comes back transparent and the export would have no
     board at all. Fall back to the frame variable that paints it. */
  var wallBG = getComputedStyle(wall).backgroundColor;
  if (!wallBG || /transparent|rgba\(0, 0, 0, 0\)/.test(wallBG)) {
    wallBG = getComputedStyle(document.body).getPropertyValue('--frame').trim() || '#ffffff';
  }
  var scene = { w: Math.round(box.width), h: Math.round(box.height),
                bg: wallBG, rects: [], runs: [] };

  scope.nodes.forEach(function (node) {
    var el = node.el;
    if (!el || !el.isConnected) return;
    var r = el.getBoundingClientRect();
    var cs = getComputedStyle(el);
    var x = r.left - ox, y = r.top - oy;
    var mat = parseFloat(cs.getPropertyValue('--mat')) || 0;

    if (mat > 0) {                                  /* the 1985 photo mat */
      scene.rects.push({ x: x, y: y, w: r.width, h: r.height, fill: MAT_FACE });
      scene.rects.push({ x: x + mat, y: y + mat, w: r.width - mat * 2, h: r.height - mat * 2, fill: MAT_KEYLINE });
      scene.rects.push({ x: x + mat + 1.5, y: y + mat + 1.5,
                         w: r.width - (mat + 1.5) * 2, h: r.height - (mat + 1.5) * 2, fill: cs.backgroundColor });
    } else {
      scene.rects.push({ x: x, y: y, w: r.width, h: r.height, fill: cs.backgroundColor });
    }

    /* the shop-name banner, when the palette carries one */
    var catLine = el.querySelector('.line.cat');
    if (catLine && !catLine.hidden) {
      var bcs = getComputedStyle(catLine);
      if (bcs.backgroundColor && bcs.backgroundColor !== 'rgba(0, 0, 0, 0)') {
        var br = catLine.getBoundingClientRect();
        scene.rects.push({ x: br.left - ox, y: br.top - oy, w: br.width, h: br.height, fill: bcs.backgroundColor });
      }
    }

    var strip = el.querySelector('.footer-strip');
    var stripH = 0;
    if (strip && getComputedStyle(strip).display !== 'none') {
      var sr = strip.getBoundingClientRect();
      stripH = sr.height;
      scene.rects.push({ x: sr.left - ox, y: sr.top - oy, w: sr.width, h: sr.height,
                         fill: getComputedStyle(strip).backgroundColor });
    }

    if (el.classList.contains('ruled') && el.dataset.level === '3') {
      var inset = mat + 4;
      scene.rects.push({ x: x + inset, y: y + inset,
                         w: r.width - inset * 2, h: r.height - inset - stripH - mat - 4,
                         stroke: cs.getPropertyValue('--rule').trim() || '#000', width: 2 });
    }

    el.querySelectorAll('.line').forEach(function (line) {
      var run = lineRun(line, ox, oy);
      if (run) scene.runs.push(run);
    });
  });

  return scene;
}

/* --- PNG: paint the scene with the faces the page already has --------- */
function renderCanvas(scene, scale) {
  var canvas = document.createElement('canvas');
  canvas.width = Math.round(scene.w * scale);
  canvas.height = Math.round(scene.h * scale);
  var ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);
  ctx.fillStyle = scene.bg || '#fff';
  ctx.fillRect(0, 0, scene.w, scene.h);

  scene.rects.forEach(function (r) {
    if (r.stroke) {
      ctx.strokeStyle = r.stroke;
      ctx.lineWidth = r.width || 1;
      ctx.strokeRect(r.x + (r.width || 1) / 2, r.y + (r.width || 1) / 2,
                     Math.max(0, r.w - (r.width || 1)), Math.max(0, r.h - (r.width || 1)));
    } else {
      ctx.fillStyle = r.fill;
      ctx.fillRect(r.x, r.y, r.w, r.h);
    }
  });

  scene.runs.forEach(function (run) {
    ctx.save();
    ctx.font = run.style + ' ' + run.weight + ' ' + run.size + 'px ' + run.family;
    if ('letterSpacing' in ctx) ctx.letterSpacing = run.letterSpacing + 'px';
    if ('wordSpacing' in ctx && run.wordSpacing) ctx.wordSpacing = run.wordSpacing + 'px';
    if ('fontKerning' in ctx && run.fontKerning) ctx.fontKerning = run.fontKerning;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    var width = ctx.measureText(run.text).width;
    /* the DOM cancels the trailing letter-space to keep the line centred */
    var x = run.cx - (width - run.letterSpacing) / 2;

    run.shadows.slice().reverse().forEach(function (s) {
      ctx.fillStyle = s.color;
      ctx.fillText(run.text, x + s.dx, run.baseline + s.dy);
    });
    if (run.strokeWidth) {
      ctx.strokeStyle = run.stroke;
      ctx.lineWidth = run.strokeWidth * 2;   /* CSS strokes centred, fill covers the inner half */
      ctx.lineJoin = 'round';
      ctx.strokeText(run.text, x, run.baseline);
    }
    if (run.gradient) {
      var g = ctx.createLinearGradient(x, 0, x + width, 0);
      var stops = run.gradient.match(/#[0-9a-f]{3,8}|rgba?\([^)]+\)/gi) || ['#fff'];
      stops.forEach(function (c, i) { g.addColorStop(stops.length === 1 ? 0 : i / (stops.length - 1), c); });
      ctx.fillStyle = g;
    } else {
      ctx.fillStyle = run.fill;
    }
    ctx.fillText(run.text, x, run.baseline);
    ctx.restore();
  });
  return canvas;
}

/* --- SVG: real vectors, with the faces embedded so it travels ---------- */
function fontFileFor(family) {
  var name = family.replace(/['"]/g, '').split(',')[0].trim();
  var sg = (window.SG85 && window.SG85.faces || []).filter(function (f) { return f.utm === name; })[0];
  if (sg) return 'fonts/saigon1985/' + sg.file;
  var utm = (window.UTM && window.UTM.faces || []).filter(function (f) { return f.utm === name; })[0];
  if (utm && exportManifest) {
    var want = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    var hit = exportManifest.filter(function (file) {
      return file.toLowerCase().replace(/\.[a-z0-9]+$/, '').replace(/[^a-z0-9]/g, '').indexOf(want) !== -1;
    })[0];
    if (hit) return 'fonts/' + hit;
  }
  return null;
}

var exportManifest = null;
function loadExportManifest() {
  if (exportManifest) return Promise.resolve(exportManifest);
  return fetch('fonts/manifest.json').then(function (r) { return r.json(); })
    .then(function (j) { exportManifest = j.files || []; return exportManifest; })
    .catch(function () { exportManifest = []; return exportManifest; });
}

function embedFonts(scene) {
  var families = {};
  scene.runs.forEach(function (run) {
    var name = run.family.replace(/['"]/g, '').split(',')[0].trim();
    if (name) families[name] = true;
  });
  return loadExportManifest().then(function () {
    var jobs = Object.keys(families).map(function (name) {
      var url = fontFileFor(name);
      if (!url) return Promise.resolve('');
      return fetch(encodeURI(url)).then(function (r) { return r.ok ? r.arrayBuffer() : null; })
        .then(function (buf) {
          if (!buf) return '';
          var bytes = new Uint8Array(buf), bin = '';
          for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
          return "@font-face{font-family:'" + name + "';src:url(data:font/ttf;base64," +
                 btoa(bin) + ") format('truetype');}";
        }).catch(function () { return ''; });
    });
    return Promise.all(jobs).then(function (css) { return css.join('\n'); });
  });
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderSVG(scene, fontCSS) {
  var out = ['<svg xmlns="http://www.w3.org/2000/svg" width="' + scene.w + '" height="' + scene.h +
             '" viewBox="0 0 ' + scene.w + ' ' + scene.h + '">'];
  out.push('<style>' + fontCSS + '</style>');
  out.push('<rect width="' + scene.w + '" height="' + scene.h + '" fill="' + (scene.bg || '#fff') + '"/>');

  scene.rects.forEach(function (r) {
    if (r.stroke) {
      out.push('<rect x="' + r.x.toFixed(1) + '" y="' + r.y.toFixed(1) + '" width="' + Math.max(0, r.w).toFixed(1) +
        '" height="' + Math.max(0, r.h).toFixed(1) + '" fill="none" stroke="' + r.stroke +
        '" stroke-width="' + (r.width || 1) + '"/>');
    } else {
      out.push('<rect x="' + r.x.toFixed(1) + '" y="' + r.y.toFixed(1) + '" width="' + Math.max(0, r.w).toFixed(1) +
        '" height="' + Math.max(0, r.h).toFixed(1) + '" fill="' + r.fill + '"/>');
    }
  });

  var gradId = 0;
  scene.runs.forEach(function (run) {
    var attrs = 'x="' + run.cx.toFixed(1) + '" y="' + run.baseline.toFixed(1) +
      '" text-anchor="middle" font-family="' + esc(run.family.replace(/"/g, "'")) +
      '" font-size="' + run.size.toFixed(2) + '" font-weight="' + run.weight +
      '" letter-spacing="' + run.letterSpacing.toFixed(2) + '"' +
      (run.wordSpacing ? ' word-spacing="' + run.wordSpacing.toFixed(2) + '"' : '') +
      (run.fontKerning && run.fontKerning !== 'auto' ? ' font-kerning="' + run.fontKerning + '"' : '');
    run.shadows.slice().reverse().forEach(function (s) {
      out.push('<text ' + attrs + ' transform="translate(' + s.dx.toFixed(2) + ',' + s.dy.toFixed(2) +
        ')" fill="' + s.color + '">' + esc(run.text) + '</text>');
    });
    var fill = run.fill;
    if (run.gradient) {
      var stops = run.gradient.match(/#[0-9a-f]{3,8}|rgba?\([^)]+\)/gi) || ['#fff'];
      var id = 'g' + (++gradId);
      out.push('<defs><linearGradient id="' + id + '">' + stops.map(function (c, i) {
        return '<stop offset="' + (stops.length === 1 ? 0 : i / (stops.length - 1)) + '" stop-color="' + c + '"/>';
      }).join('') + '</linearGradient></defs>');
      fill = 'url(#' + id + ')';
    }
    if (run.strokeWidth) {
      out.push('<text ' + attrs + ' fill="' + fill + '" stroke="' + run.stroke + '" stroke-width="' +
        (run.strokeWidth * 2).toFixed(2) + '" stroke-linejoin="round" paint-order="stroke">' + esc(run.text) + '</text>');
    } else {
      out.push('<text ' + attrs + ' fill="' + fill + '">' + esc(run.text) + '</text>');
    }
  });
  out.push('</svg>');
  return out.join('\n');
}

function saveBlob(blob, filename) {
  var url = URL.createObjectURL(blob), link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
}

function exportImage(format) {
  if (!tree) { say('Chưa có bảng để xuất.'); return; }
  var scope = exportScope();
  var rect = scope.el.getBoundingClientRect();
  if (rect.width < 2 || rect.height < 2) { say('Chưa có bảng để xuất.'); return; }

  var name = 'pho-bang-hieu-' + themeKey + '-' + slug(scope.whole ? 'ca-tuong' : scope.label);
  var scene = buildScene(scope);

  if (format === 'svg') {
    say('Đang dựng SVG…');
    embedFonts(scene).then(function (fontCSS) {
      saveBlob(new Blob([renderSVG(scene, fontCSS)], { type: 'image/svg+xml;charset=utf-8' }), name + '.svg');
      say('Đã xuất SVG · ' + scope.label + '.');
    });
    return;
  }

  say('Đang dựng PNG…');
  var scale = Math.max(1, Math.min(3, 2400 / Math.max(scene.w, scene.h)));
  renderCanvas(scene, scale).toBlob(function (blob) {
    if (!blob) { say('Không tạo được ảnh PNG.'); return; }
    saveBlob(blob, name + '.png');
    say('Đã xuất PNG · ' + scope.label + ' · ' + Math.round(scene.w * scale) + '×' + Math.round(scene.h * scale) + '.');
  }, 'image/png');
}

function wireChrome() {
  document.querySelectorAll('.dock button').forEach(function (button) {
    button.addEventListener('click', function () {
      var act = button.dataset.act;
      if (act === 'shuffle') shuffleWall();
      else if (act === 'add') addSign();
      else if (act === 'relayout') newLayout();
      else if (act === 'undo') undoState();
      else if (act === 'redo') redoState();
      else if (act === 'theme') setTheme(theme().other);
      else if (act === 'export') exportImage('png');
      else if (act === 'export-svg') exportImage('svg');
      else if (act === 'fonts') toggleDrawer(undefined, 'fonts');
      else if (act === 'adjust') toggleDrawer(undefined, 'adjust');
      else if (act === 'hide') { document.body.classList.add('chrome-off'); }
    });
  });
  $('#peek').addEventListener('click', function () { document.body.classList.remove('chrome-off'); });
  $('#drawerClose').addEventListener('click', function () { toggleDrawer(false); });

  if ($('#tabFonts')) $('#tabFonts').addEventListener('click', function () { switchDrawerTab('fonts'); });
  if ($('#tabAdjust')) $('#tabAdjust').addEventListener('click', function () { switchDrawerTab('adjust'); });

  if ($('#adjTarget')) $('#adjTarget').addEventListener('change', syncAdjustPane);
  ['adjTracking', 'adjKerningFine', 'adjWordSpacing', 'adjLineHeight', 'adjGap'].forEach(function (id) {
    var el = $('#' + id);
    if (el) {
      el.addEventListener('input', onAdjustInput);
      el.addEventListener('change', onAdjustChange);
    }
  });
  if ($('#adjKerning')) {
    $('#adjKerning').addEventListener('change', function () {
      onAdjustInput();
      onAdjustChange();
    });
  }
  if ($('#resetAdjust')) {
    $('#resetAdjust').addEventListener('click', function () {
      if (!selected) return;
      checkpoint();
      var target = ($('#adjTarget') && $('#adjTarget').value) || 'all';
      if (target === 'all') {
        selected.sign.adjust = defaultAdjust();
      } else if (selected.sign.adjust && selected.sign.adjust.lines && selected.sign.adjust.lines[target]) {
        delete selected.sign.adjust.lines[target];
      }
      syncAdjustPane();
      scheduleFit([selected]);
      scheduleSave();
      say('Đã đặt lại căn chỉnh về mặc định.');
    });
  }
  if ($('#applyAllAdjust')) {
    $('#applyAllAdjust').addEventListener('click', function () {
      if (!selected) return;
      if (!selected.sign.adjust) selected.sign.adjust = defaultAdjust();
      checkpoint();
      var copy = JSON.parse(JSON.stringify(selected.sign.adjust));
      eachLeaf(tree).forEach(function (node) {
        if (node.sign) node.sign.adjust = JSON.parse(JSON.stringify(copy));
      });
      scheduleFit();
      scheduleSave();
      say('Đã áp dụng căn chỉnh này cho toàn bộ bảng trên phố.');
    });
  }

  LINES.forEach(function (key) {
    pickers[key].addEventListener('change', function (ev) {
      if (!selected) return;
      checkpoint();
      selected.sign.faces[key] = ev.target.value;
      delete selected.sign.tweak[key];
      scheduleFit([selected]);
      scheduleSave();
    });
  });
  $('#shuffleFace').addEventListener('click', function () {
    if (!selected) return;
    checkpoint();
    dressType(selected.sign); scheduleFit([selected]); syncDrawer(); scheduleSave();
  });
  $('#resetFace').addEventListener('click', function () {
    if (!selected) return;
    checkpoint();
    var recipe = recipeFor(selected.sign.key);
    selected.sign.faces = Object.assign({}, recipe.faces);
    selected.sign.tweak = JSON.parse(JSON.stringify(recipe.tweak || {}));
    scheduleFit([selected]); syncDrawer(); scheduleSave();
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
    var editing = el && (el.isContentEditable || el.tagName === 'SELECT' || el.tagName === 'INPUT');
    var key = ev.key.toLowerCase();
    if (!editing && (ev.metaKey || ev.ctrlKey) && !ev.altKey) {
      if (key === 'z' && ev.shiftKey) redoState();
      else if (key === 'z') undoState();
      else if (key === 'y') redoState();
      else return;
      ev.preventDefault();
      return;
    }
    if (editing) return;
    if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
    if (key === 'r') shuffleWall();
    else if (key === 'n') newLayout();
    else if (key === 'a') addSign();
    else if (key === 't') setTheme(theme().other);
    else if (key === 'f') toggleDrawer(undefined, 'fonts');
    else if (key === 'j') toggleDrawer(undefined, 'adjust');
    else if (key === 'h') document.body.classList.toggle('chrome-off');
    else if (key === 'escape') select(null);
  });

}

function toggleDrawer(force, tab) {
  var drawer = $('#drawer');
  var fontBtn = document.querySelector('[data-act="fonts"]');
  var adjBtn = document.querySelector('[data-act="adjust"]');
  var open = force === undefined ? drawer.hidden : force;
  if (tab) {
    if (drawer.hidden) open = true;
    else if (activeDrawerTab === tab && force === undefined) open = false;
    switchDrawerTab(tab);
  }
  drawer.hidden = !open;
  var isFonts = activeDrawerTab === 'fonts';
  if (fontBtn) fontBtn.setAttribute('aria-pressed', String(open && isFonts));
  if (adjBtn) adjBtn.setAttribute('aria-pressed', String(open && !isFonts));
  if (open) {
    syncDrawer();
    syncAdjustPane();
  }
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
  if (!tree) tree = buildLayout(targetCount());
  buildDOM();
  saveNow();
  return true;
}

function boot() {
  restoreSaved();
  wireChrome();
  Object.keys(THEMES).forEach(function (key) {
    var system = window[THEMES[key].system];
    system.onchange(function () {
      if (type !== system) return;      /* a late load in the era we left */
      refreshPickers(); updateStatus(); scheduleFit();
    });
  });
  setTheme(themeKey, true, true);
  new ResizeObserver(function () {
    if (built) scheduleFit(); else ensureBoard();
  }).observe(wall);
  ensureBoard();
  syncHistoryButtons();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { scheduleFit(); });
}

boot();
})();
