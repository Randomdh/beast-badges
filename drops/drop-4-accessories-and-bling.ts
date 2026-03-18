/**
 * DROP 4: Accessories & Bling (10 badges)
 * Theme: "Show me what you're carrying"
 * Announce: "Gems, crowns, chains, and more. 10 accessory badges just dropped."
 *
 * New badges:
 * - Band Practice (uncommon) - Guitar, microphone, or boombox
 * - Bookworm (uncommon) - Book, Laptop, or Calculator
 * - Money Moves (uncommon) - Money Stacks, Gold Bars, or Money Bag
 * - Gem Collector (uncommon) - Any Gemstone
 * - Masked Beast (uncommon) - Any mask
 * - Sneakerhead (uncommon) - 5+ different footwear types across wallet
 * - Diamond Studded (rare) - Diamond gemstone
 * - Halo Effect (rare) - Halo headwear
 * - Crown Jewels (epic) - Crown headwear
 * - Gold Chain (epic) - Gold chain
 */

export const DROP_4_BADGES = [
  { id: "band_practice", name: "Band Practice", tier: "uncommon" as const, description: "Hold a beast with guitar, microphone, or boombox" },
  { id: "bookworm", name: "Bookworm", tier: "uncommon" as const, description: "Hold a beast with Book, Laptop, or Calculator" },
  { id: "money_moves", name: "Money Moves", tier: "uncommon" as const, description: "Hold a beast with Money Stacks, Gold Bars, or Money Bag" },
  { id: "gem_collector", name: "Gem Collector", tier: "uncommon" as const, description: "Hold a beast with any Gemstone" },
  { id: "masked_beast", name: "Masked Beast", tier: "uncommon" as const, description: "Hold a beast with a mask" },
  { id: "sneakerhead", name: "Sneakerhead", tier: "uncommon" as const, description: "Hold beasts with 5+ different footwear types" },
  { id: "diamond_studded", name: "Diamond Studded", tier: "rare" as const, description: "Hold a beast with Diamond gemstone" },
  { id: "halo_effect", name: "Halo Effect", tier: "rare" as const, description: "Hold a beast with Halo headwear" },
  { id: "crown_jewels", name: "Crown Jewels", tier: "epic" as const, description: "Hold a beast with Crown headwear" },
  { id: "gold_chain", name: "Gold Chain", tier: "epic" as const, description: "Hold a beast with Gold chain" },
];

// === TRAIT CHECKS (add to checkTokenBadges) ===
//
// // --- DROP 4: Accessories & Bling ---
// const headwear = traitMap.get("headwear") || "";
// const eyes = traitMap.get("eyes") || traitMap.get("eyewear") || "";
// const chain = traitMap.get("chain") || traitMap.get("necklace") || "";
// const gemstone = traitMap.get("gemstone") || "";
//
// // Band Practice
// if (["guitar", "microphone", "boombox", "mic"].some(m => accessory.includes(m))) earned.push("band_practice");
//
// // Bookworm
// if (["book", "laptop", "calculator"].some(b => accessory.includes(b))) earned.push("bookworm");
//
// // Money Moves
// if (["money", "gold bar", "gold bars", "money bag", "money stacks"].some(m => accessory.includes(m))) earned.push("money_moves");
//
// // Gem Collector
// if (gemstone) earned.push("gem_collector");
// if (gemstone.includes("diamond")) earned.push("diamond_studded");
//
// // Masked Beast
// if (["gas mask", "plague doctor", "hockey mask", "fume mask", "sabertooth", "phantom"].some(m =>
//   accessory.includes(m) || headwear.includes(m) || eyes.includes(m)
// )) earned.push("masked_beast");
//
// // Halo Effect
// if (headwear.includes("halo")) earned.push("halo_effect");
//
// // Crown Jewels
// if (headwear.includes("crown") && !headwear.includes("flower crown")) earned.push("crown_jewels");
//
// // Gold Chain
// if (chain.includes("gold")) earned.push("gold_chain");
//
// === WALLET-LEVEL CHECK (for sneakerhead, in precompute) ===
//
// // Sneakerhead: 5+ different footwear types
// const footwearTypes = new Set<string>();
// for (const tokenId of tokenIds) {
//   const traits = traitCache.get(tokenId);
//   const fw = traits?.find(t => t.trait_type.toLowerCase() === "footwear")?.value;
//   if (fw) footwearTypes.add(fw.toLowerCase());
// }
// if (footwearTypes.size >= 5) earnedBadgeIds.add("sneakerhead");
