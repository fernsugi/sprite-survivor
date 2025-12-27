// Sprite System

// Helper function to apply damage with shield support
function applyDamage(target, damage) {
    if (target === boss && boss && boss.shield > 0) {
        const absorbed = Math.min(boss.shield, damage);
        boss.shield -= absorbed;
        damage -= absorbed;
    }
    target.hp -= damage;
}

function initSpriteButtons() {
    const container = document.getElementById('spriteButtons');
    container.innerHTML = '';
    const altKeys = ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/'];
    const spriteFontSize = t('spriteFontSize');
    const costFontSize = t('costFontSize');
    const descFontSize = t('descFontSize');
    spriteTypes.forEach((type, index) => {
        const btn = document.createElement('button');
        btn.className = 'sprite-btn';
        btn.id = `sprite-btn-${index}`;
        btn.style.fontSize = spriteFontSize;
        const numKey = index === 9 ? '0' : (index + 1).toString();
        const altKey = altKeys[index];
        btn.innerHTML = `[${numKey}/${altKey}] ${t(type.nameKey)} <span class="cost" style="font-size:${costFontSize}">${type.cost}pts</span><br><span class="desc" style="font-size:${descFontSize}">${t(type.descKey)}</span>`;
        btn.onclick = () => summonSprite(index);
        container.appendChild(btn);
    });
}

function updateSpriteButtons() {
    spriteTypes.forEach((type, index) => {
        const btn = document.getElementById(`sprite-btn-${index}`);
        if (btn) {
            btn.disabled = points < type.cost;
            btn.classList.toggle('affordable', points >= type.cost);
        }
    });
}

function upgradeSpriteStats(sprite) {
    const type = spriteTypes[sprite.typeIndex];
    sprite.damage = Math.floor((type.damage || 0) * (1 + sprite.level * 0.5));
    sprite.healAmount = Math.floor((type.healAmount || 0) * (1 + sprite.level * 0.3));
    sprite.range = (type.range || 50) * (1 + sprite.level * 0.2);
    sprite.size = 12 + sprite.level * 3;
    sprite.cooldown = Math.max(10, type.cooldown - sprite.level * 5);
}

function createMergeEffect(sprite) {
    for (let j = 0; j < 10; j++) {
        effects.push({
            x: sprite.x, y: sprite.y,
            vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4,
            life: 30, color: sprite.color, type: 'particle'
        });
    }
}

function checkAllMerges() {
    let mergeOccurred = true;
    while (mergeOccurred) {
        mergeOccurred = false;
        for (let i = 0; i < sprites.length; i++) {
            for (let j = i + 1; j < sprites.length; j++) {
                const s1 = sprites[i], s2 = sprites[j];
                if (s1.typeIndex === s2.typeIndex && s1.level === s2.level) {
                    s1.level++;
                    upgradeSpriteStats(s1);
                    s1.x = (s1.x + s2.x) / 2;
                    s1.y = (s1.y + s2.y) / 2;
                    createMergeEffect(s1);
                    createMergeEffect(s2);
                    sprites.splice(j, 1);
                    mergeOccurred = true;
                    break;
                }
            }
            if (mergeOccurred) break;
        }
    }
}

function summonSprite(typeIndex) {
    if (gamePaused || !gameRunning) return;
    const type = spriteTypes[typeIndex];
    if (points < type.cost) return;
    points -= type.cost;
    const angle = Math.random() * Math.PI * 2;
    const dist = 50 + Math.random() * 30;
    const newSprite = {
        x: player.x + Math.cos(angle) * dist,
        y: player.y + Math.sin(angle) * dist,
        typeIndex, type: type.type, color: type.color, nameKey: type.nameKey,
        damage: type.damage || 0, healAmount: type.healAmount || 0,
        range: type.range || 50, cooldown: type.cooldown, currentCooldown: 0,
        level: 1, size: 12, angle: 0, orbitAngle: angle,
        orbitSpeed: 0.02 + Math.random() * 0.01,
        blocksProjectiles: type.blocksProjectiles || false,
        reflectsProjectiles: type.reflectsProjectiles || false
    };
    sprites.push(newSprite);
    checkAllMerges();
    updateUI();
}

function updateSprites() {
    sprites.forEach(sprite => {
        sprite.orbitAngle += sprite.orbitSpeed;
        const orbitDist = 50 + sprites.indexOf(sprite) * 12;
        const targetX = player.x + Math.cos(sprite.orbitAngle) * orbitDist;
        const targetY = player.y + Math.sin(sprite.orbitAngle) * orbitDist;
        sprite.x += (targetX - sprite.x) * 0.1;
        sprite.y += (targetY - sprite.y) * 0.1;
        sprite.angle += 0.05;
        if (sprite.currentCooldown > 0) { sprite.currentCooldown--; return; }

        let nearestEnemy = null, nearestDist = Infinity;
        const targets = [...enemies]; if (boss) targets.push(boss);
        targets.forEach(enemy => {
            const dx = enemy.x - sprite.x, dy = enemy.y - sprite.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < nearestDist) { nearestDist = dist; nearestEnemy = enemy; }
        });

        switch (sprite.type) {
            case 'shooter':
                if (nearestEnemy && nearestDist < sprite.range) {
                    sprite.currentCooldown = sprite.cooldown;
                    const dx = nearestEnemy.x - sprite.x, dy = nearestEnemy.y - sprite.y, dist = Math.sqrt(dx * dx + dy * dy);
                    spriteProjectiles.push({ x: sprite.x, y: sprite.y, vx: (dx / dist) * 6, vy: (dy / dist) * 6, damage: sprite.damage, size: 5 + sprite.level, color: sprite.color });
                }
                break;
            case 'melee':
                if (nearestEnemy && nearestDist < sprite.range) {
                    sprite.currentCooldown = sprite.cooldown; applyDamage(nearestEnemy, sprite.damage);
                    effects.push({ x: nearestEnemy.x, y: nearestEnemy.y, life: 15, type: 'slash', color: sprite.color, angle: Math.atan2(nearestEnemy.y - sprite.y, nearestEnemy.x - sprite.x) });
                }
                break;
            case 'aoe':
                if (nearestEnemy && nearestDist < sprite.range * 1.5) {
                    sprite.currentCooldown = sprite.cooldown;
                    targets.forEach(enemy => { const dx = enemy.x - nearestEnemy.x, dy = enemy.y - nearestEnemy.y; if (Math.sqrt(dx * dx + dy * dy) < sprite.range) applyDamage(enemy, sprite.damage); });
                    effects.push({ x: nearestEnemy.x, y: nearestEnemy.y, life: 20, type: 'aoe', color: sprite.color, radius: sprite.range });
                }
                break;
            case 'healer':
                if (player.hp < player.maxHp) { sprite.currentCooldown = sprite.cooldown; player.hp = Math.min(player.maxHp, player.hp + sprite.healAmount); effects.push({ x: player.x, y: player.y, life: 30, type: 'heal' }); }
                break;
            case 'chain':
                if (nearestEnemy && nearestDist < sprite.range) {
                    sprite.currentCooldown = sprite.cooldown;
                    let chainTargets = [nearestEnemy], lastTarget = nearestEnemy;
                    for (let c = 0; c < 5 + sprite.level; c++) {
                        let nextTarget = null, nextDist = Infinity;
                        targets.forEach(enemy => { if (chainTargets.includes(enemy)) return; const dx = enemy.x - lastTarget.x, dy = enemy.y - lastTarget.y, dist = Math.sqrt(dx * dx + dy * dy); if (dist < 80 && dist < nextDist) { nextDist = dist; nextTarget = enemy; } });
                        if (nextTarget) { chainTargets.push(nextTarget); lastTarget = nextTarget; }
                    }
                    chainTargets.forEach((target, idx) => { applyDamage(target, sprite.damage * (1 - idx * 0.15)); if (idx > 0) effects.push({ x: chainTargets[idx-1].x, y: chainTargets[idx-1].y, x2: target.x, y2: target.y, life: 10, type: 'lightning', color: sprite.color }); });
                    effects.push({ x: sprite.x, y: sprite.y, x2: nearestEnemy.x, y2: nearestEnemy.y, life: 10, type: 'lightning', color: sprite.color });
                }
                break;
            case 'spin':
                if (nearestDist < sprite.range * 1.5) {
                    sprite.currentCooldown = sprite.cooldown;
                    targets.forEach(enemy => { if (Math.sqrt((enemy.x - sprite.x) ** 2 + (enemy.y - sprite.y) ** 2) < sprite.range) applyDamage(enemy, sprite.damage); });
                    effects.push({ x: sprite.x, y: sprite.y, life: 20, type: 'spin', color: sprite.color, radius: sprite.range });
                }
                break;
            case 'slow':
                if (nearestEnemy && nearestDist < sprite.range) {
                    sprite.currentCooldown = sprite.cooldown;
                    targets.forEach(enemy => { if (Math.sqrt((enemy.x - sprite.x) ** 2 + (enemy.y - sprite.y) ** 2) < sprite.range) { applyDamage(enemy, sprite.damage); if (enemy.slowed !== undefined) enemy.slowed = 180; } });
                    effects.push({ x: sprite.x, y: sprite.y, life: 20, type: 'aoe', color: '#8ef8', radius: sprite.range });
                }
                break;
            case 'vampire':
                if (nearestEnemy && nearestDist < sprite.range) {
                    sprite.currentCooldown = sprite.cooldown; applyDamage(nearestEnemy, sprite.damage);
                    player.hp = Math.min(player.maxHp, player.hp + Math.floor(sprite.damage * 0.5));
                    for (let j = 0; j < 5; j++) effects.push({ x: nearestEnemy.x, y: nearestEnemy.y, vx: (player.x - nearestEnemy.x) * 0.05 + (Math.random() - 0.5) * 2, vy: (player.y - nearestEnemy.y) * 0.05 + (Math.random() - 0.5) * 2, life: 25, color: '#d4a', type: 'particle' });
                    effects.push({ x: nearestEnemy.x, y: nearestEnemy.y, life: 15, type: 'slash', color: '#d4a', angle: Math.atan2(nearestEnemy.y - sprite.y, nearestEnemy.x - sprite.x) });
                }
                break;
            case 'explode':
                if (nearestEnemy && nearestDist < sprite.range) {
                    sprite.currentCooldown = sprite.cooldown;
                    const dx = nearestEnemy.x - sprite.x, dy = nearestEnemy.y - sprite.y, dist = Math.sqrt(dx * dx + dy * dy);
                    spriteProjectiles.push({ x: sprite.x, y: sprite.y, vx: (dx / dist) * 5, vy: (dy / dist) * 5, damage: sprite.damage, size: 8 + sprite.level, color: sprite.color, explosive: true, explosionRadius: 60 + sprite.level * 10 });
                }
                break;
        }
    });
}

function updateSpriteProjectiles() {
    for (let i = spriteProjectiles.length - 1; i >= 0; i--) {
        const proj = spriteProjectiles[i];
        proj.x += proj.vx; proj.y += proj.vy;
        if (proj.x < -50 || proj.x > canvas.width + 50 || proj.y < -50 || proj.y > canvas.height + 50) { spriteProjectiles.splice(i, 1); continue; }
        const targets = [...enemies]; if (boss) targets.push(boss);
        for (let j = targets.length - 1; j >= 0; j--) {
            const enemy = targets[j];
            const dx = enemy.x - proj.x, dy = enemy.y - proj.y, dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < (enemy.size || boss?.size || 14)/2 + proj.size) {
                if (proj.explosive) {
                    targets.forEach(e => {
                        const edist = Math.sqrt((e.x - proj.x) ** 2 + (e.y - proj.y) ** 2);
                        if (edist < proj.explosionRadius) {
                            let dmg = proj.damage * (1 - edist / proj.explosionRadius * 0.5);
                            // Check for boss shield
                            if (e === boss && boss.shield > 0) {
                                const absorbed = Math.min(boss.shield, dmg);
                                boss.shield -= absorbed;
                                dmg -= absorbed;
                                if (absorbed > 0) effects.push({ x: proj.x, y: proj.y, life: 10, type: 'hit', color: '#888' });
                            }
                            e.hp -= dmg;
                        }
                    });
                    effects.push({ x: proj.x, y: proj.y, life: 25, type: 'aoe', color: '#fa0', radius: proj.explosionRadius });
                    for (let k = 0; k < 15; k++) effects.push({ x: proj.x, y: proj.y, vx: (Math.random() - 0.5) * 8, vy: (Math.random() - 0.5) * 8, life: 30, color: Math.random() > 0.5 ? '#fa0' : '#ff0', type: 'particle' });
                } else {
                    let dmg = proj.damage;
                    // Check for boss shield
                    if (enemy === boss && boss.shield > 0) {
                        const absorbed = Math.min(boss.shield, dmg);
                        boss.shield -= absorbed;
                        dmg -= absorbed;
                        if (absorbed > 0) effects.push({ x: proj.x, y: proj.y, life: 10, type: 'hit', color: '#888' });
                    }
                    enemy.hp -= dmg;
                    effects.push({ x: proj.x, y: proj.y, life: 10, type: 'hit', color: proj.color });
                }
                spriteProjectiles.splice(i, 1); break;
            }
        }
    }
}
