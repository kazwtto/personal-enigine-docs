<!-- locale: es-ES; content-id: api-reference -->

# Referencia de la API

Referencia rápida de las funciones y constructores presentes en la branch
`master` analizada (Engine v0.6.0). Para el comportamiento y ejemplos completos,
consulta los capítulos temáticos.

## Convenciones

- `slot` de enemigo: `0..2`.
- `slot` de BGM: `0..5`.
- los índices de arrays/inventarios empiezan en `0`.
- `obj/inst` significa que la función acepta objeto o instancia cuando la
  implementación valida ambos.
- los argumentos con `= valor` son opcionales/por defecto documentados.
- muchas operaciones devuelven `true/false`; trata `false` como operación
  rechazada, no necesariamente como error fatal.
- las funciones `Init`, `Step` y `Uninit` las llama el `world`; normalmente no
  deben llamarse manualmente.

## Batalla — flujo y eventos

| Función | Uso |
|---|---|
| `Battle_CallEnemyEvent(event, enemy_slot=-1)` | llama al User Event en un enemigo o en todos |
| `Battle_CallBulletEventSoulCollision()` | desde el alma, llama al evento de colisión en la bala |
| `Battle_CallSoulEventBulletCollision()` | desde la bala, pide al alma procesar la colisión |
| `Battle_CallSoulEventHurt()` | llama a la animación/efecto de daño del alma |
| `Battle_End()` | vuelve a la sala guardada y restaura el BGM |
| `Battle_EndDialog()` | cierra el estado de diálogo y avanza |
| `Battle_EndMenu()` | resuelve la elección actual y avanza |
| `Battle_EndMenuFightAim()` | termina la mira y va a la animación de FIGHT |
| `Battle_EndMenuFightAnim()` | termina la animación y va al daño |
| `Battle_EndMenuFightDamage()` | termina el daño y resuelve el menú |
| `Battle_EndTurnPreparation()` | termina la preparación y empieza el turno |
| `Battle_EndTurn()` | incrementa la ronda, limpia balas/turno y avanza |
| `Battle_GotoNextState()` | aplica el estado programado |
| `Battle_FadeFader(alpha, time)` | anima el fader específico de la batalla |

## Batalla — consulta

| Función | Retorno |
|---|---|
| `Battle_GetBoardSurface()` | surface usada para recortar el cuadro |
| `Battle_GetEnemy(enemy_slot)` | instancia en el slot o `noone` |
| `Battle_GetEnemyNumber()` | cantidad de enemigos vivos |
| `Battle_GetEnemyName(enemy_slot)` | nombre de menú |
| `Battle_GetEnemyDEF(enemy_slot)` | defensa configurada |
| `Battle_GetEnemyCenterPosX(enemy_slot)` | centro X para animaciones |
| `Battle_GetEnemyCenterPosY(enemy_slot)` | centro Y para animaciones |
| `Battle_GetEnemyActionNumber(enemy_slot)` | número de ACTs |
| `Battle_GetEnemyActionName(enemy_slot, action_slot)` | etiqueta del ACT |
| `Battle_GetState()` | `BATTLE_STATE` actual |
| `Battle_GetNextState()` | siguiente estado programado |
| `Battle_GetMenu()` | `BATTLE_MENU` actual |
| `Battle_GetMenuDialog()` | flavor text del menú principal |
| `Battle_GetMenuChoiceButton()` | FIGHT/ACT/ITEM/MERCY |
| `Battle_GetMenuChoiceEnemy()` | índice compacto en el menú |
| `Battle_GetMenuChoiceAction()` | índice de ACT |
| `Battle_GetMenuChoiceItem()` | índice en el inventario |
| `Battle_GetMenuChoiceMercy()` | índice de MERCY |
| `Battle_GetMenuChoiceMercyOverrideNumber()` | cantidad del menú personalizado |
| `Battle_GetMenuChoiceMercyOverrideName(slot)` | nombre de la entrada personalizada |
| `Battle_GetMenuFightDamage()` | daño calculado; negativo puede significar miss |
| `Battle_GetMenuFightAnimTime()` | frames restantes de la animación |
| `Battle_GetMenuFightDamageTime()` | frames restantes de la fase de daño |
| `Battle_GetMenuItemUsedLast()` | ID del último ítem usado |
| `Battle_GetTurnNumber()` | rondas de defensa completadas |
| `Battle_GetTurnTime()` | tiempo restante del turno |
| `Battle_GetTurnInfo(info, default=0)` | configuración del turno |
| `Battle_GetRewardExp()` | EXP acumulada |
| `Battle_GetRewardGold()` | GOLD acumulado |
| `Battle_GetPlayerTempAtk()` | bono temporal de ATK |
| `Battle_GetPlayerTempDef()` | bono temporal de DEF |
| `Battle_GetPlayerTempSpd()` | bono temporal de velocidad |
| `Battle_GetPlayerTempInv()` | bono temporal de invencibilidad |

## Batalla — validación y conversión

| Función | Significado |
|---|---|
| `Battle_IsEnemySlotValid(slot)` | el slot está entre 0 y 2 |
| `Battle_IsEnemyValid(obj/inst)` | base máxima es `battle_enemy` |
| `Battle_IsEnemySpareable(slot)` | el enemigo puede ser perdonado |
| `Battle_IsBulletValid(obj/inst)` | base máxima es `battle_bullet` |
| `Battle_IsSoulValid(obj/inst)` | base máxima es `battle_soul` |
| `Battle_IsTurnValid(obj/inst)` | base máxima es `battle_turn` |
| `Battle_IsBoardTransforming()` | hay tweens del cuadro activos |
| `Battle_IsDialogAutoEnd()` | el diálogo avanza automáticamente cuando está vacío |
| `Battle_IsTurnPreparationAutoEnd()` | la preparación avanza sin globo/tween |
| `Battle_IsFleeable()` | la huida actual tuvo éxito |
| `Battle_IsMenuMercyFleeEnabled()` | la entrada Flee está habilitada |
| `Battle_IsMenuChoiceMercyOverride()` | el menú MERCY está personalizado |
| `Battle_ConvertEnemySlotToMenuChoiceEnemy(slot)` | slot fijo → índice compacto |
| `Battle_ConvertMenuChoiceEnemyToEnemySlot(choice)` | índice compacto → slot fijo |

## Batalla — alteración

| Función | Efecto |
|---|---|
| `Battle_SetEnemy(enemy_obj/inst, slot)` | crea/mueve el enemigo al slot y llama a Init |
| `Battle_RemoveEnemy(slot)` | limpia el slot; no destruye la instancia |
| `Battle_SetEnemyName(slot, text)` | define el nombre |
| `Battle_SetEnemyDEF(slot, def)` | define la defensa |
| `Battle_SetEnemyCenterPos(slot, x, y)` | define el centro visual |
| `Battle_SetEnemyActionNumber(slot, number)` | define el número de ACTs |
| `Battle_SetEnemyActionName(slot, action_slot, text)` | define el ACT |
| `Battle_SetEnemySpareable(slot, bool)` | define el estado amarillo/perdonable |
| `Battle_SetSoul(soul_obj)` | cambia el alma por un objeto válido |
| `Battle_SetState(state)` | cambia inmediatamente; uso interno/avanzado |
| `Battle_SetNextState(state)` | programa el siguiente estado |
| `Battle_SetMenu(menu, call_event=true)` | cambia el submenú |
| `Battle_SetMenuDialog(text)` | cambia el flavor text |
| `Battle_SetMenuChoiceButton(choice, call_event=true)` | selecciona el botón |
| `Battle_SetMenuChoiceEnemy(choice, call_event=true)` | selecciona el objetivo |
| `Battle_SetMenuChoiceAction(choice, call_event=true)` | selecciona el ACT |
| `Battle_SetMenuChoiceItem(choice, call_event=true)` | selecciona el ítem |
| `Battle_SetMenuChoiceMercy(choice, call_event=true)` | selecciona MERCY |
| `Battle_SetMenuChoiceMercyOverride(bool)` | activa el menú MERCY personalizado |
| `Battle_SetMenuChoiceMercyOverrideNumber(number)` | número de entradas personalizadas |
| `Battle_SetMenuChoiceMercyOverrideName(slot, name)` | nombre de la entrada |
| `Battle_SetMenuMercyFleeEnabled(bool)` | habilita Flee |
| `Battle_SetFleeable(bool)` | fuerza/limpia el éxito de huida |
| `Battle_SetMenuFightDamage(damage)` | define el daño de la fase FIGHT |
| `Battle_SetMenuFightAnimTime(time)` | define el cronómetro de la animación |
| `Battle_SetMenuFightDamageTime(time)` | define el cronómetro del daño |
| `Battle_SetDialog(text="", choice=false, line2=false)` | crea/elimina texto de batalla |
| `Battle_SetDialogAutoEnd(bool)` | controla el fin automático del diálogo |
| `Battle_SetTurnInfo(info, value)` | guarda la opción del siguiente turno |
| `Battle_SetTurnTime(time)` | define el tiempo restante |
| `Battle_SetTurnNumber(number)` | define la ronda |
| `Battle_SetTurnPreparationAutoEnd(bool)` | controla el fin automático de la preparación |
| `Battle_SetPlayerTempAtk(value)` | bono de ATK de esta batalla |
| `Battle_SetPlayerTempDef(value)` | bono de DEF de esta batalla |
| `Battle_SetPlayerTempSpd(value)` | bono de velocidad de esta batalla |
| `Battle_SetPlayerTempInv(value)` | bono de invencibilidad de esta batalla |
| `Battle_RewardExp(amount)` | acumula EXP |
| `Battle_RewardGold(amount)` | acumula GOLD |

## Encuentros

| Función | Uso |
|---|---|
| `Encounter_Set(id, enemy0, enemy1, enemy2, text, bgm=-1, flee=true, pause_bgm=true, quick=false, soul_x=48, soul_y=454)` | registra/sustituye datos |
| `Encounter_Start(id, anim=true, exclam=true)` | inicia la transición/batalla |
| `Encounter_IsExists(id)` | verifica el registro |
| `Encounter_GetEnemy(id, slot)` | objeto del slot |
| `Encounter_GetMenuDialog(id)` | flavor text |
| `Encounter_GetBGM(id)` | asset de sonido |
| `Encounter_IsMenuMercyFleeEnabled(id)` | opción Flee |
| `Encounter_IsPauseBGM(id)` | pausa el BGM de overworld |
| `Encounter_IsQuick(id)` | transición rápida |
| `Encounter_GetSoulX(id)` | destino X del alma |
| `Encounter_GetSoulY(id)` | destino Y del alma |
| `Encounter_Custom()` | punto de registro editable |
| `Encounter_Init()` / `Encounter_Uninit()` | ciclo interno |

## Jugador

### Consultas

```text
Player_GetName()
Player_GetLv()
Player_GetHp()
Player_GetHpMax()
Player_GetAtk()          Player_GetAtkItem()    Player_GetAtkTotal()
Player_GetDef()          Player_GetDefItem()    Player_GetDefTotal()
Player_GetSpd()          Player_GetSpdItem()    Player_GetSpdTotal()
Player_GetInv()          Player_GetInvItem()    Player_GetInvTotal()
Player_GetExp()
Player_GetGold()
Player_GetKills()
Player_GetPlot()
Player_GetItemWeapon()
Player_GetItemArmor()
Player_GetBattleFightMenuObj()
Player_GetTextTyperChoice()
Player_IsInBattle()
```

### Alteraciones

```text
Player_SetName(name)
Player_SetLv(lv)
Player_SetHp(hp)
Player_SetHpMax(hpMax)
Player_SetAtk(atk)       Player_SetAtkItem(value)
Player_SetDef(def)       Player_SetDefItem(value)
Player_SetSpd(spd)       Player_SetSpdItem(value)
Player_SetInv(inv)       Player_SetInvItem(value)
Player_SetExp(experience)
Player_SetGold(gold)
Player_SetKills(kills)
Player_SetPlot(plot)
Player_SetItemWeapon(itemId)
Player_SetItemArmor(itemId)
Player_SetBattleFightMenuObj(object)
```

### Cálculos y utilidades

| Función | Uso |
|---|---|
| `Player_Heal(amount)` | curación limitada al máximo |
| `Player_Hurt(amount)` | reduce el HP hasta cero |
| `Player_CalculateDamage(base, min=0, max=infinity)` | aplica DEF y límites |
| `Player_UpdateLv()` | sube niveles según EXP; devuelve si subió |
| `Player_LvUp(lv)` | aplica un LV y atributos base |
| `Player_GetLvExp(lv)` | EXP total exigida |
| `Player_GetLvHpMax(lv)` | HP máximo del LV |
| `Player_GetLvAtk(lv)` | ATK base del LV |
| `Player_GetLvDef(lv)` | DEF base del LV |
| `Player_GetRoomName(room)` | nombre amigable personalizado por switch |
| `Player_CustomInitialData()` | punto editable para juego nuevo |

## Ítems e inventarios

### Funciones globales

| Función | Uso |
|---|---|
| `Item_GetTypeManager()` | gestor de tipos |
| `Item_GetInventoryManager()` | gestor de inventarios |
| `Item_GetInventoryItems()` | inventario principal |
| `Item_GetInventoryPhones()` | teléfonos |
| `Item_GetInventoryBoxes(index)` | caja; consulta el aviso del capítulo de ítems |
| `Item_GetTextEat(item_name)` | texto localizado |
| `Item_GetTextEquip(item_name)` | texto localizado |
| `Item_GetTextHeal(hp, new_line=true)` | texto de curación |
| `Item_Custom()` | registro editable |
| `Item_Init()` / `Item_Uninit()` | ciclo interno |

### `ItemType`

```text
new ItemType()
  .GetName()
  .OnUse(inventory, index)
  .OnInfo(inventory, index)
  .OnDrop(inventory, index)

new ItemTypeSimple(keyId)
  // nombre: item.<keyId>.name
  // info: item.<keyId>.info
```

`ItemTypeManager` hereda de `RegisterManager` y añade:

```text
.GetNameOrFallback(id)
.IsValid(id)
.IsEmptyOrValid(id)
```

Constantes: `ITEM_EMPTY`, `FALLBACK_ITEM_NAME_EMPTY`,
`FALLBACK_ITEM_NAME_UNDEFINED`.

### `Inventory(itemTypeManager, capacity)`

```text
.GetRawArray()                 .SetRawArray(array)
.IsItemTypeValid(id)           .IsItemTypeEmptyOrValid(id)
.GetCapacity()                 .GetCount()
.Get(index)                    .GetOrEmpty(index)
.GetItem(index)                .GetItemOrUndefined(index)
.Normalize()
.Set(index, id)                .Remove(index)
.Clear()                       .Insert(index, id)
.Add(id)
.GetItemName(index)
.InvokeItemUse(index)
.InvokeItemInfo(index)
.InvokeItemDrop(index)
```

Constructores de ejemplo incluidos:

```text
CustomItem_Dice
CustomItem_Stick
CustomItem_Bandage
CustomItem_ToyKnife
CustomItem_FadedRibbon
CustomItem_Phone_TML
```

## Diálogo

| Función | Uso |
|---|---|
| `Dialog_Add(text)` | encola |
| `Dialog_Get()` | retira la siguiente entrada |
| `Dialog_IsEmpty()` | consulta la cola |
| `Dialog_Clear()` | limpia la cola |
| `Dialog_Start()` | abre `ui_dialog` en el overworld |
| `Dialog_Init()` / `Dialog_Uninit()` | ciclo interno |

Los comandos integrados del `text_typer` están documentados en
[Diálogos y localización](/guides/dialogues-text-and-localization#referencia-de-los-comandos-de-texto).

## Localización

| Función | Uso |
|---|---|
| `Lang_LoadList()` / `Lang_ClearList()` | índice de idiomas |
| `Lang_LoadString(lang)` / `Lang_ClearString()` | textos JSON |
| `Lang_LoadSprite(lang)` / `Lang_ClearSprite()` | sprites externos |
| `Lang_LoadFont(lang)` / `Lang_ClearFont()` | fuentes externas |
| `Lang_GetNumber()` | cantidad de idiomas |
| `Lang_GetID(name)` | nombre → índice |
| `Lang_GetName(id, default="")` | índice → nombre |
| `Lang_IsExists(id/name)` | el idioma existe |
| `Lang_GetString(key, default="")` | texto |
| `Lang_IsStringExists(key)` | la clave de texto existe |
| `Lang_GetSprite(key, default=-1)` | sprite dinámico |
| `Lang_IsSpriteExists(key)` | el sprite existe |
| `Lang_GetFont(key, default=-1)` | fuente dinámica |
| `Lang_IsFontExists(key)` | la fuente existe |
| `Lang_GetInfo(lang, key, default="")` | metadato INI, cuando está configurado |
| `Lang_LoadFileToString(path)` | lee el archivo empaquetado como string |
| `Lang_Custom()` | rutas/macros editables |
| `Lang_Init()` / `Lang_Uninit()` | ciclo interno |

## Storage

### Funciones globales

| Función | Uso |
|---|---|
| `Storage_GetManager()` | gestor de storages |
| `Storage_GetStatic()` | storage estático |
| `Storage_GetStaticGeneral()` | zona general estática |
| `Storage_GetDynamic()` | storage dinámico |
| `Storage_SaveDynamic()` | graba el dinámico |
| `Storage_GetInfo()` | metadatos de slot |
| `Storage_GetInfoGeneral()` | zona general de info |
| `Storage_GetSettings()` | ajustes globales |
| `Storage_GetTemp()` | temporal |
| `Storage_GetTempGeneral()` | zona general temporal |
| `Storage_SaveGame()` | graba static + info |
| `Storage_LoadGame()` | carga static + dynamic |
| `Storage_SetSaveSlot(slot)` | elige el slot |
| `Storage_GetSaveSlot()` | consulta el slot |
| `Storage_MakeGetFilePathFunc(useSlots, fileName)` | crea closure de ruta |
| `Storage_Custom()` | inicializa todos los storages personalizados |
| `Storage_Custom_Static(storages)` | registra datos de save comunes/inventarios |
| `Storage_Custom_Dynamic(storages)` | registra memoria dinámica |
| `Storage_Custom_Info(storages)` | registra metadatos de slot |
| `Storage_Custom_Settings(storages)` | registra ajustes globales |
| `Storage_Custom_Temp(storages)` | registra datos solo de la sesión |
| `Storage_Init()` / `Storage_Uninit()` | ciclo interno |

### `Storage(funcGetFilePath)`

Hereda de `RegisterManager` y ofrece:

```text
.ClearData()
.SerializeToJson()
.DeserializeFromJson(json)
.GetFilePath()
.SaveToFile()
.LoadFromFile()
.IsFileExists()
```

### Zonas

```text
new StorageZone()
  .OnWrite()
  .OnRead(from)
  .OnClear()

new StorageZoneStruct()
  .GetData()
  .Get(key, default=undefined)
  .GetOrDefault(key, default)
  .Set(key, value)
  + métodos de StorageZone

new StorageZoneInventories(inventoryManager)
  // serializa todos los inventarios registrados
```

## Registro genérico

`new RegisterManager()`:

```text
.Register(id, content)
.GetOrUndefined(id)
.Get(id)
.Contains(id)
.GetIds()
```

Los IDs vacíos o duplicados son rechazados.

## Entrada

| Función | Uso |
|---|---|
| `Input_Bind(input, type, device, button)` | añade un bind |
| `Input_Unbind(input)` | elimina todos los binds de la acción |
| `Input_GetState(input)` | `INPUT_STATE` actual |
| `Input_IsHeld(input)` | pulsado o mantenido |
| `Input_IsPressed(input)` | empezó en este step |
| `Input_IsReleased(input)` | terminó en este step |
| `Input_SetStateOverride(input, state)` | sustituye el hardware |
| `Input_RemoveStateOverride(input)` | vuelve al hardware |
| `Input_Init()` / `Input_Uninit()` | ciclo interno |

## BGM

| Función | Uso |
|---|---|
| `BGM_Play(slot, audio, loop=true, loop_start=-1, loop_end=-1)` | toca y registra |
| `BGM_Stop(slot)` | detiene |
| `BGM_Pause(slot)` | pausa |
| `BGM_Resume(slot)` | reanuda |
| `BGM_SetVolume(slot, volume, time=0)` | volumen/fade |
| `BGM_SetPitch(slot, pitch)` | pitch |
| `BGM_IsPlaying(slot)` | consulta |
| `BGM_IsPaused(slot)` | consulta |
| `BGM_IsSlotValid(slot)` | 0..5 |
| `BGM_GetAudio(slot)` | asset actual |
| `BGM_GetID(slot)` | handle de audio |
| `BGM_Init()` / `BGM_Step()` | ciclo interno |

## Animación

| Función | Uso |
|---|---|
| `Anim_Create(target, var, tween, ease, start, change, duration, delay=0, arg0=0, arg1=0)` | crea un tween; devuelve ID(s) |
| `Anim_Destroy(target/id, var="", skip=false)` | elimina; `skip=true` fuerza el valor final |
| `Anim_IsExists(target/id, var="")` | consulta |
| `Anim_GetValue(tween, ease, time, arg0=0, arg1=0)` | valor normalizado |
| `Anim_Init()` / `Anim_Step()` / `Anim_Uninit()` | ciclo interno |

`arg0/arg1` configuran BACK/ELASTIC cuando se usan.

## Demo/replay experimental

```text
Demo_AddInput(input)
Demo_RemoveInput(input)
Demo_ClearInput()
Demo_GetInput(pos)
Demo_GetInputNumber()
Demo_StartRecording()       Demo_StopRecording()
Demo_PauseRecording()       Demo_ResumeRecording()
Demo_IsRecording()          Demo_IsRecordingPaused()
Demo_StartPlaying()         Demo_StopPlaying()
Demo_PausePlaying()         Demo_ResumePlaying()
Demo_IsPlaying()            Demo_IsPlayingPaused()
Demo_Init()                 Demo_Uninit()
```

El almacenamiento del buffer está incompleto en la versión analizada.

## Interfaz, cámara y utilidades

| Función | Uso |
|---|---|
| `Camera_Shake(x, y, speedX=0, speedY=0, randomX=false, randomY=false, decreaseX=1, decreaseY=1)` | temblor |
| `Fader_Fade(start, target, time, delay=0)` | fade global; `start=-1` usa el actual |
| `Border_SetEnabled(bool)` | activa/desactiva el borde |
| `Border_IsEnabled()` | consulta |
| `Border_SetSprite(sprite, fade=true, time=60)` | cambia el arte |
| `Border_GetSprite()` | consulta |
| `CC_Add(text, time=60)` | añade subtítulo cerrado |
| `Game_SetFrameSkip(amount)` | configura frames sin Draw |
| `Game_GetFrameSkip()` | consulta |
| `GetColorFromString(name)` | nombre → constante de color |
| `GetObjectBase(obj)` | ancestro máximo o -1 |
| `File_ReadAllText(path)` | contenido o `undefined` |
| `File_WriteAllText(path, text)` | éxito de la escritura |

## Scripts de macros/configuración

Estos recursos agrupan definiciones; edítalos, pero no hay motivo normal para
llamar a las funciones homónimas en gameplay:

```text
Macro_Battle
Macro_Depth
Macro_Direction
Macro_Engine
Macro_Flag
Macro_Game
Macro_Input
Macro_Plot
```

Las definiciones completas están en
[Objetos, eventos y macros](/guides/objects-events-enums-and-macros).
