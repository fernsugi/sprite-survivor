// Achievement System

// Store newly unlocked achievements for language refresh
let lastUnlockedAchievements = [];

// Load achievements from localStorage
function loadAchievements() {
    try {
        const saved = localStorage.getItem('spriteAchievements');
        return saved ? JSON.parse(saved) : {};
    } catch (e) {
        return {};
    }
}

// Save achievements to localStorage
function saveAchievements(achievements) {
    try {
        localStorage.setItem('spriteAchievements', JSON.stringify(achievements));
    } catch (e) {
        console.warn('Could not save achievements');
    }
}

// Check and grant achievements on victory
function checkAchievements() {
    const achievements = loadAchievements();
    const newlyUnlocked = [];

    // First Victory
    if (!achievements.firstWin) {
        achievements.firstWin = true;
        newlyUnlocked.push('firstWin');
    }

    // Only X sprite achievements (check if only one type was used)
    if (usedSpriteTypes.size === 1) {
        const spriteIndex = [...usedSpriteTypes][0];
        const spriteName = spriteTypes[spriteIndex].nameKey;
        const achvId = 'only' + spriteName.charAt(0).toUpperCase() + spriteName.slice(1);
        if (!achievements[achvId]) {
            achievements[achvId] = true;
            newlyUnlocked.push(achvId);
        }
    }

    // All Sprites achievement (check if all 10 types were used)
    if (usedSpriteTypes.size === 10) {
        if (!achievements.allSprites) {
            achievements.allSprites = true;
            newlyUnlocked.push('allSprites');
        }
    }

    // Speedrun achievement (under 10 minutes = 600 seconds)
    if (gameTime < 600) {
        if (!achievements.speedrun) {
            achievements.speedrun = true;
            newlyUnlocked.push('speedrun');
        }
    }

    // No Hit achievement
    if (!gotHit) {
        if (!achievements.noHit) {
            achievements.noHit = true;
            newlyUnlocked.push('noHit');
        }
    }

    // First Hero achievement
    if (heroSummoned) {
        if (!achievements.firstHero) {
            achievements.firstHero = true;
            newlyUnlocked.push('firstHero');
        }
    }

    // No Sprites achievement (win without summoning any sprites)
    if (usedSpriteTypes.size === 0) {
        if (!achievements.noSprites) {
            achievements.noSprites = true;
            newlyUnlocked.push('noSprites');
        }
    }

    saveAchievements(achievements);
    return newlyUnlocked;
}

// Get achievement display name
function getAchievementName(achvDef) {
    if (achvDef.isSpriteOnly) {
        return t(achvDef.nameKey); // Just sprite name
    }
    return t(achvDef.nameKey);
}

// Get achievement description
function getAchievementDesc(achvDef) {
    if (achvDef.isSpriteOnly) {
        return t('achvOnlySpriteDesc') + ' ' + t(achvDef.nameKey);
    }
    return t(achvDef.descKey);
}

// Refresh achievements list content (called on language change)
function refreshAchievementsList() {
    const list = document.getElementById('achievementsList');
    if (!list) return;

    const achievements = loadAchievements();
    list.innerHTML = '';

    achievementDefs.forEach(achvDef => {
        const unlocked = achievements[achvDef.id];
        const div = document.createElement('div');
        div.className = 'achv-item' + (unlocked ? ' unlocked' : ' locked');

        const name = getAchievementName(achvDef);
        const desc = getAchievementDesc(achvDef);

        div.innerHTML = `
            <span class="achv-icon">${unlocked ? '★' : '☆'}</span>
            <span class="achv-name">${name}</span>
            <span class="achv-desc">${desc}</span>
        `;
        list.appendChild(div);
    });
}

// Show achievements modal
function showAchievements() {
    playSound('select');
    refreshAchievementsList();
    document.getElementById('achievementsModal').style.display = 'flex';
}

// Hide achievements modal
function hideAchievements() {
    playSound('select');
    document.getElementById('achievementsModal').style.display = 'none';
}

// Display newly unlocked achievements on victory screen
function displayVictoryAchievements(newlyUnlocked) {
    lastUnlockedAchievements = newlyUnlocked; // Store for language refresh
    refreshVictoryAchievements();
}

// Refresh victory achievements display (called on language change)
function refreshVictoryAchievements() {
    const container = document.getElementById('victoryAchievements');
    if (!container) return;
    if (lastUnlockedAchievements.length === 0) {
        container.innerHTML = '';
        return;
    }

    let html = `<div class="victory-achv-header">${t('achvUnlocked')}</div>`;
    lastUnlockedAchievements.forEach(achvId => {
        const achvDef = achievementDefs.find(a => a.id === achvId);
        if (achvDef) {
            const name = getAchievementName(achvDef);
            html += `<div class="victory-achv-item">★ ${name}</div>`;
        }
    });
    container.innerHTML = html;
}
