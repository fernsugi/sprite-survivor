// Enemy and Boss System

// Helper to damage player (overHeal absorbs damage first)
function damagePlayer(amount) {
    if (player.overHeal > 0) {
        if (amount <= player.overHeal) {
            player.overHeal -= amount;
            return;
        } else {
            amount -= player.overHeal;
            player.overHeal = 0;
        }
    }
    player.hp -= amount;
}

function spawnEnemy() {
    if (bossActive) return;
    const availableTypes = enemyTypes.slice(0, Math.min(wave + 1, enemyTypes.length));
    const typeData = availableTypes[Math.floor(Math.random() * availableTypes.length)];
    let x, y;
    const side = Math.floor(Math.random() * 4);
    switch (side) {
        case 0: x = -20; y = Math.random() * canvas.height; break;
        case 1: x = canvas.width + 20; y = Math.random() * canvas.height; break;
        case 2: x = Math.random() * canvas.width; y = -20; break;
        case 3: x = Math.random() * canvas.width; y = canvas.height + 20; break;
    }
    const waveMultiplier = 1 + (wave - 1) * 0.15;
    enemies.push({
        x, y, ...typeData,
        hp: typeData.hp * waveMultiplier, maxHp: typeData.hp * waveMultiplier,
        damage: typeData.damage * waveMultiplier, currentShootCooldown: 0, slowed: 0
    });
}

function spawnBoss() {
    bossActive = true;
    const bossNum = Math.floor(wave / BOSS_WAVE_INTERVAL);
    const bossMultiplier = 1 + bossNum * 0.5;
    const bossNames = ['boss1', 'boss2', 'boss3', 'boss4'];
    boss = {
        x: canvas.width / 2, y: -50, targetY: 120,
        size: 50 + bossNum * 5, hp: 1200 * bossMultiplier, maxHp: 1200 * bossMultiplier,
        damage: 55 * bossMultiplier, phase: 0, attackTimer: 0, attackPattern: 0,
        moveTimer: 0, targetX: canvas.width / 2,
        nameKey: bossNames[Math.min(bossNum - 1, 3)] || 'boss1',
        color: ['#f44', '#a4f', '#444', '#f84'][Math.min(bossNum - 1, 3)] || '#fff',
        bossNum: bossNum,
        // Boss-specific mechanics
        rageMode: false,              // Boss 1: Demon Lord
        teleportTimer: 0,             // Boss 2: Shadow King
        cloneSpawned: false,          // Boss 2: Shadow King
        gravityTimer: 0,              // Boss 3: Void Emperor
        shield: 0,                    // Boss 3: Void Emperor
        shieldTimer: 0,               // Boss 3: Void Emperor
        enrageTimer: 0,               // Boss 4: Death Titan
        enraged: false                // Boss 4: Death Titan
    };
    document.getElementById('bossHealth').style.display = 'block';
    document.getElementById('bossName').textContent = t(boss.nameKey);
    SFX.bossSpawn();
}

function updateBossMechanics() {
    if (!boss) return;

    // ===== BOSS 1: Demon Lord - Rage Mode =====
    if (boss.bossNum === 1) {
        if (!boss.rageMode && boss.hp < boss.maxHp * 0.5) {
            boss.rageMode = true;
            // Visual feedback: flash effect
            effects.push({ x: boss.x, y: boss.y, life: 30, type: 'screenFlash', color: '#f44' });
            for (let i = 0; i < 20; i++) {
                effects.push({ x: boss.x, y: boss.y, vx: (Math.random() - 0.5) * 8, vy: (Math.random() - 0.5) * 8, life: 40, color: '#f80', type: 'particle' });
            }
        }
    }

    // ===== BOSS 2: Shadow King - Teleport =====
    if (boss.bossNum === 2) {
        boss.teleportTimer++;
        if (boss.teleportTimer >= 300) { // Every 5 seconds
            boss.teleportTimer = 0;
            // Teleport to random position
            const oldX = boss.x, oldY = boss.y;
            boss.x = 100 + Math.random() * (canvas.width - 200);
            boss.y = 80 + Math.random() * 100;
            boss.targetX = boss.x;
            // Teleport effects at old and new positions
            for (let i = 0; i < 15; i++) {
                effects.push({ x: oldX, y: oldY, vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6, life: 25, color: '#a4f', type: 'particle' });
                effects.push({ x: boss.x, y: boss.y, vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6, life: 25, color: '#a4f', type: 'particle' });
            }
        }
        // Clone at 50% HP
        if (!boss.cloneSpawned && boss.hp < boss.maxHp * 0.5) {
            boss.cloneSpawned = true;
            // Spawn a decoy enemy that looks like the boss but is weaker
            enemies.push({
                x: boss.x + (Math.random() - 0.5) * 100,
                y: boss.y + (Math.random() - 0.5) * 50,
                name: 'Clone', color: '#a4f8', speed: 0.5,
                hp: boss.maxHp * 0.2, maxHp: boss.maxHp * 0.2,
                damage: 5, type: 'melee', size: boss.size - 10,
                isClone: true
            });
            effects.push({ x: boss.x, y: boss.y, life: 20, type: 'screenFlash', color: '#a4f' });
        }
    }

    // ===== BOSS 3: Void Emperor - Gravity Well + Shield =====
    if (boss.bossNum === 3) {
        boss.gravityTimer++;
        if (boss.gravityTimer >= 480) { // Every 8 seconds
            boss.gravityTimer = 0;
            // Create gravity pull effect for 3 seconds
            effects.push({ x: boss.x, y: boss.y, life: 180, type: 'gravity', radius: 200 });
        }
        // Apply gravity pull if effect exists
        effects.forEach(effect => {
            if (effect.type === 'gravity' && effect.life > 0) {
                const dx = boss.x - player.x, dy = boss.y - player.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 200 && dist > 50) {
                    player.x += (dx / dist) * 0.8;
                    player.y += (dy / dist) * 0.8;
                }
            }
        });
        // Shield regeneration
        boss.shieldTimer++;
        if (boss.shieldTimer >= 1200 && boss.shield <= 0) { // Every 20 seconds
            boss.shieldTimer = 0;
            boss.shield = 100;
            effects.push({ x: boss.x, y: boss.y, life: 30, type: 'screenFlash', color: '#444' });
        }
    }

    // ===== BOSS 4: Death Titan - Death Aura + Enrage =====
    if (boss.bossNum === 4) {
        // Death Aura: damage player if too close
        const dx = player.x - boss.x, dy = player.y - boss.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150 && player.invincibleTime <= 0) {
            // 1 damage per second (every 60 frames)
            if (Math.random() < 1/60) {
                damagePlayer(1); gotHit = true;
                effects.push({ x: player.x, y: player.y, life: 10, type: 'hit', color: '#f84' });
            }
        }
        // Enrage after 60 seconds
        boss.enrageTimer++;
        if (!boss.enraged && boss.enrageTimer >= 3600) { // 60 seconds
            boss.enraged = true;
            effects.push({ x: boss.x, y: boss.y, life: 40, type: 'screenFlash', color: '#f84' });
            for (let i = 0; i < 30; i++) {
                effects.push({ x: boss.x, y: boss.y, vx: (Math.random() - 0.5) * 10, vy: (Math.random() - 0.5) * 10, life: 50, color: '#f84', type: 'particle' });
            }
        }
    }
}

function bossAttack() {
    if (!boss) return;

    // Boss-specific mechanics
    updateBossMechanics();

    // Calculate attack speed (affected by rage/enrage)
    let attackSpeed = 60;
    if (boss.bossNum === 1 && boss.rageMode) attackSpeed = 45; // 25% faster
    if (boss.bossNum === 4 && boss.enraged) attackSpeed = 30;  // 50% faster

    boss.attackTimer++;
    if (boss.attackTimer >= attackSpeed) {
        boss.attackTimer = 0;
        boss.attackPattern = (boss.attackPattern + 1) % 5;
        SFX.bossAttack();
        switch (boss.attackPattern) {
            case 0:
                for (let i = 0; i < 12; i++) {
                    const angle = (Math.PI * 2 / 12) * i;
                    projectiles.push({ x: boss.x, y: boss.y, vx: Math.cos(angle) * 4, vy: Math.sin(angle) * 4, damage: boss.damage * 0.5, size: 10, color: boss.color, fromBoss: true });
                }
                break;
            case 1:
                for (let i = -2; i <= 2; i++) {
                    const dx = player.x - boss.x, dy = player.y - boss.y;
                    const baseAngle = Math.atan2(dy, dx), angle = baseAngle + i * 0.2;
                    projectiles.push({ x: boss.x, y: boss.y, vx: Math.cos(angle) * 5, vy: Math.sin(angle) * 5, damage: boss.damage * 0.4, size: 8, color: '#ff0', fromBoss: true });
                }
                break;
            case 2:
                const minionCount = 1 + boss.bossNum * 2; // Boss 1: 3, Boss 2: 5, Boss 3: 7, Boss 4: 9
                // Different minion types per boss
                const minionTypes = [0, 3, 2, 4]; // Chaser, Speedy, Tank, Bomber
                const minionType = enemyTypes[minionTypes[boss.bossNum - 1] || 0];
                for (let i = 0; i < minionCount; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    enemies.push({ x: boss.x + Math.cos(angle) * 30, y: boss.y + Math.sin(angle) * 30, ...minionType, hp: minionType.hp * 0.5, maxHp: minionType.hp * 0.5, slowed: 0 });
                }
                break;
            case 3:
                // Save boss position and aim direction when warning appears
                const laserX = boss.x, laserY = boss.y;
                const laserDx = player.x - laserX, laserDy = player.y - laserY;
                const laserDist = Math.sqrt(laserDx * laserDx + laserDy * laserDy);
                const laserVx = laserDx / laserDist, laserVy = laserDy / laserDist;
                effects.push({ x: laserX, y: laserY, targetX: player.x, targetY: player.y, life: 30, type: 'laser_warning', color: '#f008' });
                setTimeout(() => {
                    if (!boss) return;
                    for (let i = 0; i < 20; i++) {
                        projectiles.push({ x: laserX + laserVx * i * 30, y: laserY + laserVy * i * 30, vx: laserVx * 8, vy: laserVy * 8, damage: boss.damage * 0.3, size: 12, color: '#f44', fromBoss: true, life: 20 });
                    }
                }, 500);
                break;
            case 4:
                for (let i = 0; i < 8; i++) {
                    setTimeout(() => {
                        if (!boss) return;
                        const angle = boss.phase + i * 0.5;
                        projectiles.push({ x: boss.x, y: boss.y, vx: Math.cos(angle) * 3, vy: Math.sin(angle) * 3, damage: boss.damage * 0.3, size: 8, color: '#f0f', fromBoss: true });
                    }, i * 100);
                }
                break;
        }
    }
    boss.moveTimer++;
    if (boss.moveTimer >= 120) { boss.moveTimer = 0; boss.targetX = 100 + Math.random() * (canvas.width - 200); }
    boss.x += (boss.targetX - boss.x) * 0.02;
    if (boss.y < boss.targetY) boss.y += 2;
    boss.phase += 0.05;
}

function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        if (enemy.slowed > 0) enemy.slowed--;
        const speedMult = enemy.slowed > 0 ? 0.5 : 1;
        const dx = player.x - enemy.x, dy = player.y - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (enemy.type === 'ranged' || enemy.type === 'sniper' || enemy.type === 'hexer') {
            const preferredDist = enemy.type === 'sniper' ? 200 : (enemy.type === 'hexer' ? 150 : 120);
            if (dist > preferredDist) { enemy.x += (dx / dist) * enemy.speed * speedMult; enemy.y += (dy / dist) * enemy.speed * speedMult; }
            else if (dist < preferredDist - 30) { enemy.x -= (dx / dist) * enemy.speed * speedMult * 0.5; enemy.y -= (dy / dist) * enemy.speed * speedMult * 0.5; }
            if (enemy.currentShootCooldown <= 0) {
                enemy.currentShootCooldown = enemy.shootCooldown;
                const speed = enemy.type === 'sniper' ? 6 : (enemy.type === 'hexer' ? 3.5 : 4);
                projectiles.push({ x: enemy.x, y: enemy.y, vx: (dx / dist) * speed, vy: (dy / dist) * speed, damage: enemy.damage, size: 6, color: enemy.color, appliesDebuff: enemy.appliesDebuff });
            }
            enemy.currentShootCooldown--;
        } else { enemy.x += (dx / dist) * enemy.speed * speedMult; enemy.y += (dy / dist) * enemy.speed * speedMult; }

        if (dist < player.width/2 + enemy.size/2 && player.invincibleTime <= 0) {
            SFX.playerHit();
            if (enemy.type === 'explode') {
                damagePlayer(enemy.damage); player.invincibleTime = 60; gotHit = true;
                for (let j = 0; j < 20; j++) effects.push({ x: enemy.x, y: enemy.y, vx: (Math.random() - 0.5) * 8, vy: (Math.random() - 0.5) * 8, life: 30, color: '#ff0', type: 'particle' });
                enemies.splice(i, 1);
            } else { damagePlayer(enemy.damage); player.invincibleTime = 30; gotHit = true; player.x += (dx / dist) * -20; player.y += (dy / dist) * -20; }
            effects.push({ x: player.x, y: player.y, life: 10, type: 'hit' });
        }
        if (enemy.hp <= 0) {
            enemies.splice(i, 1); score += 20;
            SFX.enemyDeath();
            for (let j = 0; j < 8; j++) effects.push({ x: enemy.x, y: enemy.y, vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4, life: 25, color: enemy.color, type: 'particle' });
        }
    }
}

function updateProjectiles() {
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const proj = projectiles[i];
        proj.x += proj.vx; proj.y += proj.vy;
        if (proj.life !== undefined) { proj.life--; if (proj.life <= 0) { projectiles.splice(i, 1); continue; } }
        if (proj.x < -50 || proj.x > canvas.width + 50 || proj.y < -50 || proj.y > canvas.height + 50) { projectiles.splice(i, 1); continue; }

        // Check for Knight blocking or Berserker reflecting
        let blocked = false;
        for (const sprite of sprites) {
            const sdx = sprite.x - proj.x, sdy = sprite.y - proj.y;
            const sdist = Math.sqrt(sdx * sdx + sdy * sdy);
            const blockRadius = sprite.size + 10;

            if (sdist < blockRadius && debuffs.noBlock <= 0) {
                if (sprite.blocksProjectiles) {
                    // Knight blocks: destroy projectile
                    projectiles.splice(i, 1);
                    effects.push({ x: proj.x, y: proj.y, life: 15, type: 'hit', color: '#f55' });
                    for (let j = 0; j < 5; j++) effects.push({ x: proj.x, y: proj.y, vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4, life: 15, color: '#f55', type: 'particle' });
                    blocked = true;
                    break;
                } else if (sprite.reflectsProjectiles) {
                    // Berserker reflects: reverse direction and make it damage enemies
                    proj.vx *= -1.5;
                    proj.vy *= -1.5;
                    proj.reflected = true;
                    proj.color = '#f80';
                    effects.push({ x: proj.x, y: proj.y, life: 10, type: 'hit', color: '#f80' });
                    break;
                }
            }
        }
        if (blocked) continue;

        // Reflected projectiles damage enemies instead of player
        if (proj.reflected) {
            const targets = [...enemies]; if (boss) targets.push(boss);
            for (let j = targets.length - 1; j >= 0; j--) {
                const enemy = targets[j];
                const edx = enemy.x - proj.x, edy = enemy.y - proj.y;
                const edist = Math.sqrt(edx * edx + edy * edy);
                if (edist < (enemy.size || 14)/2 + proj.size) {
                    enemy.hp -= proj.damage;
                    effects.push({ x: proj.x, y: proj.y, life: 10, type: 'hit', color: '#f80' });
                    projectiles.splice(i, 1);
                    blocked = true;
                    break;
                }
            }
            if (blocked) continue;
        }

        const dx = player.x - proj.x, dy = player.y - proj.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < player.width/2 + proj.size && player.invincibleTime <= 0 && !proj.reflected) {
            SFX.playerHit();
            damagePlayer(proj.damage); player.invincibleTime = 30; gotHit = true; projectiles.splice(i, 1);
            effects.push({ x: player.x, y: player.y, life: 10, type: 'hit' });
            // Boss projectiles heal boss for 100% of damage dealt
            if (proj.fromBoss && boss) {
                boss.hp = Math.min(boss.maxHp, boss.hp + proj.damage);
            }
            // Apply random debuff from boss or hexer projectiles
            if (proj.fromBoss || proj.appliesDebuff) {
                // Hexer only applies 2 debuffs; slow and weakened are boss-exclusive
                const debuffTypes = proj.fromBoss
                    ? ['noHeal', 'noBlock', 'slow', 'weakened']
                    : ['noHeal', 'noBlock'];
                const randomDebuff = debuffTypes[Math.floor(Math.random() * debuffTypes.length)];
                debuffs[randomDebuff] = DEBUFF_DURATION;
            }
        }
    }
}

function updateBoss() {
    if (boss) {
        bossAttack();
        if (boss.hp <= 0) {
            score += 1000;
            SFX.bossDeath();
            for (let i = 0; i < 50; i++) effects.push({ x: boss.x, y: boss.y, vx: (Math.random() - 0.5) * 10, vy: (Math.random() - 0.5) * 10, life: 60, color: boss.color, type: 'particle' });
            if (wave >= 20) {
                gameRunning = false; SFX.victory();
                if (!cheatMode) saveHighScore(score);
                const newAchievements = checkAchievements();
                displayVictoryAchievements(newAchievements);
                document.getElementById('victory').style.display = 'flex';
                document.getElementById('victoryScore').textContent = score;
                document.getElementById('victoryTime').textContent = formatTime(gameTime);
            }
            else { boss = null; bossActive = false; wave++; waveTimer = 0; document.getElementById('bossHealth').style.display = 'none'; }
        }
    }
}
