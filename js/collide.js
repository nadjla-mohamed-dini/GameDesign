export const TILE = 48;
export const RADIUS = 14;
export const SPEED = 170;
export const HEAR_DISTANCE = 86;

export function worldSize(map) {
  return { width: map[0].length * TILE, height: map.length * TILE };
}

export function tileCenter(col, row) {
  return { x: col * TILE + TILE / 2, y: row * TILE + TILE / 2 };
}

export function findMark(map, mark) {
  for (let row = 0; row < map.length; row += 1) {
    const col = map[row].indexOf(mark);
    if (col >= 0) {
      return tileCenter(col, row);
    }
  }
  return null;
}

export function tileAt(map, x, y) {
  const col = Math.floor(x / TILE);
  const row = Math.floor(y / TILE);
  if (row < 0 || col < 0 || row >= map.length || col >= map[0].length) {
    return "#";
  }
  return map[row][col];
}

export function solidAt(map, x, y) {
  return tileAt(map, x, y) === "#";
}

export function blocked(map, x, y, radius = RADIUS) {
  return (
    solidAt(map, x - radius, y - radius) ||
    solidAt(map, x + radius, y - radius) ||
    solidAt(map, x - radius, y + radius) ||
    solidAt(map, x + radius, y + radius)
  );
}

export function move(map, x, y, dx, dy) {
  const nextX = x + dx;
  const nextY = y + dy;
  if (!blocked(map, nextX, y)) {
    x = nextX;
  }
  if (!blocked(map, x, nextY)) {
    y = nextY;
  }
  return { x, y };
}

export function viewOf(map, cssWidth, cssHeight) {
  const world = worldSize(map);
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
