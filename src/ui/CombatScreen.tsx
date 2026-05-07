import { useState, useEffect, useRef } from 'react';
import type { Character } from '../engine';
import type { CombatScenario } from '../engine/story';
import {
  initCombat, processCombatRound, getAvailableDiscActions,
  DISC_ACTIONS,
} from '../engine/combat';
import type { CombatState, EnemyState, PlayerCombatState, DiscAction } from '../engine/combat';
import { Audio } from '../audio';

interface Props {
  scenario: CombatScenario;
  character: Character;
  onEnd: (nextSceneId: string) => void;
}

// ─────────────────── SUB-COMPONENTS ───────────────────

function HpTrack({ superficial, aggravated, max, compact }: {
  superficial: number; aggravated: number; max: number; compact?: boolean;
}) {
  return (
    <div className={`combat-hp-track ${compact ? 'compact' : ''}`}>
      {Array.from({ length: max }, (_, i) => {
        const isAgg = i >= max - aggravated;
        const isSup = i < superficial && !isAgg;
        return (
          <div key={i} className={`chp-box ${isAgg ? 'agg' : isSup ? 'sup' : ''}`}>
            {isAgg ? '✕' : isSup ? '/' : ''}
          </div>
        );
      })}
    </div>
  );
}

function HungerPips({ hunger, max = 5 }: { hunger: number; max?: number }) {
  return (
    <div className="combat-hunger">
      {Array.from({ length: max }, (_, i) => (
        <div key={i} className={`chng-pip ${i < hunger ? (hunger >= 5 ? 'bestial' : 'full') : ''}`} />
      ))}
    </div>
  );
}

function WpDots({ current, max }: { current: number; max: number }) {
  return (
    <div className="combat-wp">
      {Array.from({ length: max }, (_, i) => (
        <div key={i} className={`cwp-dot ${i < current ? 'filled' : ''}`} />
      ))}
    </div>
  );
}

function EnemyCard({
  enemy, targetable, selected, onClick,
}: {
  enemy: EnemyState;
  targetable: boolean;
  selected: boolean;
  onClick?: () => void;
}) {
  const defeated = enemy.hp <= 0;
  return (
    <div
      className={`enemy-card ${defeated ? 'defeated' : ''} ${targetable ? 'targetable' : ''} ${selected ? 'selected' : ''}`}
      onClick={targetable && !defeated ? onClick : undefined}
    >
      <div className="enemy-card-header">
        <span className="enemy-name">{enemy.spec.name}</span>
        <span className="enemy-clan">{enemy.spec.clan} · Gen {enemy.spec.generation}</span>
      </div>
      {defeated ? (
        <div className="enemy-torpor">TORPOR</div>
      ) : (
        <>
          <div className="enemy-stat-row">
            <span className="enemy-stat-label">HP</span>
            <HpTrack superficial={enemy.superficialDmg} aggravated={enemy.aggravatedDmg} max={enemy.spec.maxHealth} compact />
          </div>
          <div className="enemy-stat-row">
            <span className="enemy-stat-label">WP</span>
            <WpDots current={enemy.willpower} max={enemy.spec.maxWillpower} />
          </div>
          <div className="enemy-stat-row">
            <span className="enemy-stat-label">Hunger</span>
            <HungerPips hunger={enemy.hunger} />
          </div>
          {enemy.stunned && <div className="enemy-status-badge">STUNNED</div>}
          {enemy.attackPenalty > 0 && <div className="enemy-status-badge penalty">−{enemy.attackPenalty} ATK</div>}
        </>
      )}
      {targetable && !defeated && (
        <div className="target-indicator">▸ TARGET</div>
      )}
    </div>
  );
}

function PlayerPanel({ player, character }: { player: PlayerCombatState; character: Character }) {
  return (
    <div className="combat-player-panel">
      <div className="cpp-name">{character.name} · {character.clan}</div>
      <div className="cpp-stats">
        <div className="cpp-stat-row">
          <span className="cpp-label">HP</span>
          <HpTrack superficial={player.superficialDmg} aggravated={player.aggravatedDmg} max={character.health} />
          <span className="cpp-stat-val">{player.hp}/{character.health}</span>
        </div>
        <div className="cpp-stat-row">
          <span className="cpp-label">WP</span>
          <WpDots current={player.willpower} max={character.willpower} />
          <span className="cpp-stat-val">{player.willpower}/{character.willpower}</span>
        </div>
        <div className="cpp-stat-row">
          <span className="cpp-label">Hunger</span>
          <HungerPips hunger={player.hunger} />
          <span className="cpp-stat-val">{player.hunger}/5</span>
        </div>
        {player.isFullDefense && <div className="cpp-badge">FULL DEFENSE</div>}
        {player.fortitudeShield > 0 && <div className="cpp-badge">FORTITUDE −{player.fortitudeShield}</div>}
      </div>
    </div>
  );
}

// ─────────────────── MAIN COMPONENT ───────────────────

type CombatMode =
  | 'actions'
  | 'select_target_attack'
  | 'select_target_disc'
  | 'disc_menu'
  | 'ended';

export function CombatScreen({ scenario, character, onEnd }: Props) {
  const [cs, setCs] = useState<CombatState>(() => initCombat(character, scenario.enemies));
  const [mode, setMode] = useState<CombatMode>('actions');
  const [pendingDiscId, setPendingDiscId] = useState<string | null>(null);
  const [endDelay, setEndDelay] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  const availableDiscs = getAvailableDiscActions(character);
  const aliveEnemies = cs.enemies.filter(e => e.hp > 0);
  const singleEnemy = aliveEnemies.length === 1;

  useEffect(() => {
    if (cs.outcome !== 'ongoing' && mode !== 'ended') {
      setMode('ended');
      setEndDelay(true);
      if (cs.outcome === 'victory') Audio.success();
      else if (cs.outcome === 'defeat') Audio.bestialFailure();
    }
  }, [cs.outcome, mode]);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = 0;
    }
  }, [cs.log.length]);

  function dispatch(action: Parameters<typeof processCombatRound>[1]) {
    Audio.buttonTap();
    setCs(prev => processCombatRound(prev, action, character));
    setMode('actions');
    setPendingDiscId(null);
  }

  function handleAttack(targetIdx: number) {
    dispatch({ type: 'attack', targetIdx });
  }

  function handleAttackClick() {
    if (singleEnemy) {
      const idx = cs.enemies.findIndex(e => e.hp > 0);
      handleAttack(idx);
    } else {
      setMode('select_target_attack');
    }
  }

  function handleDiscClick(da: DiscAction) {
    if (!da.needsTarget) {
      dispatch({ type: 'discipline', actionId: da.id });
    } else if (singleEnemy) {
      const idx = cs.enemies.findIndex(e => e.hp > 0);
      dispatch({ type: 'discipline', actionId: da.id, targetIdx: idx });
    } else {
      setPendingDiscId(da.id);
      setMode('select_target_disc');
    }
  }

  function handleEnemyCardClick(idx: number) {
    if (mode === 'select_target_attack') {
      handleAttack(idx);
    } else if (mode === 'select_target_disc' && pendingDiscId) {
      dispatch({ type: 'discipline', actionId: pendingDiscId, targetIdx: idx });
    }
  }

  function handleEnd() {
    if (cs.outcome === 'victory') onEnd(scenario.victory_next);
    else if (cs.outcome === 'fled' && scenario.flee_next) onEnd(scenario.flee_next);
    else onEnd(scenario.defeat_next);
  }

  const targetableMode = mode === 'select_target_attack' || mode === 'select_target_disc';
  const pendingDiscAction = pendingDiscId ? DISC_ACTIONS.find(a => a.id === pendingDiscId) : null;

  const outcomeLabel = {
    victory: 'Victory',
    defeat: 'Defeated',
    fled: 'Escaped',
    ongoing: '',
  }[cs.outcome];

  const outcomeClass = {
    victory: 'victory',
    defeat: 'defeat',
    fled: 'fled',
    ongoing: '',
  }[cs.outcome];

  return (
    <div className="combat-screen">
      {/* Header */}
      <div className="combat-header">
        <div className="combat-scenario-label">{scenario.label}</div>
        <div className="combat-round-badge">Round {cs.round}</div>
      </div>

      {/* Enemies */}
      <div className="combat-enemies">
        {targetableMode && (
          <div className="combat-target-prompt">
            {mode === 'select_target_attack' ? 'Choose a target to attack' : `Target for ${pendingDiscAction?.label}`}
            <button className="combat-cancel-btn" onClick={() => { setMode('actions'); setPendingDiscId(null); }}>Cancel</button>
          </div>
        )}
        <div className="combat-enemy-list">
          {cs.enemies.map((enemy, i) => (
            <EnemyCard
              key={enemy.spec.id}
              enemy={enemy}
              targetable={targetableMode && enemy.hp > 0}
              selected={false}
              onClick={() => handleEnemyCardClick(i)}
            />
          ))}
        </div>
      </div>

      {/* Player status */}
      <PlayerPanel player={cs.player} character={character} />

      {/* Action area */}
      <div className="combat-action-area">
        {mode === 'disc_menu' ? (
          <div className="disc-menu">
            <div className="disc-menu-header">
              Choose a Discipline
              <button className="combat-cancel-btn" onClick={() => setMode('actions')}>✕</button>
            </div>
            <div className="disc-menu-list">
              {availableDiscs.map(da => (
                <button
                  key={da.id}
                  className="disc-menu-item"
                  onClick={() => handleDiscClick(da)}
                >
                  <div className="disc-item-header">
                    <span className="disc-item-name">{da.label}</span>
                    <span className="disc-item-clan">{da.discipline} {da.requiresRouse ? '· Rouse' : ''}</span>
                  </div>
                  <div className="disc-item-desc">{da.description}</div>
                </button>
              ))}
              {availableDiscs.length === 0 && (
                <div className="disc-menu-empty">No discipline combat actions available for this character.</div>
              )}
            </div>
          </div>
        ) : mode === 'ended' ? (
          <div className={`combat-outcome ${outcomeClass}`}>
            <div className="combat-outcome-label">{outcomeLabel}</div>
            <p className="combat-outcome-desc">
              {cs.outcome === 'victory' ? 'All enemies have entered Torpor.' :
               cs.outcome === 'defeat' ? 'You have been brought to Torpor.' :
               'You fled the field of battle.'}
            </p>
            {endDelay && (
              <button className="btn btn-primary btn-full" onClick={handleEnd}>
                Continue →
              </button>
            )}
          </div>
        ) : mode === 'actions' ? (
          <div className="combat-buttons">
            <button
              className="combat-btn attack"
              disabled={cs.outcome !== 'ongoing' || aliveEnemies.length === 0}
              onClick={handleAttackClick}
            >
              ⚔ Attack
            </button>
            {availableDiscs.length > 0 && (
              <button
                className="combat-btn discipline"
                disabled={cs.outcome !== 'ongoing'}
                onClick={() => setMode('disc_menu')}
              >
                ✦ Disciplines
              </button>
            )}
            <button
              className="combat-btn defense"
              disabled={cs.outcome !== 'ongoing'}
              onClick={() => dispatch({ type: 'full_defense' })}
            >
              🛡 Full Defense
            </button>
            {scenario.flee_next && (
              <button
                className="combat-btn flee"
                disabled={cs.outcome !== 'ongoing'}
                onClick={() => dispatch({ type: 'flee' })}
              >
                ↩ Flee
              </button>
            )}
          </div>
        ) : null}
      </div>

      {/* Combat log */}
      <div className="combat-log" ref={logRef}>
        <div className="combat-log-header">Combat Log</div>
        {cs.log.length === 0 && (
          <div className="combat-log-empty">The fight has not yet begun.</div>
        )}
        {[...cs.log].reverse().map(entry => (
          <div key={entry.id} className={`clog-entry ${entry.isPlayer ? 'player' : 'enemy'}`}>
            <span className="clog-round">R{entry.round}</span>
            <span className="clog-actor">{entry.actor}</span>
            <span className="clog-action">{entry.action}</span>
            <span className="clog-result">{entry.result}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
