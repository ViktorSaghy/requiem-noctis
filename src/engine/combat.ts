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
  celerityBonus: number;     // defense pool bonus from Rapid Reflexes
  isFrenzy: boolean;
  compulsion: string | null;
  compulsionDicePenalty: number;
  compulsionForceAttack: boolean;
  // Equipped gear bonuses — set once at combat init, persist for the fight
  weaponAttackBonus: number;
  weaponDamageBonus: number;
  armorReduction: number;
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
  // Potence — Lethal Body (•): Str+Brawl roll, Potence dots added to damage on a hit (VTM5e Lethal Body)
  //           Brutal Blow (••): same pool, aggravated with Potence damage bonus, Rouse
  { id: 'potence_strike',      label: 'Lethal Body',         description: 'Str+Brawl attack — Potence dots added to damage on a hit, no Rouse',                 discipline: 'Potence',      minLevel: 1, requiresRouse: false, needsTarget: true  },
  { id: 'potence_fury',        label: 'Brutal Blow',         description: 'Rouse: Str+Brawl attack — Potence dots to damage, deals aggravated',                  discipline: 'Potence',      minLevel: 2, requiresRouse: true,  needsTarget: true  },
  // Celerity — Rapid Reflexes (•): add Celerity dots to defense pool, no Rouse (VTM5e Rapid Reflexes)
  //            Fleetness (••): blurring speed attack with Dex+Brawl+Celerity, Rouse (VTM5e Fleetness)
  { id: 'celerity_dodge',      label: 'Rapid Reflexes',      description: '+Celerity dots to your defense pool this round, no Rouse',                            discipline: 'Celerity',     minLevel: 1, requiresRouse: false, needsTarget: false },
  { id: 'celerity_strike',     label: 'Fleetness',           description: 'Rouse: blurring speed — Dex+Brawl+Celerity attack, superficial damage',               discipline: 'Celerity',     minLevel: 2, requiresRouse: true,  needsTarget: true  },
  // Fortitude — Resilience (•): reduce incoming damage by Fortitude rating this round, no Rouse
  { id: 'fortitude_endure',    label: 'Resilience',          description: 'Reduce all incoming damage by your Fortitude rating this round, no Rouse',             discipline: 'Fortitude',    minLevel: 1, requiresRouse: false, needsTarget: false },
  // Presence — Awe (•): supernatural allure, enemies −1 attack, no Rouse (VTM5e Awe)
  //            Dread Gaze (••): primal terror, enemies −Presence dots to attacks, Rouse (VTM5e Daunt→Dread Gaze)
  { id: 'presence_awe',        label: 'Awe',                 description: 'Radiate preternatural allure — all enemies −1 to attacks this round, no Rouse',       discipline: 'Presence',     minLevel: 1, requiresRouse: false, needsTarget: false },
  { id: 'presence_dread',      label: 'Dread Gaze',          description: 'Rouse: emanate primal terror — all enemies −Presence dots to attacks this round',      discipline: 'Presence',     minLevel: 2, requiresRouse: true,  needsTarget: false },
  // Dominate — Mesmerize (•): eye-contact mind-lock, contested Manipulation+Dominate vs target Willpower
  { id: 'dominate_mesmerize',  label: 'Mesmerize',           description: 'Rouse: lock eyes — one enemy loses their next action (contested Manipulation+Dominate)', discipline: 'Dominate',   minLevel: 1, requiresRouse: true,  needsTarget: true  },
  // Auspex — Premonition (•): read incoming strikes, reduce all enemy attack pools by Auspex dots, no Rouse
  { id: 'auspex_sense',        label: 'Premonition',         description: 'Read enemy intent — reduce all enemy attack pools by Auspex dots this round, no Rouse', discipline: 'Auspex',     minLevel: 1, requiresRouse: false, needsTarget: false },
  // Obfuscate — Cloak of Shadows (•): still concealment, enemies −2 attacks, no Rouse (VTM5e Cloak of Shadows)
  //             Unseen Passage (••): move while hidden, enemies −3 attacks, Rouse (VTM5e Unseen Passage)
  { id: 'obfuscate_cloak',     label: 'Cloak of Shadows',    description: 'Stand utterly still in shadow — all enemies −2 to attacks this round, no Rouse',       discipline: 'Obfuscate',    minLevel: 1, requiresRouse: false, needsTarget: false },
  { id: 'obfuscate_vanish',    label: 'Unseen Passage',      description: 'Rouse: melt into shadow mid-motion — all enemies −3 to attacks this round',            discipline: 'Obfuscate',    minLevel: 2, requiresRouse: true,  needsTarget: false },
  // Protean — Feral Claws (•): grow bestial claws for aggravated damage (adapted from VTM5e level 3)
  { id: 'protean_claws',       label: 'Feral Claws',         description: 'Rouse: grow bone-hard claws — Str+Brawl attack for aggravated damage',                 discipline: 'Protean',      minLevel: 1, requiresRouse: true,  needsTarget: true  },
  // Blood Sorcery — Scorching Vitae (•): Int+BloodSorcery vs target, aggravated (VTM5e Corrosive Vitae)
  { id: 'bloodsorcery_strike', label: 'Scorching Vitae',     description: 'Rouse: corrupt your vitae — Int+BloodSorcery vs target for aggravated damage (contested)', discipline: 'BloodSorcery', minLevel: 1, requiresRouse: true, needsTarget: true },
  // Oblivion — Void Touch (•): drain Willpower via shadow-touch, contested Manipulation+Oblivion
  { id: 'oblivion_drain',      label: 'Void Touch',          description: 'Rouse: grave-cold touch — drain Willpower (contested Manipulation+Oblivion)',            discipline: 'Oblivion',     minLevel: 1, requiresRouse: true,  needsTarget: true  },
  // Animalism — Unleash the Beast (•): stir target\'s inner predator, contested Charisma+Animalism
  { id: 'animalism_frenzy',    label: 'Unleash the Beast',   description: 'Rouse: wake the Beast within — −2 attack, possible stun (contested Charisma+Animalism)', discipline: 'Animalism',   minLevel: 1, requiresRouse: true,  needsTarget: true  },
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

export function initCombat(
  character: Character,
  enemies: EnemySpec[],
  bonuses?: { weaponAttack?: number; weaponDamage?: number; armorReduction?: number },
): CombatState {
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
      celerityBonus: 0,
      isFrenzy: false,
      compulsion: null,
      compulsionDicePenalty: 0,
      compulsionForceAttack: false,
      weaponAttackBonus: bonuses?.weaponAttack ?? 0,
      weaponDamageBonus: bonuses?.weaponDamage ?? 0,
      armorReduction:    bonuses?.armorReduction ?? 0,
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
  | { type: 'flee' }
  | { type: 'use_item'; itemId: string; itemName: string; hungerReduce?: number; hpRestore?: number };

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
      addLog('GM', 'Frenzy', '', false, { narration: `The Beast within awakens! Your vision tunnels, your thoughts consumed by the need to destroy. You lunge forward with feral instinct.` });
      action = { type: 'attack', targetIdx: firstAliveIdx };
    }
  } else if (s.player.compulsionForceAttack && action.type !== 'attack') {
    const firstAliveIdx = s.enemies.findIndex(e => !isDefeated(e));
    if (firstAliveIdx >= 0) {
      addLog(character.name, 'Compulsion', 'Beast-driven impulse — you are compelled to attack', true, { isCompulsion: true });
      addLog('GM', 'Compulsion', '', false, { narration: `A sudden, overwhelming urge grips you. The Beast whispers that you must strike now, must feed the hunger.` });
      action = { type: 'attack', targetIdx: firstAliveIdx };
    }
  }

  // Clear compulsion state (it was shown last round)
  const compulsionPenalty = s.player.compulsionDicePenalty;
  s = { ...s, player: { ...s.player, compulsion: null, compulsionDicePenalty: 0, compulsionForceAttack: false } };

  // ── PLAYER ACTION ──
  if (action.type === 'full_defense') {
    s = { ...s, player: { ...s.player, isFullDefense: true } };
    addLog(character.name, 'Full Defense', 'Defense doubled — no attack this round', true);
    addLog('GM', 'Defense', '', false, { narration: `You focus entirely on defense, your supernatural speed and grace creating an impenetrable wall of motion.` });

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
      const weapAtk = s.player.weaponAttackBonus;
      const weapDmg = s.player.weaponDamageBonus;
      const atkPool = Math.max(1, basePool + wpBonus + weapAtk - compulsionPenalty);
      const atk = roll(atkPool, s.player.hunger);
      const def = roll(Math.max(1, target.spec.defensePool), target.hunger);
      const net = Math.max(0, atk.successes - def.successes);
      const boostNote = wpBonus ? ' (WP)' : '';
      const weapNote = weapAtk ? ` (+${weapAtk} weapon)` : '';
      const penNote = compulsionPenalty ? ` (−${compulsionPenalty} Compulsion)` : '';
      if (net > 0) {
        const totalDmg = net + weapDmg;
        const newEnemies = [...s.enemies];
        newEnemies[tidx] = applyDmgToEnemy(target, totalDmg, 'superficial');
        s = { ...s, enemies: newEnemies };
        const dmgNote = weapDmg ? ` +${weapDmg} weapon` : '';
        addLog(character.name, `Attack${boostNote}${weapNote}${penNote}`, `${totalDmg} superficial → ${target.spec.name}${dmgNote} (${atk.successes} vs ${def.successes})`, true, { dice: diceStr(atk) });
        if (isDefeated(newEnemies[tidx]) && !isDefeated(target)) {
          addLog('GM', 'Defeated', '', false, { narration: `${target.spec.name} crumples to the ground, defeated. Blood pools beneath them as the fight continues.` });
        } else {
          const attackNarration = net >= 3
            ? `A devastating strike! Your attack tears into ${target.spec.name}, blood spraying as flesh yields to your supernatural strength.`
            : `Your attack connects, drawing blood from ${target.spec.name}. The wound is clean but effective.`;
          addLog('GM', 'Strike', '', false, { narration: attackNarration });
        }
      } else {
        addLog(character.name, `Attack${boostNote}${penNote}`, `Blocked by ${target.spec.name} (${atk.successes} vs ${def.successes})`, true, { dice: diceStr(atk) });
        addLog('GM', 'Miss', '', false, { narration: `${target.spec.name} twists away at the last moment, your attack glancing harmlessly off their guard.` });
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

        // ── POTENCE ──
        case 'potence_strike': {
          // VTM5e Lethal Body: roll Str+Brawl normally; Potence dots add to damage on a hit
          if (!isDefeated(target)) {
            const potenceDots = character.disciplines.Potence ?? 0;
            const atkPool = Math.max(1, character.attributes.Strength + (character.skills.Brawl ?? 0) - compulsionPenalty);
            const atk = roll(atkPool, s.player.hunger);
            const def = roll(Math.max(1, target.spec.defensePool), target.hunger);
            const net = Math.max(0, atk.successes - def.successes);
            if (net > 0) {
              const totalDmg = net + potenceDots;
              const ne = [...s.enemies]; ne[tidx] = applyDmgToEnemy(target, totalDmg, 'superficial'); s = { ...s, enemies: ne };
              addLog(character.name, 'Lethal Body', `${totalDmg} superficial → ${target.spec.name} (${net} hits +${potenceDots} Potence, ${atk.successes} vs ${def.successes})`, true, { dice: diceStr(atk) });
            } else {
              addLog(character.name, 'Lethal Body', `Blocked (${atk.successes} vs ${def.successes})`, true, { dice: diceStr(atk) });
            }
            s = applyCompulsion(atk, character, s);
          }
          break;
        }
        case 'potence_fury': {
          // Brutal Blow: same pool as Lethal Body, Potence to damage, aggravated
          if (!isDefeated(target)) {
            const potenceDots = character.disciplines.Potence ?? 0;
            const atkPool = Math.max(1, character.attributes.Strength + (character.skills.Brawl ?? 0) - compulsionPenalty);
            const atk = roll(atkPool, s.player.hunger);
            const def = roll(Math.max(1, target.spec.defensePool), target.hunger);
            const net = Math.max(0, atk.successes - def.successes);
            if (net > 0) {
              const totalDmg = net + potenceDots;
              const ne = [...s.enemies]; ne[tidx] = applyDmgToEnemy(target, totalDmg, 'aggravated'); s = { ...s, enemies: ne };
              addLog(character.name, 'Brutal Blow', `${totalDmg} AGGRAVATED → ${target.spec.name} (${net} hits +${potenceDots} Potence, ${atk.successes} vs ${def.successes})`, true, { dice: diceStr(atk) });
            } else {
              addLog(character.name, 'Brutal Blow', `Blocked (${atk.successes} vs ${def.successes})`, true, { dice: diceStr(atk) });
            }
            s = applyCompulsion(atk, character, s);
          }
          break;
        }

        // ── CELERITY ──
        case 'celerity_dodge': {
          // VTM5e Rapid Reflexes: add Celerity dots to defense for this round
          const celerityDots = character.disciplines.Celerity ?? 0;
          s = { ...s, player: { ...s.player, celerityBonus: celerityDots } };
          addLog(character.name, 'Rapid Reflexes', `+${celerityDots} to defense pool this round`, true);
          addLog('GM', 'Celerity', '', false, { narration: `Your body moves before your mind commands it — preternatural speed lending grace to every defensive motion.` });
          break;
        }
        case 'celerity_strike': {
          // VTM5e Fleetness: speed-enhanced attack using Dexterity + Celerity dots
          if (!isDefeated(target)) {
            const celerityDots = character.disciplines.Celerity ?? 0;
            const atkPool = Math.max(1, character.attributes.Dexterity + (character.skills.Brawl ?? 0) + celerityDots - compulsionPenalty);
            const atk = roll(atkPool, s.player.hunger);
            const def = roll(Math.max(1, target.spec.defensePool), target.hunger);
            const net = Math.max(0, atk.successes - def.successes);
            if (net > 0) {
              const ne = [...s.enemies]; ne[tidx] = applyDmgToEnemy(target, net, 'superficial'); s = { ...s, enemies: ne };
              addLog(character.name, 'Fleetness', `${net} superficial → ${target.spec.name} (+${celerityDots} Celerity, ${atk.successes} vs ${def.successes})`, true, { dice: diceStr(atk) });
            } else {
              addLog(character.name, 'Fleetness', `Blocked (${atk.successes} vs ${def.successes})`, true, { dice: diceStr(atk) });
            }
            s = applyCompulsion(atk, character, s);
          }
          break;
        }

        // ── FORTITUDE ──
        case 'fortitude_endure': {
          // VTM5e Resilience: soak incoming damage equal to Fortitude rating
          const fortDots = character.disciplines.Fortitude ?? 0;
          s = { ...s, player: { ...s.player, fortitudeShield: fortDots } };
          addLog(character.name, 'Resilience', `Incoming damage reduced by ${fortDots} this round`, true);
          addLog('GM', 'Fortitude', '', false, { narration: `Your undead resilience surges. Flesh knits and bones strengthen as Fortitude makes you nearly impervious to harm.` });
          break;
        }

        // ── PRESENCE ──
        case 'presence_awe': {
          // VTM5e Awe: supernatural allure causes enemies to hesitate (−1 attack)
          s = { ...s, enemies: s.enemies.map(e => isDefeated(e) ? e : { ...e, attackPenalty: e.attackPenalty + 1 }) };
          addLog(character.name, 'Awe', 'Preternatural allure — all enemies −1 to attacks this round', true);
          addLog('GM', 'Presence', '', false, { narration: `You radiate an ineffable beauty and menace that gives even hardened fighters pause.` });
          break;
        }
        case 'presence_dread': {
          // Dread Gaze: terror scales with Presence dots
          const presenceDots = character.disciplines.Presence ?? 0;
          s = { ...s, enemies: s.enemies.map(e => isDefeated(e) ? e : { ...e, attackPenalty: e.attackPenalty + presenceDots }) };
          addLog(character.name, 'Dread Gaze', `All enemies −${presenceDots} to attacks this round`, true);
          addLog('GM', 'Presence', '', false, { narration: `Your eyes burn with unholy light. The mortals quail before your predatory gaze, their resolve crumbling.` });
          break;
        }

        // ── DOMINATE ──
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

        // ── AUSPEX ──
        case 'auspex_sense': {
          const auspexDots = character.disciplines.Auspex ?? 0;
          s = { ...s, player: { ...s.player, auspexShield: auspexDots } };
          addLog(character.name, 'Premonition', `Reading all attacks — enemies −${auspexDots} to attack pools this round`, true);
          break;
        }

        // ── OBFUSCATE ──
        case 'obfuscate_cloak': {
          // VTM5e Cloak of Shadows: still concealment, enemies −2
          s = { ...s, enemies: s.enemies.map(e => isDefeated(e) ? e : { ...e, attackPenalty: e.attackPenalty + 2 }) };
          addLog(character.name, 'Cloak of Shadows', 'Standing utterly still — all enemies −2 to attacks this round', true);
          addLog('GM', 'Obfuscate', '', false, { narration: `You become one with the darkness, an absence in the world. Eyes slide over you as if you simply are not there.` });
          break;
        }
        case 'obfuscate_vanish': {
          // VTM5e Unseen Passage: move while concealed, enemies −3
          s = { ...s, enemies: s.enemies.map(e => isDefeated(e) ? e : { ...e, attackPenalty: e.attackPenalty + 3 }) };
          addLog(character.name, 'Unseen Passage', 'Moving through shadow — all enemies −3 to attacks this round', true);
          addLog('GM', 'Obfuscate', '', false, { narration: `You melt into the darkness mid-motion, there one moment and gone the next. Your enemies swing at empty air.` });
          break;
        }

        // ── PROTEAN ──
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

        // ── BLOOD SORCERY ──
        case 'bloodsorcery_strike': {
          // VTM5e Corrosive Vitae: Int+BloodSorcery, no free bonus; target resists with toughness
          if (!isDefeated(target)) {
            const sorcPool = Math.max(1, character.attributes.Intelligence + (character.disciplines.BloodSorcery ?? 0) - compulsionPenalty);
            const resistPool = Math.max(1, Math.ceil(target.spec.maxHealth / 2));
            const sr = roll(sorcPool, s.player.hunger);
            const rr = roll(resistPool, target.hunger);
            const net = Math.max(0, sr.successes - rr.successes);
            if (net > 0) {
              const ne = [...s.enemies]; ne[tidx] = applyDmgToEnemy(target, net, 'aggravated'); s = { ...s, enemies: ne };
              addLog(character.name, 'Scorching Vitae', `${net} AGGRAVATED → ${target.spec.name} (${sr.successes} vs ${rr.successes})`, true, { dice: diceStr(sr) });
              addLog('GM', 'Blood Sorcery', '', false, { narration: `Crimson flames erupt from your fingertips, searing ${target.spec.name}'s flesh with the very essence of your cursed blood.` });
            } else {
              addLog(character.name, 'Scorching Vitae', `Resisted (${sr.successes} vs ${rr.successes})`, true, { dice: diceStr(sr) });
            }
            s = applyCompulsion(sr, character, s);
          }
          break;
        }

        // ── OBLIVION ──
        case 'oblivion_drain': {
          // Contested: Manipulation+Oblivion vs target Willpower (proxy for Resolve+Composure)
          if (!isDefeated(target)) {
            const obPool = Math.max(1, character.attributes.Manipulation + (character.disciplines.Oblivion ?? 0) - compulsionPenalty);
            const resistPool = Math.max(1, Math.min(target.willpower, 5));
            const or = roll(obPool, s.player.hunger);
            const rr = roll(resistPool, target.hunger);
            if (or.successes > rr.successes) {
              const netDrain = Math.max(1, or.successes - rr.successes);
              const drain = Math.min(netDrain, target.willpower);
              const ne = [...s.enemies]; ne[tidx] = { ...target, willpower: target.willpower - drain }; s = { ...s, enemies: ne };
              addLog(character.name, 'Void Touch', `${target.spec.name} loses ${drain} Willpower (${or.successes} vs ${rr.successes})`, true, { dice: diceStr(or) });
              addLog('GM', 'Oblivion', '', false, { narration: `Your touch carries the chill of the grave. ${target.spec.name} feels their very soul wither as Oblivion claims its due.` });
            } else {
              addLog(character.name, 'Void Touch', `Resisted (${or.successes} vs ${rr.successes})`, true, { dice: diceStr(or) });
            }
            s = applyCompulsion(or, character, s);
          }
          break;
        }

        // ── ANIMALISM ──
        case 'animalism_frenzy': {
          // Contested: Charisma+Animalism vs target Willpower (proxy for Composure+Resolve)
          if (!isDefeated(target)) {
            const anPool = Math.max(1, character.attributes.Charisma + (character.disciplines.Animalism ?? 0) - compulsionPenalty);
            const resistPool = Math.max(1, Math.min(target.willpower, 5));
            const ar = roll(anPool, s.player.hunger);
            const rr = roll(resistPool, target.hunger);
            if (ar.successes > rr.successes) {
              const overwhelming = ar.successes >= rr.successes + 2;
              const ne = [...s.enemies]; ne[tidx] = { ...target, attackPenalty: target.attackPenalty + 2, stunned: overwhelming }; s = { ...s, enemies: ne };
              addLog(character.name, 'Unleash the Beast', `${target.spec.name}: −2 attack${overwhelming ? ', stunned' : ''} (${ar.successes} vs ${rr.successes})`, true, { dice: diceStr(ar) });
              addLog('GM', 'Animalism', '', false, { narration: `You awaken the predator within ${target.spec.name}. Their eyes glaze with bestial fury as the Beast surges to the surface.` });
            } else {
              addLog(character.name, 'Unleash the Beast', `Resisted (${ar.successes} vs ${rr.successes})`, true, { dice: diceStr(ar) });
            }
            s = applyCompulsion(ar, character, s);
          }
          break;
        }
      }
    }

  } else if (action.type === 'use_item') {
    let p = { ...s.player };
    const effects: string[] = [];

    if (action.hungerReduce) {
      p.hunger = Math.max(0, p.hunger - action.hungerReduce);
      effects.push(`Hunger −${action.hungerReduce} → ${p.hunger}`);
    }
    if (action.hpRestore) {
      const restored = Math.min(action.hpRestore, character.health - p.hp);
      if (restored > 0) {
        p.superficialDmg = Math.max(0, p.superficialDmg - restored);
        p.hp = Math.max(0, character.health - p.superficialDmg - p.aggravatedDmg);
        effects.push(`Restored ${restored} HP`);
      }
    }

    s = { ...s, player: p };
    addLog(character.name, `Use ${action.itemName}`, effects.join('; ') || 'Used', true);
    addLog('GM', 'Item', '', false, { narration: `You quickly consume the ${action.itemName}, feeling its effects take hold as the fight continues around you.` });
  }

  // Victory check after player action
  if (s.enemies.every(isDefeated)) {
    addLog('GM', 'Victory', '', false, { narration: `The last enemy falls. The fight is over, but the night is still young.` });
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
    // Player defense: Dexterity + Athletics + celerityBonus (from Rapid Reflexes)
    const defPool = character.attributes.Dexterity + (character.skills.Athletics ?? 0) + s.player.celerityBonus;
    const defMult = s.player.isFullDefense ? 2 : 1;

    const ea = roll(atkPool, enemy.hunger);
    const pd = roll(Math.max(1, defPool * defMult), s.player.hunger);
    const net = Math.max(0, ea.successes - pd.successes);

    if (net > 0) {
      const shield = s.player.fortitudeShield + s.player.armorReduction;
      const effective = Math.max(0, net - shield);
      const dmgType = enemy.spec.damageType;
      if (effective > 0) {
        s = { ...s, player: applyDmgToPlayer(s.player, effective, dmgType, character.health) };
        const note = dmgType === 'superficial' ? ` (${Math.ceil(effective / 2)} after resistance)` : '';
        addLog(enemy.spec.name, `${dmgType === 'aggravated' ? 'Agg ' : ''}Attack`,
          `${effective} ${dmgType} → ${character.name}${note} (${ea.successes} vs ${pd.successes})`, false, { dice: diceStr(ea) });
        const damageNarration = effective >= 3
          ? `A brutal strike connects! Pain flares through your body as ${enemy.spec.name}'s attack lands.`
          : `The attack hits home. You feel the impact, but your undead resilience absorbs some of the damage.`;
        addLog('GM', 'Damage', '', false, { narration: damageNarration });
      } else {
        const absorbedBy = s.player.fortitudeShield > 0 && s.player.armorReduction > 0
          ? 'Fortitude and armor absorb all damage'
          : s.player.fortitudeShield > 0 ? 'Fortitude absorbs all damage' : 'Armor absorbs all damage';
        addLog(enemy.spec.name, 'Attack', `${absorbedBy} (${ea.successes} vs ${pd.successes})`, false);
        addLog('GM', 'Defense', '', false, { narration: `Protection absorbs ${enemy.spec.name}'s strike completely.` });
      }
    } else {
      addLog(enemy.spec.name, 'Attack', `Blocked by ${character.name} (${ea.successes} vs ${pd.successes})`, false, { dice: diceStr(ea) });
      addLog('GM', 'Defense', '', false, { narration: `You evade ${enemy.spec.name}'s attack with supernatural grace, the strike whistling past harmlessly.` });
    }

    if (isPlayerDown(s.player)) {
      addLog('GM', 'Defeat', '', false, { narration: `The wounds are too much. Darkness closes in as you fall. The Beast stirs...` });
      return { ...s, outcome: 'defeat', logCounter: logId };
    }
  }

  // ── END OF ROUND — reset per-round effects, check frenzy recovery ──
  let newPlayer: PlayerCombatState = {
    ...s.player,
    isFullDefense: false,
    fortitudeShield: 0,
    auspexShield: 0,
    celerityBonus: 0,
  };

  if (newPlayer.isFrenzy) {
    const frenzyCk = frenzyCheeck(character, 3);
    if (frenzyCk.resisted) {
      newPlayer = { ...newPlayer, isFrenzy: false };
      addLog(character.name, 'Frenzy Ends', `The Beast is caged again (${frenzyCk.successes} successes).`, true, { isFrenzy: true });
    } else {
      addLog(character.name, 'FRENZY Continues', `Still in frenzy (${frenzyCk.successes} vs 3). Hunger: ${newPlayer.hunger}`, true, { isFrenzy: true });
    }
  } else if (newPlayer.hunger >= 5) {
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
