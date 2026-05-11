import { useEffect, useRef, useState } from 'react';
import type { XpAwardRecord } from '../engine';

interface Props {
  record: XpAwardRecord;
  characterName: string;
  endingTitle?: string;
  endingType?: string;
  totalXp: number; // character's total xp after award
  onContinue: () => void;
}

const ENDING_TYPE_LABELS: Record<string, string> = {
  dead_end: 'Dead End',
  bad_end: 'Bad End',
  good_end: 'Good End',
  perfect_end: 'Perfect End',
};

function useCountUp(target: number, duration = 900): number {
  const [value, setValue] = useState(0);
  const frameRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    startRef.current = null;
    const animate = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };
    // small delay so the screen renders before counting starts
    const t = setTimeout(() => {
      frameRef.current = requestAnimationFrame(animate);
    }, 300);
    return () => {
      clearTimeout(t);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration]);

  return value;
}

export function XpRecapScreen({ record, characterName, endingTitle, endingType, totalXp, onContinue }: Props) {
  const animatedTotal = useCountUp(record.amount);
  const [showLines, setShowLines] = useState(false);
  const [showFooter, setShowFooter] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowLines(true), 600);
    const t2 = setTimeout(() => setShowFooter(true), 1100);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const endingLabel = endingType ? ENDING_TYPE_LABELS[endingType] ?? endingType : null;

  return (
    <div className="xp-recap">
      <div className="xp-recap-inner">
        {/* Header */}
        <div className="xp-recap-header">
          {endingLabel && (
            <div className={`xp-recap-ending-badge ending-badge--${endingType}`}>
              {endingLabel}
            </div>
          )}
          {endingTitle && <div className="xp-recap-ending-title">{endingTitle}</div>}
          <div className="xp-recap-eyebrow">End of Episode</div>
          <div className="xp-recap-char">{characterName}</div>
        </div>

        {/* Animated total */}
        <div className="xp-recap-total-wrap">
          <div className="xp-recap-total-value">+{animatedTotal}</div>
          <div className="xp-recap-total-label">Experience Gained</div>
        </div>

        {/* Line items */}
        <div className={`xp-recap-lines${showLines ? ' xp-recap-lines--visible' : ''}`}>
          <div className="xp-recap-line">
            <div className="xp-recap-line-left">
              <div className="xp-recap-line-category">Episode Complete</div>
              <div className="xp-recap-line-reason">Survived to the end of the night</div>
            </div>
            <div className="xp-recap-line-amount">+{record.baseAmount}</div>
          </div>
          {record.bonusAmount > 0 && record.bonusReason && (
            <div className="xp-recap-line xp-recap-line--bonus">
              <div className="xp-recap-line-left">
                <div className="xp-recap-line-category">Bonus XP</div>
                <div className="xp-recap-line-reason">{record.bonusReason}</div>
              </div>
              <div className="xp-recap-line-amount">+{record.bonusAmount}</div>
            </div>
          )}
        </div>

        {/* Current total */}
        {showFooter && (
          <div className="xp-recap-balance">
            <span className="xp-recap-balance-label">Total Unspent XP</span>
            <span className="xp-recap-balance-value">{totalXp}</span>
          </div>
        )}

        {/* Actions */}
        <div className={`xp-recap-actions${showFooter ? ' xp-recap-actions--visible' : ''}`}>
          <button className="btn btn-primary btn-lg btn-full" onClick={onContinue}>
            Enter Downtime
          </button>
          <p className="xp-recap-hint">
            Spend your XP on skills, disciplines, and advantages
          </p>
        </div>
      </div>
    </div>
  );
}
