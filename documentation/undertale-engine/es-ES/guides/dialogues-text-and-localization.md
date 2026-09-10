<!-- locale: es-ES; content-id: dialogues-text-and-localization -->

# Diálogos, texto y localización

## Cola de diálogo

Flujo estándar en el overworld:

```gml
Dialog_Add("* Primera caja.");
Dialog_Add("* Segunda caja.");
Dialog_Start();
```

- `Dialog_Add(text)` pone en cola un string.
- `Dialog_Start()` crea `ui_dialog` solo fuera de la batalla.
- `ui_dialog` retira un string por vez y lo entrega a `text_typer`.
- `Dialog_Get()` retira el siguiente string de la cola.
- `Dialog_IsEmpty()` consulta la cola.
- `Dialog_Clear()` descarta el resto.

Durante la batalla, usa `Dialog_Add()` en los eventos de enemigo, pero no es
necesario llamar a `Dialog_Start()`: el objeto `battle` procesa la cola en el estado
`DIALOG`.

## Texto básico

```gml
Dialog_Add("* Una línea.&* Otra línea.{pause}{clear}* Nueva página.");
Dialog_Start();
```

| Sintaxis | Efecto |
|---|---|
| `&` | nueva línea |
| `\{`, `\}` o `\&` | trata el carácter como texto, cuando sea necesario |
| `{comando argumentos}` | ejecuta un comando del `text_typer` |
| `` `texto con espacios` `` | argumento string dentro de un comando |

Usa `{pause}` cuando el jugador debe confirmar. Usa `{end}` cuando hayas creado un
`text_typer` directamente; `ui_dialog` y `Battle_SetDialog` normalmente ya
añaden finalización al flujo.

## Ejemplo expresivo

```gml
Dialog_Add(
    "{char_link 10}" +
    "{voice VOICE.DEFAULT}" +
    "* Esto es {color `yellow`}importante{color `white`}!" +
    "{sleep 20}&* ¿Entendido?" +
    "{pause}{char_unlink}"
);
Dialog_Start();
```

## Referencia de los comandos de texto {#text-command-reference}

### Ritmo y flujo

| Comando | Ejemplo | Efecto |
|---|---|---|
| `speed` | `{speed 2}` | frames entre grupos de caracteres |
| `sleep` | `{sleep 30}` | espera frames; ignorado al saltar/instantáneo |
| `pause` | `{pause}` | espera confirmación |
| `instant` | `{instant true}` | procesa el texto inmediatamente |
| `skippable` | `{skippable false}` | permite/impide saltar con Cancel |
| `clear` | `{clear}` | borra los caracteres ya creados |
| `end` | `{end}` | destruye el `text_typer` |
| `skip_space` | `{skip_space true}` | controla el tratamiento rápido de los espacios |

### Apariencia

| Comando | Ejemplo | Efecto |
|---|---|---|
| `color` | `{color `yellow`}` | preset completo blanco/amarillo/rojo |
| `color_text` | `{color_text `red`}` | color del texto |
| `color_shadow` | `{color_shadow `black`}` | color de la sombra |
| `color_outline` | `{color_outline `white`}` | color del contorno |
| `shadow` | `{shadow true}` | activa/desactiva la sombra |
| `outline` | `{outline true}` | activa/desactiva el contorno |
| `shadow_pos` | `{shadow_pos 1}` | X e Y de la sombra |
| `shadow_x` | `{shadow_x 2}` | desplazamiento horizontal |
| `shadow_y` | `{shadow_y 2}` | desplazamiento vertical |
| `alpha` | `{alpha 0.5}` | alpha general del carácter |
| `alpha_text` | `{alpha_text 0.5}` | alpha del texto |
| `alpha_shadow` | `{alpha_shadow 0.5}` | alpha de la sombra |
| `alpha_outline` | `{alpha_outline 0.5}` | alpha del contorno |
| `font` | `{font FONT.BATTLE}` | grupo de fuente |
| `scale` | `{scale 2}` | escala X e Y |
| `scale_x` | `{scale_x 2}` | escala horizontal |
| `scale_y` | `{scale_y 2}` | escala vertical |
| `space_x` | `{space_x 1}` | espacio extra entre caracteres |
| `space_y` | `{space_y 2}` | espacio extra entre líneas |
| `effect` | `{effect 0}` | efecto 0 = temblor; -1 = ninguno |
| `depth` | `{depth -200}` | profundidad de los caracteres |
| `gui` | `{gui true}` | dibuja en Draw GUI |

Colores por nombre reconocidos por `GetColorFromString()`:

```text
white, black, red, yellow, gray, gray_dark, gray_light
```

`color` solo tiene presets propios para blanco, amarillo y rojo. Para los
demás, prefiere `color_text`, `color_shadow` y `color_outline`.

Los comandos de color aceptan un color o cuatro colores (un valor por vértice),
por ejemplo:

```gml
"{color_text `red` `yellow` `white` `gray`}* Gradiente"
```

### Voz, cara y sprite embebido

| Comando | Ejemplo | Efecto |
|---|---|---|
| `voice` | `{voice VOICE.DEFAULT}` | grupo de sonidos por carácter; -1 silencia |
| `voice_single` | `{voice_single 0}` | fija una muestra del grupo |
| `face` | `{face 0}` | crea la cara registrada en el slot; -1 la elimina |
| `face_emotion` | `{face_emotion 1}` | cambia la emoción de la cara creada/vinculada |
| `face_link` | `{face_link 5}` | vincula un objeto `face` por `face_id` |
| `face_unlink` | `{face_unlink}` | elimina el vínculo |
| `sprite` | `{sprite `spr_coracao` 0}` | inserta un frame de sprite en el texto |

Slots predeterminados definidos por el `text_typer`:

- `FONT.DIALOG = 0`, `FONT.MENU = 1`, `FONT.BATTLE = 2`;
- `VOICE.NULL = -1`, `VOICE.DEFAULT = 0`, `VOICE.TYPER = 1`;
- la cara 0 usa el objeto base `face`.

Para una cara personalizada, crea un hijo de `face`, configura `idle_sprite`,
`talk_sprite`, imágenes y velocidades por emoción, y registra el objeto en el grupo
de caras del `text_typer` (User Event 5 — Group & Macro). Haz ese cambio con
cuidado, porque ese evento también configura todas las fuentes y voces
predeterminadas.

### Personajes

| Comando | Ejemplo | Efecto |
|---|---|---|
| `char_link` | `{char_link 10}` | sincroniza `talking` del `char_id` |
| `char_unlink` | `{char_unlink}` | elimina el vínculo |
| `char_dir` | `{char_dir 10 DIR.LEFT}` | cambia la dirección |
| `char_move` | `{char_move 10 DIR.RIGHT 60}` | define el contador de movimiento |
| `char_player_moveable` | `{char_player_moveable false}` | intenta cambiar `moveable` del jugador |

> [!WARNING]
> En el commit analizado, `char_player_moveable` valida el argumento con acceso de
> lista, pero asigna usando `cmd[1]`, una forma inconsistente. Si el comando no
> funciona en tu versión, usa código GML directo:
> `char_player.moveable = false/true`.

### Macros y condiciones

| Comando | Ejemplo | Efecto |
|---|---|---|
| `define` | ``{define `NOMBRE` `Maya`}`` | crea/sustituye una macro local del texto |
| `undefine` | ``{undefine `NOMBRE`}`` | elimina la macro |
| `insert` | `{insert NOMBRE}` | inserta el valor en el punto actual |
| `if` | ver abajo | inserta texto según la comparación |
| `choice` | ver abajo | crea elección binaria |

Sustitución:

```gml
var texto =
    "{define `NOMBRE` `Maya`}" +
    "* Hola, {insert NOMBRE}!";
```

Condición:

```gml
var texto =
    "{define `HP` 20}" +
    "{if HP `>=` 20 `* Vida llena.` `else` `* Vida baja.`}";
```

Operadores: `==`, `!=`, `>`, `>=`, `<`, `<=`. Pon operador, textos y
`else` entre acentos graves para que el parser los trate como strings.

### Elección Sí/No

```gml
Dialog_Add(
    "* ¿Abrir la puerta?&&" +
    "         {instant true}" +
    "{choice 0}Sí         {choice 1}No" +
    "{choice `RESPUESTA`}{pause}{end}"
);
Dialog_Start();
```

Después de que el diálogo se cierre:

```gml
if (Player_GetTextTyperChoice() == 0) {
    // Sí
} else {
    // No
}
```

El comando con `0` y `1` graba las posiciones del cursor. El comando con un string
abre la elección y asocia la macro local. La selección confirmada también se guarda
en `FLAG_TEMP_TEXT_TYPER_CHOICE`.

### Sonido y llamada de función

```gml
"{sound `snd_item_get`}* Recibiste algo."
```

```gml
"{script `MiFuncion` 10 `texto`}"
```

`script` acepta hasta 15 argumentos en la implementación actual. Usa solo nombres y
argumentos controlados por el proyecto. No pongas llamadas arbitrarias en
archivos de traducción recibidos de terceros.

## Crear `text_typer` directamente

Úsalo cuando estés haciendo una UI propia:

```gml
var typer = instance_create_depth(40, 40, DEPTH_UI.TEXT, text_typer);
typer.text =
    "{gui true}{font FONT.MENU}{scale 2}{shadow true}" +
    "Mi texto{end}";
```

Por defecto, `text_typer` crea una instancia `text_single` por cada carácter.
Destruir el typer también destruye esos caracteres y la cara creada por él.

## Estructura de localización

```text
datafiles/locale/
├─ list.txt
└─ english/
   ├─ string.txt
   ├─ sprite.txt
   ├─ font.txt
   ├─ string/*.json
   ├─ sprite/*.ini + imágenes
   └─ font/*.ini + fuentes/imágenes
```

`list.txt` tiene un nombre de carpeta por línea. El idioma `0` es la primera línea y
lo carga `world` en la inicialización.

Los caminos están centralizados en `Lang_Custom`:

```text
GMU_LANG_PATH_BASE   = working_directory + "locale/"
GMU_LANG_PATH_LIST   = "list.txt"
GMU_LANG_PATH_STRING = "string.txt"
GMU_LANG_PATH_SPRITE = "sprite.txt"
GMU_LANG_PATH_FONT   = "font.txt"
GMU_LANG_PATH_INFO   = "info.ini"
```

Cambia esos macros solo si también reorganizas los Included Files y todos los
índices de idioma.

## Añadir portugués

1. Copia la carpeta `english` a `portuguese_br`.
2. En `datafiles/locale/list.txt`, añade:

```text
english
portuguese_br
```

3. Traduce los valores de todos los JSON en `portuguese_br/string/`.
4. Conserva las claves y los comandos entre `{}`.
5. Comprueba que `string.txt`, `sprite.txt` y `font.txt` listan todos los archivos.
6. Prueba los caracteres acentuados; amplía el rango de la fuente cuando sea
   necesario.

Ejemplo:

```json
{
    "battle.menu.mercy.spare": "* Perdonar",
    "battle.menu.mercy.flee": "* Huir"
}
```

## Cambiar de idioma en ejecución

```gml
function Game_SetLanguage(lang) {
    if (!Lang_IsExists(lang)) return false;

    // Las fuentes pueden depender de los sprites; elimínalas primero.
    Lang_ClearFont();
    Lang_ClearSprite();
    Lang_ClearString();

    Lang_LoadString(lang);
    Lang_LoadSprite(lang);
    Lang_LoadFont(lang);
    return true;
}
```

`lang` puede ser índice (`0`, `1`...) o nombre de la carpeta. Vuelve a crear los
menús/textos ya abiertos después del cambio, porque las instancias existentes pueden
conservar recursos anteriores.

## Textos JSON

Cada archivo debe ser un objeto simple de `string → string`:

```json
{
    "npc.maya.first": "* Es la primera vez que hablamos.",
    "npc.maya.again": "* Qué bueno verte de nuevo."
}
```

Uso:

```gml
Dialog_Add(Lang_GetString("npc.maya.first", "* Texto ausente."));
Dialog_Start();
```

El segundo argumento de `Lang_GetString()` es el fallback. Durante el
desarrollo, usar la propia clave como fallback facilita encontrar huecos:

```gml
var key = "npc.maya.first";
Dialog_Add(Lang_GetString(key, key));
```

## Sprites localizados

Un `.ini` listado por `sprite.txt`:

```ini
[sprite]
key="battle.button.fight"
source="battle_button_fight.png"

image_number=2
remove_background=false
is_smooth=0
origin_x=0
origin_y=0
```

Carga por clave:

```gml
var spr = Lang_GetSprite("battle.button.fight");
```

Esto es útil para botones que contienen palabras y necesitan arte diferente por
idioma.

## Fuentes localizadas

Ejemplo de `.ini` listado en `font.txt`:

```ini
[font]
key="determination_mono"
source="determination_mono.ttf"
is_sprite=0

size=10
bold=1
italic=0
first=32
last=255

string_map=""
is_proportional=0
separation=0
```

Para una sprite-font, usa `is_sprite=1`, lista/carga el sprite antes de la fuente
y configura `string_map` cuando sea necesario.

## Checklist de diálogo/localización

- [ ] Toda frase del overworld termina con `Dialog_Start()`.
- [ ] El diálogo de batalla solo entra en la cola; el controlador lo muestra.
- [ ] Las rupturas `&`, los comandos y los acentos graves están balanceados.
- [ ] Las elecciones tienen marcadores 0/1 e iniciador final.
- [ ] Toda clave existe en cada idioma o tiene fallback.
- [ ] El JSON es válido y está listado en `string.txt`.
- [ ] Las fuentes contienen los caracteres del idioma.
- [ ] Los sprites/fuentes dinámicos se limpian antes del cambio.
- [ ] Los menús se recrearon después de cambiar el idioma.

Siguiente: [Sistemas de la engine](/guides/engine-systems).
