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
├── i18n.js     - 10 languages (en/ja/ko/zh-TW/zh-CN/es/pt/ru/fr/vi), setLanguage(), t()
├── state.js    - Canvas, player object, entity arrays, debuffs
├── ui.js       - DOM UI updates (health bars, wave info, sprite buttons)
├── skills.js   - Skill orbs spawning and skill activation (Dash/Heal/Nuke/Magnet/Hero)
├── sprites.js  - Sprite summoning, merging, combat AI
├── heroes.js   - Hero NPC AI, actions, bouncing balls
├── enemies.js  - Enemy spawning, movement AI, boss attacks, debuff application
├── render.js   - All canvas drawing, environment themes, debuff visuals
├── sound.js    - Procedural audio with Web Audio API
├── achievements.js - Achievement system with localStorage persistence
└── main.js     - Game loop, input handling, autopilot, startGame/restartGame
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

### 7 Enemy Types (in config.js)
| Type | Behavior | Special |
|------|----------|---------|
| Chaser | Melee | Basic enemy |
| Shooter | Ranged | Shoots projectiles |
| Tank | Melee | High HP, slow |
| Speedy | Melee | Fast movement |
| Bomber | Melee | Explodes on contact |
| Sniper | Ranged | Long range, high damage |
| Hexer | Ranged | Projectiles apply random debuff (wave 6+) |

### Boss System (in enemies.js)
Bosses spawn every 5 waves with unique mechanics:

| Wave | Boss | HP | Damage | Minions | Unique Mechanics |
|------|------|-----|--------|---------|------------------|
| 5 | Demon Lord | 1200 | 55 | 3 Chasers | Rage mode at 50% HP (25% faster attacks) |
| 10 | Shadow King | 1800 | 82 | 5 Speedies | Teleport every 5s, Clone decoy at 50% HP |
| 15 | Void Emperor | 2400 | 110 | 7 Tanks | Gravity well (pulls player), Shield regenerates |
| 20 | Death Titan | 3000 | 137 | 9 Bombers | Death aura (1 dmg/s), Enrage after 60s |

Boss-specific properties in boss object:
- `bossNum` - which boss (1-4)
- `rageMode` - Demon Lord rage state
- `teleportTimer`, `cloneSpawned` - Shadow King tracking
- `gravityTimer`, `shield`, `shieldTimer` - Void Emperor mechanics
- `enrageTimer`, `enraged` - Death Titan mechanics

Shield damage absorption handled by `applyDamage()` helper in sprites.js.

### Debuff System (in state.js, enemies.js)
Boss and Hexer projectiles apply random debuffs on hit (5 seconds each):

| Debuff | Effect | Blocked By |
|--------|--------|------------|
| noHeal | Cannot recover HP (orbs, cleric, vampire, skills) | - |
| noBlock | Knight can't block, Berserker can't reflect | - |
| slow | Movement speed reduced 50% | - |
| weakened | Boss takes 50% less damage | - |

Visual feedback: colored aura particles around player + screen edge vignette.

### Autopilot (TAB key)
- AI-controlled player movement
- Prioritizes skill orbs, then regular orbs
- Avoids enemies, projectiles, and boss
- Auto-uses skills when enemies nearby

### Achievement System (in achievements.js)
14 achievements stored in localStorage:
- First Win, 10 sprite-only achievements, All Sprites Used, Speedrun (<10 min), No Hit

### Skills (in config.js)
| Skill | Rarity | Effect |
|-------|--------|--------|
| Dash | Common (0.6) | Teleport in movement direction, brief invincibility, collects orbs along path |
| Screen Blast | Common (0.25) | Damage all enemies on screen |
| Full Heal | Rare (0.1) | Restore HP to max |
| Orb Magnet | Very Rare (0.05) | Instantly collect all orbs and skill orbs on map |
| Hero | Rarest (0.025) | Summon a permanent hero NPC ally |

### Hero System (in config.js, heroes.js)
Heroes are permanent NPC allies summoned via the Hero skill orb. They cannot die and are not targeted by enemies.

| Hero | Color | Ability | Special |
|------|-------|---------|---------|
| Laser | Magenta | Wide beam (60px) hitting all enemies in path | 800 range |
| Warrior | Orange | 240° cone melee attack | 4x movement speed |
| Angel | White | Erases enemy projectiles in AOE | Follows random enemies |
| Bouncer | Cyan | Launches bouncing balls | Balls last 5 seconds |

Heroes are affected by debuffs:
- Slow: Hero movement reduced 50%
- NoBlock: Angel cannot erase projectiles
- Weakened: Hero damage vs boss reduced 50%

### Orb Mechanics (in main.js)
- Collecting orbs gives: +1 point, +10 score, +2 HP heal
- Orbs also grant temporary speed boost (+0.05 per orb, max +1.0)
- Speed boost lasts 3 seconds, refreshed on each orb pickup
- Passive point generation: +1 point per second

### Timer
- `gameTime` tracks total play time in seconds
- Displayed on game over and victory screens in `M:SS` format

## Key Global Variables (in state.js)
- `player` - position, hp, invincibility frames, speedBoost, speedBoostTimer, facingX/Y
- `sprites[]` - active player sprites
- `heroes[]` - permanent hero NPCs
- `heroBalls[]` - bouncing balls from Bouncer hero
- `enemies[]` - active enemies
- `projectiles[]` - enemy/boss projectiles
- `spriteProjectiles[]` - player sprite projectiles
- `effects[]` - visual particles and indicators
- `boss` - current boss object (null if no boss)
- `debuffs` - object with timer for each debuff type (noHeal, noBlock, slow, weakened)
- `gameTime` - elapsed time in seconds
- `gamePaused` - pause state (ESC to toggle)
- `cheatMode` - infinite points mode
- `autopilot` - AI control state (TAB to toggle)

## Design Patterns
- All entities in arrays, removed with `splice()` when dead/expired
- Collision detection via distance checks (no physics engine)
- Effects system for particles, slashes, AOE rings, lightning
- i18n uses `data-i18n` attributes + `t(key)` function
