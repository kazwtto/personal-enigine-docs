<!-- locale: pt-BR; content-id: engine-systems -->

# Sistemas da engine

## Jogador e atributos

Os atributos persistentes ficam na zona geral do armazenamento estático. Use as
funções `Player_*`; elas centralizam validação e fórmulas.

### Atributos principais

| Dado | Ler | Alterar |
|---|---|---|
| nome | `Player_GetName()` | `Player_SetName(name)` |
| LV | `Player_GetLv()` | `Player_SetLv(lv)` |
| HP | `Player_GetHp()` | `Player_SetHp(hp)` |
| HP máximo | `Player_GetHpMax()` | `Player_SetHpMax(hpMax)` |
| ATK base | `Player_GetAtk()` | `Player_SetAtk(atk)` |
| DEF base | `Player_GetDef()` | `Player_SetDef(def)` |
| velocidade | `Player_GetSpd()` | `Player_SetSpd(spd)` |
| invencibilidade | `Player_GetInv()` | `Player_SetInv(inv)` |
| EXP | `Player_GetExp()` | `Player_SetExp(exp)` |
| GOLD | `Player_GetGold()` | `Player_SetGold(gold)` |
| kills | `Player_GetKills()` | `Player_SetKills(kills)` |
| plot | `Player_GetPlot()` | `Player_SetPlot(plot)` |
| arma | `Player_GetItemWeapon()` | `Player_SetItemWeapon(id)` |
| armadura | `Player_GetItemArmor()` | `Player_SetItemArmor(id)` |

`Inv` significa **frames de invencibilidade**, não inventário.

### Bônus de item e total

| Atributo | Bônus de item | Total efetivo |
|---|---|---|
| ATK | `Get/SetAtkItem` | `Player_GetAtkTotal()` |
| DEF | `Get/SetDefItem` | `Player_GetDefTotal()` |
| velocidade | `Get/SetSpdItem` | `Player_GetSpdTotal()` |
| invencibilidade | `Get/SetInvItem` | `Player_GetInvTotal()` |

Durante a batalha, o total inclui ainda `Battle_GetPlayerTempAtk/Def/Spd/Inv`.
Esses modificadores temporários voltam a zero em uma nova batalha.

### Vida e dano

```gml
Player_Heal(10);
Player_Hurt(4);
```

Valores negativos redirecionam para a operação oposta. HP é limitado entre 0 e
o máximo.

Para dano recebido baseado na DEF:

```gml
var dano = Player_CalculateDamage(8, 1, 20);
Player_Hurt(dano);
```

A fórmula atual:

```text
base
+ ceil((HP - 20) / 10), quando HP >= 20
- DEF total / 5
→ arredonda
→ limita entre mínimo e máximo
```

### LV e EXP

`Player_UpdateLv()` sobe quantos níveis forem necessários conforme a EXP.
`Player_LvUp(lv)` atualiza LV, HP máximo, ATK e DEF base. As curvas ficam em:

- `Player_GetLvExp(lv)`;
- `Player_GetLvHpMax(lv)`;
- `Player_GetLvAtk(lv)`;
- `Player_GetLvDef(lv)`.

Edite essas quatro funções se seu jogo usar outra progressão. Nível 20 é o
limite da tabela de EXP atual.

## Armazenamento e saves

### Áreas padrão

| Storage | Arquivo | Escopo | Quando usar |
|---|---|---|---|
| `static` | `fileN/static.json` | por slot | progresso normal; salvo no save point |
| `dynamic` | `fileN/dynamic.json` | por slot | memória que não volta ao carregar |
| `info` | `fileN/info.json` | por slot | nome/LV/tempo/sala no menu |
| `settings` | `settings.json` | global | idioma, volume e opções |
| `temp` | nenhum | sessão | passagem de dados entre sistemas/salas |

Os caminhos ficam sob `GAME_SAVE_NAME`. `N` vem de
`Storage_GetSaveSlot()`.

### Dados comuns

```gml
var data = Storage_GetStaticGeneral();

data.Set("porta_ruinas_aberta", true);
var aberta = data.Get("porta_ruinas_aberta", false);
```

`StorageZoneStruct.Get(key, default)` devolve o padrão quando a chave não existe.

### Salvar e carregar

```gml
Storage_SetSaveSlot(0);
Storage_SaveGame();
```

`Storage_SaveGame()` atualiza os metadados, grava `static.json` e `info.json`.

```gml
Storage_SetSaveSlot(0);
Storage_LoadGame();
```

`Storage_LoadGame()` carrega `static` e `dynamic`. O menu/base deve cuidar da
troca para a sala salva e das configurações globais conforme o fluxo do jogo.

Para dados dinâmicos:

```gml
var dyn = Storage_GetDynamic().Get("general");
dyn.Set("mortes_para_flowey", dyn.Get("mortes_para_flowey", 0) + 1);
Storage_SaveDynamic();
```

### Adicionar uma zona própria

Dentro de `Storage_Custom_Static(storages)`, depois de criar `s`:

```gml
var quests = new StorageZoneStruct();
global._storage_cache_quests = quests;
s.Register("quests", quests);
```

Getter em script próprio:

```gml
function Storage_GetQuests() {
    return global._storage_cache_quests;
}
```

Uso:

```gml
Storage_GetQuests().Set("torta_entregue", true);
```

IDs de storage e zona precisam ser únicos. O sistema serializa cada zona como
uma propriedade JSON.

### Zona personalizada avançada

Herde `StorageZone` e implemente:

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

`DeserializeFromJson()` só limpa os dados depois que o JSON inteiro é analisado
com sucesso. Zonas desconhecidas no arquivo são ignoradas, o que ajuda na
compatibilidade entre versões.

### Cuidados com saves

- teste criação das pastas e escrita em cada plataforma de destino;
- não mude `GAME_SAVE_NAME` depois de lançar sem criar uma migração;
- forneça padrões para chaves novas;
- valide arrays/structs vindos de versões anteriores;
- não salve IDs de assets instáveis quando um nome/string é suficiente;
- mantenha backups ao alterar o formato.

## Entrada

O jogo usa ações abstratas:

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
    // um único step
}

if (Input_IsHeld(INPUT.LEFT)) {
    // enquanto estiver segurando
}

if (Input_IsReleased(INPUT.CANCEL)) {
    // step da soltura
}
```

### Adicionar gamepad

Depois de `Input_Init()` no Game Start de `world`:

```gml
Input_Bind(INPUT.CONFIRM, INPUT_TYPE.GAMEPAD, 0, gp_face1);
Input_Bind(INPUT.CANCEL,  INPUT_TYPE.GAMEPAD, 0, gp_face2);
Input_Bind(INPUT.MENU,    INPUT_TYPE.GAMEPAD, 0, gp_face3);
Input_Bind(INPUT.UP,      INPUT_TYPE.GAMEPAD, 0, gp_padu);
Input_Bind(INPUT.DOWN,    INPUT_TYPE.GAMEPAD, 0, gp_padd);
Input_Bind(INPUT.LEFT,    INPUT_TYPE.GAMEPAD, 0, gp_padl);
Input_Bind(INPUT.RIGHT,   INPUT_TYPE.GAMEPAD, 0, gp_padr);
```

Tipos: `INPUT_TYPE.KEYBOARD`, `GAMEPAD`, `MOUSE`. `device` é usado por gamepad;
o código padrão passa `0` para teclado.

### Reconfigurar uma ação

```gml
Input_Unbind(INPUT.CONFIRM);
Input_Bind(INPUT.CONFIRM, INPUT_TYPE.KEYBOARD, 0, vk_space);
```

`Input_Unbind()` remove todos os binds daquela ação.

### Sobrescrever estado

```gml
Input_SetStateOverride(INPUT.CONFIRM, INPUT_STATE.PRESSED);
// ...
Input_RemoveStateOverride(INPUT.CONFIRM);
```

Útil para replay, testes e acessibilidade. Enquanto existe override, o hardware
real daquela ação é ignorado.

## Música (`BGM_*`)

A engine possui slots `0..5`. O slot 0 é normalmente overworld e o slot 5 é
usado pela batalha.

```gml
BGM_Play(0, snd_musica_ruinas);
BGM_SetVolume(0, 0.7, 30);
BGM_SetPitch(0, 1);
```

Assinatura completa:

```gml
BGM_Play(slot, audio, loop = true, loop_start = -1, loop_end = -1);
```

`loop_start` e `loop_end` permitem loop customizado. Use posições aceitas pelo
sistema de áudio do GameMaker e teste a emenda.

Outras operações:

```gml
BGM_Pause(0);
BGM_Resume(0);
BGM_Stop(0);

BGM_IsPlaying(0);
BGM_IsPaused(0);
BGM_GetAudio(0);
BGM_GetID(0);
```

`BGM_SetVolume(slot, volume, time)` recebe `time` em steps e o converte para
milissegundos. `BGM_SetPitch()` usa o multiplicador de pitch do GameMaker.

Para efeitos únicos, continue usando `audio_play_sound()`.

## Animações/tweens

Anime uma variável real de instância:

```gml
Anim_Create(
    id,                    // alvo
    "image_alpha",         // variável existente
    ANIM_TWEEN.CUBIC,
    ANIM_EASE.OUT,
    0,                     // início
    1,                     // mudança; destino = início + mudança
    30                     // duração em steps
);
```

Com atraso:

```gml
Anim_Create(id, "x", ANIM_TWEEN.BACK, ANIM_EASE.OUT, x, 100, 45, 10);
```

Tweens:

```text
LINEAR, SINE, QUAD, CUBIC, QUART, QUINT,
EXPO, CIRC, BACK, ELASTIC, BOUNCE
```

Easings: `IN`, `OUT`, `IN_OUT`.

Utilitários:

```gml
Anim_IsExists(id, "x");
Anim_Destroy(id, "x");
var valor01 = Anim_GetValue(ANIM_TWEEN.SINE, ANIM_EASE.IN_OUT, 0.5);
```

`Anim_Destroy(target, var_name, skip)` pode filtrar pela variável e decidir se
pula a atualização final. Use somente nomes de variáveis reais já existentes no
alvo.

## Fade

Fade global:

```gml
fader.color = c_black;
Fader_Fade(-1, 1, 20); // alpha atual → opaco
Fader_Fade(-1, 0, 20); // alpha atual → transparente
```

O primeiro argumento `-1` significa “começar no alpha atual”.

Fade específico da batalha:

```gml
Battle_FadeFader(1, 20);
```

## Câmera

```gml
camera.target = char_player;
camera.scale_x = 2;
camera.scale_y = 2;
camera.angle = 0;
```

Tremor:

```gml
Camera_Shake(
    5, 5,   // distância X/Y
    2, 2,   // intervalo X/Y
    true, true, // aleatório X/Y
    0.5, 0.5 // redução X/Y
);
```

## Bordas

```gml
Border_SetEnabled(true);
Border_SetSprite(spr_minha_borda, true, 60);
```

Ativar muda a janela para 960 × 540; desativar volta para 640 × 480. Consulte:

```gml
Border_IsEnabled();
Border_GetSprite();
```

Recursos carregados dinamicamente podem ser descarregados quando a borda troca;
não use o mesmo sprite dinâmico em outro sistema sem coordenar sua vida útil.

## Legendas fechadas

```gml
CC_Add("[Som de porta abrindo]", 120);
```

O tempo padrão é 60 steps. `closed_captions` mantém uma fila e desenha na GUI.
Use para sons relevantes que não possuem representação visual.

## Frame skip

```gml
Game_SetFrameSkip(1);
var quantidade = Game_GetFrameSkip();
```

O sistema desativa Draw Events em alguns frames; a lógica de Step continua. É
um efeito visual/performance, não um controle de velocidade do jogo.

## Demo/replay

A API expõe registro e reprodução de estados de entrada:

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
> O sistema está incompleto na v0.6.0 analisada: as linhas que salvavam e
> restauravam o buffer estão comentadas, e o player começa com `_buffer = -1`.
> Trate-o como base experimental; implemente a persistência do Base64 antes de
> depender de replay no jogo final.

## Game over

Quando `Player_GetHp() <= 0`, `battle_soul` grava a posição da alma em Storage
temporário e vai para `room_gameover`. A sala usa `gameover` e
`gameover_shard` para a sequência visual. Para customizar:

- substitua sprites/sons nos objetos de game over;
- preserve as flags temporárias de posição;
- decida se carrega o último save, reinicia ou volta ao menu;
- restaure música, HP e sala de forma explícita.

## Loja e configurações

As salas `room_shop` e `room_settings` existem na base atual, mas não há um
sistema completo de loja entre os objetos/scripts padrão. Implemente sua UI
usando `Item_GetTypeManager`, inventários, `Player_Get/SetGold` e Storage. Não
confunda tutoriais da modificação de Zhazha ou de outras engines com a API desta
branch.

Próximo: [Referência da API](/reference).
