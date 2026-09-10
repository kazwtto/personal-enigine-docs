<!-- locale: pt-BR; content-id: objects-events-enums-and-macros -->

# Objetos, eventos, enums e macros

## Catálogo de objetos

### Controladores

| Objeto | Parent | Papel |
|---|---|---|
| `world` | — | controlador persistente; inicializa e atualiza sistemas |
| `camera` | — | câmera, alvo, limites, zoom e tremor |
| `fader` | — | retângulo de fade global |
| `border` | — | borda externa e mudança de tamanho da janela |
| `closed_captions` | — | fila de legendas na GUI |
| `menu` | — | título, naming, continue/reset/settings |
| `logo` | — | abertura/logo |

Não coloque cópias extras dos controladores em cada sala. `world` os cria no
Game Start.

### Overworld

| Objeto | Parent | Papel |
|---|---|---|
| `block` | — | barreira com `block_enabled` |
| `block_corner` | `block` | variação de barreira/canto |
| `char` | `block` | personagem-base, movimento, direção e interação |
| `char_player` | `char` | jogador controlável |
| `char_sign` | `char` | objeto imóvel com variável `text` |
| `char_save` | `char_sign` | cura e abre UI de save |
| `char_box` | `char_sign` | confirmação e UI de caixa |
| `trigger` | — | entrada/saída por sobreposição com `char` |
| `trigger_warp` | `trigger` | fade, landmark e troca de sala |
| `hint_landmark` | — | ponto de chegada por `landmark_id` |
| `hint_bgm` | — | aplica música/pitch por sala |
| `hint_border` | — | aplica sprite de borda por sala |
| `hint_half_size` | — | define escala 2× da câmera |
| `exclamation` | — | ícone da animação de encontro |
| `encounter_anim` | — | transição overworld → batalha |

### Texto e interface

| Objeto | Parent | Papel |
|---|---|---|
| `text_typer` | — | interpreta texto e cria caracteres |
| `text_single` | — | um caractere/sprite renderizado |
| `face` | — | retrato/face com emoções e fala |
| `ui_dialog` | — | caixa de diálogo do overworld |
| `ui_menu` | — | itens, status e telefone |
| `ui_save` | — | interface do save point |
| `ui_box` | — | transferência inventário/caixa |

### Núcleo da batalha

| Objeto | Parent | Papel |
|---|---|---|
| `battle` | — | máquina de estados e dados do combate |
| `battle_board` | — | fundo, borda, colisão e surface do quadro |
| `battle_enemy` | — | base obrigatória para inimigos |
| `battle_turn` | — | base para orquestradores de ataque |
| `battle_bullet` | — | base de projétil e colisão |
| `battle_soul` | — | base da alma, invencibilidade e game over |
| `battle_soul_red` | `battle_soul` | alma vermelha com movimento livre |
| `battle_ui` | — | nome, LV, HP e HUD |
| `battle_fader` | — | fade local da batalha |

### Menus e feedback da batalha

| Objeto | Parent | Papel |
|---|---|---|
| `battle_button` | — | base dos quatro botões |
| `battle_button_fight` | `battle_button` | botão FIGHT |
| `battle_button_act` | `battle_button` | botão ACT |
| `battle_button_item` | `battle_button` | botão ITEM/estado vazio |
| `battle_button_mercy` | `battle_button` | botão MERCY |
| `battle_menu_fight` | — | base de minigame de ataque |
| `battle_menu_fight_knife` | `battle_menu_fight` | mira/ataque de faca padrão |
| `battle_menu_fight_anim_knife` | — | animação visual do golpe |
| `battle_menu_fight_hp_bar` | — | HP no seletor de alvo |
| `battle_menu_item_scrollbar` | — | indicador de rolagem de itens |
| `battle_damage` | — | número e barra de dano |
| `battle_death_particle` | — | vaporização do inimigo |
| `battle_death_particle_collision` | — | auxiliar da partícula |
| `battle_dialog_enemy` | — | balão de fala do inimigo |
| `battle_result_flee` | — | animação de fuga |
| `shaker` | — | tremor de uma variável/instância |

### Game over e ferramentas

| Objeto | Parent | Papel |
|---|---|---|
| `gameover` | — | sequência de derrota |
| `gameover_shard` | — | fragmentos da alma |
| `demo_recorder` | — | grava estados de input em buffer |
| `demo_player` | — | reproduz buffer de input; experimental |

## Eventos de extensão

### `char`

| Evento | Função |
|---|---|
| Create | inicializa direção, movimento, colisão e tabelas de sprite |
| Step | move, colide e escolhe sprite |
| End Step | define profundidade por Y |
| User Event 0 | **Interact**; olha para o jogador |
| Clean Up | destrói lista de colisão |

Filhos com Create devem usar `event_inherited()`. Filhos interativos normalmente
também chamam o User Event herdado para virar na direção do jogador.

### `trigger`

| Evento | Nome |
|---:|---|
| User Event 0 | Trigger/entrou |
| User Event 1 | Leave/saiu |

### `battle_enemy`

| User Event | Enum | Nome |
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

| User Event | Enum | Nome |
|---:|---|---|
| 0 | `TURN_PREPARATION_START` | configurar quadro/tempo |
| 1 | `TURN_PREPARATION_END` | fim da preparação |
| 2 | `TURN_START` | iniciar ataque |
| 3 | `TURN_END` | destrói por padrão |

### `battle_bullet`

| User Event | Enum | Nome |
|---:|---|---|
| 0 | `SOUL_COLLISION` | reação/dano ao tocar a alma |
| 1 | `TURN_END` | destrói por padrão |

O Step do pai detecta `place_meeting` e o Draw do pai recorta na surface do
quadro.

### `battle_soul`

| User Event | Enum | Nome |
|---:|---|---|
| 0 | `BULLET_COLLISION` | aceita colisão se invencibilidade acabou |
| 1 | `HURT` | inicia invencibilidade, som e tremor |

### `battle_menu_fight`

| User Event | Enum | Nome |
|---:|---|---|
| 0 | `ANIM` | animação visual do golpe |
| 1 | `DAMAGE` | fase de dano |
| 2 | `END` | encerra/destroça minigame |

### `text_typer`

| User Event | Nome |
|---:|---|
| 0 | New Char |
| 1 | New Line |
| 2 | Command |
| 3 | Clear |
| 4 | Update Position |
| 5 | Group & Macro |
| 15 | Update Immediately |

Sobrescrever esses eventos altera o parser/renderizador de todo texto. Prefira
comandos e grupos existentes antes de editar a base.

## Enums de batalha

### `BATTLE_STATE`

| Nome | Valor |
|---|---:|
| `MENU` | 0 |
| `DIALOG` | 1 |
| `TURN_PREPARATION` | 2 |
| `IN_TURN` | 3 |
| `BOARD_RESETTING` | 4 |
| `RESULT` | 5 |

### `BATTLE_MENU`

| Nome | Valor |
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

### Escolhas

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

### Outros eventos

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

## Quadro e turno

### `BATTLE_BOARD`

```text
X=320, Y=320, UP=65, DOWN=65, LEFT=283, RIGHT=283
```

As medidas direcionais são extensões a partir do centro, não largura/altura
totais.

### `BATTLE_TURN`

| Valor | Chave | Valor | Chave |
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

Valores menores aparecem à frente de valores maiores no GameMaker.

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

## Direções

```text
DIR.RIGHT = 0
DIR.UP    = 90
DIR.LEFT  = 180
DIR.DOWN  = 270
```

Essa ordem permite usar a direção como índice de arrays alocados em posições
0, 90, 180 e 270.

## Entrada

### `INPUT`

```text
UP=0, DOWN=1, LEFT=2, RIGHT=3, CONFIRM=4, CANCEL=5, MENU=6
```

### Criados por `Input_Init`

```text
INPUT_TYPE.KEYBOARD=0
INPUT_TYPE.GAMEPAD=1
INPUT_TYPE.MOUSE=2

INPUT_STATE.NULL=0
INPUT_STATE.HELD=1
INPUT_STATE.PRESSED=2
INPUT_STATE.RELEASED=3
```

## Animação

Criados por `Anim_Init`:

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

`ANIM_DATA` é interno ao gerenciador; não dependa de seus números em gameplay.

## Configuração do jogo

Em `Macro_Game`:

```gml
#macro GAME_NAME "UNDERTALE Engine"
#macro GAME_AUTHOR "TML"
#macro GAME_VERSION "v0.0.0"
#macro GAME_SAVE_NAME "undertale_engine"
```

Em `Macro_Engine`:

```gml
#macro ENGINE_VERSION "v0.6.0"
```

Altere os macros `GAME_*`, não `ENGINE_VERSION`.

## Plot

Padrão:

```gml
enum PLOT {
    START
};
```

Adicione novos marcos ao fim para evitar mudar os valores de saves existentes:

```gml
enum PLOT {
    START,
    FALOU_COM_MAYA,
    PORTA_ABERTA
};
```

## Flags/chaves de Storage

### Estáticas

| Macro | Chave |
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

### Informações de slot

```text
FLAG_INFO_NAME = "name"
FLAG_INFO_LV   = "lv"
FLAG_INFO_TIME = "time"
FLAG_INFO_ROOM = "room"
```

### Temporárias

```text
FLAG_TEMP_ENCOUNTER = "encounter_id"
FLAG_TEMP_BATTLE_ROOM_RETURN = "battle_room_return"
FLAG_TEMP_GAMEOVER_SOUL_X = "gameover_soul_x"
FLAG_TEMP_GAMEOVER_SOUL_Y = "gameover_soul_y"
FLAG_TEMP_TRIGGER_WARP_LANDMARK = "trigger_warp_landmark"
FLAG_TEMP_TRIGGER_WARP_DIR = "trigger_warp_dir"
FLAG_TEMP_TEXT_TYPER_CHOICE = "text_typer_choice"
```

A região de flags dinâmicas e de settings começa vazia para o jogo preencher.

## Itens padrão

```text
ITEM_EMPTY = ""
ITEM_DICE = "dice"
ITEM_STICK = "stick"
ITEM_BANDAGE = "bandage"
ITEM_TOY_KNIFE = "toy_knife"
ITEM_FADED_RIBBON = "faded_ribbon"
ITEM_PHONE_TML = "phone_tml"
```

Os macros de itens de exemplo são declarados em `Item_Custom`. IDs de item são
strings e precisam existir no `ItemTypeManager` antes de entrar em inventário ou
equipamento.
