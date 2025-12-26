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
    { nameKey: 'archer', cost: 10, color: '#5f5', descKey: 'descArcher', type: 'shooter', damage: 8, range: 200, cooldown: 60 },
    { nameKey: 'knight', cost: 15, color: '#f55', descKey: 'descKnight', type: 'melee', damage: 15, range: 40, cooldown: 45 },
    { nameKey: 'mage', cost: 20, color: '#a5f', descKey: 'descMage', type: 'aoe', damage: 12, range: 80, cooldown: 90 },
    { nameKey: 'cleric', cost: 25, color: '#ff5', descKey: 'descCleric', type: 'healer', healAmount: 5, cooldown: 120 },
    { nameKey: 'ninja', cost: 15, color: '#555', descKey: 'descNinja', type: 'shooter', damage: 5, range: 150, cooldown: 20 },
    { nameKey: 'wizard', cost: 30, color: '#5ff', descKey: 'descWizard', type: 'chain', damage: 10, range: 120, cooldown: 80 },
    { nameKey: 'berserker', cost: 20, color: '#f80', descKey: 'descBerserker', type: 'spin', damage: 20, range: 50, cooldown: 100 },
    { nameKey: 'frost', cost: 25, color: '#8ef', descKey: 'descFrost', type: 'slow', damage: 5, range: 100, cooldown: 70 },
    { nameKey: 'vampire', cost: 30, color: '#d4a', descKey: 'descVampire', type: 'vampire', damage: 12, range: 60, cooldown: 50 },
    { nameKey: 'bomber', cost: 35, color: '#fa0', descKey: 'descBomber', type: 'explode', damage: 25, range: 180, cooldown: 120 }
];

// Enemy Types
const enemyTypes = [
    { name: 'Chaser', color: '#f44', speed: 1.5, hp: 20, damage: 10, type: 'melee', size: 14 },
    { name: 'Shooter', color: '#f84', speed: 1, hp: 15, damage: 8, type: 'ranged', size: 16, shootCooldown: 90 },
    { name: 'Tank', color: '#844', speed: 0.7, hp: 60, damage: 15, type: 'melee', size: 24 },
    { name: 'Speedy', color: '#f4f', speed: 3, hp: 10, damage: 5, type: 'melee', size: 12 },
    { name: 'Bomber', color: '#ff4', speed: 1.2, hp: 25, damage: 20, type: 'explode', size: 16 },
    { name: 'Sniper', color: '#4ff', speed: 0.5, hp: 12, damage: 15, type: 'sniper', size: 14, shootCooldown: 150 }
];
