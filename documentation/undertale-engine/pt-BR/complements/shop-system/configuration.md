# Configuração da loja

`ShopConfig` define o comportamento geral da loja. O principal cuidado é separar configuração **estrutural** de conteúdo.

Configuração estrutural responde perguntas como:

- existe Buy?
- Sell é uma lista ou apenas uma resposta do comerciante?
- Talk está disponível?
- existe despedida ao sair?
- qual inventário é usado?

Conteúdo responde:

- o que o comerciante fala?
- quais itens existem?
- quais tópicos existem?
- qual música toca?

## Buy

Para uma loja normal:

```gml
store.SetBuy(true);
```

Para remover Buy:

```gml
store.SetBuy(false, true);
```

Para manter a opção visível, mas desabilitada:

```gml
store.SetBuy(false, false);
```

Use o segundo formato quando a presença da opção tiver significado para o jogador. Se uma loja nunca oferece Buy, normalmente é melhor ocultá-la.

## Sell

Sell possui dois modos.

### Mensagem

O jogador escolhe Sell e o comerciante responde, sem abrir inventário:

```gml
store.SetSell(
    true,
    SHOP_SELL_MODE.MESSAGE,
    [
        "* I don't buy used items."
    ]
);
```

Esse modo é adequado para comerciantes que explicitamente recusam compra.

### Inventário

```gml
store.SetSell(
    true,
    SHOP_SELL_MODE.INVENTORY
);
```

Nesse caso a lista é montada a partir do inventário do jogador e os preços são resolvidos pelo sistema de venda.

### Desabilitado e visível

A assinatura atual de `SetSell` é diferente das outras opções. Para manter Sell visível em cinza:

```gml
store.SetSell(
    false,
    SHOP_SELL_MODE.MESSAGE,
    undefined,
    false
);
```

Não use `store.SetSell(false, false)`: o segundo argumento ainda representa o modo de Sell.

## Talk

```gml
store.SetTalk(true);
```

Oculto:

```gml
store.SetTalk(false, true);
```

Visível, mas indisponível:

```gml
store.SetTalk(false, false);
```

Mesmo com Talk habilitado, o runtime precisa ter tópicos visíveis para que o menu faça sentido.

## Exit

```gml
store.SetExit(true);
```

O comportamento da despedida é separado da existência do botão. `SetExitDialogue(false)` não remove Exit; apenas remove o diálogo de saída.

## Textos

Os setters de texto existem para que a room não precise conhecer os nomes internos dos campos, mas atribuição direta também continua válida.

As duas formas abaixo são equivalentes:

```gml
store.SetGreeting("* Welcome.");
```

```gml
store.greeting = "* Welcome.";
```

Prefira setters quando estiver montando a loja por API. Atribuição direta é útil em callbacks, quando o texto muda em resposta a uma ação.

Exemplo:

```gml
eggItem.SetOnPurchased(function(shopInstance, item, price) {
    shopInstance.config.greeting =
        "* No more eggs.";
});
```

## Textos que valem definir primeiro

Em uma loja nova, estes normalmente são suficientes para estabelecer o comportamento:

```gml
store.SetGreeting("* Welcome.");
store.SetBuyGreeting("What would&you like?");
store.SetTalkGreeting("Talk?");
store.SetPurchaseThanks("Thanks.");
store.SetGoodbye(["* Come again."]);
```

Depois personalize mensagens de erro ou confirmação apenas se aquela loja realmente precisar delas.

## Inventário

Por padrão, a loja usa o inventário de itens do engine.

Só altere:

```gml
store.inventory
```

se a loja realmente trabalha com outro inventário.

Isso é especialmente importante para `ShopItem`: o ID comprado precisa ser válido para o `ItemTypeManager` associado ao inventário usado.
