# Sprite Survivor Strategy Guide
Try it live here: https://spritesurvivor.com/

A comprehensive guide to team compositions, strategies, and tips for clearing the game.


---

## Table of Contents

1. [Game Basics](#game-basics)
2. [New Features](#new-features)
3. [Boss Guide](#boss-guide)
4. [Tier List](#tier-list)
5. [S-Tier Compositions](#s-tier-compositions)
6. [A-Tier Compositions](#a-tier-compositions)
7. [Honorable Mentions (Fun Comps)](#honorable-mentions-fun-comps)
8. [Skill Usage Guide](#skill-usage-guide)
9. [General Tips](#general-tips)

---

## Game Basics

### Core Mechanics

- **Waves**: 30 seconds per wave, boss every 5 waves (5, 10, 15, 20)
- **Victory Condition**: Defeat the Wave 20 boss
- **Points**: Collect orbs to earn points, 10 points = 1 sprite summon
- **Merging**: Two sprites of the **same type AND same level** merge into one higher level sprite

### Why Merging Matters

| Level | Damage Multiplier | Range Bonus | Cooldown Reduction |
|-------|-------------------|-------------|-------------------|
| 1 | 1.0x | Base | Base |
| 2 | 1.5x | +20% | -5 frames |
| 3 | 2.25x | +44% | -10 frames |
| 4 | 3.38x | +73% | -15 frames |
| 5 | 5.06x | +107% | -20 frames |

A single Lv5 sprite massively outperforms five Lv1 sprites. **Focus on merging, not diversity.**

---

## New Features

### Hexer Enemy (Wave 6+)

A new purple ranged enemy that shoots **debuff-applying projectiles**. Same debuffs as bosses!

| Stat | Value |
|------|-------|
| Color | Purple |
| HP | 18 (fragile) |
| Damage | 5 (low) |
| Special | Projectiles apply random debuff |

**Strategy:** Prioritize killing Hexers before they debuff you. Knight can block their shots.

---

### Autopilot Mode (TAB)

Press TAB to toggle AI control:
- Automatically collects orbs (prioritizes skill orbs)
- Avoids enemies, projectiles, and bosses
- Uses skills when enemies are nearby
- Great for testing or relaxed gameplay

---

### Achievements (14 Total)

Unlock achievements by completing challenges:
- **First Win** - Beat the game
- **Sprite Master** - Win using only one sprite type (10 achievements)
- **All Sprites** - Use all 10 sprite types in one run
- **Speedrun** - Win in under 10 minutes
- **No Hit** - Win without taking damage

View achievements from the main menu. Progress saved in browser.

---

## Boss Guide

Each boss has unique mechanics that require different strategies.

### Boss Stats

| Boss | Wave | HP | Damage | Minions | Color |
|------|------|-----|--------|---------|-------|
| Demon Lord | 5 | 1200 | 55 | 3 Chasers | Red |
| Shadow King | 10 | 1800 | 82 | 5 Speedies | Purple |
| Void Emperor | 15 | 2400 | 110 | 7 Tanks | Dark |
| Death Titan | 20 | 3000 | 137 | 9 Bombers | Orange |

### Boss 1: Demon Lord (Wave 5)

**Unique Mechanics:**

| Mechanic | Description |
|----------|-------------|
| **Rage Mode** | Below 50% HP, attack speed increases by 25% |
| **Visual** | Pulsing orange ring when enraged |

**Strategy:** Kill quickly before rage activates. If rage triggers, expect faster projectile patterns. Knight's projectile blocking is very effective here.

---

### Boss 2: Shadow King (Wave 10)

**Unique Mechanics:**

| Mechanic | Description |
|----------|-------------|
| **Shadow Step** | Teleports to random position every 5 seconds |
| **Clone Decoy** | At 50% HP, spawns a weaker clone (20% boss HP) |

**Strategy:** Don't chase the boss when it teleports - let your sprites auto-target. Kill the clone immediately when it spawns, as it can distract your sprites from the real boss.

---

### Boss 3: Void Emperor (Wave 15)

**Unique Mechanics:**

| Mechanic | Description |
|----------|-------------|
| **Gravity Well** | Every 8 seconds, pulls player toward boss for 3 seconds |
| **Void Shield** | Regenerates 100 damage shield every 20 seconds |

**Strategy:**
- When gravity activates, move away from boss to counteract the pull
- Frost slow helps you escape gravity wells
- Burst damage is valuable to break shields quickly
- Melee builds actually benefit from gravity (free gap-closer!)

---

### Boss 4: Death Titan (Wave 20)

**Unique Mechanics:**

| Mechanic | Description |
|----------|-------------|
| **Death Aura** | Deals 1 damage/second to player within 150 range |
| **Enrage** | After 60 seconds, attack speed doubles permanently |

**Strategy:**
- **Ranged builds (Archer/Ninja):** Stay at 150+ range to avoid aura entirely
- **Melee builds (Knight):** Accept aura damage, ensure Cleric can outheal (2.5 HP/s > 1 dmg/s)
- **Kill before 60 seconds** to avoid enrage - most builds can do this easily
- Save Full Heal skill for this fight

---

### Common Attack Patterns (All Bosses)

All bosses share these 5 attack patterns, cycling every second:

| Pattern | Name | Description | Counter |
|---------|------|-------------|---------|
| 0 | Circle Burst | 12 projectiles in all directions | Move between gaps |
| 1 | Aimed Spread | 5 projectiles aimed at player | Dash sideways |
| 2 | Minion Spawn | Spawns boss-specific minions (see Boss Stats) | AOE clears them |
| 3 | Laser | Warning line, then beam | Move perpendicular |
| 4 | Spiral | 8 projectiles in rotating pattern | Stay mobile |

**Pro Tip:** Knight blocks and Berserker reflects work on ALL boss projectiles!

---

### Boss Debuffs (NEW!)

**All boss projectiles apply a random debuff on hit (5 seconds):**

| Debuff | Effect | Visual |
|--------|--------|--------|
| No Heal | Cannot recover HP from any source | Red aura |
| No Block | Knight/Berserker can't block or reflect | Gray aura |
| Slow | Movement speed reduced 50% | Cyan aura |
| Weakened | Boss takes 50% less damage | Purple aura |

**Strategy:**
- Multiple debuffs can stack (e.g., Slow + No Heal)
- Same debuff refreshes timer instead of stacking
- Watch for colored screen edge vignette indicating active debuffs
- Prioritize dodging boss projectiles even more now!

---

## Tier List

| Tier | Composition | Playstyle |
|------|-------------|-----------|
| S | Ninja / Cleric / Frost | Consistent DPS, safe, beginner-friendly |
| S | Knight / Cleric / Frost | High DPS, blocks projectiles, aggressive |
| S | Archer / Cleric / Frost | Budget, ultra-safe, 12 DPS, longest range (250) |
| A | Berserker / Cleric / Frost | Spin AOE, reflects projectiles back |
| A | Wizard / Cleric / Frost | Chain lightning, swarm destroyer |
| A | Bomber / Cleric / Frost | High burst, explosive AOE |
| B | Ninja / Vampire / Frost | Aggressive, dual sustain |
| B | Mage / Cleric / Frost | AOE specialist, range 100, solid damage |

---

## S-Tier Compositions

### Ninja / Cleric / Frost

**The Meta Pick** - Highest sustained DPS with excellent safety.

#### Why It Works

| Sprite | Role | Key Strength |
|--------|------|--------------|
| Ninja | Main DPS | 20 cooldown = constant damage output |
| Cleric | Sustain | Keeps you alive through boss fights |
| Frost | Utility | Slowed enemies = more hits, easier kiting |

#### Detailed Strategy

**Waves 1-3: Pure Ninja Rush**
- Summon nothing but Ninjas
- Prioritize orb collection aggressively
- Goal: Reach Lv2-3 Ninja before Wave 5 boss
- Skill usage: Save everything, you shouldn't need skills yet

**Wave 4: Preparation**
- Keep building Ninjas
- If you have 25+ points, summon your first Cleric
- Position near center of map for boss spawn flexibility

**Wave 5 (First Boss):**
- Kite in large circles
- Let your Ninja stack do the work
- Skill usage: Save Dash for emergency, use Screen Blast freely
- If Full Heal drops, save it for below 40% HP

**Waves 6-10: Add Utility**
- Get Cleric to Lv2 (two Clerics = one Lv2)
- Start adding Frost once Ninja is Lv3+
- Keep one Frost at Lv1-2 for slow field coverage

**Waves 11-15: Power Spike**
- Your Ninja should be Lv4+ by now
- Lv2+ Cleric provides steady healing
- Frost keeps swarms manageable
- Boss waves: Circle kite, let DPS do the work

**Waves 16-20: Victory Push**
- Do NOT summon new Lv1 sprites (they die instantly)
- Focus all points on merging existing sprites higher
- Final boss: Use all skills aggressively, you won't need to save them

#### Skill Priority

| Skill | When to Use |
|-------|-------------|
| Dash | Emergency escape, dodge boss attacks |
| Screen Blast | Large swarms, or anytime during boss fights |
| Full Heal | Below 30% HP, or before risky boss phase |
| Orb Magnet | Use immediately when safe, converts to more sprites |

---

### Archer / Cleric / Frost

**The Budget King** - Cheapest core, fastest power curve, safest range.

#### Why It Works

| Sprite | Role | Key Strength |
|--------|------|--------------|
| Archer | Main DPS | 10 cost, 12 DPS, 250 range = budget + safe |
| Cleric | Sustain | Essential for boss fights |
| Frost | Utility | Enemies never reach you |

#### Why S-Tier Now?

Archer received major buffs: damage 8→10, cooldown 60→50. This brings DPS from 8/s to 12/s, making it competitive with Ninja (15/s) while costing 33% less and having 66% more range.

#### Detailed Strategy

**Waves 1-3: Economy Advantage**
- Archer costs only 10 points (vs 15 for Ninja)
- You can summon 50% more sprites with the same points
- Rush to Lv3 Archer before anyone else can

**Wave 4: Build Lead**
- You should have Lv3 Archer already
- Start Cleric if points allow
- Your range advantage means enemies die before reaching you

**Wave 5 (First Boss):**
- Stay at max range (250 units)
- Circle the outer edge of the arena
- Boss should melt without you taking much damage

**Waves 6-10: Consolidate**
- Lv4 Archer is your goal
- Add Frost for insurance against Speedy enemies
- Cleric Lv2 for consistent healing

**Waves 11-15: Cruise Control**
- 250 range means you're shooting enemies as they spawn
- Frost slow + long range = enemies never touch you
- This is the safest comp in the game

**Waves 16-20: Clean Finish**
- Lv5 Archer with 107% bonus range is absurd
- Final boss is just a longer version of every other boss
- Keep kiting, keep shooting

#### Skill Priority

| Skill | When to Use |
|-------|-------------|
| Dash | Rarely needed due to range advantage |
| Screen Blast | Use freely, your safety margin is huge |
| Full Heal | Save for bosses, you shouldn't take much damage otherwise |
| Orb Magnet | Instant use, accelerates your already fast economy |

---

## A-Tier Compositions

### Wizard / Cleric / Frost

**The Chain Lightning Specialist** - Melts swarms, satisfying visuals.

#### Why It Works

- Chain lightning jumps between 6+ enemies (5 + level)
- Cooldown reduced to 70 = 8.6 DPS base, multiplied by chain hits
- Frost clumps enemies together for maximum chains

#### The Drawback

- 25 cost = moderate early game
- May struggle waves 1-5
- Requires good kiting to survive until Lv3 Wizard

#### Why A-Tier Now?

Wizard received buffs: cooldown 80→70, chain targets 3→5 + level. At Lv1, Wizard now hits 6 targets instead of 4, making it much better at clearing swarms.

#### Strategy Summary

**Waves 1-5:** Survive. Kite constantly. Get Wizard to Lv2 minimum before first boss. Use Dash liberally.

**Waves 6-10:** Wizard Lv3 is your power spike. Add Cleric for sustain. Swarms become trivial.

**Waves 11-20:** Chain lightning clears screens. Frost keeps enemies grouped. Enjoy the light show.

---

### Bomber / Cleric / Frost

**The Explosion Enjoyer** - High burst damage, AOE on every hit.

#### Why It Works

- 25 base damage (highest in game)
- Explosions hit multiple enemies
- 180 range keeps you safe

#### The Drawback

- 30 cost = slow merging
- 90 cooldown = moderate gaps between attacks
- Feast or famine damage pattern

#### Strategy Summary

**Waves 1-5:** Painful. You might only have Lv1-2 Bomber by first boss. Kite hard, use all skills.

**Waves 6-10:** Bomber Lv3 starts feeling good. Explosions clear clumps. Add Cleric ASAP.

**Waves 11-20:** Lv4+ Bomber one-shots most enemies. Boss damage is excellent. Frost groups enemies for maximum explosion value.

---

### Ninja / Vampire / Frost

**The Aggressive Sustain** - Two sources of healing, high risk high reward.

#### Why It Works

- Ninja provides ranged DPS
- Vampire provides melee DPS + 50% lifesteal (strong self-healing)
- No Cleric needed = more offensive power

#### The Drawback

- Vampire must be in melee range to heal
- If Vampire dies, you lose sustain
- More micro-management required

#### Strategy Summary

**Waves 1-5:** Rush Ninja as usual. Vampire is too expensive early.

**Waves 6-10:** Add Vampire once Ninja is Lv3+. Let Vampire facetank while Ninja shoots.

**Waves 11-20:** Lv3+ Vampire with 50% lifesteal is nearly unkillable. Play aggressive, stay near your Vampire.

---

## A-Tier Compositions (Continued)

### Berserker / Cleric / Frost

**Spin to Win + Reflect** - High AOE burst with projectile defense.

#### Why It Works

- Spin attack hits everything around the Berserker
- 20 base damage in AOE
- Frost keeps enemies in spin range

#### The Drawbacks

- 75 cooldown = moderate wait between spins
- Melee range = Berserker takes damage
- 20 cost = slower merging than Ninja/Archer
- **New:** Reflects enemy projectiles back at them!

#### Strategy Summary

**Waves 1-5:** Build Berserker stack. Accept that you'll take more damage than ranged comps.

**Waves 6-10:** Lv3 Berserker spins hit hard. Cleric is mandatory to keep you alive.

**Waves 11-20:** Frost + Berserker = lawnmower. Enemies walk into spin and die. Fun but risky.

#### Why A-Tier Now?

The 75 cooldown buff and projectile reflection make Berserker much stronger. Reflecting boss projectiles back deals significant damage while protecting you. Still requires good positioning but now competitive with ranged options.

---

## S-Tier Compositions (Continued)

### Knight / Cleric / Frost

**The Projectile Blocker** - High DPS with defensive utility.

#### Why It Works

- 15 damage, 45 cooldown = 20 DPS (highest sustained)
- Cheap at 15 cost
- **Blocks enemy projectiles** - destroys bullets that hit the Knight
- Satisfying slash attacks

#### The Drawbacks

- 40 range = must be in enemy's face
- Knights take melee damage constantly
- Requires Frost to kite effectively

#### Why S-Tier Now?

Projectile blocking completely changes Knight's viability. Against Shooters, Snipers, and boss bullet patterns, Knights act as shields for your player. Combined with Frost slow and Cleric healing, Knight becomes a powerful aggressive option that also provides protection.

#### Strategy Summary

Rush Knight early, add Cleric for sustain, then Frost to slow enemies into melee range. Position Knights between you and ranged enemies to block incoming fire.

---

## Honorable Mentions (Fun Comps)

These aren't optimal, but they're satisfying to play.

### The Zoo (One of Everything)

**Comp:** One of each sprite type

**Why It's Fun:**
- Variety of attack animations
- Feels like commanding an army
- Every fight looks different

**Why It's Bad:**
- No merging = all Lv1 sprites
- Lv1 sprites get one-shot in late waves
- You WILL lose around wave 15

**When to Play:** When you want chaos, not victory.

---

### The Frost Army

**Comp:** Pure Frost stack + one Cleric

**Why It's Fun:**
- Enemies move in slow motion
- Perma-slow the entire screen
- Very relaxing gameplay

**Why It's Bad:**
- Frost does 5 damage (lowest in game)
- Boss fights take forever
- You might time out before killing wave 20 boss

**When to Play:** When you want a chill (literally) experience.

---

### The Glass Cannon

**Comp:** Bomber / Wizard / Mage (no healer)

**Why It's Fun:**
- Maximum explosions and effects
- Screen constantly full of AOE
- When it works, it's beautiful

**Why It's Bad:**
- No sustain = one mistake and you're dead
- All three are expensive = slow start
- Boss fights are pure stress

**When to Play:** When you're feeling lucky.

---

### The Vampire Lord

**Comp:** Pure Vampire stack

**Why It's Fun:**
- Self-sustaining army of the undead
- 50% lifesteal means they heal you constantly
- Aesthetic as hell

**Why It's Bad:**
- 30 cost = very slow merging
- Melee range = all your Vampires clump on one enemy
- Swarms overwhelm you before lifesteal kicks in

**Why It's Better Now:** 50% lifesteal (up from 30%) makes pure Vampire more viable. Still not optimal, but surprisingly effective in late game.

**When to Play:** Halloween special runs.

---

## Skill Usage Guide

### Dash (Common - 50% spawn rate)

**What it does:** Teleport in movement direction, brief invincibility

**Best uses:**
- Escape when cornered
- Dodge boss projectiles
- Cross through enemy swarms

**Pro tip:** Dash has i-frames (invincibility frames). You can dash THROUGH attacks, not just away from them.

---

### Screen Blast (Common - 40% spawn rate)

**What it does:** Damage all enemies on screen

**Best uses:**
- Clear large swarms instantly
- Burst damage during boss fights
- Emergency clear when overwhelmed

**Pro tip:** Don't hoard it. It's common enough that you'll get more. Use it whenever there are 10+ enemies on screen.

---

### Full Heal (Rare - 10% spawn rate)

**What it does:** Restore HP to maximum

**Best uses:**
- When below 30% HP
- Before a boss fight if you're damaged
- Emergency panic button

**Pro tip:** NEVER use above 50% HP. This skill is rare and should be saved for critical moments.

---

### Orb Magnet (Very Rare - 5% spawn rate)

**What it does:** Instantly collect all orbs and skill orbs on map

**Best uses:**
- Immediately when safe
- Converts to points = more sprites
- Also collects any skill orbs on the ground

**Pro tip:** Use it ASAP. The points compound into stronger sprites, and there's no benefit to holding it.

---

## General Tips

### Movement

- **Kite in circles** - Large circular paths maximize sprite attack time
- **Never corner yourself** - Always have an escape route
- **Use the entire arena** - Enemies spawn from edges, staying center gives you reaction time

### Economy

- **Orbs despawn** - Collect them before they fade
- **Early points matter most** - 10 points in wave 1 = Lv5 sprite by wave 15
- **Don't summon late game Lv1s** - They die instantly and waste points

### Merging

- **Commit to 1-2 types early** - Spreading points delays power spikes
- **Cleric + Utility after core** - Get your main DPS to Lv3 before adding support
- **Count your sprites** - Know when your next summon will trigger a merge

### Boss Fights

- **Bosses spawn wave 5, 10, 15, 20**
- **Prepare on wave 4, 9, 14, 19** - Top off your comp, position center
- **Bosses have patterns** - Learn them, don't panic
- **Wave 20 boss is just longer** - Same mechanics, more HP

---

## Final Words

The meta is ranged DPS + Cleric + Frost. But the best strategy is the one you enjoy playing.

If spinning Berserkers bring you joy, spin away. If you want to cosplay a vampire lord, go for it.

Just know that Ninja/Cleric/Frost will get you that victory screen the fastest.

Good luck, survivor.
