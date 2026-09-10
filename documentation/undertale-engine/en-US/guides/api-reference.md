<!-- locale: en-US; content-id: api-reference -->

# API Reference

Quick reference for the functions and constructors present in the analyzed
`master` branch (Engine v0.6.0). For full behavior and examples, see the
topical chapters.

## Conventions

- enemy `slot`: `0..2`.
- BGM `slot`: `0..5`.
- array/inventory indices start at `0`.
- `obj/inst` means the function accepts an object or an instance when the
  implementation validates both.
- arguments with `= value` are optional/documented defaults.
- many operations return `true/false`; treat `false` as a refused operation,
  not necessarily a fatal error.
- `Init`, `Step` and `Uninit` functions are called by the `world`; they
  normally shouldn't be called manually.

## Battle — flow and events

| Function | Usage |
|---|---|
| `Battle_CallEnemyEvent(event, enemy_slot=-1)` | calls User Event on one enemy or all |
| `Battle_CallBulletEventSoulCollision()` | from the soul, calls the collision event on the bullet |
| `Battle_CallSoulEventBulletCollision()` | from the bullet, asks the soul to process collision |
| `Battle_CallSoulEventHurt()` | calls the soul's damage animation/effect |
| `Battle_End()` | returns to the saved room and restores BGM |
| `Battle_EndDialog()` | closes the dialogue state and advances |
| `Battle_EndMenu()` | resolves the current choice and advances |
| `Battle_EndMenuFightAim()` | ends aiming and moves to the FIGHT animation |
| `Battle_EndMenuFightAnim()` | ends the animation and moves to damage |
| `Battle_EndMenuFightDamage()` | ends damage and resolves the menu |
| `Battle_EndTurnPreparation()` | ends preparation and starts the turn |
| `Battle_EndTurn()` | increments the round, clears bullets/turn and advances |
| `Battle_GotoNextState()` | applies the scheduled state |
| `Battle_FadeFader(alpha, time)` | animates the battle-specific fader |

## Battle — query

| Function | Returns |
|---|---|
| `Battle_GetBoardSurface()` | surface used to clip the board |
| `Battle_GetEnemy(enemy_slot)` | instance in the slot or `noone` |
| `Battle_GetEnemyNumber()` | number of enemies still alive |
| `Battle_GetEnemyName(enemy_slot)` | menu name |
| `Battle_GetEnemyDEF(enemy_slot)` | configured defense |
| `Battle_GetEnemyCenterPosX(enemy_slot)` | center X for animations |
| `Battle_GetEnemyCenterPosY(enemy_slot)` | center Y for animations |
| `Battle_GetEnemyActionNumber(enemy_slot)` | number of ACTs |
| `Battle_GetEnemyActionName(enemy_slot, action_slot)` | ACT label |
| `Battle_GetState()` | current `BATTLE_STATE` |
| `Battle_GetNextState()` | next scheduled state |
| `Battle_GetMenu()` | current `BATTLE_MENU` |
| `Battle_GetMenuDialog()` | main menu flavor text |
| `Battle_GetMenuChoiceButton()` | FIGHT/ACT/ITEM/MERCY |
| `Battle_GetMenuChoiceEnemy()` | compact index in the menu |
| `Battle_GetMenuChoiceAction()` | ACT index |
| `Battle_GetMenuChoiceItem()` | inventory index |
| `Battle_GetMenuChoiceMercy()` | MERCY index |
| `Battle_GetMenuChoiceMercyOverrideNumber()` | custom menu count |
| `Battle_GetMenuChoiceMercyOverrideName(slot)` | custom entry name |
| `Battle_GetMenuFightDamage()` | calculated damage; negative may mean a miss |
| `Battle_GetMenuFightAnimTime()` | frames left in the animation |
| `Battle_GetMenuFightDamageTime()` | frames left in the damage phase |
| `Battle_GetMenuItemUsedLast()` | ID of the last used item |
| `Battle_GetTurnNumber()` | defensive rounds completed |
| `Battle_GetTurnTime()` | time left in the turn |
| `Battle_GetTurnInfo(info, default=0)` | turn setting |
| `Battle_GetRewardExp()` | accumulated EXP |
| `Battle_GetRewardGold()` | accumulated GOLD |
| `Battle_GetPlayerTempAtk()` | temporary ATK bonus |
| `Battle_GetPlayerTempDef()` | temporary DEF bonus |
| `Battle_GetPlayerTempSpd()` | temporary speed bonus |
| `Battle_GetPlayerTempInv()` | temporary invincibility bonus |

## Battle — validation and conversion

| Function | Meaning |
|---|---|
| `Battle_IsEnemySlotValid(slot)` | slot is between 0 and 2 |
| `Battle_IsEnemyValid(obj/inst)` | topmost base is `battle_enemy` |
| `Battle_IsEnemySpareable(slot)` | enemy can be spared |
| `Battle_IsBulletValid(obj/inst)` | topmost base is `battle_bullet` |
| `Battle_IsSoulValid(obj/inst)` | topmost base is `battle_soul` |
| `Battle_IsTurnValid(obj/inst)` | topmost base is `battle_turn` |
| `Battle_IsBoardTransforming()` | board tweens are active |
| `Battle_IsDialogAutoEnd()` | dialogue advances automatically when empty |
| `Battle_IsTurnPreparationAutoEnd()` | preparation advances without a bubble/tween |
| `Battle_IsFleeable()` | the current flee succeeded |
| `Battle_IsMenuMercyFleeEnabled()` | the Flee entry is enabled |
| `Battle_IsMenuChoiceMercyOverride()` | the MERCY menu is customized |
| `Battle_ConvertEnemySlotToMenuChoiceEnemy(slot)` | fixed slot → compact index |
| `Battle_ConvertMenuChoiceEnemyToEnemySlot(choice)` | compact index → fixed slot |

## Battle — modification

| Function | Effect |
|---|---|
| `Battle_SetEnemy(enemy_obj/inst, slot)` | creates/moves the enemy to the slot and calls Init |
| `Battle_RemoveEnemy(slot)` | clears the slot; doesn't destroy the instance |
| `Battle_SetEnemyName(slot, text)` | sets the name |
| `Battle_SetEnemyDEF(slot, def)` | sets defense |
| `Battle_SetEnemyCenterPos(slot, x, y)` | sets the visual center |
| `Battle_SetEnemyActionNumber(slot, number)` | sets the number of ACTs |
| `Battle_SetEnemyActionName(slot, action_slot, text)` | sets an ACT |
| `Battle_SetEnemySpareable(slot, bool)` | sets the yellow/spareable state |
| `Battle_SetSoul(soul_obj)` | swaps the soul for a valid object |
| `Battle_SetState(state)` | changes immediately; internal/advanced use |
| `Battle_SetNextState(state)` | schedules the next state |
| `Battle_SetMenu(menu, call_event=true)` | changes the submenu |
| `Battle_SetMenuDialog(text)` | changes the flavor text |
| `Battle_SetMenuChoiceButton(choice, call_event=true)` | selects a button |
| `Battle_SetMenuChoiceEnemy(choice, call_event=true)` | selects a target |
| `Battle_SetMenuChoiceAction(choice, call_event=true)` | selects an ACT |
| `Battle_SetMenuChoiceItem(choice, call_event=true)` | selects an item |
| `Battle_SetMenuChoiceMercy(choice, call_event=true)` | selects MERCY |
| `Battle_SetMenuChoiceMercyOverride(bool)` | enables the custom MERCY menu |
| `Battle_SetMenuChoiceMercyOverrideNumber(number)` | number of custom entries |
| `Battle_SetMenuChoiceMercyOverrideName(slot, name)` | entry name |
| `Battle_SetMenuMercyFleeEnabled(bool)` | enables Flee |
| `Battle_SetFleeable(bool)` | forces/clears flee success |
| `Battle_SetMenuFightDamage(damage)` | sets the FIGHT phase damage |
| `Battle_SetMenuFightAnimTime(time)` | sets the animation timer |
| `Battle_SetMenuFightDamageTime(time)` | sets the damage timer |
| `Battle_SetDialog(text="", choice=false, line2=false)` | creates/removes battle text |
| `Battle_SetDialogAutoEnd(bool)` | controls automatic dialogue end |
| `Battle_SetTurnInfo(info, value)` | writes the next turn option |
| `Battle_SetTurnTime(time)` | sets the remaining time |
| `Battle_SetTurnNumber(number)` | sets the round |
| `Battle_SetTurnPreparationAutoEnd(bool)` | controls automatic preparation end |
| `Battle_SetPlayerTempAtk(value)` | this battle's ATK bonus |
| `Battle_SetPlayerTempDef(value)` | this battle's DEF bonus |
| `Battle_SetPlayerTempSpd(value)` | this battle's speed bonus |
| `Battle_SetPlayerTempInv(value)` | this battle's invincibility bonus |
| `Battle_RewardExp(amount)` | accumulates EXP |
| `Battle_RewardGold(amount)` | accumulates GOLD |

## Encounters

| Function | Usage |
|---|---|
| `Encounter_Set(id, enemy0, enemy1, enemy2, text, bgm=-1, flee=true, pause_bgm=true, quick=false, soul_x=48, soul_y=454)` | registers/overrides data |
| `Encounter_Start(id, anim=true, exclam=true)` | starts the transition/battle |
| `Encounter_IsExists(id)` | checks registration |
| `Encounter_GetEnemy(id, slot)` | the slot's object |
| `Encounter_GetMenuDialog(id)` | flavor text |
| `Encounter_GetBGM(id)` | sound asset |
| `Encounter_IsMenuMercyFleeEnabled(id)` | Flee option |
| `Encounter_IsPauseBGM(id)` | pauses overworld BGM |
| `Encounter_IsQuick(id)` | quick transition |
| `Encounter_GetSoulX(id)` | soul destination X |
| `Encounter_GetSoulY(id)` | soul destination Y |
| `Encounter_Custom()` | editable registration point |
| `Encounter_Init()` / `Encounter_Uninit()` | internal lifecycle |

## Player

### Queries

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

### Setters

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

### Calculations and utilities

| Function | Usage |
|---|---|
| `Player_Heal(amount)` | heals, capped at max |
| `Player_Hurt(amount)` | reduces HP down to zero |
| `Player_CalculateDamage(base, min=0, max=infinity)` | applies DEF and clamps |
| `Player_UpdateLv()` | levels up from EXP; returns whether it did |
| `Player_LvUp(lv)` | applies an LV and base attributes |
| `Player_GetLvExp(lv)` | total EXP required |
| `Player_GetLvHpMax(lv)` | max HP for the LV |
| `Player_GetLvAtk(lv)` | base ATK for the LV |
| `Player_GetLvDef(lv)` | base DEF for the LV |
| `Player_GetRoomName(room)` | custom friendly name via switch |
| `Player_CustomInitialData()` | editable point for a new game |

## Items and inventories

### Global functions

| Function | Usage |
|---|---|
| `Item_GetTypeManager()` | type manager |
| `Item_GetInventoryManager()` | inventory manager |
| `Item_GetInventoryItems()` | main inventory |
| `Item_GetInventoryPhones()` | phones |
| `Item_GetInventoryBoxes(index)` | box; see the note in the items chapter |
| `Item_GetTextEat(item_name)` | localized text |
| `Item_GetTextEquip(item_name)` | localized text |
| `Item_GetTextHeal(hp, new_line=true)` | healing text |
| `Item_Custom()` | editable registration |
| `Item_Init()` / `Item_Uninit()` | internal lifecycle |

### `ItemType`

```text
new ItemType()
  .GetName()
  .OnUse(inventory, index)
  .OnInfo(inventory, index)
  .OnDrop(inventory, index)

new ItemTypeSimple(keyId)
  // name: item.<keyId>.name
  // info: item.<keyId>.info
```

`ItemTypeManager` inherits `RegisterManager` and adds:

```text
.GetNameOrFallback(id)
.IsValid(id)
.IsEmptyOrValid(id)
```

Constants: `ITEM_EMPTY`, `FALLBACK_ITEM_NAME_EMPTY`,
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

Example constructors included:

```text
CustomItem_Dice
CustomItem_Stick
CustomItem_Bandage
CustomItem_ToyKnife
CustomItem_FadedRibbon
CustomItem_Phone_TML
```

## Dialogue

| Function | Usage |
|---|---|
| `Dialog_Add(text)` | queues |
| `Dialog_Get()` | pops the next entry |
| `Dialog_IsEmpty()` | queries the queue |
| `Dialog_Clear()` | clears the queue |
| `Dialog_Start()` | opens `ui_dialog` in the overworld |
| `Dialog_Init()` / `Dialog_Uninit()` | internal lifecycle |

The `text_typer`'s built-in commands are documented in
[Dialogues and localization](/guides/dialogues-text-and-localization#text-command-reference).

## Localization

| Function | Usage |
|---|---|
| `Lang_LoadList()` / `Lang_ClearList()` | language index |
| `Lang_LoadString(lang)` / `Lang_ClearString()` | JSON strings |
| `Lang_LoadSprite(lang)` / `Lang_ClearSprite()` | external sprites |
| `Lang_LoadFont(lang)` / `Lang_ClearFont()` | external fonts |
| `Lang_GetNumber()` | number of languages |
| `Lang_GetID(name)` | name → index |
| `Lang_GetName(id, default="")` | index → name |
| `Lang_IsExists(id/name)` | language exists |
| `Lang_GetString(key, default="")` | string |
| `Lang_IsStringExists(key)` | string key exists |
| `Lang_GetSprite(key, default=-1)` | dynamic sprite |
| `Lang_IsSpriteExists(key)` | sprite exists |
| `Lang_GetFont(key, default=-1)` | dynamic font |
| `Lang_IsFontExists(key)` | font exists |
| `Lang_GetInfo(lang, key, default="")` | INI metadata, when configured |
| `Lang_LoadFileToString(path)` | reads a bundled file into a string |
| `Lang_Custom()` | editable paths/macros |
| `Lang_Init()` / `Lang_Uninit()` | internal lifecycle |

## Storage

### Global functions

| Function | Usage |
|---|---|
| `Storage_GetManager()` | storage manager |
| `Storage_GetStatic()` | static storage |
| `Storage_GetStaticGeneral()` | static general zone |
| `Storage_GetDynamic()` | dynamic storage |
| `Storage_SaveDynamic()` | saves dynamic |
| `Storage_GetInfo()` | slot metadata |
| `Storage_GetInfoGeneral()` | info general zone |
| `Storage_GetSettings()` | global settings |
| `Storage_GetTemp()` | temporary |
| `Storage_GetTempGeneral()` | temporary general zone |
| `Storage_SaveGame()` | saves static + info |
| `Storage_LoadGame()` | loads static + dynamic |
| `Storage_SetSaveSlot(slot)` | selects the slot |
| `Storage_GetSaveSlot()` | queries the slot |
| `Storage_MakeGetFilePathFunc(useSlots, fileName)` | creates a path closure |
| `Storage_Custom()` | initializes all custom storages |
| `Storage_Custom_Static(storages)` | registers common save/inventory data |
| `Storage_Custom_Dynamic(storages)` | registers dynamic memory |
| `Storage_Custom_Info(storages)` | registers slot metadata |
| `Storage_Custom_Settings(storages)` | registers global settings |
| `Storage_Custom_Temp(storages)` | registers session-only data |
| `Storage_Init()` / `Storage_Uninit()` | internal lifecycle |

### `Storage(funcGetFilePath)`

Inherits `RegisterManager` and offers:

```text
.ClearData()
.SerializeToJson()
.DeserializeFromJson(json)
.GetFilePath()
.SaveToFile()
.LoadFromFile()
.IsFileExists()
```

### Zones

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
  + StorageZone methods

new StorageZoneInventories(inventoryManager)
  // serializes all registered inventories
```

## Generic registration

`new RegisterManager()`:

```text
.Register(id, content)
.GetOrUndefined(id)
.Get(id)
.Contains(id)
.GetIds()
```

Empty or duplicate IDs are rejected.

## Input

| Function | Usage |
|---|---|
| `Input_Bind(input, type, device, button)` | adds a bind |
| `Input_Unbind(input)` | removes all binds for the action |
| `Input_GetState(input)` | current `INPUT_STATE` |
| `Input_IsHeld(input)` | pressed or held |
| `Input_IsPressed(input)` | started this step |
| `Input_IsReleased(input)` | ended this step |
| `Input_SetStateOverride(input, state)` | overrides hardware |
| `Input_RemoveStateOverride(input)` | returns to hardware |
| `Input_Init()` / `Input_Uninit()` | internal lifecycle |

## BGM

| Function | Usage |
|---|---|
| `BGM_Play(slot, audio, loop=true, loop_start=-1, loop_end=-1)` | plays and registers |
| `BGM_Stop(slot)` | stops |
| `BGM_Pause(slot)` | pauses |
| `BGM_Resume(slot)` | resumes |
| `BGM_SetVolume(slot, volume, time=0)` | volume/fade |
| `BGM_SetPitch(slot, pitch)` | pitch |
| `BGM_IsPlaying(slot)` | queries |
| `BGM_IsPaused(slot)` | queries |
| `BGM_IsSlotValid(slot)` | 0..5 |
| `BGM_GetAudio(slot)` | current asset |
| `BGM_GetID(slot)` | audio handle |
| `BGM_Init()` / `BGM_Step()` | internal lifecycle |

## Animation

| Function | Usage |
|---|---|
| `Anim_Create(target, var, tween, ease, start, change, duration, delay=0, arg0=0, arg1=0)` | creates a tween; returns ID(s) |
| `Anim_Destroy(target/id, var="", skip=false)` | removes; `skip=true` forces the final value |
| `Anim_IsExists(target/id, var="")` | queries |
| `Anim_GetValue(tween, ease, time, arg0=0, arg1=0)` | normalized value |
| `Anim_Init()` / `Anim_Step()` / `Anim_Uninit()` | internal lifecycle |

`arg0/arg1` configure BACK/ELASTIC when used.

## Experimental demo/replay

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

Buffer storage is incomplete in the analyzed version.

## Interface, camera and utilities

| Function | Usage |
|---|---|
| `Camera_Shake(x, y, speedX=0, speedY=0, randomX=false, randomY=false, decreaseX=1, decreaseY=1)` | shake |
| `Fader_Fade(start, target, time, delay=0)` | global fade; `start=-1` uses the current one |
| `Border_SetEnabled(bool)` | toggles the border |
| `Border_IsEnabled()` | queries |
| `Border_SetSprite(sprite, fade=true, time=60)` | swaps art |
| `Border_GetSprite()` | queries |
| `CC_Add(text, time=60)` | adds a closed caption |
| `Game_SetFrameSkip(amount)` | sets frames without Draw |
| `Game_GetFrameSkip()` | queries |
| `GetColorFromString(name)` | name → color constant |
| `GetObjectBase(obj)` | topmost ancestor or -1 |
| `File_ReadAllText(path)` | content or `undefined` |
| `File_WriteAllText(path, text)` | write success |

## Macro/configuration scripts

These assets group definitions; edit them, but there's no normal reason to
call the eponymous functions during gameplay:

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

The full definitions are in
[Objects, events and macros](/guides/objects-events-enums-and-macros).
