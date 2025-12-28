// UI System

function updateUI() {
    document.getElementById('healthFill').style.width = (player.hp / player.maxHp * 100) + '%';
    document.getElementById('pointsDisplay').textContent = points;
    document.getElementById('pointsFill').style.width = Math.min(100, (points / POINTS_FOR_SPRITE * 100)) + '%';
    document.getElementById('spriteCount').textContent = sprites.length;
    document.getElementById('waveNumber').textContent = wave;
    document.getElementById('waveTimer').textContent = bossActive ? t('bossBattle') : `${t('nextWave')}: ${Math.ceil(WAVE_DURATION - waveTimer)}s`;
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
