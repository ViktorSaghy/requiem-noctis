import { useState } from 'react';
import type { Character } from '../engine/character';
import { UPGRADE_CATALOG, getSuggestedUpgrades, canPurchase, purchase, getCategoryProgress, type Upgrade } from '../engine/progression';

interface Props {
  character: Character;
  onUpgrade: (updated: Character) => void;
  onClose: () => void;
}

type CategoryFilter = 'All' | 'Skills' | 'Disciplines' | 'Advantages';

export function UpgradeScreen({ character, onUpgrade, onClose }: Props) {
  const [showAll, setShowAll] = useState(false);
  const [confirmingUpgrade, setConfirmingUpgrade] = useState<Upgrade | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All');

  const suggested = getSuggestedUpgrades(character);
  const categoryProgress = getCategoryProgress(character);

  let visible = showAll ? UPGRADE_CATALOG : suggested;
  if (categoryFilter !== 'All') {
    visible = visible.filter(u => u.category === categoryFilter);
  }

  function handlePurchase(upgrade: Upgrade) {
    try {
      const updated = purchase(upgrade.id, character);
      if (updated.xpSpendLog) {
        updated.xpSpendLog.push({
          upgradeId: upgrade.id,
          amount: upgrade.cost,
          timestamp: new Date().toISOString(),
        });
      } else {
        updated.xpSpendLog = [{
          upgradeId: upgrade.id,
          amount: upgrade.cost,
          timestamp: new Date().toISOString(),
        }];
      }
      onUpgrade(updated);
      setConfirmingUpgrade(null);
    } catch (err) {
      console.error('Purchase failed:', err);
    }
  }

  return (
    <div className="upgrade-screen">
      <div className="upgrade-header">
        <h2>Downtime: Upgrades</h2>
        <button className="btn btn-ghost" onClick={onClose}>✕</button>
      </div>

      <div className="upgrade-xp-display">
        <span className="upgrade-xp-label">XP Available:</span>
        <span className="upgrade-xp-value">{character.xp ?? 0}</span>
      </div>

      {/* Progress bars */}
      <div className="upgrade-progress-section">
        <div className="upgrade-progress-label">Progression</div>
        {categoryProgress.map(p => (
          <div key={p.category} className="upgrade-progress-bar">
            <div className="progress-label">{p.category}: {p.spent}/{p.nextMilestone}</div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${p.percent}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Category tabs */}
      <div className="upgrade-category-tabs">
        {(['All', 'Skills', 'Disciplines', 'Advantages'] as const).map(cat => (
          <button
            key={cat}
            className={`upgrade-tab ${categoryFilter === cat ? 'active' : ''}`}
            onClick={() => setCategoryFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="upgrade-list">
        {visible.map(upgrade => {
          const purchase_check = canPurchase(upgrade.id, character);
          const isAffordable = purchase_check.ok;
          const isConfirming = confirmingUpgrade?.id === upgrade.id;

          return (
            <div
              key={upgrade.id}
              className={`upgrade-card ${isAffordable ? '' : 'disabled'} ${isConfirming ? 'confirming' : ''}`}
              role="button"
              tabIndex={isAffordable ? 0 : -1}
              onClick={() => isAffordable && setConfirmingUpgrade(upgrade)}
            >
              <div className="upgrade-card-header">
                <div className="upgrade-name">{upgrade.name}</div>
                <div className={`upgrade-cost ${isAffordable ? 'affordable' : 'unaffordable'}`}>
                  {upgrade.cost} XP
                </div>
              </div>
              <div className="upgrade-description">{upgrade.description}</div>
              
              {upgrade.tags && upgrade.tags.length > 0 && (
                <div className="upgrade-tags">
                  {upgrade.tags.map(tag => (
                    <span key={tag} className="upgrade-tag">{tag}</span>
                  ))}
                </div>
              )}
              
              <div className="upgrade-category">{upgrade.category}</div>

              {!isAffordable && (
                <div className="upgrade-reason">
                  {purchase_check.reason}
                </div>
              )}

              {isConfirming && (
                <div className="upgrade-confirm">
                  <button
                    className="btn btn-sm btn-cta"
                    onClick={e => {
                      e.stopPropagation();
                      handlePurchase(upgrade);
                    }}
                  >
                    Confirm Purchase
                  </button>
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={e => {
                      e.stopPropagation();
                      setConfirmingUpgrade(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!showAll && suggested.length < UPGRADE_CATALOG.length && (
        <button className="btn btn-ghost upgrade-see-all" onClick={() => setShowAll(true)}>
          See All Upgrades
        </button>
      )}
    </div>
  );
}
