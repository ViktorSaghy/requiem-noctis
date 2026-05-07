import type { Chronicle } from '../engine';

interface Props {
  chronicles: Chronicle[];
  onSelect: (c: Chronicle) => void;
  onBack: () => void;
}

export function StorySelect({ chronicles, onSelect, onBack }: Props) {
  return (
    <div className="story-screen">
      <div className="story-header">
        <h2>Choose a Chronicle</h2>
        <p>Select your story — each is a complete VTM 5e scenario</p>
      </div>
      <div className="story-grid">
        {chronicles.map(c => (
          <div key={c.id} className="story-card" onClick={() => onSelect(c)}>
            <img
              src="/backgrounds/ash-cafe.png"
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
        <button className="btn btn-ghost" onClick={onBack}>← Back</button>
      </div>
    </div>
  );
}
