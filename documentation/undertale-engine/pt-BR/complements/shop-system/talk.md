# Conversas

`ShopTopic` representa uma opção do menu Talk.

Uma conversa possui três partes conceituais:

1. o texto mostrado na lista;
2. as páginas exibidas ao selecionar;
3. o estado que ela pode alterar.

## Tópico básico

```gml
var aboutTopic = new ShopTopic(
    "About this place",
    [
        "* There's not much here.",
        "* That's why I like it."
    ],
    "about"
);

store.AddTopic(aboutTopic);
```

O terceiro argumento é um ID. Ele é útil quando outra parte da loja precisa encontrar ou substituir aquele tópico.

## Use IDs estáveis

Em vez de procurar pelo texto visível:

```gml
store.FindTopic("about");
```

Isso permite mudar o label sem quebrar a lógica.

```gml
aboutTopic.SetLabel("About this shop");
```

## Marcar um assunto como novo

```gml
aboutTopic.SetSuffix(" (NEW)");
aboutTopic.SetColor(c_yellow);
```

Depois que o jogador abrir o tópico:

```gml
aboutTopic.SetOnOpen(function(shopInstance, topic) {
    topic.SetSuffix("");
    topic.SetColor(c_white);
});
```

Esse padrão é melhor do que criar duas versões do mesmo tópico apenas para representar `(NEW)`.

## Conversa condicional

Ocultar até uma condição:

```gml
aboutTopic.SetGetVisible(function(shopInstance, topic) {
    return global.knows_about_shop;
});
```

Manter visível, mas bloquear:

```gml
aboutTopic.SetGetEnabled(function(shopInstance, topic) {
    return global.can_ask_about_shop;
});
```

## Páginas dinâmicas

```gml
aboutTopic.SetGetPages(function(shopInstance, topic) {
    if (global.bought_egg) {
        return [
            "* About that egg...",
            "* Never mind."
        ];
    }

    return [
        "* Eggs are normal here."
    ];
});
```

Isso é útil quando o assunto continua sendo o mesmo, mas a resposta muda.

## Alterar outro tópico manualmente

O `ShopConfig` possui operações que já modificam a lista imediatamente:

```gml
var nextTopic = new ShopTopic(
    "About the egg",
    [
        "* So you bought it."
    ],
    "egg_after"
);

store.ReplaceTopic(
    "about",
    nextTopic
);
```

Também é possível remover:

```gml
store.RemoveTopic("about");
```

Esse tipo de alteração pode ser feito por um callback que já seja executado pelo runtime.

## Fluxo automático preparado na API

`ShopTopic` também possui conceitos de sucessor:

```gml
aboutTopic.SetNext(nextTopic);
aboutTopic.ReplaceWith(nextTopic);
aboutTopic.SetGetNext(callback);
aboutTopic.SetOnComplete(callback);
```

Esses métodos descrevem uma API útil para progressão de conversa, mas o `ui_shop` atual ainda não processa automaticamente a conclusão do tópico e a substituição.

Portanto, se você precisa desse comportamento **agora**, use `ReplaceTopic()` dentro de um callback já suportado ou aguarde a integração específica do runtime.

Veja [runtime-status.md](runtime-status.md) para a situação exata.
