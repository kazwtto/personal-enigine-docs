<!-- locale: es-ES; content-id: defining-enemies -->

# Definir enemigos

Un enemigo completo no es solo un sprite colocado en la batalla. Reúne un objeto
hijo de `battle_enemy`, estado propio, configuración de menú, respuestas a los
eventos de la engine y un encuentro que lo instancia.

> [!NOTE]
> La engine no proporciona una variable universal de vida para los enemigos.
> Cada objeto de enemigo controla su propio `hp`, aplica el daño de FIGHT y
> decide cuándo debe ser eliminado, perdonado o derrotado.

## Visión rápida

| Parte | Responsabilidad |
|---|---|
| objeto hijo de `battle_enemy` | estado y comportamiento del enemigo |
| User Event 0 — Init | nombre, DEF, centro visual y ACTs |
| User Event 1 — Battle Start | texto o estado inicial de la lucha |
| User Event 5 — Menu End | procesar FIGHT, ACT, ITEM y MERCY |
| User Events 8–11 | preparar, iniciar y finalizar el turno defensivo |
| `Encounter_Set()` | registrar la formación y la música |
| objeto hijo de `battle_turn` | crear el patrón de ataque |

## 1. Crear el objeto-base

Crea un objeto, por ejemplo `obj_enemy_training`, y define `battle_enemy` como
padre. El objeto-base es deliberadamente vacío: la engine envía eventos, pero el
hijo decide qué significa cada evento.

En el **Create Event**, inicializa solo el estado que pertenece al enemigo:

```gml
event_inherited();

hp_max = 30;
hp = hp_max;
angry = false;
act_talked = false;
```

`event_inherited()` preserva cualquier inicialización añadida al objeto-base. No
guardes el slot manualmente: `Battle_SetEnemy()` define `_enemy_slot` antes de
disparar el evento Init.

## 2. Configurar nombre, defensa y ACTs

El enum `BATTLE_ENEMY_EVENT` corresponde, en el mismo orden, a los User Events
del objeto. El User Event 0 recibe `BATTLE_ENEMY_EVENT.INIT`.

```gml
// User Event 0 — Init
Battle_SetEnemyName(_enemy_slot, "TRAINING DUMMY");
Battle_SetEnemyDEF(_enemy_slot, 2);
Battle_SetEnemyCenterPos(_enemy_slot, x, y - 48);

Battle_SetEnemyActionNumber(_enemy_slot, 2);
Battle_SetEnemyActionName(_enemy_slot, 0, "Check");
Battle_SetEnemyActionName(_enemy_slot, 1, "Talk");
```

Funciones de esta etapa:

- [`Battle_SetEnemy()`](/reference/battle-setenemy) coloca el objeto en un slot;
- [`Battle_SetEnemyName()`](/reference/battle-setenemyname) define el rótulo;
- [`Battle_SetEnemyDEF()`](/reference/battle-setenemydef) configura la defensa;
- [`Battle_SetEnemyCenterPos()`](/reference/battle-setenemycenterpos) alinea efectos;
- [`Battle_SetEnemyActionNumber()`](/reference/battle-setenemyactionnumber) crea las entradas ACT;
- [`Battle_SetEnemyActionName()`](/reference/battle-setenemyactionname) nombra cada ACT.

## 3. Entender todos los eventos

| User Event | Enum | Momento |
|---:|---|---|
| 0 | `INIT` | después de que el enemigo entra en el slot |
| 1 | `BATTLE_START` | comienzo efectivo de la batalla |
| 2 | `MENU_START` | vuelta al menú principal |
| 3 | `MENU_SWITCH` | cambio de submenú |
| 4 | `MENU_CHOICE_SWITCH` | el cursor cambia de elección |
| 5 | `MENU_END` | se confirmó una elección |
| 6 | `DIALOG_START` | comienza el diálogo antes del turno |
| 7 | `DIALOG_END` | termina el diálogo |
| 8 | `TURN_PREPARATION_START` | configura el siguiente turno |
| 9 | `TURN_PREPARATION_END` | preparación concluida |
| 10 | `TURN_START` | cuadro y alma están listos |
| 11 | `TURN_END` | el patrón defensivo terminó |
| 12 | `BOARD_RESETTING_START` | el cuadro empieza a volver al patrón |
| 13 | `BOARD_RESETTING_END` | el cuadro terminó de volver |

No necesitas implementarlos todos. Usa solo los eventos en los que el enemigo
necesita reaccionar.

## 4. Procesar FIGHT y la vida del enemigo

En el User Event 5, descubre qué botón se usó. Cuando sea FIGHT, lee el daño
calculado por la interfaz y aplícalo al `hp` del propio enemigo.

```gml
// User Event 5 — Menu End
var button = Battle_GetMenuChoiceButton();

if (button == BATTLE_MENU.FIGHT) {
    var damage = max(0, Battle_GetMenuFightDamage());
    hp = max(0, hp - damage);

    if (hp <= 0) {
        Battle_RewardExp(10);
        Battle_RewardGold(6);
        instance_destroy();
        Battle_RemoveEnemy(_enemy_slot);
    }
}
```

> [!WARNING]
> `Battle_RemoveEnemy()` limpia el slot, pero no destruye la instancia. Cuando el
> enemigo sea derrotado, hazte cargo de las dos acciones en el orden apropiado
> para tu objeto.

Llamadas relacionadas:

- [`Battle_GetMenuChoiceButton()`](/reference/battle-getmenuchoicebutton);
- [`Battle_GetMenuFightDamage()`](/reference/battle-getmenufightdamage);
- [`Battle_RewardExp()`](/reference/battle-rewardexp);
- [`Battle_RewardGold()`](/reference/battle-rewardgold);
- [`Battle_RemoveEnemy()`](/reference/battle-removeenemy).

## 5. Implementar ACT

Todavía en el User Event 5, verifica el índice elegido en ACT. El índice empieza
en cero y acompaña a los nombres registrados en el Init.

```gml
if (button == BATTLE_MENU.ACT) {
    switch (Battle_GetMenuChoiceAction()) {
        case 0: // Check
            Battle_SetDialog("* TRAINING DUMMY - ATK 0 DEF 2&* It waits patiently.");
            break;

        case 1: // Talk
            act_talked = true;
            Battle_SetEnemySpareable(_enemy_slot, true);
            Battle_SetDialog("* You explain that this is only practice.");
            break;
    }
}
```

`Battle_SetEnemySpareable()` controla el estado amarillo y permite que SPARE
resuelva al enemigo. La condición para perdonar sigue siendo una decisión del
objeto.

## 6. Configurar el turno defensivo

El User Event 8 es un buen lugar para definir el controlador del patrón, el
tiempo y el tamaño del cuadro.

```gml
// User Event 8 — Turn Preparation Start
instance_create_depth(0, 0, 0, obj_turn_training);
Battle_SetTurnInfo(BATTLE_TURN.TIME, 150);
Battle_SetTurnInfo(BATTLE_TURN.BOARD_UP, 65);
Battle_SetTurnInfo(BATTLE_TURN.BOARD_DOWN, 65);
Battle_SetTurnInfo(BATTLE_TURN.BOARD_LEFT, 110);
Battle_SetTurnInfo(BATTLE_TURN.BOARD_RIGHT, 110);
```

El objeto `obj_turn_training` debe ser hijo de `battle_turn`. La creación de los
proyectiles le pertenece a él, no al enemigo. Ver [Patrones de bala](/systems/bullet-patterns).

## 7. Registrar el encuentro

En `Encounter_Custom()`, registra una formación que use el objeto creado:

```gml
#macro ENCOUNTER_TRAINING 100

Encounter_Set(
    ENCOUNTER_TRAINING,
    obj_enemy_training,
    noone,
    noone,
    "* The training begins.",
    snd_battle,
    true
);
```

Inicia la batalla en el overworld:

```gml
Encounter_Start(ENCOUNTER_TRAINING);
```

## 8. Separar responsabilidades

Evita un único User Event con cientos de líneas. Extrae las decisiones a
funciones del propio objeto:

```gml
function ReceiveFightDamage() {
    var damage = max(0, Battle_GetMenuFightDamage());
    hp = max(0, hp - damage);
    return hp <= 0;
}

function ChooseTurn() {
    return angry ? obj_turn_training_fast : obj_turn_training;
}
```

Así, el User Event solo lee la elección y la reenvía a la función correcta.

## Checklist del enemigo

- [ ] El objeto es hijo de `battle_enemy`.
- [ ] El Create Event llama a `event_inherited()`.
- [ ] El User Event 0 define nombre, DEF, centro y ACTs.
- [ ] El objeto mantiene su propia variable de vida.
- [ ] El User Event 5 aplica FIGHT y resuelve ACT/MERCY.
- [ ] La derrota y el perdón limpian el slot correctamente.
- [ ] El User Event 8 elige un objeto hijo de `battle_turn`.
- [ ] El encuentro está registrado en `Encounter_Custom()`.
