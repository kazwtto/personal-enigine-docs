<!-- locale: pt-BR; content-id: engine-overview -->

# Visão geral da engine

## O que a Undertale Engine oferece

A Undertale Engine é um projeto-base de GameMaker para fangames no estilo de
UNDERTALE. Ela já reúne:

- overworld com personagem, colisão, câmera, warps e pontos de salvamento;
- fila de diálogos e um renderizador de texto com comandos embutidos;
- itens, inventários, equipamento e telefone;
- encontros com até três slots de inimigo;
- menus FIGHT, ACT, ITEM e MERCY;
- turnos, quadro de batalha, almas e projéteis extensíveis;
- estatísticas, EXP, GOLD, LV e dano do jogador;
- saves JSON divididos em dados estáticos, dinâmicos, informações e ajustes;
- localização de textos, sprites e fontes;
- entrada abstrata para teclado, gamepad e mouse;
- BGM em slots, animações/tweens, câmera, fade, bordas, legendas e demos.

## Mapa mental

```text
room_init
└─ world (persistente)
   ├─ inicializa Input, Lang, Item, Storage, Encounter, BGM e Dialog
   ├─ cria camera, fader, border e closed_captions
   └─ segue para logo/menu/overworld

Overworld
├─ char_player interage com filhos de char
├─ Dialog_Add → Dialog_Start → ui_dialog → text_typer
├─ trigger_warp troca de sala
└─ Encounter_Start leva a room_battle

room_battle
└─ battle
   ├─ carrega o encontro
   ├─ cria até 3 battle_enemy
   ├─ alterna MENU → DIALOG → PREPARAÇÃO → TURNO → RESET
   ├─ battle_turn controla o ataque
   ├─ battle_bullet colide com battle_soul
   └─ encerra em vitória, fuga ou game over
```

## Recursos que você normalmente edita

| Recurso | Edite para |
|---|---|
| `Macro_Game` | nome, autor, versão e pasta de save do jogo |
| `Macro_Plot` | marcos da história |
| `Player_CustomInitialData` | atributos e inventário de um jogo novo |
| `Item_Custom` | registrar itens e inventários |
| `Encounter_Custom` | registrar encontros |
| `Storage_Custom_*` | adicionar dados persistentes |
| `Lang_Custom` e `datafiles/locale` | idiomas, textos, fontes e sprites |
| objetos filhos de `char` | NPCs e objetos interativos |
| objetos filhos de `battle_enemy` | lógica dos inimigos |
| objetos filhos de `battle_turn` | padrões de ataque |
| objetos filhos de `battle_bullet` | projéteis e dano |

## Atual x legado

O site oficial foi escrito para uma versão antiga. As diferenças mais visíveis
são:

| Assunto | API atual (`master`, v0.6.0) | Versão legada |
|---|---|---|
| Itens | construtores `ItemType` e `Inventory` | objetos filhos de `item` e funções `Item_*` antigas |
| Dados/saves | `Storage`, `StorageZoneStruct` | sistema `Flag_*` |
| Configuração do jogo | `Macro_Game` | alguns textos antigos citam `Macro_Engine` |
| Eventos de inimigo | inclui `BATTLE_START` | numeração antiga sem esse evento |
| Console de desenvolvedor | não está na branch atual | existia via `GMU_Console_*` |

Não copie números crus de User Events da tabela antiga. Na versão atual,
consulte [Objetos, eventos e macros](/guides/objects-events-enums-and-macros) e use os
nomes `BATTLE_ENEMY_EVENT.*` sempre que chamar eventos por código.

## Princípios que evitam problemas

1. Crie objetos filhos dos objetos-base; não altere a base para cada caso.
2. Ao sobrescrever um evento que precisa do comportamento do pai, comece com
   `event_inherited();`.
3. Registre itens e encontros uma única vez nos scripts `*_Custom`.
4. Use IDs únicos e macros para evitar erros de digitação.
5. Guarde progresso em `Storage`; não espalhe variáveis globais pelo jogo.
6. Nunca edite `_enemy_slot`: a engine atribui esse valor.
7. Use funções públicas (`Player_*`, `Battle_*`) em vez de editar campos
   internos como `battle._state` diretamente.
8. Teste primeiro um inimigo/um turno/um projétil; só depois combine vários.

## Ordem de inicialização

No evento **Game Start** de `world`, a engine executa:

1. `Anim_Init()`;
2. `Input_Init()` e os binds padrão;
3. `Lang_Init()` e carregamento do idioma 0;
4. `Item_Init()`;
5. `Storage_Init()` — que chama `Player_CustomInitialData()`;
6. `Encounter_Init()`;
7. `BGM_Init()`;
8. `Dialog_Init()`;
9. `Demo_Init()`;
10. criação dos controladores persistentes e troca para a próxima sala.

Isso explica duas regras importantes: itens devem ser registrados antes de
serem adicionados em `Player_CustomInitialData`, e encontros devem ser
registrados em `Encounter_Custom` antes de `Encounter_Start()`.

## Escalas e coordenadas

- A interface e a batalha usam uma área de referência de **640 × 480**.
- A câmera começa em `640 × 480` e pode aplicar `scale_x`/`scale_y`.
- O quadro de batalha padrão tem centro `(320, 320)` e extensões
  `up/down = 65`, `left/right = 283`.
- Personagens do overworld são ordenados por profundidade a partir de `y`.
  Use origem do sprite nos pés, geralmente **bottom-center**.

Próximo: [Primeiros passos](/guides/getting-started).
