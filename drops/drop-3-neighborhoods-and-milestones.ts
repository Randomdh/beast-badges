/**
 * DROP 3: Neighborhoods & Collection Milestones (10 badges)
 * Theme: "How deep is your pack?"
 * Announce: "New badges recognize the collectors. How many hoods do you rep?"
 *
 * New badges:
 * - Wagmi Way (common) - Hold a WAGMI Way beast
 * - Pack Builder (common) - Hold 5 Genesis Beasts
 * - Local (common) - Hold 3+ beasts from same Beasthood
 * - Block Captain (uncommon) - Hold 5+ beasts from same Beasthood
 * - Skull Squad (uncommon) - Skull balaclava
 * - BitBeast Collector (common) - Hold 5 BitBeasts
 * - Dual Citizen (uncommon) - Hold 1 Genesis + 1 BitBeast
 * - City Explorer (rare) - Hold beasts from 10+ different Beasthoods
 * - Beast Hoard (rare) - Hold 20 Genesis Beasts
 * - Mayor (legendary) - Hold beasts from all 20 Beasthoods
 */

export const DROP_3_BADGES = [
  { id: "wagmi_way", name: "Wagmi Way", tier: "common" as const, description: "Hold a WAGMI Way beast" },
  { id: "pack_builder", name: "Pack Builder", tier: "common" as const, description: "Hold 5+ Genesis Beasts" },
  { id: "local", name: "Local", tier: "common" as const, description: "Hold 3+ beasts from the same Beasthood" },
  { id: "block_captain", name: "Block Captain", tier: "uncommon" as const, description: "Hold 5+ beasts from the same Beasthood" },
  { id: "skull_squad", name: "Skull Squad", tier: "uncommon" as const, description: "Hold a beast with Skull balaclava" },
  { id: "bitbeast_collector", name: "BitBeast Collector", tier: "common" as const, description: "Hold 5+ BitBeasts" },
  { id: "dual_citizen", name: "Dual Citizen", tier: "uncommon" as const, description: "Hold 1 Genesis + 1 BitBeast" },
  { id: "city_explorer", name: "City Explorer", tier: "rare" as const, description: "Hold beasts from 10+ different Beasthoods" },
  { id: "beast_hoard", name: "Beast Hoard", tier: "rare" as const, description: "Hold 20+ Genesis Beasts" },
  { id: "mayor", name: "Mayor", tier: "legendary" as const, description: "Hold beasts from all 20 Beasthoods" },
];

// === TRAIT CHECKS (token-level, add to checkTokenBadges) ===
//
// // --- DROP 3: Neighborhoods ---
// const beasthood = traitMap.get("beasthood") || "";
// if (beasthood.toLowerCase().includes("wagmi")) earned.push("wagmi_way");
// if (balaclava.includes("skull")) earned.push("skull_squad");
//
// === WALLET-LEVEL CHECKS (add to precompute-badges.ts holder processing) ===
//
// These need the full wallet's token list, not just one token:
//
// // Pack Builder: 5+ Genesis
// if (holderCount >= 5) earnedBadgeIds.add("pack_builder");
//
// // Beast Hoard: 20+ Genesis
// if (holderCount >= 20) earnedBadgeIds.add("beast_hoard");
//
// // BitBeast Collector: 5+ BitBeasts
// if (bitBeastCount >= 5) earnedBadgeIds.add("bitbeast_collector");
//
// // Dual Citizen: 1 Genesis + 1 BitBeast
// if (holderCount >= 1 && bitBeastCount >= 1) earnedBadgeIds.add("dual_citizen");
//
// // Neighborhood badges need all tokens' beasthood traits:
// // Collect beasthoods from all tokens, then:
// const beasthoods = new Set<string>();
// for (const tokenId of tokenIds) {
//   const traits = traitCache.get(tokenId);
//   const bh = traits?.find(t => t.trait_type === "Beasthood")?.value;
//   if (bh) beasthoods.add(bh.toLowerCase());
// }
//
// // Local: 3+ from same beasthood
// const bhCounts: Record<string, number> = {};
// for (const tokenId of tokenIds) {
//   const traits = traitCache.get(tokenId);
//   const bh = traits?.find(t => t.trait_type === "Beasthood")?.value?.toLowerCase();
//   if (bh) bhCounts[bh] = (bhCounts[bh] || 0) + 1;
// }
// if (Object.values(bhCounts).some(c => c >= 3)) earnedBadgeIds.add("local");
// if (Object.values(bhCounts).some(c => c >= 5)) earnedBadgeIds.add("block_captain");
//
// // City Explorer: 10+ different beasthoods
// if (beasthoods.size >= 10) earnedBadgeIds.add("city_explorer");
//
// // Mayor: all 20 beasthoods
// if (beasthoods.size >= 20) earnedBadgeIds.add("mayor");
