# Áudio e interface

## Sons do menu

```gml
storeConfig.SetMenuSounds(
    snd_menu_switch,
    snd_menu_confirm,
    snd_menu_cancel
);
```

A ordem é:

1. movimento;
2. confirmação;
3. cancelamento.

## BGM

```gml
storeConfig.SetBGM(
    snd_shop_music,
    0,
    1.0,
    0.8,
    true,
    true
);
```

Parâmetros:

```text
audio
slot
pitch
volume
loop
stop_on_exit
```

Exemplo curto:

```gml
storeConfig.SetBGM(
    snd_shop_music,
    0,
    1.0,
    0.8
);
```

## Som de compra por item

```gml
eggItem.SetBuySound(snd_ominous);
```

## Som do diálogo

A API possui:

```gml
storeConfig.SetDialogSound(snd_ominous);
aboutTopic.SetDialogSound(snd_ominous);
```

No runtime atual, `_TextShow()` ainda usa `{voice 0}` diretamente. Esses setters existem, mas ainda não controlam a voice do `text_typer`.

## Background

Sprite:

```gml
storeConfig.background_sprite = spr_shop_background;
storeConfig.background_x = 0;
storeConfig.background_y = 0;
```

Callback:

```gml
storeConfig.SetDrawBackground(function(shopInstance) {
    draw_sprite(
        spr_shop_background,
        0,
        0,
        0
    );
});
```

Se não houver `background_sprite` nem `draw_background`, o Draw atual não força um fundo preto na metade superior.

## Comerciante

```gml
storeConfig.merchant_sprite = spr_shopkeeper;
storeConfig.merchant_x = 160;
storeConfig.merchant_y = 0;
```

Ou:

```gml
storeConfig.SetDrawMerchant(function(shopInstance) {
    draw_sprite(
        spr_shopkeeper,
        0,
        160,
        0
    );
});
```

## Foreground

```gml
storeConfig.SetDrawForeground(function(shopInstance) {
    // desenho acima da interface
});
```

## Cursor

Campos disponíveis:

```gml
storeConfig.cursor_sprite
storeConfig.cursor_subimg
storeConfig.cursor_xscale
storeConfig.cursor_yscale
```

## Indicador de lista

O indicador usa por padrão os mesmos assets do inventário de batalha:

```gml
spr_battle_menu_item_scrollbar_dot
spr_battle_menu_item_scrollbar_arrow
```

Ele vem ativado.

### Desativar

```gml
storeConfig.SetListIndicator(false);
```

### Ativar

```gml
storeConfig.SetListIndicator(true);
```

### Escolher menus

```gml
storeConfig.SetListIndicatorMenus(
    true,
    true,
    false
);
```

Ordem:

```text
Buy
Sell
Talk
```

### Trocar sprites

```gml
storeConfig.SetListIndicator(
    true,
    spr_custom_dot,
    spr_custom_arrow
);
```

### Layout

```gml
storeConfig.SetListIndicatorLayout(
    -16,
    170,
    10,
    10,
    5
);
```

No Draw atual:

- não aparece com `0` ou `1` entrada;
- os pontos são centralizados verticalmente na caixa inferior;
- o ponto selecionado usa o frame selecionado;
- quando `Exit` está selecionado, nenhum item fica marcado;
- setas aparecem quando existem entradas acima ou abaixo da área visível.

O argumento `y` continua na API para compatibilidade, mas a posição vertical atual é calculada automaticamente pelo Draw.
