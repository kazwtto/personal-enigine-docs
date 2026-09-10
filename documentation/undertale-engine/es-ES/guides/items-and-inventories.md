<!-- locale: es-ES; content-id: items-and-inventories -->

# Ítems e inventarios

> [!IMPORTANT]
> Este capítulo describe el sistema **actual** de la v0.6.0, basado en
> constructores `ItemType`. Los tutoriales antiguos que mandan crear un objeto
> hijo de `item` y llamar a `Item_Add()` pertenecen a la branch legada.

## Visión general

Un ítem actual tiene tres partes:

1. un constructor que hereda `ItemType` o `ItemTypeSimple`;
2. un ID único registrado en `Item_Custom`;
3. una entrada en algún `Inventory`.

```text
CustomItem_Torta
      ↓ registrado como
ITEM_TORTA = "torta"
      ↓ almacenado en
Item_GetInventoryItems()
```

El inventario almacena **IDs**, no instancias. El administrador resuelve el ID
al tipo de ítem cuando necesita mostrar el nombre, usar, inspeccionar o
descartar.

## Tutorial: ítem de curación

### 1. Crea el script del ítem

Crea el script `CustomItem_Torta`:

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

`ItemTypeSimple("torta")` implementa automáticamente:

- `GetName()` con la clave `item.torta.name`;
- `OnInfo()` con la clave `item.torta.info`;
- `OnDrop()` heredado de `ItemType`, con texto aleatorio y remoción.

El ítem de curación se elimina a sí mismo después del uso. Si debe permanecer,
retira `inventory.Remove(index)`.

### 2. Regístralo en `Item_Custom`

Dentro del primer bloque de la función `Item_Custom()`:

```gml
#macro ITEM_TORTA "torta"
itemTypes.Register(ITEM_TORTA, new CustomItem_Torta());
```

Reglas del ID:

- no puede ser `""`, pues ese valor es `ITEM_EMPTY`;
- debe ser único;
- usa letras minúsculas y `_` para mantener la consistencia;
- define una macro para no repetir la string en todo el proyecto.

Registrar dos veces el mismo ID genera un error fatal.

### 3. Añade los textos de idioma

En `datafiles/locale/english/string/item.json`, añade propiedades al objeto JSON
existente:

```json
{
    "item.torta.name": "Pie",
    "item.torta.info": "* Pie - Heals 20 HP&* A homemade pie."
}
```

Haz lo equivalente en cada idioma. El archivo `string.txt` de la carpeta del
idioma ya lista `string/item.json`; si creas otro JSON, incluye su ruta en ese
índice.

JSON no acepta coma después de la última propiedad. Un error de sintaxis puede
impedir la carga de todo el archivo.

### 4. Entrega el ítem al jugador

Para empezar con él, en `Player_CustomInitialData()`:

```gml
var items = Item_GetInventoryItems();
items.Add(ITEM_TORTA);
```

Para entregarlo durante el juego:

```gml
var items = Item_GetInventoryItems();

if (items.Add(ITEM_TORTA)) {
    Dialog_Add("* ¡Recibiste la Torta!{sound `snd_item_get`}");
} else {
    Dialog_Add("* Tu inventario está lleno.");
}
Dialog_Start();
```

`Add()` devuelve `false` si no hay capacidad.

## `ItemType` x `ItemTypeSimple`

### Base completa: `ItemType`

Úsalo cuando el nombre o la información se calculan en tiempo de ejecución:

```gml
function CustomItem_MoedaEstranha() : ItemType() constructor {
    function GetName() {
        return choose("¿Moneda?", "¡Moneda!", "Moneda");
    }

    function OnUse(inventory, index) {
        var ganho = irandom_range(1, 5);
        Player_SetGold(Player_GetGold() + ganho);
        Dialog_Add("* La moneda se convirtió en " + string(ganho) + "G.");
        Dialog_Start();
        inventory.Remove(index);
    }

    function OnInfo(inventory, index) {
        Dialog_Add("* Nadie sabe de dónde vino.");
        Dialog_Start();
    }

    // OnDrop es opcional; la base ya elimina y muestra un texto localizado.
}
```

### Atajo localizado: `ItemTypeSimple`

Úsalo cuando el nombre y la información provienen del idioma:

```gml
function CustomItem_Chave() : ItemTypeSimple("chave") constructor {
    function OnUse(inventory, index) {
        Dialog_Add("* La llave no sirve aquí.");
        Dialog_Start();
    }

    // Una llave importante quizás no debería poder descartarse.
    function OnDrop(inventory, index) {
        Dialog_Add("* Es mejor quedarse con ella.");
        Dialog_Start();
    }
}
```

## Contrato de un ítem

| Método | Cuándo se llama | Responsabilidad |
|---|---|---|
| `GetName()` | menús y listas | devolver una string corta |
| `OnUse(inventory, index)` | opción Use o menú ITEM de la batalla | aplicar el efecto y decidir si elimina/cambia |
| `OnInfo(inventory, index)` | opción Info | iniciar un diálogo informativo |
| `OnDrop(inventory, index)` | opción Drop | confirmar/rechazar y, si se desea, eliminar |

`inventory` es el inventario que contiene el ítem; no asumas que siempre será el
inventario principal. `index` comienza en cero y puede cambiar cuando se elimina
un ítem anterior.

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

Regístralo:

```gml
#macro ITEM_ESPADA_MADEIRA "espada_madeira"
itemTypes.Register(
    ITEM_ESPADA_MADEIRA,
    new CustomItem_EspadaMadeira()
);
```

`Inventory.Set(index, ITEM_EMPTY)` elimina el slot. Por tanto, equipar funciona
incluso cuando no había arma anterior.

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

Registra `ITEM_CACHECOL` como cualquier otro ítem.

> [!NOTE]
> El bono del equipamiento está separado del ID: `Player_SetAtkItem`,
> `Player_SetDefItem`, `Player_SetSpdItem` y `Player_SetInvItem`. Al cambiar de
> equipamiento, actualiza los bonos correspondientes.

## Teléfono

Las llamadas también son tipos de ítem, pero están en el inventario `phones`:

```gml
function CustomItem_TelefoneMaya() : ItemType() constructor {
    function GetName() {
        return "Llamar a Maya";
    }

    function OnUse(inventory, index) {
        audio_play_sound(snd_phone_call, 0, false);
        Dialog_Add("* Marcando...{pause}{clear}");

        if (room == room_corredor) {
            Dialog_Add("* Maya: Estoy justo ahí.");
        } else {
            Dialog_Add("* Maya: ¡Sigue adelante!");
        }

        Dialog_Start();
    }

    function OnInfo(inventory, index) {
        Dialog_Add("* Un teléfono antiguo.");
        Dialog_Start();
    }
}
```

En `Item_Custom`:

```gml
#macro ITEM_TELEFONE_MAYA "telefone_maya"
itemTypes.Register(ITEM_TELEFONE_MAYA, new CustomItem_TelefoneMaya());
```

En `Player_CustomInitialData`:

```gml
Item_GetInventoryPhones().Add(ITEM_TELEFONE_MAYA);
```

## Inventarios estándar

`Item_Custom` registra:

| ID | Getter recomendado | Capacidad estándar |
|---|---:|
| `items` | `Item_GetInventoryItems()` | 8 |
| `phones` | `Item_GetInventoryPhones()` | 8 |
| `box1` | administrador o `Item_GetInventoryBoxes()` | 10 |
| `box2` | administrador o `Item_GetInventoryBoxes()` | 10 |

Para crear otro inventario dentro de `Item_Custom()`:

```gml
inventories.Register("key_items", new Inventory(itemTypes, 16));
```

Y un getter:

```gml
function Item_GetInventoryKeyItems() {
    return Item_GetInventoryManager().Get("key_items");
}
```

La zona `inventories` del almacenamiento estático guarda todos los inventarios
registrados. Si el nuevo inventario se registra antes de `Storage_Init`, entra
en el save automáticamente.

> [!WARNING]
> En el commit analizado, el `switch` de `Item_GetInventoryBoxes(index)` no tiene
> `break`; el índice 0 cae en el caso 1 y puede devolver `box2`. Mientras esto no
> se corrija en tu base, accede explícitamente con
> `Item_GetInventoryManager().Get("box1")` o añade los `break`.

## API de `Inventory`

Los índices comienzan en `0`.

| Método | Resultado |
|---|---|
| `GetCapacity()` | capacidad máxima |
| `GetCount()` | cantidad actual |
| `Get(index)` | ID; avisa si el índice está fuera de la cantidad |
| `GetOrEmpty(index)` | ID o `ITEM_EMPTY` dentro de la capacidad |
| `GetItem(index)` | objeto `ItemType` del slot |
| `GetItemOrUndefined(index)` | tipo o `undefined` para vacío |
| `GetItemName(index)` | nombre mostrable |
| `Add(itemId)` | añade al final; devuelve éxito |
| `Insert(index, itemId)` | inserta y desplaza los siguientes |
| `Set(index, itemId)` | sustituye; `ITEM_EMPTY` elimina |
| `Remove(index)` | borra y compacta |
| `Clear()` | vacía |
| `Normalize()` | elimina IDs inválidos y limita a la capacidad |
| `InvokeItemUse(index)` | llama a `OnUse` |
| `InvokeItemInfo(index)` | llama a `OnInfo` |
| `InvokeItemDrop(index)` | llama a `OnDrop` |
| `GetRawArray()` | array bruto de IDs; útil para serialización |
| `SetRawArray(array)` | restaura y normaliza |

## Buscar y eliminar por ID

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

No continúes un loop creciente después de eliminar: los índices siguientes
cambian.

## Textos auxiliares

| Función | Produce |
|---|---|
| `Item_GetTextEat(nome)` | texto localizado de consumo |
| `Item_GetTextEquip(nome)` | texto localizado de equipamiento |
| `Item_GetTextHeal(hp, novaLinha=true)` | texto de curación total/parcial |

Estas funciones devuelven texto; todavía debes pasarlo a `Dialog_Add()` y usar
`Dialog_Start()` cuando estés en el overworld.

## Checklist del ítem

- [ ] El constructor hereda `ItemType` o `ItemTypeSimple`.
- [ ] El nombre del constructor coincide con el usado en el registro.
- [ ] El ID/macro es único y no vacío.
- [ ] El ítem se registró en `Item_Custom`.
- [ ] Las claves de idioma existen en todos los idiomas.
- [ ] `OnUse`, `OnInfo` y `OnDrop` inician el diálogo cuando es necesario.
- [ ] El ítem consumible elimina su propio slot.
- [ ] El equipamiento cambia el ID antiguo y actualiza el bono.
- [ ] `Add()` tiene manejo para inventario lleno.
- [ ] El ítem se probó en el menú y en la batalla.

Siguiente: [Enemigos y batallas](/guides/enemies-encounters-and-battles).
