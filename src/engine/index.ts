import { useState, useCallback } from 'react';
import type { Character } from './character';
import type { Chronicle, Scene, DiceCheck } from './story';
import { rollDice, difficultyCheck } from './dice';
import type { DiceResult } from './dice';
import { saveGame, loadGame } from './saves';
import type { JournalEntry } from './saves';
import { Audio } from '../audio';
import type { PlayerCombatState } from './combat';

export type { Character } from './character';
export type { Chronicle, Scene, Ending } from './story';
export type { DiceResult } from './dice';
export { CLANS, createCharacter, defaultAttributes, deriveHealth, deriveWillpower } from './character';
export { rollDice, difficultyCheck } from './dice';
export { saveGame, loadGame, listSaves } from './saves';
export function portraitPath(era: 'modern' | 'historical', clan: string): string {
  const folder = era === 'modern' ? 'modern' : 'medieval';
  return `/characters/${folder}/${clan.toLowerCase()}.png`;
}
export type { SaveSlot, JournalEntry } from './saves';

type DicePhase = 'idle' | 'rolling' | 'revealed';

export interface DiceState {
  phase: DicePhase;
  check: DiceCheck | null;
  result: DiceResult | null;
  passed: boolean;
}

export interface GameState {
  character: Character;
  chronicle: Chronicle;
  sceneId: string;
  flags: Record<string, boolean>;
  journal: JournalEntry[];
  diceState: DiceState;
  endingId: string | null;
}

const MOOD_BY_ACT: Record<number, 'exploration' | 'tension' | 'combat'> = {
  1: 'exploration',
  2: 'tension',
  3: 'tension',
  4: 'combat',
};

function resolveEnding(_chronicle: Chronicle, flags: Record<string, boolean>): string {
  const f = (k: string) => !!flags[k];
  const kesslerNeutralized = f('kessler_asset') || f('kessler_dead') || f('kessler_wiped') || f('kessler_peaceful_resolution');
  const vasileOk = f('vasile_found') || f('vasile_freed') || f('vasile_cooperative');
  const documents = f('has_documents') || f('miriam_deal');

  if (f('kessler_asset') && vasileOk && documents) return 'perfect_the_asset';
  if (kesslerNeutralized && vasileOk) return 'good_escape';
  return 'bad_documents_destroyed';
}

export function useGame() {
  const [state, setState] = useState<GameState | null>(null);

  const currentScene = (gs: GameState): Scene | null =>
    gs.chronicle.scenes[gs.sceneId] ?? null;

  const applyFlags = (flags: Record<string, boolean>, flagsToSet?: string[]): Record<string, boolean> => {
    if (!flagsToSet?.length) return flags;
    const next = { ...flags };
    for (const f of flagsToSet) next[f] = true;
    return next;
  };

  const autoSave = useCallback((gs: GameState) => {
    void saveGame({
      character: gs.character,
      sceneId: gs.sceneId,
      flags: gs.flags,
      journal: gs.journal,
      gmMode: 'classic',
    }, 'auto');
  }, []);

  const start = useCallback((character: Character, chronicle: Chronicle) => {
    Audio.setMood('exploration');
    const gs: GameState = {
      character,
      chronicle,
      sceneId: 'start',
      flags: {},
      journal: [],
      diceState: { phase: 'idle', check: null, result: null, passed: false },
      endingId: null,
    };
    autoSave(gs);
    setState(gs);
  }, [autoSave]);

  const goTo = useCallback((sceneId: string) => {
    setState(prev => {
      if (!prev) return prev;
      const scene = prev.chronicle.scenes[sceneId];
      if (!scene) return prev;
      const flags = applyFlags(prev.flags, scene.flags_set);
      const mood = MOOD_BY_ACT[scene.act] ?? 'exploration';
      Audio.setMood(mood);
      const journal = scene.title
        ? [{ entry: `Act ${scene.act} — ${scene.title}`, time: Date.now() }, ...prev.journal]
        : prev.journal;
      const character = scene.hunger_change != null
        ? { ...prev.character, hunger: Math.max(0, Math.min(5, prev.character.hunger + scene.hunger_change)) }
        : prev.character;
      const next: GameState = {
        ...prev,
        character,
        sceneId,
        flags,
        journal,
        diceState: { phase: 'idle', check: null, result: null, passed: false },
        endingId: null,
      };
      if (scene.resolution) {
        const endingId = resolveEnding(prev.chronicle, flags);
        return { ...next, endingId };
      }
      if (scene.ending) {
        Audio.setMood('ending');
        return { ...next, endingId: scene.ending };
      }
      autoSave(next);
      return next;
    });
  }, [autoSave]);

  const beginRoll = useCallback(() => {
    setState(prev => {
      if (!prev) return prev;
      const scene = currentScene(prev);
      if (!scene?.check) return prev;
      Audio.diceRoll();
      const result = rollDice(
        scene.check.pool(prev.character),
        scene.check.hunger(prev.character),
      );
      const passed = difficultyCheck(result, scene.check.difficulty);
      if (result.bestialFailure) Audio.bestialFailure();
      else if (passed) Audio.success();
      else Audio.failure();
      return {
        ...prev,
        diceState: { phase: 'rolling', check: scene.check, result, passed },
      };
    });
  }, []);

  const revealRoll = useCallback(() => {
    setState(prev => {
      if (!prev) return prev;
      return { ...prev, diceState: { ...prev.diceState, phase: 'revealed' } };
    });
  }, []);

  const confirmRoll = useCallback(() => {
    setState(prev => {
      if (!prev || prev.diceState.phase !== 'revealed') return prev;
      const { check, passed } = prev.diceState;
      if (!check) return prev;
      const nextId = passed ? check.success_next : check.fail_next;
      const scene = prev.chronicle.scenes[nextId];
      const flags = applyFlags(prev.flags, scene?.flags_set);
      const mood = MOOD_BY_ACT[scene?.act ?? 2] ?? 'tension';
      Audio.setMood(mood);
      const journal = scene?.title
        ? [{ entry: `Act ${scene.act} — ${scene.title}`, time: Date.now() }, ...prev.journal]
        : prev.journal;
      let endingId: string | null = null;
      if (scene?.resolution) endingId = resolveEnding(prev.chronicle, flags);
      else if (scene?.ending) { Audio.setMood('ending'); endingId = scene.ending; }
      const next: GameState = {
        ...prev,
        sceneId: nextId,
        flags,
        journal,
        diceState: { phase: 'idle', check: null, result: null, passed: false },
        endingId,
      };
      if (!endingId) autoSave(next);
      return next;
    });
  }, [autoSave]);

  const applyPostCombatDamage = useCallback((player: PlayerCombatState) => {
    setState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        character: {
          ...prev.character,
          superficialDmg: player.superficialDmg,
          aggravatedDmg: player.aggravatedDmg,
          hunger: player.hunger,
          willpower: player.willpower,
        },
      };
    });
  }, []);

  const hasFlag = useCallback((flag: string): boolean => {
    return !!state?.flags[flag];
  }, [state]);

  const resume = useCallback(async (chronicle: Chronicle): Promise<boolean> => {
    const save = await loadGame('auto');
    if (!save) return false;
    const scene = chronicle.scenes[save.sceneId];
    if (!scene) return false;
    Audio.setMood(MOOD_BY_ACT[scene.act] ?? 'exploration');
    setState({
      character: save.character,
      chronicle,
      sceneId: save.sceneId,
      flags: save.flags,
      journal: save.journal,
      diceState: { phase: 'idle', check: null, result: null, passed: false },
      endingId: null,
    });
    return true;
  }, []);

  const saveToSlot = useCallback(async (slot: string): Promise<void> => {
    if (!state) return;
    await saveGame({
      character: state.character,
      sceneId: state.sceneId,
      flags: state.flags,
      journal: state.journal,
      gmMode: 'classic',
    }, slot, state.character.name);
  }, [state]);

  const loadFromSlot = useCallback(async (slot: string): Promise<boolean> => {
    if (!state) return false;
    const save = await loadGame(slot);
    if (!save) return false;
    const scene = state.chronicle.scenes[save.sceneId];
    if (!scene) return false;
    Audio.setMood(MOOD_BY_ACT[scene.act] ?? 'exploration');
    setState({
      character: save.character,
      chronicle: state.chronicle,
      sceneId: save.sceneId,
      flags: save.flags,
      journal: save.journal,
      diceState: { phase: 'idle', check: null, result: null, passed: false },
      endingId: null,
    });
    return true;
  }, [state]);

  return { state, start, goTo, beginRoll, revealRoll, confirmRoll, hasFlag, resume, saveToSlot, loadFromSlot, applyPostCombatDamage, currentScene: state ? currentScene(state) : null };
}
