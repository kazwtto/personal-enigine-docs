<!-- locale: en-US; content-id: defining-enemies -->

# Defining enemies

A complete enemy is not just a sprite placed in the battle. It brings together
an object child of `battle_enemy`, its own state, menu configuration, responses
to the engine's events and an encounter that spawns it.

> [!NOTE]
> The engine does not provide a universal health variable for enemies. Each
> enemy object controls its own `hp`, applies FIGHT damage and decides when it
> should be removed, spared or defeated.

## Quick overview

| Part | Responsibility |
|---|---|
| object child of `battle_enemy` | enemy state and behavior |
| User Event 0 — Init | name, DEF, visual center and ACTs |
| User Event 1 — Battle Start | opening text or state of the fight |
| User Event 5 — Menu End | process FIGHT, ACT, ITEM and MERCY |
| User Events 8–11 | prepare, start and finish the defensive turn |
| `Encounter_Set()` | register the formation and the music |
| object child of `battle_turn` | create the attack pattern |

## 1. Create the base object

Create an object, for example `obj_enemy_training`, and set `battle_enemy` as
parent. The base object is intentionally empty: the engine sends events, but the
child decides what each event means.

In the **Create Event**, initialize only the state that belongs to the enemy:

```gml
event_inherited();

hp_max = 30;
hp = hp_max;
angry = false;
act_talked = false;
```

`event_inherited()` preserves any initialization added to the base object. Do
not set the slot manually: `Battle_SetEnemy()` assigns `_enemy_slot` before
firing the Init event.

## 2. Configure name, defense and ACTs

The `BATTLE_ENEMY_EVENT` enum corresponds, in the same order, to the object's
User Events. User Event 0 receives `BATTLE_ENEMY_EVENT.INIT`.

```gml
// User Event 0 — Init
Battle_SetEnemyName(_enemy_slot, "TRAINING DUMMY");
Battle_SetEnemyDEF(_enemy_slot, 2);
Battle_SetEnemyCenterPos(_enemy_slot, x, y - 48);

Battle_SetEnemyActionNumber(_enemy_slot, 2);
Battle_SetEnemyActionName(_enemy_slot, 0, "Check");
Battle_SetEnemyActionName(_enemy_slot, 1, "Talk");
```

Functions of this step:

- [`Battle_SetEnemy()`](/reference/battle-setenemy) places the object in a slot;
- [`Battle_SetEnemyName()`](/reference/battle-setenemyname) sets the label;
- [`Battle_SetEnemyDEF()`](/reference/battle-setenemydef) configures the defense;
- [`Battle_SetEnemyCenterPos()`](/reference/battle-setenemycenterpos) aligns effects;
- [`Battle_SetEnemyActionNumber()`](/reference/battle-setenemyactionnumber) creates the ACT entries;
- [`Battle_SetEnemyActionName()`](/reference/battle-setenemyactionname) names each ACT.

## 3. Understand all the events

| User Event | Enum | Moment |
|---:|---|---|
| 0 | `INIT` | after the enemy enters the slot |
| 1 | `BATTLE_START` | effective start of the battle |
| 2 | `MENU_START` | return to the main menu |
| 3 | `MENU_SWITCH` | submenu change |
| 4 | `MENU_CHOICE_SWITCH` | cursor moves to another choice |
| 5 | `MENU_END` | a choice was confirmed |
| 6 | `DIALOG_START` | dialogue before the turn starts |
| 7 | `DIALOG_END` | dialogue ends |
| 8 | `TURN_PREPARATION_START` | sets up the next turn |
| 9 | `TURN_PREPARATION_END` | preparation done |
| 10 | `TURN_START` | board and soul are ready |
| 11 | `TURN_END` | defensive pattern finished |
| 12 | `BOARD_RESETTING_START` | board starts returning to its default |
| 13 | `BOARD_RESETTING_END` | board finished returning |

You don't need to implement all of them. Use only the events where the enemy
needs to react.

## 4. Process FIGHT and the enemy's health

In User Event 5, find out which button was used. When it's FIGHT, read the
damage calculated by the UI and apply it to the enemy's own `hp`.

```gml
// User Event 5 — Menu End
var button = Battle_GetMenuChoiceButton();

if (button == BATTLE_MENU.FIGHT) {
    var damage = max(0, Battle_GetMenuFightDamage());
    hp = max(0, hp - damage);

    if (hp <= 0) {
        Battle_RewardExp(10);
        Battle_RewardGold(6);
        instance_destroy();
        Battle_RemoveEnemy(_enemy_slot);
    }
}
```

> [!WARNING]
> `Battle_RemoveEnemy()` clears the slot, but does not destroy the instance.
> When the enemy is defeated, handle both actions in the order that suits your
> object.

Related calls:

- [`Battle_GetMenuChoiceButton()`](/reference/battle-getmenuchoicebutton);
- [`Battle_GetMenuFightDamage()`](/reference/battle-getmenufightdamage);
- [`Battle_RewardExp()`](/reference/battle-rewardexp);
- [`Battle_RewardGold()`](/reference/battle-rewardgold);
- [`Battle_RemoveEnemy()`](/reference/battle-removeenemy).

## 5. Implement ACT

Still in User Event 5, check the chosen index in ACT. The index starts at zero
and follows the names registered in Init.

```gml
if (button == BATTLE_MENU.ACT) {
    switch (Battle_GetMenuChoiceAction()) {
        case 0: // Check
            Battle_SetDialog("* TRAINING DUMMY - ATK 0 DEF 2&* It waits patiently.");
            break;

        case 1: // Talk
            act_talked = true;
            Battle_SetEnemySpareable(_enemy_slot, true);
            Battle_SetDialog("* You explain that this is only practice.");
            break;
    }
}
```

`Battle_SetEnemySpareable()` controls the yellow state and allows SPARE to
resolve the enemy. The sparing condition remains the object's decision.

## 6. Set up the defensive turn

User Event 8 is a good place to set the pattern controller, the time and the
board size.

```gml
// User Event 8 — Turn Preparation Start
instance_create_depth(0, 0, 0, obj_turn_training);
Battle_SetTurnInfo(BATTLE_TURN.TIME, 150);
Battle_SetTurnInfo(BATTLE_TURN.BOARD_UP, 65);
Battle_SetTurnInfo(BATTLE_TURN.BOARD_DOWN, 65);
Battle_SetTurnInfo(BATTLE_TURN.BOARD_LEFT, 110);
Battle_SetTurnInfo(BATTLE_TURN.BOARD_RIGHT, 110);
```

The `obj_turn_training` object must be a child of `battle_turn`. Spawning the
projectiles belongs to it, not to the enemy. See [Bullet patterns](/systems/bullet-patterns).

## 7. Register the encounter

In `Encounter_Custom()`, register a formation that uses the created object:

```gml
#macro ENCOUNTER_TRAINING 100

Encounter_Set(
    ENCOUNTER_TRAINING,
    obj_enemy_training,
    noone,
    noone,
    "* The training begins.",
    snd_battle,
    true
);
```

Start the battle in the overworld:

```gml
Encounter_Start(ENCOUNTER_TRAINING);
```

## 8. Separate responsibilities

Avoid a single User Event with hundreds of lines. Extract decisions into the
object's own functions:

```gml
function ReceiveFightDamage() {
    var damage = max(0, Battle_GetMenuFightDamage());
    hp = max(0, hp - damage);
    return hp <= 0;
}

function ChooseTurn() {
    return angry ? obj_turn_training_fast : obj_turn_training;
}
```

This way, the User Event only reads the choice and forwards it to the correct
function.

## Enemy checklist

- [ ] The object is a child of `battle_enemy`.
- [ ] The Create Event calls `event_inherited()`.
- [ ] User Event 0 sets name, DEF, center and ACTs.
- [ ] The object keeps its own health variable.
- [ ] User Event 5 applies FIGHT and resolves ACT/MERCY.
- [ ] Defeat and spare clear the slot correctly.
- [ ] User Event 8 picks an object child of `battle_turn`.
- [ ] The encounter is registered in `Encounter_Custom()`.
