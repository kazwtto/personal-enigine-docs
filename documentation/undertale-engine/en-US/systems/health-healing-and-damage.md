<!-- locale: en-US; content-id: health-healing-and-damage -->

# Health, healing and damage

The engine handles the player's health and enemy health differently:

| Target | Where health lives | Main API |
|---|---|---|
| player | static zone of the `Storage` | `Player_*` functions |
| enemy | variable created in the child object | the enemy's own logic |

This difference is intentional. The player needs to keep HP between rooms and
saves; each enemy can have completely different health and defeat rules.

## Player HP

### Query

```gml
var hp = Player_GetHp();
var hp_max = Player_GetHpMax();
```

- [`Player_GetHp()`](/reference/player-gethp) returns the current value;
- [`Player_GetHpMax()`](/reference/player-gethpmax) returns the current limit.

### Set directly

```gml
Player_SetHpMax(24);
Player_SetHp(24);
```

> [!WARNING]
> `Player_SetHp()` does not apply limits. You can set negative HP or HP higher
> than the maximum. Use this call for initialization and controlled
> restoration; for gameplay, prefer `Player_Heal()` and `Player_Hurt()`.

### Heal with limit

```gml
var hp_after = Player_Heal(6);
show_debug_message(hp_after);
```

[`Player_Heal()`](/reference/player-heal) never exceeds
`Player_GetHpMax()`. Passing a negative value forwards the operation to
`Player_Hurt()`.

### Deal damage with limit

```gml
var hp_after = Player_Hurt(4);

if (hp_after <= 0) {
    show_debug_message("The player was defeated");
}
```

[`Player_Hurt()`](/reference/player-hurt) does not allow HP below zero. Passing
negative damage forwards to healing.

## Calculate incoming damage

Use [`Player_CalculateDamage()`](/reference/player-calculatedamage) before
`Player_Hurt()` when the value still needs to consider DEF and limits:

```gml
var raw_damage = 8;
var final_damage = Player_CalculateDamage(raw_damage, 1, 99);
Player_Hurt(final_damage);
```

Parameters:

1. base damage;
2. minimum damage, default `0`;
3. maximum damage, default `infinity`.

The calculation uses the player's total defense and adjustments defined by the
engine.

## Stats that take part in combat

| Base | Equipment | Total |
|---|---|---|
| `Player_GetAtk()` | `Player_GetAtkItem()` | `Player_GetAtkTotal()` |
| `Player_GetDef()` | `Player_GetDefItem()` | `Player_GetDefTotal()` |
| `Player_GetSpd()` | `Player_GetSpdItem()` | `Player_GetSpdTotal()` |
| `Player_GetInv()` | `Player_GetInvItem()` | `Player_GetInvTotal()` |

In battle there are also temporary bonuses:

```gml
Battle_SetPlayerTempAtk(2);
Battle_SetPlayerTempDef(1);
Battle_SetPlayerTempSpd(0.5);
Battle_SetPlayerTempInv(10);
```

These bonuses belong to the current battle and do not override the player's
persistent stats.

## Damage dealt to the enemy

The FIGHT UI calculates a value and makes it available through
[`Battle_GetMenuFightDamage()`](/reference/battle-getmenufightdamage). The engine
does not know which of your enemy's variables represents health; the object
needs to apply the value.

```gml
// Enemy's User Event 5 — Menu End
if (Battle_GetMenuChoiceButton() == BATTLE_MENU.FIGHT) {
    var damage = max(0, Battle_GetMenuFightDamage());
    hp = max(0, hp - damage);
}
```

In the enemy's Create Event:

```gml
hp_max = 40;
hp = hp_max;
```

## Enemy defense

In the enemy's Init:

```gml
Battle_SetEnemyDEF(_enemy_slot, 3);
```

The default aiming checks this DEF when calculating FIGHT. Changing it during
the battle allows breakable armor or phases:

```gml
if (hp <= hp_max * 0.5) {
    Battle_SetEnemyDEF(_enemy_slot, 0);
}
```

## Enemy defeat

Define a local function to keep the resolution in one place:

```gml
function Defeat() {
    Battle_RewardExp(12);
    Battle_RewardGold(8);

    var slot = _enemy_slot;
    instance_destroy();
    Battle_RemoveEnemy(slot);
}
```

When `hp <= 0`, call `Defeat()` a single time.

## Sparing is not dealing damage

A spareable enemy uses another condition:

```gml
if (act_talked && !angry) {
    Battle_SetEnemySpareable(_enemy_slot, true);
}
```

You can grant GOLD, change the plot or remove the enemy without applying FIGHT.
The rule belongs to the enemy and must be processed in the appropriate menu
event.

## Projectile damage

In the projectile's User Event 0:

```gml
var final_damage = Player_CalculateDamage(damage, 1);
Player_Hurt(final_damage);
Battle_CallSoulEventHurt();
```

`Battle_CallSoulEventHurt()` takes care of the visual reaction and the
invincibility period. Reducing HP remains the custom projectile's
responsibility.

## Item healing

Inside the `OnUse()` of an `ItemType`:

```gml
function OnUse(inventory, index) {
    var before = Player_GetHp();
    var after = Player_Heal(10);

    Dialog_Add(Item_GetTextHeal(after - before));
    Dialog_Start();
    inventory.Remove(index);
}
```

Calculating `after - before` shows the real healing when the player was already
close to max HP.

## Health and damage checklist

- [ ] The player's initial and max HP are set in `Player_CustomInitialData()`.
- [ ] Gameplay uses `Player_Heal()` and `Player_Hurt()` to respect limits.
- [ ] Raw damage goes through `Player_CalculateDamage()` when DEF must be considered.
- [ ] Each enemy creates and controls its own `hp`.
- [ ] FIGHT is applied in the enemy's User Event 5.
- [ ] Defeat grants rewards and clears instance and slot.
- [ ] Projectiles reduce HP and then call the soul's Hurt event.
