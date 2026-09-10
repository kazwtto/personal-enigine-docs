<!-- locale: en-US; content-id: bullet-patterns -->

# Bullet patterns

An attack pattern is made of two independent layers:

1. an object child of `battle_turn`, which controls the timing and spawns waves;
2. one or more objects child of `battle_bullet`, which move, draw and react to
   the collision with the soul.

Separating these layers lets you reuse the same bullet in several patterns and
keeps the enemy from accumulating projectile movement logic.

## Flow of a turn

```text
enemy configures BATTLE_TURN
        ↓
battle creates the battle_turn object
        ↓
turn creates battle_bullet instances
        ↓
soul and bullet exchange collision events
        ↓
Battle_EndTurn removes turn and projectiles
```

## 1. Create the projectile

Create `obj_bullet_training` as a child of `battle_bullet`.

In the Create Event:

```gml
event_inherited();

move_speed = 3;
move_direction = 180;
damage = 4;
```

In the Step Event, implement the movement. This example follows direction and
speed in degrees:

```gml
x += lengthdir_x(move_speed, move_direction);
y += lengthdir_y(move_speed, move_direction);

if (x < -64 || x > 704 || y < -64 || y > 544) {
    instance_destroy();
}
```

> [!NOTE]
> The base class sets the depth, but does not apply damage automatically. The
> child projectile decides how much damage to deal in User Event 0.

## 2. Apply damage on collision

The User Event 0 of `battle_bullet` corresponds to
`BATTLE_BULLET_EVENT.SOUL_COLLISION`.

```gml
// User Event 0 — Soul Collision
var final_damage = Player_CalculateDamage(damage, 1);
Player_Hurt(final_damage);

// Sound, shake and soul invincibility time.
Battle_CallSoulEventHurt();
```

The soul only forwards collisions when its invincibility is at zero. The soul's
Hurt event resets that timer using `Player_GetInvTotal()`.

Related functions:

- [`Battle_CallSoulEventHurt()`](/reference/battle-callsouleventhurt);
- [`Battle_CallBulletEventSoulCollision()`](/reference/battle-callbulleteventsoulcollision);
- [`Battle_CallSoulEventBulletCollision()`](/reference/battle-callsouleventbulletcollision);
- [`Player_CalculateDamage()`](/reference/player-calculatedamage);
- [`Player_Hurt()`](/reference/player-hurt).

## 3. Clean up the bullet at the end of the turn

The User Event 1 corresponds to `BATTLE_BULLET_EVENT.TURN_END`. The base object
already runs `instance_destroy()` in this event.

If you override User Event 1, keep the cleanup:

```gml
// User Event 1 — Turn End
event_inherited();
```

Use additional logic before or after the inheritance only when needed.

## 4. Create the pattern controller

Create `obj_turn_training` as a child of `battle_turn`. The available User
Events are:

| User Event | Enum | Common use |
|---:|---|---|
| 0 | `TURN_PREPARATION_START` | prepare state before the board |
| 1 | `TURN_PREPARATION_END` | react to the end of the preparation |
| 2 | `TURN_START` | spawn the first wave |
| 3 | `TURN_END` | clean up own state |

In the Create Event:

```gml
event_inherited();

wave_timer = 0;
wave_interval = 20;
wave_index = 0;
```

In User Event 2:

```gml
// User Event 2 — Turn Start
wave_timer = 0;
wave_index = 0;
```

In the Step Event, spawn waves while the turn is active:

```gml
wave_timer -= 1;

if (wave_timer <= 0) {
    wave_timer = wave_interval;
    wave_index += 1;

    var bullet = instance_create_depth(
        battle_board.x + Battle_GetTurnInfo(BATTLE_TURN.BOARD_RIGHT),
        battle_board.y + irandom_range(-48, 48),
        DEPTH_BATTLE.BULLET,
        obj_bullet_training
    );

    bullet.move_direction = 180;
}
```

## 5. Attach the pattern to the enemy

In the enemy's User Event 8:

```gml
instance_create_depth(0, 0, 0, obj_turn_training);
Battle_SetTurnInfo(BATTLE_TURN.TIME, 150);
Battle_SetTurnInfo(BATTLE_TURN.SOUL_X, 0);
Battle_SetTurnInfo(BATTLE_TURN.SOUL_Y, 0);
```

`BATTLE_TURN.TIME` uses frames. In a 30 FPS project, `150` represents five
seconds.

## 6. Define the battle board

The extensions are distances from the center, not the final width and height:

```gml
Battle_SetTurnInfo(BATTLE_TURN.BOARD_X, 320);
Battle_SetTurnInfo(BATTLE_TURN.BOARD_Y, 320);
Battle_SetTurnInfo(BATTLE_TURN.BOARD_LEFT, 120);
Battle_SetTurnInfo(BATTLE_TURN.BOARD_RIGHT, 120);
Battle_SetTurnInfo(BATTLE_TURN.BOARD_UP, 70);
Battle_SetTurnInfo(BATTLE_TURN.BOARD_DOWN, 70);
```

You can also control the transformation's speed, duration, tween and ease with
the other keys of the `BATTLE_TURN` enum.

## 7. Radial pattern

```gml
// Inside the turn controller
for (var angle = 0; angle < 360; angle += 30) {
    var bullet = instance_create_depth(
        battle_board.x,
        battle_board.y,
        DEPTH_BATTLE.BULLET,
        obj_bullet_training
    );
    bullet.move_direction = angle;
    bullet.move_speed = 2;
}
```

## 8. Pattern alternating by round

```gml
var round = Battle_GetTurnNumber();

if (round mod 2 == 0) {
    SpawnWaveFromLeft();
} else {
    SpawnWaveFromRight();
}
```

Use [`Battle_GetTurnNumber()`](/reference/battle-getturnnumber) to raise the
difficulty or alternate patterns without storing another global counter.

## 9. End before the time limit

A controller can finish the turn when its goal ends:

```gml
if (instance_number(obj_bullet_training) == 0 && wave_index >= 5) {
    Battle_EndTurn();
}
```

Do not call `Battle_EndTurn()` every Step. Make sure the condition only becomes
true when the pattern really ended.

## Pattern checklist

- [ ] The controller is a child of `battle_turn`.
- [ ] Each projectile is a child of `battle_bullet`.
- [ ] The projectile applies damage in User Event 0.
- [ ] `Battle_CallSoulEventHurt()` is called after the damage.
- [ ] Bullets off screen are destroyed.
- [ ] User Event 1 preserves the inherited cleanup.
- [ ] The enemy configures object, time and board with `Battle_SetTurnInfo()`.
- [ ] The pattern ends by time or with a single safe call to `Battle_EndTurn()`.
