interface Props {
  onBack: () => void;
}

export function CreditsScreen({ onBack }: Props) {
  return (
    <div className="credits-screen">
      <div className="credits-header">
        <button className="btn btn-ghost btn-sm" onClick={onBack}>← Back</button>
        <div className="credits-title">Credits</div>
      </div>

      <div className="credits-body">
        <div className="credits-content">
          <div className="credits-section">
            <div className="credits-role">Developed entirely:</div>
            <div className="credits-name">Viktor Sághy</div>
          </div>
        </div>
      </div>
    </div>
  );
}