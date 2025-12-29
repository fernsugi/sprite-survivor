# Story Mode

## Overview

Story Mode serves as a **prequel** to the main survival game. Players must free the 4 heroes before they can help fight the demons in the main game.

**Structure:**
- 4 Chapters (each ending with a hero Remnant boss fight)
- Chapters 2-4 locked until previous cleared
- **Ending** - unlocked after beating main game once (normal or cheat)
- Player names their character on first starting Chapter 1
- JRPG-style dialogue between gameplay sections
- Easier difficulty than survival mode

---

## The 4 Heroes

| Hero | Name | Color | Chapter |
|------|------|-------|---------|
| Warrior | **Rex** | Orange | 1 |
| Bouncer | **Beth** | Cyan | 2 |
| Angel | **Milia** | White | 3 |
| Laser | **Troy** | Magenta | 4 |

---

## Core Story

### The War Between Heroes and Demons

In a war between heroes and demons, the demons resorted to dirty tricks.

During a crucial battle, the demons sacrificed their own minions to hold down the heroes. Waves of minions rushed the heroes, grabbing onto them - some purposely letting the heroes' weapons pierce through their bodies just to trap them in place.

Through **deceit, sacrifice, and unjust means**, the demons ultimately got their hands on **"The Sentient"** - the ancient core that powers the sky and the earth.

The demons threatened the heroes: **"Comply, or we destroy the core and the entire world with it."**

The heroes had no choice.

They surrendered their powers and were locked away deep in a lair crawling with demons. Powerless, they could only watch as demons ravaged their world.

### The Final Breath

But the heroes had one thing left - their very essence, their spirit.

With their dying breath, they reached across dimensions, searching for someone who could help. They found **The Other World** - our world.

And they found **you**.

---

## UI & Menu Structure

### Main Menu
- **Story Mode** ← New
- **Survival** (renamed from "Start Game")
- **Cheat Mode**
- **Achievements**

### Story Mode Menu
```
[ Chapter 1 ]     - Always available
[ Chapter 2 ]     - Locked until Ch1 complete
[ Chapter 3 ]     - Locked until Ch2 complete
[ Chapter 4 ]     - Locked until Ch3 complete
[ Ending ]        - Locked until main game beaten once
```

---

## Gameplay Mechanics

### Map & Movement
- Same map dimensions as survival mode
- Different backgrounds per chapter (like boss phase environments)
- Player walks to glowing sprite to acquire it

### Sprite Panel (Left Side)
- Sprites appear in **original order** (same as survival mode)
- Unacquired sprites show as **blank/locked** slots
- When acquired, sprite appears in its designated slot

### Autopilot Rules
- Autopilot available during combat
- **When sprite appears:** Player is kicked out of autopilot
- Must manually walk to acquire sprite
- Autopilot can resume after acquisition

### Skill Orbs Per Chapter
| Chapter | Skill Orb Available |
|---------|---------------------|
| 1 | **Magnet** only |
| 2 | **Dash** only |
| 3 | **Nuke** only |
| 4 | **Heal** only |

(Hero skill orb not available in story mode - you're freeing them!)

---

## Dialogue System

### Rules
- RPG-style dialogue boxes showing speaker name
- **Player is silent** - never speaks
- NPCs (heroes, narration) do all the talking
- Heroes address player by their **set name**

### Format
```
[SPEAKER]
"Dialogue text here."

[NARRATOR]
Description of situation or action.
```

---

## Chapter 1: Rex's Remnant

**Theme:** Learn to kite
**Environment:** Dark Forest (same as waves 1-5)
**Skill Orb:** Magnet

### Sprite Unlocks
| Phase | Sprite | Lesson |
|-------|--------|--------|
| Start | **Archer** | Basic ranged attacks, kiting |
| After Minions | **Frost** | Slowing enemies |
| After Boss | **Knight** | Melee combat, blocking |

### Dialogue Script

**[Opening - Player enters Chapter 1 for first time]**

```
[NARRATOR]
Your consciousness drifts through an endless void...
Until a voice calls out to you.

[???]
"Can you hear me...?"

[???]
"Please... if anyone can hear this..."

[NARRATOR]
Four faint lights flicker before you.
One burns brighter than the rest - orange, like a dying flame.

[REX]
"You... you actually came."

[REX]
"I am Rex. I was once called the Warrior of Dawn."

[REX]
"We don't have much time. The demons... they've taken everything from us."

[REX]
"But you're different. You can interact with this world in ways we cannot."

[REX]
"Tell me your name, so that I may remember who saved us."
```

**[After player enters name]**

```
[REX]
"{PLAYER_NAME}... I will not forget it."

[REX]
"Listen carefully. In our world, the spirits of great warriors past linger as Sprites."

[REX]
"Most cannot see them, let alone command them. But you..."

[REX]
"You have the gift."

[NARRATOR]
A green light pulses in the distance.

[REX]
"There! That presence... it's the Archer. Go to it, {PLAYER_NAME}."

[REX]
"Walk toward the light and claim its power as your own."
```

**[After acquiring Archer]**

```
[REX]
"Yes! You did it. The Archer's spirit now fights alongside you."

[REX]
"But be warned - demons are coming. They sense your presence."

[REX]
"Use the Archer to strike from afar. Keep your distance. Survive!"
```

**[After defeating minion waves - Frost sprite appears]**

```
[NARRATOR]
As the last demon falls, a cold blue light emerges from the shadows.

[REX]
"The Frost spirit... it was drawn to your battle."

[REX]
"Claim it, {PLAYER_NAME}. Its power will slow your enemies."
```

**[After acquiring Frost]**

```
[REX]
"Good. You're learning fast."

[REX]
"Now... I must tell you something."

[REX]
"What you've been fighting are merely minions. The true challenge lies ahead."

[REX]
"When the demons captured us, they sealed away our powers."

[REX]
"Those powers have taken form - twisted reflections of who we once were."

[REX]
"To free me, you must defeat my Remnant."

[NARRATOR]
The ground trembles. An orange glow builds in the distance.

[REX]
"It comes. My power, corrupted and unchained."

[REX]
"Stay at range. Use the Frost to slow it. You can do this, {PLAYER_NAME}!"
```

**[Boss: Rex's Remnant appears]**

```
[NARRATOR]
A massive warrior materializes - a distorted echo of Rex.
Its eyes burn with mindless fury.

[REX'S REMNANT]
"..."

[REX]
"It cannot speak. It is not me - only a shadow of my strength."

[REX]
"Destroy it, and my power returns to me!"
```

**[After defeating Rex's Remnant - Knight sprite appears]**

```
[NARRATOR]
The Remnant shatters into light. The energy flows upward... and vanishes.

[REX]
"You... you actually did it."

[REX]
"I can feel it. My strength returning, piece by piece."

[NARRATOR]
A red light pulses nearby - the Knight spirit.

[REX]
"The Knight. It stood by me in countless battles."

[REX]
"Take it, {PLAYER_NAME}. It will protect you when arrows cannot."
```

**[After acquiring Knight - Chapter 1 Complete]**

```
[REX]
"You've done more than I dared hope."

[REX]
"But I am only one of four. My companions still suffer."

[REX]
"Beth... Milia... Troy... They need you."

[REX]
"Rest for now. When you're ready, seek out Beth's Remnant."

[REX]
"And {PLAYER_NAME}... thank you."

[NARRATOR]
Chapter 1 Complete.
Rex's power has been freed.

Three heroes remain...
```

---

## Chapter 2: Beth's Remnant

**Theme:** Learn to dodge, guard, and reflect
**Environment:** Volcanic (same as waves 6-10)
**Skill Orb:** Dash

### Sprite Unlocks
| Phase | Sprite | Lesson |
|-------|--------|--------|
| Start | (previous) | - |
| After Minions | **Berserker** | Reflecting projectiles, spin AOE |
| After Boss | **Wizard** | Chain lightning |

### Dialogue Script

**[Opening]**

```
[NARRATOR]
You return to the spirit realm.
A cyan light flickers weakly in the volcanic haze.

[BETH]
"So you're the one Rex told me about."

[BETH]
"I'm Beth. They called me the Bouncer back when I could actually fight."

[BETH]
"My power was all about momentum - keeping things moving, ricocheting attacks."

[BETH]
"The demons twisted that. My Remnant... it's chaos incarnate now."

[BETH]
"You'll need to learn to dodge, {PLAYER_NAME}. And if you can't dodge..."

[BETH]
"...reflect it right back at them."
```

**[After minion waves - Berserker sprite appears]**

```
[BETH]
"Not bad! You're getting the hang of this."

[NARRATOR]
An orange glow pulses with violent energy - the Berserker spirit.

[BETH]
"Oh, the Berserker. Wild one, that spirit."

[BETH]
"It can spin and deflect attacks. Against my Remnant... you'll need that."
```

**[After acquiring Berserker]**

```
[BETH]
"Perfect. Now you can fight fire with fire."

[BETH]
"My Remnant launches bouncing projectiles. They ricochet everywhere."

[BETH]
"Use your Knight to block what you can. Use the Berserker to send them back."

[BETH]
"And whatever you do... keep moving!"

[NARRATOR]
Bouncing lights appear on the horizon. The Remnant approaches.
```

**[Boss: Beth's Remnant appears]**

```
[NARRATOR]
A figure materializes, surrounded by orbiting spheres of energy.
Each sphere pulses with chaotic momentum.

[BETH]
"There it is. My power, running wild."

[BETH]
"Stay light on your feet, {PLAYER_NAME}!"
```

**[After defeating Beth's Remnant - Wizard sprite appears]**

```
[NARRATOR]
The Remnant bursts into countless sparks that fade into the sky.

[BETH]
"Hah! You actually pulled it off!"

[BETH]
"I can feel myself again. The real me, not that... thing."

[NARRATOR]
A cyan light crackles nearby - the Wizard spirit.

[BETH]
"The Wizard! Chain lightning, baby. Hits everything in sight."

[BETH]
"Take it. You've earned it."
```

**[After acquiring Wizard - Chapter 2 Complete]**

```
[BETH]
"Two down, two to go."

[BETH]
"Milia's next. She's... well, she's different from Rex and me."

[BETH]
"Her Remnant won't play fair. Projectiles won't work the way you expect."

[BETH]
"But I believe in you, {PLAYER_NAME}. Go get 'em."

[NARRATOR]
Chapter 2 Complete.
Beth's power has been freed.

Two heroes remain...
```

---

## Chapter 3: Milia's Remnant

**Theme:** Learn about projectiles, AOE, and special mechanics
**Environment:** Ice Cavern (same as waves 11-15)
**Skill Orb:** Nuke

### Sprite Unlocks
| Phase | Sprite | Lesson |
|-------|--------|--------|
| Start | (previous) | - |
| After Minions | **Mage** | Targeted AOE damage |
| After Boss | **Cleric** | Healing |

### Special Boss Mechanics
- Angel Remnant has a skill that **nullifies direct projectiles**
- Must hit with Wizard's lightning **indirectly** (2nd chain target onwards)
- Mage's AOE bypasses projectile immunity

### Dialogue Script

**[Opening]**

```
[NARRATOR]
The spirit realm grows cold. Ice crystals form in the air around you.
A pure white light shimmers in the frozen mist.

[MILIA]
"..."

[NARRATOR]
Silence. The light pulses gently.

[MILIA]
"...Forgive me. It has been so long since I've spoken to anyone."

[MILIA]
"I am Milia. The Angel, they called me."

[MILIA]
"My power was protection. I could erase any attack, shield any ally."

[MILIA]
"But now... my Remnant uses that power against you."

[MILIA]
"It will nullify your projectiles, {PLAYER_NAME}. Arrows, bolts, even lightning..."

[MILIA]
"If you strike directly, it will simply... vanish."
```

**[After minion waves - Mage sprite appears]**

```
[MILIA]
"You fight well. The others chose wisely in you."

[NARRATOR]
A purple light blooms from the ice - the Mage spirit.

[MILIA]
"The Mage. Its power is area magic - it strikes a location, not a target."

[MILIA]
"My Remnant cannot nullify what doesn't come 'at' it."

[MILIA]
"The Mage's explosions will bypass its defenses."
```

**[After acquiring Mage]**

```
[MILIA]
"There is another way to harm my Remnant."

[MILIA]
"The Wizard's lightning chains between targets. If the first target is not my Remnant..."

[MILIA]
"...the chain can still reach it. Indirectly."

[MILIA]
"Position your enemies between you and the Remnant. Let the lightning chain through them."

[MILIA]
"Prepare yourself, {PLAYER_NAME}. My Remnant awakens."

[NARRATOR]
White feathers drift from the sky as a holy light descends.
```

**[Boss: Milia's Remnant appears]**

```
[NARRATOR]
A radiant figure appears, wings spread wide.
A barrier of light surrounds it, deflecting all that approaches.

[MILIA]
"Beautiful and terrible... that was once my light."

[MILIA]
"Strike it with the Mage. Chain to it with the Wizard. You can do this."
```

**[After defeating Milia's Remnant - Cleric sprite appears]**

```
[NARRATOR]
The angelic Remnant folds its wings and dissolves into pure light.
The light drifts upward, peaceful at last.

[MILIA]
"Thank you, {PLAYER_NAME}. You've freed me from my own reflection."

[NARRATOR]
A warm yellow light appears - the Cleric spirit.

[MILIA]
"The Cleric. A healer, like I once was."

[MILIA]
"It will mend your wounds. You'll need it for what comes next."
```

**[After acquiring Cleric - Chapter 3 Complete]**

```
[MILIA]
"Only Troy remains."

[MILIA]
"He was always the strongest of us. His light could pierce anything."

[MILIA]
"His Remnant will be relentless. It will fire constantly, wearing you down."

[MILIA]
"You will need everything you've learned. And everything you've gathered."

[MILIA]
"Go, {PLAYER_NAME}. End this."

[NARRATOR]
Chapter 3 Complete.
Milia's power has been freed.

One hero remains...
```

---

## Chapter 4: Troy's Remnant

**Theme:** Sustain and survival
**Environment:** Void Realm (same as waves 16-20)
**Skill Orb:** Heal

### Sprite Unlocks
| Phase | Sprite | Lesson |
|-------|--------|--------|
| Start | (previous) | - |
| After Minions | **Vampire** | Lifesteal, overheal |
| After Boss | **Ninja**, **Bomber** | Fast attacks, explosions |

### Special Boss Mechanics
- Laser Remnant constantly fires beams that **chip away HP**
- Sustain is essential - Cleric healing + Vampire lifesteal + overheal

### Dialogue Script

**[Opening]**

```
[NARRATOR]
The void stretches endlessly before you.
A magenta light burns in the darkness - intense, unwavering.

[TROY]
"So. You're the one who freed the others."

[TROY]
"Rex, Beth, Milia... they speak highly of you."

[TROY]
"I am Troy. The Laser. My light once held back the demon armies alone."

[TROY]
"And now that same light will try to destroy you."

[TROY]
"My Remnant doesn't stop, {PLAYER_NAME}. It fires. And fires. And fires."

[TROY]
"You cannot dodge forever. You will take damage."

[TROY]
"The question is: can you heal faster than it hurts you?"
```

**[After minion waves - Vampire sprite appears]**

```
[TROY]
"Impressive. You've made it this far."

[NARRATOR]
A dark purple light pulses ominously - the Vampire spirit.

[TROY]
"The Vampire. It drains life from enemies to sustain itself."

[TROY]
"Against my Remnant, sustain is everything. The Cleric heals. The Vampire heals."

[TROY]
"Together, they might keep you alive long enough to win."
```

**[After acquiring Vampire]**

```
[TROY]
"You have all you need now."

[TROY]
"My Remnant awaits. It is... powerful. More than the others."

[TROY]
"I was the last to fall when the demons attacked. My Remnant reflects that strength."

[TROY]
"But you've come this far. You've freed three heroes."

[TROY]
"One more, {PLAYER_NAME}. Just one more."

[NARRATOR]
A searing light ignites in the void. The final Remnant has awakened.
```

**[Boss: Troy's Remnant appears]**

```
[NARRATOR]
A towering figure of pure energy materializes.
Beams of light arc from its form in all directions.

[TROY]
"Here it comes. My full power, unrestrained."

[TROY]
"Heal. Keep healing. And strike when you can!"
```

**[After defeating Troy's Remnant - Ninja and Bomber sprites appear]**

```
[NARRATOR]
The Remnant's light flickers... dims... and finally fades.
Silence falls over the void.

[TROY]
"...It's over."

[TROY]
"You actually did it, {PLAYER_NAME}. You freed all of us."

[NARRATOR]
Two lights emerge from where the Remnant fell - the Ninja and Bomber spirits.

[TROY]
"Take them. They're yours now."

[TROY]
"You've earned every sprite, every power, every victory."
```

**[After acquiring Ninja and Bomber - Chapter 4 Complete]**

```
[NARRATOR]
The four lights - orange, cyan, white, and magenta - gather before you.

[REX]
"You did it, {PLAYER_NAME}."

[BETH]
"Told you we picked the right one!"

[MILIA]
"Thank you... truly."

[TROY]
"The demons still hold The Sentient. Our world is not yet saved."

[TROY]
"But now... now we can fight back."

[REX]
"When you're ready, we'll face the demons together."

[BETH]
"Four Demon Lords stand between us and The Sentient."

[MILIA]
"But with you commanding the sprites, and us by your side..."

[TROY]
"We will reclaim our world."

[ALL HEROES]
"Thank you, {PLAYER_NAME}."

[NARRATOR]
Chapter 4 Complete.
All heroes have been freed.

The battle for The Sentient begins...
```

---

## Ending (Post-Game)

**Unlocked after:** Beating main game (Wave 20) once - normal or cheat mode

### Dialogue Script

```
[NARRATOR]
The final Demon Lord falls. The Sentient pulses with renewed light.

[REX]
"{PLAYER_NAME}... you did it."

[BETH]
"The demons are finished! The Sentient is safe!"

[MILIA]
"Our world... it will heal now."

[TROY]
"Thanks to you."

[NARRATOR]
The Sentient's light washes over the land.
Where demons once roamed, life begins to return.

[REX]
"You came from another world to save ours."

[REX]
"We can never repay that debt."

[BETH]
"But hey, if you ever want to visit..."

[MILIA]
"You will always be welcome here."

[TROY]
"The sprites will remember you. We will remember you."

[TROY]
"Farewell, {PLAYER_NAME}. Hero of Two Worlds."

[NARRATOR]
Your consciousness begins to fade, drifting back to where you came from.

But the bond remains.

Whenever you close your eyes, you can still feel them -
The sprites, the heroes, and a world you helped save.

[NARRATOR]
THE END

Thank you for playing Sprite Survivor.
```

---

## Sprite Unlock Summary

| Chapter | Start | After Minions | After Boss |
|---------|-------|---------------|------------|
| 1 | Archer | Frost | Knight |
| 2 | (previous) | Berserker | Wizard |
| 3 | (previous) | Mage | Cleric |
| 4 | (previous) | Vampire | Ninja, Bomber |

**Total: 10 sprites** (matches survival mode roster)

---

## Technical Notes

### Button Rename
- "Start Game" → **"Survival"**

### Sprite Panel Behavior
- Unacquired sprites = blank/locked slots
- Acquired sprites appear in **original order** (same positions as survival mode)

### Autopilot Behavior
- Available during combat phases
- **Disabled when sprite appears** - player must manually acquire
- Can resume after sprite acquisition

### Save Data Needed
- Player name
- Chapter completion status (1-4)
- Sprites unlocked
- Main game beaten flag (for Ending unlock)

---

## Wave Structure

Each chapter has **5 waves**:
- Waves 1-4: Minion waves (easier than survival mode)
- Wave 5: Remnant boss fight

**Difficulty:** Easy overall. Focus on teaching mechanics, not punishing players.

---

## Remnant Boss Attack Patterns

### Rex's Remnant (Warrior)
**Sound:** `SFX.heroWarrior()` for all attacks
**Theme:** Aggressive melee, teaches kiting

| Attack | Description | Counter |
|--------|-------------|---------|
| **Charge** | Warning indicator, then rushes at player | Move sideways, use Frost slow |
| **Cone Slash** | 240° melee swing (like hero Warrior) | Stay at range with Archer |
| **Ground Pound** | Jumps and lands, creates shockwave | Keep distance |

**Pattern:** Charge → Slash → Charge → Slash → Ground Pound → repeat
**HP:** Low (tutorial boss)
**Speed:** Medium, slowed significantly by Frost

---

### Beth's Remnant (Bouncer)
**Sound:** `SFX.heroBouncer()` for launches, `SFX.heroBallBounce()` for bounces
**Theme:** Chaos and projectile management, teaches dodging/reflecting

| Attack | Description | Counter |
|--------|-------------|---------|
| **Ball Burst** | Fires 3-5 bouncing balls | Dodge, Knight block, Berserker reflect |
| **Rapid Fire** | Quick succession of single balls | Keep moving |
| **Orbit** | Balls orbit Beth before launching outward | Wait for launch, then move |

**Pattern:** Ball Burst → Rapid Fire → Orbit → repeat
**HP:** Medium
**Speed:** Medium
**Note:** Balls disappear after 5 bounces or 8 seconds

---

### Milia's Remnant (Angel)
**Sound:** `SFX.heroAngel()` for all attacks
**Theme:** Projectile immunity puzzle, teaches indirect damage

| Attack | Description | Counter |
|--------|-------------|---------|
| **Nullify Aura** | Passive - destroys direct projectiles | Use Mage AOE or Wizard chain (indirect) |
| **Holy Rings** | Expanding rings of light | Move between rings |
| **Divine Shield** | Becomes invulnerable for 3 seconds | Wait it out, focus minions |
| **Feather Storm** | Rains feathers in area | Keep moving |

**Pattern:** Holy Rings → Feather Storm → Divine Shield → repeat
**HP:** Medium
**Speed:** Slow (floats around)
**Special:** Always has minions nearby for Wizard chains

---

### Troy's Remnant (Laser)
**Sound:** `SFX.heroLaser()` for all attacks
**Theme:** Unavoidable chip damage, teaches sustain

| Attack | Description | Counter |
|--------|-------------|---------|
| **Sweep Beam** | Laser sweeps across arena | Move perpendicular to beam |
| **Lock-On Burst** | Warning, then fires at player position | Move after warning |
| **Multi-Beam** | 3 lasers in spread pattern | Find the gaps |
| **Constant Pulse** | Passive chip damage every 2 seconds | Heal through it |

**Pattern:** Sweep → Lock-On → Sweep → Multi-Beam → repeat
**HP:** High (final story boss)
**Speed:** Stationary (teleports occasionally)
**Special:** Constant Pulse cannot be avoided - must out-heal it with Cleric + Vampire

---

## Sound & Music Design

### Dialogue System
- **Letter-by-letter display** (like classic JRPGs)
- **Skip:** Press SPACE to instantly show full sentence
- **Advance:** Press SPACE again to go to next dialogue
- **Sound:** Soft "blip" for each letter (can be subtle or muted)

### Dialogue BGM
Simple, smooth background music for dialogue scenes:
- **Opening/Story scenes:** Gentle, mysterious melody
- **Hero conversations:** Warm, hopeful tone
- **Before boss:** Tense, building anticipation
- **Victory/Chapter complete:** Triumphant, relieved

*(Can use simple procedural audio or short loops)*

### Remnant Boss Sounds
| Remnant | Sound Function |
|---------|----------------|
| Rex | `SFX.heroWarrior()` |
| Beth | `SFX.heroBouncer()`, `SFX.heroBallBounce()` |
| Milia | `SFX.heroAngel()` |
| Troy | `SFX.heroLaser()` |

All attack patterns use the same sound for now (their respective hero sound).

---

## Implementation Checklist

### UI
- [ ] Story Mode button on main menu
- [ ] Rename "Start Game" → "Survival"
- [ ] Chapter select screen (with lock icons)
- [ ] Player name input prompt
- [ ] Dialogue box system (speaker name, text, portrait?)

### Dialogue System
- [ ] Letter-by-letter text display
- [ ] Space to skip/advance
- [ ] Speaker name display
- [ ] {PLAYER_NAME} variable substitution
- [ ] Simple BGM system for dialogue

### Gameplay
- [ ] Story mode flag (different from survival)
- [ ] Reduced difficulty / enemy stats
- [ ] Sprite acquisition system (walk to sprite)
- [ ] Locked sprite panel slots
- [ ] Chapter-specific skill orbs only
- [ ] Autopilot disable on sprite appear

### Bosses
- [ ] Rex's Remnant (Warrior attacks)
- [ ] Beth's Remnant (Bouncer attacks)
- [ ] Milia's Remnant (Angel attacks + projectile immunity)
- [ ] Troy's Remnant (Laser attacks + constant damage)

### Save System
- [ ] Player name storage
- [ ] Chapter completion flags
- [ ] Sprite unlock tracking
- [ ] Main game beaten flag

### Post-Game
- [ ] Ending unlock check
- [ ] Ending cutscene/dialogue

