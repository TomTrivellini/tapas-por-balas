const updateMatrixValue = (matrix, r, c, value) => {
  if (!matrix || !Array.isArray(matrix[r])) return matrix;
  return matrix.map((row, rowIdx) => {
    if (rowIdx !== r) return [...row];
    return row.map((cell, colIdx) => (colIdx === c ? value : cell));
  });
};

const normalizeBoardUpdateEntries = (updates) => {
  if (!updates) return [];
  const list = Array.isArray(updates) ? updates : [updates];
  const normalized = [];
  list.forEach((update) => {
    if (!update) return;
    if (update.type === 'cover' || update.type === 'coverHp') {
      normalized.push(update);
      return;
    }
    if (update.cover) {
      normalized.push({ type: 'cover', ...update.cover });
    }
    if (update.coverHp) {
      normalized.push({ type: 'coverHp', ...update.coverHp });
    }
  });
  return normalized;
};

export const applyUnitChanges = (units, updates = []) => {
  if (!updates || updates.length === 0) return units;
  const changesById = new Map();
  updates.forEach(({ unitId, changes }) => {
    if (!changesById.has(unitId)) {
      changesById.set(unitId, { ...changes });
    } else {
      Object.assign(changesById.get(unitId), changes);
    }
  });
  return units.map((unit) => {
    const change = changesById.get(unit.id);
    return change ? { ...unit, ...change } : unit;
  });
};

export const applyBoardUpdates = (board, updates) => {
  const normalized = normalizeBoardUpdateEntries(updates);
  if (normalized.length === 0) return board;
  let cover = board.cover;
  let coverHp = board.coverHp;
  normalized.forEach((update) => {
    if (update.type === 'cover') {
      cover = updateMatrixValue(cover, update.r, update.c, update.value);
    }
    if (update.type === 'coverHp') {
      coverHp = updateMatrixValue(coverHp, update.r, update.c, update.value);
    }
  });
  return cover === board.cover && coverHp === board.coverHp
    ? board
    : { ...board, cover, coverHp };
};
