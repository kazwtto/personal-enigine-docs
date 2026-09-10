<!-- locale: en-US; content-id: battles -->

# Enemies, ACTs and Bullet Patterns

> [!NOTE]
> The v2.2.1 battle article is a **stub**. It covers enemy construction and the beginning of the turn-object workflow, but stops before listing the default turn parameters.

## Battle structure

```text
enemy object
└─ child of o_actor_e
   ↓
enemy constructor
├─ stats
├─ mercy
├─ ACTS
├─ ACTS_SPECIAL
├─ dialogue
├─ sprites
├─ recruit data
└─ TURN_OBJECT
   ↓
turn object
└─ child of o_turn
   └─ runs bullet patterns during the enemy turn
```

## Create the enemy object

Create an object that is a child of:

```text
o_actor_e
```

The object itself is mainly where you set up the actor resource, such as its sprites and object identity.

Most battle data is then defined in the enemy constructor.

## Create the enemy constructor

Examples and the constructor template are in:

```text
@Engine → enc_enemies
```

Keep project-specific enemy constructors in your own script instead of mixing them into the engine template.

## Constructor fields

| Field | Meaning |
|---|---|
| `NAME` | enemy name |
| `OBJ` | the `o_actor_e` child object |
| `STATS` | `hp`, `max_hp`, `attack`, `defence`, `status_effect`, `carrying_money` |
| `MERCY` | starting/default mercy |
| `MERCY_ADD_PITY_PERCENT` | mercy added when sparing without 100% mercy |
| `CAN_SPARE` | whether the enemy can be spared |
| `ACTS` | normal ACT definitions |
| `ACTS_SPECIAL` | character-specific ACT definitions |
| `DIALOGUE` | text shown in the enemy speech bubble each turn |
| `TURN_OBJECT` | object containing the enemy's attacks/bullet patterns |
| `S_IDLE` | idle sprite/state |
| `S_SPARE` | spare sprite/state |
| `S_HURT` | hurt sprite/state |
| `RECRUIT` | recruit-constructor assignment |

> [!IMPORTANT]
> **`TURN_OBJECT` is the object that stores the enemy's bullet patterns and attacks.** The turn system later creates that object to run the enemy turn.

## Define ACTs

Each ACT needs:

- name;
- description;
- party members;
- TP cost;
- the function it runs.

Example:

```gml
{
    name: loc("enc_act_check"),
    desc: "Useless analysis",
    party: [],
    exec: function() {
        encounter_scene_dialogue(
            loc("enemy_virovirokun_act_check")
        );
    }
}
```

The example demonstrates the ACT's name, description, party requirement, and execution function.

> [!NOTE]
> The text says ACTs have a TP cost, but the printed example does not show the corresponding property. Use the current constructor template in `enc_enemies` for the actual field name.

Study the existing enemy examples when building ACTs. For simple actions without a custom gimmick, cutscenes are often enough.

## Character-specific ACTs

`ACTS_SPECIAL` is for ACTs tied to specific party members such as Susie, Ralsei, or Noelle.

Example:

```gml
susie: {
    exec: function(enemy_slot) {
        enc_enemy_add_spare(enemy_slot, 50);
        cutscene_dialogue(
            loc("enemy_virovirokun_act_susie")
        );
    }
}
```

The example receives `enemy_slot`, adds spare progress, and runs dialogue through the cutscene system.

## Enemy dialogue

`DIALOGUE` controls the text shown in the enemy's speech bubble each turn.

It can also be a function and receive the slept state as `arg0`.

No complete function-form example is included in the article.

## Enemy sprites and recruit data

The constructor fields listed for battle presentation are:

```text
S_IDLE
S_SPARE
S_HURT
```

`RECRUIT` adds the recruit constructor to the recruit data chosen by the project.

The supplied article does not document the full value shapes for these fields, so the current enemy examples are the reference.

## Create a bullet-pattern turn object

Create an object that is a child of:

```text
o_turn
```

Then assign that object to the enemy constructor's:

```text
TURN_OBJECT
```

## Turn flow

The enemy turn works like this:

1. the enemy turn starts;
2. a turn object is created;
3. a bullet pattern is selected;
4. the selected pattern runs in the turn object's Step event;
5. the turn ends when its time runs out.

Existing turn objects are under:

```text
ZZZexamples > objects > enc > turns
```

Study those before building a pattern from scratch.

> [!WARNING]
> The original article ends immediately after introducing the turn object's “default parameters”. Those parameters are not documented there; use the current turn objects and JSDoc instead.

## Battle checklist

- [ ] The enemy object is a child of `o_actor_e`.
- [ ] The enemy constructor follows the current template in `enc_enemies`.
- [ ] `OBJ` references the correct enemy object.
- [ ] `STATS`, mercy fields, ACT data, dialogue, sprites, and recruit data are configured as needed.
- [ ] ACTs use the current template's field names, including the real TP-cost property.
- [ ] Character-specific ACTs are kept in `ACTS_SPECIAL`.
- [ ] `TURN_OBJECT` points to a child of `o_turn`.
- [ ] Existing objects in `ZZZexamples > objects > enc > turns` were inspected before implementing a custom pattern.
- [ ] Missing turn parameters are taken from current code/JSDoc, not guessed from the incomplete article.
