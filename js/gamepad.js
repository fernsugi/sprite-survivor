// Gamepad Support (PS5 DualSense, Xbox, etc.) with UI Navigation

let gpPrevButtons = []; // Previous frame button states
let gpHoldTimers = {}; // Hold timers for repeat (object for mixed numeric/string keys)
const HOLD_DELAY = 30; // Frames before repeat starts
const HOLD_REPEAT = 8; // Frames between repeats

// UI Navigation State
let uiFocusIndex = 0;
let lastUiMoveTime = 0;
const UI_MOVE_DELAY = 150; // ms between moves (debounce)
let activeScreenId = null;

function getGamepad() {
    const gamepads = navigator.getGamepads();
    for (let i = 0; i < gamepads.length; i++) {
        if (gamepads[i]) return gamepads[i];
    }
    return null;
}

function getVisibleScreen() {
    // Check priority screens first (modals/overlays)
    const screens = [
        'nameInputModal', // Highest priority
        'achievementsModal',
        'gameOver',
        'victory',
        'pauseScreen',
        'storyModeScreen',
        'dialogueBox' // Special case, though dialogue handles its own input usually
    ];

    for (const id of screens) {
        const el = document.getElementById(id);
        if (el && getComputedStyle(el).display !== 'none') {
            // Dialogue box is handled separately in logic, but good to know
            return id;
        }
    }

    // Check startScreen separately as it might be the bottom layer
    const start = document.getElementById('startScreen');
    if (start && getComputedStyle(start).display !== 'none') return 'startScreen';

    return null;
}

function getFocusableElements(screenId) {
    if (!screenId) return [];
    const screen = document.getElementById(screenId);
    if (!screen) return [];

    // Select interactive elements
    // standard buttons and inputs
    let selector = 'button:not([disabled]):not(.locked), input:not([disabled])';

    // Special cases where buttons might not matches standard selector or need specific order
    if (screenId === 'startScreen') {
        // We want specific order usually: Main buttons, then secondary
        const main = Array.from(screen.querySelectorAll('.menu-btn-main'));
        const secondary = Array.from(screen.querySelectorAll('.menu-btn-secondary'));
        // language buttons are in a separate panel #languagePanel, not inside #startScreen technically?
        // Actually #languagePanel is a sibling of #gameContainer in HTML.
        // If we want to navigate to language from start screen, we might need to add them manually
        return [...main, ...secondary];
    }

    if (screenId === 'storyModeScreen') {
        selector = '.chapter-btn:not(.locked), .menu-btn';
    }

    const elements = Array.from(screen.querySelectorAll(selector));

    // Filter out actually invisible elements (e.g. if parents are hidden)
    return elements.filter(el => {
        return el.offsetParent !== null && getComputedStyle(el).pointerEvents !== 'none';
    });
}

function clearFocus() {
    document.querySelectorAll('.gamepad-focus').forEach(el => el.classList.remove('gamepad-focus'));
    // Also blur actual focus to prevent double-activation if multiple inputs
    if (document.activeElement && document.activeElement.tagName !== 'BODY') {
        document.activeElement.blur();
    }
}

function updateMenuNavigation(gp) {
    const screenId = getVisibleScreen();

    // Skip if dialogue is active (handled by dialogue logic)
    if (screenId === 'dialogueBox') return;

    // Detect screen change to reset focus
    if (screenId !== activeScreenId) {
        activeScreenId = screenId;
        uiFocusIndex = 0;
        clearFocus();
    }

    if (!screenId) return; // No menu visible

    let focusables = getFocusableElements(screenId);

    // If Start Screen, maybe allow valid navigation to language panel?
    // For simplicity, let's stick to the main menu buttons first.

    if (focusables.length === 0) return;

    // Clamp index
    if (uiFocusIndex >= focusables.length) uiFocusIndex = focusables.length - 1;
    if (uiFocusIndex < 0) uiFocusIndex = 0;

    // Apply focus style
    clearFocus();
    const target = focusables[uiFocusIndex];
    if (target) {
        target.classList.add('gamepad-focus');
        target.focus(); // Native focus helps with inputs
    }

    // --- Navigation Inputs ---
    const now = Date.now();

    // Allow faster scrolling if held? For now fixed delay.
    if (now - lastUiMoveTime < UI_MOVE_DELAY) {
        // Check for Confirm even during debounce
        if (gp.buttons[0].pressed && !gpPrevButtons[0]) {
            if (target) {
                target.click();
                // Any SFX should be triggered by the target's click handler.
            }
        }
        return;
    }

    // D-pad & Sticks
    const lx = gp.axes[0];
    const ly = gp.axes[1];
    const deadzone = 0.5;

    const up = gp.buttons[12].pressed || ly < -deadzone;
    const down = gp.buttons[13].pressed || ly > deadzone;
    const left = gp.buttons[14].pressed || lx < -deadzone;
    const right = gp.buttons[15].pressed || lx > deadzone;

    let moved = false;

    if (down) {
        uiFocusIndex = (uiFocusIndex + 1) % focusables.length;
        moved = true;
    } else if (up) {
        uiFocusIndex = (uiFocusIndex - 1 + focusables.length) % focusables.length;
        moved = true;
    } else if (right) {
        // Horizontal (left/right) d-pad movement is intentionally ignored here.
        // Our menus are treated as linear vertical lists navigated with up/down only.
        // This avoids making layout-specific assumptions; extend this block if/when
        // true grid-based UI navigation is implemented.
    } else if (left) {
        // See note above: left/right are no-ops for the current vertical list menus.
    }

    if (moved) {
        lastUiMoveTime = now;
        // Use playSound to ensure audio context is initialized
        if (typeof playSound === 'function') playSound('move');
    }

    // Confirm Action (A / Cross = button 0)
    if (gp.buttons[0].pressed && !gpPrevButtons[0]) {
        if (target) {
            target.click();
        }
    }
}

function updateGamepad() {
    const gp = getGamepad();
    if (!gp) return;

    // Check for any input to switch UI mode
    // We check axes and buttons. 
    // Optimization: only check if not already in GP mode
    const anyButton = gp.buttons.some(b => b.pressed);
    const anyAxis = gp.axes.some(a => Math.abs(a) > 0.4);

    // Splash Screen Dismissal (Gamepad)
    if (typeof splashActive !== 'undefined' && splashActive) {
        if (anyButton) { // only buttons are guaranteed gestures, axes might fail audio resume
            if (typeof dismissSplash === 'function') dismissSplash();
            // Prevent this press from triggering menu action on next frame
            // We copy current buttons to prevButtons so they aren't 'justPressed' next time
            gpPrevButtons = gp.buttons.map(b => b.pressed);
        }
        return; // Don't process other input while splash is up
    }

    if (typeof setInputControlMode === 'function') {
        const isGpMode = typeof currentInputMode !== 'undefined' && currentInputMode === 'gp';
        if (!isGpMode && (anyButton || anyAxis)) {
            setInputControlMode('gp');
        }
    }

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

    // === DIALOGUE MODE (Highest Priority) ===
    if (typeof dialogueActive !== 'undefined' && dialogueActive) {
        // X advances dialogue with hold-to-repeat
        if (currButtons[0]) {
            if (!gpPrevButtons[0]) {
                gpHoldTimers['dialogue'] = 1;
                if (typeof advanceDialogue === 'function') advanceDialogue();
            } else {
                gpHoldTimers['dialogue'] = (gpHoldTimers['dialogue'] || 0) + 1;
                if (gpHoldTimers['dialogue'] > HOLD_DELAY && (gpHoldTimers['dialogue'] - HOLD_DELAY) % HOLD_REPEAT === 0) {
                    if (typeof advanceDialogue === 'function') advanceDialogue();
                }
            }
        } else {
            gpHoldTimers['dialogue'] = 0;
        }
        // Clear sprite hold timers during dialogue to prevent sprite summon on exit
        for (let i = 0; i < 20; i++) gpHoldTimers[i] = 0;
        gpHoldTimers['rs'] = 0;
        gpPrevButtons = currButtons;
        return;
    }

    // === MENU MODE ===
    // If a menu screen is visible (Start, Pause, GameOver, Level Up, Story Map, Name Input)
    const visibleScreen = getVisibleScreen();
    // Special handling: if paused, we definitely want menu mode
    // If not running, we definitely want menu mode
    // (except if just loading, but getGamepad implies we are running JS)

    if (visibleScreen || (typeof gamePaused !== 'undefined' && gamePaused) || (typeof gameRunning !== 'undefined' && !gameRunning)) {

        // Handle Options (9) to unpause if we are on pause screen
        // (Allows quick toggle without selecting Resume button)
        if (justPressed(9)) {
            if (typeof gamePaused !== 'undefined' && gamePaused && typeof togglePause === 'function') {
                togglePause();
            }
        }

        // Button 11 (R3) - Toggle Language
        if (justPressed(11)) {
            const langs = ['en', 'ja', 'ko', 'zh-TW', 'zh-CN', 'es', 'pt', 'ru', 'fr', 'vi'];
            let current = 'en';
            if (typeof currentLang !== 'undefined') current = currentLang;

            let idx = langs.indexOf(current);
            if (idx === -1) idx = 0;

            const nextLang = langs[(idx + 1) % langs.length];
            if (typeof setLanguage === 'function') setLanguage(nextLang);
        }

        updateMenuNavigation(gp);

        gpPrevButtons = currButtons;
        gpPrevButtons['gpMoving'] = false; // Reset movement flag while in menu
        return;
    } else if (activeScreenId !== null) {
        // We just exited a menu, clear focus state
        activeScreenId = null;
        clearFocus();
    }


    // === GAME INPUT (only when running and not paused) ===
    // If we are here, we are in-game.

    // Left stick - Movement (set based on current stick position)
    const lx = gp.axes[0];
    const ly = gp.axes[1];

    // Only override keys if gamepad is being used for movement
    // INCREASED DEADZONE to prevent drift
    const gpLeft = lx < -0.4 || currButtons[14];
    const gpRight = lx > 0.4 || currButtons[15];
    const gpUp = ly < -0.4 || currButtons[12];
    const gpDown = ly > 0.4 || currButtons[13];

    // Export gamepad state for main.js to use
    window.gamepadDirection = {
        left: gpLeft,
        right: gpRight,
        up: gpUp,
        down: gpDown
    };

    // Track if gamepad was used for movement last frame (legacy check, maybe not needed but kept for safety)
    if (gpLeft || gpRight || gpUp || gpDown || gpPrevButtons['gpMoving']) {
        gpPrevButtons['gpMoving'] = gpLeft || gpRight || gpUp || gpDown;
    }

    // Pause Game (Options / Start)
    if (justPressed(9)) {
        if (typeof togglePause === 'function') togglePause();
    }

    // Toggle Autopilot (L1)
    if (justPressed(4)) {
        if (typeof autopilot !== 'undefined') {
            autopilot = !autopilot;
        }
    }

    // X button - Use Skill
    if (justPressed(0) && typeof currentSkill !== 'undefined' && currentSkill) {
        if (typeof useSkill === 'function') useSkill();
    }

    // Right stick - Archer / Ninja (hold to repeat)
    const rx = gp.axes[2];
    const ry = gp.axes[3];
    const rightStickActive = Math.abs(rx) > deadzone || Math.abs(ry) > deadzone;
    if (rightStickActive) {
        if (typeof summonSprite === 'function') {
            if (!gpPrevButtons['rs']) {
                gpHoldTimers['rs'] = 1;
                summonSprite(r1Held ? 4 : 0); // First push
            } else {
                gpHoldTimers['rs'] = (gpHoldTimers['rs'] || 0) + 1;
                if (gpHoldTimers['rs'] > HOLD_DELAY && (gpHoldTimers['rs'] - HOLD_DELAY) % HOLD_REPEAT === 0) {
                    summonSprite(r1Held ? 4 : 0); // Repeat
                }
            }
        }
    } else {
        gpHoldTimers['rs'] = 0;
    }
    gpPrevButtons['rs'] = rightStickActive;

    // Face buttons with R1 modifier (hold to repeat)
    if (typeof summonSprite === 'function') {
        if (heldOrRepeat(1)) summonSprite(r1Held ? 5 : 2); // Circle: Mage / Wizard
        if (heldOrRepeat(2)) summonSprite(r1Held ? 6 : 1); // Square: Knight / Berserker
        if (heldOrRepeat(3)) summonSprite(r1Held ? 7 : 3); // Triangle: Cleric / Frost

        // Triggers (hold to repeat)
        if (heldOrRepeat(6)) summonSprite(8); // L2: Vampire
        if (heldOrRepeat(7)) summonSprite(9); // R2: Bomber
    }

    // Save state for next frame (preserve custom flags)
    const gpMoving = gpPrevButtons['gpMoving'];
    const rsState = gpPrevButtons['rs'];
    const rsTimer = gpHoldTimers['rs'];
    gpPrevButtons = currButtons;
    gpPrevButtons['gpMoving'] = gpMoving;
    gpPrevButtons['rs'] = rsState;
    gpHoldTimers['rs'] = rsTimer;
}
