import { useEffect, useRef, useState } from 'react';

interface Props {
  xp: number;
  compact?: boolean; // true = badge-only, false = label+value row
}

export function XpHUD({ xp, compact = false }: Props) {
  const prevXp = useRef(xp);
  const [animating, setAnimating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (xp !== prevXp.current) {
      setAnimating(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setAnimating(false), 1200);
      prevXp.current = xp;
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [xp]);

  if (compact) {
    return (
      <span
        className={`xp-badge${animating ? ' xp-badge--pulse' : ''}`}
        title="Experience earned through survival, ambition, conflict, and personal growth."
        aria-label={`${xp} XP`}
      >
        {xp} <span className="xp-badge-unit">XP</span>
      </span>
    );
  }

  return (
    <div
      className={`xp-hud${animating ? ' xp-hud--pulse' : ''}`}
      title="Experience earned through survival, ambition, conflict, and personal growth."
    >
      <span className="xp-hud-label">Experience</span>
      <span className="xp-hud-value">{xp}</span>
      <span className="xp-hud-unit">XP</span>
    </div>
  );
}
