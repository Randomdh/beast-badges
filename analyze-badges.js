/**
 * Beast Badge Validator — Analyze every proposed badge against real AKCB data
 *
 * Data sources (from akc-sales-bot):
 * - trait-cache.json: All 10,000 tokens with full trait arrays
 * - trait-supply.json: Supply count per trait
 * - grail-scores.json: Grail scores for 1,793 traits
 * - token-scores.json: Composite scores for ~10,000 tokens
 * - sales-cache.json: ~38,000 historic sales
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = 'C:/Users/rhodg/source/akc-sales-bot';

// Load all data
console.log('Loading data...');
const traitCache = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'trait-cache.json'), 'utf8'));
const traitSupply = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'trait-supply.json'), 'utf8'));
const grailScores = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'grail-scores.json'), 'utf8'));
const tokenScores = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'token-scores.json'), 'utf8'));
const salesCache = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'sales-cache.json'), 'utf8'));

const totalTokens = Object.keys(traitCache).length;
console.log(`Loaded: ${totalTokens} tokens, ${Object.keys(traitSupply).length} traits, ${salesCache.length} sales\n`);

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getTraitType(tokenId) {
  const traits = traitCache[tokenId];
  if (!traits) return {};
  const map = {};
  for (const t of traits) {
    if (!map[t.trait_type]) map[t.trait_type] = [];
    map[t.trait_type].push(t.value);
  }
  return map;
}

function getTokensWithTrait(traitType, traitValue) {
  const tokens = [];
  for (const [tokenId, traits] of Object.entries(traitCache)) {
    if (traits.some(t => t.trait_type === traitType && t.value === traitValue)) {
      tokens.push(tokenId);
    }
  }
  return tokens;
}

function getTokensMatchingAny(traitType, values) {
  const tokens = [];
  const valSet = new Set(values);
  for (const [tokenId, traits] of Object.entries(traitCache)) {
    if (traits.some(t => t.trait_type === traitType && valSet.has(t.value))) {
      tokens.push(tokenId);
    }
  }
  return tokens;
}

function getTokensWithTraitContaining(traitType, substring) {
  const tokens = [];
  for (const [tokenId, traits] of Object.entries(traitCache)) {
    if (traits.some(t => t.trait_type === traitType && t.value.toLowerCase().includes(substring.toLowerCase()))) {
      tokens.push(tokenId);
    }
  }
  return tokens;
}

// Get all unique trait types
function getAllTraitTypes() {
  const types = new Set();
  for (const traits of Object.values(traitCache)) {
    for (const t of traits) types.add(t.trait_type);
  }
  return [...types].sort();
}

// Get all unique values for a trait type
function getTraitValues(traitType) {
  const values = new Set();
  for (const traits of Object.values(traitCache)) {
    for (const t of traits) {
      if (t.trait_type === traitType) values.add(t.value);
    }
  }
  return [...values].sort();
}

// Count tokens where a specific color appears in N+ traits
function getColorMatchTokens(color, minCount) {
  const results = [];
  const colorLower = color.toLowerCase();
  for (const [tokenId, traits] of Object.entries(traitCache)) {
    let colorCount = 0;
    for (const t of traits) {
      if (t.value.toLowerCase().includes(colorLower)) colorCount++;
    }
    if (colorCount >= minCount) results.push({ tokenId, colorCount });
  }
  return results;
}

// Find tokens with specific trait combinations
function getTokensWithCombo(conditions) {
  // conditions: [{ traitType, values (array) or contains (string) }]
  const results = [];
  for (const [tokenId, traits] of Object.entries(traitCache)) {
    let allMatch = true;
    for (const cond of conditions) {
      const match = traits.some(t => {
        if (t.trait_type !== cond.traitType) return false;
        if (cond.values) return cond.values.includes(t.value);
        if (cond.contains) return t.value.toLowerCase().includes(cond.contains.toLowerCase());
        if (cond.value) return t.value === cond.value;
        return false;
      });
      if (!match) { allMatch = false; break; }
    }
    if (allMatch) results.push(tokenId);
  }
  return results;
}

// Build wallet -> purchases map from sales
function buildWalletPurchases() {
  const wallets = {};
  for (const sale of salesCache) {
    if (!wallets[sale.buyer]) wallets[sale.buyer] = [];
    wallets[sale.buyer].push(sale);
  }
  return wallets;
}

// Build wallet -> sales map
function buildWalletSales() {
  const wallets = {};
  for (const sale of salesCache) {
    if (!wallets[sale.seller]) wallets[sale.seller] = [];
    wallets[sale.seller].push(sale);
  }
  return wallets;
}

// ============================================================
// ANALYSIS OUTPUT
// ============================================================

const output = [];
function section(title) { output.push(`\n${'='.repeat(70)}`); output.push(`  ${title}`); output.push('='.repeat(70)); }
function badge(name, tier, claimed, actual, note) {
  const status = actual > 0 ? 'OK' : 'IMPOSSIBLE';
  const match = claimed === actual ? '' : ` (proposal says ${claimed})`;
  output.push(`  [${status}] ${name} (${tier}) — ${actual} qualifying tokens${match}${note ? ' — ' + note : ''}`);
}
function info(text) { output.push(`    ${text}`); }
function warn(text) { output.push(`    ⚠ ${text}`); }

// ============================================================
// 1. TRAIT TYPES OVERVIEW
// ============================================================

section('TRAIT TYPES IN COLLECTION');
const traitTypes = getAllTraitTypes();
for (const tt of traitTypes) {
  const vals = getTraitValues(tt);
  output.push(`  ${tt}: ${vals.length} values`);
}

// ============================================================
// 2. BALACLAVA IDENTITY BADGES
// ============================================================

section('CATEGORY 1: BALACLAVA IDENTITY');

// Check all balaclava values
const balaclavas = getTraitValues('Balaclava');
info(`Total balaclava types: ${balaclavas.length}`);
info(`Values: ${balaclavas.join(', ')}`);

// Specific balaclava badges
const balaclavaChecks = [
  { name: 'Ape Gang', tier: 'Uncommon', value: 'Ape', claimed: '469' },
  { name: 'Mech Head', tier: 'Uncommon', value: 'Robot', claimed: '432' },
  { name: 'Wolf Pack', tier: 'Rare', value: 'Wolf', claimed: '313' },
  { name: 'Knight\'s Watch', tier: 'Epic', value: 'Medieval', claimed: '40' },
  { name: 'Skull Squad', tier: 'Rare', value: 'Skull', claimed: '333' },
  { name: 'Panda Express', tier: 'Common', value: 'Panda', claimed: '403' },
];

for (const bc of balaclavaChecks) {
  const supply = traitSupply[`Balaclava:${bc.value}`] || 0;
  badge(bc.name, bc.tier, bc.claimed, supply);
}

// Good Boy — Beagle, Cocker Spaniel, or Pooch
const goodBoyValues = ['Beagle', 'Cocker Spaniel', 'Pooch'];
let goodBoyTotal = 0;
for (const v of goodBoyValues) {
  const s = traitSupply[`Balaclava:${v}`] || 0;
  goodBoyTotal += s;
  info(`  ${v}: ${s}`);
}
badge('Good Boy', 'Common', '866', goodBoyTotal, `Beagle + Cocker Spaniel + Pooch`);

// Zoo Keeper — 5+ different balaclava types in wallet
info('Zoo Keeper & Face Off require wallet-level analysis (can\'t determine from trait data alone)');

// Face Collector — all 4 premium balaclavas
const premiumBalas = ['Ape', 'Robot', 'Wolf', 'Medieval'];
info(`Face Collector requires all 4: ${premiumBalas.map(b => `${b} (${traitSupply[`Balaclava:${b}`] || 0})`).join(', ')}`);
info(`Medieval at 40 supply is the hard cap`);

// ============================================================
// 3. CLEAN FITS & COLOR
// ============================================================

section('CATEGORY 2: CLEAN FITS & COLOR');

// Blackout — 5+ black traits
const blackout = getColorMatchTokens('black', 5);
badge('Blackout', 'Epic', '22', blackout.length);
if (blackout.length > 0 && blackout.length <= 30) {
  info(`Token IDs: ${blackout.map(b => b.tokenId).join(', ')}`);
}

// All Black Everything — 4+ black traits
const allBlack4 = getColorMatchTokens('black', 4);
badge('All Black Everything', 'Rare', '204', allBlack4.length);

// Pink Gang — 3+ pink traits
const pinkGang = getColorMatchTokens('pink', 3);
badge('Pink Gang', 'Rare', '20', pinkGang.length);
if (pinkGang.length <= 40) {
  info(`Token IDs: ${pinkGang.map(b => b.tokenId).join(', ')}`);
}

// Color Coordinated — 4+ matching color traits (any color)
// This is more complex - check common colors
const commonColors = ['black', 'white', 'red', 'blue', 'green', 'pink', 'purple', 'orange', 'yellow', 'brown', 'grey', 'gray', 'cream', 'beige', 'navy', 'gold'];
const colorCoordTokens = new Set();
for (const color of commonColors) {
  const matches = getColorMatchTokens(color, 4);
  for (const m of matches) colorCoordTokens.add(m.tokenId);
}
badge('Color Coordinated', 'Uncommon', '~200', colorCoordTokens.size, 'tokens with 4+ traits sharing a color');

// Psychedelic Trip — Psychedelic balaclava style
const balaStyles = getTraitValues('Balaclava Style');
info(`Balaclava Style values: ${balaStyles.join(', ')}`);
const psychedelic = traitSupply['Balaclava Style:Psychedelic'] || 0;
badge('Psychedelic Trip', 'Epic', '10', psychedelic);

// Leopard Print
const leopard = traitSupply['Balaclava Style:Leopard'] || traitSupply['Balaclava Style:Leopard Print'] || 0;
badge('Leopard Print', 'Rare', '13', leopard);

// Full Ape — Ape suit top + bottom
const fullApe = getTokensWithCombo([
  { traitType: 'Top', contains: 'ape' },
  { traitType: 'Bottom', contains: 'ape' }
]);
badge('Full Ape', 'Rare', '~100', fullApe.length);
if (fullApe.length > 0 && fullApe.length <= 10) info(`Tokens: ${fullApe.join(', ')}`);

// Check what ape-related tops and bottoms exist
const apeTops = getTraitValues('Top').filter(v => v.toLowerCase().includes('ape'));
const apeBottoms = getTraitValues('Bottom').filter(v => v.toLowerCase().includes('ape'));
info(`Ape-related Tops: ${apeTops.length > 0 ? apeTops.join(', ') : 'NONE'}`);
info(`Ape-related Bottoms: ${apeBottoms.length > 0 ? apeBottoms.join(', ') : 'NONE'}`);

// Try via full trait name search
const apeSuitTokens = getTokensWithTraitContaining('Top', 'Ape Suit');
info(`Tokens with 'Ape Suit' in Top: ${apeSuitTokens.length}`);
const apeSuitBottomTokens = getTokensWithTraitContaining('Bottom', 'Ape Suit');
info(`Tokens with 'Ape Suit' in Bottom: ${apeSuitBottomTokens.length}`);

// Also check Pants for ape
const apePants = getTokensWithTraitContaining('Pants', 'ape');
info(`Tokens with 'ape' in Pants: ${apePants.length}`);

// Full Mech — Robot suit
const robotTops = getTraitValues('Top').filter(v => v.toLowerCase().includes('robot'));
const robotBottoms = getTraitValues('Bottom').filter(v => v.toLowerCase().includes('robot'));
info(`Robot-related Tops: ${robotTops.length > 0 ? robotTops.join(', ') : 'NONE'}`);
info(`Robot-related Bottoms: ${robotBottoms.length > 0 ? robotBottoms.join(', ') : 'NONE'}`);
const fullMech = getTokensWithCombo([
  { traitType: 'Top', contains: 'robot' },
  { traitType: 'Bottom', contains: 'robot' }
]);
badge('Full Mech', 'Rare', '~100', fullMech.length);

// Space Cadet — Astronaut suit
const astroTops = getTraitValues('Top').filter(v => v.toLowerCase().includes('astronaut'));
const astroBottoms = getTraitValues('Bottom').filter(v => v.toLowerCase().includes('astronaut'));
info(`Astronaut-related Tops: ${astroTops.length > 0 ? astroTops.join(', ') : 'NONE'}`);
info(`Astronaut-related Bottoms: ${astroBottoms.length > 0 ? astroBottoms.join(', ') : 'NONE'}`);
const spaceCadet = getTokensWithCombo([
  { traitType: 'Top', contains: 'astronaut' },
  { traitType: 'Bottom', contains: 'astronaut' }
]);
badge('Space Cadet', 'Rare', '~100', spaceCadet.length);

// Suited & Booted — Suit Jacket + Suit Pants + Formal Shoe
const suitJacket = getTokensWithTraitContaining('Top', 'Suit');
info(`Tokens with 'Suit' in Top: ${suitJacket.length}`);
const suitedBooted = getTokensWithCombo([
  { traitType: 'Top', contains: 'suit jacket' },
  { traitType: 'Bottom', contains: 'suit' },
  { traitType: 'Footwear', contains: 'formal' }
]);
badge('Suited & Booted', 'Rare', '19', suitedBooted.length);
// Also try broader matching
const suitedBroadTop = getTraitValues('Top').filter(v => v.toLowerCase().includes('suit'));
const suitedBroadBottom = getTraitValues('Bottom').filter(v => v.toLowerCase().includes('suit'));
const suitedBroadFoot = getTraitValues('Footwear').filter(v => v.toLowerCase().includes('formal') || v.toLowerCase().includes('dress') || v.toLowerCase().includes('oxford') || v.toLowerCase().includes('brogue'));
info(`Suit-related Tops: ${suitedBroadTop.join(', ')}`);
info(`Suit-related Bottoms: ${suitedBroadBottom.join(', ')}`);
info(`Formal-type Footwear: ${suitedBroadFoot.length > 0 ? suitedBroadFoot.join(', ') : 'NONE'}`);

// Drip Lord — top 10% composite score
const scores = Object.entries(tokenScores).map(([id, s]) => ({ id, score: s.compositeScore })).sort((a, b) => b.score - a.score);
const top10pct = Math.ceil(scores.length * 0.1);
const dripThreshold = scores[top10pct - 1]?.score || 0;
badge('Drip Lord', 'Uncommon', '1005', top10pct, `threshold score: ${dripThreshold.toFixed(1)}`);

// ============================================================
// 4. FASHION & SUBCULTURE
// ============================================================

section('CATEGORY 3: FASHION & SUBCULTURE');

// Hoodie Gang
const hoodieTokens = getTokensWithTraitContaining('Top', 'hoodie');
badge('Hoodie Gang', 'Uncommon', '778', hoodieTokens.length, 'total hoodie tokens (badge requires 3+ in wallet)');

// Trackstar
const trackTokens = getTokensWithTraitContaining('Top', 'tracksuit');
badge('Trackstar', 'Uncommon', '199', trackTokens.length, 'tracksuit tokens');

// Varsity Club
const varsityTokens = getTokensWithTraitContaining('Top', 'varsity');
badge('Varsity Club', 'Uncommon', '195', varsityTokens.length, 'varsity jacket tokens');

// Sneakerhead — 5+ different footwear types
const footwearTypes = getTraitValues('Footwear');
info(`Total footwear types: ${footwearTypes.length} — ${footwearTypes.join(', ')}`);

// Hat Trick — 3+ different headwear
const headwearTypes = getTraitValues('Headwear');
info(`Total headwear types: ${headwearTypes.length}`);
info(`Headwear values: ${headwearTypes.join(', ')}`);

// Ink'd Up — Ink trait
const inkTokens = getTokensWithTrait('Ink', undefined);
// Actually check what Ink values exist
const inkValues = getTraitValues('Ink');
info(`Ink values: ${inkValues.join(', ')}`);
let inkTotal = 0;
for (const v of inkValues) {
  const s = traitSupply[`Ink:${v}`] || 0;
  inkTotal += s;
  info(`  Ink:${v} — ${s}`);
}
badge('Ink\'d Up', 'Uncommon', '866', inkTotal, 'total inked tokens (badge requires 3+ in wallet)');

// Cowboy — Cowboy Hat + Cowboy Boots
const cowboyCombo = getTokensWithCombo([
  { traitType: 'Headwear', contains: 'cowboy' },
  { traitType: 'Footwear', contains: 'cowboy' }
]);
badge('Cowboy', 'Epic', '2', cowboyCombo.length);
if (cowboyCombo.length > 0 && cowboyCombo.length <= 20) info(`Tokens: ${cowboyCombo.join(', ')}`);
// Check supplies
info(`Cowboy headwear: ${getTraitValues('Headwear').filter(v => v.toLowerCase().includes('cowboy')).join(', ')}`);
info(`Cowboy footwear: ${getTraitValues('Footwear').filter(v => v.toLowerCase().includes('cowboy')).join(', ')}`);
for (const h of getTraitValues('Headwear').filter(v => v.toLowerCase().includes('cowboy'))) {
  info(`  Headwear:${h} — ${traitSupply[`Headwear:${h}`] || 0}`);
}
for (const f of getTraitValues('Footwear').filter(v => v.toLowerCase().includes('cowboy'))) {
  info(`  Footwear:${f} — ${traitSupply[`Footwear:${f}`] || 0}`);
}

// Lab Rat — Lab Coat + Pixel/3D Glasses
const labRat = getTokensWithCombo([
  { traitType: 'Top', contains: 'lab coat' },
  { traitType: 'Eyes', contains: 'pixel' }
]);
const labRat2 = getTokensWithCombo([
  { traitType: 'Top', contains: 'lab coat' },
  { traitType: 'Eyes', contains: '3d' }
]);
const labRatAll = [...new Set([...labRat, ...labRat2])];
badge('Lab Rat', 'Epic', '2', labRatAll.length);
info(`Lab Coat tops: ${getTraitValues('Top').filter(v => v.toLowerCase().includes('lab')).join(', ') || 'NONE'}`);
info(`Pixel/3D eyes: ${getTraitValues('Eyes').filter(v => v.toLowerCase().includes('pixel') || v.toLowerCase().includes('3d')).join(', ') || 'NONE'}`);

// Skater — Skateboard + sneaker
const skateTokens = getTokensWithTrait('Accessory', 'Skateboard');
info(`Skateboard tokens: ${skateTokens.length}`);
const skaterCombo = getTokensWithCombo([
  { traitType: 'Accessory', value: 'Skateboard' },
  { traitType: 'Footwear', contains: 'sneaker' }
]);
badge('Skater', 'Uncommon', '24', skaterCombo.length);
// Also check what exact skateboard accessory value is
const accessoryWithSkate = getTraitValues('Accessory').filter(v => v.toLowerCase().includes('skate'));
info(`Skateboard accessories: ${accessoryWithSkate.join(', ') || 'NONE'}`);

// Surf's Up
const surfTokens = getTokensWithTraitContaining('Accessory', 'surfboard');
badge('Surf\'s Up', 'Rare', '18', surfTokens.length);

// ============================================================
// 5. ACCESSORIES
// ============================================================

section('CATEGORY 4: ACCESSORIES');

// Armed & Dangerous
const weapons = ['Bat', 'Nanchaku', 'Crowbar', 'Bomb', 'Axe', 'Bat Wood'];
let armedTotal = 0;
for (const w of weapons) {
  const s = traitSupply[`Accessory:${w}`] || 0;
  armedTotal += s;
  info(`  Accessory:${w} — ${s}`);
}
// Also check broader
const allAccessories = getTraitValues('Accessory');
const weaponLike = allAccessories.filter(v =>
  v.toLowerCase().includes('bat') || v.toLowerCase().includes('nunchaku') || v.toLowerCase().includes('nanchaku') ||
  v.toLowerCase().includes('crowbar') || v.toLowerCase().includes('bomb') || v.toLowerCase().includes('axe') ||
  v.toLowerCase().includes('sword') || v.toLowerCase().includes('knife') || v.toLowerCase().includes('gun')
);
info(`Weapon-like accessories found: ${weaponLike.join(', ')}`);
badge('Armed & Dangerous', 'Uncommon', '391', armedTotal);

// Vandal — Spray Can
const sprayCan = traitSupply['Accessory:Spray Can'] || 0;
badge('Vandal', 'Uncommon', '45', sprayCan);

// Boombox
const boombox = traitSupply['Accessory:Boombox'] || 0;
badge('Boombox Beast', 'Uncommon', '122', boombox);

// Crypto Native
const bitcoin = traitSupply['Accessory:Bitcoin'] || 0;
const ethereum = traitSupply['Accessory:Ethereum'] || 0;
badge('Crypto Native', 'Uncommon', '90', bitcoin + ethereum, `Bitcoin: ${bitcoin}, Ethereum: ${ethereum}`);
// Check for crypto-related chain/gemstone too
const cryptoChain = getTraitValues('Chain').filter(v => v.toLowerCase().includes('bitcoin') || v.toLowerCase().includes('ethereum') || v.toLowerCase().includes('crypto'));
info(`Crypto chains: ${cryptoChain.join(', ') || 'NONE'}`);

// Diamond Studded
const diamond = traitSupply['Gemstone:Diamond'] || 0;
badge('Diamond Studded', 'Epic', '55', diamond);

// Crown Jewels
const crown = traitSupply['Headwear:Crown'] || 0;
badge('Crown Jewels', 'Rare', '25', crown);
const crownTypes = getTraitValues('Headwear').filter(v => v.toLowerCase().includes('crown'));
info(`Crown headwear variants: ${crownTypes.join(', ') || 'NONE'}`);
let crownTotal = 0;
for (const c of crownTypes) { const s = traitSupply[`Headwear:${c}`] || 0; crownTotal += s; info(`  ${c}: ${s}`); }

// Money Moves
const moneyStacks = traitSupply['Accessory:Money Stacks'] || 0;
const goldBars = traitSupply['Accessory:Gold Bars'] || 0;
badge('Money Moves', 'Uncommon', '105', moneyStacks + goldBars, `Money Stacks: ${moneyStacks}, Gold Bars: ${goldBars}`);

// Halo Effect
const halo = traitSupply['Headwear:Halo'] || 0;
badge('Halo Effect', 'Uncommon', '46', halo);

// Burger Beast
const burger = traitSupply['Accessory:Burger'] || 0;
badge('Burger Beast', 'Common', '43', burger);

// Snack Attack
const foodItems = ['Apple', 'Donut', 'Burger', 'Ice Cream'];
let foodTotal = 0;
for (const f of foodItems) {
  const s = traitSupply[`Accessory:${f}`] || 0;
  foodTotal += s;
  info(`  Accessory:${f} — ${s}`);
}
// Also check Spatula & Fries
const spatula = traitSupply['Accessory:Spatula & Fries'] || 0;
foodTotal += spatula;
info(`  Accessory:Spatula & Fries — ${spatula}`);
// Check for any other food items
const foodLike = allAccessories.filter(v =>
  v.toLowerCase().includes('burger') || v.toLowerCase().includes('donut') || v.toLowerCase().includes('apple') ||
  v.toLowerCase().includes('ice cream') || v.toLowerCase().includes('fries') || v.toLowerCase().includes('pizza') ||
  v.toLowerCase().includes('food') || v.toLowerCase().includes('spatula') || v.toLowerCase().includes('hotdog') ||
  v.toLowerCase().includes('chicken') || v.toLowerCase().includes('drink') || v.toLowerCase().includes('soda') ||
  v.toLowerCase().includes('coffee') || v.toLowerCase().includes('beer') || v.toLowerCase().includes('wine')
);
info(`All food/drink accessories: ${foodLike.join(', ')}`);
badge('Snack Attack', 'Uncommon', '292', foodTotal, 'food item tokens (badge requires 3+ types in wallet)');

// ============================================================
// 6. DNA & RARES
// ============================================================

section('CATEGORY 5: DNA & RARES');

const dnaValues = getTraitValues('DNA');
info(`DNA values: ${dnaValues.join(', ')}`);
for (const d of dnaValues) {
  info(`  DNA:${d} — ${traitSupply[`DNA:${d}`] || 0}`);
}

badge('Zombie', 'Rare', '109', traitSupply['DNA:Zombie'] || 0);
badge('Angel Wings', 'Legendary', '9', traitSupply['DNA:Angel'] || 0);
badge('Bare Bones', 'Rare', '74', traitSupply['DNA:Bones'] || 0);
badge('DNA Lab', 'Legendary', '-', Math.min(traitSupply['DNA:Angel'] || 0, traitSupply['DNA:Zombie'] || 0, traitSupply['DNA:Bones'] || 0), 'hard cap = Angel supply');

// Rare Breed — 1/1 designs
// Check if there's a "Rare" trait type
const rareTraitType = getTraitValues('Rare');
info(`Rare trait values: ${rareTraitType.length} unique designs`);
let rareTotal = 0;
for (const r of rareTraitType) {
  rareTotal += traitSupply[`Rare:${r}`] || 0;
}
badge('Rare Breed', 'Epic', '263', rareTotal, `across ${rareTraitType.length} designs`);

// Vitiligo
const vitiligo = traitSupply['Human:Vitiligo'] || 0;
badge('Vitiligo', 'Rare', '48', vitiligo);
// Check skin tone values
const skinValues = getTraitValues('Human');
info(`Human (skin) values: ${skinValues.join(', ')}`);

// Monster Mash — specific rare types
const monsterRares = ['Dragon', 'Demon', 'Demon Lord', 'Vampire', 'Grim Reaper', 'Mummy', 'Witch', 'Medusa', 'Yeti'];
let monsterTotal = 0;
for (const r of monsterRares) {
  // Check all variants
  const matches = rareTraitType.filter(v => v.toLowerCase().includes(r.toLowerCase()));
  for (const m of matches) {
    const s = traitSupply[`Rare:${m}`] || 0;
    monsterTotal += s;
    if (s > 0) info(`  Rare:${m} — ${s}`);
  }
}
badge('Monster Mash', 'Epic', '20', monsterTotal);

// Heavenly
const heavenlyRares = ['Angel', 'Lady Angel', 'Lord Angel', 'Fairy', 'Unicorn', 'Unicorn Star', 'Genie'];
let heavenlyTotal = 0;
for (const r of heavenlyRares) {
  const matches = rareTraitType.filter(v => v.toLowerCase() === r.toLowerCase() || v.toLowerCase().startsWith(r.toLowerCase()));
  for (const m of matches) {
    const s = traitSupply[`Rare:${m}`] || 0;
    heavenlyTotal += s;
    if (s > 0) info(`  Rare:${m} — ${s}`);
  }
}
badge('Heavenly', 'Epic', '18', heavenlyTotal);

// Crime Boss
const crimeRares = ['Godfather', 'Hitman', 'Henchman', 'Detective'];
let crimeTotal = 0;
for (const r of crimeRares) {
  const matches = rareTraitType.filter(v => v.toLowerCase().includes(r.toLowerCase()));
  for (const m of matches) {
    const s = traitSupply[`Rare:${m}`] || 0;
    crimeTotal += s;
    if (s > 0) info(`  Rare:${m} — ${s}`);
  }
}
badge('Crime Boss', 'Epic', '10', crimeTotal);

// Legend of the East
const eastRares = ['Samurai', 'Ninja', 'Kitsune', 'Anime'];
let eastTotal = 0;
for (const r of eastRares) {
  const matches = rareTraitType.filter(v => v.toLowerCase().includes(r.toLowerCase()));
  for (const m of matches) {
    const s = traitSupply[`Rare:${m}`] || 0;
    eastTotal += s;
    if (s > 0) info(`  Rare:${m} — ${s}`);
  }
}
badge('Legend of the East', 'Epic', '24', eastTotal);

// ============================================================
// 7. BEASTHOOD NEIGHBORHOODS
// ============================================================

section('CATEGORY 6: BEASTHOOD NEIGHBORHOODS');

const beasthoodValues = getTraitValues('Beasthood');
info(`Total neighborhoods: ${beasthoodValues.length}`);
for (const b of beasthoodValues) {
  info(`  ${b} — ${traitSupply[`Beasthood:${b}`] || 0}`);
}

// ============================================================
// 8. GRAIL HUNTER
// ============================================================

section('GRAIL ANALYSIS');

// Count traits with grail score 50+
const grailTraits50 = Object.entries(grailScores).filter(([k, v]) => v.compositeScore >= 50);
info(`Traits with grail score >= 50: ${grailTraits50.length}`);

// Top grail traits
const sortedGrails = Object.entries(grailScores)
  .sort((a, b) => b[1].compositeScore - a[1].compositeScore)
  .slice(0, 30);
info('Top 30 grail traits:');
for (const [key, data] of sortedGrails) {
  info(`  ${key} — score: ${data.compositeScore.toFixed(1)}, supply: ${data.supply}, recent sales: ${data.recentSales}, premium: ${data.weightedPremiumPct?.toFixed(0)}%`);
}

badge('Grail Hunter', 'Epic', '44 traits', grailTraits50.length, 'traits score 50+');

// Count tokens that have at least one grail trait score 50+
const grailTraitSet = new Set(grailTraits50.map(([k]) => k));
let grailTokenCount = 0;
for (const [tokenId, traits] of Object.entries(traitCache)) {
  for (const t of traits) {
    const key = `${t.trait_type}:${t.value}`;
    if (grailTraitSet.has(key)) { grailTokenCount++; break; }
  }
}
info(`Tokens with at least one grail trait (50+): ${grailTokenCount}`);

// ============================================================
// 9. TOKEN SCORE DISTRIBUTION (for Drip Lord / tier system)
// ============================================================

section('TOKEN SCORE DISTRIBUTION');

const allScores = Object.values(tokenScores).map(s => s.compositeScore).sort((a, b) => b - a);
const percentiles = [1, 5, 10, 25, 50, 75, 90, 95, 99];
for (const p of percentiles) {
  const idx = Math.floor(allScores.length * p / 100);
  info(`${p}th percentile: ${allScores[idx]?.toFixed(1)}`);
}
info(`Min: ${allScores[allScores.length - 1]?.toFixed(1)}, Max: ${allScores[0]?.toFixed(1)}, Mean: ${(allScores.reduce((a,b) => a+b, 0) / allScores.length).toFixed(1)}`);

// Archetype distribution
const archetypes = {};
for (const [id, s] of Object.entries(tokenScores)) {
  const arch = s.archetype || s.fullSuit || 'none';
  archetypes[arch] = (archetypes[arch] || 0) + 1;
}
info('Archetype distribution:');
for (const [arch, count] of Object.entries(archetypes).sort((a, b) => b[1] - a[1])) {
  info(`  ${arch}: ${count}`);
}

// Identity combo tokens
const identityComboCount = Object.values(tokenScores).filter(s => s.identityCombo).length;
info(`Tokens with identity combo: ${identityComboCount}`);

// ============================================================
// 10. SALES / MARKET ANALYSIS
// ============================================================

section('MARKET BEHAVIOR ANALYSIS');

const walletPurchases = buildWalletPurchases();
const walletSalesMade = buildWalletSales();

const uniqueBuyers = Object.keys(walletPurchases).length;
const uniqueSellers = Object.keys(walletSalesMade).length;
info(`Unique buyers: ${uniqueBuyers}`);
info(`Unique sellers: ${uniqueSellers}`);

// Diamond Hands — bought but never sold
const buyOnlyWallets = Object.keys(walletPurchases).filter(w => !walletSalesMade[w]);
info(`Buy-only wallets (never sold): ${buyOnlyWallets.length}`);

// Distribution of purchase counts
const purchaseDist = {};
for (const [wallet, purchases] of Object.entries(walletPurchases)) {
  const count = purchases.length;
  const bucket = count >= 50 ? '50+' : count >= 20 ? '20-49' : count >= 10 ? '10-19' : count >= 5 ? '5-9' : count >= 3 ? '3-4' : count >= 2 ? '2' : '1';
  purchaseDist[bucket] = (purchaseDist[bucket] || 0) + 1;
}
info('Purchase count distribution:');
for (const [bucket, count] of Object.entries(purchaseDist).sort()) {
  info(`  ${bucket} purchases: ${count} wallets`);
}

// Whale Trade — sales above 1 ETH
const bigSales = salesCache.filter(s => s.priceEth >= 1.0);
info(`Sales >= 1 ETH: ${bigSales.length}`);
const bigSales2 = salesCache.filter(s => s.priceEth >= 2.0);
info(`Sales >= 2 ETH: ${bigSales2.length}`);

// Floor sweep detection
const sortedSales = [...salesCache].sort((a, b) => a.timestamp - b.timestamp);
info(`Sales date range: ${new Date(sortedSales[0].timestamp * 1000).toISOString().split('T')[0]} to ${new Date(sortedSales[sortedSales.length - 1].timestamp * 1000).toISOString().split('T')[0]}`);

// OG Beast — bought before July 2023
const july2023 = new Date('2023-07-01').getTime() / 1000;
const ogBuyers = new Set();
for (const sale of salesCache) {
  if (sale.timestamp < july2023) ogBuyers.add(sale.buyer);
}
info(`OG buyers (pre-July 2023): ${ogBuyers.size} wallets`);

// Good Flip — 2x sales
let goodFlips = 0;
// Build token purchase history per wallet
const walletTokenBuys = {};
for (const sale of sortedSales) {
  if (!walletTokenBuys[sale.buyer]) walletTokenBuys[sale.buyer] = {};
  walletTokenBuys[sale.buyer][sale.tokenId] = sale.priceEth;
}
for (const sale of salesCache) {
  const buyPrice = walletTokenBuys[sale.seller]?.[sale.tokenId];
  if (buyPrice && sale.priceEth >= buyPrice * 2) goodFlips++;
}
info(`2x+ flip sales detected: ${goodFlips}`);

// ============================================================
// 11. ALL ACCESSORIES DUMP (for badge ideas)
// ============================================================

section('FULL ACCESSORY INVENTORY');
for (const a of allAccessories.sort()) {
  info(`${a} — ${traitSupply[`Accessory:${a}`] || 0}`);
}

// ============================================================
// 12. ALL TRAIT TYPES + VALUES WITH SUPPLY
// ============================================================

section('TRAIT SUPPLY BY CATEGORY (for discovering new badge opportunities)');

for (const tt of ['Balaclava', 'Balaclava Style', 'DNA', 'Eyes', 'Headwear', 'Chain', 'Gemstone', 'Durag', 'Surfboard', 'Top', 'Ink']) {
  output.push(`\n  --- ${tt} ---`);
  const vals = getTraitValues(tt);
  for (const v of vals) {
    const supply = traitSupply[`${tt}:${v}`] || 0;
    const grail = grailScores[`${tt}:${v}`];
    const grailStr = grail ? ` [grail: ${grail.compositeScore.toFixed(1)}]` : '';
    info(`${v} — ${supply}${grailStr}`);
  }
}

// ============================================================
// 13. FULL SUIT DETECTION
// ============================================================

section('FULL SUIT ANALYSIS');

// Find all top values that could be "suits" (matching top+bottom pairs)
const topValues = getTraitValues('Top');
const bottomValues = getTraitValues('Bottom');
info(`Checking for matching Top/Bottom pairs...`);

// Find tops that have matching bottoms
const suitPairs = {};
for (const top of topValues) {
  // Check if a bottom exists with similar name
  for (const bot of bottomValues) {
    if (top === bot ||
        top.replace(' Top', '') === bot.replace(' Bottom', '') ||
        top.replace(' Jacket', '') === bot.replace(' Pants', '')) {
      const topTokens = getTokensWithTrait('Top', top);
      const botTokens = new Set(getTokensWithTrait('Bottom', bot));
      const both = topTokens.filter(t => botTokens.has(t));
      if (both.length > 0) {
        suitPairs[`${top} + ${bot}`] = both.length;
      }
    }
  }
}

// Also detect via the token-scores fullSuit field
const fullSuitTokens = {};
for (const [id, s] of Object.entries(tokenScores)) {
  if (s.fullSuit) {
    fullSuitTokens[s.fullSuit] = (fullSuitTokens[s.fullSuit] || 0) + 1;
  }
}
info('Full suit types detected by scoring engine:');
for (const [suit, count] of Object.entries(fullSuitTokens).sort((a, b) => b[1] - a[1])) {
  info(`  ${suit}: ${count} tokens`);
}

// Also show matching pair results
info('Top+Bottom matching pairs:');
for (const [pair, count] of Object.entries(suitPairs).sort((a, b) => b[1] - a[1])) {
  info(`  ${pair}: ${count} tokens`);
}

// ============================================================
// 14. POTENTIAL NEW BADGE IDEAS FROM DATA
// ============================================================

section('POTENTIAL NEW BADGES (data-driven discoveries)');

// Ultra-rare traits (supply 1-3)
info('Ultra-rare traits (supply 1-3):');
const ultraRare = Object.entries(traitSupply)
  .filter(([k, v]) => v <= 3 && !k.startsWith('Rare:') && !k.startsWith('Beasthood:'))
  .sort((a, b) => a[1] - b[1]);
for (const [key, supply] of ultraRare) {
  const grail = grailScores[key];
  const grailStr = grail ? ` [grail: ${grail.compositeScore.toFixed(1)}]` : '';
  info(`  ${key} — ${supply}${grailStr}`);
}

// High-grail traits that don't have badges yet
info('\nHigh grail traits (60+) not covered by existing badges:');
const highGrails = Object.entries(grailScores)
  .filter(([k, v]) => v.compositeScore >= 60)
  .sort((a, b) => b[1].compositeScore - a[1].compositeScore);
for (const [key, data] of highGrails) {
  info(`  ${key} — score: ${data.compositeScore.toFixed(1)}, supply: ${data.supply}, premium: ${data.weightedPremiumPct?.toFixed(0)}%`);
}

// ============================================================
// WRITE OUTPUT
// ============================================================

const outputText = output.join('\n');
fs.writeFileSync('C:/Users/rhodg/source/beast-badges/BADGE-ANALYSIS.txt', outputText);
console.log(outputText);
console.log('\n\nAnalysis written to BADGE-ANALYSIS.txt');
