// src/engine/saves.ts
// Save and load game state

import type { Character } from './character';
import type { Inventory } from './inventory';
import { emptyInventory } from './inventory';

export interface SaveSlot {
  slot: string;
  label: string;
  character: Character;
  sceneId: string;
  flags: Record<string, boolean>;
  journal: JournalEntry[];
  inventory?: Inventory;
  chronicleStartCharacter?: Character;
  chronicleStartInventory?: Inventory;
  savedAt: number;
}

export interface JournalEntry {
  entry: string;
  summary?: string;
  time: number;
}

export interface GameState {
  character: Character;
  sceneId: string;
  flags: Record<string, boolean>;
  journal: JournalEntry[];
  gmMode: 'classic' | 'ai';
  downtimeAvailable?: boolean;
  inventory?: Inventory;
  chronicleStartCharacter?: Character;
  chronicleStartInventory?: Inventory;
}

const STORAGE_PREFIX = 'requiem_noctis_';

export async function saveGame(
  state: GameState,
  slot: string = 'auto',
  label: string = ''
): Promise<boolean> {
  try {
    const saveData: SaveSlot = {
      slot,
      label: label || state.character.name || 'Unnamed',
      character: state.character,
      sceneId: state.sceneId,
      flags: state.flags,
      journal: state.journal,
      inventory: state.inventory,
      chronicleStartCharacter: state.chronicleStartCharacter,
      chronicleStartInventory: state.chronicleStartInventory,
      savedAt: Date.now(),
    };
    localStorage.setItem(
      `${STORAGE_PREFIX}save_${slot}`,
      JSON.stringify(saveData)
    );
    return true;
  } catch (e) {
    console.error('Save failed', e);
    return false;
  }
}

function migrateCharacter(char: Character): Character {
  return {
    ...char,
    superficialDmg: char.superficialDmg ?? 0,
    aggravatedDmg: char.aggravatedDmg ?? 0,
  };
}

export async function loadGame(slot: string = 'auto'): Promise<SaveSlot | null> {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}save_${slot}`);
    if (!raw) return null;
    const save: SaveSlot = JSON.parse(raw);
    return {
      ...save,
      character: migrateCharacter(save.character),
      inventory: save.inventory ?? emptyInventory(),
    };
  } catch (e) {
    return null;
  }
}

export async function listSaves(): Promise<Record<string, SaveSlot>> {
  const slots = ['auto', 'slot1', 'slot2', 'slot3'];
  const saves: Record<string, SaveSlot> = {};
  for (const slot of slots) {
    const save = await loadGame(slot);
    if (save) saves[slot] = save;
  }
  return saves;
}

export async function deleteSave(slot: string): Promise<void> {
  localStorage.removeItem(`${STORAGE_PREFIX}save_${slot}`);
}

export async function saveCharacter(character: Character): Promise<string> {
  const id = character.id || `char_${Date.now()}`;
  const chars = await loadSavedCharacters();
  chars[id] = { ...character, id, savedAt: Date.now() };
  localStorage.setItem(
    `${STORAGE_PREFIX}characters`,
    JSON.stringify(chars)
  );
  return id;
}

export async function loadSavedCharacters(): Promise<Record<string, Character>> {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}characters`);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}
