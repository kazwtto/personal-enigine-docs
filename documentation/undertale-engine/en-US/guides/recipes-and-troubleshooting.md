<!-- locale: en-US; content-id: recipes-and-troubleshooting -->

# Recipes and troubleshooting

## Quick recipes

### Ground pickup

Create `obj_pickup_torta` as a child of `trigger`.

```gml
// Create
event_inherited();
user_char = 0;
```

```gml
// User Event 0 — Trigger
event_inherited();

var items = Item_GetInventoryItems();
if (items.Add(ITEM_TORTA)) {
    Dialog_Add("* You got the Pie!");
    Dialog_Start();
    instance_destroy();
} else {
    Dialog_Add("* Your inventory is full.");
    Dialog_Start();
}
```

To prevent it from respawning after leaving and re-entering the room:

```gml
// Create, after event_inherited()
var data = Storage_GetStaticGeneral();
if (data.Get("pickup_torta_ruinas", false)) {
    instance_destroy();
}
```

Before destroying it on pickup:

```gml
Storage_GetStaticGeneral().Set("pickup_torta_ruinas", true);
```

### Door that consumes a key

```gml
// User Event 0 of a char_sign child
event_inherited();

var items = Item_GetInventoryItems();

if (Inventory_RemoveFirst(items, ITEM_CHAVE)) {
    Storage_GetStaticGeneral().Set("porta_aberta", true);
    Dialog_Add("* You used the key.{sound `snd_door_open`}");
    Dialog_Start();
    block_enabled = false;
    visible = false;
} else {
    Dialog_Add("* It's locked.");
    Dialog_Start();
}
```

`Inventory_RemoveFirst` is given as a recipe in the items chapter; turn it
into a project script.

In Create, restore the state:

```gml
event_inherited();

if (Storage_GetStaticGeneral().Get("porta_aberta", false)) {
    block_enabled = false;
    visible = false;
}
```

### Encounter on step-on

Child of `trigger`:

```gml
// Create
event_inherited();
user_char = 0;
```

```gml
// User Event 0
event_inherited();

if (!Storage_GetStaticGeneral().Get("slime_derrotado", false)) {
    Encounter_Start(ENCOUNTER_SLIME);
}
```

When defeating/sparing the enemy, before removing it:

```gml
Storage_GetStaticGeneral().Set("slime_derrotado", true);
```

### Random step-based encounter

In an area controller:

```gml
// Create
passos_ate_encontro = irandom_range(180, 360);
_x_anterior = char_player.x;
_y_anterior = char_player.y;
```

```gml
// Step
var andou = (
    char_player.x != _x_anterior ||
    char_player.y != _y_anterior
);

if (andou && !instance_exists(ui_dialog) && !Player_IsInBattle()) {
    passos_ate_encontro--;

    if (passos_ate_encontro <= 0) {
        passos_ate_encontro = irandom_range(180, 360);
        Encounter_Start(choose(ENCOUNTER_SLIME, ENCOUNTER_MORCEGO));
    }
}

_x_anterior = char_player.x;
_y_anterior = char_player.y;
```

Movement here counts once per step while moving, not per actual pixel. Tune
it to the desired feel.

### Boss with phases

In the enemy's Create:

```gml
_phase = 0;
_hp_max = 300;
_hp = _hp_max;
```

After applying damage:

```gml
if (_phase == 0 && _hp <= 200) {
    _phase = 1;
    Dialog_Add("* The boss got serious.");
}

if (_phase == 1 && _hp <= 100) {
    _phase = 2;
    Dialog_Add("* The stage began to tremble.");
    Battle_SetEnemyDEF(_enemy_slot, 4);
}
```

In turn preparation:

```gml
switch (_phase) {
    case 0: instance_create_depth(0, 0, 0, obj_turn_boss_1); break;
    case 1: instance_create_depth(0, 0, 0, obj_turn_boss_2); break;
    case 2: instance_create_depth(0, 0, 0, obj_turn_boss_3); break;
}
```

### Simple cutscene

```gml
char_player.moveable = false;

Dialog_Add(
    "{char_link 10}* Come with me.{pause}" +
    "{char_move 10 DIR.RIGHT 90}{char_unlink}"
);
Dialog_Start();
```

In a Step controller, wait for the dialogue and the movement:

```gml
if (
    !instance_exists(ui_dialog) &&
    obj_npc_maya.move[DIR.RIGHT] <= 0
) {
    char_player.moveable = true;
    instance_destroy();
}
```

Always make sure there's an exit path that re-enables the player, even if
the scene is skipped.

### Persistent volume setting

Register/get a general zone on the `settings` storage, then:

```gml
var settings = Storage_GetSettings().Get("general");
settings.Set("music_volume", 0.7);
Storage_GetSettings().SaveToFile();

BGM_SetVolume(0, settings.Get("music_volume", 1), 0);
```

Load `settings` at the start of the game before applying the values; the
current base registers the storage, but the full settings screen flow is up
to the game.

## Symptom-based diagnosis

### "Function doesn't exist": `Item_Add`, `Flag_Set` or `GMU_Console_*`

You're following legacy documentation. In the current version:

- `Item_Add(obj)` became `Item_GetInventoryItems().Add(itemId)`;
- common flags became `Storage_GetStaticGeneral().Get/Set`;
- the old developer console is not present on the `master` branch.

Don't copy legacy scripts in isolation: they depend on the old architecture.

### Child object doesn't initialize or gives undefined variable

The child's event replaced the parent's. Add at the top:

```gml
event_inherited();
```

This is especially important in Create/Step for `char`, `battle_soul`,
`battle_bullet`, `battle_turn` and `battle_menu_fight`.

### NPC doesn't respond

Check:

1. the parent is `char` (direct or indirect);
2. the sprite/mask reaches the interaction area;
3. the player is facing the right direction;
4. User Event **0**, not Step/Collision, contains the dialogue;
5. the event calls `Dialog_Start()`;
6. no other `char` instance is covering the front of the player;
7. `char_player.moveable` and the `_moveable_*` flags are active.

### NPC doesn't turn or animate

- To turn on interaction, call `event_inherited()` in User Event 0.
- `dir_locked = true` prevents turning.
- Confirm `DIR.*` indices in the `res_*` tables.
- Confirm `res_override = false` for automatic selection.
- Use a consistent origin across sprites.

### Dialogue doesn't appear

- In the overworld, `Dialog_Start()` is missing.
- In battle, don't call `Dialog_Start`; the queue only shows in the DIALOG state.
- `Dialog_Start()` returns `false` if `ui_dialog` already exists or there's a `battle`.
- Make sure the text doesn't end early with `{end}`.
- Look for unclosed `{}` commands or backticks.

### Choice always returns the old value

The selection is written when the player confirms. Only read
`Player_GetTextTyperChoice()` after `ui_dialog` has been destroyed. Use a
Step and a `_ready` flag, like `char_box` does.

### Item shows up as `!UNDEFINED!`

- the ID wasn't registered in `Item_Custom`;
- the macro points to another string;
- the save contains a removed/renamed ID;
- registration happened after adding to the inventory.

Migrate old IDs before `Normalize()`, since normalizing removes invalid
items.

### Empty item name/info

Check:

- `item.<key>.name` and `item.<key>.info` keys;
- valid JSON;
- file listed in `string.txt`;
- language folder present in `list.txt`;
- `ItemTypeSimple("key")` uses exactly the same key.

### Full inventory

Always test the return:

```gml
if (!inventory.Add(ITEM_TORTA)) {
    // offer a box, leave it on the ground, or show a warning
}
```

Don't increase `capacity` without checking the `ui_menu` and `ui_box` layout.

### `Item_GetInventoryBoxes(0)` opens the wrong box

In the reviewed revision, the `switch` cases lack `break`. Use:

```gml
var box1 = Item_GetInventoryManager().Get("box1");
var box2 = Item_GetInventoryManager().Get("box2");
```

Or fix the function locally by adding `break` after each assignment.

### Encounter doesn't exist

- the ID must be `>= 0` and unique.
- `Encounter_Set` must be inside `Encounter_Custom()`.
- the enemy object must exist when the engine compiles.
- Confirm `Encounter_Start()` uses the same ID/macro.

### Enemy doesn't appear

- the parent/topmost base must be `battle_enemy`;
- use `-1` only for empty slots;
- a single enemy in the center must be `enemy_1`;
- don't destroy the instance in Create;
- check sprite, `visible`, alpha, scale and depth.

### Enemy receives ACT/damage meant for another one

Everyone receives global events. Convert and filter:

```gml
var alvo = Battle_ConvertMenuChoiceEnemyToEnemySlot(
    Battle_GetMenuChoiceEnemy()
);
if (alvo != _enemy_slot) exit;
```

### Enemy disappears, but the battle hangs

Destroying the instance doesn't clear the metadata. Use:

```gml
var slot = _enemy_slot;
Battle_RemoveEnemy(slot);
instance_destroy();
```

Also check `battle_dialog_enemy`, `battle_turn` and any projectiles that may
have been left over.

### Battle stuck in DIALOG

- a text may be waiting on `{pause}`;
- `Battle_SetDialogAutoEnd(false)` requires a manual call to `Battle_EndDialog()`;
- a custom `text_typer` may not destroy itself;
- clear the queue with `Dialog_Clear()` when cancelling a flow.

### Battle stuck in TURN_PREPARATION

- `battle_dialog_enemy` still exists;
- the board still has animations;
- `Battle_SetTurnPreparationAutoEnd(false)` requires
  `Battle_EndTurnPreparation()`;
- the turn was created after the point where the engine fires User Event 0.

Create the `battle_turn` in the enemy's User Event 8, not on Turn Start.

### Turn ends immediately

`BATTLE_TURN.TIME` wasn't set or stayed 0. Set it in the `battle_turn`'s
User Event 0:

```gml
Battle_SetTurnInfo(BATTLE_TURN.TIME, 300);
```

For manual control use `-1` and call `Battle_EndTurn()`.

### Invisible projectile

- inside the board, keep the inherited Draw that uses the surface;
- outside the board, draw directly and use `BULLET_OUTSIDE_LOW/HIGH`;
- check whether `Battle_GetBoardSurface()` exists on that frame;
- check sprite, alpha, scale and depth;
- projectiles created before Turn Start may be cleaned up by the transition.

### Projectile passes through without dealing damage

- the parent is `battle_bullet`;
- if the Step was overridden, `event_inherited()` is missing;
- the projectile/soul mask may not overlap;
- very high speeds can skip the collision between steps;
- the soul may be in its invincibility period.

For high speed, move in small substeps and test collision in each one.

### Projectile deals damage twice

You called `event_inherited()` in a Step that also implements its own
detection. Pick a single detection. `Battle_CallSoulEventHurt()` doesn't
reduce HP; it only starts feedback/invincibility, so call `Player_Hurt()`
once.

### Warp arrives at the wrong point/direction

Check IDs and `target_room`. Also, in the analyzed commit, `char_player`'s
Room Start clears the landmark key twice. The second line should clear the
direction:

```gml
z.Set(FLAG_TEMP_TRIGGER_WARP_LANDMARK, -1);
z.Set(FLAG_TEMP_TRIGGER_WARP_DIR, 0);
```

If your copy still contains two calls to
`FLAG_TEMP_TRIGGER_WARP_LANDMARK`, fix the second one.

### Save isn't created

- make sure `GAME_SAVE_NAME` has no spaces/special characters;
- test whether the `GAME_SAVE_NAME/fileN` folders are created on the target;
- `File_WriteAllText` doesn't explicitly create folders in the implementation;
- check the return of `SaveToFile()`;
- check the platform's permissions/sandbox;
- look for a struct/unsupported asset serialization error.

### Old save lost an item

`Inventory.Normalize()` removes unregistered IDs. Keep old aliases or
migrate the raw array to the new ID before normalizing.

### Room name shows up empty in the save menu

Add every playable room to `Player_GetRoomName(room)`:

```gml
case room_corredor:
    name = "Ruins Hallway";
    break;
```

The save stores the asset name and the UI converts it back before calling
this function.

### `Lang_GetInfo` doesn't find `info.ini`

In the reviewed revision, the function builds the path using
`GMU_LANG_PATH_STRING + LANG + GMU_LANG_PATH_INFO`, unlike the other
functions. If you're going to use metadata, adjust both occurrences to:

```gml
GMU_LANG_PATH_BASE + LANG + "/" + GMU_LANG_PATH_INFO
```

The default English language doesn't include `info.ini`, so that path isn't
needed for regular strings, fonts or sprites.

### Music restarts every time you enter a room

Use `hint_bgm`: it only calls `BGM_Play` when the slot isn't playing or
contains other audio. If you control it manually, compare `BGM_GetAudio(slot)`
before playing.

### Replay doesn't work

The current Demo system is experimental: buffer persistence/restoration is
commented out. Implement storage before using `Demo_StartPlaying()`.

## Error isolation strategy

1. Reproduce in a minimal room.
2. Test a base object without a custom child.
3. Re-enable one event at a time.
4. Print IDs, states and slots with `show_debug_message()`.
5. Confirm the parent in the editor.
6. Confirm whether the inherited event is needed.
7. Check asset/macro names and case.
8. Start a new game to separate a bug from an old save.
9. Compare with the current branch, not just `old_version_examples`.

Back to the [index](../README.md).
