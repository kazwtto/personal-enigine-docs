# Problemas comuns

Esta página reúne problemas que já apareceram durante a implementação do Shop System.

## Um item causa erro ao comprar

Primeiro verifique se o ID está registrado no mesmo `ItemTypeManager` usado pelo inventário.

Um `ShopItem` que entrega item:

```gml
var diceItem = new ShopItem(
    ITEM_DICE,
    25,
    "A dice."
);
```

precisa usar um `item_id` válido para o inventário retornado por:

```gml
Item_GetInventoryItems()
```

ou pelo inventário customizado em `store.inventory`.

Se a oferta não representa item real, use:

```gml
serviceItem.SetDeliversItem(false);
```

## A cor causa erro em `draw_set_color`

Use um formato aceito pelo Shop System:

```gml
c_yellow
"c_yellow"
"#FFFF00"
[255, 255, 0]
```

`Shop_ResolveColor()` converte esses formatos antes do Draw.

## Sell some mesmo usando false

A assinatura atual é:

```gml
SetSell(
    enabled,
    mode,
    pages,
    hide_when_disabled
)
```

Logo isto não significa "desabilitado mas visível":

```gml
store.SetSell(false, false);
```

Use:

```gml
store.SetSell(
    false,
    SHOP_SELL_MODE.MESSAGE,
    undefined,
    false
);
```

## `SetExitDialogue(false)` não faz efeito

O runtime atual usa `exit_dialogue_enabled`. O Create também mantém compatibilidade com o nome antigo `exit_dialog_enabled`.

Se estiver usando um Create anterior a essa correção, o setter pode ser ignorado por diferença de nome.

## A alma aparece na lista e em Yes/No ao mesmo tempo

Durante `BUY_CONFIRM` ou `SELL_CONFIRM`, o cursor da lista deve ser escondido. Apenas o cursor da confirmação deve ser desenhado.

Se os dois aparecem, o Draw usado é anterior à correção que condiciona o cursor da lista ao estado normal de Buy/Sell.

## O indicador lateral aparece com um único item

Na versão atual do Draw, `_DrawListIndicator` retorna imediatamente quando:

```gml
_count <= 1
```

Se um ponto ainda aparece para uma única entrada, o Draw em uso é anterior à correção.

## O indicador dá erro com `_divider_x`, `_panel_y` ou `_room_h`

Funções anônimas em GML não devem depender de variáveis locais externas como se fossem closures normais.

A implementação atual:

- recebe o divisor como argumento;
- lê `panel_y` e `room_height` por `config.layout`.

Se aparecer erro de "not set before reading", verifique se o Draw foi misturado com uma versão anterior.

## A loja volta para a room errada

`room_previous()` não representa necessariamente a room realmente visitada antes.

Use:

```gml
Shop_Goto(room_shop);
```

ou:

```gml
Shop_RememberReturnRoom();
```

antes da transição.

## O som customizado de diálogo não funciona

`SetDialogSound()` existe no `ShopSystem`, mas o `ui_shop` atual ainda instancia o `text_typer` com `{voice 0}` fixo.

Isso é uma limitação conhecida do runtime atual, não uma configuração incorreta da room.

## `SetNext()` ou `SetOnComplete()` não faz nada

Esses métodos estão preparados na API de `ShopTopic`, mas o runtime atual ainda não executa automaticamente a conclusão e substituição de tópicos.

Use `store.ReplaceTopic()` manualmente dentro de um callback suportado quando precisar do comportamento imediatamente.
