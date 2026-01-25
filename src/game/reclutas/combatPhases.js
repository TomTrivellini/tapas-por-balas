import { pickShotTarget } from '../state/battleRules';
import {
  buildCoverEvent,
  buildObjectEvent,
  buildProjectile,
  buildShotEvent,
  getMissDestination,
  SHOT_PHASE_MS,
} from './combatAnimations';
import { applyDamageWithArmor, damageCoverAt } from './combatDamage';
import { pickAllShotTargets, pickCoverOnlyTarget } from './combatTargets';

export const resolveSupportActions = ({
  participants,
  actionIndex,
  itemsById,
  board,
  getUnits,
  applyUnitUpdates,
  recordLog,
  pushProjectile,
  registerEvent,
  killed,
  frameDuration,
  suffix,
}) => {
  const supportActions = participants.filter(
    (entry) =>
      ['COVER', 'RELOAD', 'USE_OBJECT'].includes(entry.action.type) &&
      entry.snapshot.alive
  );

  supportActions.forEach(({ unitId, action, snapshot }) => {
    if (action.type === 'COVER') {
      if (board.cover?.[snapshot.r]?.[snapshot.c]) {
        applyUnitUpdates(unitId, { isCovered: true });
        registerEvent(
          buildCoverEvent({
            id: `cover-${unitId}-${actionIndex}`,
            unitId,
            team: snapshot.team,
            name: snapshot.name,
          })
        );
        recordLog(`${snapshot.name} tomo cobertura ${suffix}`, snapshot.team);
      }
      return;
    }
    if (action.type === 'RELOAD') {
      const unit = getUnits().find((u) => u.id === unitId);
      if (!unit || unit.ammo <= 0) return;
      applyUnitUpdates(unitId, { ammo: Math.max(0, unit.ammo - 1), loaded: true });
      recordLog(`${snapshot.name} recargo ${suffix}`, snapshot.team);
      return;
    }
    if (action.type === 'USE_OBJECT') {
      const unit = getUnits().find((u) => u.id === unitId);
      if (!unit || !unit.objectItem || !itemsById) return;
      const objectEntry = itemsById.get(unit.objectItem);
      const healValue = objectEntry?.heal || 0;
      const apBonusValue = objectEntry?.apBonus || 0;
      const apBonusRounds = objectEntry?.apBonusRounds || 0;
      const damageValue = objectEntry?.damage || 0;
      const immobilizeRounds = objectEntry?.immobilizeRounds || 0;
      const objectName = objectEntry?.name || 'objeto';

      if (apBonusValue > 0 && apBonusRounds > 0) {
        const objectLabel = `${objectEntry?.id || ''} ${objectEntry?.name || ''}`.toLowerCase();
        const isCig = /cig|cigarrillo|cigar|tabaco|smoke/.test(objectLabel);
        const currentBonus = unit.apBonusRounds || 0;
        const currentValue = unit.apBonus || 0;
        const currentSmoke = unit.smokeRounds || 0;
        const nextSmokeRounds = isCig ? Math.max(currentSmoke, apBonusRounds) : currentSmoke;
        applyUnitUpdates(unitId, {
          objectItem: null,
          apBonusRounds: Math.max(currentBonus, apBonusRounds),
          apBonus: Math.max(currentValue, apBonusValue),
          ...(isCig ? { smokeRounds: nextSmokeRounds } : {}),
        });
        registerEvent(
          buildObjectEvent({
            id: `obj-use-${unitId}-${actionIndex}-buff`,
            unitId,
            team: snapshot.team,
            name: snapshot.name,
            objectId: objectEntry?.id || objectName,
            visual: 'cig',
            objectKind: 'mouth',
          })
        );
        recordLog(
          `${snapshot.name} uso ${objectName} y gano +${apBonusValue} AP por ${apBonusRounds} rondas ${suffix}`,
          snapshot.team
        );
        return;
      }

      if (damageValue > 0 || immobilizeRounds > 0) {
        applyUnitUpdates(unitId, { objectItem: null, isCovered: false });
        const row = action.row ?? snapshot.r;
        const units = getUnits();
        const targets = objectEntry?.pierce
          ? pickAllShotTargets(snapshot.team, row, units)
          : [pickShotTarget(snapshot.team, row, board, units)].filter(Boolean);
        if (targets.length > 0) {
          targets.forEach((target) => {
            const damageResult = applyDamageWithArmor(target, damageValue);
            applyUnitUpdates(target.id, {
              hp: damageResult.unit.hp,
              alive: damageResult.unit.alive,
              helmet: damageResult.unit.helmet,
              helmetHp: damageResult.unit.helmetHp,
              vest: damageResult.unit.vest,
              vestHp: damageResult.unit.vestHp,
              isCovered: damageResult.unit.isCovered,
              movementLock: immobilizeRounds
                ? Math.max(target.movementLock || 0, immobilizeRounds)
                : target.movementLock,
            });
            if (damageResult.killed) killed.push(damageResult.unit);
            pushProjectile(
              buildProjectile({
                id: `obj-${unitId}-${actionIndex}-${target.id}`,
                from: { r: snapshot.r, c: snapshot.c },
                to: { r: target.r, c: target.c },
              })
            );
            const projectileType = objectEntry?.immobilizeRounds
              ? 'net'
              : /lanza|red/i.test(objectName || '')
                ? 'net'
                : 'bullet';
            const hitType = damageResult.damageApplied ? 'hp' : 'shield';
            registerEvent(
              buildShotEvent({
                id: `obj-shot-${unitId}-${actionIndex}-${target.id}`,
                unitId,
                team: snapshot.team,
                name: snapshot.name,
                from: { r: snapshot.r, c: snapshot.c },
                to: { r: target.r, c: target.c },
                duration: SHOT_PHASE_MS,
                result: 'hit',
                projectile: projectileType,
                hitType,
                targetId: target.id,
              })
            );
            registerEvent(
              buildObjectEvent({
                id: `obj-use-${unitId}-${actionIndex}-${target.id}`,
                unitId,
                team: snapshot.team,
                name: snapshot.name,
                objectId: objectEntry?.id || objectName,
                visual: 'hand',
                objectKind: 'secondary',
              })
            );
            const summary = damageResult.damageApplied
              ? `${snapshot.name} uso ${objectName} y golpeo a ${target.name}`
              : `${snapshot.name} uso ${objectName} sobre ${target.name}`;
            recordLog(`${summary} ${suffix}`, snapshot.team);
          });
        } else {
          const miss = getMissDestination(snapshot, board);
          pushProjectile(
            buildProjectile({
              id: `obj-${unitId}-${actionIndex}-miss`,
              from: { r: snapshot.r, c: snapshot.c },
              to: miss,
            })
          );
          const projectileType = objectEntry?.immobilizeRounds
            ? 'net'
            : /lanza|red/i.test(objectName || '')
              ? 'net'
              : 'bullet';
          registerEvent(
            buildShotEvent({
              id: `obj-shot-${unitId}-${actionIndex}`,
              unitId,
              team: snapshot.team,
              name: snapshot.name,
              from: { r: snapshot.r, c: snapshot.c },
              to: miss,
              duration: SHOT_PHASE_MS,
              result: 'miss',
              projectile: projectileType,
              targetId: null,
            })
          );
          registerEvent(
            buildObjectEvent({
              id: `obj-use-${unitId}-${actionIndex}-miss`,
              unitId,
              team: snapshot.team,
              name: snapshot.name,
              objectId: objectEntry?.id || objectName,
              visual: 'hand',
              objectKind: 'secondary',
            })
          );
          recordLog(`${snapshot.name} uso ${objectName} y fallo ${suffix}`, snapshot.team);
        }
      } else {
        const maxHp = snapshot.maxHp && snapshot.maxHp > 0 ? snapshot.maxHp : null;
        const targetMax = maxHp !== null ? maxHp : snapshot.hp + healValue;
        const newHp = healValue > 0 ? Math.min(snapshot.hp + healValue, targetMax) : snapshot.hp;
        applyUnitUpdates(unitId, { hp: newHp, objectItem: null });
        registerEvent(
          buildObjectEvent({
            id: `obj-use-${unitId}-${actionIndex}-heal`,
            unitId,
            team: snapshot.team,
            name: snapshot.name,
            objectId: objectEntry?.id || objectName,
            visual: 'face',
            objectKind: 'consume',
          })
        );
        recordLog(`${snapshot.name} uso ${objectName} ${suffix}`, snapshot.team);
      }
    }
  });

  return { board };
};

export const resolveShootActions = ({
  participants,
  actionIndex,
  itemsById,
  board,
  getUnits,
  applyUnitUpdates,
  recordLog,
  pushProjectile,
  registerEvent,
  boardUpdates,
  killed,
  frameDuration,
  suffix,
}) => {
  let newBoard = board;
  const shootActions = participants.filter(
    (entry) => entry.action.type === 'SHOOT' && entry.snapshot.alive
  );

  shootActions.forEach(({ unitId, action, snapshot }) => {
    const units = getUnits();
    const unit = units.find((u) => u.id === unitId);
    const weapon = unit?.weapon && itemsById ? itemsById.get(unit.weapon) : null;
    const vestEntry = unit?.vest && itemsById ? itemsById.get(unit.vest) : null;
    const onHitHeal = typeof vestEntry?.onHitHeal === 'number' ? vestEntry.onHitHeal : 0;
    const damage = weapon?.damage || 1;
    const pierce = Boolean(weapon?.pierce);
    const row = action.row ?? snapshot.r;

    applyUnitUpdates(unitId, { loaded: false, isCovered: false });

    const targets = pierce
      ? pickAllShotTargets(snapshot.team, row, units)
      : [pickShotTarget(snapshot.team, row, newBoard, units)].filter(Boolean);

    if (targets.length > 0) {
      targets.forEach((target) => {
        const damageResult = applyDamageWithArmor(target, damage);
        let movementLock = target.movementLock || 0;
        if (weapon?.immobilizeRounds) {
          movementLock = Math.max(movementLock, weapon.immobilizeRounds);
        }
        applyUnitUpdates(target.id, {
          hp: damageResult.unit.hp,
          alive: damageResult.unit.alive,
          helmet: damageResult.unit.helmet,
          helmetHp: damageResult.unit.helmetHp,
          vest: damageResult.unit.vest,
          vestHp: damageResult.unit.vestHp,
          isCovered: damageResult.unit.isCovered,
          movementLock,
        });
        if (onHitHeal > 0) {
          const currentShooter = getUnits().find((u) => u.id === unitId);
          if (currentShooter && currentShooter.alive) {
            const maxHp =
              currentShooter.maxHp && currentShooter.maxHp > 0
                ? currentShooter.maxHp
                : currentShooter.hp + onHitHeal;
            const nextHp = Math.min(currentShooter.hp + onHitHeal, maxHp);
            if (nextHp !== currentShooter.hp) {
              applyUnitUpdates(unitId, { hp: nextHp });
              recordLog(
                `${snapshot.name} recupero ${onHitHeal} HP con ${vestEntry?.name || 'chupasangre'} ${suffix}`,
                snapshot.team
              );
            }
          }
        }
        if (damageResult.killed) killed.push(damageResult.unit);
        pushProjectile(
          buildProjectile({
            id: `shot-${unitId}-${actionIndex}-${target.id}`,
            from: { r: snapshot.r, c: snapshot.c },
            to: { r: target.r, c: target.c },
          })
        );
        const hitType = damageResult.damageApplied ? 'hp' : 'shield';
        registerEvent(
          buildShotEvent({
            id: `shot-${unitId}-${actionIndex}-${target.id}`,
            unitId,
            team: snapshot.team,
            name: snapshot.name,
            from: { r: snapshot.r, c: snapshot.c },
            to: { r: target.r, c: target.c },
            duration: SHOT_PHASE_MS,
            result: 'hit',
            hitType,
            targetId: target.id,
          })
        );
        const summary = damageResult.damageApplied
          ? `${snapshot.name} disparo a ${target.name} (-${damage} HP)`
          : `${snapshot.name} disparo a la cobertura de ${target.name}`;
        recordLog(`${summary} ${suffix}`, snapshot.team);
      });
    } else {
      const coverTarget = pickCoverOnlyTarget(snapshot.team, row, units);
      if (coverTarget) {
        const coverDamage = damageCoverAt(newBoard, coverTarget.r, coverTarget.c, damage);
        newBoard = coverDamage.board;
        boardUpdates.push(
          { type: 'cover', r: coverTarget.r, c: coverTarget.c, value: !coverDamage.destroyed },
          { type: 'coverHp', r: coverTarget.r, c: coverTarget.c, value: coverDamage.remaining }
        );
        if (coverDamage.destroyed) {
          applyUnitUpdates(coverTarget.id, { isCovered: false });
          recordLog(`La cobertura de ${coverTarget.name} fue destruida ${suffix}`, snapshot.team);
        }
        pushProjectile(
          buildProjectile({
            id: `shot-${unitId}-${actionIndex}-cover`,
            from: { r: snapshot.r, c: snapshot.c },
            to: { r: coverTarget.r, c: coverTarget.c },
          })
        );
        registerEvent(
          buildShotEvent({
            id: `shot-${unitId}-${actionIndex}-cover`,
            unitId,
            team: snapshot.team,
            name: snapshot.name,
            from: { r: snapshot.r, c: snapshot.c },
            to: { r: coverTarget.r, c: coverTarget.c },
            duration: SHOT_PHASE_MS,
            result: coverDamage.destroyed ? 'coverDestroyed' : 'coverBlocked',
            hitType: 'shield',
            targetId: coverTarget.id,
          })
        );
        recordLog(`${snapshot.name} disparo a la cobertura ${suffix}`, snapshot.team);
      } else {
        const miss = getMissDestination(snapshot, newBoard);
        pushProjectile(
          buildProjectile({
            id: `shot-${unitId}-${actionIndex}-miss`,
            from: { r: snapshot.r, c: snapshot.c },
            to: miss,
          })
        );
        registerEvent(
          buildShotEvent({
            id: `shot-${unitId}-${actionIndex}-miss`,
            unitId,
            team: snapshot.team,
            name: snapshot.name,
            from: { r: snapshot.r, c: snapshot.c },
            to: miss,
            duration: SHOT_PHASE_MS,
            result: 'miss',
            targetId: null,
          })
        );
        recordLog(`${snapshot.name} disparo y fallo ${suffix}`, snapshot.team);
      }
    }

    if (weapon?.disposable) {
      applyUnitUpdates(unitId, { weapon: null, ammo: 0 });
    }
  });

  return { board: newBoard };
};
