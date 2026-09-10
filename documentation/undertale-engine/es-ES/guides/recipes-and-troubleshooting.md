<!-- locale: es-ES; content-id: recipes-and-troubleshooting -->

# Recetas y solución de problemas

## Recetas rápidas

### Recogible en el suelo

Crea `obj_pickup_torta` como hijo de `trigger`.

```gml
// Create
event_inherited();
user_char = 0;
```

```gml
// User Event 0 — Trigger
event_inherited();

var items = Item_GetInventoryItems();
if (items.Add(ITEM_TORTA)) {
    Dialog_Add("* ¡Recogiste la Torta!");
    Dialog_Start();
    instance_destroy();
} else {
    Dialog_Add("* Tu inventario está lleno.");
    Dialog_Start();
}
```

Para que no reaparezca después de salir y volver a la sala:

```gml
// Create, después de event_inherited()
var data = Storage_GetStaticGeneral();
if (data.Get("pickup_torta_ruinas", false)) {
    instance_destroy();
}
```

Antes de destruirlo al recogerlo:

```gml
Storage_GetStaticGeneral().Set("pickup_torta_ruinas", true);
```

### Puerta que consume llave

```gml
// User Event 0 de un hijo de char_sign
event_inherited();

var items = Item_GetInventoryItems();

if (Inventory_RemoveFirst(items, ITEM_CHAVE)) {
    Storage_GetStaticGeneral().Set("porta_aberta", true);
    Dialog_Add("* Usaste la llave.{sound `snd_door_open`}");
    Dialog_Start();
    block_enabled = false;
    visible = false;
} else {
    Dialog_Add("* Está cerrada.");
    Dialog_Start();
}
```

`Inventory_RemoveFirst` aparece como receta en el capítulo de ítems; conviértela
en un script del proyecto.

En el Create, restaura el estado:

```gml
event_inherited();

if (Storage_GetStaticGeneral().Get("porta_aberta", false)) {
    block_enabled = false;
    visible = false;
}
```

### Encuentro al pisar

Hijo de `trigger`:

```gml
// Create
event_inherited();
user_char = 0;
```

```gml
// User Event 0
event_inherited();

if (!Storage_GetStaticGeneral().Get("slime_derrotado", false)) {
    Encounter_Start(ENCOUNTER_SLIME);
}
```

Al derrotar/perdonar al enemigo, antes de eliminarlo:

```gml
Storage_GetStaticGeneral().Set("slime_derrotado", true);
```

### Encuentro aleatorio por pasos

En un controlador del área:

```gml
// Create
passos_ate_encontro = irandom_range(180, 360);
_x_anterior = char_player.x;
_y_anterior = char_player.y;
```

```gml
// Step
var andou = (
    char_player.x != _x_anterior ||
    char_player.y != _y_anterior
);

if (andou && !instance_exists(ui_dialog) && !Player_IsInBattle()) {
    passos_ate_encontro--;

    if (passos_ate_encontro <= 0) {
        passos_ate_encontro = irandom_range(180, 360);
        Encounter_Start(choose(ENCOUNTER_SLIME, ENCOUNTER_MORCEGO));
    }
}

_x_anterior = char_player.x;
_y_anterior = char_player.y;
```

Un desplazamiento aquí cuenta por step en movimiento, no por píxel real. Ajústalo
a la sensación deseada.

### Jefe con fases

En el Create del enemigo:

```gml
_phase = 0;
_hp_max = 300;
_hp = _hp_max;
```

Después de aplicar daño:

```gml
if (_phase == 0 && _hp <= 200) {
    _phase = 1;
    Dialog_Add("* El jefe se puso serio.");
}

if (_phase == 1 && _hp <= 100) {
    _phase = 2;
    Dialog_Add("* El escenario empezó a temblar.");
    Battle_SetEnemyDEF(_enemy_slot, 4);
}
```

En la preparación del turno:

```gml
switch (_phase) {
    case 0: instance_create_depth(0, 0, 0, obj_turn_boss_1); break;
    case 1: instance_create_depth(0, 0, 0, obj_turn_boss_2); break;
    case 2: instance_create_depth(0, 0, 0, obj_turn_boss_3); break;
}
```

### Cortescena sencilla

```gml
char_player.moveable = false;

Dialog_Add(
    "{char_link 10}* Ven conmigo.{pause}" +
    "{char_move 10 DIR.RIGHT 90}{char_unlink}"
);
Dialog_Start();
```

En un controlador Step, espera el diálogo y el movimiento:

```gml
if (
    !instance_exists(ui_dialog) &&
    obj_npc_maya.move[DIR.RIGHT] <= 0
) {
    char_player.moveable = true;
    instance_destroy();
}
```

Siempre garantiza una vía de salida que reactive al jugador, incluso si la escena
se salta.

### Ajuste de volumen persistente

Registra/obtén una zona general en el storage `settings` y luego:

```gml
var settings = Storage_GetSettings().Get("general");
settings.Set("music_volume", 0.7);
Storage_GetSettings().SaveToFile();

BGM_SetVolume(0, settings.Get("music_volume", 1), 0);
```

Carga `settings` al inicio del juego antes de aplicar los valores; la base actual
registra el storage, pero el flujo completo de la pantalla de ajustes es
responsabilidad del juego.

## Diagnóstico por síntoma

### "Función no existe": `Item_Add`, `Flag_Set` o `GMU_Console_*`

Estás siguiendo documentación heredada. En la versión actual:

- `Item_Add(obj)` se convirtió en `Item_GetInventoryItems().Add(itemId)`;
- los flags comunes se convirtieron en `Storage_GetStaticGeneral().Get/Set`;
- la consola de desarrollador antigua no está presente en la branch `master`.

No copies scripts heredados de forma aislada: dependen de la arquitectura
antigua.

### El objeto hijo no se inicializa o da variable indefinida

El evento del hijo sustituyó al del padre. Añade al principio:

```gml
event_inherited();
```

Es especialmente importante en Create/Step de `char`, `battle_soul`,
`battle_bullet`, `battle_turn` y `battle_menu_fight`.

### El NPC no responde

Comprueba:

1. el parent es `char` (directo o indirecto);
2. el sprite/máscara alcanza el área de interacción;
3. el jugador está mirando en la dirección correcta;
4. el User Event **0**, no Step/Collision, contiene el diálogo;
5. el evento llama a `Dialog_Start()`;
6. no hay otra instancia `char` cubriendo el frente del jugador;
7. `char_player.moveable` y los flags `_moveable_*` están activos.

### El NPC no gira ni anima

- Para girar al interactuar, llama a `event_inherited()` en el User Event 0.
- `dir_locked = true` impide girar.
- Confirma los índices `DIR.*` en las tablas `res_*`.
- Confirma `res_override = false` para la selección automática.
- Usa un origen consistente entre los sprites.

### El diálogo no aparece

- En el overworld, faltó `Dialog_Start()`.
- En batalla, no llames a `Dialog_Start`; la cola solo aparece en el estado
  DIALOG.
- `Dialog_Start()` devuelve `false` si ya existe `ui_dialog` o hay una `battle`.
- Confirma que el texto no termina antes con `{end}`.
- Busca comandos `{}` o crases sin cerrar.

### La elección siempre devuelve el valor antiguo

La selección se registra cuando el jugador confirma. Solo lee
`Player_GetTextTyperChoice()` después de que `ui_dialog` se destruya. Usa un Step
y un flag `_ready`, como hace `char_box`.

### El ítem aparece como `!UNDEFINED!`

- el ID no se registró en `Item_Custom`;
- la macro apunta a otra string;
- el guardado contiene un ID eliminado/renombrado;
- el registro ocurrió después de añadirlo al inventario.

Haz una migración de IDs antiguos antes de `Normalize()`, ya que normalizar
elimina ítems inválidos.

### Nombre/info del ítem vacío

Confirma:

- las claves `item.<key>.name` e `item.<key>.info`;
- JSON válido;
- el archivo listado en `string.txt`;
- la carpeta del idioma presente en `list.txt`;
- `ItemTypeSimple("key")` usa exactamente la misma clave.

### Inventario lleno

Siempre prueba el retorno:

```gml
if (!inventory.Add(ITEM_TORTA)) {
    // ofrecer caja, dejarlo en el suelo o mostrar un aviso
}
```

No aumentes `capacity` sin revisar el layout de `ui_menu` y `ui_box`.

### `Item_GetInventoryBoxes(0)` abre la caja equivocada

En la revisión analizada, los casos del `switch` no tienen `break`. Usa:

```gml
var box1 = Item_GetInventoryManager().Get("box1");
var box2 = Item_GetInventoryManager().Get("box2");
```

O corrige la función localmente añadiendo `break` después de cada asignación.

### El encuentro no existe

- el ID debe ser `>= 0` y único.
- `Encounter_Set` debe estar dentro de `Encounter_Custom()`.
- El objeto de enemigo debe existir cuando la engine compila.
- Confirma que `Encounter_Start()` usa el mismo ID/macro.

### El enemigo no aparece

- el parent/base máxima debe ser `battle_enemy`;
- usa `-1` solo para slots vacíos;
- un enemigo único en el centro debe ser el `enemy_1`;
- no destruyas la instancia en el Create;
- revisa el sprite, `visible`, alpha, scale y la profundidad.

### El enemigo recibe ACT/daño destinado a otro

Todos reciben eventos globales. Convierte y filtra:

```gml
var alvo = Battle_ConvertMenuChoiceEnemyToEnemySlot(
    Battle_GetMenuChoiceEnemy()
);
if (alvo != _enemy_slot) exit;
```

### El enemigo desaparece, pero la batalla se congela

Destruir la instancia no limpia los metadatos. Usa:

```gml
var slot = _enemy_slot;
Battle_RemoveEnemy(slot);
instance_destroy();
```

También revisa `battle_dialog_enemy`, `battle_turn` y proyectiles que puedan
haber sobrado.

### Batalla atascada en DIALOG

- un texto puede estar esperando `{pause}`;
- `Battle_SetDialogAutoEnd(false)` exige una llamada manual a `Battle_EndDialog()`;
- un `text_typer` personalizado puede no destruirse;
- limpia la cola con `Dialog_Clear()` al cancelar un flujo.

### Batalla atascada en TURN_PREPARATION

- todavía existe `battle_dialog_enemy`;
- el cuadro todavía tiene animaciones;
- `Battle_SetTurnPreparationAutoEnd(false)` exige
  `Battle_EndTurnPreparation()`;
- el turno se creó después del punto en el que la engine dispara el User Event 0.

Crea el `battle_turn` en el User Event 8 del enemigo, no en el Turn Start.

### El turno termina inmediatamente

`BATTLE_TURN.TIME` no se definió o quedó en 0. Defínelo en el User Event 0 del
`battle_turn`:

```gml
Battle_SetTurnInfo(BATTLE_TURN.TIME, 300);
```

Para control manual usa `-1` y llama a `Battle_EndTurn()`.

### Proyectil invisible

- dentro del cuadro, mantén el Draw heredado que usa la surface;
- fuera del cuadro, dibuja directamente y usa `BULLET_OUTSIDE_LOW/HIGH`;
- revisa si `Battle_GetBoardSurface()` existe en ese frame;
- revisa el sprite, alpha, scale y la profundidad;
- los proyectiles creados antes del Turn Start pueden ser limpiados por la
  transición.

### El proyectil atraviesa sin causar daño

- el parent es `battle_bullet`;
- si el Step se sobrescribió, faltó `event_inherited()`;
- la máscara del proyectil/alma puede no cruzarse;
- velocidades muy altas pueden saltarse la colisión entre steps;
- el alma puede estar en el período de invencibilidad.

Para alta velocidad, muévelo en pequeños substeps y prueba la colisión en cada
uno.

### El proyectil causa daño dos veces

Llamaste a `event_inherited()` en un Step que también implementa su propia
detección. Elige una única detección. `Battle_CallSoulEventHurt()` no reduce el
HP; solo inicia el feedback/invencibilidad, así que llama a `Player_Hurt()` una
vez.

### El warp llega al punto/dirección equivocados

Revisa los IDs y `target_room`. Además, en el commit analizado, el Room Start de
`char_player` limpia la clave de landmark dos veces. La segunda línea debería
limpiar la dirección:

```gml
z.Set(FLAG_TEMP_TRIGGER_WARP_LANDMARK, -1);
z.Set(FLAG_TEMP_TRIGGER_WARP_DIR, 0);
```

Si tu copia todavía contiene dos llamadas a
`FLAG_TEMP_TRIGGER_WARP_LANDMARK`, corrige la segunda.

### El guardado no se crea

- confirma `GAME_SAVE_NAME` sin espacios/caracteres especiales;
- prueba si las carpetas `GAME_SAVE_NAME/fileN` se crean en el destino;
- `File_WriteAllText` no crea carpetas explícitamente en la implementación;
- consulta el retorno de `SaveToFile()`;
- revisa los permisos/sandbox de la plataforma;
- busca un error de serialización de struct/asset no soportado.

### El guardado antiguo perdió un ítem

`Inventory.Normalize()` elimina los IDs no registrados. Preserva los aliases
antiguos o migra el array bruto al nuevo ID antes de normalizar.

### El nombre de la sala aparece vacío en el menú de guardado

Añade toda sala jugable a `Player_GetRoomName(room)`:

```gml
case room_corredor:
    name = "Corredor de las Ruinas";
    break;
```

El guardado almacena el nombre del asset y la UI lo convierte de vuelta antes de
llamar a esta función.

### `Lang_GetInfo` no encuentra `info.ini`

En la revisión analizada, la función arma la ruta usando
`GMU_LANG_PATH_STRING + LANG + GMU_LANG_PATH_INFO`, a diferencia de las otras
funciones. Si vas a usar metadatos, ajusta las dos ocurrencias a:

```gml
GMU_LANG_PATH_BASE + LANG + "/" + GMU_LANG_PATH_INFO
```

El idioma inglés estándar no incluye `info.ini`, así que esa ruta no es necesaria
para textos, fuentes o sprites comunes.

### La música se reinicia cada vez que entras en una sala

Usa `hint_bgm`: solo llama a `BGM_Play` cuando el slot no está sonando o contiene
otro audio. Si lo controlas manualmente, compara `BGM_GetAudio(slot)` antes de
reproducir.

### El replay no funciona

El sistema Demo actual es experimental: la persistencia/restauración del buffer
está comentada. Implementa el almacenamiento antes de usar
`Demo_StartPlaying()`.

## Estrategia de aislamiento de errores

1. Reprodúcelo en una sala mínima.
2. Prueba un objeto-base sin hijo personalizado.
3. Reactiva un evento a la vez.
4. Muestra IDs, estados y slots con `show_debug_message()`.
5. Confirma el parent en el editor.
6. Confirma si el evento heredado es necesario.
7. Verifica los nombres de assets/macros y el case.
8. Haz un juego nuevo para separar el bug del guardado antiguo.
9. Compara con la branch actual, no solo con `old_version_examples`.

Volver al [índice](../README.md).
