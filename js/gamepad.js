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

    // Options = Pause (not during dialogue)
    if (justPressed(9) && !dialogueActive) {
        togglePause();
    }

    // L1 = Toggle autopilot (in game, not during dialogue)
    if (justPressed(4) && gameRunning && !dialogueActive) {
        autopilot = !autopilot;
    }

    // === DIALOGUE MODE ===
    if (dialogueActive) {
        if (justPressed(0) || justPressed(9)) { // X or Options
            advanceDialogue();
        }
        gpPrevButtons = currButtons;
        return;
    }

    // === GAME INPUT (only when running and not paused) ===
    if (!gameRunning || gamePaused) {
        gpPrevButtons = currButtons;
        return;
    }

    // Left stick - Movement
    const lx = gp.axes[0];
    const ly = gp.axes[1];
    if (lx < -deadzone) keys['ArrowLeft'] = true;
    if (lx > deadzone) keys['ArrowRight'] = true;
    if (ly < -deadzone) keys['ArrowUp'] = true;
    if (ly > deadzone) keys['ArrowDown'] = true;

    // D-pad - Alternative movement
    if (currButtons[12]) keys['ArrowUp'] = true;
    if (currButtons[13]) keys['ArrowDown'] = true;
    if (currButtons[14]) keys['ArrowLeft'] = true;
    if (currButtons[15]) keys['ArrowRight'] = true;

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

    // Save state for next frame
    gpPrevButtons = currButtons;
}
