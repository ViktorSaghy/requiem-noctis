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
export { awardXp, getSuggestedUpgrades, canPurchase, purchase, getCategoryProgress, buildTransactionLog } from './progression';
export type { XpAwardRecord, XpSpendRecord, XpTransaction } from './progression';

function extractFirstSentence(text?: string): string | undefined {
  if (!text) return undefined;
  const match = text.match(/^[^.!?]*[.!?]/);
  return match ? match[0].trim() : undefined;
}

export function portraitPath(era: 'modern' | 'historical', clan: string, gender?: 'male' | 'female'): string {
  const base = clan.toLowerCase();
  if (gender) {
    return `/characters/portrait-${base}-${gender}-${era}.png`;
  }
  const folder = era === 'modern' ? 'modern' : 'medieval';
  return `/characters/${folder}/${base}.png`;
}
export type { SaveSlot, JournalEntry } from './saves';

// ── Image selection system ────────────────────────────────────────────────

import catalogueJson from '../../assets/image-catalogue.json';
import triggersJson from '../../assets/image-triggers.json';

export interface ImageEntry {
  id: string;
  file: string;
  title: string;
  description: string;
  context: string;
  mood: string[];
  themes: string[];
  use_cases: string[];
  avoid_when: string[];
  scene_types: string[];
  intensity: number;
}

const imageCatalogue = catalogueJson as ImageEntry[];
const imageTriggers = triggersJson as Record<string, string[]>;

const IMAGE_FALLBACK = '/backgrounds/rain_slicked_gothic_street.png';

// Layer 1b — hand-picked overrides keyed by sceneId.
// Use this when a scene needs a specific illustration that can't be expressed
// via scene.image in the content file (e.g. cross-chronicle shared scenes).
// Add entries as new chronicles grow; the system checks this before any
// automatic selection runs.
const NAMED_SCENES: Record<string, string> = {
  // 'example_scene_id': '/backgrounds/rain_slicked_gothic_street.png',
};

export interface SceneImageContext {
  sceneId: string;
  explicitImage?: string;  // scene.image — always wins (Layer 1a)
  hasCombat?: boolean;
  checkType?: string;      // scene.check?.type
  hunger?: number;         // character.hunger (>=4 triggers Beast imagery)
  intensity?: number;      // 1–5 scene intensity; inferred if omitted
  sceneType?: string;      // explicit trigger key, skips inference
}

function inferSceneType(ctx: SceneImageContext): string {
  if (ctx.sceneType) return ctx.sceneType;
  if (ctx.hasCombat) return 'combat_start';
  if (ctx.hunger !== undefined && ctx.hunger >= 4) return 'hunger_or_beast';
  if (ctx.checkType === 'social') return 'presence_or_social_power';
  if (ctx.checkType === 'mental') return 'investigation_or_secret';
  if (ctx.checkType === 'physical' || ctx.checkType === 'combat') return 'combat_start';
  return 'city_mood';
}

// Single entry point for all image selection. Returns a /backgrounds/ path.
export function getSceneImage(ctx: SceneImageContext): string {
  // Layer 1a: explicit scene.image on the Scene object
  if (ctx.explicitImage) return ctx.explicitImage;

  // Layer 1b: named scene override table
  const named = NAMED_SCENES[ctx.sceneId];
  if (named) return named;

  // Layer 2: trigger dictionary — map scene context to candidate image IDs
  const sceneType = inferSceneType(ctx);
  const triggerIds = imageTriggers[sceneType] ?? imageTriggers['city_mood'] ?? [];
  if (triggerIds.length === 0) return IMAGE_FALLBACK;

  // Layer 3: catalogue filtering — intensity within ±1, avoid mood clashes
  const intensity = ctx.intensity ?? 3;
  let pool = imageCatalogue.filter(img =>
    triggerIds.includes(img.id) &&
    Math.abs(img.intensity - intensity) <= 1
  );

  // Relax intensity constraint if nothing survived
  if (pool.length === 0) {
    pool = imageCatalogue.filter(img => triggerIds.includes(img.id));
  }

  // Random pick within filtered pool — intentional: same scene type shows
  // different illustrations on repeat playthroughs
  if (pool.length > 0) {
    return `/backgrounds/${pool[Math.floor(Math.random() * pool.length)].file}`;
  }

  // Layer 4: fallback — fits almost any scene without being wrong
  return IMAGE_FALLBACK;
}

// Preload all catalogue images on startup so transitions are instant.
export function preloadImages(): void {
  for (const entry of imageCatalogue) {
    const img = new Image();
    img.src = `/backgrounds/${entry.file}`;
  }
}

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
  downtimeAvailable?: boolean;
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
      if (prev.chronicle.endings[sceneId]) {
        Audio.setMood('ending');
        return { ...prev, sceneId, endingId: sceneId };
      }
      const scene = prev.chronicle.scenes[sceneId];
      if (!scene) return prev;
      const flags = applyFlags(prev.flags, scene.flags_set);
      const mood = MOOD_BY_ACT[scene.act] ?? 'exploration';
      Audio.setMood(mood);
      const journal = scene.title
        ? [{ entry: `Act ${scene.act} — ${scene.title}`, summary: extractFirstSentence(scene.narrative), time: Date.now() }, ...prev.journal]
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
      void Audio.diceRoll();
      const result = rollDice(
        scene.check.pool(prev.character),
        scene.check.hunger(prev.character),
      );
      const passed = difficultyCheck(result, scene.check.difficulty);
      if (result.bestialFailure) void Audio.bestialFailure();
      else if (passed) void Audio.success();
      else void Audio.failure();
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
      if (prev.chronicle.endings[nextId]) {
        Audio.setMood('ending');
        return { ...prev, sceneId: nextId, flags: prev.flags, journal: prev.journal, diceState: { phase: 'idle', check: null, result: null, passed: false }, endingId: nextId };
      }
      const scene = prev.chronicle.scenes[nextId];
      const flags = applyFlags(prev.flags, scene?.flags_set);
      const mood = MOOD_BY_ACT[scene?.act ?? 2] ?? 'tension';
      Audio.setMood(mood);
      const journal = scene?.title
        ? [{ entry: `Act ${scene.act} — ${scene.title}`, summary: extractFirstSentence(scene?.narrative), time: Date.now() }, ...prev.journal]
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
