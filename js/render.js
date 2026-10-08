import { MAP, TILE, worldSize } from "./collide.js";

const TORCHES = [
  { x: TILE * 1.5, y: TILE * 1.4 },
  { x: TILE * 8, y: TILE * 1.4 },
  { x: TILE * 14.5, y: TILE * 1.4 },
  { x: TILE * 14.5, y: TILE * 8.5 },
];

export function drawRoom(ctx, cssWidth, cssHeight, dpr, view, scene) {
  const world = worldSize();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssWidth, cssHeight);
  ctx.fillStyle = "#0c0a09";
  ctx.fillRect(0, 0, cssWidth, cssHeight);

  ctx.save();
  ctx.translate(view.offsetX, view.offsetY);
  ctx.scale(view.scale, view.scale);

  drawFloor(ctx);
  drawWalls(ctx);
  drawScratches(ctx);
  drawPerson(ctx, scene.eliane.x, scene.eliane.y, {
    cloak: "#6e6256",
    skin: "#d9c3a4",
  });
  drawPerson(ctx, scene.player.x, scene.player.y, {
    cloak: "#1a1411",
    skin: "#c6a07c",
    lantern: true,
  });
  drawLabel(ctx, scene.eliane.x, scene.eliane.y - 42, "Eliane");
  if (scene.near) {
    ctx.strokeStyle = "rgba(232, 165, 75, 0.85)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(scene.eliane.x, scene.eliane.y + 4, 26, 0, Math.PI * 2);
    ctx.stroke();
  }
  drawLights(ctx, scene.time, scene.player);
  drawVignette(ctx, world.width, world.height);
  ctx.restore();
}

function drawFloor(ctx) {
  for (let row = 0; row < MAP.length; row += 1) {
    for (let col = 0; col < MAP[row].length; col += 1) {
      if (MAP[row][col] === "#") {
        continue;
      }
      const tone = (col * 13 + row * 29) % 9;
      const base = 46 + tone;
      ctx.fillStyle = `rgb(${base}, ${base - 7}, ${base - 12})`;
      ctx.fillRect(col * TILE, row * TILE, TILE + 0.5, TILE + 0.5);
      if ((col + row) % 4 === 0) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.13)";
        ctx.fillRect(col * TILE + 8, row * TILE + 18, 14, 3);
      }
    }
  }
}

function drawWalls(ctx) {
  for (let row = 0; row < MAP.length; row += 1) {
    for (let col = 0; col < MAP[row].length; col += 1) {
      if (MAP[row][col] !== "#") {
        continue;
      }
      const x = col * TILE;
      const y = row * TILE;
      const edge = row === 0 || col === 0 || row === MAP.length - 1 || col === MAP[0].length - 1;
      ctx.fillStyle = edge ? "#12100e" : "#2a241f";
      ctx.fillRect(x, y, TILE + 0.5, TILE + 0.5);
      if (!edge) {
        ctx.fillStyle = "#1c1815";
        ctx.fillRect(x, y, TILE + 0.5, TILE + 0.5);
      } else if (MAP[row + 1] && MAP[row + 1][col] !== "#") {
        ctx.fillStyle = "rgba(232, 165, 75, 0.14)";
        ctx.fillRect(x, y + TILE - 4, TILE, 4);
      }
    }
  }
}

function drawScratches(ctx) {
  ctx.strokeStyle = "rgba(120, 42, 48, 0.8)";
  ctx.lineWidth = 2;
  const originX = TILE + 10;
  const originY = TILE * 5 + 8;
  for (let i = 0; i < 4; i += 1) {
    ctx.beginPath();
    ctx.moveTo(originX, originY + i * 8);
    ctx.lineTo(originX + 26, originY + 14 + i * 8);
    ctx.stroke();
  }
}

function drawPerson(ctx, x, y, look) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
  ctx.beginPath();
  ctx.ellipse(0, 12, 13, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = look.cloak;
  ctx.beginPath();
  ctx.moveTo(0, -26);
  ctx.lineTo(15, 12);
  ctx.quadraticCurveTo(0, 8, -15, 12);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = look.skin;
  ctx.beginPath();
  ctx.arc(0, -28, 6.5, 0, Math.PI * 2);
  ctx.fill();
  if (look.lantern) {
    ctx.fillStyle = "#e8a54b";
    ctx.fillRect(9, -4, 5, 7);
  }
  ctx.restore();
}

function drawLabel(ctx, x, y, text) {
  ctx.font = "600 15px Palatino Linotype, Palatino, serif";
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(12, 10, 9, 0.7)";
  ctx.fillText(text, x + 1, y + 1);
  ctx.fillStyle = "#f3e6d0";
  ctx.fillText(text, x, y);
}

function drawLights(ctx, time, player) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  TORCHES.forEach((torch, index) => {
    const flicker = 0.75 + Math.sin(time * 3 + index) * 0.12;
    const radius = 118 * flicker;
    const glow = ctx.createRadialGradient(torch.x, torch.y, 4, torch.x, torch.y, radius);
    glow.addColorStop(0, "rgba(255, 214, 150, 0.55)");
    glow.addColorStop(1, "rgba(232, 165, 75, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(torch.x, torch.y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffd7a1";
    ctx.fillRect(torch.x - 2, torch.y - 8, 4, 10);
  });
  const lamp = ctx.createRadialGradient(player.x + 12, player.y, 2, player.x, player.y, 70);
  lamp.addColorStop(0, "rgba(255, 200, 120, 0.35)");
  lamp.addColorStop(1, "rgba(255, 200, 120, 0)");
  ctx.fillStyle = lamp;
  ctx.beginPath();
  ctx.arc(player.x, player.y, 70, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawVignette(ctx, width, height) {
  const vignette = ctx.createRadialGradient(
    width / 2,
    height / 2,
    width * 0.2,
    width / 2,
    height / 2,
    width * 0.62
  );
  vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
  vignette.addColorStop(1, "rgba(0, 0, 0, 0.62)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);
}
