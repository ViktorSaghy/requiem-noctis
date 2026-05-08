// VTM5e Combat Engine
import { rollDice } from './dice';
import type { DiceResult } from './dice';
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
  auspexShield: number;      // enemy attack penalty from Premonition
  isFrenzy: boolean;
  compulsion: string | null; // active compulsion text to display
  compulsionDicePenalty: number;
  compulsionForceAttack: boolean;
}

export type CombatOutcome = 'ongoing' | 'victory' | 'defeat' | 'fled';

export interface CombatLogEntry {
  id: number;
  round: number;
  actor: string;
  action: string;
  result: string;
  isPlayer: boolean;
  isFrenzy?: boolean;
  isCompulsion?: boolean;
  dice?: string;
  narration?: string;
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
  // Potence — level 1: pool bonus, superficial (no rouse); level 2: aggravated with rouse
  { id: 'potence_strike',      label: 'Potence Strike',   description: '+Potence dots to attack pool, superficial damage, no Rouse',     discipline: 'Potence',      minLevel: 1, requiresRouse: false, needsTarget: true  },
  { id: 'potence_fury',        label: 'Lethal Blow',      description: 'Rouse: +Potence dots, deals aggravated damage',                   discipline: 'Potence',      minLevel: 2, requiresRouse: true,  needsTarget: true  },
  // Celerity — level 1: attack pool bonus (no rouse), per VTM5e
  { id: 'celerity_strike',     label: 'Celerity Strike',  description: '+Celerity dots to attack pool, no Rouse',                         discipline: 'Celerity',     minLevel: 1, requiresRouse: false, needsTarget: true  },
  { id: 'fortitude_endure',    label: 'Fortitude Endure', description: 'Reduce all incoming damage by 2 this round',                      discipline: 'Fortitude',    minLevel: 1, requiresRouse: false, needsTarget: false },
  { id: 'presence_dread',      label: 'Dread Gaze',       description: 'Rouse: all enemies −2 to attacks this round',                     discipline: 'Presence',     minLevel: 1, requiresRouse: true,  needsTarget: false },
  { id: 'dominate_mesmerize',  label: 'Mesmerize',        description: 'Rouse: one enemy loses their next action (contested)',             discipline: 'Dominate',     minLevel: 1, requiresRouse: true,  needsTarget: true  },
  // Auspex — premonition: read incoming strikes, reduce enemy attack pool (not an attack bonus)
  { id: 'auspex_sense',        label: 'Premonition',      description: 'Read enemy attacks: reduce all enemy attack pools by Auspex dots, no Rouse', discipline: 'Auspex', minLevel: 1, requiresRouse: false, needsTarget: false },
  { id: 'obfuscate_vanish',    label: 'Vanish',           description: 'Rouse: all enemies −3 to attacks this round',                     discipline: 'Obfuscate',    minLevel: 2, requiresRouse: true,  needsTarget: false },
  { id: 'protean_claws',       label: 'Feral Claws',      description: 'Rouse: attack with claws — aggravated damage',                    discipline: 'Protean',      minLevel: 1, requiresRouse: true,  needsTarget: true  },
  { id: 'bloodsorcery_strike', label: 'Scorching Vitae',  description: 'Rouse: magical assault — 3 base aggravated damage',               discipline: 'BloodSorcery', minLevel: 1, requiresRouse: true,  needsTarget: true  },
  { id: 'oblivion_drain',      label: 'Void Touch',       description: 'Rouse: drain 2 Willpower from one enemy',                         discipline: 'Oblivion',     minLevel: 1, requiresRouse: true,  needsTarget: true  },
  { id: 'animalism_frenzy',    label: 'Unleash the Beast', description: 'Rouse: one enemy −2 attack, 50% chance stunned',                 discipline: 'Animalism',    minLevel: 1, requiresRouse: true,  needsTarget: true  },
];

export function getAvailableDiscActions(char: Character): DiscAction[] {
  return DISC_ACTIONS.filter(a => {
    const level = (char.disciplines as Record<string, number | undefined>)[a.discipline];
    return level !== undefined && level >= a.minLevel;
  });
}

// ─────────────── CLAN COMPULSIONS ───────────────

const CLAN_COMPULSIONS: Record<string, { text: string; penaltyDice: number; forceAttack: boolean }> = {
  Ventrue:  { text: 'Arrogance seizes you — you lose 1 Willpower driven by the need to command this situation.',  penaltyDice: 0, forceAttack: false },
  Toreador: { text: 'Obsession: a moment of transcendent horror or beauty arrests you. −2 dice to your next action.', penaltyDice: 2, forceAttack: false },
  Malkavian:{ text: 'Delusion: fractured logic takes the wheel. −2 dice to your next action as you act on visions.', penaltyDice: 2, forceAttack: false },
  Nosferatu:{ text: 'Cryptophilia: you are seized by the urge to catalogue every detail. −2 dice to your next action.', penaltyDice: 2, forceAttack: false },
  Brujah:   { text: 'Rebellion: the Beast demands you strike the nearest target right now. No strategy — only fury.', penaltyDice: 0, forceAttack: true  },
  Tremere:  { text: 'Perfectionism: your impure success enrages you. You spend 1 Willpower trying to correct it.',    penaltyDice: 0, forceAttack: false },
  Gangrel:  { text: 'Feral Impulses: the Beast surges forward. Tactics dissolve — the body acts on pure predator instinct.', penaltyDice: 0, forceAttack: true  },
  Lasombra: { text: 'Ruthlessness: you must dominate this fight absolutely. You are compelled to attack the most dangerous target.', penaltyDice: 0, forceAttack: true },
  Tzimisce: { text: 'Covetousness: you must possess and control. You cannot act defensively — only seize and dominate.', penaltyDice: 0, forceAttack: true },
};

// ─────────────── HELPERS ───────────────

function roll(pool: number, hunger: number) {
  return rollDice(Math.max(1, pool), Math.min(Math.max(0, hunger), Math.max(1, pool)));
}

function rouseCheck(currentHunger: number): { newHunger: number; rolled: number; success: boolean } {
  const r = Math.ceil(Math.random() * 10);
  return { newHunger: r >= 6 ? currentHunger : Math.min(5, currentHunger + 1), rolled: r, success: r >= 6 };
}

function frenzyCheeck(char: Character, difficulty: number = 2): { resisted: boolean; successes: number } {
  const pool = Math.max(1, char.attributes.Composure + char.attributes.Resolve);
  const successes = Array.from({ length: pool }, () => Math.ceil(Math.random() * 10)).filter(r => r >= 6).length;
  return { resisted: successes >= difficulty, successes };
}

function diceStr(r: DiceResult): string {
  const norm = r.normalRolls.map(v => `${v}`).join(' ');
  const hung = r.hungerRolls.map(v => `[${v}]`).join(' ');
  return [norm, hung].filter(Boolean).join(' | ');
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

function applyCompulsion(result: DiceResult, char: Character, s: CombatState): CombatState {
  if (!result.messyCritical) return s;
  const compInfo = CLAN_COMPULSIONS[char.clan];
  if (!compInfo) return s;
  // Tremere perfectionism costs 1 WP
  const wpCost = char.clan === 'Tremere' ? 1 : 0;
  return {
    ...s,
    player: {
      ...s.player,
      compulsion: compInfo.text,
      compulsionDicePenalty: compInfo.penaltyDice,
      compulsionForceAttack: compInfo.forceAttack,
      willpower: Math.max(0, s.player.willpower - wpCost),
    },
  };
}

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
      hp: character.health - character.superficialDmg - character.aggravatedDmg,
      superficialDmg: character.superficialDmg,
      aggravatedDmg: character.aggravatedDmg,
      willpower: character.willpower,
      hunger: character.hunger,
      isFullDefense: false,
      fortitudeShield: 0,
      auspexShield: 0,
      isFrenzy: false,
      compulsion: null,
      compulsionDicePenalty: 0,
      compulsionForceAttack: false,
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

  function addLog(actor: string, actionLabel: string, result: string, isPlayer: boolean, extra?: Partial<CombatLogEntry>) {
    s = { ...s, log: [...s.log, { id: logId++, round: s.round, actor, action: actionLabel, result, isPlayer, ...extra }] };
  }

  // ── ROUND START NARRATION ──
  const livingEnemies = s.enemies.filter(e => !isDefeated(e));
  if (livingEnemies.length > 0) {
    const enemyNames = livingEnemies.map(e => e.spec.name).join(', ');
    const roundNarration = s.round === 1 
      ? `The fight begins. ${enemyNames} ${livingEnemies.length === 1 ? 'stands' : 'stand'} ready, weapons drawn.`
      : `Round ${s.round} continues. ${enemyNames} ${livingEnemies.length === 1 ? 'presses' : 'press'} the attack.`;
    addLog('GM', 'Round Start', '', false, { narration: roundNarration });
  }
  if (s.player.isFrenzy) {
    const firstAliveIdx = s.enemies.findIndex(e => !isDefeated(e));
    if (firstAliveIdx >= 0) {
      addLog(character.name, 'FRENZY', 'The Beast rampages — all discipline and restraint stripped away', true, { isFrenzy: true });
      const frenzyNarration = `The Beast within awakens! Your vision tunnels, your thoughts consumed by the need to destroy. You lunge forward with feral instinct.`;
      addLog('GM', 'Frenzy', '', false, { narration: frenzyNarration });
      action = { type: 'attack', targetIdx: firstAliveIdx };
    }
  } else if (s.player.compulsionForceAttack && action.type !== 'attack') {
    const firstAliveIdx = s.enemies.findIndex(e => !isDefeated(e));
    if (firstAliveIdx >= 0) {
      addLog(character.name, 'Compulsion', 'Beast-driven impulse — you are compelled to attack', true, { isCompulsion: true });
      const compulsionNarration = `A sudden, overwhelming urge grips you. The Beast whispers that you must strike now, must feed the hunger.`;
      addLog('GM', 'Compulsion', '', false, { narration: compulsionNarration });
      action = { type: 'attack', targetIdx: firstAliveIdx };
    }
  }

  // Clear compulsion at start of round (it was already shown last round)
  const compulsionPenalty = s.player.compulsionDicePenalty;
  s = { ...s, player: { ...s.player, compulsion: null, compulsionDicePenalty: 0, compulsionForceAttack: false } };

  // ── PLAYER ACTION ──
  if (action.type === 'full_defense') {
    s = { ...s, player: { ...s.player, isFullDefense: true } };
    addLog(character.name, 'Full Defense', 'Defense doubled — no attack this round', true);
    const defenseNarration = `You focus entirely on defense, your supernatural speed and grace creating an impenetrable wall of motion.`;
    addLog('GM', 'Defense', '', false, { narration: defenseNarration });

  } else if (action.type === 'flee') {
    const alive = s.enemies.filter(e => !isDefeated(e));
    const avgPursuit = Math.ceil(alive.reduce((sum, e) => sum + e.spec.defensePool, 0) / Math.max(1, alive.length));
    const fleePool = Math.max(1, character.attributes.Dexterity + (character.skills.Stealth ?? 0) - compulsionPenalty);
    const fr = roll(fleePool, s.player.hunger);
    const pr = roll(avgPursuit, 0);
    if (fr.successes > pr.successes) {
      addLog(character.name, 'Flee', `Escaped! (${fr.successes} vs ${pr.successes})`, true, { dice: diceStr(fr) });
      return { ...s, outcome: 'fled', logCounter: logId };
    }
    addLog(character.name, 'Flee', `Failed (${fr.successes} vs ${pr.successes}) — enemies retaliate`, true, { dice: diceStr(fr) });

  } else if (action.type === 'attack') {
    const tidx = action.targetIdx;
    const target = s.enemies[tidx];
    if (!isDefeated(target)) {
      const basePool = character.attributes.Strength + (character.skills.Brawl ?? 0);
      const wpBonus = action.wpBoost ? 3 : 0;
      const atkPool = Math.max(1, basePool + wpBonus - compulsionPenalty);
      const atk = roll(atkPool, s.player.hunger);
      const def = roll(Math.max(1, target.spec.defensePool + s.player.auspexShield), target.hunger);
      const net = Math.max(0, atk.successes - def.successes);
      const boostNote = wpBonus ? ' (WP)' : '';
      const penNote = compulsionPenalty ? ` (−${compulsionPenalty} Compulsion)` : '';
      if (net > 0) {
        const newEnemies = [...s.enemies];
        newEnemies[tidx] = applyDmgToEnemy(target, net, 'superficial');
        s = { ...s, enemies: newEnemies };
        addLog(character.name, `Attack${boostNote}${penNote}`, `${net} superficial → ${target.spec.name} (${atk.successes} vs ${def.successes})`, true, { dice: diceStr(atk) });
        
        // Check if enemy was defeated
        if (isDefeated(newEnemies[tidx]) && !isDefeated(target)) {
          const defeatNarration = `${target.spec.name} crumples to the ground, defeated. Blood pools beneath them as the fight continues.`;
          addLog('GM', 'Defeated', '', false, { narration: defeatNarration });
        } else {
          // Add narration for successful attack
          const attackNarration = net >= 3 
            ? `A devastating strike! Your attack tears into ${target.spec.name}, blood spraying as flesh yields to your supernatural strength.`
            : `Your attack connects, drawing blood from ${target.spec.name}. The wound is clean but effective.`;
          addLog('GM', 'Strike', '', false, { narration: attackNarration });
        }
      } else {
        addLog(character.name, `Attack${boostNote}${penNote}`, `Blocked by ${target.spec.name} (${atk.successes} vs ${def.successes})`, true, { dice: diceStr(atk) });
        
        // Add narration for missed attack
        const missNarration = `${target.spec.name} twists away at the last moment, your attack glancing harmlessly off their guard.`;
        addLog('GM', 'Miss', '', false, { narration: missNarration });
      }
      if (action.wpBoost) {
        s = { ...s, player: { ...s.player, willpower: Math.max(0, s.player.willpower - 1) } };
      }
      s = applyCompulsion(atk, character, s);
    }

  } else if (action.type === 'discipline') {
    const da = DISC_ACTIONS.find(a => a.id === action.actionId);
    if (da) {
      if (da.requiresRouse) {
        const rouse = rouseCheck(s.player.hunger);
        const wasBelow5 = s.player.hunger < 5;
        s = { ...s, player: { ...s.player, hunger: rouse.newHunger } };
        addLog(character.name, 'Rouse Check', rouse.success
          ? `Rolled ${rouse.rolled} — no increase`
          : `Rolled ${rouse.rolled} — Hunger ${rouse.newHunger}`, true);

        // Frenzy check when hunger first hits 5
        if (rouse.newHunger === 5 && wasBelow5) {
          const frenzyResult = frenzyCheeck(character, 2);
          if (!frenzyResult.resisted) {
            s = { ...s, player: { ...s.player, hunger: rouse.newHunger, isFrenzy: true } };
            addLog(character.name, 'HUNGER FRENZY', `Beast takes control — failed resist (${frenzyResult.successes} vs 2)`, true, { isFrenzy: true });
          } else {
            addLog(character.name, 'Resist Frenzy', `The Beast surges... held back (${frenzyResult.successes} successes)`, true);
          }
        }
      }

      const tidx = action.targetIdx ?? 0;
      const target = s.enemies[tidx];

      switch (da.id) {
        case 'potence_strike': {
          if (!isDefeated(target)) {
            const potenceDots = character.disciplines.Potence ?? 0;
            const atkPool = Math.max(1, character.attributes.Strength + (character.skills.Brawl ?? 0) + potenceDots - compulsionPenalty);
            const atk = roll(atkPool, s.player.hunger);
            const def = roll(Math.max(1, target.spec.defensePool), target.hunger);
            const net = Math.max(0, atk.successes - def.successes);
            if (net > 0) {
              const ne = [...s.enemies]; ne[tidx] = applyDmgToEnemy(target, net, 'superficial'); s = { ...s, enemies: ne };
              addLog(character.name, 'Potence Strike', `${net} superficial → ${target.spec.name} (+${potenceDots} Potence, ${atk.successes} vs ${def.successes})`, true, { dice: diceStr(atk) });
            } else {
              addLog(character.name, 'Potence Strike', `Blocked (${atk.successes} vs ${def.successes})`, true, { dice: diceStr(atk) });
            }
            s = applyCompulsion(atk, character, s);
          }
          break;
        }
        case 'potence_fury': {
          if (!isDefeated(target)) {
            const potenceDots = character.disciplines.Potence ?? 0;
            const atkPool = Math.max(1, character.attributes.Strength + (character.skills.Brawl ?? 0) + potenceDots - compulsionPenalty);
            const atk = roll(atkPool, s.player.hunger);
            const def = roll(Math.max(1, target.spec.defensePool), target.hunger);
            const net = Math.max(0, atk.successes - def.successes);
            if (net > 0) {
              const ne = [...s.enemies]; ne[tidx] = applyDmgToEnemy(target, net, 'aggravated'); s = { ...s, enemies: ne };
              addLog(character.name, 'Lethal Blow', `${net} AGGRAVATED → ${target.spec.name} (+${potenceDots} Potence, ${atk.successes} vs ${def.successes})`, true, { dice: diceStr(atk) });
            } else {
              addLog(character.name, 'Lethal Blow', `Blocked (${atk.successes} vs ${def.successes})`, true, { dice: diceStr(atk) });
            }
            s = applyCompulsion(atk, character, s);
          }
          break;
        }
        case 'celerity_strike': {
          if (!isDefeated(target)) {
            const celerityDots = character.disciplines.Celerity ?? 0;
            const atkPool = Math.max(1, character.attributes.Strength + (character.skills.Brawl ?? 0) + celerityDots - compulsionPenalty);
            const atk = roll(atkPool, s.player.hunger);
            const def = roll(Math.max(1, target.spec.defensePool), target.hunger);
            const net = Math.max(0, atk.successes - def.successes);
            if (net > 0) {
              const ne = [...s.enemies]; ne[tidx] = applyDmgToEnemy(target, net, 'superficial'); s = { ...s, enemies: ne };
              addLog(character.name, 'Celerity Strike', `${net} superficial → ${target.spec.name} (+${celerityDots} Celerity, ${atk.successes} vs ${def.successes})`, true, { dice: diceStr(atk) });
            } else {
              addLog(character.name, 'Celerity Strike', `Blocked (${atk.successes} vs ${def.successes})`, true, { dice: diceStr(atk) });
            }
            s = applyCompulsion(atk, character, s);
          }
          break;
        }
        case 'fortitude_endure': {
          s = { ...s, player: { ...s.player, fortitudeShield: 2 } };
          addLog(character.name, 'Fortitude Endure', 'Incoming damage reduced by 2 this round', true);
          const fortitudeNarration = `Your undead resilience surges. Flesh knits and bones strengthen as Fortitude makes you nearly impervious to harm.`;
          addLog('GM', 'Fortitude', '', false, { narration: fortitudeNarration });
          break;
        }
        case 'presence_dread': {
          s = { ...s, enemies: s.enemies.map(e => isDefeated(e) ? e : { ...e, attackPenalty: e.attackPenalty + 2 }) };
          addLog(character.name, 'Dread Gaze', 'All enemies −2 to attacks this round', true);
          const presenceNarration = `Your eyes burn with unholy light. The mortals quail before your predatory gaze, their resolve crumbling.`;
          addLog('GM', 'Presence', '', false, { narration: presenceNarration });
          break;
        }
        case 'dominate_mesmerize': {
          if (!isDefeated(target)) {
            const domPool = Math.max(1, character.attributes.Manipulation + (character.disciplines.Dominate ?? 0) - compulsionPenalty);
            const resistPool = Math.min(target.willpower, 5);
            const dr = roll(domPool, s.player.hunger);
            const rr = roll(Math.max(1, resistPool), target.hunger);
            if (dr.successes > rr.successes) {
              const ne = [...s.enemies]; ne[tidx] = { ...target, stunned: true }; s = { ...s, enemies: ne };
              addLog(character.name, 'Mesmerize', `${target.spec.name} stunned (${dr.successes} vs ${rr.successes})`, true, { dice: diceStr(dr) });
            } else {
              addLog(character.name, 'Mesmerize', `Resisted (${dr.successes} vs ${rr.successes})`, true, { dice: diceStr(dr) });
            }
            s = applyCompulsion(dr, character, s);
          }
          break;
        }
        case 'auspex_sense': {
          const auspexDots = character.disciplines.Auspex ?? 0;
          s = { ...s, player: { ...s.player, auspexShield: auspexDots } };
          addLog(character.name, 'Premonition', `Reading all attacks — enemies −${auspexDots} to attack pools this round`, true);
          break;
        }
        case 'obfuscate_vanish': {
          s = { ...s, enemies: s.enemies.map(e => isDefeated(e) ? e : { ...e, attackPenalty: e.attackPenalty + 3 }) };
          addLog(character.name, 'Vanish', 'All enemies −3 to attacks this round', true);
          break;
        }
        case 'protean_claws': {
          if (!isDefeated(target)) {
            const atkPool = Math.max(1, character.attributes.Strength + (character.skills.Brawl ?? 0) - compulsionPenalty);
            const atk = roll(atkPool, s.player.hunger);
            const def = roll(Math.max(1, target.spec.defensePool), target.hunger);
            const net = Math.max(0, atk.successes - def.successes);
            if (net > 0) {
              const ne = [...s.enemies]; ne[tidx] = applyDmgToEnemy(target, net, 'aggravated'); s = { ...s, enemies: ne };
              addLog(character.name, 'Feral Claws', `${net} AGGRAVATED → ${target.spec.name} (${atk.successes} vs ${def.successes})`, true, { dice: diceStr(atk) });
            } else {
              addLog(character.name, 'Feral Claws', `Blocked (${atk.successes} vs ${def.successes})`, true, { dice: diceStr(atk) });
            }
            s = applyCompulsion(atk, character, s);
          }
          break;
        }
        case 'bloodsorcery_strike': {
          if (!isDefeated(target)) {
            const sorcPool = Math.max(1, character.attributes.Intelligence + (character.disciplines.BloodSorcery ?? 0) + 2 - compulsionPenalty);
            const resistPool = Math.ceil(target.spec.maxHealth / 2);
            const sr = roll(sorcPool, s.player.hunger);
            const rr = roll(Math.max(1, resistPool), target.hunger);
            const dmg = Math.max(1, 3 + sr.successes - rr.successes);
            const ne = [...s.enemies]; ne[tidx] = applyDmgToEnemy(target, dmg, 'aggravated'); s = { ...s, enemies: ne };
            addLog(character.name, 'Scorching Vitae', `${dmg} AGGRAVATED → ${target.spec.name}`, true, { dice: diceStr(sr) });
            const bloodSorceryNarration = `Crimson flames erupt from your fingertips, searing ${target.spec.name}'s flesh with the very essence of your cursed blood.`;
            addLog('GM', 'Blood Sorcery', '', false, { narration: bloodSorceryNarration });
            s = applyCompulsion(sr, character, s);
          }
          break;
        }
        case 'oblivion_drain': {
          if (!isDefeated(target)) {
            const drain = Math.min(2, target.willpower);
            const ne = [...s.enemies]; ne[tidx] = { ...target, willpower: target.willpower - drain }; s = { ...s, enemies: ne };
            addLog(character.name, 'Void Touch', `${target.spec.name} loses ${drain} Willpower`, true);
            const oblivionNarration = `Your touch carries the chill of the grave. ${target.spec.name} feels their very soul wither as Oblivion claims its due.`;
            addLog('GM', 'Oblivion', '', false, { narration: oblivionNarration });
          }
          break;
        }
        case 'animalism_frenzy': {
          if (!isDefeated(target)) {
            const stunned = Math.random() < 0.5;
            const ne = [...s.enemies]; ne[tidx] = { ...target, attackPenalty: target.attackPenalty + 2, stunned }; s = { ...s, enemies: ne };
            addLog(character.name, 'Unleash the Beast', `${target.spec.name}: −2 attack${stunned ? ', stunned' : ''}`, true);
            const animalismNarration = `You awaken the predator within ${target.spec.name}. Their eyes glaze with bestial fury, turning ally against ally.`;
            addLog('GM', 'Animalism', '', false, { narration: animalismNarration });
          }
          break;
        }
      }
    }
  }

  // Victory check after player action
  if (s.enemies.every(isDefeated)) {
    const victoryNarration = `The last enemy falls. The fight is over, but the night is still young.`;
    addLog('GM', 'Victory', '', false, { narration: victoryNarration });
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

    const atkPool = Math.max(1, enemy.spec.attackPool - enemy.attackPenalty - s.player.auspexShield);
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
          `${effective} ${dmgType} → ${character.name}${note} (${ea.successes} vs ${pd.successes})`, false, { dice: diceStr(ea) });
        
        // Add narration for damage taken
        const damageNarration = effective >= 3 
          ? `A brutal strike connects! Pain flares through your body as ${enemy.spec.name}'s attack lands.`
          : `The attack hits home. You feel the impact, but your undead resilience absorbs some of the damage.`;
        addLog('GM', 'Damage', '', false, { narration: damageNarration });
      } else {
        addLog(enemy.spec.name, 'Attack', `Fortitude absorbs all damage (${ea.successes} vs ${pd.successes})`, false);
        
        // Add narration for blocked attack
        const blockNarration = `Your Fortitude discipline flares, turning aside ${enemy.spec.name}'s attack completely.`;
        addLog('GM', 'Defense', '', false, { narration: blockNarration });
      }
    } else {
      addLog(enemy.spec.name, 'Attack', `Blocked by ${character.name} (${ea.successes} vs ${pd.successes})`, false, { dice: diceStr(ea) });
      
      // Add narration for successful defense
      const defenseNarration = `You evade ${enemy.spec.name}'s attack with supernatural grace, the strike whistling past harmlessly.`;
      addLog('GM', 'Defense', '', false, { narration: defenseNarration });
    }

    if (isPlayerDown(s.player)) {
      const defeatNarration = `The wounds are too much. Darkness closes in as you fall. The Beast stirs...`;
      addLog('GM', 'Defeat', '', false, { narration: defeatNarration });
      return { ...s, outcome: 'defeat', logCounter: logId };
    }
  }

  // ── END OF ROUND — reset per-round effects, check frenzy recovery ──
  let newPlayer: PlayerCombatState = {
    ...s.player,
    isFullDefense: false,
    fortitudeShield: 0,
    auspexShield: 0,
  };

  if (newPlayer.isFrenzy) {
    const frenzyCk = frenzyCheeck(character, 3);
    if (frenzyCk.resisted) {
      newPlayer = { ...newPlayer, isFrenzy: false };
      addLog(character.name, 'Frenzy Ends', `The Beast is caged again (${frenzyCk.successes} successes).`, true, { isFrenzy: true });
    } else {
      // Frenzy persists — also check for hunger frenzy escalation
      addLog(character.name, 'FRENZY Continues', `Still in frenzy (${frenzyCk.successes} vs 3). Hunger: ${newPlayer.hunger}`, true, { isFrenzy: true });
    }
  } else if (newPlayer.hunger >= 5) {
    // Hunger at 5 with a trigger (combat itself is enough) — check if frenzy starts
    const frenzyResult = frenzyCheeck(character, 3);
    if (!frenzyResult.resisted) {
      newPlayer = { ...newPlayer, isFrenzy: true };
      addLog(character.name, 'HUNGER FRENZY', `Hunger 5 and combat rages — the Beast takes over (${frenzyResult.successes} vs 3)`, true, { isFrenzy: true });
    }
  }

  return {
    ...s,
    round: s.round + 1,
    logCounter: logId,
    player: newPlayer,
    enemies: s.enemies.map(e => ({ ...e, attackPenalty: 0 })),
  };
}
