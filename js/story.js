// Story Mode System

// Track which sprites player has collected in story mode
let collectedSprites = new Set();

// Flag to spawn enemies after collection dialogue
let pendingWaveSpawn = false;

// Flag to spawn boss after boss intro dialogue
let pendingBossSpawn = false;

// Flag to show victory after victory dialogue
let pendingVictory = false;

// Load story progress from localStorage
function loadStoryProgress() {
    const saved = localStorage.getItem('spriteSurvivorStory');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            storyProgress.chaptersCompleted = data.chaptersCompleted || 0;
            storyProgress.playerName = data.playerName || null;
            if (storyProgress.playerName) {
                playerName = storyProgress.playerName;
            }
        } catch (e) {
            console.warn('Failed to load story progress');
        }
    }
    updateChapterButtons();
}

// Save story progress to localStorage
function saveStoryProgress() {
    localStorage.setItem('spriteSurvivorStory', JSON.stringify(storyProgress));
}

// Update chapter button lock states based on progress
function updateChapterButtons() {
    const chapters = document.querySelectorAll('.chapter-btn');
    chapters.forEach(btn => {
        const chapterNum = btn.dataset.chapter;
        if (chapterNum === 'ending') {
            // Ending unlocks after: beating survival/cheat mode (firstWin) AND all 4 chapters completed
            const achievements = loadAchievements();
            if (achievements.firstWin && storyProgress.chaptersCompleted >= 4) {
                btn.classList.remove('locked');
                btn.querySelector('.lock-icon')?.remove();
            }
        } else {
            const num = parseInt(chapterNum);
            if (num <= storyProgress.chaptersCompleted + 1) {
                btn.classList.remove('locked');
                btn.querySelector('.lock-icon')?.remove();
            }
        }
    });
}

// Show story mode chapter select screen
function showStoryMode() {
    loadStoryProgress();
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('storyModeScreen').style.display = 'flex';
    playSound('select');
}

// Hide story mode, return to main menu
function hideStoryMode() {
    document.getElementById('storyModeScreen').style.display = 'none';
    document.getElementById('startScreen').style.display = 'flex';
    playSound('select');
}

// Start a chapter
function startChapter(chapterNum) {
    const btn = document.querySelector(`.chapter-btn[data-chapter="${chapterNum}"]`);
    if (btn && btn.classList.contains('locked')) {
        playSound('error');
        return;
    }

    storyChapter = chapterNum;

    if (!storyProgress.playerName) {
        showNameInput();
    } else {
        playerName = storyProgress.playerName;
        beginStoryChapter();
    }

    playSound('select');
}

// Start the ending sequence
function startEnding() {
    const btn = document.querySelector('.chapter-btn.ending');
    if (btn && btn.classList.contains('locked')) {
        playSound('error');
        return;
    }

    storyChapter = 5;

    if (!storyProgress.playerName) {
        showNameInput();
    } else {
        playerName = storyProgress.playerName;
        beginStoryChapter();
    }

    playSound('select');
}

// Show name input modal
function showNameInput() {
    document.getElementById('storyModeScreen').style.display = 'none';
    document.getElementById('nameInputModal').style.display = 'flex';
    const input = document.getElementById('playerNameInput');
    input.value = storyProgress.playerName || '';
    input.focus();
}

// Confirm player name and start chapter
function confirmPlayerName() {
    const input = document.getElementById('playerNameInput');
    const errorEl = document.getElementById('nameInputError');
    let name = input.value.trim();
    
    // Strict validation: name required
    if (!name) {
        playSound('error');
        input.classList.add('error-shake');
        if (errorEl) errorEl.textContent = t('nameRequired') || 'Please enter a name';
        // Remove class after animation completes so it can be triggered again
        setTimeout(() => input.classList.remove('error-shake'), 500);
        input.focus();
        return;
    }

    playerName = name;
    storyProgress.playerName = name;
    saveStoryProgress();

    document.getElementById('nameInputModal').style.display = 'none';
    playSound('select');

    beginStoryChapter();
}

// Begin the actual story chapter gameplay
function beginStoryChapter() {
    storyMode = true;
    storyWave = 0;
    // Initialize with starting sprites for this chapter
    const startSprites = CHAPTER_START_SPRITES[storyChapter] || [];
    collectedSprites = new Set(startSprites);
    pendingWaveSpawn = false;
    pendingBossSpawn = false;
    pendingVictory = false;
    pendingRewardSprite = false;
    pendingMidSprite = false;
    awaitingRewardCollection = false;

    document.getElementById('storyModeScreen').style.display = 'none';
    document.getElementById('nameInputModal').style.display = 'none';
    document.getElementById('startScreen').style.display = 'none';

    initStoryGame();
    showChapterIntro();
}

// Initialize game state for story mode
function initStoryGame() {
    gameStarted = true;
    gameRunning = true;
    gamePaused = false;
    autopilot = false;
    score = 0;
    displayScore = 0;
    points = 0; // Start with 0 points - need to collect sprite first
    wave = 1;
    waveTimer = 0;
    gameTime = 0;
    bossActive = false;
    boss = null;

    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    player.hp = player.maxHp;
    player.overHeal = 0;
    player.invincibleTime = 0;
    player.speedBoost = 0;
    player.speedBoostTimer = 0;
    player.facingX = 0;
    player.facingY = 1;

    enemies = [];
    projectiles = [];
    sprites = [];
    orbs = [];
    skillOrbs = [];
    effects = [];
    spriteProjectiles = [];
    heroes = [];
    heroBalls = [];
    spriteOrbs = [];

    usedSpriteTypes = new Set();
    gotHit = false;
    heroSummoned = false;

    debuffs.noHeal = 0;
    debuffs.noBlock = 0;
    debuffs.slow = 0;
    debuffs.weakened = 0;

    currentSkill = null;

    updateUI();
    updateSkillDisplay();
}

// Get translated dialogue text
function getDialogueText(key) {
    const text = t(key);
    return text.replace(/{name}/g, playerName);
}

// Chapter intro dialogue keys
const CHAPTER_INTROS = {
    1: [
        { speaker: 'NARRATOR', textKey: 'story_1_1' },
        { speaker: '???', textKey: 'story_1_2' },
        { speaker: 'NARRATOR', textKey: 'story_1_3' },
        { speaker: 'REX', textKey: 'story_1_4' },
        { speaker: 'REX', textKey: 'story_1_5' },
        { speaker: 'REX', textKey: 'story_1_6' },
        { speaker: 'REX', textKey: 'story_1_7' },
        { speaker: 'REX', textKey: 'story_1_8' }
    ],
    2: [
        { speaker: 'NARRATOR', textKey: 'story_2_1' },
        { speaker: 'BETH', textKey: 'story_2_2' },
        { speaker: 'BETH', textKey: 'story_2_3' },
        { speaker: 'BETH', textKey: 'story_2_4' },
        { speaker: 'BETH', textKey: 'story_2_5' },
        { speaker: 'BETH', textKey: 'story_2_6' },
        { speaker: 'BETH', textKey: 'story_2_7' }
    ],
    3: [
        { speaker: 'NARRATOR', textKey: 'story_3_1' },
        { speaker: 'MILIA', textKey: 'story_3_2' },
        { speaker: 'NARRATOR', textKey: 'story_3_3' },
        { speaker: 'MILIA', textKey: 'story_3_4' },
        { speaker: 'MILIA', textKey: 'story_3_5' },
        { speaker: 'MILIA', textKey: 'story_3_6' },
        { speaker: 'MILIA', textKey: 'story_3_7' },
        { speaker: 'MILIA', textKey: 'story_3_8' },
        { speaker: 'MILIA', textKey: 'story_3_9' }
    ],
    4: [
        { speaker: 'NARRATOR', textKey: 'story_4_1' },
        { speaker: 'TROY', textKey: 'story_4_2' },
        { speaker: 'TROY', textKey: 'story_4_3' },
        { speaker: 'TROY', textKey: 'story_4_4' },
        { speaker: 'TROY', textKey: 'story_4_5' },
        { speaker: 'TROY', textKey: 'story_4_6' },
        { speaker: 'TROY', textKey: 'story_4_7' },
        { speaker: 'TROY', textKey: 'story_4_8' },
        { speaker: 'TROY', textKey: 'story_4_9' },
        { speaker: 'TROY', textKey: 'story_4_10' }
    ],
    5: [
        { speaker: 'NARRATOR', textKey: 'story_5_1' },
        { speaker: 'REX', textKey: 'story_5_2' },
        { speaker: 'BETH', textKey: 'story_5_3' },
        { speaker: 'MILIA', textKey: 'story_5_4' },
        { speaker: 'TROY', textKey: 'story_5_5' },
        { speaker: 'NARRATOR', textKey: 'story_5_6' },
        { speaker: 'REX', textKey: 'story_5_7' },
        { speaker: 'REX', textKey: 'story_5_8' },
        { speaker: 'BETH', textKey: 'story_5_9' },
        { speaker: 'MILIA', textKey: 'story_5_10' },
        { speaker: 'TROY', textKey: 'story_5_11' },
        { speaker: 'TROY', textKey: 'story_5_12' },
        { speaker: 'NARRATOR', textKey: 'story_5_13' },
        { speaker: 'NARRATOR', textKey: 'story_5_14' }
    ]
};

// Boss intro dialogue keys (Note: most boss intro is part of mid-sprite collect dialogue)
const BOSS_INTROS = {
    1: [
        { speaker: 'NARRATOR', textKey: 'story_boss_1_0' },
        { speaker: 'REX', textKey: 'story_boss_1_1' },
        { speaker: 'REX', textKey: 'story_boss_1_2' }
    ],
    2: [
        { speaker: 'NARRATOR', textKey: 'story_boss_2_0' },
        { speaker: 'BETH', textKey: 'story_boss_2_1' },
        { speaker: 'BETH', textKey: 'story_boss_2_2' }
    ],
    3: [
        { speaker: 'NARRATOR', textKey: 'story_boss_3_0' },
        { speaker: 'MILIA', textKey: 'story_boss_3_1' },
        { speaker: 'MILIA', textKey: 'story_boss_3_2' }
    ],
    4: [
        { speaker: 'NARRATOR', textKey: 'story_boss_4_0' },
        { speaker: 'TROY', textKey: 'story_boss_4_1' },
        { speaker: 'TROY', textKey: 'story_boss_4_2' }
    ]
};

// Victory dialogue keys (after defeating boss, before collecting reward sprite)
const VICTORY_DIALOGUES = {
    1: [
        { speaker: 'NARRATOR', textKey: 'story_vic_1_0' },
        { speaker: 'REX', textKey: 'story_vic_1_1' },
        { speaker: 'NARRATOR', textKey: 'story_vic_1_2' },
        { speaker: 'REX', textKey: 'story_vic_1_3' },
        { speaker: 'REX', textKey: 'story_vic_1_4' }
    ],
    2: [
        { speaker: 'NARRATOR', textKey: 'story_vic_2_0' },
        { speaker: 'BETH', textKey: 'story_vic_2_1' },
        { speaker: 'BETH', textKey: 'story_vic_2_2' },
        { speaker: 'NARRATOR', textKey: 'story_vic_2_3' },
        { speaker: 'BETH', textKey: 'story_vic_2_4' },
        { speaker: 'BETH', textKey: 'story_vic_2_5' }
    ],
    3: [
        { speaker: 'NARRATOR', textKey: 'story_vic_3_0' },
        { speaker: 'MILIA', textKey: 'story_vic_3_1' },
        { speaker: 'NARRATOR', textKey: 'story_vic_3_2' },
        { speaker: 'MILIA', textKey: 'story_vic_3_3' },
        { speaker: 'MILIA', textKey: 'story_vic_3_4' }
    ],
    4: [
        { speaker: 'NARRATOR', textKey: 'story_vic_4_0' },
        { speaker: 'TROY', textKey: 'story_vic_4_1' },
        { speaker: 'TROY', textKey: 'story_vic_4_2' },
        { speaker: 'NARRATOR', textKey: 'story_vic_4_3' },
        { speaker: 'TROY', textKey: 'story_vic_4_4' },
        { speaker: 'TROY', textKey: 'story_vic_4_5' }
    ]
};

// Chapter complete dialogue (after collecting reward sprite)
const CHAPTER_COMPLETE_DIALOGUES = {
    1: [
        { speaker: 'REX', textKey: 'story_complete_1_1' },
        { speaker: 'REX', textKey: 'story_complete_1_2' },
        { speaker: 'NARRATOR', textKey: 'story_complete_1_3' }
    ],
    2: [
        { speaker: 'BETH', textKey: 'story_complete_2_1' },
        { speaker: 'BETH', textKey: 'story_complete_2_2' },
        { speaker: 'BETH', textKey: 'story_complete_2_3' },
        { speaker: 'BETH', textKey: 'story_complete_2_4' },
        { speaker: 'NARRATOR', textKey: 'story_complete_2_5' }
    ],
    3: [
        { speaker: 'MILIA', textKey: 'story_complete_3_1' },
        { speaker: 'MILIA', textKey: 'story_complete_3_2' },
        { speaker: 'MILIA', textKey: 'story_complete_3_3' },
        { speaker: 'MILIA', textKey: 'story_complete_3_4' },
        { speaker: 'MILIA', textKey: 'story_complete_3_5' },
        { speaker: 'NARRATOR', textKey: 'story_complete_3_6' }
    ],
    4: [
        { speaker: 'NARRATOR', textKey: 'story_complete_4_1' },
        { speaker: 'REX', textKey: 'story_complete_4_2' },
        { speaker: 'BETH', textKey: 'story_complete_4_3' },
        { speaker: 'MILIA', textKey: 'story_complete_4_4' },
        { speaker: 'TROY', textKey: 'story_complete_4_5' },
        { speaker: 'TROY', textKey: 'story_complete_4_6' },
        { speaker: 'REX', textKey: 'story_complete_4_7' },
        { speaker: 'BETH', textKey: 'story_complete_4_8' },
        { speaker: 'MILIA', textKey: 'story_complete_4_9' },
        { speaker: 'TROY', textKey: 'story_complete_4_10' },
        { speaker: 'ALL_HEROES', textKey: 'story_complete_4_11' },
        { speaker: 'NARRATOR', textKey: 'story_complete_4_12' }
    ]
};

// Sprites player starts with at beginning of each chapter
const CHAPTER_START_SPRITES = {
    1: [],  // Ch1: Start with nothing
    2: ['archer', 'frost', 'knight'],  // Ch2: From Ch1
    3: ['archer', 'frost', 'knight', 'berserker', 'wizard'],  // Ch3: From Ch1+Ch2
    4: ['archer', 'frost', 'knight', 'berserker', 'wizard', 'mage', 'cleric']  // Ch4: All previous
};

// First sprite to collect at chapter start (only Ch1 has this)
const CHAPTER_FIRST_SPRITE = {
    1: 'archer',
    2: null,  // Ch2-4: Already have sprites, enemies spawn immediately
    3: null,
    4: null
};

// Mid-chapter sprite (appears after minion waves, before boss)
const CHAPTER_MID_SPRITES = {
    1: 'frost',
    2: 'berserker',
    3: 'mage',
    4: 'vampire'
};

// Reward sprites given after defeating each chapter's boss
const CHAPTER_REWARD_SPRITES = {
    1: 'knight',
    2: 'wizard',
    3: 'cleric',
    4: ['ninja', 'bomber']  // Chapter 4 gives 2 sprites
};

// Skill orbs available per chapter
const CHAPTER_SKILL_ORBS = {
    1: 'skillMagnet',
    2: 'skillDash',
    3: 'skillNuke',
    4: 'skillHeal'
};

// Flag to spawn reward sprite after victory dialogue
let pendingRewardSprite = false;

// Flag to spawn mid-chapter sprite after minion waves
let pendingMidSprite = false;

// Flag to indicate we're awaiting reward sprite collection (blocks orb spawning)
let awaitingRewardCollection = false;

// Show intro dialogue for current chapter
function showChapterIntro() {
    const intro = CHAPTER_INTROS[storyChapter];
    if (!intro) return;

    // Store textKey for on-the-fly translation (supports language switching)
    dialogueQueue = intro.map(d => ({
        speaker: d.speaker,
        textKey: d.textKey
    }));

    dialogueIndex = 0;
    dialogueCharIndex = 0;
    dialogueTimer = 0;
    dialogueActive = true;
    gamePaused = true;

    showDialogueBox();
    updateDialogueDisplay();
}

function showDialogueBox() {
    document.getElementById('dialogueBox').style.display = 'block';
}

function hideDialogueBox() {
    document.getElementById('dialogueBox').style.display = 'none';
}

function updateDialogueDisplay() {
    if (!dialogueActive || dialogueIndex >= dialogueQueue.length) return;

    const current = dialogueQueue[dialogueIndex];
    const speakerEl = document.getElementById('dialogueSpeaker');
    // Hide speaker name for narrator, show for characters
    if (current.speaker === 'NARRATOR') {
        speakerEl.style.display = 'none';
    } else {
        speakerEl.style.display = 'block';
        // Translate special speaker names
        const speakerName = current.speaker === 'ALL_HEROES' ? t('allHeroes') : current.speaker;
        speakerEl.textContent = speakerName;
    }
    // Translate on-the-fly to support language switching during dialogue
    const fullText = getDialogueText(current.textKey);
    const displayText = fullText.substring(0, dialogueCharIndex);
    document.getElementById('dialogueText').textContent = displayText;
}

function updateDialogue() {
    if (!dialogueActive) return;

    if (dialogueIndex >= dialogueQueue.length) {
        endDialogue();
        return;
    }

    const current = dialogueQueue[dialogueIndex];
    const fullText = getDialogueText(current.textKey);

    dialogueTimer++;
    if (dialogueTimer >= DIALOGUE_SPEED) {
        dialogueTimer = 0;
        if (dialogueCharIndex < fullText.length) {
            dialogueCharIndex++;
            updateDialogueDisplay();
            if (dialogueCharIndex % 3 === 0) {
                playSound('type');
            }
        }
    }
}

function advanceDialogue() {
    if (!dialogueActive) return;

    if (dialogueIndex >= dialogueQueue.length) {
        endDialogue();
        return;
    }

    const current = dialogueQueue[dialogueIndex];
    const fullText = getDialogueText(current.textKey);

    if (dialogueCharIndex < fullText.length) {
        dialogueCharIndex = fullText.length;
        updateDialogueDisplay();
    } else {
        dialogueIndex++;
        dialogueCharIndex = 0;
        dialogueTimer = 0;

        if (dialogueIndex >= dialogueQueue.length) {
            endDialogue();
        } else {
            updateDialogueDisplay();
            playSound('dialogueNext');
        }
    }
}

function endDialogue() {
    dialogueActive = false;
    dialogueQueue = [];
    dialogueIndex = 0;
    dialogueCharIndex = 0;
    hideDialogueBox();

    if (storyChapter === 5) {
        showStoryEnding();
        return;
    }

    gamePaused = false;

    // After intro dialogue
    if (storyWave === 0) {
        storyWave = 1;
        const firstSprite = CHAPTER_FIRST_SPRITE[storyChapter];
        if (firstSprite) {
            // Ch1: spawn first sprite for player to collect
            spawnSpriteOrb(firstSprite);
        } else {
            // Ch2-4: player already has sprites, spawn enemies immediately
            spawnStoryWave();
        }
    }

    // After collection dialogue, spawn enemies with a small delay
    if (pendingWaveSpawn) {
        pendingWaveSpawn = false;
        // Small delay to ensure game state is fully ready
        setTimeout(() => {
            if (gameRunning && storyMode && !gamePaused) {
                spawnStoryWave();
            }
        }, 100);
    }

    // After mid-sprite appear dialogue, spawn the mid-sprite
    if (pendingMidSprite) {
        pendingMidSprite = false;
        storyWaveSpawning = false;
        const midSprite = CHAPTER_MID_SPRITES[storyChapter];
        if (midSprite) {
            orbs = [];
            skillOrbs = [];
            spawnSpriteOrb(midSprite);
        }
    }

    // After boss intro dialogue, spawn the boss
    if (pendingBossSpawn) {
        pendingBossSpawn = false;
        setTimeout(() => {
            if (gameRunning && storyMode && !gamePaused) {
                spawnRemnantBoss();
            }
        }, 100);
    }

    // After victory dialogue, spawn reward sprite for player to collect
    if (pendingRewardSprite) {
        pendingRewardSprite = false;
        awaitingRewardCollection = true; // Block orb spawning during reward collection
        // Clear all orbs and skill orbs - focus on collecting the reward sprite
        orbs = [];
        skillOrbs = [];
        const rewardSprite = CHAPTER_REWARD_SPRITES[storyChapter];
        if (rewardSprite) {
            if (Array.isArray(rewardSprite)) {
                // Multiple sprites (chapter 4)
                rewardSprite.forEach((sprite, i) => {
                    setTimeout(() => spawnSpriteOrb(sprite), i * 200);
                });
            } else {
                spawnSpriteOrb(rewardSprite);
            }
        }
        return; // Don't show victory yet, wait for player to collect sprite
    }

    // After chapter complete dialogue, show victory screen
    if (pendingVictory) {
        pendingVictory = false;
        showStoryVictory();
    }
}

// Sprite orbs - collectible sprites that appear on the map
let spriteOrbs = [];

// Spawn a sprite orb for player to collect
function spawnSpriteOrb(spriteType) {
    // Force autopilot off - player must manually collect sprite
    if (autopilot) autopilot = false;

    const colors = {
        archer: '#5f5',
        knight: '#f55',
        mage: '#a5f',
        cleric: '#ff5',
        ninja: '#555',
        wizard: '#5ff',
        berserker: '#f80',
        frost: '#8ef',
        vampire: '#d4a',
        bomber: '#fa0'
    };

    // Spawn at random position away from player
    let x, y;
    do {
        x = 100 + Math.random() * (canvas.width - 200);
        y = 100 + Math.random() * (canvas.height - 200);
    } while (Math.hypot(x - player.x, y - player.y) < 150);

    spriteOrbs.push({
        x, y,
        spriteType,
        color: colors[spriteType] || '#fff',
        size: 15,
        pulse: 0
    });
}

// Update sprite orbs (check collection)
function updateSpriteOrbs() {
    for (let i = spriteOrbs.length - 1; i >= 0; i--) {
        const orb = spriteOrbs[i];
        orb.pulse += 0.1;

        // Check if player collects it
        const dist = Math.hypot(orb.x - player.x, orb.y - player.y);
        if (dist < orb.size + 15) {
            collectSpriteOrb(orb);
            spriteOrbs.splice(i, 1);
        }
    }
}

// Player collects a sprite orb
function collectSpriteOrb(orb) {
    collectedSprites.add(orb.spriteType);
    playSound('collectSkillOrb');

    // Give player points to summon this sprite
    const spriteConfig = spriteTypes.find(s => s.nameKey === orb.spriteType);
    if (spriteConfig) {
        points += spriteConfig.cost + 10;
    }

    // Create collection effect
    for (let i = 0; i < 15; i++) {
        effects.push({
            x: orb.x, y: orb.y,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            life: 40,
            color: orb.color,
            type: 'particle'
        });
    }

    // Check if this is the reward sprite (after boss defeat)
    const rewardSprite = CHAPTER_REWARD_SPRITES[storyChapter];
    const isRewardSprite = Array.isArray(rewardSprite)
        ? rewardSprite.includes(orb.spriteType)
        : rewardSprite === orb.spriteType;

    if (storyWave === 5 && boss === null && isRewardSprite) {
        // Check if all reward sprites collected (for chapter 4 with multiple sprites)
        if (Array.isArray(rewardSprite)) {
            const allCollected = rewardSprite.every(s => collectedSprites.has(s));
            // spriteOrbs.length <= 1 because current orb hasn't been spliced yet
            if (allCollected && spriteOrbs.length <= 1) {
                showChapterCompleteDialogue();
            }
        } else {
            showChapterCompleteDialogue();
        }
        return;
    }

    // Check if this is a mid-sprite (after minion waves, before boss)
    const midSprite = CHAPTER_MID_SPRITES[storyChapter];
    if (storyWave === 5 && boss === null && orb.spriteType === midSprite && !bossActive) {
        showMidSpriteCollectDialogue();
        return;
    }

    // Show collection dialogue and then spawn enemies
    showSpriteCollectDialogue(orb.spriteType);
}

// Show dialogue after collecting mid-sprite (leads to boss)
function showMidSpriteCollectDialogue() {
    const dialogue = MID_SPRITE_COLLECT_DIALOGUES[storyChapter];
    if (!dialogue) {
        // No dialogue, go to boss intro
        showBossIntro();
        return;
    }

    dialogueQueue = dialogue.map(d => ({
        speaker: d.speaker,
        textKey: d.textKey
    }));

    dialogueIndex = 0;
    dialogueCharIndex = 0;
    dialogueTimer = 0;
    dialogueActive = true;
    gamePaused = true;
    pendingBossSpawn = true; // Spawn boss after this dialogue

    showDialogueBox();
    updateDialogueDisplay();
}

// Show dialogue after collecting a sprite
function showSpriteCollectDialogue(spriteType) {
    const dialogues = {
        archer: [
            { speaker: 'REX', textKey: 'story_collect_archer' }
        ]
    };

    const dialogue = dialogues[spriteType];
    if (dialogue) {
        // Store textKey for on-the-fly translation
        dialogueQueue = dialogue.map(d => ({
            speaker: d.speaker,
            textKey: d.textKey
        }));

        dialogueIndex = 0;
        dialogueCharIndex = 0;
        dialogueTimer = 0;
        dialogueActive = true;
        gamePaused = true;
        pendingWaveSpawn = true; // Spawn enemies after this dialogue

        showDialogueBox();
        updateDialogueDisplay();
    } else {
        // No dialogue, spawn enemies immediately
        spawnStoryWave();
    }
}

// Sprite availability per chapter (what player CAN collect/summon)
const CHAPTER_SPRITES = {
    1: ['archer'],
    2: ['archer', 'cleric', 'ninja'],
    3: ['archer', 'cleric', 'ninja', 'wizard', 'berserker'],
    4: ['archer', 'cleric', 'ninja', 'wizard', 'berserker', 'frost', 'vampire', 'bomber']
};

// Check if a sprite type is available in current chapter
function isSpriteAvailable(spriteType) {
    if (!storyMode) return true;
    // Must have collected it in story mode
    return collectedSprites.has(spriteType);
}

// Spawn story mode wave enemies
function spawnStoryWave() {
    storyWaveSpawning = true;

    if (storyWave < 5) {
        const count = 3 + storyWave * 2;
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                if (gameRunning && storyMode && !gamePaused) {
                    spawnStoryEnemy();
                }
            }, i * 500);
        }
        setTimeout(() => { storyWaveSpawning = false; }, count * 500 + 100);
    } else {
        spawnRemnantBoss();
        storyWaveSpawning = false;
    }
}

// Spawn a story mode enemy
function spawnStoryEnemy() {
    const types = ['Chaser'];
    if (storyChapter >= 2) types.push('Shooter');
    if (storyChapter >= 3) types.push('Speedy');
    if (storyChapter >= 4) types.push('Tank');

    const typeName = types[Math.floor(Math.random() * types.length)];
    const config = enemyTypes.find(e => e.name === typeName);

    if (!config) return;

    // Spawn at edges of screen (just barely visible)
    const side = Math.floor(Math.random() * 4);
    let x, y;
    const margin = 20;
    if (side === 0) { x = margin + Math.random() * (canvas.width - margin * 2); y = margin; }
    else if (side === 1) { x = canvas.width - margin; y = margin + Math.random() * (canvas.height - margin * 2); }
    else if (side === 2) { x = margin + Math.random() * (canvas.width - margin * 2); y = canvas.height - margin; }
    else { x = margin; y = margin + Math.random() * (canvas.height - margin * 2); }

    enemies.push({
        x, y,
        size: config.size,
        width: config.size,
        height: config.size,
        speed: config.speed,
        hp: config.hp * (1 + storyChapter * 0.2),
        maxHp: config.hp * (1 + storyChapter * 0.2),
        damage: config.damage,
        color: config.color,
        type: config.type,
        shootCooldown: config.shootCooldown, // Required for ranged enemies to keep shooting
        attackCooldown: 0,
        currentShootCooldown: 0,
        slowed: 0,
        attackTimer: config.shootCooldown || 60
    });
}

// Spawn Remnant boss
function spawnRemnantBoss() {
    bossActive = true;
    storyWaveSpawning = false; // Reset so checkStoryWaveComplete can detect boss death

    const remnantConfigs = {
        1: { name: 'Remnant of Rex', hp: 2000, damage: 40, color: '#ff6600', size: 50, speed: 7.5 },
        2: { name: 'Remnant of Beth', hp: 1000, damage: 35, color: '#00ffff', size: 45, speed: 2.0 },
        3: { name: 'Remnant of Milia', hp: 1500, damage: 45, color: '#ffffff', size: 55, speed: 1.2 },
        4: { name: 'Remnant of Troy', hp: 1750, damage: 80, color: '#ff00ff', size: 60, speed: 1.0 }
    };

    const config = remnantConfigs[storyChapter];

    boss = {
        x: canvas.width / 2,
        y: -50,
        targetY: 120,
        size: config.size,
        width: config.size,
        height: config.size,
        speed: config.speed,
        hp: config.hp,
        maxHp: config.hp,
        damage: config.damage,
        color: config.color,
        type: 'remnant',
        remnantType: storyChapter,
        nameKey: 'remnant',
        bossNum: storyChapter, // Use chapter as boss number for attack patterns
        attackTimer: 0,
        attackPattern: 0,
        phase: 0,
        moveTimer: 0,
        targetX: canvas.width / 2,
        // Boss-specific mechanics (needed for updateBossMechanics)
        rageMode: false,
        teleportTimer: 0,
        cloneSpawned: false,
        gravityTimer: 0,
        shield: 0,
        shieldTimer: 0,
        enrageTimer: 0,
        enraged: false,
        slowed: 0,
        // Chapter 3 (Milia's Remnant) has projectile immunity
        projectileImmune: storyChapter === 3
    };

    document.getElementById('bossHealth').style.display = 'block';
    document.getElementById('bossName').textContent = config.name;
    playSound('bossSpawn');
}

// Handle story mode wave completion
function checkStoryWaveComplete() {
    if (!storyMode || !gameRunning || dialogueActive || storyWaveSpawning) return;
    if (storyWave < 1) return;

    // Check if all enemies dead and no sprite orbs pending
    if (storyWave < 5 && enemies.length === 0 && spriteOrbs.length === 0) {
        storyWaveSpawning = true;
        storyWave++;

        if (storyWave <= 4) {
            // More minion waves
            setTimeout(() => {
                if (gameRunning && storyMode) {
                    spawnStoryWave();
                }
            }, 2000);
        } else {
            // Wave 5 - spawn mid-sprite first, then boss after collecting
            const midSprite = CHAPTER_MID_SPRITES[storyChapter];
            if (midSprite && !collectedSprites.has(midSprite)) {
                setTimeout(() => {
                    if (gameRunning && storyMode) {
                        showMidSpriteAppearDialogue();
                    }
                }, 1000);
            } else {
                // Mid-sprite already collected, go straight to boss
                setTimeout(() => {
                    if (gameRunning && storyMode) {
                        showBossIntro();
                    }
                }, 1000);
            }
        }
    }

    if (storyWave === 5 && boss === null && bossActive) {
        bossActive = false;
        document.getElementById('bossHealth').style.display = 'none';
        completeStoryChapter();
    }
}

// Mid-sprite appearance dialogues (shown when mid-sprite spawns)
const MID_SPRITE_APPEAR_DIALOGUES = {
    1: [
        { speaker: 'NARRATOR', textKey: 'story_mid_appear_1_1' },
        { speaker: 'REX', textKey: 'story_mid_appear_1_2' },
        { speaker: 'REX', textKey: 'story_mid_appear_1_3' }
    ],
    2: [
        { speaker: 'BETH', textKey: 'story_mid_appear_2_1' },
        { speaker: 'NARRATOR', textKey: 'story_mid_appear_2_2' },
        { speaker: 'BETH', textKey: 'story_mid_appear_2_3' },
        { speaker: 'BETH', textKey: 'story_mid_appear_2_4' }
    ],
    3: [
        { speaker: 'MILIA', textKey: 'story_mid_appear_3_1' },
        { speaker: 'NARRATOR', textKey: 'story_mid_appear_3_2' },
        { speaker: 'MILIA', textKey: 'story_mid_appear_3_3' },
        { speaker: 'MILIA', textKey: 'story_mid_appear_3_4' }
    ],
    4: [
        { speaker: 'TROY', textKey: 'story_mid_appear_4_1' },
        { speaker: 'NARRATOR', textKey: 'story_mid_appear_4_2' },
        { speaker: 'TROY', textKey: 'story_mid_appear_4_3' },
        { speaker: 'TROY', textKey: 'story_mid_appear_4_4' }
    ]
};

// Mid-sprite collection dialogues (shown after collecting, leads to boss)
const MID_SPRITE_COLLECT_DIALOGUES = {
    1: [
        { speaker: 'REX', textKey: 'story_mid_collect_1_1' },
        { speaker: 'REX', textKey: 'story_mid_collect_1_2' },
        { speaker: 'REX', textKey: 'story_mid_collect_1_3' },
        { speaker: 'REX', textKey: 'story_mid_collect_1_4' },
        { speaker: 'REX', textKey: 'story_mid_collect_1_5' },
        { speaker: 'NARRATOR', textKey: 'story_mid_collect_1_6' },
        { speaker: 'REX', textKey: 'story_mid_collect_1_7' },
        { speaker: 'REX', textKey: 'story_mid_collect_1_8' }
    ],
    2: [
        { speaker: 'BETH', textKey: 'story_mid_collect_2_1' },
        { speaker: 'BETH', textKey: 'story_mid_collect_2_2' },
        { speaker: 'BETH', textKey: 'story_mid_collect_2_3' },
        { speaker: 'BETH', textKey: 'story_mid_collect_2_4' },
        { speaker: 'NARRATOR', textKey: 'story_mid_collect_2_5' }
    ],
    3: [
        { speaker: 'MILIA', textKey: 'story_mid_collect_3_1' },
        { speaker: 'MILIA', textKey: 'story_mid_collect_3_2' },
        { speaker: 'MILIA', textKey: 'story_mid_collect_3_3' },
        { speaker: 'MILIA', textKey: 'story_mid_collect_3_4' },
        { speaker: 'NARRATOR', textKey: 'story_mid_collect_3_5' }
    ],
    4: [
        { speaker: 'TROY', textKey: 'story_mid_collect_4_1' },
        { speaker: 'TROY', textKey: 'story_mid_collect_4_2' },
        { speaker: 'TROY', textKey: 'story_mid_collect_4_3' },
        { speaker: 'TROY', textKey: 'story_mid_collect_4_4' },
        { speaker: 'NARRATOR', textKey: 'story_mid_collect_4_5' }
    ]
};

// Show dialogue when mid-sprite appears
function showMidSpriteAppearDialogue() {
    const dialogue = MID_SPRITE_APPEAR_DIALOGUES[storyChapter];
    if (!dialogue) {
        // No dialogue, spawn mid-sprite directly
        const midSprite = CHAPTER_MID_SPRITES[storyChapter];
        if (midSprite) spawnSpriteOrb(midSprite);
        storyWaveSpawning = false;
        return;
    }

    dialogueQueue = dialogue.map(d => ({
        speaker: d.speaker,
        textKey: d.textKey
    }));

    dialogueIndex = 0;
    dialogueCharIndex = 0;
    dialogueTimer = 0;
    dialogueActive = true;
    gamePaused = true;
    pendingMidSprite = true; // Spawn mid-sprite after this dialogue

    showDialogueBox();
    updateDialogueDisplay();
}

// Show boss intro dialogue
function showBossIntro() {
    const intro = BOSS_INTROS[storyChapter];
    if (!intro) {
        spawnRemnantBoss();
        return;
    }

    // Store textKey for on-the-fly translation
    dialogueQueue = intro.map(d => ({
        speaker: d.speaker,
        textKey: d.textKey
    }));

    dialogueIndex = 0;
    dialogueCharIndex = 0;
    dialogueTimer = 0;
    dialogueActive = true;
    gamePaused = true;
    pendingBossSpawn = true; // Spawn boss after this dialogue

    showDialogueBox();
    updateDialogueDisplay();
}

// Complete a story chapter
function completeStoryChapter() {
    if (storyChapter > storyProgress.chaptersCompleted) {
        storyProgress.chaptersCompleted = storyChapter;
        saveStoryProgress();
    }

    const victory = VICTORY_DIALOGUES[storyChapter];
    if (!victory) {
        showStoryVictory();
        return;
    }

    // Store textKey for on-the-fly translation
    dialogueQueue = victory.map(d => ({
        speaker: d.speaker,
        textKey: d.textKey
    }));

    dialogueIndex = 0;
    dialogueCharIndex = 0;
    dialogueTimer = 0;
    dialogueActive = true;
    gamePaused = true;
    pendingRewardSprite = true; // Spawn reward sprite after this dialogue

    showDialogueBox();
    updateDialogueDisplay();
}

// Show chapter complete dialogue (after collecting reward sprite)
function showChapterCompleteDialogue() {
    awaitingRewardCollection = false; // Player collected all reward sprites

    const complete = CHAPTER_COMPLETE_DIALOGUES[storyChapter];
    if (!complete) {
        showStoryVictory();
        return;
    }

    dialogueQueue = complete.map(d => ({
        speaker: d.speaker,
        textKey: d.textKey
    }));

    dialogueIndex = 0;
    dialogueCharIndex = 0;
    dialogueTimer = 0;
    dialogueActive = true;
    gamePaused = true;
    pendingVictory = true; // Show victory screen after this dialogue

    showDialogueBox();
    updateDialogueDisplay();
}

function showStoryVictory() {
    gameRunning = false;
    storyMode = false;
    points = 0;
    updateUI(); // Update sprite buttons (disabled when not running)
    document.getElementById('storyModeScreen').style.display = 'flex';
    updateChapterButtons();
}

function showStoryEnding() {
    gameRunning = false;
    storyMode = false;
    points = 0;
    updateUI(); // Update sprite buttons (disabled when not running)
    document.getElementById('startScreen').style.display = 'flex';
}

// Draw sprite orbs
function drawSpriteOrbs() {
    spriteOrbs.forEach(orb => {
        ctx.save();

        const pulseSize = orb.size + Math.sin(orb.pulse) * 3;
        const fastPulse = orb.pulse * 2;

        // Outer expanding rings
        for (let ring = 0; ring < 2; ring++) {
            const ringPhase = (orb.pulse + ring * 2) % (Math.PI * 2);
            const ringSize = pulseSize + 10 + ringPhase * 8;
            const ringAlpha = Math.max(0.05, 0.35 - ringPhase * 0.05);
            ctx.beginPath();
            ctx.arc(orb.x, orb.y, ringSize, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 255, 255, ${ringAlpha})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }

        // Soft outer glow
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, pulseSize + 18, 0, Math.PI * 2);
        ctx.fillStyle = orb.color + '33';
        ctx.fill();

        // Middle glow
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, pulseSize + 8, 0, Math.PI * 2);
        ctx.fillStyle = orb.color + '55';
        ctx.fill();

        // Rotating sparkles
        for (let i = 0; i < 5; i++) {
            const angle = fastPulse + (Math.PI * 2 / 5) * i;
            const sparkDist = pulseSize + 6 + Math.sin(orb.pulse * 3 + i) * 2;
            const sparkX = orb.x + Math.cos(angle) * sparkDist;
            const sparkY = orb.y + Math.sin(angle) * sparkDist;
            const sparkSize = 1.5 + Math.sin(orb.pulse * 2 + i);

            ctx.beginPath();
            ctx.arc(sparkX, sparkY, sparkSize, 0, Math.PI * 2);
            ctx.fillStyle = '#fff';
            ctx.fill();
        }

        // Main orb body
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, pulseSize, 0, Math.PI * 2);
        ctx.fillStyle = orb.color;
        ctx.fill();

        // Inner highlight (top-left)
        ctx.beginPath();
        ctx.arc(orb.x - pulseSize * 0.25, orb.y - pulseSize * 0.25, pulseSize * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fill();

        // Bright center core
        const coreSize = pulseSize * 0.25 + Math.sin(fastPulse) * 1.5;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, coreSize, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();

        // Sprite name label below - using universally compatible bold font
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeText(t(orb.spriteType).toUpperCase(), orb.x, orb.y + pulseSize + 10);
        ctx.fillText(t(orb.spriteType).toUpperCase(), orb.x, orb.y + pulseSize + 10);

        ctx.restore();
    });
}

// Handle Enter key in name input
document.addEventListener('DOMContentLoaded', () => {
    const nameInput = document.getElementById('playerNameInput');
    if (nameInput) {
        nameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                confirmPlayerName();
            }
        });
    }
});
