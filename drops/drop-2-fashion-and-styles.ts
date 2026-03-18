/**
 * DROP 2: Fashion & Rare Styles (10 badges)
 * Theme: "The beasts got drip"
 * Announce: "10 new badges dropping Friday. Check your fit."
 *
 * New badges:
 * - Mech Head (common) - Robot balaclava
 * - Bull Run (common) - Bull balaclava
 * - Ink'd Up (common) - Any ink trait
 * - Suited Up (uncommon) - Suit Jacket + Suit Pants
 * - Trackstar (uncommon) - Tracksuit
 * - Road Beast (uncommon) - Biker Jacket + Boots
 * - Bare Bones (rare) - Bones DNA
 * - Pink Gang (epic) - 3+ pink traits
 * - Leopard Print (epic) - Leopard balaclava style
 * - Cowboy (legendary) - Cowboy Hat + Cowboy Boots
 */

// === BADGE DEFINITIONS (add to LAUNCH_BADGES array) ===

export const DROP_2_BADGES = [
  { id: "mech_head", name: "Mech Head", tier: "common" as const, description: "Hold a beast with Robot balaclava" },
  { id: "bull_run", name: "Bull Run", tier: "common" as const, description: "Hold a beast with Bull balaclava" },
  { id: "inkd_up", name: "Ink'd Up", tier: "common" as const, description: "Hold a beast with any Ink tattoo" },
  { id: "suited_up", name: "Suited Up", tier: "uncommon" as const, description: "Hold a beast with Suit Jacket + Suit Pants" },
  { id: "trackstar", name: "Trackstar", tier: "uncommon" as const, description: "Hold a beast wearing a Tracksuit" },
  { id: "road_beast", name: "Road Beast", tier: "uncommon" as const, description: "Hold a beast with Biker Jacket + Boots" },
  { id: "bare_bones", name: "Bare Bones", tier: "rare" as const, description: "Hold a Bones DNA beast" },
  { id: "pink_gang", name: "Pink Gang", tier: "epic" as const, description: "Hold a beast with 3+ pink traits" },
  { id: "leopard_print", name: "Leopard Print", tier: "epic" as const, description: "Hold a beast with Leopard balaclava style" },
  { id: "cowboy", name: "Cowboy", tier: "legendary" as const, description: "Hold a beast with Cowboy Hat + Cowboy Boots" },
];

// === TRAIT CHECKS (add inside checkTokenBadges function) ===
//
// Copy-paste these into the checkTokenBadges function in badges.ts:
//
// // --- DROP 2: Fashion & Rare Styles ---
// if (balaclava.includes("robot")) earned.push("mech_head");
// if (balaclava.includes("bull")) earned.push("bull_run");
//
// // Ink'd Up - any ink type (Thug/Tough/Wabori)
// const ink = traitMap.get("ink") || "";
// if (ink) earned.push("inkd_up");
//
// // Suited Up - Suit Jacket + Suit Pants
// if (top.includes("suit jacket") && bottom.includes("suit pants")) earned.push("suited_up");
//
// // Trackstar
// if (top.includes("tracksuit")) earned.push("trackstar");
//
// // Road Beast - Biker Jacket + Boots
// const footwear = traitMap.get("footwear") || traitMap.get("shoes") || "";
// if (top.includes("biker jacket") && footwear.includes("boots")) earned.push("road_beast");
//
// // Bare Bones
// if (dna.includes("bones")) earned.push("bare_bones");
//
// // Pink Gang - 3+ pink traits
// const pinkCount = allValues.filter((v: string) => ["pink", "magenta", "fuchsia", "rose"].some(p => v.includes(p))).length;
// if (pinkCount >= 3) earned.push("pink_gang");
//
// // Leopard Print balaclava style
// const balaclavaStyle = traitMap.get("balaclava style") || "";
// if (balaclavaStyle.includes("leopard")) earned.push("leopard_print");
//
// // Cowboy - Hat + Boots
// const headwear = traitMap.get("headwear") || "";
// if (headwear.includes("cowboy") && footwear.includes("cowboy")) earned.push("cowboy");
