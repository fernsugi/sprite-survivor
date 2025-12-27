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
        playTone(600, 0.1, 'sine', 0.15);
        setTimeout(() => playTone(900, 0.1, 'sine', 0.15), 50);
    },

    collectSkillOrb: () => {
        playTone(400, 0.1, 'sine', 0.3);
        setTimeout(() => playTone(600, 0.1, 'sine', 0.3), 60);
        setTimeout(() => playTone(800, 0.15, 'sine', 0.3), 120);
    },

    playerHit: () => {
        playTone(150, 0.2, 'square', 0.4);
        playNoise(0.1, 0.2);
    },

    playerDeath: () => {
        playTone(400, 0.1, 'square', 0.4);
        setTimeout(() => playTone(300, 0.1, 'square', 0.4), 100);
        setTimeout(() => playTone(200, 0.2, 'square', 0.4), 200);
        setTimeout(() => playTone(100, 0.4, 'square', 0.4), 300);
    },

    // Sprite sounds
    summonSprite: () => {
        playTone(300, 0.1, 'square', 0.2);
        setTimeout(() => playTone(500, 0.15, 'square', 0.2), 80);
    },

    mergeSprite: () => {
        playTone(400, 0.1, 'sine', 0.3);
        setTimeout(() => playTone(600, 0.1, 'sine', 0.3), 50);
        setTimeout(() => playTone(800, 0.1, 'sine', 0.3), 100);
        setTimeout(() => playTone(1000, 0.2, 'sine', 0.3), 150);
    },

    shoot: () => {
        if (!canPlaySound('shoot')) return;
        playTone(800, 0.05, 'square', 0.1);
        playTone(600, 0.05, 'square', 0.08);
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
        playTone(500, 0.1, 'sine', 0.2);
        setTimeout(() => playTone(700, 0.1, 'sine', 0.2), 100);
        setTimeout(() => playTone(900, 0.15, 'sine', 0.2), 200);
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
        playTone(200, 0.05, 'square', 0.08);
    },

    enemyDeath: () => {
        if (!canPlaySound('enemyDeath')) return;
        playTone(300, 0.1, 'square', 0.12);
        setTimeout(() => playTone(150, 0.15, 'square', 0.12), 50);
        playNoise(0.1, 0.1);
    },

    // Boss sounds
    bossSpawn: () => {
        for (let i = 0; i < 5; i++) {
            setTimeout(() => playTone(100 + i * 50, 0.2, 'square', 0.3), i * 150);
        }
        setTimeout(() => playNoise(0.3, 0.3), 600);
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
        playTone(80, 0.15, 'sawtooth', 0.2);
        playNoise(0.1, 0.12);
    },

    // Skill sounds
    skillDash: () => {
        playTone(400, 0.05, 'sine', 0.3);
        playTone(800, 0.1, 'sine', 0.2);
        playNoise(0.1, 0.15);
    },

    skillHeal: () => {
        for (let i = 0; i < 4; i++) {
            setTimeout(() => playTone(400 + i * 150, 0.15, 'sine', 0.25), i * 80);
        }
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

    // Wave sounds
    waveStart: () => {
        playTone(400, 0.15, 'square', 0.25);
        setTimeout(() => playTone(500, 0.15, 'square', 0.25), 150);
        setTimeout(() => playTone(600, 0.2, 'square', 0.25), 300);
    },

    victory: () => {
        const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
        notes.forEach((note, i) => {
            setTimeout(() => playTone(note, 0.3, 'square', 0.3), i * 150);
        });
    }
};

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
