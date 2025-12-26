// Skill System

function spawnSkillOrb() {
    const margin = 80;
    const totalRarity = skillTypes.reduce((sum, s) => sum + s.rarity, 0);
    let rand = Math.random() * totalRarity;
    let selectedSkill = skillTypes[0];
    for (const skill of skillTypes) {
        rand -= skill.rarity;
        if (rand <= 0) { selectedSkill = skill; break; }
    }
    skillOrbs.push({
        x: margin + Math.random() * (canvas.width - margin * 2),
        y: margin + Math.random() * (canvas.height - margin * 2),
        size: 12, pulse: Math.random() * Math.PI * 2, skill: selectedSkill
    });
}

function useSkill() {
    if (!currentSkill) return;
    switch (currentSkill.name) {
        case 'skillDash':
            let dx = 0, dy = 0;
            if (keys['w'] || keys['W'] || keys['ArrowUp']) dy -= 1;
            if (keys['s'] || keys['S'] || keys['ArrowDown']) dy += 1;
            if (keys['a'] || keys['A'] || keys['ArrowLeft']) dx -= 1;
            if (keys['d'] || keys['D'] || keys['ArrowRight']) dx += 1;
            if (dx === 0 && dy === 0) dx = 1;
            const len = Math.sqrt(dx * dx + dy * dy);
            dx /= len; dy /= len;
            const dashDist = 150;
            player.x += dx * dashDist;
            player.y += dy * dashDist;
            player.x = Math.max(player.width/2, Math.min(canvas.width - player.width/2, player.x));
            player.y = Math.max(player.height/2, Math.min(canvas.height - player.height/2, player.y));
            player.invincibleTime = 30;
            for (let i = 0; i < 15; i++) {
                effects.push({ x: player.x - dx * i * 10, y: player.y - dy * i * 10, vx: 0, vy: 0, life: 20 - i, color: '#5ff', type: 'particle' });
            }
            break;
        case 'skillHeal':
            player.hp = player.maxHp;
            for (let i = 0; i < 20; i++) {
                effects.push({ x: player.x, y: player.y, vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4 - 2, life: 40, color: '#5f5', type: 'particle' });
            }
            effects.push({ x: player.x, y: player.y, life: 30, type: 'heal' });
            break;
        case 'skillNuke':
            const nukeDamage = 30 + wave * 5;
            enemies.forEach(enemy => {
                enemy.hp -= nukeDamage;
                effects.push({ x: enemy.x, y: enemy.y, life: 15, type: 'hit', color: '#f55' });
            });
            if (boss) boss.hp -= nukeDamage * 0.5;
            effects.push({ x: canvas.width / 2, y: canvas.height / 2, life: 20, type: 'screenFlash', color: '#f55' });
            for (let i = 0; i < 30; i++) {
                effects.push({ x: canvas.width / 2, y: canvas.height / 2, vx: (Math.random() - 0.5) * 20, vy: (Math.random() - 0.5) * 20, life: 40, color: Math.random() > 0.5 ? '#f55' : '#fa0', type: 'particle' });
            }
            break;
    }
    currentSkill = null;
    updateSkillDisplay();
}

function updateSkillDisplay() {
    const display = document.getElementById('skillDisplay');
    const nameEl = document.getElementById('skillName');
    if (currentSkill) {
        display.classList.add('has-skill');
        nameEl.textContent = t(currentSkill.name);
        nameEl.style.color = currentSkill.color;
    } else {
        display.classList.remove('has-skill');
        nameEl.textContent = '-';
    }
}
