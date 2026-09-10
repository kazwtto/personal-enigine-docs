<!-- locale: pt-BR; content-id: dialogues-text-and-localization -->

# Diálogos, texto e localização

## Fila de diálogo

Fluxo padrão no overworld:

```gml
Dialog_Add("* Primeira caixa.");
Dialog_Add("* Segunda caixa.");
Dialog_Start();
```

- `Dialog_Add(text)` enfileira uma string.
- `Dialog_Start()` cria `ui_dialog` somente fora da batalha.
- `ui_dialog` retira uma string por vez e a entrega a `text_typer`.
- `Dialog_Get()` retira a próxima string da fila.
- `Dialog_IsEmpty()` consulta a fila.
- `Dialog_Clear()` descarta o restante.

Durante a batalha, use `Dialog_Add()` nos eventos de inimigo, mas não é
necessário chamar `Dialog_Start()`: o objeto `battle` processa a fila no estado
`DIALOG`.

## Texto básico

```gml
Dialog_Add("* Uma linha.&* Outra linha.{pause}{clear}* Nova página.");
Dialog_Start();
```

| Sintaxe | Efeito |
|---|---|
| `&` | nova linha |
| `\{`, `\}` ou `\&` | trata o caractere como texto, quando necessário |
| `{comando argumentos}` | executa um comando do `text_typer` |
| `` `texto com espaços` `` | argumento string dentro de um comando |

Use `{pause}` quando o jogador deve confirmar. Use `{end}` quando criou um
`text_typer` diretamente; `ui_dialog` e `Battle_SetDialog` normalmente já
adicionam finalização ao fluxo.

## Exemplo expressivo

```gml
Dialog_Add(
    "{char_link 10}" +
    "{voice VOICE.DEFAULT}" +
    "* Isto é {color `yellow`}importante{color `white`}!" +
    "{sleep 20}&* Entendeu?" +
    "{pause}{char_unlink}"
);
Dialog_Start();
```

## Referência dos comandos de texto

### Ritmo e fluxo

| Comando | Exemplo | Efeito |
|---|---|---|
| `speed` | `{speed 2}` | frames entre grupos de caracteres |
| `sleep` | `{sleep 30}` | espera frames; ignorado ao pular/instantâneo |
| `pause` | `{pause}` | espera confirmar |
| `instant` | `{instant true}` | processa texto imediatamente |
| `skippable` | `{skippable false}` | permite/impede pular com Cancel |
| `clear` | `{clear}` | apaga caracteres já criados |
| `end` | `{end}` | destrói o `text_typer` |
| `skip_space` | `{skip_space true}` | controla o tratamento rápido de espaços |

### Aparência

| Comando | Exemplo | Efeito |
|---|---|---|
| `color` | `{color `yellow`}` | preset completo branco/amarelo/vermelho |
| `color_text` | `{color_text `red`}` | cor do texto |
| `color_shadow` | `{color_shadow `black`}` | cor da sombra |
| `color_outline` | `{color_outline `white`}` | cor do contorno |
| `shadow` | `{shadow true}` | ativa/desativa sombra |
| `outline` | `{outline true}` | ativa/desativa contorno |
| `shadow_pos` | `{shadow_pos 1}` | X e Y da sombra |
| `shadow_x` | `{shadow_x 2}` | deslocamento horizontal |
| `shadow_y` | `{shadow_y 2}` | deslocamento vertical |
| `alpha` | `{alpha 0.5}` | alpha geral do caractere |
| `alpha_text` | `{alpha_text 0.5}` | alpha do texto |
| `alpha_shadow` | `{alpha_shadow 0.5}` | alpha da sombra |
| `alpha_outline` | `{alpha_outline 0.5}` | alpha do contorno |
| `font` | `{font FONT.BATTLE}` | grupo de fonte |
| `scale` | `{scale 2}` | escala X e Y |
| `scale_x` | `{scale_x 2}` | escala horizontal |
| `scale_y` | `{scale_y 2}` | escala vertical |
| `space_x` | `{space_x 1}` | espaço extra entre caracteres |
| `space_y` | `{space_y 2}` | espaço extra entre linhas |
| `effect` | `{effect 0}` | efeito 0 = tremor; -1 = nenhum |
| `depth` | `{depth -200}` | profundidade dos caracteres |
| `gui` | `{gui true}` | desenha em Draw GUI |

Cores por nome reconhecidas por `GetColorFromString()`:

```text
white, black, red, yellow, gray, gray_dark, gray_light
```

`color` só possui presets próprios para branco, amarelo e vermelho. Para as
outras, prefira `color_text`, `color_shadow` e `color_outline`.

Os comandos de cor aceitam uma cor ou quatro cores (um valor para cada vértice),
por exemplo:

```gml
"{color_text `red` `yellow` `white` `gray`}* Gradiente"
```

### Voz, face e sprite embutido

| Comando | Exemplo | Efeito |
|---|---|---|
| `voice` | `{voice VOICE.DEFAULT}` | grupo de sons por caractere; -1 silencia |
| `voice_single` | `{voice_single 0}` | fixa uma amostra do grupo |
| `face` | `{face 0}` | cria a face registrada no slot; -1 remove |
| `face_emotion` | `{face_emotion 1}` | troca a emoção da face criada/vinculada |
| `face_link` | `{face_link 5}` | vincula um objeto `face` por `face_id` |
| `face_unlink` | `{face_unlink}` | remove o vínculo |
| `sprite` | `{sprite `spr_coracao` 0}` | insere um frame de sprite no texto |

Slots padrão definidos pelo `text_typer`:

- `FONT.DIALOG = 0`, `FONT.MENU = 1`, `FONT.BATTLE = 2`;
- `VOICE.NULL = -1`, `VOICE.DEFAULT = 0`, `VOICE.TYPER = 1`;
- face 0 usa o objeto-base `face`.

Para uma face personalizada, crie um filho de `face`, configure `idle_sprite`,
`talk_sprite`, imagens e velocidades por emoção, e registre o objeto no grupo de
faces do `text_typer` (User Event 5 — Group & Macro). Faça essa alteração com
cuidado, porque esse evento também configura todas as fontes e vozes padrão.

### Personagens

| Comando | Exemplo | Efeito |
|---|---|---|
| `char_link` | `{char_link 10}` | sincroniza `talking` do `char_id` |
| `char_unlink` | `{char_unlink}` | remove o vínculo |
| `char_dir` | `{char_dir 10 DIR.LEFT}` | muda direção |
| `char_move` | `{char_move 10 DIR.RIGHT 60}` | define a contagem de movimento |
| `char_player_moveable` | `{char_player_moveable false}` | tenta mudar `moveable` do jogador |

> [!WARNING]
> No commit analisado, `char_player_moveable` valida o argumento com acesso de
> lista, mas atribui usando `cmd[1]`, uma forma inconsistente. Se o comando não
> funcionar na sua versão, use código GML direto:
> `char_player.moveable = false/true`.

### Macros e condições

| Comando | Exemplo | Efeito |
|---|---|---|
| `define` | ``{define `NOME` `Maya`}`` | cria/substitui uma macro local do texto |
| `undefine` | ``{undefine `NOME`}`` | remove a macro |
| `insert` | `{insert NOME}` | insere o valor no ponto atual |
| `if` | veja abaixo | insere texto conforme comparação |
| `choice` | veja abaixo | cria escolha binária |

Substituição:

```gml
var texto =
    "{define `NOME` `Maya`}" +
    "* Olá, {insert NOME}!";
```

Condição:

```gml
var texto =
    "{define `HP` 20}" +
    "{if HP `>=` 20 `* Vida cheia.` `else` `* Vida baixa.`}";
```

Operadores: `==`, `!=`, `>`, `>=`, `<`, `<=`. Coloque operador, textos e
`else` entre crases para que o parser os trate como strings.

### Escolha Sim/Não

```gml
Dialog_Add(
    "* Abrir a porta?&&" +
    "         {instant true}" +
    "{choice 0}Sim         {choice 1}Não" +
    "{choice `RESPOSTA`}{pause}{end}"
);
Dialog_Start();
```

Depois que o diálogo fechar:

```gml
if (Player_GetTextTyperChoice() == 0) {
    // Sim
} else {
    // Não
}
```

O comando com `0` e `1` grava as posições do cursor. O comando com uma string
abre a escolha e associa a macro local. A seleção confirmada também é salva em
`FLAG_TEMP_TEXT_TYPER_CHOICE`.

### Som e chamada de função

```gml
"{sound `snd_item_get`}* Você recebeu algo."
```

```gml
"{script `MinhaFuncao` 10 `texto`}"
```

`script` aceita até 15 argumentos na implementação atual. Use apenas nomes e
argumentos controlados pelo projeto. Não coloque chamadas arbitrárias em
arquivos de tradução recebidos de terceiros.

## Criar `text_typer` diretamente

Use quando estiver fazendo uma UI própria:

```gml
var typer = instance_create_depth(40, 40, DEPTH_UI.TEXT, text_typer);
typer.text =
    "{gui true}{font FONT.MENU}{scale 2}{shadow true}" +
    "Meu texto{end}";
```

Por padrão `text_typer` cria uma instância `text_single` para cada caractere.
Destruir o typer também destrói esses caracteres e a face criada por ele.

## Estrutura de localização

```text
datafiles/locale/
├─ list.txt
└─ english/
   ├─ string.txt
   ├─ sprite.txt
   ├─ font.txt
   ├─ string/*.json
   ├─ sprite/*.ini + imagens
   └─ font/*.ini + fontes/imagens
```

`list.txt` tem um nome de pasta por linha. O idioma `0` é a primeira linha e é
carregado pelo `world` na inicialização.

Os caminhos são centralizados em `Lang_Custom`:

```text
GMU_LANG_PATH_BASE   = working_directory + "locale/"
GMU_LANG_PATH_LIST   = "list.txt"
GMU_LANG_PATH_STRING = "string.txt"
GMU_LANG_PATH_SPRITE = "sprite.txt"
GMU_LANG_PATH_FONT   = "font.txt"
GMU_LANG_PATH_INFO   = "info.ini"
```

Altere esses macros somente se também reorganizar os Included Files e todos os
índices de idioma.

## Adicionar português

1. Copie a pasta `english` para `portuguese_br`.
2. Em `datafiles/locale/list.txt`, acrescente:

```text
english
portuguese_br
```

3. Traduza os valores de todos os JSON em `portuguese_br/string/`.
4. Preserve as chaves e os comandos entre `{}`.
5. Confira se `string.txt`, `sprite.txt` e `font.txt` listam todos os arquivos.
6. Teste caracteres acentuados; amplie o intervalo da fonte quando necessário.

Exemplo:

```json
{
    "battle.menu.mercy.spare": "* Poupar",
    "battle.menu.mercy.flee": "* Fugir"
}
```

## Trocar idioma em execução

```gml
function Game_SetLanguage(lang) {
    if (!Lang_IsExists(lang)) return false;

    // Fontes podem depender dos sprites; remova-as primeiro.
    Lang_ClearFont();
    Lang_ClearSprite();
    Lang_ClearString();

    Lang_LoadString(lang);
    Lang_LoadSprite(lang);
    Lang_LoadFont(lang);
    return true;
}
```

`lang` pode ser índice (`0`, `1`...) ou nome da pasta. Recrie menus/textos já
abertos após a troca, porque instâncias existentes podem manter recursos
anteriores.

## Textos JSON

Cada arquivo deve ser um objeto simples de `string → string`:

```json
{
    "npc.maya.first": "* É a primeira vez que nos falamos.",
    "npc.maya.again": "* Que bom ver você de novo."
}
```

Uso:

```gml
Dialog_Add(Lang_GetString("npc.maya.first", "* Texto ausente."));
Dialog_Start();
```

O segundo argumento de `Lang_GetString()` é o fallback. Durante o
desenvolvimento, usar a própria chave como fallback facilita encontrar lacunas:

```gml
var key = "npc.maya.first";
Dialog_Add(Lang_GetString(key, key));
```

## Sprites localizados

Um `.ini` listado por `sprite.txt`:

```ini
[sprite]
key="battle.button.fight"
source="battle_button_fight.png"

image_number=2
remove_background=false
is_smooth=0
origin_x=0
origin_y=0
```

Carregue por chave:

```gml
var spr = Lang_GetSprite("battle.button.fight");
```

Isso é útil para botões que contêm palavras e precisam de arte diferente por
idioma.

## Fontes localizadas

Exemplo de `.ini` listado em `font.txt`:

```ini
[font]
key="determination_mono"
source="determination_mono.ttf"
is_sprite=0

size=10
bold=1
italic=0
first=32
last=255

string_map=""
is_proportional=0
separation=0
```

Para uma sprite-font, use `is_sprite=1`, liste/carregue o sprite antes da fonte
e configure `string_map` quando necessário.

## Checklist de diálogo/localização

- [ ] Toda fala de overworld termina com `Dialog_Start()`.
- [ ] Diálogo de batalha só entra na fila; o controlador o exibe.
- [ ] Quebras `&`, comandos e crases estão balanceados.
- [ ] Escolhas possuem marcadores 0/1 e iniciador final.
- [ ] Toda chave existe em cada idioma ou tem fallback.
- [ ] JSON está válido e listado em `string.txt`.
- [ ] Fontes contêm os caracteres do idioma.
- [ ] Sprites/fontes dinâmicos são limpos antes da troca.
- [ ] Menus foram recriados após trocar o idioma.

Próximo: [Sistemas da engine](/guides/engine-systems).
