# Sistema de Loja

O Shop System permite definir uma loja inteira no Room Creation Code sem criar um objeto diferente para cada comerciante. A room fornece os dados; `ui_shop` executa a interface, navegação, compra, venda e diálogo.

O sistema é dividido em três estruturas:

- `ShopConfig`: configuração da loja inteira.
- `ShopItem`: uma entrada do menu Buy.
- `ShopTopic`: uma opção do menu Talk.

Uma loja simples tem este formato:

```gml
var store = new ShopConfig();

store.SetGreeting("* Welcome.");

var eggItem = new ShopItem(
    ITEM_EGG,
    10,
    "An egg."
);

store.AddItem(eggItem);

Shop_Open(store);
```

Isso é o núcleo do sistema. O restante da documentação explica como evoluir essa configuração sem transformar o Room Creation Code em um bloco difícil de manter.

## Ordem recomendada

Ao criar uma loja nova, normalmente vale seguir esta ordem:

1. crie o `ShopConfig`;
2. defina quais opções do menu principal existem;
3. configure os textos do comerciante;
4. adicione os itens;
5. adicione os tópicos de conversa;
6. configure callbacks e estados especiais;
7. configure apresentação e áudio;
8. configure entrada e saída;
9. chame `Shop_Open(store)`.

Um exemplo completo seguindo essa ordem aparece em [getting-started.md](getting-started.md).

## Guias

- [getting-started.md](getting-started.md): criação de uma loja do zero.
- [configuration.md](configuration.md): Buy, Sell, Talk, Exit e textos.
- [items.md](items.md): itens, estoque, preços, cores, serviços e compra.
- [talk.md](talk.md): conversas e tópicos.
- [callbacks.md](callbacks.md): callbacks e estado da loja.
- [presentation.md](presentation.md): visual, áudio, BGM e indicador de lista.
- [navigation.md](navigation.md): entrada, saída e room de retorno.
- [troubleshooting.md](troubleshooting.md): problemas comuns e diagnóstico.
- [runtime-status.md](runtime-status.md): recursos realmente consumidos pelo `ui_shop` atual.

## Referência de API

A lista completa de funções, métodos, parâmetros e retornos não é duplicada nestes guias. Ela fica em:

`shop-system-api.pt-BR.json`

Use os arquivos `.md` para entender **como construir a loja**. Use o JSON quando precisar consultar a assinatura exata de uma função.
