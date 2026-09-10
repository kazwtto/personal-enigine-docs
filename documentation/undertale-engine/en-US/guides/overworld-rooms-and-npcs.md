<!-- locale: en-US; content-id: overworld-rooms-and-npcs -->

# Overworld, rooms and NPCs

## How interaction works

`char_player` is a child of `char`. On confirm, it tests a small area in the
direction it is facing, looks for a `char` instance and calls its **User Event
0**. The base object `char` also:

- inherits collision from `block`;
- keeps `dir`, `move`, `move_speed` and `talking`;
- picks idle, move and talk sprites per direction;
- turns toward the player when interacting, except when `dir_locked = true`;
- orders depth using the vertical position.

This is the base for NPCs as well as signs, saves and boxes.

## Create a complete NPC

### 1. Prepare the sprites

Create the needed sprites, preferably with:

- origin at **bottom-center** (lower center, at the feet);
- small collision mask, mostly covering the feet/body;
- consistent frames across the four directions;
- clear names, such as `spr_npc_maya_down`, `spr_npc_maya_up` and
  `spr_npc_maya_right`.

If you use the same sprite for left and right, the engine can mirror it.

### 2. Create the object

Create `obj_npc_maya` and set **Parent = `char`**.

In the **Create** event:

```gml
event_inherited();

// Must be unique among characters used by dialogue commands.
char_id = 10;
dir = DIR.DOWN;

// Idle.
res_idle_sprite[DIR.UP]    = spr_npc_maya_up;
res_idle_sprite[DIR.DOWN]  = spr_npc_maya_down;
res_idle_sprite[DIR.LEFT]  = spr_npc_maya_right;
res_idle_sprite[DIR.RIGHT] = spr_npc_maya_right;

// Walking.
res_move_sprite[DIR.UP]    = spr_npc_maya_up;
res_move_sprite[DIR.DOWN]  = spr_npc_maya_down;
res_move_sprite[DIR.LEFT]  = spr_npc_maya_right;
res_move_sprite[DIR.RIGHT] = spr_npc_maya_right;

// Adjust the frames and speed to your sprite.
res_idle_image[DIR.UP] = 0;
res_idle_image[DIR.DOWN] = 0;
res_idle_image[DIR.LEFT] = 0;
res_idle_image[DIR.RIGHT] = 0;

res_move_image[DIR.UP] = 1;
res_move_image[DIR.DOWN] = 1;
res_move_image[DIR.LEFT] = 1;
res_move_image[DIR.RIGHT] = 1;

res_move_speed[DIR.UP] = 1 / 3;
res_move_speed[DIR.DOWN] = 1 / 3;
res_move_speed[DIR.LEFT] = 1 / 3;
res_move_speed[DIR.RIGHT] = 1 / 3;

// The left sprite reuses the right one and is mirrored.
res_idle_flip_x[DIR.LEFT] = true;
res_move_flip_x[DIR.LEFT] = true;
```

The `event_inherited()` is mandatory here. Without it, the parent's movement,
collision and sprite structures will not be initialized.

### 3. Implement the conversation

Add **User Event 0** (Interact):

```gml
event_inherited(); // makes the NPC look at the player

Dialog_Add("{char_link 10}* Hello!&* I'm Maya.{pause}{char_unlink}");
Dialog_Add("* This is a second dialogue box.");
Dialog_Start();
```

`Dialog_Add()` queues boxes. `Dialog_Start()` opens `ui_dialog` if there isn't
one already. `{char_link 10}` syncs `talking` with the typing, allowing the
object to use its talk sprites.

### 4. Place it in the room

Drag `obj_npc_maya` into the room. Check:

- the instance is on the correct layer;
- the visual origin is at the feet;
- the mask does not block the player from too far away;
- the NPC is within the camera bounds;
- the player can stand in front of it and confirm.

## NPC with changing dialogue

### Change that reverts when loading a save

Use the static area. It only goes to disk in `Storage_SaveGame()`:

```gml
event_inherited();

var data = Storage_GetStaticGeneral();
var times = data.Get("maya_conversations", 0);

if (times == 0) {
    Dialog_Add("* This is the first time we've talked.");
} else {
    Dialog_Add("* Good to see you again.");
}

data.Set("maya_conversations", times + 1);
Dialog_Start();
```

### Change that persists even without saving at a save point

Use the dynamic area and write immediately:

```gml
var dynamic = Storage_GetDynamic();
var general = dynamic.Get("general");

general.Set("saw_maya", true);
Storage_SaveDynamic();
```

Dynamic data is appropriate for metanarrative reactions. Common story data
usually belongs to the static area and a clear key/macro.

## Plot-conditioned NPC

In `Macro_Plot`, create milestones:

```gml
enum PLOT {
    START,
    SPOKE_WITH_MAYA,
    DOOR_OPEN
};
```

In the interaction event:

```gml
event_inherited();

switch (Player_GetPlot()) {
    case PLOT.START:
        Dialog_Add("* Look for the key in the corridor.");
        Player_SetPlot(PLOT.SPOKE_WITH_MAYA);
        break;

    case PLOT.SPOKE_WITH_MAYA:
        Dialog_Add("* Still looking for the key?");
        break;

    default:
        Dialog_Add("* The door is open now.");
        break;
}

Dialog_Start();
```

## Moving characters

Each direction has a count in `move[DIR.*]`. With the default speed of 2, the
character walks about 2 pixels per step during that count:

```gml
move[DIR.RIGHT] = 60;
```

You can also start a character's movement from within the text:

```gml
Dialog_Add(
    "* I'll go over there.{pause}" +
    "{char_dir 10 DIR.RIGHT}" +
    "{char_move 10 DIR.RIGHT 60}" +
    "{pause}* Done."
);
Dialog_Start();
```

Text commands run while the sentence is being processed; they don't
automatically wait for the walk to finish. Use pauses, states or Step logic when
you need exact synchronization.

## Signs and quick interactive objects

For something static, use `char_sign` as parent or place an instance of it and
set `text` in the **Creation Code**:

```gml
text = "* The sign says:&  ROAD CLOSED.";
```

`char_sign` sets `dir_locked = true`, adds `text` to the queue and opens the
dialogue.

Other ready bases:

- `char_save`: heals the player and opens `ui_save`;
- `char_box`: asks if you want to use the box and opens `ui_box`;
- `char_player`: controllable character.

## Collisions

`block` is the basic barrier. Its main property is:

```gml
block_enabled = true;
```

Change it to `false` to temporarily disable collision. `char` is also a child of
`block`, so characters block movement when their collision is active. Inside a
child of `char`, you can use:

```gml
collision = false;    // this character stops checking blocks when moving
block_enabled = false; // other characters stop colliding with it
```

Use `block_corner` for collision shapes that need to inherit the basic barrier.

## Triggers

`trigger` checks overlap with characters. Variables:

- `user_char = -1`: any `char_id`; use `0` for the player only;
- `_triggered`: internal control; do not change manually.

Events:

- **User Event 0 — Trigger**: character entered;
- **User Event 1 — Leave**: character left after triggering.

Create a child of `trigger` for a story event:

```gml
// Create
event_inherited();
user_char = 0;
```

```gml
// User Event 0
event_inherited();

if (Player_GetPlot() < PLOT.DOOR_OPEN) {
    Dialog_Add("* You felt a presence.");
    Dialog_Start();
}
```

## Room change with `trigger_warp`

Place a `trigger_warp` at the exit. In the instance's **Creation Code**:

```gml
target_room = room_corredor;
target_landmark = 1;
player_dir = DIR.DOWN; // -1 preserves the current direction

fade_in_time = 20;
fade_out_time = 20;
fade_in_color = c_black;
fade_out_color = c_black;
warp_wait = 0;

bgm_fade = false;
bgm_fade_time = 20;
```

In the destination room, place `hint_landmark` at the arrival point and set:

```gml
landmark_id = 1;
```

Landmark IDs only need to be unique within the destination room. The warp stores
the ID in temporary storage, changes rooms and places `char_player` on the
matching landmark.

## Music and per-room configuration

"Hint" objects apply settings right after the room starts:

### `hint_bgm`

```gml
bgm_slot = 0;
bgm = snd_musica_ruinas;
pitch = 1;
```

### `hint_border`

```gml
sprite = spr_minha_borda;
```

### `hint_half_size`

Sets `camera.scale_x = 2` and `camera.scale_y = 2`, useful for overworlds at a
lower logical resolution.

## Camera

`camera.target` usually points at `char_player`. The main variables are:

| Variable | Use |
|---|---|
| `width`, `height` | logical resolution of the view |
| `scale_x`, `scale_y` | zoom |
| `angle` | rotation |
| `target` | followed instance |
| `use_room_limit` | limits the view to the room bounds |
| `limit_top/bottom/left/right` | manual limits when applicable |

For a shake:

```gml
Camera_Shake(4, 4, 2, 2, true, true, 0.5, 0.5);
```

## NPC checklist

- [ ] The object is a child of `char`.
- [ ] The Create starts with `event_inherited()`.
- [ ] `char_id` is unique when `char_*` commands are used.
- [ ] The sprites exist and the origin is at the feet.
- [ ] User Event 0 calls `Dialog_Start()`.
- [ ] The text has `{pause}` when it needs to wait for confirmation.
- [ ] Storage keys are unique and have a default value.
- [ ] Interaction was tested in all four directions.

Next: [Items and inventories](/guides/items-and-inventories).
