<!-- locale: en-US; content-id: engine-systems -->

# Engine systems

## Player and attributes

Persistent attributes live in the general zone of static storage. Use the
`Player_*` functions; they centralize validation and formulas.

### Core attributes

| Field | Read | Set |
|---|---|---|
| name | `Player_GetName()` | `Player_SetName(name)` |
| LV | `Player_GetLv()` | `Player_SetLv(lv)` |
| HP | `Player_GetHp()` | `Player_SetHp(hp)` |
| max HP | `Player_GetHpMax()` | `Player_SetHpMax(hpMax)` |
| base ATK | `Player_GetAtk()` | `Player_SetAtk(atk)` |
| base DEF | `Player_GetDef()` | `Player_SetDef(def)` |
| speed | `Player_GetSpd()` | `Player_SetSpd(spd)` |
| invincibility | `Player_GetInv()` | `Player_SetInv(inv)` |
| EXP | `Player_GetExp()` | `Player_SetExp(exp)` |
| GOLD | `Player_GetGold()` | `Player_SetGold(gold)` |
| kills | `Player_GetKills()` | `Player_SetKills(kills)` |
| plot | `Player_GetPlot()` | `Player_SetPlot(plot)` |
| weapon | `Player_GetItemWeapon()` | `Player_SetItemWeapon(id)` |
| armor | `Player_GetItemArmor()` | `Player_SetItemArmor(id)` |

`Inv` means **invincibility frames**, not inventory.

### Item bonus and total

| Attribute | Item bonus | Effective total |
|---|---|---|
| ATK | `Get/SetAtkItem` | `Player_GetAtkTotal()` |
| DEF | `Get/SetDefItem` | `Player_GetDefTotal()` |
| speed | `Get/SetSpdItem` | `Player_GetSpdTotal()` |
| invincibility | `Get/SetInvItem` | `Player_GetInvTotal()` |

During battle, the total also includes `Battle_GetPlayerTempAtk/Def/Spd/Inv`.
These temporary modifiers reset to zero in a new battle.

### HP and damage

```gml
Player_Heal(10);
Player_Hurt(4);
```

Negative values redirect to the opposite operation. HP is clamped between 0
and the max.

For damage taken based on DEF:

```gml
var dano = Player_CalculateDamage(8, 1, 20);
Player_Hurt(dano);
```

The current formula:

```text
base
+ ceil((HP - 20) / 10), when HP >= 20
- total DEF / 5
→ round
→ clamp between minimum and maximum
```

### LV and EXP

`Player_UpdateLv()` levels up as many times as needed based on EXP.
`Player_LvUp(lv)` updates LV, max HP, and base ATK and DEF. The curves live
in:

- `Player_GetLvExp(lv)`;
- `Player_GetLvHpMax(lv)`;
- `Player_GetLvAtk(lv)`;
- `Player_GetLvDef(lv)`.

Edit these four functions if your game uses different progression. Level 20
is the cap of the current EXP table.

## Storage and saves

### Default zones

| Storage | File | Scope | When to use |
|---|---|---|---|
| `static` | `fileN/static.json` | per slot | normal progress; saved at the save point |
| `dynamic` | `fileN/dynamic.json` | per slot | memory that doesn't come back on load |
| `info` | `fileN/info.json` | per slot | name/LV/time/room in the menu |
| `settings` | `settings.json` | global | language, volume, and options |
| `temp` | none | session | passing data between systems/rooms |

The paths live under `GAME_SAVE_NAME`. `N` comes from
`Storage_GetSaveSlot()`.

### Common data

```gml
var data = Storage_GetStaticGeneral();

data.Set("ruins_door_open", true);
var aberta = data.Get("ruins_door_open", false);
```

`StorageZoneStruct.Get(key, default)` returns the default when the key
doesn't exist.

### Save and load

```gml
Storage_SetSaveSlot(0);
Storage_SaveGame();
```

`Storage_SaveGame()` updates the metadata and writes `static.json` and
`info.json`.

```gml
Storage_SetSaveSlot(0);
Storage_LoadGame();
```

`Storage_LoadGame()` loads `static` and `dynamic`. The menu/base should handle
switching to the saved room and the global settings according to the game's
flow.

For dynamic data:

```gml
var dyn = Storage_GetDynamic().Get("general");
dyn.Set("deaths_before_flowey", dyn.Get("deaths_before_flowey", 0) + 1);
Storage_SaveDynamic();
```

### Add your own zone

Inside `Storage_Custom_Static(storages)`, after creating `s`:

```gml
var quests = new StorageZoneStruct();
global._storage_cache_quests = quests;
s.Register("quests", quests);
```

Getter in your own script:

```gml
function Storage_GetQuests() {
    return global._storage_cache_quests;
}
```

Usage:

```gml
Storage_GetQuests().Set("pie_delivered", true);
```

Storage and zone IDs must be unique. The system serializes each zone as a
JSON property.

### Advanced custom zone

Inherit from `StorageZone` and implement:

```gml
function StorageZoneMeuSistema() : StorageZone() constructor {
    function OnWrite() {
        return { valor: global.meu_valor };
    }

    function OnRead(from) {
        global.meu_valor = from.valor ?? 0;
    }

    function OnClear() {
        global.meu_valor = 0;
    }
}
```

`DeserializeFromJson()` only clears the data after the entire JSON is parsed
successfully. Unknown zones in the file are ignored, which helps
compatibility across versions.

### Save caveats

- test folder creation and writes on every target platform;
- don't change `GAME_SAVE_NAME` after release without a migration;
- provide defaults for new keys;
- validate arrays/structs from older versions;
- don't save unstable asset IDs when a name/string is enough;
- keep backups when changing the format.

## Input

The game uses abstract actions:

```gml
INPUT.UP
INPUT.DOWN
INPUT.LEFT
INPUT.RIGHT
INPUT.CONFIRM
INPUT.CANCEL
INPUT.MENU
```

Querying:

```gml
if (Input_IsPressed(INPUT.CONFIRM)) {
    // a single step
}

if (Input_IsHeld(INPUT.LEFT)) {
    // while held
}

if (Input_IsReleased(INPUT.CANCEL)) {
    // the release step
}
```

### Add gamepad

After `Input_Init()` in the Game Start of `world`:

```gml
Input_Bind(INPUT.CONFIRM, INPUT_TYPE.GAMEPAD, 0, gp_face1);
Input_Bind(INPUT.CANCEL,  INPUT_TYPE.GAMEPAD, 0, gp_face2);
Input_Bind(INPUT.MENU,    INPUT_TYPE.GAMEPAD, 0, gp_face3);
Input_Bind(INPUT.UP,      INPUT_TYPE.GAMEPAD, 0, gp_padu);
Input_Bind(INPUT.DOWN,    INPUT_TYPE.GAMEPAD, 0, gp_padd);
Input_Bind(INPUT.LEFT,    INPUT_TYPE.GAMEPAD, 0, gp_padl);
Input_Bind(INPUT.RIGHT,   INPUT_TYPE.GAMEPAD, 0, gp_padr);
```

Types: `INPUT_TYPE.KEYBOARD`, `GAMEPAD`, `MOUSE`. `device` is used by
gamepads; the default code passes `0` for keyboard.

### Rebind an action

```gml
Input_Unbind(INPUT.CONFIRM);
Input_Bind(INPUT.CONFIRM, INPUT_TYPE.KEYBOARD, 0, vk_space);
```

`Input_Unbind()` removes all binds of that action.

### Override state

```gml
Input_SetStateOverride(INPUT.CONFIRM, INPUT_STATE.PRESSED);
// ...
Input_RemoveStateOverride(INPUT.CONFIRM);
```

Useful for replay, tests, and accessibility. While an override exists, the
real hardware of that action is ignored.

## Music (`BGM_*`)

The engine has slots `0..5`. Slot 0 is usually overworld and slot 5 is used
by battle.

```gml
BGM_Play(0, snd_musica_ruinas);
BGM_SetVolume(0, 0.7, 30);
BGM_SetPitch(0, 1);
```

Full signature:

```gml
BGM_Play(slot, audio, loop = true, loop_start = -1, loop_end = -1);
```

`loop_start` and `loop_end` allow a custom loop. Use positions accepted by
GameMaker's audio system and test the seam.

Other operations:

```gml
BGM_Pause(0);
BGM_Resume(0);
BGM_Stop(0);

BGM_IsPlaying(0);
BGM_IsPaused(0);
BGM_GetAudio(0);
BGM_GetID(0);
```

`BGM_SetVolume(slot, volume, time)` takes `time` in steps and converts it to
milliseconds. `BGM_SetPitch()` uses GameMaker's pitch multiplier.

For one-shot effects, keep using `audio_play_sound()`.

## Animations/tweens

Animate a real instance variable:

```gml
Anim_Create(
    id,                    // target
    "image_alpha",         // existing variable
    ANIM_TWEEN.CUBIC,
    ANIM_EASE.OUT,
    0,                     // start
    1,                     // change; destination = start + change
    30                     // duration in steps
);
```

With delay:

```gml
Anim_Create(id, "x", ANIM_TWEEN.BACK, ANIM_EASE.OUT, x, 100, 45, 10);
```

Tweens:

```text
LINEAR, SINE, QUAD, CUBIC, QUART, QUINT,
EXPO, CIRC, BACK, ELASTIC, BOUNCE
```

Easings: `IN`, `OUT`, `IN_OUT`.

Utilities:

```gml
Anim_IsExists(id, "x");
Anim_Destroy(id, "x");
var valor01 = Anim_GetValue(ANIM_TWEEN.SINE, ANIM_EASE.IN_OUT, 0.5);
```

`Anim_Destroy(target, var_name, skip)` can filter by variable and decide
whether to skip the final update. Use only names of real variables that
already exist on the target.

## Fade

Global fade:

```gml
fader.color = c_black;
Fader_Fade(-1, 1, 20); // current alpha → opaque
Fader_Fade(-1, 0, 20); // current alpha → transparent
```

The first argument `-1` means "start from the current alpha".

Battle-specific fade:

```gml
Battle_FadeFader(1, 20);
```

## Camera

```gml
camera.target = char_player;
camera.scale_x = 2;
camera.scale_y = 2;
camera.angle = 0;
```

Shake:

```gml
Camera_Shake(
    5, 5,   // X/Y distance
    2, 2,   // X/Y interval
    true, true, // X/Y random
    0.5, 0.5 // X/Y decay
);
```

## Borders

```gml
Border_SetEnabled(true);
Border_SetSprite(spr_minha_borda, true, 60);
```

Enabling changes the window to 960 × 540; disabling goes back to 640 × 480.
See:

```gml
Border_IsEnabled();
Border_GetSprite();
```

Dynamically loaded assets can be unloaded when the border switches; don't use
the same dynamic sprite in another system without coordinating its lifetime.

## Closed captions

```gml
CC_Add("[Door opening sound]", 120);
```

The default duration is 60 steps. `closed_captions` keeps a queue and draws
on the GUI. Use it for relevant sounds that have no visual representation.

## Frame skip

```gml
Game_SetFrameSkip(1);
var quantidade = Game_GetFrameSkip();
```

The system disables Draw Events on some frames; Step logic continues. It's a
visual/performance effect, not a game-speed control.

## Demo/replay

The API exposes recording and playback of input states:

```gml
Demo_AddInput(INPUT.UP);
Demo_AddInput(INPUT.DOWN);
Demo_AddInput(INPUT.LEFT);
Demo_AddInput(INPUT.RIGHT);
Demo_AddInput(INPUT.CONFIRM);

Demo_StartRecording();
Demo_PauseRecording();
Demo_ResumeRecording();
Demo_StopRecording();

Demo_StartPlaying();
Demo_PausePlaying();
Demo_ResumePlaying();
Demo_StopPlaying();
```

> [!WARNING]
> The system is incomplete in the analyzed v0.6.0: the lines that saved and
> restored the buffer are commented out, and the player starts with `_buffer = -1`.
> Treat it as an experimental base; implement the Base64 persistence before
> relying on replay in the final game.

## Game over

When `Player_GetHp() <= 0`, `battle_soul` records the soul's position in temp
Storage and goes to `room_gameover`. The room uses `gameover` and
`gameover_shard` for the visual sequence. To customize:

- replace sprites/sounds in the game over objects;
- preserve the temporary position flags;
- decide whether to load the last save, restart, or return to the menu;
- restore music, HP, and room explicitly.

## Shop and settings

The `room_shop` and `room_settings` rooms exist in the current base, but
there's no complete shop system among the default objects/scripts. Implement
your UI using `Item_GetTypeManager`, inventories, `Player_Get/SetGold`, and
Storage. Don't confuse tutorials for Zhazha's mod or other engines with this
branch's API.

Next: [API reference](/reference).
