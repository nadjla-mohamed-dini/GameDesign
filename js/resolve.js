export const LEFT_WOUND = 20;

export function wound(hp) {
  const next = hp - LEFT_WOUND;
  return { hp: Math.max(0, next), dead: next <= 0 };
}
