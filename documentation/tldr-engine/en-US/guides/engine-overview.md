<!-- locale: en-US; content-id: engine-overview -->

# Overview

The documentation is a work in progress for **v2.2.1**. It focuses on the parts of the project you are expected to touch first: repository setup, project structure, constructors, party members, cutscenes, battles, updates, and in-line text effects.

## Where to look first

| Resource | Purpose |
|---|---|
| `@Engine` | engine-owned systems and mechanics |
| `zzz Examples` | test rooms, recreated areas, and working examples |
| `o_world` | common project-level changes such as starting inventory, default party, and settings |
| `party_init` | default party-member constructors |
| `enc_enemies` | enemy-constructor examples and template |
| `CUTSCENES` | cutscene helper functions |
| `misc` → `string_to_color` | in-line text color names |

The documentation assumes that examples and JSDoc are part of the learning process. Several sections—especially Cutscenes and Battles—are explicitly marked as incomplete, so the working project is often the more complete reference for signatures and implementation details.

## Before working with constructors

A large part of the project is built with GameMaker constructors.

At least intermediate GameMaker Studio 2 knowledge is expected. Understand **structs and constructors** before modifying constructor-heavy systems such as party members and enemies.

## Engine files and project files

`@Engine` contains the systems maintained by the engine authors. You are allowed to modify them, but direct changes can make future updates harder to merge.

`zzz Examples` contains working examples and is the reference used for cutscenes and battle turns when the written documentation is incomplete.

For custom constructors, prefer your own scripts in `Scripts/`. For example, a project with custom Chapter 5 enemies could keep them in a script such as:

```text
mych5_enc_enemies
```

That keeps project content easier to identify when updating.

## Main references

- [GitHub](https://github.com/tweenko/tldr-engine) — releases and repository work.
- [Discord Server](https://discord.gg/x3t8JTyC2p) — update announcements, discussion, bugs, feature requests, and development help.

## Source credits

Written by **tweenko** and **sixtydegrees**.

Contributions: **Cyphis**, **Techoskiller**, **shachisaretai (big poo)**, and **FutureGamer25 (Lasers)**.
