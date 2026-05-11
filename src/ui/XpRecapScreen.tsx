import { useEffect, useRef, useState } from 'react';
import type { XpAwardRecord } from '../engine';
import { useT } from '../engine/i18n';
import type { TranslationKey } from '../engine/i18n';

interface Props {
  record: XpAwardRecord;
  characterName: string;
  endingTitle?: string;
  endingType?: string;
  totalXp: number;
  onContinue: () => void;
}

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
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };
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
  const t = useT();
  const animatedTotal = useCountUp(record.amount);
  const [showLines, setShowLines] = useState(false);
  const [showFooter, setShowFooter] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowLines(true), 600);
    const t2 = setTimeout(() => setShowFooter(true), 1100);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const endingTypeKey = endingType ? `ending.${endingType}` as TranslationKey : null;
  const endingLabel = endingTypeKey ? t(endingTypeKey) : null;

  return (
    <div className="xp-recap">
      <div className="xp-recap-inner">
        <div className="xp-recap-header">
          {endingLabel && endingType && (
            <div className={`xp-recap-ending-badge ending-badge--${endingType}`}>
              {endingLabel}
            </div>
          )}
          {endingTitle && <div className="xp-recap-ending-title">{endingTitle}</div>}
          <div className="xp-recap-eyebrow">{t('recap.endOfEpisode')}</div>
          <div className="xp-recap-char">{characterName}</div>
        </div>

        <div className="xp-recap-total-wrap">
          <div className="xp-recap-total-value">+{animatedTotal}</div>
          <div className="xp-recap-total-label">{t('recap.xpGained')}</div>
        </div>

        <div className={`xp-recap-lines${showLines ? ' xp-recap-lines--visible' : ''}`}>
          <div className="xp-recap-line">
            <div className="xp-recap-line-left">
              <div className="xp-recap-line-category">{t('recap.episodeComplete')}</div>
              <div className="xp-recap-line-reason">{t('recap.survived')}</div>
            </div>
            <div className="xp-recap-line-amount">+{record.baseAmount}</div>
          </div>
          {record.bonusAmount > 0 && record.bonusReason && (
            <div className="xp-recap-line xp-recap-line--bonus">
              <div className="xp-recap-line-left">
                <div className="xp-recap-line-category">{t('recap.bonusXp')}</div>
                <div className="xp-recap-line-reason">{record.bonusReason}</div>
              </div>
              <div className="xp-recap-line-amount">+{record.bonusAmount}</div>
            </div>
          )}
        </div>

        {showFooter && (
          <div className="xp-recap-balance">
            <span className="xp-recap-balance-label">{t('recap.totalUnspent')}</span>
            <span className="xp-recap-balance-value">{totalXp}</span>
          </div>
        )}

        <div className={`xp-recap-actions${showFooter ? ' xp-recap-actions--visible' : ''}`}>
          <button className="btn btn-primary btn-lg btn-full" onClick={onContinue}>
            {t('recap.enterDowntime')}
          </button>
          <p className="xp-recap-hint">
            {t('recap.hint')}
          </p>
        </div>
      </div>
    </div>
  );
}
