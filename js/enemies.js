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
        enraged: false,               // Boss 4: Death Titan
        slowed: 0                     // Frost slow effect
    };
    document.getElementById('bossHealth').style.display = 'block';
    document.getElementById('bossName').textContent = t(boss.nameKey);
    SFX.bossSpawn();
}

// Refresh boss name on language change
function refreshBossName() {
    if (!boss) return;
    // Story mode uses hardcoded names, survival mode uses translation keys
    if (storyMode && boss.name) {
        document.getElementById('bossName').textContent = boss.name;
    } else if (boss.nameKey) {
        document.getElementById('bossName').textContent = t(boss.nameKey);
    }
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

// Remnant boss constants
const REMNANT = {
    MOVE_INTERVAL: 120,      // 2 seconds between position changes
    ATTACK_COOLDOWN: 90,     // 1.5 seconds between attacks
    PULSE_INTERVAL: 120,     // 2 seconds between Troy's pulses
    BALL_LIFE_LONG: 480,     // 8 seconds
    BALL_LIFE_MED: 360,      // 6 seconds
    BALL_LIFE_SHORT: 300,    // 5 seconds
    DMG_CHARGE: 0.6,         // Rex charge damage multiplier
    DMG_CONE: 0.4,           // Rex cone slash damage multiplier
    DMG_POUND: 0.5,          // Rex ground pound damage multiplier
    DMG_BALL: 0.8,           // Beth ball burst damage multiplier
    DMG_BALL_RAPID: 0.7,     // Beth rapid fire damage multiplier
    DMG_FEATHER: 0.3,        // Milia feather damage multiplier
    DMG_BEAM_SWEEP: 0.2,     // Troy sweep beam damage multiplier
    DMG_BEAM_LOCK: 0.3,      // Troy lock-on damage multiplier
    DMG_BEAM_MULTI: 0.25,    // Troy multi-beam damage multiplier
    PULSE_DAMAGE: 3          // Troy pulse chip damage
};

// Helper: create boss projectile
function createBossProjectile(x, y, angle, speed, damage, opts = {}) {
    return {
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        damage,
        size: opts.size || 10,
        color: opts.color || '#f0f',
        fromBoss: true,
        life: opts.life
    };
}

// Helper: create boss bouncing ball
function createBossBall(x, y, angle, speed, damage, opts = {}) {
    return {
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: opts.size || 10,
        damage,
        bounces: opts.bounces || 5,
        life: opts.life || REMNANT.BALL_LIFE_LONG,
        color: opts.color || '#0ff',
        fromBoss: true
    };
}

// Story mode Remnant boss attacks - unique patterns per chapter
function remnantBossAttack() {
    if (!boss) return;

    // Handle slow effect
    if (boss.slowed > 0) boss.slowed--;
    const bossSpeedMult = boss.slowed > 0 ? 0.5 : 1;

    boss.attackTimer++;
    boss.moveTimer++;
    if (boss.moveTimer >= REMNANT.MOVE_INTERVAL) {
        boss.moveTimer = 0;
        boss.targetX = 100 + Math.random() * (canvas.width - 200);
    }
    boss.x += (boss.targetX - boss.x) * 0.02 * bossSpeedMult;
    if (boss.y < boss.targetY) boss.y += 2 * bossSpeedMult;
    boss.phase += 0.05;

    // Chapter-specific attack patterns
    const chapter = boss.remnantType || 1;

    if (boss.attackTimer < REMNANT.ATTACK_COOLDOWN) return;

    boss.attackTimer = 0;
    boss.attackPattern = (boss.attackPattern + 1) % 3;

    switch (chapter) {
        case 1: // Rex's Remnant - Warrior style (melee focused)
            SFX.heroWarrior && SFX.heroWarrior();
            switch (boss.attackPattern) {
                case 0: // Charge - rushes at player (fast and far, reduced when slowed)
                    const chargeAngle = Math.atan2(player.y - boss.y, player.x - boss.x);
                    const chargeSpeed = 25 * bossSpeedMult;
                    for (let i = 0; i < 12; i++) {
                        setTimeout(() => {
                            if (!boss) return;
                            boss.x += Math.cos(chargeAngle) * chargeSpeed;
                            boss.y += Math.sin(chargeAngle) * chargeSpeed;
                            effects.push({ x: boss.x, y: boss.y, life: 10, type: 'particle', color: '#f80', vx: -Math.cos(chargeAngle) * 5, vy: -Math.sin(chargeAngle) * 5 });
                            if (player.invincibleTime <= 0) {
                                const dist = Math.hypot(player.x - boss.x, player.y - boss.y);
                                if (dist < boss.size + 15) {
                                    damagePlayer(boss.damage * REMNANT.DMG_CHARGE);
                                    player.invincibleTime = 60;
                                    gotHit = true;
                                }
                            }
                        }, i * 25);
                    }
                    break;
                case 1: // Cone Slash - 240° melee swing (extended range)
                    const slashAngle = Math.atan2(player.y - boss.y, player.x - boss.x);
                    for (let i = -4; i <= 4; i++) {
                        const angle = slashAngle + i * 0.26;
                        projectiles.push(createBossProjectile(boss.x, boss.y, angle, 6, boss.damage * REMNANT.DMG_CONE, { size: 15, color: '#f80', life: 35 }));
                    }
                    effects.push({ x: boss.x, y: boss.y, life: 15, type: 'slash', angle: slashAngle, color: '#f80' });
                    break;
                case 2: // Ground Pound - shockwave
                    effects.push({ x: boss.x, y: boss.y, life: 30, type: 'aoe', radius: 0, maxRadius: 150, color: '#f80' });
                    setTimeout(() => {
                        if (!boss) return;
                        const dx = player.x - boss.x, dy = player.y - boss.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < 150 && player.invincibleTime <= 0) {
                            damagePlayer(boss.damage * REMNANT.DMG_POUND);
                            player.invincibleTime = 30;
                            gotHit = true;
                        }
                    }, 500);
                    break;
            }
            break;

        case 2: // Beth's Remnant - Bouncer style (bouncing projectiles)
            SFX.heroBouncer && SFX.heroBouncer();
            switch (boss.attackPattern) {
                case 0: // Ball Burst - fires 3-5 bouncing balls
                    const ballCount = 3 + Math.floor(Math.random() * 3);
                    for (let i = 0; i < ballCount; i++) {
                        const angle = Math.random() * Math.PI * 2;
                        heroBalls.push(createBossBall(boss.x, boss.y, angle, 4, boss.damage * REMNANT.DMG_BALL, { size: 12, life: REMNANT.BALL_LIFE_LONG }));
                    }
                    break;
                case 1: // Rapid Fire - quick succession of single balls
                    for (let i = 0; i < 4; i++) {
                        setTimeout(() => {
                            if (!boss) return;
                            const angle = Math.atan2(player.y - boss.y, player.x - boss.x) + (Math.random() - 0.5) * 0.3;
                            heroBalls.push(createBossBall(boss.x, boss.y, angle, 5, boss.damage * REMNANT.DMG_BALL_RAPID, { size: 10, bounces: 3, life: REMNANT.BALL_LIFE_SHORT }));
                            SFX.heroBallBounce && SFX.heroBallBounce();
                        }, i * 150);
                    }
                    break;
                case 2: // Orbit - balls orbit then launch
                    for (let i = 0; i < 6; i++) {
                        const orbitAngle = (Math.PI * 2 / 6) * i;
                        setTimeout(() => {
                            if (!boss) return;
                            const launchAngle = Math.atan2(player.y - boss.y, player.x - boss.x);
                            const ball = createBossBall(boss.x + Math.cos(orbitAngle) * 40, boss.y + Math.sin(orbitAngle) * 40, launchAngle, 3.5, boss.damage * REMNANT.DMG_BALL_RAPID, { size: 10, bounces: 4, life: REMNANT.BALL_LIFE_MED });
                            heroBalls.push(ball);
                        }, 500 + i * 100);
                    }
                    break;
            }
            break;

        case 3: // Milia's Remnant - Angel style (area denial)
            SFX.heroAngel && SFX.heroAngel();
            // Spawn minions for Wizard chain (always keep some nearby)
            if (enemies.length < 3) {
                const config = enemyTypes.find(e => e.type === 'chaser') || enemyTypes[0];
                for (let i = 0; i < 2; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const dist = 60 + Math.random() * 40;
                    enemies.push({
                        x: boss.x + Math.cos(angle) * dist,
                        y: boss.y + Math.sin(angle) * dist,
                        size: config.size * 0.8,
                        hp: config.hp * 0.5, // Weaker minions
                        maxHp: config.hp * 0.5,
                        damage: config.damage * 0.5,
                        speed: config.speed * 0.7,
                        type: 'chaser',
                        color: '#aaf', // Light blue tint
                        slowed: 0
                    });
                }
            }
            switch (boss.attackPattern) {
                case 0: // Holy Rings - expanding rings of light
                    for (let ring = 0; ring < 3; ring++) {
                        setTimeout(() => {
                            if (!boss) return;
                            effects.push({ x: boss.x, y: boss.y, life: 60, type: 'aoe', radius: 0, maxRadius: 200 + ring * 50, color: '#fff', speed: 3 });
                        }, ring * 400);
                    }
                    break;
                case 1: // Divine Burst - massive proximity damage (punishes melee)
                    effects.push({ x: boss.x, y: boss.y, life: 30, type: 'aoe', radius: 0, maxRadius: 100, color: '#fff', speed: 8 });
                    setTimeout(() => {
                        if (!boss) return;
                        const dx = player.x - boss.x, dy = player.y - boss.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < 100 && player.invincibleTime <= 0) {
                            damagePlayer(boss.damage * 1.5); // 67.5 damage - very punishing
                            player.invincibleTime = 60;
                            gotHit = true;
                            effects.push({ x: player.x, y: player.y, life: 20, type: 'hit', color: '#fff' });
                        }
                        // Visual explosion
                        for (let k = 0; k < 12; k++) {
                            const angle = (Math.PI * 2 / 12) * k;
                            effects.push({ x: boss.x + Math.cos(angle) * 50, y: boss.y + Math.sin(angle) * 50, vx: Math.cos(angle) * 4, vy: Math.sin(angle) * 4, life: 20, color: '#fff', type: 'particle' });
                        }
                    }, 400);
                    break;
                case 2: // Feather Storm - rains feathers in area
                    for (let i = 0; i < 8; i++) {
                        setTimeout(() => {
                            if (!boss) return;
                            const x = player.x + (Math.random() - 0.5) * 200;
                            const y = player.y - 100;
                            projectiles.push(createBossProjectile(x, y, Math.PI / 2, 3, boss.damage * REMNANT.DMG_FEATHER, { size: 8, color: '#fff' }));
                        }, i * 100);
                    }
                    break;
            }
            break;

        case 4: // Troy's Remnant - Laser style (beams)
            SFX.heroLaser && SFX.heroLaser();
            switch (boss.attackPattern) {
                case 0: // Sweep Beam - laser sweeps across arena
                    const sweepStartAngle = boss.phase;
                    for (let i = 0; i < 20; i++) {
                        setTimeout(() => {
                            if (!boss) return;
                            const angle = sweepStartAngle + i * 0.1;
                            for (let j = 0; j < 15; j++) {
                                const proj = createBossProjectile(boss.x + Math.cos(angle) * j * 40, boss.y + Math.sin(angle) * j * 40, angle, 8, boss.damage * REMNANT.DMG_BEAM_SWEEP, { life: 10 });
                                projectiles.push(proj);
                            }
                        }, i * 50);
                    }
                    break;
                case 1: // Lock-On Burst - warning then fires
                    const targetX = player.x, targetY = player.y;
                    effects.push({ x: targetX, y: targetY, life: 45, type: 'laser_warning', color: '#f0f8' });
                    setTimeout(() => {
                        if (!boss) return;
                        const angle = Math.atan2(targetY - boss.y, targetX - boss.x);
                        for (let i = 0; i < 20; i++) {
                            projectiles.push(createBossProjectile(boss.x + Math.cos(angle) * i * 30, boss.y + Math.sin(angle) * i * 30, angle, 10, boss.damage * REMNANT.DMG_BEAM_LOCK, { size: 12, life: 15 }));
                        }
                    }, 750);
                    break;
                case 2: // Multi-Beam - 3 lasers in spread
                    const baseAngle = Math.atan2(player.y - boss.y, player.x - boss.x);
                    for (let spread = -1; spread <= 1; spread++) {
                        const angle = baseAngle + spread * 0.4;
                        for (let i = 0; i < 12; i++) {
                            projectiles.push(createBossProjectile(boss.x + Math.cos(angle) * i * 35, boss.y + Math.sin(angle) * i * 35, angle, 7, boss.damage * REMNANT.DMG_BEAM_MULTI, { life: 20 }));
                        }
                    }
                    break;
            }
            // Troy's Remnant: Constant Pulse - unavoidable chip damage
            boss.pulseTimer = (boss.pulseTimer || 0) + 1;
            if (boss.pulseTimer >= REMNANT.PULSE_INTERVAL) {
                boss.pulseTimer = 0;
                if (player.invincibleTime <= 0) {
                    damagePlayer(REMNANT.PULSE_DAMAGE);
                    effects.push({ x: player.x, y: player.y, life: 15, type: 'hit', color: '#f0f' });
                    effects.push({ x: boss.x, y: boss.y, life: 30, type: 'aoe', color: '#f0f8', radius: 0, maxRadius: 400, speed: 10 });
                }
            }
            break;
    }
}

function bossAttack() {
    if (!boss) return;

    // Story mode Remnant bosses use special attack patterns
    if (storyMode && boss.type === 'remnant') {
        remnantBossAttack();
        return;
    }

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
    // Handle slow effect
    if (boss.slowed > 0) boss.slowed--;
    const speedMult = boss.slowed > 0 ? 0.5 : 1;

    boss.moveTimer++;
    if (boss.moveTimer >= 120) { boss.moveTimer = 0; boss.targetX = 100 + Math.random() * (canvas.width - 200); }
    boss.x += (boss.targetX - boss.x) * 0.02 * speedMult;
    if (boss.y < boss.targetY) boss.y += 2 * speedMult;
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

            // Story mode: let checkStoryWaveComplete handle the boss death
            if (storyMode) {
                boss = null;
                document.getElementById('bossHealth').style.display = 'none';
                // Clear all projectiles so player doesn't get hit during victory dialogue
                projectiles = [];
                enemies = [];
                heroBalls = []; // Clear bouncing balls from Bouncer-style boss
                // Keep bossActive = true so checkStoryWaveComplete can detect boss death
                return;
            }

            if (wave >= 20) {
                gameRunning = false; SFX.victory();
                if (!cheatMode && !storyMode) saveHighScore(score);
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
