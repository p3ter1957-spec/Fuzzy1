/* =============================================
   Grand Canyon University – Student ID
   script.js
   ============================================= */

// ── Seeded PRNG (mulberry32) ──────────────────────────────────────
// Returns a deterministic pseudo-random function for a given seed,
// so the barcode looks the same on every page load.
function seededRandom(seed) {
  return function () {
    seed |= 0;
    seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Barcode Generator ────────────────────────────────────────────
function generateBarcode() {
  const canvas = document.getElementById('barcodeCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, W, H);

  const quietZone = 18;
  const drawWidth = W - quietZone * 2;

  // Fixed seed tied to the student — change the number to get a
  // different-looking but still stable barcode.
  const rand = seededRandom(0xED6A3C1F);

  const bars = [];
  let totalUnits = 0;
  const targetUnits = 110;

  bars.push({ color: '#fff', units: 0 });

  while (totalUnits < targetUnits) {
    const isBar = bars.length % 2 === 0;
    const weight = rand();
    let w;
    if (weight < 0.55)      w = 1;
    else if (weight < 0.82) w = 2;
    else                    w = 3;
    if (totalUnits + w > targetUnits) w = targetUnits - totalUnits;
    bars.push({ color: isBar ? '#000' : '#fff', units: w });
    totalUnits += w;
  }

  bars.push({ color: '#000', units: 2 });
  totalUnits += 2;

  const unitPx = drawWidth / totalUnits;
  let x = quietZone;

  ctx.fillStyle = '#000';
  for (const bar of bars) {
    if (bar.color === '#000') {
      ctx.fillRect(Math.round(x), 0, Math.max(1, Math.round(bar.units * unitPx)), H);
    }
    x += bar.units * unitPx;
  }
}

// ── Date / Time ───────────────────────────────────────────────────
function formatDateTime(date) {
  const months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];
  const month = months[date.getMonth()];
  const day   = date.getDate();
  const year  = date.getFullYear();

  let hours   = date.getHours();
  const mins  = String(date.getMinutes()).padStart(2, '0');
  const ampm  = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12 || 12;

  return `${month} ${day}, ${year}, ${hours}:${mins}${ampm}`;
}

function updateDateTime() {
  const el = document.getElementById('dateTime');
  if (el) el.textContent = formatDateTime(new Date());
}

// ── Reload Button ─────────────────────────────────────────────────
function setupReloadButton() {
  const btn = document.getElementById('reloadBtn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    // Spin animation
    btn.classList.remove('spinning');
    // Force reflow so the animation restarts
    void btn.offsetWidth;
    btn.classList.add('spinning');

    // Update date only
    updateDateTime();

    btn.addEventListener('animationend', () => {
      btn.classList.remove('spinning');
    }, { once: true });
  });
}

// ── Init ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  generateBarcode();
  updateDateTime();
  setupReloadButton();
});
