<!-- locale: es-ES; content-id: bullet-patterns -->

# Patrones de bala

Un patrón de ataque se forma con dos capas independientes:

1. un objeto hijo de `battle_turn`, que controla el tiempo y crea oleadas;
2. uno o más objetos hijos de `battle_bullet`, que se mueven, dibujan y
   reaccionan a la colisión con el alma.

Separar estas capas permite reutilizar la misma bala en varios patrones y evita
que el enemigo acumule lógica de movimiento de proyectiles.

## Flujo de un turno

```text
enemigo configura BATTLE_TURN
        ↓
battle crea el objeto battle_turn
        ↓
el turno crea instancias battle_bullet
        ↓
alma y bala intercambian eventos de colisión
        ↓
Battle_EndTurn elimina turno y proyectiles
```

## 1. Crear el proyectil

Crea `obj_bullet_training` como hijo de `battle_bullet`.

En el Create Event:

```gml
event_inherited();

move_speed = 3;
move_direction = 180;
damage = 4;
```

En el Step Event, implementa el movimiento. Este ejemplo sigue dirección y
velocidad en grados:

```gml
x += lengthdir_x(move_speed, move_direction);
y += lengthdir_y(move_speed, move_direction);

if (x < -64 || x > 704 || y < -64 || y > 544) {
    instance_destroy();
}
```

> [!NOTE]
> La clase-base define la profundidad, pero no aplica daño automáticamente. El
> proyectil hijo decide cuánto daño causar en el User Event 0.

## 2. Aplicar daño en la colisión

El User Event 0 de `battle_bullet` corresponde a
`BATTLE_BULLET_EVENT.SOUL_COLLISION`.

```gml
// User Event 0 — Soul Collision
var final_damage = Player_CalculateDamage(damage, 1);
Player_Hurt(final_damage);

// Sonido, temblor y tiempo de invencibilidad del alma.
Battle_CallSoulEventHurt();
```

El alma solo reenvía colisiones cuando su invencibilidad está en cero. El evento
Hurt del alma repone ese temporizador usando `Player_GetInvTotal()`.

Funciones relacionadas:

- [`Battle_CallSoulEventHurt()`](/reference/battle-callsouleventhurt);
- [`Battle_CallBulletEventSoulCollision()`](/reference/battle-callbulleteventsoulcollision);
- [`Battle_CallSoulEventBulletCollision()`](/reference/battle-callsouleventbulletcollision);
- [`Player_CalculateDamage()`](/reference/player-calculatedamage);
- [`Player_Hurt()`](/reference/player-hurt).

## 3. Limpiar la bala al final del turno

El User Event 1 corresponde a `BATTLE_BULLET_EVENT.TURN_END`. El objeto-base ya
ejecuta `instance_destroy()` en ese evento.

Si sobrescribes el User Event 1, mantén la limpieza:

```gml
// User Event 1 — Turn End
event_inherited();
```

Usa lógica adicional antes o después de la herencia solo cuando sea necesario.

## 4. Crear el controlador del patrón

Crea `obj_turn_training` como hijo de `battle_turn`. Los User Events disponibles
son:

| User Event | Enum | Uso común |
|---:|---|---|
| 0 | `TURN_PREPARATION_START` | preparar el estado antes del cuadro |
| 1 | `TURN_PREPARATION_END` | reaccionar al final de la preparación |
| 2 | `TURN_START` | crear la primera oleada |
| 3 | `TURN_END` | limpiar el estado propio |

En el Create Event:

```gml
event_inherited();

wave_timer = 0;
wave_interval = 20;
wave_index = 0;
```

En el User Event 2:

```gml
// User Event 2 — Turn Start
wave_timer = 0;
wave_index = 0;
```

En el Step Event, crea oleadas mientras el turno esté activo:

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

## 5. Vincular el patrón al enemigo

En el User Event 8 del enemigo:

```gml
instance_create_depth(0, 0, 0, obj_turn_training);
Battle_SetTurnInfo(BATTLE_TURN.TIME, 150);
Battle_SetTurnInfo(BATTLE_TURN.SOUL_X, 0);
Battle_SetTurnInfo(BATTLE_TURN.SOUL_Y, 0);
```

`BATTLE_TURN.TIME` usa frames. En un proyecto a 30 FPS, `150` representa cinco
segundos.

## 6. Definir el cuadro de batalla

Las extensiones son distancias desde el centro, no ancho y alto finales:

```gml
Battle_SetTurnInfo(BATTLE_TURN.BOARD_X, 320);
Battle_SetTurnInfo(BATTLE_TURN.BOARD_Y, 320);
Battle_SetTurnInfo(BATTLE_TURN.BOARD_LEFT, 120);
Battle_SetTurnInfo(BATTLE_TURN.BOARD_RIGHT, 120);
Battle_SetTurnInfo(BATTLE_TURN.BOARD_UP, 70);
Battle_SetTurnInfo(BATTLE_TURN.BOARD_DOWN, 70);
```

También puedes controlar velocidad, duración, tween y ease de la transformación
con las otras claves del enum `BATTLE_TURN`.

## 7. Patrón radial

```gml
// Dentro del controlador de turno
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

## 8. Patrón alternado por ronda

```gml
var round = Battle_GetTurnNumber();

if (round mod 2 == 0) {
    SpawnWaveFromLeft();
} else {
    SpawnWaveFromRight();
}
```

Usa [`Battle_GetTurnNumber()`](/reference/battle-getturnnumber) para aumentar la
dificultad o alternar patrones sin almacenar otro contador global.

## 9. Terminar antes de tiempo

Un controlador puede finalizar el turno cuando su objetivo termina:

```gml
if (instance_number(obj_bullet_training) == 0 && wave_index >= 5) {
    Battle_EndTurn();
}
```

No llames a `Battle_EndTurn()` en cada Step. Garantiza que la condición solo sea
verdadera cuando el patrón realmente terminó.

## Checklist del patrón

- [ ] El controlador es hijo de `battle_turn`.
- [ ] Cada proyectil es hijo de `battle_bullet`.
- [ ] El proyectil aplica daño en el User Event 0.
- [ ] `Battle_CallSoulEventHurt()` se llama después del daño.
- [ ] Las balas fuera de la pantalla se destruyen.
- [ ] El User Event 1 preserva la limpieza heredada.
- [ ] El enemigo configura objeto, tiempo y cuadro con `Battle_SetTurnInfo()`.
- [ ] El patrón termina por tiempo o con una única llamada segura a
      `Battle_EndTurn()`.
