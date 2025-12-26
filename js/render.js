// Rendering System

function drawPixelChar(x, y, size, color, outline = '#000') {
    const s = size / 4;
    ctx.fillStyle = outline; ctx.fillRect(Math.floor(x - size/2 - 1), Math.floor(y - size/2 - 1), size + 2, size + 2);
    ctx.fillStyle = color; ctx.fillRect(Math.floor(x - size/2), Math.floor(y - size/2), size, size);
    ctx.fillStyle = '#fff'; ctx.fillRect(Math.floor(x - s), Math.floor(y - s), s, s); ctx.fillRect(Math.floor(x + s/2), Math.floor(y - s), s, s);
}

function draw() {
    // Background
    ctx.fillStyle = '#1a1a2e'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#1e1e36';
    for (let x = 0; x < canvas.width; x += 40) for (let y = 0; y < canvas.height; y += 40) if ((x + y) % 80 === 0) ctx.fillRect(x, y, 40, 40);

    // Orbs
    orbs.forEach(orb => {
        const pulse = Math.sin(orb.pulse) * 2;
        ctx.fillStyle = '#fff8'; ctx.beginPath(); ctx.arc(orb.x, orb.y, orb.size + pulse + 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(orb.x, orb.y, orb.size + pulse, 0, Math.PI * 2); ctx.fill();
    });

    // Skill Orbs
    skillOrbs.forEach(orb => {
        const pulse = Math.sin(orb.pulse) * 3;
        ctx.fillStyle = orb.skill.color + '44'; ctx.beginPath(); ctx.arc(orb.x, orb.y, orb.size + pulse + 10, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = orb.skill.color + '88'; ctx.beginPath(); ctx.arc(orb.x, orb.y, orb.size + pulse + 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = orb.skill.color; ctx.beginPath(); ctx.arc(orb.x, orb.y, orb.size + pulse, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(orb.x, orb.y, 4, 0, Math.PI * 2); ctx.fill();
    });

    // Enemies
    enemies.forEach(enemy => {
        if (enemy.slowed > 0) { ctx.fillStyle = '#8ef4'; ctx.beginPath(); ctx.arc(enemy.x, enemy.y, enemy.size + 5, 0, Math.PI * 2); ctx.fill(); }
        drawPixelChar(enemy.x, enemy.y, enemy.size, enemy.color);
        if (enemy.hp < enemy.maxHp) { const barWidth = enemy.size * 1.5; ctx.fillStyle = '#000'; ctx.fillRect(enemy.x - barWidth/2, enemy.y - enemy.size - 6, barWidth, 4); ctx.fillStyle = '#f44'; ctx.fillRect(enemy.x - barWidth/2, enemy.y - enemy.size - 6, barWidth * (enemy.hp / enemy.maxHp), 4); }
    });

    // Boss
    if (boss) {
        ctx.fillStyle = boss.color + '44'; ctx.beginPath(); ctx.arc(boss.x, boss.y, boss.size + 20 + Math.sin(boss.phase) * 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#000'; ctx.fillRect(boss.x - boss.size/2 - 2, boss.y - boss.size/2 - 2, boss.size + 4, boss.size + 4);
        ctx.fillStyle = boss.color; ctx.fillRect(boss.x - boss.size/2, boss.y - boss.size/2, boss.size, boss.size);
        const eyeSize = boss.size / 6;
        ctx.fillStyle = '#fff'; ctx.fillRect(boss.x - boss.size/4, boss.y - boss.size/6, eyeSize, eyeSize); ctx.fillRect(boss.x + boss.size/8, boss.y - boss.size/6, eyeSize, eyeSize);
        ctx.fillStyle = '#000'; ctx.fillRect(boss.x - boss.size/4 + 2, boss.y - boss.size/6 + 2, eyeSize/2, eyeSize/2); ctx.fillRect(boss.x + boss.size/8 + 2, boss.y - boss.size/6 + 2, eyeSize/2, eyeSize/2);
        ctx.fillStyle = boss.color; ctx.fillRect(boss.x - boss.size/2, boss.y - boss.size/2 - 10, 8, 10); ctx.fillRect(boss.x + boss.size/2 - 8, boss.y - boss.size/2 - 10, 8, 10); ctx.fillRect(boss.x - 4, boss.y - boss.size/2 - 15, 8, 15);
    }

    // Sprites
    sprites.forEach(sprite => {
        ctx.fillStyle = sprite.color + '44'; ctx.beginPath(); ctx.arc(sprite.x, sprite.y, sprite.size + 6, 0, Math.PI * 2); ctx.fill();
        ctx.save(); ctx.translate(sprite.x, sprite.y); ctx.rotate(sprite.angle);
        ctx.fillStyle = '#000'; ctx.fillRect(-sprite.size/2 - 1, -sprite.size/2 - 1, sprite.size + 2, sprite.size + 2);
        ctx.fillStyle = sprite.color; ctx.fillRect(-sprite.size/2, -sprite.size/2, sprite.size, sprite.size);
        ctx.restore();
        if (sprite.level > 1) { ctx.fillStyle = '#ff0'; ctx.font = '8px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('Lv' + sprite.level, sprite.x, sprite.y - sprite.size); }
    });

    // Player
    if (player.invincibleTime === 0 || Math.floor(player.invincibleTime / 4) % 2 === 0) {
        ctx.fillStyle = player.color + '44'; ctx.beginPath(); ctx.arc(player.x, player.y, player.width + 4, 0, Math.PI * 2); ctx.fill();
        drawPixelChar(player.x, player.y, player.width, player.color);
    }

    // Projectiles
    projectiles.forEach(proj => { ctx.fillStyle = proj.color; ctx.beginPath(); ctx.arc(proj.x, proj.y, proj.size, 0, Math.PI * 2); ctx.fill(); });
    spriteProjectiles.forEach(proj => { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(proj.x, proj.y, proj.size + 1, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = proj.color; ctx.beginPath(); ctx.arc(proj.x, proj.y, proj.size, 0, Math.PI * 2); ctx.fill(); });

    // Effects
    effects.forEach(effect => {
        const alpha = effect.life / 30;
        switch (effect.type) {
            case 'particle': ctx.fillStyle = effect.color; ctx.globalAlpha = alpha; ctx.fillRect(effect.x - 3, effect.y - 3, 6, 6); ctx.globalAlpha = 1; break;
            case 'hit': ctx.strokeStyle = effect.color || '#fff'; ctx.lineWidth = 2; ctx.globalAlpha = alpha; ctx.beginPath(); ctx.arc(effect.x, effect.y, 20 - effect.life, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1; break;
            case 'slash': ctx.strokeStyle = effect.color; ctx.lineWidth = 4; ctx.globalAlpha = alpha; ctx.beginPath(); ctx.arc(effect.x, effect.y, 30, effect.angle - 0.5, effect.angle + 0.5); ctx.stroke(); ctx.globalAlpha = 1; break;
            case 'aoe': ctx.strokeStyle = effect.color; ctx.lineWidth = 3; ctx.globalAlpha = alpha * 0.5; ctx.beginPath(); ctx.arc(effect.x, effect.y, effect.radius * (1 - alpha * 0.3), 0, Math.PI * 2); ctx.stroke(); ctx.fillStyle = effect.color; ctx.globalAlpha = alpha * 0.2; ctx.fill(); ctx.globalAlpha = 1; break;
            case 'heal': ctx.fillStyle = '#5f5'; ctx.globalAlpha = alpha; ctx.font = '16px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('+', effect.x, effect.y - 20 + effect.life); ctx.globalAlpha = 1; break;
            case 'lightning': ctx.strokeStyle = effect.color; ctx.lineWidth = 3; ctx.globalAlpha = alpha; ctx.beginPath(); ctx.moveTo(effect.x, effect.y); const dx = effect.x2 - effect.x, dy = effect.y2 - effect.y; for (let i = 1; i <= 5; i++) { const t = i / 5; const jitter = i < 5 ? (Math.random() - 0.5) * 20 : 0; ctx.lineTo(effect.x + dx * t + jitter, effect.y + dy * t + jitter); } ctx.stroke(); ctx.globalAlpha = 1; break;
            case 'spin': ctx.strokeStyle = effect.color; ctx.lineWidth = 4; ctx.globalAlpha = alpha; ctx.beginPath(); ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1; break;
            case 'laser_warning': ctx.strokeStyle = effect.color; ctx.lineWidth = 10; ctx.globalAlpha = Math.sin(effect.life * 0.5) * 0.5; ctx.beginPath(); ctx.moveTo(effect.x, effect.y); ctx.lineTo(effect.targetX, effect.targetY); ctx.stroke(); ctx.globalAlpha = 1; break;
            case 'screenFlash': ctx.fillStyle = effect.color; ctx.globalAlpha = alpha * 0.3; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.globalAlpha = 1; break;
        }
    });
}
