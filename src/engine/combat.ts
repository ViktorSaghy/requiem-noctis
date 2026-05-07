// VTM5e Combat Engine
import { rollDice } from './dice';
import type { Character } from './character';
import type { EnemySpec } from './story';

// ─────────────── STATE TYPES ───────────────

export interface EnemyState {
  spec: EnemySpec;
  hp: number;
  superficialDmg: number;
  aggravatedDmg: number;
  willpower: number;
  hunger: number;
  stunned: boolean;
  attackPenalty: number;
}

export interface PlayerCombatState {
  hp: number;
  superficialDmg: number;
  aggravatedDmg: number;
  willpower: number;
  hunger: number;
  isFullDefense: boolean;
  fortitudeShield: number;
}

export type CombatOutcome = 'ongoing' | 'victory' | 'defeat' | 'fled';

export interface CombatLogEntry {
  id: number;
  round: number;
  actor: string;
  action: string;
  result: string;
  isPlayer: boolean;
}

export interface CombatState {
  round: number;
  enemies: EnemyState[];
  player: PlayerCombatState;
  log: CombatLogEntry[];
  outcome: CombatOutcome;
  logCounter: number;
}

// ─────────────── DISCIPLINE ACTIONS ───────────────

export interface DiscAction {
  id: string;
  label: string;
  description: string;
  discipline: string;
  minLevel: number;
  requiresRouse: boolean;
  needsTarget: boolean;
}

export const DISC_ACTIONS: DiscAction[] = [
  { id: 'potence_strike',      label: 'Potence Strike',        description: '+2 dice, deals aggravated damage',             discipline: 'Potence',      minLevel: 1, requiresRouse: false, needsTarget: true  },
  { id: 'celerity_dodge',      label: 'Celerity Dodge',        description: 'Double defense pool, no attack this round',    discipline: 'Celerity',     minLevel: 1, requiresRouse: true,  needsTarget: false },
  { id: 'fortitude_endure',    label: 'Fortitude Endure',      description: 'Reduce all incoming damage by 2 this round',   discipline: 'Fortitude',    minLevel: 1, requiresRouse: false, needsTarget: false },
  { id: 'presence_dread',      label: 'Dread Gaze',            description: 'All enemies −2 to attacks this round',         discipline: 'Presence',     minLevel: 1, requiresRouse: true,  needsTarget: false },
  { id: 'dominate_mesmerize',  label: 'Mesmerize',             description: 'One enemy loses their next action (contested)', discipline: 'Dominate',     minLevel: 1, requiresRouse: true,  needsTarget: true  },
  { id: 'auspex_strike',       label: 'Heightened Strike',     description: '+3 dice to your next attack',                  discipline: 'Auspex',       minLevel: 1, requiresRouse: false, needsTarget: true  },
  { id: 'obfuscate_vanish',    label: 'Vanish',                description: 'All enemies −3 to attacks this round',         discipline: 'Obfuscate',    minLevel: 2, requiresRouse: true,  needsTarget: false },
  { id: 'protean_claws',       label: 'Feral Claws',           description: 'Attack with claws — aggravated damage',        discipline: 'Protean',      minLevel: 1, requiresRouse: true,  needsTarget: true  },
  { id: 'bloodsorcery_strike', label: 'Scorching Vitae',       description: 'Magical assault — 3 base aggravated damage',   discipline: 'BloodSorcery', minLevel: 1, requiresRouse: true,  needsTarget: true  },
  { id: 'oblivion_drain',      label: 'Void Touch',            description: 'Drain 2 Willpower from one enemy',             discipline: 'Oblivion',     minLevel: 1, requiresRouse: true,  needsTarget: true  },
  { id: 'animalism_frenzy',    label: 'Unleash the Beast',     description: 'One enemy: −2 attack, 50% chance stunned',     discipline: 'Animalism',    minLevel: 1, requiresRouse: true,  needsTarget: true  },
];

export function getAvailableDiscActions(char: Character): DiscAction[] {
  return DISC_ACTIONS.filter(a => {
    const level = (char.disciplines as Record<string, number | undefined>)[a.discipline];
    return level !== undefined && level >= a.minLevel;
  });
}

// ─────────────── HELPERS ───────────────

function roll(pool: number, hunger: number) {
  return rollDice(Math.max(1, pool), Math.min(Math.max(0, hunger), Math.max(1, pool)));
}

function rouseCheck(currentHunger: number): { newHunger: number; rolled: number; success: boolean } {
  const r = Math.ceil(Math.random() * 10);
  return { newHunger: r >= 6 ? currentHunger : Math.min(5, currentHunger + 1), rolled: r, success: r >= 6 };
}

function applyDmgToPlayer(
  player: PlayerCombatState,
  damage: number,
  type: 'superficial' | 'aggravated',
  maxHp: number,
): PlayerCombatState {
  const dmg = type === 'superficial' ? Math.ceil(damage / 2) : damage;
  const p = { ...player };
  if (type === 'aggravated') {
    p.aggravatedDmg = Math.min(p.aggravatedDmg + dmg, maxHp);
  } else {
    const avail = maxHp - p.aggravatedDmg - p.superficialDmg;
    const fill = Math.min(dmg, Math.max(0, avail));
    p.superficialDmg += fill;
    const overflow = dmg - fill;
    if (overflow > 0) p.aggravatedDmg = Math.min(p.aggravatedDmg + overflow, maxHp);
  }
  p.hp = Math.max(0, maxHp - p.superficialDmg - p.aggravatedDmg);
  return p;
}

function applyDmgToEnemy(enemy: EnemyState, damage: number, type: 'superficial' | 'aggravated'): EnemyState {
  const dmg = type === 'superficial' ? Math.ceil(damage / 2) : damage;
  const e = { ...enemy };
  const maxHp = e.spec.maxHealth;
  if (type === 'aggravated') {
    e.aggravatedDmg = Math.min(e.aggravatedDmg + dmg, maxHp);
  } else {
    const avail = maxHp - e.aggravatedDmg - e.superficialDmg;
    const fill = Math.min(dmg, Math.max(0, avail));
    e.superficialDmg += fill;
    const overflow = dmg - fill;
    if (overflow > 0) e.aggravatedDmg = Math.min(e.aggravatedDmg + overflow, maxHp);
  }
  e.hp = Math.max(0, maxHp - e.superficialDmg - e.aggravatedDmg);
  return e;
}

function isDefeated(e: EnemyState) { return e.hp <= 0; }
function isPlayerDown(p: PlayerCombatState) { return p.hp <= 0; }

// ─────────────── INIT ───────────────

export function initCombat(character: Character, enemies: EnemySpec[]): CombatState {
  return {
    round: 1,
    enemies: enemies.map(spec => ({
      spec,
      hp: spec.maxHealth,
      superficialDmg: 0,
      aggravatedDmg: 0,
      willpower: spec.maxWillpower,
      hunger: spec.hunger,
      stunned: false,
      attackPenalty: 0,
    })),
    player: {
      hp: character.health,
      superficialDmg: 0,
      aggravatedDmg: 0,
      willpower: character.willpower,
      hunger: character.hunger,
      isFullDefense: false,
      fortitudeShield: 0,
    },
    log: [],
    outcome: 'ongoing',
    logCounter: 0,
  };
}

// ─────────────── ACTION TYPES ───────────────

export type CombatAction =
  | { type: 'attack'; targetIdx: number; wpBoost?: boolean }
  | { type: 'full_defense' }
  | { type: 'discipline'; actionId: string; targetIdx?: number }
  | { type: 'flee' };

// ─────────────── ROUND PROCESSOR ───────────────

export function processCombatRound(
  state: CombatState,
  action: CombatAction,
  character: Character,
): CombatState {
  if (state.outcome !== 'ongoing') return state;

  let s: CombatState = { ...state, log: [...state.log], enemies: [...state.enemies] };
  let logId = s.logCounter;

  function addLog(actor: string, actionLabel: string, result: string, isPlayer: boolean) {
    s = { ...s, log: [...s.log, { id: logId++, round: s.round, actor, action: actionLabel, result, isPlayer }] };
  }

  // ── PLAYER ACTION ──
  if (action.type === 'full_defense') {
    s = { ...s, player: { ...s.player, isFullDefense: true } };
    addLog(character.name, 'Full Defense', 'Defense doubled — no attack this round', true);

  } else if (action.type === 'flee') {
    const alive = s.enemies.filter(e => !isDefeated(e));
    const avgPursuit = Math.ceil(alive.reduce((sum, e) => sum + e.spec.defensePool, 0) / Math.max(1, alive.length));
    const fleePool = character.attributes.Dexterity + (character.skills.Stealth ?? 0);
    const fr = roll(fleePool, s.player.hunger);
    const pr = roll(avgPursuit, 0);
    if (fr.successes > pr.successes) {
      addLog(character.name, 'Flee', `Escaped! (${fr.successes} vs ${pr.successes})`, true);
      return { ...s, outcome: 'fled', logCounter: logId };
    }
    addLog(character.name, 'Flee', `Failed (${fr.successes} vs ${pr.successes}) — enemies retaliate`, true);

  } else if (action.type === 'attack') {
    const tidx = action.targetIdx;
    const target = s.enemies[tidx];
    if (!isDefeated(target)) {
      const atkPool = character.attributes.Strength + (character.skills.Brawl ?? 0) + (action.wpBoost ? 3 : 0);
      const atk = roll(atkPool, s.player.hunger);
      const def = roll(Math.max(1, target.spec.defensePool), target.hunger);
      const net = Math.max(0, atk.successes - def.successes);
      if (net > 0) {
        const newEnemies = [...s.enemies];
        newEnemies[tidx] = applyDmgToEnemy(target, net, 'superficial');
        s = { ...s, enemies: newEnemies };
        addLog(character.name, 'Attack', `${net} superficial dmg → ${target.spec.name} (${atk.successes} vs ${def.successes})`, true);
      } else {
        addLog(character.name, 'Attack', `Blocked by ${target.spec.name} (${atk.successes} vs ${def.successes})`, true);
      }
      if (action.wpBoost) {
        s = { ...s, player: { ...s.player, willpower: Math.max(0, s.player.willpower - 1) } };
      }
    }

  } else if (action.type === 'discipline') {
    const da = DISC_ACTIONS.find(a => a.id === action.actionId);
    if (da) {
      if (da.requiresRouse) {
        const rouse = rouseCheck(s.player.hunger);
        s = { ...s, player: { ...s.player, hunger: rouse.newHunger } };
        addLog(character.name, 'Rouse Check', rouse.success
          ? `Rolled ${rouse.rolled} — no increase`
          : `Rolled ${rouse.rolled} — Hunger ${rouse.newHunger}`, true);
      }

      const tidx = action.targetIdx ?? 0;
      const target = s.enemies[tidx];

      switch (da.id) {
        case 'potence_strike': {
          if (!isDefeated(target)) {
            const atkPool = character.attributes.Strength + (character.skills.Brawl ?? 0) + 2;
            const atk = roll(atkPool, s.player.hunger);
            const def = roll(Math.max(1, target.spec.defensePool), target.hunger);
            const net = Math.max(0, atk.successes - def.successes);
            if (net > 0) {
              const ne = [...s.enemies]; ne[tidx] = applyDmgToEnemy(target, net, 'aggravated'); s = { ...s, enemies: ne };
              addLog(character.name, 'Potence Strike', `${net} AGGRAVATED → ${target.spec.name} (${atk.successes} vs ${def.successes})`, true);
            } else {
              addLog(character.name, 'Potence Strike', `Blocked (${atk.successes} vs ${def.successes})`, true);
            }
          }
          break;
        }
        case 'celerity_dodge': {
          s = { ...s, player: { ...s.player, isFullDefense: true } };
          addLog(character.name, 'Celerity Dodge', 'Defense doubled for this round', true);
          break;
        }
        case 'fortitude_endure': {
          s = { ...s, player: { ...s.player, fortitudeShield: 2 } };
          addLog(character.name, 'Fortitude Endure', 'Incoming damage reduced by 2 this round', true);
          break;
        }
        case 'presence_dread': {
          s = { ...s, enemies: s.enemies.map(e => isDefeated(e) ? e : { ...e, attackPenalty: e.attackPenalty + 2 }) };
          addLog(character.name, 'Dread Gaze', 'All enemies −2 to attacks this round', true);
          break;
        }
        case 'dominate_mesmerize': {
          if (!isDefeated(target)) {
            const domPool = character.attributes.Manipulation + (character.disciplines.Dominate ?? 0);
            const resistPool = Math.min(target.willpower, 5);
            const dr = roll(domPool, s.player.hunger);
            const rr = roll(Math.max(1, resistPool), target.hunger);
            if (dr.successes > rr.successes) {
              const ne = [...s.enemies]; ne[tidx] = { ...target, stunned: true }; s = { ...s, enemies: ne };
              addLog(character.name, 'Mesmerize', `${target.spec.name} stunned (${dr.successes} vs ${rr.successes})`, true);
            } else {
              addLog(character.name, 'Mesmerize', `Resisted (${dr.successes} vs ${rr.successes})`, true);
            }
          }
          break;
        }
        case 'auspex_strike': {
          if (!isDefeated(target)) {
            const atkPool = character.attributes.Strength + (character.skills.Brawl ?? 0) + 3;
            const atk = roll(atkPool, s.player.hunger);
            const def = roll(Math.max(1, target.spec.defensePool), target.hunger);
            const net = Math.max(0, atk.successes - def.successes);
            if (net > 0) {
              const ne = [...s.enemies]; ne[tidx] = applyDmgToEnemy(target, net, 'superficial'); s = { ...s, enemies: ne };
              addLog(character.name, 'Heightened Strike', `${net} dmg → ${target.spec.name} (${atk.successes} vs ${def.successes})`, true);
            } else {
              addLog(character.name, 'Heightened Strike', `Blocked (${atk.successes} vs ${def.successes})`, true);
            }
          }
          break;
        }
        case 'obfuscate_vanish': {
          s = { ...s, enemies: s.enemies.map(e => isDefeated(e) ? e : { ...e, attackPenalty: e.attackPenalty + 3 }) };
          addLog(character.name, 'Vanish', 'All enemies −3 to attacks this round', true);
          break;
        }
        case 'protean_claws': {
          if (!isDefeated(target)) {
            const atkPool = character.attributes.Strength + (character.skills.Brawl ?? 0);
            const atk = roll(atkPool, s.player.hunger);
            const def = roll(Math.max(1, target.spec.defensePool), target.hunger);
            const net = Math.max(0, atk.successes - def.successes);
            if (net > 0) {
              const ne = [...s.enemies]; ne[tidx] = applyDmgToEnemy(target, net, 'aggravated'); s = { ...s, enemies: ne };
              addLog(character.name, 'Feral Claws', `${net} AGGRAVATED → ${target.spec.name} (${atk.successes} vs ${def.successes})`, true);
            } else {
              addLog(character.name, 'Feral Claws', `Blocked (${atk.successes} vs ${def.successes})`, true);
            }
          }
          break;
        }
        case 'bloodsorcery_strike': {
          if (!isDefeated(target)) {
            const sorcPool = character.attributes.Intelligence + (character.disciplines.BloodSorcery ?? 0) + 2;
            const resistPool = Math.ceil(target.spec.maxHealth / 2);
            const sr = roll(sorcPool, s.player.hunger);
            const rr = roll(Math.max(1, resistPool), target.hunger);
            const dmg = Math.max(1, 3 + sr.successes - rr.successes);
            const ne = [...s.enemies]; ne[tidx] = applyDmgToEnemy(target, dmg, 'aggravated'); s = { ...s, enemies: ne };
            addLog(character.name, 'Scorching Vitae', `${dmg} AGGRAVATED → ${target.spec.name}`, true);
          }
          break;
        }
        case 'oblivion_drain': {
          if (!isDefeated(target)) {
            const drain = Math.min(2, target.willpower);
            const ne = [...s.enemies]; ne[tidx] = { ...target, willpower: target.willpower - drain }; s = { ...s, enemies: ne };
            addLog(character.name, 'Void Touch', `${target.spec.name} loses ${drain} Willpower`, true);
          }
          break;
        }
        case 'animalism_frenzy': {
          if (!isDefeated(target)) {
            const stunned = Math.random() < 0.5;
            const ne = [...s.enemies]; ne[tidx] = { ...target, attackPenalty: target.attackPenalty + 2, stunned }; s = { ...s, enemies: ne };
            addLog(character.name, 'Unleash the Beast', `${target.spec.name}: −2 attack${stunned ? ', stunned' : ''}`, true);
          }
          break;
        }
      }
    }
  }

  // Victory check after player action
  if (s.enemies.every(isDefeated)) {
    return { ...s, outcome: 'victory', logCounter: logId };
  }

  // ── ENEMY PHASE ──
  const living = s.enemies.map((e, i) => ({ e, i })).filter(({ e }) => !isDefeated(e));

  for (const { i } of living) {
    let enemy = s.enemies[i];

    // Boss regen
    const regen = (enemy.spec as unknown as Record<string, number>).regenPerRound ?? 0;
    if (regen > 0 && enemy.superficialDmg > 0) {
      const healed = Math.min(regen, enemy.superficialDmg);
      const ne = [...s.enemies];
      ne[i] = { ...enemy, superficialDmg: enemy.superficialDmg - healed, hp: enemy.hp + healed };
      s = { ...s, enemies: ne };
      enemy = s.enemies[i];
      addLog(enemy.spec.name, 'Regenerate', `Healed ${healed} superficial damage`, false);
    }

    if (enemy.stunned) {
      const ne = [...s.enemies]; ne[i] = { ...enemy, stunned: false }; s = { ...s, enemies: ne };
      addLog(enemy.spec.name, 'Stunned', 'Cannot act this round', false);
      continue;
    }

    const atkPool = Math.max(1, enemy.spec.attackPool - enemy.attackPenalty);
    const defPool = character.attributes.Dexterity + (character.skills.Athletics ?? 0);
    const defMult = s.player.isFullDefense ? 2 : 1;

    const ea = roll(atkPool, enemy.hunger);
    const pd = roll(Math.max(1, defPool * defMult), s.player.hunger);
    const net = Math.max(0, ea.successes - pd.successes);

    if (net > 0) {
      const shield = s.player.fortitudeShield;
      const effective = Math.max(0, net - shield);
      const dmgType = enemy.spec.damageType;
      if (effective > 0) {
        s = { ...s, player: applyDmgToPlayer(s.player, effective, dmgType, character.health) };
        const note = dmgType === 'superficial' ? ` (${Math.ceil(effective / 2)} after resistance)` : '';
        addLog(enemy.spec.name, `${dmgType === 'aggravated' ? 'Agg ' : ''}Attack`,
          `${effective} ${dmgType} → ${character.name}${note} (${ea.successes} vs ${pd.successes})`, false);
      } else {
        addLog(enemy.spec.name, 'Attack', `Fortitude absorbs all damage (${ea.successes} vs ${pd.successes})`, false);
      }
    } else {
      addLog(enemy.spec.name, 'Attack', `Blocked by ${character.name} (${ea.successes} vs ${pd.successes})`, false);
    }

    if (isPlayerDown(s.player)) {
      return { ...s, outcome: 'defeat', logCounter: logId };
    }
  }

  // End of round — reset per-round effects
  return {
    ...s,
    round: s.round + 1,
    logCounter: logId,
    player: { ...s.player, isFullDefense: false, fortitudeShield: 0 },
    enemies: s.enemies.map(e => ({ ...e, attackPenalty: 0 })),
  };
}
