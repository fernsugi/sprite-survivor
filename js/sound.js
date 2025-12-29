// Sound System - Procedural retro sounds using Web Audio API

let audioCtx = null;
let soundEnabled = true;
let masterGain = null;
let compressor = null;

// Sound cooldowns to prevent stacking
const soundCooldowns = {};
const COOLDOWN_MS = 50; // Minimum ms between same sound

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        // Create master gain (volume control)
        masterGain = audioCtx.createGain();
        masterGain.gain.value = 0.5; // Master volume at 50%

        // Create compressor to prevent clipping
        compressor = audioCtx.createDynamicsCompressor();
        compressor.threshold.value = -20;
        compressor.knee.value = 10;
        compressor.ratio.value = 12;
        compressor.attack.value = 0;
        compressor.release.value = 0.25;

        // Route: sounds -> compressor -> masterGain -> output
        compressor.connect(masterGain);
        masterGain.connect(audioCtx.destination);
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function canPlaySound(soundName) {
    const now = Date.now();
    if (soundCooldowns[soundName] && now - soundCooldowns[soundName] < COOLDOWN_MS) {
        return false;
    }
    soundCooldowns[soundName] = now;
    return true;
}

function playTone(frequency, duration, type = 'square', volume = 0.3, decay = true) {
    if (!soundEnabled || !audioCtx || !compressor) return;

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(compressor); // Route through compressor

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);

    gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
    if (decay) {
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    }

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + duration);
}

function playNoise(duration, volume = 0.3) {
    if (!soundEnabled || !audioCtx || !compressor) return;

    const bufferSize = audioCtx.sampleRate * duration;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = audioCtx.createBufferSource();
    const gainNode = audioCtx.createGain();

    noise.buffer = buffer;
    noise.connect(gainNode);
    gainNode.connect(compressor); // Route through compressor

    gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

    noise.start();
}

// Sound Effects
const SFX = {
    // Player sounds
    collectOrb: () => {
        if (!canPlaySound('collectOrb')) return;
        playTone(600, 0.1, 'sine', 0.02);
        setTimeout(() => playTone(900, 0.1, 'sine', 0.02), 50);
    },

    collectSkillOrb: () => {
        // Magical pickup - sparkle with power chord
        playTone(800, 0.08, 'square', 0.2);
        playTone(1000, 0.08, 'square', 0.15);
        setTimeout(() => playTone(1200, 0.12, 'sine', 0.25), 70);
    },

    playerHit: () => {
        // Short low click - subtle damage feedback
        playTone(120, 0.03, 'square', 0.015);
    },

    playerDeath: () => {
        // Game over - subtle descending tones
        playTone(400, 0.1, 'square', 0.2);
        setTimeout(() => playTone(300, 0.1, 'square', 0.2), 100);
        setTimeout(() => playTone(200, 0.2, 'square', 0.2), 200);
        setTimeout(() => playTone(100, 0.4, 'square', 0.2), 300);
    },

    // Sprite sounds
    // Generic summon (fallback)
    summonSprite: () => {
        playTone(300, 0.1, 'square', 0.2);
        setTimeout(() => playTone(500, 0.15, 'square', 0.2), 80);
    },

    // Unique spawn sounds for each sprite type
    summonArcher: () => {
        // Bow string twang - quick snap with resonance
        playTone(180, 0.05, 'sawtooth', 0.25);
        playTone(320, 0.12, 'triangle', 0.2);
        setTimeout(() => playTone(280, 0.08, 'triangle', 0.15), 40);
    },

    summonKnight: () => {
        // Sword unsheathe - metallic ring + impact
        playNoise(0.03, 0.1);
        playTone(800, 0.05, 'sawtooth', 0.12);
        playTone(1200, 0.04, 'triangle', 0.1);
        setTimeout(() => {
            playTone(400, 0.07, 'triangle', 0.15);
            playTone(600, 0.05, 'sawtooth', 0.1);
        }, 50);
        setTimeout(() => playTone(300, 0.08, 'triangle', 0.12), 100);
    },

    summonMage: () => {
        // Arcane conjuring - deep mystical with ethereal warble
        playTone(250, 0.12, 'triangle', 0.18);
        playTone(375, 0.1, 'sine', 0.12);
        setTimeout(() => playTone(300, 0.1, 'triangle', 0.15), 80);
        setTimeout(() => playNoise(0.05, 0.08), 120);
        setTimeout(() => playTone(500, 0.15, 'sine', 0.12), 160);
    },

    summonCleric: () => {
        // Holy bell chime - pure heavenly tone
        playTone(880, 0.2, 'sine', 0.25);
        playTone(1320, 0.25, 'sine', 0.15);
        setTimeout(() => playTone(1100, 0.2, 'sine', 0.2), 80);
    },

    summonNinja: () => {
        // Quick swoosh - fast stealthy sound (more noticeable)
        playNoise(0.1, 0.25);
        playTone(1200, 0.05, 'sawtooth', 0.3);
        setTimeout(() => playTone(600, 0.08, 'sawtooth', 0.25), 25);
    },

    summonWizard: () => {
        // Electric crackle - arcane energy
        playNoise(0.04, 0.1);
        playTone(1500, 0.03, 'sawtooth', 0.15);
        setTimeout(() => {
            playNoise(0.03, 0.08);
            playTone(1800, 0.03, 'sawtooth', 0.12);
        }, 40);
        setTimeout(() => {
            playTone(1000, 0.08, 'square', 0.2);
            playTone(1200, 0.1, 'sawtooth', 0.15);
        }, 80);
    },

    summonBerserker: () => {
        // Battle cry - deep roar + rage
        playTone(80, 0.1, 'sawtooth', 0.18);
        playTone(120, 0.08, 'square', 0.15);
        playNoise(0.05, 0.12);
        setTimeout(() => {
            playTone(100, 0.08, 'sawtooth', 0.2);
            playTone(150, 0.06, 'triangle', 0.15);
        }, 60);
        setTimeout(() => {
            playTone(60, 0.1, 'sine', 0.18);
        }, 120);
    },

    summonFrost: () => {
        // Icy crystalline - cold tinkling
        playTone(2000, 0.05, 'sine', 0.15);
        setTimeout(() => playTone(2400, 0.05, 'sine', 0.12), 30);
        setTimeout(() => playTone(1800, 0.06, 'sine', 0.15), 60);
        setTimeout(() => playTone(2200, 0.08, 'sine', 0.1), 100);
        setTimeout(() => playTone(1600, 0.1, 'sine', 0.12), 140);
    },

    summonVampire: () => {
        // Dark ominous - descending eerie tone
        playTone(500, 0.1, 'sawtooth', 0.2);
        setTimeout(() => playTone(400, 0.1, 'sawtooth', 0.2), 60);
        setTimeout(() => playTone(300, 0.12, 'sawtooth', 0.2), 120);
        setTimeout(() => playTone(200, 0.15, 'square', 0.15), 180);
    },

    summonBomber: () => {
        // Bomb armed - fuse ignite + ominous charge
        playNoise(0.06, 0.12);
        playTone(200, 0.05, 'sawtooth', 0.1);
        setTimeout(() => {
            playTone(150, 0.08, 'square', 0.15);
            playNoise(0.04, 0.1);
        }, 50);
        setTimeout(() => {
            playTone(100, 0.1, 'sine', 0.18);
            playTone(80, 0.08, 'triangle', 0.12);
        }, 100);
    },

    mergeSprite: () => {
        // Subtle soft chime - not fancy, just noticeable
        playTone(600, 0.08, 'sine', 0.12);
        playTone(800, 0.1, 'sine', 0.1);
    },

    shoot: () => {
        if (!canPlaySound('shoot')) return;
        // Subtle short tick for projectile firing
        playTone(700, 0.02, 'sine', 0.025);
    },

    melee: () => {
        if (!canPlaySound('melee')) return;
        playNoise(0.08, 0.15);
        playTone(200, 0.1, 'sawtooth', 0.1);
    },

    aoe: () => {
        if (!canPlaySound('aoe')) return;
        playTone(150, 0.2, 'sine', 0.15);
        playNoise(0.15, 0.1);
    },

    heal: () => {
        if (!canPlaySound('heal')) return;
        // Subtle soft chime
        playTone(600, 0.04, 'sine', 0.02);
    },

    lightning: () => {
        if (!canPlaySound('lightning')) return;
        playNoise(0.1, 0.15);
        playTone(1200, 0.05, 'sawtooth', 0.12);
        setTimeout(() => playTone(800, 0.05, 'sawtooth', 0.1), 30);
    },

    explosion: () => {
        if (!canPlaySound('explosion')) return;
        playNoise(0.3, 0.25);
        playTone(100, 0.3, 'sine', 0.2);
        playTone(50, 0.4, 'sine', 0.15);
    },

    // Enemy sounds
    enemyHit: () => {
        if (!canPlaySound('enemyHit')) return;
        // Subtle tick when hitting enemy
        playTone(250, 0.02, 'square', 0.02);
    },

    enemyDeath: () => {
        if (!canPlaySound('enemyDeath')) return;
        // Short higher click - subtle kill confirmation
        playTone(400, 0.025, 'sine', 0.012);
    },

    // Boss sounds
    bossSpawn: () => {
        // Subtle deep rumble - ominous but not harsh
        playTone(60, 0.3, 'sine', 0.04);
        setTimeout(() => playTone(80, 0.25, 'sine', 0.035), 100);
        setTimeout(() => playTone(100, 0.2, 'triangle', 0.03), 200);
    },

    bossHit: () => {
        playTone(100, 0.1, 'square', 0.25);
        playNoise(0.05, 0.15);
    },

    bossDeath: () => {
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                playNoise(0.2, 0.3);
                playTone(200 - i * 20, 0.2, 'square', 0.3);
            }, i * 100);
        }
    },

    bossAttack: () => {
        if (!canPlaySound('bossAttack')) return;
        playTone(80, 0.15, 'sawtooth', 0.1);
        playNoise(0.1, 0.06);
    },

    // Skill sounds
    skillDash: () => {
        playTone(400, 0.05, 'sine', 0.3);
        playTone(800, 0.1, 'sine', 0.2);
        playNoise(0.1, 0.15);
    },

    skillHeal: () => {
        // Full restoration - powerful holy burst
        playTone(600, 0.15, 'triangle', 0.2);
        playTone(900, 0.15, 'triangle', 0.15);
        setTimeout(() => {
            playTone(800, 0.2, 'sine', 0.25);
            playTone(1200, 0.2, 'sine', 0.2);
        }, 100);
        setTimeout(() => playTone(1600, 0.25, 'sine', 0.15), 200);
    },

    skillNuke: () => {
        playNoise(0.5, 0.25);
        playTone(100, 0.4, 'sine', 0.2);
        setTimeout(() => playTone(80, 0.3, 'sine', 0.15), 100);
        setTimeout(() => playTone(60, 0.3, 'sine', 0.12), 200);
    },

    skillMagnet: () => {
        for (let i = 0; i < 6; i++) {
            setTimeout(() => playTone(300 + i * 100, 0.08, 'sine', 0.2), i * 40);
        }
    },

    skillHero: () => {
        // Epic hero summon (barely noticeable)
        playTone(400, 0.15, 'square', 0.008);
        playTone(500, 0.15, 'square', 0.006);
        setTimeout(() => {
            playTone(600, 0.15, 'square', 0.008);
            playTone(800, 0.2, 'sine', 0.006);
        }, 100);
        setTimeout(() => playTone(1000, 0.3, 'sine', 0.006), 200);
    },

    // Hero action sounds (barely noticeable)
    heroLaser: () => {
        if (!canPlaySound('heroLaser')) return;
        playNoise(0.15, 0.005);
        playTone(200, 0.3, 'sawtooth', 0.008);
        playTone(180, 0.25, 'square', 0.005);
    },

    heroWarrior: () => {
        if (!canPlaySound('heroWarrior')) return;
        playNoise(0.1, 0.006);
        playTone(300, 0.08, 'sawtooth', 0.008);
        setTimeout(() => playTone(200, 0.1, 'sawtooth', 0.005), 40);
    },

    heroAngel: () => {
        if (!canPlaySound('heroAngel')) return;
        playTone(800, 0.15, 'sine', 0.008);
        playTone(1200, 0.2, 'sine', 0.005);
        setTimeout(() => playTone(1000, 0.15, 'sine', 0.006), 80);
    },

    heroBouncer: () => {
        if (!canPlaySound('heroBouncer')) return;
        playTone(500, 0.08, 'square', 0.008);
        playTone(700, 0.1, 'sine', 0.005);
    },

    heroBallBounce: () => {
        if (!canPlaySound('heroBallBounce')) return;
        playTone(400, 0.05, 'square', 0.004);
    },

    // Wave sounds
    waveStart: () => {
        playTone(400, 0.15, 'square', 0.25);
        setTimeout(() => playTone(500, 0.15, 'square', 0.25), 150);
        setTimeout(() => playTone(600, 0.2, 'square', 0.25), 300);
    },

    victory: () => {
        // Victory fanfare - subtle ascending tones
        const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
        notes.forEach((note, i) => {
            setTimeout(() => playTone(note, 0.3, 'square', 0.15), i * 150);
        });
    },

    // UI sounds
    select: () => {
        playTone(600, 0.06, 'square', 0.03);
        setTimeout(() => playTone(800, 0.08, 'square', 0.024), 40);
    },

    error: () => {
        playTone(200, 0.1, 'square', 0.04);
        setTimeout(() => playTone(150, 0.15, 'square', 0.036), 80);
    },

    // Dialogue typing sound
    type: () => {
        if (!canPlaySound('type')) return;
        playTone(800 + Math.random() * 200, 0.02, 'square', 0.01);
    },

    // Dialogue advance sound (quieter select)
    dialogueNext: () => {
        playTone(600, 0.06, 'square', 0.03);
        setTimeout(() => playTone(800, 0.08, 'square', 0.024), 40);
    }
};

// Play sound by name
function playSound(name) {
    initAudio();
    if (SFX[name]) {
        SFX[name]();
    }
}

// Toggle sound
function toggleSound() {
    soundEnabled = !soundEnabled;
    localStorage.setItem('spriteSurvivorSound', soundEnabled ? 'on' : 'off');
    updateSoundButton();
    return soundEnabled;
}

function updateSoundButton() {
    const btn = document.getElementById('soundToggle');
    if (btn) {
        btn.textContent = soundEnabled ? '🔊' : '🔇';
        btn.title = soundEnabled ? 'Mute' : 'Unmute';
    }
}

// Load saved preference
function loadSoundPreference() {
    const saved = localStorage.getItem('spriteSurvivorSound');
    soundEnabled = saved !== 'off';
    updateSoundButton();
}
