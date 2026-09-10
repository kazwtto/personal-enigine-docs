<!-- locale: en-US; content-id: project-structure-and-standards -->

# Project Structure and Naming

## `@Engine`

`@Engine` contains the systems that provide the DELTARUNE-style mechanics.

> [!WARNING]
> You can modify files inside `@Engine`, but those changes can make later version updates harder. When you do modify engine-owned files, keep the amount of update-sensitive work as small as practical.

## `zzz Examples`

`zzz Examples` contains the examples shipped with the project, including test rooms and recreated DELTARUNE areas.

These examples are not just showcase content. The documentation explicitly points to them for cutscene and battle-turn implementations that are not fully explained in prose.

## Recommended asset naming scheme

```text
{Asset Type}_{Project Prefix}_{Category}_{Identificatior}_{State}_{Substate}
```

Example:

```text
spr_g_rune_togore_down_happy_light
```

`Category`, `State`, and `Substate` are optional.

### Asset type prefixes

| Asset type | Prefix | Example |
|---|---|---|
| Script | none | `ch5_item_consumables` |
| Object | `o_` | `o_ex_ow_field_lamppost` |
| Sprite | `spr_` | `spr_ib_enemy_vampire_idle` |
| Room | `room_` | `room_ch3_tenna_meeting` |
| Shader | `shd_` | `shd_mv_chrom_abberation` |

### Name parts

| Part | Purpose |
|---|---|
| Project Prefix | distinguishes your assets from other project/engine assets; base examples use `ex_` |
| Category | optional broad category |
| Identificator | unique portion of the asset name |
| State | optional suffix for a state/variant |
| Substate | optional second suffix for a more specific variant |

## Where common changes go

`o_world` is the main place for most common changes to the base project.

The events that matter most for this are:

- **Game Start**
- **Create**

Typical changes include:

- starting inventory;
- default party;
- general settings.

## Where custom constructors go

Constructors can be stored anywhere, so the recommended approach is to create scripts in `Scripts/` for each constructor family.

Example:

```text
Scripts/
└─ mych5_enc_enemies
```

Use the engine scripts as templates and references, then keep project-specific constructors in your own files when possible.

## Structure checklist

- [ ] Custom assets use a consistent project prefix.
- [ ] Asset type prefixes follow the documented convention where applicable.
- [ ] Project constructors are grouped into recognizable scripts.
- [ ] Changes inside `@Engine` are intentional and kept as limited as practical.
- [ ] `zzz Examples` remains available as a reference when implementing cutscenes or battle turns.
