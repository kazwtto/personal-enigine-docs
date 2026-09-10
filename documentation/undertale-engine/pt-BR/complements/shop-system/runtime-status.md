# Compatibilidade do runtime atual

Este arquivo existe para evitar confundir "método presente no ShopSystem" com "comportamento já executado pelo ui_shop".

## Implementado no ui_shop atual

### Loja

- criação por `Shop_Open`;
- Buy, Sell, Talk e Exit;
- opções principais desabilitadas/visíveis quando o runtime possui os flags correspondentes;
- diálogo de saída configurável;
- BGM;
- fade;
- callback `on_open`;
- callback `on_exit`;
- callback `on_state_changed`.

### Compra

- preço;
- estoque;
- validação de item;
- capacidade de inventário;
- cor por item;
- som por item;
- callback pré-compra;
- callback pós-compra;
- callback global pós-compra;
- agradecimento padrão;
- agradecimento específico por item.

### Venda

- Sell por mensagem;
- Sell por inventário;
- preço dinâmico de venda;
- formatação customizada de linha;
- callback global de venda.

### Conversa

- tópicos visíveis;
- tópicos habilitados/desabilitados;
- label dinâmico;
- páginas dinâmicas;
- cor dinâmica;
- callback `ShopTopic.on_open`.

### Apresentação

- background por sprite;
- background por callback;
- comerciante por sprite;
- comerciante por callback;
- foreground customizado;
- ausência de background obrigatório;
- indicador lateral opcional;
- indicador oculto com zero ou uma entrada;
- centralização vertical dos pontos;
- setas de scroll.

## Presente no ShopSystem, mas ainda não executado pelo ui_shop

### Voz customizada de diálogo

```gml
store.SetDialogSound(...);
aboutTopic.SetDialogSound(...);
```

O writer atual ainda usa `{voice 0}` fixo.

### Callbacks de abertura de menu

```gml
store.SetOnMainOpen(...);
store.SetOnBuyOpen(...);
store.SetOnSellOpen(...);
store.SetOnTalkOpen(...);
store.SetOnTalkClose(...);
```

Os campos existem no `ShopConfig`, mas o runtime atual não os dispara.

### Conclusão e progressão automática de tópico

```gml
aboutTopic.SetOnComplete(...);
aboutTopic.SetNext(...);
aboutTopic.ReplaceWith(...);
aboutTopic.SetGetNext(...);
```

A estrutura existe, mas o `ui_shop` atual ainda não aplica essa progressão automaticamente.

Até essa integração ser feita, trate esses métodos como API preparada, não como comportamento ativo.
