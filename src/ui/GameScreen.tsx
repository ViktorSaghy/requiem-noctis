import { useEffect, useState, useMemo, Fragment } from 'react';
import type { GameState } from '../engine';
import { listSaves, CLANS, portraitPath, getSceneImage, preloadImages } from '../engine';
import type { SaveSlot, JournalEntry } from '../engine';
import { Audio } from '../audio';
import { DiceOverlay } from './DiceOverlay';
import { useCombat } from './useCombat';
import {
  CombatStatusPanel,
  CombatActionsPanel,
  CombatLogPanel,
  HpTrack,
  HungerPips,
  WpDots,
} from './CombatScreen';
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

// ─────────────── CHARACTER PANE ───────────────

const SKILL_DISPLAY_CATS: Record<string, string[]> = {
  Physical: ['Athletics', 'Brawl', 'Craft', 'Drive', 'Firearms', 'Larceny', 'Melee', 'Stealth', 'Survival'],
  Social:   ['AnimalKen', 'Etiquette', 'Insight', 'Intimidation', 'Leadership', 'Performance', 'Persuasion', 'Streetwise', 'Subterfuge'],
  Mental:   ['Academics', 'Awareness', 'Finance', 'Investigation', 'Medicine', 'Occult', 'Politics', 'Science', 'Technology'],
};

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
          src={portraitPath(game.chronicle.era, character.clan, character.gender)}
          alt={character.clan}
          onError={e => {
            const fallback = portraitPath(game.chronicle.era, character.clan);
            if (e.currentTarget.src !== fallback) {
              e.currentTarget.src = fallback;
            } else {
              e.currentTarget.style.display = 'none';
            }
          }}
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
          <div className="track-group">
            <span className="track-label">HP</span>
            {Array.from({ length: character.health }, (_, i) => {
              const isAgg = i >= character.health - character.aggravatedDmg;
              const isSup = !isAgg && i < character.superficialDmg;
              return <div key={i} className={`track-box ${isAgg ? 'agg-dmg' : isSup ? 'sup-dmg' : ''}`} />;
            })}
          </div>
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
              <div className="char-attr-val">{'●'.repeat(v)}{'○'.repeat(5 - v)}</div>
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
                <Fragment key={cat}>
                  <div className="char-skills-cat-label">{cat}</div>
                  {catSkills.map(([k, v]) => (
                    <div key={k} className="char-skill-row">
                      <span className="char-skill-name">{k}</span>
                      <span className="char-skill-dots">{'●'.repeat(v)}{'○'.repeat(5 - v)}</span>
                    </div>
                  ))}
                </Fragment>
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
                <span className="char-disc-dots">{'●'.repeat(v)}{'○'.repeat(5 - v)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {clanData && (
        <div className="char-pane-section">
          <div className="char-pane-label">Clan Bane</div>
          <div className="card" style={{ fontSize: '0.78rem', fontStyle: 'italic', color: 'var(--text-dim)' }}>{clanData.bane}</div>
        </div>
      )}
      {clanData && (
        <div className="char-pane-section">
          <div className="char-pane-label">Compulsion</div>
          <div className="card" style={{ fontSize: '0.78rem', fontStyle: 'italic', color: 'var(--text-dim)' }}>{clanData.compulsion}</div>
        </div>
      )}
    </div>
  );
}

function JournalPane({ journal }: { journal: JournalEntry[] }) {
  if (journal.length === 0) {
    return <div className="journal-pane"><div className="journal-empty">No entries yet. Explore to begin your chronicle.</div></div>;
  }
  return (
    <div className="journal-pane">
      {journal.map((e, i) => (
        <div key={i} className="journal-entry">
          <div className="journal-entry-text">{e.entry}</div>
          {e.summary && <div className="journal-entry-summary">{e.summary}</div>}
          <div className="journal-entry-time">{new Date(e.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
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

  useEffect(() => { listSaves().then(setSaves); }, []);

  const SLOTS = [
    { id: 'slot1', label: 'Slot I' },
    { id: 'slot2', label: 'Slot II' },
    { id: 'slot3', label: 'Slot III' },
  ];

  async function handleSave(slot: string) {
    setBusy(true);
    await onSaveSlot(slot);
    setSaves(await listSaves());
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
                <button className="btn btn-sm btn-gold" disabled={busy} onClick={() => handleSave(id)}>Save</button>
                {save && <button className="btn btn-sm" disabled={busy} onClick={() => handleLoad(id)}>Load</button>}
              </div>
            </div>
          );
        })}
      </div>
      <div className="menu-section">
        <button className="btn btn-full" style={{ marginBottom: '0.5rem' }} onClick={onSettings}>Settings</button>
        <button className="btn btn-danger btn-full" onClick={onBackToTitle}>Back to Title</button>
      </div>
    </div>
  );
}

// ─────────────── STORY ACTIONS ───────────────

function StoryActionsPanel({ scene, character, diceState, onGoTo, onBeginRoll }: {
  scene: NonNullable<GameState['chronicle']['scenes'][string]>;
  character: GameState['character'];
  diceState: GameState['diceState'];
  onGoTo: (id: string) => void;
  onBeginRoll: () => void;
}) {
  function handleChoice(nextId: string) {
    void Audio.buttonTap();
    onGoTo(nextId);
  }
  function handleNext() {
    void Audio.buttonTap();
    if (scene.next) onGoTo(scene.next);
  }

  return (
    <div className="gs-actions-inner">
      {scene.choices && scene.choices.length > 0 && (
        <div className="choice-list">
          {scene.choices.map((choice, i) => (
            <button key={i} className="choice-btn" onClick={() => handleChoice(choice.next)}>
              {choice.icon && <span className="choice-icon">{choice.icon}</span>}
              {choice.text}
            </button>
          ))}
        </div>
      )}
      {scene.check && diceState.phase === 'idle' && (
        <div className="check-card">
          <div className="check-header">
            <span className="check-icon">🎲</span>
            <h3 className="check-title">Dice Check</h3>
          </div>
          <p className="check-description">{scene.check.label}</p>
          <div className="check-stats">
            <div className="check-stat">
              <div className="check-stat-label">Pool</div>
              <div className="check-stat-value">{scene.check.pool(character)}</div>
            </div>
            <div className="check-stat">
              <div className="check-stat-label">Difficulty</div>
              <div className="check-stat-value">{scene.check.difficulty}</div>
            </div>
          </div>
          <button className="roll-btn" onClick={onBeginRoll}>
            <span>🎲</span> Roll the Dice
          </button>
        </div>
      )}
      {scene.next && !scene.choices && !scene.check && (
        <button className="continue-btn" onClick={handleNext}>Continue</button>
      )}
      {scene.resolution && (
        <div style={{ color: 'var(--text-dim)', fontSize: 'var(--text-sm)', textAlign: 'center', padding: '1rem' }}>
          Resolving…
        </div>
      )}
    </div>
  );
}

// ─────────────── SCENE CARD (left column top for story mode) ───────────────

function SceneCard({ scene, character }: {
  scene: NonNullable<GameState['chronicle']['scenes'][string]>;
  character: GameState['character'];
}) {
  const currentHp = character.health - character.superficialDmg - character.aggravatedDmg;
  return (
    <div className="gs-scene-card">
      {scene.act && (
        <div className="gs-scene-act">Act {scene.act}</div>
      )}
      {scene.title && (
        <h2 className="gs-scene-title">{scene.title}</h2>
      )}
      <div className="gs-char-vitals">
        <div className="gs-char-name">{character.name} · {character.clan}</div>
        <div className="gs-vital-row">
          <span className="gs-vital-label">HP</span>
          <HpTrack superficial={character.superficialDmg} aggravated={character.aggravatedDmg} max={character.health} compact />
          <span className="gs-vital-val">{Math.max(0, currentHp)}/{character.health}</span>
        </div>
        <div className="gs-vital-row">
          <span className="gs-vital-label">WP</span>
          <WpDots current={character.willpower} max={character.willpower} />
          <span className="gs-vital-val">{character.willpower}</span>
        </div>
        <div className="gs-vital-row">
          <span className="gs-vital-label">Hunger</span>
          <HungerPips hunger={character.hunger} />
          <span className="gs-vital-val">{character.hunger}/5</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────── COMBAT WRAPPER (manages combat state for 3-col layout) ───────────────

function CombatLayout({ game, sceneId, onApplyPostCombatDamage, onGoTo, activeTab, onTabChange, onSaveSlot, onLoadSlot, onSettings, onBackToTitle, bg }: {
  game: GameState;
  sceneId: string;
  onApplyPostCombatDamage: (player: PlayerCombatState) => void;
  onGoTo: (id: string) => void;
  activeTab: GameTab;
  onTabChange: (tab: GameTab) => void;
  onSaveSlot: (slot: string) => Promise<void>;
  onLoadSlot: (slot: string) => Promise<boolean>;
  onSettings: () => void;
  onBackToTitle: () => void;
  bg: string;
}) {
  const { character } = game;
  const scene = game.chronicle.scenes[sceneId]!;
  const scenario = scene.combat!;

  const combat = useCombat(character, scenario, (nextSceneId, finalPlayer) => {
    onApplyPostCombatDamage(finalPlayer);
    onGoTo(nextSceneId);
  });

  useEffect(() => {
    Audio.setMood('combat');
    return () => { Audio.setMood('exploration'); };
  }, []);

  const TABS: { id: GameTab; label: string }[] = [
    { id: 'story', label: 'Combat Log' },
    { id: 'character', label: 'Sheet' },
    { id: 'journal', label: 'Journal' },
    { id: 'menu', label: 'Menu' },
  ];

  return (
    <>
      {/* LEFT: enemy/player status (top) + combat actions (bottom) */}
      <div className="gs-left" style={{ display: 'contents' }}>
        <div className="gs-scene-card-wrap">
          <CombatStatusPanel combat={combat} character={character} scenario={scenario} />
        </div>
        <div className="gs-actions">
          <CombatActionsPanel combat={combat} scenario={scenario} />
        </div>
      </div>

      {/* CENTER: illustration */}
      <div className="gs-center">
        <img key={bg} src={bg} alt="" className="gs-illus" />
        <div className="gs-illus-overlay" />
      </div>

      {/* RIGHT: tabs */}
      <div className="gs-right">
        <div className="gs-tab-strip">
          {TABS.map(t => (
            <button key={t.id} className={`gs-tab-btn ${activeTab === t.id ? 'active' : ''}`} onClick={() => onTabChange(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="gs-tab-content">
          {activeTab === 'story' && <CombatLogPanel combat={combat} />}
          {activeTab === 'character' && <CharacterPane game={game} />}
          {activeTab === 'journal' && <JournalPane journal={game.journal} />}
          {activeTab === 'menu' && <MenuPane onSaveSlot={onSaveSlot} onLoadSlot={onLoadSlot} onSettings={onSettings} onBackToTitle={onBackToTitle} />}
        </div>
      </div>
    </>
  );
}

// ─────────────── MAIN GAME SCREEN ───────────────

export function GameScreen({
  game, onGoTo, onBeginRoll, onRevealRoll, onConfirmRoll, onEndingReady,
  onSaveSlot, onLoadSlot, onSettings, onBackToTitle, onApplyPostCombatDamage, devMode,
}: Props) {
  const { character, chronicle, sceneId, diceState, endingId } = game;
  const scene = chronicle.scenes[sceneId];
  const [activeTab, setActiveTab] = useState<GameTab>('story');

  useEffect(() => { preloadImages(); }, []);

  useEffect(() => {
    if (endingId) onEndingReady(endingId);
  }, [endingId, onEndingReady]);

  useEffect(() => {
    if (scene) void Audio.sceneTransition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneId]);

  useEffect(() => { setActiveTab('story'); }, [sceneId]);

  if (!scene) return null;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const bg = useMemo(() => getSceneImage({
    sceneId,
    explicitImage: scene.image,
    hasCombat: !!scene.combat,
    checkType: scene.check?.type,
    hunger: character.hunger,
    intensity: scene.combat ? 4 : scene.check ? 3 : 2,
  }), [sceneId]);

  const showDice = diceState.phase !== 'idle' && diceState.result !== null;

  const STORY_TABS: { id: GameTab; label: string }[] = [
    { id: 'story',     label: 'Story' },
    { id: 'character', label: 'Sheet' },
    { id: 'journal',   label: 'Journal' },
    { id: 'menu',      label: 'Menu' },
  ];

  const MOBILE_TABS: { id: GameTab; icon: string; label: string }[] = [
    { id: 'story',     icon: '◈', label: 'Story' },
    { id: 'character', icon: '♦', label: 'Sheet' },
    { id: 'journal',   icon: '✦', label: 'Journal' },
    { id: 'menu',      icon: '≡', label: 'Menu' },
  ];

  return (
    <div className="gs-layout">
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

      {scene.combat ? (
        <CombatLayout
          game={game}
          sceneId={sceneId}
          onApplyPostCombatDamage={onApplyPostCombatDamage}
          onGoTo={onGoTo}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onSaveSlot={onSaveSlot}
          onLoadSlot={onLoadSlot}
          onSettings={onSettings}
          onBackToTitle={onBackToTitle}
          bg={bg}
        />
      ) : (
        <>
          {/* LEFT column: scene card (top) + actions (bottom) */}
          <div className="gs-left">
            <div className="gs-scene-card-wrap">
              <SceneCard scene={scene} character={character} />
            </div>
            <div className="gs-actions">
              <StoryActionsPanel
                scene={scene}
                character={character}
                diceState={diceState}
                onGoTo={onGoTo}
                onBeginRoll={onBeginRoll}
              />
            </div>
          </div>

          {/* CENTER column: illustration */}
          <div className="gs-center">
            <img key={bg} src={bg} alt="" className="gs-illus" />
            <div className="gs-illus-overlay" />
          </div>

          {/* RIGHT column: tabs + content */}
          <div className="gs-right">
            <div className="gs-tab-strip">
              {STORY_TABS.map(t => (
                <button key={t.id} className={`gs-tab-btn ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
                  {t.label}
                </button>
              ))}
            </div>
            <div className="gs-tab-content">
              {activeTab === 'story' && (
                <div className="gs-narrative">
                  {scene.title && (
                    <div className="gs-narrative-header">
                      <div className="scene-act">Act {scene.act}</div>
                      <h2 className="scene-title">{scene.title}</h2>
                    </div>
                  )}
                  <p className="narrative-text">{scene.narrative}</p>
                  {devMode && (
                    <div className="dev-panel">
                      <div className="dev-row"><span>Scene</span><code>{sceneId}</code></div>
                      {Object.keys(game.flags).length > 0 && (
                        <div className="dev-row"><span>Flags</span><code>{Object.keys(game.flags).join(', ')}</code></div>
                      )}
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'character' && <CharacterPane game={game} />}
              {activeTab === 'journal' && <JournalPane journal={game.journal} />}
              {activeTab === 'menu' && (
                <MenuPane onSaveSlot={onSaveSlot} onLoadSlot={onLoadSlot} onSettings={onSettings} onBackToTitle={onBackToTitle} />
              )}
            </div>
          </div>
        </>
      )}

      {/* Mobile bottom tab bar */}
      <nav className="gs-mobile-bar">
        {MOBILE_TABS.map(t => (
          <button
            key={t.id}
            className={`gs-tab-mobile-btn ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            <span className="gs-tab-mobile-icon">{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
