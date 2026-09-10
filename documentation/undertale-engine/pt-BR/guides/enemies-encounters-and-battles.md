<!-- locale: pt-BR; content-id: enemies-encounters-and-battles -->

# Inimigos, encontros e batalhas

Este capítulo cria uma batalha completa: inimigo, ACT, HP, dano, recompensa,
MERCY, encontro, turno e projétil.

## Arquitetura da batalha

```text
Encounter_Custom
└─ Encounter_Set(ID, inimigos, texto, música...)
   └─ Encounter_Start(ID)
      └─ room_battle
         └─ battle cria os inimigos e controla os estados
            ├─ battle_enemy: decisões e reação aos menus
            ├─ battle_turn: padrão de ataque atual
            ├─ battle_bullet: colisão/dano
            ├─ battle_soul: jogador dentro do quadro
            └─ battle_board: área de defesa
```

A engine suporta três **slots fixos**, de 0 a 2. Um menu, porém, enumera apenas
inimigos vivos. Use sempre as conversões `Battle_Convert*` quando comparar uma
escolha do menu com `_enemy_slot`.

## Ciclo de estados

```text
MENU
  ↓ escolha FIGHT/ACT/ITEM/MERCY
DIALOG
  ↓ falas resultantes
TURN_PREPARATION
  ↓ fala do inimigo + transformação do quadro
IN_TURN
  ↓ cronômetro ou Battle_EndTurn()
BOARD_RESETTING
  ↓ quadro volta ao padrão
MENU
```

Quando não há mais inimigos, o controlador entra em `RESULT`, concede as
recompensas acumuladas e volta à sala anterior.

## Tutorial completo: Slime

### 1. Recursos visuais e sons

Crie, no mínimo:

- `spr_enemy_slime` para o inimigo;
- `spr_bullet_gota` para o projétil;
- `snd_battle_slime` ou reutilize um som permitido;
- opcionalmente sons de ataque, dano e desaparecimento.

Na batalha, a referência visual é 640 × 480. Um inimigo único fica naturalmente
no slot central quando registrado como o segundo argumento de inimigo.

### 2. Objeto do inimigo

Crie `obj_enemy_slime` com:

- sprite: `spr_enemy_slime`;
- parent: `battle_enemy`.

#### Create

```gml
event_inherited();

_hp_max = 60;
_hp = _hp_max;
_defeated = false;
```

`event_inherited()` preserva `depth` e `_enemy_slot`. A engine atribui
`_enemy_slot` depois do Create; não escolha nem modifique esse valor.

#### User Event 0 — Init

```gml
/// @description Init

Battle_SetEnemyName(_enemy_slot, "* Slime");

Battle_SetEnemyActionNumber(_enemy_slot, 2);
Battle_SetEnemyActionName(_enemy_slot, 0, "* Check");
Battle_SetEnemyActionName(_enemy_slot, 1, "* Compliment");

Battle_SetEnemyDEF(_enemy_slot, 1);
Battle_SetEnemyCenterPos(_enemy_slot, x, y - 32);
Battle_SetEnemySpareable(_enemy_slot, false);
```

Máximo prático de ações na estrutura atual: **6 por inimigo**.

#### User Event 3 — Menu Switch

Este evento reage quando a tela do menu muda. Ele cria a barra de HP na lista de
alvos e aplica o dano quando chega em `FIGHT_DAMAGE`.

```gml
/// @description Menu Switch

switch (Battle_GetMenu()) {
    case BATTLE_MENU.FIGHT_TARGET:
        var bar = instance_create_depth(0, 0, 0, battle_menu_fight_hp_bar);
        bar.enemy_slot = _enemy_slot;
        bar.hp_max = _hp_max;
        bar.hp = _hp;
        break;

    case BATTLE_MENU.FIGHT_DAMAGE:
        var alvo = Battle_ConvertMenuChoiceEnemyToEnemySlot(
            Battle_GetMenuChoiceEnemy()
        );

        if (alvo != _enemy_slot) break;

        var dano = Battle_GetMenuFightDamage();
        if (dano < 0) break; // golpe perdido

        var hp_anterior = _hp;
        _hp = max(0, _hp - dano);
        _defeated = (_hp <= 0);

        var pop = instance_create_depth(x, y - 72, 0, battle_damage);
        pop.damage = dano;
        pop.bar_hp_max = _hp_max;
        pop.bar_hp_original = hp_anterior;
        pop.bar_hp_target = _hp;

        if (dano > 0) {
            audio_play_sound(snd_damage, 0, false);
            Camera_Shake(4, 2, 2, 2);
        }
        break;
}
```

#### User Event 5 — Menu End

Aqui entram ACT, derrota e MERCY. Todos os inimigos recebem o evento; por isso,
filtre o alvo de ACT/FIGHT.

```gml
/// @description Menu End

var botao = Battle_GetMenuChoiceButton();

switch (botao) {
    case BATTLE_MENU_CHOICE_BUTTON.FIGHT:
        var alvo_fight = Battle_ConvertMenuChoiceEnemyToEnemySlot(
            Battle_GetMenuChoiceEnemy()
        );

        if (alvo_fight == _enemy_slot && _defeated) {
            var slot_derrotado = _enemy_slot;

            Battle_RewardExp(8);
            Battle_RewardGold(6);

            var vapor = instance_create_depth(x, y, 0, battle_death_particle);
            vapor.sprite = sprite_index;
            audio_play_sound(snd_vaporize, 0, false);

            Battle_RemoveEnemy(slot_derrotado);
            instance_destroy();
        }
        break;

    case BATTLE_MENU_CHOICE_BUTTON.ACT:
        var alvo_act = Battle_ConvertMenuChoiceEnemyToEnemySlot(
            Battle_GetMenuChoiceEnemy()
        );
        if (alvo_act != _enemy_slot) break;

        switch (Battle_GetMenuChoiceAction()) {
            case 0:
                Dialog_Add("* SLIME - AT 2 DF 1&* Gosta de elogios.");
                break;

            case 1:
                Dialog_Add("* Você elogiou o brilho do Slime.");
                Dialog_Add("* Slime ficou contente.");
                Battle_SetEnemySpareable(_enemy_slot, true);
                break;
        }
        break;

    case BATTLE_MENU_CHOICE_BUTTON.MERCY:
        if (
            Battle_GetMenuChoiceMercy() == BATTLE_MENU_CHOICE_MERCY.SPARE &&
            Battle_IsEnemySpareable(_enemy_slot)
        ) {
            var slot_poupado = _enemy_slot;

            // Spare costuma dar GOLD, mas não EXP.
            Battle_RewardGold(6);
            Battle_RemoveEnemy(slot_poupado);
            instance_destroy();
        }
        break;
}
```

Remova o slot com `Battle_RemoveEnemy()` antes de destruir a instância. Isso
limpa nome, ações, defesa, posição e estado spareable associados ao slot.

#### User Event 8 — Turn Preparation Start

```gml
/// @description Turn Preparation Start

if (!instance_exists(obj_turn_slime)) {
    instance_create_depth(0, 0, 0, obj_turn_slime);
}

var fala = instance_create_depth(x + 70, y - 80, 0, battle_dialog_enemy);
fala.text = choose("blub...", "squish!", "...");
fala.template = 0;
```

O balão é destruído quando seu `text_typer` termina. A preparação avança
automaticamente quando não há balão e o quadro terminou de transformar.

### 3. Objeto do turno

Crie `obj_turn_slime` com parent `battle_turn`.

#### Create

```gml
event_inherited();

_spawn_restante = 12;
```

#### User Event 0 — Turn Preparation Start

```gml
/// @description Turn Preparation Start

// 300 steps = aproximadamente 5 segundos a 60 FPS.
Battle_SetTurnInfo(BATTLE_TURN.TIME, 300);

// Metade da largura e altura a partir do centro.
Battle_SetTurnInfo(BATTLE_TURN.BOARD_LEFT, 110);
Battle_SetTurnInfo(BATTLE_TURN.BOARD_RIGHT, 110);
Battle_SetTurnInfo(BATTLE_TURN.BOARD_UP, 70);
Battle_SetTurnInfo(BATTLE_TURN.BOARD_DOWN, 70);

// Posição da alma relativa ao centro do quadro.
Battle_SetTurnInfo(BATTLE_TURN.SOUL_X, 0);
Battle_SetTurnInfo(BATTLE_TURN.SOUL_Y, 0);
```

#### User Event 2 — Turn Start

```gml
/// @description Turn Start

alarm[0] = 1;
```

#### Alarm 0

```gml
if (_spawn_restante > 0) {
    var gota = instance_create_depth(
        battle_board.x + irandom_range(-90, 90),
        battle_board.y - battle_board.up - 16,
        0,
        obj_bullet_gota
    );
    gota.vspeed = irandom_range(2, 4);

    _spawn_restante--;
    alarm[0] = 18;
}
```

O `battle` encerra o turno sozinho quando `TIME` chega a zero. Para um ataque de
duração dinâmica, use `TIME = -1` e chame `Battle_EndTurn()` quando terminar:

```gml
// Step opcional do turno infinito
if (_spawn_restante <= 0 && !instance_exists(obj_bullet_gota)) {
    Battle_EndTurn();
}
```

### 4. Objeto do projétil

Crie `obj_bullet_gota` com:

- sprite: `spr_bullet_gota`;
- parent: `battle_bullet`.

#### Create

```gml
event_inherited();
image_speed = 0.25;
```

#### Step, se quiser destruir fora do quadro

Se você adicionar um Step ao filho, chame o evento herdado para manter a
detecção de colisão:

```gml
event_inherited();

if (y > battle_board.y + battle_board.down + 32) {
    instance_destroy();
}
```

#### User Event 0 — Soul Collision

```gml
/// @description Soul Collision

Player_Hurt(Player_CalculateDamage(4, 1));
Battle_CallSoulEventHurt();
instance_destroy();
```

O `battle_soul` só chama esse evento quando a invencibilidade acabou. A duração
da invencibilidade usa `Player_GetInvTotal()`.

O pai `battle_bullet` também possui **User Event 1 — Turn End**, que destrói o
projétil. Se sobrescrever esse evento, use `event_inherited()` ou destrua a
instância explicitamente.

### 5. Registre o encontro

Em `Encounter_Custom()`:

```gml
function Encounter_Custom() {
    // IDs de encontro devem ser únicos e >= 0.
    #macro ENCOUNTER_SLIME 1

    Encounter_Set(
        ENCOUNTER_SLIME,
        -1,                    // slot 0: vazio
        obj_enemy_slime,       // slot 1: centro
        -1,                    // slot 2: vazio
        "* Slime apareceu!",   // flavor text
        snd_battle_slime,      // BGM
        true,                  // mostrar Flee
        true,                  // pausar BGM do overworld
        false,                 // animação de encontro normal
        48,                    // destino X da alma na animação
        454                    // destino Y da alma na animação
    );
}
```

Assinatura completa:

```gml
Encounter_Set(
    id,
    enemy_0,
    enemy_1,
    enemy_2,
    menu_dialog,
    bgm = -1,
    menu_mercy_flee_enabled = true,
    pause_bgm = true,
    quick = false,
    soul_x = 48,
    soul_y = 454
);
```

Use `-1` para um slot vazio. Cada objeto precisa ter `battle_enemy` como base da
cadeia de herança.

### 6. Inicie a batalha

De um gatilho, NPC ou Room Creation Code:

```gml
Encounter_Start(ENCOUNTER_SLIME);
```

Opções:

```gml
Encounter_Start(
    ENCOUNTER_SLIME,
    true, // anim: mostrar transição
    true  // exclam: mostrar exclamação
);
```

Para um teste direto sem transição:

```gml
Encounter_Start(ENCOUNTER_SLIME, false, false);
```

Ao iniciar fora de uma batalha, a engine guarda a sala atual em
`FLAG_TEMP_BATTLE_ROOM_RETURN`, marca a sala como persistente e volta para ela
depois do resultado.

## Eventos atuais de `battle_enemy`

| User Event | Nome | Uso comum |
|---:|---|---|
| 0 | Init | nome, ações, defesa, HP, posição |
| 1 | Battle Start | efeitos únicos ao começar |
| 2 | Menu Start | preparar cada rodada do menu |
| 3 | Menu Switch | barra de HP, reação a submenus e dano |
| 4 | Menu Choice Switch | reação ao cursor/alvo/ação |
| 5 | Menu End | ACT, morte, spare, resultado da escolha |
| 6 | Dialog Start | preparar falas pós-escolha |
| 7 | Dialog End | final de falas |
| 8 | Turn Preparation Start | criar turno e balão |
| 9 | Turn Preparation End | fim da transformação |
| 10 | Turn Start | ataque começou |
| 11 | Turn End | limpar estado específico |
| 12 | Board Resetting Start | quadro começou a voltar |
| 13 | Board Resetting End | quadro voltou ao padrão |

> [!WARNING]
> A tabela do site antigo começa `MENU_START` no valor 1. A versão atual inseriu
> `BATTLE_START`, deslocando os seguintes. Ao disparar por código, use
> `Battle_CallEnemyEvent(BATTLE_ENEMY_EVENT.MENU_START)`, nunca `event_user(1)`
> fora da implementação do objeto.

## Configurações de `BATTLE_TURN`

### Tempo e alma

| Chave | Significado |
|---|---|
| `TIME` | duração em steps; `-1` para não encerrar pelo cronômetro |
| `SOUL_X`, `SOUL_Y` | posição relativa ao centro do quadro |

### Quadro durante o ataque

- `BOARD_X`, `BOARD_Y`;
- `BOARD_UP`, `BOARD_DOWN`, `BOARD_LEFT`, `BOARD_RIGHT`;
- `BOARD_MOVE_TWEEN`, `BOARD_MOVE_EASE`;
- `BOARD_MOVE_MODE`, `BOARD_MOVE_SPEED`, `BOARD_MOVE_DURATION`;
- `BOARD_SIZE_TWEEN`, `BOARD_SIZE_EASE`;
- `BOARD_SIZE_MODE`, `BOARD_SIZE_SPEED`, `BOARD_SIZE_DURATION`.

### Retorno ao padrão

As versões com prefixo `BOARD_RESET_` controlam o caminho de volta:

- posição e tamanho: `X`, `Y`, `UP`, `DOWN`, `LEFT`, `RIGHT`;
- tween/ease, modo, velocidade e duração para movimento e tamanho.

Modos:

```gml
BATTLE_TURN_BOARD_TRANSFORM_MODE.SPEED
BATTLE_TURN_BOARD_TRANSFORM_MODE.DURATION
```

Exemplo com duração fixa e easing:

```gml
Battle_SetTurnInfo(
    BATTLE_TURN.BOARD_SIZE_MODE,
    BATTLE_TURN_BOARD_TRANSFORM_MODE.DURATION
);
Battle_SetTurnInfo(BATTLE_TURN.BOARD_SIZE_DURATION, 20);
Battle_SetTurnInfo(BATTLE_TURN.BOARD_SIZE_TWEEN, ANIM_TWEEN.CUBIC);
Battle_SetTurnInfo(BATTLE_TURN.BOARD_SIZE_EASE, ANIM_EASE.OUT);
```

## Projéteis dentro e fora do quadro

O `battle_bullet` padrão desenha dentro da surface recortada do quadro. Para um
projétil externo, sobrescreva o Draw e use uma profundidade externa:

```gml
// Create
event_inherited();
depth = DEPTH_BATTLE.BULLET_OUTSIDE_HIGH;
```

```gml
// Draw
draw_self();
```

Profundidades disponíveis:

- `BULLET`: dentro do quadro;
- `BULLET_OUTSIDE_LOW`: fora, abaixo da alma;
- `BULLET_OUTSIDE_HIGH`: fora, acima da alma.

## Tipos de projétil azul e laranja

A base não implementa cor/condição automaticamente. No Step de um filho, faça a
regra antes de chamar a colisão:

```gml
// Exemplo de bala azul: só causa dano se a alma estiver se movendo.
var movendo = (
    floor(battle_soul.x) != floor(battle_soul.xprevious) ||
    floor(battle_soul.y) != floor(battle_soul.yprevious)
);

if (place_meeting(x, y, battle_soul) && movendo) {
    Battle_CallSoulEventBulletCollision();
}
```

Nesse caso, você está substituindo o Step do pai; não chame
`event_inherited()`, pois ele faria uma segunda detecção sem a condição.

## Alma personalizada

Crie um objeto cuja base máxima seja `battle_soul`, implemente movimento e, no
momento apropriado:

```gml
Battle_SetSoul(obj_soul_azul);
```

Se o filho tiver Create/Step, use `event_inherited()` quando quiser manter
profundidade, confinamento ao quadro, invencibilidade e game over. O objeto
`battle_soul_red` é o exemplo de movimento livre.

## Múltiplos inimigos

Para dois inimigos:

```gml
Encounter_Set(
    2,
    obj_enemy_slime,
    -1,
    obj_enemy_morcego,
    "* Uma dupla bloqueou o caminho!",
    snd_battle_dupla
);
```

Cuidados:

- todos recebem os eventos de batalha;
- filtre ACT e dano pelo slot escolhido;
- decida qual inimigo cria `battle_turn`, ou crie um orquestrador único;
- `Battle_GetEnemyNumber()` conta somente instâncias vivas;
- o índice visual do menu não é sempre o slot; converta-o;
- ao remover, salve o slot em variável local antes de `Battle_RemoveEnemy()`.

## Recompensas

```gml
Battle_RewardExp(8);
Battle_RewardGold(6);
```

Essas funções **acumulam** no combate. Chame ao derrotar/poupar, não no Init, se
não quiser que uma fuga conceda recompensa já registrada. Na vitória, a engine
adiciona EXP e GOLD ao jogador e chama `Player_UpdateLv()`.

## Fuga e menu MERCY customizado

- `Battle_SetMenuMercyFleeEnabled(bool)` mostra/oculta Flee durante a batalha.
- `Battle_SetFleeable(bool)` força o resultado do teste de fuga.
- `Battle_SetMenuChoiceMercyOverride(true)` substitui o menu padrão.
- `Battle_SetMenuChoiceMercyOverrideNumber(n)` define o número de entradas.
- `Battle_SetMenuChoiceMercyOverrideName(slot, texto)` define os rótulos.

Se sobrescrever o menu MERCY, trate a escolha no evento Menu End dos inimigos ou
em um controlador próprio.

## Depuração rápida

Durante o desenvolvimento, um Draw GUI temporário pode exibir:

```gml
draw_text(8, 8, "state=" + string(Battle_GetState()));
draw_text(8, 24, "menu=" + string(Battle_GetMenu()));
draw_text(8, 40, "turn=" + string(Battle_GetTurnNumber()));
draw_text(8, 56, "time=" + string(Battle_GetTurnTime()));
```

Remova a sobreposição antes de publicar.

## Checklist do inimigo

- [ ] Objeto é filho de `battle_enemy`.
- [ ] Create chama `event_inherited()`.
- [ ] User Event 0 define nome, número/nome das ações, DEF e centro.
- [ ] `_enemy_slot` nunca é editado.
- [ ] Dano filtra o alvo selecionado.
- [ ] Morte registra recompensas e chama `Battle_RemoveEnemy()`.
- [ ] ACT adiciona diálogo e muda o estado spareable quando apropriado.
- [ ] MERCY remove apenas inimigos spareable.
- [ ] User Event 8 cria exatamente um turno/orquestrador.
- [ ] Turno é filho de `battle_turn` e configura tempo/quadro.
- [ ] Projétil é filho de `battle_bullet` e causa dano no User Event 0.
- [ ] Encontro foi registrado em `Encounter_Custom` com ID único.
- [ ] `Encounter_Start()` retorna corretamente à sala anterior.

Próximo: [Diálogos e localização](/guides/dialogues-text-and-localization).
