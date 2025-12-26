// Main Game Loop and Initialization

function spawnOrb() {
    const margin = 50;
    orbs.push({
        x: margin + Math.random() * (canvas.width - margin * 2),
        y: margin + Math.random() * (canvas.height - margin * 2),
        size: 10, pulse: Math.random() * Math.PI * 2
    });
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
        if (dist < player.width/2 + orb.size) {
            orbs.splice(i, 1); points++; score += 10;
            for (let j = 0; j < 5; j++) effects.push({ x: orb.x, y: orb.y, vx: (Math.random() - 0.5) * 3, vy: (Math.random() - 0.5) * 3, life: 20, color: '#fff', type: 'particle' });
        }
    }

    for (let i = skillOrbs.length - 1; i >= 0; i--) {
        const orb = skillOrbs[i];
        const dx = player.x - orb.x, dy = player.y - orb.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < player.width/2 + orb.size) {
            skillOrbs.splice(i, 1);
            currentSkill = orb.skill;
            updateSkillDisplay();
            for (let j = 0; j < 10; j++) effects.push({ x: orb.x, y: orb.y, vx: (Math.random() - 0.5) * 5, vy: (Math.random() - 0.5) * 5, life: 30, color: orb.skill.color, type: 'particle' });
        }
    }
}

function updatePlayer() {
    let dx = 0, dy = 0;
    if (keys['w'] || keys['W'] || keys['ArrowUp']) dy -= 1;
    if (keys['s'] || keys['S'] || keys['ArrowDown']) dy += 1;
    if (keys['a'] || keys['A'] || keys['ArrowLeft']) dx -= 1;
    if (keys['d'] || keys['D'] || keys['ArrowRight']) dx += 1;
    if (dx !== 0 || dy !== 0) {
        const len = Math.sqrt(dx * dx + dy * dy);
        dx /= len; dy /= len;
        player.x += dx * player.speed; player.y += dy * player.speed;
    }
    player.x = Math.max(player.width/2, Math.min(canvas.width - player.width/2, player.x));
    player.y = Math.max(player.height/2, Math.min(canvas.height - player.height/2, player.y));
    if (player.invincibleTime > 0) player.invincibleTime--;
}

function update() {
    if (!gameRunning) return;

    // Wave timer
    waveTimer += 1/60;
    if (waveTimer >= WAVE_DURATION && !bossActive) {
        waveTimer = 0; wave++;
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
        document.getElementById('gameOver').style.display = 'flex';
        document.getElementById('finalScore').textContent = score;
        document.getElementById('finalWave').textContent = wave;
    }

    updateUI();
}

function gameLoop() {
    if (gameStarted) { update(); draw(); }
    requestAnimationFrame(gameLoop);
}

function startGame() {
    document.getElementById('startScreen').style.display = 'none';
    gameStarted = true;
    gameRunning = true;
    for (let i = 0; i < 8; i++) spawnOrb();
}

function restartGame() {
    player.x = 500; player.y = 375; player.hp = player.maxHp; player.invincibleTime = 0;
    enemies = []; projectiles = []; sprites = []; orbs = []; skillOrbs = []; effects = []; spriteProjectiles = [];
    currentSkill = null; updateSkillDisplay();
    score = 0; points = 0; wave = 1; waveTimer = 0; bossActive = false; boss = null;
    gameRunning = true;
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('victory').style.display = 'none';
    document.getElementById('bossHealth').style.display = 'none';
    for (let i = 0; i < 8; i++) spawnOrb();
    updateUI();
}

// Event Listeners
document.addEventListener('keydown', e => {
    keys[e.key] = true;
    if (!gameStarted || !gameRunning) return;
    if (e.key >= '1' && e.key <= '9') { const index = parseInt(e.key) - 1; if (index < spriteTypes.length) summonSprite(index); }
    else if (e.key === '0') { if (spriteTypes.length >= 10) summonSprite(9); }
    if (e.key === ' ' || e.code === 'Space') { e.preventDefault(); useSkill(); }
});
document.addEventListener('keyup', e => { keys[e.key] = false; });

// Initialize
initSpriteButtons();
updateUI();
gameLoop();
