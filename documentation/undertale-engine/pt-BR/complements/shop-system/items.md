# Itens

`ShopItem` descreve uma linha do menu Buy e tudo o que acontece ao comprá-la.

Pense nele como uma definição de oferta, não apenas como um ID de inventário. Por isso ele também pode representar serviços ou eventos.

## Item comum

```gml
var diceItem = new ShopItem(
    ITEM_DICE,
    25,
    "A six-sided die."
);

store.AddItem(diceItem);
```

Se `ITEM_DICE` estiver registrado no `ItemTypeManager` do inventário, a compra adiciona o item normalmente.

## Estoque limitado

```gml
var eggItem = new ShopItem(
    ITEM_EGG,
    10,
    "The EGG.",
    1
);
```

O valor de estoque é:

- `-1`: infinito;
- `0`: esgotado;
- positivo: quantidade restante.

Use estoque no `ShopItem`, em vez de manter uma segunda variável na room, quando a quantidade pertence à própria oferta.

## Cor da entrada

```gml
eggItem.SetColor("#DC143C");
```

Também são aceitos:

```gml
eggItem.SetColor(c_yellow);
eggItem.SetColor("c_yellow");
eggItem.SetColor([255, 255, 0]);
```

É possível separar a cor normal da cor de indisponível:

```gml
eggItem.SetColor(
    "#DC143C",
    c_gray
);
```

## Som específico de compra

```gml
eggItem.SetBuySound(snd_ominous);
```

Use isso para itens cuja compra precisa de uma reação sonora distinta. Sem som específico, a loja usa o som de confirmação padrão.

## Agradecimento específico

```gml
eggItem.SetPurchaseThanks(
    "* ...Interesting."
);
```

Se não houver texto específico, o item usa `store.text_purchase_thanks`.

## Reação depois da compra

```gml
eggItem.SetOnPurchased(function(shopInstance, item, price) {
    global.got_special_egg = true;

    shopInstance.config.greeting =
        "* (Well...)&"
        + "* (There's no a man here.)";
});
```

Esse é o lugar certo para:

- mudar flags;
- alterar o estado do mundo;
- trocar falas futuras;
- desbloquear outra oferta;
- iniciar lógica específica da compra.

O callback recebe a instância runtime da loja, o próprio `ShopItem` e o preço realmente pago.

## Validar antes de comprar

`SetOnBuy` ocorre antes da conclusão:

```gml
diceItem.SetOnBuy(function(shopInstance, item) {
    if (global.dice_purchase_blocked) {
        return false;
    }

    return true;
});
```

Use isso quando a compra precisa de uma condição adicional que não é simplesmente Gold, estoque ou espaço no inventário.

## Preço dinâmico

```gml
diceItem.SetGetPrice(function(shopInstance, item) {
    if (global.discount_active) {
        return 10;
    }

    return 25;
});
```

O preço é recalculado quando a loja precisa dele, então o mesmo item pode reagir ao estado do jogo sem reconstruir a lista.

## Nome e descrição dinâmicos

```gml
diceItem.SetGetName(function(shopInstance, item) {
    return global.dice_revealed
        ? "Lucky Dice"
        : "???";
});

diceItem.SetGetDescription(function(shopInstance, item) {
    return global.dice_revealed
        ? "It feels important."
        : "You cannot tell what it is.";
});
```

## Oferta condicional

Para remover completamente uma oferta:

```gml
diceItem.SetGetVisible(function(shopInstance, item) {
    return global.dice_unlocked;
});
```

Para manter a oferta mas impedir a compra:

```gml
diceItem.SetGetEnabled(function(shopInstance, item) {
    return global.can_buy_dice;
});
```

A diferença é importante:

- invisível: o jogador não vê a oferta;
- desabilitado: a oferta continua fazendo parte da interface.

## Serviço ou evento sem item

Nem toda compra precisa inserir algo no inventário.

```gml
var healService = new ShopItem(
    "heal_service",
    30,
    "Rest for a while."
);

healService.SetDeliversItem(false);

healService.SetOnPurchased(function(shopInstance, item, price) {
    Player_SetHP(Player_GetMaxHP());
});

store.AddItem(healService);
```

Quando `delivers_item` é `false`, o ID deixa de ser tratado como um item que precisa entrar no inventário.

Isso permite usar o mesmo sistema para serviços, upgrades e eventos sem criar outro menu de compra.
