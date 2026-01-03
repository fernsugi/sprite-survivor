// ============================================================
// STREAMER MODE - Full Autopilot with Learning AI
// ============================================================
// This AI learns from past games to improve sprite selection
// and strategy over time. Data is persisted in localStorage.

const STREAMER_STORAGE_KEY = 'spriteSurvivorStreamerAI';
const MAX_RECENT_GAMES = 50; // Keep last N games for pattern analysis

// ===== LEARNING DATA STRUCTURE =====
let streamerLearning = {
    version: 1,
    gamesPlayed: 0,
    wins: 0,
    totalWavesReached: 0,
    // Per-sprite statistics
    spriteStats: {
        // typeIndex: {
        //   summoned: N,
        //   gamesUsed: N,
        //   totalWaves: N,
        //   winsWithSprite: N,
        //   bossKillsWithSprite: N
        // }
    },
    // Boss encounter data
    bossStats: {
        // bossNum: {
        //   encounters: N,
        //   kills: N,
        //   spritesPresent: { typeIndex: count }
        // }
    },
    // Recent game history for pattern analysis
    recentGames: [
        // {
        //   sprites: [typeIndices used],
        //   spriteCounts: {typeIndex: count},
        //   waveReached: N,
        //   won: bool,
        //   bossesDefeated: N,
        //   timeAlive: N
        // }
    ]
};

// Current game tracking
let currentGameData = {
    spritesUsed: new Set(),
    spriteCounts: {},
    bossesDefeated: 0,
    startTime: 0
};

// ===== PERSISTENCE =====

function loadStreamerLearning() {
    try {
        const saved = localStorage.getItem(STREAMER_STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            // Merge with defaults to handle new fields
            streamerLearning = { ...streamerLearning, ...parsed };
            console.log('[StreamerAI] Loaded learning data:',
                streamerLearning.gamesPlayed, 'games,',
                streamerLearning.wins, 'wins');
        }
    } catch (e) {
        console.error('[StreamerAI] Failed to load learning data:', e);
    }
}

function saveStreamerLearning() {
    try {
        // Trim recent games to max size
        if (streamerLearning.recentGames.length > MAX_RECENT_GAMES) {
            streamerLearning.recentGames = streamerLearning.recentGames.slice(-MAX_RECENT_GAMES);
        }
        localStorage.setItem(STREAMER_STORAGE_KEY, JSON.stringify(streamerLearning));
    } catch (e) {
        console.error('[StreamerAI] Failed to save learning data:', e);
    }
}

function resetStreamerLearning() {
    streamerLearning = {
        version: 1,
        gamesPlayed: 0,
        wins: 0,
        totalWavesReached: 0,
        spriteStats: {},
        bossStats: {},
        recentGames: []
    };
    saveStreamerLearning();
    console.log('[StreamerAI] Learning data reset');
}

// ===== GAME TRACKING =====

function streamerRecordGameStart() {
    currentGameData = {
        spritesUsed: new Set(),
        spriteCounts: {},
        bossesDefeated: 0,
        startTime: Date.now(),
        isCheatMode: cheatMode // Track if this is a cheat mode game
    };
}

function streamerRecordSpriteSummoned(typeIndex) {
    currentGameData.spritesUsed.add(typeIndex);
    currentGameData.spriteCounts[typeIndex] = (currentGameData.spriteCounts[typeIndex] || 0) + 1;

    // Update global sprite stats
    if (!streamerLearning.spriteStats[typeIndex]) {
        streamerLearning.spriteStats[typeIndex] = {
            summoned: 0,
            gamesUsed: 0,
            totalWaves: 0,
            winsWithSprite: 0,
            bossKillsWithSprite: 0
        };
    }
    streamerLearning.spriteStats[typeIndex].summoned++;
}

function streamerRecordBossDefeated(bossNum) {
    currentGameData.bossesDefeated++;

    // Initialize boss stats if needed
    if (!streamerLearning.bossStats[bossNum]) {
        streamerLearning.bossStats[bossNum] = {
            encounters: 0,
            kills: 0,
            spritesPresent: {}
        };
    }

    streamerLearning.bossStats[bossNum].kills++;

    // Record which sprites were present during this boss kill
    currentGameData.spritesUsed.forEach(typeIndex => {
        const bs = streamerLearning.bossStats[bossNum].spritesPresent;
        bs[typeIndex] = (bs[typeIndex] || 0) + 1;

        // Also update sprite's boss kill stat
        if (streamerLearning.spriteStats[typeIndex]) {
            streamerLearning.spriteStats[typeIndex].bossKillsWithSprite++;
        }
    });
}

function streamerRecordBossEncounter(bossNum) {
    if (!streamerLearning.bossStats[bossNum]) {
        streamerLearning.bossStats[bossNum] = {
            encounters: 0,
            kills: 0,
            spritesPresent: {}
        };
    }
    streamerLearning.bossStats[bossNum].encounters++;
}

function streamerRecordGameEnd(won, waveReached) {
    // Don't record cheat mode games - they would skew the learning data
    if (currentGameData.isCheatMode) {
        console.log('[StreamerAI] Cheat mode game not recorded for learning');
        return;
    }

    streamerLearning.gamesPlayed++;
    streamerLearning.totalWavesReached += waveReached;
    if (won) streamerLearning.wins++;

    // Update per-sprite statistics
    currentGameData.spritesUsed.forEach(typeIndex => {
        const stats = streamerLearning.spriteStats[typeIndex];
        if (stats) {
            stats.gamesUsed++;
            stats.totalWaves += waveReached;
            if (won) stats.winsWithSprite++;
        }
    });

    // Record this game in recent history
    streamerLearning.recentGames.push({
        sprites: Array.from(currentGameData.spritesUsed),
        spriteCounts: { ...currentGameData.spriteCounts },
        waveReached: waveReached,
        won: won,
        bossesDefeated: currentGameData.bossesDefeated,
        timeAlive: (Date.now() - currentGameData.startTime) / 1000
    });

    saveStreamerLearning();

    console.log('[StreamerAI] Game recorded:',
        won ? 'WIN' : 'LOSS',
        'Wave:', waveReached,
        'Sprites:', Array.from(currentGameData.spritesUsed).map(i => spriteTypes[i]?.nameKey).join(', '));
}

// ===== LEARNING ANALYSIS =====

function getSpritePerformanceScore(typeIndex) {
    // Returns a performance multiplier based on historical data
    // Range: 0.5 (bad) to 2.0 (excellent)

    const stats = streamerLearning.spriteStats[typeIndex];
    if (!stats || stats.gamesUsed < 3) {
        // Not enough data, return neutral with slight exploration bonus
        return 1.0 + Math.random() * 0.2;
    }

    const avgWave = stats.totalWaves / stats.gamesUsed;
    const globalAvgWave = streamerLearning.gamesPlayed > 0
        ? streamerLearning.totalWavesReached / streamerLearning.gamesPlayed
        : 10;

    // Compare this sprite's performance to global average
    const waveRatio = avgWave / Math.max(1, globalAvgWave);

    // Win rate with this sprite vs global win rate
    const spriteWinRate = stats.winsWithSprite / stats.gamesUsed;
    const globalWinRate = streamerLearning.gamesPlayed > 0
        ? streamerLearning.wins / streamerLearning.gamesPlayed
        : 0.1;
    const winRatio = globalWinRate > 0 ? spriteWinRate / globalWinRate : 1;

    // Boss effectiveness
    const bossBonus = stats.bossKillsWithSprite > 0
        ? Math.min(0.3, stats.bossKillsWithSprite * 0.05)
        : 0;

    // Combine factors: wave performance (50%), win rate (40%), boss kills (10%)
    let score = (waveRatio * 0.5) + (winRatio * 0.4) + (1 + bossBonus) * 0.1;

    // Clamp to reasonable range
    score = Math.max(0.5, Math.min(2.0, score));

    return score;
}

function getBestSpritesForBoss(bossNum) {
    // Returns array of sprite indices that historically help with this boss
    const bossData = streamerLearning.bossStats[bossNum];
    if (!bossData || bossData.kills < 2) {
        // Not enough data, return default recommendations
        return [1, 5, 6, 7]; // Knight, Wizard, Berserker, Frost
    }

    // Sort sprites by their presence in boss kills
    const spriteScores = [];
    for (const typeIndex in bossData.spritesPresent) {
        const presenceRate = bossData.spritesPresent[typeIndex] / bossData.kills;
        spriteScores.push({
            idx: parseInt(typeIndex),
            score: presenceRate
        });
    }

    spriteScores.sort((a, b) => b.score - a.score);
    return spriteScores.slice(0, 5).map(s => s.idx);
}

function analyzeRecentFailures() {
    // Look at recent losses to identify patterns
    const recentLosses = streamerLearning.recentGames
        .filter(g => !g.won)
        .slice(-10);

    if (recentLosses.length < 3) return null;

    // Find sprites that were commonly missing in losses
    const allSpriteTypes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const missingInLosses = {};

    recentLosses.forEach(game => {
        allSpriteTypes.forEach(idx => {
            if (!game.sprites.includes(idx)) {
                missingInLosses[idx] = (missingInLosses[idx] || 0) + 1;
            }
        });
    });

    // Sprites missing in >70% of recent losses might be important
    const potentiallyImportant = [];
    for (const idx in missingInLosses) {
        if (missingInLosses[idx] / recentLosses.length > 0.7) {
            potentiallyImportant.push(parseInt(idx));
        }
    }

    return potentiallyImportant;
}

function getRecentWinStrategies() {
    // Analyze recent wins to find successful patterns
    const recentWins = streamerLearning.recentGames
        .filter(g => g.won)
        .slice(-10);

    if (recentWins.length < 2) return null;

    // Find sprites commonly present in wins
    const spriteFrequency = {};
    recentWins.forEach(game => {
        game.sprites.forEach(idx => {
            spriteFrequency[idx] = (spriteFrequency[idx] || 0) + 1;
        });
    });

    // Sprites in >60% of recent wins
    const winningSprites = [];
    for (const idx in spriteFrequency) {
        if (spriteFrequency[idx] / recentWins.length > 0.6) {
            winningSprites.push({
                idx: parseInt(idx),
                frequency: spriteFrequency[idx] / recentWins.length
            });
        }
    }

    return winningSprites.sort((a, b) => b.frequency - a.frequency);
}

// ===== STREAMER MODE FUNCTIONS =====

function toggleStreamerMode() {
    streamerMode = !streamerMode;
    const btn = document.getElementById('streamerModeBtn');

    if (streamerMode) {
        btn.classList.add('active');
        btn.textContent = t('streamerModeActive');
        // Load learning data
        loadStreamerLearning();
        // If game not started, start it
        if (!gameStarted) {
            startStreamerGame();
        } else {
            // Enable autopilot if game is running
            autopilot = true;
            streamerRecordGameStart();
        }
    } else {
        btn.classList.remove('active');
        btn.textContent = t('streamerMode');
        // Reset streamer timers
        streamerAutoRestartTimer = 0;
        streamerSummonTimer = 0;
    }
}

function startStreamerGame() {
    startGame(false); // Start survival mode without cheats
    autopilot = true;
    // Small delay before first summon to feel more human
    streamerSummonTimer = 60 + Math.floor(Math.random() * 60);
    streamerLastSummonTime = 0;
    // Start tracking this game
    streamerRecordGameStart();
}

// Intelligent AI sprite summoning strategy with learning
function getStreamerSummonDecision() {
    // Don't summon if game not running or during story mode
    if (!gameRunning || gamePaused || storyMode) return -1;

    // Sprite indices for reference:
    // 0: Archer (10), 1: Knight (15), 2: Mage (15), 3: Cleric (25), 4: Ninja (15)
    // 5: Wizard (25), 6: Berserker (20), 7: Frost (25), 8: Vampire (30), 9: Bomber (25)

    const spriteCount = sprites.length;
    const typeCounts = {};
    sprites.forEach(s => {
        typeCounts[s.typeIndex] = (typeCounts[s.typeIndex] || 0) + 1;
    });

    const hpPercent = player.hp / player.maxHp;
    const enemyCount = enemies.length;

    // ===== POINT MANAGEMENT =====
    let minPointsToSpend;
    if (spriteCount === 0) {
        minPointsToSpend = 10;
    } else if (spriteCount < 3) {
        minPointsToSpend = 15;
    } else if (spriteCount < 6) {
        minPointsToSpend = 20;
    } else {
        minPointsToSpend = 25;
    }

    const hpCritical = hpPercent < 0.3 && (typeCounts[3] || 0) === 0;
    const bossActive = boss !== null;

    if (!hpCritical && !bossActive && points < minPointsToSpend) {
        return -1;
    }

    // Build candidate list with learning-adjusted scores
    const candidates = [];

    const addCandidate = (idx, baseScore, reason) => {
        if (points >= spriteTypes[idx].cost) {
            // Apply learning multiplier
            const learningMultiplier = getSpritePerformanceScore(idx);
            const adjustedScore = baseScore * learningMultiplier;
            candidates.push({ idx, score: adjustedScore, reason, learningMultiplier });
        }
    };

    // ===== LEARNING-BASED RECOMMENDATIONS =====

    // Check what sprites are commonly missing in losses
    const missingInLosses = analyzeRecentFailures();
    if (missingInLosses && missingInLosses.length > 0) {
        missingInLosses.forEach(idx => {
            if ((typeCounts[idx] || 0) === 0) {
                addCandidate(idx, 70, 'learning_missing_in_losses');
            }
        });
    }

    // Prioritize sprites from recent win strategies
    const winningSprites = getRecentWinStrategies();
    if (winningSprites && winningSprites.length > 0) {
        winningSprites.forEach(({ idx, frequency }) => {
            if ((typeCounts[idx] || 0) < 2) {
                addCandidate(idx, 50 + frequency * 30, 'learning_win_strategy');
            }
        });
    }

    // ===== CRITICAL NEEDS =====
    if (hpPercent < 0.25 && (typeCounts[3] || 0) === 0) {
        addCandidate(3, 200, 'emergency_cleric');
    }

    // ===== BOSS FIGHT - Use learned strategies =====
    if (boss) {
        const bossNum = boss.bossNum || 1;
        const bestForBoss = getBestSpritesForBoss(bossNum);

        bestForBoss.forEach((idx, priority) => {
            if ((typeCounts[idx] || 0) < 2) {
                addCandidate(idx, 150 - priority * 10, 'learning_boss_killer');
            }
        });

        // Fallback boss priorities if no learning data
        if (bestForBoss.length < 3) {
            if ((typeCounts[1] || 0) < 2) addCandidate(1, 140, 'boss_knight');
            if ((typeCounts[6] || 0) < 2) addCandidate(6, 130, 'boss_berserker');
            if ((typeCounts[5] || 0) < 2) addCandidate(5, 120, 'boss_wizard');
            if ((typeCounts[7] || 0) < 1) addCandidate(7, 110, 'boss_frost');
        }
    }

    // ===== HEALTH MANAGEMENT =====
    if (hpPercent < 0.5 && (typeCounts[3] || 0) === 0) {
        addCandidate(3, 100, 'need_cleric');
    }
    if (hpPercent < 0.6 && (typeCounts[8] || 0) === 0) {
        addCandidate(8, 80, 'need_vampire');
    }

    // ===== CROWD CONTROL =====
    if (enemyCount > 12) {
        if ((typeCounts[2] || 0) < 2) addCandidate(2, 90, 'crowd_mage');
        if ((typeCounts[6] || 0) < 2) addCandidate(6, 85, 'crowd_berserker');
        if ((typeCounts[7] || 0) < 2) addCandidate(7, 80, 'crowd_frost');
    }

    // ===== BALANCED ARMY BUILDING =====
    const rangedCount = (typeCounts[0] || 0) + (typeCounts[4] || 0) + (typeCounts[5] || 0);
    if (rangedCount < 3 + Math.floor(wave / 3)) {
        if ((typeCounts[0] || 0) < 2) addCandidate(0, 60 + Math.random() * 20, 'ranged_archer');
        if ((typeCounts[4] || 0) < 2) addCandidate(4, 60 + Math.random() * 20, 'ranged_ninja');
        if ((typeCounts[5] || 0) < 2) addCandidate(5, 55 + Math.random() * 20, 'ranged_wizard');
    }

    const meleeCount = (typeCounts[1] || 0) + (typeCounts[2] || 0) + (typeCounts[6] || 0);
    if (meleeCount < 2 + Math.floor(wave / 4)) {
        if ((typeCounts[1] || 0) < 2) addCandidate(1, 55 + Math.random() * 20, 'melee_knight');
        if ((typeCounts[2] || 0) < 2) addCandidate(2, 55 + Math.random() * 20, 'melee_mage');
        if ((typeCounts[6] || 0) < 2) addCandidate(6, 50 + Math.random() * 20, 'melee_berserker');
    }

    if ((typeCounts[3] || 0) < 1 && hpPercent < 0.8) {
        addCandidate(3, 70, 'support_cleric');
    }
    if ((typeCounts[7] || 0) < 1 && wave >= 3) {
        addCandidate(7, 50, 'support_frost');
    }

    if (wave >= 5) {
        if ((typeCounts[8] || 0) < 1) addCandidate(8, 60, 'late_vampire');
        if ((typeCounts[9] || 0) < 2) addCandidate(9, 65, 'late_bomber');
    }

    // ===== MERGE OPPORTUNITIES =====
    if (candidates.length < 3 && spriteCount > 0 && spriteCount < 12) {
        const mergeCandidates = [];
        for (let i = 0; i < spriteTypes.length; i++) {
            const sameType = sprites.filter(s => s.typeIndex === i);
            const levelCounts = {};
            sameType.forEach(s => {
                levelCounts[s.level] = (levelCounts[s.level] || 0) + 1;
            });
            for (const level in levelCounts) {
                if (levelCounts[level] === 1 && points >= spriteTypes[i].cost) {
                    mergeCandidates.push({ idx: i, score: 40 + Math.random() * 10, reason: 'merge' });
                }
            }
        }
        if (mergeCandidates.length > 0) {
            const pick = mergeCandidates[Math.floor(Math.random() * mergeCandidates.length)];
            // Apply learning to merge candidates too
            pick.score *= getSpritePerformanceScore(pick.idx);
            candidates.push(pick);
        }
    }

    // ===== DIVERSITY BONUS =====
    for (let i = 0; i < spriteTypes.length; i++) {
        if ((typeCounts[i] || 0) === 0 && points >= spriteTypes[i].cost) {
            const diversityScore = 45 + (spriteTypes[i].cost / 2) + Math.random() * 15;
            addCandidate(i, diversityScore, 'diversity');
        }
    }

    // ===== FALLBACK =====
    if (candidates.length === 0) {
        const affordable = spriteTypes
            .map((t, i) => ({ idx: i, cost: t.cost, count: typeCounts[i] || 0 }))
            .filter(t => points >= t.cost);

        if (affordable.length > 0) {
            affordable.forEach(t => {
                const countPenalty = t.count * 15;
                const baseScore = 40 - countPenalty + Math.random() * 20;
                addCandidate(t.idx, baseScore, 'fallback');
            });
        }
    }

    if (candidates.length === 0) return -1;

    // Sort by adjusted score
    candidates.sort((a, b) => b.score - a.score);

    // Pick with some randomness
    const rand = Math.random();
    let chosen;
    if (rand < 0.6 || candidates.length === 1) {
        chosen = candidates[0];
    } else if (rand < 0.85 || candidates.length === 2) {
        chosen = candidates[Math.min(1, candidates.length - 1)];
    } else {
        chosen = candidates[Math.min(2, candidates.length - 1)];
    }

    return chosen.idx;
}

function updateStreamerMode() {
    if (!streamerMode || !gameRunning || gamePaused) return;

    autopilot = true;
    streamerSummonTimer--;

    if (streamerSummonTimer <= 0) {
        const decision = getStreamerSummonDecision();

        if (decision >= 0) {
            summonSprite(decision, true);
            streamerRecordSpriteSummoned(decision);
            streamerLastSummonTime = gameTime;

            let baseDelay = 30 + Math.floor(Math.random() * 60);

            if (enemies.length > 15 || boss) {
                baseDelay = Math.floor(baseDelay * 0.6);
            }

            if (points < 30) {
                baseDelay = Math.floor(baseDelay * 1.5);
            }

            if (Math.random() < 0.15) {
                baseDelay += 60 + Math.floor(Math.random() * 60);
            }

            streamerSummonTimer = baseDelay;
        } else {
            streamerSummonTimer = 30 + Math.floor(Math.random() * 30);
        }
    }
}

function handleStreamerAutoRestart() {
    if (!streamerMode) return;

    const gameOverVisible = document.getElementById('gameOver').style.display === 'flex';
    const victoryVisible = document.getElementById('victory').style.display === 'flex';

    if (!gameRunning && (gameOverVisible || victoryVisible)) {
        // Record game end on first frame of end screen
        if (streamerAutoRestartTimer === 0) {
            streamerRecordGameEnd(victoryVisible, wave);
        }

        streamerAutoRestartTimer++;

        const restartDelay = 120 + Math.floor(Math.random() * 120);

        if (streamerAutoRestartTimer >= restartDelay) {
            streamerAutoRestartTimer = 0;
            document.getElementById('gameOver').style.display = 'none';
            document.getElementById('victory').style.display = 'none';
            startStreamerGame();
        }
    }
}

function updateStreamerButtonVisibility() {
    const btn = document.getElementById('streamerModeBtn');
    if (!btn) return;

    const showButton = gameStarted && !storyMode;
    btn.style.display = showButton ? 'block' : 'none';

    if (streamerMode) {
        btn.classList.add('active');
        btn.textContent = t('streamerModeActive');
    } else {
        btn.classList.remove('active');
        btn.textContent = t('streamerMode');
    }
}

// ===== HOOKS FOR GAME EVENTS =====
// These should be called from enemies.js when boss is defeated

function onStreamerBossEncounter(bossNum) {
    if (streamerMode) {
        streamerRecordBossEncounter(bossNum);
    }
}

function onStreamerBossDefeated(bossNum) {
    if (streamerMode) {
        streamerRecordBossDefeated(bossNum);
    }
}

// ===== STATS DISPLAY (for debugging) =====

function getStreamerStats() {
    const stats = {
        gamesPlayed: streamerLearning.gamesPlayed,
        wins: streamerLearning.wins,
        winRate: streamerLearning.gamesPlayed > 0
            ? (streamerLearning.wins / streamerLearning.gamesPlayed * 100).toFixed(1) + '%'
            : 'N/A',
        avgWave: streamerLearning.gamesPlayed > 0
            ? (streamerLearning.totalWavesReached / streamerLearning.gamesPlayed).toFixed(1)
            : 'N/A',
        spriteRankings: []
    };

    // Rank sprites by performance
    for (let i = 0; i < 10; i++) {
        const perf = getSpritePerformanceScore(i);
        const spriteData = streamerLearning.spriteStats[i];
        stats.spriteRankings.push({
            name: spriteTypes[i]?.nameKey || `Sprite ${i}`,
            performanceScore: perf.toFixed(2),
            gamesUsed: spriteData?.gamesUsed || 0,
            avgWave: spriteData && spriteData.gamesUsed > 0
                ? (spriteData.totalWaves / spriteData.gamesUsed).toFixed(1)
                : 'N/A'
        });
    }

    stats.spriteRankings.sort((a, b) => parseFloat(b.performanceScore) - parseFloat(a.performanceScore));

    return stats;
}

// Initialize learning data on load
loadStreamerLearning();
