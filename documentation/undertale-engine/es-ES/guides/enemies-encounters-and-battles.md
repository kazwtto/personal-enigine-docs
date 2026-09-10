<!-- locale: es-ES; content-id: enemies-encounters-and-battles -->

# Enemigos, encuentros y batallas

Este capítulo crea una batalla completa: enemigo, ACT, HP, daño, recompensa,
MERCY, encuentro, turno y proyectil.

## Arquitectura de la batalla

```text
Encounter_Custom
└─ Encounter_Set(ID, enemigos, texto, música...)
   └─ Encounter_Start(ID)
      └─ room_battle
         └─ battle crea los enemigos y controla los estados
            ├─ battle_enemy: decisiones y reacción a los menús
            ├─ battle_turn: patrón de ataque actual
            ├─ battle_bullet: colisión/daño
            ├─ battle_soul: jugador dentro del cuadro
            └─ battle_board: área de defensa
```

La engine soporta tres **slots fijos**, de 0 a 2. Un menú, sin embargo, enumera solo
enemigos vivos. Usa siempre las conversiones `Battle_Convert*` al comparar una
elección del menú con `_enemy_slot`.

## Ciclo de estados

```text
MENU
  ↓ elección FIGHT/ACT/ITEM/MERCY
DIALOG
  ↓ frases resultantes
TURN_PREPARATION
  ↓ frase del enemigo + transformación del cuadro
IN_TURN
  ↓ cronómetro o Battle_EndTurn()
BOARD_RESETTING
  ↓ el cuadro vuelve al patrón
MENU
```

Cuando ya no hay enemigos, el controlador entra en `RESULT`, concede las
recompensas acumuladas y vuelve a la sala anterior.

## Tutorial completo: Slime

### 1. Recursos visuales y sonidos

Crea, como mínimo:

- `spr_enemy_slime` para el enemigo;
- `spr_bullet_gota` para el proyectil;
- `snd_battle_slime` o reutiliza un sonido permitido;
- opcionalmente sonidos de ataque, daño y desaparición.

En la batalla, la referencia visual es 640 × 480. Un enemigo único queda naturalmente
en el slot central cuando se registra como segundo argumento de enemigo.

### 2. Objeto del enemigo

Crea `obj_enemy_slime` con:

- sprite: `spr_enemy_slime`;
- parent: `battle_enemy`.

#### Create

```gml
event_inherited();

_hp_max = 60;
_hp = _hp_max;
_defeated = false;
```

`event_inherited()` conserva `depth` y `_enemy_slot`. La engine asigna
`_enemy_slot` después del Create; no elijas ni modifiques ese valor.

#### User Event 0 — Init

```gml
/// @description Init

Battle_SetEnemyName(_enemy_slot, "* Slime");

Battle_SetEnemyActionNumber(_enemy_slot, 2);
Battle_SetEnemyActionName(_enemy_slot, 0, "* Check");
Battle_SetEnemyActionName(_enemy_slot, 1, "* Compliment");

Battle_SetEnemyDEF(_enemy_slot, 1);
Battle_SetEnemyCenterPos(_enemy_slot, x, y - 32);
Battle_SetEnemySpareable(_enemy_slot, false);
```

Máximo práctico de acciones en la estructura actual: **6 por enemigo**.

#### User Event 3 — Menu Switch

Este evento reacciona cuando la pantalla del menú cambia. Crea la barra de HP en la
lista de objetivos y aplica el daño cuando llega a `FIGHT_DAMAGE`.

```gml
/// @description Menu Switch

switch (Battle_GetMenu()) {
    case BATTLE_MENU.FIGHT_TARGET:
        var bar = instance_create_depth(0, 0, 0, battle_menu_fight_hp_bar);
        bar.enemy_slot = _enemy_slot;
        bar.hp_max = _hp_max;
        bar.hp = _hp;
        break;

    case BATTLE_MENU.FIGHT_DAMAGE:
        var alvo = Battle_ConvertMenuChoiceEnemyToEnemySlot(
            Battle_GetMenuChoiceEnemy()
        );

        if (alvo != _enemy_slot) break;

        var dano = Battle_GetMenuFightDamage();
        if (dano < 0) break; // golpe perdido

        var hp_anterior = _hp;
        _hp = max(0, _hp - dano);
        _defeated = (_hp <= 0);

        var pop = instance_create_depth(x, y - 72, 0, battle_damage);
        pop.damage = dano;
        pop.bar_hp_max = _hp_max;
        pop.bar_hp_original = hp_anterior;
        pop.bar_hp_target = _hp;

        if (dano > 0) {
            audio_play_sound(snd_damage, 0, false);
            Camera_Shake(4, 2, 2, 2);
        }
        break;
}
```

#### User Event 5 — Menu End

Aquí entran ACT, derrota y MERCY. Todos los enemigos reciben el evento; por eso,
filtra el objetivo de ACT/FIGHT.

```gml
/// @description Menu End

var botao = Battle_GetMenuChoiceButton();

switch (botao) {
    case BATTLE_MENU_CHOICE_BUTTON.FIGHT:
        var alvo_fight = Battle_ConvertMenuChoiceEnemyToEnemySlot(
            Battle_GetMenuChoiceEnemy()
        );

        if (alvo_fight == _enemy_slot && _defeated) {
            var slot_derrotado = _enemy_slot;

            Battle_RewardExp(8);
            Battle_RewardGold(6);

            var vapor = instance_create_depth(x, y, 0, battle_death_particle);
            vapor.sprite = sprite_index;
            audio_play_sound(snd_vaporize, 0, false);

            Battle_RemoveEnemy(slot_derrotado);
            instance_destroy();
        }
        break;

    case BATTLE_MENU_CHOICE_BUTTON.ACT:
        var alvo_act = Battle_ConvertMenuChoiceEnemyToEnemySlot(
            Battle_GetMenuChoiceEnemy()
        );
        if (alvo_act != _enemy_slot) break;

        switch (Battle_GetMenuChoiceAction()) {
            case 0:
                Dialog_Add("* SLIME - AT 2 DF 1&* Le gustan los cumplidos.");
                break;

            case 1:
                Dialog_Add("* Elogiaste el brillo del Slime.");
                Dialog_Add("* Slime se puso contento.");
                Battle_SetEnemySpareable(_enemy_slot, true);
                break;
        }
        break;

    case BATTLE_MENU_CHOICE_BUTTON.MERCY:
        if (
            Battle_GetMenuChoiceMercy() == BATTLE_MENU_CHOICE_MERCY.SPARE &&
            Battle_IsEnemySpareable(_enemy_slot)
        ) {
            var slot_poupado = _enemy_slot;

            // Spare suele dar GOLD, pero no EXP.
            Battle_RewardGold(6);
            Battle_RemoveEnemy(slot_poupado);
            instance_destroy();
        }
        break;
}
```

Elimina el slot con `Battle_RemoveEnemy()` antes de destruir la instancia. Esto
limpia nombre, acciones, defensa, posición y estado spareable asociados al slot.

#### User Event 8 — Turn Preparation Start

```gml
/// @description Turn Preparation Start

if (!instance_exists(obj_turn_slime)) {
    instance_create_depth(0, 0, 0, obj_turn_slime);
}

var fala = instance_create_depth(x + 70, y - 80, 0, battle_dialog_enemy);
fala.text = choose("blub...", "squish!", "...");
fala.template = 0;
```

El globo se destruye cuando su `text_typer` termina. La preparación avanza
automáticamente cuando no hay globo y el cuadro terminó de transformarse.

### 3. Objeto del turno

Crea `obj_turn_slime` con parent `battle_turn`.

#### Create

```gml
event_inherited();

_spawn_restante = 12;
```

#### User Event 0 — Turn Preparation Start

```gml
/// @description Turn Preparation Start

// 300 steps = aproximadamente 5 segundos a 60 FPS.
Battle_SetTurnInfo(BATTLE_TURN.TIME, 300);

// Mitad del ancho y alto desde el centro.
Battle_SetTurnInfo(BATTLE_TURN.BOARD_LEFT, 110);
Battle_SetTurnInfo(BATTLE_TURN.BOARD_RIGHT, 110);
Battle_SetTurnInfo(BATTLE_TURN.BOARD_UP, 70);
Battle_SetTurnInfo(BATTLE_TURN.BOARD_DOWN, 70);

// Posición del alma relativa al centro del cuadro.
Battle_SetTurnInfo(BATTLE_TURN.SOUL_X, 0);
Battle_SetTurnInfo(BATTLE_TURN.SOUL_Y, 0);
```

#### User Event 2 — Turn Start

```gml
/// @description Turn Start

alarm[0] = 1;
```

#### Alarm 0

```gml
if (_spawn_restante > 0) {
    var gota = instance_create_depth(
        battle_board.x + irandom_range(-90, 90),
        battle_board.y - battle_board.up - 16,
        0,
        obj_bullet_gota
    );
    gota.vspeed = irandom_range(2, 4);

    _spawn_restante--;
    alarm[0] = 18;
}
```

El `battle` termina el turno solo cuando `TIME` llega a cero. Para un ataque de
duración dinámica, usa `TIME = -1` y llama a `Battle_EndTurn()` cuando termines:

```gml
// Step opcional del turno infinito
if (_spawn_restante <= 0 && !instance_exists(obj_bullet_gota)) {
    Battle_EndTurn();
}
```

### 4. Objeto del proyectil

Crea `obj_bullet_gota` con:

- sprite: `spr_bullet_gota`;
- parent: `battle_bullet`.

#### Create

```gml
event_inherited();
image_speed = 0.25;
```

#### Step, si quieres destruir fuera del cuadro

Si agregas un Step al hijo, llama al evento heredado para mantener la
detección de colisión:

```gml
event_inherited();

if (y > battle_board.y + battle_board.down + 32) {
    instance_destroy();
}
```

#### User Event 0 — Soul Collision

```gml
/// @description Soul Collision

Player_Hurt(Player_CalculateDamage(4, 1));
Battle_CallSoulEventHurt();
instance_destroy();
```

El `battle_soul` solo llama a este evento cuando la invencibilidad terminó. La
duración de la invencibilidad usa `Player_GetInvTotal()`.

El padre `battle_bullet` también posee **User Event 1 — Turn End**, que destruye el
proyectil. Si sobrescribes ese evento, usa `event_inherited()` o destruye la
instancia explícitamente.

### 5. Registra el encuentro

En `Encounter_Custom()`:

```gml
function Encounter_Custom() {
    // Los IDs de encuentro deben ser únicos y >= 0.
    #macro ENCOUNTER_SLIME 1

    Encounter_Set(
        ENCOUNTER_SLIME,
        -1,                    // slot 0: vacío
        obj_enemy_slime,       // slot 1: centro
        -1,                    // slot 2: vacío
        "* Slime apareció!",   // flavor text
        snd_battle_slime,      // BGM
        true,                  // mostrar Flee
        true,                  // pausar BGM del overworld
        false,                 // animación de encuentro normal
        48,                    // destino X del alma en la animación
        454                    // destino Y del alma en la animación
    );
}
```

Firma completa:

```gml
Encounter_Set(
    id,
    enemy_0,
    enemy_1,
    enemy_2,
    menu_dialog,
    bgm = -1,
    menu_mercy_flee_enabled = true,
    pause_bgm = true,
    quick = false,
    soul_x = 48,
    soul_y = 454
);
```

Usa `-1` para un slot vacío. Cada objeto debe tener `battle_enemy` como base de la
cadena de herencia.

### 6. Inicia la batalla

Desde un disparador, NPC o Room Creation Code:

```gml
Encounter_Start(ENCOUNTER_SLIME);
```

Opciones:

```gml
Encounter_Start(
    ENCOUNTER_SLIME,
    true, // anim: mostrar transición
    true  // exclam: mostrar exclamación
);
```

Para una prueba directa sin transición:

```gml
Encounter_Start(ENCOUNTER_SLIME, false, false);
```

Al iniciar fuera de una batalla, la engine guarda la sala actual en
`FLAG_TEMP_BATTLE_ROOM_RETURN`, marca la sala como persistente y vuelve a ella
después del resultado.

## Eventos actuales de `battle_enemy`

| User Event | Nombre | Uso común |
|---:|---|---|
| 0 | Init | nombre, acciones, defensa, HP, posición |
| 1 | Battle Start | efectos únicos al comenzar |
| 2 | Menu Start | preparar cada ronda del menú |
| 3 | Menu Switch | barra de HP, reacción a submenús y daño |
| 4 | Menu Choice Switch | reacción al cursor/objetivo/acción |
| 5 | Menu End | ACT, muerte, spare, resultado de la elección |
| 6 | Dialog Start | preparar frases post-elección |
| 7 | Dialog End | fin de frases |
| 8 | Turn Preparation Start | crear turno y globo |
| 9 | Turn Preparation End | fin de la transformación |
| 10 | Turn Start | el ataque comenzó |
| 11 | Turn End | limpiar estado específico |
| 12 | Board Resetting Start | el cuadro comenzó a volver |
| 13 | Board Resetting End | el cuadro volvió al patrón |

> [!WARNING]
> La tabla del sitio antiguo comienza `MENU_START` en el valor 1. La versión actual
> insertó `BATTLE_START`, desplazando los siguientes. Al disparar por código, usa
> `Battle_CallEnemyEvent(BATTLE_ENEMY_EVENT.MENU_START)`, nunca `event_user(1)`
> fuera de la implementación del objeto.

## Configuraciones de `BATTLE_TURN`

### Tiempo y alma

| Clave | Significado |
|---|---|
| `TIME` | duración en steps; `-1` para no terminar por el cronómetro |
| `SOUL_X`, `SOUL_Y` | posición relativa al centro del cuadro |

### Cuadro durante el ataque

- `BOARD_X`, `BOARD_Y`;
- `BOARD_UP`, `BOARD_DOWN`, `BOARD_LEFT`, `BOARD_RIGHT`;
- `BOARD_MOVE_TWEEN`, `BOARD_MOVE_EASE`;
- `BOARD_MOVE_MODE`, `BOARD_MOVE_SPEED`, `BOARD_MOVE_DURATION`;
- `BOARD_SIZE_TWEEN`, `BOARD_SIZE_EASE`;
- `BOARD_SIZE_MODE`, `BOARD_SIZE_SPEED`, `BOARD_SIZE_DURATION`.

### Retorno al patrón

Las versiones con prefijo `BOARD_RESET_` controlan el camino de vuelta:

- posición y tamaño: `X`, `Y`, `UP`, `DOWN`, `LEFT`, `RIGHT`;
- tween/ease, modo, velocidad y duración para movimiento y tamaño.

Modos:

```gml
BATTLE_TURN_BOARD_TRANSFORM_MODE.SPEED
BATTLE_TURN_BOARD_TRANSFORM_MODE.DURATION
```

Ejemplo con duración fija y easing:

```gml
Battle_SetTurnInfo(
    BATTLE_TURN.BOARD_SIZE_MODE,
    BATTLE_TURN_BOARD_TRANSFORM_MODE.DURATION
);
Battle_SetTurnInfo(BATTLE_TURN.BOARD_SIZE_DURATION, 20);
Battle_SetTurnInfo(BATTLE_TURN.BOARD_SIZE_TWEEN, ANIM_TWEEN.CUBIC);
Battle_SetTurnInfo(BATTLE_TURN.BOARD_SIZE_EASE, ANIM_EASE.OUT);
```

## Proyectiles dentro y fuera del cuadro

El `battle_bullet` estándar dibuja dentro de la surface recortada del cuadro. Para un
proyectil externo, sobrescribe el Draw y usa una profundidad externa:

```gml
// Create
event_inherited();
depth = DEPTH_BATTLE.BULLET_OUTSIDE_HIGH;
```

```gml
// Draw
draw_self();
```

Profundidades disponibles:

- `BULLET`: dentro del cuadro;
- `BULLET_OUTSIDE_LOW`: fuera, debajo del alma;
- `BULLET_OUTSIDE_HIGH`: fuera, encima del alma.

## Tipos de proyectil azul y naranja

La base no implementa color/condición automáticamente. En el Step de un hijo, haz la
regla antes de llamar a la colisión:

```gml
// Ejemplo de bala azul: solo causa daño si el alma se está moviendo.
var movendo = (
    floor(battle_soul.x) != floor(battle_soul.xprevious) ||
    floor(battle_soul.y) != floor(battle_soul.yprevious)
);

if (place_meeting(x, y, battle_soul) && movendo) {
    Battle_CallSoulEventBulletCollision();
}
```

En ese caso, estás sustituyendo el Step del padre; no llames a
`event_inherited()`, porque haría una segunda detección sin la condición.

## Alma personalizada

Crea un objeto cuya base máxima sea `battle_soul`, implementa el movimiento y, en el
momento apropiado:

```gml
Battle_SetSoul(obj_soul_azul);
```

Si el hijo tiene Create/Step, usa `event_inherited()` cuando quieras mantener
profundidad, confinamiento al cuadro, invencibilidad y game over. El objeto
`battle_soul_red` es el ejemplo de movimiento libre.

## Múltiples enemigos

Para dos enemigos:

```gml
Encounter_Set(
    2,
    obj_enemy_slime,
    -1,
    obj_enemy_morcego,
    "* ¡Un dúo bloqueó el camino!",
    snd_battle_dupla
);
```

Cuidados:

- todos reciben los eventos de batalla;
- filtra ACT y daño por el slot elegido;
- decide qué enemigo crea `battle_turn`, o crea un orquestador único;
- `Battle_GetEnemyNumber()` cuenta solo las instancias vivas;
- el índice visual del menú no siempre es el slot; conviértelo;
- al eliminar, guarda el slot en una variable local antes de `Battle_RemoveEnemy()`.

## Recompensas

```gml
Battle_RewardExp(8);
Battle_RewardGold(6);
```

Estas funciones **acumulan** en el combate. Llámalas al derrotar/perdonar, no en el
Init, si no quieres que una huida conceda una recompensa ya registrada. En la
victoria, la engine agrega EXP y GOLD al jugador y llama a `Player_UpdateLv()`.

## Huida y menú MERCY personalizado

- `Battle_SetMenuMercyFleeEnabled(bool)` muestra/oculta Flee durante la batalla.
- `Battle_SetFleeable(bool)` fuerza el resultado del test de huida.
- `Battle_SetMenuChoiceMercyOverride(true)` sustituye el menú estándar.
- `Battle_SetMenuChoiceMercyOverrideNumber(n)` define el número de entradas.
- `Battle_SetMenuChoiceMercyOverrideName(slot, texto)` define los rótulos.

Si sobrescribes el menú MERCY, trata la elección en el evento Menu End de los enemigos
o en un controlador propio.

## Depuración rápida

Durante el desarrollo, un Draw GUI temporal puede mostrar:

```gml
draw_text(8, 8, "state=" + string(Battle_GetState()));
draw_text(8, 24, "menu=" + string(Battle_GetMenu()));
draw_text(8, 40, "turn=" + string(Battle_GetTurnNumber()));
draw_text(8, 56, "time=" + string(Battle_GetTurnTime()));
```

Elimina la superposición antes de publicar.

## Checklist del enemigo

- [ ] El objeto es hijo de `battle_enemy`.
- [ ] Create llama a `event_inherited()`.
- [ ] User Event 0 define nombre, número/nombre de acciones, DEF y centro.
- [ ] `_enemy_slot` nunca se edita.
- [ ] El daño filtra el objetivo seleccionado.
- [ ] La muerte registra recompensas y llama a `Battle_RemoveEnemy()`.
- [ ] ACT añade diálogo y cambia el estado spareable cuando corresponde.
- [ ] MERCY elimina solo enemigos spareable.
- [ ] User Event 8 crea exactamente un turno/orquestador.
- [ ] El turno es hijo de `battle_turn` y configura tiempo/cuadro.
- [ ] El proyectil es hijo de `battle_bullet` y causa daño en el User Event 0.
- [ ] El encuentro se registró en `Encounter_Custom` con ID único.
- [ ] `Encounter_Start()` vuelve correctamente a la sala anterior.

Siguiente: [Diálogos y localización](/guides/dialogues-text-and-localization).
