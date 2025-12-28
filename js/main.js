// Main Game Loop and Initialization

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
    player.hp = Math.min(player.maxHp, player.hp + ORB_HEAL_AMOUNT);
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

        // Use skill when available and enemies nearby
        if (currentSkill && enemies.length > 0) {
            const nearestEnemy = enemies.reduce((nearest, e) => {
                const d = Math.sqrt((e.x - player.x) ** 2 + (e.y - player.y) ** 2);
                return d < nearest.dist ? { enemy: e, dist: d } : nearest;
            }, { enemy: null, dist: Infinity });
            if (nearestEnemy.dist < 150 || currentSkill.name === 'skillMagnet') {
                useSkill();
            }
        }
    } else {
        // Manual control
        if (keys['w'] || keys['W'] || keys['ArrowUp']) dy -= 1;
        if (keys['s'] || keys['S'] || keys['ArrowDown']) dy += 1;
        if (keys['a'] || keys['A'] || keys['ArrowLeft']) dx -= 1;
        if (keys['d'] || keys['D'] || keys['ArrowRight']) dx += 1;
    }

    if (dx !== 0 || dy !== 0) {
        const len = Math.sqrt(dx * dx + dy * dy);
        dx /= len; dy /= len;
        player.facingX = dx;
        player.facingY = dy;
        const currentSpeed = player.speed + player.speedBoost;
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

    // Game timer + passive point generation (1 point per second)
    const prevSecond = Math.floor(gameTime);
    gameTime += 1 / 60;
    if (Math.floor(gameTime) > prevSecond) points++;

    // Wave timer
    waveTimer += 1 / 60;
    if (waveTimer >= WAVE_DURATION && !bossActive) {
        waveTimer = 0; wave++;
        SFX.waveStart();
        if (wave % BOSS_WAVE_INTERVAL === 0) spawnBoss();
    }

    // Update player
    updatePlayer();

    // Spawning
    if (Math.random() < 0.02 && orbs.length < 20) spawnOrb();
    if (Math.random() < 0.003 && skillOrbs.length < 2) spawnSkillOrb();
    const spawnRate = 0.02 + wave * 0.005;
    if (Math.random() < spawnRate && enemies.length < 25 + wave * 3 && !bossActive) spawnEnemy();

    // Update game objects
    updateOrbs();
    updateEnemies();
    updateProjectiles();
    updateSprites();
    updateSpriteProjectiles();
    updateEffects();
    updateBoss();

    // Check game over
    if (player.hp <= 0) {
        gameRunning = false;
        SFX.playerDeath();
        document.getElementById('gameOver').style.display = 'flex';
        document.getElementById('finalScore').textContent = score;
        document.getElementById('finalWave').textContent = wave;
        document.getElementById('finalTime').textContent = formatTime(gameTime);
    }

    updateUI();
}

function gameLoop() {
    if (gameStarted) { update(); draw(); }
    requestAnimationFrame(gameLoop);
}

function startGame(cheat = false) {
    initAudio();
    loadSoundPreference();
    cheatMode = cheat;
    if (cheatMode) points = Infinity;
    usedSpriteTypes = new Set(); gotHit = false; // Reset achievement tracking
    document.getElementById('startScreen').style.display = 'none';
    gameStarted = true;
    gameRunning = true;
    for (let i = 0; i < 8; i++) spawnOrb();
    SFX.waveStart();
}

function restartGame() {
    player.x = 500; player.y = 375; player.hp = player.maxHp; player.invincibleTime = 0; player.speedBoost = 0; player.speedBoostTimer = 0; player.facingX = 0; player.facingY = 1;
    enemies = []; projectiles = []; sprites = []; orbs = []; skillOrbs = []; effects = []; spriteProjectiles = [];
    currentSkill = null; updateSkillDisplay();
    score = 0; points = cheatMode ? Infinity : 0; wave = 1; waveTimer = 0; gameTime = 0; bossActive = false; boss = null;
    usedSpriteTypes = new Set(); gotHit = false; // Reset achievement tracking
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
    player.x = 500; player.y = 375; player.hp = player.maxHp; player.invincibleTime = 0; player.speedBoost = 0; player.speedBoostTimer = 0; player.facingX = 0; player.facingY = 1;
    enemies = []; projectiles = []; sprites = []; orbs = []; skillOrbs = []; effects = []; spriteProjectiles = [];
    currentSkill = null; updateSkillDisplay();
    score = 0; points = 0; wave = 1; waveTimer = 0; gameTime = 0; bossActive = false; boss = null;
    gameStarted = false;
    gameRunning = false;
    gamePaused = false;
    cheatMode = false;
    autopilot = false;
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('victory').style.display = 'none';
    document.getElementById('bossHealth').style.display = 'none';
    document.getElementById('pauseScreen').style.display = 'none';
    document.getElementById('startScreen').style.display = 'flex';
    updateUI();
}

// Event Listeners
const altSummonKeys = { 'z': 0, 'x': 1, 'c': 2, 'v': 3, 'b': 4, 'n': 5, 'm': 6, ',': 7, '.': 8, '/': 9 };
document.addEventListener('keydown', e => {
    keys[e.key] = true;
    if (e.key === 'Escape') { togglePause(); return; }
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

// Initialize
initSpriteButtons();
updateUI();
gameLoop();
