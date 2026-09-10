<!-- locale: es-ES; content-id: overworld-rooms-and-npcs -->

# Overworld, salas y NPCs {#overworld-rooms-and-npcs}

## Cómo funciona la interacción {#how-interaction-works}

`char_player` es hijo de `char`. Al confirmar, prueba una pequeña área en la
dirección en la que está mirando, busca una instancia de `char` y llama a su
**User Event 0**. El objeto-base `char` también:

- hereda la colisión de `block`;
- mantiene `dir`, `move`, `move_speed` y `talking`;
- elige sprites de parado, movimiento y frase por dirección;
- se gira hacia el jugador al interactuar, salvo cuando `dir_locked = true`;
- ordena la profundidad usando la posición vertical.

Esa es la base tanto de NPCs como de carteles, guardados y cajas.

## Crear un NPC completo {#create-a-complete-npc}

### 1. Prepara los sprites {#1-prepare-the-sprites}

Crea los sprites necesarios, preferiblemente con:

- origen en **bottom-center** (centro inferior, en los pies);
- máscara de colisión pequeña, que cubra principalmente los pies/cuerpo;
- frames consistentes entre las cuatro direcciones;
- nombres claros, como `spr_npc_maya_down`, `spr_npc_maya_up` y
  `spr_npc_maya_right`.

Si se usa el mismo sprite para izquierda y derecha, la engine puede espejarlo.

### 2. Crea el objeto {#2-create-the-object}

Crea `obj_npc_maya` y define **Parent = `char`**.

En el evento **Create**:

```gml
event_inherited();

// Debe ser único entre personajes usados por comandos de diálogo.
char_id = 10;
dir = DIR.DOWN;

// Parado.
res_idle_sprite[DIR.UP]    = spr_npc_maya_up;
res_idle_sprite[DIR.DOWN]  = spr_npc_maya_down;
res_idle_sprite[DIR.LEFT]  = spr_npc_maya_right;
res_idle_sprite[DIR.RIGHT] = spr_npc_maya_right;

// Caminando.
res_move_sprite[DIR.UP]    = spr_npc_maya_up;
res_move_sprite[DIR.DOWN]  = spr_npc_maya_down;
res_move_sprite[DIR.LEFT]  = spr_npc_maya_right;
res_move_sprite[DIR.RIGHT] = spr_npc_maya_right;

// Ajusta los frames y la velocidad a tu sprite.
res_idle_image[DIR.UP] = 0;
res_idle_image[DIR.DOWN] = 0;
res_idle_image[DIR.LEFT] = 0;
res_idle_image[DIR.RIGHT] = 0;

res_move_image[DIR.UP] = 1;
res_move_image[DIR.DOWN] = 1;
res_move_image[DIR.LEFT] = 1;
res_move_image[DIR.RIGHT] = 1;

res_move_speed[DIR.UP] = 1 / 3;
res_move_speed[DIR.DOWN] = 1 / 3;
res_move_speed[DIR.LEFT] = 1 / 3;
res_move_speed[DIR.RIGHT] = 1 / 3;

// El sprite de izquierda reutiliza el de la derecha y se espeja.
res_idle_flip_x[DIR.LEFT] = true;
res_move_flip_x[DIR.LEFT] = true;
```

El `event_inherited()` es obligatorio aquí. Sin él, las estructuras de
movimiento, colisión y sprites del padre no se inicializan.

### 3. Implementa la conversación {#3-implement-the-conversation}

Añade **User Event 0** (Interact):

```gml
event_inherited(); // hace que el NPC mire al jugador

Dialog_Add("{char_link 10}* ¡Hola!&* Soy Maya.{pause}{char_unlink}");
Dialog_Add("* Esta es una segunda caja de diálogo.");
Dialog_Start();
```

`Dialog_Add()` pone cajas en la cola. `Dialog_Start()` abre `ui_dialog` si aún
no hay una. `{char_link 10}` sincroniza `talking` con la escritura, permitiendo
al objeto usar sus sprites de frase.

### 4. Colócalo en la sala {#4-place-it-in-the-room}

Arrastra `obj_npc_maya` a la sala. Verifica:

- la instancia está en la capa correcta;
- el origen visual queda en los pies;
- la máscara no bloquea al jugador desde muy lejos;
- el NPC está dentro de los límites de la cámara;
- el jugador puede pararse frente a él y confirmar.

## NPC con diálogo que cambia {#npc-with-changing-dialogue}

### Cambio que se revierte al cargar el guardado {#change-that-reverts-when-loading-a-save}

Usa el área estática. Solo va al disco en `Storage_SaveGame()`:

```gml
event_inherited();

var data = Storage_GetStaticGeneral();
var veces = data.Get("maya_conversas", 0);

if (veces == 0) {
    Dialog_Add("* Es la primera vez que hablamos.");
} else {
    Dialog_Add("* Qué bueno verte de nuevo.");
}

data.Set("maya_conversas", veces + 1);
Dialog_Start();
```

### Cambio que continúa incluso sin guardar en el save point {#change-that-persists-even-without-saving-at-a-save-point}

Usa el área dinámica y graba inmediatamente:

```gml
var dynamic = Storage_GetDynamic();
var general = dynamic.Get("general");

general.Set("viu_maya", true);
Storage_SaveDynamic();
```

Los datos dinámicos son apropiados para reacciones metanarrativas. Los datos
comunes de la historia generalmente pertenecen al área estática y a una
clave/macro clara.

## NPC condicionado al plot {#plot-conditioned-npc}

En `Macro_Plot`, crea marcadores:

```gml
enum PLOT {
    START,
    FALOU_COM_MAYA,
    PORTA_ABERTA
};
```

En el evento de interacción:

```gml
event_inherited();

switch (Player_GetPlot()) {
    case PLOT.START:
        Dialog_Add("* Busca la llave en el pasillo.");
        Player_SetPlot(PLOT.FALOU_COM_MAYA);
        break;

    case PLOT.FALOU_COM_MAYA:
        Dialog_Add("* ¿Todavía buscando la llave?");
        break;

    default:
        Dialog_Add("* La puerta ya está abierta.");
        break;
}

Dialog_Start();
```

## Mover personajes {#moving-characters}

Cada dirección tiene una cuenta en `move[DIR.*]`. Con la velocidad estándar 2,
el personaje camina aproximadamente 2 píxeles por step durante esa cuenta:

```gml
move[DIR.RIGHT] = 60;
```

También es posible iniciar el movimiento de un personaje dentro del texto:

```gml
Dialog_Add(
    "* Voy hasta allí.{pause}" +
    "{char_dir 10 DIR.RIGHT}" +
    "{char_move 10 DIR.RIGHT 60}" +
    "{pause}* Listo."
);
Dialog_Start();
```

Los comandos de texto se ejecutan mientras se procesa la frase; no esperan
automáticamente a que la caminata termine. Usa pausas, estados o lógica en el
Step cuando necesites sincronización exacta.

## Carteles y objetos interactivos rápidos {#signs-and-quick-interactive-objects}

Para algo inmóvil, usa `char_sign` como padre o coloca una instancia de él y
define `text` en el **Creation Code**:

```gml
text = "* El cartel dice:&  CAMINO CERRADO.";
```

`char_sign` define `dir_locked = true`, añade `text` a la cola y abre el
diálogo.

Otras bases listas:

- `char_save`: cura al jugador y abre `ui_save`;
- `char_box`: pregunta si desea usar la caja y abre `ui_box`;
- `char_player`: personaje controlable.

## Colisiones {#collisions}

`block` es la barrera básica. Su propiedad principal es:

```gml
block_enabled = true;
```

Cámbiala a `false` para desactivar temporalmente la colisión. `char` también es
hijo de `block`, así que los personajes bloquean el movimiento cuando su
colisión está activa. Dentro de un hijo de `char`, es posible usar:

```gml
collision = false;    // este personaje deja de consultar bloques al moverse
block_enabled = false; // otros personajes dejan de colisionar con él
```

Usa `block_corner` en formas de colisión que necesiten heredar la barrera
básica.

## Disparadores {#triggers}

`trigger` verifica la superposición con personajes. Variables:

- `user_char = -1`: cualquier `char_id`; usa `0` para solo el jugador;
- `_triggered`: control interno; no lo modifiques manualmente.

Eventos:

- **User Event 0 — Trigger**: el personaje entró;
- **User Event 1 — Leave**: el personaje salió después de activarlo.

Crea un hijo de `trigger` para un evento de historia:

```gml
// Create
event_inherited();
user_char = 0;
```

```gml
// User Event 0
event_inherited();

if (Player_GetPlot() < PLOT.PORTA_ABERTA) {
    Dialog_Add("* Sentiste una presencia.");
    Dialog_Start();
}
```

## Cambio de sala con `trigger_warp` {#room-change-with-trigger-warp}

Coloca un `trigger_warp` en la salida. En el **Creation Code** de la instancia:

```gml
target_room = room_corredor;
target_landmark = 1;
player_dir = DIR.DOWN; // -1 preserva la dirección actual

fade_in_time = 20;
fade_out_time = 20;
fade_in_color = c_black;
fade_out_color = c_black;
warp_wait = 0;

bgm_fade = false;
bgm_fade_time = 20;
```

En la sala de destino, coloca `hint_landmark` en el punto de llegada y define:

```gml
landmark_id = 1;
```

Los IDs de landmark solo necesitan ser únicos dentro de la sala de destino. El
warp guarda el ID en almacenamiento temporal, cambia de sala y posiciona a
`char_player` sobre el landmark correspondiente.

## Música y configuración por sala {#music-and-per-room-configuration}

Los objetos "hint" aplican configuraciones justo después de que la sala
comience:

### `hint_bgm` {#hint-bgm}

```gml
bgm_slot = 0;
bgm = snd_musica_ruinas;
pitch = 1;
```

### `hint_border` {#hint-border}

```gml
sprite = spr_minha_borda;
```

### `hint_half_size` {#hint-half-size}

Define `camera.scale_x = 2` y `camera.scale_y = 2`, útil para overworld en
resolución lógica menor.

## Cámara {#camera}

`camera.target` normalmente apunta a `char_player`. Las principales variables
son:

| Variable | Uso |
|---|---|
| `width`, `height` | resolución lógica de la vista |
| `scale_x`, `scale_y` | zoom |
| `angle` | rotación |
| `target` | instancia seguida |
| `use_room_limit` | limita la vista a los límites de la sala |
| `limit_top/bottom/left/right` | límites manuales cuando corresponda |

Para un temblor:

```gml
Camera_Shake(4, 4, 2, 2, true, true, 0.5, 0.5);
```

## Checklist del NPC {#npc-checklist}

- [ ] El objeto es hijo de `char`.
- [ ] El Create comienza con `event_inherited()`.
- [ ] `char_id` es único cuando se usan comandos `char_*`.
- [ ] Los sprites existen y el origen está en los pies.
- [ ] El User Event 0 llama a `Dialog_Start()`.
- [ ] El texto tiene `{pause}` cuando necesita esperar confirmación.
- [ ] Las claves de Storage son únicas y tienen valor por defecto.
- [ ] La interacción se probó en las cuatro direcciones.

Siguiente: [Ítems e inventarios](/guides/items-and-inventories).
