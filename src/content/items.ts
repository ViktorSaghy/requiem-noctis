// Starter item catalog — data-driven definitions referenced by id in scene/choice fields.
// Chronicle authors use these ids in grants_items / consumes_items / requires_item.

import type { Item } from '../engine/inventory';

// ── Story items ───────────────────────────────────────────────────────────────

const letterOfIntroduction: Item = {
  id: 'letter_of_introduction',
  name: 'Letter of Introduction',
  type: 'story',
  description:
    'A sealed letter bearing your sire\'s sigil. Opens certain doors in Kindred society — doors that stay closed to the unsponsored.',
  tags: ['letter', 'social', 'kindred'],
  icon: '📜',
  stackable: false,
  quantity: 1,
};

const brassKey: Item = {
  id: 'brass_key',
  name: 'Brass Key',
  type: 'story',
  description:
    'A heavy brass key engraved with an unfamiliar crest. Its lock is somewhere in the city.',
  tags: ['key'],
  icon: '🗝️',
  stackable: false,
  quantity: 1,
};

const burnerPhone: Item = {
  id: 'burner_phone',
  name: 'Burner Phone',
  type: 'story',
  description:
    'Pre-paid, unregistered, untraceable. Three contacts saved under initials only. Useful for arrangements that need to stay off the books.',
  tags: ['phone', 'communication', 'mortal'],
  icon: '📱',
  stackable: false,
  quantity: 1,
};

const forgedPass: Item = {
  id: 'forged_pass',
  name: 'Forged Press Pass',
  type: 'story',
  description:
    'A convincing press credential for the Vienna Tribune — good enough to bluff past building security or demand answers from nervous officials.',
  tags: ['document', 'disguise', 'social'],
  icon: '🪪',
  stackable: false,
  quantity: 1,
};

// ── Evidence items ────────────────────────────────────────────────────────────

const kesslerDossier: Item = {
  id: 'kessler_dossier',
  name: 'Kessler Dossier',
  type: 'evidence',
  description:
    'Handwritten ledgers and photographs detailing Kessler\'s financial crimes and mortal contacts. Leverage — or a death warrant, if the wrong people find you with it.',
  tags: ['evidence', 'document', 'kessler', 'leverage'],
  icon: '📁',
  stackable: false,
  quantity: 1,
};

const masqueradePhoto: Item = {
  id: 'masquerade_photo',
  name: 'Masquerade Breach Photo',
  type: 'evidence',
  description:
    'A grainy photograph of a Kindred feeding in public view. Extraordinarily dangerous — the Camarilla would pay dearly to destroy it, and so would others to use it.',
  tags: ['evidence', 'photo', 'masquerade', 'dangerous'],
  icon: '📷',
  stackable: false,
  quantity: 1,
};

const encryptedDrive: Item = {
  id: 'encrypted_drive',
  name: 'Encrypted Drive',
  type: 'evidence',
  description:
    'A thumb drive sealed behind military-grade encryption. Whatever\'s on it, someone killed to keep it hidden.',
  tags: ['evidence', 'data', 'leverage'],
  icon: '💾',
  stackable: false,
  quantity: 1,
};

// ── Equipment items ───────────────────────────────────────────────────────────

const knuckleDuster: Item = {
  id: 'knuckle_duster',
  name: 'Knuckle Duster',
  type: 'equipment',
  description:
    'Iron knuckles, cold and weighted. Not elegant — but a punch from these cracks bone and sends a message.',
  tags: ['weapon', 'melee', 'concealable', 'brawl'],
  icon: '🥊',
  stackable: false,
  quantity: 1,
  equippable: true,
  slot: 'weapon',
  effects: [
    { type: 'attack_bonus', value: 1 },
    { type: 'damage_bonus', value: 0 },
  ],
};

const baseballBat: Item = {
  id: 'baseball_bat',
  name: 'Baseball Bat',
  type: 'equipment',
  description:
    'An aluminum bat, grip wrapped in electrical tape. Slow to draw, but when it connects the impact is devastating.',
  tags: ['weapon', 'melee', 'blunt', 'heavy'],
  icon: '🏏',
  stackable: false,
  quantity: 1,
  equippable: true,
  slot: 'weapon',
  effects: [
    { type: 'attack_bonus', value: 0 },
    { type: 'damage_bonus', value: 2 },
  ],
};

const switchblade: Item = {
  id: 'switchblade',
  name: 'Switchblade',
  type: 'equipment',
  description:
    'A spring-loaded folding blade — fits in a jacket pocket and opens in a flick. Favored by those who keep their weapons out of sight.',
  tags: ['weapon', 'melee', 'concealable', 'blade'],
  icon: '🗡️',
  stackable: false,
  quantity: 1,
  equippable: true,
  slot: 'weapon',
  effects: [
    { type: 'attack_bonus', value: 1 },
    { type: 'damage_bonus', value: 1 },
  ],
};

const pistol9mm: Item = {
  id: 'pistol_9mm',
  name: '9mm Pistol',
  type: 'equipment',
  description:
    'A compact semi-automatic loaded with hollow points. Lighter than a revolver, faster on the draw — and still lethal at close range.',
  tags: ['weapon', 'ranged', 'firearm', 'lethal'],
  icon: '🔫',
  stackable: false,
  quantity: 1,
  equippable: true,
  slot: 'weapon',
  effects: [
    { type: 'attack_bonus', value: 2 },
    { type: 'damage_bonus', value: 1 },
  ],
};

const huntingKnife: Item = {
  id: 'hunting_knife',
  name: 'Hunting Knife',
  type: 'equipment',
  description:
    'A 6-inch fixed-blade with a leather-wrapped handle. Concealable, reliable, and brutally effective at close range.',
  tags: ['weapon', 'melee', 'concealable', 'blade'],
  icon: '🔪',
  stackable: false,
  quantity: 1,
  equippable: true,
  slot: 'weapon',
  effects: [
    { type: 'attack_bonus', value: 1 },
    { type: 'damage_bonus', value: 1 },
  ],
};

const woodenStake: Item = {
  id: 'wooden_stake',
  name: 'Wooden Stake',
  type: 'equipment',
  description:
    'A sharpened hardwood stake — the oldest anti-Kindred weapon. Useless against mortals, but a Kindred struck through the heart enters immediate torpor.',
  tags: ['weapon', 'stake', 'anti-vampire', 'melee'],
  icon: '🪵',
  stackable: false,
  quantity: 1,
  equippable: true,
  slot: 'weapon',
  effects: [
    { type: 'attack_bonus', value: 0 },
    { type: 'damage_bonus', value: 2 },
  ],
};

const revolver: Item = {
  id: 'revolver',
  name: '.38 Revolver',
  type: 'equipment',
  description:
    'A worn but well-maintained six-shooter. Loud and conspicuous, but the stopping power is real. Five rounds in the cylinder.',
  tags: ['weapon', 'ranged', 'firearm', 'lethal'],
  icon: '🔫',
  stackable: false,
  quantity: 1,
  equippable: true,
  slot: 'weapon',
  effects: [
    { type: 'attack_bonus', value: 2 },
    { type: 'damage_bonus', value: 2 },
  ],
};

const leatherJacket: Item = {
  id: 'leather_jacket',
  name: 'Leather Jacket',
  type: 'equipment',
  description:
    'Thick cowhide worn soft by years of use. Not armor — but it turns away a glancing blade and absorbs some impact. Fits in on the street.',
  tags: ['armor', 'concealable', 'mundane'],
  icon: '🧥',
  stackable: false,
  quantity: 1,
  equippable: true,
  slot: 'armor',
  effects: [{ type: 'damage_reduction', value: 1 }],
};

// ── Consumable items ──────────────────────────────────────────────────────────

const bloodBag: Item = {
  id: 'blood_bag',
  name: 'Blood Bag',
  type: 'consumable',
  description:
    'A hospital-grade unit of blood, still cold. Not as satisfying as the vein, but it quiets the Beast. Reduces Hunger by 1.',
  tags: ['blood', 'feeding', 'medical'],
  icon: '🩸',
  stackable: true,
  quantity: 1,
  effects: [{ type: 'hunger_reduce', value: 1 }],
};

const premiumBloodPack: Item = {
  id: 'premium_blood_pack',
  name: 'Premium Blood Pack',
  type: 'consumable',
  description:
    'A rare high-quality vitae, carefully stored and potent. Reduces Hunger by 2. The source is best not asked about.',
  tags: ['blood', 'feeding', 'premium'],
  icon: '🫀',
  stackable: true,
  quantity: 1,
  effects: [{ type: 'hunger_reduce', value: 2 }],
};

const firstAidKit: Item = {
  id: 'first_aid_kit',
  name: 'First Aid Kit',
  type: 'consumable',
  description:
    'Bandages, antiseptic, and a tourniquet. Enough to patch a wound and keep moving. Restores 1 HP.',
  tags: ['medical', 'healing', 'mortal'],
  icon: '🩺',
  stackable: true,
  quantity: 1,
  effects: [{ type: 'hp_restore', value: 1 }],
};

// ── Catalog export ────────────────────────────────────────────────────────────

export const ITEM_CATALOG: Record<string, Item> = {
  [letterOfIntroduction.id]: letterOfIntroduction,
  [brassKey.id]:             brassKey,
  [burnerPhone.id]:          burnerPhone,
  [forgedPass.id]:           forgedPass,
  [kesslerDossier.id]:       kesslerDossier,
  [masqueradePhoto.id]:      masqueradePhoto,
  [encryptedDrive.id]:       encryptedDrive,
  [knuckleDuster.id]:        knuckleDuster,
  [baseballBat.id]:          baseballBat,
  [switchblade.id]:          switchblade,
  [pistol9mm.id]:            pistol9mm,
  [huntingKnife.id]:         huntingKnife,
  [woodenStake.id]:          woodenStake,
  [revolver.id]:             revolver,
  [leatherJacket.id]:        leatherJacket,
  [bloodBag.id]:             bloodBag,
  [premiumBloodPack.id]:     premiumBloodPack,
  [firstAidKit.id]:          firstAidKit,
};

// Weapon IDs available during character creation loadout (player picks 2).
export const STARTER_WEAPON_IDS: string[] = [
  knuckleDuster.id,
  baseballBat.id,
  switchblade.id,
  huntingKnife.id,
  woodenStake.id,
  pistol9mm.id,
  revolver.id,
];

// Items every new character receives automatically.
export const FIXED_STARTER_ITEM_IDS: string[] = [
  bloodBag.id,
  burnerPhone.id,
];
