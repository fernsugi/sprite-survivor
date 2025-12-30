// Rendering System

// Gradient cache for sprite rendering performance
const spriteGradientCache = new Map();

// Clear gradient cache (call on game restart to free memory)
function clearSpriteGradientCache() {
    spriteGradientCache.clear();
}

// Debuff visual colors
const debuffColors = {
    noHeal: '#f44',    // Red - can't recover
    noBlock: '#888',   // Gray - shields disabled
    slow: '#4ff',      // Cyan - ice/frozen
    weakened: '#a4f'   // Purple - curse
};

function drawPixelChar(x, y, size, color, outline = '#000') {
    const s = size / 4;
    ctx.fillStyle = outline; ctx.fillRect(Math.floor(x - size/2 - 1), Math.floor(y - size/2 - 1), size + 2, size + 2);
    ctx.fillStyle = color; ctx.fillRect(Math.floor(x - size/2), Math.floor(y - size/2), size, size);
    ctx.fillStyle = '#fff'; ctx.fillRect(Math.floor(x - s), Math.floor(y - s), s, s); ctx.fillRect(Math.floor(x + s/2), Math.floor(y - s), s, s);
}

// Environment themes for each boss phase
const environments = {
    // Phase 1 (Waves 1-5): Dark Forest - purple/blue with tree silhouettes
    forest: {
        bg: '#1a1a2e', tile: '#1e1e36', accent: '#252540',
        drawDetails: () => {
            ctx.fillStyle = '#151525';
            // Subtle tree silhouettes at edges
            for (let i = 0; i < 6; i++) {
                const x = i * 180 + 50;
                ctx.fillRect(x, canvas.height - 80, 8, 80);
                ctx.beginPath(); ctx.moveTo(x + 4, canvas.height - 80);
                ctx.lineTo(x - 20, canvas.height - 40); ctx.lineTo(x + 28, canvas.height - 40);
                ctx.fill();
                ctx.beginPath(); ctx.moveTo(x + 4, canvas.height - 110);
                ctx.lineTo(x - 15, canvas.height - 70); ctx.lineTo(x + 23, canvas.height - 70);
                ctx.fill();
            }
            // Top trees (upside down effect - distant)
            ctx.globalAlpha = 0.3;
            for (let i = 0; i < 5; i++) {
                const x = i * 220 + 100;
                ctx.fillRect(x, 0, 6, 40);
                ctx.beginPath(); ctx.moveTo(x + 3, 40);
                ctx.lineTo(x - 12, 15); ctx.lineTo(x + 18, 15);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
        }
    },
    // Phase 2 (Waves 6-10): Volcanic - red/orange with lava cracks
    volcanic: {
        bg: '#1a1210', tile: '#241815', accent: '#2a1a15',
        drawDetails: () => {
            // Lava cracks in the ground
            ctx.strokeStyle = '#f642';
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.4;
            const cracks = [[100, 600, 150, 650, 120, 720], [300, 680, 350, 700, 400, 750],
                [600, 620, 580, 680, 620, 730], [800, 650, 850, 700, 820, 750],
                [200, 50, 180, 100, 220, 130], [700, 30, 750, 80, 720, 120]];
            cracks.forEach(c => {
                ctx.beginPath(); ctx.moveTo(c[0], c[1]);
                ctx.lineTo(c[2], c[3]); ctx.lineTo(c[4], c[5]); ctx.stroke();
            });
            // Subtle ember particles (static positions)
            ctx.fillStyle = '#f84';
            for (let i = 0; i < 15; i++) {
                const x = (i * 137 + Math.sin(i * 3) * 50) % canvas.width;
                const y = (i * 89 + Math.cos(i * 2) * 30) % canvas.height;
                ctx.globalAlpha = 0.2 + Math.sin(gameTime * 2 + i) * 0.1;
                ctx.fillRect(x, y, 3, 3);
            }
            ctx.globalAlpha = 1;
        }
    },
    // Phase 3 (Waves 11-15): Ice Cavern - blue/cyan with ice crystals
    ice: {
        bg: '#101820', tile: '#152028', accent: '#182530',
        drawDetails: () => {
            // Ice crystal formations
            ctx.fillStyle = '#4af8';
            ctx.globalAlpha = 0.25;
            const crystals = [[50, 700], [200, 720], [400, 690], [650, 710], [850, 680], [950, 720],
                [100, 30], [350, 20], [600, 40], [800, 25]];
            crystals.forEach(([cx, cy]) => {
                // Crystal shape
                ctx.beginPath();
                ctx.moveTo(cx, cy); ctx.lineTo(cx - 8, cy + 25); ctx.lineTo(cx + 8, cy + 25);
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(cx + 15, cy + 10); ctx.lineTo(cx + 10, cy + 30); ctx.lineTo(cx + 20, cy + 30);
                ctx.fill();
            });
            // Frost overlay on edges
            ctx.fillStyle = '#8ef';
            ctx.globalAlpha = 0.08;
            ctx.fillRect(0, 0, canvas.width, 30);
            ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
            ctx.fillRect(0, 0, 20, canvas.height);
            ctx.fillRect(canvas.width - 20, 0, 20, canvas.height);
            ctx.globalAlpha = 1;
        }
    },
    // Phase 4 (Waves 16-20): Void Realm - deep purple/black with void energy
    void: {
        bg: '#0a0812', tile: '#0f0d18', accent: '#12101d',
        drawDetails: () => {
            // Void energy wisps
            ctx.globalAlpha = 0.15;
            for (let i = 0; i < 12; i++) {
                const x = (i * 97 + 50) % canvas.width;
                const y = (i * 73 + 30) % canvas.height;
                const pulse = Math.sin(gameTime * 1.5 + i * 0.8) * 10;
                ctx.fillStyle = '#a4f';
                ctx.beginPath();
                ctx.arc(x, y, 15 + pulse, 0, Math.PI * 2);
                ctx.fill();
            }
            // Dark vignette effect
            const gradient = ctx.createRadialGradient(
                canvas.width / 2, canvas.height / 2, 100,
                canvas.width / 2, canvas.height / 2, 500
            );
            gradient.addColorStop(0, 'transparent');
            gradient.addColorStop(1, 'rgba(5, 0, 10, 0.4)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            // Subtle grid distortion lines
            ctx.strokeStyle = '#408';
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.1;
            for (let x = 0; x < canvas.width; x += 100) {
                ctx.beginPath();
                ctx.moveTo(x + Math.sin(gameTime + x * 0.01) * 5, 0);
                ctx.lineTo(x + Math.sin(gameTime + x * 0.01 + 3) * 5, canvas.height);
                ctx.stroke();
            }
            ctx.globalAlpha = 1;
        }
    }
};

// Story mode environment themes (one per chapter)
const storyEnvironments = {
    // Chapter 1 - Rex: Training Grounds - warm earthy tones
    training: {
        bg: '#2a2015', tile: '#332818', accent: '#3d301c',
        drawDetails: () => {
            ctx.save();
            ctx.fillStyle = '#1a1510';
            // Wooden fence posts at bottom
            for (let i = 0; i < 8; i++) {
                const x = i * 140 + 30;
                ctx.fillRect(x, canvas.height - 60, 8, 60);
                ctx.fillRect(x - 15, canvas.height - 45, 38, 6);
            }
            // Training dummies silhouettes
            ctx.globalAlpha = 0.3;
            const dummies = [[80, canvas.height - 100], [canvas.width - 100, canvas.height - 110], [canvas.width / 2 + 150, canvas.height - 95]];
            dummies.forEach(([dx, dy]) => {
                ctx.fillRect(dx - 4, dy, 8, 40); // Post
                ctx.beginPath();
                ctx.arc(dx, dy - 10, 12, 0, Math.PI * 2); // Head
                ctx.fill();
                ctx.fillRect(dx - 20, dy + 5, 40, 6); // Arms
            });
            // Torch glows
            ctx.globalAlpha = 0.15;
            ctx.fillStyle = '#f80';
            [[60, 80], [canvas.width - 60, 100], [canvas.width / 2, 60]].forEach(([tx, ty]) => {
                const flicker = Math.sin(gameTime * 3 + tx) * 5;
                ctx.beginPath();
                ctx.arc(tx, ty, 30 + flicker, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.restore();
        }
    },
    // Chapter 2 - Beth: Crystal Cavern - blues, cyans, teals
    cavern: {
        bg: '#0d1820', tile: '#10202a', accent: '#142830',
        drawDetails: () => {
            ctx.save();
            // Stalactites from ceiling
            ctx.fillStyle = '#1a3040';
            const stalactites = [[50, 0, 25], [180, 0, 40], [350, 0, 30], [500, 0, 50], [680, 0, 35], [850, 0, 45], [950, 0, 28]];
            stalactites.forEach(([sx, sy, sh]) => {
                ctx.beginPath();
                ctx.moveTo(sx - 8, sy);
                ctx.lineTo(sx + 8, sy);
                ctx.lineTo(sx, sy + sh);
                ctx.fill();
            });
            // Crystal formations
            ctx.globalAlpha = 0.4;
            ctx.fillStyle = '#4af';
            const crystals = [[100, canvas.height - 50], [300, canvas.height - 40], [600, canvas.height - 55], [800, canvas.height - 45], [950, canvas.height - 35]];
            crystals.forEach(([cx, cy]) => {
                // Crystal cluster
                ctx.beginPath();
                ctx.moveTo(cx, cy); ctx.lineTo(cx - 6, cy + 30); ctx.lineTo(cx + 6, cy + 30);
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(cx + 12, cy + 10); ctx.lineTo(cx + 8, cy + 30); ctx.lineTo(cx + 16, cy + 30);
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(cx - 10, cy + 15); ctx.lineTo(cx - 14, cy + 30); ctx.lineTo(cx - 6, cy + 30);
                ctx.fill();
            });
            // Water reflection at bottom
            ctx.globalAlpha = 0.1;
            ctx.fillStyle = '#0af';
            ctx.fillRect(0, canvas.height - 25, canvas.width, 25);
            // Sparkle reflections
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = '#8ef';
            for (let i = 0; i < 10; i++) {
                const rx = (i * 107 + Math.sin(gameTime + i) * 20) % canvas.width;
                const ry = canvas.height - 20 + Math.sin(gameTime * 2 + i) * 5;
                ctx.fillRect(rx, ry, 2, 2);
            }
            ctx.restore();
        }
    },
    // Chapter 3 - Milia: Sky Temple - whites, golds, soft blues
    temple: {
        bg: '#1a2030', tile: '#202838', accent: '#283040',
        drawDetails: () => {
            ctx.save();
            // Cloud wisps
            ctx.globalAlpha = 0.15;
            ctx.fillStyle = '#fff';
            const clouds = [[100, 650], [300, 680], [550, 640], [750, 690], [900, 660], [150, 50], [450, 30], [700, 60]];
            clouds.forEach(([cx, cy]) => {
                ctx.beginPath();
                ctx.arc(cx, cy, 25, 0, Math.PI * 2);
                ctx.arc(cx + 20, cy - 5, 20, 0, Math.PI * 2);
                ctx.arc(cx + 35, cy + 3, 18, 0, Math.PI * 2);
                ctx.fill();
            });
            // Marble pillars at edges
            ctx.globalAlpha = 0.25;
            ctx.fillStyle = '#ddd';
            [[30, canvas.height - 120], [canvas.width - 50, canvas.height - 100]].forEach(([px, py]) => {
                ctx.fillRect(px, py, 20, 120);
                ctx.fillRect(px - 5, py, 30, 10);
                ctx.fillRect(px - 5, py + 110, 30, 10);
            });
            // Divine light rays from top
            ctx.globalAlpha = 0.08;
            const gradient = ctx.createLinearGradient(canvas.width / 2, 0, canvas.width / 2, canvas.height);
            gradient.addColorStop(0, '#ffd700');
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            // Light beams
            for (let i = 0; i < 5; i++) {
                const bx = canvas.width * 0.2 + i * (canvas.width * 0.15);
                ctx.beginPath();
                ctx.moveTo(bx - 20, 0);
                ctx.lineTo(bx + 20, 0);
                ctx.lineTo(bx + 60, canvas.height);
                ctx.lineTo(bx - 60, canvas.height);
                ctx.fill();
            }
            // Floating golden particles
            ctx.globalAlpha = 0.4;
            ctx.fillStyle = '#fd0';
            for (let i = 0; i < 12; i++) {
                const px = (i * 89 + gameTime * 10) % canvas.width;
                const py = (i * 67 + Math.sin(gameTime + i) * 30) % canvas.height;
                ctx.fillRect(px, py, 2, 2);
            }
            ctx.restore();
        }
    },
    // Chapter 4 - Troy: Shadow Citadel - deep purples, magentas, blacks
    citadel: {
        bg: '#0a0510', tile: '#100818', accent: '#150a20',
        drawDetails: () => {
            ctx.save();
            // Ominous architecture silhouettes
            ctx.fillStyle = '#050208';
            // Towers
            ctx.fillRect(20, canvas.height - 150, 40, 150);
            ctx.beginPath();
            ctx.moveTo(40, canvas.height - 150);
            ctx.lineTo(20, canvas.height - 180);
            ctx.lineTo(60, canvas.height - 180);
            ctx.fill();
            ctx.fillRect(canvas.width - 70, canvas.height - 180, 50, 180);
            ctx.beginPath();
            ctx.moveTo(canvas.width - 45, canvas.height - 180);
            ctx.lineTo(canvas.width - 70, canvas.height - 220);
            ctx.lineTo(canvas.width - 20, canvas.height - 220);
            ctx.fill();
            // Dark energy cracks
            ctx.strokeStyle = '#f0f';
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.3;
            const cracks = [[200, 700, 250, 650, 220, 600], [500, 720, 480, 680, 520, 640], [800, 690, 820, 650, 790, 610]];
            cracks.forEach(c => {
                ctx.beginPath();
                ctx.moveTo(c[0], c[1]);
                ctx.lineTo(c[2], c[3]);
                ctx.lineTo(c[4], c[5]);
                ctx.stroke();
            });
            // Floating debris
            ctx.globalAlpha = 0.2;
            ctx.fillStyle = '#a0f';
            for (let i = 0; i < 8; i++) {
                const dx = (i * 130 + 50) % canvas.width;
                const dy = 100 + Math.sin(gameTime + i * 2) * 40;
                ctx.fillRect(dx, dy, 8 + i % 3 * 4, 8 + i % 2 * 4);
            }
            // Ominous vignette
            const vignette = ctx.createRadialGradient(
                canvas.width / 2, canvas.height / 2, 50,
                canvas.width / 2, canvas.height / 2, 500
            );
            vignette.addColorStop(0, 'transparent');
            vignette.addColorStop(1, 'rgba(10, 0, 20, 0.5)');
            ctx.fillStyle = vignette;
            ctx.globalAlpha = 1;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.restore();
        }
    },
    // Chapter 5 - Ending: Dawn Sanctuary - golden sunrise, warm whites
    dawn: {
        bg: '#1a1510', tile: '#201a15', accent: '#28201a',
        drawDetails: () => {
            ctx.save();
            // Sunrise gradient from bottom
            const sunrise = ctx.createLinearGradient(0, canvas.height, 0, 0);
            sunrise.addColorStop(0, 'rgba(255, 150, 50, 0.2)');
            sunrise.addColorStop(0.3, 'rgba(255, 200, 100, 0.1)');
            sunrise.addColorStop(1, 'transparent');
            ctx.fillStyle = sunrise;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            // Horizon glow
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = '#fd8';
            ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
            // Peaceful light rays
            ctx.globalAlpha = 0.1;
            const rayGradient = ctx.createLinearGradient(canvas.width / 2, canvas.height, canvas.width / 2, 0);
            rayGradient.addColorStop(0, '#ffa');
            rayGradient.addColorStop(1, 'transparent');
            ctx.fillStyle = rayGradient;
            for (let i = 0; i < 7; i++) {
                const rx = canvas.width * 0.1 + i * (canvas.width * 0.13);
                ctx.beginPath();
                ctx.moveTo(rx - 10, canvas.height);
                ctx.lineTo(rx + 10, canvas.height);
                ctx.lineTo(rx + 40, 0);
                ctx.lineTo(rx - 40, 0);
                ctx.fill();
            }
            // Floating celebration particles (golden)
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = '#fd0';
            for (let i = 0; i < 20; i++) {
                const px = (i * 53 + gameTime * 15) % canvas.width;
                const py = (i * 41 + Math.sin(gameTime * 1.5 + i) * 50) % canvas.height;
                const size = 1 + Math.sin(gameTime * 2 + i) * 1;
                ctx.beginPath();
                ctx.arc(px, py, size, 0, Math.PI * 2);
                ctx.fill();
            }
            // Soft warm overlay
            ctx.globalAlpha = 0.05;
            ctx.fillStyle = '#fda';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.restore();
        }
    }
};

function getEnvironment() {
    // Story mode uses chapter-specific environments
    if (typeof storyMode !== 'undefined' && storyMode) {
        switch (storyChapter) {
            case 1: return storyEnvironments.training;
            case 2: return storyEnvironments.cavern;
            case 3: return storyEnvironments.temple;
            case 4: return storyEnvironments.citadel;
            case 5: return storyEnvironments.dawn;
            default: return storyEnvironments.training;
        }
    }
    // Survival mode uses wave-based environments
    if (wave <= 5) return environments.forest;
    if (wave <= 10) return environments.volcanic;
    if (wave <= 15) return environments.ice;
    return environments.void;
}

function drawBackground() {
    const env = getEnvironment();

    // Base background
    ctx.fillStyle = env.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Tile pattern
    ctx.fillStyle = env.tile;
    for (let x = 0; x < canvas.width; x += 40) {
        for (let y = 0; y < canvas.height; y += 40) {
            if ((x + y) % 80 === 0) ctx.fillRect(x, y, 40, 40);
        }
    }

    // Environment-specific details
    env.drawDetails();
}

function draw() {
    // Background
    drawBackground();

    // Orbs - white energy with sparkle (visual only, hitbox uses orb.size)
    orbs.forEach(orb => {
        const pulse = Math.sin(orb.pulse) * 1;
        const sparkle = Math.sin(orb.pulse * 2) * 0.3 + 0.7;
        const r = orb.size + pulse; // Visual matches hitbox

        // Outer glow
        ctx.globalAlpha = 0.25;
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(orb.x, orb.y, r + 5, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = '#eef'; ctx.beginPath(); ctx.arc(orb.x, orb.y, r + 2, 0, Math.PI * 2); ctx.fill();

        // Core
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#def'; ctx.beginPath(); ctx.arc(orb.x, orb.y, r, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(orb.x, orb.y, r * 0.4, 0, Math.PI * 2); ctx.fill();

        // Sparkle cross
        ctx.globalAlpha = sparkle;
        ctx.fillStyle = '#fff';
        ctx.fillRect(orb.x - 1, orb.y - r - 3, 2, r * 2 + 6);
        ctx.fillRect(orb.x - r - 3, orb.y - 1, r * 2 + 6, 2);
        ctx.globalAlpha = 1;
    });

    // Skill Orbs - colored version of normal orbs, bigger (visual only, hitbox uses orb.size)
    skillOrbs.forEach(orb => {
        const pulse = Math.sin(orb.pulse) * 1.5;
        const sparkle = Math.sin(orb.pulse * 2) * 0.3 + 0.7;
        const r = orb.size + pulse; // Visual matches hitbox
        const color = orb.skill.color;

        // Outer glow
        ctx.globalAlpha = 0.25;
        ctx.fillStyle = color; ctx.beginPath(); ctx.arc(orb.x, orb.y, r + 8, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = color; ctx.beginPath(); ctx.arc(orb.x, orb.y, r + 4, 0, Math.PI * 2); ctx.fill();

        // Core
        ctx.globalAlpha = 1;
        ctx.fillStyle = color; ctx.beginPath(); ctx.arc(orb.x, orb.y, r, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(orb.x, orb.y, r * 0.4, 0, Math.PI * 2); ctx.fill();

        // Sparkle cross
        ctx.globalAlpha = sparkle;
        ctx.fillStyle = '#fff';
        ctx.fillRect(orb.x - 1, orb.y - r - 5, 2, r * 2 + 10);
        ctx.fillRect(orb.x - r - 5, orb.y - 1, r * 2 + 10, 2);
        ctx.globalAlpha = 1;
    });

    // Story Mode Sprite Orbs
    if (storyMode && typeof drawSpriteOrbs === 'function') {
        drawSpriteOrbs();
    }

    // Enemies
    enemies.forEach(enemy => {
        if (enemy.slowed > 0) { ctx.fillStyle = '#8ef4'; ctx.beginPath(); ctx.arc(enemy.x, enemy.y, enemy.size + 5, 0, Math.PI * 2); ctx.fill(); }
        drawPixelChar(enemy.x, enemy.y, enemy.size, enemy.color);
        if (enemy.hp < enemy.maxHp) { const barWidth = enemy.size * 1.5; ctx.fillStyle = '#000'; ctx.fillRect(enemy.x - barWidth/2, enemy.y - enemy.size - 6, barWidth, 4); ctx.fillStyle = '#f44'; ctx.fillRect(enemy.x - barWidth/2, enemy.y - enemy.size - 6, barWidth * Math.max(0, enemy.hp / enemy.maxHp), 4); }
    });

    // Boss
    if (boss) {
        // Subtle animated aura - pulsing ring + soft glow with white
        const bossPulse = Math.sin(boss.phase) * 5;
        ctx.globalAlpha = 0.12;
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(boss.x, boss.y, boss.size + 20, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 0.05;
        ctx.fillStyle = boss.color;
        ctx.beginPath(); ctx.arc(boss.x, boss.y, boss.size + 20, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 0.1 + Math.sin(boss.phase * 2) * 0.03;
        ctx.strokeStyle = boss.color;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(boss.x, boss.y, boss.size + 20 + bossPulse, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = 1;

        // Remnant bosses look like heroes (square with heroic details)
        if (boss.type === 'remnant') {
            // Base square body (like a hero)
            ctx.fillStyle = '#000'; ctx.fillRect(boss.x - boss.size/2 - 2, boss.y - boss.size/2 - 2, boss.size + 4, boss.size + 4);
            ctx.fillStyle = boss.color; ctx.fillRect(boss.x - boss.size/2, boss.y - boss.size/2, boss.size, boss.size);
            // Hero-like face (friendly eyes)
            const eyeSize = boss.size / 6;
            ctx.fillStyle = '#fff';
            ctx.fillRect(boss.x - boss.size/4, boss.y - boss.size/8, eyeSize, eyeSize);
            ctx.fillRect(boss.x + boss.size/8, boss.y - boss.size/8, eyeSize, eyeSize);
            ctx.fillStyle = '#000';
            ctx.fillRect(boss.x - boss.size/4 + 2, boss.y - boss.size/8 + 2, eyeSize/2, eyeSize/2);
            ctx.fillRect(boss.x + boss.size/8 + 2, boss.y - boss.size/8 + 2, eyeSize/2, eyeSize/2);
            // Cape/wings extending from sides (hero-like)
            ctx.fillStyle = boss.color;
            ctx.globalAlpha = 0.7;
            ctx.beginPath();
            ctx.moveTo(boss.x - boss.size/2, boss.y - boss.size/4);
            ctx.lineTo(boss.x - boss.size/2 - 15, boss.y);
            ctx.lineTo(boss.x - boss.size/2, boss.y + boss.size/4);
            ctx.closePath(); ctx.fill();
            ctx.beginPath();
            ctx.moveTo(boss.x + boss.size/2, boss.y - boss.size/4);
            ctx.lineTo(boss.x + boss.size/2 + 15, boss.y);
            ctx.lineTo(boss.x + boss.size/2, boss.y + boss.size/4);
            ctx.closePath(); ctx.fill();
            ctx.globalAlpha = 1;
            // Corrupted aura effect (dark wisps)
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = '#408';
            for (let i = 0; i < 4; i++) {
                const angle = boss.phase + i * Math.PI / 2;
                const px = boss.x + Math.cos(angle) * (boss.size/2 + 10);
                const py = boss.y + Math.sin(angle) * (boss.size/2 + 10);
                ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2); ctx.fill();
            }
            ctx.globalAlpha = 1;
        } else {
            // Normal demon boss appearance
            ctx.fillStyle = '#000'; ctx.fillRect(boss.x - boss.size/2 - 2, boss.y - boss.size/2 - 2, boss.size + 4, boss.size + 4);
            ctx.fillStyle = boss.color; ctx.fillRect(boss.x - boss.size/2, boss.y - boss.size/2, boss.size, boss.size);
            const eyeSize = boss.size / 6;
            ctx.fillStyle = '#fff'; ctx.fillRect(boss.x - boss.size/4, boss.y - boss.size/6, eyeSize, eyeSize); ctx.fillRect(boss.x + boss.size/8, boss.y - boss.size/6, eyeSize, eyeSize);
            ctx.fillStyle = '#000'; ctx.fillRect(boss.x - boss.size/4 + 2, boss.y - boss.size/6 + 2, eyeSize/2, eyeSize/2); ctx.fillRect(boss.x + boss.size/8 + 2, boss.y - boss.size/6 + 2, eyeSize/2, eyeSize/2);
            ctx.fillStyle = boss.color; ctx.fillRect(boss.x - boss.size/2, boss.y - boss.size/2 - 10, 8, 10); ctx.fillRect(boss.x + boss.size/2 - 8, boss.y - boss.size/2 - 10, 8, 10); ctx.fillRect(boss.x - 4, boss.y - boss.size/2 - 15, 8, 15);
        }
    }

    // Sprites - Premium Visuals
    sprites.forEach(sprite => {
        const s = sprite.size;
        
        // Dynamic lighting based on game time
        const pulse = Math.sin(sprite.angle * 2 + gameTime) * 2;
        
        // 1. Soft Outer Glow (Ambient Light)
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = sprite.color;
        ctx.beginPath(); ctx.arc(sprite.x, sprite.y, s + 8 + pulse, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;

        ctx.save();
        ctx.translate(sprite.x, sprite.y);
        ctx.rotate(sprite.angle);

        // 2. Base Shape with Gradient (Volume)
        // Cache gradients per sprite type, size, and color for performance
        const cacheKey = `${sprite.nameKey}_${s}_${sprite.color}`;
        let grad = spriteGradientCache.get(cacheKey);
        if (!grad) {
            grad = ctx.createRadialGradient(0, 0, s/4, 0, 0, s);
            grad.addColorStop(0, '#fff'); // Highlight center
            grad.addColorStop(0.3, sprite.color); // Main body
            grad.addColorStop(1, '#000'); // Dark edge (simulating shading)
            spriteGradientCache.set(cacheKey, grad);
        }
        
        // Define the path first, then fill with gradient
        ctx.beginPath();
        
        // Define shape path based on type
        switch (sprite.nameKey) {
            case 'archer': // Stylized Arrowhead
                ctx.moveTo(0, -s/2 - 4); 
                ctx.lineTo(-s/2 - 2, s/2 + 2); 
                ctx.quadraticCurveTo(0, s/2 - 2, s/2 + 2, s/2 + 2);
                break;
            case 'knight': // Rounded Shield
                ctx.moveTo(-s/2, -s/2);
                ctx.lineTo(s/2, -s/2);
                ctx.lineTo(s/2, 0);
                ctx.bezierCurveTo(s/2, s/2 + 2, -s/2, s/2 + 2, -s/2, 0);
                break;
            case 'mage': // Elegant Diamond
                ctx.moveTo(0, -s/2 - 4); 
                ctx.lineTo(-s/2 - 2, 0); 
                ctx.lineTo(0, s/2 + 4); 
                ctx.lineTo(s/2 + 2, 0);
                break;
            case 'cleric': // Perfect Orb
                ctx.arc(0, 0, s/2 + 1, 0, Math.PI * 2);
                break;
            case 'ninja': // Sharp Shuriken
                for (let i = 0; i < 4; i++) {
                    const a = i * Math.PI / 2;
                    ctx.lineTo(Math.cos(a) * (s/2 + 4), Math.sin(a) * (s/2 + 4));
                    ctx.lineTo(Math.cos(a + Math.PI/4) * (s/4), Math.sin(a + Math.PI/4) * (s/4));
                }
                break;
            case 'wizard': // Wizard Hat / Pentagon
                ctx.moveTo(0, -s/2 - 5); 
                ctx.lineTo(-s/2 - 1, -s/6); 
                ctx.lineTo(-s/3, s/2 + 1); 
                ctx.lineTo(s/3, s/2 + 1); 
                ctx.lineTo(s/2 + 1, -s/6);
                break;
            case 'berserker': // Jagged Axe/Blade
                const sp = s/2 + 2;
                ctx.moveTo(-sp, -sp + 3); ctx.lineTo(-sp + 3, -sp); 
                ctx.lineTo(sp - 3, -sp); ctx.lineTo(sp, -sp + 3);
                ctx.lineTo(sp, sp - 3); ctx.lineTo(sp - 3, sp); 
                ctx.lineTo(-sp + 3, sp); ctx.lineTo(-sp, sp - 3);
                break;
            case 'frost': // Crystal Hex
                for (let i = 0; i < 6; i++) {
                    const a = i * Math.PI / 3 - Math.PI / 6;
                    ctx.lineTo(Math.cos(a) * (s/2 + 3), Math.sin(a) * (s/2 + 3));
                }
                break;
            case 'vampire': // Bat-like Winged Diamond
                ctx.moveTo(0, -s/2 - 2); 
                ctx.lineTo(-s/3, -s/6); 
                ctx.quadraticCurveTo(-s, 0, -s/2 - 3, s/4);
                ctx.lineTo(-s/4, s/3); 
                ctx.lineTo(0, s/2 + 5); 
                ctx.lineTo(s/4, s/3);
                ctx.lineTo(s/2 + 3, s/4); 
                ctx.quadraticCurveTo(s, 0, s/3, -s/6);
                break;
            case 'bomber': // Bomb
                ctx.arc(0, 0, s/2 + 2, 0, Math.PI * 2);
                break;
            default: 
                ctx.rect(-s/2 - 1, -s/2 - 1, s + 2, s + 2);
        }
        ctx.closePath();

        // Fill with gradient for 3D effect
        ctx.fillStyle = grad;
        ctx.fill();

        // 3. Colored Outline (instead of black)
        // We simulate a dark outline by stroking with a semi-transparent dark overlay
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(0,0,0,0.5)'; 
        ctx.stroke();
        
        // 4. Inner Light / Specular Highlight (The "Premium" Shine)
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        // Add a small reflection accent varying by shape
        switch (sprite.nameKey) {
            case 'cleric':
            case 'bomber':
                ctx.arc(-s/4, -s/4, s/5, 0, Math.PI * 2);
                break;
            case 'knight':
                ctx.rect(-s/3, -s/3, s/4, s/4);
                break;
            case 'mage':
            case 'archer':
                 ctx.moveTo(0, -s/2); ctx.lineTo(-s/6, -s/6); ctx.lineTo(0, -s/3); ctx.fill();
                 break;
            default:
                 // Generic shine
                 ctx.arc(-s/4, -s/4, 2, 0, Math.PI * 2);
        }
        ctx.fill();
        ctx.globalAlpha = 1;

        // 5. Specific Details (Symbols inside)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        
        // Add iconic details for each sprite type
        if (sprite.nameKey === 'knight') {
             // Cross on shield
             ctx.fillRect(-1, -s/3, 2, s/1.5);
             ctx.fillRect(-s/3, -1, s/1.5, 2);
        } else if (sprite.nameKey === 'bomber') {
            // Fuse
            ctx.fillStyle = '#333';
            ctx.fillRect(-1, -s/2 - 5, 2, 4);
            ctx.fillStyle = '#f40';
            ctx.beginPath(); ctx.arc(0, -s/2 - 6, 2, 0, Math.PI * 2); ctx.fill();
        } else if (sprite.nameKey === 'cleric') {
            // Plus sign
            ctx.fillStyle = sprite.color; // Inverse color
            ctx.globalCompositeOperation = 'destination-out'; // Cut out
            ctx.fillRect(-1, -s/4, 2, s/2);
            ctx.fillRect(-s/4, -1, s/2, 2);
            ctx.globalCompositeOperation = 'source-over';
        }

        ctx.restore();
        
        // Level Indicator
        if (sprite.level > 1) { 
            ctx.font = '8px "Press Start 2P"'; 
            ctx.textAlign = 'center'; 
            ctx.strokeStyle = '#000'; 
            ctx.lineWidth = 3; 
            ctx.strokeText('Lv' + sprite.level, sprite.x, sprite.y - sprite.size - 4); 
            ctx.fillStyle = '#fff'; 
            ctx.fillText('Lv' + sprite.level, sprite.x, sprite.y - sprite.size - 4); 
        }
    });

    // Player - slightly enhanced visibility
    if (player.invincibleTime === 0 || Math.floor(player.invincibleTime / 4) % 2 === 0) {
        const playerPulse = Math.sin(gameTime * 3) * 2;

        // Outer glow
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(player.x, player.y, player.width + 8 + playerPulse, 0, Math.PI * 2); ctx.fill();

        // Pulsing ring
        ctx.globalAlpha = 0.4 + Math.sin(gameTime * 4) * 0.1;
        ctx.strokeStyle = '#4af';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(player.x, player.y, player.width + 6 + playerPulse, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = 1;

        // Draw player body
        const size = player.width, s = size / 4;
        ctx.fillStyle = '#000'; ctx.fillRect(Math.floor(player.x - size/2 - 1), Math.floor(player.y - size/2 - 1), size + 2, size + 2);
        ctx.fillStyle = player.color; ctx.fillRect(Math.floor(player.x - size/2), Math.floor(player.y - size/2), size, size);
        // Draw eyes offset by facing direction (dramatic shift to edge)
        const eyeOffsetX = player.facingX * 5;
        const eyeOffsetY = player.facingY * 5;
        ctx.fillStyle = '#fff';
        ctx.fillRect(Math.floor(player.x - s + eyeOffsetX), Math.floor(player.y - s + eyeOffsetY), s, s);
        ctx.fillRect(Math.floor(player.x + s/2 + eyeOffsetX), Math.floor(player.y - s + eyeOffsetY), s, s);
    }

    // Debuff aura particles around player
    const activeDebuffs = Object.keys(debuffs).filter(key => debuffs[key] > 0);
    if (activeDebuffs.length > 0) {
        activeDebuffs.forEach((debuffKey, idx) => {
            const color = debuffColors[debuffKey];
            const particleCount = 6;
            for (let i = 0; i < particleCount; i++) {
                const angle = (gameTime * 2 + i * (Math.PI * 2 / particleCount) + idx * 0.5) % (Math.PI * 2);
                const radius = player.width + 8 + Math.sin(gameTime * 4 + i) * 3;
                const px = player.x + Math.cos(angle) * radius;
                const py = player.y + Math.sin(angle) * radius;
                ctx.globalAlpha = 0.6 + Math.sin(gameTime * 5 + i) * 0.3;
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(px, py, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        ctx.globalAlpha = 1;
    }

    if (currentSkill) {
        ctx.font = 'bold 10px Arial, sans-serif'; ctx.textAlign = 'center';
        ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.strokeText(t(currentSkill.name), player.x, player.y - player.height - 5);
        ctx.fillStyle = currentSkill.color; ctx.fillText(t(currentSkill.name), player.x, player.y - player.height - 5);
    }
    // Autopilot indicator - top-left corner, white when ON, grey when OFF
    ctx.globalAlpha = autopilot ? 1 : 0.5;
    ctx.font = 'bold 20px system-ui, sans-serif'; ctx.textAlign = 'left';
    
    // Determine input label
    let inputLabel = 'TAB';
    if (typeof currentInputMode !== 'undefined' && currentInputMode === 'gp') {
        inputLabel = '[R1]';
    }
    
    const autopilotText = inputLabel + ' ' + t('instructAutopilot');
    ctx.strokeStyle = '#000'; ctx.lineWidth = 3; ctx.strokeText(autopilotText, 10, 25);
    ctx.fillStyle = autopilot ? '#fff' : '#888'; ctx.fillText(autopilotText, 10, 25);
    ctx.globalAlpha = 1;

    // Score display - top-right corner
    ctx.font = 'bold 20px system-ui, sans-serif'; ctx.textAlign = 'right';
    const scoreText = t('score') + ': ' + displayScore;
    ctx.strokeStyle = '#000'; ctx.lineWidth = 3; ctx.strokeText(scoreText, canvas.width - 10, 25);
    ctx.fillStyle = '#fff'; ctx.fillText(scoreText, canvas.width - 10, 25);

    // AUTO text below player when autopilot is on
    if (autopilot) {
        ctx.globalAlpha = 0.6 + Math.sin(gameTime * 8) * 0.4;
        ctx.font = '7px "Press Start 2P"'; ctx.textAlign = 'center';
        ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.strokeText('AUTO', player.x, player.y + player.height + 12);
        ctx.fillStyle = '#fff'; ctx.fillText('AUTO', player.x, player.y + player.height + 12);
        ctx.globalAlpha = 1;
    }

    // Heroes - unique appearance per type (semi-transparent)
    heroes.forEach(hero => {
        const s = hero.size;
        const pulse = Math.sin(gameTime * 4) * 2;

        // Purple glowing aura (reduced)
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = '#a0f';
        ctx.beginPath(); ctx.arc(hero.x, hero.y, s + 8 + pulse, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 0.2;
        ctx.strokeStyle = hero.color;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(hero.x, hero.y, s + 5 + pulse, 0, Math.PI * 2); ctx.stroke();

        // Draw unique shape per hero type (50% opacity)
        ctx.globalAlpha = 0.5;
        ctx.save();
        ctx.translate(hero.x, hero.y);

        switch (hero.type.id) {
            case 'laser':
                // Triangle/arrow shape (laser cannon)
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.moveTo(0, -s/2 - 2);
                ctx.lineTo(-s/2 - 2, s/2 + 2);
                ctx.lineTo(s/2 + 2, s/2 + 2);
                ctx.closePath(); ctx.fill();
                ctx.fillStyle = hero.color;
                ctx.beginPath();
                ctx.moveTo(0, -s/2);
                ctx.lineTo(-s/2, s/2);
                ctx.lineTo(s/2, s/2);
                ctx.closePath(); ctx.fill();
                // Cannon detail
                ctx.fillStyle = '#fff';
                ctx.fillRect(-2, -s/3, 4, s/3);
                break;

            case 'warrior':
                // Square with sword
                ctx.fillStyle = '#000';
                ctx.fillRect(-s/2 - 1, -s/2 - 1, s + 2, s + 2);
                ctx.fillStyle = hero.color;
                ctx.fillRect(-s/2, -s/2, s, s);
                // Sword detail
                ctx.fillStyle = '#fff';
                ctx.fillRect(-1, -s/2 - 6, 2, s + 6);
                ctx.fillRect(-4, -s/2 + 2, 8, 3);
                break;

            case 'angel':
                // Circle with wings
                ctx.fillStyle = '#000';
                ctx.beginPath(); ctx.arc(0, 0, s/2 + 2, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = hero.color;
                ctx.beginPath(); ctx.arc(0, 0, s/2, 0, Math.PI * 2); ctx.fill();
                // Wings
                ctx.fillStyle = '#fff';
                ctx.globalAlpha = 0.8;
                ctx.beginPath();
                ctx.moveTo(-s/2, 0);
                ctx.lineTo(-s - 5, -s/3);
                ctx.lineTo(-s - 5, s/3);
                ctx.closePath(); ctx.fill();
                ctx.beginPath();
                ctx.moveTo(s/2, 0);
                ctx.lineTo(s + 5, -s/3);
                ctx.lineTo(s + 5, s/3);
                ctx.closePath(); ctx.fill();
                ctx.globalAlpha = 1;
                // Halo
                ctx.strokeStyle = '#ff0';
                ctx.lineWidth = 2;
                ctx.beginPath(); ctx.arc(0, -s/2 - 4, 6, 0, Math.PI * 2); ctx.stroke();
                break;

            case 'bouncer':
                // Diamond shape
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.moveTo(0, -s/2 - 2);
                ctx.lineTo(-s/2 - 2, 0);
                ctx.lineTo(0, s/2 + 2);
                ctx.lineTo(s/2 + 2, 0);
                ctx.closePath(); ctx.fill();
                ctx.fillStyle = hero.color;
                ctx.beginPath();
                ctx.moveTo(0, -s/2);
                ctx.lineTo(-s/2, 0);
                ctx.lineTo(0, s/2);
                ctx.lineTo(s/2, 0);
                ctx.closePath(); ctx.fill();
                // Ball detail in center
                ctx.fillStyle = '#fff';
                ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill();
                break;
        }

        ctx.restore();
        ctx.globalAlpha = 1;

        // Hero name label (also semi-transparent)
        ctx.globalAlpha = 0.6;
        ctx.font = 'bold 10px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeText(t(hero.type.nameKey), hero.x, hero.y - hero.size - 5);
        ctx.fillStyle = hero.color;
        ctx.fillText(t(hero.type.nameKey), hero.x, hero.y - hero.size - 5);
        ctx.globalAlpha = 1;
    });

    // Hero bouncing balls (more transparent)
    heroBalls.forEach(ball => {
        ctx.globalAlpha = 0.25;
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.size + 2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = ball.color;
        ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2); ctx.fill();
        // Trail effect
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = ball.color;
        ctx.beginPath(); ctx.arc(ball.x - ball.vx * 2, ball.y - ball.vy * 2, ball.size * 0.7, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
    });

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
            case 'gravity':
                ctx.strokeStyle = '#448'; ctx.lineWidth = 2; ctx.globalAlpha = alpha * 0.5;
                for (let r = 50; r <= effect.radius; r += 30) {
                    ctx.beginPath(); ctx.arc(effect.x, effect.y, r, 0, Math.PI * 2); ctx.stroke();
                }
                ctx.globalAlpha = 1; break;
            case 'heroLaser':
                // Wide laser beam
                ctx.strokeStyle = effect.color;
                ctx.lineWidth = effect.width * alpha;
                ctx.globalAlpha = alpha * 0.8;
                ctx.beginPath();
                ctx.moveTo(effect.x, effect.y);
                ctx.lineTo(effect.x2, effect.y2);
                ctx.stroke();
                // Core bright line
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 4 * alpha;
                ctx.beginPath();
                ctx.moveTo(effect.x, effect.y);
                ctx.lineTo(effect.x2, effect.y2);
                ctx.stroke();
                ctx.globalAlpha = 1; break;
            case 'heroCone':
                // Cone/slash attack
                ctx.fillStyle = effect.color;
                ctx.globalAlpha = alpha * 0.5;
                ctx.beginPath();
                ctx.moveTo(effect.x, effect.y);
                ctx.arc(effect.x, effect.y, effect.radius, effect.angle - effect.coneAngle/2, effect.angle + effect.coneAngle/2);
                ctx.closePath();
                ctx.fill();
                ctx.strokeStyle = effect.color;
                ctx.lineWidth = 3;
                ctx.globalAlpha = alpha;
                ctx.stroke();
                ctx.globalAlpha = 1; break;
            case 'heroAngel':
                // Expanding holy ring
                ctx.strokeStyle = effect.color;
                ctx.lineWidth = 4;
                ctx.globalAlpha = alpha * 0.6;
                ctx.beginPath();
                ctx.arc(effect.x, effect.y, effect.radius * (1 - alpha * 0.3), 0, Math.PI * 2);
                ctx.stroke();
                // Inner glow
                ctx.fillStyle = '#fff';
                ctx.globalAlpha = alpha * 0.2;
                ctx.beginPath();
                ctx.arc(effect.x, effect.y, effect.radius * 0.6, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1; break;
        }
    });

    // Boss-specific visuals
    if (boss) {
        // Void Emperor shield
        if (boss.shield > 0) {
            ctx.strokeStyle = '#888'; ctx.lineWidth = 4;
            ctx.globalAlpha = 0.7;
            ctx.beginPath(); ctx.arc(boss.x, boss.y, boss.size + 15, 0, Math.PI * 2); ctx.stroke();
            ctx.globalAlpha = 1;
        }
        // Death Titan aura
        if (boss.bossNum === 4) {
            ctx.fillStyle = '#f842'; ctx.globalAlpha = 0.15;
            ctx.beginPath(); ctx.arc(boss.x, boss.y, 150, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#f84'; ctx.lineWidth = 2; ctx.globalAlpha = 0.4;
            ctx.beginPath(); ctx.arc(boss.x, boss.y, 150, 0, Math.PI * 2); ctx.stroke();
            ctx.globalAlpha = 1;
        }
        // Demon Lord rage indicator
        if (boss.bossNum === 1 && boss.rageMode) {
            ctx.strokeStyle = '#f80'; ctx.lineWidth = 3; ctx.globalAlpha = 0.5 + Math.sin(Date.now() * 0.01) * 0.3;
            ctx.beginPath(); ctx.arc(boss.x, boss.y, boss.size + 10, 0, Math.PI * 2); ctx.stroke();
            ctx.globalAlpha = 1;
        }
        // Frost slow effect
        if (boss.slowed > 0) {
            ctx.fillStyle = '#8ef4'; ctx.globalAlpha = 0.3 + Math.sin(Date.now() * 0.008) * 0.1;
            ctx.beginPath(); ctx.arc(boss.x, boss.y, boss.size + 25, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#4ff'; ctx.lineWidth = 2; ctx.globalAlpha = 0.6;
            ctx.beginPath(); ctx.arc(boss.x, boss.y, boss.size + 25, 0, Math.PI * 2); ctx.stroke();
            ctx.globalAlpha = 1;
        }
    }

    // Debuff screen edge vignette
    const activeDebuffsList = Object.keys(debuffs).filter(key => debuffs[key] > 0);
    if (activeDebuffsList.length > 0) {
        const vignetteSize = 60;
        const pulse = 0.15 + Math.sin(gameTime * 4) * 0.05;

        activeDebuffsList.forEach((debuffKey, idx) => {
            const color = debuffColors[debuffKey];
            ctx.globalAlpha = pulse;

            // Create edge gradients for each side
            // Top edge
            const topGrad = ctx.createLinearGradient(0, 0, 0, vignetteSize);
            topGrad.addColorStop(0, color);
            topGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = topGrad;
            ctx.fillRect(0, 0, canvas.width, vignetteSize);

            // Bottom edge
            const bottomGrad = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - vignetteSize);
            bottomGrad.addColorStop(0, color);
            bottomGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = bottomGrad;
            ctx.fillRect(0, canvas.height - vignetteSize, canvas.width, vignetteSize);

            // Left edge
            const leftGrad = ctx.createLinearGradient(0, 0, vignetteSize, 0);
            leftGrad.addColorStop(0, color);
            leftGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = leftGrad;
            ctx.fillRect(0, 0, vignetteSize, canvas.height);

            // Right edge
            const rightGrad = ctx.createLinearGradient(canvas.width, 0, canvas.width - vignetteSize, 0);
            rightGrad.addColorStop(0, color);
            rightGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = rightGrad;
            ctx.fillRect(canvas.width - vignetteSize, 0, vignetteSize, canvas.height);
        });

        ctx.globalAlpha = 1;
    }
}
