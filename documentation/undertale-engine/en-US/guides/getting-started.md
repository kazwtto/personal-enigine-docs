<!-- locale: en-US; content-id: getting-started -->

# Getting started

## Prerequisites

- GameMaker with support for the project's current format;
- familiarity with sprites, objects, events, rooms, and GML;
- Git/GitHub Desktop recommended for pulling updates without losing changes.

> [!WARNING]
> The `old_version` and `old_version_examples` branches have been archived and
> only work correctly in GameMaker versions before update 2.3.
> For a new project, use the `master` branch.

## Get and open the project

1. Open the [official repository](https://github.com/TML233/UndertaleEngine).
2. **Fork** it to your account if you want to track updates.
3. Clone the fork.
4. Create a branch for your game, e.g. `meu-jogo`.
5. Open `undertale_engine.yyp` in GameMaker.
6. Run the original project once before modifying anything.

If you prefer downloading the ZIP, it works, but updating and comparing your
changes gets harder.

## Minimal game configuration

Open `Macro_Game` and change:

```gml
#macro GAME_NAME "My Fangame"
#macro GAME_AUTHOR "My Name"
#macro GAME_VERSION "v0.1.0"
#macro GAME_SAVE_NAME "my_fangame"
```

`GAME_SAVE_NAME` should only contain letters, numbers, and `_`. It defines the
folder of the JSON files. Changing this value after publishing makes the game
look for saves in another folder.

In GameMaker, also adjust the platform options, executable name, icon, version
info, and resolution for your target.

## Get to know the default rooms

| Room | Role |
|---|---|
| `room_init` | first room; contains the persistent `world` |
| `room_logo` | logo/intro |
| `room_menu` | title, name, and loading |
| `room_area_0` | overworld demo area |
| `room_battle` | universal battle controller |
| `room_gameover` | defeat sequence |
| `room_shop` | reserved for the shop; the current base doesn't ship a complete system |
| `room_settings` | reserved for settings |

Keep `room_init` as the first room. Don't duplicate `world`, `camera`,
`fader`, or `border` manually in each room: `world` creates the controllers and
stays alive.

## Default controls

| Action | Keys |
|---|---|
| confirm | `Enter` or `Z` |
| cancel/slow-walk in battle | `Shift` or `X` |
| menu | `Ctrl` or `C` |
| move | arrow keys |
| fullscreen | `F4` |
| reset during development | `F2` |

The binds live in the **Game Start** event of `world`. Use the `Input_*` API to
add keyboard, gamepad, or mouse; see
[Engine systems](/guides/engine-systems#input).

## Your first playable map

1. Duplicate `room_area_0` or create an overworld room.
2. Add an instance layer for collision and another for characters.
3. Place `char_player`.
4. Draw walls with instances of `block` or child objects of `block`.
5. Place a `char_sign` and, in the instance's **Creation Code**, set:

```gml
text = "* Hi!&* This is my first room.";
```

6. Run it, approach the sign, and confirm.

`&` creates a new line. `char_player` looks for an instance of `char` in
front of it and calls that object's **User Event 0 (Interact)**.

## Player initial data

Edit `Player_CustomInitialData` for a new game:

```gml
function Player_CustomInitialData() {
    Player_SetName("PLAYER");
    Player_SetLv(1);
    Player_SetHpMax(20);
    Player_SetHp(20);
    Player_SetAtk(10);
    Player_SetDef(10);
    Player_SetSpd(2);
    Player_SetInv(40);
    Player_SetBattleFightMenuObj(battle_menu_fight_knife);

    var items = Item_GetInventoryItems();
    // Add here only IDs already registered in Item_Custom.

    Player_SetItemWeapon(ITEM_EMPTY);
    Player_SetItemArmor(ITEM_EMPTY);
}
```

This script is called while the storage zones are created. It also serves as
the default after clearing data. Don't use this function to grant an item every
time a room starts.

## Safe update workflow

1. Commit your changes on the game branch.
2. Update your fork's `master` branch from the official repository.
3. Merge `master` into the game branch.
4. Resolve conflicts while preserving your records in `Item_Custom`,
   `Encounter_Custom`, `Macro_*`, `Storage_Custom_*`, and your own assets.
5. Open the project and test new game, load, room switching, and battle.

Avoid renaming the `.yyp` file if you plan to keep merging updates; that
creates unnecessary conflicts.

## Checklist before creating content

- [ ] The original project runs without errors.
- [ ] Name, author, version, and save folder have been changed.
- [ ] The game is on its own branch.
- [ ] `room_init` is still first.
- [ ] A `char_sign` shows dialogue.
- [ ] The player collides with `block`.
- [ ] You know where `Item_Custom`, `Encounter_Custom`, and
      `Player_CustomInitialData` are.

Next: [Overworld and NPCs](/guides/overworld-rooms-and-npcs).
