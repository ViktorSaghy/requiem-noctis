import { useState, useEffect, useRef } from 'react';
import type { Character } from '../engine';
import type { CombatScenario } from '../engine/story';
import {
  initCombat, processCombatRound, getAvailableDiscActions, DISC_ACTIONS,
} from '../engine/combat';
import type { CombatState, EnemyState, PlayerCombatState, DiscAction } from '../engine/combat';
import { Audio } from '../audio';

export type CombatMode =
  | 'actions'
  | 'select_target_attack'
  | 'select_target_disc'
  | 'disc_menu'
  | 'ended';

export interface CombatHook {
  cs: CombatState;
  mode: CombatMode;
  pendingDiscId: string | null;
  pendingDiscAction: DiscAction | null;
  endDelay: boolean;
  wpBoost: boolean;
  logRef: React.RefObject<HTMLDivElement | null>;
  availableDiscs: DiscAction[];
  aliveEnemies: EnemyState[];
  singleEnemy: boolean;
  canSpendWP: boolean;
  inFrenzy: boolean;
  targetableMode: boolean;
  outcomeLabel: string;
  outcomeClass: string;
  dispatch: (action: Parameters<typeof processCombatRound>[1]) => void;
  handleAttackClick: () => void;
  handleDiscClick: (da: DiscAction) => void;
  handleEnemyCardClick: (idx: number) => void;
  handleEnd: () => void;
  setMode: React.Dispatch<React.SetStateAction<CombatMode>>;
  setPendingDiscId: React.Dispatch<React.SetStateAction<string | null>>;
  setWpBoost: React.Dispatch<React.SetStateAction<boolean>>;
}

export function useCombat(
  character: Character,
  scenario: CombatScenario,
  onEnd: (nextSceneId: string, finalPlayer: PlayerCombatState) => void,
  onDefeat?: () => void,
): CombatHook {
  const [cs, setCs] = useState<CombatState>(() => initCombat(character, scenario.enemies));
  const [mode, setMode] = useState<CombatMode>('actions');
  const [pendingDiscId, setPendingDiscId] = useState<string | null>(null);
  const [endDelay, setEndDelay] = useState(false);
  const [wpBoost, setWpBoost] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  const availableDiscs = getAvailableDiscActions(character);
  const aliveEnemies = cs.enemies.filter(e => e.hp > 0);
  const singleEnemy = aliveEnemies.length === 1;
  const canSpendWP = cs.player.willpower > 0 && !cs.player.isFrenzy;
  const inFrenzy = cs.player.isFrenzy;
  const targetableMode = mode === 'select_target_attack' || mode === 'select_target_disc';
  const pendingDiscAction = pendingDiscId ? (DISC_ACTIONS.find(a => a.id === pendingDiscId) ?? null) : null;

  useEffect(() => {
    if (cs.outcome === 'ongoing') return;
    setMode('ended');
    if (cs.outcome === 'victory') void Audio.success();
    else if (cs.outcome === 'defeat') void Audio.bestialFailure();
    const t = setTimeout(() => setEndDelay(true), 1500);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cs.outcome]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = 0;
  }, [cs.log.length]);

  useEffect(() => {
    if (inFrenzy && mode !== 'actions' && mode !== 'ended') {
      setMode('actions');
      setPendingDiscId(null);
    }
  }, [inFrenzy, mode]);

  function dispatch(action: Parameters<typeof processCombatRound>[1]) {
    void Audio.buttonTap();
    setCs(prev => processCombatRound(prev, action, character));
    setMode('actions');
    setPendingDiscId(null);
    setWpBoost(false);
  }

  function handleAttack(targetIdx: number) {
    dispatch({ type: 'attack', targetIdx, wpBoost });
  }

  function handleAttackClick() {
    if (singleEnemy) {
      handleAttack(cs.enemies.findIndex(e => e.hp > 0));
    } else {
      setMode('select_target_attack');
    }
  }

  function handleDiscClick(da: DiscAction) {
    if (!da.needsTarget) {
      dispatch({ type: 'discipline', actionId: da.id });
    } else if (singleEnemy) {
      dispatch({ type: 'discipline', actionId: da.id, targetIdx: cs.enemies.findIndex(e => e.hp > 0) });
    } else {
      setPendingDiscId(da.id);
      setMode('select_target_disc');
    }
  }

  function handleEnemyCardClick(idx: number) {
    if (mode === 'select_target_attack') handleAttack(idx);
    else if (mode === 'select_target_disc' && pendingDiscId) dispatch({ type: 'discipline', actionId: pendingDiscId, targetIdx: idx });
  }

  function handleEnd() {
    if (cs.outcome === 'victory') onEnd(scenario.victory_next, cs.player);
    else if (cs.outcome === 'fled' && scenario.flee_next) onEnd(scenario.flee_next, cs.player);
    else if (onDefeat) onDefeat();
    else onEnd(scenario.defeat_next, cs.player);
  }

  const outcomeLabel = { victory: 'Victory', defeat: 'Defeated', fled: 'Escaped', ongoing: '' }[cs.outcome];
  const outcomeClass = { victory: 'victory', defeat: 'defeat', fled: 'fled', ongoing: '' }[cs.outcome];

  return {
    cs, mode, pendingDiscId, pendingDiscAction, endDelay, wpBoost,
    logRef, availableDiscs, aliveEnemies, singleEnemy, canSpendWP,
    inFrenzy, targetableMode, outcomeLabel, outcomeClass,
    dispatch, handleAttackClick, handleDiscClick, handleEnemyCardClick, handleEnd,
    setMode, setPendingDiscId, setWpBoost,
  };
}
