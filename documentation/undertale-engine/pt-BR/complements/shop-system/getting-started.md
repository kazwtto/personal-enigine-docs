# Primeiros passos

Este guia monta uma loja pequena e funcional em etapas. O objetivo é mostrar como as partes se relacionam, e não listar todas as funções disponíveis.

## 1. Crie a configuração

No Room Creation Code:

```gml
var store = new ShopConfig();
```

`store` passa a representar aquela loja. Tudo o que for específico do comerciante deve ficar nessa configuração ou nos itens/tópicos ligados a ela.

## 2. Defina o menu principal

Suponha uma loja que compra itens, não vende e permite conversa:

```gml
store.SetBuy(true);
store.SetSell(false, SHOP_SELL_MODE.MESSAGE, undefined, true);
store.SetTalk(true);
store.SetExit(true);
```

O quarto argumento de `SetSell` controla se uma opção desabilitada some. Esse detalhe existe porque `SetSell` também recebe modo e páginas; ele não possui a mesma assinatura curta de `SetBuy` e `SetTalk`.

Se quiser Sell desabilitado, mas ainda visível:

```gml
store.SetSell(
    false,
    SHOP_SELL_MODE.MESSAGE,
    undefined,
    false
);
```

## 3. Escreva a voz do comerciante

Configure primeiro os textos que definem a personalidade da loja:

```gml
store.SetGreeting(
    "* Welcome.&"
    + "* Take a look around."
);

store.SetBuyGreeting(
    "What would&"
    + "you like?"
);

store.SetTalkGreeting(
    "Need to&"
    + "ask something?"
);
```

As quebras devem ser pensadas como parte do layout. Não dependa de word wrap para construir a fala do comerciante.

## 4. Adicione um item

```gml
var eggItem = new ShopItem(
    ITEM_EGG,
    15,
    "A perfectly normal egg.",
    1
);

store.AddItem(eggItem);
```

Aqui:

- `ITEM_EGG` é o ID do item;
- `15` é o preço;
- a string é a descrição;
- `1` significa que só existe uma unidade.

Depois da compra, o estoque cai para zero e a entrada passa a refletir esse estado.

## 5. Adicione uma conversa

```gml
var aboutTopic = new ShopTopic(
    "About this place",
    [
        "* Not much to say.",
        "* It's a shop."
    ],
    "about"
);

store.AddTopic(aboutTopic);
```

O ID `"about"` não é obrigatório, mas facilita alterar o tópico depois.

## 6. Adicione uma reação à compra

```gml
eggItem.SetOnPurchased(function(shopInstance, item, price) {
    shopInstance.config.greeting =
        "* You actually bought it.";
});
```

Esse callback acontece depois que a compra foi concluída.

O acesso a `shopInstance.config` é importante: o callback executa mais tarde, então ele não depende de a variável local `store` continuar no escopo do Room Creation Code.

## 7. Configure a apresentação

Por exemplo:

```gml
store.SetBGM(
    snd_shop_music,
    0,
    1.0,
    0.8
);

store.SetListIndicator(true);
```

Se a própria room já desenha o cenário superior, não é necessário configurar background no Shop System.

## 8. Configure a saída

Sem despedida:

```gml
store.SetExitDialogue(false);
```

Com despedida:

```gml
store.SetExitDialogue(
    true,
    [
        "* Come again."
    ]
);
```

Se quiser voltar automaticamente à room realmente visitada antes da loja, entre nela usando `Shop_Goto(room_shop)`. Isso é explicado em [navigation.md](navigation.md).

## 9. Abra a loja

A última linha deve ser:

```gml
Shop_Open(store);
```

Uma configuração completa pode então ficar legível assim:

```gml
var store = new ShopConfig();

store.SetGreeting("* Welcome.");
store.SetBuyGreeting("What would&you like?");
store.SetTalkGreeting("Talk?");
store.SetSell(false, SHOP_SELL_MODE.MESSAGE, undefined, true);
store.SetExitDialogue(false);

var eggItem = new ShopItem(
    ITEM_EGG,
    15,
    "A perfectly normal egg.",
    1
);

eggItem.SetOnPurchased(function(shopInstance, item, price) {
    shopInstance.config.greeting =
        "* You actually bought it.";
});

store.AddItem(eggItem);

var aboutTopic = new ShopTopic(
    "About this place",
    [
        "* Not much to say.",
        "* It's a shop."
    ],
    "about"
);

store.AddTopic(aboutTopic);

Shop_Open(store);
```

Esse formato é preferível a espalhar a configuração por vários objetos, porque a definição daquela loja continua concentrada na própria room.
