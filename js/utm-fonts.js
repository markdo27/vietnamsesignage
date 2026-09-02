/* ============================================================================
   UTM FONT SYSTEM  —  bảng hiệu Việt Nam
   ----------------------------------------------------------------------------
   The UTM pack ("Unicode Thiên Minh", ~500 Vietnamese-ized faces) is what real
   sign shops load into CorelDRAW. It is also, legally, a pile of unauthorized
   Vietnamese-diacritic grafts onto commercial Western typefaces — so we model
   the *system* without shipping the *files*:

     1. CATALOG   — every signage-relevant UTM face, its Western origin, the
                    signage role it plays, and a metric-tuned open substitute
                    that actually has Vietnamese glyph coverage.
     2. GENUINE   — @font-face rules built from local() only. If the machine has
                    the real UTM fonts installed, they are used automatically and
                    nothing is downloaded or redistributed.
     3. DROP-IN   — the user can load their own UTM files (drag-drop, picker, or
                    fonts/manifest.json). Stored per-browser in IndexedDB.
     4. SUBSTITUTE— otherwise a tuned open face stands in: weight, width axis,
                    tracking and cap-height are pushed toward the UTM face.
     5. METRICS   — cap heights are measured at runtime, so sign text is sized by
                    CAP HEIGHT (how sign painters actually work), not by em size.
                    Swapping faces keeps the board layout stable.

   Every stack ends in 'Be Vietnam Pro' — CSS falls back per-glyph, so even if a
   substitute is missing one accented glyph, the diacritic still renders.
   ========================================================================== */
(function (global) {
  'use strict';

  var VN_SAFETY = "'Be Vietnam Pro'";

  /* --- groups ------------------------------------------------------------ */
  var GROUPS = {
    condensed: { vi: 'Nén – chữ khối hẹp',      en: 'Condensed display' },
    grotesque: { vi: 'Sans đậm',                en: 'Heavy grotesque'   },
    geometric: { vi: 'Sans hình học',           en: 'Geometric sans'    },
    slab:      { vi: 'Chân dày',                en: 'Slab / fat face'   },
    serif:     { vi: 'Có chân',                 en: 'Serif'             },
    inscribed: { vi: 'Chữ khắc – trang trọng',  en: 'Inscribed caps'    },
    script:    { vi: 'Chữ viết tay',            en: 'Script'            },
    brush:     { vi: 'Thư pháp',                en: 'Vietnamese brush'  },
    tech:      { vi: 'Chữ vuông – kỹ thuật',    en: 'Techno / squared'  }
  };

  /* --- the catalog -------------------------------------------------------
     tune:
       w      font-weight
       wdth   variable width axis (Archivo / Saira only)
       track  letter-spacing, em
       lh     line-height multiple of cap height
       rank   how often sign shops reach for it: 1 everyday, 2 common, 3 rare
       sx     horizontal scale (squeeze toward the UTM proportion)
       caps   force uppercase
       cap    cap-height hint, only used before runtime measurement lands
     ---------------------------------------------------------------------- */
  var FACES = [
    /* ---------- CONDENSED: the backbone of every Vietnamese sign ---------- */
    { id:'bebas', utm:'UTM Bebas', origin:'Bebas Neue', group:'condensed',
      roles:['cat','name','tagline'], note:'Dòng loại hình kinh điển — KHÁCH SẠN, BIA TƯƠI, CƠM TẤM.',
      local:['UTM Bebas','UTMBebas','UTM Bebas KT'],
      rank:1, sub:"'Anton'", tune:{ w:400, track:0.015, lh:1.06, caps:true } },

    { id:'bebaskai', utm:'UTM BebasKai', origin:'Bebas Neue (bản nhẹ)', group:'condensed',
      roles:['cat','tagline','footer'], note:'Bebas thân mảnh hơn, hay dùng cho dòng dịch vụ.',
      local:['UTM BebasKai','UTMBebasKai'],
      rank:2, sub:"'Oswald'", tune:{ w:600, track:0.03, lh:1.1, caps:true } },

    { id:'impact', utm:'UTM Impact', origin:'Impact', group:'condensed',
      roles:['name','cat'], note:'Khối chữ dày, đập vào mắt — tên quán cỡ lớn.',
      local:['UTM Impact','UTMImpact'],
      rank:1, sub:"'Anton'", tune:{ w:400, track:-0.005, lh:1.02, sx:0.97, caps:true } },

    { id:'helvetins', utm:'UTM HelvetIns', origin:'Helvetica Inserat', group:'condensed',
      roles:['name','cat'], note:'Siêu nén, siêu đậm. Chữ to nhất trên tấm bạt.',
      local:['UTM HelvetIns','UTMHelvetIns','UTM Helvetins'],
      rank:1, sub:"'Archivo'", tune:{ w:900, wdth:62, track:-0.012, lh:1.0, caps:true } },

    { id:'swiss721', utm:'UTM Swiss 721 Black Condensed', origin:'Swiss 721 BT', group:'condensed',
      roles:['cat','name','tagline'], note:'Đặc và hẹp — dòng giá, dòng khuyến mãi.',
      local:['UTM Swiss721 BlackCondensed','UTMSwiss721BlackCondensed','UTM Swiss 721 Black Condensed'],
      rank:1, sub:"'Archivo'", tune:{ w:900, wdth:75, track:0, lh:1.04, caps:true } },

    { id:'ericsson', utm:'UTM Ericsson', origin:'Ericsson Capital', group:'condensed',
      roles:['tagline','footer','cat'], note:'Nén vừa, đọc tốt ở dòng phụ.',
      local:['UTM Ericsson','UTMEricsson'],
      rank:2, sub:"'Saira Condensed'", tune:{ w:700, track:0.02, lh:1.12, caps:true } },

    /* ---------- HEAVY GROTESQUE ---------- */
    { id:'helvetica', utm:'UTM Helvetica Bold', origin:'Helvetica', group:'grotesque',
      roles:['name','cat','footer'], note:'Chữ "an toàn" của mọi tiệm in.',
      local:['UTM Helvetica','UTMHelvetica','UTM HelveticaBold','UTM Helvetica Bold'],
      rank:1, sub:"'Archivo'", tune:{ w:800, wdth:100, track:-0.01, lh:1.12 } },

    { id:'americansans', utm:'UTM AmericanSans', origin:'Franklin Gothic họ', group:'grotesque',
      roles:['cat','name'], note:'Đậm, chân phương, kiểu bảng hiệu nhà nước.',
      local:['UTM AmericanSans','UTMAmericanSans','UTM American Sans'],
      rank:2, sub:"'Chivo'", tune:{ w:900, track:0.005, lh:1.1, caps:true } },

    { id:'facebook', utm:'UTM Facebook', origin:'Klavika', group:'grotesque',
      roles:['name','tagline'], note:'Vuông vức hiện đại — tiệm điện thoại, net, spa.',
      local:['UTM Facebook','UTMFacebook'],
      rank:2, sub:"'Chivo'", tune:{ w:700, track:0.01, lh:1.14 } },

    { id:'dax', utm:'UTM Dax', origin:'Dax', group:'grotesque',
      roles:['tagline','footer'], note:'Hẹp, hiện đại, dùng cho dòng mô tả dịch vụ.',
      local:['UTM Dax','UTMDax','UTM Daxline'],
      rank:3, sub:VN_SAFETY, tune:{ w:700, track:0.01, lh:1.16 } },

    /* ---------- GEOMETRIC ---------- */
    { id:'avo', utm:'UTM Avo', origin:'ITC Avant Garde Gothic', group:'geometric',
      roles:['name','cat'], note:'Tròn, hình học — salon, nail, spa, cà phê.',
      local:['UTM Avo','UTMAvo','UTM AvoBold','UTM Avo Bold'],
      rank:1, sub:VN_SAFETY, tune:{ w:900, track:0.02, lh:1.1, caps:true } },

    { id:'centur', utm:'UTM Centur', origin:'Century Gothic', group:'geometric',
      roles:['tagline','footer','name'], note:'Thanh, thoáng — tiệm làm đẹp, phòng khám.',
      local:['UTM Centur','UTMCentur'],
      rank:2, sub:VN_SAFETY, tune:{ w:700, track:0.045, lh:1.2 } },

    { id:'caviar', utm:'UTM Caviar', origin:'Caviar Dreams', group:'geometric',
      roles:['tagline','footer'], note:'Nhẹ và giãn — dòng phụ sang trọng.',
      local:['UTM Caviar','UTMCaviar'],
      rank:3, sub:VN_SAFETY, tune:{ w:400, track:0.09, lh:1.25, caps:true } },

    { id:'kabel', utm:'UTM Kabel', origin:'Kabel', group:'geometric',
      roles:['cat','name'], note:'Hình học kiểu cũ, hơi art-deco.',
      local:['UTM Kabel','UTMKabel','UTM KabelKT'],
      rank:2, sub:"'Kanit'", tune:{ w:600, track:0.03, lh:1.12, caps:true } },

    /* ---------- SLAB / FAT FACE ---------- */
    { id:'colossalis', utm:'UTM Colossalis', origin:'Colossalis', group:'slab',
      roles:['name','cat'], note:'Chân dày nặng — cầm đồ, vật liệu xây dựng, gara.',
      local:['UTM Colossalis','UTMColossalis'],
      rank:1, sub:"'Alfa Slab One'", tune:{ w:400, track:0.005, lh:1.1, caps:true } },

    { id:'cooper', utm:'UTM Cooper Black', origin:'Cooper Black', group:'slab',
      roles:['name'], note:'Béo, tròn, vui — quán ăn, trà sữa, bánh mì.',
      local:['UTM Cooper Black','UTMCooperBlack','UTM CooperBlack'],
      rank:1, sub:"'Bevan'", tune:{ w:400, track:0.005, lh:1.12 } },

    /* ---------- SERIF ---------- */
    { id:'alexander', utm:'UTM Alexander', origin:'display serif', group:'serif',
      roles:['name'], note:'Serif trang trí, tương phản mạnh — tiệm vàng, nhà hàng.',
      local:['UTM Alexander','UTMAlexander'],
      rank:2, sub:"'Yeseva One'", tune:{ w:400, track:0.005, lh:1.14 } },

    { id:'banque', utm:'UTM Banque', origin:'serif ngân hàng', group:'serif',
      roles:['name','cat'], note:'Đứng đắn, "có uy tín" — cầm đồ, phòng công chứng.',
      local:['UTM Banque','UTMBanque'],
      rank:2, sub:"'Playfair Display'", tune:{ w:900, track:0.01, lh:1.14, caps:true } },

    { id:'georgia', utm:'UTM Georgia', origin:'Georgia', group:'serif',
      roles:['footer'], note:'Serif đọc tốt cho dòng chữ nhỏ.',
      local:['UTM Georgia','UTMGeorgia'],
      rank:3, sub:"'Bitter'", tune:{ w:700, track:0.005, lh:1.2 } },

    { id:'nyala', utm:'UTM Nyala', origin:'Nyala', group:'serif',
      roles:['tagline'], note:'Serif mềm, hơi calligraphic.',
      local:['UTM Nyala','UTMNyala'],
      rank:3, sub:"'Bitter'", tune:{ w:600, track:0.01, lh:1.2 } },

    { id:'times', utm:'UTM Times', origin:'Times New Roman', group:'serif',
      roles:['footer'], note:'Mặc định của Word — và của rất nhiều bảng hiệu thật.',
      local:['UTM Times','UTMTimes'],
      rank:3, sub:"'EB Garamond'", tune:{ w:700, track:0.005, lh:1.22 } },

    /* ---------- INSCRIBED CAPS ---------- */
    { id:'trajan', utm:'UTM Trajan', origin:'Trajan Pro', group:'inscribed',
      roles:['cat','name'], note:'Chữ khắc La Mã — nhà thuốc, phòng khám, luật sư.',
      local:['UTM Trajan','UTMTrajan','UTM TrajanPro'],
      rank:2, sub:"'EB Garamond'", tune:{ w:600, track:0.09, lh:1.2, caps:true } },

    { id:'charlemagne', utm:'UTM Charlemagne', origin:'Charlemagne', group:'inscribed',
      roles:['cat','name'], note:'Trang trọng, cổ điển — đình chùa, tiệm vàng.',
      local:['UTM Charlemagne','UTMCharlemagne'],
      rank:3, sub:"'EB Garamond'", tune:{ w:700, track:0.1, lh:1.2, caps:true } },

    { id:'copperplate', utm:'UTM Copperplate', origin:'Copperplate Gothic', group:'inscribed',
      roles:['cat','footer'], note:'Chân nhỏ li ti, giãn rộng — bảng tên công ty.',
      local:['UTM Copperplate','UTMCopperplate'],
      rank:2, sub:"'Chivo'", tune:{ w:700, track:0.14, lh:1.22, caps:true } },

    { id:'penumbra', utm:'UTM Penumbra', origin:'Penumbra', group:'inscribed',
      roles:['cat','tagline'], note:'Nửa sans nửa khắc đá — nghiêm túc mà nhẹ.',
      local:['UTM Penumbra','UTMPenumbra'],
      rank:3, sub:"'EB Garamond'", tune:{ w:500, track:0.11, lh:1.22, caps:true } },

    /* ---------- SCRIPT ---------- */
    { id:'edwardian', utm:'UTM Edwardian', origin:'Edwardian Script', group:'script',
      roles:['name'], note:'Bay bướm mảnh mai — tên tiệm áo cưới, salon.',
      local:['UTM Edwardian','UTMEdwardian','UTM EdwardianScript'],
      rank:2, sub:"'Italianno'", tune:{ w:400, track:0.01, lh:1.3 } },

    { id:'wedding', utm:'UTM Wedding', origin:'script đám cưới', group:'script',
      roles:['name'], note:'Chữ thiệp cưới — studio, áo cưới, nhà hàng tiệc.',
      local:['UTM Wedding','UTMWedding'],
      rank:3, sub:"'Great Vibes'", tune:{ w:400, track:0.005, lh:1.32 } },

    { id:'silkscript', utm:'UTM Silk Script', origin:'script mảnh', group:'script',
      roles:['name'], note:'Nét chỉ mềm — spa, nail, mỹ phẩm.',
      local:['UTM Silk Script','UTMSilkScript','UTM SilkScript'],
      rank:2, sub:"'Allura'", tune:{ w:400, track:0.005, lh:1.3 } },

    { id:'fleur', utm:'UTM Fleur', origin:'script hoa văn', group:'script',
      roles:['name'], note:'Nhiều hoa văn — dùng dè, chỉ cho tên riêng.',
      local:['UTM Fleur','UTMFleur'],
      rank:3, sub:"'Mea Culpa'", tune:{ w:400, track:0.01, lh:1.34 } },

    { id:'aurora', utm:'UTM Aurora', origin:'script cổ điển', group:'script',
      roles:['name'], note:'Nghiêng đều, dễ đọc — tên chủ tiệm.',
      local:['UTM Aurora','UTMAurora'],
      rank:3, sub:"'Pinyon Script'", tune:{ w:400, track:0.01, lh:1.3 } },

    { id:'flamenco', utm:'UTM Flamenco', origin:'brush script', group:'script',
      roles:['name','tagline'], note:'Nét cọ nhanh — quán nhậu, hải sản.',
      local:['UTM Flamenco','UTMFlamenco'],
      rank:2, sub:"'Alex Brush'", tune:{ w:400, track:0.01, lh:1.28 } },

    { id:'sharnay', utm:'UTM Sharnay', origin:'script hiện đại', group:'script',
      roles:['name','tagline'], note:'Đậm và nghiêng — dễ đọc từ xa hơn script mảnh.',
      local:['UTM Sharnay','UTMSharnay'],
      rank:3, sub:"'Dancing Script'", tune:{ w:700, track:0.005, lh:1.24 } },

    { id:'cabaret', utm:'UTM Cabaret', origin:'script retro', group:'script',
      roles:['name'], note:'Kiểu bảng hiệu Sài Gòn xưa, nét đều dày.',
      local:['UTM Cabaret','UTMCabaret'],
      rank:3, sub:"'Lobster'", tune:{ w:400, track:0.005, lh:1.16 } },

    /* ---------- VIETNAMESE BRUSH / THƯ PHÁP ---------- */
    { id:'thuphap-thienan', utm:'UTM ThuPhap Thien An', origin:'thư pháp Việt', group:'brush',
      roles:['name'], note:'Thư pháp Việt — quán chay, trà, đồ gỗ, tranh.',
      local:['UTM ThuPhap Thien An','UTMThuPhapThienAn','UTM Thu Phap Thien An'],
      rank:2, sub:"'Charmonman'", tune:{ w:700, track:0.005, lh:1.3 } },

    { id:'thuphap-nhunguyet', utm:'UTM ThuPhap Nhu Nguyet', origin:'thư pháp Việt', group:'brush',
      roles:['name','tagline'], note:'Thư pháp nét mảnh, bay hơn Thiên Ân.',
      local:['UTM ThuPhap Nhu Nguyet','UTMThuPhapNhuNguyet'],
      rank:3, sub:"'Ephesis'", tune:{ w:400, track:0.01, lh:1.32 } },

    /* ---------- TECHNO ---------- */
    { id:'neosans', utm:'UTM Neo Sans', origin:'Neo Sans', group:'tech',
      roles:['name','cat'], note:'Bo góc vuông — tiệm sửa xe, điện thoại, karaoke.',
      local:['UTM Neo Sans','UTMNeoSans','UTM NeoSans'],
      rank:2, sub:"'Tektur'", tune:{ w:600, track:0.02, lh:1.12, caps:true } },

    { id:'bitsumishi', utm:'UTM Bitsumishi', origin:'Bitsumishi', group:'tech',
      roles:['name','cat'], note:'Vuông, nghiêng, "tốc độ" — gara, độ xe, game.',
      local:['UTM Bitsumishi','UTMBitsumishi','UTM BitsumishiPro'],
      rank:3, sub:"'Tektur'", tune:{ w:700, track:0.01, lh:1.1, caps:true } }
  ];

  var BY_ID = {};
  FACES.forEach(function (f) { BY_ID[f.id] = f; });

  /* ========================================================================
     TYPE RECIPES — which UTM face goes on which line, per shop category,
     plus the cap-height ratios measured off the reference photos.
     `hero` is the line that renders at 1.0; everything else is a fraction of
     it. See docs/typography-sizing-research.md §2 — there is no universal
     "name is biggest" rule, it depends on what is actually selling the shop.
     `order` overrides the stacking order when a shop puts its name somewhere
     other than under the category line — a barbershop's script name is a small
     flourish sitting ABOVE the dominant "HỚT TÓC NAM".
     ====================================================================== */
  var RECIPES = {
    'khach-san': { hero:'cat',  faces:{ cat:'bebas',      name:'helvetins',   tagline:'swiss721', footer:'helvetica'   },
                   scale:{ cat:1.00, name:0.93, tagline:0.70, footer:0.58 } },
    'nha-tro':   { hero:'cat',  faces:{ cat:'bebas',      name:'helvetica',   tagline:'swiss721', footer:'swiss721'    },
                   scale:{ cat:1.00, name:0.90, tagline:0.60, footer:0.66 } },
    'quan-com':  { hero:'cat',  faces:{ cat:'bebas',      name:'bebas',       tagline:'bebaskai', footer:'ericsson'    },
                   scale:{ cat:1.00, name:1.00, tagline:0.50, footer:0.40 } },
    'banh-mi':   { hero:'name', faces:{ cat:'bebas',      name:'cooper',      tagline:'bebaskai', footer:'swiss721'    },
                   scale:{ cat:0.80, name:1.00, tagline:0.50, footer:0.42 } },
    'ca-phe':    { hero:'name', faces:{ cat:'bebas',      name:'cabaret',     tagline:'centur',   footer:'bebaskai'    },
                   scale:{ cat:0.72, name:1.00, tagline:0.50, footer:0.42 } },
    'hot-toc':   { hero:'cat',  faces:{ cat:'helvetins',  name:'silkscript',  tagline:'bebaskai', footer:'swiss721'    },
                   scale:{ cat:1.00, name:0.46, tagline:0.42, footer:0.36 },
                   order:{ name:1, cat:2 } },
    'nail-spa':  { hero:'name', faces:{ cat:'centur',     name:'silkscript',  tagline:'caviar',   footer:'centur'      },
                   scale:{ cat:0.60, name:1.00, tagline:0.44, footer:0.38 } },
    'sua-xe':    { hero:'name', faces:{ cat:'bebas',      name:'bitsumishi',  tagline:'swiss721', footer:'helvetica'   },
                   scale:{ cat:0.70, name:1.00, tagline:0.46, footer:0.40 } },
    'sua-dt':    { hero:'name', faces:{ cat:'swiss721',   name:'neosans',     tagline:'facebook', footer:'facebook'    },
                   scale:{ cat:0.85, name:1.00, tagline:0.46, footer:0.40 } },
    'giat-ui':   { hero:'name', faces:{ cat:'bebas',      name:'avo',         tagline:'centur',   footer:'bebaskai'    },
                   scale:{ cat:0.80, name:1.00, tagline:0.50, footer:0.42 } },
    'cam-do':    { hero:'name', faces:{ cat:'banque',     name:'colossalis',  tagline:'swiss721', footer:'copperplate' },
                   scale:{ cat:0.62, name:1.00, tagline:0.44, footer:0.30 } },
    'bia-tuoi':  { hero:'name', faces:{ cat:'bebas',      name:'helvetins',   tagline:'swiss721', footer:'ericsson'    },
                   scale:{ cat:0.62, name:1.00, tagline:0.44, footer:0.25 } },
    'thuoc-tay': { hero:'name', faces:{ cat:'trajan',     name:'americansans',tagline:'centur',   footer:'bebaskai'    },
                   scale:{ cat:0.80, name:1.00, tagline:0.46, footer:0.40 } },
    'karaoke':   { hero:'name', faces:{ cat:'bebas',      name:'neosans',     tagline:'bebaskai', footer:'swiss721'    },
                   scale:{ cat:0.66, name:1.00, tagline:0.46, footer:0.40 } }
  };

  var GENERIC = { script:'cursive', brush:'cursive', serif:'serif',
                  slab:'serif', inscribed:'serif' };

  /* x-height / cap-height of an ordinary block sans. Used to convert a script's
     x-height into the equivalent cap height, so a script name and a block name
     set at the same nominal size read as the same size. */
  var X_OVER_CAP = 0.72;

  /* ========================================================================
     GENUINE UTM PICKUP — @font-face built from local() only.
     Nothing is downloaded and nothing is redistributed: this simply lets the
     browser use real UTM files if this machine already has them installed.
     ====================================================================== */
  function injectFontFaces() {
    var css = FACES.map(function (f) {
      var src = (f.local || [f.utm]).map(function (n) { return "local('" + n + "')"; }).join(', ');
      return "@font-face{font-family:'" + f.utm + "';src:" + src + ";font-display:swap;}";
    }).join('\n');
    var el = document.createElement('style');
    el.id = 'utm-genuine-faces';
    el.textContent = css;
    document.head.appendChild(el);
  }

  /* ========================================================================
     AVAILABILITY PROBE
     document.fonts.check() reports true for families that merely fall back, so
     we measure instead: if a family renders differently from all three generic
     families, something real resolved for it.
     ====================================================================== */
  var probeCanvas = document.createElement('canvas');
  var probeCtx = probeCanvas.getContext('2d');
  var PROBE_TEXT = 'MƯỜI EM HỚT TÓC 0123';
  var GENERICS = ['monospace', 'serif', 'sans-serif'];

  function textWidth(stack, text) {
    probeCtx.font = '72px ' + stack;
    return probeCtx.measureText(text || PROBE_TEXT).width;
  }

  var availCache = {};
  function isAvailable(family, bust) {
    if (!bust && family in availCache) return availCache[family];
    var quoted = "'" + family + "'";
    var ok = GENERICS.every(function (g) {
      return Math.abs(textWidth(quoted + ',' + g) - textWidth(g)) > 0.5;
    });
    availCache[family] = ok;
    return ok;
  }

  /* ========================================================================
     CAP-HEIGHT METRICS — size text the way a sign painter does.
     ====================================================================== */
  var capCache = {};
  function metrics(stack) {
    if (stack in capCache) return capCache[stack];
    probeCtx.font = '100px ' + stack;
    var cap = (probeCtx.measureText('H').actualBoundingBoxAscent || 70) / 100;
    var x   = (probeCtx.measureText('x').actualBoundingBoxAscent || 50) / 100;
    if (!isFinite(cap) || cap <= 0.05) cap = 0.70;
    if (!isFinite(x) || x <= 0.05) x = cap * X_OVER_CAP;
    var m = { cap: cap, x: x };
    capCache[stack] = m;
    return m;
  }
  function capRatio(stack) { return metrics(stack).cap; }

  /* The ratio to normalise on. All-caps lines are matched on cap height, the way
     a sign painter sets them. Mixed-case lines — every script and brush face —
     are matched on x-height instead, because that is what the eye reads as size;
     normalising a swashed script on its capital H makes it render far too small.
     Clamped so a strange glyph outline can never produce an absurd size. */
  function normRatio(stack, caps) {
    var m = metrics(stack);
    var r = caps ? m.cap : (m.x / X_OVER_CAP);
    return Math.min(0.95, Math.max(0.35, r));
  }

  /* ========================================================================
     PUBLIC API
     ====================================================================== */
  function face(id) { return BY_ID[id] || BY_ID.bebas; }

  /* Full CSS stack: genuine UTM first, tuned substitute second, and always a
     Vietnamese-complete face last so no diacritic can go missing. */
  function stackFor(id) {
    var f = face(id);
    var parts = ["'" + f.utm + "'"];
    if (parts.indexOf(f.sub) === -1) parts.push(f.sub);
    if (parts.indexOf(VN_SAFETY) === -1) parts.push(VN_SAFETY);
    parts.push(GENERIC[f.group] || 'sans-serif');
    return parts.join(', ');
  }

  function isGenuine(id) { return isAvailable(face(id).utm); }

  /* Size + style one element for a given face at a target CAP HEIGHT in px. */
  function applyFace(el, id, capPx, override) {
    var f = face(id);
    var t = Object.assign({}, f.tune, override || {});
    var stack = stackFor(id);
    var size = (capPx / normRatio(stack, !!t.caps)) * (t.opt || 1);

    el.style.fontFamily = stack;
    el.style.fontWeight = t.w || 400;
    el.style.fontSize = size.toFixed(2) + 'px';
    el.style.lineHeight = (t.lh || 1.1).toString();
    el.style.letterSpacing = ((t.track || 0) * size).toFixed(2) + 'px';
    el.style.textTransform = t.caps ? 'uppercase' : 'none';
    el.style.fontStyle = 'normal';   /* never synthesise oblique: it skews the letterform */
    el.style.fontVariationSettings = t.wdth ? "'wdth' " + t.wdth : 'normal';
    el.style.transform = t.sx ? 'scaleX(' + t.sx + ')' : '';
    el.dataset.utmFace = id;
    return size;
  }

  /* ========================================================================
     DROP-IN LOADER — the user's own UTM files, kept in this browser only.
     ====================================================================== */
  var DB_NAME = 'utm-fonts', STORE = 'files', dbp = null;
  function db() {
    if (dbp) return dbp;
    dbp = new Promise(function (res, rej) {
      var rq = indexedDB.open(DB_NAME, 1);
      rq.onupgradeneeded = function () { rq.result.createObjectStore(STORE); };
      rq.onsuccess = function () { res(rq.result); };
      rq.onerror = function () { rej(rq.error); };
    });
    return dbp;
  }
  function dbPut(key, val) {
    return db().then(function (d) {
      return new Promise(function (res, rej) {
        var tx = d.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).put(val, key);
        tx.oncomplete = res; tx.onerror = function () { rej(tx.error); };
      });
    });
  }
  function dbAll() {
    return db().then(function (d) {
      return new Promise(function (res, rej) {
        var tx = d.transaction(STORE, 'readonly'), out = [];
        var cur = tx.objectStore(STORE).openCursor();
        cur.onsuccess = function () {
          var c = cur.result;
          if (c) { out.push(c.value); c.continue(); } else { res(out); }
        };
        cur.onerror = function () { rej(cur.error); };
      });
    }).catch(function () { return []; });
  }
  function dbClear() {
    return db().then(function (d) {
      return new Promise(function (res) {
        var tx = d.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).clear();
        tx.oncomplete = res; tx.onerror = res;
      });
    }).catch(function () {});
  }

  function norm(s) { return String(s).toLowerCase().replace(/[^a-z0-9]/g, ''); }

  /* Map a dropped filename onto a catalog entry: "UTMBebas.ttf" -> UTM Bebas */
  function matchFace(filename) {
    var base = norm(filename.replace(/\.[a-z0-9]+$/i, ''));
    var best = null, bestLen = 0;
    FACES.forEach(function (f) {
      (f.local || []).concat([f.utm]).forEach(function (alias) {
        var a = norm(alias);
        if (a && base.indexOf(a) !== -1 && a.length > bestLen) { best = f; bestLen = a.length; }
      });
    });
    return best;
  }

  var listeners = [];
  function emit() { listeners.forEach(function (fn) { try { fn(); } catch (e) {} }); }
  function changed() { availCache = {}; capCache = {}; emit(); }

  function registerBuffer(filename, buf) {
    var f = matchFace(filename);
    var family = f ? f.utm : filename.replace(/\.[a-z0-9]+$/i, '');
    var ff = new FontFace(family, buf);
    return ff.load().then(function (loaded) {
      document.fonts.add(loaded);
      return { family: family, matched: !!f, id: f && f.id, file: filename };
    });
  }

  /* Accept a FileList / array of File from a picker or a drag-drop. */
  function adoptFiles(files) {
    var jobs = Array.prototype.map.call(files, function (file) {
      if (!/\.(ttf|otf|woff2?)$/i.test(file.name)) return Promise.resolve(null);
      return file.arrayBuffer().then(function (buf) {
        return registerBuffer(file.name, buf.slice(0)).then(function (r) {
          return dbPut(file.name, { name: file.name, buf: buf }).then(function () { return r; });
        });
      }).catch(function () { return { family: file.name, matched: false, error: true, file: file.name }; });
    });
    return Promise.all(jobs).then(function (rs) {
      var ok = rs.filter(Boolean);
      changed();
      return ok;
    });
  }

  function restore() {
    return dbAll().then(function (recs) {
      return Promise.all(recs.map(function (r) {
        return registerBuffer(r.name, r.buf.slice(0)).catch(function () { return null; });
      }));
    }).then(function (rs) {
      var ok = rs.filter(Boolean);
      if (ok.length) changed();
      return ok;
    });
  }

  /* Optional fonts/manifest.json: {"files":["UTM Bebas.ttf", ...]} */
  function loadManifest(dir) {
    dir = dir || 'fonts/';
    return fetch(dir + 'manifest.json').then(function (r) {
      if (!r.ok) throw new Error('no manifest');
      return r.json();
    }).then(function (j) {
      return Promise.all((j.files || []).map(function (name) {
        return fetch(dir + name).then(function (r) { return r.arrayBuffer(); })
          .then(function (b) { return registerBuffer(name, b); })
          .catch(function () { return null; });
      }));
    }).then(function (rs) {
      var ok = (rs || []).filter(Boolean);
      if (ok.length) changed();
      return ok;
    }).catch(function () { return []; });
  }

  function report() {
    var genuine = FACES.filter(function (f) { return isAvailable(f.utm); });
    return { total: FACES.length, genuine: genuine.length,
             genuineIds: genuine.map(function (f) { return f.id; }) };
  }

  function init() {
    injectFontFaces();
    var subs = {};
    FACES.forEach(function (f) { subs[f.sub] = 1; });
    var loads = Object.keys(subs).map(function (fam) {
      return document.fonts.load('900 100px ' + fam, PROBE_TEXT).catch(function () {});
    });
    return Promise.all(loads)
      .then(function () { return restore(); })
      .then(function () { return loadManifest(); })
      .then(function () { changed(); return report(); });
  }

  global.UTM = {
    faces: FACES, groups: GROUPS, recipes: RECIPES, byId: BY_ID,
    face: face, stackFor: stackFor, isGenuine: isGenuine, applyFace: applyFace,
    capRatio: capRatio, metrics: metrics, normRatio: normRatio,
    report: report, init: init,
    adoptFiles: adoptFiles, clearDropIns: function () { return dbClear().then(changed); },
    onchange: function (fn) { listeners.push(fn); },
    facesFor: function (role) {
      return FACES.filter(function (f) { return f.roles.indexOf(role) !== -1; });
    }
  };
})(window);
