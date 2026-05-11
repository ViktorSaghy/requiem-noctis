import { useEffect, useRef, useState } from 'react';
import { useT } from '../engine/i18n';

interface Props {
  xp: number;
  compact?: boolean;
}

export function XpHUD({ xp, compact = false }: Props) {
  const t = useT();
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
        title={t('xp.tooltip')}
        aria-label={`${xp} ${t('xp.unit')}`}
      >
        {xp} <span className="xp-badge-unit">{t('xp.unit')}</span>
      </span>
    );
  }

  return (
    <div
      className={`xp-hud${animating ? ' xp-hud--pulse' : ''}`}
      title={t('xp.tooltip')}
    >
      <span className="xp-hud-label">{t('xp.label')}</span>
      <span className="xp-hud-value">{xp}</span>
      <span className="xp-hud-unit">{t('xp.unit')}</span>
    </div>
  );
}
