# Entrada e saída

A loja precisa saber duas coisas diferentes:

1. como entrar na room da loja;
2. para onde voltar quando Exit terminar.

## Entrada simples

Se a loja não precisa voltar automaticamente para a room anterior:

```gml
room_goto(room_shop);
```

Na room da loja:

```gml
var store = new ShopConfig();
Shop_Open(store);
```

## Retorno automático à room realmente visitada

Para isso, use:

```gml
Shop_Goto(room_shop);
```

`Shop_Goto` salva a room atual antes da troca.

Na loja, se nenhum `exit_room` foi forçado, `Shop_Open()` pode usar essa room memorizada como destino.

## Sistema de transição próprio

Se seu projeto já possui fade ou transição de room:

```gml
Shop_RememberReturnRoom();
CustomTransition(room_shop);
```

Isso separa o registro da origem da troca visual de room.

## Forçar um destino

```gml
store.SetExitRoom(room_ruins);
```

ou:

```gml
store.SetReturnRoom(room_ruins);
```

Use isso quando aquela loja sempre deve levar para um local específico, independentemente de onde o jogador veio.

## Despedida ao sair

Com diálogo:

```gml
store.SetExitDialogue(
    true,
    [
        "* Come again."
    ]
);
```

Sem diálogo:

```gml
store.SetExitDialogue(false);
```

Sem despedida, o runtime deve iniciar a saída sem forçar a interface para o formato de diálogo.

Com despedida, a UI de diálogo permanece até a fala terminar e então inicia a saída.

## Definir texto sem ligar/desligar diretamente

```gml
store.SetGoodbye([
    "* See you."
]);
```

Um array vazio:

```gml
store.SetGoodbye([]);
```

representa ausência de páginas de despedida.

## Callback de saída

```gml
store.SetOnExit(function(shopInstance) {
    return false;
});
```

Se sua lógica fizer a transição por conta própria:

```gml
store.SetOnExit(function(shopInstance) {
    CustomTransition(room_ruins);
    return true;
});
```

## Fade da loja

```gml
store.SetFade(
    true,
    true,
    0.08,
    c_black
);
```

Isso controla apenas o fade pertencente ao Shop System. Se o projeto já possui uma transição global, geralmente é melhor decidir qual dos dois sistemas será responsável por cada etapa, em vez de executar ambos.
