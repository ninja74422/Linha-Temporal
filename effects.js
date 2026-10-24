/* Efeitos visuais: rede de partículas que reage ao mouse, parallax do fundo,
   brilho que segue o cursor e spotlight nos cards. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;
  const canvas = document.getElementById('bg');
  const ctx = canvas.getContext('2d');
  const LINK = 120;   // distância máxima para ligar duas partículas
  const REACH = 150;  // alcance do mouse
  const mouse = { x: innerWidth / 2, y: innerHeight * 0.3, sx: innerWidth / 2, sy: innerHeight * 0.3, active: false };
  let w, h, dots = [], rgb = '46, 111, 115', running = false;

  function readColor() {
    const n = parseInt(getComputedStyle(root).getPropertyValue('--line').trim().slice(1), 16);
    if (!Number.isNaN(n)) rgb = `${n >> 16}, ${(n >> 8) & 255}, ${n & 255}`;
  }

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = innerWidth; h = innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(90, Math.round((w * h) / 16000));
    dots = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3, ex: 0, ey: 0,
    }));
    readColor();
    if (!running) frame(false);
  }

  function frame(move = true) {
    ctx.clearRect(0, 0, w, h);
    mouse.sx += (mouse.x - mouse.sx) * 0.08;
    mouse.sy += (mouse.y - mouse.sy) * 0.08;
    root.style.setProperty('--mx', mouse.sx + 'px');
    root.style.setProperty('--my', mouse.sy + 'px');
    root.style.setProperty('--nx', ((mouse.sx / w) - 0.5) * 2);
    root.style.setProperty('--ny', ((mouse.sy / h) - 0.5) * 2);

    for (const d of dots) {
      if (move) {
        const dx = d.x - mouse.x, dy = d.y - mouse.y, dist = Math.hypot(dx, dy);
        if (mouse.active && dist < REACH && dist > 0) {   // o mouse afasta as partículas
          const f = (1 - dist / REACH) * 0.5;
          d.ex += (dx / dist) * f; d.ey += (dy / dist) * f;
        }
        d.ex *= 0.92; d.ey *= 0.92;
        d.x += d.vx + d.ex; d.y += d.vy + d.ey;
        if (d.x < 0) d.x = w; else if (d.x > w) d.x = 0;
        if (d.y < 0) d.y = h; else if (d.y > h) d.y = 0;
      }
      ctx.fillStyle = `rgba(${rgb}, 0.55)`;
      ctx.beginPath(); ctx.arc(d.x, d.y, 1.8, 0, Math.PI * 2); ctx.fill();
    }

    ctx.lineWidth = 1;
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const dist = Math.hypot(dots[i].x - dots[j].x, dots[i].y - dots[j].y);
        if (dist < LINK) {
          ctx.strokeStyle = `rgba(${rgb}, ${(1 - dist / LINK) * 0.3})`;
          ctx.beginPath(); ctx.moveTo(dots[i].x, dots[i].y); ctx.lineTo(dots[j].x, dots[j].y); ctx.stroke();
        }
      }
      if (mouse.active) {
        const dist = Math.hypot(dots[i].x - mouse.sx, dots[i].y - mouse.sy);
        if (dist < REACH) {
          ctx.strokeStyle = `rgba(${rgb}, ${(1 - dist / REACH) * 0.45})`;
          ctx.beginPath(); ctx.moveTo(dots[i].x, dots[i].y); ctx.lineTo(mouse.sx, mouse.sy); ctx.stroke();
        }
      }
    }
  }

  function loop() {
    if (reduce.matches) { running = false; frame(false); return; }
    running = true;
    frame();
    requestAnimationFrame(loop);
  }

  addEventListener('resize', resize);
  addEventListener('pointermove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true; });
  addEventListener('pointerup', (e) => { if (e.pointerType !== 'mouse') mouse.active = false; });
  document.addEventListener('mouseleave', () => { mouse.active = false; });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => setTimeout(readColor, 50));
  reduce.addEventListener('change', () => { if (!running) loop(); });

  /* Spotlight: brilho que segue o cursor dentro de cada card */
  const list = document.getElementById('timeline');
  let last = null;
  const reset = (c) => { c.style.removeProperty('--cx'); c.style.removeProperty('--cy'); };
  list.addEventListener('pointermove', (e) => {
    const card = e.target.closest('.card');
    if (last && last !== card) reset(last);
    last = card;
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--cx', e.clientX - r.left + 'px');
    card.style.setProperty('--cy', e.clientY - r.top + 'px');
  });
  list.addEventListener('pointerleave', () => { if (last) reset(last); last = null; });

  resize();
  loop();
})();
