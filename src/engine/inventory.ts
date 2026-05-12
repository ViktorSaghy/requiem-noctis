// Inventory types and pure helpers — no React, no side effects.

export type ItemType = 'story' | 'equipment' | 'consumable' | 'evidence';
export type EquipSlot = 'weapon' | 'armor';

export interface ItemEffect {
  type:
    | 'attack_bonus'
    | 'defense_bonus'
    | 'damage_bonus'
    | 'damage_reduction'
    | 'hunger_reduce'
    | 'hp_restore'
    | 'roll_bonus';
  value: number;
  check_type?: string; // for roll_bonus: 'physical' | 'social' | 'mental' | 'combat'
}

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  description: string;
  tags: string[];
  stackable: boolean;
  quantity: number;
  effects?: ItemEffect[];
  icon?: string;
  equippable?: boolean;
  slot?: EquipSlot;
}

export interface EquippedSlots {
  weapon: string | null;
  armor: string | null;
}

export interface Inventory {
  items: Record<string, Item>;
  equipped: EquippedSlots;
}

export function emptyInventory(): Inventory {
  return { items: {}, equipped: { weapon: null, armor: null } };
}

export function addItem(inv: Inventory, item: Item): Inventory {
  const existing = inv.items[item.id];
  if (existing && existing.stackable) {
    return {
      ...inv,
      items: { ...inv.items, [item.id]: { ...existing, quantity: existing.quantity + item.quantity } },
    };
  }
  return { ...inv, items: { ...inv.items, [item.id]: item } };
}

export function removeItem(inv: Inventory, itemId: string, qty = 1): Inventory {
  const existing = inv.items[itemId];
  if (!existing) return inv;
  if (existing.stackable && existing.quantity > qty) {
    return {
      ...inv,
      items: { ...inv.items, [itemId]: { ...existing, quantity: existing.quantity - qty } },
    };
  }
  const newItems = { ...inv.items };
  delete newItems[itemId];
  const newEquipped = { ...inv.equipped };
  if (newEquipped.weapon === itemId) newEquipped.weapon = null;
  if (newEquipped.armor === itemId) newEquipped.armor = null;
  return { ...inv, items: newItems, equipped: newEquipped };
}

export function hasItem(inv: Inventory, idOrTag: string): boolean {
  if (inv.items[idOrTag]) return true;
  return Object.values(inv.items).some(item => item.tags.includes(idOrTag));
}

export function getItemByIdOrTag(inv: Inventory, idOrTag: string): Item | null {
  if (inv.items[idOrTag]) return inv.items[idOrTag];
  return Object.values(inv.items).find(item => item.tags.includes(idOrTag)) ?? null;
}

export function getEquipped(inv: Inventory, slot: EquipSlot): Item | null {
  const id = inv.equipped[slot];
  return id ? (inv.items[id] ?? null) : null;
}

export function equipItem(inv: Inventory, itemId: string): Inventory {
  const item = inv.items[itemId];
  if (!item?.equippable || !item.slot) return inv;
  return { ...inv, equipped: { ...inv.equipped, [item.slot]: itemId } };
}

export function unequipSlot(inv: Inventory, slot: EquipSlot): Inventory {
  return { ...inv, equipped: { ...inv.equipped, [slot]: null } };
}

export function getEquipBonus(inv: Inventory, slot: EquipSlot, effectType: ItemEffect['type']): number {
  const item = getEquipped(inv, slot);
  return item?.effects?.find(e => e.type === effectType)?.value ?? 0;
}

export function listConsumables(inv: Inventory): Item[] {
  return Object.values(inv.items).filter(i => i.type === 'consumable');
}

// Apply grants and consumes atomically, returning the updated inventory.
export function applyItemChanges(
  inv: Inventory,
  allItems: Record<string, Item>,
  grants?: string[],
  consumes?: string[],
): Inventory {
  let next = inv;
  for (const id of consumes ?? []) {
    next = removeItem(next, id, 1);
  }
  for (const id of grants ?? []) {
    const template = allItems[id];
    if (template) {
      next = addItem(next, { ...template, quantity: 1 });
    }
  }
  return next;
}
