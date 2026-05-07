// src/engine/dice.ts
// VTM5e Dice Engine

export interface DiceResult {
  normalRolls: number[];
  hungerRolls: number[];
  successes: number;
  messyCritical: boolean;
  bestialFailure: boolean;
  totalDice: number;
  hungerDice: number;
  description: string;
}

export function rollDice(poolSize: number, hungerDice: number = 0): DiceResult {
  const pool = Math.max(1, poolSize);
  const hunger = Math.min(hungerDice, pool);
  const normal = pool - hunger;

  const normalRolls: number[] = Array.from({ length: normal }, () => Math.ceil(Math.random() * 10));
  const hungerRolls: number[] = Array.from({ length: hunger }, () => Math.ceil(Math.random() * 10));

  const normalSuccesses = normalRolls.filter(r => r >= 6).length;
  const hungerSuccesses = hungerRolls.filter(r => r >= 6).length;

  const normalTens = normalRolls.filter(r => r === 10).length;
  const hungerTens = hungerRolls.filter(r => r === 10).length;
  const totalTens = normalTens + hungerTens;

  const critPairs = Math.floor(totalTens / 2);
  const baseSux = normalSuccesses + hungerSuccesses;
  const successes = baseSux + critPairs * 2;

  const messyCritical = critPairs > 0 && hungerTens > 0;
  const bestialFailure = successes === 0 && hungerRolls.some(r => r === 1);

  let description = '';
  if (bestialFailure) description = 'Bestial Failure — the Beast wins';
  else if (messyCritical) description = `Messy Critical — ${successes} successes, but at a cost`;
  else if (critPairs > 0) description = `Critical — ${successes} successes`;
  else if (successes >= 5) description = `Exceptional — ${successes} successes`;
  else if (successes > 0) description = `${successes} success${successes > 1 ? 'es' : ''}`;
  else description = 'Failure';

  return { normalRolls, hungerRolls, successes, messyCritical, bestialFailure, totalDice: pool, hungerDice: hunger, description };
}

export function difficultyCheck(result: DiceResult, difficulty: number = 1): boolean {
  return result.successes >= difficulty && !result.bestialFailure;
}

export function contestedRoll(pool1: number, hunger1: number, pool2: number, hunger2: number) {
  const r1 = rollDice(pool1, hunger1);
  const r2 = rollDice(pool2, hunger2);
  return {
    attacker: r1,
    defender: r2,
    attackerWins: r1.successes > r2.successes,
    tie: r1.successes === r2.successes,
  };
}
