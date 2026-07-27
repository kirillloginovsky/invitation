/* ===================================================
   SCRIPT.JS — INVITATION WEBSITE LOGIC
   =================================================== */

// ── CONFIG: EDIT THESE ──────────────────────────────
const CONFIG = {
  emailjs: {
    serviceId:  'service_0uvi45p',
    publicKey:  'YNtEJmW6AEK30COt',
    templateId: 'template_kd2qude',
  },
  // Визитка — заполни свои данные:
  card: {
    name:     'Твоё имя',            // 👈 вставь имя
    telegram: '@username',           // 👈 вставь свой @
    telegramUrl: 'https://t.me/username', // 👈 вставь ссылку
    phone:    '+7 (999) 123-45-67',  // 👈 вставь телефон
    phoneRaw: '+79991234567',        // 👈 вставь без пробелов
  }
};
// ───────────────────────────────────────────────────

// ── STATE ───────────────────────────────────────────
const state = {
  program:    [],
  drink:      '',
  location:   '',
  format:     '',
  date:       '',
  photo:      null,
  photoName:  '',
  hasPhoto:   false,
};

// ── INIT ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  applyConfig();
  initBgImage();
  initNoButton();
  initSurveyInputs();
  initCarousel();
  initHearts();
  // Start subtle background hearts right away
  setTimeout(startBgHearts, 800);
});

function applyConfig() {
  // Business card is intentionally simple — no contact info needed
}

// ── CAROUSEL ───────────────────────────────────────────
function initCarousel() {
  const slides = [...document.querySelectorAll('.carousel-slide')]
    .filter(s => s.style.display !== 'none');

  if (slides.length === 0) {
    document.getElementById('photoPlaceholder').style.display = 'flex';
    return;
  }

  // Wait for images to load, filter out broken ones
  let loaded = [];
  let checked = 0;
  slides.forEach((img, i) => {
    const check = () => {
      checked++;
      if (img.naturalWidth > 0) loaded.push(img);
      if (checked === slides.length) startCarousel(loaded);
    };
    if (img.complete) check();
    else { img.onload = check; img.onerror = check; }
  });
}

function startCarousel(slides) {
  if (slides.length === 0) {
    document.getElementById('photoPlaceholder').style.display = 'flex';
    return;
  }

  const dotsContainer = document.getElementById('carouselDots');
  // Hide slides not in valid list
  document.querySelectorAll('.carousel-slide').forEach(s => {
    if (!slides.includes(s)) s.style.display = 'none';
  });

  // Build dots
  slides.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
  });

  // Show only if multiple slides
  if (slides.length < 2) dotsContainer.style.display = 'none';

  let current = 0;
  slides[0].classList.add('active');

  function goToSlide(idx) {
    slides[current].classList.remove('active');
    dotsContainer.querySelectorAll('.carousel-dot')[current]?.classList.remove('active');
    current = (idx + slides.length) % slides.length;
    slides[current].classList.add('active');
    dotsContainer.querySelectorAll('.carousel-dot')[current]?.classList.add('active');
  }

  // Auto-slide every 3.5 sec
  if (slides.length > 1) {
    setInterval(() => goToSlide(current + 1), 3500);
  }
}

function initBgImage() {
  const img = new Image();
  img.onload = () => document.body.classList.add('has-bg');
  img.src = 'bg.jpg';
}

// ── SCREEN TRANSITIONS ────────────────────────────────
function goToScreen(fromId, toId) {
  const from = document.getElementById(fromId);
  const to   = document.getElementById(toId);
  from.classList.add('fade-out');
  from.classList.remove('active');
  setTimeout(() => {
    from.style.display = 'none';
    to.style.display = 'flex';
    requestAnimationFrame(() => {
      to.classList.add('active');
      to.scrollTop = 0;
    });
  }, 650);
}

function goToScreen2() {
  goToScreen('screen1', 'screen2');
}
function goToScreen3() {
  collectSurvey();
  goToScreen('screen2', 'screen3');
}
function goToScreen4(withPhoto) {
  state.hasPhoto = withPhoto;
  goToScreen('screen3', 'screen4');
  fillTicket();
  setTimeout(boostHearts, 400);   // increase intensity on final screen
  setTimeout(sendEmail, 1200);
}

// ── SURVEY ────────────────────────────────────────────
function initSurveyInputs() {
  document.querySelectorAll('.opt-btn input').forEach(input => {
    input.addEventListener('change', () => {
      // animate parent label
      input.closest('.opt-btn span') && void 0;
    });
  });
}

function collectSurvey() {
  // Checkbox: program
  state.program = [...document.querySelectorAll('input[name="program"]:checked')]
    .map(i => i.value);

  // Radio fields
  const drink    = document.querySelector('input[name="drink"]:checked');
  const location = document.querySelector('input[name="location"]:checked');
  const format   = document.querySelector('input[name="format"]:checked');
  state.drink    = drink    ? drink.value    : '—';
  state.location = location ? location.value : '—';
  state.format   = format   ? format.value   : '—';

  // Date
  const dp = document.getElementById('datePicker').value;
  if (dp) {
    const d = new Date(dp + 'T12:00:00');
    state.date = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  } else {
    state.date = '—';
  }
}

// ── PHOTO UPLOAD ──────────────────────────────────────
function onPhotoSelected(input) {
  if (!input.files || !input.files[0]) return;
  const file = input.files[0];
  state.photo     = file;
  state.photoName = file.name;

  const display = document.getElementById('photoNameDisplay');
  display.textContent = '📁 ' + file.name;
  display.classList.add('visible');

  document.getElementById('btnSkip').style.display = 'none';
  document.getElementById('btnDone').style.display  = 'inline-flex';
}

// ── FILL TICKET ───────────────────────────────────────
function fillTicket() {
  document.getElementById('tk-date').textContent     = state.date     || '—';
  document.getElementById('tk-location').textContent = state.location || '—';
  document.getElementById('tk-program').textContent  = state.program.length ? state.program.join(', ') : '—';
  document.getElementById('tk-drink').textContent    = state.drink    || '—';
  document.getElementById('tk-format').textContent   = state.format   || '—';

  if (state.hasPhoto) {
    document.getElementById('tk-photo-row').style.display = 'flex';
    document.getElementById('tk-photo').textContent = state.photoName + ' 💙';
  }
}

// ── EMAIL SEND ────────────────────────────────────────
async function sendEmail() {
  const statusEl = document.getElementById('sendStatus');
  statusEl.textContent = '📨 Отправляю...';
  statusEl.className   = 'send-status sending';

  const { publicKey, serviceId, templateId } = CONFIG.emailjs;

  try {
    emailjs.init({ publicKey });

    const params = {
      date:      state.date,
      location:  state.location,
      program:   state.program.join(', ') || '—',
      drink:     state.drink,
      format:    state.format,
      has_photo: state.hasPhoto ? 'Да, прикрепила фото: ' + state.photoName : 'Нет',
      timestamp: new Date().toLocaleString('ru-RU'),
    };

    await emailjs.send(serviceId, templateId, params);
    statusEl.textContent = '✅ Ответ отправлен! 💙';
    statusEl.className   = 'send-status ok';
  } catch (err) {
    console.error('EmailJS error:', err);
    statusEl.textContent = '⚠️ Не удалось отправить — сохрани скрин!';
    statusEl.className   = 'send-status error';
  }
}

// ── NO BUTTON LOGIC ───────────────────────────────────
function initNoButton() {
  const btn = document.getElementById('btnNo');
  const MARGIN = 55;

  // Current tracked position (mirrors CSS initial values)
  let px = window.innerWidth  * 0.70;
  let py = window.innerHeight * 0.75;
  let currentScale = 1.0;

  // Sync JS position with CSS initial
  btn.style.left = px + 'px';
  btn.style.top  = py + 'px';

  function clamp(v, min, max) { return Math.min(Math.max(v, min), max); }

  function placeBtn(x, y) {
    const bw = (btn.offsetWidth  || 90) * currentScale;
    const bh = (btn.offsetHeight || 46) * currentScale;
    px = clamp(x, MARGIN, window.innerWidth  - bw - MARGIN);
    py = clamp(y, MARGIN, window.innerHeight - bh - MARGIN);
    btn.style.left = px + 'px';
    btn.style.top  = py + 'px';
  }

  function runAway(curX, curY) {
    // Button center
    const bx = px + (btn.offsetWidth  * currentScale) / 2;
    const by = py + (btn.offsetHeight * currentScale) / 2;
    // Direction away from cursor
    let dx = bx - curX;
    let dy = by - curY;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const step = Math.max(140, 280 - dist);
    // Add some randomness so it doesn't go off-axis
    const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.8;
    placeBtn(
      px + Math.cos(angle) * step,
      py + Math.sin(angle) * step
    );
  }

  // —— Mouse events ——
  btn.addEventListener('mouseenter', (e) => runAway(e.clientX, e.clientY));

  // —— Touch events ——
  // When finger gets within ~130px of button center, run away
  document.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    const bx = px + (btn.offsetWidth  * currentScale) / 2;
    const by = py + (btn.offsetHeight * currentScale) / 2;
    if (Math.abs(touch.clientX - bx) < 130 && Math.abs(touch.clientY - by) < 90) {
      runAway(touch.clientX, touch.clientY);
    }
  }, { passive: true });

  btn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    runAway(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: false });

  // —— Shrink every second down to 40% ——
  const minScale = 0.4;
  const shrinkTimer = setInterval(() => {
    if (currentScale <= minScale) { clearInterval(shrinkTimer); return; }
    currentScale = Math.max(currentScale - 0.03, minScale);
    btn.style.transform       = `scale(${currentScale})`;
    btn.style.transformOrigin = 'top left';
  }, 1000);

  // Hide button when leaving screen1
  document.getElementById('btnYes').addEventListener('click', () => {
    btn.style.display = 'none';
  });
}

// ── FALLING HEARTS ────────────────────────────────────
let heartsInterval   = null;
let bgHeartsInterval = null;
let heartsIntensity  = 'bg'; // 'bg' | 'full'

function initHearts() {
  const canvas = document.getElementById('heartsCanvas');
  window._heartsCtx = canvas.getContext('2d');
  window._hearts    = [];

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);
}

// Subtle background hearts — visible on all screens
function startBgHearts() {
  const canvas = document.getElementById('heartsCanvas');
  canvas.classList.add('visible');
  const hearts = window._hearts;

  // Spawn slowly: 1 heart every 2.5s
  bgHeartsInterval = setInterval(() => {
    if (hearts.length > 18) return;
    const h = createHeart();
    h.maxOpacity = 0.18 + Math.random() * 0.12; // very subtle
    h.size       = 16 + Math.random() * 14;      // smaller
    h.vy         = 0.3 + Math.random() * 0.5;    // very slow
    hearts.push(h);
  }, 2200);

  runHeartsLoop();
}

// Full celebratory hearts — screen 4
function boostHearts() {
  const hearts = window._hearts;
  heartsIntensity = 'full';
  // Speed up spawn rate
  heartsInterval = setInterval(() => {
    if (hearts.length > 60) return;
    hearts.push(createHeart());
  }, 350);
}

function runHeartsLoop() {
  const ctx    = window._heartsCtx;
  const hearts = window._hearts;

  function loop() {
    ctx.clearRect(0, 0, window._heartsCtx.canvas.width, window._heartsCtx.canvas.height);
    for (let i = hearts.length - 1; i >= 0; i--) {
      const h = hearts[i];
      // Gentle sway (pendulum)
      h.sway += h.swaySpeed;
      h.x += Math.sin(h.sway) * h.swayAmp * 0.04;
      h.y += h.vy;

      // Fade in then slowly fade out
      if (h.fadeIn) {
        h.opacity = Math.min(h.opacity + 0.015, h.maxOpacity);
        if (h.opacity >= h.maxOpacity) h.fadeIn = false;
      } else {
        h.opacity -= 0.0012; // very slow fade
      }

      if (h.opacity <= 0 || h.y > ctx.canvas.height + 60) {
        hearts.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.translate(h.x, h.y);
      ctx.rotate(h.rot);
      ctx.globalAlpha = h.opacity;
      ctx.font = h.size + 'px serif';
      ctx.textAlign = 'center';
      ctx.fillText(h.emoji, 0, 0);
      ctx.restore();
    }
    requestAnimationFrame(loop);
  }
  loop();
}

function createHeart() {
  const emojis = ['\uD83D\uDC99', '\uD83E\uDE75', '\uD83D\uDCAB', '\u2728', '\u2744\uFE0F', '\uD83C\uDF38'];
  return {
    x:         Math.random() * window.innerWidth,
    y:         -50,
    vy:        0.5 + Math.random() * 0.9,
    sway:      Math.random() * Math.PI * 2,
    swaySpeed: 0.008 + Math.random() * 0.012,
    swayAmp:   20 + Math.random() * 25,
    rot:       (Math.random() - 0.5) * 0.2,
    size:      24 + Math.random() * 26,
    opacity:   0,
    maxOpacity: 0.5 + Math.random() * 0.35,
    fadeIn:    true,
    emoji:     emojis[Math.floor(Math.random() * emojis.length)],
  };
}