# Beast Badges — Critical Analysis

Validated against real data from trait-cache.json (10K tokens), grail-scores.json (1,793 traits), token-scores.json (10K tokens), and sales-cache.json (38K sales).

---

## 1. Badges That Are Impossible to Earn

These badges specify trait combinations that **zero tokens** in the collection have. They literally cannot be earned by anyone.

| Badge | Why It's Impossible | Fix |
|---|---|---|
| **Beast Chef** | Chef Hat (16 tokens) and Chefs Uniform (40 tokens) never appear on the same beast | Change to "hold a beast with Chef Hat OR Chefs Uniform" |
| **Surf's Up** | Surfboard (18 tokens) and Slides (81 tokens) never co-occur. All Surfboard tokens have Boots | Change to "hold a beast with Surfboard" (simple) |
| **Beast in Shining Armor** | Only 4 Spartan Helmets exist. None have weapon accessories | Kill this badge |
| **Bling King** | Max bling items on any single token = 2. Badge requires 3+ | Lower to 2+ bling items (3 tokens qualify) or kill |
| **Stacked** | Gold Chain + Gemstone + Crown never co-occur on any token | Kill this badge |
| **Street Cred** | Durag + Hoodie + High-Top Sneakers: 0 tokens have all three | Change to any 2 of 3, or kill |

**Root cause**: The proposal assumed traits combine freely. They don't. The collection's trait generation has constraints that prevent certain combinations. Multi-trait combo badges need to be validated against actual data before being proposed.

---

## 2. Wrong Supply Numbers

| Badge | Claimed | Actual | Impact |
|---|---|---|---|
| **Clown World** | "~40 exist" / Rare tier | 382 tokens (3.8%) | Should be Common or Uncommon, not Rare |
| **Psychedelic Trip** | "~30 exist" | 10 tokens (0.1%) | Rarer than stated — could be Epic |
| **Diamond Studded** | "~35 exist" | 55 tokens (0.55%) | Slightly more common than claimed |
| **Vitiligo** | "~250 exist" | 48 tokens (0.48%) | 5x rarer than claimed |

**Root cause**: Numbers were estimated from memory or general knowledge instead of queried from trait-cache.json.

---

## 3. Non-Existent or Misnamed Traits

| Badge | Issue | Fix |
|---|---|---|
| **Burger Beast** | Called "Hamburger" — actual trait name is "Burger" | Rename to "Burger" |
| **Vitiligo** | Trait key is "Human" not "Skin" — value "Vitiligo" does exist (48 tokens) | Fix the trait key reference, update count |

---

## 4. Badges That Are Nearly Impossible

These technically have qualifying tokens, but so few that the badge is functionally impossible for most holders.

| Badge | Qualifying Tokens | Problem |
|---|---|---|
| **Cowboy** (Hat + Boots) | 2 tokens | Only 2 beasts in the entire collection. Unless you own one, badge is impossible |
| **Lab Rat** (Lab Coat + Pixel/3D Glasses) | 2 tokens | Same problem |
| **Ninja Beast** (Nunchaku + dark traits) | Unvalidated | Likely very few — Nunchaku is 39 tokens, dark trait overlap unknown |

**These aren't necessarily wrong** — a badge that only 2 wallets can ever earn could be intentionally exclusive. But it should be labeled Epic or Legendary, not Uncommon/Rare.

---

## 5. Gaming Vectors & Loopholes

### 5a. The Snapshot Problem

Badge criteria check what you hold **right now**, but badges are **permanent**. This creates a loophole:

1. Buy all 4 premium balaclavas → earn "Face Collector" (Legendary, 500+ XP)
2. Sell 3 of them the next day
3. Keep the badge forever

**This undermines the entire "proof" narrative.** The badge says "this wallet holds all 4 premium balaclavas" but the wallet actually holds 1.

**Possible fixes:**
- Accept it. Most achievement systems work this way (Xbox achievements don't un-earn). The badge proves you *did* the thing, not that you *still do* it.
- Periodic re-verification with badge revocation (burns the NFT). More complex, potentially upsetting for holders.
- Split into "earned" and "active" badges. Active badges require ongoing criteria. More complex UI.

**Recommendation**: Accept it. Frame badges as "you achieved this" not "you currently have this." The community will self-police — if someone brags about Face Collector but only holds 1 balaclava, other holders will notice.

### 5b. Wash Trading for Market Badges

- **Floor Sweeper / Sweep King**: Someone could list their own beasts at floor and buy them back with a second wallet. Each "buy" counts as a floor purchase.
- **Good Flip**: Buy from yourself at low price, sell to yourself at high price. Profit is fake but recorded in sales-cache.
- **Whale Trade**: Same — sell to yourself above 1 ETH.

**Mitigation**: Sales-cache records buyer/seller addresses. Filter out transactions where buyer and seller are the same address, or where the same token has been traded between the same wallets multiple times. Won't catch sophisticated wash trading (multiple intermediary wallets) but stops the obvious cases.

**Recommendation**: Add a wash-trade filter (same buyer/seller within 7 days, or circular trades). Accept that sophisticated wash trading can't be fully prevented — the gas cost is a natural deterrent for badges that don't have monetary value.

### 5c. Multi-Wallet Problem

Holders often use multiple wallets. Someone might hold Genesis on wallet A and BitBeast on wallet B. They'd never earn "Dual Citizen" despite being a dual holder.

**This is unsolvable on-chain** without wallet linking. Options:
- Accept it — badge system only sees individual wallets
- Add optional wallet linking via the AKCB portal (sign messages from multiple wallets to prove ownership)
- Use Snag/portal's existing wallet connection if it supports multi-wallet

**Recommendation**: Note this as a known limitation. Add wallet linking in Phase 2 if the portal supports it.

### 5d. "Diamond Hands" Gaming

The badge checks that a wallet has held for 6+ months with no sales. But:
- Transfer to another wallet doesn't count as a "sale" in sales-cache (only marketplace sales are recorded)
- Someone could transfer beasts to a fresh wallet, wait 6 months, and earn Diamond Hands on a wallet that never bought anything

**Mitigation**: Check both sales-cache AND on-chain transfer events. If the wallet received beasts via transfer (not marketplace buy), the hold clock shouldn't start.

**Recommendation**: Note the limitation. Accept that transfer-based gaming is low-incentive (who waits 6 months to game a badge?).

### 5e. "Comeback Kid" is Unverifiable

"Sold all beasts, then came back and bought again." How do you prove:
- The wallet specifically sold ALL beasts (vs transferred some)
- The repurchase was motivated by "coming back" vs just a new buy

**Recommendation**: Kill this badge. It's a narrative, not a verifiable criterion.

### 5f. Admin Attestation Badges Have No On-Chain Proof

Community badges (Beast Creator, Beast Mode, GM Beast, etc.) rely on admin saying "yes, this person qualifies." This is:
- Subjective — who decides "consistently active"?
- Centralizes power — admins become badge gatekeepers
- Not verifiable — anyone can claim admin favoritism

**Mitigation**: Clear, published criteria. "GM Beast = posted GM in #general for 30+ consecutive days" is verifiable from Discord logs. "Beast Creator = created content" is not.

**Recommendation**: Keep admin attestation badges but make criteria as objective and verifiable as possible. The subjective ones (Baddie Beast, Beast Mode) should be reframed or cut.

---

## 6. Data Gaps

| Badge | Missing Data | Status |
|---|---|---|
| **Floor Sweeper / Sweep King / Sweep Legend** | Historical floor price not persisted. Can't verify "bought at floor" retroactively | Can only badge going forward, not historically |
| **Bid Warrior** | Bid data not tracked in sales-cache. Only completed sales | Badge is infeasible — kill it |
| **Drip Lord** (composite >= 90 AND vibe >= 70) | vibeScore not in current token-scores.json | Needs data regeneration (run grailAnalysis.ts) |
| **Grail Hunter** | Only 14 traits have grailScore >= 55. How many TOKENS have at least one such trait? | Likely more tokens qualify than traits, but needs validation |
| **Centennial** (owned 100+ total) | Requires lifetime purchase history across all wallets | sales-cache tracks buys but can't link wallets |

---

## 7. Tier Calibration Issues

| Badge | Current Tier | Problem | Suggested Tier |
|---|---|---|---|
| **Clown World** | Rare | 382 tokens = 3.8% of collection. That's not rare | Common |
| **Cowboy** | Uncommon | Only 2 qualifying tokens in existence | Epic or Legendary |
| **Lab Rat** | Uncommon | Only 2 qualifying tokens | Epic or Legendary |
| **Psychedelic Trip** | Rare | Only 10 tokens = 0.1%. Rarer than most Epics | Epic |
| **Vitiligo** | Uncommon | 48 tokens = 0.48%. Rarer than stated | Rare |
| **Suited & Booted** | Uncommon | 19 tokens. That's Rare territory | Rare |
| **Skater** | Uncommon | 24 tokens. Borderline Rare | Keep Uncommon (close enough) |
| **compositeScore >= 90** | Used for Drip Lord (Rare) | 1,005 tokens = 10% of collection. Not rare at all | Uncommon at best |

---

## 8. Positioning / Trust Issues

### The "I Can Build It" Problem

The current proposal says "I can build the smart contract, eligibility engine, API, Discord command, admin tools." From the team's perspective:

**Security concerns:**
- The minter wallet has authority to mint badges to any wallet. Who controls that key?
- The contract owner can add/remove minters. If an outsider deploys, they control the contract.
- The eligibility engine decides who qualifies. If it's wrong or manipulated, badges go to the wrong people.
- Admin attestation tool gives power to mark people as qualified. Who controls access?

**Trust concerns:**
- The team doesn't know your code quality, security practices, or reliability
- If you disappear, who maintains the system?
- If there's a bug that mints wrong badges, who's liable?
- The contract is immutable once deployed — mistakes are permanent

**Recommended reframing:**
Instead of "I'll build it, you just do art," position as:
- "Here's the complete system design. I've prototyped it and can demonstrate it working."
- "The team deploys the contract and controls all keys."
- "I can contribute code as open-source. The team reviews, audits, and deploys."
- "All admin access stays with the team. I have no privileged access."

This makes it a **gift to the ecosystem** rather than a **power grab**. The team gets a fully designed system they control entirely.

---

## 9. Structural Issues

### Too Many Badges at Launch Dilutes Impact

100+ badges across 11 categories is overwhelming. If a holder connects and immediately earns 15 badges, none of them feel special. The "I need 2 more for Face Collector" motivation only works if the total badge count is small enough to feel completable.

**Recommendation**: Hard launch with 20-25 badges. Add new batches quarterly. Each new batch is an event — "5 new badges dropped this week."

### XP Tiers Are Untested

The XP thresholds (Bronze 0-249, Silver 250-749, Gold 750-1499, Diamond 1500+) are arbitrary. Without modeling actual holder data, we don't know:
- What % of holders land in each tier?
- Is Diamond actually achievable, or is it impossible?
- Is Bronze too easy (everyone gets it day one)?

**Recommendation**: Before finalizing XP thresholds, run a simulation: take the top 50 known wallets, calculate which badges they'd earn, sum XP, and see the distribution. Adjust thresholds so roughly 50% Bronze, 30% Silver, 15% Gold, 5% Diamond.

### Badge Names Reference External Culture

"Clown World" has political connotations. "Pretty in Pink" is gendered. In a community that uses inclusive language ("beast family", "beast brother"), these could land wrong.

**Recommendation**: Review badge names for unintended associations. Keep them fun but neutral.

---

## 10. Action Items

**Must fix before sharing proposal:**
1. Remove or redesign the 6 impossible badges
2. Fix all wrong supply numbers
3. Fix misnamed traits (Hamburger → Burger)
4. Recalibrate tiers against actual supply data
5. Kill "Bid Warrior" (data doesn't exist)
6. Kill "Comeback Kid" (unverifiable)
7. Reframe "who builds" to team-controlled
8. Acknowledge snapshot problem in the proposal

**Should validate before implementation:**
1. Run XP simulation against top 50 wallets
2. Regenerate token-scores.json with vibeScore
3. Generate smart-money.json
4. Validate all remaining combo badges against trait-cache.json
5. Add floor price persistence for Floor Sweeper
