import { useState, useRef, useEffect } from 'react';
import type { Character } from '../engine/character';
import {
  UPGRADE_CATALOG, getSuggestedUpgrades, canPurchase, purchase,
  getCategoryProgress, buildTransactionLog, type Upgrade,
} from '../engine/progression';
import { XpHUD } from './XpHUD';

interface Props {
  character: Character;
  onDone: (updated: Character) => void; // called exactly once when player leaves downtime
}

type Tab = 'upgrades' | 'history';
type CategoryFilter = 'All' | 'Skills' | 'Disciplines' | 'Advantages';

function PurchasedBanner({ name, onDismiss }: { name: string; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className="upgrade-purchased-banner" role="status">
      <span className="upgrade-purchased-check">✓</span>
      <span className="upgrade-purchased-name">{name} purchased</span>
    </div>
  );
}

function UpgradesList({ character, onPurchase }: {
  character: Character;
  onPurchase: (upgraded: Character, upgradeName: string) => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const [confirmingUpgrade, setConfirmingUpgrade] = useState<Upgrade | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All');
  const confirmRef = useRef<HTMLDivElement | null>(null);

  const suggested = getSuggestedUpgrades(character);
  const categoryProgress = getCategoryProgress(character);

  let visible = showAll ? UPGRADE_CATALOG : suggested;
  if (categoryFilter !== 'All') {
    visible = visible.filter(u => u.category === categoryFilter);
  }

  function handlePurchase(upgrade: Upgrade) {
    try {
      const updated = purchase(upgrade.id, character);
      updated.xpSpendLog = [
        ...(updated.xpSpendLog ?? []),
        {
          upgradeId: upgrade.id,
          upgradeName: upgrade.name,
          category: upgrade.category,
          amount: upgrade.cost,
          timestamp: new Date().toISOString(),
        },
      ];
      onPurchase(updated, upgrade.name);
      setConfirmingUpgrade(null);
    } catch (err) {
      console.error('Purchase failed:', err);
    }
  }

  function handleCardClick(upgrade: Upgrade, isAffordable: boolean) {
    if (!isAffordable) return;
    setConfirmingUpgrade(prev => prev?.id === upgrade.id ? null : upgrade);
  }

  useEffect(() => {
    if (confirmingUpgrade && confirmRef.current) {
      confirmRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [confirmingUpgrade]);

  return (
    <>
      {/* Progress bars */}
      <div className="upgrade-progress-section">
        <div className="upgrade-progress-label">Progression</div>
        {categoryProgress.map(p => (
          <div key={p.category} className="upgrade-progress-bar">
            <div className="progress-label">
              <span>{p.category}</span>
              <span>{p.spent}/{p.nextMilestone}</span>
            </div>
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
            className={`upgrade-tab${categoryFilter === cat ? ' active' : ''}`}
            onClick={() => { setCategoryFilter(cat); setConfirmingUpgrade(null); }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="upgrade-list">
        {visible.length === 0 && (
          <div className="upgrade-empty">
            No upgrades available in this category.
          </div>
        )}
        {visible.map(upgrade => {
          const check = canPurchase(upgrade.id, character);
          const isAffordable = check.ok;
          const isConfirming = confirmingUpgrade?.id === upgrade.id;

          return (
            <div
              key={upgrade.id}
              ref={isConfirming ? confirmRef : undefined}
              className={`upgrade-card${isAffordable ? '' : ' disabled'}${isConfirming ? ' confirming' : ''}`}
              role="button"
              tabIndex={isAffordable ? 0 : -1}
              aria-expanded={isConfirming}
              onClick={() => handleCardClick(upgrade, isAffordable)}
              onKeyDown={e => e.key === 'Enter' && handleCardClick(upgrade, isAffordable)}
            >
              <div className="upgrade-card-header">
                <div className="upgrade-name">{upgrade.name}</div>
                <div className={`upgrade-cost${isAffordable ? ' affordable' : ' unaffordable'}`}>
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

              <div className="upgrade-card-footer">
                <span className="upgrade-category">{upgrade.category}</span>
                {!isAffordable && (
                  <span className="upgrade-reason">{check.reason}</span>
                )}
              </div>

              {isConfirming && (
                <div className="upgrade-confirm" onClick={e => e.stopPropagation()}>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => handlePurchase(upgrade)}
                  >
                    Confirm — {upgrade.cost} XP
                  </button>
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={() => setConfirmingUpgrade(null)}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!showAll && suggested.length < UPGRADE_CATALOG.length && categoryFilter === 'All' && (
        <button className="btn btn-ghost upgrade-see-all" onClick={() => setShowAll(true)}>
          Show All Upgrades
        </button>
      )}
    </>
  );
}

function XpLedger({ character }: { character: Character }) {
  const transactions = buildTransactionLog(character);

  if (transactions.length === 0) {
    return (
      <div className="ledger-empty">
        <div className="ledger-empty-icon">✦</div>
        <div>No XP history yet.</div>
        <div className="ledger-empty-sub">Complete episodes to begin your chronicle of growth.</div>
      </div>
    );
  }

  const totalEarned = transactions
    .filter(t => t.type === 'award')
    .reduce((s, t) => s + t.amount, 0);
  const totalSpent = transactions
    .filter(t => t.type === 'spend')
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div className="ledger">
      <div className="ledger-summary">
        <div className="ledger-summary-item">
          <span className="ledger-summary-label">Earned</span>
          <span className="ledger-summary-value ledger-earned">+{totalEarned}</span>
        </div>
        <div className="ledger-summary-divider" />
        <div className="ledger-summary-item">
          <span className="ledger-summary-label">Spent</span>
          <span className="ledger-summary-value ledger-spent">−{totalSpent}</span>
        </div>
        <div className="ledger-summary-divider" />
        <div className="ledger-summary-item">
          <span className="ledger-summary-label">Remaining</span>
          <span className="ledger-summary-value">{character.xp ?? 0}</span>
        </div>
      </div>

      <div className="ledger-list">
        {transactions.map(t => (
          <div key={t.id} className={`ledger-entry ledger-entry--${t.type}`}>
            <div className="ledger-entry-sign">
              {t.type === 'award' ? '+' : '−'}
            </div>
            <div className="ledger-entry-body">
              <div className="ledger-entry-reason">{t.reason}</div>
              <div className="ledger-entry-meta">
                <span className="ledger-entry-category">{t.category}</span>
                {t.source && (
                  <span className="ledger-entry-source">{t.source}</span>
                )}
              </div>
            </div>
            <div className="ledger-entry-amount">
              {t.type === 'award' ? '+' : '−'}{t.amount}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function UpgradeScreen({ character, onDone }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('upgrades');
  const [purchasedName, setPurchasedName] = useState<string | null>(null);
  const [currentChar, setCurrentChar] = useState(character);

  function handlePurchase(updated: Character, name: string) {
    setCurrentChar(updated);
    setPurchasedName(name);
    // Stay on the downtime screen — player can make multiple purchases
  }

  return (
    <div className="upgrade-screen">
      {/* Header */}
      <div className="upgrade-header">
        <div className="upgrade-header-left">
          <h2>Downtime</h2>
          <div className="upgrade-header-sub">Spend your time in reflection and study</div>
        </div>
        <div className="upgrade-header-right">
          <XpHUD xp={currentChar.xp ?? 0} />
          <button className="btn btn-ghost upgrade-close-btn" onClick={() => onDone(currentChar)} aria-label="Close">✕</button>
        </div>
      </div>

      {/* Purchase banner */}
      {purchasedName && (
        <PurchasedBanner name={purchasedName} onDismiss={() => setPurchasedName(null)} />
      )}

      {/* Tab strip */}
      <div className="upgrade-tab-strip">
        <button
          className={`upgrade-tab-btn${activeTab === 'upgrades' ? ' active' : ''}`}
          onClick={() => setActiveTab('upgrades')}
        >
          Upgrades
        </button>
        <button
          className={`upgrade-tab-btn${activeTab === 'history' ? ' active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          History
        </button>
      </div>

      {/* Content */}
      <div className="upgrade-content">
        {activeTab === 'upgrades' && (
          <UpgradesList character={currentChar} onPurchase={handlePurchase} />
        )}
        {activeTab === 'history' && (
          <XpLedger character={currentChar} />
        )}
      </div>
    </div>
  );
}
