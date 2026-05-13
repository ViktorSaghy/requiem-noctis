import { useState } from 'react';
import { createCharacter, deriveHealth, deriveWillpower, portraitPath } from '../engine';
import type { Character, ClanName } from '../engine/character';
import type { Attributes } from '../engine/character';
import { ITEM_CATALOG, FIXED_STARTER_ITEM_IDS } from '../content/items';
import './TemplatePickScreen.css';

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
  skills: Record<string, number>;
  discPowers: string[];
}

export const TEMPLATES: TemplateChar[] = [
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
    skills: { Survival:3, Athletics:3, Stealth:3, Brawl:2, Melee:2, Awareness:3, AnimalKen:2, Investigation:1, Intimidation:2 },
    discPowers: ['Animalism', 'Fortitude', 'Protean'],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function dots(val: number, max = 5) {
  return '●'.repeat(Math.min(val, max)) + '○'.repeat(Math.max(0, max - val));
}

function topN(obj: Record<string, number>, n: number): [string, number][] {
  return Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, n);
}

// ── Character sheet (inline) ──────────────────────────────────────────────────

function CharSheet({ tmpl }: { tmpl: TemplateChar }) {
  const topAttrs = topN(tmpl.attrs as unknown as Record<string, number>, 3);
  const topSkills = topN(tmpl.skills, 4);

  return (
    <>
      <div className="tps-sheet-section">
        <div className="tps-section-label">Disciplines</div>
        <div className="tps-disc-pills">
          {tmpl.discPowers.map(p => (
            <span key={p} className="tps-disc-pill">{p} ●</span>
          ))}
        </div>
      </div>

      <div className="tps-sheet-section">
        <div className="tps-section-label">Top Attributes</div>
        <div className="tps-stat-grid">
          {topAttrs.map(([attr, val]) => (
            <div key={attr} className="tps-stat">
              <span className="tps-stat-name">{attr}</span>
              <span className="tps-stat-dots">{dots(val)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="tps-sheet-section">
        <div className="tps-section-label">Key Skills</div>
        <div className="tps-stat-grid">
          {topSkills.map(([skill, val]) => (
            <div key={skill} className="tps-stat">
              <span className="tps-stat-name">{skill}</span>
              <span className="tps-stat-dots">{dots(val)}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  onSelect: (char: Character, starterItems: string[]) => void;
  onCustom: () => void;
  onBack: () => void;
}

// ── Main screen ───────────────────────────────────────────────────────────────

export function TemplatePickScreen({ onSelect, onCustom, onBack }: Props) {
  const [selected, setSelected] = useState<TemplateChar>(TEMPLATES[0]);

  function playAs(tmpl: TemplateChar) {
    const discObj: Record<string, number> = {};
    for (const p of tmpl.discPowers) discObj[p] = 1;
    const base = createCharacter({
      name: tmpl.name,
      clan: tmpl.clan,
      gender: tmpl.gender,
      attributes: tmpl.attrs,
      skills: tmpl.skills,
      disciplines: discObj,
    });
    const char: Character = {
      ...base,
      health: deriveHealth(base),
      willpower: deriveWillpower(base),
    };
    onSelect(char, [...tmpl.starterWeapons, ...FIXED_STARTER_ITEM_IDS, ...(tmpl.extraItems ?? [])]);
  }

  return (
    <div className="tps-screen">
      <div className="tps-header">
        <h1 className="tps-title">Choose Your Vampire</h1>
        <p className="tps-sub">Select a ready-made character or forge your own.</p>
      </div>

      <div className="tps-body">
        {/* ── Card grid ── */}
        <div className="tps-grid">
          {TEMPLATES.map(tmpl => (
            <button
              key={tmpl.name}
              className={`tps-card ${selected.name === tmpl.name ? 'tps-card--selected' : ''}`}
              onClick={() => setSelected(tmpl)}
              aria-pressed={selected.name === tmpl.name}
            >
              <img
                className="tps-card-portrait"
                src={portraitPath('modern', tmpl.clan, tmpl.gender)}
                alt={tmpl.name}
                onError={e => {
                  const fallback = portraitPath('modern', tmpl.clan);
                  if (!e.currentTarget.src.endsWith(fallback)) {
                    e.currentTarget.src = fallback;
                  } else {
                    e.currentTarget.style.display = 'none';
                  }
                }}
              />
              <div className="tps-card-meta">
                <div className="tps-card-clan">{tmpl.clan}</div>
                <div className="tps-card-name">{tmpl.name}</div>
              </div>
            </button>
          ))}
        </div>

        {/* ── Detail panel ── */}
        <div className="tps-detail">
          {/* Scrollable content */}
          <div className="tps-detail-scroll">
            {/* Hero */}
            <div className="tps-hero">
              <img
                className="tps-hero-portrait"
                src={portraitPath('modern', selected.clan, selected.gender)}
                alt=""
                onError={e => { e.currentTarget.style.display = 'none'; }}
              />
              <div className="tps-hero-identity">
                <div className="tps-detail-clan">{selected.clan}</div>
                <div className="tps-detail-name">{selected.name}</div>
                <div className="tps-detail-concept">{selected.concept}</div>
              </div>
            </div>

            {/* Background */}
            <p className="tps-background">{selected.background}</p>

            {/* Play hint */}
            <div className="tps-hint">
              <span className="tps-hint-label">How to play</span>
              {selected.playHint}
            </div>

            {/* Starting loadout */}
            <div>
              <div className="tps-section-label">Starting Loadout</div>
              <div className="tps-chips">
                {selected.starterWeapons.map(id => {
                  const item = ITEM_CATALOG[id];
                  return item ? (
                    <span key={id} className="tps-chip">{item.icon} {item.name}</span>
                  ) : null;
                })}
                {(selected.extraItems ?? []).map(id => {
                  const item = ITEM_CATALOG[id];
                  return item ? (
                    <span key={id} className="tps-chip tps-chip--item">{item.icon} {item.name}</span>
                  ) : null;
                })}
              </div>
            </div>

            {/* Character sheet — always visible, no accordion */}
            <CharSheet key={selected.name} tmpl={selected} />
          </div>

          {/* Pinned play button */}
          <div className="tps-detail-pinned">
            <button
              className="btn btn-primary tps-play-btn"
              onClick={() => playAs(selected)}
            >
              Play as {selected.name} →
            </button>
          </div>
        </div>
      </div>

      {/* Footer — secondary actions */}
      <div className="tps-footer">
        <button className="btn btn-ghost btn-sm" onClick={onBack}>← Back</button>
        <button className="btn btn-ghost tps-custom-btn" onClick={onCustom}>
          Create Custom Character
        </button>
      </div>
    </div>
  );
}
