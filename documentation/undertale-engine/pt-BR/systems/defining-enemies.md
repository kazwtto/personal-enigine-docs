<!-- locale: pt-BR; content-id: defining-enemies -->

# Definir inimigos

Um inimigo completo não é apenas um sprite colocado na batalha. Ele reúne um
objeto filho de `battle_enemy`, estado próprio, configuração de menu, respostas
aos eventos da engine e um encontro que o instancia.

> [!NOTE]
> A engine não fornece uma variável universal de vida para inimigos. Cada
> objeto de inimigo controla seu próprio `hp`, aplica o dano de FIGHT e decide
> quando deve ser removido, poupado ou derrotado.

## Visão rápida

| Parte | Responsabilidade |
|---|---|
| objeto filho de `battle_enemy` | estado e comportamento do inimigo |
| User Event 0 — Init | nome, DEF, centro visual e ACTs |
| User Event 1 — Battle Start | texto ou estado inicial da luta |
| User Event 5 — Menu End | processar FIGHT, ACT, ITEM e MERCY |
| User Events 8–11 | preparar, iniciar e finalizar o turno defensivo |
| `Encounter_Set()` | registrar a formação e a música |
| objeto filho de `battle_turn` | criar o padrão de ataque |

## 1. Criar o objeto-base

Crie um objeto, por exemplo `obj_enemy_training`, e defina `battle_enemy` como
pai. O objeto-base é propositalmente vazio: a engine envia eventos, mas o filho
decide o que cada evento significa.

No **Create Event**, inicialize apenas o estado que pertence ao inimigo:

```gml
event_inherited();

hp_max = 30;
hp = hp_max;
angry = false;
act_talked = false;
```

`event_inherited()` preserva qualquer inicialização adicionada ao objeto-base.
Não grave o slot manualmente: `Battle_SetEnemy()` define `_enemy_slot` antes de
disparar o evento Init.

## 2. Configurar nome, defesa e ACTs

O enum `BATTLE_ENEMY_EVENT` corresponde, na mesma ordem, aos User Events do
objeto. O User Event 0 recebe `BATTLE_ENEMY_EVENT.INIT`.

```gml
// User Event 0 — Init
Battle_SetEnemyName(_enemy_slot, "TRAINING DUMMY");
Battle_SetEnemyDEF(_enemy_slot, 2);
Battle_SetEnemyCenterPos(_enemy_slot, x, y - 48);

Battle_SetEnemyActionNumber(_enemy_slot, 2);
Battle_SetEnemyActionName(_enemy_slot, 0, "Check");
Battle_SetEnemyActionName(_enemy_slot, 1, "Talk");
```

Funções desta etapa:

- [`Battle_SetEnemy()`](/reference/battle-setenemy) coloca o objeto em um slot;
- [`Battle_SetEnemyName()`](/reference/battle-setenemyname) define o rótulo;
- [`Battle_SetEnemyDEF()`](/reference/battle-setenemydef) configura a defesa;
- [`Battle_SetEnemyCenterPos()`](/reference/battle-setenemycenterpos) alinha efeitos;
- [`Battle_SetEnemyActionNumber()`](/reference/battle-setenemyactionnumber) cria as entradas ACT;
- [`Battle_SetEnemyActionName()`](/reference/battle-setenemyactionname) nomeia cada ACT.

## 3. Entender todos os eventos

| User Event | Enum | Momento |
|---:|---|---|
| 0 | `INIT` | depois que o inimigo entra no slot |
| 1 | `BATTLE_START` | começo efetivo da batalha |
| 2 | `MENU_START` | volta ao menu principal |
| 3 | `MENU_SWITCH` | troca de submenu |
| 4 | `MENU_CHOICE_SWITCH` | cursor muda de escolha |
| 5 | `MENU_END` | uma escolha foi confirmada |
| 6 | `DIALOG_START` | começa o diálogo antes do turno |
| 7 | `DIALOG_END` | termina o diálogo |
| 8 | `TURN_PREPARATION_START` | configura o próximo turno |
| 9 | `TURN_PREPARATION_END` | preparação concluída |
| 10 | `TURN_START` | quadro e alma estão prontos |
| 11 | `TURN_END` | padrão defensivo terminou |
| 12 | `BOARD_RESETTING_START` | quadro começa a voltar ao padrão |
| 13 | `BOARD_RESETTING_END` | quadro terminou de voltar |

Você não precisa implementar todos. Use somente os eventos em que o inimigo
precisa reagir.

## 4. Processar FIGHT e a vida do inimigo

No User Event 5, descubra qual botão foi usado. Quando for FIGHT, leia o dano
calculado pela interface e aplique ao `hp` do próprio inimigo.

```gml
// User Event 5 — Menu End
var button = Battle_GetMenuChoiceButton();

if (button == BATTLE_MENU.FIGHT) {
    var damage = max(0, Battle_GetMenuFightDamage());
    hp = max(0, hp - damage);

    if (hp <= 0) {
        Battle_RewardExp(10);
        Battle_RewardGold(6);
        instance_destroy();
        Battle_RemoveEnemy(_enemy_slot);
    }
}
```

> [!WARNING]
> `Battle_RemoveEnemy()` limpa o slot, mas não destrói a instância. Quando o
> inimigo for derrotado, cuide das duas ações na ordem apropriada para seu
> objeto.

Chamadas relacionadas:

- [`Battle_GetMenuChoiceButton()`](/reference/battle-getmenuchoicebutton);
- [`Battle_GetMenuFightDamage()`](/reference/battle-getmenufightdamage);
- [`Battle_RewardExp()`](/reference/battle-rewardexp);
- [`Battle_RewardGold()`](/reference/battle-rewardgold);
- [`Battle_RemoveEnemy()`](/reference/battle-removeenemy).

## 5. Implementar ACT

Ainda no User Event 5, verifique o índice escolhido em ACT. O índice começa em
zero e acompanha os nomes registrados no Init.

```gml
if (button == BATTLE_MENU.ACT) {
    switch (Battle_GetMenuChoiceAction()) {
        case 0: // Check
            Battle_SetDialog("* TRAINING DUMMY - ATK 0 DEF 2&* It waits patiently.");
            break;

        case 1: // Talk
            act_talked = true;
            Battle_SetEnemySpareable(_enemy_slot, true);
            Battle_SetDialog("* You explain that this is only practice.");
            break;
    }
}
```

`Battle_SetEnemySpareable()` controla o estado amarelo e permite que SPARE
resolva o inimigo. A condição de poupar continua sendo decisão do objeto.

## 6. Configurar o turno defensivo

O User Event 8 é um bom local para definir o controlador do padrão, o tempo e o
tamanho do quadro.

```gml
// User Event 8 — Turn Preparation Start
instance_create_depth(0, 0, 0, obj_turn_training);
Battle_SetTurnInfo(BATTLE_TURN.TIME, 150);
Battle_SetTurnInfo(BATTLE_TURN.BOARD_UP, 65);
Battle_SetTurnInfo(BATTLE_TURN.BOARD_DOWN, 65);
Battle_SetTurnInfo(BATTLE_TURN.BOARD_LEFT, 110);
Battle_SetTurnInfo(BATTLE_TURN.BOARD_RIGHT, 110);
```

O objeto `obj_turn_training` deve ser filho de `battle_turn`. A criação dos
projéteis pertence a ele, não ao inimigo. Veja [Padrões de bala](/systems/bullet-patterns).

## 7. Registrar o encontro

Em `Encounter_Custom()`, registre uma formação que use o objeto criado:

```gml
#macro ENCOUNTER_TRAINING 100

Encounter_Set(
    ENCOUNTER_TRAINING,
    obj_enemy_training,
    noone,
    noone,
    "* The training begins.",
    snd_battle,
    true
);
```

Inicie a batalha no overworld:

```gml
Encounter_Start(ENCOUNTER_TRAINING);
```

## 8. Separar responsabilidades

Evite um único User Event com centenas de linhas. Extraia decisões para funções
do próprio objeto:

```gml
function ReceiveFightDamage() {
    var damage = max(0, Battle_GetMenuFightDamage());
    hp = max(0, hp - damage);
    return hp <= 0;
}

function ChooseTurn() {
    return angry ? obj_turn_training_fast : obj_turn_training;
}
```

Assim, o User Event apenas lê a escolha e encaminha para a função correta.

## Checklist do inimigo

- [ ] O objeto é filho de `battle_enemy`.
- [ ] O Create Event chama `event_inherited()`.
- [ ] O User Event 0 define nome, DEF, centro e ACTs.
- [ ] O objeto mantém sua própria variável de vida.
- [ ] O User Event 5 aplica FIGHT e resolve ACT/MERCY.
- [ ] Derrota e poupança limpam o slot corretamente.
- [ ] O User Event 8 escolhe um objeto filho de `battle_turn`.
- [ ] O encontro está registrado em `Encounter_Custom()`.
