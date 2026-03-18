# Badge Drop Deploy Guide

## Current State (Drop 1 — Live)
20 badges: 16 trait-based + 4 wallet-level (first_beast, pack_leader, grail_hunter, diamond_hands)

## Drop Schedule

| Drop | Theme | Badges | Timing |
|------|-------|--------|--------|
| **Drop 1** | Launch Set | 20 | **LIVE** |
| **Drop 2** | Fashion & Rare Styles | +10 (30 total) | Week 2 after portal launch |
| **Drop 3** | Neighborhoods & Milestones | +10 (40 total) | Week 4 |
| **Drop 4** | Accessories & Bling | +10 (50 total) | Month 2 |

## How to Deploy a Drop

Each drop file contains:
1. Badge definitions (add to `LAUNCH_BADGES` array in `badges.ts`)
2. Trait check code (add inside `checkTokenBadges` function)
3. Wallet-level checks if needed (add to `precompute-badges.ts`)

### Steps:

1. **Copy badge definitions** from the drop file into `LAUNCH_BADGES` in `badges.ts`

2. **Copy trait checks** from the drop file into `checkTokenBadges()` in `badges.ts`

3. **Copy wallet-level checks** (if any) into the holder processing loop in `precompute-badges.ts`

4. **Build & deploy:**
   ```bash
   ssh -i ~/.ssh/gcp-openclaw rhodgson93@34.21.74.194
   cd ~/beast-companion-api
   npm run build
   pm2 restart beast-companion-api badge-precompute
   ```

5. **Force badge recompute** (run a full rebuild instead of incremental):
   ```bash
   # Delete the metadata to force full recompute
   rm data/badge-refresh-metadata.json
   pm2 restart badge-precompute
   ```

6. **Verify:**
   ```bash
   curl http://localhost:3100/v1/map/badge-stats | python3 -m json.tool
   ```

7. **Announce** in Discord/X: "X new badges just dropped. Check your profile."

## Announcement Templates

### Drop 2 (Fashion & Rare Styles)
> 10 new Beast Badges just dropped 🔥
>
> Your beasts got drip? Now there's proof.
> Mech Head · Bull Run · Ink'd Up · Suited Up · Trackstar · Road Beast · Bare Bones · Pink Gang · Leopard Print · Cowboy
>
> Check your profile on the Beast Map 👇
> akcbmap.com

### Drop 3 (Neighborhoods & Milestones)
> How deep is your pack? 🏘️
>
> 10 new badges recognize the collectors.
> Rep your hood. Stack your beasts. Get recognized.
> Wagmi Way · Pack Builder · Local · Block Captain · Dual Citizen · City Explorer · Beast Hoard · Mayor
>
> Beast Map 👇 akcbmap.com

### Drop 4 (Accessories & Bling)
> Show me what you're carrying 💎
>
> 10 new accessory badges just dropped.
> Gems, crowns, chains, masks, and more.
> Band Practice · Bookworm · Money Moves · Gem Collector · Diamond Studded · Halo Effect · Crown Jewels · Gold Chain
>
> Check your profile 👇 akcbmap.com

## Future Drops (Not Yet Prepped)

- **Drop 5:** Market Behavior (Good Flip, Floor Sweeper, OG Beast, Year One) — needs sales history analysis
- **Drop 6:** Beastagotchi Integration (game achievement badges)
- **Drop 7:** Seasonal/Limited (Holiday Beast, Genesis Day, Launch Day)
- **Drop 8:** Rare DNA deep cuts (Legend of the East, Monster Mash, Crime Boss)
- **Drop 9:** Cross-collection expansion (Triple Threat, Full Ecosystem)
