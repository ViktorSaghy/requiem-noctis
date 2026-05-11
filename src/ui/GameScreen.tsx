import { useEffect, useState, useMemo, Fragment } from 'react';
import type { GameState } from '../engine';
import { listSaves, CLANS, portraitPath, getSceneImage, preloadImages } from '../engine';
import type { SaveSlot, JournalEntry } from '../engine';
import { XpHUD } from './XpHUD';
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
import { useT } from '../engine/i18n';
import type { TranslationKey } from '../engine/i18n';

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
  const t = useT();
  const { character } = game;
  const discs = Object.entries(character.disciplines).filter(([, v]) => v > 0);
  const clanData = CLANS[character.clan];
  const currentHp = character.health - character.superficialDmg - character.aggravatedDmg;
  const nonZeroSkills = Object.entries(character.skills ?? {}).filter(([, v]) => (v ?? 0) > 0) as [string, number][];

  function tSkill(key: string): string {
    return t(`skill.${key}` as TranslationKey);
  }

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
            {character.clan} · {character.gender === 'male' ? t('male') : t('female')} · Gen. {character.generation}
          </div>
          <XpHUD xp={character.xp ?? 0} compact />
        </div>
      </div>
      <div className="char-pane-section">
        <div className="char-pane-label">{t('char.status')}</div>
        <div className="char-status-row">
          <HungerPips hunger={character.hunger} />
          <div className="track-group">
            <span className="track-label">{t('game.hp')}</span>
            {Array.from({ length: character.health }, (_, i) => {
              const isAgg = i >= character.health - character.aggravatedDmg;
              const isSup = !isAgg && i < character.superficialDmg;
              return <div key={i} className={`track-box ${isAgg ? 'agg-dmg' : isSup ? 'sup-dmg' : ''}`} />;
            })}
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginLeft: '0.25rem' }}>{Math.max(0, currentHp)}/{character.health}</span>
        </div>
        <div className="char-vitals">
          <DotTrack value={character.willpower} max={10} label={t('char.willpower')} />
          <DotTrack value={character.humanity} max={10} label={t('char.humanity')} />
        </div>
      </div>
      <div className="char-pane-section">
        <div className="char-pane-label">{t('char.attributes')}</div>
        <div className="char-attr-grid">
          {Object.entries(character.attributes).map(([k, v]) => (
            <div key={k} className="char-attr-cell">
              <div className="char-attr-val">{'●'.repeat(v)}{'○'.repeat(5 - v)}</div>
              <div className="char-attr-name">{t(`attr.${k}` as TranslationKey).slice(0, 3)}</div>
            </div>
          ))}
        </div>
      </div>
      {nonZeroSkills.length > 0 && (
        <div className="char-pane-section">
          <div className="char-pane-label">{t('char.skills')}</div>
          <div className="char-skills-list">
            {(Object.keys(SKILL_DISPLAY_CATS) as string[]).map(cat => {
              const catSkills = nonZeroSkills.filter(([k]) => SKILL_DISPLAY_CATS[cat].includes(k));
              if (catSkills.length === 0) return null;
              return (
                <Fragment key={cat}>
                  <div className="char-skills-cat-label">{t(`cat.${cat.toLowerCase()}` as TranslationKey)}</div>
                  {catSkills.map(([k, v]) => (
                    <div key={k} className="char-skill-row">
                      <span className="char-skill-name">{tSkill(k)}</span>
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
          <div className="char-pane-label">{t('char.disciplines')}</div>
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
          <div className="char-pane-label">{t('char.clanBane')}</div>
          <div className="card" style={{ fontSize: '0.78rem', fontStyle: 'italic', color: 'var(--text-dim)' }}>{clanData.bane}</div>
        </div>
      )}
      {clanData && (
        <div className="char-pane-section">
          <div className="char-pane-label">{t('char.compulsion')}</div>
          <div className="card" style={{ fontSize: '0.78rem', fontStyle: 'italic', color: 'var(--text-dim)' }}>{clanData.compulsion}</div>
        </div>
      )}
    </div>
  );
}

function JournalPane({ journal }: { journal: JournalEntry[] }) {
  const t = useT();
  if (journal.length === 0) {
    return <div className="journal-pane"><div className="journal-empty">{t('game.journal.empty')}</div></div>;
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
  const t = useT();
  const [saves, setSaves] = useState<Record<string, SaveSlot>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => { listSaves().then(setSaves); }, []);

  const SLOTS = [
    { id: 'slot1', label: t('game.menu.slot1') },
    { id: 'slot2', label: t('game.menu.slot2') },
    { id: 'slot3', label: t('game.menu.slot3') },
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
        <div className="menu-section-label">{t('game.menu.saveLoad')}</div>
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
                  <div className="save-details save-empty">{t('game.menu.empty')}</div>
                )}
              </div>
              <div className="save-actions">
                <button className="btn btn-sm btn-gold" disabled={busy} onClick={() => handleSave(id)}>{t('game.menu.save')}</button>
                {save && <button className="btn btn-sm" disabled={busy} onClick={() => handleLoad(id)}>{t('game.menu.load')}</button>}
              </div>
            </div>
          );
        })}
      </div>
      <div className="menu-section">
        <button className="btn btn-full" style={{ marginBottom: '0.5rem' }} onClick={onSettings}>{t('game.menu.settings')}</button>
        <button
          className="btn btn-full"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            await onSaveSlot('auto');
            setBusy(false);
            onBackToTitle();
          }}
        >
          {t('game.menu.backToTitle')}
        </button>
      </div>
    </div>
  );
}

// ─────────────── STORY ACTIONS ───────────────

function StoryActionsPanel({ scene, character, flags, diceState, onGoTo, onBeginRoll }: {
  scene: NonNullable<GameState['chronicle']['scenes'][string]>;
  character: GameState['character'];
  flags: GameState['flags'];
  diceState: GameState['diceState'];
  onGoTo: (id: string) => void;
  onBeginRoll: () => void;
}) {
  const t = useT();

  function handleChoice(nextId: string) {
    void Audio.buttonTap();
    onGoTo(nextId);
  }
  function handleNext() {
    void Audio.buttonTap();
    if (scene.next) onGoTo(scene.next);
  }

  // Returns null  → hide choice entirely
  // Returns false → show as disabled (locked but visible — teaches the mechanic)
  // Returns true  → show normally
  function choiceAccess(choice: NonNullable<typeof scene.choices>[number]): null | boolean {
    if (choice.requires_clan && choice.requires_clan !== character.clan) return null;
    if (choice.requires_flag && !flags[choice.requires_flag]) return null;
    const disciplines = character.disciplines as Record<string, number | undefined>;
    if (choice.requires_discipline && !disciplines[choice.requires_discipline]) return false;
    if (choice.requires_hunger_gte != null && character.hunger < choice.requires_hunger_gte) return false;
    if (choice.requires_hunger_lte != null && character.hunger > choice.requires_hunger_lte) return false;
    return true;
  }

  return (
    <div className="gs-actions-inner">
      {scene.choices && scene.choices.length > 0 && (
        <div className="choice-list">
          {scene.choices.map((choice, i) => {
            const access = choiceAccess(choice);
            if (access === null) return null;
            const locked = access === false;
            const lockHint = locked
              ? (choice.requires_discipline ? `Requires ${choice.requires_discipline}`
                : choice.requires_hunger_gte != null ? `Hunger ${choice.requires_hunger_gte}+ required`
                : choice.requires_hunger_lte != null ? `Hunger ${choice.requires_hunger_lte} or lower required`
                : 'Locked')
              : undefined;
            return (
              <button
                key={i}
                className={`choice-btn${locked ? ' choice-btn-locked' : ''}`}
                disabled={locked}
                title={lockHint}
                onClick={() => !locked && handleChoice(choice.next)}
              >
                {choice.icon && <span className="choice-icon">{choice.icon}</span>}
                {locked && <span className="choice-lock-icon">🔒</span>}
                {choice.text}
                {locked && lockHint && <span className="choice-lock-hint">{lockHint}</span>}
              </button>
            );
          })}
        </div>
      )}
      {scene.check && diceState.phase === 'idle' && (
        <div className="check-card">
          <div className="check-header">
            <span className="check-icon">🎲</span>
            <h3 className="check-title">{t('game.diceCheck')}</h3>
          </div>
          <p className="check-description">{scene.check.label}</p>
          <div className="check-stats">
            <div className="check-stat">
              <div className="check-stat-label">{t('game.pool')}</div>
              <div className="check-stat-value">{scene.check.pool(character)}</div>
            </div>
            <div className="check-stat">
              <div className="check-stat-label">{t('game.difficulty')}</div>
              <div className="check-stat-value">{scene.check.difficulty}</div>
            </div>
          </div>
          <button className="roll-btn" onClick={onBeginRoll}>
            <span>🎲</span> {t('game.rollDice')}
          </button>
        </div>
      )}
      {scene.next && !scene.choices && !scene.check && (
        <button className="continue-btn" onClick={handleNext}>{t('game.continue')}</button>
      )}
      {scene.resolution && (
        <div style={{ color: 'var(--text-dim)', fontSize: 'var(--text-sm)', textAlign: 'center', padding: '1rem' }}>
          {t('game.resolving')}
        </div>
      )}
    </div>
  );
}

// ─────────────── SCENE CARD ───────────────

function SceneCard({ scene, character }: {
  scene: NonNullable<GameState['chronicle']['scenes'][string]>;
  character: GameState['character'];
}) {
  const t = useT();
  const currentHp = character.health - character.superficialDmg - character.aggravatedDmg;
  return (
    <div className="gs-scene-card">
      {scene.act && (
        <div className="gs-scene-act">{t('game.act', { n: scene.act })}</div>
      )}
      {scene.title && (
        <h2 className="gs-scene-title">{scene.title}</h2>
      )}
      <div className="gs-char-vitals">
        <div className="gs-char-name">{character.name} · {character.clan}</div>
        <div className="gs-vital-row">
          <span className="gs-vital-label">{t('game.hp')}</span>
          <HpTrack superficial={character.superficialDmg} aggravated={character.aggravatedDmg} max={character.health} compact />
          <span className="gs-vital-val">{Math.max(0, currentHp)}/{character.health}</span>
        </div>
        <div className="gs-vital-row">
          <span className="gs-vital-label">{t('game.wp')}</span>
          <WpDots current={character.willpower} max={character.willpower} />
          <span className="gs-vital-val">{character.willpower}</span>
        </div>
        <div className="gs-vital-row">
          <span className="gs-vital-label">{t('game.hunger')}</span>
          <HungerPips hunger={character.hunger} />
          <span className="gs-vital-val">{character.hunger}/5</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────── COMBAT WRAPPER ───────────────

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
  const t = useT();
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
    { id: 'story',     label: t('game.tab.combatLog') },
    { id: 'character', label: t('game.tab.sheet') },
    { id: 'journal',   label: t('game.tab.journal') },
    { id: 'menu',      label: t('game.tab.menu') },
  ];

  return (
    <>
      <div className="gs-left" style={{ display: 'contents' }}>
        <div className="gs-scene-card-wrap">
          <CombatStatusPanel combat={combat} character={character} scenario={scenario} />
        </div>
        <div className="gs-actions">
          <CombatActionsPanel combat={combat} scenario={scenario} />
        </div>
      </div>

      <div className="gs-center">
        <img key={bg} src={bg} alt="" className="gs-illus" />
        <div className="gs-illus-overlay" />
      </div>

      <div className="gs-right">
        <div className="gs-tab-strip">
          {TABS.map(tab => (
            <button key={tab.id} className={`gs-tab-btn ${activeTab === tab.id ? 'active' : ''}`} onClick={() => onTabChange(tab.id)}>
              {tab.label}
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
  const t = useT();
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
    { id: 'story',     label: t('game.tab.story') },
    { id: 'character', label: t('game.tab.sheet') },
    { id: 'journal',   label: t('game.tab.journal') },
    { id: 'menu',      label: t('game.tab.menu') },
  ];

  const MOBILE_TABS: { id: GameTab; icon: string; label: string }[] = [
    { id: 'story',     icon: '◈', label: t('game.tab.story') },
    { id: 'character', icon: '♦', label: t('game.tab.sheet') },
    { id: 'journal',   icon: '✦', label: t('game.tab.journal') },
    { id: 'menu',      icon: '≡', label: t('game.tab.menu') },
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
          <div className="gs-left">
            <div className="gs-scene-card-wrap">
              <SceneCard scene={scene} character={character} />
            </div>
            <div className="gs-actions">
              <StoryActionsPanel
                scene={scene}
                character={character}
                flags={game.flags}
                diceState={diceState}
                onGoTo={onGoTo}
                onBeginRoll={onBeginRoll}
              />
            </div>
          </div>

          <div className="gs-center">
            <img key={bg} src={bg} alt="" className="gs-illus" />
            <div className="gs-illus-overlay" />
          </div>

          <div className="gs-right">
            <div className="gs-tab-strip">
              {STORY_TABS.map(tab => (
                <button key={tab.id} className={`gs-tab-btn ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="gs-tab-content">
              {activeTab === 'story' && (
                <div className="gs-narrative">
                  {scene.title && (
                    <div className="gs-narrative-header">
                      <div className="scene-act">{t('game.act', { n: scene.act ?? '' })}</div>
                      <h2 className="scene-title">{scene.title}</h2>
                    </div>
                  )}
                  <p className="narrative-text">{scene.narrative}</p>

                  {/* Clan-specific addendum — only shown to matching clan */}
                  {scene.clan_notes?.[game.character.clan as keyof typeof scene.clan_notes] && (
                    <p className="narrative-clan-note">
                      {scene.clan_notes[game.character.clan as keyof typeof scene.clan_notes]}
                    </p>
                  )}

                  {/* Compulsion instinct — shown when hunger ≥ 4 */}
                  {scene.compulsion_note && game.character.hunger >= 4 && (
                    <div className="compulsion-callout">
                      <span className="compulsion-callout-icon">🩸</span>
                      {scene.compulsion_note}
                    </div>
                  )}

                  {/* Humanity stain notification */}
                  {scene.humanity_change != null && scene.humanity_change < 0 && (
                    <div className="stain-callout">
                      <span className="stain-callout-icon">◆</span>
                      {scene.stain_note ?? 'Something dims within you.'}
                    </div>
                  )}

                  {devMode && (
                    <div className="dev-panel">
                      <div className="dev-row"><span>{t('game.devScene')}</span><code>{sceneId}</code></div>
                      {Object.keys(game.flags).length > 0 && (
                        <div className="dev-row"><span>{t('game.devFlags')}</span><code>{Object.keys(game.flags).join(', ')}</code></div>
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

      <nav className="gs-mobile-bar">
        {MOBILE_TABS.map(tab => (
          <button
            key={tab.id}
            className={`gs-tab-mobile-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="gs-tab-mobile-icon">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
