import { useEffect, useState } from 'react';
import type { DiceResult } from '../engine';

interface Props {
  result: DiceResult;
  phase: 'rolling' | 'revealed';
  difficulty: number;
  label: string;
  clanCompulsion?: string;
  onReveal: () => void;
  onConfirm: () => void;
}

function dieClass(value: number, isHunger: boolean, phase: 'rolling' | 'revealed'): string {
  const classes = ['die'];
  if (isHunger) classes.push('hunger');
  if (phase === 'rolling') { classes.push('rolling'); return classes.join(' '); }
  if (isHunger && value === 1) classes.push('bestial');
  else if (value === 10) classes.push('crit');
  else if (value >= 6) classes.push('success');
  return classes.join(' ');
}

function resultClass(result: DiceResult, difficulty: number): string {
  if (result.bestialFailure) return 'bestial';
  if (result.messyCritical) return 'messy';
  if (result.successes >= difficulty) return 'success';
  return 'failure';
}

function resultLabel(result: DiceResult, difficulty: number): string {
  if (result.bestialFailure) return 'Bestial Failure';
  if (result.messyCritical) return `Messy Critical — ${result.successes} successes`;
  if (result.successes >= difficulty) return `Success — ${result.successes} successes`;
  return `Failure — ${result.successes} successes`;
}

export function DiceOverlay({ result, phase, difficulty, label, clanCompulsion, onReveal, onConfirm }: Props) {
  const [displayValues, setDisplayValues] = useState<{ v: number; h: boolean }[]>([]);

  useEffect(() => {
    const all = [
      ...result.normalRolls.map(v => ({ v, h: false })),
      ...result.hungerRolls.map(v => ({ v, h: true })),
    ];
    setDisplayValues(all);
  }, [result]);

  useEffect(() => {
    if (phase !== 'rolling') return;
    const interval = setInterval(() => {
      setDisplayValues(prev =>
        prev.map(d => ({ ...d, v: Math.ceil(Math.random() * 10) }))
      );
    }, 80);
    const timer = setTimeout(() => { clearInterval(interval); onReveal(); }, 1400);
    return () => { clearInterval(interval); clearTimeout(timer); };
  }, [phase, onReveal]);

  return (
    <div className="dice-overlay">
      <div className="dice-overlay-title">{label}</div>
      <div className="dice-tray">
        {displayValues.map((d, i) => (
          <div key={i} className={dieClass(d.v, d.h, phase)}>
            {d.v}
          </div>
        ))}
      </div>
      {phase === 'revealed' && (
        <>
          <div className={`result-badge ${resultClass(result, difficulty)}`}>
            {resultLabel(result, difficulty)}
          </div>
          {clanCompulsion && result.messyCritical && (
            <div className="compulsion-overlay">
              <div className="compulsion-overlay-label">Compulsion Triggered</div>
              <div className="compulsion-overlay-text">{clanCompulsion}</div>
            </div>
          )}
          <button className="btn btn-primary btn-lg" onClick={onConfirm}>
            Continue
          </button>
        </>
      )}
      {phase === 'rolling' && (
        <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem', fontFamily: 'var(--display)', letterSpacing: '0.1em' }}>
          Rolling…
        </div>
      )}
    </div>
  );
}
