<!-- locale: pt-BR; content-id: health-healing-and-damage -->

# Vida, cura e dano

A engine trata a vida do jogador e a vida dos inimigos de formas diferentes:

| Alvo | Onde fica a vida | API principal |
|---|---|---|
| jogador | zona estática do `Storage` | funções `Player_*` |
| inimigo | variável criada no objeto filho | lógica do próprio inimigo |

Essa diferença é intencional. O jogador precisa manter HP entre salas e saves;
cada inimigo pode ter regras de vida e derrota completamente diferentes.

## HP do jogador

### Consultar

```gml
var hp = Player_GetHp();
var hp_max = Player_GetHpMax();
```

- [`Player_GetHp()`](/reference/player-gethp) devolve o valor atual;
- [`Player_GetHpMax()`](/reference/player-gethpmax) devolve o limite atual.

### Definir diretamente

```gml
Player_SetHpMax(24);
Player_SetHp(24);
```

> [!WARNING]
> `Player_SetHp()` não aplica limites. É possível definir HP negativo ou maior
> que o máximo. Use essa chamada para inicialização e restauração controlada;
> para gameplay, prefira `Player_Heal()` e `Player_Hurt()`.

### Curar com limite

```gml
var hp_after = Player_Heal(6);
show_debug_message(hp_after);
```

[`Player_Heal()`](/reference/player-heal) nunca ultrapassa
`Player_GetHpMax()`. Passar um valor negativo encaminha a operação para
`Player_Hurt()`.

### Causar dano com limite

```gml
var hp_after = Player_Hurt(4);

if (hp_after <= 0) {
    show_debug_message("O jogador foi derrotado");
}
```

[`Player_Hurt()`](/reference/player-hurt) não permite HP abaixo de zero. Passar
dano negativo encaminha para cura.

## Calcular dano recebido

Use [`Player_CalculateDamage()`](/reference/player-calculatedamage) antes de
`Player_Hurt()` quando o valor ainda precisa considerar DEF e limites:

```gml
var raw_damage = 8;
var final_damage = Player_CalculateDamage(raw_damage, 1, 99);
Player_Hurt(final_damage);
```

Parâmetros:

1. dano base;
2. dano mínimo, padrão `0`;
3. dano máximo, padrão `infinity`.

O cálculo usa a defesa total do jogador e ajustes definidos pela engine.

## Atributos que participam do combate

| Base | Equipamento | Total |
|---|---|---|
| `Player_GetAtk()` | `Player_GetAtkItem()` | `Player_GetAtkTotal()` |
| `Player_GetDef()` | `Player_GetDefItem()` | `Player_GetDefTotal()` |
| `Player_GetSpd()` | `Player_GetSpdItem()` | `Player_GetSpdTotal()` |
| `Player_GetInv()` | `Player_GetInvItem()` | `Player_GetInvTotal()` |

Na batalha ainda existem bônus temporários:

```gml
Battle_SetPlayerTempAtk(2);
Battle_SetPlayerTempDef(1);
Battle_SetPlayerTempSpd(0.5);
Battle_SetPlayerTempInv(10);
```

Esses bônus pertencem à batalha atual e não substituem os atributos persistentes
do jogador.

## Dano causado ao inimigo

A interface FIGHT calcula um valor e o disponibiliza por
[`Battle_GetMenuFightDamage()`](/reference/battle-getmenufightdamage). A engine
não sabe qual variável do seu inimigo representa vida; o objeto precisa aplicar
o valor.

```gml
// User Event 5 do inimigo — Menu End
if (Battle_GetMenuChoiceButton() == BATTLE_MENU.FIGHT) {
    var damage = max(0, Battle_GetMenuFightDamage());
    hp = max(0, hp - damage);
}
```

No Create Event do inimigo:

```gml
hp_max = 40;
hp = hp_max;
```

## Defesa do inimigo

No Init do inimigo:

```gml
Battle_SetEnemyDEF(_enemy_slot, 3);
```

A mira padrão consulta essa DEF ao calcular FIGHT. Alterá-la durante a batalha
permite armaduras quebráveis ou fases:

```gml
if (hp <= hp_max * 0.5) {
    Battle_SetEnemyDEF(_enemy_slot, 0);
}
```

## Derrota do inimigo

Defina uma função local para manter a resolução em um só lugar:

```gml
function Defeat() {
    Battle_RewardExp(12);
    Battle_RewardGold(8);

    var slot = _enemy_slot;
    instance_destroy();
    Battle_RemoveEnemy(slot);
}
```

Quando `hp <= 0`, chame `Defeat()` uma única vez.

## Poupar não é causar dano

Um inimigo poupável usa outra condição:

```gml
if (act_talked && !angry) {
    Battle_SetEnemySpareable(_enemy_slot, true);
}
```

Você pode conceder GOLD, alterar plot ou remover o inimigo sem aplicar FIGHT.
A regra pertence ao inimigo e deve ser processada no evento de menu apropriado.

## Dano de projéteis

No User Event 0 do projétil:

```gml
var final_damage = Player_CalculateDamage(damage, 1);
Player_Hurt(final_damage);
Battle_CallSoulEventHurt();
```

`Battle_CallSoulEventHurt()` cuida da reação visual e do período de
invencibilidade. A redução de HP continua sendo responsabilidade do projétil
personalizado.

## Cura por item

Dentro do `OnUse()` de um `ItemType`:

```gml
function OnUse(inventory, index) {
    var before = Player_GetHp();
    var after = Player_Heal(10);

    Dialog_Add(Item_GetTextHeal(after - before));
    Dialog_Start();
    inventory.Remove(index);
}
```

Calcular `after - before` mostra a cura real quando o jogador já estava próximo
do HP máximo.

## Checklist de vida e dano

- [ ] HP inicial e máximo do jogador são definidos em `Player_CustomInitialData()`.
- [ ] Gameplay usa `Player_Heal()` e `Player_Hurt()` para respeitar limites.
- [ ] Dano bruto passa por `Player_CalculateDamage()` quando precisa considerar DEF.
- [ ] Cada inimigo cria e controla seu próprio `hp`.
- [ ] FIGHT é aplicado no User Event 5 do inimigo.
- [ ] A derrota concede recompensas e limpa instância e slot.
- [ ] Projéteis reduzem HP e depois chamam o evento Hurt da alma.
