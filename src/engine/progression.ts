// src/engine/progression.ts
// XP & Progression System (v1)
//
// == HOW TO ADD NEW UPGRADES ==
//
// Edit UPGRADE_CATALOG array below with new Upgrade objects:
//
// Example (Skill): 
//   {
//     id: 'Drive_1',
//     type: 'skill',
//     name: 'Drive',
//     description: 'Vehicle operation',
//     category: 'Skills',
//     target: 'Drive',
//     newRating: 1,
//     maxRating: 5,
//     cost: 2,  // Automatic: newRating * 2
//   }
//
// Example (Discipline):
//   {
//     id: 'BloodSorcery_1',
//     type: 'discipline',
//     name: 'Blood Sorcery •',
//     description: 'Manipulation of blood',
//     category: 'Disciplines',
//     target: 'BloodSorcery',
//     newRating: 1,
//     maxRating: 5,
//     cost: 5,  // Automatic: newRating * 5
//   }
//
// Example (Advantage):
//   {
//     id: 'Contacts_1',
//     type: 'advantage',
//     name: 'Contacts •',
//     description: 'Reliable network',
//     category: 'Advantages',
//     target: 'Contacts',
//     dots: 1,
//     maxRating: 5,
//     cost: 3,  // Automatic: dots * 3
//   }
//
// Keys:
//   - id: Unique identifier (used in logs and UI)
//   - type: 'skill' | 'discipline' | 'advantage'
//   - name: Display name (use dots for disciplines, e.g. "Celerity •")
//   - description: Short flavor text
//   - category: UI grouping (Skills, Disciplines, Advantages)
//   - target: Character sheet key to update (e.g., "Persuasion", "Celerity", "Ally")
//   - newRating/dots: Next rating after purchase
//   - maxRating: Cap (usually 5 for V5)
//   - cost: XP cost (follow V5 math above)
//   - prerequisites: Optional array of flag names required (not used in v1)
//
// Notes:
//   - Must buy skills/disciplines in order (1 → 2 → 3, etc.)
//   - Advantages don't require ordering; can buy multiple dots at once
//   - getSuggestedUpgrades() picks up new entries automatically
//   - Adjust maxRating per balance needs (some advantages cap at 3 or 4)

import type { Character, Skills, Disciplines } from './character';

// ─────────────── Upgrade Catalog ──────────────────────────────────────────

export type UpgradeType = 'skill' | 'discipline' | 'advantage';

export interface Upgrade {
  id: string;
  type: UpgradeType;
  name: string;
  description: string;
  category: string; // "Skills", "Disciplines", "Advantages"
  target: string; // e.g. "Persuasion", "Celerity", "Ally"
  newRating?: number; // for skill/discipline: next dot level
  dots?: number; // for advantages: dot value
  maxRating: number; // max dots allowed
  cost: number; // XP cost
  tags?: string[]; // e.g., ["PREDATOR", "DOMINANT", "SEER"] for thematic grouping
  prerequisites?: string[]; // scene flags required (v1: none used)
}

// All available upgrades in the game. This catalog drives the UI and logic.
export const UPGRADE_CATALOG: Upgrade[] = [
  // Skills — Physical
  { id: 'Athletics_1', type: 'skill', name: 'Athletics', description: 'Climbing, jumping, swimming', category: 'Skills', target: 'Athletics', newRating: 1, maxRating: 5, cost: 2, tags: ['PREDATOR'] },
  { id: 'Athletics_2', type: 'skill', name: 'Athletics ••', description: 'Climbing, jumping, swimming', category: 'Skills', target: 'Athletics', newRating: 2, maxRating: 5, cost: 4, tags: ['PREDATOR'] },
  { id: 'Brawl_1', type: 'skill', name: 'Brawl', description: 'Hand-to-hand combat', category: 'Skills', target: 'Brawl', newRating: 1, maxRating: 5, cost: 2, tags: ['PREDATOR'] },
  { id: 'Brawl_2', type: 'skill', name: 'Brawl ••', description: 'Hand-to-hand combat', category: 'Skills', target: 'Brawl', newRating: 2, maxRating: 5, cost: 4, tags: ['PREDATOR'] },
  { id: 'Stealth_1', type: 'skill', name: 'Stealth', description: 'Move unseen', category: 'Skills', target: 'Stealth', newRating: 1, maxRating: 5, cost: 2, tags: ['PREDATOR'] },
  { id: 'Stealth_2', type: 'skill', name: 'Stealth ••', description: 'Move unseen', category: 'Skills', target: 'Stealth', newRating: 2, maxRating: 5, cost: 4, tags: ['PREDATOR'] },
  
  // Skills — Social
  { id: 'Persuasion_1', type: 'skill', name: 'Persuasion', description: 'Convince and influence', category: 'Skills', target: 'Persuasion', newRating: 1, maxRating: 5, cost: 2, tags: ['DOMINANT'] },
  { id: 'Persuasion_2', type: 'skill', name: 'Persuasion ••', description: 'Convince and influence', category: 'Skills', target: 'Persuasion', newRating: 2, maxRating: 5, cost: 4, tags: ['DOMINANT'] },
  { id: 'Etiquette_1', type: 'skill', name: 'Etiquette', description: 'Social graces', category: 'Skills', target: 'Etiquette', newRating: 1, maxRating: 5, cost: 2, tags: ['DOMINANT'] },
  { id: 'Insight_1', type: 'skill', name: 'Insight', description: 'Read people', category: 'Skills', target: 'Insight', newRating: 1, maxRating: 5, cost: 2, tags: ['SEER'] },
  
  // Skills — Mental
  { id: 'Investigation_1', type: 'skill', name: 'Investigation', description: 'Search for clues', category: 'Skills', target: 'Investigation', newRating: 1, maxRating: 5, cost: 2, tags: ['SEER'] },
  { id: 'Occult_1', type: 'skill', name: 'Occult', description: 'Supernatural knowledge', category: 'Skills', target: 'Occult', newRating: 1, maxRating: 5, cost: 2, tags: ['SEER'] },
  { id: 'Awareness_1', type: 'skill', name: 'Awareness', description: 'Sense surroundings', category: 'Skills', target: 'Awareness', newRating: 1, maxRating: 5, cost: 2, tags: ['SEER'] },
  
  // Disciplines — level 1 (5 XP each)
  { id: 'Celerity_1',    type: 'discipline', name: 'Celerity •',      description: 'Rapid Reflexes — preternatural speed, boost defense',              category: 'Disciplines', target: 'Celerity',     newRating: 1, maxRating: 5, cost: 5,  tags: ['PREDATOR'] },
  { id: 'Potence_1',     type: 'discipline', name: 'Potence •',       description: 'Lethal Body — add Potence to damage on a hit',                     category: 'Disciplines', target: 'Potence',      newRating: 1, maxRating: 5, cost: 5,  tags: ['PREDATOR'] },
  { id: 'Auspex_1',     type: 'discipline', name: 'Auspex •',         description: 'Premonition — read incoming attacks, penalise enemy pools',        category: 'Disciplines', target: 'Auspex',       newRating: 1, maxRating: 5, cost: 5,  tags: ['SEER']     },
  { id: 'Presence_1',   type: 'discipline', name: 'Presence •',       description: 'Awe — supernatural allure, enemies hesitate to strike',            category: 'Disciplines', target: 'Presence',     newRating: 1, maxRating: 5, cost: 5,  tags: ['DOMINANT'] },
  { id: 'Obfuscate_1',  type: 'discipline', name: 'Obfuscate •',      description: 'Cloak of Shadows — stand still and vanish from sight',             category: 'Disciplines', target: 'Obfuscate',    newRating: 1, maxRating: 5, cost: 5,  tags: ['PREDATOR'] },
  { id: 'Fortitude_1',  type: 'discipline', name: 'Fortitude •',      description: 'Resilience — soak incoming damage equal to Fortitude dots',        category: 'Disciplines', target: 'Fortitude',    newRating: 1, maxRating: 5, cost: 5  },
  { id: 'Dominate_1',   type: 'discipline', name: 'Dominate •',       description: 'Mesmerize — eye-contact mind-lock, stun one enemy',                category: 'Disciplines', target: 'Dominate',     newRating: 1, maxRating: 5, cost: 5,  tags: ['DOMINANT'] },
  { id: 'Animalism_1',  type: 'discipline', name: 'Animalism •',      description: 'Unleash the Beast — stir the predator within an enemy',            category: 'Disciplines', target: 'Animalism',    newRating: 1, maxRating: 5, cost: 5  },
  { id: 'Protean_1',    type: 'discipline', name: 'Protean •',        description: 'Feral Claws — grow bone-hard claws for aggravated damage',         category: 'Disciplines', target: 'Protean',      newRating: 1, maxRating: 5, cost: 5  },
  { id: 'Oblivion_1',   type: 'discipline', name: 'Oblivion •',       description: 'Void Touch — grave-cold shadow drains enemy Willpower',            category: 'Disciplines', target: 'Oblivion',     newRating: 1, maxRating: 5, cost: 5  },
  { id: 'BloodSorcery_1', type: 'discipline', name: 'Blood Sorcery •', description: 'Scorching Vitae — corrupt your blood for aggravated assault',     category: 'Disciplines', target: 'BloodSorcery', newRating: 1, maxRating: 5, cost: 5,  tags: ['SEER']     },
  // Disciplines — level 2 (10 XP each) — unlocks more powerful combat powers
  { id: 'Celerity_2',    type: 'discipline', name: 'Celerity ••',     description: 'Fleetness — speed-enhanced Dex+Brawl+Celerity attack (Rouse)',     category: 'Disciplines', target: 'Celerity',     newRating: 2, maxRating: 5, cost: 10, tags: ['PREDATOR'] },
  { id: 'Potence_2',     type: 'discipline', name: 'Potence ••',      description: 'Brutal Blow — aggravated strike with Potence damage bonus (Rouse)', category: 'Disciplines', target: 'Potence',      newRating: 2, maxRating: 5, cost: 10, tags: ['PREDATOR'] },
  { id: 'Presence_2',   type: 'discipline', name: 'Presence ••',      description: 'Dread Gaze — primal terror, enemies −Presence dots to attacks (Rouse)', category: 'Disciplines', target: 'Presence', newRating: 2, maxRating: 5, cost: 10, tags: ['DOMINANT'] },
  { id: 'Obfuscate_2',  type: 'discipline', name: 'Obfuscate ••',     description: 'Unseen Passage — move while hidden, enemies −3 to attacks (Rouse)', category: 'Disciplines', target: 'Obfuscate',   newRating: 2, maxRating: 5, cost: 10, tags: ['PREDATOR'] },
  { id: 'Fortitude_2',  type: 'discipline', name: 'Fortitude ••',     description: 'Unswayable Mind — soak 2 damage, resist mental effects',           category: 'Disciplines', target: 'Fortitude',    newRating: 2, maxRating: 5, cost: 10 },
  { id: 'Auspex_2',     type: 'discipline', name: 'Auspex ••',        description: 'Scry the Soul — deeper premonitions, enemies −2 to attack pools',  category: 'Disciplines', target: 'Auspex',       newRating: 2, maxRating: 5, cost: 10, tags: ['SEER']     },
  
  // Advantages
  { id: 'Ally_1', type: 'advantage', name: 'Ally •', description: 'Mortal contact with influence', category: 'Advantages', target: 'Ally', dots: 1, maxRating: 5, cost: 3, tags: ['WEALTH'] },
  { id: 'Ally_2', type: 'advantage', name: 'Ally ••', description: 'Mortal contact with influence', category: 'Advantages', target: 'Ally', dots: 2, maxRating: 5, cost: 6, tags: ['WEALTH'] },
  { id: 'Resources_1', type: 'advantage', name: 'Resources •', description: 'Wealth and assets', category: 'Advantages', target: 'Resources', dots: 1, maxRating: 5, cost: 3, tags: ['WEALTH'] },
  { id: 'Safe_Haven_1', type: 'advantage', name: 'Safe Haven •', description: 'Secure domicile', category: 'Advantages', target: 'SafeHaven', dots: 1, maxRating: 5, cost: 3 },
];

// ─────────────── XP Logging Types ────────────────────────────────────────

export interface XpAwardRecord {
  id: string;
  episodeId: string;
  amount: number;
  baseAmount: number;
  bonusAmount: number;
  bonusReason?: string;
  reason: string;
  endingTitle?: string;
  timestamp: string;
}

export interface XpSpendRecord {
  upgradeId: string;
  upgradeName?: string;
  category?: string;
  amount: number;
  timestamp: string;
}

// Unified transaction log entry for the XP ledger UI
export interface XpTransaction {
  id: string;
  timestamp: number; // unix ms
  episodeId: string;
  type: 'award' | 'spend';
  amount: number;
  category: string;
  reason: string;
  source?: string;
}

// ─────────────── Core Functions ──────────────────────────────────────────

/**
 * Award XP at the end of an episode/night.
 * Base: +2 XP for episode completion
 * Bonus: +1 XP if ONE of these applies (best match wins):
 *   - desire (character lived up to their desire)
 *   - ambition (character advanced their ambition)
 *   - masquerade (character maintained masquerade)
 *   - humanity (character preserved or gained humanity)
 *
 * Returns enriched XpAwardRecord with base/bonus breakdown.
 */
export function awardXp(episodeId: string, criteria: {
  episodeComplete: boolean;
  desireFulfilled?: boolean;
  ambitionAdvanced?: boolean;
  masqueradeKept?: boolean;
  humanityPreserved?: boolean;
  endingTitle?: string;
}): XpAwardRecord {
  const id = `award_${episodeId}_${Date.now()}`;

  if (!criteria.episodeComplete) {
    return {
      id, episodeId, amount: 0, baseAmount: 0, bonusAmount: 0,
      reason: 'Episode not complete', timestamp: new Date().toISOString(),
    };
  }

  const baseAmount = 2;
  let bonusAmount = 0;
  let bonusReason: string | undefined;

  if (criteria.desireFulfilled) {
    bonusAmount = 1;
    bonusReason = 'Desire fulfilled';
  } else if (criteria.ambitionAdvanced) {
    bonusAmount = 1;
    bonusReason = 'Ambition advanced';
  } else if (criteria.masqueradeKept) {
    bonusAmount = 1;
    bonusReason = 'Masquerade maintained';
  } else if (criteria.humanityPreserved) {
    bonusAmount = 1;
    bonusReason = 'Humanity preserved';
  }

  const amount = baseAmount + bonusAmount;
  const reason = bonusReason
    ? `Episode complete + ${bonusReason.toLowerCase()}`
    : 'Episode complete';

  return {
    id,
    episodeId,
    amount,
    baseAmount,
    bonusAmount,
    bonusReason,
    reason,
    endingTitle: criteria.endingTitle,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Build a unified XP transaction log from a character's award and spend logs,
 * sorted newest-first. Used by the XP Ledger UI.
 */
export function buildTransactionLog(character: Character): XpTransaction[] {
  const transactions: XpTransaction[] = [];

  for (const record of character.xpAwardLog ?? []) {
    transactions.push({
      id: record.id ?? `legacy_award_${record.timestamp}`,
      timestamp: new Date(record.timestamp).getTime(),
      episodeId: record.episodeId,
      type: 'award',
      amount: record.amount,
      category: 'Episode Reward',
      reason: record.reason,
      source: record.endingTitle,
    });
  }

  for (const record of character.xpSpendLog ?? []) {
    const upgrade = UPGRADE_CATALOG.find(u => u.id === record.upgradeId);
    transactions.push({
      id: `spend_${record.upgradeId}_${record.timestamp}`,
      timestamp: new Date(record.timestamp).getTime(),
      episodeId: '',
      type: 'spend',
      amount: record.amount,
      category: record.category ?? upgrade?.category ?? 'Upgrade',
      reason: record.upgradeName ?? upgrade?.name ?? record.upgradeId,
      source: record.upgradeId,
    });
  }

  return transactions.sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Get suggested upgrades (max 6) based on character's current state.
 * Prioritizes: low-cost skills near advancement, disciplines not yet learned, advantages not yet obtained.
 */
export function getSuggestedUpgrades(character: Character): Upgrade[] {
  const suggested: Upgrade[] = [];

  // Find affordable upgrades within 5 XP
  UPGRADE_CATALOG.forEach(upgrade => {
    if (upgrade.cost <= 5 && !suggested.find(u => u.target === upgrade.target)) {
      const current = getCurrentRating(character, upgrade);
      if (current < upgrade.maxRating) {
        suggested.push(upgrade);
      }
    }
  });

  // Sort by cost (cheaper first)
  suggested.sort((a, b) => a.cost - b.cost);

  return suggested.slice(0, 6);
}

/**
 * Check if an upgrade can be purchased.
 * Returns { ok: boolean, reason?: string }
 */
export function canPurchase(upgradeId: string, character: Character): { ok: boolean; reason?: string } {
  const upgrade = UPGRADE_CATALOG.find(u => u.id === upgradeId);
  if (!upgrade) {
    return { ok: false, reason: 'Upgrade not found' };
  }

  // Check XP
  if ((character.xp ?? 0) < upgrade.cost) {
    return { ok: false, reason: `Need ${upgrade.cost} XP, have ${character.xp ?? 0}` };
  }

  // Check max rating
  const current = getCurrentRating(character, upgrade);
  if (current >= upgrade.maxRating) {
    return { ok: false, reason: `Already at max rating (${upgrade.maxRating})` };
  }

  // Check if next step exists (for progression)
  if (upgrade.type === 'skill' || upgrade.type === 'discipline') {
    const nextStep = upgrade.newRating;
    if (nextStep && current + 1 !== nextStep) {
      return { ok: false, reason: `Must buy dots in order` };
    }
  }

  return { ok: true };
}

/**
 * Purchase an upgrade, deduct XP, and return new character state.
 * Atomic: all or nothing.
 */
export function purchase(upgradeId: string, character: Character): Character {
  const upgrade = UPGRADE_CATALOG.find(u => u.id === upgradeId);
  if (!upgrade) throw new Error(`Upgrade ${upgradeId} not found`);

  const canBuy = canPurchase(upgradeId, character);
  if (!canBuy.ok) throw new Error(canBuy.reason ?? 'Cannot purchase');

  const newChar = { ...character };
  newChar.xp = (newChar.xp ?? 0) - upgrade.cost;

  // Apply upgrade
  switch (upgrade.type) {
    case 'skill': {
      newChar.skills = { ...newChar.skills };
      newChar.skills[upgrade.target as keyof Skills] = upgrade.newRating ?? 1;
      break;
    }
    case 'discipline': {
      newChar.disciplines = { ...newChar.disciplines };
      newChar.disciplines[upgrade.target as keyof Disciplines] = upgrade.newRating ?? 1;
      break;
    }
    case 'advantage': {
      if (!newChar.advantages) newChar.advantages = {};
      newChar.advantages[upgrade.target] = upgrade.dots ?? 1;
      break;
    }
  }

  return newChar;
}

/**
 * Get the current rating of a skill, discipline, or advantage.
 */
function getCurrentRating(character: Character, upgrade: Upgrade): number {
  switch (upgrade.type) {
    case 'skill':
      return (character.skills?.[upgrade.target as keyof Skills] ?? 0) as number;
    case 'discipline':
      return (character.disciplines?.[upgrade.target as keyof Disciplines] ?? 0) as number;
    case 'advantage':
      return (character.advantages?.[upgrade.target] ?? 0) as number;
  }
}

/**
 * Calculate total XP spent in a category (Skills, Disciplines, Advantages).
 */
export function getSpentInCategory(character: Character, category: string): number {
  const categoryUpgrades = UPGRADE_CATALOG.filter(u => u.category === category);
  return categoryUpgrades.reduce((total, upgrade) => {
    const current = getCurrentRating(character, upgrade);
    if (current === 0) return total;
    return total + calculateCost(upgrade.type, current);
  }, 0);
}

/**
 * Get the total cost to reach next milestone per category.
 */
export interface ProgressInfo {
  category: string;
  spent: number;
  nextMilestone: number; // e.g., 20 (when reach 20, show achievement)
  percent: number;
}

export function getCategoryProgress(character: Character): ProgressInfo[] {
  return [
    {
      category: 'Skills',
      spent: getSpentInCategory(character, 'Skills'),
      nextMilestone: 20,
      percent: 0,
    },
    {
      category: 'Disciplines',
      spent: getSpentInCategory(character, 'Disciplines'),
      nextMilestone: 30,
      percent: 0,
    },
    {
      category: 'Advantages',
      spent: getSpentInCategory(character, 'Advantages'),
      nextMilestone: 20,
      percent: 0,
    },
  ].map(p => ({
    ...p,
    percent: Math.min(100, Math.round((p.spent / p.nextMilestone) * 100)),
  }));
}

/**
 * Calculate XP cost for a new rating (V5 style).
 * Skill: newRating * 2
 * Discipline: newRating * 5
 * Advantage: dots * 3
 */
export function calculateCost(type: UpgradeType, newRating: number): number {
  switch (type) {
    case 'skill':
      return newRating * 2;
    case 'discipline':
      return newRating * 5;
    case 'advantage':
      return newRating * 3;
  }
}
