<!-- locale: en-US; content-id: objects-events-enums-and-macros -->

# Objects, events, enums and macros

## Object catalog

### Controllers

| Object | Parent | Role |
|---|---|---|
| `world` | — | persistent controller; initializes and updates systems |
| `camera` | — | camera, target, limits, zoom and shake |
| `fader` | — | global fade rectangle |
| `border` | — | outer border and window resize |
| `closed_captions` | — | caption queue in the GUI |
| `menu` | — | title, naming, continue/reset/settings |
| `logo` | — | opening/logo |

Don't place extra copies of the controllers in every room. `world` creates them
at Game Start.

### Overworld

| Object | Parent | Role |
|---|---|---|
| `block` | — | barrier with `block_enabled` |
| `block_corner` | `block` | barrier/corner variant |
| `char` | `block` | base character, movement, direction and interaction |
| `char_player` | `char` | controllable player |
| `char_sign` | `char` | immobile object with the `text` variable |
| `char_save` | `char_sign` | heals and opens the save UI |
| `char_box` | `char_sign` | confirmation and box UI |
| `trigger` | — | entry/exit by overlap with `char` |
| `trigger_warp` | `trigger` | fade, landmark and room switch |
| `hint_landmark` | — | arrival point by `landmark_id` |
| `hint_bgm` | — | applies music/pitch per room |
| `hint_border` | — | applies border sprite per room |
| `hint_half_size` | — | sets the 2× camera scale |
| `exclamation` | — | icon of the encounter animation |
| `encounter_anim` | — | overworld → battle transition |

### Text and interface

| Object | Parent | Role |
|---|---|---|
| `text_typer` | — | interprets text and creates characters |
| `text_single` | — | one rendered character/sprite |
| `face` | — | portrait/face with emotions and speech |
| `ui_dialog` | — | overworld dialogue box |
| `ui_menu` | — | items, status and phone |
| `ui_save` | — | save point interface |
| `ui_box` | — | inventory/box transfer |

### Battle core

| Object | Parent | Role |
|---|---|---|
| `battle` | — | state machine and combat data |
| `battle_board` | — | background, border, collision and surface of the board |
| `battle_enemy` | — | mandatory base for enemies |
| `battle_turn` | — | base for attack orchestrators |
| `battle_bullet` | — | projectile base and collision |
| `battle_soul` | — | soul base, invincibility and game over |
| `battle_soul_red` | `battle_soul` | red soul with free movement |
| `battle_ui` | — | name, LV, HP and HUD |
| `battle_fader` | — | local battle fade |

### Battle menus and feedback

| Object | Parent | Role |
|---|---|---|
| `battle_button` | — | base of the four buttons |
| `battle_button_fight` | `battle_button` | FIGHT button |
| `battle_button_act` | `battle_button` | ACT button |
| `battle_button_item` | `battle_button` | ITEM button/empty state |
| `battle_button_mercy` | `battle_button` | MERCY button |
| `battle_menu_fight` | — | attack minigame base |
| `battle_menu_fight_knife` | `battle_menu_fight` | default knife aim/attack |
| `battle_menu_fight_anim_knife` | — | visual animation of the strike |
| `battle_menu_fight_hp_bar` | — | HP in the target selector |
| `battle_menu_item_scrollbar` | — | item scroll indicator |
| `battle_damage` | — | damage number and bar |
| `battle_death_particle` | — | enemy vaporization |
| `battle_death_particle_collision` | — | particle helper |
| `battle_dialog_enemy` | — | enemy speech bubble |
| `battle_result_flee` | — | flee animation |
| `shaker` | — | shake of a variable/instance |

### Game over and tools

| Object | Parent | Role |
|---|---|---|
| `gameover` | — | defeat sequence |
| `gameover_shard` | — | soul fragments |
| `demo_recorder` | — | records input states into a buffer |
| `demo_player` | — | plays back the input buffer; experimental |

## Extension events

### `char`

| Event | Function |
|---|---|
| Create | initializes direction, movement, collision and sprite tables |
| Step | moves, collides and picks the sprite |
| End Step | sets depth by Y |
| User Event 0 | **Interact**; faces the player |
| Clean Up | destroys the collision list |

Children with Create must use `event_inherited()`. Interactive children usually
also call the inherited User Event to turn toward the player.

### `trigger`

| Event | Name |
|---:|---|
| User Event 0 | Trigger/entered |
| User Event 1 | Leave/exited |

### `battle_enemy`

| User Event | Enum | Name |
|---:|---|---|
| 0 | `INIT` | Init |
| 1 | `BATTLE_START` | Battle Start |
| 2 | `MENU_START` | Menu Start |
| 3 | `MENU_SWITCH` | Menu Switch |
| 4 | `MENU_CHOICE_SWITCH` | Menu Choice Switch |
| 5 | `MENU_END` | Menu End |
| 6 | `DIALOG_START` | Dialog Start |
| 7 | `DIALOG_END` | Dialog End |
| 8 | `TURN_PREPARATION_START` | Turn Preparation Start |
| 9 | `TURN_PREPARATION_END` | Turn Preparation End |
| 10 | `TURN_START` | Turn Start |
| 11 | `TURN_END` | Turn End |
| 12 | `BOARD_RESETTING_START` | Board Resetting Start |
| 13 | `BOARD_RESETTING_END` | Board Resetting End |

### `battle_turn`

| User Event | Enum | Name |
|---:|---|---|
| 0 | `TURN_PREPARATION_START` | set up board/timing |
| 1 | `TURN_PREPARATION_END` | end of preparation |
| 2 | `TURN_START` | start the attack |
| 3 | `TURN_END` | destroys by default |

### `battle_bullet`

| User Event | Enum | Name |
|---:|---|---|
| 0 | `SOUL_COLLISION` | reaction/damage on touching the soul |
| 1 | `TURN_END` | destroys by default |

The parent's Step detects `place_meeting` and the parent's Draw clips to the
board surface.

### `battle_soul`

| User Event | Enum | Name |
|---:|---|---|
| 0 | `BULLET_COLLISION` | accepts collision if invincibility ran out |
| 1 | `HURT` | starts invincibility, sound and shake |

### `battle_menu_fight`

| User Event | Enum | Name |
|---:|---|---|
| 0 | `ANIM` | visual animation of the strike |
| 1 | `DAMAGE` | damage phase |
| 2 | `END` | ends/destroys the minigame |

### `text_typer`

| User Event | Name |
|---:|---|
| 0 | New Char |
| 1 | New Line |
| 2 | Command |
| 3 | Clear |
| 4 | Update Position |
| 5 | Group & Macro |
| 15 | Update Immediately |

Overriding these events changes the parser/renderer of all text. Prefer
existing commands and groups before editing the base.

## Battle enums

### `BATTLE_STATE`

| Name | Value |
|---|---:|
| `MENU` | 0 |
| `DIALOG` | 1 |
| `TURN_PREPARATION` | 2 |
| `IN_TURN` | 3 |
| `BOARD_RESETTING` | 4 |
| `RESULT` | 5 |

### `BATTLE_MENU`

| Name | Value |
|---|---:|
| `BUTTON` | 0 |
| `FIGHT_TARGET` | 1 |
| `FIGHT_AIM` | 2 |
| `FIGHT_ANIM` | 3 |
| `FIGHT_DAMAGE` | 4 |
| `ACT_TARGET` | 5 |
| `ACT_ACTION` | 6 |
| `ITEM` | 7 |
| `MERCY` | 8 |

### Choices

```text
BATTLE_MENU_CHOICE_BUTTON.FIGHT = 0
BATTLE_MENU_CHOICE_BUTTON.ACT   = 1
BATTLE_MENU_CHOICE_BUTTON.ITEM  = 2
BATTLE_MENU_CHOICE_BUTTON.MERCY = 3

BATTLE_MENU_CHOICE_MERCY.SPARE = 0
BATTLE_MENU_CHOICE_MERCY.FLEE  = 1
```

### `BATTLE_ENEMY_EVENT`

```text
INIT=0, BATTLE_START=1, MENU_START=2, MENU_SWITCH=3,
MENU_CHOICE_SWITCH=4, MENU_END=5, DIALOG_START=6, DIALOG_END=7,
TURN_PREPARATION_START=8, TURN_PREPARATION_END=9,
TURN_START=10, TURN_END=11,
BOARD_RESETTING_START=12, BOARD_RESETTING_END=13
```

### Other events

```text
BATTLE_SOUL_EVENT.BULLET_COLLISION = 0
BATTLE_SOUL_EVENT.HURT             = 1

BATTLE_BULLET_EVENT.SOUL_COLLISION = 0
BATTLE_BULLET_EVENT.TURN_END       = 1

BATTLE_TURN_EVENT.TURN_PREPARATION_START = 0
BATTLE_TURN_EVENT.TURN_PREPARATION_END   = 1
BATTLE_TURN_EVENT.TURN_START             = 2
BATTLE_TURN_EVENT.TURN_END               = 3

BATTLE_MENU_FIGHT_EVENT.ANIM   = 0
BATTLE_MENU_FIGHT_EVENT.DAMAGE = 1
BATTLE_MENU_FIGHT_EVENT.END    = 2
```

## Board and turn

### `BATTLE_BOARD`

```text
X=320, Y=320, UP=65, DOWN=65, LEFT=283, RIGHT=283
```

The directional measurements are extensions from the center, not total
width/height.

### `BATTLE_TURN`

| Value | Key | Value | Key |
|---:|---|---:|---|
| 0 | `TIME` | 18 | `BOARD_RESET_Y` |
| 1 | `BOARD_X` | 19 | `BOARD_RESET_UP` |
| 2 | `BOARD_Y` | 20 | `BOARD_RESET_DOWN` |
| 3 | `BOARD_UP` | 21 | `BOARD_RESET_LEFT` |
| 4 | `BOARD_DOWN` | 22 | `BOARD_RESET_RIGHT` |
| 5 | `BOARD_LEFT` | 23 | `BOARD_RESET_MOVE_TWEEN` |
| 6 | `BOARD_RIGHT` | 24 | `BOARD_RESET_MOVE_EASE` |
| 7 | `BOARD_MOVE_TWEEN` | 25 | `BOARD_RESET_MOVE_MODE` |
| 8 | `BOARD_MOVE_EASE` | 26 | `BOARD_RESET_MOVE_SPEED` |
| 9 | `BOARD_MOVE_MODE` | 27 | `BOARD_RESET_MOVE_DURATION` |
| 10 | `BOARD_MOVE_SPEED` | 28 | `BOARD_RESET_SIZE_TWEEN` |
| 11 | `BOARD_MOVE_DURATION` | 29 | `BOARD_RESET_SIZE_EASE` |
| 12 | `BOARD_SIZE_TWEEN` | 30 | `BOARD_RESET_SIZE_MODE` |
| 13 | `BOARD_SIZE_EASE` | 31 | `BOARD_RESET_SIZE_SPEED` |
| 14 | `BOARD_SIZE_MODE` | 32 | `BOARD_RESET_SIZE_DURATION` |
| 15 | `BOARD_SIZE_SPEED` | 33 | `SOUL_X` |
| 16 | `BOARD_SIZE_DURATION` | 34 | `SOUL_Y` |
| 17 | `BOARD_RESET_X` |  |  |

```text
BATTLE_TURN_BOARD_TRANSFORM_MODE.SPEED = 0
BATTLE_TURN_BOARD_TRANSFORM_MODE.DURATION = 1
```

## Depths

Lower values appear in front of higher values in GameMaker.

### `DEPTH_UI`

```text
PANEL=-100
TEXT=-200
ENCOUNTER_ANIM=-300
FADER=-400
```

### `DEPTH_BATTLE`

```text
BG=-100
ENEMY=-200
UI=-300
FADER=-400
BULLET=-500
BOARD=-600
UI_HIGH=-700
BULLET_OUTSIDE_LOW=-800
SOUL=-900
BULLET_OUTSIDE_HIGH=-1000
```

## Directions

```text
DIR.RIGHT = 0
DIR.UP    = 90
DIR.LEFT  = 180
DIR.DOWN  = 270
```

This order allows using the direction as an index for arrays allocated at
positions 0, 90, 180 and 270.

## Input

### `INPUT`

```text
UP=0, DOWN=1, LEFT=2, RIGHT=3, CONFIRM=4, CANCEL=5, MENU=6
```

### Created by `Input_Init`

```text
INPUT_TYPE.KEYBOARD=0
INPUT_TYPE.GAMEPAD=1
INPUT_TYPE.MOUSE=2

INPUT_STATE.NULL=0
INPUT_STATE.HELD=1
INPUT_STATE.PRESSED=2
INPUT_STATE.RELEASED=3
```

## Animation

Created by `Anim_Init`:

```text
ANIM_TWEEN.LINEAR=0
ANIM_TWEEN.SINE=1
ANIM_TWEEN.QUAD=2
ANIM_TWEEN.CUBIC=3
ANIM_TWEEN.QUART=4
ANIM_TWEEN.QUINT=5
ANIM_TWEEN.EXPO=6
ANIM_TWEEN.CIRC=7
ANIM_TWEEN.BACK=8
ANIM_TWEEN.ELASTIC=9
ANIM_TWEEN.BOUNCE=10

ANIM_EASE.IN=0
ANIM_EASE.OUT=1
ANIM_EASE.IN_OUT=2
```

`ANIM_DATA` is internal to the manager; don't rely on its numbers in gameplay.

## Game configuration

In `Macro_Game`:

```gml
#macro GAME_NAME "UNDERTALE Engine"
#macro GAME_AUTHOR "TML"
#macro GAME_VERSION "v0.0.0"
#macro GAME_SAVE_NAME "undertale_engine"
```

In `Macro_Engine`:

```gml
#macro ENGINE_VERSION "v0.6.0"
```

Change the `GAME_*` macros, not `ENGINE_VERSION`.

## Plot

Default:

```gml
enum PLOT {
    START
};
```

Add new milestones at the end to avoid changing the values of existing saves:

```gml
enum PLOT {
    START,
    FALOU_COM_MAYA,
    PORTA_ABERTA
};
```

## Storage flags/keys

### Static

| Macro | Key |
|---|---|
| `FLAG_STATIC_NAME` | `name` |
| `FLAG_STATIC_LV` | `lv` |
| `FLAG_STATIC_HP_MAX` | `hp_max` |
| `FLAG_STATIC_HP` | `hp` |
| `FLAG_STATIC_ATK` | `atk` |
| `FLAG_STATIC_ATK_ITEM` | `atk_item` |
| `FLAG_STATIC_DEF` | `def` |
| `FLAG_STATIC_DEF_ITEM` | `def_item` |
| `FLAG_STATIC_SPD` | `spd` |
| `FLAG_STATIC_SPD_ITEM` | `spd_item` |
| `FLAG_STATIC_INV` | `inv` |
| `FLAG_STATIC_INV_ITEM` | `inv_item` |
| `FLAG_STATIC_EXP` | `exp` |
| `FLAG_STATIC_GOLD` | `gold` |
| `FLAG_STATIC_ITEM_WEAPON` | `item_weapon` |
| `FLAG_STATIC_ITEM_ARMOR` | `item_armor` |
| `FLAG_STATIC_BATTLE_MENU_FIGHT_OBJ` | `battle_menu_fight_obj` |
| `FLAG_STATIC_PLOT` | `plot` |
| `FLAG_STATIC_KILLS` | `kills` |
| `FLAG_STATIC_ROOM` | `room` |
| `FLAG_STATIC_TIME` | `time` |
| `FLAG_STATIC_FUN` | `fun` |

### Slot info

```text
FLAG_INFO_NAME = "name"
FLAG_INFO_LV   = "lv"
FLAG_INFO_TIME = "time"
FLAG_INFO_ROOM = "room"
```

### Temporary

```text
FLAG_TEMP_ENCOUNTER = "encounter_id"
FLAG_TEMP_BATTLE_ROOM_RETURN = "battle_room_return"
FLAG_TEMP_GAMEOVER_SOUL_X = "gameover_soul_x"
FLAG_TEMP_GAMEOVER_SOUL_Y = "gameover_soul_y"
FLAG_TEMP_TRIGGER_WARP_LANDMARK = "trigger_warp_landmark"
FLAG_TEMP_TRIGGER_WARP_DIR = "trigger_warp_dir"
FLAG_TEMP_TEXT_TYPER_CHOICE = "text_typer_choice"
```

The dynamic flags and settings regions start empty for the game to fill in.

## Default items

```text
ITEM_EMPTY = ""
ITEM_DICE = "dice"
ITEM_STICK = "stick"
ITEM_BANDAGE = "bandage"
ITEM_TOY_KNIFE = "toy_knife"
ITEM_FADED_RIBBON = "faded_ribbon"
ITEM_PHONE_TML = "phone_tml"
```

The example item macros are declared in `Item_Custom`. Item IDs are strings and
need to exist in the `ItemTypeManager` before entering an inventory or
equipment.
