import { useState, useRef } from 'react';
import type { Inventory, Item, ItemEffect, EquipSlot } from '../engine/inventory';
import { getEquipped, listConsumables } from '../engine/inventory';
import { useT } from '../engine/i18n';
import type { TranslationKey } from '../engine/i18n';
import './InventoryPanel.css';

// ── Effect label helpers ──────────────────────────────────────────────────────

function effectKey(type: ItemEffect['type']): TranslationKey {
  return `inventory.effect.${type}` as TranslationKey;
}

function EffectBadge({ effect, t }: { effect: ItemEffect; t: ReturnType<typeof useT> }) {
  return (
    <span className={`inv-effect-badge inv-effect-${effect.type}`}>
      {t(effectKey(effect.type), { n: effect.value })}
    </span>
  );
}

// ── Type badge ────────────────────────────────────────────────────────────────

function TypeBadge({ type, t }: { type: Item['type']; t: ReturnType<typeof useT> }) {
  return (
    <span className={`inv-type-badge inv-type-${type}`}>
      {t(`inventory.type.${type}` as TranslationKey)}
    </span>
  );
}

// ── Long-press tooltip hook ───────────────────────────────────────────────────

function useLongPress(onLongPress: () => void, delay = 350) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function start() {
    timerRef.current = setTimeout(onLongPress, delay);
  }
  function cancel() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  return {
    onMouseEnter: onLongPress,           // hover = instant on desktop
    onMouseLeave: cancel,
    onTouchStart: start,
    onTouchEnd: cancel,
    onTouchCancel: cancel,
  };
}

// ── Item card ─────────────────────────────────────────────────────────────────

function ItemCard({
  item,
  isEquipped,
  onEquip,
  onUnequip,
}: {
  item: Item;
  isEquipped: boolean;
  onEquip?: () => void;
  onUnequip?: () => void;
}) {
  const t = useT();
  const [expanded, setExpanded] = useState(false);
  const [tooltip, setTooltip] = useState(false);
  const lpHandlers = useLongPress(() => setTooltip(v => !v));

  return (
    <div
      className={`inv-item-card ${isEquipped ? 'inv-item-equipped' : ''}`}
      onClick={() => setExpanded(v => !v)}
      {...lpHandlers}
      role="button"
      aria-expanded={expanded}
    >
      <div className="inv-item-row">
        {item.icon && <span className="inv-item-icon">{item.icon}</span>}
        <div className="inv-item-info">
          <div className="inv-item-name">
            {item.name}
            {item.stackable && item.quantity > 1 && (
              <span className="inv-item-qty">{t('inventory.qty', { n: item.quantity })}</span>
            )}
            {isEquipped && (
              <span className="inv-equipped-badge">{t('inventory.equipped')}</span>
            )}
          </div>
          {item.effects && item.effects.length > 0 && (
            <div className="inv-effects-row">
              {item.effects.map((eff, i) => (
                <EffectBadge key={i} effect={eff} t={t} />
              ))}
            </div>
          )}
        </div>
        <TypeBadge type={item.type} t={t} />
      </div>

      {(expanded || tooltip) && (
        <div className="inv-item-detail">
          <p className="inv-item-desc">{item.description}</p>
          {item.tags.length > 0 && (
            <div className="inv-item-tags">
              {item.tags.map(tag => (
                <span key={tag} className="inv-tag">#{tag}</span>
              ))}
            </div>
          )}
          {item.equippable && (
            <div className="inv-item-actions">
              {isEquipped
                ? <button className="btn btn-sm" onClick={e => { e.stopPropagation(); onUnequip?.(); }}>
                    {t('inventory.unequip')}
                  </button>
                : <button className="btn btn-sm btn-gold" onClick={e => { e.stopPropagation(); onEquip?.(); }}>
                    {t('inventory.equip')}
                  </button>
              }
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Gear slot ─────────────────────────────────────────────────────────────────

function GearSlot({
  slot,
  item,
  onUnequip,
}: {
  slot: EquipSlot;
  item: Item | null;
  onUnequip: () => void;
}) {
  const t = useT();
  const slotLabel = t(`inventory.slot.${slot}` as TranslationKey);

  return (
    <div className="inv-gear-slot">
      <div className="inv-gear-label">{slotLabel}</div>
      {item ? (
        <div className="inv-gear-item">
          {item.icon && <span className="inv-item-icon">{item.icon}</span>}
          <span className="inv-gear-name">{item.name}</span>
          {item.effects?.map((eff, i) => <EffectBadge key={i} effect={eff} t={t} />)}
          <button className="btn btn-sm inv-gear-unequip" onClick={onUnequip}>{t('inventory.unequip')}</button>
        </div>
      ) : (
        <div className="inv-gear-empty">{t('inventory.slot.empty')}</div>
      )}
    </div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────

function Section({ title, items, equipped, onEquip, onUnequip }: {
  title: string;
  items: Item[];
  equipped: { weapon: string | null; armor: string | null };
  onEquip: (itemId: string) => void;
  onUnequip: (slot: EquipSlot) => void;
}) {
  if (items.length === 0) return null;

  return (
    <div className="inv-section">
      <div className="inv-section-label">{title}</div>
      {items.map(item => {
        const isEquipped = equipped.weapon === item.id || equipped.armor === item.id;
        const slot = item.slot as EquipSlot | undefined;
        return (
          <ItemCard
            key={item.id}
            item={item}
            isEquipped={isEquipped}
            onEquip={() => onEquip(item.id)}
            onUnequip={slot ? () => onUnequip(slot) : undefined}
          />
        );
      })}
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────

export interface InventoryPanelProps {
  inventory: Inventory;
  onEquip: (itemId: string) => void;
  onUnequip: (slot: EquipSlot) => void;
}

export function InventoryPanel({ inventory, onEquip, onUnequip }: InventoryPanelProps) {
  const t = useT();
  const items = Object.values(inventory.items);
  const { equipped } = inventory;

  const storyItems      = items.filter(i => i.type === 'story');
  const equipmentItems  = items.filter(i => i.type === 'equipment');
  const consumableItems = listConsumables(inventory);
  const evidenceItems   = items.filter(i => i.type === 'evidence');

  const weapon = getEquipped(inventory, 'weapon');
  const armor  = getEquipped(inventory, 'armor');
  const hasGear = weapon || armor || equipmentItems.length > 0;

  if (items.length === 0) {
    return (
      <div className="inv-empty">
        <div className="inv-empty-icon">🎒</div>
        <div className="inv-empty-title">{t('inventory.empty')}</div>
        <div className="inv-empty-sub">{t('inventory.empty.sub')}</div>
      </div>
    );
  }

  return (
    <div className="inv-panel">
      {hasGear && (
        <div className="inv-gear-row">
          <div className="inv-section-label">{t('inventory.gear')}</div>
          <GearSlot slot="weapon" item={weapon} onUnequip={() => onUnequip('weapon')} />
          <GearSlot slot="armor"  item={armor}  onUnequip={() => onUnequip('armor')}  />
        </div>
      )}

      <Section
        title={t('inventory.cat.equipment')}
        items={equipmentItems}
        equipped={equipped}
        onEquip={onEquip}
        onUnequip={onUnequip}
      />
      <Section
        title={t('inventory.cat.consumable')}
        items={consumableItems}
        equipped={equipped}
        onEquip={onEquip}
        onUnequip={onUnequip}
      />
      <Section
        title={t('inventory.cat.story')}
        items={storyItems}
        equipped={equipped}
        onEquip={onEquip}
        onUnequip={onUnequip}
      />
      <Section
        title={t('inventory.cat.evidence')}
        items={evidenceItems}
        equipped={equipped}
        onEquip={onEquip}
        onUnequip={onUnequip}
      />
    </div>
  );
}

// Re-export listConsumables for combat usage
export { listConsumables };
