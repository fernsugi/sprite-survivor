// Main Game Loop and Initialization

// Gamepad optimization: track if a gamepad is connected
let hasGamepad = false;

window.addEventListener('gamepadconnected', function () {
    hasGamepad = true;
});

window.addEventListener('gamepaddisconnected', function () {
    hasGamepad = false;
});

function spawnOrb() {
    const margin = 50;
    orbs.push({
        x: margin + Math.random() * (canvas.width - margin * 2),
        y: margin + Math.random() * (canvas.height - margin * 2),
        size: 10, pulse: Math.random() * Math.PI * 2
    });
}

const ORB_HEAL_AMOUNT = 2;
const ORB_SCORE = 10;
const ORB_SPEED_BOOST = 0.05;
const ORB_SPEED_BOOST_DURATION = 180; // 3 seconds at 60fps
const ORB_SPEED_BOOST_MAX = 1.0;

function collectOrb(orb, effectColor = '#fff') {
    SFX.collectOrb();
    points++;
    score += ORB_SCORE;
    if (debuffs.noHeal <= 0) player.hp = Math.min(player.maxHp, player.hp + ORB_HEAL_AMOUNT);
    // Add speed boost (stacks up to max)
    player.speedBoost = Math.min(ORB_SPEED_BOOST_MAX, player.speedBoost + ORB_SPEED_BOOST);
    player.speedBoostTimer = ORB_SPEED_BOOST_DURATION;
    for (let j = 0; j < 5; j++) {
        effects.push({ x: orb.x, y: orb.y, vx: (Math.random() - 0.5) * 3, vy: (Math.random() - 0.5) * 3, life: 20, color: effectColor, type: 'particle' });
    }
}

function updateEffects() {
    for (let i = effects.length - 1; i >= 0; i--) {
        const effect = effects[i]; effect.life--;
        if (effect.vx !== undefined) { effect.x += effect.vx; effect.y += effect.vy; effect.vy += 0.1; }
        if (effect.life <= 0) effects.splice(i, 1);
    }
}

function updateOrbs() {
    orbs.forEach(orb => orb.pulse += 0.1);
    skillOrbs.forEach(orb => orb.pulse += 0.08);

    for (let i = orbs.length - 1; i >= 0; i--) {
        const orb = orbs[i];
        const dx = player.x - orb.x, dy = player.y - orb.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        // Move magnetized orbs towards player
        if (orb.magnetized && dist > 5) {
            orb.x += dx * 0.15;
            orb.y += dy * 0.15;
        }
        if (dist < player.width / 2 + orb.size) {
            orbs.splice(i, 1);
            collectOrb(orb, orb.magnetized ? '#ff0' : '#fff');
        }
    }

    for (let i = skillOrbs.length - 1; i >= 0; i--) {
        const orb = skillOrbs[i];
        const dx = player.x - orb.x, dy = player.y - orb.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        // Move magnetized orbs towards player
        if (orb.magnetized && dist > 5) {
            orb.x += dx * 0.15;
            orb.y += dy * 0.15;
        }
        if (dist < player.width / 2 + orb.size) {
            skillOrbs.splice(i, 1);
            currentSkill = orb.skill;
            SFX.collectSkillOrb();
            updateSkillDisplay();
            for (let j = 0; j < 10; j++) effects.push({ x: orb.x, y: orb.y, vx: (Math.random() - 0.5) * 5, vy: (Math.random() - 0.5) * 5, life: 30, color: orb.skill.color, type: 'particle' });
        }
    }
}

function updatePlayer() {
    // Update speed boost timer
    if (player.speedBoostTimer > 0) {
        player.speedBoostTimer--;
        if (player.speedBoostTimer <= 0) {
            player.speedBoost = 0;
        }
    }

    let dx = 0, dy = 0;

    if (autopilot) {
        // Autopilot AI
        let targetX = player.x, targetY = player.y;
        let hasTarget = false;

        // Find nearest skill orb (priority)
        let nearestDist = Infinity;
        skillOrbs.forEach(orb => {
            const dist = Math.sqrt((orb.x - player.x) ** 2 + (orb.y - player.y) ** 2);
            if (dist < nearestDist) {
                nearestDist = dist;
                targetX = orb.x;
                targetY = orb.y;
                hasTarget = true;
            }
        });

        // If no skill orb, find nearest regular orb
        if (!hasTarget || nearestDist > 200) {
            orbs.forEach(orb => {
                const dist = Math.sqrt((orb.x - player.x) ** 2 + (orb.y - player.y) ** 2);
                if (dist < nearestDist) {
                    nearestDist = dist;
                    targetX = orb.x;
                    targetY = orb.y;
                    hasTarget = true;
                }
            });
        }

        // Calculate direction to target
        if (hasTarget) {
            dx = targetX - player.x;
            dy = targetY - player.y;
        }

        // Avoid nearby enemies and projectiles
        let avoidX = 0, avoidY = 0;
        const dangerRadius = 80;
        enemies.forEach(enemy => {
            const ex = enemy.x - player.x, ey = enemy.y - player.y;
            const dist = Math.sqrt(ex * ex + ey * ey);
            if (dist < dangerRadius && dist > 0) {
                const force = (dangerRadius - dist) / dangerRadius;
                avoidX -= (ex / dist) * force * 3;
                avoidY -= (ey / dist) * force * 3;
            }
        });
        projectiles.forEach(proj => {
            const px = proj.x - player.x, py = proj.y - player.y;
            const dist = Math.sqrt(px * px + py * py);
            if (dist < 60 && dist > 0) {
                const force = (60 - dist) / 60;
                avoidX -= (px / dist) * force * 4;
                avoidY -= (py / dist) * force * 4;
            }
        });
        // Avoid boss
        if (boss) {
            const bx = boss.x - player.x, by = boss.y - player.y;
            const dist = Math.sqrt(bx * bx + by * by);
            if (dist < 120 && dist > 0) {
                const force = (120 - dist) / 120;
                avoidX -= (bx / dist) * force * 3;
                avoidY -= (by / dist) * force * 3;
            }
        }

        // Combine target direction with avoidance
        dx += avoidX;
        dy += avoidY;

        // Smart skill usage
        if (currentSkill) {
            let shouldUseSkill = false;

            // Check if approaching a skill orb - use current skill before picking up new one
            const nearestSkillOrb = skillOrbs.reduce((nearest, orb) => {
                const d = Math.sqrt((orb.x - player.x) ** 2 + (orb.y - player.y) ** 2);
                return d < nearest.dist ? { orb, dist: d } : nearest;
            }, { orb: null, dist: Infinity });
            if (nearestSkillOrb.dist < 40) {
                shouldUseSkill = true; // About to pick up new skill, use current one
            }

            // Skill-specific logic
            switch (currentSkill.name) {
                case 'skillMagnet':
                    shouldUseSkill = true; // Always use immediately
                    break;
                case 'skillHero':
                    shouldUseSkill = true; // Always use immediately - permanent ally!
                    break;
                case 'skillHeal':
                    if (player.hp < player.maxHp * 0.5) shouldUseSkill = true; // Use when HP < 50%
                    break;
                case 'skillNuke':
                    if (enemies.length >= 5) shouldUseSkill = true; // Use when 5+ enemies
                    break;
                case 'skillDash':
                    // Emergency escape when enemy very close
                    const dangerousEnemy = enemies.some(e => {
                        const d = Math.sqrt((e.x - player.x) ** 2 + (e.y - player.y) ** 2);
                        return d < 50;
                    });
                    if (dangerousEnemy) shouldUseSkill = true;
                    // Also use near boss
                    if (boss) {
                        const bossDist = Math.sqrt((boss.x - player.x) ** 2 + (boss.y - player.y) ** 2);
                        if (bossDist < 80) shouldUseSkill = true;
                    }
                    break;
            }

            if (shouldUseSkill) useSkill();
        }
    } else {
        // Manual control
        const gp = window.gamepadDirection || { up: false, down: false, left: false, right: false };
        if (keys['w'] || keys['W'] || keys['ArrowUp'] || gp.up) dy -= 1;
        if (keys['s'] || keys['S'] || keys['ArrowDown'] || gp.down) dy += 1;
        if (keys['a'] || keys['A'] || keys['ArrowLeft'] || gp.left) dx -= 1;
        if (keys['d'] || keys['D'] || keys['ArrowRight'] || gp.right) dx += 1;
    }

    if (dx !== 0 || dy !== 0) {
        const len = Math.sqrt(dx * dx + dy * dy);
        dx /= len; dy /= len;
        player.facingX = dx;
        player.facingY = dy;
        const currentSpeed = (player.speed + player.speedBoost) * (debuffs.slow > 0 ? 0.5 : 1);
        player.x += dx * currentSpeed; player.y += dy * currentSpeed;
    }
    player.x = Math.max(player.width / 2, Math.min(canvas.width - player.width / 2, player.x));
    player.y = Math.max(player.height / 2, Math.min(canvas.height - player.height / 2, player.y));
    if (player.invincibleTime > 0) player.invincibleTime--;
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function togglePause() {
    if (!gameStarted || !gameRunning) return;
    gamePaused = !gamePaused;
    document.getElementById('pauseScreen').style.display = gamePaused ? 'flex' : 'none';
}

function update() {
    if (!gameRunning || gamePaused) return;

    // Animate display score towards actual score
    if (displayScore < score) {
        const diff = score - displayScore;
        const increment = Math.max(1, Math.ceil(diff * 0.15)); // Fast catch-up
        displayScore = Math.min(score, displayScore + increment);
    }

    // Update debuff timers
    for (const key in debuffs) {
        if (debuffs[key] > 0) debuffs[key]--;
    }

    // Game timer + passive point generation (1 point per 0.5 seconds = 2 per second)
    // In story mode, only generate points after collecting first sprite and when no sprite orb is waiting
    const prevHalfSecond = Math.floor(gameTime * 2);
    gameTime += 1 / 60;
    const hasSpriteOrbPending = typeof spriteOrbs !== 'undefined' && spriteOrbs.length > 0;
    const canGeneratePoints = !storyMode || (typeof collectedSprites !== 'undefined' && collectedSprites.size > 0 && !hasSpriteOrbPending);
    if (Math.floor(gameTime * 2) > prevHalfSecond && canGeneratePoints) points++;

    // Wave timer (survival mode only)
    if (!storyMode) {
        waveTimer += 1 / 60;
        if (waveTimer >= WAVE_DURATION && !bossActive) {
            waveTimer = 0; wave++;
            SFX.waveStart();
            if (wave % BOSS_WAVE_INTERVAL === 0) spawnBoss();
        }
    }

    // Update player
    updatePlayer();

    // Spawning
    if (!storyMode) {
        // Survival mode: spawn everything normally
        if (Math.random() < 0.02 && orbs.length < 20) spawnOrb();
        if (Math.random() < 0.003 && skillOrbs.length < 2) spawnSkillOrb();
        const spawnRate = 0.02 + wave * 0.005;
        if (Math.random() < spawnRate && enemies.length < 25 + wave * 3 && !bossActive) spawnEnemy();
    } else if (collectedSprites && collectedSprites.size > 0 && spriteOrbs.length === 0 && !awaitingRewardCollection) {
        // Story mode: spawn orbs only when no sprite orb is waiting to be collected
        // and not during reward collection phase (after boss defeat)
        if (Math.random() < 0.02 && orbs.length < 15) spawnOrb();
        if (Math.random() < 0.002 && skillOrbs.length < 1) spawnStorySkillOrb();
    }

    // Update story mode sprite orbs
    if (storyMode && typeof updateSpriteOrbs === 'function') {
        updateSpriteOrbs();
    }

    // Update game objects
    updateOrbs();
    updateEnemies();
    updateProjectiles();
    updateSprites();
    updateSpriteProjectiles();
    updateHeroes();
    updateEffects();
    updateBoss();

    // Check game over
    if (player.hp <= 0) {
        gameRunning = false;
        SFX.playerDeath();
        if (!cheatMode) saveHighScore(score);
        document.getElementById('gameOver').style.display = 'flex';
        document.getElementById('finalScore').textContent = score;
        document.getElementById('finalWave').textContent = wave;
        document.getElementById('finalTime').textContent = formatTime(gameTime);
    }

    updateUI();
}

function gameLoop() {
    if (hasGamepad && typeof updateGamepad === 'function') updateGamepad();
    if (gameStarted) { update(); draw(); }
    // Update dialogue animation even when paused
    if (dialogueActive) { updateDialogue(); }
    // Check story wave completion
    if (storyMode && gameRunning) { checkStoryWaveComplete(); }
    requestAnimationFrame(gameLoop);
}

function startGame(cheat = false) {
    initAudio();
    loadSoundPreference();
    playSound('select');
    cheatMode = cheat;
    if (cheatMode) points = Infinity;
    usedSpriteTypes = new Set(); gotHit = false; heroSummoned = false; // Reset achievement tracking
    autopilot = false;
    document.getElementById('startScreen').style.display = 'none';
    gameStarted = true;
    gameRunning = true;
    for (let i = 0; i < 8; i++) spawnOrb();
    SFX.waveStart();
}

function restartGame() {
    // Clear rendering caches to free memory
    if (typeof clearSpriteGradientCache === 'function') clearSpriteGradientCache();

    // In story mode, restart the current chapter from the beginning
    if (storyMode) {
        const currentChapter = storyChapter;
        // Reset all story state
        document.getElementById('gameOver').style.display = 'none';
        document.getElementById('victory').style.display = 'none';
        document.getElementById('bossHealth').style.display = 'none';
        document.getElementById('dialogueBox').style.display = 'none';
        storyChapter = currentChapter;
        beginStoryChapter();
        return;
    }

    player.x = 500; player.y = 375; player.hp = player.maxHp; player.overHeal = 0; player.invincibleTime = 0; player.speedBoost = 0; player.speedBoostTimer = 0; player.facingX = 0; player.facingY = 1;
    enemies = []; projectiles = []; sprites = []; orbs = []; skillOrbs = []; effects = []; spriteProjectiles = []; heroes = []; heroBalls = [];
    currentSkill = null; updateSkillDisplay();
    score = 0; displayScore = 0; points = cheatMode ? Infinity : 0; wave = 1; waveTimer = 0; gameTime = 0; bossActive = false; boss = null;
    // Reset debuffs
    for (const key in debuffs) debuffs[key] = 0;
    usedSpriteTypes = new Set(); gotHit = false; heroSummoned = false; // Reset achievement tracking
    gameRunning = true;
    gamePaused = false;
    autopilot = false;
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('victory').style.display = 'none';
    document.getElementById('bossHealth').style.display = 'none';
    document.getElementById('pauseScreen').style.display = 'none';
    for (let i = 0; i < 8; i++) spawnOrb();
    updateUI();
    SFX.waveStart();
}

function goToMainMenu() {
    // Clear rendering caches to free memory
    if (typeof clearSpriteGradientCache === 'function') clearSpriteGradientCache();

    player.x = 500; player.y = 375; player.hp = player.maxHp; player.overHeal = 0; player.invincibleTime = 0; player.speedBoost = 0; player.speedBoostTimer = 0; player.facingX = 0; player.facingY = 1;
    enemies = []; projectiles = []; sprites = []; orbs = []; skillOrbs = []; effects = []; spriteProjectiles = []; heroes = []; heroBalls = [];
    currentSkill = null; updateSkillDisplay();
    score = 0; displayScore = 0; points = 0; wave = 1; waveTimer = 0; gameTime = 0; bossActive = false; boss = null;
    // Reset debuffs
    for (const key in debuffs) debuffs[key] = 0;
    // Reset story mode
    storyMode = false; storyChapter = 0; storyWave = 0; storyWaveSpawning = false;
    dialogueActive = false; dialogueQueue = []; dialogueIndex = 0; dialogueCharIndex = 0;
    if (typeof spriteOrbs !== 'undefined') spriteOrbs = [];
    if (typeof collectedSprites !== 'undefined') collectedSprites = new Set();
    if (typeof pendingWaveSpawn !== 'undefined') pendingWaveSpawn = false;
    if (typeof pendingBossSpawn !== 'undefined') pendingBossSpawn = false;
    if (typeof pendingVictory !== 'undefined') pendingVictory = false;
    if (typeof pendingRewardSprite !== 'undefined') pendingRewardSprite = false;
    gameStarted = false;
    gameRunning = false;
    gamePaused = false;
    cheatMode = false;
    autopilot = false;
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('victory').style.display = 'none';
    document.getElementById('bossHealth').style.display = 'none';
    document.getElementById('pauseScreen').style.display = 'none';
    document.getElementById('dialogueBox').style.display = 'none';
    document.getElementById('storyModeScreen').style.display = 'none';
    document.getElementById('nameInputModal').style.display = 'none';
    document.getElementById('startScreen').style.display = 'flex';
    updateUI();
    updateHighScoreDisplay();
}

// Event Listeners
const altSummonKeys = { 'z': 0, 'x': 1, 'c': 2, 'v': 3, 'b': 4, 'n': 5, 'm': 6, ',': 7, '.': 8, '/': 9 };
document.addEventListener('keydown', e => {
    if (typeof setInputControlMode === 'function') setInputControlMode('kb');
    keys[e.key] = true;
    if (e.key === 'Escape' && !dialogueActive) { togglePause(); return; }
    // Handle dialogue advancement with SPACE
    if ((e.key === ' ' || e.code === 'Space') && dialogueActive) {
        e.preventDefault();
        advanceDialogue();
        return;
    }
    if (!gameStarted || !gameRunning || gamePaused) return;
    if (e.key === 'Tab') { e.preventDefault(); autopilot = !autopilot; return; }
    if (e.key >= '1' && e.key <= '9') { const index = parseInt(e.key) - 1; if (index < spriteTypes.length) summonSprite(index); }
    else if (e.key === '0') { if (spriteTypes.length >= 10) summonSprite(9); }
    else if (altSummonKeys.hasOwnProperty(e.key.toLowerCase())) {
        const index = altSummonKeys[e.key.toLowerCase()];
        if (index < spriteTypes.length) summonSprite(index);
    }
    if (e.key === ' ' || e.code === 'Space') { e.preventDefault(); useSkill(); }
});
document.addEventListener('keyup', e => { keys[e.key] = false; });

// Splash Screen Logic
let splashActive = true;
let splashInterval = null;

// Create named functions for event listeners so they can be removed
function handleSplashClick() {
    dismissSplash();
}

function handleSplashKeydown() {
    dismissSplash();
}

function dismissSplash() {
    if (!splashActive) return;
    splashActive = false;
    
    // Stop the language cycle
    if (splashInterval) clearInterval(splashInterval);
    
    // Remove event listeners to prevent unnecessary function calls
    document.removeEventListener('click', handleSplashClick);
    document.removeEventListener('keydown', handleSplashKeydown);
    
    // Attempt audio init
    if (typeof initAudio === 'function') initAudio();
    if (typeof playSound === 'function') playSound('select'); // Feedback
    
    const splash = document.getElementById('splashScreen');
    if (splash) splash.style.display = 'none';
}

// Global listener for splash dismissal (click or key)
document.addEventListener('click', handleSplashClick);
document.addEventListener('keydown', handleSplashKeydown);

function startSplashCycle() {
    // Available languages
    const langs = ['en', 'ja', 'ko', 'zh-TW', 'zh-CN', 'es', 'pt', 'ru', 'fr', 'vi'];
    let langIndex = 0;
    
    // Helper to safe update
    const updateSplashText = (lang) => {
        if (typeof translations === 'undefined' || !translations[lang]) return;
        
        const titleEl = document.querySelector('#splashScreen h1');
        const descEl = document.querySelector('#splashScreen .blink'); // Use class to be specific
        const supportEl = document.querySelector('#splashScreen .input-support');
        
        if (titleEl) titleEl.textContent = translations[lang]['title'] || "SPRITE SURVIVOR";
        if (descEl) descEl.textContent = translations[lang]['clickToStart'] || "CLICK TO START";
        if (supportEl) supportEl.textContent = translations[lang]['inputSupport'] || "KEYBOARD / GAMEPAD SUPPORTED";
        
        // Update font style for CJK/Vietnamese if needed
        const splash = document.getElementById('splashScreen');
        if (splash) {
             splash.className = ''; // Reset class
             if (lang === 'vi') splash.classList.add('lang-vi');
             if (['ja', 'ko', 'zh-TW', 'zh-CN'].includes(lang)) splash.classList.add('lang-cjk');
        }
    };

    splashInterval = setInterval(() => {
        // Check if splash is still active before updating
        if (!splashActive) {
            if (splashInterval) clearInterval(splashInterval);
            return;
        }
        
        try {
            langIndex = (langIndex + 1) % langs.length;
            updateSplashText(langs[langIndex]);
        } catch (error) {
            // Silently handle errors to prevent breaking the interval
            console.error('Error updating splash text:', error);
        }
    }, 1000); // Switch every 1 second (matches blink)
}

// Initialize - translations are now inline, no async loading needed
(function init() {
    // Apply saved language or detect from URL/localStorage
    const urlLang = getURLLanguage();
    const savedLang = localStorage.getItem('spriteSurvivorLang');
    const initialLang = urlLang || savedLang || 'en';
    setLanguage(initialLang, false);

    initSpriteButtons();
    updateUI();
    updateHighScoreDisplay();
    
    // Ensure splash is visible
    const splash = document.getElementById('splashScreen');
    if (splash) {
        splash.style.display = 'flex';
        startSplashCycle();
    }
    
    gameLoop();
})();
