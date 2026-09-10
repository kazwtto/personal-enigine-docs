# Shop System

> UndertaleEngine `0.6.0`  
> Referência usada: `scripts/ShopSystem/ShopSystem.gml` + comportamento observado no `ui_shop` atual, incluindo o indicador de lista baseado no scrollbar do inventário de batalha.

Este guia documenta a API pública disponível para criar e configurar lojas no Room Creation Code. O sistema é declarativo: você cria um `ShopConfig`, adiciona `ShopItem` e `ShopTopic`, configura textos/áudio/callbacks e termina com `Shop_Open(_shop)`.

## Exemplo mínimo

```gml
var _shop = new ShopConfig();

_shop.SetGreeting("* Hello.");
_shop.SetBuyGreeting("Take your\ntime.");
_shop.SetSell(false, SHOP_SELL_MODE.MESSAGE, undefined, false);
_shop.SetTalk(true);
_shop.SetExit(true);

_shop.AddItem(
    new ShopItem(ITEM_EGG, 0, "The EGG.", 1, -1, "#DC143C", snd_ominous)
);

_shop.AddTopic(
    new ShopTopic("About", [
        "* This is a shop."
    ], "about")
);

Shop_Open(_shop);
```

## Fluxo recomendado de entrada e saída

Para a loja voltar à **room realmente visitada antes dela**, entre usando:

```gml
Shop_Goto(room_shop);
```

`Shop_Goto()` salva a room atual em `global.__shop_return_room` e executa `room_goto()`.

Se você usa seu próprio sistema de transição:

```gml
Shop_RememberReturnRoom();
MyTransition(room_shop);
```

Na room da loja:

```gml
var _shop = new ShopConfig();
Shop_Open(_shop);
```

Se `exit_room == noone`, `Shop_Open()` usa a room memorizada.

Para forçar outro destino:

```gml
_shop.SetExitRoom(room_specific);
```

## Enums

### `SHOP_STATE`

Estados internos usados pelo runtime:

- `SHOP_STATE.MAIN`
- `SHOP_STATE.BUY`
- `SHOP_STATE.BUY_CONFIRM`
- `SHOP_STATE.SELL`
- `SHOP_STATE.SELL_CONFIRM`
- `SHOP_STATE.TALK`
- `SHOP_STATE.DIALOG`
- `SHOP_STATE.EXITING`

### `SHOP_SELL_MODE`

- `SHOP_SELL_MODE.MESSAGE` — selecionar Sell abre uma fala configurada.
- `SHOP_SELL_MODE.INVENTORY` — abre a lista do inventário para vender itens.

---

# ShopConfig

## Criando

```gml
var _shop = new ShopConfig();
```

`ShopConfig` contém toda a configuração da loja: menus, itens, tópicos, textos, áudio, visual, saída e callbacks.

## Conteúdo

```gml
_shop.AddItem(_item);
_shop.AddTopic(_topic);

var _topic = _shop.FindTopic("about");
var _index = _shop.FindTopicIndex("about");

_shop.ReplaceTopic("about", _new_topic);
_shop.RemoveTopic("about");
```

Você também pode manipular diretamente:

```gml
array_push(_shop.items, _item);
array_push(_shop.topics, _topic);
```

## Buy / Sell / Talk / Exit

### Buy

```gml
_shop.SetBuy(true);
_shop.SetBuy(false, true);  // desabilitado e oculto
_shop.SetBuy(false, false); // desabilitado, mas visível
```

### Talk

```gml
_shop.SetTalk(false, false);
```

O `ui_shop` atual entende `talk_hide_when_disabled`.

### Exit

```gml
_shop.SetExit(false, false);
```

O menu principal atual entende `exit_enabled` e `exit_hide_when_disabled`.

### Sell

A assinatura atual é:

```gml
SetSell(enabled, mode, pages, hide_when_disabled)
```

Exemplos:

```gml
_shop.SetSell(true, SHOP_SELL_MODE.INVENTORY);

_shop.SetSell(
    true,
    SHOP_SELL_MODE.MESSAGE,
    ["* I don't buy anything."]
);
```

Para deixar Sell **desabilitado, mas visível** na API atual:

```gml
_shop.SetSell(
    false,
    SHOP_SELL_MODE.MESSAGE,
    undefined,
    false
);
```

> Atenção: `_shop.SetSell(false, false)` não significa `enabled=false, hide=false` na assinatura atual. O segundo argumento é `mode`.

## Textos

Todos os textos principais possuem setter:

```gml
_shop.SetGreeting("* Welcome.");
_shop.SetBuyGreeting("What would\nyou like?");
_shop.SetSellGreeting("Sell\nsomething?");
_shop.SetTalkGreeting("Talk?");

_shop.SetBuyText("Buy");
_shop.SetSellText("Sell");
_shop.SetTalkText("Talk");
_shop.SetExitText("Exit");

_shop.SetYesText("Yes");
_shop.SetNoText("No");
_shop.SetGoldText("G");

_shop.SetSellMessage(["* No thanks."]);
_shop.SetBuyPrompt("Buy it for\n{PRICE}G ?");
_shop.SetSellPrompt("Sell it for\n{PRICE}G ?");

_shop.SetPurchaseThanks("Thanks!");
_shop.SetJustLookingText("Just\nlooking?");
_shop.SetNotEnoughGoldText("Not enough\nmoney.");
_shop.SetInventoryFullText("You're carrying\ntoo much.");
_shop.SetSoldOutText("Sold out.");
_shop.SetInvalidItemText("This item\nisn't available.");
_shop.SetNothingToSellText("* Nothing to sell.");
_shop.SetSaleThanks("Thanks!");
_shop.SetGoodbye(["* Come again."]);
```

`{PRICE}` é substituído pelo preço no prompt de compra/venda.

## Diálogo de saída

Com diálogo:

```gml
_shop.SetExitDialogue(true, [
    "* Come again."
]);
```

Sem diálogo:

```gml
_shop.SetExitDialogue(false);
```

Também:

```gml
_shop.SetGoodbye([]);
```

desativa o diálogo de saída na configuração atual.

O `Create` atual reconhece `exit_dialogue_enabled` e também mantém fallback para o nome antigo `exit_dialog_enabled`.


## Indicador de lista

A loja pode reutilizar o mesmo estilo de indicador usado pelo inventário de batalha da UndertaleEngine.

Por padrão ele está **ativado** em `Buy`, `Sell` e `Talk` e usa os assets já existentes:

```gml
spr_battle_menu_item_scrollbar_dot
spr_battle_menu_item_scrollbar_arrow
```

Comportamento atual:

- não desenha indicador quando a lista possui `0` ou `1` entrada;
- com `2+` entradas, desenha um ponto por entrada;
- o ponto correspondente à opção selecionada usa o frame selecionado do sprite;
- quando `Exit` está selecionado, nenhum ponto de item fica marcado;
- os pontos são centralizados verticalmente na caixa inferior da loja;
- se houver mais entradas do que linhas visíveis, as setas indicam conteúdo acima/abaixo;
- as setas possuem uma pequena animação semelhante à usada pelo scrollbar do inventário de batalha.

### Ativar ou remover

O indicador já vem habilitado:

```gml
_shop.SetListIndicator(true);
```

Para removê-lo completamente:

```gml
_shop.SetListIndicator(false);
```

Também é possível substituir os sprites:

```gml
_shop.SetListIndicator(
    true,
    spr_my_dot,
    spr_my_arrow
);
```

Assinatura:

```gml
SetListIndicator(enabled=true, dot_sprite=undefined, arrow_sprite=undefined)
```

### Escolher menus

```gml
_shop.SetListIndicatorMenus(
    true,  // Buy
    true,  // Sell
    false  // Talk
);
```

Assinatura:

```gml
SetListIndicatorMenus(buy=true, sell=true, talk=true)
```

### Layout

```gml
_shop.SetListIndicatorLayout(
    -16, // offset X relativo ao divisor
    170, // mantido na API; o Draw atual centraliza Y automaticamente
    10,  // espaçamento entre pontos
    10,  // distância das setas
    5    // intensidade do movimento das setas
);
```

Assinatura:

```gml
SetListIndicatorLayout(x_offset=-16, y=170, spacing=10, arrow_gap=10, arrow_bounce=5)
```

> **Importante:** o `Draw_0.gml` atual centraliza o conjunto verticalmente usando `panel_y` e `room_height`. Por isso `list_indicator_y`/o argumento `y` continua armazenado para compatibilidade da API, mas não controla atualmente a posição vertical.

Valores padrão:

| Campo | Padrão | Uso |
|---|---|---|
| `list_indicator_enabled` | `true` | liga/desliga globalmente |
| `list_indicator_buy` | `true` | indicador em Buy |
| `list_indicator_sell` | `true` | indicador em Sell |
| `list_indicator_talk` | `true` | indicador em Talk |
| `list_indicator_dot_sprite` | `spr_battle_menu_item_scrollbar_dot` | sprite dos pontos |
| `list_indicator_arrow_sprite` | `spr_battle_menu_item_scrollbar_arrow` | sprite das setas |
| `list_indicator_x_offset` | `-16` | posição X relativa ao divisor |
| `list_indicator_spacing` | `10` | distância vertical entre pontos |
| `list_indicator_arrow_gap` | `10` | afastamento das setas |
| `list_indicator_arrow_bounce` | `5` | amplitude da animação |


## Áudio

### Sons do menu

```gml
_shop.SetMenuSounds(
    snd_menu_switch,
    snd_menu_confirm,
    snd_menu_cancel
);
```

### BGM

```gml
_shop.SetBGM(
    snd_shop_music,
    0,      // slot
    1.0,    // pitch
    0.8,    // volume
    true,   // loop
    true    // parar ao sair
);
```

### Som do diálogo

A API possui:

```gml
_shop.SetDialogSound(snd_ominous);
_topic.SetDialogSound(snd_ominous);
```

**Estado atual do runtime:** `_TextShow()` do `ui_shop` ainda usa `{voice 0}` fixo. Portanto esses dois setters estão declarados no ShopSystem, mas ainda não alteram a voice sem uma integração adicional no `ui_shop`.

## Fade

```gml
_shop.SetFade(true, true, 0.08, c_black);
```

## Callbacks da loja

Callbacks atualmente consumidos pelo `ui_shop`:

```gml
_shop.SetOnOpen(function(_shop_instance) {
    // Loja terminou Setup.
});

_shop.SetOnExit(function(_shop_instance) {
    // return true para assumir completamente a saída.
    return false;
});

_shop.SetOnBuy(function(_shop_instance, _item, _price) {
    // Compra bem-sucedida.
});

_shop.SetOnSell(function(_shop_instance, _item_id, _price) {
    // Venda bem-sucedida.
});

_shop.SetOnStateChanged(function(_shop_instance, _old_state, _new_state) {
});
```

Callbacks declarados no `ShopConfig`, mas que **o ui_shop atual ainda não dispara**:

```gml
_shop.SetOnMainOpen(...);
_shop.SetOnBuyOpen(...);
_shop.SetOnSellOpen(...);
_shop.SetOnTalkOpen(...);
_shop.SetOnTalkClose(...);
```

Eles estão preparados na API, mas não devem ser tratados como funcionais até o runtime chamá-los.

## Desenho customizado

```gml
_shop.SetDrawBackground(function(_shop_instance) {
    // Desenha a parte superior.
});

_shop.SetDrawMerchant(function(_shop_instance) {
    // Desenha/anima o comerciante.
});

_shop.SetDrawForeground(function(_shop_instance) {
    // Elementos por cima.
});
```

Também continuam disponíveis os campos diretos:

```gml
_shop.background_sprite = spr_shop_background;
_shop.background_x = 0;
_shop.background_y = 0;

_shop.merchant_sprite = spr_shopkeeper;
_shop.merchant_x = 160;
_shop.merchant_y = 0;
```

Se não houver `background_sprite` nem `draw_background`, o Draw atual não força background preto na metade superior.

---

# ShopItem

## Construtor

```gml
new ShopItem(
    item_id,
    price,
    description,
    stock,
    sell_price,
    color,
    buy_sound,
    on_purchased
)
```

Exemplo:

```gml
var _egg = new ShopItem(
    ITEM_EGG,
    0,
    "The EGG.",
    1,
    -1,
    "#DC143C",
    snd_ominous,
    function(_shop_instance, _item, _price) {
        _shop_instance.config.greeting =
            "* (Well...)&* (There's no a man&  here.)";
    }
);

_shop.AddItem(_egg);
```

### Parâmetros

- `item_id`: ID registrado no `ItemTypeManager`.
- `price`: preço de compra.
- `description`: descrição mostrada no painel.
- `stock`: `-1` para infinito; `0` para esgotado; valor positivo para estoque limitado.
- `sell_price`: `-1` usa metade do preço de compra.
- `color`: aceita cor GML, nome, `"#RRGGBB"` ou `[r,g,b]`.
- `buy_sound`: `-1` usa `config.sound_confirm`.
- `on_purchased`: callback após compra realmente concluída.

## Métodos de ShopItem

| Método | Uso |
|---|---|
| `SetName(_value)` | define nome exibido do item. |
| `SetPrice(_value)` | define preço base de compra. |
| `SetDescription(_value)` | define descrição do item. |
| `SetStock(_value)` | define estoque. |
| `SetSellPrice(_value)` | define preço de revenda. |
| `SetVisible(_value = true)` | define visibilidade do item. |
| `SetEnabled(_value = true)` | define se o item pode ser comprado. |
| `SetDeliversItem(_value = true)` | define se a compra entrega item. |
| `SetPurchaseThanks(_text)` | define agradecimento específico do item. |
| `SetColor(_normal, _sold_out = undefined)` | define cor normal e de indisponível. |
| `SetBuySound(_sound)` | define som da compra deste item. |
| `SetGetPrice(_callback)` | define callback de preço. |
| `SetGetName(_callback)` | define callback de nome. |
| `SetGetDescription(_callback)` | define callback de descrição. |
| `SetGetVisible(_callback)` | define callback de visibilidade. |
| `SetGetEnabled(_callback)` | define callback de disponibilidade. |
| `SetFormatLine(_callback)` | define callback da linha de Buy. |
| `SetOnBuy(_callback)` | define callback pré-compra. |
| `SetOnPurchased(_callback)` | define callback pós-compra. |

### Callbacks de item

Preço dinâmico:

```gml
_item.SetGetPrice(function(_shop_instance, _item) {
    return global.special_price;
});
```

Disponibilidade:

```gml
_item.SetGetEnabled(function(_shop_instance, _item) {
    return global.can_buy_special_item;
});
```

Antes da compra:

```gml
_item.SetOnBuy(function(_shop_instance, _item) {
    return true;
});
```

Depois da compra:

```gml
_item.SetOnPurchased(function(_shop_instance, _item, _price) {
    global.item_bought = true;
});
```

---

# ShopTopic

## Construtor

```gml
new ShopTopic(label, pages, id)
```

Exemplo:

```gml
var _topic = new ShopTopic(
    "About this place",
    [
        "* First page.",
        "* Second page."
    ],
    "about"
);

_shop.AddTopic(_topic);
```

## Métodos de ShopTopic

| Método | Uso |
|---|---|
| `SetID(_value)` | define ID do tópico. |
| `SetLabel(_value)` | define título do tópico. |
| `SetPages(_value)` | define páginas do tópico. |
| `SetVisible(_value = true)` | define visibilidade do tópico. |
| `SetEnabled(_value = true)` | define disponibilidade do tópico. |
| `SetColor(_value)` | define cor do tópico. |
| `SetSuffix(_value)` | define sufixo do título. |
| `SetListIndicator(_enabled = true, _dot_sprite = undefined, _arrow_sprite = undefined)` | ativa/desativa e permite trocar os sprites do indicador. |
| `SetListIndicatorMenus(_buy = true, _sell = true, _talk = true)` | escolhe quais listas exibem o indicador. |
| `SetListIndicatorLayout(_x_offset = -16, _y = 170, _spacing = 10, _arrow_gap = 10, _arrow_bounce = 5)` | configura posição horizontal, espaçamento e animação do indicador. |
| `SetDialogSound(_sound)` | define voz específica do tópico. |
| `SetGetLabel(_callback)` | define callback do título. |
| `SetGetPages(_callback)` | define callback de páginas. |
| `SetGetVisible(_callback)` | define callback de visibilidade. |
| `SetGetEnabled(_callback)` | define callback de disponibilidade. |
| `SetGetColor(_callback)` | define callback de cor. |
| `SetNext(_topic)` | define tópico sucessor. |
| `ReplaceWith(_topic)` | alias de SetNext. |
| `SetGetNext(_callback)` | define sucessor dinâmico. |
| `SetOnOpen(_callback)` | define callback ao abrir tópico. |
| `SetOnTalk(_callback)` | alias de SetOnOpen. |
| `SetOnComplete(_callback)` | define callback ao terminar tópico. |

### Callback ao selecionar um tópico

Funciona no `ui_shop` atual:

```gml
_topic.SetOnOpen(function(_shop_instance, _topic) {
    global.opened_about = true;
});
```

`SetOnTalk()` é alias de `SetOnOpen()`.

### Fluxo de substituição de tópico

A API permite declarar:

```gml
var _first = new ShopTopic("About", ["* First."], "about");
var _second = new ShopTopic("About again", ["* Different."], "about_again");

_first.ReplaceWith(_second);
```

Também existe:

```gml
_first.SetNext(_second);

_first.SetGetNext(function(_shop_instance, _topic) {
    return global.special_state ? _second : undefined;
});
```

**Estado atual do runtime:** o `ui_shop` atual ainda não lê `next_topic`, `get_next_topic` ou `on_complete` ao terminar a conversa. Se precisar trocar imediatamente com o runtime atual, faça manualmente em um callback que já seja executado, por exemplo:

```gml
_topic.SetOnOpen(function(_shop_instance, _topic) {
    // quando apropriado:
    _shop_instance.config.ReplaceTopic("about", _second);
});
```

---

# ShopLayout

`ShopLayout` contém as medidas usadas pelo Draw atual.

## Base

| Campo | Padrão | Uso |
|---|---:|---|
| `room_width` | `320` | largura lógica |
| `room_height` | `240` | altura lógica |
| `panel_y` | `120` | início da UI inferior |
| `divider_x` | `210` | divisor esquerdo/direito |
| `border` | `4` | borda branca |

## Lista

| Campo | Padrão |
|---|---:|
| `list_cursor_x` | `15` |
| `list_text_x` | `30` |
| `list_first_y` | `130` |
| `list_cursor_first_y` | `135` |
| `list_step_y` | `20` |
| `list_rows` | `4` |
| `exit_y` | `210` |
| `exit_cursor_y` | `215` |

## Menu principal

| Campo | Padrão |
|---|---:|
| `main_cursor_x_offset` | `15` |
| `main_text_x_offset` | `30` |
| `main_first_y` | `130` |
| `main_cursor_first_y` | `135` |
| `main_step_y` | `20` |
| `main_message_x` | `20` |
| `main_message_y` | `130` |

## Confirmação

| Campo | Padrão |
|---|---:|
| `confirm_text_x_offset` | `20` |
| `confirm_text_y` | `130` |
| `confirm_yes_x_offset` | `30` |
| `confirm_yes_y` | `170` |
| `confirm_no_x_offset` | `30` |
| `confirm_no_y` | `185` |
| `confirm_cursor_x_offset` | `15` |
| `confirm_cursor_first_y` | `175` |
| `confirm_cursor_step_y` | `15` |

## Descrição

| Campo | Padrão |
|---|---:|
| `description_closed_y` | `120` |
| `description_open_y` | `40` |
| `description_text_x_offset` | `14` |
| `description_text_y_offset` | `14` |

---

# Referência rápida — ShopConfig

| Método | Uso |
|---|---|
| `AddItem(_item)` | adiciona um ShopItem. |
| `AddTopic(_topic)` | adiciona um ShopTopic. |
| `FindTopic(_id)` | procura tópico por ID. |
| `FindTopicIndex(_topic_or_id)` | localiza índice de tópico. |
| `ReplaceTopic(_topic_or_id, _replacement)` | substitui tópico mantendo posição. |
| `RemoveTopic(_topic_or_id)` | remove tópico. |
| `SetBuy(_enabled = true, _hide_when_disabled = true)` | configura Buy. |
| `SetSell(_enabled = true, _mode = SHOP_SELL_MODE.MESSAGE, _pages = undefined, _hide_when_disabled = true)` | configura Sell. |
| `SetTalk(_enabled = true, _hide_when_disabled = true)` | configura Talk. |
| `SetExit(_enabled = true, _hide_when_disabled = true)` | configura Exit. |
| `IsBuyVisible()` | informa se Buy deve aparecer. |
| `IsSellVisible()` | informa se Sell deve aparecer. |
| `IsTalkVisible()` | informa se Talk deve aparecer. |
| `IsExitVisible()` | informa se Exit deve aparecer. |
| `SetGreeting(_text)` | define saudação. |
| `SetBuyGreeting(_text)` | define fala ao abrir Buy. |
| `SetSellGreeting(_text)` | define fala ao abrir Sell. |
| `SetTalkGreeting(_text)` | define fala ao abrir Talk. |
| `SetBuyText(_text)` | define rótulo Buy. |
| `SetSellText(_text)` | define rótulo Sell. |
| `SetTalkText(_text)` | define rótulo Talk. |
| `SetExitText(_text)` | define rótulo Exit. |
| `SetYesText(_text)` | define texto Yes. |
| `SetNoText(_text)` | define texto No. |
| `SetGoldText(_text)` | define sufixo de Gold. |
| `SetSellMessage(_pages)` | define páginas do Sell MESSAGE. |
| `SetBuyPrompt(_text)` | define pergunta de compra. |
| `SetSellPrompt(_text)` | define pergunta de venda. |
| `SetPurchaseThanks(_text)` | define agradecimento padrão. |
| `SetJustLookingText(_text)` | define resposta ao cancelar compra. |
| `SetNotEnoughGoldText(_text)` | define texto de Gold insuficiente. |
| `SetInventoryFullText(_text)` | define texto de inventário cheio. |
| `SetSoldOutText(_text)` | define texto de item esgotado. |
| `SetInvalidItemText(_text)` | define texto de item inválido. |
| `SetNothingToSellText(_text)` | define texto sem itens para vender. |
| `SetSaleThanks(_text)` | define agradecimento de venda. |
| `SetGoodbye(_pages)` | define diálogo de despedida. |
| `SetExitDialogue(_enabled = true, _pages = undefined)` | habilita/desabilita despedida. |
| `SetListIndicator(_enabled = true, _dot_sprite = undefined, _arrow_sprite = undefined)` | ativa/desativa e permite trocar os sprites do indicador. |
| `SetListIndicatorMenus(_buy = true, _sell = true, _talk = true)` | escolhe quais listas exibem o indicador. |
| `SetListIndicatorLayout(_x_offset = -16, _y = 170, _spacing = 10, _arrow_gap = 10, _arrow_bounce = 5)` | configura posição horizontal, espaçamento e animação do indicador. |
| `SetDialogSound(_sound)` | define som/voice de diálogo da loja. |
| `SetMenuSounds(_move, _confirm, _cancel)` | define sons de navegação. |
| `SetBGM(_audio, _slot = 0, _pitch = 1, _volume = 1, _loop = true, _stop_on_exit = true)` | configura BGM. |
| `SetExitRoom(_room)` | define room de destino. |
| `SetReturnRoom(_room)` | alias semântico para ExitRoom. |
| `UseRememberedReturnRoom()` | usa room lembrada. |
| `SetFade(_fade_in = true, _fade_out = true, _speed = 0.08, _color = c_black)` | configura fades. |
| `SetOnOpen(_callback)` | define callback de abertura. |
| `SetOnExit(_callback)` | define callback de saída. |
| `SetOnMainOpen(_callback)` | define callback ao abrir Main. |
| `SetOnBuyOpen(_callback)` | define callback ao abrir Buy. |
| `SetOnSellOpen(_callback)` | define callback ao abrir Sell. |
| `SetOnTalkOpen(_callback)` | define callback ao abrir Talk. |
| `SetOnTalkClose(_callback)` | define callback ao fechar Talk. |
| `SetOnBuy(_callback)` | define callback global pós-compra. |
| `SetOnSell(_callback)` | define callback global pós-venda. |
| `SetOnStateChanged(_callback)` | define callback de mudança de estado. |
| `SetGetSellPrice(_callback)` | define preço dinâmico de venda. |
| `SetFormatSellLine(_callback)` | define linha customizada de Sell. |
| `SetDrawBackground(_callback)` | define desenho de background. |
| `SetDrawMerchant(_callback)` | define desenho do comerciante. |
| `SetDrawForeground(_callback)` | define desenho de foreground. |

---

# Funções globais

| Função | Uso |
|---|---|
| `Shop_HexDigitValue(char)` | Conversão auxiliar de hexadecimal. |
| `Shop_ResolveColor(value, fallback)` | Normaliza cor. |
| `Shop_NormalizePages(pages)` | Converte string/array para array de páginas. |
| `Shop_Goto(shop_room)` | Lembra a room atual e entra na loja. |
| `Shop_RememberReturnRoom()` | Lembra a room atual sem trocar de room. |
| `Shop_GetReturnRoom()` | Retorna a room lembrada. |
| `Shop_ClearReturnRoom()` | Limpa a room lembrada. |
| `Shop_Open(config)` | Cria `ui_shop` e chama `Setup(config)`. |

---

# Compatibilidade com o ui_shop atual

## Funciona atualmente

- Buy/Sell/Talk/Exit do menu principal.
- opções desabilitadas visíveis em cinza quando os flags `*_hide_when_disabled` estão configurados corretamente;
- compra e estoque;
- cor customizada por item;
- som customizado por item;
- callback `ShopItem.on_buy`;
- callback `ShopItem.on_purchased`;
- agradecimento global ou por item;
- callbacks globais `on_open`, `on_exit`, `on_buy`, `on_sell`, `on_state_changed`;
- `ShopTopic.on_open`;
- preços, nomes, descrições, visibilidade e disponibilidade dinâmicos;
- Sell dinâmico;
- callbacks de desenho;
- BGM;
- indicador de lista opcional em Buy/Sell/Talk, ligado por padrão;
- pontos ocultos automaticamente quando há apenas uma entrada;
- pontos centralizados verticalmente e setas de scroll quando necessário;
- `SetExitDialogue()` com o Create corrigido;
- room de retorno quando registrada por `Shop_Goto()`/`Shop_RememberReturnRoom()`.

## Declarado na API, mas ainda requer integração no ui_shop

- `ShopConfig.SetDialogSound()`;
- `ShopTopic.SetDialogSound()`;
- `ShopConfig.SetOnMainOpen()`;
- `ShopConfig.SetOnBuyOpen()`;
- `ShopConfig.SetOnSellOpen()`;
- `ShopConfig.SetOnTalkOpen()`;
- `ShopConfig.SetOnTalkClose()`;
- `ShopTopic.SetOnComplete()`;
- `ShopTopic.SetNext()` / `ReplaceWith()`;
- `ShopTopic.SetGetNext()`.

Esta distinção está também registrada nas `notes` da referência JSON.

---

# Exemplo mais completo

```gml
var _shop = new ShopConfig();

_shop
    .SetGreeting("* Hello, traveller.")
    .SetBuyGreeting("Take your\ntime.")
    .SetTalkGreeting("Need to\nknow something?")
    .SetPurchaseThanks("Thanks.")
    .SetExitDialogue(false)
    .SetBGM(snd_shop_music, 0, 1.0, 0.8);

_shop.SetSell(
    false,
    SHOP_SELL_MODE.MESSAGE,
    ["* I don't buy used items."],
    false
);

var _egg = new ShopItem(
    ITEM_EGG,
    0,
    "The EGG.",
    1,
    -1,
    "#DC143C",
    snd_ominous,
    function(_shop_instance, _item, _price) {
        _shop_instance.config.greeting =
            "* (Well...)&* (There's no a man&  here.)";
    }
);

_egg.SetPurchaseThanks("* ...");

_shop.AddItem(_egg);

var _about = new ShopTopic(
    "About",
    [
        "* This is the first page.",
        "* This is the second."
    ],
    "about"
);

_about.SetOnOpen(function(_shop_instance, _topic) {
    global.talked_about = true;
});

_shop.AddTopic(_about);

Shop_Open(_shop);
```

