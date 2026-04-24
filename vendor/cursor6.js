$(function () {
  const host = document.body;
  if (!host) return;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const trails = [];
  let width = 0;
  let height = 0;
  let pointer = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5 };
  let glow = { x: pointer.x, y: pointer.y };

  canvas.className = "cursor-star-canvas";
  canvas.style.position = "fixed";
  canvas.style.inset = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.pointerEvents = "none";
  canvas.style.mixBlendMode = "screen";
  canvas.style.zIndex = "9999";
  host.appendChild(canvas);

  function motionLevel() {
    return document.body.dataset.effectiveMotionLevel || document.body.dataset.motionLevel || "full";
  }

  function syncSize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function spawnBurst(x, y, amount) {
    if (motionLevel() === "off") return;
    for (let i = 0; i < amount; i += 1) {
      trails.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 2.1,
        vy: (Math.random() - 0.5) * 1.5 - Math.random() * 0.36,
        size: 18 + Math.random() * 34,
        life: 42 + Math.floor(Math.random() * 30),
        maxLife: 42 + Math.floor(Math.random() * 30),
        hue: i % 3
      });
    }
  }

  function handleMove(event) {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    const count = motionLevel() === "reduced" ? 3 : 7;
    spawnBurst(pointer.x, pointer.y, count);
  }

  function glowColor(index, alpha) {
    if (index === 0) return `rgba(240,248,255,${alpha})`;
    if (index === 1) return `rgba(188,221,255,${alpha})`;
    return `rgba(255,205,232,${alpha})`;
  }

  function draw(time) {
    requestAnimationFrame(draw);
    syncSize();
    ctx.clearRect(0, 0, width, height);
    if (motionLevel() === "off") {
      trails.length = 0;
      return;
    }

    glow.x += (pointer.x - glow.x) * (motionLevel() === "reduced" ? 0.06 : 0.1);
    glow.y += (pointer.y - glow.y) * (motionLevel() === "reduced" ? 0.06 : 0.1);

    const halo = ctx.createRadialGradient(glow.x, glow.y, 0, glow.x, glow.y, motionLevel() === "reduced" ? 150 : 230);
    halo.addColorStop(0, "rgba(255,255,255,0.18)");
    halo.addColorStop(0.28, "rgba(188,221,255,0.14)");
    halo.addColorStop(0.62, "rgba(255,205,232,0.08)");
    halo.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(glow.x, glow.y, motionLevel() === "reduced" ? 150 : 230, 0, Math.PI * 2);
    ctx.fill();

    for (let i = trails.length - 1; i >= 0; i -= 1) {
      const trail = trails[i];
      trail.x += trail.vx;
      trail.y += trail.vy;
      trail.life -= 1;
      trail.vx *= 0.985;
      trail.vy *= 0.99;
      const alpha = Math.max(trail.life / trail.maxLife, 0);
      if (alpha <= 0) {
        trails.splice(i, 1);
        continue;
      }

      const gradient = ctx.createRadialGradient(trail.x, trail.y, 0, trail.x, trail.y, trail.size);
      gradient.addColorStop(0, glowColor(trail.hue, alpha * 0.7));
      gradient.addColorStop(0.5, glowColor(trail.hue, alpha * 0.24));
      gradient.addColorStop(1, glowColor(trail.hue, 0));
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(trail.x, trail.y, trail.size, 0, Math.PI * 2);
      ctx.fill();
    }

    const streamX = width * (0.12 + ((time * 0.00004) % 0.76));
    const streamGradient = ctx.createLinearGradient(streamX - 180, 0, streamX + 180, height);
    streamGradient.addColorStop(0, "rgba(255,255,255,0)");
    streamGradient.addColorStop(0.48, "rgba(255,255,255,0.04)");
    streamGradient.addColorStop(0.52, "rgba(188,221,255,0.08)");
    streamGradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = streamGradient;
    ctx.fillRect(streamX - 220, 0, 440, height);
  }

  syncSize();
  window.addEventListener("resize", syncSize);
  document.addEventListener("mousemove", handleMove, { passive: true });
  document.addEventListener("touchmove", (event) => {
    if (!event.touches.length) return;
    handleMove(event.touches[0]);
  }, { passive: true });
  draw(0);
});
