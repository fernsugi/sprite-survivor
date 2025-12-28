// Game Constants
const WAVE_DURATION = 30;
const BOSS_WAVE_INTERVAL = 5;
const POINTS_FOR_SPRITE = 10;

// Skill Types
const skillTypes = [
    { name: 'skillDash', color: '#5ff', rarity: 0.5 },
    { name: 'skillHeal', color: '#5f5', rarity: 0.1 },
    { name: 'skillNuke', color: '#f55', rarity: 0.4 },
    { name: 'skillMagnet', color: '#ff0', rarity: 0.05 }
];

// Sprite Types
const spriteTypes = [
    { nameKey: 'archer', cost: 10, color: '#5f5', descKey: 'descArcher', type: 'shooter', damage: 10, range: 250, cooldown: 50 },
    { nameKey: 'knight', cost: 15, color: '#f55', descKey: 'descKnight', type: 'melee', damage: 15, range: 40, cooldown: 45, blocksProjectiles: true },
    { nameKey: 'mage', cost: 20, color: '#a5f', descKey: 'descMage', type: 'aoe', damage: 12, range: 100, cooldown: 75 },
    { nameKey: 'cleric', cost: 25, color: '#ff5', descKey: 'descCleric', type: 'healer', healAmount: 5, cooldown: 120 },
    { nameKey: 'ninja', cost: 15, color: '#555', descKey: 'descNinja', type: 'shooter', damage: 5, range: 150, cooldown: 20 },
    { nameKey: 'wizard', cost: 25, color: '#5ff', descKey: 'descWizard', type: 'chain', damage: 10, range: 120, cooldown: 70 },
    { nameKey: 'berserker', cost: 20, color: '#f80', descKey: 'descBerserker', type: 'spin', damage: 20, range: 50, cooldown: 75, reflectsProjectiles: true },
    { nameKey: 'frost', cost: 25, color: '#8ef', descKey: 'descFrost', type: 'slow', damage: 5, range: 100, cooldown: 70 },
    { nameKey: 'vampire', cost: 30, color: '#d4a', descKey: 'descVampire', type: 'vampire', damage: 12, range: 60, cooldown: 50 },
    { nameKey: 'bomber', cost: 30, color: '#fa0', descKey: 'descBomber', type: 'explode', damage: 25, range: 180, cooldown: 90 }
];

// Achievement Definitions
// IDs: firstWin, onlyArcher, onlyKnight, onlyMage, onlyCleric, onlyNinja, onlyWizard, onlyBerserker, onlyFrost, onlyVampire, onlyBomber, allSprites, speedrun, noHit
const achievementDefs = [
    { id: 'firstWin', nameKey: 'achvFirstWin', descKey: 'achvFirstWinDesc' },
    // "Only X sprite" achievements - generated from spriteTypes (indices 1-10)
    ...['archer', 'knight', 'mage', 'cleric', 'ninja', 'wizard', 'berserker', 'frost', 'vampire', 'bomber'].map(s => ({
        id: 'only' + s.charAt(0).toUpperCase() + s.slice(1),
        nameKey: s, // Use sprite name directly, will be formatted in UI
        descKey: 'achvOnlySpriteDesc', // Generic desc key
        isSpriteOnly: true
    })),
    { id: 'allSprites', nameKey: 'achvAllSprites', descKey: 'achvAllSpritesDesc' },
    { id: 'speedrun', nameKey: 'achvSpeedrun', descKey: 'achvSpeedrunDesc' },
    { id: 'noHit', nameKey: 'achvNoHit', descKey: 'achvNoHitDesc' }
];

// Enemy Types
const enemyTypes = [
    { name: 'Chaser', color: '#f44', speed: 1.5, hp: 20, damage: 10, type: 'melee', size: 14 },
    { name: 'Shooter', color: '#f84', speed: 1, hp: 15, damage: 8, type: 'ranged', size: 16, shootCooldown: 90 },
    { name: 'Tank', color: '#844', speed: 0.7, hp: 60, damage: 15, type: 'melee', size: 24 },
    { name: 'Speedy', color: '#f4f', speed: 3, hp: 10, damage: 5, type: 'melee', size: 12 },
    { name: 'Bomber', color: '#ff4', speed: 1.2, hp: 25, damage: 20, type: 'explode', size: 16 },
    { name: 'Sniper', color: '#4ff', speed: 0.5, hp: 12, damage: 15, type: 'sniper', size: 14, shootCooldown: 150 },
    { name: 'Hexer', color: '#a4f', speed: 0.8, hp: 18, damage: 5, type: 'hexer', size: 16, shootCooldown: 120, appliesDebuff: true }
];
