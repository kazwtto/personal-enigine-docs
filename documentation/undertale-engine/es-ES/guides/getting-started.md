<!-- locale: es-ES; content-id: getting-started -->

# Primeros pasos

## Requisitos previos

- GameMaker con soporte del formato actual del proyecto;
- nociones de sprites, objetos, eventos, salas y GML;
- Git/GitHub Desktop recomendado para recibir actualizaciones sin perder cambios.

> [!WARNING]
> Las branches `old_version` y `old_version_examples` están archivadas y solo
> funcionan correctamente en versiones de GameMaker anteriores a la
> actualización 2.3. Para un proyecto nuevo, usa la branch `master`.

## Obtener y abrir el proyecto

1. Abre el [repositorio oficial](https://github.com/TML233/UndertaleEngine).
2. Haz un **fork** a tu cuenta si quieres seguir las actualizaciones.
3. Clona el fork.
4. Crea una branch para tu juego, por ejemplo `mi-juego`.
5. Abre `undertale_engine.yyp` en GameMaker.
6. Ejecuta el proyecto original una vez antes de modificar cualquier cosa.

Si prefieres descargar el ZIP, funciona, pero actualizar y comparar tus cambios
es más difícil.

## Configuración mínima del juego

Abre `Macro_Game` y cambia:

```gml
#macro GAME_NAME "Mi Fangame"
#macro GAME_AUTHOR "Mi Nombre"
#macro GAME_VERSION "v0.1.0"
#macro GAME_SAVE_NAME "mi_fangame"
```

`GAME_SAVE_NAME` solo debe tener letras, números y `_`. Define la carpeta de los
archivos JSON. Cambiar ese valor después de publicar hace que el juego busque
saves en otra carpeta.

En GameMaker, ajusta también las opciones de plataforma, el nombre del
ejecutable, el icono, la información de versión y la resolución según tu
objetivo.

## Conoce las salas por defecto

| Sala | Papel |
|---|---|
| `room_init` | primera sala; contiene el `world` persistente |
| `room_logo` | logo/apertura |
| `room_menu` | título, nombre y carga |
| `room_area_0` | área de demostración del overworld |
| `room_battle` | controlador universal de batallas |
| `room_gameover` | secuencia de derrota |
| `room_shop` | reservada para tienda; la base actual no trae un sistema completo |
| `room_settings` | reservada para ajustes |

Mantén `room_init` como primera sala. No dupliques `world`, `camera`, `fader` o
`border` manualmente en cada sala: `world` crea los controladores y permanece
vivo.

## Controles por defecto

| Acción | Teclas |
|---|---|
| confirmar | `Enter` o `Z` |
| cancelar/correr lento en la batalla | `Shift` o `X` |
| menú | `Ctrl` o `C` |
| mover | flechas |
| pantalla completa | `F4` |
| reiniciar durante el desarrollo | `F2` |

Los binds están en el evento **Game Start** de `world`. Usa la API `Input_*`
para añadir teclado, gamepad o ratón; consulta
[Sistemas de la engine](/guides/engine-systems#entrada).

## Tu primer mapa jugable

1. Duplica `room_area_0` o crea una sala de overworld.
2. Añade una capa de instancias para colisión y otra para personajes.
3. Coloca `char_player`.
4. Dibuja paredes con instancias de `block` u objetos hijos de `block`.
5. Coloca un `char_sign` y, en el **Creation Code** de la instancia, define:

```gml
text = "* ¡Hola!&* Esta es mi primera sala.";
```

6. Ejecuta, acércate al cartel y confirma.

`&` crea una nueva línea. El `char_player` busca una instancia de `char` frente
a él y llama al **User Event 0 (Interact)** de ese objeto.

## Datos iniciales del jugador

Edita `Player_CustomInitialData` para un juego nuevo:

```gml
function Player_CustomInitialData() {
    Player_SetName("PLAYER");
    Player_SetLv(1);
    Player_SetHpMax(20);
    Player_SetHp(20);
    Player_SetAtk(10);
    Player_SetDef(10);
    Player_SetSpd(2);
    Player_SetInv(40);
    Player_SetBattleFightMenuObj(battle_menu_fight_knife);

    var items = Item_GetInventoryItems();
    // Añade aquí solo IDs ya registrados en Item_Custom.

    Player_SetItemWeapon(ITEM_EMPTY);
    Player_SetItemArmor(ITEM_EMPTY);
}
```

Este script se llama durante la creación de las áreas de almacenamiento. También
sirve como valor por defecto después de limpiar los datos. No uses esta función
para conceder un ítem cada vez que empieza una sala.

## Flujo seguro de actualización

1. Haz commit de tus cambios en la branch del juego.
2. Actualiza la branch `master` de tu fork desde el repositorio oficial.
3. Fusiona `master` en la branch del juego.
4. Resuelve los conflictos conservando tus registros en `Item_Custom`,
   `Encounter_Custom`, `Macro_*`, `Storage_Custom_*` y recursos propios.
5. Abre el proyecto y prueba juego nuevo, load, cambio de sala y batalla.

Evita renombrar el archivo `.yyp` si piensas seguir fusionando actualizaciones;
eso crea conflictos innecesarios.

## Checklist antes de crear contenido

- [ ] El proyecto original se ejecuta sin errores.
- [ ] Se han cambiado nombre, autor, versión y carpeta de save.
- [ ] El juego está en una branch propia.
- [ ] `room_init` sigue en primer lugar.
- [ ] Un `char_sign` muestra diálogo.
- [ ] El jugador colisiona con `block`.
- [ ] Sabes dónde están `Item_Custom`, `Encounter_Custom` y
      `Player_CustomInitialData`.

Siguiente: [Overworld y NPCs](/guides/overworld-rooms-and-npcs).
