<!-- locale: en-US; content-id: dialogues-text-and-localization -->

# Dialogues, text and localization

## Dialogue queue

Standard flow in the overworld:

```gml
Dialog_Add("* First box.");
Dialog_Add("* Second box.");
Dialog_Start();
```

- `Dialog_Add(text)` queues a string.
- `Dialog_Start()` creates `ui_dialog` only outside battle.
- `ui_dialog` pulls one string at a time and hands it to `text_typer`.
- `Dialog_Get()` pops the next string from the queue.
- `Dialog_IsEmpty()` checks the queue.
- `Dialog_Clear()` discards the rest.

During battle, use `Dialog_Add()` in enemy events, but you don't need to call
`Dialog_Start()`: the `battle` object processes the queue in the `DIALOG`
state.

## Basic text

```gml
Dialog_Add("* One line.&* Another line.{pause}{clear}* New page.");
Dialog_Start();
```

| Syntax | Effect |
|---|---|
| `&` | new line |
| `\{`, `\}` or `\&` | treats the character as text when needed |
| `{command arguments}` | runs a `text_typer` command |
| `` `text with spaces` `` | string argument inside a command |

Use `{pause}` when the player must confirm. Use `{end}` when you created a
`text_typer` directly; `ui_dialog` and `Battle_SetDialog` usually add ending to
the flow already.

## Expressive example

```gml
Dialog_Add(
    "{char_link 10}" +
    "{voice VOICE.DEFAULT}" +
    "* This is {color `yellow`}important{color `white`}!" +
    "{sleep 20}&* Got it?" +
    "{pause}{char_unlink}"
);
Dialog_Start();
```

## Text command reference

### Rhythm and flow

| Command | Example | Effect |
|---|---|---|
| `speed` | `{speed 2}` | frames between character groups |
| `sleep` | `{sleep 30}` | waits frames; ignored when skipping/instant |
| `pause` | `{pause}` | waits for confirm |
| `instant` | `{instant true}` | processes text immediately |
| `skippable` | `{skippable false}` | allows/blocks skipping with Cancel |
| `clear` | `{clear}` | erases characters already spawned |
| `end` | `{end}` | destroys the `text_typer` |
| `skip_space` | `{skip_space true}` | controls fast handling of spaces |

### Appearance

| Command | Example | Effect |
|---|---|---|
| `color` | `{color `yellow`}` | full preset white/yellow/red |
| `color_text` | `{color_text `red`}` | text color |
| `color_shadow` | `{color_shadow `black`}` | shadow color |
| `color_outline` | `{color_outline `white`}` | outline color |
| `shadow` | `{shadow true}` | toggles shadow |
| `outline` | `{outline true}` | toggles outline |
| `shadow_pos` | `{shadow_pos 1}` | shadow X and Y |
| `shadow_x` | `{shadow_x 2}` | horizontal offset |
| `shadow_y` | `{shadow_y 2}` | vertical offset |
| `alpha` | `{alpha 0.5}` | overall character alpha |
| `alpha_text` | `{alpha_text 0.5}` | text alpha |
| `alpha_shadow` | `{alpha_shadow 0.5}` | shadow alpha |
| `alpha_outline` | `{alpha_outline 0.5}` | outline alpha |
| `font` | `{font FONT.BATTLE}` | font group |
| `scale` | `{scale 2}` | X and Y scale |
| `scale_x` | `{scale_x 2}` | horizontal scale |
| `scale_y` | `{scale_y 2}` | vertical scale |
| `space_x` | `{space_x 1}` | extra space between characters |
| `space_y` | `{space_y 2}` | extra space between lines |
| `effect` | `{effect 0}` | effect 0 = shake; -1 = none |
| `depth` | `{depth -200}` | character depth |
| `gui` | `{gui true}` | draws in Draw GUI |

Colors by name recognized by `GetColorFromString()`:

```text
white, black, red, yellow, gray, gray_dark, gray_light
```

`color` only has its own presets for white, yellow and red. For the others,
prefer `color_text`, `color_shadow` and `color_outline`.

Color commands accept one color or four colors (one value per corner), for
example:

```gml
"{color_text `red` `yellow` `white` `gray`}* Gradient"
```

### Voice, face and embedded sprite

| Command | Example | Effect |
|---|---|---|
| `voice` | `{voice VOICE.DEFAULT}` | sound group per character; -1 mutes |
| `voice_single` | `{voice_single 0}` | pins one sample of the group |
| `face` | `{face 0}` | creates the face registered in the slot; -1 removes |
| `face_emotion` | `{face_emotion 1}` | switches the emotion of the created/linked face |
| `face_link` | `{face_link 5}` | links a `face` object by `face_id` |
| `face_unlink` | `{face_unlink}` | removes the link |
| `sprite` | `{sprite `spr_coracao` 0}` | inserts a sprite frame into the text |

Default slots defined by the `text_typer`:

- `FONT.DIALOG = 0`, `FONT.MENU = 1`, `FONT.BATTLE = 2`;
- `VOICE.NULL = -1`, `VOICE.DEFAULT = 0`, `VOICE.TYPER = 1`;
- face 0 uses the base object `face`.

For a custom face, create a child of `face`, set up `idle_sprite`,
`talk_sprite`, images and speeds per emotion, and register the object in the
`text_typer` face group (User Event 5 — Group & Macro). Make this change with
care, because that event also sets up all default fonts and voices.

### Characters

| Command | Example | Effect |
|---|---|---|
| `char_link` | `{char_link 10}` | syncs `talking` of the `char_id` |
| `char_unlink` | `{char_unlink}` | removes the link |
| `char_dir` | `{char_dir 10 DIR.LEFT}` | changes direction |
| `char_move` | `{char_move 10 DIR.RIGHT 60}` | sets the move count |
| `char_player_moveable` | `{char_player_moveable false}` | tries to change the player's `moveable` |

> [!WARNING]
> In the analyzed commit, `char_player_moveable` validates the argument with
> list access, but assigns using `cmd[1]`, an inconsistent form. If the command
> doesn't work in your version, use direct GML:
> `char_player.moveable = false/true`.

### Macros and conditions

| Command | Example | Effect |
|---|---|---|
| `define` | ``{define `NAME` `Maya`}`` | creates/replaces a local text macro |
| `undefine` | ``{undefine `NAME`}`` | removes the macro |
| `insert` | `{insert NAME}` | inserts the value at the current point |
| `if` | see below | inserts text based on comparison |
| `choice` | see below | creates a binary choice |

Substitution:

```gml
var text =
    "{define `NAME` `Maya`}" +
    "* Hello, {insert NAME}!";
```

Condition:

```gml
var text =
    "{define `HP` 20}" +
    "{if HP `>=` 20 `* Full health.` `else` `* Low health.`}";
```

Operators: `==`, `!=`, `>`, `>=`, `<`, `<=`. Put operators, texts and `else`
inside backticks so the parser treats them as strings.

### Yes/No choice

```gml
Dialog_Add(
    "* Open the door?&&" +
    "         {instant true}" +
    "{choice 0}Yes         {choice 1}No" +
    "{choice `ANSWER`}{pause}{end}"
);
Dialog_Start();
```

After the dialogue closes:

```gml
if (Player_GetTextTyperChoice() == 0) {
    // Yes
} else {
    // No
}
```

The command with `0` and `1` records the cursor positions. The command with a
string opens the choice and binds the local macro. The confirmed selection is
also saved to `FLAG_TEMP_TEXT_TYPER_CHOICE`.

### Sound and function call

```gml
"{sound `snd_item_get`}* You got something."
```

```gml
"{script `MyFunction` 10 `text`}"
```

`script` accepts up to 15 arguments in the current implementation. Use only
names and arguments controlled by the project. Don't put arbitrary calls in
translation files received from third parties.

## Creating a `text_typer` directly

Use this when building your own UI:

```gml
var typer = instance_create_depth(40, 40, DEPTH_UI.TEXT, text_typer);
typer.text =
    "{gui true}{font FONT.MENU}{scale 2}{shadow true}" +
    "My text{end}";
```

By default, `text_typer` creates a `text_single` instance for each character.
Destroying the typer also destroys those characters and the face it created.

## Localization structure

```text
datafiles/locale/
├─ list.txt
└─ english/
   ├─ string.txt
   ├─ sprite.txt
   ├─ font.txt
   ├─ string/*.json
   ├─ sprite/*.ini + images
   └─ font/*.ini + fonts/images
```

`list.txt` has one folder name per line. Language `0` is the first line and is
loaded by `world` at initialization.

The paths are centralized in `Lang_Custom`:

```text
GMU_LANG_PATH_BASE   = working_directory + "locale/"
GMU_LANG_PATH_LIST   = "list.txt"
GMU_LANG_PATH_STRING = "string.txt"
GMU_LANG_PATH_SPRITE = "sprite.txt"
GMU_LANG_PATH_FONT   = "font.txt"
GMU_LANG_PATH_INFO   = "info.ini"
```

Change these macros only if you also reorganize the Included Files and all
language indexes.

## Adding Portuguese

1. Copy the `english` folder to `portuguese_br`.
2. In `datafiles/locale/list.txt`, add:

```text
english
portuguese_br
```

3. Translate the values of all JSON files in `portuguese_br/string/`.
4. Preserve the keys and the commands inside `{}`.
5. Check that `string.txt`, `sprite.txt` and `font.txt` list all files.
6. Test accented characters; widen the font range when needed.

Example:

```json
{
    "battle.menu.mercy.spare": "* Spare",
    "battle.menu.mercy.flee": "* Flee"
}
```

## Switching language at runtime

```gml
function Game_SetLanguage(lang) {
    if (!Lang_IsExists(lang)) return false;

    // Fonts can depend on sprites; remove them first.
    Lang_ClearFont();
    Lang_ClearSprite();
    Lang_ClearString();

    Lang_LoadString(lang);
    Lang_LoadSprite(lang);
    Lang_LoadFont(lang);
    return true;
}
```

`lang` can be an index (`0`, `1`...) or a folder name. Recreate already-open
menus/texts after the switch, because existing instances may keep previous
resources.

## JSON texts

Each file must be a simple `string → string` object:

```json
{
    "npc.maya.first": "* This is the first time we talk.",
    "npc.maya.again": "* Good to see you again."
}
```

Usage:

```gml
Dialog_Add(Lang_GetString("npc.maya.first", "* Missing text."));
Dialog_Start();
```

The second argument of `Lang_GetString()` is the fallback. During development,
using the key itself as the fallback makes it easy to find gaps:

```gml
var key = "npc.maya.first";
Dialog_Add(Lang_GetString(key, key));
```

## Localized sprites

An `.ini` listed by `sprite.txt`:

```ini
[sprite]
key="battle.button.fight"
source="battle_button_fight.png"

image_number=2
remove_background=false
is_smooth=0
origin_x=0
origin_y=0
```

Load by key:

```gml
var spr = Lang_GetSprite("battle.button.fight");
```

This is useful for buttons that contain words and need different art per
language.

## Localized fonts

Example of an `.ini` listed in `font.txt`:

```ini
[font]
key="determination_mono"
source="determination_mono.ttf"
is_sprite=0

size=10
bold=1
italic=0
first=32
last=255

string_map=""
is_proportional=0
separation=0
```

For a sprite font, use `is_sprite=1`, list/load the sprite before the font and
set `string_map` when needed.

## Dialogue/localization checklist

- [ ] Every overworld line ends with `Dialog_Start()`.
- [ ] Battle dialogue only enters the queue; the controller displays it.
- [ ] `&` breaks, commands and backticks are balanced.
- [ ] Choices have 0/1 markers and a final starter.
- [ ] Every key exists in each language or has a fallback.
- [ ] JSON is valid and listed in `string.txt`.
- [ ] Fonts contain the language's characters.
- [ ] Dynamic sprites/fonts are cleared before the switch.
- [ ] Menus were recreated after switching the language.

Next: [Engine systems](/guides/engine-systems).
