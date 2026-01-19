import { COVER_MAX_HITS } from '../state/battleConstants';

const ensureCoverHpMatrix = (board) =>
  board.coverHp || board.cover.map((row) => row.map((cell) => (cell ? COVER_MAX_HITS : 0)));

const updateMatrixCell = (matrix, r, c, value) =>
  matrix.map((row, rowIdx) =>
    rowIdx === r ? row.map((cell, colIdx) => (colIdx === c ? value : cell)) : [...row]
  );

export const damageCoverAt = (board, r, c, damage = 1) => {
  if (!board.cover?.[r]?.[c]) {
    return { board, destroyed: false, remaining: 0 };
  }
  const currentHpMatrix = ensureCoverHpMatrix(board);
  const currentHp = currentHpMatrix[r]?.[c] ?? COVER_MAX_HITS;
  const appliedDamage = Number.isFinite(damage) ? Math.max(1, Math.round(damage)) : 1;
  const nextHp = Math.max(0, currentHp - appliedDamage);
  const updatedHp = updateMatrixCell(currentHpMatrix, r, c, nextHp);
  const updatedCover = nextHp === 0 ? updateMatrixCell(board.cover, r, c, false) : board.cover;
  return {
    board: {
      ...board,
      cover: updatedCover,
      coverHp: updatedHp,
    },
    destroyed: nextHp === 0,
    remaining: nextHp,
  };
};

export const applyDamageWithArmor = (target, damage) => {
  let remaining = damage;
  const updated = { ...target };
  const logs = [];
  let killed = false;
  let damageApplied = false;

  if (remaining > 0 && updated.helmet && updated.helmetHp > 0) {
    const absorbed = Math.min(updated.helmetHp, remaining);
    updated.helmetHp -= absorbed;
    remaining -= absorbed;
    logs.push(`${target.name} bloqueo ${absorbed} de daño con casco (${updated.helmetHp} escudo)`);
    if (updated.helmetHp <= 0) {
      updated.helmet = null;
      updated.helmetHp = 0;
      logs.push(`El casco de ${target.name} se rompio`);
    }
  }

  if (remaining > 0 && updated.vest && updated.vestHp > 0) {
    const absorbed = Math.min(updated.vestHp, remaining);
    updated.vestHp -= absorbed;
    remaining -= absorbed;
    logs.push(`${target.name} bloqueo ${absorbed} de daño con chaleco (${updated.vestHp} escudo)`);
    if (updated.vestHp <= 0) {
      updated.vest = null;
      updated.vestHp = 0;
      logs.push(`El chaleco de ${target.name} se rompio`);
    }
  }

  if (remaining > 0) {
    const nextHp = Math.max(0, updated.hp - remaining);
    if (nextHp < updated.hp) {
      logs.push(`${target.name} recibio ${remaining} de daño (-${remaining} HP)`);
      damageApplied = true;
    }
    updated.hp = nextHp;
    updated.alive = nextHp > 0;
    if (!updated.alive) {
      logs.push(`${target.name} fue eliminado`);
      killed = true;
    }
  }

  return { unit: updated, logs, killed, damageApplied };
};
