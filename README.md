# Sprite Survivor

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A browser-based survival game where you summon and merge sprites to fight waves of enemies.

**Play now:** https://spritesurvivor.com/

## How to Play

- **Move:** WASD or Arrow Keys
- **Summon Sprites:** 1-0 keys (or Z-/ row)
- **Use Skill:** Spacebar
- **Autopilot:** TAB
- **Pause:** ESC

## Core Mechanics

### Sprites
Summon sprites using points collected from orbs. 10 types available:
- **Archer, Ninja** - Ranged shooters
- **Knight, Berserker** - Melee fighters
- **Mage, Wizard, Bomber** - AOE damage
- **Cleric** - Heals player
- **Frost** - Slows enemies
- **Vampire** - Lifesteal

**Merging:** Two sprites of the same type AND level combine into a higher level sprite with boosted stats.

### Waves & Bosses
- 30 seconds per wave
- Boss every 5 waves (5, 10, 15, 20)
- Victory at wave 20

### Skills
Collect skill orbs for one-time abilities:
- **Dash** - Teleport with invincibility
- **Screen Blast** - Damage all enemies
- **Full Heal** - Restore HP
- **Orb Magnet** - Collect all orbs instantly
- **Hero** (rarest) - Summon a permanent hero ally

### Heroes
Permanent NPC allies summoned via Hero skill orb:
- **Laser** - Wide beam attack
- **Warrior** - Fast melee cone
- **Angel** - Erases enemy projectiles
- **Bouncer** - Bouncing ball projectiles

### Enemies
7 enemy types including Hexer (applies debuffs). Bosses have unique mechanics like teleporting, shields, gravity wells, death auras, and lifesteal (heals when projectiles hit you).

## Beginner Meta Stacks

**1. Ninja / Cleric / Frost** (The Classic)
- Ninja: Cheap (15), fast attacks, shreds everything
- Cleric: Keeps you alive
- Frost: Slows enemies = more hits, easier dodging

**2. Archer / Cleric / Frost** (Budget King)
- Archer: Cheapest DPS (10 cost), longest range (250)
- You level up faster because Archer is cheap. Stay far, stay safe.

**3. Knight / Cleric / Frost** (Aggressive)
- Knight: Blocks boss projectiles (huge!)
- Position Knights between you and boss.

**Tips:**
- Focus 1-2 sprite types - merging > diversity
- Main DPS to Lv3 before adding support
- Don't summon Lv1 sprites after wave 15 - they die instantly

## Running Locally

Just open `index.html` in a browser, or:
```bash
python3 -m http.server 8000
```

## Tech

Vanilla HTML/CSS/JavaScript. No dependencies.
