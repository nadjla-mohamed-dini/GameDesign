export function applyChoice(current, exit) {
  const maxHp = current.maxHp ?? 100;
  let hp = current.hp;
  let shield = current.shield;
  let streak = current.streak;
  let shielded = false;

  if (exit.correct) {
    streak += 1;
  } else {
    streak = 0;
    if (shield) {
      shield = false;
      shielded = true;
    } else {
      hp = Math.max(0, hp - exit.damage);
    }
  }

  let reward = null;
  if (streak >= 3) {
    streak = 0;
    if (hp < maxHp) {
      hp = Math.min(maxHp, hp + 25);
      reward = "heal";
    } else if (!shield) {
      shield = true;
      reward = "shield";
    }
  }

  return { hp, shield, streak, reward, shielded, dead: hp <= 0 };
}
