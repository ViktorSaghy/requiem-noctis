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

interface Props {
  onComplete: (c: Character) => void;
  onBack: () => void;
}

type Step = 'identity' | 'attributes' | 'skills' | 'disciplines' | 'review';
const STEPS: Step[] = ['identity', 'attributes', 'skills', 'disciplines', 'review'];

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
    attrs: { Strength:4, Dexterity:2, Stamina:2, Charisma:2, Manipulation:2, Composure:3, Intelligence:2, Wits:2, Resolve:2 },
    priorities: { Physical: 0, Social: 1, Mental: 2 },
    skillPriorities: { Physical: 0, Social: 1, Mental: 2 },
    skills: { Brawl:3, Athletics:3, Survival:2, Intimidation:3, Streetwise:2, Leadership:1, Awareness:2, Investigation:2 },
    discPowers: ['Celerity', 'Potence', 'Presence'],
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
    setStep('review');
  }

  function canAdvance(): boolean {
    if (step === 'identity') return name.trim().length > 0;
    if (step === 'attributes') return Object.keys(priorities).length === 3;
    if (step === 'skills') return Object.keys(skillPriorities).length === 3;
    if (step === 'disciplines') return true;
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
    onComplete(char);
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
                    className="template-card"
                    onClick={() => applyTemplate(tmpl)}
                  >
                    <img
                      className="template-portrait"
                      src={portraitPath(portraitEra, tmpl.clan, tmpl.gender)}
                      alt=""
                      onError={e => { e.currentTarget.style.display = 'none'; }}
                    />
                    <div className="template-clan">{tmpl.clan}</div>
                    <div className="template-name">{tmpl.name}</div>
                    <div className="template-concept">{tmpl.concept}</div>
                  </div>
                ))}
              </div>
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
              return (
                <div
                  key={disc}
                  className={`disc-power ${sel ? 'selected' : ''}`}
                  onClick={() => toggleDisc(disc)}
                >
                  <div className={`disc-dot ${sel ? '' : 'empty'}`} />
                  <div className="disc-power-name">{disc}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    {sel ? t('creation.discDot') : '—'}
                  </div>
                </div>
              );
            })}
            <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              {t('creation.discSelected', { n: discPowers.length })}
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
