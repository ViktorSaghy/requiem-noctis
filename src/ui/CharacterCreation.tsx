import { useState } from 'react';
import {
  CLANS,
  createCharacter,
  defaultAttributes,
  deriveHealth,
  deriveWillpower,
  portraitPath,
} from '../engine';
import type { Character, ClanName } from '../engine/character';
import type { Attributes } from '../engine/character';
import { useT } from '../engine/i18n';
import type { TranslationKey } from '../engine/i18n';
import { ITEM_CATALOG, STARTER_WEAPON_IDS, FIXED_STARTER_ITEM_IDS } from '../content/items';

interface Props {
  onComplete: (c: Character, starterItems: string[]) => void;
  onBack: () => void;
}

type Step = 'identity' | 'attributes' | 'skills' | 'disciplines' | 'loadout' | 'review';
const STEPS: Step[] = ['identity', 'attributes', 'skills', 'disciplines', 'loadout', 'review'];

type AttrCategory = 'Physical' | 'Social' | 'Mental';
const ATTR_CATS: Record<AttrCategory, (keyof Attributes)[]> = {
  Physical: ['Strength', 'Dexterity', 'Stamina'],
  Social:   ['Charisma', 'Manipulation', 'Composure'],
  Mental:   ['Intelligence', 'Wits', 'Resolve'],
};

type SkillCat = 'Physical' | 'Social' | 'Mental';
const SKILL_CATS: Record<SkillCat, string[]> = {
  Physical: ['Athletics', 'Brawl', 'Craft', 'Drive', 'Firearms', 'Larceny', 'Melee', 'Stealth', 'Survival'],
  Social:   ['AnimalKen', 'Etiquette', 'Insight', 'Intimidation', 'Leadership', 'Performance', 'Persuasion', 'Streetwise', 'Subterfuge'],
  Mental:   ['Academics', 'Awareness', 'Finance', 'Investigation', 'Medicine', 'Occult', 'Politics', 'Science', 'Technology'],
};
const SKILL_CAT_BUDGETS = [8, 6, 4];

// ── Name Generator ─────────────────────────────────────────────────────────

const CLAN_FIRST_NAMES: Record<ClanName, { male: string[]; female: string[] }> = {
  Ventrue: {
    male: ['Marcus', 'Lucius', 'Maximilian', 'Claudius', 'Augustus', 'Tiberius', 'Hadrian'],
    female: ['Helena', 'Victoria', 'Cornelia', 'Octavia', 'Valeria', 'Livia', 'Domitia'],
  },
  Toreador: {
    male: ['Adrien', 'Rémi', 'Florian', 'Matteo', 'Olivier', 'Luca'],
    female: ['Séraphine', 'Céleste', 'Isabeau', 'Valentina', 'Aurore', 'Inès', 'Camille'],
  },
  Malkavian: {
    male: ['Ezekiel', 'Cornelius', 'Jasper', 'Obadiah', 'Algernon', 'Eustace', 'Bartholomew', 'Thaddeus'],
    female: ['Harriet', 'Mildred', 'Prudence', 'Lavinia', 'Millicent', 'Eugenia'],
  },
  Nosferatu: {
    male: ['Björn', 'Leif', 'Konstantinos', 'Ragnvald', 'Håkon', 'Olaf', 'Ivar'],
    female: ['Sigrid', 'Anastasia', 'Zosima', 'Gudrun', 'Basileia', 'Euphrosyne'],
  },
  Brujah: {
    male: ['Cormac', 'Dimitrios', 'Stavros', 'Leandro', 'Oisín', 'Brennus', 'Fionn', 'Conall'],
    female: ['Áine', 'Rhiannon', 'Brigid', 'Niamh', 'Kallistrate', 'Zephyrine'],
  },
  Tremere: {
    male: ['Albrecht', 'Gottfried', 'Konrad', 'Sigismund', 'Wolfram', 'Burkhard', 'Dietrich', 'Hartmann'],
    female: ['Hildegard', 'Mathilde', 'Adalberta', 'Irmgard', 'Mechthild', 'Kunigunde'],
  },
  Gangrel: {
    male: ['Ulf', 'Thorvald', 'Ragnar', 'Gunnar', 'Eamon', 'Donnchad'],
    female: ['Saoirse', 'Morwenna', 'Fionnuala', 'Aoife', 'Skadi', 'Astrid', 'Freydís'],
  },
  Lasombra: {
    male: ['Rodrigo', 'Iago', 'Álvaro', 'Ramiro', 'Ferrante', 'Ignacio', 'Baldassare'],
    female: ['Constanza', 'Beatriz', 'Soledad', 'Esperanza', 'Vittoria', 'Catalina', 'Lucrezia'],
  },
  Tzimisce: {
    male: ['Vlad', 'Bogdan', 'Radu', 'Dragoș', 'Ștefan', 'Andrei', 'Mihai'],
    female: ['Mirela', 'Ecaterina', 'Luminița', 'Doina', 'Viorica', 'Teodora'],
  },
};

const CLAN_LAST_NAMES: Record<ClanName, string[]> = {
  Ventrue: ['Aurelius', 'Valerius', 'Septimus', 'Cassius', 'Merula', 'Vespasian', 'Severus', 'Lucilla', 'Octavian', 'Cornelia'],
  Toreador: ['Moreau', 'Delacroix', 'Chevalier', 'Bianchi', 'Duval', 'Rousseau', 'Bellini', 'Laurent', 'D\'Argent', 'Fiore'],
  Malkavian: ['Crowe', 'Thorn', 'Widdershins', 'Finch', 'Pock', 'Quill', 'Hallow', 'Rift', 'Haze', 'Shade'],
  Nosferatu: ['Dragomir', 'Korzek', 'Vargan', 'Petrov', 'Kostr', 'Vasil', 'Baran', 'Morva', 'Sava', 'Nestor'],
  Brujah: ['O\'Rourke', 'Byrne', 'Kane', 'Maddox', 'Blackthorn', 'Draven', 'Vale', 'Scar', 'Flint', 'Cross'],
  Tremere: ['Weiss', 'Eisen', 'Nacht', 'Vogel', 'Albrecht', 'Schatten', 'Weber', 'Faust', 'Hartmann', 'Strauss'],
  Gangrel: ['Storm', 'Wilder', 'Fen', 'Ash', 'Thorn', 'Morrow', 'Crow', 'Wolf', 'Bryn', 'Feral'],
  Lasombra: ['del Toro', 'de la Cruz', 'Arroyo', 'Sombra', 'Velasco', 'Montenegro', 'Reyes', 'Silvano', 'Cortez', 'Casillas'],
  Tzimisce: ['Dragos', 'Ionescu', 'Vasile', 'Stanescu', 'Petrescu', 'Diaconu', 'Muntean', 'Sandu', 'Iancu', 'Radu'],
};

function sample<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function generateName(clan: ClanName, gender: 'male' | 'female'): string {
  const first = sample(CLAN_FIRST_NAMES[clan][gender]);
  const last = sample(CLAN_LAST_NAMES[clan]);

  switch (clan) {
    case 'Malkavian': {
      const epithets = ['the Mad', 'the Quiet', 'the Pale', 'the Seer', 'of Liminality', 'the Whisper'];
      if (Math.random() < 0.4) return `${first} ${sample(epithets)}`;
      return `${first} ${last}`;
    }
    case 'Nosferatu': {
      const darkEpithets = ['the Pale', 'of the Sewers', 'the Night', 'of Blackwater', 'the Hollow'];
      if (Math.random() < 0.35) return `${first} ${sample(darkEpithets)}`;
      return `${first} ${last}`;
    }
    case 'Brujah': {
      const warEpithets = ['the Red', 'the Fist', 'of Iron', 'the Reckless'];
      if (Math.random() < 0.25) return `${first} ${sample(warEpithets)}`;
      return `${first} ${last}`;
    }
    case 'Tremere': {
      if (Math.random() < 0.25) return `Magister ${first} ${last}`;
      return `${first} ${last}`;
    }
    case 'Gangrel': {
      const wildEpithets = ['of the Wild', 'of the Moon', 'of the Woods', 'the Wanderer'];
      if (Math.random() < 0.3) return `${first} ${sample(wildEpithets)}`;
      return `${first} ${last}`;
    }
    case 'Lasombra': {
      if (Math.random() < 0.3) return `${first} de ${last}`;
      return `${first} ${last}`;
    }
    case 'Tzimisce': {
      const easternEpithets = ['of the Carpathians', 'the Scarred', 'of Moldavia'];
      if (Math.random() < 0.25) return `${first} ${sample(easternEpithets)}`;
      return `${first} ${last}`;
    }
    default:
      return `${first} ${last}`;
  }
}

// ── Template Characters ────────────────────────────────────────────────────

interface TemplateChar {
  name: string;
  clan: ClanName;
  gender: 'male' | 'female';
  concept: string;
  background: string;
  playHint: string;
  starterWeapons: [string, string];
  extraItems?: string[];
  attrs: Attributes;
  priorities: Partial<Record<AttrCategory, number>>;
  skillPriorities: Partial<Record<SkillCat, number>>;
  skills: Record<string, number>;
  discPowers: string[];
}

const TEMPLATES: TemplateChar[] = [
  {
    name: 'Viktor Casimir',
    clan: 'Ventrue',
    gender: 'male',
    concept: 'Fallen Industrialist',
    background: 'Before the Embrace, Viktor built a shipping empire from war debt and hard-won connections. His sire saw ambition where others saw brutality, and the Embrace came as a reward — or so Viktor believed. He woke from three years of involuntary torpor in 2011 to find his assets liquidated, his childer\'s loyalty sold, and his status in the Camarilla a polite fiction. He has spent every night since rebuilding, using every tool the Ventrue have given him and a few they haven\'t sanctioned.',
    playHint: 'Every obstacle is a negotiation. Lead with Presence and Dominate, collect leverage before you need it, and only draw the revolver when it can be the last word in the conversation.',
    starterWeapons: ['revolver', 'switchblade'],
    extraItems: ['letter_of_introduction'],
    attrs: { Strength:2, Dexterity:2, Stamina:2, Charisma:3, Manipulation:4, Composure:2, Intelligence:3, Wits:2, Resolve:2 },
    priorities: { Social: 0, Mental: 1, Physical: 2 },
    skillPriorities: { Social: 0, Mental: 1, Physical: 2 },
    skills: { Persuasion:3, Etiquette:2, Subterfuge:3, Finance:3, Politics:2, Investigation:1, Stealth:2, Drive:2 },
    discPowers: ['Dominate', 'Presence', 'Fortitude'],
  },
  {
    name: 'Séraphine Moreau',
    clan: 'Toreador',
    gender: 'female',
    concept: 'Forgotten Muse',
    background: 'Séraphine was Embraced in Paris in 1923, the year her cabaret act filled houses from Pigalle to Montparnasse. Her sire vanished during the Occupation and was never recovered. She spent four decades drifting through the city\'s art underworld before the Anarchy Era woke her into a scene that no longer remembered her name. She makes her unlife now at the edges of creative circles — funding artists who interest her, performing quiet favours for the Prince, and moving through locked rooms with a smile that no one has learned to read.',
    playHint: 'You move faster than anything in the room when you choose to — use Celerity to control when violence happens, not to brawl. Your switchblade and your charm are equally sharp; lead with whichever the room deserves.',
    starterWeapons: ['switchblade', 'knuckle_duster'],
    extraItems: ['forged_pass'],
    attrs: { Strength:2, Dexterity:3, Stamina:2, Charisma:4, Manipulation:2, Composure:2, Intelligence:2, Wits:2, Resolve:2 },
    priorities: { Social: 0, Physical: 1, Mental: 2 },
    skillPriorities: { Social: 0, Mental: 1, Physical: 2 },
    skills: { Performance:3, Persuasion:3, Etiquette:2, Insight:3, Awareness:2, Occult:1, Stealth:2, Athletics:2 },
    discPowers: ['Auspex', 'Presence', 'Celerity'],
  },
  {
    name: 'Brother Aldric',
    clan: 'Malkavian',
    gender: 'male',
    concept: 'Penitent Prophet',
    background: 'A Benedictine monk from the 12th century who received visions that his abbot called heresy and his Malkavian sire called an invitation. He has wandered for eight hundred years, taking confession from those who have no priest, diagnosing the spiritual condition of cities before their inhabitants notice it themselves. He carries a wooden stake he named \'the cure\' and has never explained for whom. His Cobweb connections run deep enough that other Malkavians sometimes find him unsettling.',
    playHint: 'The madness is an intelligence advantage. Your Auspex shows you what others miss; your Dominate gives you the edit. Follow the visions — in these chronicles they are usually pointing at something real. The stake is for endings.',
    starterWeapons: ['wooden_stake', 'hunting_knife'],
    attrs: { Strength:2, Dexterity:2, Stamina:2, Charisma:2, Manipulation:3, Composure:2, Intelligence:3, Wits:3, Resolve:2 },
    priorities: { Mental: 0, Social: 1, Physical: 2 },
    skillPriorities: { Mental: 0, Social: 1, Physical: 2 },
    skills: { Occult:3, Academics:2, Awareness:2, Investigation:1, Intimidation:3, Insight:2, Subterfuge:1, Stealth:2, Survival:2 },
    discPowers: ['Auspex', 'Dominate', 'Obfuscate'],
  },
  {
    name: 'Elara the Grey',
    clan: 'Nosferatu',
    gender: 'female',
    concept: 'Spymaster Without a Court',
    background: 'No court records Elara\'s Embrace because no court has ever successfully kept records on her. She has served as information broker to three different Princes, been betrayed by two of them, and returned the favour to all three at different times. She now operates on retainer to no one, accumulating information as currency and carefully ensuring that anyone who might want her gone does not yet know enough to risk it. The encrypted drive she carries contains enough compromising material on six Kindred to end three careers — which is why she is still alive.',
    playHint: 'Never be where violence can find you — use Obfuscate and environmental knowledge to shape every confrontation before it starts. Potence is the final argument and an excellent one. The knife is for situations that need to stay quiet.',
    starterWeapons: ['hunting_knife', 'knuckle_duster'],
    extraItems: ['encrypted_drive'],
    attrs: { Strength:2, Dexterity:3, Stamina:2, Charisma:1, Manipulation:3, Composure:2, Intelligence:4, Wits:2, Resolve:2 },
    priorities: { Mental: 0, Physical: 1, Social: 2 },
    skillPriorities: { Mental: 0, Physical: 1, Social: 2 },
    skills: { Investigation:3, Awareness:2, Occult:2, Technology:1, Stealth:3, Larceny:2, Athletics:1, Subterfuge:3, Insight:1 },
    discPowers: ['Obfuscate', 'Animalism', 'Potence'],
  },
  {
    name: 'Cormac the Red',
    clan: 'Brujah',
    gender: 'male',
    concept: 'Blood Games Champion',
    background: 'Cormac O\'Briain was fighting for Irish independence when his Brujah sire found something worth keeping in him — specifically, a talent for organised violence and a refusal to quit. He has been fighting ever since: union halls, resistance cells, three wars of liberation, and finally the Blood Games, where his reputation outgrew his patron\'s patience. He is currently considered a liability by the local Baron and an asset by the Baron\'s enemies, which is a more useful position than it sounds.',
    playHint: 'You are the most dangerous thing in most rooms, and the Beast knows it. Potence and Celerity together end fights in two moves — the challenge is choosing which fights are worth ending. The duster closes; the bat breaks groups.',
    starterWeapons: ['knuckle_duster', 'baseball_bat'],
    attrs: { Strength:4, Dexterity:2, Stamina:2, Charisma:2, Manipulation:2, Composure:3, Intelligence:2, Wits:2, Resolve:2 },
    priorities: { Physical: 0, Social: 1, Mental: 2 },
    skillPriorities: { Physical: 0, Social: 1, Mental: 2 },
    skills: { Brawl:3, Athletics:3, Survival:2, Intimidation:3, Streetwise:2, Leadership:1, Awareness:2, Investigation:2 },
    discPowers: ['Celerity', 'Potence', 'Presence'],
  },
  {
    name: 'Hildegard Silber',
    clan: 'Tremere',
    gender: 'female',
    concept: 'Renegade Thaumaturge',
    background: 'Hildegard was a Frankfurt alchemist when the Tremere Embraced her to staff their eastern network in the 14th century. She served the Pyramid for six hundred years with exactness and no warmth whatsoever. When the Vienna chantry collapsed and the chain of command fractured in the modern nights, she evaluated her options and concluded that freelance was preferable to factional. She now operates as an occult specialist for hire — very unpopular with former colleagues, very useful to everyone else.',
    playHint: 'Keep distance and control information. Blood Sorcery makes you formidable at range — use the pistol to buy space and your disciplines to dictate terms. You have survived six centuries by being the most prepared person in every situation.',
    starterWeapons: ['pistol_9mm', 'switchblade'],
    extraItems: ['first_aid_kit'],
    attrs: { Strength:2, Dexterity:2, Stamina:2, Charisma:2, Manipulation:3, Composure:3, Intelligence:4, Wits:2, Resolve:2 },
    priorities: { Mental: 0, Social: 1, Physical: 2 },
    skillPriorities: { Mental: 0, Social: 1, Physical: 2 },
    skills: { Occult:3, Academics:3, Investigation:2, Awareness:1, Intimidation:2, Subterfuge:2, Medicine:1, Stealth:2, Larceny:1 },
    discPowers: ['Auspex', 'Dominate', 'Fortitude'],
  },
  {
    name: 'Skadi Eriksdóttir',
    clan: 'Gangrel',
    gender: 'female',
    concept: 'Feral Tracker',
    background: 'Skadi was a Norse raider when her Gangrel sire found something worth preserving in her — specifically, the combination of patience and brutality that makes a useful long-range scout. She has been moving ever since: fifteen centuries of roads and wilderness, wars and contested borders, service and disappearance. She works as guide, courier, and occasional problem-solver for Kindred who need someone who can operate anywhere and leave no trace. She does not stay in cities longer than she needs to.',
    playHint: 'Read the territory before you enter it — Animalism and heightened senses tell you what others miss. Your strength is mobility and ambush: the knife closes distance quickly and the stake ends things cleanly. Get in, complete the objective, leave nothing behind.',
    starterWeapons: ['hunting_knife', 'wooden_stake'],
    attrs: { Strength:3, Dexterity:3, Stamina:3, Charisma:2, Manipulation:1, Composure:2, Intelligence:2, Wits:3, Resolve:2 },
    priorities: { Physical: 0, Mental: 1, Social: 2 },
    skillPriorities: { Physical: 0, Mental: 1, Social: 2 },
    skills: { Survival:3, Athletics:3, Stealth:3, Brawl:2, Melee:2, Awareness:3, AnimalKen:2, Investigation:1, Intimidation:2 },
    discPowers: ['Animalism', 'Fortitude', 'Protean'],
  },
];

// ── Component ──────────────────────────────────────────────────────────────

export function CharacterCreation({ onComplete, onBack }: Props) {
  const t = useT();
  const portraitEra = 'modern' as const;
  const [step, setStep] = useState<Step>('identity');
  const [name, setName] = useState('');
  const [clan, setClan] = useState<ClanName>('Ventrue');
  const [gender, setGender] = useState<'male' | 'female'>('male');

  const [attrs, setAttrs] = useState<Attributes>(defaultAttributes());
  const [priorities, setPriorities] = useState<Partial<Record<AttrCategory, number>>>({});

  const [skills, setSkills] = useState<Record<string, number>>({});
  const [skillTab, setSkillTab] = useState<SkillCat>('Physical');
  const [skillPriorities, setSkillPriorities] = useState<Partial<Record<SkillCat, number>>>({});

  const [discPowers, setDiscPowers] = useState<string[]>([]);
  const [selectedWeapons, setSelectedWeapons] = useState<string[]>([]);
  const [templateExtraItems, setTemplateExtraItems] = useState<string[]>([]);
  const [previewTemplate, setPreviewTemplate] = useState<TemplateChar | null>(null);

  const stepIndex = STEPS.indexOf(step);

  const clanData = CLANS[clan];
  const clanDiscs = clanData.disciplines;

  const PRIORITY_LABELS = [
    t('creation.priority.primary'),
    t('creation.priority.secondary'),
    t('creation.priority.tertiary'),
  ];

  const STEP_TITLES: Record<Step, string> = {
    identity: t('creation.steps.identity'),
    attributes: t('creation.steps.attributes'),
    skills: t('creation.steps.skills'),
    disciplines: t('creation.steps.disciplines'),
    loadout: t('creation.steps.loadout'),
    review: t('creation.steps.review'),
  };

  const priorityFor = (cat: AttrCategory): number => {
    const order = Object.entries(priorities).sort((a, b) => a[1] - b[1]);
    const idx = order.findIndex(([k]) => k === cat);
    return idx >= 0 ? [5, 4, 3][idx] : 0;
  };

  const attrBase = 1;
  const attrSpend = (cat: AttrCategory) => {
    const keys = ATTR_CATS[cat];
    return keys.reduce((s, k) => s + (attrs[k] - attrBase), 0);
  };
  const attrBudget = (cat: AttrCategory) => priorityFor(cat);
  const attrRemaining = (cat: AttrCategory) => attrBudget(cat) - attrSpend(cat);

  function skillPriorityFor(cat: SkillCat): number {
    const order = Object.entries(skillPriorities).sort((a, b) => a[1] - b[1]);
    const idx = order.findIndex(([k]) => k === cat);
    return idx >= 0 ? SKILL_CAT_BUDGETS[idx] : 0;
  }

  function skillSpentInCat(cat: SkillCat): number {
    return SKILL_CATS[cat].reduce((s, sk) => s + (skills[sk] ?? 0), 0);
  }

  function skillRemainingInCat(cat: SkillCat): number {
    return skillPriorityFor(cat) - skillSpentInCat(cat);
  }

  function setSkillPriority(cat: SkillCat, rank: number) {
    const existing = Object.entries(skillPriorities).find(([, v]) => v === rank)?.[0] as SkillCat | undefined;
    setSkillPriorities(prev => {
      const next = { ...prev };
      if (existing && existing !== cat) delete next[existing];
      next[cat] = rank;
      return next;
    });
  }

  function setAttr(key: keyof Attributes, delta: number) {
    const cat = (Object.entries(ATTR_CATS) as [AttrCategory, (keyof Attributes)[]][]).find(([, ks]) => ks.includes(key))?.[0];
    if (!cat) return;
    const next = attrs[key] + delta;
    if (next < 1 || next > 5) return;
    if (delta > 0 && attrRemaining(cat) <= 0) return;
    setAttrs(prev => ({ ...prev, [key]: next }));
  }

  function setSkill(key: string, delta: number, cat: SkillCat) {
    const cur = skills[key] ?? 0;
    const next = cur + delta;
    if (next < 0 || next > 5) return;
    if (delta > 0 && skillRemainingInCat(cat) <= 0) return;
    setSkills(prev => ({ ...prev, [key]: next }));
  }

  function toggleDisc(power: string) {
    setDiscPowers(prev => {
      if (prev.includes(power)) return prev.filter(p => p !== power);
      if (prev.length >= 3) return prev;
      return [...prev, power];
    });
  }

  function toggleWeapon(id: string) {
    setSelectedWeapons(prev => {
      if (prev.includes(id)) return prev.filter(w => w !== id);
      if (prev.length >= 2) return prev;
      return [...prev, id];
    });
  }

  function setPriority(cat: AttrCategory, rank: number) {
    const existing = Object.entries(priorities).find(([, v]) => v === rank)?.[0] as AttrCategory | undefined;
    setPriorities(prev => {
      const next = { ...prev };
      if (existing && existing !== cat) delete next[existing];
      next[cat] = rank;
      return next;
    });
  }

  function applyTemplate(tmpl: TemplateChar) {
    setName(tmpl.name);
    setClan(tmpl.clan);
    setGender(tmpl.gender);
    setAttrs(tmpl.attrs);
    setPriorities(tmpl.priorities);
    setSkillPriorities(tmpl.skillPriorities);
    setSkills(tmpl.skills);
    setDiscPowers(tmpl.discPowers);
    setSelectedWeapons([...tmpl.starterWeapons]);
    setTemplateExtraItems(tmpl.extraItems ?? []);
    setPreviewTemplate(null);
    setStep('review');
  }

  function canAdvance(): boolean {
    if (step === 'identity') return name.trim().length > 0;
    if (step === 'attributes') return Object.keys(priorities).length === 3;
    if (step === 'skills') return Object.keys(skillPriorities).length === 3;
    if (step === 'disciplines') return true;
    if (step === 'loadout') return selectedWeapons.length === 2;
    return true;
  }

  function advance() {
    if (!canAdvance()) return;
    const idx = STEPS.indexOf(step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]);
  }

  function finish() {
    const discObj: Record<string, number> = {};
    for (const p of discPowers) discObj[p] = 1;
    const base = createCharacter({
      name: name.trim(),
      clan,
      gender,
      attributes: attrs,
      skills,
      disciplines: discObj,
    });
    const char: Character = {
      ...base,
      health: deriveHealth(base),
      willpower: deriveWillpower(base),
    };
    onComplete(char, [...selectedWeapons, ...FIXED_STARTER_ITEM_IDS, ...templateExtraItems]);
  }

  function tCat(cat: string): string {
    return t(`cat.${cat.toLowerCase()}` as TranslationKey);
  }

  function tAttr(key: string): string {
    return t(`attr.${key}` as TranslationKey);
  }

  function tSkill(key: string): string {
    return t(`skill.${key}` as TranslationKey);
  }

  return (
    <div className="creation-screen">
      <div className="creation-header">
        <div className="creation-step-label">{t('creation.step', { n: stepIndex + 1, total: STEPS.length })}</div>
        <div className="creation-step-title">{STEP_TITLES[step]}</div>
        <div className="step-dots">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`step-dot ${i < stepIndex ? 'done' : i === stepIndex ? 'active' : ''}`}
            />
          ))}
        </div>
      </div>

      <div className="creation-body">
        {step === 'identity' && (
          <>
            <div className="field">
              <label>{t('creation.quickStart')}</label>
              <div className="template-row">
                {TEMPLATES.map(tmpl => (
                  <div
                    key={tmpl.name}
                    className={`template-card${previewTemplate?.name === tmpl.name ? ' template-card--selected' : ''}`}
                    onClick={() => setPreviewTemplate(previewTemplate?.name === tmpl.name ? null : tmpl)}
                  >
                    <img
                      className="template-portrait"
                      src={portraitPath(portraitEra, tmpl.clan, tmpl.gender)}
                      alt=""
                      onError={e => {
                        const fallback = portraitPath(portraitEra, tmpl.clan);
                        if (!e.currentTarget.src.endsWith(fallback)) {
                          e.currentTarget.src = fallback;
                        } else {
                          e.currentTarget.style.display = 'none';
                        }
                      }}
                    />
                    <div className="template-clan">{tmpl.clan}</div>
                    <div className="template-name">{tmpl.name}</div>
                    <div className="template-concept">{tmpl.concept}</div>
                  </div>
                ))}
              </div>

              {previewTemplate && (
                <div className="template-detail">
                  <div className="template-detail-header">
                    <img
                      className="template-detail-portrait"
                      src={portraitPath(portraitEra, previewTemplate.clan, previewTemplate.gender)}
                      alt=""
                      onError={e => { e.currentTarget.style.display = 'none'; }}
                    />
                    <div className="template-detail-titles">
                      <div className="template-detail-clan">{previewTemplate.clan}</div>
                      <div className="template-detail-name">{previewTemplate.name}</div>
                      <div className="template-detail-concept">{previewTemplate.concept}</div>
                    </div>
                  </div>

                  <p className="template-detail-background">{previewTemplate.background}</p>

                  <div className="template-detail-hint">
                    <span className="template-detail-hint-label">How to play — </span>
                    {previewTemplate.playHint}
                  </div>

                  <div className="template-detail-weapons">
                    <span className="template-detail-weapons-label">Starting loadout:</span>
                    <div className="template-detail-weapon-chips">
                      {previewTemplate.starterWeapons.map(id => {
                        const item = ITEM_CATALOG[id];
                        return item ? (
                          <span key={id} className="template-weapon-chip">
                            {item.icon} {item.name}
                          </span>
                        ) : null;
                      })}
                      {(previewTemplate.extraItems ?? []).map(id => {
                        const item = ITEM_CATALOG[id];
                        return item ? (
                          <span key={id} className="template-weapon-chip template-weapon-chip--extra">
                            {item.icon} {item.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>

                  <div className="template-detail-actions">
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setPreviewTemplate(null)}
                    >
                      ← Back
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => applyTemplate(previewTemplate)}
                    >
                      Play as {previewTemplate.name} →
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="field">
              <label>{t('creation.characterName')}</label>
              <div className="name-field-row">
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={t('creation.namePlaceholder')}
                  autoFocus
                />
                <button
                  className="btn btn-sm btn-ghost name-gen-btn"
                  type="button"
                  onClick={() => setName(generateName(clan, gender))}
                >
                  {t('creation.generate')}
                </button>
              </div>
            </div>

            <div className="field">
              <label>{t('creation.gender')}</label>
              <select value={gender} onChange={e => setGender(e.target.value as 'male' | 'female')}>
                <option value="male">{t('male')}</option>
                <option value="female">{t('female')}</option>
              </select>
            </div>
            <div className="field">
              <label>{t('creation.clan')}</label>
            </div>
            <div className="clan-grid">
              {(Object.keys(CLANS) as ClanName[]).map(c => (
                <div
                  key={c}
                  className={`clan-card ${clan === c ? 'selected' : ''}`}
                  onClick={() => setClan(c)}
                >
                  <img
                    className="clan-portrait-thumb"
                    src={portraitPath(portraitEra, c, gender)}
                    alt=""
                    onError={e => {
                      const fallback = portraitPath(portraitEra, c);
                      if (e.currentTarget.src !== fallback) {
                        e.currentTarget.src = fallback;
                      } else {
                        e.currentTarget.style.display = 'none';
                      }
                    }}
                  />
                  <div className="clan-card-name">{c}</div>
                  <div className="clan-card-bane">{CLANS[c].bane.slice(0, 60)}…</div>
                </div>
              ))}
            </div>
            {clan && (
              <div className="clan-info-card">
                <img
                  className="clan-portrait-large"
                  src={portraitPath(portraitEra, clan, gender)}
                  alt={clan}
                  onError={e => {
                    const fallback = portraitPath(portraitEra, clan);
                    if (e.currentTarget.src !== fallback) {
                      e.currentTarget.src = fallback;
                    } else {
                      e.currentTarget.style.display = 'none';
                    }
                  }}
                />
                <div className="clan-info-text">
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontStyle: 'italic', marginBottom: '0.5rem' }}>
                    {CLANS[clan].description}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    <strong style={{ color: 'var(--gold)', fontFamily: 'var(--display)' }}>Disciplines: </strong>
                    {CLANS[clan].disciplines.join(', ')}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {step === 'attributes' && (
          <>
            <div className="panel" style={{ marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              {t('creation.attr.hint')}
            </div>
            {(Object.keys(ATTR_CATS) as AttrCategory[]).map(cat => (
              <div key={cat} className="attr-section">
                <div className="attr-section-title">
                  <span>{tCat(cat)}</span>
                  <span style={{ color: 'var(--text-dim)' }}>
                    {attrRemaining(cat) >= 0
                      ? t('creation.ptsLeft', { n: attrRemaining(cat) })
                      : t('creation.overBudget')}
                  </span>
                </div>
                <div className="priority-row">
                  {[0, 1, 2].map(rank => (
                    <button
                      key={rank}
                      className={`priority-btn ${priorities[cat] === rank ? 'selected' : ''}`}
                      onClick={() => setPriority(cat, rank)}
                    >
                      {PRIORITY_LABELS[rank]}
                    </button>
                  ))}
                </div>
                {ATTR_CATS[cat].map(attr => (
                  <div key={attr} className="attr-row">
                    <div className="attr-name">{tAttr(attr)}</div>
                    <div className="attr-controls">
                      <button
                        className="stepper-btn"
                        onClick={() => setAttr(attr, -1)}
                        disabled={attrs[attr] <= 1}
                      >−</button>
                      <div className="attr-value">{attrs[attr]}</div>
                      <button
                        className="stepper-btn"
                        onClick={() => setAttr(attr, 1)}
                        disabled={attrs[attr] >= 5 || attrRemaining(cat) <= 0}
                      >+</button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </>
        )}

        {step === 'skills' && (
          <>
            <div className="panel" style={{ marginBottom: '0.75rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              {t('creation.skill.hint')}
            </div>
            {(Object.keys(SKILL_CATS) as SkillCat[]).map(cat => (
              <div key={cat} className="attr-section" style={{ marginBottom: '0.5rem' }}>
                <div className="attr-section-title">
                  <span>{tCat(cat)}</span>
                  <span style={{ color: skillRemainingInCat(cat) < 0 ? 'var(--crimson-light)' : 'var(--text-dim)' }}>
                    {skillPriorityFor(cat) > 0
                      ? t('creation.ptsLeft', { n: skillRemainingInCat(cat) })
                      : t('creation.noPriority')}
                  </span>
                </div>
                <div className="priority-row">
                  {[0, 1, 2].map(rank => (
                    <button
                      key={rank}
                      className={`priority-btn ${skillPriorities[cat] === rank ? 'selected' : ''}`}
                      onClick={() => setSkillPriority(cat, rank)}
                    >
                      {PRIORITY_LABELS[rank]}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {Object.keys(skillPriorities).length === 3 && (
              <>
                <div className="skill-tabs">
                  {(['Physical', 'Social', 'Mental'] as SkillCat[]).map(cat => (
                    <button
                      key={cat}
                      className={`skill-tab ${skillTab === cat ? 'active' : ''}`}
                      onClick={() => setSkillTab(cat)}
                    >
                      {tCat(cat)} <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>({t('creation.skillLeft', { n: skillRemainingInCat(cat) })})</span>
                    </button>
                  ))}
                </div>
                {SKILL_CATS[skillTab].map(sk => (
                  <div key={sk} className="attr-row">
                    <div className="attr-name">{tSkill(sk)}</div>
                    <div className="attr-controls">
                      <button
                        className="stepper-btn"
                        onClick={() => setSkill(sk, -1, skillTab)}
                        disabled={(skills[sk] ?? 0) <= 0}
                      >−</button>
                      <div className="attr-value">{skills[sk] ?? 0}</div>
                      <button
                        className="stepper-btn"
                        onClick={() => setSkill(sk, 1, skillTab)}
                        disabled={(skills[sk] ?? 0) >= 5 || skillRemainingInCat(skillTab) <= 0}
                      >+</button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </>
        )}

        {step === 'disciplines' && (
          <div className="disc-section">
            <div className="disc-title">{t('creation.discTitle', { clan })}</div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>
              {t('creation.discHint')}
            </p>
            {clanDiscs.map(disc => {
              const sel = discPowers.includes(disc);
              const DISC_L1_POWER: Record<string, string> = {
                Animalism: 'Unleash the Beast — stir enemy\'s inner predator',
                Auspex: 'Premonition — reduce all enemy attack pools',
                BloodSorcery: 'Scorching Vitae — aggravated blood assault',
                Celerity: 'Rapid Reflexes — boost your defense pool',
                Dominate: 'Mesmerize — eye-contact stun (contested)',
                Fortitude: 'Resilience — soak damage equal to dots',
                Obfuscate: 'Cloak of Shadows — vanish from sight',
                Oblivion: 'Void Touch — drain enemy Willpower',
                Potence: 'Lethal Body — add dots to damage on hit',
                Presence: 'Awe — enemies −1 to attacks',
                Protean: 'Feral Claws — aggravated claw strike',
              };
              return (
                <div
                  key={disc}
                  className={`disc-power ${sel ? 'selected' : ''}`}
                  onClick={() => toggleDisc(disc)}
                >
                  <div className={`disc-dot ${sel ? '' : 'empty'}`} />
                  <div className="disc-power-name">{disc}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    {DISC_L1_POWER[disc] ?? (sel ? t('creation.discDot') : '—')}
                  </div>
                </div>
              );
            })}
            <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              {t('creation.discSelected', { n: discPowers.length })}
            </div>
          </div>
        )}

        {step === 'loadout' && (
          <div className="disc-section">
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>
              {t('creation.loadout.hint')}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
              {STARTER_WEAPON_IDS.map(id => {
                const item = ITEM_CATALOG[id];
                if (!item) return null;
                const sel = selectedWeapons.includes(id);
                const disabled = !sel && selectedWeapons.length >= 2;
                const atk = item.effects?.find(e => e.type === 'attack_bonus')?.value ?? 0;
                const dmg = item.effects?.find(e => e.type === 'damage_bonus')?.value ?? 0;
                return (
                  <div
                    key={id}
                    className={`disc-power${sel ? ' selected' : ''}`}
                    style={{
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: '0.3rem',
                      opacity: disabled ? 0.4 : 1,
                      cursor: disabled ? 'not-allowed' : 'pointer',
                    }}
                    onClick={() => !disabled && toggleWeapon(id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
                      <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{item.icon}</span>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem', flex: 1 }}>{item.name}</span>
                      {sel && <div className="disc-dot" />}
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem', fontSize: '0.7rem' }}>
                      <span style={{ color: 'var(--gold)', background: 'rgba(201,168,76,0.1)', padding: '1px 5px', borderRadius: '2px' }}>
                        ATK +{atk}
                      </span>
                      <span style={{ color: 'var(--crimson)', background: 'rgba(139,26,26,0.1)', padding: '1px 5px', borderRadius: '2px' }}>
                        DMG +{dmg}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', lineHeight: 1.3 }}>
                      {item.description}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              {t('creation.loadout.selected', { n: selectedWeapons.length })}
            </div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
              {t('creation.loadout.fixedItems')}
            </div>
          </div>
        )}

        {step === 'review' && (() => {
          const base = createCharacter({ name: name.trim(), clan, gender, attributes: attrs, skills, disciplines: {} });
          return (
            <>
              <div className="review-block">
                <div className="review-label">{t('creation.review.identity')}</div>
                <div className="review-identity-card">
                  <img
                    className="review-portrait"
                    src={portraitPath(portraitEra, clan, gender)}
                    alt={clan}
                    onError={e => {
                      const fallback = portraitPath(portraitEra, clan);
                      if (e.currentTarget.src !== fallback) {
                        e.currentTarget.src = fallback;
                      } else {
                        e.currentTarget.style.display = 'none';
                      }
                    }}
                  />
                  <div>
                    <strong style={{ fontFamily: 'var(--display)', color: 'var(--gold)', display: 'block' }}>{name}</strong>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                      {gender === 'male' ? t('male') : t('female')} · {clan}
                    </span>
                  </div>
                </div>
              </div>
              <div className="review-block">
                <div className="review-label">{t('creation.review.attributes')}</div>
                <div className="review-attrs">
                  {(Object.keys(attrs) as (keyof Attributes)[]).map(k => (
                    <div key={k} className="review-attr">
                      <div className="review-attr-val">{attrs[k]}</div>
                      <div className="review-attr-name">{tAttr(k).slice(0, 3)}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="review-block">
                <div className="review-label">{t('creation.review.derived')}</div>
                <div className="card">
                  <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem' }}>
                    <div>{t('creation.health')} <strong style={{ color: 'var(--gold)' }}>{deriveHealth(base)}</strong></div>
                    <div>{t('creation.willpower')} <strong style={{ color: 'var(--gold)' }}>{deriveWillpower(base)}</strong></div>
                    <div>{t('creation.humanity')} <strong style={{ color: 'var(--gold)' }}>7</strong></div>
                  </div>
                </div>
              </div>
              <div className="review-block">
                <div className="review-label">{t('creation.review.disciplines')}</div>
                <div className="card" style={{ fontSize: '0.9rem' }}>
                  {discPowers.length > 0
                    ? discPowers.join(', ')
                    : <span style={{ color: 'var(--text-dim)' }}>{t('creation.noneSelected')}</span>
                  }
                </div>
              </div>
              <div className="review-block">
                <div className="review-label">{t('creation.review.loadout')}</div>
                <div className="card" style={{ fontSize: '0.9rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {selectedWeapons.map(id => {
                    const item = ITEM_CATALOG[id];
                    return item ? (
                      <span key={id}>{item.icon} {item.name}</span>
                    ) : null;
                  })}
                  {selectedWeapons.length === 0 && (
                    <span style={{ color: 'var(--text-dim)' }}>{t('creation.noneSelected')}</span>
                  )}
                </div>
              </div>
            </>
          );
        })()}
      </div>

      <div className="creation-footer">
        <button className="btn btn-ghost" onClick={stepIndex === 0 ? onBack : () => setStep(STEPS[stepIndex - 1])}>
          {t('back')}
        </button>
        {step !== 'review' ? (
          <button className="btn btn-primary" onClick={advance} disabled={!canAdvance()}>
            {t('next')}
          </button>
        ) : (
          <button className="btn btn-primary" onClick={finish}>
            {t('creation.chooseChronicle')}
          </button>
        )}
      </div>
    </div>
  );
}
