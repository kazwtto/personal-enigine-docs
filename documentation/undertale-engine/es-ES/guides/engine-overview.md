<!-- locale: es-ES; content-id: engine-overview -->

# Visión general de la engine

## Qué ofrece la Undertale Engine

La Undertale Engine es un proyecto base de GameMaker para fangames al estilo de
UNDERTALE. Ya reúne:

- overworld con personaje, colisión, cámara, warps y puntos de guardado;
- cola de diálogos y un renderizador de texto con comandos integrados;
- ítems, inventarios, equipamiento y teléfono;
- encuentros con hasta tres slots de enemigo;
- menús FIGHT, ACT, ITEM y MERCY;
- turnos, cuadro de batalla, almas y proyectiles extensibles;
- estadísticas, EXP, GOLD, LV y daño del jugador;
- saves JSON divididos en datos estáticos, dinámicos, información y ajustes;
- localización de textos, sprites y fuentes;
- entrada abstracta para teclado, gamepad y ratón;
- BGM en slots, animaciones/tweens, cámara, fade, bordes, subtítulos y demos.

## Mapa mental

```text
room_init
└─ world (persistente)
   ├─ inicializa Input, Lang, Item, Storage, Encounter, BGM y Dialog
   ├─ crea camera, fader, border y closed_captions
   └─ pasa a logo/menu/overworld

Overworld
├─ char_player interactúa con los hijos de char
├─ Dialog_Add → Dialog_Start → ui_dialog → text_typer
├─ trigger_warp cambia de sala
└─ Encounter_Start lleva a room_battle

room_battle
└─ battle
   ├─ carga el encuentro
   ├─ crea hasta 3 battle_enemy
   ├─ alterna MENU → DIALOG → PREPARACIÓN → TURNO → RESET
   ├─ battle_turn controla el ataque
   ├─ battle_bullet colisiona con battle_soul
   └─ termina en victoria, huida o game over
```

## Recursos que normalmente editas

| Recurso | Edítalo para |
|---|---|
| `Macro_Game` | nombre, autor, versión y carpeta de save del juego |
| `Macro_Plot` | hitos de la historia |
| `Player_CustomInitialData` | atributos e inventario de un juego nuevo |
| `Item_Custom` | registrar ítems e inventarios |
| `Encounter_Custom` | registrar encuentros |
| `Storage_Custom_*` | añadir datos persistentes |
| `Lang_Custom` y `datafiles/locale` | idiomas, textos, fuentes y sprites |
| objetos hijos de `char` | NPCs y objetos interactivos |
| objetos hijos de `battle_enemy` | lógica de los enemigos |
| objetos hijos de `battle_turn` | patrones de ataque |
| objetos hijos de `battle_bullet` | proyectiles y daño |

## Actual vs. legado

El sitio oficial se escribió para una versión antigua. Las diferencias más
visibles son:

| Tema | API actual (`master`, v0.6.0) | Versión legada |
|---|---|---|
| Ítems | constructores `ItemType` y `Inventory` | objetos hijos de `item` y funciones `Item_*` antiguas |
| Datos/saves | `Storage`, `StorageZoneStruct` | sistema `Flag_*` |
| Configuración del juego | `Macro_Game` | algunos textos antiguos citan `Macro_Engine` |
| Eventos de enemigo | incluye `BATTLE_START` | numeración antigua sin ese evento |
| Consola de desarrollador | no está en la branch actual | existía vía `GMU_Console_*` |

No copies números crudos de User Events de la tabla antigua. En la versión
actual, consulta [Objetos, eventos y macros](/guides/objects-events-enums-and-macros) y usa
los nombres `BATTLE_ENEMY_EVENT.*` siempre que llames eventos por código.

## Principios que evitan problemas

1. Crea objetos hijos de los objetos base; no modifiques la base para cada caso.
2. Al sobrescribir un evento que necesita el comportamiento del padre, empieza
   con `event_inherited();`.
3. Registra ítems y encuentros una sola vez en los scripts `*_Custom`.
4. Usa IDs únicos y macros para evitar errores de escritura.
5. Guarda el progreso en `Storage`; no repartas variables globales por el juego.
6. Nunca edites `_enemy_slot`: la engine asigna ese valor.
7. Usa funciones públicas (`Player_*`, `Battle_*`) en lugar de editar campos
   internos como `battle._state` directamente.
8. Prueba primero un enemigo/un turno/un proyectil; solo después combina varios.

## Orden de inicialización

En el evento **Game Start** de `world`, la engine ejecuta:

1. `Anim_Init()`;
2. `Input_Init()` y los binds por defecto;
3. `Lang_Init()` y carga del idioma 0;
4. `Item_Init()`;
5. `Storage_Init()` — que llama a `Player_CustomInitialData()`;
6. `Encounter_Init()`;
7. `BGM_Init()`;
8. `Dialog_Init()`;
9. `Demo_Init()`;
10. creación de los controladores persistentes y cambio a la siguiente sala.

Esto explica dos reglas importantes: los ítems deben registrarse antes de
añadirse en `Player_CustomInitialData`, y los encuentros deben registrarse en
`Encounter_Custom` antes de `Encounter_Start()`.

## Escalas y coordenadas

- La interfaz y la batalla usan un área de referencia de **640 × 480**.
- La cámara empieza en `640 × 480` y puede aplicar `scale_x`/`scale_y`.
- El cuadro de batalla por defecto tiene centro `(320, 320)` y extensiones
  `up/down = 65`, `left/right = 283`.
- Los personajes del overworld se ordenan por profundidad a partir de `y`.
  Usa el origen del sprite en los pies, normalmente **bottom-center**.

Siguiente: [Primeros pasos](/guides/getting-started).
