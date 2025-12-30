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

    // Update dialogue hint
    const dialogueHint = document.querySelector('.dialogue-hint');
    if (dialogueHint) {
        const key = mode === 'gp' ? 'dialogueHintGamepad' : 'dialogueHint';
        dialogueHint.setAttribute('data-i18n', key);
        // Only update text if t() is available
        if (typeof t === 'function') {
            dialogueHint.textContent = t(key);
        }
    }

    // Update language hint visibility
    const langHint = document.getElementById('langHint');
    if (langHint) {
        langHint.style.display = (mode === 'gp') ? 'block' : 'none';
    }

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
        document.getElementById('keyMove').textContent = "L-Stick";
        document.getElementById('keySummon').textContent = t('instructSummonGP');
        document.getElementById('keySkill').textContent = "X / A ";
        document.getElementById('keyAuto').textContent = "L1 / LB";
        document.getElementById('keyPause').textContent = "Options / Start";
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
        hint.textContent = "X / A "
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
    const gpKeyConfigs = [
        { parts: ['[RS]'] },                                         // Archer
        { parts: ['[', { iconClass: 'square' }, ']'] },              // Knight
        { parts: ['[', { iconClass: 'circle' }, ']'] },              // Mage
        { parts: ['[', { iconClass: 'triangle' }, ']'] },            // Cleric
        { parts: ['[R1+RS]'] },                                      // Ninja
        { parts: ['[R1+', { iconClass: 'circle' }, ']'] },           // Wizard
        { parts: ['[R1+', { iconClass: 'square' }, ']'] },           // Berserker
        { parts: ['[R1+', { iconClass: 'triangle' }, ']'] },         // Frost
        { parts: ['[L2]'] },                                         // Vampire
        { parts: ['[R2]'] }                                          // Bomber
    ];

    ids.forEach((id, index) => {
        const span = document.getElementById(id);
        if (span) {
            if (mode === 'gp') {
                const config = gpKeyConfigs[index];
                if (config) {
                    // Clear existing content safely
                    span.replaceChildren();
                    // Build content from config parts
                    let textLength = 0;
                    config.parts.forEach(part => {
                        if (typeof part === 'string') {
                            span.appendChild(document.createTextNode(part));
                            textLength += part.length;
                        } else if (part && part.iconClass) {
                            const iconSpan = document.createElement('span');
                            iconSpan.className = 'gp-icon ' + part.iconClass;
                            span.appendChild(iconSpan);
                            // Count icon as approximately 2 characters for sizing logic
                            textLength += 2;
                        }
                    });
                    // Make font slightly smaller for long combos to prevent break
                    if (textLength > 6) {
                        span.style.fontSize = '0.8em';
                        span.style.letterSpacing = '-1px';
                    } else {
                        span.style.fontSize = '';
                        span.style.letterSpacing = '';
                    }
                }
            } else {
                const numKey = index === 9 ? '0' : (index + 1).toString();
                span.textContent = `[${numKey}/${altKeys[index]}]`;
                span.style.fontSize = '';
                span.style.letterSpacing = '';
            }
        }
    });
}
