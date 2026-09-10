# Apresentação

A parte superior da loja pode ser desenhada pela própria room ou pelo `ShopConfig`. A parte inferior continua sendo controlada pelo `ui_shop`.

## Deixar a room desenhar o cenário

Se a room já contém background e comerciante, não configure nenhum background no Shop System.

O Draw atual não força um retângulo preto na metade superior quando não existe `background_sprite` nem callback de background.

Esse é o caminho mais simples para rooms que já têm seus próprios objetos visuais.

## Background por sprite

```gml
store.background_sprite = spr_shop_background;
store.background_x = 0;
store.background_y = 0;
```

## Background customizado

```gml
store.SetDrawBackground(function(shopInstance) {
    draw_sprite(
        spr_shop_background,
        0,
        0,
        0
    );
});
```

Use callback quando a cena depende de estado, múltiplos sprites ou desenho procedural.

## Comerciante por sprite

```gml
store.merchant_sprite = spr_shopkeeper;
store.merchant_x = 160;
store.merchant_y = 0;
store.merchant_image_speed = 0.15;
```

## Comerciante customizado

```gml
store.SetDrawMerchant(function(shopInstance) {
    var frame = floor(shopInstance.merchant_image);

    draw_sprite(
        spr_shopkeeper,
        frame,
        160,
        0
    );
});
```

## Foreground

```gml
store.SetDrawForeground(function(shopInstance) {
    // efeitos ou elementos por cima da cena
});
```

## BGM

```gml
store.SetBGM(
    snd_shop_music,
    0,
    1.0,
    0.8
);
```

Os argumentos adicionais permitem escolher loop e se a música deve parar ao sair.

## Sons de menu

```gml
store.SetMenuSounds(
    snd_menu_switch,
    snd_menu_confirm,
    snd_menu_cancel
);
```

## Som específico de compra

Isso pertence ao item, não à loja:

```gml
eggItem.SetBuySound(snd_ominous);
```

Assim itens comuns continuam usando o som normal, enquanto uma oferta especial pode ter outro feedback.

## Som do diálogo

A API possui:

```gml
store.SetDialogSound(snd_ominous);
aboutTopic.SetDialogSound(snd_ominous);
```

Mas o `ui_shop` atual ainda cria o `text_typer` com `{voice 0}` fixo. Esses setters ainda não mudam a voice até que o runtime seja integrado.

## Indicador lateral de lista

O Shop System reutiliza os sprites do scrollbar do inventário de batalha:

```gml
spr_battle_menu_item_scrollbar_dot
spr_battle_menu_item_scrollbar_arrow
```

Ele vem habilitado.

Para remover:

```gml
store.SetListIndicator(false);
```

Para mostrar apenas em alguns menus:

```gml
store.SetListIndicatorMenus(
    true,   // Buy
    true,   // Sell
    false   // Talk
);
```

O comportamento atual é:

- nenhuma marca com zero ou uma entrada;
- um ponto por entrada quando existem duas ou mais;
- frame destacado no item selecionado;
- nenhum ponto selecionado quando o cursor está em Exit;
- conjunto centralizado verticalmente na caixa;
- setas quando existe conteúdo fora da área visível.

Você pode substituir os sprites:

```gml
store.SetListIndicator(
    true,
    spr_custom_dot,
    spr_custom_arrow
);
```

## Layout do indicador

```gml
store.SetListIndicatorLayout(
    -16,
    170,
    10,
    10,
    5
);
```

A versão atual do Draw centraliza verticalmente o conjunto de pontos de forma automática. Por isso o valor `y` permanece na API por compatibilidade, mas não controla atualmente o centro vertical.
