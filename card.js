(() => {
  const MESSAGES = [
    "Keep smiling 😊",
    "Have a great life ✨",
    "Keep shining 🌟",
    "Stay awesome!",
    "Dream big ✨",
    "Lots of love 💖",
    "You rock! 🤘",
    "Best wishes 🎁",
    "Make a wish 🌠",
    "May you thrive more 🎈",
    "Cheers to you 🥳",
    "Shine on ☀️",
  ];

  const candleEls = [...document.querySelectorAll(".candle")];
  const balloonWrapper = document.getElementById("balloons");
  const balloonEls = [...balloonWrapper.querySelectorAll(".balloon")];
  const blownCountEl = document.getElementById("blownCount");
  const resetBtn = document.getElementById("resetBtn");
  const messageContainer = document.getElementById("messageContainer");

  let blownCount = 0;
  const totalCandles = candleEls.length;

  // --- fireworks setup ---
  const canvas = document.getElementById("fwCanvas");
  const ctx = canvas.getContext("2d");
  let W, H;
  function resize() {
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = W;
    canvas.height = H;
  }
  resize();
  window.addEventListener("resize", resize);

  const particles = [];
  const rand = (a, b) => Math.random() * (b - a) + a;

  function spawnFirework(x, y, color, count = 24, speed = 1) {
    const type =
      Math.random() < 0.33
        ? "circle"
        : Math.random() < 0.5
        ? "star"
        : "confetti";
    for (let i = 0; i < count; i++) {
      const angle = Math.PI * 2 * (i / count) + rand(-0.1, 0.1);
      const speedV = rand(1.6, 3.8) * speed;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speedV,
        vy: Math.sin(angle) * speedV,
        life: rand(900, 1600),
        born: performance.now(),
        size: rand(2, 5),
        color,
        gravity: 0.05,
        shape: type,
      });
    }
  }

  function triggerFireworks(n) {
    for (let i = 0; i < n; i++) {
      const x = rand(W * 0.2, W * 0.8),
        y = rand(H * 0.1, H * 0.6);
      const col = `hsl(${Math.floor(rand(0, 360))},80%,60%)`;
      spawnFirework(x, y, col, 20 + blownCount * 5, 1 + blownCount / 5);
    }
  }

  function loop(now = performance.now()) {
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.fillRect(0, 0, W, H);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i],
        age = now - p.born,
        t = age / p.life;
      if (t >= 1) {
        particles.splice(i, 1);
        continue;
      }
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      const alpha = 1 - t;
      const size = p.size * (1 - 0.5 * t);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;

      if (p.shape === "circle") {
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === "star") {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(t * 6);
        ctx.beginPath();
        for (let j = 0; j < 5; j++) {
          ctx.lineTo(
            Math.cos((j * 2 * Math.PI) / 5) * size * 2,
            Math.sin((j * 2 * Math.PI) / 5) * size * 2
          );
          ctx.lineTo(
            Math.cos(((j * 2 + 1) * Math.PI) / 5) * size,
            Math.sin(((j * 2 + 1) * Math.PI) / 5) * size
          );
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      } else {
        // confetti
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(t * 10);
        ctx.fillRect(-size / 2, -size / 2, size * 1.6, size * 0.6);
        ctx.restore();
      }
    }
    requestAnimationFrame(loop);
  }
  loop();

  // --- interactions ---
  candleEls.forEach((c) => {
    c.addEventListener("click", () => {
      if (c.classList.contains("blownt")) return;
      c.classList.add("blownt");
      blownCount++;
      blownCountEl.textContent = blownCount;
      triggerFireworks(blownCount);

      if (blownCount === totalCandles) {
        balloonWrapper.classList.remove("hidden");
        balloonWrapper.classList.add("show");
        triggerFireworks(5);
      }
    });
  });

  balloonEls.forEach((b) => {
    b.addEventListener("click", () => {
      if (b.classList.contains("popped")) return;
      b.classList.add("popped");
      const msg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
      showMessage(msg);
      triggerFireworks(2);
    });
  });

  function showMessage(text) {
    const el = document.createElement("div");
    el.className = "msg";
    el.textContent = text;
    messageContainer.appendChild(el);
    setTimeout(() => {
      el.style.opacity = "0";
      setTimeout(() => el.remove(), 400);
    }, 2600);
  }

  resetBtn.addEventListener("click", () => {
    blownCount = 0;
    blownCountEl.textContent = 0;
    candleEls.forEach((c) => c.classList.remove("blownt"));
    balloonEls.forEach((b) => b.classList.remove("popped"));
    balloonWrapper.classList.add("hidden");
    balloonWrapper.classList.remove("show");
    messageContainer.innerHTML = "";
    triggerFireworks(3);
  });
})();
