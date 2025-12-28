// Game Constants
const WAVE_DURATION = 30;
const BOSS_WAVE_INTERVAL = 5;
const POINTS_FOR_SPRITE = 10;

// Skill Types
const skillTypes = [
    { name: 'skillDash', color: '#5ff', rarity: 0.6 },
    { name: 'skillHeal', color: '#5f5', rarity: 0.1 },
    { name: 'skillNuke', color: '#f55', rarity: 0.25 },
    { name: 'skillMagnet', color: '#ff0', rarity: 0.05 },
    { name: 'skillHero', color: '#a0f', rarity: 0.025 } // Rarest - summons a permanent hero
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

// Hero Types (summoned via Hero skill orb - easily expandable)
const heroTypes = [
    {
        id: 'laser',
        nameKey: 'heroLaser',
        color: '#f0f',       // Magenta
        actionCooldown: 120, // 2 seconds
        damage: 25,
        range: 800,          // Full screen laser
        laserWidth: 60       // 2x wider
    },
    {
        id: 'warrior',
        nameKey: 'heroWarrior',
        color: '#fa0',       // Orange
        actionCooldown: 60,  // 1 second
        damage: 20,
        range: 60,           // Melee range
        coneAngle: Math.PI * 4 / 3, // 240 degree cone (4x bigger)
        speedMult: 4         // 4x faster movement
    },
    {
        id: 'angel',
        nameKey: 'heroAngel',
        color: '#fff',       // White/holy
        actionCooldown: 90,  // 1.5 seconds
        eraseRadius: 120,    // AOE to erase projectiles
        speedMult: 1.5       // 1.5x faster movement
    },
    {
        id: 'bouncer',
        nameKey: 'heroBouncer',
        color: '#0ff',       // Cyan
        actionCooldown: 100, // ~1.7 seconds
        damage: 15,
        ballSpeed: 6,
        ballLifetime: 300,   // 5 seconds
        ballSize: 24         // 3x bigger (was 8)
    }
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
