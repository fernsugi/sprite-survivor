// Hero System - Permanent ally NPCs summoned via Hero skill orb

function updateHeroes() {
    const baseSpeed = 2;

    heroes.forEach(hero => {
        // Decrease cooldown
        if (hero.cooldown > 0) hero.cooldown--;

        // Speed multiplier from config (default 1), also affected by slow debuff
        const speedMult = hero.type.speedMult || 1;
        const slowMult = debuffs.slow > 0 ? 0.5 : 1;
        const heroSpeed = baseSpeed * speedMult * slowMult;

        // Find nearest enemy for targeting
        let nearestEnemy = null;
        let nearestDist = Infinity;
        enemies.forEach(enemy => {
            const dx = enemy.x - hero.x;
            const dy = enemy.y - hero.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearestEnemy = enemy;
            }
        });
        // Also consider boss
        if (boss) {
            const dx = boss.x - hero.x;
            const dy = boss.y - hero.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearestEnemy = boss;
            }
        }

        // Movement AI - wander around but stay near action
        hero.angle += (Math.random() - 0.5) * 0.1;

        // If there's an enemy, move towards optimal range
        if (nearestEnemy) {
            const dx = nearestEnemy.x - hero.x;
            const dy = nearestEnemy.y - hero.y;
            const targetAngle = Math.atan2(dy, dx);

            // Different behaviors per hero type
            switch (hero.type.id) {
                case 'warrior':
                    // Move towards enemy for melee
                    if (nearestDist > hero.type.range * 0.8) {
                        hero.angle = targetAngle;
                    }
                    break;
                case 'laser':
                    // Keep medium distance
                    if (nearestDist < 150) {
                        hero.angle = targetAngle + Math.PI; // Move away
                    } else if (nearestDist > 300) {
                        hero.angle = targetAngle; // Move closer
                    }
                    break;
                case 'angel':
                    // Follow a random enemy to erase projectiles near them
                    if (enemies.length > 0 || boss) {
                        // Pick a new target only occasionally (not every frame)
                        if (!hero.angelTarget || Math.random() < 0.02) {
                            const allTargets = [...enemies];
                            if (boss) allTargets.push(boss);
                            hero.angelTarget = allTargets[Math.floor(Math.random() * allTargets.length)];
                        }
                        // Check if target still exists
                        const targetExists = hero.angelTarget && (enemies.includes(hero.angelTarget) || hero.angelTarget === boss);
                        if (targetExists) {
                            const dxTarget = hero.angelTarget.x - hero.x;
                            const dyTarget = hero.angelTarget.y - hero.y;
                            const targetDist = Math.sqrt(dxTarget * dxTarget + dyTarget * dyTarget);
                            if (targetDist > 80) {
                                hero.angle = Math.atan2(dyTarget, dxTarget);
                            }
                        } else {
                            hero.angelTarget = null; // Target died, pick new one next frame
                        }
                    }
                    break;
                case 'bouncer':
                    // Wander more randomly
                    if (Math.random() < 0.02) {
                        hero.angle = Math.random() * Math.PI * 2;
                    }
                    break;
            }
        }

        // Apply movement
        hero.vx = Math.cos(hero.angle) * heroSpeed * 0.5;
        hero.vy = Math.sin(hero.angle) * heroSpeed * 0.5;
        hero.x += hero.vx;
        hero.y += hero.vy;

        // Keep within bounds
        hero.x = Math.max(hero.size, Math.min(canvas.width - hero.size, hero.x));
        hero.y = Math.max(hero.size, Math.min(canvas.height - hero.size, hero.y));

        // Perform action if cooldown ready and there's a target
        if (hero.cooldown <= 0 && (nearestEnemy || hero.type.id === 'angel')) {
            performHeroAction(hero, nearestEnemy);
            hero.cooldown = hero.type.actionCooldown;
        }
    });

    // Update bouncing balls
    updateHeroBalls();
}

function performHeroAction(hero, target) {
    const type = hero.type;

    switch (type.id) {
        case 'laser':
            if (!target) return;
            SFX.heroLaser();
            // Fire laser towards target
            const laserAngle = Math.atan2(target.y - hero.y, target.x - hero.x);
            const laserEndX = hero.x + Math.cos(laserAngle) * type.range;
            const laserEndY = hero.y + Math.sin(laserAngle) * type.range;

            // Damage all enemies in laser path
            const laserWidth = type.laserWidth;
            enemies.forEach(enemy => {
                if (pointToLineDistance(enemy.x, enemy.y, hero.x, hero.y, laserEndX, laserEndY) < laserWidth) {
                    enemy.hp -= type.damage;
                    effects.push({ x: enemy.x, y: enemy.y, life: 10, type: 'hit', color: type.color });
                }
            });
            if (boss && pointToLineDistance(boss.x, boss.y, hero.x, hero.y, laserEndX, laserEndY) < laserWidth + boss.size/2) {
                boss.hp -= type.damage * (debuffs.weakened > 0 ? 0.5 : 1);
                effects.push({ x: boss.x, y: boss.y, life: 10, type: 'hit', color: type.color });
            }

            // Visual effect
            effects.push({
                x: hero.x, y: hero.y, x2: laserEndX, y2: laserEndY,
                life: 15, type: 'heroLaser', color: type.color, width: laserWidth
            });
            break;

        case 'warrior':
            if (!target) return;
            SFX.heroWarrior();
            // Cone attack towards target
            const attackAngle = Math.atan2(target.y - hero.y, target.x - hero.x);
            const coneAngle = type.coneAngle;

            enemies.forEach(enemy => {
                const dx = enemy.x - hero.x;
                const dy = enemy.y - hero.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist <= type.range) {
                    const enemyAngle = Math.atan2(dy, dx);
                    let angleDiff = Math.abs(enemyAngle - attackAngle);
                    if (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;
                    if (angleDiff <= coneAngle / 2) {
                        enemy.hp -= type.damage;
                        effects.push({ x: enemy.x, y: enemy.y, life: 10, type: 'hit', color: type.color });
                    }
                }
            });
            if (boss) {
                const dx = boss.x - hero.x;
                const dy = boss.y - hero.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist <= type.range + boss.size/2) {
                    const bossAngle = Math.atan2(dy, dx);
                    let angleDiff = Math.abs(bossAngle - attackAngle);
                    if (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;
                    if (angleDiff <= coneAngle / 2) {
                        boss.hp -= type.damage * (debuffs.weakened > 0 ? 0.5 : 1);
                        effects.push({ x: boss.x, y: boss.y, life: 10, type: 'hit', color: type.color });
                    }
                }
            }

            // Visual effect - cone slash
            effects.push({
                x: hero.x, y: hero.y, angle: attackAngle, coneAngle: coneAngle,
                radius: type.range, life: 15, type: 'heroCone', color: type.color
            });
            break;

        case 'angel':
            SFX.heroAngel();
            // Erase enemy projectiles in AOE (blocked by noBlock debuff)
            if (debuffs.noBlock <= 0) {
                for (let i = projectiles.length - 1; i >= 0; i--) {
                    const proj = projectiles[i];
                    const dx = proj.x - hero.x;
                    const dy = proj.y - hero.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < type.eraseRadius) {
                        // Create purge particle
                        effects.push({
                            x: proj.x, y: proj.y,
                            vx: (Math.random() - 0.5) * 3,
                            vy: -Math.random() * 2 - 1,
                            life: 20, color: '#fff', type: 'particle'
                        });
                        projectiles.splice(i, 1);
                    }
                }
            }

            // Visual effect - holy ring (grey when blocked)
            effects.push({
                x: hero.x, y: hero.y, radius: type.eraseRadius,
                life: 20, type: 'heroAngel', color: debuffs.noBlock > 0 ? '#888' : type.color
            });
            break;

        case 'bouncer':
            if (!target) return;
            SFX.heroBouncer();
            // Launch bouncing ball towards target
            const ballAngle = Math.atan2(target.y - hero.y, target.x - hero.x);
            heroBalls.push({
                x: hero.x,
                y: hero.y,
                vx: Math.cos(ballAngle) * type.ballSpeed,
                vy: Math.sin(ballAngle) * type.ballSpeed,
                damage: type.damage,
                lifetime: type.ballLifetime,
                color: type.color,
                size: type.ballSize || 8
            });
            break;
    }
}

function updateHeroBalls() {
    for (let i = heroBalls.length - 1; i >= 0; i--) {
        const ball = heroBalls[i];

        // Move ball
        ball.x += ball.vx;
        ball.y += ball.vy;
        ball.lifetime--;

        // Bounce off edges
        if (ball.x <= ball.size || ball.x >= canvas.width - ball.size) {
            ball.vx *= -1;
            ball.x = Math.max(ball.size, Math.min(canvas.width - ball.size, ball.x));
            SFX.heroBallBounce();
        }
        if (ball.y <= ball.size || ball.y >= canvas.height - ball.size) {
            ball.vy *= -1;
            ball.y = Math.max(ball.size, Math.min(canvas.height - ball.size, ball.y));
            SFX.heroBallBounce();
        }

        // Damage enemies on contact
        enemies.forEach(enemy => {
            const dx = enemy.x - ball.x;
            const dy = enemy.y - ball.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < ball.size + enemy.size / 2) {
                enemy.hp -= ball.damage;
                effects.push({ x: enemy.x, y: enemy.y, life: 8, type: 'hit', color: ball.color });
            }
        });

        // Damage boss on contact
        if (boss) {
            const dx = boss.x - ball.x;
            const dy = boss.y - ball.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < ball.size + boss.size / 2) {
                boss.hp -= ball.damage * (debuffs.weakened > 0 ? 0.5 : 1);
                effects.push({ x: boss.x, y: boss.y, life: 8, type: 'hit', color: ball.color });
            }
        }

        // Remove expired balls
        if (ball.lifetime <= 0) {
            heroBalls.splice(i, 1);
        }
    }
}

// Helper function for laser collision
function pointToLineDistance(px, py, x1, y1, x2, y2) {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    if (lenSq !== 0) param = dot / lenSq;

    let xx, yy;
    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }
    const dx = px - xx;
    const dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy);
}
