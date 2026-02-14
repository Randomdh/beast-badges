# AKCB Community Bot — Sales Bot Evolution

**Mission:** Expand the sales bot into a multi-function community engagement platform, with Beast Badges launch as the first major activation.

---

## The Vision

**Current state:** Sales bot (narrow function, high execution quality)
**Target state:** Community bot (broad engagement platform, sales is one feature)

### Why This Works

1. **Infrastructure exists** — WebSocket monitoring, Grok AI, Discord integration, trait data already built
2. **Community trust** — Bot has been delivering value for months, personality is established
3. **Data leverage** — Grail scores, token scores, holder data = fuel for engagement
4. **Launch vehicle** — Badge system needs hype → bot becomes the megaphone

---

## Bot Rebrand

### Name Evolution

**Option A: Gradual expansion (RECOMMENDED)**
- Keep `@AKCBSalesBot` handle
- Update bio: "Sales tracker, trait analyst, community instigator for @akidcalledbeast. Your Beast data HQ."
- Expand responsibilities without breaking existing function
- Avoids handle change disruption

**Option B: Full rebrand**
- New handle: `@AKCBCommunityBot` or `@AKCBScout`
- Risk: Loses existing followers, breaks mentions
- Not recommended unless sales-only branding is limiting growth

### Bio & Personality Update

**Current bio:** Sales tracker for A Kid Called Beast
**New bio:**
> Sales tracker, trait analyst, community instigator for @akidcalledbeast. Your Beast data HQ.
>
> Sales | Trait Wars | Badges | Data deep-dives

**Personality expansion:**
- **Sales mode:** "Scout at the Rail" (existing, works)
- **Trait Wars mode:** "Provocateur" (stir debate, data-backed trash talk)
- **Badge mode:** "Trophy Keeper" (celebrate achievements, scarcity flex)
- **Community mode:** "Archivist" (surface interesting data, spotlight collectors)

---

## Feature Expansion Plan

### Phase 1: Trait Wars (Pre-Badge Launch) — 2 weeks

**What is Trait Wars?**

Daily competitive matchups between traits, beasts, or archetypes. Community votes, bot announces winner + data insights.

**Tweet formats:**

```
⚔️ TRAIT WAR: Day 1

Robot Balaclava vs Ape Balaclava

Which face runs the streets?

🤖 Reply "ROBOT"
🦍 Reply "APE"

Vote closes in 6 hours. Data settles this.

#AKCB #TraitWars
```

After 6 hours:
```
⚔️ TRAIT WAR RESULT: Day 1

Robot: 47 votes (avg grail score 68)
Ape: 52 votes (avg grail score 71)

The community has spoken: APE GANG wins 🦍

But the data shows: Robot trades 12% higher on average (0.32 ETH vs 0.29 ETH).

Tomorrow: Astronaut Suit vs Tracksuit

#AKCB #TraitWars
```

**Matchup categories:**
- Balaclava battles (Ape vs Robot vs Wolf vs Medieval)
- Suit wars (Astronaut vs Robot Suit vs Ape Suit vs Tracksuit)
- Color wars (Blackout vs All White vs Pink Gang)
- DNA wars (Zombie vs Angel vs Bones)
- Archetype battles (Street vs Dark vs Suit vs Mutant)
- Neighborhood rivalries (WAGMI Way vs Beat Street vs MoBA)
- Token battles (head-to-head comparisons of specific beasts)

**Implementation:**
- Bot posts matchup at 10am ET
- Monitors replies for votes (simple keyword matching: "robot", "ape", etc.)
- Tallies votes + pulls trait data (grail scores, avg prices, supply)
- Posts result at 4pm ET with data reveal
- Stores vote history in `trait-wars-history.json`

**Why this works:**
- **Engagement:** Forces picks, creates debate
- **Data education:** Shows grail scores in context people care about
- **Scarcity awareness:** "Only 187 Ape Suits exist. 469 Robots. Robots rarer."
- **Badge preview:** Subtly plants idea that traits = achievements

### Phase 2: Badge Teasers (Week 3-4)

**Gradual badge concept introduction** via bot tweets:

**Week 3 (subtle):**
```
📊 TRAIT DEEP DIVE: Cowboy Hat + Cowboy Boots

Only 4 beasts in existence with both.

Holders: @wallet1, @wallet2, @wallet3, @wallet4

Rarest combo in the collection.

Some achievements are harder than others.

#AKCB
```

**Week 4 (explicit):**
```
🏆 WHAT IF...

Your trophy case recognized the hard stuff?

✅ Full Mech (Robot top + bottom)
✅ DNA Lab (all 3 special DNAs)
✅ Face Collector (all 4 premium balaclavas)
✅ Mayor (beasts from all 20 hoods)

What would be in your case?

#AKCB
```

### Phase 3: Badge Launch (Week 5)

**Launch announcement:**
```
🏆 BEAST BADGES — LIVE

On-chain achievements. Permanent proof. Earned, not bought.

146 badges across 17 categories. Your collection unlocks your trophy case.

Check what you've earned: [Discord /badges command or portal link]

Full library: [README link]

The hunt begins.

#AKCB #BeastBadges
```

**Daily badge spotlights:**
- Feature 2-3 badges per day with qualifying criteria
- Spotlight holders who qualify
- Celebrate first-to-claim milestones

### Phase 4: Ongoing Community Features

**Weekly features:**
- **Monday:** Trait Wars kickoff
- **Tuesday:** Portfolio spotlight (highlight interesting wallet compositions)
- **Wednesday:** Data deep-dive (trait velocity, market trends)
- **Thursday:** Badge achievement celebration
- **Friday:** Weekend challenge (hunt specific badges)
- **Saturday:** Community art/meme spotlight
- **Sunday:** Weekly recap (existing feature, expand to include badge stats)

**New Discord commands:**
- `/trait-wars` — current matchup + vote
- `/badge-progress <wallet>` — show badge completion %
- `/badge <name>` — badge info, supply, who has it
- `/leaderboard` — top badge collectors by XP

---

## Trait Wars Implementation Details

### Data Structure

```json
{
  "wars": [
    {
      "id": "tw-001",
      "date": "2026-02-20",
      "type": "balaclava_battle",
      "matchup": ["Robot", "Ape"],
      "votes": {
        "Robot": 47,
        "Ape": 52
      },
      "data": {
        "Robot": { "grailScore": 68, "avgPrice": 0.32, "supply": 432 },
        "Ape": { "grailScore": 71, "avgPrice": 0.29, "supply": 469 }
      },
      "winner": "Ape",
      "winMargin": "community"
    }
  ]
}
```

### Matchup Generation

**Automated matchup pools:**
```typescript
const balaclavaBattles = [
  ['Robot', 'Ape'],
  ['Wolf', 'Medieval'],
  ['Skull', 'Bull'],
  ['Cat', 'Dog (Beagle/Cocker/Pooch)']
];

const suitWars = [
  ['Astronaut', 'Robot Suit'],
  ['Ape Suit', 'Tracksuit'],
  ['Formal Suit', 'Astronaut']
];

const colorWars = [
  ['Blackout (5+ black)', 'White Out (4+ white)'],
  ['Pink Gang', 'All Black Everything']
];

const dnaWars = [
  ['Zombie', 'Angel'],
  ['Angel', 'Bones'],
  ['Zombie', 'Bones']
];

const archetypeWars = [
  ['Street Beast', 'Suit Beast'],
  ['Dark Beast', 'Mutant Beast'],
  ['Bling Beast', 'Tech Beast']
];
```

**Daily rotation:**
- Monday: Balaclava battle
- Tuesday: Suit war
- Wednesday: Color war or DNA war
- Thursday: Archetype war
- Friday: Token battle (specific beasts head-to-head)

### Vote Collection

**Simple implementation:**
- Post matchup tweet
- Monitor replies for next 6 hours
- Count votes via keyword matching (`if (reply.includes('robot'))`)
- Ignore duplicate votes from same account
- Tally results + pull data

**Alternative (interactive):**
- Use Twitter poll (4 options max)
- Cleaner UX, automatic tallying
- Less personality, can't inject data mid-vote

**Recommendation:** Start with reply-based (more engagement, visible voting), test poll format later

### Data Reveal Strategy

**Winner announcement includes:**
1. Vote counts (community preference)
2. Grail scores (trait desirability)
3. Avg sale prices (market preference)
4. Supply counts (scarcity context)
5. "Gap analysis" — when community and market disagree

**Example gap:**
```
Community voted: Ape wins 52-47

But the market says: Robot averages 12% higher sales

Gap = community sleeping on Robots 🤖
```

This creates **"I told you so" moments** and **contrarian takes** that drive engagement.

---

## Beast Badges Launch Plan

### 4-Week Pre-Launch Campaign

#### Week 1: Awareness (Feb 17-23)

**Goal:** Plant the idea that achievements matter

**Tactics:**
- Trait Wars daily (builds engagement baseline)
- Data deep-dives highlighting rare combos
- Subtle "trophy case" language in tweets
- No explicit badge mention yet

**Example tweets:**
```
📊 Only 7 wallets hold all 4 premium balaclavas (Ape/Robot/Wolf/Medieval).

Face Collector status: elite.

#AKCB
```

```
🔍 Full Mech holders (Robot top + bottom): 92 beasts

Space Cadet holders (Astronaut top + bottom): 42 beasts

Suited & Booted (Suit + Pants + Formal Shoe): 19 beasts

Some outfits are rarer than you think.
```

#### Week 2: Intrigue (Feb 24 - Mar 2)

**Goal:** Introduce "achievement" concept without revealing system

**Tactics:**
- "What if..." teaser tweets
- Polls: "Which achievement is harder?"
- Highlight wallet accomplishments ("This wallet has...")
- Community asks "what is this about?" → build mystery

**Example tweets:**
```
🏆 HARDEST ACHIEVEMENTS

Which is rarer?

🦴 DNA Lab (own all 3 DNAs)
🏙️ Mayor (beasts from all 20 hoods)
👔 Face Collector (all 4 premium balaclavas)
💎 Diamond Hands (never sold)

Vote below 👇
```

```
WHAT IF your collection unlocked a trophy case?

Not based on how much you spent.
Based on what you accomplished.

Would you hunt differently?
```

#### Week 3: Reveal (Mar 3-9)

**Goal:** Announce Beast Badges, share vision

**Tactics:**
- Official announcement tweet (Monday)
- README published to GitHub
- Discord AMA with Q&A
- Badge preview graphics (show 10-15 example badges)
- Explainer thread on XP/tier system

**Announcement tweet:**
```
🏆 BEAST BADGES

A permanent, on-chain trophy case for every Beast holder.

146 badges across 17 categories. Trait collecting. Market behavior. Community. Game achievements.

Earned, not bought. Your XP unlocks your tier.

Launch: March 17

Thread 🧵👇

#AKCB #BeastBadges
```

**Thread structure:**
1. What are Beast Badges?
2. Achievement vs Status badges (orange vs blue frames)
3. XP & Tier system (Bronze/Silver/Gold/Diamond)
4. How to earn (trait collecting, market moves, community)
5. Launch timeline (Phase 1: 20 badges, Phase 2: full library)
6. How to check your progress (Discord command or portal)

#### Week 4: Hype (Mar 10-16)

**Goal:** Build FOMO, surface interesting badge scenarios

**Tactics:**
- Daily badge spotlights ("Only 4 wallets qualify for Cowboy")
- Leaderboard previews ("If badges launched today, top 10 XP holders are...")
- Community callouts ("@wallet is 1 beast away from Pack Leader")
- Hunt challenges ("Who can assemble DNA Lab before launch?")

**Example tweets:**
```
🏆 BADGE SPOTLIGHT: Cowboy

Criteria: Hold Cowboy Hat + Cowboy Boots
Tier: Legendary (750 XP)
Mint fee: $5

Only 4 beasts qualify:
#2491, #5946, #5975, #5980

Current holders: 4 wallets

One of the rarest badges in the system.

7 days until launch.

#BeastBadges
```

```
🏆 LEADERBOARD PREVIEW

If badges launched today, top 5 XP earners:

1. @wallet1 — 2,340 XP (Diamond)
2. @wallet2 — 1,890 XP (Diamond)
3. @wallet3 — 1,650 XP (Diamond)
4. @wallet4 — 1,520 XP (Diamond)
5. @wallet5 — 1,410 XP (Diamond)

Where do you rank?

Check your progress: /badges in Discord

#BeastBadges
```

### Launch Day (March 17)

**24-hour activation:**

**6am ET:** Launch announcement
```
🏆 BEAST BADGES — LIVE

Smart contract deployed. Badges minted. Your trophy case is ready.

Check what you've earned: [link]

The hunt begins.

#BeastBadges #AKCB
```

**10am ET:** First badge claims celebration
```
🏆 FIRST CLAIMS

@wallet1 — 47 badges, Gold Tier (1,125 XP)
@wallet2 — 52 badges, Diamond Tier (1,450 XP)
@wallet3 — 38 badges, Silver Tier (890 XP)

The leaderboard is live. Where do you stand?

#BeastBadges
```

**2pm ET:** Rare badge callout
```
🏆 LEGENDARY CLAIMS

DNA Lab (all 3 DNAs): 3 wallets claimed
Cowboy: 4 wallets claimed
Mayor (all 20 hoods): 11 wallets claimed
Angel Wings: 9 wallets claimed

The trophy case grows.

#BeastBadges
```

**6pm ET:** Community spotlight
```
🏆 BIGGEST JUMP

@wallet minted 63 badges in the first 12 hours.

From 0 to Silver Tier (685 XP).

The grind is real.

#BeastBadges
```

### Post-Launch (Week 1-4)

**Daily rhythms:**
- **Morning:** Badge achievement celebration (who claimed what overnight)
- **Midday:** Trait Wars continues (badge tie-in: "Ape Gang badge holders vs Robot holders")
- **Evening:** Data insights (tier distribution, most-claimed badges, hunt challenges)

**Weekly milestones:**
- Week 1: Total badges minted, tier distribution snapshot
- Week 2: First wallet to hit Diamond tier organically (started Bronze)
- Week 3: Rarest badge still unclaimed
- Week 4: Phase 2 teaser (market behavior badges coming)

---

## Technical Implementation

### New Bot Modules

**`src/traitWars.ts`** — Matchup generation, vote tallying, result announcements
- `generateDailyMatchup()` — picks from preset pools
- `collectVotes(tweetId)` — monitors replies, tallies keywords
- `announceResult(matchup, votes)` — posts winner + data reveal
- Stores history in `trait-wars-history.json`

**`src/badgeAnnouncements.ts`** — Badge launch tweets, spotlights, leaderboards
- `announceLaunch()` — launch day tweet thread
- `celebrateClaim(wallet, badges)` — first claims, milestones
- `dailyBadgeSpotlight(badgeName)` — feature specific badge
- `leaderboardPreview()` — top XP holders

**`src/communitySpotlight.ts`** — Wallet highlights, collection stories
- `portfolioSpotlight(wallet)` — interesting wallet compositions
- `huntChallenge(badge)` — "Who can earn this before launch?"
- `gapAnalysis(trait)` — "Community voted X, market says Y"

### Data Integration

**Beast Badges data sources:**
- `badge-definitions.json` — all 146 badges with criteria, tiers, XP
- `wallet-badges.json` — which wallets qualify for which badges
- `xp-leaderboard.json` — sorted list of wallets by total XP
- `badge-claims.json` — on-chain claim events (post-launch)

**Bot access patterns:**
- Read badge definitions for spotlights
- Read wallet-badges for "X wallets away from Y badge"
- Read leaderboard for ranking tweets
- Monitor claim events for celebration tweets

### Discord Expansion

**New slash commands:**

| Command | Description |
|---------|-------------|
| `/trait-wars` | Show current matchup + vote link |
| `/vote <option>` | Cast vote in active Trait War |
| `/wars-history` | Past matchup results |
| `/badge-progress <wallet>` | Badge completion % + missing badges |
| `/badge <name>` | Badge details, qualifying criteria, supply |
| `/leaderboard [tier]` | Top XP holders (all or filtered by tier) |
| `/hunt` | Suggest badges you're closest to earning |

**Auto-posting expansion:**
- Trait Wars matchups (daily)
- Badge spotlights (daily post-launch)
- Leaderboard updates (weekly)

---

## Content Calendar (Pre-Launch)

### Week 1: Awareness

| Day | Twitter | Discord |
|-----|---------|---------|
| Mon | Trait War: Robot vs Ape | Announce Trait Wars feature |
| Tue | Trait War result + Data deep-dive: rare combos | - |
| Wed | Trait War: Astronaut vs Robot Suit | - |
| Thu | Trait War result + Wallet spotlight | - |
| Fri | Trait War: Blackout vs Pink Gang | Weekend challenge thread |
| Sat | Trait War result | - |
| Sun | Weekly recap (expand to include Trait Wars winner) | - |

### Week 2: Intrigue

| Day | Twitter | Discord |
|-----|---------|---------|
| Mon | Trait War + "What if..." teaser | Poll: Hardest achievement? |
| Tue | Trait War result + Achievement poll results | - |
| Wed | Trait War + Data deep-dive: wallet accomplishments | - |
| Thu | Trait War result + Mystery teaser | - |
| Fri | Trait War + "Your trophy case" concept tweet | - |
| Sat | Trait War result | - |
| Sun | Weekly recap + badge concept hint | - |

### Week 3: Reveal

| Day | Twitter | Discord |
|-----|---------|---------|
| Mon | 🚨 BEAST BADGES ANNOUNCEMENT + Thread | AMA announcement |
| Tue | Badge preview graphics (10 example badges) | Badge FAQ posted |
| Wed | XP/Tier system explainer | AMA session |
| Thu | README published, full library revealed | - |
| Fri | Trait War (badge edition): "Ape Gang holders vs Robot holders" | - |
| Sat | Launch countdown (10 days) | - |
| Sun | Weekly recap + badge hype | - |

### Week 4: Hype

| Day | Twitter | Discord |
|-----|---------|---------|
| Mon | Badge spotlight: Cowboy (Legendary) | Leaderboard preview |
| Tue | Badge spotlight: DNA Lab | Hunt challenge |
| Wed | Badge spotlight: Face Collector | - |
| Thu | Leaderboard preview (top 10 XP) | - |
| Fri | Badge spotlight: Mayor | - |
| Sat | Launch countdown (3 days) | - |
| Sun | Weekly recap + final countdown | - |

---

## Success Metrics

### Pre-Launch (Trait Wars phase)

**Engagement targets:**
- Trait Wars vote participation: 30+ votes per matchup
- Reply engagement: 2x baseline (currently ~5-10 replies/tweet)
- Discord activity: +50% weekly active users
- New followers: +100 by launch

**Indicators working:**
- Community debating matchups (quote tweets, threads)
- "When are badges launching?" questions
- Holders checking their collections for badge-worthy traits
- Discord traffic spike on announcement day

### Launch Week

**Claim metrics:**
- Badge mints: 50%+ of eligible holders claim in week 1
- Discord /badges usage: 500+ command invocations
- Twitter engagement: 3x baseline during launch week
- New portal visits: Track via team analytics

**Social proof:**
- Community sharing badge collections
- Holders hunting missing badges (buying specific traits)
- Leaderboard competition (visible XP race)
- External coverage (NFT Twitter accounts notice)

---

## Risk Mitigation

### Bot Overload

**Risk:** Bot posts too much, becomes spam
**Mitigation:**
- Cap daily tweets: 15 max (sales + Trait Wars + badge content)
- Trait Wars = 2 tweets/day max (matchup + result)
- Badge content = 3 tweets/day max (spotlight + celebration + data)
- Sales still priority — badge tweets queue if sales volume spikes

### Community Fatigue

**Risk:** 4-week campaign feels too long, hype peaks early
**Mitigation:**
- Week 1-2 is subtle (Trait Wars feels like standalone feature)
- Reveal held until Week 3 (only 2 weeks of explicit badge talk)
- Hunt challenges keep engagement active (participatory, not passive)
- Post-launch content must deliver (actual badge utility via B*Points)

### Launch Delays

**Risk:** Smart contract not ready by March 17
**Mitigation:**
- Campaign timeline flexible — can extend Week 4 hype phase
- "Launch when ready" > "launch on schedule"
- Teaser content (Trait Wars, spotlights) valuable regardless of launch date

### Data Accuracy

**Risk:** Bot announces incorrect badge data (wrong supply, wrong holders)
**Mitigation:**
- All badge data sourced from verified analysis scripts
- `verify-badges.js` runs before any badge content posts
- Manual review of first 10 badge spotlight tweets
- Corrections posted immediately if errors found

---

## Next Steps

### Immediate (This Week)

1. **Decide on approach** — community bot expansion + Trait Wars + badge launch?
2. **Set launch date** — 4 weeks from start of campaign (fluid, but target needed)
3. **Design Trait Wars graphics** — matchup cards, result cards (Canva templates OK)
4. **Write matchup pools** — 20+ matchups across categories (balaclava, suit, color, DNA, archetype)

### Week 1 (Implementation)

5. **Build Trait Wars module** — `traitWars.ts` with matchup generation, vote tallying
6. **Test vote collection** — post test matchup, verify keyword matching works
7. **Integrate with scheduler** — daily posts at 10am ET (matchup), 4pm ET (result)
8. **Update Discord** — add `/trait-wars` command

### Week 2-3 (Content Prep)

9. **Write badge spotlight templates** — 20 pre-written badge features
10. **Generate leaderboard** — run XP simulation, identify top holders
11. **Create badge graphics** — visual assets for Twitter (AI-generated OK for MVP)
12. **Draft announcement thread** — polished launch announcement + explainer

### Week 4 (Launch Prep)

13. **Deploy badge eligibility engine** — API or Discord bot backend
14. **Test badge claims** — verify `/badges` command works
15. **Finalize launch day timeline** — schedule 4-6 tweets across 24 hours
16. **Coordinate with team** — portal integration, official comms alignment

---

## Budget & Resources

### Development Time

- Trait Wars module: 8-12 hours
- Badge announcement module: 4-6 hours
- Discord command expansion: 6-8 hours
- Testing & iteration: 4-6 hours
- **Total:** ~25-30 hours development

### Design Assets

**Option A: AI-generated (fast, cheap)**
- Matchup cards: Canva + Midjourney/DALL-E backgrounds
- Badge spotlight graphics: Template-based
- Cost: $0-20 (Canva Pro subscription)

**Option B: Community contest**
- Post bounty: "Design Trait Wars matchup card template"
- Winner gets badge credit + $50-100
- Higher quality, community engagement boost

**Option C: Artist commission**
- Professional matchup cards + badge graphics
- Cost: $200-500 for full set
- Highest quality, on-brand

**Recommendation:** Start with Option A (AI + Canva), upgrade to B or C if campaign gains traction

### Infrastructure Costs

- No additional hosting (bot already on VM)
- Grok API usage: +$5-10/month (Trait Wars + badge content)
- Total incremental: ~$10-15/month

---

## Why This Works

1. **Leverages existing infrastructure** — Bot, data, community trust already in place
2. **Trait Wars builds engagement baseline** — Daily participation habit formed before badge launch
3. **4-week campaign creates FOMO** — Slow reveal maximizes anticipation
4. **Bot becomes badge megaphone** — Automated celebration, spotlights, leaderboards scale community engagement
5. **Data-driven personality** — Bot's existing "Scout" voice perfect for "trophy keeper" evolution
6. **Discord integration** — `/badges` command makes checking progress frictionless
7. **Post-launch content engine** — Badge achievements = infinite content (celebrations, milestones, hunt challenges)

---

**Recommendation:** Greenlight Trait Wars immediately (2-week test before badge reveal). If engagement works, proceed with full 4-week launch plan. Badge system benefits from hype machine, bot benefits from expanded mandate.
