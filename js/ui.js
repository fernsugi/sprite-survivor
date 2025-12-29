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
