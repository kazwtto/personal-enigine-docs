# Configuração da loja

`ShopConfig` concentra o comportamento geral da loja.

```gml
var storeConfig = new ShopConfig();
```

## Conteúdo

### Adicionar item

```gml
var eggItem = new ShopItem(ITEM_EGG, 0, "The EGG.");
storeConfig.AddItem(eggItem);
```

Também é possível manipular o array diretamente:

```gml
array_push(storeConfig.items, eggItem);
```

### Adicionar conversa

```gml
var aboutTopic = new ShopTopic(
    "About",
    ["* This is a shop."],
    "about"
);

storeConfig.AddTopic(aboutTopic);
```

## Buy

```gml
storeConfig.SetBuy(true);
```

Desabilitado e oculto:

```gml
storeConfig.SetBuy(false, true);
```

Desabilitado, mas visível:

```gml
storeConfig.SetBuy(false, false);
```

## Sell

Assinatura atual:

```gml
SetSell(enabled, mode, pages, hide_when_disabled)
```

Venda pelo inventário:

```gml
storeConfig.SetSell(
    true,
    SHOP_SELL_MODE.INVENTORY
);
```

Sell que apenas responde com diálogo:

```gml
storeConfig.SetSell(
    true,
    SHOP_SELL_MODE.MESSAGE,
    ["* I don't buy used items."]
);
```

Desabilitado, mas visível:

```gml
storeConfig.SetSell(
    false,
    SHOP_SELL_MODE.MESSAGE,
    undefined,
    false
);
```

> `SetSell(false, false)` não representa `enabled=false, hide=false` na assinatura atual. O segundo argumento ainda é `mode`.

## Talk

```gml
storeConfig.SetTalk(true);
```

Desabilitado e oculto:

```gml
storeConfig.SetTalk(false, true);
```

Desabilitado, mas visível:

```gml
storeConfig.SetTalk(false, false);
```

## Exit

```gml
storeConfig.SetExit(true);
```

Desabilitado e oculto:

```gml
storeConfig.SetExit(false, true);
```

Desabilitado, mas visível:

```gml
storeConfig.SetExit(false, false);
```

## Textos do menu

```gml
storeConfig.SetBuyText("Buy");
storeConfig.SetSellText("Sell");
storeConfig.SetTalkText("Talk");
storeConfig.SetExitText("Exit");
storeConfig.SetYesText("Yes");
storeConfig.SetNoText("No");
storeConfig.SetGoldText("G");
```

## Falas principais

```gml
storeConfig.SetGreeting("* Welcome.");
storeConfig.SetBuyGreeting("What would\nyou like?");
storeConfig.SetSellGreeting("Sell\nsomething?");
storeConfig.SetTalkGreeting("Talk?");
```

Os campos continuam públicos e podem ser alterados diretamente:

```gml
storeConfig.greeting = "* Welcome.";
```

## Textos de compra

```gml
storeConfig.SetBuyPrompt("Buy it for\n{PRICE}G ?");
storeConfig.SetPurchaseThanks("Thanks.");
storeConfig.SetJustLookingText("Just\nlooking?");
storeConfig.SetNotEnoughGoldText("Not enough\nmoney.");
storeConfig.SetInventoryFullText("You're carrying\ntoo much.");
storeConfig.SetSoldOutText("Sold out.");
storeConfig.SetInvalidItemText("This item\nisn't available.");
```

`{PRICE}` é substituído pelo preço atual.

## Textos de venda

```gml
storeConfig.SetSellPrompt("Sell it for\n{PRICE}G ?");
storeConfig.SetSellMessage(["* I don't buy used items."]);
storeConfig.SetNothingToSellText("* You have nothing to sell.");
storeConfig.SetSaleThanks("Thanks!");
```

## Despedida

```gml
storeConfig.SetGoodbye(["* Come again."]);
```

O diálogo de saída pode ser habilitado ou removido separadamente. Veja [Entrada e saída](navigation.md).

## Inventário

Por padrão:

```gml
Item_GetInventoryItems()
```

Para fornecer outro inventário:

```gml
storeConfig.inventory = customInventory;
```

## Layout

A configuração contém:

```gml
storeConfig.layout
```

que é uma instância de `ShopLayout`.

Exemplos:

```gml
storeConfig.layout.divider_x = 210;
storeConfig.layout.list_rows = 4;
storeConfig.layout.description_open_y = 40;
```

O layout padrão assume uma room lógica de `320x240`.
