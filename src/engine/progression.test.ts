import { describe, it, expect } from 'vitest';
import type { Character } from '../character';
import { UPGRADE_CATALOG, awardXp, canPurchase, purchase, getSuggestedUpgrades } from '../progression';

// Mock character for testing
const mockCharacter: Character = {
  id: 'test',
  name: 'Test Char',
  clan: 'Ventrue',
  gender: 'male',
  generation: 13,
  bloodPotency: 0,
  concept: 'Test',
  predatorType: 'test',
  ambition: 'Power',
  desire: 'Influence',
  background: 'test',
  attributes: {
    Strength: 2, Dexterity: 2, Stamina: 2,
    Charisma: 3, Manipulation: 2, Composure: 2,
    Intelligence: 2, Wits: 2, Resolve: 2,
  },
  skills: {
    Persuasion: 2,
    Stealth: 0,
    Investigation: 0,
  },
  skillSpecialties: {},
  disciplines: { Presence: 1 },
  health: 3,
  superficialDmg: 0,
  aggravatedDmg: 0,
  willpower: 4,
  humanity: 7,
  hunger: 2,
  xp: 5,
};

describe('awardXp', () => {
  it('awards 0 XP if episode not complete', () => {
    const result = awardXp('ep1', { episodeComplete: false });
    expect(result.amount).toBe(0);
  });

  it('awards base 2 XP for episode completion', () => {
    const result = awardXp('ep1', { episodeComplete: true });
    expect(result.amount).toBe(2);
    expect(result.reason).toBe('Episode complete');
  });

  it('awards +1 bonus for desire fulfilled', () => {
    const result = awardXp('ep1', {
      episodeComplete: true,
      desireFulfilled: true,
    });
    expect(result.amount).toBe(3);
    expect(result.reason).toContain('desire fulfilled');
  });

  it('awards +1 bonus for ambition advanced', () => {
    const result = awardXp('ep1', {
      episodeComplete: true,
      ambitionAdvanced: true,
    });
    expect(result.amount).toBe(3);
    expect(result.reason).toContain('ambition advanced');
  });

  it('awards +1 bonus for masquerade kept', () => {
    const result = awardXp('ep1', {
      episodeComplete: true,
      masqueradeKept: true,
    });
    expect(result.amount).toBe(3);
    expect(result.reason).toContain('masquerade maintained');
  });

  it('awards +1 bonus for humanity preserved', () => {
    const result = awardXp('ep1', {
      episodeComplete: true,
      humanityPreserved: true,
    });
    expect(result.amount).toBe(3);
    expect(result.reason).toContain('humanity preserved');
  });

  it('picks first matching bonus (no stacking)', () => {
    const result = awardXp('ep1', {
      episodeComplete: true,
      desireFulfilled: true,
      ambitionAdvanced: true,
      masqueradeKept: true,
    });
    expect(result.amount).toBe(3); // not 6
    expect(result.reason).toContain('desire fulfilled'); // first priority wins
  });
});

describe('canPurchase', () => {
  it('rejects unknown upgrade', () => {
    const result = canPurchase('invalid_id', mockCharacter);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('Upgrade not found');
  });

  it('rejects if insufficient XP', () => {
    const lowXpChar = { ...mockCharacter, xp: 1 };
    const result = canPurchase('Persuasion_1', lowXpChar);
    expect(result.ok).toBe(false);
    expect(result.reason).toContain('Need');
  });

  it('accepts if sufficient XP', () => {
    const result = canPurchase('Persuasion_1', mockCharacter); // needs 2, has 5
    expect(result.ok).toBe(true);
  });

  it('rejects if already at max rating', () => {
    const maxChar = { ...mockCharacter, skills: { ...mockCharacter.skills, Persuasion: 5 } };
    const result = canPurchase('Persuasion_2', maxChar);
    expect(result.ok).toBe(false);
    expect(result.reason).toContain('max rating');
  });

  it('rejects skill if next rating doesnt match (must buy in order)', () => {
    const char = { ...mockCharacter, skills: { ...mockCharacter.skills, Athletics: 0 } };
    // Try to buy Athletics_2 (rating 2) when current is 0
    const result = canPurchase('Athletics_2', char);
    expect(result.ok).toBe(false);
    expect(result.reason).toContain('in order');
  });

  it('accepts discipline purchase if affordable', () => {
    const result = canPurchase('Celerity_1', mockCharacter);
    expect(result.ok).toBe(true);
  });
});

describe('purchase', () => {
  it('throws if upgrade not found', () => {
    expect(() => purchase('invalid_id', mockCharacter)).toThrow();
  });

  it('throws if cannot purchase', () => {
    const lowXpChar = { ...mockCharacter, xp: 1 };
    expect(() => purchase('Persuasion_1', lowXpChar)).toThrow();
  });

  it('deducts XP and applies skill upgrade', () => {
    const result = purchase('Persuasion_1', mockCharacter);
    expect(result.xp).toBe(3); // 5 - 2
    expect(result.skills?.Persuasion).toBe(1); // new rating
  });

  it('deducts XP and applies discipline upgrade', () => {
    const result = purchase('Celerity_1', mockCharacter);
    expect(result.xp).toBe(0); // 5 - 5
    expect(result.disciplines?.Celerity).toBe(1);
  });

  it('deducts XP and applies advantage upgrade', () => {
    const result = purchase('Ally_1', mockCharacter);
    expect(result.xp).toBe(2); // 5 - 3
    expect(result.advantages?.Ally).toBe(1);
  });

  it('does not mutate original character', () => {
    const original = { ...mockCharacter };
    purchase('Persuasion_1', mockCharacter);
    expect(mockCharacter.xp).toBe(original.xp);
  });
});

describe('getSuggestedUpgrades', () => {
  it('returns max 6 upgrades', () => {
    const result = getSuggestedUpgrades(mockCharacter);
    expect(result.length).toBeLessThanOrEqual(6);
  });

  it('only includes affordable upgrades (cost <= 5)', () => {
    const result = getSuggestedUpgrades(mockCharacter);
    result.forEach(upgrade => {
      expect(upgrade.cost).toBeLessThanOrEqual(5);
    });
  });

  it('sorts by cost (cheaper first)', () => {
    const result = getSuggestedUpgrades(mockCharacter);
    for (let i = 1; i < result.length; i++) {
      expect(result[i].cost).toBeGreaterThanOrEqual(result[i - 1].cost);
    }
  });

  it('excludes upgrades already at max rating', () => {
    const maxChar = { ...mockCharacter, skills: { ...mockCharacter.skills, Persuasion: 5 } };
    const result = getSuggestedUpgrades(maxChar);
    const persuasionUpgrades = result.filter(u => u.target === 'Persuasion');
    expect(persuasionUpgrades.length).toBe(0);
  });

  it('prioritizes one upgrade per target (no duplicates per target)', () => {
    const result = getSuggestedUpgrades(mockCharacter);
    const targets = result.map(u => u.target);
    const uniqueTargets = new Set(targets);
    expect(targets.length).toBe(uniqueTargets.size);
  });
});
