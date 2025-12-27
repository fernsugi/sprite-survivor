# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sprite Survivor is a browser-based survival game built with vanilla HTML, CSS, and JavaScript. No build system or dependencies - just open in browser.

## Running the Game

Open `index.html` directly in a browser, or use a local server:
```bash
python3 -m http.server 8000
```

## File Structure

```
index.html      - HTML structure only
styles.css      - All CSS styling
js/
├── config.js   - Game constants, sprite/enemy/skill type definitions
├── i18n.js     - 5 languages (en/ja/ko/zh-TW/zh-CN), setLanguage(), t()
├── state.js    - Canvas, player object, entity arrays (enemies, sprites, etc.)
├── ui.js       - DOM UI updates (health bars, wave info, sprite buttons)
├── skills.js   - Skill orbs spawning and skill activation (Dash/Heal/Nuke)
├── sprites.js  - Sprite summoning, merging, combat AI
├── enemies.js  - Enemy spawning, movement AI, boss attacks
├── render.js   - All canvas drawing (drawPixelChar, draw)
└── main.js     - Game loop, input handling, startGame/restartGame
```

**Load order matters** - scripts must load in the order listed in index.html.

## Game Mechanics

### Sprite Merge System
- Summoning costs points (collected from orbs)
- Two sprites of **same type AND same level** merge into one higher level
- Merge happens instantly on summon via `checkAllMerges()` in sprites.js
- Stats scale with level: damage (1.5x per level), range (+20%), cooldown (-5 per level)

### 10 Sprite Types (in config.js)
| Type | Cost | Attack Style | Special |
|------|------|-------------|---------|
| Archer | 10 | Projectile | Longest range (250), 12 DPS |
| Knight | 15 | Melee slash | Blocks projectiles, 20 DPS |
| Mage | 20 | AOE centered on target | Range 100, area damage |
| Cleric | 25 | Healer | Heals player 2.5 HP/s |
| Ninja | 15 | Fast projectile | Low cooldown (20), 15 DPS |
| Wizard | 25 | Chain lightning | Hits 5+ enemies, chains |
| Berserker | 20 | Spin attack | Reflects projectiles, AOE |
| Frost | 25 | Slow field | 70% slow for 3 seconds |
| Vampire | 30 | Melee + lifesteal | 50% lifesteal |
| Bomber | 30 | Explosive projectile | AOE on impact, 180 range |

### Wave System
- 30 seconds per wave, then wave increments
- Boss spawns every 5 waves (wave 5, 10, 15, 20)
- Enemy types unlock progressively with wave number
- Victory at wave 20 after defeating final boss

### 6 Enemy Types (in config.js)
- Chaser, Shooter, Tank, Speedy, Bomber, Sniper
- Each has different speed, HP, damage, and behavior

### Skills (in config.js)
| Skill | Rarity | Effect |
|-------|--------|--------|
| Dash | Common (0.5) | Teleport in movement direction, brief invincibility, collects orbs along path |
| Screen Blast | Common (0.4) | Damage all enemies on screen |
| Full Heal | Rare (0.1) | Restore HP to max |
| Orb Magnet | Very Rare (0.05) | Instantly collect all orbs and skill orbs on map |

### Orb Mechanics (in main.js)
- Collecting orbs gives: +1 point, +10 score, +2 HP heal
- Orbs also grant temporary speed boost (+0.05 per orb, max +1.0)
- Speed boost lasts 3 seconds, refreshed on each orb pickup
- Passive point generation: +1 point per second

### Timer
- `gameTime` tracks total play time in seconds
- Displayed on game over and victory screens in `M:SS` format

## Key Global Variables (in state.js)
- `player` - position, hp, invincibility frames, speedBoost, speedBoostTimer
- `sprites[]` - active player sprites
- `enemies[]` - active enemies
- `projectiles[]` - enemy/boss projectiles
- `spriteProjectiles[]` - player sprite projectiles
- `effects[]` - visual particles and indicators
- `boss` - current boss object (null if no boss)
- `gameTime` - elapsed time in seconds
- `gamePaused` - pause state (ESC to toggle)
- `cheatMode` - infinite points mode

## Design Patterns
- All entities in arrays, removed with `splice()` when dead/expired
- Collision detection via distance checks (no physics engine)
- Effects system for particles, slashes, AOE rings, lightning
- i18n uses `data-i18n` attributes + `t(key)` function
