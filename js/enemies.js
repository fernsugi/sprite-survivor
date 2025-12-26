// Enemy and Boss System

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
        size: 50 + bossNum * 5, hp: 500 * bossMultiplier, maxHp: 500 * bossMultiplier,
        damage: 25 * bossMultiplier, phase: 0, attackTimer: 0, attackPattern: 0,
        moveTimer: 0, targetX: canvas.width / 2,
        nameKey: bossNames[Math.min(bossNum - 1, 3)] || 'boss1',
        color: ['#f44', '#a4f', '#444', '#f84'][Math.min(bossNum - 1, 3)] || '#fff'
    };
    document.getElementById('bossHealth').style.display = 'block';
    document.getElementById('bossName').textContent = t(boss.nameKey);
}

function bossAttack() {
    if (!boss) return;
    boss.attackTimer++;
    if (boss.attackTimer >= 60) {
        boss.attackTimer = 0;
        boss.attackPattern = (boss.attackPattern + 1) % 5;
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
                for (let i = 0; i < 3; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    enemies.push({ x: boss.x + Math.cos(angle) * 30, y: boss.y + Math.sin(angle) * 30, ...enemyTypes[0], hp: enemyTypes[0].hp * 0.5, maxHp: enemyTypes[0].hp * 0.5 });
                }
                break;
            case 3:
                effects.push({ x: boss.x, y: boss.y, targetX: player.x, targetY: player.y, life: 30, type: 'laser_warning', color: '#f008' });
                setTimeout(() => {
                    if (!boss) return;
                    const dx = player.x - boss.x, dy = player.y - boss.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    for (let i = 0; i < 20; i++) {
                        projectiles.push({ x: boss.x + (dx / dist) * i * 30, y: boss.y + (dy / dist) * i * 30, vx: dx / dist * 8, vy: dy / dist * 8, damage: boss.damage * 0.3, size: 12, color: '#f44', fromBoss: true, life: 20 });
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
        const speedMult = enemy.slowed > 0 ? 0.3 : 1;
        const dx = player.x - enemy.x, dy = player.y - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (enemy.type === 'ranged' || enemy.type === 'sniper') {
            const preferredDist = enemy.type === 'sniper' ? 200 : 120;
            if (dist > preferredDist) { enemy.x += (dx / dist) * enemy.speed * speedMult; enemy.y += (dy / dist) * enemy.speed * speedMult; }
            else if (dist < preferredDist - 30) { enemy.x -= (dx / dist) * enemy.speed * speedMult * 0.5; enemy.y -= (dy / dist) * enemy.speed * speedMult * 0.5; }
            if (enemy.currentShootCooldown <= 0) {
                enemy.currentShootCooldown = enemy.shootCooldown;
                const speed = enemy.type === 'sniper' ? 6 : 4;
                projectiles.push({ x: enemy.x, y: enemy.y, vx: (dx / dist) * speed, vy: (dy / dist) * speed, damage: enemy.damage, size: 6, color: enemy.color });
            }
            enemy.currentShootCooldown--;
        } else { enemy.x += (dx / dist) * enemy.speed * speedMult; enemy.y += (dy / dist) * enemy.speed * speedMult; }

        if (dist < player.width/2 + enemy.size/2 && player.invincibleTime <= 0) {
            if (enemy.type === 'explode') {
                player.hp -= enemy.damage; player.invincibleTime = 60;
                for (let j = 0; j < 20; j++) effects.push({ x: enemy.x, y: enemy.y, vx: (Math.random() - 0.5) * 8, vy: (Math.random() - 0.5) * 8, life: 30, color: '#ff0', type: 'particle' });
                enemies.splice(i, 1);
            } else { player.hp -= enemy.damage; player.invincibleTime = 30; player.x += (dx / dist) * -20; player.y += (dy / dist) * -20; }
            effects.push({ x: player.x, y: player.y, life: 10, type: 'hit' });
        }
        if (enemy.hp <= 0) {
            enemies.splice(i, 1); score += 20;
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
        const dx = player.x - proj.x, dy = player.y - proj.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < player.width/2 + proj.size && player.invincibleTime <= 0) {
            player.hp -= proj.damage; player.invincibleTime = 30; projectiles.splice(i, 1);
            effects.push({ x: player.x, y: player.y, life: 10, type: 'hit' });
        }
    }
}

function updateBoss() {
    if (boss) {
        bossAttack();
        if (boss.hp <= 0) {
            score += 1000;
            for (let i = 0; i < 50; i++) effects.push({ x: boss.x, y: boss.y, vx: (Math.random() - 0.5) * 10, vy: (Math.random() - 0.5) * 10, life: 60, color: boss.color, type: 'particle' });
            if (wave >= 20) { gameRunning = false; document.getElementById('victory').style.display = 'flex'; document.getElementById('victoryScore').textContent = score; }
            else { boss = null; bossActive = false; wave++; waveTimer = 0; document.getElementById('bossHealth').style.display = 'none'; }
        }
    }
}
