import { TILE, findMark, worldSize } from "./collide.js";

export function drawRoom(ctx, cssWidth, cssHeight, dpr, view, scene) {
  const { map } = scene;
  const world = worldSize(map);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssWidth, cssHeight);
  ctx.fillStyle = "#0c0a09";
  ctx.fillRect(0, 0, cssWidth, cssHeight);

  ctx.save();
  ctx.translate(view.offsetX, view.offsetY);
  ctx.scale(view.scale, view.scale);

  drawFloor(ctx, map, scene.warm, scene.tones);
  drawWalls(ctx, map);
  if (scene.scratches) {
    drawScratches(ctx);
  }
  drawExits(ctx, map, scene.tones, scene.labels);
  scene.actors.forEach((actor) => {
    if (actor.kind === "chest") {
      drawChest(ctx, actor.x, actor.y);
    } else if (actor.kind === "note") {
      drawNote(ctx, actor.x, actor.y);
    } else {
      drawPerson(ctx, actor.x, actor.y, { cloak: actor.cloak, skin: "#d9c3a4" });
    }
    drawLabel(ctx, actor.x, actor.y - 42, actor.name);
    if (actor.id === scene.nearId) {
      ctx.strokeStyle = "rgba(232, 165, 75, 0.85)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(actor.x, actor.y + 4, 26, 0, Math.PI * 2);
      ctx.stroke();
    }
  });
  drawPerson(ctx, scene.player.x, scene.player.y, {
    cloak: "#1a1411",
    skin: "#c6a07c",
    lantern: true,
  });
  drawLights(ctx, scene.time, scene.player, scene.torches);
  if (scene.hurt > 0) {
    ctx.fillStyle = `rgba(120, 30, 40, ${0.28 * scene.hurt})`;
    ctx.fillRect(0, 0, world.width, world.height);
  }
  drawVignette(ctx, world.width, world.height);
  ctx.restore();
}

function drawFloor(ctx, map, warm, tones) {
  for (let row = 0; row < map.length; row += 1) {
    for (let col = 0; col < map[row].length; col += 1) {
      if (map[row][col] === "#") {
        continue;
      }
      const cell = map[row][col];
      const tone = (col * 13 + row * 29) % 9;
      const base = (warm ? 58 : 46) + tone;
      const mood = tones[cell];
      if (mood === "blood") {
        ctx.fillStyle = `rgb(${70 + tone}, 32, 36)`;
      } else if (mood === "warm") {
        ctx.fillStyle = `rgb(${90 + tone}, ${64 + tone}, 36)`;
      } else if (mood === "dark") {
        ctx.fillStyle = `rgb(${18 + tone}, ${22 + tone}, ${34 + tone})`;
      } else {
        ctx.fillStyle = `rgb(${base + (warm ? 10 : 0)}, ${base - 7}, ${base - 14})`;
      }
      ctx.fillRect(col * TILE, row * TILE, TILE + 0.5, TILE + 0.5);
      if ((col + row) % 4 === 0) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.13)";
        ctx.fillRect(col * TILE + 8, row * TILE + 18, 14, 3);
      }
    }
  }
}

function drawWalls(ctx, map) {
  for (let row = 0; row < map.length; row += 1) {
    for (let col = 0; col < map[row].length; col += 1) {
      if (map[row][col] !== "#") {
        continue;
      }
      const x = col * TILE;
      const y = row * TILE;
      const edge = row === 0 || col === 0 || row === map.length - 1 || col === map[0].length - 1;
      ctx.fillStyle = edge ? "#12100e" : "#1c1815";
      ctx.fillRect(x, y, TILE + 0.5, TILE + 0.5);
      if (edge && map[row + 1] && map[row + 1][col] !== "#") {
        ctx.fillStyle = "rgba(232, 165, 75, 0.14)";
        ctx.fillRect(x, y + TILE - 4, TILE, 4);
      }
    }
  }
}

function drawExits(ctx, map, tones, labels) {
  Object.entries(labels).forEach(([mark, label]) => {
    const spot = findMark(map, mark);
    if (!spot) {
      return;
    }
    const inward = spot.x < TILE * 2 ? TILE * 2.2 : spot.x > (map[0].length - 2) * TILE ? -TILE * 1.6 : 0;
    const upward = spot.y < TILE * 2 ? TILE * 1.8 : -TILE * 0.8;
    drawLabel(ctx, spot.x + inward, spot.y + upward, label);
    if (tones[mark] === "blood" && spot.x < TILE * 2) {
      drawLurker(ctx, spot.x + 10, spot.y);
    }
  });
}

function drawChest(ctx, x, y) {
  ctx.fillStyle = "#3a2a18";
  ctx.fillRect(x - 14, y - 8, 28, 18);
  ctx.strokeStyle = "#e8a54b";
  ctx.strokeRect(x - 14, y - 8, 28, 18);
}

function drawNote(ctx, x, y) {
  ctx.fillStyle = "#e4d3b0";
  ctx.fillRect(x - 10, y - 12, 20, 16);
}

function drawScratches(ctx) {
  ctx.strokeStyle = "rgba(120, 42, 48, 0.85)";
  ctx.lineWidth = 2;
  const originX = TILE + 14;
  const originY = TILE * 5 + 6;
  for (let i = 0; i < 4; i += 1) {
    ctx.beginPath();
    ctx.moveTo(originX, originY + i * 8);
    ctx.lineTo(originX + 28, originY + 16 + i * 8);
    ctx.stroke();
  }
}

function drawLurker(ctx, x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#2a1218";
  ctx.beginPath();
  ctx.moveTo(0, -34);
  ctx.lineTo(10, 16);
  ctx.lineTo(-10, 16);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
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

function drawLights(ctx, time, player, torches) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  torches.forEach((torch, index) => {
    const x = torch.col * TILE;
    const y = torch.row * TILE;
    const flicker = 0.75 + Math.sin(time * 3 + index) * 0.12;
    const radius = 118 * flicker;
    const glow = ctx.createRadialGradient(x, y, 4, x, y, radius);
    glow.addColorStop(0, "rgba(255, 214, 150, 0.55)");
    glow.addColorStop(1, "rgba(232, 165, 75, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffd7a1";
    ctx.fillRect(x - 2, y - 8, 4, 10);
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
