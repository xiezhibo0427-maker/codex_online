const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const restartBtn = document.getElementById('restart');
const touchControl = document.getElementById('touchControl');

const W = canvas.width;
const H = canvas.height;
const SHIP_W = 44;
const SHIP_H = 20;

const state = {
  running: true,
  frame: 0,
  score: 0,
  best: Number(localStorage.getItem('meteor-best') || 0),
  speed: 2.2,
  spawnRate: 58,
  shipX: W / 2 - SHIP_W / 2,
  meteors: [],
  keys: new Set(),
};

bestEl.textContent = state.best;

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function reset() {
  state.running = true;
  state.frame = 0;
  state.score = 0;
  state.speed = 2.2;
  state.spawnRate = 58;
  state.shipX = W / 2 - SHIP_W / 2;
  state.meteors = [];
  scoreEl.textContent = '0';
}

function spawnMeteor() {
  const r = rand(10, 24);
  state.meteors.push({
    x: rand(r, W - r),
    y: -r,
    r,
    vy: rand(state.speed, state.speed + 1.8),
  });
}

function update() {
  if (!state.running) return;
  state.frame += 1;

  if (state.keys.has('ArrowLeft') || state.keys.has('a')) {
    state.shipX -= 6;
  }
  if (state.keys.has('ArrowRight') || state.keys.has('d')) {
    state.shipX += 6;
  }
  state.shipX = Math.max(0, Math.min(W - SHIP_W, state.shipX));

  if (state.frame % Math.max(18, Math.floor(state.spawnRate)) === 0) {
    spawnMeteor();
  }

  state.meteors.forEach((m) => {
    m.y += m.vy;
  });

  state.meteors = state.meteors.filter((m) => m.y - m.r < H + 10);

  // 难度渐增
  state.speed += 0.0009;
  state.spawnRate -= 0.004;

  // 碰撞检测
  for (const m of state.meteors) {
    const shipCenterX = state.shipX + SHIP_W / 2;
    const shipCenterY = H - 34;
    const dx = Math.abs(m.x - shipCenterX);
    const dy = Math.abs(m.y - shipCenterY);

    if (dx < SHIP_W / 2 + m.r * 0.75 && dy < SHIP_H / 2 + m.r * 0.75) {
      state.running = false;
      if (state.score > state.best) {
        state.best = state.score;
        localStorage.setItem('meteor-best', String(state.best));
        bestEl.textContent = String(state.best);
      }
      return;
    }
  }

  state.score += 1;
  scoreEl.textContent = String(state.score);
}

function drawShip() {
  const y = H - 42;
  ctx.fillStyle = '#00d4ff';
  ctx.beginPath();
  ctx.moveTo(state.shipX + SHIP_W / 2, y - 14);
  ctx.lineTo(state.shipX, y + SHIP_H / 2);
  ctx.lineTo(state.shipX + SHIP_W, y + SHIP_H / 2);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#b8f7ff';
  ctx.fillRect(state.shipX + SHIP_W / 2 - 6, y - 2, 12, 8);
}

function drawMeteor(m) {
  ctx.fillStyle = '#ff4d6d';
  ctx.beginPath();
  ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(0,0,0,.22)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(m.x + 2, m.y - 1, m.r * 0.35, 0, Math.PI * 2);
  ctx.stroke();
}

function render() {
  ctx.clearRect(0, 0, W, H);

  // 星星背景
  for (let i = 0; i < 45; i += 1) {
    const x = (i * 83 + state.frame * 0.3) % W;
    const y = (i * 137 + state.frame * 0.7) % H;
    ctx.fillStyle = i % 2 ? '#dbeafe' : '#f8fafc';
    ctx.fillRect(x, y, 2, 2);
  }

  state.meteors.forEach(drawMeteor);
  drawShip();

  if (!state.running) {
    ctx.fillStyle = 'rgba(0, 0, 0, .6)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('游戏结束', W / 2, H / 2 - 20);
    ctx.font = '18px sans-serif';
    ctx.fillText('点击“重新开始”再来一局', W / 2, H / 2 + 18);
  }
}

function loop() {
  update();
  render();
  requestAnimationFrame(loop);
}

window.addEventListener('keydown', (e) => state.keys.add(e.key));
window.addEventListener('keyup', (e) => state.keys.delete(e.key));

restartBtn.addEventListener('click', reset);
touchControl.addEventListener('input', () => {
  state.shipX = (Number(touchControl.value) / 100) * (W - SHIP_W);
});

reset();
loop();
