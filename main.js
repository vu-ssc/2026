/* ============================================================
   SSC 2026 – Main JavaScript
   Vidyasagar University Social Science Conclave
   Created by Partha Ghosh, officialparthaghosh@gmail.com, 2026
   ============================================================ */

// ---- Scroll Progress Bar ----
const progressBar = document.getElementById('scroll-progress');
function updateProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? scrollTop / docHeight : 0;
  progressBar.style.transform = `scaleX(${progress})`;
}

// ---- Navbar scroll behaviour ----
const navbar = document.getElementById('navbar');
const mobileToggle = document.getElementById('mobile-toggle');
const mobileMenu = document.getElementById('mobile-menu');
const menuIconOpen = document.getElementById('menu-icon-open');
const menuIconClose = document.getElementById('menu-icon-close');

function updateNavbar() {
  if (window.scrollY > 20) {
    navbar.classList.add('scrolled');
    if (mobileToggle) mobileToggle.className = 'p-2 rounded-md text-gray-900';
  } else {
    navbar.classList.remove('scrolled');
    if (mobileToggle) mobileToggle.className = 'p-2 rounded-md text-white';
  }
}

// ---- Mobile Menu toggle ----
mobileToggle.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  menuIconOpen.classList.toggle('hidden', isOpen);
  menuIconClose.classList.toggle('hidden', !isOpen);
});

function closeMobileMenu() {
  mobileMenu.classList.remove('open');
  menuIconOpen.classList.remove('hidden');
  menuIconClose.classList.add('hidden');
}

// Expose closeMobileMenu globally (called from inline onclick in HTML)
window.closeMobileMenu = closeMobileMenu;

// ---- Mouse follower (hero) ----
const mouseFollower = document.getElementById('mouse-follower');
document.addEventListener('mousemove', (e) => {
  if (mouseFollower) {
    mouseFollower.style.transform = `translate(${e.clientX - 300}px, ${e.clientY - 300}px)`;
  }
});

// ---- Floating Particles (hero) ----
const particlesContainer = document.getElementById('particles-container');
if (particlesContainer) {
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const left = Math.random() * 100;
    const top = Math.random() * 100;
    const dur = (Math.random() * 5 + 5).toFixed(1) + 's';
    const delay = (Math.random() * 5).toFixed(1) + 's';
    const dx = ((Math.random() - 0.5) * 100).toFixed(0) + 'px';
    p.style.cssText = `left:${left}%;top:${top}%;--dur:${dur};--delay:${delay};--dx:${dx};`;
    particlesContainer.appendChild(p);
  }
}

// ---- Ripple button effect ----
document.querySelectorAll('.ripple-btn').forEach(btn => {
  const circle = btn.querySelector('.ripple-circle');
  if (!circle) return;

  btn.addEventListener('mouseenter', (e) => {
    const rect = btn.getBoundingClientRect();
    circle.style.left = (e.clientX - rect.left) + 'px';
    circle.style.top = (e.clientY - rect.top) + 'px';
    circle.style.transition = 'transform 0.8s ease-out';
    circle.style.transform = 'scale(1) translate(-50%, -50%)';
  });

  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    circle.style.transition = 'transform 0.8s ease-out';
    circle.style.left = (e.clientX - rect.left) + 'px';
    circle.style.top = (e.clientY - rect.top) + 'px';
  });

  btn.addEventListener('mouseleave', () => {
    circle.style.transition = 'transform 0.3s ease-out';
    circle.style.transform = 'scale(0) translate(-50%, -50%)';
  });
});

// ---- Scroll Reveal (IntersectionObserver) ----
const revealEls = document.querySelectorAll('.reveal, .reveal-left');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

revealEls.forEach(el => observer.observe(el));

// Trigger hero section reveals immediately on load
setTimeout(() => {
  document.querySelectorAll('#hero-logo, [id^="hero"]').forEach(el => {
    el.classList.add('visible');
  });
  document.querySelectorAll('.reveal, .reveal-left').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) el.classList.add('visible');
  });
}, 100);

// ---- Scroll event listeners ----
window.addEventListener('scroll', () => {
  updateProgress();
  updateNavbar();
}, { passive: true });

// Initial calls
updateProgress();
updateNavbar();

// ============================================================
//  INTERACTIVE GLOW TIMELINE
// ============================================================
(function () {
  const section   = document.getElementById('timeline');
  const wrapper   = document.getElementById('timeline-interactive');
  const canvas    = document.getElementById('timeline-canvas');
  if (!section || !wrapper || !canvas) return;

  const ctx = canvas.getContext('2d');
  const items = Array.from(wrapper.querySelectorAll('.tl-item'));

  // ---- Particle trail state ----
  let particles = [];
  let mouseY = -999;     // cursor Y relative to canvas top
  let isInside = false;
  let animFrame = null;
  let nearestIdx = -1;

  // Each item's data-color / data-glow
  const itemColors = items.map(el => el.dataset.color  || '#C5A059');
  const itemGlows  = items.map(el => el.dataset.glow   || 'rgba(197,160,89,0.7)');

  // ---- Resize canvas to match wrapper ----
  function resizeCanvas() {
    // wrapper may not have explicit height, use section's clientWidth/Height
    const w = wrapper.clientWidth  || section.clientWidth  || window.innerWidth;
    const h = wrapper.scrollHeight || wrapper.clientHeight || 600;
    if (canvas.width !== w)  canvas.width  = w;
    if (canvas.height !== h) canvas.height = h;
  }

  // ---- Get each node's Y center relative to wrapper top ----
  function getNodeYs() {
    const wrapRect = wrapper.getBoundingClientRect();
    return items.map(item => {
      const r = item.getBoundingClientRect();
      return r.top + r.height / 2 - wrapRect.top;
    });
  }

  // ---- Color for a given Y (interpolated between node colors) ----
  function colorAtY(y, nodeYs) {
    if (nodeYs.length === 0) return '#C5A059';
    if (y <= nodeYs[0]) return itemColors[0];
    if (y >= nodeYs[nodeYs.length - 1]) return itemColors[itemColors.length - 1];
    for (let i = 0; i < nodeYs.length - 1; i++) {
      if (y >= nodeYs[i] && y <= nodeYs[i + 1]) {
        const t = (y - nodeYs[i]) / (nodeYs[i + 1] - nodeYs[i]);
        return t < 0.5 ? itemColors[i] : itemColors[i + 1];
      }
    }
    return '#C5A059';
  }

  // ---- Spawn particles ----
  function spawnParticle(cx, cy, color) {
    particles.push({
      x: cx, y: cy,
      r: Math.random() * 3 + 1.5,
      alpha: 0.9,
      decay: Math.random() * 0.025 + 0.015,
      vy: (Math.random() - 0.5) * 0.6,
      vx: (Math.random() - 0.5) * 0.4,
      color
    });
  }

  // ---- Draw loop ----
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2;
    const nodeYs = getNodeYs();

    if (isInside && mouseY > 0) {
      // Cap the beam at the last node's Y (Conclave Dates)
      const lastY  = nodeYs[nodeYs.length - 1] || canvas.height;
      const beamY  = Math.min(mouseY, lastY);

      // Glow beam from top to beamY
      const col = colorAtY(beamY, nodeYs);
      const grad = ctx.createLinearGradient(cx, 0, cx, beamY);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(0.4, col + '88');
      grad.addColorStop(1, col);

      ctx.save();
      ctx.shadowBlur = 18;
      ctx.shadowColor = col;
      ctx.strokeStyle = grad;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, beamY);
      ctx.stroke();
      ctx.restore();

      // Bright tip circle
      ctx.save();
      ctx.shadowBlur = 30;
      ctx.shadowColor = col;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(cx, beamY, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Spawn particles at tip
      spawnParticle(cx, beamY, col);
      spawnParticle(cx, beamY, col);
    }

    // 5. Update & draw particles
    particles = particles.filter(p => p.alpha > 0.01);
    particles.forEach(p => {
      p.x   += p.vx;
      p.y   += p.vy;
      p.alpha -= p.decay;
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.shadowBlur  = 12;
      ctx.shadowColor = p.color;
      ctx.fillStyle   = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    animFrame = requestAnimationFrame(draw);
  }

  // ---- Activate nearest node (capped at last node) ----
  function activateNearest(nodeYs, cappedY) {
    const y = cappedY !== undefined ? cappedY : mouseY;
    if (!isInside || y < 0) { deactivateAll(); return; }

    let minDist = Infinity, idx = -1;
    nodeYs.forEach((ny, i) => {
      const d = Math.abs(ny - y);
      if (d < minDist) { minDist = d; idx = i; }
    });

    if (idx === nearestIdx) return;
    nearestIdx = idx;
    deactivateAll();

    if (idx >= 0) {
      const item  = items[idx];
      const node  = item.querySelector('.tl-node');
      const dot   = item.querySelector('.tl-dot');
      const col   = itemColors[idx];
      const glow  = itemGlows[idx];
      item.classList.add('tl-active');
      item.style.setProperty('--item-glow', glow);
      if (node) {
        node.style.borderColor  = col;
        node.style.boxShadow    = `0 0 0 5px ${glow.replace('0.7','0.18')}, 0 0 20px ${glow}`;
      }
      if (dot) dot.style.background = col;

      // Update hbeam color
      hbeam.style.background = `linear-gradient(to right, transparent, ${col}66, ${col}, ${col}66, transparent)`;
    }
  }

  function deactivateAll() {
    items.forEach((item, i) => {
      if (!item.classList.contains('tl-active')) return;
      item.classList.remove('tl-active');
      item.style.removeProperty('--item-glow');
      const node = item.querySelector('.tl-node');
      const dot  = item.querySelector('.tl-dot');
      if (node) { node.style.borderColor = '#d1d5db'; node.style.boxShadow = 'none'; }
      if (dot)  { dot.style.background   = '#d1d5db'; }
    });
  }

  // ---- Mouse events on the whole section ----
  section.addEventListener('mousemove', (e) => {
    const wrapRect = wrapper.getBoundingClientRect();
    mouseY   = e.clientY - wrapRect.top;
    isInside = true;

    const nodeYs = getNodeYs();
    // Only activate nodes up to and including last (Conclave Dates)
    const cappedY = Math.min(mouseY, nodeYs[nodeYs.length - 1] || mouseY);
    activateNearest(nodeYs, cappedY);
  });

  section.addEventListener('mouseleave', () => {
    isInside   = false;
    mouseY     = -999;
    nearestIdx = -1;
    deactivateAll();
  });

  // ---- Start ----
  // Defer so layout is fully computed before sizing canvas
  setTimeout(() => {
    resizeCanvas();
    draw();
  }, 200);

  window.addEventListener('resize', () => {
    resizeCanvas();
  });

  // ResizeObserver for dynamic layout changes
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(() => resizeCanvas()).observe(wrapper);
  }
})();
