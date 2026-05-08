import { useEffect, useState } from 'react';
import type { GameState } from '../engine';
import { listSaves, CLANS, portraitPath } from '../engine';
import type { SaveSlot, JournalEntry } from '../engine';
import { Audio } from '../audio';
import { DiceOverlay } from './DiceOverlay';
import { CombatScreen } from './CombatScreen';
import type { PlayerCombatState } from '../engine/combat';

type GameTab = 'story' | 'character' | 'journal' | 'menu';

interface Props {
  game: GameState;
  onGoTo: (id: string) => void;
  onBeginRoll: () => void;
  onRevealRoll: () => void;
  onConfirmRoll: () => void;
  onEndingReady: (endingId: string) => void;
  onSaveSlot: (slot: string) => Promise<void>;
  onLoadSlot: (slot: string) => Promise<boolean>;
  onSettings: () => void;
  onBackToTitle: () => void;
  onApplyPostCombatDamage: (player: PlayerCombatState) => void;
  devMode?: boolean;
}

function HungerPips({ hunger }: { hunger: number }) {
  return (
    <div className="hunger-pips">
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={i}
          className={`blood-pip ${i < hunger ? (hunger >= 5 ? 'bestial' : 'full') : ''}`}
        />
      ))}
    </div>
  );
}

function HealthTrack({ superficial, aggravated, max }: { superficial: number; aggravated: number; max: number }) {
  return (
    <div className="track-group">
      <span className="track-label">HP</span>
      {Array.from({ length: max }, (_, i) => {
        const isAgg = i >= max - aggravated;
        const isSup = !isAgg && i < superficial;
        return <div key={i} className={`track-box ${isAgg ? 'agg-dmg' : isSup ? 'sup-dmg' : ''}`} />;
      })}
    </div>
  );
}

function DotTrack({ value, max, label }: { value: number; max: number; label: string }) {
  return (
    <div className="dot-track">
      <span className="dot-track-label">{label}</span>
      <div className="dot-track-dots">
        {Array.from({ length: max }, (_, i) => (
          <div key={i} className={`dot-pip ${i < value ? 'filled' : ''}`} />
        ))}
      </div>
    </div>
  );
}

function StoryPane({
  game, onGoTo, onBeginRoll, devMode,
}: {
  game: GameState;
  onGoTo: (id: string) => void;
  onBeginRoll: () => void;
  devMode?: boolean;
}) {
  const { character, chronicle, sceneId, diceState } = game;
  const scene = chronicle.scenes[sceneId];
  if (!scene) return null;

  function handleChoice(nextId: string) {
    Audio.buttonTap();
    onGoTo(nextId);
  }

  function handleNext() {
    Audio.buttonTap();
    if (scene.next) onGoTo(scene.next);
  }

  return (
    <div className="story-pane">
      <div className="story-scroll">
        {scene.image && (
          <div key={game.sceneId} className="scene-illustration-wrap">
            <img src={scene.image} alt="" className="scene-illustration" />
          </div>
        )}
        {scene.title && (
          <div className="scene-title-bar">Act {scene.act} — {scene.title}</div>
        )}
        <div className="narrative-area">
          <p className="narrative-text">{scene.narrative}</p>
        </div>
        {devMode && (
          <div className="dev-panel">
            <div className="dev-row"><span>Scene</span><code>{sceneId}</code></div>
            {Object.keys(game.flags).length > 0 && (
              <div className="dev-row"><span>Flags</span><code>{Object.keys(game.flags).join(', ')}</code></div>
            )}
          </div>
        )}
      </div>
      <div className="interaction-area">
        {scene.choices?.map((choice, i) => (
          <button
            key={i}
            className="choice-btn"
            onClick={() => handleChoice(choice.next)}
          >
            {choice.icon && <span className="choice-icon">{choice.icon}</span>}
            {choice.text}
          </button>
        ))}

        {scene.check && diceState.phase === 'idle' && (
          <div className="check-card">
            <div className="check-card-title">Dice Check</div>
            <div className="check-card-desc">{scene.check.label}</div>
            <div className="check-pool-row">
              Pool: <strong>{scene.check.pool(character)}</strong>
              &nbsp;· Difficulty: <strong>{scene.check.difficulty}</strong>
              &nbsp;· Hunger: <strong>{scene.check.hunger(character)}</strong>
            </div>
            <button className="btn btn-primary btn-full" onClick={onBeginRoll}>
              Roll the Dice
            </button>
          </div>
        )}

        {scene.next && !scene.choices && !scene.check && (
          <button className="btn btn-primary btn-full" onClick={handleNext}>
            Continue →
          </button>
        )}

        {scene.resolution && (
          <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem', textAlign: 'center' }}>
            Resolving…
          </div>
        )}
      </div>
    </div>
  );
}

const SKILL_DISPLAY_CATS: Record<string, string[]> = {
  Physical: ['Athletics', 'Brawl', 'Craft', 'Drive', 'Firearms', 'Larceny', 'Melee', 'Stealth', 'Survival'],
  Social:   ['AnimalKen', 'Etiquette', 'Insight', 'Intimidation', 'Leadership', 'Performance', 'Persuasion', 'Streetwise', 'Subterfuge'],
  Mental:   ['Academics', 'Awareness', 'Finance', 'Investigation', 'Medicine', 'Occult', 'Politics', 'Science', 'Technology'],
};

function CharacterPane({ game }: { game: GameState }) {
  const { character } = game;
  const discs = Object.entries(character.disciplines).filter(([, v]) => v > 0);
  const clanData = CLANS[character.clan];
  const currentHp = character.health - character.superficialDmg - character.aggravatedDmg;

  const nonZeroSkills = Object.entries(character.skills ?? {}).filter(([, v]) => (v ?? 0) > 0) as [string, number][];

  return (
    <div className="char-pane">
      <div className="char-identity">
        <img
          className="char-portrait"
          src={portraitPath(game.chronicle.era, character.clan)}
          alt={character.clan}
          onError={e => { e.currentTarget.style.display = 'none'; }}
        />
        <div className="char-identity-text">
          <div className="char-pane-name">{character.name}</div>
          <div className="char-pane-sub">
            {character.clan} · {character.gender === 'male' ? 'Male' : 'Female'} · Gen. {character.generation}
          </div>
        </div>
      </div>

      <div className="char-pane-section">
        <div className="char-pane-label">Status</div>
        <div className="char-status-row">
          <HungerPips hunger={character.hunger} />
          <HealthTrack superficial={character.superficialDmg} aggravated={character.aggravatedDmg} max={character.health} />
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginLeft: '0.25rem' }}>{Math.max(0, currentHp)}/{character.health}</span>
        </div>
        <div className="char-vitals">
          <DotTrack value={character.willpower} max={10} label="Willpower" />
          <DotTrack value={character.humanity} max={10} label="Humanity" />
        </div>
      </div>

      <div className="char-pane-section">
        <div className="char-pane-label">Attributes</div>
        <div className="char-attr-grid">
          {Object.entries(character.attributes).map(([k, v]) => (
            <div key={k} className="char-attr-cell">
              <div className="char-attr-val">{v}</div>
              <div className="char-attr-name">{k.slice(0, 3)}</div>
            </div>
          ))}
        </div>
      </div>

      {nonZeroSkills.length > 0 && (
        <div className="char-pane-section">
          <div className="char-pane-label">Skills</div>
          <div className="char-skills-list">
            {(Object.keys(SKILL_DISPLAY_CATS) as string[]).map(cat => {
              const catSkills = nonZeroSkills.filter(([k]) => SKILL_DISPLAY_CATS[cat].includes(k));
              if (catSkills.length === 0) return null;
              return (
                <div key={cat} className="char-skills-cat">
                  <div className="char-skills-cat-label">{cat}</div>
                  {catSkills.map(([k, v]) => (
                    <div key={k} className="char-skill-row">
                      <span className="char-skill-name">{k}</span>
                      <span className="char-skill-dots">{'●'.repeat(v)}{'○'.repeat(5 - v)}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {discs.length > 0 && (
        <div className="char-pane-section">
          <div className="char-pane-label">Disciplines</div>
          <div className="char-discs">
            {discs.map(([k, v]) => (
              <div key={k} className="char-disc-row">
                <span className="char-disc-name">{k}</span>
                <span className="char-disc-dots">
                  {'●'.repeat(v)}{'○'.repeat(5 - v)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {clanData && (
        <div className="char-pane-section">
          <div className="char-pane-label">Clan Bane</div>
          <div className="card" style={{ fontSize: '0.78rem', fontStyle: 'italic', color: 'var(--text-dim)' }}>
            {clanData.bane}
          </div>
        </div>
      )}
      {clanData && (
        <div className="char-pane-section">
          <div className="char-pane-label">Compulsion</div>
          <div className="card" style={{ fontSize: '0.78rem', fontStyle: 'italic', color: 'var(--text-dim)' }}>
            {clanData.compulsion}
          </div>
        </div>
      )}
    </div>
  );
}

function JournalPane({ journal }: { journal: JournalEntry[] }) {
  if (journal.length === 0) {
    return (
      <div className="journal-pane">
        <div className="journal-empty">No entries yet. Explore to begin your chronicle.</div>
      </div>
    );
  }
  return (
    <div className="journal-pane">
      {journal.map((e, i) => (
        <div key={i} className="journal-entry">
          <div className="journal-entry-text">{e.entry}</div>
          <div className="journal-entry-time">
            {new Date(e.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      ))}
    </div>
  );
}

function MenuPane({
  onSaveSlot, onLoadSlot, onSettings, onBackToTitle,
}: {
  onSaveSlot: (slot: string) => Promise<void>;
  onLoadSlot: (slot: string) => Promise<boolean>;
  onSettings: () => void;
  onBackToTitle: () => void;
}) {
  const [saves, setSaves] = useState<Record<string, SaveSlot>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    listSaves().then(setSaves);
  }, []);

  const SLOTS = [
    { id: 'slot1', label: 'Slot I' },
    { id: 'slot2', label: 'Slot II' },
    { id: 'slot3', label: 'Slot III' },
  ];

  async function handleSave(slot: string) {
    setBusy(true);
    await onSaveSlot(slot);
    const refreshed = await listSaves();
    setSaves(refreshed);
    setBusy(false);
  }

  async function handleLoad(slot: string) {
    setBusy(true);
    await onLoadSlot(slot);
    setBusy(false);
  }

  return (
    <div className="menu-pane">
      <div className="menu-section">
        <div className="menu-section-label">Save / Load</div>
        {SLOTS.map(({ id, label }) => {
          const save = saves[id];
          return (
            <div key={id} className="save-row">
              <div className="save-info">
                <div className="save-slot-label">{label}</div>
                {save ? (
                  <div className="save-details">
                    <span>{save.label}</span>
                    <span className="save-date">{new Date(save.savedAt).toLocaleDateString()}</span>
                  </div>
                ) : (
                  <div className="save-details save-empty">Empty</div>
                )}
              </div>
              <div className="save-actions">
                <button
                  className="btn btn-sm btn-gold"
                  disabled={busy}
                  onClick={() => handleSave(id)}
                >
                  Save
                </button>
                {save && (
                  <button
                    className="btn btn-sm"
                    disabled={busy}
                    onClick={() => handleLoad(id)}
                  >
                    Load
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="menu-section">
        <button className="btn btn-full" style={{ marginBottom: '0.5rem' }} onClick={onSettings}>
          Settings
        </button>
        <button className="btn btn-danger btn-full" onClick={onBackToTitle}>
          Back to Title
        </button>
      </div>
    </div>
  );
}

export function GameScreen({
  game, onGoTo, onBeginRoll, onRevealRoll, onConfirmRoll, onEndingReady,
  onSaveSlot, onLoadSlot, onSettings, onBackToTitle, onApplyPostCombatDamage, devMode,
}: Props) {
  const { character, chronicle, sceneId, diceState, endingId } = game;
  const scene = chronicle.scenes[sceneId];
  const [activeTab, setActiveTab] = useState<GameTab>('story');

  useEffect(() => {
    if (endingId) onEndingReady(endingId);
  }, [endingId, onEndingReady]);

  useEffect(() => {
    if (scene) Audio.sceneTransition();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneId]);

  if (!scene) return null;

  // Combat scenes bypass the tab layout
  if (scene.combat) {
    return (
      <div className="game-screen combat-mode">
        <CombatScreen
          scenario={scene.combat}
          character={character}
          onEnd={(nextSceneId, finalPlayer) => {
            onApplyPostCombatDamage(finalPlayer);
            onGoTo(nextSceneId);
          }}
        />
      </div>
    );
  }

  const ACT_BG: Record<number, string> = {
    1: '/backgrounds/ash-cafe.png',
    2: '/backgrounds/ash-cafe.png',
    3: '/backgrounds/ash-kessler.png',
    4: '/backgrounds/ash-cafe.png',
  };
  const bg = scene.image ?? ACT_BG[scene.act] ?? '/backgrounds/ash-cafe.png';
  const showDice = diceState.phase !== 'idle' && diceState.result !== null;

  const TABS: { id: GameTab; icon: string; label: string }[] = [
    { id: 'story',     icon: '◈', label: 'Story' },
    { id: 'character', icon: '☽', label: 'Char' },
    { id: 'journal',   icon: '≡', label: 'Log' },
    { id: 'menu',      icon: '⊞', label: 'Menu' },
  ];

  return (
    <div className="game-screen">
      {showDice && diceState.result && diceState.check && (
        <DiceOverlay
          result={diceState.result}
          phase={diceState.phase as 'rolling' | 'revealed'}
          difficulty={diceState.check.difficulty}
          label={diceState.check.label}
          clanCompulsion={diceState.result.messyCritical ? CLANS[character.clan]?.compulsion : undefined}
          onReveal={onRevealRoll}
          onConfirm={onConfirmRoll}
        />
      )}

      <div className="game-left">
        <div className="game-bg-wrap">
          <img key={bg} src={bg} alt="" className="game-bg" />
          <div className="game-bg-overlay" />
          <div className="hud">
            <div className="hud-name">{character.name} · {character.clan}</div>
            <HungerPips hunger={character.hunger} />
            <HealthTrack superficial={character.superficialDmg} aggravated={character.aggravatedDmg} max={character.health} />
          </div>
        </div>
      </div>

      <div className="game-right">
        <div className="game-tab-content">
          {activeTab === 'story' && (
            <StoryPane game={game} onGoTo={onGoTo} onBeginRoll={onBeginRoll} devMode={devMode} />
          )}
          {activeTab === 'character' && (
            <CharacterPane game={game} />
          )}
          {activeTab === 'journal' && (
            <JournalPane journal={game.journal} />
          )}
          {activeTab === 'menu' && (
            <MenuPane
              onSaveSlot={onSaveSlot}
              onLoadSlot={onLoadSlot}
              onSettings={onSettings}
              onBackToTitle={onBackToTitle}
            />
          )}
        </div>

        <div className="game-tab-bar">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`tab-btn ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              <span className="tab-btn-icon">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
