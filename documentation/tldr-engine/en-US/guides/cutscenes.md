<!-- locale: en-US; content-id: cutscenes -->

# Cutscenes

> [!NOTE]
> The v2.2.1 cutscene article is a **stub**. Use JSDoc and the example room for signatures that are not shown here.

## Queue model

A cutscene is built as an ordered queue.

Basic example:

```gml
cutscene_create();
cutscene_player_canmove(false);

cutscene_dialogue([
    "{char(susie, 14)}* Hey Kris whats up.",
    "{face_ex(17)}* No, it's the roof dumbass."
]);

cutscene_func(function() {
    var _inst = instance_create(o_roof_meter);
    _inst.level = 100000000000000;
});

cutscene_sleep(15);

cutscene_player_canmove(true);
cutscene_play();
```

The commands are queued from top to bottom. `cutscene_play()` then runs them in that order.

This sequence:

1. creates the cutscene;
2. disables player movement;
3. queues dialogue;
4. runs custom code;
5. waits 15 frames;
6. re-enables movement;
7. starts playback.

## Waiting and timing

Many cutscene functions include a wait option. When enabled, the queue pauses until that action finishes.

Dedicated waiting helpers include:

| Function | Behavior |
|---|---|
| `cutscene_sleep()` | waits for a number of frames |
| `cutscene_wait_until()` | waits until the supplied function returns `true` |
| `cutscene_wait_dialogue_boxes()` | waits until a number of dialogue boxes have been seen |
| `cutscene_wait_dialogue_finished()` | waits until the current dialogue box is destroyed |

## Dialogue

### `cutscene_dialogue()`

Runs dialogue in the cutscene and can wait until it finishes.

It also supports parameters for:

- postfix;
- box position;
- whether other instances should be destroyed.

The full signature is not listed in the article.

### `cutscene_actor_dialogue()`

Runs actor dialogue as a text bubble attached to a specific actor instance.

It can also wait until the dialogue finishes.

## Player and party control

| Function | Purpose |
|---|---|
| `cutscene_player_canmove()` | enables or disables player movement |
| `cutscene_party_follow()` | enables or disables party following |
| `cutscene_party_interpolate()` | returns party-member positions to the caterpillar/follow formation |
| `cutscene_set_partysprite()` | sets a party member's sprite from the battle-sprite data in `party_data` |

`cutscene_party_interpolate()` is specifically useful when characters end a cutscene in positions that would otherwise make following look wrong.

## Move an actor

`cutscene_actor_move()` moves an actor using an `actor_movement` struct.

The documented shape is:

```gml
cutscene_actor_move(
    actor_instance,
    new actor_movement(
        target_x,
        target_y,
        time,
        seed,
        spd,
        direction_toface,
        are_positions_absolute
    ),
    array_position_global.charmove_insts,
    wait
);
```

### `actor_movement`

| Value | Meaning |
|---|---|
| `target_x` | target X |
| `target_y` | target Y |
| `time` | movement time in frames; alternative to speed |
| `seed` | the moment the movement happens |
| `spd` | movement speed; alternative to time |
| `direction_toface` | direction the actor should face |
| `are_positions_absolute` | whether the target positions are absolute |

Use the function's JSDoc for current argument types/defaults.

## Run code and create instances

### `cutscene_func()`

Runs an arbitrary function at that point in the queue. Use it when the sequence needs behavior that has no dedicated cutscene helper.

### `cutscene_instance_create()`

Creates an instance at that point in the cutscene queue.

### `cutscene_set_variable()`

Changes an object's variable at that point in the cutscene queue.

## Audio and camera

| Function | Purpose |
|---|---|
| `cutscene_audio_play()` | queues audio playback at that point in the cutscene |
| `cutscene_camera_pan()` | queues a camera pan from the current position to another using two animation instances |

## Animation

### `cutscene_anim()`

Animates a value between two positions along a curve.

For `ease_type`, you can use:

- a built-in easing name as a string;
- a function;
- an animation curve struct/ID;
- an animated curve channel.

Built-in easing types are in:

```text
@Engine → anime_functions
```

### `cutscene_animate()`

A convenience form of `cutscene_anim()` with automatic instance checking and direct instance addressing.

Example:

```gml
cutscene_animate(5, 0, 10, "linear", o_actor_kris, "shake");
```

> [!IMPORTANT]
> **`cutscene_animate()` does not wait for the animation to finish.** If the next action depends on the animation being complete, the queue needs a separate wait.

## Battle helper

### `cutscene_spare_enemy()`

Spares an enemy using the engine's spare animation.

## Function reference

| Function | Purpose |
|---|---|
| `cutscene_create()` | creates the cutscene instance; call this before queuing actions |
| `cutscene_play()` | starts the queued cutscene |
| `cutscene_sleep()` | waits a number of frames |
| `cutscene_dialogue()` | runs normal dialogue |
| `cutscene_actor_dialogue()` | runs actor-attached dialogue |
| `cutscene_wait_dialogue_boxes()` | waits for a number of dialogue boxes |
| `cutscene_wait_dialogue_finished()` | waits until the current dialogue box is destroyed |
| `cutscene_player_canmove()` | controls player movement |
| `cutscene_party_follow()` | controls party following |
| `cutscene_actor_move()` | moves an actor with `actor_movement` |
| `cutscene_audio_play()` | plays audio |
| `cutscene_party_interpolate()` | restores party positions to follow formation |
| `cutscene_wait_until()` | waits for a function to return `true` |
| `cutscene_set_variable()` | sets an object variable |
| `cutscene_set_partysprite()` | sets a party member sprite |
| `cutscene_anim()` | animates a value along a curve |
| `cutscene_animate()` | animation helper with instance addressing |
| `cutscene_instance_create()` | creates an instance |
| `cutscene_func()` | runs arbitrary function code |
| `cutscene_camera_pan()` | pans the camera |
| `cutscene_spare_enemy()` | spares an enemy with the engine animation |

## Where to inspect examples

A cutscene example room in `zzz Examples` is named approximately:

```text
cutscene_room_test
```

Inspect the **Creation Code** of the two `o_trigger` instances there.

## Cutscene checklist

- [ ] `cutscene_create()` is called before actions are queued.
- [ ] Player movement is disabled/re-enabled when the scene requires it.
- [ ] Actions that must finish before the next action use the appropriate wait behavior.
- [ ] `cutscene_animate()` is not treated as a blocking call.
- [ ] `cutscene_party_interpolate()` is used when party positions need to be restored after independent movement.
- [ ] `cutscene_play()` is called after the queue is built.
- [ ] The example room/JSDoc is checked for signatures omitted by the stub article.
