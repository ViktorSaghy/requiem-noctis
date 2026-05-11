import { useT } from '../engine/i18n';

interface Props {
  onBack: () => void;
}

export function CreditsScreen({ onBack }: Props) {
  const t = useT();

  return (
    <div className="credits-screen">
      <div className="credits-header">
        <button className="btn btn-ghost btn-sm" onClick={onBack}>{t('back')}</button>
        <div className="credits-title">{t('credits.title')}</div>
      </div>

      <div className="credits-body">
        <div className="credits-content">
          <div className="credits-section">
            <div className="credits-role">{t('credits.role')}</div>
            <div className="credits-name">Viktor Sághy</div>
          </div>
        </div>
      </div>
    </div>
  );
}
