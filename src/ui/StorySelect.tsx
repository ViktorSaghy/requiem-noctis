import type { Chronicle } from '../engine';
import { useT } from '../engine/i18n';

interface Props {
  chronicles: Chronicle[];
  onSelect: (c: Chronicle) => void;
  onBack: () => void;
}

export function StorySelect({ chronicles, onSelect, onBack }: Props) {
  const t = useT();

  return (
    <div className="story-screen">
      <div className="story-header">
        <h2>{t('story.heading')}</h2>
        <p>{t('story.sub')}</p>
      </div>
      <div className="story-grid">
        {chronicles.map(c => (
          <div key={c.id} className="story-card" onClick={() => onSelect(c)}>
            <img
              src={c.cover_image ?? '/backgrounds/ash-cafe.png'}
              alt={c.title}
              className="story-card-thumb"
            />
            <div className="story-card-body">
              <div className="story-card-title">{c.title}</div>
              <div className="story-card-sub">{c.subtitle ?? c.setting}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="story-back">
        <button className="btn btn-ghost" onClick={onBack}>{t('back')}</button>
      </div>
    </div>
  );
}
