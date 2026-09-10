<!-- locale: es-ES; content-id: engine-systems -->

# Sistemas de la engine

## Jugador y atributos

Los atributos persistentes están en la zona general del almacenamiento estático.
Use las funciones `Player_*`; ellas centralizan la validación y las fórmulas.

### Atributos principales

| Dato | Leer | Cambiar |
|---|---|---|
| nombre | `Player_GetName()` | `Player_SetName(name)` |
| LV | `Player_GetLv()` | `Player_SetLv(lv)` |
| HP | `Player_GetHp()` | `Player_SetHp(hp)` |
| HP máximo | `Player_GetHpMax()` | `Player_SetHpMax(hpMax)` |
| ATK base | `Player_GetAtk()` | `Player_SetAtk(atk)` |
| DEF base | `Player_GetDef()` | `Player_SetDef(def)` |
| velocidad | `Player_GetSpd()` | `Player_SetSpd(spd)` |
| invencibilidad | `Player_GetInv()` | `Player_SetInv(inv)` |
| EXP | `Player_GetExp()` | `Player_SetExp(exp)` |
| GOLD | `Player_GetGold()` | `Player_SetGold(gold)` |
| kills | `Player_GetKills()` | `Player_SetKills(kills)` |
| plot | `Player_GetPlot()` | `Player_SetPlot(plot)` |
| arma | `Player_GetItemWeapon()` | `Player_SetItemWeapon(id)` |
| armadura | `Player_GetItemArmor()` | `Player_SetItemArmor(id)` |

`Inv` significa **frames de invencibilidad**, no inventario.

### Bono de ítem y total

| Atributo | Bono de ítem | Total efectivo |
|---|---|---|
| ATK | `Get/SetAtkItem` | `Player_GetAtkTotal()` |
| DEF | `Get/SetDefItem` | `Player_GetDefTotal()` |
| velocidad | `Get/SetSpdItem` | `Player_GetSpdTotal()` |
| invencibilidad | `Get/SetInvItem` | `Player_GetInvTotal()` |

Durante la batalla, el total incluye además `Battle_GetPlayerTempAtk/Def/Spd/Inv`.
Estos modificadores temporales vuelven a cero en una batalla nueva.

### Vida y daño

```gml
Player_Heal(10);
Player_Hurt(4);
```

Los valores negativos redirigen a la operación opuesta. HP está limitado entre 0
y el máximo.

Para daño recibido basado en la DEF:

```gml
var dano = Player_CalculateDamage(8, 1, 20);
Player_Hurt(dano);
```

La fórmula actual:

```text
base
+ ceil((HP - 20) / 10), cuando HP >= 20
- DEF total / 5
→ redondea
→ limita entre mínimo y máximo
```

### LV y EXP

`Player_UpdateLv()` sube tantos niveles como sean necesarios según la EXP.
`Player_LvUp(lv)` actualiza LV, HP máximo, ATK y DEF base. Las curvas están en:

- `Player_GetLvExp(lv)`;
- `Player_GetLvHpMax(lv)`;
- `Player_GetLvAtk(lv)`;
- `Player_GetLvDef(lv)`.

Edite estas cuatro funciones si su juego usa otra progresión. El nivel 20 es el
límite de la tabla de EXP actual.

## Almacenamiento y guardados

### Áreas estándar

| Storage | Archivo | Alcance | Cuándo usar |
|---|---|---|---|
| `static` | `fileN/static.json` | por slot | progreso normal; guardado en el save point |
| `dynamic` | `fileN/dynamic.json` | por slot | memoria que no vuelve al cargar |
| `info` | `fileN/info.json` | por slot | nombre/LV/tiempo/sala en el menú |
| `settings` | `settings.json` | global | idioma, volumen y opciones |
| `temp` | ninguno | sesión | paso de datos entre sistemas/salas |

Los caminos están bajo `GAME_SAVE_NAME`. `N` viene de
`Storage_GetSaveSlot()`.

### Datos comunes

```gml
var data = Storage_GetStaticGeneral();

data.Set("porta_ruinas_aberta", true);
var aberta = data.Get("porta_ruinas_aberta", false);
```

`StorageZoneStruct.Get(key, default)` devuelve el predeterminado cuando la clave
no existe.

### Guardar y cargar

```gml
Storage_SetSaveSlot(0);
Storage_SaveGame();
```

`Storage_SaveGame()` actualiza los metadatos, escribe `static.json` e `info.json`.

```gml
Storage_SetSaveSlot(0);
Storage_LoadGame();
```

`Storage_LoadGame()` carga `static` y `dynamic`. El menú/base debe encargarse del
cambio a la sala guardada y de las configuraciones globales según el flujo del
juego.

Para datos dinámicos:

```gml
var dyn = Storage_GetDynamic().Get("general");
dyn.Set("mortes_para_flowey", dyn.Get("mortes_para_flowey", 0) + 1);
Storage_SaveDynamic();
```

### Añadir una zona propia

Dentro de `Storage_Custom_Static(storages)`, después de crear `s`:

```gml
var quests = new StorageZoneStruct();
global._storage_cache_quests = quests;
s.Register("quests", quests);
```

Getter en script propio:

```gml
function Storage_GetQuests() {
    return global._storage_cache_quests;
}
```

Uso:

```gml
Storage_GetQuests().Set("torta_entregue", true);
```

Los IDs de storage y zona deben ser únicos. El sistema serializa cada zona como
una propiedad JSON.

### Zona personalizada avanzada

Herede `StorageZone` e implemente:

```gml
function StorageZoneMeuSistema() : StorageZone() constructor {
    function OnWrite() {
        return { valor: global.meu_valor };
    }

    function OnRead(from) {
        global.meu_valor = from.valor ?? 0;
    }

    function OnClear() {
        global.meu_valor = 0;
    }
}
```

`DeserializeFromJson()` solo limpia los datos después de que el JSON completo se
analiza con éxito. Las zonas desconocidas en el archivo se ignoran, lo que ayuda
a la compatibilidad entre versiones.

### Cuidados con los guardados

- prueba la creación de las carpetas y la escritura en cada plataforma de destino;
- no cambies `GAME_SAVE_NAME` después de publicar sin crear una migración;
- proporciona valores predeterminados para claves nuevas;
- valida arrays/structs provenientes de versiones anteriores;
- no guardes IDs de assets inestables cuando un nombre/string es suficiente;
- mantén copias de seguridad al modificar el formato.

## Entrada

El juego usa acciones abstractas:

```gml
INPUT.UP
INPUT.DOWN
INPUT.LEFT
INPUT.RIGHT
INPUT.CONFIRM
INPUT.CANCEL
INPUT.MENU
```

Consulta:

```gml
if (Input_IsPressed(INPUT.CONFIRM)) {
    // un único step
}

if (Input_IsHeld(INPUT.LEFT)) {
    // mientras se mantiene pulsado
}

if (Input_IsReleased(INPUT.CANCEL)) {
    // step de la liberación
}
```

### Añadir gamepad

Después de `Input_Init()` en el Game Start de `world`:

```gml
Input_Bind(INPUT.CONFIRM, INPUT_TYPE.GAMEPAD, 0, gp_face1);
Input_Bind(INPUT.CANCEL,  INPUT_TYPE.GAMEPAD, 0, gp_face2);
Input_Bind(INPUT.MENU,    INPUT_TYPE.GAMEPAD, 0, gp_face3);
Input_Bind(INPUT.UP,      INPUT_TYPE.GAMEPAD, 0, gp_padu);
Input_Bind(INPUT.DOWN,    INPUT_TYPE.GAMEPAD, 0, gp_padd);
Input_Bind(INPUT.LEFT,    INPUT_TYPE.GAMEPAD, 0, gp_padl);
Input_Bind(INPUT.RIGHT,   INPUT_TYPE.GAMEPAD, 0, gp_padr);
```

Tipos: `INPUT_TYPE.KEYBOARD`, `GAMEPAD`, `MOUSE`. `device` se usa para gamepad;
el código estándar pasa `0` para teclado.

### Reconfigurar una acción

```gml
Input_Unbind(INPUT.CONFIRM);
Input_Bind(INPUT.CONFIRM, INPUT_TYPE.KEYBOARD, 0, vk_space);
```

`Input_Unbind()` elimina todos los binds de esa acción.

### Sobrescribir estado

```gml
Input_SetStateOverride(INPUT.CONFIRM, INPUT_STATE.PRESSED);
// ...
Input_RemoveStateOverride(INPUT.CONFIRM);
```

Útil para replay, pruebas y accesibilidad. Mientras existe el override, se ignora
el hardware real de esa acción.

## Música (`BGM_*`)

La engine tiene slots `0..5`. El slot 0 normalmente es overworld y el slot 5 lo
usa la batalla.

```gml
BGM_Play(0, snd_musica_ruinas);
BGM_SetVolume(0, 0.7, 30);
BGM_SetPitch(0, 1);
```

Firma completa:

```gml
BGM_Play(slot, audio, loop = true, loop_start = -1, loop_end = -1);
```

`loop_start` y `loop_end` permiten un loop personalizado. Use posiciones
aceptadas por el sistema de audio de GameMaker y pruebe el empalme.

Otras operaciones:

```gml
BGM_Pause(0);
BGM_Resume(0);
BGM_Stop(0);

BGM_IsPlaying(0);
BGM_IsPaused(0);
BGM_GetAudio(0);
BGM_GetID(0);
```

`BGM_SetVolume(slot, volume, time)` recibe `time` en steps y lo convierte a
milisegundos. `BGM_SetPitch()` usa el multiplicador de pitch de GameMaker.

Para efectos puntuales, siga usando `audio_play_sound()`.

## Animaciones/tweens

Anima una variable real de instancia:

```gml
Anim_Create(
    id,                    // objetivo
    "image_alpha",         // variable existente
    ANIM_TWEEN.CUBIC,
    ANIM_EASE.OUT,
    0,                     // inicio
    1,                     // cambio; destino = inicio + cambio
    30                     // duración en steps
);
```

Con retraso:

```gml
Anim_Create(id, "x", ANIM_TWEEN.BACK, ANIM_EASE.OUT, x, 100, 45, 10);
```

Tweens:

```text
LINEAR, SINE, QUAD, CUBIC, QUART, QUINT,
EXPO, CIRC, BACK, ELASTIC, BOUNCE
```

Easings: `IN`, `OUT`, `IN_OUT`.

Utilidades:

```gml
Anim_IsExists(id, "x");
Anim_Destroy(id, "x");
var valor01 = Anim_GetValue(ANIM_TWEEN.SINE, ANIM_EASE.IN_OUT, 0.5);
```

`Anim_Destroy(target, var_name, skip)` puede filtrar por la variable y decidir si
omite la actualización final. Use solo nombres de variables reales ya existentes
en el objetivo.

## Fade

Fade global:

```gml
fader.color = c_black;
Fader_Fade(-1, 1, 20); // alpha actual → opaco
Fader_Fade(-1, 0, 20); // alpha actual → transparente
```

El primer argumento `-1` significa «empezar en el alpha actual».

Fade específico de la batalla:

```gml
Battle_FadeFader(1, 20);
```

## Cámara

```gml
camera.target = char_player;
camera.scale_x = 2;
camera.scale_y = 2;
camera.angle = 0;
```

Temblor:

```gml
Camera_Shake(
    5, 5,   // distancia X/Y
    2, 2,   // intervalo X/Y
    true, true, // aleatorio X/Y
    0.5, 0.5 // reducción X/Y
);
```

## Bordes

```gml
Border_SetEnabled(true);
Border_SetSprite(spr_minha_borda, true, 60);
```

Activar cambia la ventana a 960 × 540; desactivar vuelve a 640 × 480. Consulta:

```gml
Border_IsEnabled();
Border_GetSprite();
```

Los recursos cargados dinámicamente pueden descargarse cuando cambia el borde;
no use el mismo sprite dinámico en otro sistema sin coordinar su vida útil.

## Subtítulos (closed captions)

```gml
CC_Add("[Sonido de puerta abriéndose]", 120);
```

El tiempo estándar es 60 steps. `closed_captions` mantiene una cola y dibuja en
la GUI. Úsalo para sonidos relevantes que no tienen representación visual.

## Frame skip

```gml
Game_SetFrameSkip(1);
var quantidade = Game_GetFrameSkip();
```

El sistema desactiva Draw Events en algunos frames; la lógica de Step continúa.
Es un efecto visual/rendimiento, no un control de la velocidad del juego.

## Demo/replay

La API expone registro y reproducción de estados de entrada:

```gml
Demo_AddInput(INPUT.UP);
Demo_AddInput(INPUT.DOWN);
Demo_AddInput(INPUT.LEFT);
Demo_AddInput(INPUT.RIGHT);
Demo_AddInput(INPUT.CONFIRM);

Demo_StartRecording();
Demo_PauseRecording();
Demo_ResumeRecording();
Demo_StopRecording();

Demo_StartPlaying();
Demo_PausePlaying();
Demo_ResumePlaying();
Demo_StopPlaying();
```

> [!WARNING]
> El sistema está incompleto en la v0.6.0 analizada: las líneas que guardaban y
> restauraban el buffer están comentadas, y el player comienza con `_buffer = -1`.
> Trátalo como base experimental; implementa la persistencia del Base64 antes de
> depender de replay en el juego final.

## Game over

Cuando `Player_GetHp() <= 0`, `battle_soul` guarda la posición del alma en
Storage temporal y va a `room_gameover`. La sala usa `gameover` y
`gameover_shard` para la secuencia visual. Para personalizar:

- sustituye sprites/sonidos en los objetos de game over;
- preserva los flags temporales de posición;
- decide si carga el último save, reinicia o vuelve al menú;
- restaura música, HP y sala de forma explícita.

## Tienda y configuraciones

Las salas `room_shop` y `room_settings` existen en la base actual, pero no hay un
sistema completo de tienda entre los objetos/scripts estándar. Implementa tu UI
usando `Item_GetTypeManager`, inventarios, `Player_Get/SetGold` y Storage. No
confundas los tutoriales de la modificación de Zhazha ni de otras engines con la
API de esta branch.

Siguiente: [Referencia de la API](/reference).
