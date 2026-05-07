import { useState } from 'react';
import {
  CLANS,
  createCharacter,
  defaultAttributes,
  deriveHealth,
  deriveWillpower,
} from '../engine';
import type { Character, ClanName } from '../engine/character';
import type { Attributes } from '../engine/character';

interface Props {
  onComplete: (c: Character) => void;
  onBack: () => void;
}

type Step = 'identity' | 'attributes' | 'skills' | 'disciplines' | 'review';
const STEPS: Step[] = ['identity', 'attributes', 'skills', 'disciplines', 'review'];
const STEP_TITLES: Record<Step, string> = {
  identity: 'Identity',
  attributes: 'Attributes',
  skills: 'Skills',
  disciplines: 'Disciplines',
  review: 'Review',
};

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
const SKILL_BUDGET = 11;

const PRIORITY_LABELS = ['Primary (+5)', 'Secondary (+4)', 'Tertiary (+3)'];

// ── Name Generator ─────────────────────────────────────────────────────────

const CLAN_NAMES: Record<ClanName, string[]> = {
  Ventrue:  ['Marcus', 'Lucius', 'Helena', 'Victoria', 'Maximilian', 'Cornelia', 'Octavia', 'Claudius', 'Valeria', 'Augustus', 'Livia', 'Tiberius', 'Domitia', 'Hadrian'],
  Toreador: ['Séraphine', 'Adrien', 'Céleste', 'Lorenzo', 'Isabeau', 'Rémi', 'Valentina', 'Florian', 'Aurore', 'Matteo', 'Inès', 'Olivier', 'Camille', 'Luca'],
  Malkavian:['Ezekiel', 'Harriet', 'Cornelius', 'Mildred', 'Jasper', 'Prudence', 'Obadiah', 'Lavinia', 'Algernon', 'Eustace', 'Millicent', 'Bartholomew', 'Eugenia', 'Thaddeus'],
  Nosferatu:['Sigrid', 'Björn', 'Anastasia', 'Leif', 'Zosima', 'Gudrun', 'Konstantinos', 'Ragnvald', 'Thyra', 'Håkon', 'Basileia', 'Olaf', 'Euphrosyne', 'Ivar'],
  Brujah:   ['Cormac', 'Áine', 'Dimitrios', 'Rhiannon', 'Stavros', 'Brigid', 'Leandro', 'Niamh', 'Oisín', 'Kallistrate', 'Brennus', 'Fionn', 'Zephyrine', 'Conall'],
  Tremere:  ['Albrecht', 'Hildegard', 'Gottfried', 'Mathilde', 'Konrad', 'Sigismund', 'Adalberta', 'Wolfram', 'Irmgard', 'Burkhard', 'Mechthild', 'Dietrich', 'Kunigunde', 'Hartmann'],
  Gangrel:  ['Ulf', 'Saoirse', 'Thorvald', 'Morwenna', 'Ragnar', 'Fionnuala', 'Gunnar', 'Aoife', 'Skadi', 'Eamon', 'Astrid', 'Conchobar', 'Freydís', 'Donnchad'],
  Lasombra: ['Rodrigo', 'Constanza', 'Iago', 'Beatriz', 'Álvaro', 'Soledad', 'Ramiro', 'Esperanza', 'Ferrante', 'Vittoria', 'Ignacio', 'Catalina', 'Baldassare', 'Lucrezia'],
};

function generateName(clan: ClanName): string {
  const pool = CLAN_NAMES[clan];
  return pool[Math.floor(Math.random() * pool.length)];
}

// ── Template Characters ────────────────────────────────────────────────────

interface TemplateChar {
  name: string;
  clan: ClanName;
  gender: 'male' | 'female';
  concept: string;
  attrs: Attributes;
  priorities: Partial<Record<AttrCategory, number>>;
  skills: Record<string, number>;
  discPowers: string[];
}

const TEMPLATES: TemplateChar[] = [
  {
    name: 'Viktor Casimir',
    clan: 'Ventrue',
    gender: 'male',
    concept: 'Fallen Industrialist',
    // Social primary (+5): Cha+2 Man+3 | Mental secondary (+4): Int+2 Wit+1 Res+1 | Physical tertiary (+3): Str+1 Dex+1 Sta+1
    attrs: { Strength:2, Dexterity:2, Stamina:2, Charisma:3, Manipulation:4, Composure:2, Intelligence:3, Wits:2, Resolve:2 },
    priorities: { Social: 0, Mental: 1, Physical: 2 },
    skills: { Finance:3, Politics:2, Persuasion:2, Etiquette:2, Subterfuge:2 },
    discPowers: ['Dominate', 'Presence', 'Fortitude'],
  },
  {
    name: 'Séraphine Moreau',
    clan: 'Toreador',
    gender: 'female',
    concept: 'Forgotten Muse',
    // Social primary (+5): Cha+3 Man+1 Com+1 | Physical secondary (+4): Str+1 Dex+2 Sta+1 | Mental tertiary (+3): Int+1 Wit+1 Res+1
    attrs: { Strength:2, Dexterity:3, Stamina:2, Charisma:4, Manipulation:2, Composure:2, Intelligence:2, Wits:2, Resolve:2 },
    priorities: { Social: 0, Physical: 1, Mental: 2 },
    skills: { Performance:3, Persuasion:2, Insight:2, Awareness:2, Etiquette:2 },
    discPowers: ['Auspex', 'Presence', 'Celerity'],
  },
  {
    name: 'Brother Aldric',
    clan: 'Malkavian',
    gender: 'male',
    concept: 'Penitent Prophet',
    // Mental primary (+5): Int+2 Wit+2 Res+1 | Social secondary (+4): Cha+1 Man+2 Com+1 | Physical tertiary (+3): Str+1 Dex+1 Sta+1
    attrs: { Strength:2, Dexterity:2, Stamina:2, Charisma:2, Manipulation:3, Composure:2, Intelligence:3, Wits:3, Resolve:2 },
    priorities: { Mental: 0, Social: 1, Physical: 2 },
    skills: { Occult:3, Academics:2, Awareness:2, Intimidation:2, Insight:2 },
    discPowers: ['Auspex', 'Dominate', 'Obfuscate'],
  },
  {
    name: 'Elara the Grey',
    clan: 'Nosferatu',
    gender: 'female',
    concept: 'Spymaster Without a Court',
    // Mental primary (+5): Int+3 Wit+1 Res+1 | Physical secondary (+4): Str+1 Dex+2 Sta+1 | Social tertiary (+3): Man+2 Com+1
    attrs: { Strength:2, Dexterity:3, Stamina:2, Charisma:1, Manipulation:3, Composure:2, Intelligence:4, Wits:2, Resolve:2 },
    priorities: { Mental: 0, Physical: 1, Social: 2 },
    skills: { Stealth:3, Larceny:2, Subterfuge:3, Investigation:2, Awareness:1 },
    discPowers: ['Obfuscate', 'Animalism', 'Potence'],
  },
];

// ── Component ──────────────────────────────────────────────────────────────

export function CharacterCreation({ onComplete, onBack }: Props) {
  const [step, setStep] = useState<Step>('identity');
  const [name, setName] = useState('');
  const [clan, setClan] = useState<ClanName>('Ventrue');
  const [gender, setGender] = useState<'male' | 'female'>('male');

  const [attrs, setAttrs] = useState<Attributes>(defaultAttributes());
  const [priorities, setPriorities] = useState<Partial<Record<AttrCategory, number>>>({});

  const [skills, setSkills] = useState<Record<string, number>>({});
  const [skillTab, setSkillTab] = useState<SkillCat>('Physical');

  const [discPowers, setDiscPowers] = useState<string[]>([]);

  const stepIndex = STEPS.indexOf(step);

  const clanData = CLANS[clan];
  const clanDiscs = clanData.disciplines;

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

  const skillSpent = Object.values(skills).reduce((s, v) => s + v, 0);
  const skillRemaining = SKILL_BUDGET - skillSpent;

  function setAttr(key: keyof Attributes, delta: number) {
    const cat = (Object.entries(ATTR_CATS) as [AttrCategory, (keyof Attributes)[]][]).find(([, ks]) => ks.includes(key))?.[0];
    if (!cat) return;
    const next = attrs[key] + delta;
    if (next < 1 || next > 5) return;
    if (delta > 0 && attrRemaining(cat) <= 0) return;
    setAttrs(prev => ({ ...prev, [key]: next }));
  }

  function setSkill(key: string, delta: number) {
    const cur = skills[key] ?? 0;
    const next = cur + delta;
    if (next < 0 || next > 5) return;
    if (delta > 0 && skillRemaining <= 0) return;
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

  function applyTemplate(t: TemplateChar) {
    setName(t.name);
    setClan(t.clan);
    setGender(t.gender);
    setAttrs(t.attrs);
    setPriorities(t.priorities);
    setSkills(t.skills);
    setDiscPowers(t.discPowers);
    setStep('review');
  }

  function canAdvance(): boolean {
    if (step === 'identity') return name.trim().length > 0;
    if (step === 'attributes') return Object.keys(priorities).length === 3;
    if (step === 'skills') return true;
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

  return (
    <div className="creation-screen">
      <div className="creation-header">
        <div className="creation-step-label">Step {stepIndex + 1} of {STEPS.length}</div>
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
            {/* Template Characters */}
            <div className="field">
              <label>Quick Start</label>
              <div className="template-row">
                {TEMPLATES.map(t => (
                  <div
                    key={t.name}
                    className="template-card"
                    onClick={() => applyTemplate(t)}
                  >
                    <div className="template-clan">{t.clan}</div>
                    <div className="template-name">{t.name}</div>
                    <div className="template-concept">{t.concept}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Name + Generator */}
            <div className="field">
              <label>Character Name</label>
              <div className="name-field-row">
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter your name"
                  autoFocus
                />
                <button
                  className="btn btn-sm btn-ghost name-gen-btn"
                  type="button"
                  onClick={() => setName(generateName(clan))}
                >
                  Generate
                </button>
              </div>
            </div>

            <div className="field">
              <label>Gender</label>
              <select value={gender} onChange={e => setGender(e.target.value as 'male' | 'female')}>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div className="field">
              <label>Clan</label>
            </div>
            <div className="clan-grid">
              {(Object.keys(CLANS) as ClanName[]).map(c => (
                <div
                  key={c}
                  className={`clan-card ${clan === c ? 'selected' : ''}`}
                  onClick={() => setClan(c)}
                >
                  <div className="clan-card-name">{c}</div>
                  <div className="clan-card-bane">{CLANS[c].bane.slice(0, 60)}…</div>
                </div>
              ))}
            </div>
            {clan && (
              <div className="card" style={{ marginTop: '0.5rem' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontStyle: 'italic', marginBottom: '0.5rem' }}>
                  {CLANS[clan].description}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  <strong style={{ color: 'var(--gold)', fontFamily: 'var(--display)' }}>Disciplines: </strong>
                  {CLANS[clan].disciplines.join(', ')}
                </div>
              </div>
            )}
          </>
        )}

        {step === 'attributes' && (
          <>
            <div className="panel" style={{ marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              Assign priority order to each category. Primary gets +5 points, Secondary +4, Tertiary +3.
              All attributes start at 1.
            </div>
            {(Object.keys(ATTR_CATS) as AttrCategory[]).map(cat => (
              <div key={cat} className="attr-section">
                <div className="attr-section-title">
                  <span>{cat}</span>
                  <span style={{ color: 'var(--text-dim)' }}>
                    {attrRemaining(cat) >= 0 ? `${attrRemaining(cat)} pts left` : 'over budget!'}
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
                    <div className="attr-name">{attr}</div>
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
            <div className="budget-bar">
              Points remaining: <span>{skillRemaining}</span> / {SKILL_BUDGET}
            </div>
            <div className="skill-tabs">
              {(['Physical', 'Social', 'Mental'] as SkillCat[]).map(cat => (
                <button
                  key={cat}
                  className={`skill-tab ${skillTab === cat ? 'active' : ''}`}
                  onClick={() => setSkillTab(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
            {SKILL_CATS[skillTab].map(sk => (
              <div key={sk} className="attr-row">
                <div className="attr-name">{sk}</div>
                <div className="attr-controls">
                  <button
                    className="stepper-btn"
                    onClick={() => setSkill(sk, -1)}
                    disabled={(skills[sk] ?? 0) <= 0}
                  >−</button>
                  <div className="attr-value">{skills[sk] ?? 0}</div>
                  <button
                    className="stepper-btn"
                    onClick={() => setSkill(sk, 1)}
                    disabled={(skills[sk] ?? 0) >= 5 || skillRemaining <= 0}
                  >+</button>
                </div>
              </div>
            ))}
          </>
        )}

        {step === 'disciplines' && (
          <div className="disc-section">
            <div className="disc-title">{clan} Disciplines</div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>
              Select up to 3 powers (1 dot each) from your clan disciplines.
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
                    {sel ? 'Dot 1' : '—'}
                  </div>
                </div>
              );
            })}
            <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              Selected: {discPowers.length} / 3
            </div>
          </div>
        )}

        {step === 'review' && (() => {
          const base = createCharacter({ name: name.trim(), clan, gender, attributes: attrs, skills, disciplines: {} });
          return (
            <>
              <div className="review-block">
                <div className="review-label">Identity</div>
                <div className="card">
                  <strong style={{ fontFamily: 'var(--display)', color: 'var(--gold)' }}>{name}</strong>
                  <span style={{ color: 'var(--text-dim)', marginLeft: '0.5rem', fontSize: '0.85rem' }}>
                    {gender === 'male' ? 'M' : 'F'} · {clan}
                  </span>
                </div>
              </div>
              <div className="review-block">
                <div className="review-label">Attributes</div>
                <div className="review-attrs">
                  {(Object.keys(attrs) as (keyof Attributes)[]).map(k => (
                    <div key={k} className="review-attr">
                      <div className="review-attr-val">{attrs[k]}</div>
                      <div className="review-attr-name">{k.slice(0, 3)}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="review-block">
                <div className="review-label">Derived</div>
                <div className="card">
                  <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem' }}>
                    <div>Health <strong style={{ color: 'var(--gold)' }}>{deriveHealth(base)}</strong></div>
                    <div>Willpower <strong style={{ color: 'var(--gold)' }}>{deriveWillpower(base)}</strong></div>
                    <div>Humanity <strong style={{ color: 'var(--gold)' }}>7</strong></div>
                  </div>
                </div>
              </div>
              <div className="review-block">
                <div className="review-label">Disciplines</div>
                <div className="card" style={{ fontSize: '0.9rem' }}>
                  {discPowers.length > 0
                    ? discPowers.join(', ')
                    : <span style={{ color: 'var(--text-dim)' }}>None selected</span>
                  }
                </div>
              </div>
            </>
          );
        })()}
      </div>

      <div className="creation-footer">
        <button className="btn btn-ghost" onClick={stepIndex === 0 ? onBack : () => setStep(STEPS[stepIndex - 1])}>
          ← Back
        </button>
        {step !== 'review' ? (
          <button className="btn btn-primary" onClick={advance} disabled={!canAdvance()}>
            Next →
          </button>
        ) : (
          <button className="btn btn-primary" onClick={finish}>
            Begin Chronicle
          </button>
        )}
      </div>
    </div>
  );
}
