# Callbacks

Callbacks permitem que a loja reaja ao jogo sem colocar regras específicas dentro de `ui_shop`.

A ideia principal é: **o Shop System controla fluxo; a room controla conteúdo e consequências**.

## Abertura da loja

```gml
store.SetOnOpen(function(shopInstance) {
    global.shop_was_opened = true;
});
```

Use para lógica que precisa acontecer depois que o `ui_shop` terminou o `Setup()`.

Não use `on_open` para construir todos os itens da loja; isso deixa a definição espalhada. Prefira montar o conteúdo antes de `Shop_Open(store)`.

## Saída

```gml
store.SetOnExit(function(shopInstance) {
    return false;
});
```

Retornar `false` deixa o runtime continuar com a saída normal.

Retornar `true` significa que seu callback assumiu a saída:

```gml
store.SetOnExit(function(shopInstance) {
    CustomTransition(room_ruins);
    return true;
});
```

Esse padrão evita que duas transições sejam executadas ao mesmo tempo.

## Compra global

```gml
store.SetOnBuy(function(shopInstance, item, price) {
    global.total_shop_spending += price;
});
```

Use para lógica que deve acontecer com qualquer compra daquela loja.

Para comportamento específico de um item, prefira `item.SetOnPurchased()`.

## Compra específica

```gml
eggItem.SetOnPurchased(function(shopInstance, item, price) {
    global.bought_egg = true;
});
```

A separação recomendada é:

- `store.SetOnBuy()`: regra geral da loja;
- `item.SetOnPurchased()`: consequência específica daquele item.

## Pré-compra

```gml
eggItem.SetOnBuy(function(shopInstance, item) {
    if (global.purchase_locked) {
        return false;
    }

    return true;
});
```

Esse callback roda antes de concluir a transação e pode ser usado como validação adicional.

## Venda

```gml
store.SetOnSell(function(shopInstance, itemId, price) {
    global.total_shop_sales += price;
});
```

## Mudança de estado

```gml
store.SetOnStateChanged(function(shopInstance, oldState, newState) {
    if (newState == SHOP_STATE.TALK) {
        global.opened_talk_once = true;
    }
});
```

Esse callback é útil quando você precisa observar a navegação sem modificar o próprio `ui_shop`.

## Ao abrir um tópico específico

```gml
aboutTopic.SetOnOpen(function(shopInstance, topic) {
    topic.SetSuffix("");
    global.read_about_topic = true;
});
```

Esse callback é indicado para marcar um assunto como lido ou alterar algo no momento em que ele é escolhido.

## Callbacks que ainda não são disparados

O `ShopConfig` possui setters preparados para abertura e fechamento de menus:

```gml
store.SetOnMainOpen(callback);
store.SetOnBuyOpen(callback);
store.SetOnSellOpen(callback);
store.SetOnTalkOpen(callback);
store.SetOnTalkClose(callback);
```

`ShopTopic` também possui:

```gml
aboutTopic.SetOnComplete(callback);
```

Na versão atual do runtime esses callbacks ainda não são chamados automaticamente.

Não coloque lógica essencial neles enquanto essa integração não existir. A lista atualizada de recursos suportados fica em [runtime-status.md](runtime-status.md).
