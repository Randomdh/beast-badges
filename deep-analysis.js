/**
 * Beast Badge Deep Analysis — Let the data define the badges
 *
 * Pass 1: Map the entire trait structure
 * Pass 2: Find natural collecting patterns (what do holders actually collect?)
 * Pass 3: Identify every achievable combo
 * Pass 4: Score and tier everything
 * Pass 5: Cross-check and verify
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = 'C:/Users/rhodg/source/akc-sales-bot';

console.log('Loading data...');
const traitCache = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'trait-cache.json'), 'utf8'));
const traitSupply = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'trait-supply.json'), 'utf8'));
const grailScores = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'grail-scores.json'), 'utf8'));
const tokenScores = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'token-scores.json'), 'utf8'));
const salesCache = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'sales-cache.json'), 'utf8'));

const totalTokens = Object.keys(traitCache).length;
console.log(`Loaded: ${totalTokens} tokens, ${Object.keys(traitSupply).length} trait variants, ${salesCache.length} sales\n`);

// ============================================================
// PASS 1: COMPLETE TRAIT STRUCTURE MAP
// ============================================================

// Build a proper understanding of how traits work
// Each token has traits like: { trait_type: "Balaclava", value: "Ape" }
// But ALSO has item-specific trait_types like: { trait_type: "Ape Suit", value: "Cream Yellow" }
// The "Top" and "Bottom" traits are category-level, the item traits are detail-level

// First: understand the trait hierarchy
const traitTypeToTokens = {}; // trait_type -> [tokenIds]
const traitKeyToTokens = {}; // "trait_type:value" -> Set<tokenId>
const tokenToTraitMap = {};   // tokenId -> { trait_type: [values] }
const tokenToFullTraits = {}; // tokenId -> [{trait_type, value}]

for (const [tokenId, traits] of Object.entries(traitCache)) {
  tokenToFullTraits[tokenId] = traits;
  tokenToTraitMap[tokenId] = {};
  for (const t of traits) {
    // Type -> tokens
    if (!traitTypeToTokens[t.trait_type]) traitTypeToTokens[t.trait_type] = [];
    traitTypeToTokens[t.trait_type].push(tokenId);

    // Key -> tokens
    const key = `${t.trait_type}:${t.value}`;
    if (!traitKeyToTokens[key]) traitKeyToTokens[key] = new Set();
    traitKeyToTokens[key].add(tokenId);

    // Token -> traits
    if (!tokenToTraitMap[tokenId][t.trait_type]) tokenToTraitMap[tokenId][t.trait_type] = [];
    tokenToTraitMap[tokenId][t.trait_type].push(t.value);
  }
}

// Helper: get set of tokens for a trait key
function tokensFor(traitType, value) {
  return traitKeyToTokens[`${traitType}:${value}`] || new Set();
}

// Helper: get set of tokens matching any of several values for a trait type
function tokensForAny(traitType, values) {
  const result = new Set();
  for (const v of values) {
    const set = tokensFor(traitType, v);
    for (const t of set) result.add(t);
  }
  return result;
}

// Helper: intersect two sets
function intersect(setA, setB) {
  const result = new Set();
  for (const item of setA) {
    if (setB.has(item)) result.add(item);
  }
  return result;
}

// Helper: get all unique values for a trait type
function valuesFor(traitType) {
  const vals = new Set();
  for (const key of Object.keys(traitKeyToTokens)) {
    if (key.startsWith(traitType + ':')) {
      vals.add(key.substring(traitType.length + 1));
    }
  }
  return [...vals].sort();
}

// Helper: supply for a trait key
function supply(traitType, value) {
  return traitSupply[`${traitType}:${value}`] || tokensFor(traitType, value).size;
}

// ============================================================
// PASS 1 OUTPUT: Trait structure understanding
// ============================================================

const out = [];
function w(s) { out.push(s); }
function section(s) { w(`\n${'='.repeat(80)}`); w(`  ${s}`); w('='.repeat(80)); }
function sub(s) { w(`\n  --- ${s} ---`); }

section('PASS 1: TRAIT STRUCTURE');

// Identify CATEGORY traits vs ITEM traits
// Category traits: DNA, Top, Bottom, Footwear, Headwear, Eyes, Balaclava, Balaclava Style, etc.
// Item traits: Hoodie (specific top), Cowboy Hat (specific headwear), etc.

const categoryTraits = ['DNA', 'Top', 'Bottom', 'Footwear', 'Headwear', 'Eyes', 'Balaclava', 'Balaclava Style', 'Beasthood', 'Human', 'Ink', 'Accessory', 'Gemstone', 'Chain', 'Durag', 'Surfboard', 'Rare'];
const itemTraits = Object.keys(traitTypeToTokens).filter(t => !categoryTraits.includes(t)).sort();

w(`  Category-level traits (${categoryTraits.length}): ${categoryTraits.join(', ')}`);
w(`  Item-level trait types (${itemTraits.length}):`);

// Map item traits to their category
const itemToCategory = {};
for (const item of itemTraits) {
  // Check: tokens with this item trait — what Top/Bottom/Headwear/Footwear/Accessory do they have?
  const sampleTokens = traitTypeToTokens[item].slice(0, 5);
  const categories = {};
  for (const tid of sampleTokens) {
    const tm = tokenToTraitMap[tid];
    if (tm['Top'] && tm['Top'].includes(item)) categories['Top'] = (categories['Top'] || 0) + 1;
    if (tm['Bottom'] && tm['Bottom'].includes(item)) categories['Bottom'] = (categories['Bottom'] || 0) + 1;
    if (tm['Headwear'] && tm['Headwear'].includes(item)) categories['Headwear'] = (categories['Headwear'] || 0) + 1;
    if (tm['Footwear'] && tm['Footwear'].includes(item)) categories['Footwear'] = (categories['Footwear'] || 0) + 1;
    if (tm['Accessory'] && tm['Accessory'].includes(item)) categories['Accessory'] = (categories['Accessory'] || 0) + 1;
  }
  const topCat = Object.entries(categories).sort((a,b) => b[1] - a[1])[0];
  itemToCategory[item] = topCat ? topCat[0] : 'unknown';
}

// Group items by category
const categoryItems = {};
for (const [item, cat] of Object.entries(itemToCategory)) {
  if (!categoryItems[cat]) categoryItems[cat] = [];
  categoryItems[cat].push({ name: item, count: traitTypeToTokens[item].length, values: valuesFor(item).length });
}

for (const [cat, items] of Object.entries(categoryItems).sort()) {
  w(`\n  ${cat} items:`);
  for (const item of items.sort((a,b) => b.count - a.count)) {
    w(`    ${item.name}: ${item.count} tokens, ${item.values} color variants`);
  }
}

// ============================================================
// PASS 2: UNDERSTAND WHAT'S ACTUALLY ON EACH TOKEN
// ============================================================

section('PASS 2: TOKEN COMPOSITION PATTERNS');

// Each token has:
// - 1 DNA
// - 1 Balaclava (face)
// - 1 Balaclava Style (color/pattern of face)
// - 1 Top (clothing category)
// - 1 Bottom (clothing category)
// - 1 Footwear
// - 0-1 Headwear
// - 0-1 Accessory (from the Accessory category)
// - 0+ specific accessories (individual trait types)
// - 1 Beasthood
// - 1 Human (skin tone)
// - 1 Eyes
// - 0-1 Ink
// - Plus item-level detail traits for the clothing

// How many tokens have headwear?
const hasHeadwear = Object.values(tokenToTraitMap).filter(tm => tm['Headwear']).length;
w(`  Tokens with Headwear: ${hasHeadwear} / ${totalTokens}`);

// How many have Accessory?
const hasAccessory = Object.values(tokenToTraitMap).filter(tm => tm['Accessory']).length;
w(`  Tokens with Accessory trait: ${hasAccessory} / ${totalTokens}`);

// How many have Ink?
const hasInk = Object.values(tokenToTraitMap).filter(tm => tm['Ink']).length;
w(`  Tokens with Ink: ${hasInk} / ${totalTokens}`);

// How many have Gemstone?
const hasGemstone = Object.values(tokenToTraitMap).filter(tm => tm['Gemstone']).length;
w(`  Tokens with Gemstone: ${hasGemstone} / ${totalTokens}`);

// How many have Chain?
const hasChain = Object.values(tokenToTraitMap).filter(tm => tm['Chain']).length;
w(`  Tokens with Chain: ${hasChain} / ${totalTokens}`);

// How many have Surfboard?
const hasSurf = Object.values(tokenToTraitMap).filter(tm => tm['Surfboard']).length;
w(`  Tokens with Surfboard: ${hasSurf} / ${totalTokens}`);

// How many have Durag (standalone, not part of hat)?
const hasDurag = Object.values(tokenToTraitMap).filter(tm => tm['Durag']).length;
w(`  Tokens with Durag (standalone): ${hasDurag} / ${totalTokens}`);

// ============================================================
// PASS 3: DEFINITIVE BADGE ANALYSIS — SINGLE TOKEN BADGES
// ============================================================
// These are badges earned by holding ONE token that meets criteria

section('PASS 3: SINGLE-TOKEN BADGES — EXHAUSTIVE VERIFICATION');

const badges = [];

function addBadge(category, name, tier, criteria, qualifyingTokens, notes) {
  const count = qualifyingTokens instanceof Set ? qualifyingTokens.size : qualifyingTokens;
  badges.push({ category, name, tier, criteria, count, notes, tokens: qualifyingTokens instanceof Set ? qualifyingTokens : null });
  const tierColor = { common: 'C', uncommon: 'U', rare: 'R', epic: 'E', legendary: 'L' };
  w(`  [${tierColor[tier]}] ${name} — ${count} tokens — ${criteria}${notes ? ' — ' + notes : ''}`);
}

// Tier logic based on how many TOKENS qualify (not wallets):
// Common: 300+ tokens (easy to find)
// Uncommon: 100-299 tokens
// Rare: 30-99 tokens
// Epic: 10-29 tokens
// Legendary: 1-9 tokens
function autoTier(count) {
  if (count >= 300) return 'common';
  if (count >= 100) return 'uncommon';
  if (count >= 30) return 'rare';
  if (count >= 10) return 'epic';
  return 'legendary';
}

// ------ 3A: BALACLAVA (FACE) IDENTITY ------
sub('3A: BALACLAVA IDENTITY');

const balaclavas = valuesFor('Balaclava');
w(`  All ${balaclavas.length} balaclava types:`);
for (const b of balaclavas) {
  const s = supply('Balaclava', b);
  const grail = grailScores[`Balaclava:${b}`];
  w(`    ${b}: ${s} tokens${grail ? ` [grail: ${grail.compositeScore.toFixed(1)}]` : ''}`);
}

// Premium balaclavas (the 4 that are commonly called out)
const premiumBalas = { 'Ape': 469, 'Robot': 432, 'Wolf': 313, 'Medieval': 40 };
for (const [name, _] of Object.entries(premiumBalas)) {
  const actual = supply('Balaclava', name);
  const tokens = tokensFor('Balaclava', name);
  addBadge('balaclava', `${name} Gang`, autoTier(actual), `Hold a beast with ${name} balaclava`, tokens);
}

// Skull
const skullTokens = tokensFor('Balaclava', 'Skull');
addBadge('balaclava', 'Skull Squad', autoTier(skullTokens.size), 'Hold a beast with Skull balaclava', skullTokens);

// Dog balaclavas — Beagle, Cocker Spaniel, Pooch
const dogBalas = ['Beagle', 'Cocker Spaniel', 'Pooch'];
const dogTokens = tokensForAny('Balaclava', dogBalas);
addBadge('balaclava', 'Good Boy', autoTier(dogTokens.size), `Hold a beast with dog balaclava (${dogBalas.join('/')})`, dogTokens);

// Panda
const pandaTokens = tokensFor('Balaclava', 'Panda');
addBadge('balaclava', 'Panda Express', autoTier(pandaTokens.size), 'Hold a beast with Panda balaclava', pandaTokens);

// Bull
const bullTokens = tokensFor('Balaclava', 'Bull');
addBadge('balaclava', 'Bull Run', autoTier(bullTokens.size), 'Hold a beast with Bull balaclava', bullTokens);

// Cat
const catTokens = tokensFor('Balaclava', 'Cat');
addBadge('balaclava', 'Cat Burglar', autoTier(catTokens.size), 'Hold a beast with Cat balaclava', catTokens);

// Clown
const clownTokens = tokensFor('Balaclava', 'Clown');
addBadge('balaclava', 'Class Clown', autoTier(clownTokens.size), 'Hold a beast with Clown balaclava', clownTokens);

// Brown & Cream (rare balaclava - only 11)
const brownCreamTokens = tokensFor('Balaclava', 'Brown & Cream');
addBadge('balaclava', 'Brown & Cream', autoTier(brownCreamTokens.size), 'Hold a beast with Brown & Cream balaclava', brownCreamTokens, 'Rare colorway');

// Custom Female Hippies (ultra-rare)
const customTokens = tokensFor('Balaclava', 'Custom Female Hippies Tan Panda Balaclava');
if (customTokens.size > 0) {
  addBadge('balaclava', 'Custom Panda', autoTier(customTokens.size), 'Hold a Custom Female Hippies Tan Panda Balaclava beast', customTokens, 'Ultra-rare variant');
}

// ------ 3B: BALACLAVA STYLE ------
sub('3B: BALACLAVA STYLE BADGES');

// Battle Worn White (grail 62.8, 9 tokens)
const bwwTokens = tokensFor('Balaclava Style', 'Battle Worn White');
addBadge('style', 'Battle Worn', autoTier(bwwTokens.size), 'Hold a beast with Battle Worn White balaclava style', bwwTokens, `grail: 62.8`);

// Psychedelic (10 tokens)
const psychTokens = tokensFor('Balaclava Style', 'Psychedelic');
addBadge('style', 'Psychedelic Trip', autoTier(psychTokens.size), 'Hold a beast with Psychedelic balaclava style', psychTokens);

// Leopard (13 tokens)
const leopTokens = tokensFor('Balaclava Style', 'Leopard');
addBadge('style', 'Leopard Print', autoTier(leopTokens.size), 'Hold a beast with Leopard balaclava style', leopTokens);

// Gold (10 tokens)
const goldStyleTokens = tokensFor('Balaclava Style', 'Gold');
addBadge('style', 'Gold Face', autoTier(goldStyleTokens.size), 'Hold a beast with Gold balaclava style', goldStyleTokens);

// Skull Print (9 tokens)
const skullPrintTokens = tokensFor('Balaclava Style', 'Skull Print');
addBadge('style', 'Skull Print', autoTier(skullPrintTokens.size), 'Hold a beast with Skull Print balaclava style', skullPrintTokens);

// Red Metal (10 tokens)
const redMetalTokens = tokensFor('Balaclava Style', 'Red Metal');
addBadge('style', 'Red Metal', autoTier(redMetalTokens.size), 'Hold a beast with Red Metal balaclava style', redMetalTokens);

// Cream Yellow (16 tokens, grail 62.4)
const creamYellowTokens = tokensFor('Balaclava Style', 'Cream Yellow');
addBadge('style', 'Cream Yellow', autoTier(creamYellowTokens.size), 'Hold a beast with Cream Yellow balaclava style', creamYellowTokens, 'grail: 62.4');

// Charcoal & Gray (2 tokens only!)
const charGrayTokens = tokensFor('Balaclava Style', 'Charcoal & Gray');
if (charGrayTokens.size > 0) {
  addBadge('style', 'Charcoal Ghost', autoTier(charGrayTokens.size), 'Hold a beast with Charcoal & Gray balaclava style', charGrayTokens, 'Extremely rare');
}

// Distressed Black & White (6 tokens)
const distBWTokens = tokensFor('Balaclava Style', 'Distressed Black & White');
addBadge('style', 'Distressed', autoTier(distBWTokens.size), 'Hold a beast with Distressed Black & White balaclava style', distBWTokens);

// Rusty Teal (7 tokens)
const rustyTokens = tokensFor('Balaclava Style', 'Rusty Teal');
addBadge('style', 'Rusty', autoTier(rustyTokens.size), 'Hold a beast with Rusty Teal balaclava style', rustyTokens);

// ------ 3C: COLOR COORDINATION ------
sub('3C: COLOR COORDINATION');

// For each token, count how many trait VALUES contain each color word
const colorWords = ['black', 'white', 'red', 'blue', 'green', 'pink', 'purple', 'orange', 'yellow', 'brown', 'gray', 'grey', 'cream', 'gold', 'navy', 'charcoal', 'olive', 'tan', 'beige'];

const colorMatchResults = {};
for (const color of colorWords) {
  colorMatchResults[color] = { 5: [], 4: [], 3: [] };
}

for (const [tokenId, traits] of Object.entries(traitCache)) {
  for (const color of colorWords) {
    let count = 0;
    const cl = color.toLowerCase();
    for (const t of traits) {
      if (t.value.toLowerCase().includes(cl)) count++;
    }
    if (count >= 5) colorMatchResults[color][5].push(tokenId);
    if (count >= 4) colorMatchResults[color][4].push(tokenId);
    if (count >= 3) colorMatchResults[color][3].push(tokenId);
  }
}

w(`  Color coordination counts (tokens with N+ traits matching a color):`);
for (const color of colorWords) {
  const c5 = colorMatchResults[color][5].length;
  const c4 = colorMatchResults[color][4].length;
  const c3 = colorMatchResults[color][3].length;
  if (c3 > 0) {
    w(`    ${color}: 5+match=${c5}, 4+match=${c4}, 3+match=${c3}`);
  }
}

// Blackout badge (5+ black)
const blackout5 = new Set(colorMatchResults['black'][5]);
addBadge('color', 'Blackout', autoTier(blackout5.size), 'Hold a beast with 5+ black-colored traits', blackout5);
if (blackout5.size <= 30) w(`    Tokens: ${[...blackout5].join(', ')}`);

// All Black Everything (4+ black)
const black4 = new Set(colorMatchResults['black'][4]);
addBadge('color', 'All Black Everything', autoTier(black4.size), 'Hold a beast with 4+ black-colored traits', black4);

// Pink Gang (3+ pink)
const pink3 = new Set(colorMatchResults['pink'][3]);
addBadge('color', 'Pink Gang', autoTier(pink3.size), 'Hold a beast with 3+ pink-colored traits', pink3);
if (pink3.size <= 30) w(`    Tokens: ${[...pink3].join(', ')}`);

// White Out (4+ white)
const white4 = new Set(colorMatchResults['white'][4]);
addBadge('color', 'White Out', autoTier(white4.size), 'Hold a beast with 4+ white-colored traits', white4);

// Color Coordinated (any color 4+)
const colorCoord = new Set();
for (const color of colorWords) {
  for (const t of colorMatchResults[color][4]) colorCoord.add(t);
}
addBadge('color', 'Color Coordinated', autoTier(colorCoord.size), 'Hold a beast with 4+ traits sharing any color', colorCoord);

// ------ 3D: FULL SUITS ------
sub('3D: FULL SUITS (verified via scoring engine + manual check)');

// The scoring engine already detects full suits. Let's use that as ground truth
// and verify independently.

// Group by suit family
const suitFamilies = {};
for (const [id, s] of Object.entries(tokenScores)) {
  if (s.fullSuit) {
    const family = s.fullSuit.replace(/^(.*?)\s+(Ape Suit|Robot Suit|Astronaut|Tracksuit)$/, '$2');
    // Actually, extract the suit type more carefully
    let suitType;
    if (s.fullSuit.includes('Ape Suit')) suitType = 'Ape Suit';
    else if (s.fullSuit.includes('Robot Suit')) suitType = 'Robot Suit';
    else if (s.fullSuit.includes('Astronaut')) suitType = 'Astronaut';
    else if (s.fullSuit.includes('Tracksuit')) suitType = 'Tracksuit';
    else suitType = s.fullSuit;

    if (!suitFamilies[suitType]) suitFamilies[suitType] = new Set();
    suitFamilies[suitType].add(id);
  }
}

w(`  Suit families from scoring engine:`);
for (const [family, tokenSet] of Object.entries(suitFamilies).sort((a,b) => b[1].size - a[1].size)) {
  w(`    ${family}: ${tokenSet.size} tokens`);
}

// Now verify independently: what does "full suit" mean in the trait data?

// APE SUIT: trait_type "Ape Suit" exists as item detail. Let's check what category it maps to.
w(`\n  Ape Suit verification:`);
const apeSuitItemTokens = traitTypeToTokens['Ape Suit'] || [];
w(`    Tokens with trait_type "Ape Suit": ${apeSuitItemTokens.length}`);
// Check what Top values these tokens have
const apeSuitTopValues = new Set();
for (const tid of apeSuitItemTokens.slice(0, 20)) {
  const top = tokenToTraitMap[tid]?.['Top']?.[0];
  if (top) apeSuitTopValues.add(top);
}
w(`    Their Top values: ${[...apeSuitTopValues].join(', ')}`);
// Check what Bottom values these tokens have
const apeSuitBottomValues = new Set();
for (const tid of apeSuitItemTokens) {
  const bot = tokenToTraitMap[tid]?.['Bottom']?.[0];
  if (bot) apeSuitBottomValues.add(bot);
}
w(`    Their Bottom values: ${[...apeSuitBottomValues].join(', ')}`);
// The Ape Suit trait_type IS the detail — let's see if the scoring engine counts them as full suits
const apeSuitScoredCount = suitFamilies['Ape Suit']?.size || 0;
w(`    Scoring engine "Ape Suit" full suits: ${apeSuitScoredCount}`);
// So the Ape Suit detail trait IS the full suit identifier — 187 tokens have it
// The scoring engine only counts ~175 because it matches specific colorway pairs
// But the trait_type "Ape Suit" on a token means that token IS wearing an ape suit

// Since "Ape Suit" as a trait_type means the token is wearing the ape suit (top),
// and these tokens have various random bottoms, the scoring engine uses MATCHING
// top+bottom colorway to determine "full suit"

// Let's verify: do Ape Suit tokens have an Ape Suit bottom or just a random bottom?
const apeSuitTokenCheck = {};
for (const tid of apeSuitItemTokens.slice(0, 10)) {
  const traits = tokenToFullTraits[tid];
  const relevantTraits = traits.filter(t =>
    ['Top', 'Bottom', 'Ape Suit'].includes(t.trait_type)
  );
  apeSuitTokenCheck[tid] = relevantTraits.map(t => `${t.trait_type}:${t.value}`);
}
w(`    Sample Ape Suit tokens (first 10):`);
for (const [tid, traits] of Object.entries(apeSuitTokenCheck)) {
  w(`      Token ${tid}: ${traits.join(' | ')}`);
}

// ROBOT SUIT: check independently
w(`\n  Robot Suit verification:`);
const robotSuitItemTokens = traitTypeToTokens['Robot Suit'] || [];
w(`    Tokens with trait_type "Robot Suit": ${robotSuitItemTokens.length}`);
const robotTopCheck = new Set();
const robotBotCheck = new Set();
for (const tid of robotSuitItemTokens) {
  const top = tokenToTraitMap[tid]?.['Top']?.[0];
  const bot = tokenToTraitMap[tid]?.['Bottom']?.[0];
  if (top) robotTopCheck.add(top);
  if (bot) robotBotCheck.add(bot);
}
w(`    Their Top values: ${[...robotTopCheck].join(', ')}`);
w(`    Their Bottom values: ${[...robotBotCheck].join(', ')}`);
// How many have BOTH Top=Robot Suit AND Bottom=Robot Suit?
const robotBothCount = robotSuitItemTokens.filter(tid => {
  const top = tokenToTraitMap[tid]?.['Top']?.[0];
  const bot = tokenToTraitMap[tid]?.['Bottom']?.[0];
  return top === 'Robot Suit' && bot === 'Robot Suit';
}).length;
w(`    With Top=Robot Suit AND Bottom=Robot Suit: ${robotBothCount}`);

// ASTRONAUT: check independently
w(`\n  Astronaut verification:`);
const astroTopItemTokens = traitTypeToTokens['Astronaut Top'] || [];
const astroBotItemTokens = traitTypeToTokens['Astronaut Bottom'] || [];
w(`    Tokens with trait_type "Astronaut Top": ${astroTopItemTokens.length}`);
w(`    Tokens with trait_type "Astronaut Bottom": ${astroBotItemTokens.length}`);
// Intersection
const astroTopSet = new Set(astroTopItemTokens);
const astroBothCount = astroBotItemTokens.filter(t => astroTopSet.has(t)).length;
w(`    With BOTH Astronaut Top AND Astronaut Bottom trait types: ${astroBothCount}`);
// Check via Top/Bottom category
const astroTopCatTokens = tokensFor('Top', 'Astronaut Top');
const astroBotCatTokens = tokensFor('Bottom', 'Astronaut Bottom');
const astroBothCat = intersect(astroTopCatTokens, astroBotCatTokens);
w(`    Via category: Top=Astronaut Top AND Bottom=Astronaut Bottom: ${astroBothCat.size}`);

// TRACKSUIT: check
w(`\n  Tracksuit verification:`);
const tracksuitItemTokens = traitTypeToTokens['Tracksuit'] || [];
w(`    Tokens with trait_type "Tracksuit": ${tracksuitItemTokens.length}`);
const trackTopCheck = new Set();
const trackBotCheck = new Set();
for (const tid of tracksuitItemTokens) {
  const top = tokenToTraitMap[tid]?.['Top']?.[0];
  const bot = tokenToTraitMap[tid]?.['Bottom']?.[0];
  if (top) trackTopCheck.add(top);
  if (bot) trackBotCheck.add(bot);
}
w(`    Their Top values: ${[...trackTopCheck].join(', ')}`);
w(`    Their Bottom values: ${[...trackBotCheck].join(', ')}`);

// SUIT JACKET + SUIT PANTS
w(`\n  Formal Suit verification:`);
const suitJacketTokens = tokensFor('Top', 'Suit Jacket');
const suitPantsTokens = tokensFor('Bottom', 'Suit Pants');
const formalSuit = intersect(suitJacketTokens, suitPantsTokens);
w(`    Top=Suit Jacket: ${suitJacketTokens.size}`);
w(`    Bottom=Suit Pants: ${suitPantsTokens.size}`);
w(`    Both (formal suit): ${formalSuit.size}`);

// Now also: Suit Jacket & Waistcoat
const waistcoatTokens = tokensFor('Top', 'Suit Jacket & Waistcoat');
const waistcoatSuit = intersect(waistcoatTokens, suitPantsTokens);
w(`    Top=Suit Jacket & Waistcoat + Bottom=Suit Pants: ${waistcoatSuit.size}`);

// Formal Shoe intersection
const formalShoeTokens = tokensFor('Footwear', 'Formal Shoe');
w(`    Footwear=Formal Shoe: ${formalShoeTokens.size}`);
const fullFormal = intersect(formalSuit, formalShoeTokens);
w(`    Suit Jacket + Suit Pants + Formal Shoe: ${fullFormal.size}`);

// Now define the suit badges with VERIFIED counts

// Ape Suit: the trait_type "Ape Suit" IS the identifier — if you have it, you're wearing the suit
const apeSuitSet = new Set(apeSuitItemTokens);
addBadge('suits', 'Ape Suit', autoTier(apeSuitSet.size), 'Hold a beast wearing an Ape Suit', apeSuitSet,
  'Verified: trait_type "Ape Suit" = wearing the suit');

// Robot Suit: Top=Robot Suit AND Bottom=Robot Suit
const robotFullSet = new Set(robotSuitItemTokens.filter(tid => {
  const top = tokenToTraitMap[tid]?.['Top']?.[0];
  const bot = tokenToTraitMap[tid]?.['Bottom']?.[0];
  return top === 'Robot Suit' && bot === 'Robot Suit';
}));
addBadge('suits', 'Full Mech', autoTier(robotFullSet.size), 'Hold a beast with Robot Suit top + bottom', robotFullSet);

// Astronaut: both top and bottom
addBadge('suits', 'Space Cadet', autoTier(astroBothCat.size), 'Hold a beast with Astronaut top + bottom', astroBothCat);

// Tracksuit
const tracksuitSet = new Set(tracksuitItemTokens);
addBadge('suits', 'Trackstar', autoTier(tracksuitSet.size), 'Hold a beast wearing a Tracksuit', tracksuitSet,
  'Verified: trait_type "Tracksuit" = wearing the suit');

// Formal suit (jacket + pants)
addBadge('suits', 'Suited Up', autoTier(formalSuit.size), 'Hold a beast with Suit Jacket + Suit Pants', formalSuit);

// Suited & Booted (+ formal shoe)
addBadge('suits', 'Suited & Booted', autoTier(fullFormal.size), 'Hold a beast with Suit Jacket + Suit Pants + Formal Shoe', fullFormal);

// ------ 3E: FASHION COMBOS ------
sub('3E: FASHION COMBINATIONS');

// Cowboy: Cowboy Hat headwear + Cowboy Boots footwear
const cowboyHatTokens = tokensForAny('Headwear', ['Cowboy Hat', 'Cowboy Hat & Durag']);
const cowboyBootTokens = tokensFor('Footwear', 'Cowboy Boots');
const cowboyCombo = intersect(cowboyHatTokens, cowboyBootTokens);
addBadge('fashion', 'Cowboy', autoTier(cowboyCombo.size), 'Hold a beast with Cowboy Hat + Cowboy Boots', cowboyCombo);
if (cowboyCombo.size <= 20) w(`    Tokens: ${[...cowboyCombo].join(', ')}`);

// Lab Rat: Lab Coat top + any glasses headwear
// First check what Lab Coat tokens have
const labCoatTokens = tokensFor('Top', 'Lab Coat');
w(`  Lab Coat tokens: ${labCoatTokens.size}`);
// What headwear do lab coat tokens have?
const labCoatHeadwear = {};
for (const tid of labCoatTokens) {
  const hw = tokenToTraitMap[tid]?.['Headwear'];
  if (hw) {
    for (const h of hw) {
      labCoatHeadwear[h] = (labCoatHeadwear[h] || 0) + 1;
    }
  }
}
w(`  Lab Coat holders' headwear: ${JSON.stringify(labCoatHeadwear)}`);

// Lab Rat with Pixel Glasses or 3D Glasses (these are Headwear, not Eyes)
const pixelGlassTokens = tokensFor('Headwear', 'Pixel Glasses');
const tdGlassTokens = tokensFor('Headwear', '3D Glasses');
const scienceGlasses = new Set([...pixelGlassTokens, ...tdGlassTokens]);
const labRat = intersect(labCoatTokens, scienceGlasses);
addBadge('fashion', 'Lab Rat', autoTier(labRat.size), 'Hold a beast with Lab Coat + Pixel/3D Glasses', labRat);
if (labRat.size <= 20) w(`    Tokens: ${[...labRat].join(', ')}`);

// Chef: Chefs Uniform + Chef Hat
const chefUniformTokens = tokensFor('Top', 'Chefs Uniform');
const chefHatTokens = tokensFor('Headwear', 'Chef Hat');
const chefCombo = intersect(chefUniformTokens, chefHatTokens);
addBadge('fashion', 'Head Chef', autoTier(chefCombo.size), 'Hold a beast with Chefs Uniform + Chef Hat', chefCombo);
if (chefCombo.size <= 20) w(`    Tokens: ${[...chefCombo].join(', ')}`);

// Skater: Skateboard accessory + sneaker footwear
const skateTokens = new Set(traitTypeToTokens['Skateboard'] || []);
const sneakerFootwear = tokensForAny('Footwear', ['Casual Sneakers', 'High-Top Sneakers', 'Shell-Toe Sneakers', 'Sock Sneakers', 'Tech Sneakers']);
const skaterCombo = intersect(skateTokens, sneakerFootwear);
addBadge('fashion', 'Skater', autoTier(skaterCombo.size), 'Hold a beast with Skateboard + sneaker footwear', skaterCombo);

// Biker: Biker Jacket + Boots
const bikerJacketTokens = tokensForAny('Top', ['Biker Jacket', 'Biker Jacket & Turtleneck']);
const bootsTokens = tokensForAny('Footwear', ['Boots', 'Utility Boots', 'Hiking Boots']);
const bikerCombo = intersect(bikerJacketTokens, bootsTokens);
addBadge('fashion', 'Road Beast', autoTier(bikerCombo.size), 'Hold a beast with Biker Jacket + Boots', bikerCombo);

// Preppy: Blazer/Sweater Vest + Formal Shoe
const preppyTops = tokensForAny('Top', ['Blazer', 'Sweater Vest', 'Sweater Vest & Shirt', 'Sweater Vest & Blouse']);
const preppyCombo = intersect(preppyTops, formalShoeTokens);
addBadge('fashion', 'Prep School', autoTier(preppyCombo.size), 'Hold a beast with Blazer/Sweater Vest + Formal Shoe', preppyCombo);

// Surfer: Surfboard + Slides
const surfboardTokens = new Set(traitTypeToTokens['Surfboard'] || []);
const slidesTokens = tokensFor('Footwear', 'Slides');
const surferCombo = intersect(surfboardTokens, slidesTokens);
w(`  Surfboard tokens: ${surfboardTokens.size}, Slides: ${slidesTokens.size}`);
addBadge('fashion', 'Surf\'s Up', autoTier(surfboardTokens.size), 'Hold a beast with Surfboard', surfboardTokens, 'Any surfboard counts');

// Spartan + Medieval
const spartanTokens = tokensFor('Headwear', 'Spartan Helmet');
const medievalBala = tokensFor('Balaclava', 'Medieval');
const spartanMedieval = intersect(spartanTokens, medievalBala);
w(`  Spartan Helmet: ${spartanTokens.size}, Medieval balaclava: ${medievalBala.size}`);
addBadge('fashion', 'Gladiator', autoTier(spartanMedieval.size), 'Hold a beast with Medieval balaclava + Spartan Helmet', spartanMedieval);
if (spartanMedieval.size <= 20) w(`    Tokens: ${[...spartanMedieval].join(', ')}`);

// Football: Football Helmet + Football Shirt
const footballHelmet = tokensFor('Headwear', 'Football Helmet');
const footballShirt = tokensForAny('Top', ['Football Shirt']);
const footballCombo = intersect(footballHelmet, footballShirt);
addBadge('fashion', 'Gridiron', autoTier(footballCombo.size), 'Hold a beast with Football Helmet + Football Shirt', footballCombo);
if (footballCombo.size <= 20) w(`    Tokens: ${[...footballCombo].join(', ')}`);

// ------ 3F: ACCESSORIES ------
sub('3F: ACCESSORY BADGES');

// Map out all accessories with supply
const allAccessories = valuesFor('Accessory');
w(`  All ${allAccessories.length} accessories:`);
for (const a of allAccessories) {
  const s = supply('Accessory', a);
  const grail = grailScores[`Accessory:${a}`];
  w(`    ${a}: ${s}${grail ? ` [grail: ${grail.compositeScore.toFixed(1)}]` : ''}`);
}

// Weapons
const weaponNames = ['Bat', 'Nanchaku', 'Crowbar', 'Bomb', 'Axe'];
const weaponTokens = tokensForAny('Accessory', weaponNames);
// Also check "Bat Wood " (note trailing space in data)
const batWoodTokens = tokensFor('Accessory', 'Bat Wood ');
const allWeaponTokens = new Set([...weaponTokens, ...batWoodTokens]);
addBadge('accessories', 'Armed & Dangerous', autoTier(allWeaponTokens.size), `Hold a beast with weapon accessory (${weaponNames.join('/')}/Bat Wood)`, allWeaponTokens);
w(`    Breakdown: ${weaponNames.map(w => `${w}:${supply('Accessory', w)}`).join(', ')}, Bat Wood:${batWoodTokens.size}`);

// Spray Can
const sprayTokens = tokensFor('Accessory', 'Spray Can');
addBadge('accessories', 'Vandal', autoTier(sprayTokens.size), 'Hold a beast with Spray Can', sprayTokens);

// Boombox
const boomboxTokens = tokensFor('Accessory', 'Boombox');
addBadge('accessories', 'Boombox Beast', autoTier(boomboxTokens.size), 'Hold a beast with Boombox', boomboxTokens);

// Crypto
const btcTokens = tokensFor('Accessory', 'Bitcoin');
const ethTokens = tokensFor('Accessory', 'Ethereum');
const cryptoTokens = new Set([...btcTokens, ...ethTokens]);
addBadge('accessories', 'Crypto Native', autoTier(cryptoTokens.size), 'Hold a beast with Bitcoin or Ethereum accessory', cryptoTokens);

// Money
const moneyTokens = tokensForAny('Accessory', ['Money Stacks', 'Gold Bars', 'Money Bag']);
addBadge('accessories', 'Money Moves', autoTier(moneyTokens.size), 'Hold a beast with Money Stacks, Gold Bars, or Money Bag', moneyTokens);

// Musical instruments
const musicTokens = new Set([
  ...(traitTypeToTokens['Acoustic Guitar'] || []),
  ...(traitTypeToTokens['Electric Guitar'] || []),
  ...(traitTypeToTokens['Flying V Guitar'] || []),
  ...(traitTypeToTokens['Microphone'] || []),
  ...tokensFor('Accessory', 'Boombox'),
]);
addBadge('accessories', 'Band Practice', autoTier(musicTokens.size), 'Hold a beast with guitar, microphone, or boombox', musicTokens);

// Sports
const sportsTokens = new Set([
  ...(traitTypeToTokens['Basketball'] || []),
  ...(traitTypeToTokens['Tennis Racket'] || []),
  ...(traitTypeToTokens['Croquet'] || []),
  ...tokensFor('Accessory', 'Football'),
  ...tokensFor('Accessory', 'Rugby Ball'),
  ...(traitTypeToTokens['Champions Cup'] || []),
]);
addBadge('accessories', 'Sports Beast', autoTier(sportsTokens.size), 'Hold a beast with sports equipment', sportsTokens);

// Books/Nerdy
const nerdTokens = new Set([
  ...(traitTypeToTokens['Book'] || []),
  ...(traitTypeToTokens['Laptop'] || []),
  ...tokensFor('Accessory', 'Calculator'),
]);
addBadge('accessories', 'Bookworm', autoTier(nerdTokens.size), 'Hold a beast with Book, Laptop, or Calculator', nerdTokens);

// Food & Drink
const foodAccessories = ['Apple', 'Burger', 'Donut', 'Ice Cream', 'Spatula', 'Spatula & Fries', 'Soda'];
const foodTokens = new Set();
for (const f of foodAccessories) {
  for (const t of tokensFor('Accessory', f)) foodTokens.add(t);
}
// Also add trait types that are food
for (const tt of ['Cereal', 'Boba Tea', 'Mug']) {
  for (const t of (traitTypeToTokens[tt] || [])) foodTokens.add(t);
}
addBadge('accessories', 'Snack Attack', autoTier(foodTokens.size), 'Hold a beast with food/drink item', foodTokens);

// Photography
const photoTokens = new Set([
  ...tokensFor('Accessory', 'Camera'),
  ...(traitTypeToTokens['Polaroid'] || []),
]);
addBadge('accessories', 'Shutterbug', autoTier(photoTokens.size), 'Hold a beast with Camera or Polaroid', photoTokens);

// ------ 3G: GEMSTONES & CHAINS ------
sub('3G: GEMSTONES & CHAINS');

const gemValues = valuesFor('Gemstone');
w(`  Gemstone types: ${gemValues.join(', ')}`);
for (const g of gemValues) {
  w(`    ${g}: ${supply('Gemstone', g)} [grail: ${grailScores[`Gemstone:${g}`]?.compositeScore.toFixed(1) || 'N/A'}]`);
}

const diamondTokens = tokensFor('Gemstone', 'Diamond');
addBadge('gems', 'Diamond Studded', autoTier(diamondTokens.size), 'Hold a beast with Diamond gemstone', diamondTokens);

const rubyTokens = tokensFor('Gemstone', 'Ruby');
addBadge('gems', 'Ruby Red', autoTier(rubyTokens.size), 'Hold a beast with Ruby gemstone', rubyTokens, 'grail: 41.4');

const emeraldTokens = tokensFor('Gemstone', 'Emerald');
addBadge('gems', 'Emerald City', autoTier(emeraldTokens.size), 'Hold a beast with Emerald gemstone', emeraldTokens);

const sapphireTokens = tokensFor('Gemstone', 'Sapphire');
addBadge('gems', 'Sapphire Ice', autoTier(sapphireTokens.size), 'Hold a beast with Sapphire gemstone', sapphireTokens);

// All gemstones combined
const anyGemTokens = tokensForAny('Gemstone', gemValues);
addBadge('gems', 'Gem Collector', autoTier(anyGemTokens.size), 'Hold a beast with any Gemstone', anyGemTokens);

// Gold Chain
const goldChainTokens = tokensFor('Chain', 'Gold');
addBadge('gems', 'Gold Chain', autoTier(goldChainTokens.size), 'Hold a beast with Gold chain', goldChainTokens, 'grail: 40.3');

// ------ 3H: HEADWEAR ------
sub('3H: NOTABLE HEADWEAR');

// Crown
const crownTokens = tokensFor('Headwear', 'Crown');
addBadge('headwear', 'Crown Jewels', autoTier(crownTokens.size), 'Hold a beast with Crown headwear', crownTokens);

// Spiked Crown
const spikedCrownTokens = tokensFor('Headwear', 'Spiked Crown');
addBadge('headwear', 'Spiked Crown', autoTier(spikedCrownTokens.size), 'Hold a beast with Spiked Crown', spikedCrownTokens);

// Halo
const haloTokens = tokensFor('Headwear', 'Halo');
addBadge('headwear', 'Halo Effect', autoTier(haloTokens.size), 'Hold a beast with Halo headwear', haloTokens);

// Masks
const maskTokens = tokensForAny('Headwear', ['Gas Mask', 'Plague Doctor Mask', 'Hockey Mask', 'Fume Mask', 'Sabertooth Mask', 'Phantom']);
addBadge('headwear', 'Masked Beast', autoTier(maskTokens.size), 'Hold a beast with a mask (Gas/Plague Doctor/Hockey/Fume/Sabertooth/Phantom)', maskTokens);

// Spartan Helmet (rare)
addBadge('headwear', 'Spartan', autoTier(spartanTokens.size), 'Hold a beast with Spartan Helmet', spartanTokens);

// Flower Crown
const flowerCrownTokens = tokensFor('Headwear', 'Flower Crown');
addBadge('headwear', 'Flower Power', autoTier(flowerCrownTokens.size), 'Hold a beast with Flower Crown', flowerCrownTokens);

// Backwards Trucker Hat (9 tokens, grail 46.4)
const backTruckerTokens = tokensFor('Headwear', 'Backwards Trucker Hat');
addBadge('headwear', 'Backwards Trucker', autoTier(backTruckerTokens.size), 'Hold a beast with Backwards Trucker Hat', backTruckerTokens, 'grail: 46.4');

// ------ 3I: DNA ------
sub('3I: DNA');

const zombieTokens = tokensFor('DNA', 'Zombie');
addBadge('dna', 'Zombie', autoTier(zombieTokens.size), 'Hold a Zombie DNA beast', zombieTokens);

const angelTokens = tokensFor('DNA', 'Angel');
addBadge('dna', 'Angel Wings', autoTier(angelTokens.size), 'Hold an Angel DNA beast', angelTokens);

const bonesTokens = tokensFor('DNA', 'Bones');
addBadge('dna', 'Bare Bones', autoTier(bonesTokens.size), 'Hold a Bones DNA beast', bonesTokens);

// ------ 3J: RARES (1/1 designs) ------
sub('3J: RARES (1/1 designs)');

const rareDesigns = valuesFor('Rare');
w(`  Total rare designs: ${rareDesigns.length}`);
let totalRareTokens = 0;
const rareGrouped = {};
for (const r of rareDesigns) {
  const s = supply('Rare', r);
  totalRareTokens += s;
  w(`    ${r}: ${s} tokens [grail: ${grailScores[`Rare:${r}`]?.compositeScore.toFixed(1) || 'N/A'}]`);
}

const allRareTokens = tokensForAny('Rare', rareDesigns);
addBadge('rares', 'Rare Breed', autoTier(allRareTokens.size), 'Hold any Rare (1/1 design)', allRareTokens, `${rareDesigns.length} designs, ${totalRareTokens} tokens`);

// Themed rare groups
const monsterNames = ['Dragon', 'Demon', 'Demon Lord', 'Vampire', 'Grim Reaper', 'Mummy', 'Witch', 'Medusa', 'Yeti'];
const monsterTokens = tokensForAny('Rare', rareDesigns.filter(r => monsterNames.some(m => r.includes(m))));
addBadge('rares', 'Monster Mash', autoTier(monsterTokens.size), `Hold a monster Rare (${monsterNames.join('/')})`, monsterTokens);

const heavenlyNames = ['Angel', 'Lady Angel', 'Lord Angel', 'Fairy', 'Unicorn', 'Unicorn Star', 'Genie'];
const heavenlyTokens = tokensForAny('Rare', rareDesigns.filter(r => heavenlyNames.some(h => r === h || r.startsWith(h))));
addBadge('rares', 'Heavenly', autoTier(heavenlyTokens.size), `Hold a heavenly Rare (${heavenlyNames.join('/')})`, heavenlyTokens);

const crimeNames = ['Godfather', 'Hitman', 'Henchman', 'Detective'];
const crimeTokens = tokensForAny('Rare', rareDesigns.filter(r => crimeNames.some(c => r.includes(c))));
addBadge('rares', 'Crime Boss', autoTier(crimeTokens.size), `Hold a crime Rare (${crimeNames.join('/')})`, crimeTokens);

const eastNames = ['Samurai', 'Ninja', 'Kitsune', 'Anime Ninja'];
const eastTokens = tokensForAny('Rare', rareDesigns.filter(r => eastNames.some(e => r.includes(e))));
addBadge('rares', 'Legend of the East', autoTier(eastTokens.size), `Hold an eastern Rare (${eastNames.join('/')})`, eastTokens);

// ------ 3K: SKIN TONE ------
sub('3K: SKIN TONE');

const vitiligoTokens = tokensFor('Human', 'Vitiligo');
addBadge('skin', 'Vitiligo', autoTier(vitiligoTokens.size), 'Hold a beast with Vitiligo skin tone', vitiligoTokens);

// ------ 3L: INK ------
sub('3L: INK');

const inkValues = valuesFor('Ink');
const allInkTokens = tokensForAny('Ink', inkValues);
addBadge('ink', 'Ink\'d Up', autoTier(allInkTokens.size), `Hold a beast with any Ink (${inkValues.join('/')})`, allInkTokens);

// Wabori specifically (highest grail)
const waboriTokens = tokensFor('Ink', 'Wabori');
addBadge('ink', 'Wabori', autoTier(waboriTokens.size), 'Hold a beast with Wabori ink', waboriTokens, 'grail: 31.5');

// ------ 3M: EYES ------
sub('3M: EYES');

const toonTokens = tokensFor('Eyes', 'Toon Pupils');
addBadge('eyes', 'Toon Eyes', autoTier(toonTokens.size), 'Hold a beast with Toon Pupils', toonTokens);

const dazedTokens = tokensFor('Eyes', 'Dazed Pupils');
addBadge('eyes', 'Dazed', autoTier(dazedTokens.size), 'Hold a beast with Dazed Pupils', dazedTokens);

const lizardTokens = tokensFor('Eyes', 'Lizard Pupils');
addBadge('eyes', 'Lizard Eyes', autoTier(lizardTokens.size), 'Hold a beast with Lizard Pupils', lizardTokens);

const starryTokens = tokensFor('Eyes', 'Starry Eyeshadow');
addBadge('eyes', 'Starry Eyed', autoTier(starryTokens.size), 'Hold a beast with Starry Eyeshadow', starryTokens);

// ------ 3N: BEASTHOOD ------
sub('3N: BEASTHOOD NEIGHBORHOODS');

const beasthoods = valuesFor('Beasthood');
w(`  Total neighborhoods: ${beasthoods.length}`);
for (const b of beasthoods) {
  w(`    ${b}: ${supply('Beasthood', b)}`);
}

// ------ 3O: SCORING ENGINE BADGES ------
sub('3O: SCORING-BASED BADGES');

// Drip Lord: top 10% composite score
const allCompositeScores = Object.entries(tokenScores)
  .map(([id, s]) => ({ id, score: s.compositeScore }))
  .sort((a, b) => b.score - a.score);

const top10pct = Math.ceil(allCompositeScores.length * 0.1);
const top5pct = Math.ceil(allCompositeScores.length * 0.05);
const top1pct = Math.ceil(allCompositeScores.length * 0.01);

w(`  Score percentiles:`);
w(`    Top 10% (${top10pct} tokens): score >= ${allCompositeScores[top10pct - 1]?.score.toFixed(1)}`);
w(`    Top 5% (${top5pct} tokens): score >= ${allCompositeScores[top5pct - 1]?.score.toFixed(1)}`);
w(`    Top 1% (${top1pct} tokens): score >= ${allCompositeScores[top1pct - 1]?.score.toFixed(1)}`);

const dripLordTokens = new Set(allCompositeScores.slice(0, top10pct).map(s => s.id));
addBadge('scoring', 'Drip Lord', 'uncommon', 'Hold a beast in the top 10% composite score', dripLordTokens);

const eliteTokens = new Set(allCompositeScores.slice(0, top1pct).map(s => s.id));
addBadge('scoring', 'Elite Beast', 'uncommon', 'Hold a beast in the top 1% composite score', eliteTokens);

// Identity Combo tokens
const identityComboTokens = new Set(
  Object.entries(tokenScores).filter(([id, s]) => s.identityCombo).map(([id]) => id)
);
addBadge('scoring', 'Built Different', autoTier(identityComboTokens.size), 'Hold a beast with a premium identity combo', identityComboTokens);

// Grail Hunter: hold a token with any trait scoring 50+
const grail50Traits = new Set(
  Object.entries(grailScores).filter(([k, v]) => v.compositeScore >= 50).map(([k]) => k)
);
const grailHunterTokens = new Set();
for (const [tokenId, traits] of Object.entries(traitCache)) {
  for (const t of traits) {
    if (grail50Traits.has(`${t.trait_type}:${t.value}`)) {
      grailHunterTokens.add(tokenId);
      break;
    }
  }
}
addBadge('scoring', 'Grail Hunter', autoTier(grailHunterTokens.size), 'Hold a beast with a top-tier grail trait (score 50+)', grailHunterTokens, `${grail50Traits.size} qualifying traits`);

// ============================================================
// PASS 4: WALLET-LEVEL BADGES (from sales data)
// ============================================================

section('PASS 4: WALLET-LEVEL BADGES (sales data)');

// Build wallet purchase/sell history
const walletBuys = {};
const walletSells = {};
for (const sale of salesCache) {
  if (!walletBuys[sale.buyer]) walletBuys[sale.buyer] = [];
  walletBuys[sale.buyer].push(sale);
  if (!walletSells[sale.seller]) walletSells[sale.seller] = [];
  walletSells[sale.seller].push(sale);
}

const uniqueBuyers = Object.keys(walletBuys).length;
const buyOnlyWallets = Object.keys(walletBuys).filter(w => !walletSells[w]);

w(`  Unique buyer wallets: ${uniqueBuyers}`);
w(`  Buy-only wallets (Diamond Hands): ${buyOnlyWallets.length}`);

// Purchase count distribution
const purchaseCounts = {};
for (const [wallet, buys] of Object.entries(walletBuys)) {
  const c = buys.length;
  if (c >= 50) purchaseCounts['50+'] = (purchaseCounts['50+'] || 0) + 1;
  else if (c >= 20) purchaseCounts['20-49'] = (purchaseCounts['20-49'] || 0) + 1;
  else if (c >= 10) purchaseCounts['10-19'] = (purchaseCounts['10-19'] || 0) + 1;
  else if (c >= 5) purchaseCounts['5-9'] = (purchaseCounts['5-9'] || 0) + 1;
  else if (c >= 3) purchaseCounts['3-4'] = (purchaseCounts['3-4'] || 0) + 1;
  else purchaseCounts[String(c)] = (purchaseCounts[String(c)] || 0) + 1;
}
w(`  Purchase count distribution:`);
for (const [bucket, count] of Object.entries(purchaseCounts).sort()) {
  w(`    ${bucket}: ${count} wallets`);
}

// Milestone badges
w(`  Milestone badge qualifying wallets:`);
const milestones = [1, 5, 10, 20, 50];
for (const m of milestones) {
  const qualifying = Object.values(walletBuys).filter(buys => buys.length >= m).length;
  w(`    ${m}+ purchases: ${qualifying} wallets`);
}

// OG Beast — bought before July 2023
const july2023 = new Date('2023-07-01').getTime() / 1000;
const ogWallets = new Set();
for (const sale of salesCache) {
  if (sale.timestamp < july2023) ogWallets.add(sale.buyer);
}
w(`  OG buyers (pre-July 2023): ${ogWallets.size} wallets`);

// 2x flip count
let flipCount = 0;
const walletTokenCost = {};
const sortedSales = [...salesCache].sort((a, b) => a.timestamp - b.timestamp);
for (const sale of sortedSales) {
  if (!walletTokenCost[sale.buyer]) walletTokenCost[sale.buyer] = {};
  walletTokenCost[sale.buyer][sale.tokenId] = sale.priceEth;
}
for (const sale of salesCache) {
  const cost = walletTokenCost[sale.seller]?.[sale.tokenId];
  if (cost && sale.priceEth >= cost * 2) flipCount++;
}
w(`  2x+ flip sales: ${flipCount}`);

// Whale trades
const whale1eth = salesCache.filter(s => s.priceEth >= 1.0).length;
const whale2eth = salesCache.filter(s => s.priceEth >= 2.0).length;
const whale5eth = salesCache.filter(s => s.priceEth >= 5.0).length;
w(`  Sales >= 1 ETH: ${whale1eth}`);
w(`  Sales >= 2 ETH: ${whale2eth}`);
w(`  Sales >= 5 ETH: ${whale5eth}`);

// Date range
const dates = salesCache.map(s => s.timestamp).sort((a,b) => a - b);
w(`  Date range: ${new Date(dates[0] * 1000).toISOString().split('T')[0]} to ${new Date(dates[dates.length-1] * 1000).toISOString().split('T')[0]}`);

// ============================================================
// PASS 5: FINAL VERIFIED BADGE LIST + CROSS-CHECK
// ============================================================

section('PASS 5: CROSS-VERIFICATION');

// Verify every badge has non-zero qualifying tokens
const impossible = badges.filter(b => b.count === 0);
const valid = badges.filter(b => b.count > 0);

w(`\n  Total badges defined: ${badges.length}`);
w(`  Valid (>0 tokens): ${valid.length}`);
w(`  Impossible (0 tokens): ${impossible.length}`);

if (impossible.length > 0) {
  w(`\n  IMPOSSIBLE BADGES (must be fixed or removed):`);
  for (const b of impossible) {
    w(`    ${b.name} — ${b.criteria}`);
  }
}

// Check tier appropriateness
w(`\n  TIER AUDIT (checking tier matches supply):`);
for (const b of valid) {
  const suggested = autoTier(b.count);
  if (suggested !== b.tier) {
    w(`    ⚠ ${b.name}: assigned ${b.tier} but supply ${b.count} suggests ${suggested}`);
  }
}

// Check for near-duplicates
w(`\n  OVERLAP CHECK (badges with >50% token overlap):`);
for (let i = 0; i < valid.length; i++) {
  if (!valid[i].tokens) continue;
  for (let j = i + 1; j < valid.length; j++) {
    if (!valid[j].tokens) continue;
    const overlap = intersect(valid[i].tokens, valid[j].tokens);
    const smaller = Math.min(valid[i].count, valid[j].count);
    if (smaller > 0 && overlap.size / smaller > 0.5) {
      w(`    ${valid[i].name} (${valid[i].count}) ↔ ${valid[j].name} (${valid[j].count}): ${overlap.size} overlap (${(overlap.size/smaller*100).toFixed(0)}% of smaller)`);
    }
  }
}

// ============================================================
// FINAL SUMMARY: RECOMMENDED BADGE SET
// ============================================================

section('FINAL RECOMMENDED BADGE SET');

// Group by category
const catOrder = ['balaclava', 'style', 'color', 'suits', 'fashion', 'accessories', 'gems', 'headwear', 'dna', 'rares', 'skin', 'ink', 'eyes', 'scoring'];
const catNames = {
  balaclava: 'Balaclava Identity',
  style: 'Balaclava Style',
  color: 'Color Coordination',
  suits: 'Full Suits',
  fashion: 'Fashion Combos',
  accessories: 'Accessories',
  gems: 'Gemstones & Chains',
  headwear: 'Notable Headwear',
  dna: 'DNA',
  rares: 'Rares (1/1 Designs)',
  skin: 'Skin Tone',
  ink: 'Ink',
  eyes: 'Eyes',
  scoring: 'Scoring Engine'
};

const tierLabels = { common: 'Common', uncommon: 'Uncommon', rare: 'Rare', epic: 'Epic', legendary: 'Legendary' };

let totalBadges = 0;
for (const cat of catOrder) {
  const catBadges = valid.filter(b => b.category === cat);
  if (catBadges.length === 0) continue;

  w(`\n  ### ${catNames[cat] || cat}`);
  w(`  ${'Badge'.padEnd(25)} ${'Tier'.padEnd(12)} ${'Tokens'.padEnd(10)} Criteria`);
  w(`  ${'-'.repeat(25)} ${'-'.repeat(12)} ${'-'.repeat(10)} ${'-'.repeat(40)}`);

  for (const b of catBadges.sort((a, b) => b.count - a.count)) {
    w(`  ${b.name.padEnd(25)} ${tierLabels[b.tier].padEnd(12)} ${String(b.count).padEnd(10)} ${b.criteria}`);
    totalBadges++;
  }
}

w(`\n  TOTAL VERIFIED BADGES: ${totalBadges}`);

// Tier distribution
const tierDist = {};
for (const b of valid) {
  tierDist[b.tier] = (tierDist[b.tier] || 0) + 1;
}
w(`\n  Tier distribution:`);
for (const [tier, count] of Object.entries(tierDist).sort()) {
  w(`    ${tierLabels[tier]}: ${count}`);
}

// Write output
const outputText = out.join('\n');
fs.writeFileSync('C:/Users/rhodg/source/beast-badges/DEEP-ANALYSIS.txt', outputText);
console.log(outputText);
console.log('\n\nAnalysis written to DEEP-ANALYSIS.txt');
