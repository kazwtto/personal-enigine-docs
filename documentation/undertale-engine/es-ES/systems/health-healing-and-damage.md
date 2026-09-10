<!-- locale: es-ES; content-id: health-healing-and-damage -->

# Vida, curación y daño

La engine trata la vida del jugador y la vida de los enemigos de formas
diferentes:

| Objetivo | Dónde está la vida | API principal |
|---|---|---|
| jugador | zona estática del `Storage` | funciones `Player_*` |
| enemigo | variable creada en el objeto hijo | lógica del propio enemigo |

Esta diferencia es intencional. El jugador necesita mantener el HP entre salas y
guardados; cada enemigo puede tener reglas de vida y derrota completamente
diferentes.

## HP del jugador

### Consultar

```gml
var hp = Player_GetHp();
var hp_max = Player_GetHpMax();
```

- [`Player_GetHp()`](/reference/player-gethp) devuelve el valor actual;
- [`Player_GetHpMax()`](/reference/player-gethpmax) devuelve el límite actual.

### Definir directamente

```gml
Player_SetHpMax(24);
Player_SetHp(24);
```

> [!WARNING]
> `Player_SetHp()` no aplica límites. Es posible definir HP negativo o mayor que
> el máximo. Usa esta llamada para inicialización y restauración controlada;
> para gameplay, prefiere `Player_Heal()` y `Player_Hurt()`.

### Curar con límite

```gml
var hp_after = Player_Heal(6);
show_debug_message(hp_after);
```

[`Player_Heal()`](/reference/player-heal) nunca supera `Player_GetHpMax()`. Pasar
un valor negativo reenvía la operación a `Player_Hurt()`.

### Causar daño con límite

```gml
var hp_after = Player_Hurt(4);

if (hp_after <= 0) {
    show_debug_message("El jugador fue derrotado");
}
```

[`Player_Hurt()`](/reference/player-hurt) no permite HP por debajo de cero. Pasar
daño negativo lo reenvía a curación.

## Calcular daño recibido

Usa [`Player_CalculateDamage()`](/reference/player-calculatedamage) antes de
`Player_Hurt()` cuando el valor todavía necesita considerar DEF y límites:

```gml
var raw_damage = 8;
var final_damage = Player_CalculateDamage(raw_damage, 1, 99);
Player_Hurt(final_damage);
```

Parámetros:

1. daño base;
2. daño mínimo, por defecto `0`;
3. daño máximo, por defecto `infinity`.

El cálculo usa la defensa total del jugador y los ajustes definidos por la
engine.

## Atributos que participan en el combate

| Base | Equipamiento | Total |
|---|---|---|
| `Player_GetAtk()` | `Player_GetAtkItem()` | `Player_GetAtkTotal()` |
| `Player_GetDef()` | `Player_GetDefItem()` | `Player_GetDefTotal()` |
| `Player_GetSpd()` | `Player_GetSpdItem()` | `Player_GetSpdTotal()` |
| `Player_GetInv()` | `Player_GetInvItem()` | `Player_GetInvTotal()` |

En la batalla también existen bonificaciones temporales:

```gml
Battle_SetPlayerTempAtk(2);
Battle_SetPlayerTempDef(1);
Battle_SetPlayerTempSpd(0.5);
Battle_SetPlayerTempInv(10);
```

Estas bonificaciones pertenecen a la batalla actual y no sustituyen los atributos
persistentes del jugador.

## Daño causado al enemigo

La interfaz FIGHT calcula un valor y lo pone a disposición mediante
[`Battle_GetMenuFightDamage()`](/reference/battle-getmenufightdamage). La engine
no sabe qué variable de tu enemigo representa la vida; el objeto necesita aplicar
el valor.

```gml
// User Event 5 del enemigo — Menu End
if (Battle_GetMenuChoiceButton() == BATTLE_MENU.FIGHT) {
    var damage = max(0, Battle_GetMenuFightDamage());
    hp = max(0, hp - damage);
}
```

En el Create Event del enemigo:

```gml
hp_max = 40;
hp = hp_max;
```

## Defensa del enemigo

En el Init del enemigo:

```gml
Battle_SetEnemyDEF(_enemy_slot, 3);
```

La mira por defecto consulta esa DEF al calcular FIGHT. Alterarla durante la
batalla permite armaduras rompibles o fases:

```gml
if (hp <= hp_max * 0.5) {
    Battle_SetEnemyDEF(_enemy_slot, 0);
}
```

## Derrota del enemigo

Define una función local para mantener la resolución en un solo lugar:

```gml
function Defeat() {
    Battle_RewardExp(12);
    Battle_RewardGold(8);

    var slot = _enemy_slot;
    instance_destroy();
    Battle_RemoveEnemy(slot);
}
```

Cuando `hp <= 0`, llama a `Defeat()` una única vez.

## Perdonar no es causar daño

Un enemigo perdonable usa otra condición:

```gml
if (act_talked && !angry) {
    Battle_SetEnemySpareable(_enemy_slot, true);
}
```

Puedes conceder GOLD, alterar el plot o eliminar al enemigo sin aplicar FIGHT.
La regla pertenece al enemigo y debe procesarse en el evento de menú apropiado.

## Daño de proyectiles

En el User Event 0 del proyectil:

```gml
var final_damage = Player_CalculateDamage(damage, 1);
Player_Hurt(final_damage);
Battle_CallSoulEventHurt();
```

`Battle_CallSoulEventHurt()` se encarga de la reacción visual y del período de
invencibilidad. La reducción de HP sigue siendo responsabilidad del proyectil
personalizado.

## Curación por ítem

Dentro del `OnUse()` de un `ItemType`:

```gml
function OnUse(inventory, index) {
    var before = Player_GetHp();
    var after = Player_Heal(10);

    Dialog_Add(Item_GetTextHeal(after - before));
    Dialog_Start();
    inventory.Remove(index);
}
```

Calcular `after - before` muestra la curación real cuando el jugador ya estaba
cerca del HP máximo.

## Checklist de vida y daño

- [ ] El HP inicial y máximo del jugador se definen en `Player_CustomInitialData()`.
- [ ] El gameplay usa `Player_Heal()` y `Player_Hurt()` para respetar los límites.
- [ ] El daño bruto pasa por `Player_CalculateDamage()` cuando necesita considerar DEF.
- [ ] Cada enemigo crea y controla su propio `hp`.
- [ ] FIGHT se aplica en el User Event 5 del enemigo.
- [ ] La derrota concede recompensas y limpia instancia y slot.
- [ ] Los proyectiles reducen HP y luego llaman al evento Hurt del alma.
