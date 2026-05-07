// src/engine/story.ts
// Story and scene type definitions

export type SceneType = 'narrative' | 'choice' | 'check' | 'combat' | 'resolution' | 'ending';
export type EndingType = 'dead_end' | 'bad_end' | 'good_end' | 'perfect_end';
export type CheckType = 'physical' | 'social' | 'mental' | 'discipline' | 'combat';

export interface DiceCheck {
  type: CheckType;
  label: string;
  pool_label: string;
  pool: (char: any) => number;
  hunger: (char: any) => number;
  difficulty: number;
  success_next: string;
  fail_next: string;
  success_text: string;
  fail_text: string;
  damage?: number;
}

export interface Choice {
  text: string;
  next: string;
  icon?: string;
  requires_discipline?: string;
  requires_flag?: string;
}

export interface EnemySpec {
  id: string;
  name: string;
  clan: string;
  generation: number;
  attackPool: number;
  defensePool: number;
  maxHealth: number;
  maxWillpower: number;
  hunger: number;
  damageType: 'superficial' | 'aggravated';
  baseDamage: number;
  disciplines: Record<string, number>;
  description: string;
  image?: string;
  regenPerRound?: number;
}

export interface CombatScenario {
  label: string;
  description: string;
  enemies: EnemySpec[];
  victory_next: string;
  defeat_next: string;
  flee_next?: string;
}

export interface Scene {
  act: number;
  title?: string;
  image?: string;
  narrative?: string;
  choices?: Choice[];
  check?: DiceCheck;
  combat?: CombatScenario;
  next?: string;
  flags_set?: string[];
  resolution?: boolean;
  ending?: string;
}

export interface Ending {
  type: EndingType;
  title: string;
  image?: string;
  text: string;
}

export interface NPC {
  clan: string;
  role: string;
  disposition: string;
  agenda: string;
  secrets: string[];
  hidden_stats?: {
    Strength: number;
    Dexterity: number;
    Stamina: number;
    Charisma: number;
    Manipulation: number;
    Composure: number;
    Intelligence: number;
    Wits: number;
    Resolve: number;
    health: number;
    willpower: number;
    hunger: number;
    disciplines: Record<string, number>;
    notes?: string;
  };
}

export interface Chronicle {
  id: string;
  title: string;
  subtitle?: string;
  setting: string;
  acts: Record<number, string>;
  npcs: Record<string, NPC>;
  endings: Record<string, Ending>;
  scenes: Record<string, Scene>;
}
