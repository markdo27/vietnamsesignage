/* ============================================================================
   SÀI GÒN 1985  —  bộ font bảng hiệu Sài Gòn xưa
   ----------------------------------------------------------------------------
   Ten faces drawn by Thái Hiếu (fontzin.com · fb.com/thaihieufz), each traced
   off a surviving Saigon shopfront: CHỈ SƠN, HIỀN KHÁNH, HỒNG KÝ, PHÁT TÀI,
   CỬA HÀNG 99, and the Sàigòn 1985 brush logotype. Free for commercial use,
   resale forbidden — so the files live in the gitignored fonts/ folder and are
   loaded from there, never committed and never redistributed by this repo.

   This module exposes the same surface as js/utm-fonts.js (face / facesFor /
   applyFace / recipes / report / init / onchange), so the wall can swap between
   the two type systems without knowing anything about either.

   Unlike the UTM system there is nothing to substitute: these are the real
   faces, with the complete 134-character Vietnamese repertoire in every one.
   The web-safe stacks are only a parachute for a checkout with no fonts/ folder.
   ========================================================================== */
(function (global) {
  'use strict';

  var DIR = 'fonts/saigon1985/';
  var X_OVER_CAP = 0.72;

  /* --- groups ------------------------------------------------------------ */
  var GROUPS = {
    poster:  { vi: 'Khối đậm – chữ bảng lớn', en: 'Poster caps' },
    grotesk: { vi: 'Chữ khối kẻ tay',         en: 'Painted grotesque' },
    condensed: { vi: 'Nén – chữ phụ',         en: 'Condensed' },
    script:  { vi: 'Viết tay – chữ bay',      en: 'Brush script' }
  };

  /* --- the ten faces -----------------------------------------------------
     `w` is the average cap advance measured off the outlines: it is what makes
     a face a headline or a supporting line, so the recipes below lean on it.
     `tune` follows the UTM system's shape — caps, tracking, optical nudge. */
  var FACES = [
    { id: 'phattai', utm: 'SG85 Phát Tài', file: 'PHAT TAI.ttf', group: 'poster', w: 0.85,
      sub: "'Alfa Slab One'", roles: ['name'], note: 'Bảng hiệu vải Phát Tài — chữ béo, bảng lớn',
      tune: { caps: true, track: 0.005, lh: 0.95 } },

    { id: 'chison1', utm: 'SG85 Chỉ Sơn 1', file: 'CHI SON 1.ttf', group: 'grotesk', w: 0.75,
      sub: "'Anton'", roles: ['cat', 'name'], note: 'Cơ sở sản xuất Chỉ Sơn — chữ khối rộng',
      tune: { caps: true, track: 0.012, lh: 0.98 } },

    { id: 'hongky1', utm: 'SG85 Hồng Ký 1', file: 'HONG KY 1.ttf', group: 'poster', w: 0.67,
      sub: "'Bevan'", roles: ['cat', 'name'], note: 'Hồng Ký Mì Gia — chữ vuông có viền',
      tune: { caps: true, track: 0.01, lh: 0.98 } },

    { id: 'hienkhanh3', utm: 'SG85 Hiền Khánh 3', file: 'HIEN KHANH 3.ttf', group: 'grotesk', w: 0.54,
      sub: "'Archivo'", roles: ['cat', 'name', 'tagline'], note: 'Hiền Khánh — sans kẻ tay',
      tune: { caps: true, track: 0.014, lh: 1.0 } },

    { id: 'chison2', utm: 'SG85 Chỉ Sơn 2', file: 'CHI SON 2.ttf', group: 'grotesk', w: 0.50,
      sub: "'Archivo'", roles: ['cat', 'tagline', 'footer'], note: 'Dòng phụ của bảng Chỉ Sơn',
      tune: { caps: true, track: 0.016, lh: 1.02 } },

    { id: 'hongky2', utm: 'SG85 Hồng Ký 2', file: 'HONG KY 2.ttf', group: 'grotesk', w: 0.45,
      sub: "'Saira Condensed'", roles: ['cat', 'tagline', 'footer'], note: 'Hồng Ký nghiêng — dòng món ăn',
      tune: { caps: true, track: 0.014, lh: 1.02 } },

    { id: 'hienkhanh2', utm: 'SG85 Hiền Khánh 2', file: 'HIEN KHANH 2.ttf', group: 'condensed', w: 0.42,
      sub: "'Oswald'", roles: ['cat', 'tagline', 'footer'], note: 'Nén — dòng địa chỉ, số nhà',
      tune: { caps: true, track: 0.018, lh: 1.04 } },

    { id: 'cuahang', utm: 'SG85 Cửa Hàng', file: 'SG85-CUA HANG.ttf', group: 'condensed', w: 0.30,
      sub: "'Saira Condensed'", roles: ['tagline', 'footer'], note: 'Cửa Hàng 99 — dòng chi tiết rất nén',
      tune: { caps: true, track: 0.02, lh: 1.06 } },

    { id: 'saigon1985', utm: 'SG85 Sàigòn 1985', file: 'SAIGON1985.ttf', group: 'script', w: 0.70,
      sub: "'Lobster'", roles: ['name'], note: 'Chữ ký bảng hiệu — nét cọ nối liền',
      tune: { track: -0.005, lh: 1.06, opt: 1.02 } },

    { id: 'hienkhanh1', utm: 'SG85 Hiền Khánh 1', file: 'HIEN KHANH 1.ttf', group: 'script', w: 0.62,
      sub: "'Dancing Script'", roles: ['name', 'tagline'], note: 'Chữ nghiêng bay — tên tiệm, câu rao',
      tune: { track: 0, lh: 1.05 } }
  ];

  var BY_ID = {};
  FACES.forEach(function (f) { BY_ID[f.id] = f; });

  /* ========================================================================
     TYPE RECIPES — the same categories and cap-height ratios the UTM system
     uses (measured off reference photos, see docs/typography-sizing-research),
     re-cast in the 1985 faces. The pairing rule throughout: one wide face
     carries the shout, a narrow one carries the detail.
     ====================================================================== */
  var RECIPES = {
    'khach-san': { hero: 'cat',  faces: { cat: 'chison1', name: 'hienkhanh3', tagline: 'hienkhanh2', footer: 'cuahang' },
                   scale: { cat: 1.00, name: 0.62, tagline: 0.46, footer: 0.42 } },
    'nha-tro':   { hero: 'cat',  faces: { cat: 'chison2', name: 'phattai', tagline: 'hienkhanh2', footer: 'cuahang' },
                   scale: { cat: 1.00, name: 0.68, tagline: 0.44, footer: 0.46 } },
    'quan-com':  { hero: 'cat',  faces: { cat: 'chison1', name: 'phattai', tagline: 'hongky2', footer: 'cuahang' },
                   scale: { cat: 0.50, name: 1.00, tagline: 0.42, footer: 0.40 } },
    'banh-mi':   { hero: 'name', faces: { cat: 'hienkhanh2', name: 'phattai', tagline: 'hongky2', footer: 'cuahang' },
                   scale: { cat: 0.46, name: 1.00, tagline: 0.44, footer: 0.40 } },
    'ca-phe':    { hero: 'name', faces: { cat: 'hienkhanh2', name: 'saigon1985', tagline: 'hienkhanh3', footer: 'cuahang' },
                   scale: { cat: 0.44, name: 1.00, tagline: 0.44, footer: 0.40 } },
    'hot-toc':   { hero: 'cat',  faces: { cat: 'chison1', name: 'hienkhanh1', tagline: 'hienkhanh2', footer: 'cuahang' },
                   scale: { cat: 1.00, name: 0.48, tagline: 0.42, footer: 0.38 },
                   order: { name: 1, cat: 2 } },
    'nail-spa':  { hero: 'name', faces: { cat: 'hienkhanh2', name: 'saigon1985', tagline: 'cuahang', footer: 'hienkhanh2' },
                   scale: { cat: 0.42, name: 1.00, tagline: 0.42, footer: 0.38 } },
    'sua-xe':    { hero: 'name', faces: { cat: 'chison2', name: 'hongky1', tagline: 'hienkhanh2', footer: 'cuahang' },
                   scale: { cat: 0.46, name: 1.00, tagline: 0.44, footer: 0.40 } },
    'sua-dt':    { hero: 'name', faces: { cat: 'hienkhanh2', name: 'chison1', tagline: 'cuahang', footer: 'cuahang' },
                   scale: { cat: 0.48, name: 1.00, tagline: 0.42, footer: 0.40 } },
    'giat-ui':   { hero: 'name', faces: { cat: 'chison2', name: 'hienkhanh3', tagline: 'hienkhanh2', footer: 'cuahang' },
                   scale: { cat: 0.48, name: 1.00, tagline: 0.44, footer: 0.40 } },
    'cam-do':    { hero: 'name', faces: { cat: 'hienkhanh2', name: 'phattai', tagline: 'hienkhanh3', footer: 'cuahang' },
                   scale: { cat: 0.44, name: 1.00, tagline: 0.42, footer: 0.36 } },
    'bia-tuoi':  { hero: 'name', faces: { cat: 'chison2', name: 'hongky1', tagline: 'hienkhanh2', footer: 'cuahang' },
                   scale: { cat: 0.44, name: 1.00, tagline: 0.42, footer: 0.36 } },
    'thuoc-tay': { hero: 'name', faces: { cat: 'hienkhanh3', name: 'chison1', tagline: 'hienkhanh2', footer: 'cuahang' },
                   scale: { cat: 0.50, name: 1.00, tagline: 0.42, footer: 0.40 } },
    'karaoke':   { hero: 'name', faces: { cat: 'hienkhanh2', name: 'saigon1985', tagline: 'hongky2', footer: 'cuahang' },
                   scale: { cat: 0.44, name: 1.00, tagline: 0.42, footer: 0.40 } }
  };

  var GENERIC = { script: 'cursive', poster: 'serif', grotesk: 'sans-serif', condensed: 'sans-serif' };

  /* ========================================================================
     LOADING — FontFace so each file reports success or failure on its own.
     ====================================================================== */
  var loaded = {}, listeners = [], started = false;

  function emit() { listeners.forEach(function (fn) { try { fn(); } catch (e) {} }); }

  function init() {
    if (started) return Promise.resolve(report());
    started = true;
    var jobs = FACES.map(function (f) {
      var face = new FontFace(f.utm, 'url("' + encodeURI(DIR + f.file) + '")');
      return face.load().then(function (ok) {
        document.fonts.add(ok);
        loaded[f.id] = true;
      }).catch(function () { loaded[f.id] = false; });
    });
    return Promise.all(jobs).then(function () {
      capCache = {};          /* metrics measured before load are meaningless */
      emit();
      return report();
    });
  }

  function report() {
    var have = FACES.filter(function (f) { return loaded[f.id]; });
    return { total: FACES.length, genuine: have.length,
             missing: FACES.filter(function (f) { return !loaded[f.id]; }).map(function (f) { return f.utm; }) };
  }

  /* ========================================================================
     METRICS — cap height measured off whatever actually resolved, so a line
     keeps its size on the board even when a face fails to load.
     ====================================================================== */
  var probeCtx = document.createElement('canvas').getContext('2d');
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

  function normRatio(stack, caps) {
    var m = metrics(stack);
    var r = caps ? m.cap : (m.x / X_OVER_CAP);
    return Math.min(0.95, Math.max(0.35, r));
  }

  /* ========================================================================
     PUBLIC API — deliberately identical to window.UTM
     ====================================================================== */
  function face(id) { return BY_ID[id] || BY_ID.chison1; }

  function stackFor(id) {
    var f = face(id);
    return ["'" + f.utm + "'", f.sub, "'Be Vietnam Pro'", GENERIC[f.group] || 'sans-serif'].join(', ');
  }

  function isGenuine(id) { return !!loaded[face(id).id]; }

  function applyFace(el, id, capPx, override) {
    var f = face(id);
    var t = Object.assign({}, f.tune, override || {});
    if (f.group === 'script') t.caps = false; // Rule: All the script fonts do not write in ALL CAP
    var stack = stackFor(id);
    var size = (capPx / normRatio(stack, !!t.caps)) * (t.opt || 1);

    el.style.fontFamily = stack;
    el.style.fontWeight = t.w || 400;
    el.style.fontSize = size.toFixed(2) + 'px';
    el.style.lineHeight = (t.lh || 1.1).toString();
    el.style.letterSpacing = ((t.track || 0) * size).toFixed(2) + 'px';
    el.style.textTransform = t.caps ? 'uppercase' : 'none';
    el.style.fontStyle = 'normal';   /* never synthesise oblique: it skews the letterform */
    el.style.fontVariationSettings = 'normal';
    el.style.transform = t.sx ? 'scaleX(' + t.sx + ')' : '';
    el.dataset.sgFace = id;
    return size;
  }

  global.SG85 = {
    id: 'sg85',
    faces: FACES, groups: GROUPS, recipes: RECIPES, byId: BY_ID,
    face: face, stackFor: stackFor, isGenuine: isGenuine, applyFace: applyFace,
    metrics: metrics, normRatio: normRatio, report: report, init: init,
    credit: 'Bộ font Sài Gòn Xưa — Thái Hiếu (fontzin.com). Miễn phí cho cả mục đích thương mại, cấm bán lại.',
    onchange: function (fn) { listeners.push(fn); },
    facesFor: function (role) {
      return FACES.filter(function (f) { return f.roles.indexOf(role) !== -1; });
    }
  };
})(window);
