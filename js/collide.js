export const TILE = 48;

export const MAP = [
  "################",
  "#..............#",
  "#..............#",
  "#..##..........#",
  "#..##..........#",
  "#...........E..#",
  "#..............#",
  "#..##..........#",
  "#..##..........#",
  "#..............#",
  "#..............#",
  "################",
];

export const RADIUS = 14;
export const SPEED = 170;
export const HEAR_DISTANCE = 86;

export function worldSize() {
  return { width: MAP[0].length * TILE, height: MAP.length * TILE };
}

export function tileCenter(col, row) {
  return { x: col * TILE + TILE / 2, y: row * TILE + TILE / 2 };
}

export function findMark(mark) {
  for (let row = 0; row < MAP.length; row += 1) {
    const col = MAP[row].indexOf(mark);
    if (col >= 0) {
      return tileCenter(col, row);
    }
  }
  return tileCenter(1, 1);
}

export function solidAt(x, y) {
  const col = Math.floor(x / TILE);
  const row = Math.floor(y / TILE);
  if (row < 0 || col < 0 || row >= MAP.length || col >= MAP[0].length) {
    return true;
  }
  return MAP[row][col] === "#";
}

export function blocked(x, y, radius = RADIUS) {
  return (
    solidAt(x - radius, y - radius) ||
    solidAt(x + radius, y - radius) ||
    solidAt(x - radius, y + radius) ||
    solidAt(x + radius, y + radius)
  );
}

export function move(x, y, dx, dy) {
  const nextX = x + dx;
  const nextY = y + dy;
  if (!blocked(nextX, y)) {
    x = nextX;
  }
  if (!blocked(x, nextY)) {
    y = nextY;
  }
  return { x, y };
}

export function viewOf(cssWidth, cssHeight) {
  const world = worldSize();
  if (cssWidth < 2 || cssHeight < 2) {
    return { scale: 1, offsetX: 0, offsetY: 0 };
  }
  const scale = Math.min(cssWidth / world.width, cssHeight / world.height);
  return {
    scale,
    offsetX: (cssWidth - world.width * scale) / 2,
    offsetY: (cssHeight - world.height * scale) / 2,
  };
}
