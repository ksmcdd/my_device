$(function () {
  const canvas = document.getElementById("canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const flakes = [];
  let width = 0;
  let height = 0;
  let pointerX = 0.5;
  let pointerY = 0.5;

  function motionLevel() {
    return document.body.dataset.effectiveMotionLevel || document.body.dataset.motionLevel || "full";
  }

  function targetCount() {
    const level = motionLevel();
    if (level === "off") return 0;
    if (level === "reduced") return Math.max(72, Math.round(window.innerWidth / 20));
    return Math.max(168, Math.round(window.innerWidth / 8));
  }

  function syncSize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function createFlake(resetToTop = false) {
    const sizeBase = motionLevel() === "reduced" ? 9 : 14;
    return {
      x: Math.random() * width,
      y: resetToTop ? -40 - Math.random() * 140 : Math.random() * height,
      r: sizeBase + Math.random() * sizeBase * 2.4,
      drift: (Math.random() - 0.5) * 0.72,
      fall: 0.42 + Math.random() * 1.18,
      sway: 0.0015 + Math.random() * 0.003,
      angle: Math.random() * Math.PI * 2,
      alpha: 0.2 + Math.random() * 0.42,
      blur: Math.random() * 20,
      tint: [
        235 + Math.round(Math.random() * 20),
        240 + Math.round(Math.random() * 12),
        255
      ]
    };
  }

  function refill() {
    const desired = targetCount();
    while (flakes.length < desired) flakes.push(createFlake(false));
    while (flakes.length > desired) flakes.pop();
  }

  function reset() {
    flakes.length = 0;
    refill();
  }

  function updateFlake(flake, index, time) {
    const wind = (pointerX - 0.5) * (motionLevel() === "reduced" ? 0.85 : 1.55);
    flake.angle += flake.sway * (1 + index * 0.002);
    flake.x += flake.drift + Math.sin(time * 0.00045 + flake.angle) * 0.66 + wind * (0.22 + flake.r * 0.012);
    flake.y += flake.fall + flake.r * 0.032;

    if (flake.y - flake.r > height + 40 || flake.x < -140 || flake.x > width + 140) {
      Object.assign(flake, createFlake(true));
      flake.x = Math.random() * width;
    }
  }

  function drawFlake(flake) {
    const gradient = ctx.createRadialGradient(flake.x, flake.y, 0, flake.x, flake.y, flake.r * 2.2);
    const [r, g, b] = flake.tint;
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${flake.alpha})`);
    gradient.addColorStop(0.48, `rgba(${r}, ${g}, ${b}, ${flake.alpha * 0.45})`);
    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

    ctx.beginPath();
    ctx.fillStyle = gradient;
    ctx.arc(flake.x, flake.y, flake.r * 2.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = `rgba(255,255,255,${Math.min(0.88, flake.alpha + 0.24)})`;
    ctx.arc(flake.x, flake.y, Math.max(1.2, flake.r * 0.28), 0, Math.PI * 2);
    ctx.fill();
  }

  function render(time) {
    requestAnimationFrame(render);
    const level = motionLevel();
    ctx.clearRect(0, 0, width, height);
    if (level === "off") return;

    refill();
    ctx.globalCompositeOperation = "screen";
    flakes.forEach((flake, index) => {
      updateFlake(flake, index, time);
      drawFlake(flake);
    });
    ctx.globalCompositeOperation = "source-over";
  }

  function handleMove(event) {
    pointerX = event.clientX / Math.max(window.innerWidth, 1);
    pointerY = event.clientY / Math.max(window.innerHeight, 1);
    document.body.style.setProperty("--global-pointer-x", pointerX.toFixed(4));
    document.body.style.setProperty("--global-pointer-y", pointerY.toFixed(4));
  }

  syncSize();
  reset();
  window.addEventListener("resize", () => {
    syncSize();
    reset();
  });
  document.addEventListener("mousemove", handleMove, { passive: true });
  document.addEventListener("touchmove", (event) => {
    if (!event.touches.length) return;
    handleMove(event.touches[0]);
  }, { passive: true });
  render(0);
});
