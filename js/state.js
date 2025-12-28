// Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game State
let gameStarted = false;
let gameRunning = false;
let gamePaused = false;
let cheatMode = false;
let autopilot = false;
let score = 0;
let displayScore = 0; // Animated display value that counts up to score
let points = 0;
let wave = 1;
let waveTimer = 0;
let gameTime = 0;
let bossActive = false;
let boss = null;

// Input State
const keys = {};

// Player State
const player = {
    x: 500,
    y: 375,
    width: 20,
    height: 20,
    speed: 3.5,
    maxHp: 100,
    hp: 100,
    invincibleTime: 0,
    color: '#4af',
    speedBoost: 0,
    speedBoostTimer: 0,
    facingX: 0,
    facingY: 1
};

// Current Skill
let currentSkill = null;

// Entity Arrays
let enemies = [];
let projectiles = [];
let sprites = [];
let orbs = [];
let skillOrbs = [];
let effects = [];
let spriteProjectiles = [];
let heroes = [];       // Summoned heroes (permanent allies)
let heroBalls = [];    // Bouncing balls from Bouncer hero

// Achievement Tracking (reset each game)
let usedSpriteTypes = new Set();
let gotHit = false;

// Player Debuffs (from boss projectiles, timers in frames, 5 sec = 300 frames)
const DEBUFF_DURATION = 300;
const debuffs = {
    noHeal: 0,      // Cannot recover HP
    noBlock: 0,     // Cannot block/reflect projectiles
    slow: 0,        // Movement slowed 50%
    weakened: 0     // Boss takes 50% less damage
};
