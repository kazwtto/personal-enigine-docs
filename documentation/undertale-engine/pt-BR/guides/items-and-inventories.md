<!-- locale: pt-BR; content-id: items-and-inventories -->

# Itens e inventários

> [!IMPORTANT]
> Este capítulo descreve o sistema **atual** da v0.6.0, baseado em construtores
> `ItemType`. Tutoriais antigos que mandam criar um objeto filho de `item` e
> chamar `Item_Add()` pertencem à branch legada.

## Visão geral

Um item atual possui três partes:

1. um construtor que herda `ItemType` ou `ItemTypeSimple`;
2. um ID único registrado em `Item_Custom`;
3. uma entrada em algum `Inventory`.

```text
CustomItem_Torta
      ↓ registrado como
ITEM_TORTA = "torta"
      ↓ armazenado em
Item_GetInventoryItems()
```

O inventário armazena **IDs**, não instâncias. O gerenciador resolve o ID para o
tipo de item quando precisa mostrar nome, usar, inspecionar ou descartar.

## Tutorial: item de cura

### 1. Crie o script do item

Crie o script `CustomItem_Torta`:

```gml
function CustomItem_Torta() : ItemTypeSimple("torta") constructor {
    function OnUse(inventory, index) {
        Dialog_Add(
            Item_GetTextEat(GetName()) +
            Item_GetTextHeal(20)
        );
        Dialog_Start();

        Player_Heal(20);
        audio_play_sound(snd_item_heal, 0, false);
        inventory.Remove(index);
    }
}
```

`ItemTypeSimple("torta")` implementa automaticamente:

- `GetName()` com a chave `item.torta.name`;
- `OnInfo()` com a chave `item.torta.info`;
- `OnDrop()` herdado de `ItemType`, com texto aleatório e remoção.

O item de cura remove a si mesmo depois do uso. Se ele deve permanecer, retire
`inventory.Remove(index)`.

### 2. Registre em `Item_Custom`

Dentro do primeiro bloco da função `Item_Custom()`:

```gml
#macro ITEM_TORTA "torta"
itemTypes.Register(ITEM_TORTA, new CustomItem_Torta());
```

Regras do ID:

- não pode ser `""`, pois esse valor é `ITEM_EMPTY`;
- deve ser único;
- use letras minúsculas e `_` para manter consistência;
- defina uma macro para não repetir a string pelo projeto.

Registrar duas vezes o mesmo ID gera erro fatal.

### 3. Adicione os textos de idioma

Em `datafiles/locale/english/string/item.json`, adicione propriedades ao objeto
JSON existente:

```json
{
    "item.torta.name": "Pie",
    "item.torta.info": "* Pie - Heals 20 HP&* A homemade pie."
}
```

Faça o equivalente em cada idioma. O arquivo `string.txt` da pasta do idioma já
lista `string/item.json`; se criar outro JSON, inclua seu caminho nesse índice.

JSON não aceita vírgula depois da última propriedade. Um erro de sintaxe pode
impedir o carregamento de todo o arquivo.

### 4. Entregue o item ao jogador

Para começar com ele, em `Player_CustomInitialData()`:

```gml
var items = Item_GetInventoryItems();
items.Add(ITEM_TORTA);
```

Para entregar durante o jogo:

```gml
var items = Item_GetInventoryItems();

if (items.Add(ITEM_TORTA)) {
    Dialog_Add("* Você recebeu a Torta!{sound `snd_item_get`}");
} else {
    Dialog_Add("* Seu inventário está cheio.");
}
Dialog_Start();
```

`Add()` devolve `false` se não houver capacidade.

## `ItemType` x `ItemTypeSimple`

### Base completa: `ItemType`

Use quando o nome ou a informação são calculados em tempo de execução:

```gml
function CustomItem_MoedaEstranha() : ItemType() constructor {
    function GetName() {
        return choose("Moeda?", "Moeda!", "Moeda");
    }

    function OnUse(inventory, index) {
        var ganho = irandom_range(1, 5);
        Player_SetGold(Player_GetGold() + ganho);
        Dialog_Add("* A moeda virou " + string(ganho) + "G.");
        Dialog_Start();
        inventory.Remove(index);
    }

    function OnInfo(inventory, index) {
        Dialog_Add("* Ninguém sabe de onde ela veio.");
        Dialog_Start();
    }

    // OnDrop é opcional; a base já remove e mostra um texto localizado.
}
```

### Atalho localizado: `ItemTypeSimple`

Use quando nome e informação vêm do idioma:

```gml
function CustomItem_Chave() : ItemTypeSimple("chave") constructor {
    function OnUse(inventory, index) {
        Dialog_Add("* A chave não serve aqui.");
        Dialog_Start();
    }

    // Uma chave importante talvez não deva poder ser descartada.
    function OnDrop(inventory, index) {
        Dialog_Add("* É melhor ficar com ela.");
        Dialog_Start();
    }
}
```

## Contrato de um item

| Método | Quando é chamado | Responsabilidade |
|---|---|---|
| `GetName()` | menus e listas | devolver uma string curta |
| `OnUse(inventory, index)` | opção Use ou menu ITEM da batalha | aplicar o efeito e decidir se remove/troca |
| `OnInfo(inventory, index)` | opção Info | iniciar um diálogo informativo |
| `OnDrop(inventory, index)` | opção Drop | confirmar/recusar e, se desejado, remover |

`inventory` é o inventário que contém o item; não presuma que será sempre o
inventário principal. `index` começa em zero e pode mudar quando um item anterior
é removido.

## Armas

```gml
function CustomItem_EspadaMadeira()
    : ItemTypeSimple("espada_madeira") constructor {

    function OnUse(inventory, index) {
        Dialog_Add(Item_GetTextEquip(GetName()));
        Dialog_Start();

        var anterior = Player_GetItemWeapon();
        inventory.Set(index, anterior);
        Player_SetItemWeapon(ITEM_ESPADA_MADEIRA);
        Player_SetAtkItem(4);

        audio_play_sound(snd_item_equip, 0, false);
    }
}
```

Registre:

```gml
#macro ITEM_ESPADA_MADEIRA "espada_madeira"
itemTypes.Register(
    ITEM_ESPADA_MADEIRA,
    new CustomItem_EspadaMadeira()
);
```

`Inventory.Set(index, ITEM_EMPTY)` remove o slot. Portanto, equipar funciona
mesmo quando não havia arma anterior.

## Armaduras

```gml
function CustomItem_Cachecol()
    : ItemTypeSimple("cachecol") constructor {

    function OnUse(inventory, index) {
        Dialog_Add(Item_GetTextEquip(GetName()));
        Dialog_Start();

        var anterior = Player_GetItemArmor();
        inventory.Set(index, anterior);
        Player_SetItemArmor(ITEM_CACHECOL);
        Player_SetDefItem(3);

        audio_play_sound(snd_item_equip, 0, false);
    }
}
```

Registre `ITEM_CACHECOL` como qualquer outro item.

> [!NOTE]
> O bônus do equipamento fica separado do ID: `Player_SetAtkItem`,
> `Player_SetDefItem`, `Player_SetSpdItem` e `Player_SetInvItem`. Ao trocar de
> equipamento, atualize os bônus correspondentes.

## Telefone

Telefonemas também são tipos de item, mas ficam no inventário `phones`:

```gml
function CustomItem_TelefoneMaya() : ItemType() constructor {
    function GetName() {
        return "Ligar para Maya";
    }

    function OnUse(inventory, index) {
        audio_play_sound(snd_phone_call, 0, false);
        Dialog_Add("* Discando...{pause}{clear}");

        if (room == room_corredor) {
            Dialog_Add("* Maya: Estou logo ali.");
        } else {
            Dialog_Add("* Maya: Continue em frente!");
        }

        Dialog_Start();
    }

    function OnInfo(inventory, index) {
        Dialog_Add("* Um telefone antigo.");
        Dialog_Start();
    }
}
```

Em `Item_Custom`:

```gml
#macro ITEM_TELEFONE_MAYA "telefone_maya"
itemTypes.Register(ITEM_TELEFONE_MAYA, new CustomItem_TelefoneMaya());
```

Em `Player_CustomInitialData`:

```gml
Item_GetInventoryPhones().Add(ITEM_TELEFONE_MAYA);
```

## Inventários padrão

`Item_Custom` registra:

| ID | Getter recomendado | Capacidade padrão |
|---|---|---:|
| `items` | `Item_GetInventoryItems()` | 8 |
| `phones` | `Item_GetInventoryPhones()` | 8 |
| `box1` | gerenciador ou `Item_GetInventoryBoxes()` | 10 |
| `box2` | gerenciador ou `Item_GetInventoryBoxes()` | 10 |

Para criar outro inventário dentro de `Item_Custom()`:

```gml
inventories.Register("key_items", new Inventory(itemTypes, 16));
```

E um getter:

```gml
function Item_GetInventoryKeyItems() {
    return Item_GetInventoryManager().Get("key_items");
}
```

A zona `inventories` do armazenamento estático salva todos os inventários
registrados. Se o novo inventário for registrado antes de `Storage_Init`, ele
entra no save automaticamente.

> [!WARNING]
> No commit analisado, o `switch` de `Item_GetInventoryBoxes(index)` não possui
> `break`; o índice 0 cai no caso 1 e pode retornar `box2`. Enquanto isso não for
> corrigido na sua base, acesse explicitamente com
> `Item_GetInventoryManager().Get("box1")` ou adicione os `break`.

## API de `Inventory`

Índices começam em `0`.

| Método | Resultado |
|---|---|
| `GetCapacity()` | capacidade máxima |
| `GetCount()` | quantidade atual |
| `Get(index)` | ID; acusa índice fora da quantidade |
| `GetOrEmpty(index)` | ID ou `ITEM_EMPTY` dentro da capacidade |
| `GetItem(index)` | objeto `ItemType` do slot |
| `GetItemOrUndefined(index)` | tipo ou `undefined` para vazio |
| `GetItemName(index)` | nome exibível |
| `Add(itemId)` | adiciona no fim; devolve sucesso |
| `Insert(index, itemId)` | insere e desloca os seguintes |
| `Set(index, itemId)` | substitui; `ITEM_EMPTY` remove |
| `Remove(index)` | apaga e compacta |
| `Clear()` | esvazia |
| `Normalize()` | remove IDs inválidos e limita à capacidade |
| `InvokeItemUse(index)` | chama `OnUse` |
| `InvokeItemInfo(index)` | chama `OnInfo` |
| `InvokeItemDrop(index)` | chama `OnDrop` |
| `GetRawArray()` | array bruto de IDs; útil para serialização |
| `SetRawArray(array)` | restaura e normaliza |

## Procurar e remover por ID

```gml
function Inventory_Has(inventory, itemId) {
    for (var i = 0; i < inventory.GetCount(); i++) {
        if (inventory.Get(i) == itemId) return true;
    }
    return false;
}

function Inventory_RemoveFirst(inventory, itemId) {
    for (var i = 0; i < inventory.GetCount(); i++) {
        if (inventory.Get(i) == itemId) {
            return inventory.Remove(i);
        }
    }
    return false;
}
```

Não continue um loop crescente depois de remover: os índices seguintes mudam.

## Textos auxiliares

| Função | Produz |
|---|---|
| `Item_GetTextEat(nome)` | texto localizado de consumo |
| `Item_GetTextEquip(nome)` | texto localizado de equipamento |
| `Item_GetTextHeal(hp, novaLinha=true)` | texto de cura total/parcial |

Essas funções devolvem texto; você ainda precisa passá-lo a `Dialog_Add()` e
usar `Dialog_Start()` quando estiver no overworld.

## Checklist do item

- [ ] O construtor herda `ItemType` ou `ItemTypeSimple`.
- [ ] O nome do construtor coincide com o usado no registro.
- [ ] O ID/macro é único e não vazio.
- [ ] O item foi registrado em `Item_Custom`.
- [ ] As chaves de idioma existem em todos os idiomas.
- [ ] `OnUse`, `OnInfo` e `OnDrop` iniciam o diálogo quando necessário.
- [ ] Item consumível remove seu próprio slot.
- [ ] Equipamento troca o ID antigo e atualiza o bônus.
- [ ] `Add()` tem tratamento para inventário cheio.
- [ ] O item foi testado no menu e na batalha.

Próximo: [Inimigos e batalhas](/guides/enemies-encounters-and-battles).
