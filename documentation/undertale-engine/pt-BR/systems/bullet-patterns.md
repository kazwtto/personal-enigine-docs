<!-- locale: pt-BR; content-id: bullet-patterns -->

# Padrões de bala

Um padrão de ataque é formado por duas camadas independentes:

1. um objeto filho de `battle_turn`, que controla o tempo e cria ondas;
2. um ou mais objetos filhos de `battle_bullet`, que se movem, desenham e
   reagem à colisão com a alma.

Separar essas camadas permite reutilizar a mesma bala em vários padrões e evita
que o inimigo acumule lógica de movimento de projéteis.

## Fluxo de um turno

```text
inimigo configura BATTLE_TURN
        ↓
battle cria o objeto battle_turn
        ↓
turno cria instâncias battle_bullet
        ↓
alma e bala trocam eventos de colisão
        ↓
Battle_EndTurn remove turno e projéteis
```

## 1. Criar o projétil

Crie `obj_bullet_training` como filho de `battle_bullet`.

No Create Event:

```gml
event_inherited();

move_speed = 3;
move_direction = 180;
damage = 4;
```

No Step Event, implemente o movimento. Este exemplo segue direção e velocidade
em graus:

```gml
x += lengthdir_x(move_speed, move_direction);
y += lengthdir_y(move_speed, move_direction);

if (x < -64 || x > 704 || y < -64 || y > 544) {
    instance_destroy();
}
```

> [!NOTE]
> A classe-base define a profundidade, mas não aplica dano automaticamente. O
> projétil filho decide quanto dano causar no User Event 0.

## 2. Aplicar dano na colisão

O User Event 0 de `battle_bullet` corresponde a
`BATTLE_BULLET_EVENT.SOUL_COLLISION`.

```gml
// User Event 0 — Soul Collision
var final_damage = Player_CalculateDamage(damage, 1);
Player_Hurt(final_damage);

// Som, tremor e tempo de invencibilidade da alma.
Battle_CallSoulEventHurt();
```

A alma só encaminha colisões quando sua invencibilidade está em zero. O evento
Hurt da alma repõe esse temporizador usando `Player_GetInvTotal()`.

Funções relacionadas:

- [`Battle_CallSoulEventHurt()`](/reference/battle-callsouleventhurt);
- [`Battle_CallBulletEventSoulCollision()`](/reference/battle-callbulleteventsoulcollision);
- [`Battle_CallSoulEventBulletCollision()`](/reference/battle-callsouleventbulletcollision);
- [`Player_CalculateDamage()`](/reference/player-calculatedamage);
- [`Player_Hurt()`](/reference/player-hurt).

## 3. Limpar a bala ao fim do turno

O User Event 1 corresponde a `BATTLE_BULLET_EVENT.TURN_END`. O objeto-base já
executa `instance_destroy()` nesse evento.

Se você sobrescrever o User Event 1, mantenha a limpeza:

```gml
// User Event 1 — Turn End
event_inherited();
```

Use lógica adicional antes ou depois da herança apenas quando necessário.

## 4. Criar o controlador do padrão

Crie `obj_turn_training` como filho de `battle_turn`. Os User Events disponíveis
são:

| User Event | Enum | Uso comum |
|---:|---|---|
| 0 | `TURN_PREPARATION_START` | preparar estado antes do quadro |
| 1 | `TURN_PREPARATION_END` | reagir ao fim da preparação |
| 2 | `TURN_START` | criar a primeira onda |
| 3 | `TURN_END` | limpar estado próprio |

No Create Event:

```gml
event_inherited();

wave_timer = 0;
wave_interval = 20;
wave_index = 0;
```

No User Event 2:

```gml
// User Event 2 — Turn Start
wave_timer = 0;
wave_index = 0;
```

No Step Event, crie ondas enquanto o turno estiver ativo:

```gml
wave_timer -= 1;

if (wave_timer <= 0) {
    wave_timer = wave_interval;
    wave_index += 1;

    var bullet = instance_create_depth(
        battle_board.x + Battle_GetTurnInfo(BATTLE_TURN.BOARD_RIGHT),
        battle_board.y + irandom_range(-48, 48),
        DEPTH_BATTLE.BULLET,
        obj_bullet_training
    );

    bullet.move_direction = 180;
}
```

## 5. Ligar o padrão ao inimigo

No User Event 8 do inimigo:

```gml
instance_create_depth(0, 0, 0, obj_turn_training);
Battle_SetTurnInfo(BATTLE_TURN.TIME, 150);
Battle_SetTurnInfo(BATTLE_TURN.SOUL_X, 0);
Battle_SetTurnInfo(BATTLE_TURN.SOUL_Y, 0);
```

`BATTLE_TURN.TIME` usa frames. Em um projeto a 30 FPS, `150` representa cinco
segundos.

## 6. Definir o quadro de batalha

As extensões são distâncias a partir do centro, não largura e altura finais:

```gml
Battle_SetTurnInfo(BATTLE_TURN.BOARD_X, 320);
Battle_SetTurnInfo(BATTLE_TURN.BOARD_Y, 320);
Battle_SetTurnInfo(BATTLE_TURN.BOARD_LEFT, 120);
Battle_SetTurnInfo(BATTLE_TURN.BOARD_RIGHT, 120);
Battle_SetTurnInfo(BATTLE_TURN.BOARD_UP, 70);
Battle_SetTurnInfo(BATTLE_TURN.BOARD_DOWN, 70);
```

Você também pode controlar velocidade, duração, tween e ease da transformação
com as outras chaves do enum `BATTLE_TURN`.

## 7. Padrão radial

```gml
// Dentro do controlador de turno
for (var angle = 0; angle < 360; angle += 30) {
    var bullet = instance_create_depth(
        battle_board.x,
        battle_board.y,
        DEPTH_BATTLE.BULLET,
        obj_bullet_training
    );
    bullet.move_direction = angle;
    bullet.move_speed = 2;
}
```

## 8. Padrão alternado por rodada

```gml
var round = Battle_GetTurnNumber();

if (round mod 2 == 0) {
    SpawnWaveFromLeft();
} else {
    SpawnWaveFromRight();
}
```

Use [`Battle_GetTurnNumber()`](/reference/battle-getturnnumber) para aumentar a
dificuldade ou alternar padrões sem armazenar outro contador global.

## 9. Encerrar antes do tempo

Um controlador pode finalizar o turno quando seu objetivo termina:

```gml
if (instance_number(obj_bullet_training) == 0 && wave_index >= 5) {
    Battle_EndTurn();
}
```

Não chame `Battle_EndTurn()` a cada Step. Garanta que a condição só seja
verdadeira quando o padrão realmente acabou.

## Checklist do padrão

- [ ] O controlador é filho de `battle_turn`.
- [ ] Cada projétil é filho de `battle_bullet`.
- [ ] O projétil aplica dano no User Event 0.
- [ ] `Battle_CallSoulEventHurt()` é chamado depois do dano.
- [ ] Balas fora da tela são destruídas.
- [ ] O User Event 1 preserva a limpeza herdada.
- [ ] O inimigo configura objeto, tempo e quadro com `Battle_SetTurnInfo()`.
- [ ] O padrão termina por tempo ou com uma única chamada segura a `Battle_EndTurn()`.
