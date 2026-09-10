<!-- locale: en-US; content-id: engine-overview -->

# Engine overview

## What the Undertale Engine offers

The Undertale Engine is a GameMaker base project for UNDERTALE-style fangames.
It already includes:

- overworld with character, collision, camera, warps, and save points;
- a dialogue queue and a text renderer with built-in commands;
- items, inventories, equipment, and a phone;
- encounters with up to three enemy slots;
- FIGHT, ACT, ITEM, and MERCY menus;
- extensible turns, battle board, souls, and projectiles;
- stats, EXP, GOLD, LV, and player damage;
- JSON saves split into static data, dynamic data, info, and settings;
- localization of texts, sprites, and fonts;
- abstract input for keyboard, gamepad, and mouse;
- BGM slots, animations/tweens, camera, fade, borders, closed captions, and demos.

## Mind map

```text
room_init
└─ world (persistent)
   ├─ initializes Input, Lang, Item, Storage, Encounter, BGM, and Dialog
   ├─ creates camera, fader, border, and closed_captions
   └─ goes to logo/menu/overworld

Overworld
├─ char_player interacts with children of char
├─ Dialog_Add → Dialog_Start → ui_dialog → text_typer
├─ trigger_warp switches rooms
└─ Encounter_Start leads to room_battle

room_battle
└─ battle
   ├─ loads the encounter
   ├─ creates up to 3 battle_enemy
   ├─ alternates MENU → DIALOG → PREPARATION → TURN → RESET
   ├─ battle_turn controls the attack
   ├─ battle_bullet collides with battle_soul
   └─ ends in victory, flee, or game over
```

## Resources you normally edit

| Resource | Edit to |
|---|---|
| `Macro_Game` | game name, author, version, and save folder |
| `Macro_Plot` | story milestones |
| `Player_CustomInitialData` | attributes and inventory for a new game |
| `Item_Custom` | register items and inventories |
| `Encounter_Custom` | register encounters |
| `Storage_Custom_*` | add persistent data |
| `Lang_Custom` and `datafiles/locale` | languages, texts, fonts, and sprites |
| child objects of `char` | NPCs and interactive objects |
| child objects of `battle_enemy` | enemy logic |
| child objects of `battle_turn` | attack patterns |
| child objects of `battle_bullet` | projectiles and damage |

## Current vs. legacy

The official site was written for an old version. The most visible
differences are:

| Topic | Current API (`master`, v0.6.0) | Legacy version |
|---|---|---|
| Items | `ItemType` and `Inventory` constructors | child objects of `item` and old `Item_*` functions |
| Data/saves | `Storage`, `StorageZoneStruct` | `Flag_*` system |
| Game config | `Macro_Game` | some older texts cite `Macro_Engine` |
| Enemy events | includes `BATTLE_START` | old numbering without that event |
| Developer console | not on the current branch | existed via `GMU_Console_*` |

Don't copy raw User Event numbers from the old table. On the current version,
see [Objects, events, and macros](/guides/objects-events-enums-and-macros) and use the
`BATTLE_ENEMY_EVENT.*` names whenever calling events by code.

## Principles that avoid problems

1. Create child objects of the base objects; don't alter the base for each case.
2. When overriding an event that needs the parent's behavior, start with
   `event_inherited();`.
3. Register items and encounters exactly once in the `*_Custom` scripts.
4. Use unique IDs and macros to avoid typos.
5. Keep progress in `Storage`; don't scatter global variables across the game.
6. Never edit `_enemy_slot`: the engine assigns that value.
7. Use public functions (`Player_*`, `Battle_*`) instead of editing internal
   fields like `battle._state` directly.
8. Test one enemy/turn/projectile first; only then combine several.

## Initialization order

In the **Game Start** event of `world`, the engine runs:

1. `Anim_Init()`;
2. `Input_Init()` and the default binds;
3. `Lang_Init()` and loading of language 0;
4. `Item_Init()`;
5. `Storage_Init()` — which calls `Player_CustomInitialData()`;
6. `Encounter_Init()`;
7. `BGM_Init()`;
8. `Dialog_Init()`;
9. `Demo_Init()`;
10. creation of the persistent controllers and switch to the next room.

This explains two important rules: items must be registered before they are
added in `Player_CustomInitialData`, and encounters must be registered in
`Encounter_Custom` before `Encounter_Start()`.

## Scales and coordinates

- The UI and the battle use a reference area of **640 × 480**.
- The camera starts at `640 × 480` and can apply `scale_x`/`scale_y`.
- The default battle board has center `(320, 320)` and extents
  `up/down = 65`, `left/right = 283`.
- Overworld characters are depth-sorted from `y`. Use the sprite origin at the
  feet, usually **bottom-center**.

Next: [Getting started](/guides/getting-started).
