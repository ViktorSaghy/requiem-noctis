import { useEffect, useState } from 'react';
import type { Character } from '../engine';
import type { CombatScenario } from '../engine/story';
import type { EnemyState, PlayerCombatState } from '../engine/combat';
import { Audio } from '../audio';
import { useCombat } from './useCombat';
import type { CombatHook, CombatMode } from './useCombat';
import { useT } from '../engine/i18n';
import type { Inventory } from '../engine/inventory';
import { listConsumables } from '../engine/inventory';

// ─────────────── SHARED ATOMS ───────────────

export function HpTrack({ superficial, aggravated, max, compact }: {
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

export function HungerPips({ hunger, max = 5 }: { hunger: number; max?: number }) {
  return (
    <div className="combat-hunger">
      {Array.from({ length: max }, (_, i) => (
        <div key={i} className={`chng-pip ${i < hunger ? (hunger >= 5 ? 'bestial' : 'full') : ''}`} />
      ))}
    </div>
  );
}

export function WpDots({ current, max }: { current: number; max: number }) {
  return (
    <div className="combat-wp">
      {Array.from({ length: max }, (_, i) => (
        <div key={i} className={`cwp-dot ${i < current ? 'filled' : ''}`} />
      ))}
    </div>
  );
}

// ─────────────── ENEMY CARD ───────────────

export function EnemyCard({
  enemy, targetable, selected, onClick,
}: {
  enemy: EnemyState; targetable: boolean; selected: boolean; onClick?: () => void;
}) {
  const t = useT();
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
        <div className="enemy-torpor">{t('combat.torpor')}</div>
      ) : (
        <>
          <div className="enemy-stat-row">
            <span className="enemy-stat-label">{t('game.hp')}</span>
            <HpTrack superficial={enemy.superficialDmg} aggravated={enemy.aggravatedDmg} max={enemy.spec.maxHealth} compact />
          </div>
          <div className="enemy-stat-row">
            <span className="enemy-stat-label">{t('game.wp')}</span>
            <WpDots current={enemy.willpower} max={enemy.spec.maxWillpower} />
          </div>
          <div className="enemy-stat-row">
            <span className="enemy-stat-label">{t('game.hunger')}</span>
            <HungerPips hunger={enemy.hunger} />
          </div>
          {enemy.stunned && <div className="enemy-status-badge">{t('combat.stunned')}</div>}
          {enemy.attackPenalty > 0 && <div className="enemy-status-badge penalty">−{enemy.attackPenalty} ATK</div>}
          {enemy.spec.description && <div className="enemy-desc">{enemy.spec.description}</div>}
        </>
      )}
      {targetable && !defeated && <div className="target-indicator">{t('combat.targetIndicator')}</div>}
    </div>
  );
}

// ─────────────── COMBAT STATUS PANEL (left column top) ───────────────

export function CombatStatusPanel({ combat, character, scenario }: {
  combat: CombatHook; character: Character; scenario: CombatScenario;
}) {
  const t = useT();
  const { cs, mode, targetableMode, pendingDiscAction, handleEnemyCardClick, setMode, setPendingDiscId } = combat;
  return (
    <div className="cs-status-panel">
      <div className="cs-header">
        <span className="cs-scenario-label">{scenario.label}</span>
        <span className="cs-round-badge">{t('combat.round', { n: cs.round })}</span>
      </div>
      {cs.player.compulsion && (
        <div className="compulsion-banner">
          <span className="compulsion-banner-label">{t('combat.compulsion')}</span>
          <span className="compulsion-banner-text">{cs.player.compulsion}</span>
        </div>
      )}
      {targetableMode && (
        <div className="combat-target-prompt">
          {mode === 'select_target_attack' ? t('combat.chooseTarget') : t('combat.targetFor', { action: pendingDiscAction?.label ?? '' })}
          <button className="combat-cancel-btn" onClick={() => { setMode('actions'); setPendingDiscId(null); }}>{t('cancel')}</button>
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
      <div className={`cs-player-panel ${cs.player.isFrenzy ? 'frenzy-active' : ''}`}>
        <div className="cpp-name">{character.name} · {character.clan}</div>
        <div className="cpp-stats">
          <div className="cpp-stat-row">
            <span className="cpp-label">{t('game.hp')}</span>
            <HpTrack superficial={cs.player.superficialDmg} aggravated={cs.player.aggravatedDmg} max={character.health} />
            <span className="cpp-stat-val">{cs.player.hp}/{character.health}</span>
          </div>
          <div className="cpp-stat-row">
            <span className="cpp-label">{t('game.wp')}</span>
            <WpDots current={cs.player.willpower} max={character.willpower} />
            <span className="cpp-stat-val">{cs.player.willpower}/{character.willpower}</span>
          </div>
          <div className="cpp-stat-row">
            <span className="cpp-label">{t('game.hunger')}</span>
            <HungerPips hunger={cs.player.hunger} />
            <span className="cpp-stat-val">{cs.player.hunger}/5</span>
          </div>
          <div className="cpp-badges">
            {cs.player.isFullDefense && <div className="cpp-badge">{t('combat.fullDefenseBadge')}</div>}
            {cs.player.fortitudeShield > 0 && <div className="cpp-badge">RESILIENCE −{cs.player.fortitudeShield}</div>}
            {cs.player.auspexShield > 0 && <div className="cpp-badge">PREMONITION −{cs.player.auspexShield}</div>}
            {cs.player.celerityBonus > 0 && <div className="cpp-badge">RAPID REFLEXES +{cs.player.celerityBonus} DEF</div>}
            {cs.player.isFrenzy && <div className="cpp-badge frenzy">{t('combat.frenzy')}</div>}
            {cs.player.compulsion && <div className="cpp-badge compulsion">{t('combat.compulsionBadge')}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────── COMBAT ACTIONS PANEL (left column bottom) ───────────────

export function CombatActionsPanel({ combat, scenario, inventory, onUseItem }: {
  combat: CombatHook;
  scenario: CombatScenario;
  inventory?: Inventory | null;
  onUseItem?: (itemId: string) => void;
}) {
  const t = useT();
  const [showItems, setShowItems] = useState(false);
  const {
    cs, mode, wpBoost, canSpendWP, availableDiscs, aliveEnemies,
    inFrenzy, endDelay, outcomeLabel, outcomeClass,
    dispatch, handleAttackClick, handleDiscClick, handleItemUse, handleEnd,
    setMode, setWpBoost,
  } = combat;

  const consumables = inventory ? listConsumables(inventory) : [];

  if (mode === 'ended') {
    return (
      <div className={`combat-outcome ${outcomeClass}`}>
        <div className="combat-outcome-label">{outcomeLabel}</div>
        <p className="combat-outcome-desc">
          {cs.outcome === 'victory' ? t('combat.victory') :
           cs.outcome === 'defeat' ? t('combat.defeat') :
           t('combat.fled')}
        </p>
        {endDelay && (
          <button className="btn btn-primary btn-full" onClick={handleEnd}>{t('game.continue')} →</button>
        )}
      </div>
    );
  }

  if (inFrenzy) {
    return (
      <div className="frenzy-action-area">
        <div className="frenzy-banner">
          <div className="frenzy-banner-title">{t('combat.frenzy')}</div>
          <div className="frenzy-banner-text">{t('combat.frenzyMsg')}</div>
        </div>
        <button
          className="combat-btn attack frenzy-btn"
          disabled={cs.outcome !== 'ongoing' || aliveEnemies.length === 0}
          onClick={() => dispatch({ type: 'attack', targetIdx: Math.max(0, cs.enemies.findIndex(e => e.hp > 0)) })}
        >
          {t('combat.frenzyAttack')}
        </button>
      </div>
    );
  }

  if (mode === 'disc_menu') {
    return (
      <div className="disc-menu">
        <div className="disc-menu-header">
          {t('combat.chooseDisc')}
          <button className="combat-cancel-btn" onClick={() => setMode('actions')}>✕</button>
        </div>
        <div className="disc-menu-list">
          {availableDiscs.map(da => (
            <button key={da.id} className="disc-menu-item" onClick={() => handleDiscClick(da)}>
              <div className="disc-item-header">
                <span className="disc-item-name">{da.label}</span>
                <span className="disc-item-clan">{da.discipline} {da.requiresRouse ? '· Rouse' : '· No Rouse'}</span>
              </div>
              <div className="disc-item-desc">{da.description}</div>
            </button>
          ))}
          {availableDiscs.length === 0 && <div className="disc-menu-empty">{t('combat.noDisc')}</div>}
        </div>
      </div>
    );
  }

  if (showItems) {
    return (
      <div className="disc-menu">
        <div className="disc-menu-header">
          {t('combat.useItemMenu')}
          <button className="combat-cancel-btn" onClick={() => setShowItems(false)}>✕</button>
        </div>
        <div className="disc-menu-list">
          {consumables.map(item => (
            <button
              key={item.id}
              className="disc-menu-item"
              onClick={() => { handleItemUse(item.id); onUseItem?.(item.id); setShowItems(false); }}
            >
              <div className="disc-item-header">
                <span className="disc-item-name">{item.icon} {item.name}</span>
                {item.stackable && item.quantity > 1 && (
                  <span className="disc-item-clan">×{item.quantity}</span>
                )}
              </div>
              <div className="disc-item-desc">{item.description}</div>
            </button>
          ))}
          {consumables.length === 0 && (
            <div className="disc-menu-empty">{t('combat.noConsumables')}</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {canSpendWP && (
        <div className="wp-spend-row">
          <button
            className={`wp-spend-btn ${wpBoost ? 'active' : ''}`}
            onClick={() => setWpBoost(v => !v)}
          >
            {wpBoost ? '◉' : '○'} {t('combat.spendWp', { wp: cs.player.willpower })}
          </button>
        </div>
      )}
      <div className="combat-buttons">
        <button
          className="combat-btn attack"
          disabled={cs.outcome !== 'ongoing' || aliveEnemies.length === 0}
          onClick={handleAttackClick}
        >
          {wpBoost ? t('combat.attackWp') : t('combat.attack')}
        </button>
        {availableDiscs.length > 0 && (
          <button className="combat-btn discipline" disabled={cs.outcome !== 'ongoing'} onClick={() => setMode('disc_menu')}>
            {t('combat.disciplines')}
          </button>
        )}
        <button className="combat-btn defense" disabled={cs.outcome !== 'ongoing'} onClick={() => dispatch({ type: 'full_defense' })}>
          {t('combat.fullDefense')}
        </button>
        <button
          className={`combat-btn rouse-heal${cs.player.hunger >= 4 ? ' rouse-heal--warn' : ''}`}
          disabled={cs.outcome !== 'ongoing' || cs.player.superficialDmg === 0}
          onClick={() => dispatch({ type: 'rouse_to_heal' })}
        >
          {t('combat.rouseHeal')}
          <span className="rouse-heal-sub">Hunger {cs.player.hunger}/5</span>
        </button>
        {consumables.length > 0 && (
          <button className="combat-btn item-use" disabled={cs.outcome !== 'ongoing'} onClick={() => setShowItems(true)}>
            {t('combat.useItem')}
          </button>
        )}
        {scenario.flee_next && (
          <button className="combat-btn flee" disabled={cs.outcome !== 'ongoing'} onClick={() => dispatch({ type: 'flee' })}>
            {t('combat.flee')}
          </button>
        )}
      </div>
    </>
  );
}

// ─────────────── COMBAT LOG PANEL (right story tab) ───────────────

export function CombatLogPanel({ combat }: { combat: CombatHook }) {
  const t = useT();
  const { cs, logRef } = combat;
  return (
    <div className="combat-log" ref={logRef}>
      {cs.log.length === 0 && <div className="combat-log-empty">{t('combat.logEmpty')}</div>}
      {[...cs.log].reverse().map(entry => (
        <div
          key={entry.id}
          className={`clog-entry ${entry.isPlayer ? 'player' : 'enemy'} ${entry.isFrenzy ? 'frenzy' : ''} ${entry.isCompulsion ? 'compulsion' : ''} ${entry.actor === 'GM' ? 'gm-narration' : ''}`}
        >
          {entry.actor === 'GM' ? (
            <>
              <span className="clog-round">R{entry.round}</span>
              <div className="clog-narration">{entry.narration}</div>
            </>
          ) : (
            <>
              <span className="clog-round">R{entry.round}</span>
              <span className="clog-actor">{entry.actor}</span>
              <span className="clog-action">{entry.action}</span>
              <span className="clog-result">{entry.result}</span>
              {entry.dice && <span className="clog-dice">{entry.dice}</span>}
              {entry.narration && <div className="clog-narration">{entry.narration}</div>}
            </>
          )}
        </div>
      ))}
    </div>
  );
}

// ─────────────── MONOLITHIC FALLBACK ───────────────

interface Props {
  scenario: CombatScenario;
  character: Character;
  onEnd: (nextSceneId: string, finalPlayer: PlayerCombatState) => void;
}

export function CombatScreen({ scenario, character, onEnd }: Props) {
  const combat = useCombat(character, scenario, onEnd);

  useEffect(() => {
    Audio.setMood('combat');
    return () => { Audio.setMood('exploration'); };
  }, []);

  return (
    <div className="combat-screen">
      <CombatStatusPanel combat={combat} character={character} scenario={scenario} />
      <div className="combat-action-area">
        <CombatActionsPanel combat={combat} scenario={scenario} />
      </div>
      <CombatLogPanel combat={combat} />
    </div>
  );
}

export type { CombatHook, CombatMode };
