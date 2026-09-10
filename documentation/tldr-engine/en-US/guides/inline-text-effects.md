<!-- locale: en-US; content-id: inline-text-effects -->

# In-line Text Effects

Text strings can contain in-line commands for effects such as color changes, line breaks, pauses, and character movement.

Custom commands can also be added.

## Command syntax

Commands are written directly inside the string and surrounded by `{}`.

If a command accepts arguments, use this form:

```text
{command(argument1, `argument2, uses comma`, 3)}
```

Arguments are parsed as strings.

Use backticks when an argument contains commas or other characters that would otherwise be split by the parser:

```text
`argument2, uses comma`
```

## Line breaks

Use:

```text
{br}
```

to force a line break.

For a “full break” where the next asterisk should start from reset indentation, use:

```text
{resetx}
```

## Pauses

Use either:

```text
{sleep(frames_to_pause)}
```

or:

```text
{s(frames_to_pause)}
```

Example:

```text
The quick brown fox{s(5)} jumps over the lazy dog.
```

This creates a short pause between `fox` and `jumps`.

## Colors

Set the text color with:

```text
{color(col)}
```

or:

```text
{col(col)}
```

Reset it with:

```text
{reset_col}
```

The color argument can use the full or short name below.

| Full name | Short | Color |
|---|:---:|---|
| `c_red` | `r` | `#FF0000` |
| `c_orange` | — | `#FFA040` |
| `c_yellow` | `y` | `#FFFF00` |
| `c_lime` | `g` | `#00FF00` |
| `tired_aqua` | — | `#00C1F2` |
| `c_blue` | `b` | `#0000FF` |
| `c_black` | — | `#000000` |
| `c_dkgray` | — | `#404040` |
| `c_gray` | — | `#808080` |
| `c_silver` | — | `#C0C0C0` |
| `c_white` | — | `#FFFFFF` |

Example:

```text
* This is {color(y)}important{reset_col}.
```

## Add custom color names

Open:

```text
misc → string_to_color
```

and follow the existing mappings used by that function.

The supplied documentation does not include the implementation of `string_to_color`, so the current project code is the reference for adding new names.

## Quick reference

| Syntax | Effect |
|---|---|
| `{br}` | line break |
| `{resetx}` | reset horizontal indentation |
| `{sleep(frames)}` | pause for a number of frames |
| `{s(frames)}` | short form of `sleep` |
| `{color(col)}` | set text color |
| `{col(col)}` | short form of `color` |
| `{reset_col}` | reset the active color |
| `` `text, with commas` `` | keep a complex command argument together |
