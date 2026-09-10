<!-- locale: pt-BR; content-id: api-reference -->

# Referência da API

Referência rápida das funções e construtores presentes na branch `master`
analisada (Engine v0.6.0). Para comportamento e exemplos completos, consulte os
capítulos temáticos.

## Convenções

- `slot` de inimigo: `0..2`.
- `slot` de BGM: `0..5`.
- índices de arrays/inventários começam em `0`.
- `obj/inst` significa que a função aceita objeto ou instância quando a
  implementação valida ambos.
- argumentos com `= valor` são opcionais/defaults documentados.
- muitas operações devolvem `true/false`; trate `false` como operação recusada,
  não necessariamente como erro fatal.
- funções `Init`, `Step` e `Uninit` são chamadas pelo `world`; normalmente não
  devem ser chamadas manualmente.

## Batalha — fluxo e eventos

| Função | Uso |
|---|---|
| `Battle_CallEnemyEvent(event, enemy_slot=-1)` | chama User Event em um inimigo ou em todos |
| `Battle_CallBulletEventSoulCollision()` | da alma, chama evento de colisão na bala |
| `Battle_CallSoulEventBulletCollision()` | da bala, pede à alma para processar colisão |
| `Battle_CallSoulEventHurt()` | chama a animação/efeito de dano da alma |
| `Battle_End()` | retorna à sala guardada e restaura BGM |
| `Battle_EndDialog()` | fecha estado de diálogo e avança |
| `Battle_EndMenu()` | resolve escolha atual e avança |
| `Battle_EndMenuFightAim()` | encerra mira e vai à animação de FIGHT |
| `Battle_EndMenuFightAnim()` | encerra animação e vai ao dano |
| `Battle_EndMenuFightDamage()` | encerra dano e resolve o menu |
| `Battle_EndTurnPreparation()` | encerra preparação e começa turno |
| `Battle_EndTurn()` | incrementa rodada, limpa balas/turno e avança |
| `Battle_GotoNextState()` | aplica o estado agendado |
| `Battle_FadeFader(alpha, time)` | anima o fader específico da batalha |

## Batalha — consulta

| Função | Retorno |
|---|---|
| `Battle_GetBoardSurface()` | surface usada para recortar o quadro |
| `Battle_GetEnemy(enemy_slot)` | instância no slot ou `noone` |
| `Battle_GetEnemyNumber()` | quantidade de inimigos vivos |
| `Battle_GetEnemyName(enemy_slot)` | nome de menu |
| `Battle_GetEnemyDEF(enemy_slot)` | defesa configurada |
| `Battle_GetEnemyCenterPosX(enemy_slot)` | centro X para animações |
| `Battle_GetEnemyCenterPosY(enemy_slot)` | centro Y para animações |
| `Battle_GetEnemyActionNumber(enemy_slot)` | número de ACTs |
| `Battle_GetEnemyActionName(enemy_slot, action_slot)` | rótulo do ACT |
| `Battle_GetState()` | `BATTLE_STATE` atual |
| `Battle_GetNextState()` | próximo estado agendado |
| `Battle_GetMenu()` | `BATTLE_MENU` atual |
| `Battle_GetMenuDialog()` | flavor text do menu principal |
| `Battle_GetMenuChoiceButton()` | FIGHT/ACT/ITEM/MERCY |
| `Battle_GetMenuChoiceEnemy()` | índice compacto no menu |
| `Battle_GetMenuChoiceAction()` | índice de ACT |
| `Battle_GetMenuChoiceItem()` | índice no inventário |
| `Battle_GetMenuChoiceMercy()` | índice de MERCY |
| `Battle_GetMenuChoiceMercyOverrideNumber()` | quantidade do menu customizado |
| `Battle_GetMenuChoiceMercyOverrideName(slot)` | nome da entrada customizada |
| `Battle_GetMenuFightDamage()` | dano calculado; negativo pode significar miss |
| `Battle_GetMenuFightAnimTime()` | frames restantes da animação |
| `Battle_GetMenuFightDamageTime()` | frames restantes da fase de dano |
| `Battle_GetMenuItemUsedLast()` | ID do último item usado |
| `Battle_GetTurnNumber()` | rodadas de defesa concluídas |
| `Battle_GetTurnTime()` | tempo restante do turno |
| `Battle_GetTurnInfo(info, default=0)` | configuração do turno |
| `Battle_GetRewardExp()` | EXP acumulada |
| `Battle_GetRewardGold()` | GOLD acumulado |
| `Battle_GetPlayerTempAtk()` | bônus temporário de ATK |
| `Battle_GetPlayerTempDef()` | bônus temporário de DEF |
| `Battle_GetPlayerTempSpd()` | bônus temporário de velocidade |
| `Battle_GetPlayerTempInv()` | bônus temporário de invencibilidade |

## Batalha — validação e conversão

| Função | Significado |
|---|---|
| `Battle_IsEnemySlotValid(slot)` | slot está entre 0 e 2 |
| `Battle_IsEnemyValid(obj/inst)` | base máxima é `battle_enemy` |
| `Battle_IsEnemySpareable(slot)` | inimigo pode ser poupado |
| `Battle_IsBulletValid(obj/inst)` | base máxima é `battle_bullet` |
| `Battle_IsSoulValid(obj/inst)` | base máxima é `battle_soul` |
| `Battle_IsTurnValid(obj/inst)` | base máxima é `battle_turn` |
| `Battle_IsBoardTransforming()` | há tweens do quadro ativos |
| `Battle_IsDialogAutoEnd()` | diálogo avança automaticamente quando vazio |
| `Battle_IsTurnPreparationAutoEnd()` | preparação avança sem balão/tween |
| `Battle_IsFleeable()` | fuga atual teve sucesso |
| `Battle_IsMenuMercyFleeEnabled()` | entrada Flee está habilitada |
| `Battle_IsMenuChoiceMercyOverride()` | menu MERCY está customizado |
| `Battle_ConvertEnemySlotToMenuChoiceEnemy(slot)` | slot fixo → índice compacto |
| `Battle_ConvertMenuChoiceEnemyToEnemySlot(choice)` | índice compacto → slot fixo |

## Batalha — alteração

| Função | Efeito |
|---|---|
| `Battle_SetEnemy(enemy_obj/inst, slot)` | cria/move inimigo para o slot e chama Init |
| `Battle_RemoveEnemy(slot)` | limpa o slot; não destrói a instância |
| `Battle_SetEnemyName(slot, text)` | define nome |
| `Battle_SetEnemyDEF(slot, def)` | define defesa |
| `Battle_SetEnemyCenterPos(slot, x, y)` | define centro visual |
| `Battle_SetEnemyActionNumber(slot, number)` | define número de ACTs |
| `Battle_SetEnemyActionName(slot, action_slot, text)` | define ACT |
| `Battle_SetEnemySpareable(slot, bool)` | define estado amarelo/poupável |
| `Battle_SetSoul(soul_obj)` | troca a alma por um objeto válido |
| `Battle_SetState(state)` | muda imediatamente; uso interno/avançado |
| `Battle_SetNextState(state)` | agenda próximo estado |
| `Battle_SetMenu(menu, call_event=true)` | muda submenu |
| `Battle_SetMenuDialog(text)` | muda flavor text |
| `Battle_SetMenuChoiceButton(choice, call_event=true)` | seleciona botão |
| `Battle_SetMenuChoiceEnemy(choice, call_event=true)` | seleciona alvo |
| `Battle_SetMenuChoiceAction(choice, call_event=true)` | seleciona ACT |
| `Battle_SetMenuChoiceItem(choice, call_event=true)` | seleciona item |
| `Battle_SetMenuChoiceMercy(choice, call_event=true)` | seleciona MERCY |
| `Battle_SetMenuChoiceMercyOverride(bool)` | ativa menu MERCY customizado |
| `Battle_SetMenuChoiceMercyOverrideNumber(number)` | número de entradas customizadas |
| `Battle_SetMenuChoiceMercyOverrideName(slot, name)` | nome da entrada |
| `Battle_SetMenuMercyFleeEnabled(bool)` | habilita Flee |
| `Battle_SetFleeable(bool)` | força/limpa sucesso de fuga |
| `Battle_SetMenuFightDamage(damage)` | define dano da fase FIGHT |
| `Battle_SetMenuFightAnimTime(time)` | define cronômetro da animação |
| `Battle_SetMenuFightDamageTime(time)` | define cronômetro do dano |
| `Battle_SetDialog(text="", choice=false, line2=false)` | cria/remove texto de batalha |
| `Battle_SetDialogAutoEnd(bool)` | controla fim automático do diálogo |
| `Battle_SetTurnInfo(info, value)` | grava opção do próximo turno |
| `Battle_SetTurnTime(time)` | define tempo restante |
| `Battle_SetTurnNumber(number)` | define rodada |
| `Battle_SetTurnPreparationAutoEnd(bool)` | controla fim automático da preparação |
| `Battle_SetPlayerTempAtk(value)` | bônus de ATK desta batalha |
| `Battle_SetPlayerTempDef(value)` | bônus de DEF desta batalha |
| `Battle_SetPlayerTempSpd(value)` | bônus de velocidade desta batalha |
| `Battle_SetPlayerTempInv(value)` | bônus de invencibilidade desta batalha |
| `Battle_RewardExp(amount)` | acumula EXP |
| `Battle_RewardGold(amount)` | acumula GOLD |

## Encontros

| Função | Uso |
|---|---|
| `Encounter_Set(id, enemy0, enemy1, enemy2, text, bgm=-1, flee=true, pause_bgm=true, quick=false, soul_x=48, soul_y=454)` | registra/substitui dados |
| `Encounter_Start(id, anim=true, exclam=true)` | inicia transição/batalha |
| `Encounter_IsExists(id)` | verifica registro |
| `Encounter_GetEnemy(id, slot)` | objeto do slot |
| `Encounter_GetMenuDialog(id)` | flavor text |
| `Encounter_GetBGM(id)` | asset de som |
| `Encounter_IsMenuMercyFleeEnabled(id)` | opção Flee |
| `Encounter_IsPauseBGM(id)` | pausa BGM de overworld |
| `Encounter_IsQuick(id)` | transição rápida |
| `Encounter_GetSoulX(id)` | destino X da alma |
| `Encounter_GetSoulY(id)` | destino Y da alma |
| `Encounter_Custom()` | ponto de registro editável |
| `Encounter_Init()` / `Encounter_Uninit()` | ciclo interno |

## Jogador

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

### Alterações

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

### Cálculos e utilitários

| Função | Uso |
|---|---|
| `Player_Heal(amount)` | cura limitada ao máximo |
| `Player_Hurt(amount)` | reduz HP até zero |
| `Player_CalculateDamage(base, min=0, max=infinity)` | aplica DEF e limites |
| `Player_UpdateLv()` | sobe níveis conforme EXP; retorna se subiu |
| `Player_LvUp(lv)` | aplica um LV e atributos base |
| `Player_GetLvExp(lv)` | EXP total exigida |
| `Player_GetLvHpMax(lv)` | HP máximo do LV |
| `Player_GetLvAtk(lv)` | ATK base do LV |
| `Player_GetLvDef(lv)` | DEF base do LV |
| `Player_GetRoomName(room)` | nome amigável customizado por switch |
| `Player_CustomInitialData()` | ponto editável para novo jogo |

## Itens e inventários

### Funções globais

| Função | Uso |
|---|---|
| `Item_GetTypeManager()` | gerenciador de tipos |
| `Item_GetInventoryManager()` | gerenciador de inventários |
| `Item_GetInventoryItems()` | inventário principal |
| `Item_GetInventoryPhones()` | telefones |
| `Item_GetInventoryBoxes(index)` | caixa; veja aviso do capítulo de itens |
| `Item_GetTextEat(item_name)` | texto localizado |
| `Item_GetTextEquip(item_name)` | texto localizado |
| `Item_GetTextHeal(hp, new_line=true)` | texto de cura |
| `Item_Custom()` | registro editável |
| `Item_Init()` / `Item_Uninit()` | ciclo interno |

### `ItemType`

```text
new ItemType()
  .GetName()
  .OnUse(inventory, index)
  .OnInfo(inventory, index)
  .OnDrop(inventory, index)

new ItemTypeSimple(keyId)
  // nome: item.<keyId>.name
  // info: item.<keyId>.info
```

`ItemTypeManager` herda `RegisterManager` e adiciona:

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

Construtores de exemplo incluídos:

```text
CustomItem_Dice
CustomItem_Stick
CustomItem_Bandage
CustomItem_ToyKnife
CustomItem_FadedRibbon
CustomItem_Phone_TML
```

## Diálogo

| Função | Uso |
|---|---|
| `Dialog_Add(text)` | enfileira |
| `Dialog_Get()` | retira a próxima entrada |
| `Dialog_IsEmpty()` | consulta fila |
| `Dialog_Clear()` | limpa fila |
| `Dialog_Start()` | abre `ui_dialog` no overworld |
| `Dialog_Init()` / `Dialog_Uninit()` | ciclo interno |

Os comandos embutidos do `text_typer` estão documentados em
[Diálogos e localização](/guides/dialogues-text-and-localization#referência-dos-comandos-de-texto).

## Localização

| Função | Uso |
|---|---|
| `Lang_LoadList()` / `Lang_ClearList()` | índice de idiomas |
| `Lang_LoadString(lang)` / `Lang_ClearString()` | textos JSON |
| `Lang_LoadSprite(lang)` / `Lang_ClearSprite()` | sprites externos |
| `Lang_LoadFont(lang)` / `Lang_ClearFont()` | fontes externas |
| `Lang_GetNumber()` | quantidade de idiomas |
| `Lang_GetID(name)` | nome → índice |
| `Lang_GetName(id, default="")` | índice → nome |
| `Lang_IsExists(id/name)` | idioma existe |
| `Lang_GetString(key, default="")` | texto |
| `Lang_IsStringExists(key)` | chave de texto existe |
| `Lang_GetSprite(key, default=-1)` | sprite dinâmico |
| `Lang_IsSpriteExists(key)` | sprite existe |
| `Lang_GetFont(key, default=-1)` | fonte dinâmica |
| `Lang_IsFontExists(key)` | fonte existe |
| `Lang_GetInfo(lang, key, default="")` | metadado INI, quando configurado |
| `Lang_LoadFileToString(path)` | lê arquivo empacotado em string |
| `Lang_Custom()` | caminhos/macros editáveis |
| `Lang_Init()` / `Lang_Uninit()` | ciclo interno |

## Storage

### Funções globais

| Função | Uso |
|---|---|
| `Storage_GetManager()` | gerenciador de storages |
| `Storage_GetStatic()` | storage estático |
| `Storage_GetStaticGeneral()` | zona geral estática |
| `Storage_GetDynamic()` | storage dinâmico |
| `Storage_SaveDynamic()` | grava dinâmico |
| `Storage_GetInfo()` | metadados de slot |
| `Storage_GetInfoGeneral()` | zona geral de info |
| `Storage_GetSettings()` | ajustes globais |
| `Storage_GetTemp()` | temporário |
| `Storage_GetTempGeneral()` | zona geral temporária |
| `Storage_SaveGame()` | grava static + info |
| `Storage_LoadGame()` | carrega static + dynamic |
| `Storage_SetSaveSlot(slot)` | escolhe slot |
| `Storage_GetSaveSlot()` | consulta slot |
| `Storage_MakeGetFilePathFunc(useSlots, fileName)` | cria closure de caminho |
| `Storage_Custom()` | inicializa todos os storages customizados |
| `Storage_Custom_Static(storages)` | registra dados de save comum/inventários |
| `Storage_Custom_Dynamic(storages)` | registra memória dinâmica |
| `Storage_Custom_Info(storages)` | registra metadados de slot |
| `Storage_Custom_Settings(storages)` | registra ajustes globais |
| `Storage_Custom_Temp(storages)` | registra dados somente da sessão |
| `Storage_Init()` / `Storage_Uninit()` | ciclo interno |

### `Storage(funcGetFilePath)`

Herda `RegisterManager` e oferece:

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
  // serializa todos os inventários registrados
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

IDs vazios ou duplicados são recusados.

## Entrada

| Função | Uso |
|---|---|
| `Input_Bind(input, type, device, button)` | adiciona bind |
| `Input_Unbind(input)` | remove todos os binds da ação |
| `Input_GetState(input)` | `INPUT_STATE` atual |
| `Input_IsHeld(input)` | pressionado ou segurado |
| `Input_IsPressed(input)` | começou neste step |
| `Input_IsReleased(input)` | terminou neste step |
| `Input_SetStateOverride(input, state)` | substitui hardware |
| `Input_RemoveStateOverride(input)` | volta ao hardware |
| `Input_Init()` / `Input_Uninit()` | ciclo interno |

## BGM

| Função | Uso |
|---|---|
| `BGM_Play(slot, audio, loop=true, loop_start=-1, loop_end=-1)` | toca e registra |
| `BGM_Stop(slot)` | para |
| `BGM_Pause(slot)` | pausa |
| `BGM_Resume(slot)` | retoma |
| `BGM_SetVolume(slot, volume, time=0)` | volume/fade |
| `BGM_SetPitch(slot, pitch)` | pitch |
| `BGM_IsPlaying(slot)` | consulta |
| `BGM_IsPaused(slot)` | consulta |
| `BGM_IsSlotValid(slot)` | 0..5 |
| `BGM_GetAudio(slot)` | asset atual |
| `BGM_GetID(slot)` | handle de áudio |
| `BGM_Init()` / `BGM_Step()` | ciclo interno |

## Animação

| Função | Uso |
|---|---|
| `Anim_Create(target, var, tween, ease, start, change, duration, delay=0, arg0=0, arg1=0)` | cria tween; devolve ID(s) |
| `Anim_Destroy(target/id, var="", skip=false)` | remove; `skip=true` força valor final |
| `Anim_IsExists(target/id, var="")` | consulta |
| `Anim_GetValue(tween, ease, time, arg0=0, arg1=0)` | valor normalizado |
| `Anim_Init()` / `Anim_Step()` / `Anim_Uninit()` | ciclo interno |

`arg0/arg1` configuram BACK/ELASTIC quando usados.

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

O armazenamento do buffer está incompleto na versão analisada.

## Interface, câmera e utilitários

| Função | Uso |
|---|---|
| `Camera_Shake(x, y, speedX=0, speedY=0, randomX=false, randomY=false, decreaseX=1, decreaseY=1)` | tremor |
| `Fader_Fade(start, target, time, delay=0)` | fade global; `start=-1` usa atual |
| `Border_SetEnabled(bool)` | liga/desliga borda |
| `Border_IsEnabled()` | consulta |
| `Border_SetSprite(sprite, fade=true, time=60)` | troca arte |
| `Border_GetSprite()` | consulta |
| `CC_Add(text, time=60)` | adiciona legenda fechada |
| `Game_SetFrameSkip(amount)` | configura frames sem Draw |
| `Game_GetFrameSkip()` | consulta |
| `GetColorFromString(name)` | nome → constante de cor |
| `GetObjectBase(obj)` | ancestral máximo ou -1 |
| `File_ReadAllText(path)` | conteúdo ou `undefined` |
| `File_WriteAllText(path, text)` | sucesso da escrita |

## Scripts de macros/configuração

Estes recursos agrupam definições; edite-os, mas não há motivo normal para
chamar as funções homônimas em gameplay:

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

As definições completas estão em
[Objetos, eventos e macros](/guides/objects-events-enums-and-macros).
