// ==UserScript==
// @name         Muse Web - Custom UI (Giao su Ncn)
// @namespace    muse.custom.ui
// @version      0.4.9
// @description  Tang chieu rong chat, doi font tieng Viet, them background cho muse.ai - bang chinh do den nen 3 khu + font/co chu/mau chu chat, nut mo bang co the an duoc
// @author       Ncn
// @license      MIT
// @match        https://muse.ai/*
// @updateURL    https://raw.githubusercontent.com/NguyeZcom/muse-userscripts/main/muse-custom-ui.user.js
// @downloadURL  https://raw.githubusercontent.com/NguyeZcom/muse-userscripts/main/muse-custom-ui.user.js
// (Tampermonkey doc 2 dong tren de tu check update: moi lan MÚ day
//  ban moi len GitHub (tang version) la Tampermonkey tu bao update,
//  khong can copy paste tay nua. Greasy Fork cung sync tu chinh link
//  raw nay.)
// @icon         https://muse.ai/files/1396505040209857/4228946234062070/ttbvuylwctrmo6sd36mlq13n/mu-logo.jpg
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @run-at       document-start
// ==/UserScript==

(function () {
  'use strict';

  /* ============================================================
     CHINH NHANH O DAY
     - CHAT_WIDTH : chieu rong cot chat, vd '1100px', '90vw', 'none'
     - FONT_NAME  : font muon dung, nen dung font ho tro tieng Viet tot
     - BG_IMAGE   : CHI dung khi muon dung link anh http(s) truc tiep,
                    vd 'https://i.imgur.com/xxxx.jpg'. De trong '' neu
                    dung cach chon file o may (khuyen dung).
     - BG_OPACITY : do ro cua anh nen. Tu 0.4.2 anh nen hien 100% (1),
                    khong dung do mo de lam mo anh nua - vi do mo tren
                    nen trang moi la thu gay ra lop trang sua nhu anh.
     - BG_DARK_OVERLAY : lop den phu len anh nen, 0.3 = den 30% theo
                    yeu cau cua Giao su (07/11/2026). Tang len 0.4-0.5
                    neu muon toi hon, giam xuong 0.15-0.2 neu muon sang hon.
     - LEFT_BG_ALPHA / RIGHT_BG_ALPHA : nen den mac dinh cua thanh
                    trai / thanh phai, 0.3 = den 30% (07/11/2026).
     - CHAT_BG_ALPHA : nen den mac dinh cua tung doan chat o cot giua,
                    0.4 (tang tu 0.2 vi Giao su bao 0.2 qua it den,
                    07/11/2026). Giu nguyen mau goc (bong bong xanh cua
                    Giao su van xanh, chi mo di).
     Cac so tren chi la mac dinh lan dau - tu 0.4.7 Giao su keo truot
     trong bang "Do den nen Muse" (nut ⚙️ goc duoi trai) de doi truc
     tiep, gia tri duoc luu lai dung mai, khong can sua file nua.
     ============================================================ */
  const CONFIG = {
    CHAT_WIDTH: 'var(--container-5xl, 64rem)', // 3xl = 48rem/768px -> 5xl = 64rem/1024px
    FONT_NAME: "'Be Vietnam Pro', 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
    BG_IMAGE: '', // KHONG dung file:/// nua - Chrome chan trang https nap file tu o cung
    BG_OPACITY: 1,
    BG_DARK_OVERLAY: 0.3,
    LEFT_BG_ALPHA: 0.3,
    RIGHT_BG_ALPHA: 0.3,
    CHAT_BG_ALPHA: 0.4,
  };
  const BG_KEY = 'mu_bg_dataurl';

  /* Do den hien tai cua 4 lop, luu rieng tung muc bang GM_setValue
     de keo truot xong tai lai trang van giu nguyen. */
  const ALPHA_KEYS = {
    left: 'mu_bg_left_alpha',
    chat: 'mu_bg_chat_alpha',
    right: 'mu_bg_right_alpha',
    overlay: 'mu_bg_overlay_alpha',
  };
  function loadAlpha(key, def) {
    const v = parseFloat(GM_getValue(ALPHA_KEYS[key], ''));
    return isNaN(v) ? def : Math.min(0.9, Math.max(0, v));
  }
  const ALPHAS = {
    left: loadAlpha('left', CONFIG.LEFT_BG_ALPHA),
    chat: loadAlpha('chat', CONFIG.CHAT_BG_ALPHA),
    right: loadAlpha('right', CONFIG.RIGHT_BG_ALPHA),
    overlay: loadAlpha('overlay', CONFIG.BG_DARK_OVERLAY),
  };
  function saveAlphas() {
    try {
      GM_setValue(ALPHA_KEYS.left, String(ALPHAS.left));
      GM_setValue(ALPHA_KEYS.chat, String(ALPHAS.chat));
      GM_setValue(ALPHA_KEYS.right, String(ALPHAS.right));
      GM_setValue(ALPHA_KEYS.overlay, String(ALPHAS.overlay));
    } catch (e) { /* luu that bai thi chi dung tam trong phien nay */ }
  }

  /* Cai dat font chat: font, co chu, mau chu - luu rieng, keo/chon
     xong doi ngay, tai lai trang van giu. */
  const FONT_OPTIONS = [
    { label: 'Be Vietnam Pro', value: "'Be Vietnam Pro', 'Inter', system-ui, sans-serif" },
    { label: 'Inter', value: "'Inter', system-ui, sans-serif" },
    { label: 'Roboto', value: "'Roboto', system-ui, sans-serif" },
    { label: 'Open Sans', value: "'Open Sans', system-ui, sans-serif" },
    { label: 'Noto Sans', value: "'Noto Sans', system-ui, sans-serif" },
    { label: 'Hệ thống', value: "system-ui, -apple-system, 'Segoe UI', sans-serif" },
    { label: 'Arial', value: "Arial, sans-serif" },
  ];
  const FONT_SETTINGS = {
    family: GM_getValue('mu_font_family', FONT_OPTIONS[0].value),
    size: parseInt(GM_getValue('mu_font_size', '16'), 10) || 16,
    color: GM_getValue('mu_font_color', '#f5f5f5'),
  };
  function saveFontSettings() {
    try {
      GM_setValue('mu_font_family', FONT_SETTINGS.family);
      GM_setValue('mu_font_size', String(FONT_SETTINGS.size));
      GM_setValue('mu_font_color', FONT_SETTINGS.color);
    } catch (e) { /* luu that bai thi chi dung tam trong phien nay */ }
  }
  // Ghi de font/co chu/mau chu cua cot chat bang 1 the style rieng,
  // de doi ngay ca voi tin nhan moi nap sau. Luat nay dung sau
  // GM_addStyle o tren nen thang khi cung do uu tien.
  function applyFontSettings() {
    let style = document.getElementById('mu-font-style');
    if (!style) {
      style = document.createElement('style');
      style.id = 'mu-font-style';
      (document.head || document.documentElement).appendChild(style);
    }
    style.textContent =
      '[data-hatch-chat-column="true"], [data-hatch-chat-column="true"] * { font-family: ' + FONT_SETTINGS.family + ' !important; }\n' +
      '[data-hatch-chat-column="true"] * { font-size: ' + FONT_SETTINGS.size + 'px !important; }\n' +
      '[data-hatch-chat-column="true"] [role="log"], [data-hatch-chat-column="true"] [role="log"] *:not(a):not(button):not(code):not(pre) { color: ' + FONT_SETTINGS.color + ' !important; }';
  }

  // Nap font tu Google Fonts (neu muon bo, xoa dong nay)
  const fontLink = document.createElement('link');
  fontLink.rel = 'stylesheet';
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Roboto:wght@400;500;700&family=Open+Sans:wght@400;600;700&family=Noto+Sans:wght@400;600;700&display=swap';
  (document.head || document.documentElement).appendChild(fontLink);

  GM_addStyle(`
    /* 1) DOI FONT TOAN TRANG - giup dau tieng Viet deu, khong lech font fallback */
    html, body, input, textarea, button, select,
    [data-hatch-chat-column="true"],
    [data-hatch-chat-column="true"] * {
      font-family: ${CONFIG.FONT_NAME} !important;
    }
    /* Rieng code van giu font monospace */
    code, pre, kbd, samp,
    [data-hatch-chat-column="true"] code,
    [data-hatch-chat-column="true"] pre {
      font-family: ui-monospace, 'JetBrains Mono', Menlo, Consolas, monospace !important;
    }

    /* 2) TANG CHIEU RONG COT CHAT - selector chinh xac tu HTML that cua Muse Web */
    [data-hatch-chat-column="true"] {
      max-width: ${CONFIG.CHAT_WIDTH} !important;
    }

    /* Lop phu rong cho cac container pho bien cua SPA */
    main,
    main > div,
    [class*="chat-container"],
    [class*="ChatContainer"],
    [class*="conversation"],
    [class*="Conversation"] {
      max-width: ${CONFIG.CHAT_WIDTH} !important;
    }

    /* Neu cot chat bi gioi han bang CSS variable thi ghi de bien do (thu cac ten bien hay gap) */
    :root {
      --chat-max-width: ${CONFIG.CHAT_WIDTH} !important;
      --content-max-width: ${CONFIG.CHAT_WIDTH} !important;
      --max-content-width: ${CONFIG.CHAT_WIDTH} !important;
    }

    /* 3) BACKGROUND - lop nen do JS tao, khong dung body::before nua.
       Cho cac lop boc ngoai cot chat thanh trong suot, neu khong anh nen
       se bi nen duc cua app che mat. */
    /* html/body PHAI trong suot - day la loi cua 0.4.5: MÚ doi nen
       body sang den de cho khuat thanh trang, nhung nen cua body
       (khoi khong dinh vi) ve SAU lop anh o z-index -1 nen no che
       kin anh nen, ca trang thanh 1 cuc den. Trong suot thi lop anh
       moi lo ra duoc. */
    html, body { background-color: transparent !important; }
    :is(div, main, section, aside):has([data-hatch-chat-column="true"]),
    [data-hatch-chat-column="true"],
    [role="log"] {
      background-color: transparent !important;
    }
    /* 2 thanh 2 ben (rail icon + danh sach chat ben trai, panel trang
       thai ben phai) la ANH EM cua cot chat, khong phai to tien cua no,
       nen luat :has() o tren khong dong toi chung. Tu 0.4.5 chung duoc
       nen den 30% (khong trong suot han nua) theo yeu cau 07/11/2026.
       Phan tu con nho ben trong (nut, muc chat...) khong bi anh huong. */
    nav, aside,
    [class*="sidebar"], [class*="Sidebar"],
    [class*="side-panel"], [class*="sidepanel"] {
      background-color: rgba(0, 0, 0, 0.3) !important;
    }
    /* Thanh cuon toi, khong de trang */
    ::-webkit-scrollbar { width: 8px !important; height: 8px !important; }
    ::-webkit-scrollbar-track { background: transparent !important; }
    ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.25) !important; border-radius: 4px !important; }
    #mu-bg-layer {
      position: fixed !important;
      inset: 0 !important;
      background-size: cover !important;
      background-position: center !important;
      background-repeat: no-repeat !important;
      pointer-events: none !important;
      z-index: -1 !important;
    }
    /* Lop den phu len anh nen (30%), nam GIUA anh nen va noi dung app.
       Thu tu xep lop: anh nen (z -1) < lop den (z 0) < noi dung app (z 1)
       nen chu va nut khong bi toi theo - chi co anh nen toi di. */
    #mu-bg-overlay {
      position: fixed !important;
      inset: 0 !important;
      pointer-events: none !important;
      z-index: 0 !important;
    }
    /* Day RIENG khung app chinh len tren lop den. Ban 0.4.2-0.4.4 dung
       luat body > * nen vo tinh doi ca position cua cac hop thoai /
       tooltip ma Muse gan truc tiep vao body (vd menu hien khi re
       chuot rail icon trai): position:fixed cua chung bi ep thanh
       relative, roi xuong dong thanh 2 thanh trang o duoi va ben phai,
       giat hinh. Tu 0.4.5 chi doi khung chua cot chat, cac phan tu
       gan vao body khac duoc de yen. */
    body > div:has([data-hatch-chat-column="true"]) {
      position: relative !important;
      z-index: 1 !important;
    }
    /* Bang truot do den nen: nut mo o goc duoi trai, bang hien len tren */
    #mu-bg-panel-btn {
      position: fixed !important;
      left: 16px !important;
      bottom: 16px !important;
      z-index: 100000 !important;
      padding: 8px 14px !important;
      border-radius: 999px !important;
      border: 1px solid rgba(255,255,255,0.25) !important;
      background: rgba(0,0,0,0.8) !important;
      color: #fff !important;
      font: 600 13px/1.4 system-ui, sans-serif !important;
      cursor: pointer !important;
      box-shadow: 0 4px 16px rgba(0,0,0,0.3) !important;
    }
    #mu-bg-panel {
      position: fixed !important;
      left: 16px !important;
      bottom: 64px !important;
      z-index: 100001 !important;
      width: 250px !important;
      padding: 12px 14px !important;
      border-radius: 12px !important;
      background: rgba(0,0,0,0.88) !important;
      color: #fff !important;
      font: 500 13px/1.5 system-ui, sans-serif !important;
      box-shadow: 0 8px 24px rgba(0,0,0,0.4) !important;
    }
    #mu-bg-panel input[type="range"] { width: 100% !important; accent-color: #4ade80 !important; }
    #mu-bg-pick-btn {
      position: fixed !important;
      right: 16px !important;
      bottom: 16px !important;
      z-index: 99999 !important;
      padding: 8px 14px !important;
      border-radius: 999px !important;
      border: 1px solid rgba(0,0,0,0.2) !important;
      background: #fff !important;
      color: #111 !important;
      font: 600 13px/1.4 system-ui, sans-serif !important;
      cursor: pointer !important;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2) !important;
    }
    #mu-bg-status {
      position: fixed !important;
      left: 50% !important;
      bottom: 20px !important;
      transform: translateX(-50%) !important;
      z-index: 100000 !important;
      padding: 10px 16px !important;
      border-radius: 8px !important;
      background: rgba(0,0,0,0.85) !important;
      color: #fff !important;
      font: 600 13px/1.4 system-ui, sans-serif !important;
      pointer-events: none !important;
      max-width: 90vw !important;
      white-space: pre-wrap !important;
    }
  `);

  /* ---------- Anh nen: chon file 1 lan, luu lai dung mai ---------- */
  let statusTimer;
  function showStatus(msg) {
    console.log('[Muse BG]', msg);
    let el = document.getElementById('mu-bg-status');
    if (!el) {
      el = document.createElement('div');
      el.id = 'mu-bg-status';
      (document.body || document.documentElement).appendChild(el);
    }
    el.textContent = msg;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => { const s = document.getElementById('mu-bg-status'); if (s) s.remove(); }, 6000);
  }

  function applyBackground(url) {
    if (!url) return;
    const old = document.getElementById('mu-bg-layer');
    if (old) old.remove();
    const oldOv = document.getElementById('mu-bg-overlay');
    if (oldOv) oldOv.remove();
    const layer = document.createElement('div');
    layer.id = 'mu-bg-layer';
    layer.style.backgroundImage = `url("${url.replace(/"/g, '%22')}")`;
    layer.style.opacity = String(CONFIG.BG_OPACITY);
    (document.body || document.documentElement).appendChild(layer);
    // Lop den phu len anh nen, khong phu len chu/nut - lay theo
    // thanh truot (mac dinh 30%)
    const overlay = document.createElement('div');
    overlay.id = 'mu-bg-overlay';
    overlay.style.background = `rgba(0, 0, 0, ${ALPHAS.overlay})`;
    (document.body || document.documentElement).appendChild(overlay);
    const btn = document.getElementById('mu-bg-pick-btn');
    if (btn) btn.remove();
    showStatus('Đã hiện ảnh nền, phủ đen ' + Math.round(ALPHAS.overlay * 100) + '%.');
  }

  function downscaleIfNeeded(dataUrl) {
    // Anh qua lon (>1.5MB) thi thu nho xuong toi da 1920px de bo nho
    // Tampermonkey luu duoc, khong thi GM_setValue co the that bai.
    return new Promise((resolve) => {
      if (dataUrl.length < 2000000) return resolve(dataUrl);
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, 1920 / img.width);
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * scale);
        c.height = Math.round(img.height * scale);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  }

  function getFileInput() {
    // Input phai nam SAN trong trang thi Chrome moi chac chan mo hop chon file.
    // Ban 0.4.0 tao input roi roi roi click ngay khi no chua gan vao DOM,
    // co trinh duyet se chan khong mo hop thoai - do la loi kha nang cao nhat.
    let input = document.getElementById('mu-bg-file-input');
    if (input) return input;
    input = document.createElement('input');
    input.id = 'mu-bg-file-input';
    input.type = 'file';
    input.accept = 'image/*';
    input.style.cssText = 'position:fixed;left:-9999px;top:0;width:1px;height:1px;opacity:0;';
    input.onchange = () => {
      const file = input.files && input.files[0];
      if (!file) { showStatus('Chưa chọn file nào.'); return; }
      showStatus('Đã chọn: ' + file.name + ' (' + Math.round(file.size / 1024) + ' KB) - đang đọc file...');
      const reader = new FileReader();
      reader.onerror = () => showStatus('LỖI: không đọc được file ảnh này. Thử file jpg/png khác.');
      reader.onload = async () => {
        try {
          const dataUrl = await downscaleIfNeeded(String(reader.result));
          let saved = true;
          try { GM_setValue(BG_KEY, dataUrl); }
          catch (e) { saved = false; }
          if (!saved) showStatus('Ảnh quá lớn nên không lưu được, chỉ hiện tạm trong phiên này. Thử ảnh nhỏ hơn 2MB.');
          applyBackground(dataUrl);
        } catch (e) {
          showStatus('LỖI khi xử lý ảnh: ' + (e && e.message ? e.message : e));
        }
      };
      reader.readAsDataURL(file);
      // Cho phep chon lai cung 1 file lan sau
      input.value = '';
    };
    (document.body || document.documentElement).appendChild(input);
    return input;
  }

  function pickBackground() {
    showStatus('Đã bấm nút chọn ảnh - hộp chọn file sắp mở...');
    try {
      getFileInput().click();
    } catch (e) {
      showStatus('LỖI: không mở được hộp chọn file: ' + (e && e.message ? e.message : e));
    }
  }

  function showPickButton() {
    if (document.getElementById('mu-bg-pick-btn')) return;
    const btn = document.createElement('button');
    btn.id = 'mu-bg-pick-btn';
    btn.type = 'button';
    btn.textContent = '🖼️ Chọn ảnh nền Muse';
    btn.onclick = pickBackground;
    (document.body || document.documentElement).appendChild(btn);
  }

  function initBackground() {
    const stored = GM_getValue(BG_KEY, '');
    if (stored) {
      applyBackground(stored);
    } else if (CONFIG.BG_IMAGE) {
      applyBackground(CONFIG.BG_IMAGE);
    } else {
      showPickButton();
    }
    try {
      GM_registerMenuCommand('⚙️ Độ đen nền Muse (trái / chat / phải)...', () => {
        // Mo bang bang menu cung hien lai nut neu truoc do da an nut
        try { GM_setValue('mu_bg_panel_btn_hidden', ''); } catch (e) {}
        showAlphaPanelButton();
        const panel = createAlphaPanel();
        panel.style.display = 'block';
      });
      GM_registerMenuCommand('🖼️ Chọn / đổi ảnh nền Muse...', pickBackground);
      GM_registerMenuCommand('🗑️ Xóa ảnh nền Muse', () => {
        GM_setValue(BG_KEY, '');
        const layer = document.getElementById('mu-bg-layer');
        if (layer) layer.remove();
        const ov = document.getElementById('mu-bg-overlay');
        if (ov) ov.remove();
        showPickButton();
      });
    } catch (e) { /* menu command khong co tren mot so trinh duyet, bo qua */ }
  }

  /* Giu mau goc cua mot phan tu, chi ha alpha xuong muc cho truoc.
     Vd bong bong xanh cua Giao su van xanh, bong bong den van den,
     chi mo di de anh nen lo qua. Tra ve false neu khong co nen duc. */
  function softenBg(el, alpha) {
    const bg = (getComputedStyle(el).backgroundColor || '');
    const m = bg.match(/rgba?\(([^)]+)\)/);
    if (!m) return false;
    const parts = m[1].split(',').map((s) => parseFloat(s));
    const oldAlpha = parts.length === 4 ? parts[3] : 1;
    // Phan tu da duoc MÚ lam mo truoc do co alpha thap, van cho keo
    // lai theo thanh truot (nhan biet bang dataset.muBgSoftened)
    if (oldAlpha < 0.5 && !el.dataset.muBgSoftened) return false;
    el.style.backgroundColor = `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${alpha})`;
    el.style.backgroundImage = 'none';
    el.dataset.muBgSoftened = '1';
    return true;
  }

  /* 2 thanh ben den 30%: khong dung ten class (class cua Muse la
     Tailwind/hash, khong ben) ma dung hinh dang that - the nao la mot
     cot doc sat mep trai hoac mep phai, cao gan full man hinh, rong
     40-420px, nen duc thi xu ly. Chi lop NGOAI CUNG duoc den 30%,
     cac lop boc trong duoc trong suot de khong cong don toi them
     (0.3 chong 0.3 se thanh ~0.5). Muc chat, nut, bong bong tin nhan
     deu thap hon / khong sat mep nen khong bi dong toi. Chay lai moi
     khi DOM doi (mo panel ben phai chang han) nho autoWiden o duoi. */
  function makeSidebarsTransparent() {
    const vw = window.innerWidth, vh = window.innerHeight;
    const cands = [];
    document.querySelectorAll('div, section, aside, nav').forEach((el) => {
      if (el.id && el.id.indexOf('mu-bg') === 0) return;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const isEdge = r.left <= 80 || r.right >= vw - 2;
      const isTall = r.height >= vh * 0.8;
      const isNarrow = r.width >= 40 && r.width <= 420;
      if (!isEdge || !isTall || !isNarrow) return;
      cands.push(el);
    });
    cands.forEach((el) => {
      const hasOuter = cands.some((o) => o !== el && o.contains(el));
      if (hasOuter) {
        el.style.backgroundColor = 'transparent';
        el.style.backgroundImage = 'none';
      } else {
        // Trai dung thanh truot trai, phai dung thanh truot phai
        const r = el.getBoundingClientRect();
        const alpha = r.left < window.innerWidth / 2 ? ALPHAS.left : ALPHAS.right;
        el.style.backgroundColor = `rgba(0, 0, 0, ${alpha})`;
        el.style.backgroundImage = 'none';
      }
    });
  }

  /* Doan chat cot giua trong suot 80%: chi quet ben trong [role="log"]
     (khung chua tin nhan), khong dong toi o nhap o duoi. Moi doan chi
     xu ly lop NGOAI CUNG co nen duc, lop trong de yen de khong cong
     don. Vi sao ban 0.4.2-0.4.4 den thui: lop anh bi day xuong z -1
     va khung app bi day len z 1, nen nen den duc mac dinh cua bong
     bong hien len tren anh; ban 0.4.0 lop anh o z 0 phu mo len ca
     bong bong nen trong nhu trong suot. */
  function softenMessageBackgrounds() {
    const log = document.querySelector('[role="log"]') || document.querySelector('[data-hatch-chat-column="true"]');
    if (!log) return;
    const cands = [];
    log.querySelectorAll('div, article, section').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width < 120 || r.height < 28 || r.height > 500) return;
      const bg = (getComputedStyle(el).backgroundColor || '');
      const m = bg.match(/rgba?\(([^)]+)\)/);
      if (!m) return;
      const parts = m[1].split(',').map((s) => parseFloat(s));
      const alpha = parts.length === 4 ? parts[3] : 1;
      if (alpha < 0.5 && !el.dataset.muBgSoftened) return;
      cands.push(el);
    });
    cands.forEach((el) => {
      const hasOuter = cands.some((o) => o !== el && o.contains(el));
      if (!hasOuter) softenBg(el, ALPHAS.chat);
    });
  }

  /* Ap dung lai tat ca do den hien tai: lop den phu anh + 2 thanh
     ben + doan chat. Goi moi khi keo truot. */
  function applyAlphas() {
    const ov = document.getElementById('mu-bg-overlay');
    if (ov) ov.style.background = `rgba(0, 0, 0, ${ALPHAS.overlay})`;
    makeSidebarsTransparent();
    softenMessageBackgrounds();
  }

  /* Bang truot do den: 4 thanh - trai / chat giua / phai / lop den
     phu anh. Keo toi dau doi ngay toi do, luu lai dung mai. */
  function createAlphaPanel() {
    let panel = document.getElementById('mu-bg-panel');
    if (panel) return panel;
    const rows = [
      { key: 'left', label: 'Thanh trái' },
      { key: 'chat', label: 'Chat giữa' },
      { key: 'right', label: 'Thanh phải' },
      { key: 'overlay', label: 'Lớp đen phủ ảnh' },
    ];
    panel = document.createElement('div');
    panel.id = 'mu-bg-panel';
    panel.style.display = 'none';
    let html = '<div style="display:flex;justify-content:space-between;align-items:center;"><b>Độ đen nền Muse</b><button type="button" id="mu-bg-panel-close" style="background:none;border:none;color:#fff;font-size:15px;cursor:pointer;">✕</button></div>';
    rows.forEach((row) => {
      html += '<label>' + row.label + ' — <span id="mu-bg-val-' + row.key + '">' + Math.round(ALPHAS[row.key] * 100) + '%</span></label>'
        + '<input type="range" min="0" max="90" step="5" value="' + Math.round(ALPHAS[row.key] * 100) + '" data-alpha-key="' + row.key + '">';
    });
    // --- Font chat: chon font, co chu, mau chu ---
    html += '<div style="margin-top:10px;border-top:1px solid rgba(255,255,255,0.2);padding-top:8px;"><b>Font chat</b></div>';
    html += '<label>Font chữ</label><select id="mu-font-family" style="width:100%;padding:4px;border-radius:6px;background:#222;color:#fff;border:1px solid rgba(255,255,255,0.25);">';
    FONT_OPTIONS.forEach((opt) => {
      html += '<option value="' + opt.value.replace(/"/g, '&quot;') + '"' + (opt.value === FONT_SETTINGS.family ? ' selected' : '') + '>' + opt.label + '</option>';
    });
    html += '</select>';
    html += '<label>Cỡ chữ — <span id="mu-bg-val-fontsize">' + FONT_SETTINGS.size + 'px</span></label>'
      + '<input type="range" id="mu-font-size" min="13" max="20" step="1" value="' + FONT_SETTINGS.size + '">';
    html += '<label>Màu chữ</label><input type="color" id="mu-font-color" value="' + FONT_SETTINGS.color + '" style="width:100%;height:30px;padding:0;border:none;background:none;cursor:pointer;">';
    html += '<div style="display:flex;gap:8px;margin-top:10px;">'
      + '<button type="button" id="mu-bg-panel-hide-btn" style="flex:1;padding:6px;border-radius:8px;border:1px solid rgba(255,255,255,0.25);background:#222;color:#fff;cursor:pointer;">Ẩn nút này</button>'
      + '<button type="button" id="mu-bg-panel-reset" style="flex:1;padding:6px;border-radius:8px;border:1px solid rgba(255,255,255,0.25);background:#222;color:#fff;cursor:pointer;">Đặt lại mặc định</button>'
      + '</div>';
    html += '<div style="margin-top:8px;font-size:12px;opacity:0.7;">Kéo/chọn tới đâu đổi ngay tới đó, tải lại trang vẫn giữ.</div>';
    panel.innerHTML = html;
    (document.body || document.documentElement).appendChild(panel);
    panel.querySelector('#mu-bg-panel-close').onclick = () => { panel.style.display = 'none'; };
    panel.querySelectorAll('input[type="range"][data-alpha-key]').forEach((input) => {
      input.addEventListener('input', () => {
        const key = input.getAttribute('data-alpha-key');
        ALPHAS[key] = parseInt(input.value, 10) / 100;
        const val = document.getElementById('mu-bg-val-' + key);
        if (val) val.textContent = input.value + '%';
        saveAlphas();
        applyAlphas();
      });
    });
    panel.querySelector('#mu-font-family').addEventListener('change', (e) => {
      FONT_SETTINGS.family = e.target.value;
      saveFontSettings();
      applyFontSettings();
    });
    panel.querySelector('#mu-font-size').addEventListener('input', (e) => {
      FONT_SETTINGS.size = parseInt(e.target.value, 10);
      const val = document.getElementById('mu-bg-val-fontsize');
      if (val) val.textContent = e.target.value + 'px';
      saveFontSettings();
      applyFontSettings();
    });
    panel.querySelector('#mu-font-color').addEventListener('input', (e) => {
      FONT_SETTINGS.color = e.target.value;
      saveFontSettings();
      applyFontSettings();
    });
    // An nut mo bang: an ca bang lan nut, luu lai de tai lai trang
    // van an. Mo lai bang menu Tampermonkey: "Do den nen Muse..."
    panel.querySelector('#mu-bg-panel-hide-btn').onclick = () => {
      try { GM_setValue('mu_bg_panel_btn_hidden', '1'); } catch (e) {}
      panel.style.display = 'none';
      const btn = document.getElementById('mu-bg-panel-btn');
      if (btn) btn.remove();
    };
    panel.querySelector('#mu-bg-panel-reset').onclick = () => {
      ALPHAS.left = CONFIG.LEFT_BG_ALPHA;
      ALPHAS.chat = CONFIG.CHAT_BG_ALPHA;
      ALPHAS.right = CONFIG.RIGHT_BG_ALPHA;
      ALPHAS.overlay = CONFIG.BG_DARK_OVERLAY;
      saveAlphas();
      FONT_SETTINGS.family = FONT_OPTIONS[0].value;
      FONT_SETTINGS.size = 16;
      FONT_SETTINGS.color = '#f5f5f5';
      saveFontSettings();
      applyAlphas();
      applyFontSettings();
      panel.remove();
      const fresh = createAlphaPanel();
      fresh.style.display = 'block';
    };
    return panel;
  }

  function showAlphaPanelButton() {
    if (document.getElementById('mu-bg-panel-btn')) return;
    // Nut da bi an truoc do thi khong tao lai (mo lai bang menu)
    if (GM_getValue('mu_bg_panel_btn_hidden', '') === '1') return;
    const btn = document.createElement('button');
    btn.id = 'mu-bg-panel-btn';
    btn.type = 'button';
    btn.textContent = '⚙️ Độ đen nền';
    btn.onclick = () => {
      const panel = createAlphaPanel();
      panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    };
    (document.body || document.documentElement).appendChild(btn);
  }

  /* 4) AUTO-WIDEN (du phong, chay khi CSS o tren chua an)
     Quet cac the div/main o giua man hinh co max-width tu 600-900px
     roi nang len CHAT_WIDTH. Logic nay khong phu thuoc ten class bi hash. */
  function autoWiden() {
    makeSidebarsTransparent();
    softenMessageBackgrounds();
    if (CONFIG.CHAT_WIDTH === 'none') return;
    document.querySelectorAll('main div, main section, main article').forEach((el) => {
      const cs = getComputedStyle(el);
      const mw = parseInt(cs.maxWidth, 10);
      const rect = el.getBoundingClientRect();
      const isCentered = Math.abs((rect.left + rect.right) / 2 - window.innerWidth / 2) < 80;
      if (mw >= 600 && mw <= 900 && isCentered && rect.width > 400) {
        el.style.maxWidth = CONFIG.CHAT_WIDTH;
        el.style.width = '100%';
      }
    });
  }

  // Muse la SPA, DOM thay doi khi chuyen chat nen phai chay lai co debounce
  let t;
  const obs = new MutationObserver(() => {
    clearTimeout(t);
    t = setTimeout(autoWiden, 300);
  });
  function start() {
    initBackground();
    showAlphaPanelButton();
    applyFontSettings();
    autoWiden();
    if (document.body) obs.observe(document.body, { childList: true, subtree: true });
  }
  if (document.body) start();
  else window.addEventListener('load', start);
  document.addEventListener('DOMContentLoaded', () => {
    // Dam bao lop nen duoc gan lai neu body xuat hien muon
    const stored = GM_getValue(BG_KEY, '');
    if (stored || CONFIG.BG_IMAGE) applyBackground(stored || CONFIG.BG_IMAGE);
    else showPickButton();
  });
})();
