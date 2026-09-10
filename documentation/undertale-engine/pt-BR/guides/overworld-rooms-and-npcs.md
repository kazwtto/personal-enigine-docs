<!-- locale: pt-BR; content-id: overworld-rooms-and-npcs -->

# Overworld, salas e NPCs

## Como a interação funciona

`char_player` é filho de `char`. Ao confirmar, ele testa uma pequena área na
direção em que está olhando, procura uma instância de `char` e chama o **User
Event 0** dela. O objeto-base `char` também:

- herda a colisão de `block`;
- mantém `dir`, `move`, `move_speed` e `talking`;
- escolhe sprites de parado, movimento e fala por direção;
- vira para o jogador ao interagir, salvo quando `dir_locked = true`;
- ordena a profundidade usando a posição vertical.

Essa é a base tanto de NPCs quanto de placas, saves e caixas.

## Criar um NPC completo

### 1. Prepare os sprites

Crie os sprites necessários, de preferência com:

- origem em **bottom-center** (centro inferior, nos pés);
- máscara de colisão pequena, cobrindo principalmente os pés/corpo;
- quadros consistentes entre as quatro direções;
- nomes claros, como `spr_npc_maya_down`, `spr_npc_maya_up` e
  `spr_npc_maya_right`.

Se usar o mesmo sprite para esquerda e direita, a engine pode espelhá-lo.

### 2. Crie o objeto

Crie `obj_npc_maya` e defina **Parent = `char`**.

No evento **Create**:

```gml
event_inherited();

// Deve ser único entre personagens usados por comandos de diálogo.
char_id = 10;
dir = DIR.DOWN;

// Parado.
res_idle_sprite[DIR.UP]    = spr_npc_maya_up;
res_idle_sprite[DIR.DOWN]  = spr_npc_maya_down;
res_idle_sprite[DIR.LEFT]  = spr_npc_maya_right;
res_idle_sprite[DIR.RIGHT] = spr_npc_maya_right;

// Andando.
res_move_sprite[DIR.UP]    = spr_npc_maya_up;
res_move_sprite[DIR.DOWN]  = spr_npc_maya_down;
res_move_sprite[DIR.LEFT]  = spr_npc_maya_right;
res_move_sprite[DIR.RIGHT] = spr_npc_maya_right;

// Ajuste os quadros e a velocidade ao seu sprite.
res_idle_image[DIR.UP] = 0;
res_idle_image[DIR.DOWN] = 0;
res_idle_image[DIR.LEFT] = 0;
res_idle_image[DIR.RIGHT] = 0;

res_move_image[DIR.UP] = 1;
res_move_image[DIR.DOWN] = 1;
res_move_image[DIR.LEFT] = 1;
res_move_image[DIR.RIGHT] = 1;

res_move_speed[DIR.UP] = 1 / 3;
res_move_speed[DIR.DOWN] = 1 / 3;
res_move_speed[DIR.LEFT] = 1 / 3;
res_move_speed[DIR.RIGHT] = 1 / 3;

// O sprite de esquerda reutiliza o da direita e é espelhado.
res_idle_flip_x[DIR.LEFT] = true;
res_move_flip_x[DIR.LEFT] = true;
```

O `event_inherited()` é obrigatório aqui. Sem ele, as estruturas de movimento,
colisão e sprites do pai não serão inicializadas.

### 3. Implemente a conversa

Adicione **User Event 0** (Interact):

```gml
event_inherited(); // faz o NPC olhar para o jogador

Dialog_Add("{char_link 10}* Olá!&* Eu sou Maya.{pause}{char_unlink}");
Dialog_Add("* Esta é uma segunda caixa de diálogo.");
Dialog_Start();
```

`Dialog_Add()` coloca caixas na fila. `Dialog_Start()` abre `ui_dialog` se ainda
não houver um. `{char_link 10}` sincroniza `talking` com a digitação, permitindo
ao objeto usar seus sprites de fala.

### 4. Coloque na sala

Arraste `obj_npc_maya` para a sala. Verifique:

- a instância está na camada correta;
- a origem visual fica nos pés;
- a máscara não bloqueia o jogador de muito longe;
- o NPC está dentro dos limites da câmera;
- o jogador consegue ficar diante dele e confirmar.

## NPC com diálogo que muda

### Mudança que volta ao carregar o save

Use a área estática. Ela só vai ao disco em `Storage_SaveGame()`:

```gml
event_inherited();

var data = Storage_GetStaticGeneral();
var vezes = data.Get("maya_conversas", 0);

if (vezes == 0) {
    Dialog_Add("* É a primeira vez que nos falamos.");
} else {
    Dialog_Add("* Que bom ver você de novo.");
}

data.Set("maya_conversas", vezes + 1);
Dialog_Start();
```

### Mudança que continua mesmo sem salvar no save point

Use a área dinâmica e grave imediatamente:

```gml
var dynamic = Storage_GetDynamic();
var general = dynamic.Get("general");

general.Set("viu_maya", true);
Storage_SaveDynamic();
```

Dados dinâmicos são apropriados para reações metanarrativas. Dados comuns da
história geralmente pertencem à área estática e a uma chave/macro clara.

## NPC condicionado ao plot

Em `Macro_Plot`, crie marcos:

```gml
enum PLOT {
    START,
    FALOU_COM_MAYA,
    PORTA_ABERTA
};
```

No evento de interação:

```gml
event_inherited();

switch (Player_GetPlot()) {
    case PLOT.START:
        Dialog_Add("* Procure a chave no corredor.");
        Player_SetPlot(PLOT.FALOU_COM_MAYA);
        break;

    case PLOT.FALOU_COM_MAYA:
        Dialog_Add("* Ainda está procurando a chave?");
        break;

    default:
        Dialog_Add("* A porta está aberta agora.");
        break;
}

Dialog_Start();
```

## Movimentar personagens

Cada direção tem uma contagem em `move[DIR.*]`. Com a velocidade padrão 2, o
personagem anda aproximadamente 2 pixels por step durante essa contagem:

```gml
move[DIR.RIGHT] = 60;
```

Também é possível iniciar o movimento de um personagem dentro do texto:

```gml
Dialog_Add(
    "* Vou até ali.{pause}" +
    "{char_dir 10 DIR.RIGHT}" +
    "{char_move 10 DIR.RIGHT 60}" +
    "{pause}* Pronto."
);
Dialog_Start();
```

Comandos de texto são executados enquanto a frase é processada; eles não
esperam automaticamente a caminhada terminar. Use pausas, estados ou lógica no
Step quando precisar sincronização exata.

## Placas e objetos interativos rápidos

Para algo imóvel, use `char_sign` como pai ou coloque uma instância dele e
defina `text` no **Creation Code**:

```gml
text = "* A placa diz:&  CAMINHO FECHADO.";
```

`char_sign` define `dir_locked = true`, adiciona `text` à fila e abre o diálogo.

Outras bases prontas:

- `char_save`: cura o jogador e abre `ui_save`;
- `char_box`: pergunta se deseja usar a caixa e abre `ui_box`;
- `char_player`: personagem controlável.

## Colisões

`block` é a barreira básica. Sua propriedade principal é:

```gml
block_enabled = true;
```

Altere para `false` para desativar temporariamente a colisão. `char` também é
filho de `block`, então personagens bloqueiam movimento quando sua colisão está
ativa. Dentro de um filho de `char`, é possível usar:

```gml
collision = false;    // este personagem deixa de consultar blocos ao se mover
block_enabled = false; // outros personagens deixam de colidir com ele
```

Use `block_corner` em formas de colisão que precisem herdar a barreira básica.

## Gatilhos

`trigger` verifica sobreposição com personagens. Variáveis:

- `user_char = -1`: qualquer `char_id`; use `0` para somente o jogador;
- `_triggered`: controle interno; não altere manualmente.

Eventos:

- **User Event 0 — Trigger**: personagem entrou;
- **User Event 1 — Leave**: personagem saiu depois de acionar.

Crie um filho de `trigger` para um evento de história:

```gml
// Create
event_inherited();
user_char = 0;
```

```gml
// User Event 0
event_inherited();

if (Player_GetPlot() < PLOT.PORTA_ABERTA) {
    Dialog_Add("* Você sentiu uma presença.");
    Dialog_Start();
}
```

## Troca de sala com `trigger_warp`

Coloque um `trigger_warp` na saída. No **Creation Code** da instância:

```gml
target_room = room_corredor;
target_landmark = 1;
player_dir = DIR.DOWN; // -1 preserva a direção atual

fade_in_time = 20;
fade_out_time = 20;
fade_in_color = c_black;
fade_out_color = c_black;
warp_wait = 0;

bgm_fade = false;
bgm_fade_time = 20;
```

Na sala de destino, coloque `hint_landmark` no ponto de chegada e defina:

```gml
landmark_id = 1;
```

IDs de landmark só precisam ser únicos dentro da sala de destino. O warp guarda
o ID em armazenamento temporário, muda de sala e posiciona `char_player` sobre
o landmark correspondente.

## Música e configuração por sala

Objetos “hint” aplicam configurações logo após a sala começar:

### `hint_bgm`

```gml
bgm_slot = 0;
bgm = snd_musica_ruinas;
pitch = 1;
```

### `hint_border`

```gml
sprite = spr_minha_borda;
```

### `hint_half_size`

Define `camera.scale_x = 2` e `camera.scale_y = 2`, útil para overworld em
resolução lógica menor.

## Câmera

`camera.target` normalmente aponta para `char_player`. As principais variáveis
são:

| Variável | Uso |
|---|---|
| `width`, `height` | resolução lógica da visão |
| `scale_x`, `scale_y` | zoom |
| `angle` | rotação |
| `target` | instância seguida |
| `use_room_limit` | limita a visão aos limites da sala |
| `limit_top/bottom/left/right` | limites manuais quando aplicável |

Para um tremor:

```gml
Camera_Shake(4, 4, 2, 2, true, true, 0.5, 0.5);
```

## Checklist do NPC

- [ ] O objeto é filho de `char`.
- [ ] O Create começa com `event_inherited()`.
- [ ] `char_id` é único quando comandos `char_*` são usados.
- [ ] Os sprites existem e a origem está nos pés.
- [ ] O User Event 0 chama `Dialog_Start()`.
- [ ] O texto possui `{pause}` quando precisa esperar confirmação.
- [ ] Chaves de Storage são únicas e têm valor padrão.
- [ ] A interação foi testada nas quatro direções.

Próximo: [Itens e inventários](/guides/items-and-inventories).
