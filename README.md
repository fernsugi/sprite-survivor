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
Summon sprites using points collected from orbs. Two sprites of the same type AND level merge into a higher level sprite with exponentially boosted stats (1.5× per level).

#### Sprite Tier List

| Tier | Sprite | Cost | Role | Notes |
|------|--------|------|------|-------|
| **A** | Berserker | 20 | Spin AOE + Reflect | Best value. AOE damage + returns projectiles. |
| **A** | Bomber | 25 | Explosive AOE | Highest base damage. Explosions clear waves fast. |
| **A** | Wizard | 25 | Chain Lightning | Hits 3+level targets. Great crowd control. |
| **B** | Archer | 10 | Ranged DPS | Cheapest. Best range (250). Easy to merge early. |
| **B** | Mage | 15 | Targeted AOE | Cheap AOE option. Good mid-game. |
| **B** | Vampire | 30 | Lifesteal + Overheal | 20% lifesteal. Grants grey HP shield (max 50). |
| **B** | Ninja | 15 | Fast Attacker | Fastest cooldown (20). Higher DPS than Archer. |
| **B** | Frost | 25 | Slow Utility | 50% enemy slow. Essential for boss fights. |
| **B** | Knight | 15 | Tank + Block | Blocks projectiles. Good vs ranged enemies. |
| **C** | Cleric | 25 | Healer | Pure healing. Outclassed by Vampire for sustain. |

**Debuff Counters:** *noHeal* shuts down Vampire/Cleric, *noBlock* shuts down Knight/Berserker.

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

## Recommended Builds

**1. Berserker Stack** (Best Value)
- Stack Berserkers (20 cost) - spin AOE + reflects projectiles back
- Add 1 Frost for slow, 1 Vampire for sustain

**2. Bomber + Mage** (Explosion Meta)
- Mage early (15 cost) for cheap AOE
- Transition to Bomber (25 cost) for massive explosions
- Add Vampire for lifesteal + overheal shield

**3. Archer Rush** (Budget)
- Cheapest sprite (10 cost) = fastest merges
- Longest range (250) = safest positioning
- Rush to Lv4-5 Archer before adding support

**Tips:**
- Focus 1-2 sprite types - merging > diversity
- Get main DPS to Lv3+ before adding support
- Watch for debuffs - they counter specific sprites
- Vampire's grey HP shield absorbs damage before your real HP

## Running Locally

Just open `index.html` in a browser, or:
```bash
python3 -m http.server 8000
```

## Tech

Vanilla HTML/CSS/JavaScript. No dependencies.
