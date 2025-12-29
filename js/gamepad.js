// Gamepad Support (PS5 DualSense, Xbox, etc.)

let gpPrevButtons = []; // Previous frame button states
let gpHoldTimers = []; // Hold timers for repeat
const HOLD_DELAY = 30; // Frames before repeat starts
const HOLD_REPEAT = 8; // Frames between repeats

function getGamepad() {
    const gamepads = navigator.getGamepads();
    for (let i = 0; i < gamepads.length; i++) {
        if (gamepads[i]) return gamepads[i];
    }
    return null;
}

function updateGamepad() {
    const gp = getGamepad();
    if (!gp) return;

    const deadzone = 0.25;

    // Get current button states
    const currButtons = gp.buttons.map(b => b.pressed);

    // Helper: true on first frame of press
    const justPressed = (i) => currButtons[i] && !gpPrevButtons[i];

    // Helper: true on first frame OR when held long enough (for repeat)
    const heldOrRepeat = (i) => {
        if (!currButtons[i]) {
            gpHoldTimers[i] = 0;
            return false;
        }
        if (!gpPrevButtons[i]) {
            gpHoldTimers[i] = 1;
            return true; // First press
        }
        gpHoldTimers[i] = (gpHoldTimers[i] || 0) + 1;
        if (gpHoldTimers[i] > HOLD_DELAY && (gpHoldTimers[i] - HOLD_DELAY) % HOLD_REPEAT === 0) {
            return true; // Repeat
        }
        return false;
    };

    // R1 modifier state
    const r1Held = currButtons[5] || false;

    // === ALWAYS AVAILABLE ===

    // Options = Pause toggle (always, unless in dialogue without pause)
    if (justPressed(9)) {
        if (gamePaused) {
            togglePause(); // Always unpause
        } else if (!dialogueActive) {
            togglePause(); // Pause only if no dialogue
        }
    }

    // L1 = Toggle autopilot (in game, not during dialogue)
    if (justPressed(4) && gameRunning && !dialogueActive && !gamePaused) {
        autopilot = !autopilot;
    }

    // === DIALOGUE MODE ===
    if (dialogueActive) {
        if (justPressed(0)) { // Only X advances dialogue (not Options)
            advanceDialogue();
        }
        // Clear hold timers during dialogue to prevent sprite summon on exit
        gpHoldTimers = [];
        gpPrevButtons = currButtons;
        return;
    }

    // === GAME INPUT (only when running and not paused) ===
    if (!gameRunning || gamePaused) {
        // Clear hold timers during pause to prevent sprite summon on unpause
        gpHoldTimers = [];
        gpPrevButtons = currButtons;
        return;
    }

    // Left stick - Movement (set based on current stick position)
    const lx = gp.axes[0];
    const ly = gp.axes[1];

    // Only override keys if gamepad is being used for movement
    const gpLeft = lx < -deadzone || currButtons[14];
    const gpRight = lx > deadzone || currButtons[15];
    const gpUp = ly < -deadzone || currButtons[12];
    const gpDown = ly > deadzone || currButtons[13];

    // Track if gamepad was used for movement last frame
    if (gpLeft || gpRight || gpUp || gpDown || gpPrevButtons['gpMoving']) {
        keys['ArrowLeft'] = gpLeft;
        keys['ArrowRight'] = gpRight;
        keys['ArrowUp'] = gpUp;
        keys['ArrowDown'] = gpDown;
        gpPrevButtons['gpMoving'] = gpLeft || gpRight || gpUp || gpDown;
    }

    // Right stick - Use Skill
    const rx = gp.axes[2];
    const ry = gp.axes[3];
    const rightStickActive = Math.abs(rx) > deadzone || Math.abs(ry) > deadzone;
    if (rightStickActive && currentSkill && !gpPrevButtons['rs']) {
        useSkill();
    }
    gpPrevButtons['rs'] = rightStickActive;

    // Face buttons with R1 modifier (hold to repeat)
    if (heldOrRepeat(0)) summonSprite(r1Held ? 4 : 0); // X: Archer / Ninja
    if (heldOrRepeat(1)) summonSprite(r1Held ? 5 : 2); // Circle: Mage / Wizard
    if (heldOrRepeat(2)) summonSprite(r1Held ? 6 : 1); // Square: Knight / Berserker
    if (heldOrRepeat(3)) summonSprite(r1Held ? 7 : 3); // Triangle: Cleric / Frost

    // Triggers (hold to repeat)
    if (heldOrRepeat(6)) summonSprite(8); // L2: Vampire
    if (heldOrRepeat(7)) summonSprite(9); // R2: Bomber

    // Save state for next frame (preserve custom flags)
    const gpMoving = gpPrevButtons['gpMoving'];
    const rs = gpPrevButtons['rs'];
    gpPrevButtons = currButtons;
    gpPrevButtons['gpMoving'] = gpMoving;
    gpPrevButtons['rs'] = rs;
}
