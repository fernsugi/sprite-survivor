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
