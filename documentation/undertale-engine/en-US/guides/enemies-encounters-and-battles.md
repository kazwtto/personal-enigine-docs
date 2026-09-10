<!-- locale: en-US; content-id: enemies-encounters-and-battles -->

# Enemies, encounters and battles

This chapter builds a complete battle: enemy, ACT, HP, damage, rewards, MERCY,
encounter, turn and projectile.

## Battle architecture

```text
Encounter_Custom
└─ Encounter_Set(ID, enemies, text, music...)
   └─ Encounter_Start(ID)
      └─ room_battle
         └─ battle creates the enemies and controls the states
            ├─ battle_enemy: decisions and reactions to menus
            ├─ battle_turn: current attack pattern
            ├─ battle_bullet: collision/damage
            ├─ battle_soul: player inside the board
            └─ battle_board: defensive area
```

The engine supports three **fixed slots**, from 0 to 2. A menu, however, only
lists living enemies. Always use the `Battle_Convert*` functions when comparing
a menu choice with `_enemy_slot`.

## State cycle

```text
MENU
  ↓ choose FIGHT/ACT/ITEM/MERCY
DIALOG
  ↓ resulting lines
TURN_PREPARATION
  ↓ enemy line + board transformation
IN_TURN
  ↓ timer or Battle_EndTurn()
BOARD_RESETTING
  ↓ board returns to its default
MENU
```

When there are no more enemies, the controller enters `RESULT`, grants the
accumulated rewards and returns to the previous room.

## Full tutorial: Slime

### 1. Visual and audio assets

Create, at minimum:

- `spr_enemy_slime` for the enemy;
- `spr_bullet_gota` for the projectile;
- `snd_battle_slime` or reuse an allowed sound;
- optionally attack, damage and death sounds.

In battle, the visual reference is 640 × 480. A single enemy naturally sits in
the center slot when registered as the second enemy argument.

### 2. Enemy object

Create `obj_enemy_slime` with:

- sprite: `spr_enemy_slime`;
- parent: `battle_enemy`.

#### Create

```gml
event_inherited();

_hp_max = 60;
_hp = _hp_max;
_defeated = false;
```

`event_inherited()` preserves `depth` and `_enemy_slot`. The engine assigns
`_enemy_slot` after Create; do not choose or modify this value.

#### User Event 0 — Init

```gml
/// @description Init

Battle_SetEnemyName(_enemy_slot, "* Slime");

Battle_SetEnemyActionNumber(_enemy_slot, 2);
Battle_SetEnemyActionName(_enemy_slot, 0, "* Check");
Battle_SetEnemyActionName(_enemy_slot, 1, "* Compliment");

Battle_SetEnemyDEF(_enemy_slot, 1);
Battle_SetEnemyCenterPos(_enemy_slot, x, y - 32);
Battle_SetEnemySpareable(_enemy_slot, false);
```

Practical action limit in the current structure: **6 per enemy**.

#### User Event 3 — Menu Switch

This event reacts when the menu screen changes. It creates the HP bar in the
target list and applies the damage when it reaches `FIGHT_DAMAGE`.

```gml
/// @description Menu Switch

switch (Battle_GetMenu()) {
    case BATTLE_MENU.FIGHT_TARGET:
        var bar = instance_create_depth(0, 0, 0, battle_menu_fight_hp_bar);
        bar.enemy_slot = _enemy_slot;
        bar.hp_max = _hp_max;
        bar.hp = _hp;
        break;

    case BATTLE_MENU.FIGHT_DAMAGE:
        var target = Battle_ConvertMenuChoiceEnemyToEnemySlot(
            Battle_GetMenuChoiceEnemy()
        );

        if (target != _enemy_slot) break;

        var damage = Battle_GetMenuFightDamage();
        if (damage < 0) break; // missed hit

        var previous_hp = _hp;
        _hp = max(0, _hp - damage);
        _defeated = (_hp <= 0);

        var pop = instance_create_depth(x, y - 72, 0, battle_damage);
        pop.damage = damage;
        pop.bar_hp_max = _hp_max;
        pop.bar_hp_original = previous_hp;
        pop.bar_hp_target = _hp;

        if (damage > 0) {
            audio_play_sound(snd_damage, 0, false);
            Camera_Shake(4, 2, 2, 2);
        }
        break;
}
```

#### User Event 5 — Menu End

ACT, defeat and MERCY go here. All enemies receive the event; for this reason,
filter the ACT/FIGHT target.

```gml
/// @description Menu End

var button = Battle_GetMenuChoiceButton();

switch (button) {
    case BATTLE_MENU_CHOICE_BUTTON.FIGHT:
        var fight_target = Battle_ConvertMenuChoiceEnemyToEnemySlot(
            Battle_GetMenuChoiceEnemy()
        );

        if (fight_target == _enemy_slot && _defeated) {
            var defeated_slot = _enemy_slot;

            Battle_RewardExp(8);
            Battle_RewardGold(6);

            var vapor = instance_create_depth(x, y, 0, battle_death_particle);
            vapor.sprite = sprite_index;
            audio_play_sound(snd_vaporize, 0, false);

            Battle_RemoveEnemy(defeated_slot);
            instance_destroy();
        }
        break;

    case BATTLE_MENU_CHOICE_BUTTON.ACT:
        var act_target = Battle_ConvertMenuChoiceEnemyToEnemySlot(
            Battle_GetMenuChoiceEnemy()
        );
        if (act_target != _enemy_slot) break;

        switch (Battle_GetMenuChoiceAction()) {
            case 0:
                Dialog_Add("* SLIME - AT 2 DF 1&* Likes compliments.");
                break;

            case 1:
                Dialog_Add("* You complimented the Slime's shine.");
                Dialog_Add("* Slime is pleased.");
                Battle_SetEnemySpareable(_enemy_slot, true);
                break;
        }
        break;

    case BATTLE_MENU_CHOICE_BUTTON.MERCY:
        if (
            Battle_GetMenuChoiceMercy() == BATTLE_MENU_CHOICE_MERCY.SPARE &&
            Battle_IsEnemySpareable(_enemy_slot)
        ) {
            var spared_slot = _enemy_slot;

            // Spare usually grants GOLD, but not EXP.
            Battle_RewardGold(6);
            Battle_RemoveEnemy(spared_slot);
            instance_destroy();
        }
        break;
}
```

Remove the slot with `Battle_RemoveEnemy()` before destroying the instance. This
clears the name, actions, defense, position and spareable state associated with
the slot.

#### User Event 8 — Turn Preparation Start

```gml
/// @description Turn Preparation Start

if (!instance_exists(obj_turn_slime)) {
    instance_create_depth(0, 0, 0, obj_turn_slime);
}

var speech = instance_create_depth(x + 70, y - 80, 0, battle_dialog_enemy);
speech.text = choose("blub...", "squish!", "...");
speech.template = 0;
```

The bubble is destroyed when its `text_typer` finishes. Preparation advances
automatically when there is no bubble and the board finished transforming.

### 3. Turn object

Create `obj_turn_slime` with parent `battle_turn`.

#### Create

```gml
event_inherited();

_spawn_left = 12;
```

#### User Event 0 — Turn Preparation Start

```gml
/// @description Turn Preparation Start

// 300 steps = approximately 5 seconds at 60 FPS.
Battle_SetTurnInfo(BATTLE_TURN.TIME, 300);

// Half the width and height from the center.
Battle_SetTurnInfo(BATTLE_TURN.BOARD_LEFT, 110);
Battle_SetTurnInfo(BATTLE_TURN.BOARD_RIGHT, 110);
Battle_SetTurnInfo(BATTLE_TURN.BOARD_UP, 70);
Battle_SetTurnInfo(BATTLE_TURN.BOARD_DOWN, 70);

// Soul position relative to the center of the board.
Battle_SetTurnInfo(BATTLE_TURN.SOUL_X, 0);
Battle_SetTurnInfo(BATTLE_TURN.SOUL_Y, 0);
```

#### User Event 2 — Turn Start

```gml
/// @description Turn Start

alarm[0] = 1;
```

#### Alarm 0

```gml
if (_spawn_left > 0) {
    var drop = instance_create_depth(
        battle_board.x + irandom_range(-90, 90),
        battle_board.y - battle_board.up - 16,
        0,
        obj_bullet_gota
    );
    drop.vspeed = irandom_range(2, 4);

    _spawn_left--;
    alarm[0] = 18;
}
```

The `battle` ends the turn by itself when `TIME` reaches zero. For a dynamically
sized attack, use `TIME = -1` and call `Battle_EndTurn()` when you finish:

```gml
// Optional Step for the infinite turn
if (_spawn_left <= 0 && !instance_exists(obj_bullet_gota)) {
    Battle_EndTurn();
}
```

### 4. Projectile object

Create `obj_bullet_gota` with:

- sprite: `spr_bullet_gota`;
- parent: `battle_bullet`.

#### Create

```gml
event_inherited();
image_speed = 0.25;
```

#### Step, if you want to destroy outside the board

If you add a Step to the child, call the inherited event to keep the collision
detection:

```gml
event_inherited();

if (y > battle_board.y + battle_board.down + 32) {
    instance_destroy();
}
```

#### User Event 0 — Soul Collision

```gml
/// @description Soul Collision

Player_Hurt(Player_CalculateDamage(4, 1));
Battle_CallSoulEventHurt();
instance_destroy();
```

The `battle_soul` only calls this event when the invincibility has run out. The
invincibility duration uses `Player_GetInvTotal()`.

The `battle_bullet` parent also has **User Event 1 — Turn End**, which destroys
the projectile. If you override this event, use `event_inherited()` or destroy
the instance explicitly.

### 5. Register the encounter

In `Encounter_Custom()`:

```gml
function Encounter_Custom() {
    // Encounter IDs must be unique and >= 0.
    #macro ENCOUNTER_SLIME 1

    Encounter_Set(
        ENCOUNTER_SLIME,
        -1,                    // slot 0: empty
        obj_enemy_slime,       // slot 1: center
        -1,                    // slot 2: empty
        "* Slime appeared!",   // flavor text
        snd_battle_slime,      // BGM
        true,                  // show Flee
        true,                  // pause overworld BGM
        false,                 // normal encounter animation
        48,                    // soul destination X in the animation
        454                    // soul destination Y in the animation
    );
}
```

Full signature:

```gml
Encounter_Set(
    id,
    enemy_0,
    enemy_1,
    enemy_2,
    menu_dialog,
    bgm = -1,
    menu_mercy_flee_enabled = true,
    pause_bgm = true,
    quick = false,
    soul_x = 48,
    soul_y = 454
);
```

Use `-1` for an empty slot. Each object needs `battle_enemy` as the base of its
inheritance chain.

### 6. Start the battle

From a trigger, NPC or Room Creation Code:

```gml
Encounter_Start(ENCOUNTER_SLIME);
```

Options:

```gml
Encounter_Start(
    ENCOUNTER_SLIME,
    true, // anim: show transition
    true  // exclam: show exclamation mark
);
```

For a direct test without transition:

```gml
Encounter_Start(ENCOUNTER_SLIME, false, false);
```

When starting outside a battle, the engine stores the current room in
`FLAG_TEMP_BATTLE_ROOM_RETURN`, marks the room as persistent and returns to it
after the result.

## Current `battle_enemy` events

| User Event | Name | Common use |
|---:|---|---|
| 0 | Init | name, actions, defense, HP, position |
| 1 | Battle Start | unique effects at the start |
| 2 | Menu Start | prepare each menu round |
| 3 | Menu Switch | HP bar, reaction to submenus and damage |
| 4 | Menu Choice Switch | reaction to cursor/target/action |
| 5 | Menu End | ACT, death, spare, choice result |
| 6 | Dialog Start | prepare lines after a choice |
| 7 | Dialog End | end of lines |
| 8 | Turn Preparation Start | create turn and bubble |
| 9 | Turn Preparation End | end of transformation |
| 10 | Turn Start | attack started |
| 11 | Turn End | clear specific state |
| 12 | Board Resetting Start | board started returning |
| 13 | Board Resetting End | board returned to its default |

> [!WARNING]
> The old site's table starts `MENU_START` at value 1. The current version
> inserted `BATTLE_START`, shifting the ones that follow. When firing by code,
> use `Battle_CallEnemyEvent(BATTLE_ENEMY_EVENT.MENU_START)`, never
> `event_user(1)` outside the object's implementation.

## `BATTLE_TURN` settings

### Time and soul

| Key | Meaning |
|---|---|
| `TIME` | duration in steps; `-1` to not end by the timer |
| `SOUL_X`, `SOUL_Y` | position relative to the center of the board |

### Board during the attack

- `BOARD_X`, `BOARD_Y`;
- `BOARD_UP`, `BOARD_DOWN`, `BOARD_LEFT`, `BOARD_RIGHT`;
- `BOARD_MOVE_TWEEN`, `BOARD_MOVE_EASE`;
- `BOARD_MOVE_MODE`, `BOARD_MOVE_SPEED`, `BOARD_MOVE_DURATION`;
- `BOARD_SIZE_TWEEN`, `BOARD_SIZE_EASE`;
- `BOARD_SIZE_MODE`, `BOARD_SIZE_SPEED`, `BOARD_SIZE_DURATION`.

### Return to default

The versions with the `BOARD_RESET_` prefix control the way back:

- position and size: `X`, `Y`, `UP`, `DOWN`, `LEFT`, `RIGHT`;
- tween/ease, mode, speed and duration for movement and size.

Modes:

```gml
BATTLE_TURN_BOARD_TRANSFORM_MODE.SPEED
BATTLE_TURN_BOARD_TRANSFORM_MODE.DURATION
```

Example with fixed duration and easing:

```gml
Battle_SetTurnInfo(
    BATTLE_TURN.BOARD_SIZE_MODE,
    BATTLE_TURN_BOARD_TRANSFORM_MODE.DURATION
);
Battle_SetTurnInfo(BATTLE_TURN.BOARD_SIZE_DURATION, 20);
Battle_SetTurnInfo(BATTLE_TURN.BOARD_SIZE_TWEEN, ANIM_TWEEN.CUBIC);
Battle_SetTurnInfo(BATTLE_TURN.BOARD_SIZE_EASE, ANIM_EASE.OUT);
```

## Projectiles inside and outside the board

The default `battle_bullet` draws inside the board's clipped surface. For an
external projectile, override the Draw and use an external depth:

```gml
// Create
event_inherited();
depth = DEPTH_BATTLE.BULLET_OUTSIDE_HIGH;
```

```gml
// Draw
draw_self();
```

Available depths:

- `BULLET`: inside the board;
- `BULLET_OUTSIDE_LOW`: outside, below the soul;
- `BULLET_OUTSIDE_HIGH`: outside, above the soul.

## Blue and orange projectile types

The base does not implement color/condition automatically. In a child's Step,
do the rule before calling the collision:

```gml
// Blue bullet example: only deals damage if the soul is moving.
var moving = (
    floor(battle_soul.x) != floor(battle_soul.xprevious) ||
    floor(battle_soul.y) != floor(battle_soul.yprevious)
);

if (place_meeting(x, y, battle_soul) && moving) {
    Battle_CallSoulEventBulletCollision();
}
```

In this case, you are replacing the parent's Step; do not call
`event_inherited()`, because it would do a second detection without the
condition.

## Custom soul

Create an object whose maximum base is `battle_soul`, implement movement and, at
the appropriate time:

```gml
Battle_SetSoul(obj_soul_blue);
```

If the child has Create/Step, use `event_inherited()` when you want to keep
depth, confinement to the board, invincibility and game over. The
`battle_soul_red` object is the free movement example.

## Multiple enemies

For two enemies:

```gml
Encounter_Set(
    2,
    obj_enemy_slime,
    -1,
    obj_enemy_morcego,
    "* A duo blocked the way!",
    snd_battle_dupla
);
```

Notes:

- all of them receive the battle events;
- filter ACT and damage by the chosen slot;
- decide which enemy creates `battle_turn`, or create a single orchestrator;
- `Battle_GetEnemyNumber()` only counts living instances;
- the menu's visual index is not always the slot; convert it;
- when removing, save the slot in a local variable before `Battle_RemoveEnemy()`.

## Rewards

```gml
Battle_RewardExp(8);
Battle_RewardGold(6);
```

These functions **accumulate** during the fight. Call them on defeat/spare, not
in Init, if you don't want a flee to grant an already-registered reward. On
victory, the engine adds EXP and GOLD to the player and calls
`Player_UpdateLv()`.

## Flee and custom MERCY menu

- `Battle_SetMenuMercyFleeEnabled(bool)` shows/hides Flee during the battle.
- `Battle_SetFleeable(bool)` forces the result of the flee check.
- `Battle_SetMenuChoiceMercyOverride(true)` replaces the default menu.
- `Battle_SetMenuChoiceMercyOverrideNumber(n)` sets the number of entries.
- `Battle_SetMenuChoiceMercyOverrideName(slot, text)` sets the labels.

If you override the MERCY menu, handle the choice in the enemies' Menu End event
or in your own controller.

## Quick debugging

During development, a temporary Draw GUI can display:

```gml
draw_text(8, 8, "state=" + string(Battle_GetState()));
draw_text(8, 24, "menu=" + string(Battle_GetMenu()));
draw_text(8, 40, "turn=" + string(Battle_GetTurnNumber()));
draw_text(8, 56, "time=" + string(Battle_GetTurnTime()));
```

Remove the overlay before publishing.

## Enemy checklist

- [ ] Object is a child of `battle_enemy`.
- [ ] Create calls `event_inherited()`.
- [ ] User Event 0 sets name, action number/names, DEF and center.
- [ ] `_enemy_slot` is never edited.
- [ ] Damage filters the selected target.
- [ ] Death registers rewards and calls `Battle_RemoveEnemy()`.
- [ ] ACT adds dialogue and changes the spareable state when appropriate.
- [ ] MERCY only removes spareable enemies.
- [ ] User Event 8 creates exactly one turn/orchestrator.
- [ ] Turn is a child of `battle_turn` and configures time/board.
- [ ] Projectile is a child of `battle_bullet` and deals damage in User Event 0.
- [ ] Encounter was registered in `Encounter_Custom` with a unique ID.
- [ ] `Encounter_Start()` correctly returns to the previous room.

Next: [Dialogues and localization](/guides/dialogues-text-and-localization).
