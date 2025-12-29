// UI System

function updateUI() {
    const hpPercent = player.hp / player.maxHp * 100;
    document.getElementById('healthFill').style.width = hpPercent + '%';
    // Overheal bar overlays on top of HP bar (grey shield in front of green HP)
    const overhealPercent = player.overHeal / player.maxHp * 100;
    document.getElementById('overhealFill').style.width = overhealPercent + '%';
    document.getElementById('pointsDisplay').textContent = points;
    document.getElementById('pointsFill').style.width = Math.min(100, (points / POINTS_FOR_SPRITE * 100)) + '%';
    document.getElementById('spriteCount').textContent = sprites.length;
    // Show storyWave in story mode, wave in survival mode
    document.getElementById('waveNumber').textContent = storyMode ? storyWave : wave;
    // In story mode, show wave progress; in survival mode, show timer
    if (storyMode) {
        document.getElementById('waveTimer').textContent = bossActive ? t('bossBattle') : `${storyWave}/5`;
    } else {
        document.getElementById('waveTimer').textContent = bossActive ? t('bossBattle') : `${t('nextWave')}: ${Math.ceil(WAVE_DURATION - waveTimer)}s`;
    }
    document.getElementById('gameTimer').textContent = formatTime(gameTime);
    if (boss) document.getElementById('bossHealthFill').style.width = (boss.hp / boss.maxHp * 100) + '%';
    updateSpriteButtons();
}

// High Score System
function loadHighScore() {
    const saved = localStorage.getItem('spriteSurvivorHighScore');
    return saved ? parseInt(saved, 10) : 0;
}

function saveHighScore(newScore) {
    const current = loadHighScore();
    if (newScore > current) {
        localStorage.setItem('spriteSurvivorHighScore', newScore.toString());
        return true; // New high score!
    }
    return false;
}

function updateHighScoreDisplay() {
    const highScore = loadHighScore();
    const display = document.getElementById('highScoreDisplay');
    if (highScore > 0) {
        display.style.display = 'block';
        document.getElementById('highScore').textContent = highScore;
    } else {
        display.style.display = 'none';
    }
}
// Adaptive Control Guide
let currentInputMode = 'kb'; // 'kb' or 'gp'

function setInputControlMode(mode) {
    if (currentInputMode === mode) return;
    currentInputMode = mode;
    
    // Only update if start screen or relevant UI is visible
    const startScreen = document.getElementById('startScreen');
    if (!startScreen || startScreen.style.display === 'none') {
        // We might want to update skill hint in game too [SPACE] vs [A]
        updateSkillHint(mode);
        updateSpriteKeyHints(mode); // Also update sprite buttons in game
        return; 
    }
    
    // If start screen is visible, we still update sprite hints if they exist (though usually hidden on start)
    updateSpriteKeyHints(mode);
    
    if (mode === 'gp') {
        document.getElementById('keyMove').textContent = t('instructMoveGP');
        document.getElementById('keySummon').textContent = t('instructSummonGP');
        document.getElementById('keySkill').textContent = t('instructSkillGP');
        document.getElementById('keyAuto').textContent = t('instructAutopilotGP');
        document.getElementById('keyPause').textContent = t('instructPauseGP');
    } else {
        document.getElementById('keyMove').textContent = "WASD / Arrow Keys";
        document.getElementById('keySummon').textContent = "1-0 / ZXCVBNM,./";
        document.getElementById('keySkill').textContent = "SPACE";
        document.getElementById('keyAuto').textContent = "TAB";
        document.getElementById('keyPause').textContent = "ESC";
    }
}

function updateSkillHint(mode) {
    const hint = document.getElementById('skillHint');
    if (!hint) return;
    
    if (mode === 'gp') {
        hint.textContent = t('instructSkillGP'); // reuse short key name
    } else {
        hint.textContent = "[SPACE]";
    }
}

function updateSpriteKeyHints(mode) {
    const ids = ['sprite-key-0', 'sprite-key-1', 'sprite-key-2', 'sprite-key-3', 'sprite-key-4', 
                 'sprite-key-5', 'sprite-key-6', 'sprite-key-7', 'sprite-key-8', 'sprite-key-9'];
                 
    // Keyboard keys (Default)
    const altKeys = ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/'];
    
    // Gamepad keys (Based on gamepad.js logic)
    // 0: Archer (RS), 1: Knight (Square), 2: Mage (Circle), 3: Cleric (Triangle)
    // 4: Ninja (R1+RS), 5: Wizard (R1+Circle), 6: Berserker (R1+Square), 7: Frost (R1+Triangle)
    // 8: Vampire (L2), 9: Bomber (R2)
    // Using Unicode shapes for buttons: □ (Square), ○ (Circle), △ (Triangle), ✕ (Cross - used for skill)
    // RS = Right Stick
    const gpKeys = [
        '[RS]',         // Archer
        '[<span class="gp-icon square"></span>]',          // Knight
        '[<span class="gp-icon circle"></span>]',          // Mage
        '[<span class="gp-icon triangle"></span>]',          // Cleric
        '[R1+RS]',      // Ninja
        '[R1+<span class="gp-icon circle"></span>]',       // Wizard
        '[R1+<span class="gp-icon square"></span>]',       // Berserker
        '[R1+<span class="gp-icon triangle"></span>]',       // Frost
        '[L2]',         // Vampire
        '[R2]'          // Bomber
    ];

    ids.forEach((id, index) => {
        const span = document.getElementById(id);
        if (span) {
            if (mode === 'gp') {
                span.innerHTML = gpKeys[index]; // Use innerHTML for inline styles
                // Make font slightly smaller for long combos to prevent break
                if (gpKeys[index].length > 15) { // Adjusted length check for HTML string
                     span.style.fontSize = '0.8em';
                     span.style.letterSpacing = '-1px';
                } else {
                    span.style.fontSize = '';
                    span.style.letterSpacing = '';
                }
            } else {
                const numKey = index === 9 ? '0' : (index + 1).toString();
                span.innerHTML = `[${numKey}/${altKeys[index]}]`; // Use innerHTML
                span.style.fontSize = '';
                span.style.letterSpacing = '';
            }
        }
    });
}
