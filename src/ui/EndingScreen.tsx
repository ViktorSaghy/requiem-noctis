import type { Ending } from '../engine';
import { Audio } from '../audio';
import { useEffect } from 'react';

const TYPE_LABELS: Record<string, string> = {
  dead_end:    'Dead End',
  bad_end:     'Bad End',
  good_end:    'Good End',
  perfect_end: 'Perfect End',
};

interface Props {
  ending: Ending;
  onPlayAgain: () => void;
}

export function EndingScreen({ ending, onPlayAgain }: Props) {
  useEffect(() => {
    Audio.setMood('ending');
    return () => void Audio.stopMood();
  }, []);

  return (
    <div className="ending-screen">
      {ending.image && (
        <div className="scene-illustration-wrap ending-illustration">
          <img src={ending.image} alt="" className="scene-illustration" />
        </div>
      )}
      <div className={`ending-type-badge ${ending.type}`}>
        {TYPE_LABELS[ending.type] ?? ending.type}
      </div>
      <h1 className="ending-title">{ending.title}</h1>
      <p className="ending-text">{ending.text}</p>
      <div className="ending-actions">
        <button className="btn btn-primary btn-full" onClick={onPlayAgain}>
          Play Again
        </button>
      </div>
    </div>
  );
}
