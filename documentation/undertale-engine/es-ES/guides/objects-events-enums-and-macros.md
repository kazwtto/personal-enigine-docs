<!-- locale: es-ES; content-id: objects-events-enums-and-macros -->

# Objetos, eventos, enums y macros

## Catálogo de objetos

### Controladores

| Objeto | Parent | Papel |
|---|---|---|
| `world` | — | controlador persistente; inicializa y actualiza sistemas |
| `camera` | — | cámara, objetivo, límites, zoom y temblor |
| `fader` | — | rectángulo de fade global |
| `border` | — | borde externo y cambio de tamaño de la ventana |
| `closed_captions` | — | cola de subtítulos en la GUI |
| `menu` | — | título, naming, continue/reset/settings |
| `logo` | — | apertura/logo |

No coloques copias extra de los controladores en cada sala. `world` los crea en
Game Start.

### Overworld

| Objeto | Parent | Papel |
|---|---|---|
| `block` | — | barrera con `block_enabled` |
| `block_corner` | `block` | variación de barrera/esquina |
| `char` | `block` | personaje-base, movimiento, dirección e interacción |
| `char_player` | `char` | jugador controlable |
| `char_sign` | `char` | objeto inmóvil con variable `text` |
| `char_save` | `char_sign` | cura y abre UI de guardado |
| `char_box` | `char_sign` | confirmación y UI de caja |
| `trigger` | — | entrada/salida por superposición con `char` |
| `trigger_warp` | `trigger` | fade, landmark y cambio de sala |
| `hint_landmark` | — | punto de llegada por `landmark_id` |
| `hint_bgm` | — | aplica música/pitch por sala |
| `hint_border` | — | aplica sprite de borde por sala |
| `hint_half_size` | — | define escala 2× de la cámara |
| `exclamation` | — | ícono de la animación de encuentro |
| `encounter_anim` | — | transición overworld → batalla |

### Texto e interfaz

| Objeto | Parent | Papel |
|---|---|---|
| `text_typer` | — | interpreta texto y crea caracteres |
| `text_single` | — | un carácter/sprite renderizado |
| `face` | — | retrato/face con emociones y frase |
| `ui_dialog` | — | caja de diálogo del overworld |
| `ui_menu` | — | ítems, estado y teléfono |
| `ui_save` | — | interfaz del save point |
| `ui_box` | — | transferencia inventario/caja |

### Núcleo de la batalla

| Objeto | Parent | Papel |
|---|---|---|
| `battle` | — | máquina de estados y datos del combate |
| `battle_board` | — | fondo, borde, colisión y surface del cuadro |
| `battle_enemy` | — | base obligatoria para enemigos |
| `battle_turn` | — | base para orquestadores de ataque |
| `battle_bullet` | — | base de proyectil y colisión |
| `battle_soul` | — | base del alma, invencibilidad y game over |
| `battle_soul_red` | `battle_soul` | alma roja con movimiento libre |
| `battle_ui` | — | nombre, LV, HP y HUD |
| `battle_fader` | — | fade local de la batalla |

### Menús y feedback de la batalla

| Objeto | Parent | Papel |
|---|---|---|
| `battle_button` | — | base de los cuatro botones |
| `battle_button_fight` | `battle_button` | botón FIGHT |
| `battle_button_act` | `battle_button` | botón ACT |
| `battle_button_item` | `battle_button` | botón ITEM/estado vacío |
| `battle_button_mercy` | `battle_button` | botón MERCY |
| `battle_menu_fight` | — | base de minijuego de ataque |
| `battle_menu_fight_knife` | `battle_menu_fight` | mira/ataque de cuchillo estándar |
| `battle_menu_fight_anim_knife` | — | animación visual del golpe |
| `battle_menu_fight_hp_bar` | — | HP en el selector de objetivo |
| `battle_menu_item_scrollbar` | — | indicador de scroll de ítems |
| `battle_damage` | — | número y barra de daño |
| `battle_death_particle` | — | vaporización del enemigo |
| `battle_death_particle_collision` | — | auxiliar de la partícula |
| `battle_dialog_enemy` | — | globo de frase del enemigo |
| `battle_result_flee` | — | animación de huida |
| `shaker` | — | temblor de una variable/instancia |

### Game over y herramientas

| Objeto | Parent | Papel |
|---|---|---|
| `gameover` | — | secuencia de derrota |
| `gameover_shard` | — | fragmentos del alma |
| `demo_recorder` | — | graba estados de input en buffer |
| `demo_player` | — | reproduce buffer de input; experimental |

## Eventos de extensión

### `char`

| Evento | Función |
|---|---|
| Create | inicializa dirección, movimiento, colisión y tablas de sprite |
| Step | mueve, colisiona y elige sprite |
| End Step | define profundidad por Y |
| User Event 0 | **Interact**; mira al jugador |
| Clean Up | destruye lista de colisión |

Los hijos con Create deben usar `event_inherited()`. Los hijos interactivos
normalmente también llaman al User Event heredado para girar en dirección al
jugador.

### `trigger`

| Evento | Nombre |
|---:|---|
| User Event 0 | Trigger/entró |
| User Event 1 | Leave/salió |

### `battle_enemy`

| User Event | Enum | Nombre |
|---:|---|---|
| 0 | `INIT` | Init |
| 1 | `BATTLE_START` | Battle Start |
| 2 | `MENU_START` | Menu Start |
| 3 | `MENU_SWITCH` | Menu Switch |
| 4 | `MENU_CHOICE_SWITCH` | Menu Choice Switch |
| 5 | `MENU_END` | Menu End |
| 6 | `DIALOG_START` | Dialog Start |
| 7 | `DIALOG_END` | Dialog End |
| 8 | `TURN_PREPARATION_START` | Turn Preparation Start |
| 9 | `TURN_PREPARATION_END` | Turn Preparation End |
| 10 | `TURN_START` | Turn Start |
| 11 | `TURN_END` | Turn End |
| 12 | `BOARD_RESETTING_START` | Board Resetting Start |
| 13 | `BOARD_RESETTING_END` | Board Resetting End |

### `battle_turn`

| User Event | Enum | Nombre |
|---:|---|---|
| 0 | `TURN_PREPARATION_START` | configurar cuadro/tiempo |
| 1 | `TURN_PREPARATION_END` | fin de la preparación |
| 2 | `TURN_START` | iniciar ataque |
| 3 | `TURN_END` | destruye por defecto |

### `battle_bullet`

| User Event | Enum | Nombre |
|---:|---|---|
| 0 | `SOUL_COLLISION` | reacción/daño al tocar el alma |
| 1 | `TURN_END` | destruye por defecto |

El Step del padre detecta `place_meeting` y el Draw del padre recorta en la
surface del cuadro.

### `battle_soul`

| User Event | Enum | Nombre |
|---:|---|---|
| 0 | `BULLET_COLLISION` | acepta colisión si la invencibilidad terminó |
| 1 | `HURT` | inicia invencibilidad, sonido y temblor |

### `battle_menu_fight`

| User Event | Enum | Nombre |
|---:|---|---|
| 0 | `ANIM` | animación visual del golpe |
| 1 | `DAMAGE` | fase de daño |
| 2 | `END` | finaliza/destruye minijuego |

### `text_typer`

| User Event | Nombre |
|---:|---|
| 0 | New Char |
| 1 | New Line |
| 2 | Command |
| 3 | Clear |
| 4 | Update Position |
| 5 | Group & Macro |
| 15 | Update Immediately |

Sobrescribir estos eventos altera el parser/renderizador de todo el texto.
Prefiere comandos y grupos existentes antes de editar la base.

## Enums de batalla

### `BATTLE_STATE`

| Nombre | Valor |
|---|---:|
| `MENU` | 0 |
| `DIALOG` | 1 |
| `TURN_PREPARATION` | 2 |
| `IN_TURN` | 3 |
| `BOARD_RESETTING` | 4 |
| `RESULT` | 5 |

### `BATTLE_MENU`

| Nombre | Valor |
|---|---:|
| `BUTTON` | 0 |
| `FIGHT_TARGET` | 1 |
| `FIGHT_AIM` | 2 |
| `FIGHT_ANIM` | 3 |
| `FIGHT_DAMAGE` | 4 |
| `ACT_TARGET` | 5 |
| `ACT_ACTION` | 6 |
| `ITEM` | 7 |
| `MERCY` | 8 |

### Elecciones

```text
BATTLE_MENU_CHOICE_BUTTON.FIGHT = 0
BATTLE_MENU_CHOICE_BUTTON.ACT   = 1
BATTLE_MENU_CHOICE_BUTTON.ITEM  = 2
BATTLE_MENU_CHOICE_BUTTON.MERCY = 3

BATTLE_MENU_CHOICE_MERCY.SPARE = 0
BATTLE_MENU_CHOICE_MERCY.FLEE  = 1
```

### `BATTLE_ENEMY_EVENT`

```text
INIT=0, BATTLE_START=1, MENU_START=2, MENU_SWITCH=3,
MENU_CHOICE_SWITCH=4, MENU_END=5, DIALOG_START=6, DIALOG_END=7,
TURN_PREPARATION_START=8, TURN_PREPARATION_END=9,
TURN_START=10, TURN_END=11,
BOARD_RESETTING_START=12, BOARD_RESETTING_END=13
```

### Otros eventos

```text
BATTLE_SOUL_EVENT.BULLET_COLLISION = 0
BATTLE_SOUL_EVENT.HURT             = 1

BATTLE_BULLET_EVENT.SOUL_COLLISION = 0
BATTLE_BULLET_EVENT.TURN_END       = 1

BATTLE_TURN_EVENT.TURN_PREPARATION_START = 0
BATTLE_TURN_EVENT.TURN_PREPARATION_END   = 1
BATTLE_TURN_EVENT.TURN_START             = 2
BATTLE_TURN_EVENT.TURN_END               = 3

BATTLE_MENU_FIGHT_EVENT.ANIM   = 0
BATTLE_MENU_FIGHT_EVENT.DAMAGE = 1
BATTLE_MENU_FIGHT_EVENT.END    = 2
```

## Cuadro y turno

### `BATTLE_BOARD`

```text
X=320, Y=320, UP=65, DOWN=65, LEFT=283, RIGHT=283
```

Las medidas direccionales son extensiones desde el centro, no ancho/alto
totales.

### `BATTLE_TURN`

| Valor | Clave | Valor | Clave |
|---:|---|---:|---|
| 0 | `TIME` | 18 | `BOARD_RESET_Y` |
| 1 | `BOARD_X` | 19 | `BOARD_RESET_UP` |
| 2 | `BOARD_Y` | 20 | `BOARD_RESET_DOWN` |
| 3 | `BOARD_UP` | 21 | `BOARD_RESET_LEFT` |
| 4 | `BOARD_DOWN` | 22 | `BOARD_RESET_RIGHT` |
| 5 | `BOARD_LEFT` | 23 | `BOARD_RESET_MOVE_TWEEN` |
| 6 | `BOARD_RIGHT` | 24 | `BOARD_RESET_MOVE_EASE` |
| 7 | `BOARD_MOVE_TWEEN` | 25 | `BOARD_RESET_MOVE_MODE` |
| 8 | `BOARD_MOVE_EASE` | 26 | `BOARD_RESET_MOVE_SPEED` |
| 9 | `BOARD_MOVE_MODE` | 27 | `BOARD_RESET_MOVE_DURATION` |
| 10 | `BOARD_MOVE_SPEED` | 28 | `BOARD_RESET_SIZE_TWEEN` |
| 11 | `BOARD_MOVE_DURATION` | 29 | `BOARD_RESET_SIZE_EASE` |
| 12 | `BOARD_SIZE_TWEEN` | 30 | `BOARD_RESET_SIZE_MODE` |
| 13 | `BOARD_SIZE_EASE` | 31 | `BOARD_RESET_SIZE_SPEED` |
| 14 | `BOARD_SIZE_MODE` | 32 | `BOARD_RESET_SIZE_DURATION` |
| 15 | `BOARD_SIZE_SPEED` | 33 | `SOUL_X` |
| 16 | `BOARD_SIZE_DURATION` | 34 | `SOUL_Y` |
| 17 | `BOARD_RESET_X` |  |  |

```text
BATTLE_TURN_BOARD_TRANSFORM_MODE.SPEED = 0
BATTLE_TURN_BOARD_TRANSFORM_MODE.DURATION = 1
```

## Profundidades

Los valores menores aparecen delante de los mayores en GameMaker.

### `DEPTH_UI`

```text
PANEL=-100
TEXT=-200
ENCOUNTER_ANIM=-300
FADER=-400
```

### `DEPTH_BATTLE`

```text
BG=-100
ENEMY=-200
UI=-300
FADER=-400
BULLET=-500
BOARD=-600
UI_HIGH=-700
BULLET_OUTSIDE_LOW=-800
SOUL=-900
BULLET_OUTSIDE_HIGH=-1000
```

## Direcciones

```text
DIR.RIGHT = 0
DIR.UP    = 90
DIR.LEFT  = 180
DIR.DOWN  = 270
```

Ese orden permite usar la dirección como índice de arrays alocados en las
posiciones 0, 90, 180 y 270.

## Entrada

### `INPUT`

```text
UP=0, DOWN=1, LEFT=2, RIGHT=3, CONFIRM=4, CANCEL=5, MENU=6
```

### Creados por `Input_Init`

```text
INPUT_TYPE.KEYBOARD=0
INPUT_TYPE.GAMEPAD=1
INPUT_TYPE.MOUSE=2

INPUT_STATE.NULL=0
INPUT_STATE.HELD=1
INPUT_STATE.PRESSED=2
INPUT_STATE.RELEASED=3
```

## Animación

Creados por `Anim_Init`:

```text
ANIM_TWEEN.LINEAR=0
ANIM_TWEEN.SINE=1
ANIM_TWEEN.QUAD=2
ANIM_TWEEN.CUBIC=3
ANIM_TWEEN.QUART=4
ANIM_TWEEN.QUINT=5
ANIM_TWEEN.EXPO=6
ANIM_TWEEN.CIRC=7
ANIM_TWEEN.BACK=8
ANIM_TWEEN.ELASTIC=9
ANIM_TWEEN.BOUNCE=10

ANIM_EASE.IN=0
ANIM_EASE.OUT=1
ANIM_EASE.IN_OUT=2
```

`ANIM_DATA` es interno al gestor; no dependas de sus números en gameplay.

## Configuración del juego

En `Macro_Game`:

```gml
#macro GAME_NAME "UNDERTALE Engine"
#macro GAME_AUTHOR "TML"
#macro GAME_VERSION "v0.0.0"
#macro GAME_SAVE_NAME "undertale_engine"
```

En `Macro_Engine`:

```gml
#macro ENGINE_VERSION "v0.6.0"
```

Cambia los macros `GAME_*`, no `ENGINE_VERSION`.

## Plot

Estándar:

```gml
enum PLOT {
    START
};
```

Añade nuevos marcadores al final para evitar cambiar los valores de los
guardados existentes:

```gml
enum PLOT {
    START,
    FALOU_COM_MAYA,
    PORTA_ABERTA
};
```

## Flags/claves de Storage

### Estáticas

| Macro | Clave |
|---|---|
| `FLAG_STATIC_NAME` | `name` |
| `FLAG_STATIC_LV` | `lv` |
| `FLAG_STATIC_HP_MAX` | `hp_max` |
| `FLAG_STATIC_HP` | `hp` |
| `FLAG_STATIC_ATK` | `atk` |
| `FLAG_STATIC_ATK_ITEM` | `atk_item` |
| `FLAG_STATIC_DEF` | `def` |
| `FLAG_STATIC_DEF_ITEM` | `def_item` |
| `FLAG_STATIC_SPD` | `spd` |
| `FLAG_STATIC_SPD_ITEM` | `spd_item` |
| `FLAG_STATIC_INV` | `inv` |
| `FLAG_STATIC_INV_ITEM` | `inv_item` |
| `FLAG_STATIC_EXP` | `exp` |
| `FLAG_STATIC_GOLD` | `gold` |
| `FLAG_STATIC_ITEM_WEAPON` | `item_weapon` |
| `FLAG_STATIC_ITEM_ARMOR` | `item_armor` |
| `FLAG_STATIC_BATTLE_MENU_FIGHT_OBJ` | `battle_menu_fight_obj` |
| `FLAG_STATIC_PLOT` | `plot` |
| `FLAG_STATIC_KILLS` | `kills` |
| `FLAG_STATIC_ROOM` | `room` |
| `FLAG_STATIC_TIME` | `time` |
| `FLAG_STATIC_FUN` | `fun` |

### Información de slot

```text
FLAG_INFO_NAME = "name"
FLAG_INFO_LV   = "lv"
FLAG_INFO_TIME = "time"
FLAG_INFO_ROOM = "room"
```

### Temporales

```text
FLAG_TEMP_ENCOUNTER = "encounter_id"
FLAG_TEMP_BATTLE_ROOM_RETURN = "battle_room_return"
FLAG_TEMP_GAMEOVER_SOUL_X = "gameover_soul_x"
FLAG_TEMP_GAMEOVER_SOUL_Y = "gameover_soul_y"
FLAG_TEMP_TRIGGER_WARP_LANDMARK = "trigger_warp_landmark"
FLAG_TEMP_TRIGGER_WARP_DIR = "trigger_warp_dir"
FLAG_TEMP_TEXT_TYPER_CHOICE = "text_typer_choice"
```

La región de flags dinámicas y de settings comienza vacía para que el juego la
llene.

## Ítems estándar

```text
ITEM_EMPTY = ""
ITEM_DICE = "dice"
ITEM_STICK = "stick"
ITEM_BANDAGE = "bandage"
ITEM_TOY_KNIFE = "toy_knife"
ITEM_FADED_RIBBON = "faded_ribbon"
ITEM_PHONE_TML = "phone_tml"
```

Los macros de ítems de ejemplo se declaran en `Item_Custom`. Los IDs de ítem
son strings y deben existir en el `ItemTypeManager` antes de entrar en el
inventario o el equipamiento.
