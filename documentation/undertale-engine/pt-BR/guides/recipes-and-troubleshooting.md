<!-- locale: pt-BR; content-id: recipes-and-troubleshooting -->

# Receitas e solução de problemas

## Receitas rápidas

### Coletável no chão

Crie `obj_pickup_torta` como filho de `trigger`.

```gml
// Create
event_inherited();
user_char = 0;
```

```gml
// User Event 0 — Trigger
event_inherited();

var items = Item_GetInventoryItems();
if (items.Add(ITEM_TORTA)) {
    Dialog_Add("* Você pegou a Torta!");
    Dialog_Start();
    instance_destroy();
} else {
    Dialog_Add("* Seu inventário está cheio.");
    Dialog_Start();
}
```

Para não reaparecer depois de sair e voltar à sala:

```gml
// Create, depois do event_inherited()
var data = Storage_GetStaticGeneral();
if (data.Get("pickup_torta_ruinas", false)) {
    instance_destroy();
}
```

Antes de destruir na coleta:

```gml
Storage_GetStaticGeneral().Set("pickup_torta_ruinas", true);
```

### Porta que consome chave

```gml
// User Event 0 de um filho de char_sign
event_inherited();

var items = Item_GetInventoryItems();

if (Inventory_RemoveFirst(items, ITEM_CHAVE)) {
    Storage_GetStaticGeneral().Set("porta_aberta", true);
    Dialog_Add("* Você usou a chave.{sound `snd_door_open`}");
    Dialog_Start();
    block_enabled = false;
    visible = false;
} else {
    Dialog_Add("* Está trancada.");
    Dialog_Start();
}
```

`Inventory_RemoveFirst` está como receita no capítulo de itens; transforme-a em
um script do projeto.

No Create, restaure o estado:

```gml
event_inherited();

if (Storage_GetStaticGeneral().Get("porta_aberta", false)) {
    block_enabled = false;
    visible = false;
}
```

### Encontro ao pisar

Filho de `trigger`:

```gml
// Create
event_inherited();
user_char = 0;
```

```gml
// User Event 0
event_inherited();

if (!Storage_GetStaticGeneral().Get("slime_derrotado", false)) {
    Encounter_Start(ENCOUNTER_SLIME);
}
```

Ao derrotar/poupar o inimigo, antes de removê-lo:

```gml
Storage_GetStaticGeneral().Set("slime_derrotado", true);
```

### Encontro aleatório por passos

Em um controlador da área:

```gml
// Create
passos_ate_encontro = irandom_range(180, 360);
_x_anterior = char_player.x;
_y_anterior = char_player.y;
```

```gml
// Step
var andou = (
    char_player.x != _x_anterior ||
    char_player.y != _y_anterior
);

if (andou && !instance_exists(ui_dialog) && !Player_IsInBattle()) {
    passos_ate_encontro--;

    if (passos_ate_encontro <= 0) {
        passos_ate_encontro = irandom_range(180, 360);
        Encounter_Start(choose(ENCOUNTER_SLIME, ENCOUNTER_MORCEGO));
    }
}

_x_anterior = char_player.x;
_y_anterior = char_player.y;
```

Um deslocamento aqui conta por step em movimento, não por pixel real. Ajuste à
sensação desejada.

### Chefe com fases

No Create do inimigo:

```gml
_phase = 0;
_hp_max = 300;
_hp = _hp_max;
```

Depois de aplicar dano:

```gml
if (_phase == 0 && _hp <= 200) {
    _phase = 1;
    Dialog_Add("* O chefe ficou sério.");
}

if (_phase == 1 && _hp <= 100) {
    _phase = 2;
    Dialog_Add("* O cenário começou a tremer.");
    Battle_SetEnemyDEF(_enemy_slot, 4);
}
```

Na preparação de turno:

```gml
switch (_phase) {
    case 0: instance_create_depth(0, 0, 0, obj_turn_boss_1); break;
    case 1: instance_create_depth(0, 0, 0, obj_turn_boss_2); break;
    case 2: instance_create_depth(0, 0, 0, obj_turn_boss_3); break;
}
```

### Cutscene simples

```gml
char_player.moveable = false;

Dialog_Add(
    "{char_link 10}* Venha comigo.{pause}" +
    "{char_move 10 DIR.RIGHT 90}{char_unlink}"
);
Dialog_Start();
```

Em um controlador Step, aguarde o diálogo e o movimento:

```gml
if (
    !instance_exists(ui_dialog) &&
    obj_npc_maya.move[DIR.RIGHT] <= 0
) {
    char_player.moveable = true;
    instance_destroy();
}
```

Sempre garanta um caminho de saída que reative o jogador, inclusive se a cena
for pulada.

### Ajuste de volume persistente

Registre/obtenha uma zona geral no storage `settings`, então:

```gml
var settings = Storage_GetSettings().Get("general");
settings.Set("music_volume", 0.7);
Storage_GetSettings().SaveToFile();

BGM_SetVolume(0, settings.Get("music_volume", 1), 0);
```

Carregue `settings` no início do jogo antes de aplicar os valores; a base atual
registra o storage, mas o fluxo completo de tela de ajustes é responsabilidade
do jogo.

## Diagnóstico por sintoma

### “Função não existe”: `Item_Add`, `Flag_Set` ou `GMU_Console_*`

Você está seguindo documentação legada. Na versão atual:

- `Item_Add(obj)` virou `Item_GetInventoryItems().Add(itemId)`;
- flags comuns viraram `Storage_GetStaticGeneral().Get/Set`;
- o console de desenvolvedor antigo não está presente na branch `master`.

Não copie scripts legados isoladamente: eles dependem da arquitetura antiga.

### Objeto filho não inicializa ou dá variável indefinida

O evento do filho substituiu o do pai. Adicione no começo:

```gml
event_inherited();
```

É especialmente importante em Create/Step de `char`, `battle_soul`,
`battle_bullet`, `battle_turn` e `battle_menu_fight`.

### NPC não responde

Verifique:

1. parent é `char` (direto ou indireto);
2. sprite/máscara alcança a área de interação;
3. jogador está olhando na direção correta;
4. User Event **0**, não Step/Collision, contém o diálogo;
5. o evento chama `Dialog_Start()`;
6. não há outra instância `char` cobrindo a frente do jogador;
7. `char_player.moveable` e os flags `_moveable_*` estão ativos.

### NPC não vira ou anima

- Para virar ao interagir, chame `event_inherited()` no User Event 0.
- `dir_locked = true` impede virar.
- Confirme índices `DIR.*` nas tabelas `res_*`.
- Confirme `res_override = false` para seleção automática.
- Use origem consistente entre sprites.

### Diálogo não aparece

- No overworld, faltou `Dialog_Start()`.
- Em batalha, não chame `Dialog_Start`; a fila só aparece no estado DIALOG.
- `Dialog_Start()` devolve `false` se já existe `ui_dialog` ou há `battle`.
- Confirme que o texto não termina cedo com `{end}`.
- Procure comandos `{}` ou crases não fechados.

### Escolha sempre retorna valor antigo

A seleção é gravada quando o jogador confirma. Só leia
`Player_GetTextTyperChoice()` depois que `ui_dialog` foi destruído. Use um Step e
um flag `_ready`, como faz `char_box`.

### Item aparece como `!UNDEFINED!`

- ID não foi registrado em `Item_Custom`;
- macro aponta para outra string;
- save contém um ID removido/renomeado;
- registro ocorreu depois de adicionar ao inventário.

Faça uma migração de IDs antigos antes de `Normalize()`, pois normalizar remove
itens inválidos.

### Nome/info do item vazio

Confirme:

- chaves `item.<key>.name` e `item.<key>.info`;
- JSON válido;
- arquivo listado em `string.txt`;
- pasta do idioma presente em `list.txt`;
- `ItemTypeSimple("key")` usa exatamente a mesma chave.

### Inventário cheio

Sempre teste o retorno:

```gml
if (!inventory.Add(ITEM_TORTA)) {
    // oferecer caixa, deixar no chão ou mostrar aviso
}
```

Não aumente `capacity` sem conferir o layout de `ui_menu` e `ui_box`.

### `Item_GetInventoryBoxes(0)` abre a caixa errada

Na revisão analisada, os casos do `switch` não têm `break`. Use:

```gml
var box1 = Item_GetInventoryManager().Get("box1");
var box2 = Item_GetInventoryManager().Get("box2");
```

Ou corrija a função localmente adicionando `break` após cada atribuição.

### Encontro não existe

- ID precisa ser `>= 0` e único.
- `Encounter_Set` deve estar dentro de `Encounter_Custom()`.
- O objeto de inimigo precisa existir quando a engine compila.
- Confirme que `Encounter_Start()` usa o mesmo ID/macro.

### Inimigo não aparece

- parent/base máxima deve ser `battle_enemy`;
- use `-1` apenas para slots vazios;
- um inimigo único no centro deve ser o `enemy_1`;
- não destrua a instância no Create;
- confira sprite, `visible`, alpha, scale e profundidade.

### Inimigo recebe ACT/dano destinado a outro

Todos recebem eventos globais. Converta e filtre:

```gml
var alvo = Battle_ConvertMenuChoiceEnemyToEnemySlot(
    Battle_GetMenuChoiceEnemy()
);
if (alvo != _enemy_slot) exit;
```

### Inimigo desaparece, mas a batalha trava

Destruir a instância não limpa os metadados. Use:

```gml
var slot = _enemy_slot;
Battle_RemoveEnemy(slot);
instance_destroy();
```

Também confira `battle_dialog_enemy`, `battle_turn` e projéteis que possam ter
sobrado.

### Batalha presa em DIALOG

- um texto pode estar aguardando `{pause}`;
- `Battle_SetDialogAutoEnd(false)` exige chamada manual a `Battle_EndDialog()`;
- um `text_typer` customizado pode não se destruir;
- limpe a fila com `Dialog_Clear()` ao cancelar um fluxo.

### Batalha presa em TURN_PREPARATION

- ainda existe `battle_dialog_enemy`;
- o quadro ainda possui animações;
- `Battle_SetTurnPreparationAutoEnd(false)` exige
  `Battle_EndTurnPreparation()`;
- o turno foi criado depois do ponto em que a engine dispara o User Event 0.

Crie o `battle_turn` no User Event 8 do inimigo, não no Turn Start.

### Turno termina imediatamente

`BATTLE_TURN.TIME` não foi definido ou ficou 0. Defina no User Event 0 do
`battle_turn`:

```gml
Battle_SetTurnInfo(BATTLE_TURN.TIME, 300);
```

Para controle manual use `-1` e chame `Battle_EndTurn()`.

### Projétil invisível

- dentro do quadro, mantenha o Draw herdado que usa a surface;
- fora do quadro, desenhe diretamente e use `BULLET_OUTSIDE_LOW/HIGH`;
- confira se `Battle_GetBoardSurface()` existe naquele frame;
- confira sprite, alpha, scale e profundidade;
- projéteis criados antes do Turn Start podem ser limpos pela transição.

### Projétil atravessa sem causar dano

- parent é `battle_bullet`;
- se o Step foi sobrescrito, faltou `event_inherited()`;
- a máscara do projétil/alma pode não cruzar;
- velocidades muito altas podem pular a colisão entre steps;
- a alma pode estar no período de invencibilidade.

Para alta velocidade, mova em pequenos substeps e teste colisão em cada um.

### Projétil causa dano duas vezes

Você chamou `event_inherited()` em um Step que também implementa sua própria
detecção. Escolha uma única detecção. `Battle_CallSoulEventHurt()` não reduz HP;
ele apenas inicia feedback/invencibilidade, então chame `Player_Hurt()` uma vez.

### Warp chega no ponto/direção errada

Confira IDs e `target_room`. Além disso, no commit analisado o Room Start de
`char_player` limpa a chave de landmark duas vezes. A segunda linha deveria
limpar a direção:

```gml
z.Set(FLAG_TEMP_TRIGGER_WARP_LANDMARK, -1);
z.Set(FLAG_TEMP_TRIGGER_WARP_DIR, 0);
```

Se sua cópia ainda contém duas chamadas a
`FLAG_TEMP_TRIGGER_WARP_LANDMARK`, corrija a segunda.

### Save não é criado

- confirme `GAME_SAVE_NAME` sem espaços/caracteres especiais;
- teste se as pastas `GAME_SAVE_NAME/fileN` são criadas no alvo;
- `File_WriteAllText` não cria pastas explicitamente na implementação;
- consulte o retorno de `SaveToFile()`;
- confira permissões/sandbox da plataforma;
- procure erro de serialização de struct/asset não suportado.

### Save antigo perdeu item

`Inventory.Normalize()` remove IDs não registrados. Preserve aliases antigos ou
migre o array bruto para o novo ID antes de normalizar.

### Nome da sala aparece vazio no menu de save

Adicione toda sala jogável a `Player_GetRoomName(room)`:

```gml
case room_corredor:
    name = "Corredor das Ruínas";
    break;
```

O save guarda o nome do asset e a UI o converte de volta antes de chamar essa
função.

### `Lang_GetInfo` não encontra `info.ini`

Na revisão analisada, a função monta o caminho usando
`GMU_LANG_PATH_STRING + LANG + GMU_LANG_PATH_INFO`, diferente das outras
funções. Se for usar metadados, ajuste as duas ocorrências para:

```gml
GMU_LANG_PATH_BASE + LANG + "/" + GMU_LANG_PATH_INFO
```

O idioma inglês padrão não inclui `info.ini`, então esse caminho não é necessário
para textos, fontes ou sprites comuns.

### Música reinicia toda vez que entra em uma sala

Use `hint_bgm`: ele só chama `BGM_Play` quando o slot não está tocando ou contém
outro áudio. Se controlar manualmente, compare `BGM_GetAudio(slot)` antes de
tocar.

### Replay não funciona

O sistema Demo atual é experimental: persistência/restauração do buffer está
comentada. Implemente armazenamento antes de usar `Demo_StartPlaying()`.

## Estratégia de isolamento de erro

1. Reproduza em uma sala mínima.
2. Teste um objeto-base sem filho customizado.
3. Reative um evento por vez.
4. Mostre IDs, estados e slots com `show_debug_message()`.
5. Confirme o parent no editor.
6. Confirme se o evento herdado é necessário.
7. Verifique nomes de assets/macros e o case.
8. Faça um jogo novo para separar bug de save antigo.
9. Compare com a branch atual, não só com `old_version_examples`.

Voltar ao [índice](../README.md).
