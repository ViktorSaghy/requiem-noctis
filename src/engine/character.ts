// src/engine/character.ts
// VTM5e Character System

export type ClanName = 'Ventrue' | 'Toreador' | 'Malkavian' | 'Nosferatu' | 'Brujah' | 'Tremere' | 'Gangrel' | 'Lasombra';

export interface Attributes {
  Strength: number; Dexterity: number; Stamina: number;
  Charisma: number; Manipulation: number; Composure: number;
  Intelligence: number; Wits: number; Resolve: number;
}

export interface Skills {
  // Physical
  Athletics: number; Brawl: number; Craft: number; Drive: number;
  Firearms: number; Larceny: number; Melee: number; Stealth: number; Survival: number;
  // Social
  AnimalKen: number; Etiquette: number; Insight: number; Intimidation: number;
  Leadership: number; Performance: number; Persuasion: number; Streetwise: number; Subterfuge: number;
  // Mental
  Academics: number; Awareness: number; Finance: number; Investigation: number;
  Medicine: number; Occult: number; Politics: number; Science: number; Technology: number;
}

export interface Disciplines {
  Animalism?: number; Auspex?: number; BloodSorcery?: number; Celerity?: number;
  Dominate?: number; Fortitude?: number; Obfuscate?: number; Oblivion?: number;
  Potence?: number; Presence?: number; Protean?: number;
}

export interface Character {
  id: string;
  name: string;
  clan: ClanName;
  gender: 'male' | 'female';
  generation: number;
  bloodPotency: number;
  concept: string;
  predatorType: string;
  ambition: string;
  desire: string;
  background: string;
  attributes: Attributes;
  skills: Partial<Skills>;
  skillSpecialties: Record<string, string>;
  disciplines: Disciplines;
  health: number;
  willpower: number;
  humanity: number;
  hunger: number;
  xp: number;
  savedAt?: number;
}

export const CLANS: Record<ClanName, {
  disciplines: string[];
  bane: string;
  compulsion: string;
  description: string;
}> = {
  Ventrue: {
    disciplines: ['Dominate', 'Fortitude', 'Presence'],
    bane: 'Can only feed from a specific type of mortal. Blood from others provides no sustenance.',
    compulsion: 'Arrogance — must give orders and be obeyed. Cannot accept help without a cost.',
    description: 'Aristocrats and commanders. They rule because they believe they were born to.'
  },
  Toreador: {
    disciplines: ['Auspex', 'Celerity', 'Presence'],
    bane: 'When encountering exceptional beauty, must make a Composure check or be frozen in Daze.',
    compulsion: 'Obsession — must indulge in aesthetic pleasure, ignoring all else.',
    description: 'Artists and hedonists. Immortality gives them eternity to pursue perfection.'
  },
  Malkavian: {
    disciplines: ['Auspex', 'Dominate', 'Obfuscate'],
    bane: 'All Malkavians have a permanent mental derangement that cannot be cured.',
    compulsion: 'Delusion — must act on a strange and vivid delusion for the scene.',
    description: 'Seers and madmen. Their fractured minds perceive truths others cannot bear.'
  },
  Nosferatu: {
    disciplines: ['Animalism', 'Obfuscate', 'Potence'],
    bane: 'Appearance is always 0. Obfuscate fails in photographs and recordings.',
    compulsion: 'Cryptophilia — must share a secret, true or false, and hoard information.',
    description: 'Monsters who wear their curse on the outside. Information is their currency.'
  },
  Brujah: {
    disciplines: ['Celerity', 'Potence', 'Presence'],
    bane: 'Frenzy rolls suffer a penalty equal to Bane Severity.',
    compulsion: 'Rebellion — must resist any order or suggestion, however reasonable.',
    description: 'Rebels and warriors. They remember what it meant to fight for something.'
  },
  Tremere: {
    disciplines: ['Auspex', 'BloodSorcery', 'Dominate'],
    bane: 'Can only form one-way Vinculum bonds. Others bonded to them feel nothing in return.',
    compulsion: 'Perfectionism — must re-do any action that is not exceptional.',
    description: 'Scholars who became warlocks. Knowledge is power, and they have both.'
  },
  Gangrel: {
    disciplines: ['Animalism', 'Fortitude', 'Protean'],
    bane: 'When frenzying, gain one animal feature per frenzy that lasts until next sleep.',
    compulsion: 'Feral Impulses — revert to animal thinking, losing speech and complex thought.',
    description: 'Wanderers who embrace the Beast. More honest about what they are than most.'
  },
  Lasombra: {
    disciplines: ['Dominate', 'Oblivion', 'Potence'],
    bane: 'Appear with difficulty in mirrors and recordings. Mortals feel uneasy around them.',
    compulsion: 'Ruthlessness — must dominate every situation. Cannot accept a subordinate role.',
    description: 'Shadow lords. They cast no reflection because they have discarded their humanity.'
  }
};

export const defaultAttributes = (): Attributes => ({
  Strength: 1, Dexterity: 1, Stamina: 1,
  Charisma: 1, Manipulation: 1, Composure: 1,
  Intelligence: 1, Wits: 1, Resolve: 1
});

export function deriveHealth(character: Character): number {
  return character.attributes.Stamina + 3;
}

export function deriveWillpower(character: Character): number {
  return character.attributes.Composure + character.attributes.Resolve;
}

export function createCharacter(partial: Partial<Character>): Character {
  return {
    id: `char_${Date.now()}`,
    name: '',
    clan: 'Ventrue',
    gender: 'male',
    generation: 13,
    bloodPotency: 1,
    concept: '',
    predatorType: '',
    ambition: '',
    desire: '',
    background: '',
    attributes: defaultAttributes(),
    skills: {},
    skillSpecialties: {},
    disciplines: {},
    health: 6,
    willpower: 5,
    humanity: 7,
    hunger: 1,
    xp: 0,
    ...partial
  };
}
