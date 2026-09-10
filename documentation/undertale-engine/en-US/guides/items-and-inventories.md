<!-- locale: en-US; content-id: items-and-inventories -->

# Items and inventories

> [!IMPORTANT]
> This chapter describes the **current** system of v0.6.0, based on `ItemType`
> constructors. Old tutorials that tell you to create a child object of `item`
> and call `Item_Add()` belong to the legacy branch.

## Overview

A current item has three parts:

1. a constructor that inherits `ItemType` or `ItemTypeSimple`;
2. a unique ID registered in `Item_Custom`;
3. an entry in some `Inventory`.

```text
CustomItem_Torta
      ↓ registered as
ITEM_TORTA = "torta"
      ↓ stored in
Item_GetInventoryItems()
```

The inventory stores **IDs**, not instances. The manager resolves the ID to the
item type when it needs to show the name, use, inspect or drop it.

## Tutorial: healing item

### 1. Create the item script

Create the script `CustomItem_Torta`:

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

`ItemTypeSimple("torta")` automatically implements:

- `GetName()` with the key `item.torta.name`;
- `OnInfo()` with the key `item.torta.info`;
- `OnDrop()` inherited from `ItemType`, with random text and removal.

The healing item removes itself after use. If it should stay, remove
`inventory.Remove(index)`.

### 2. Register in `Item_Custom`

Inside the first block of the `Item_Custom()` function:

```gml
#macro ITEM_TORTA "torta"
itemTypes.Register(ITEM_TORTA, new CustomItem_Torta());
```

ID rules:

- cannot be `""`, since that value is `ITEM_EMPTY`;
- must be unique;
- use lowercase letters and `_` for consistency;
- define a macro so you don't repeat the string across the project.

Registering the same ID twice causes a fatal error.

### 3. Add the language texts

In `datafiles/locale/english/string/item.json`, add properties to the existing
JSON object:

```json
{
    "item.torta.name": "Pie",
    "item.torta.info": "* Pie - Heals 20 HP&* A homemade pie."
}
```

Do the equivalent in each language. The `string.txt` file of the language
folder already lists `string/item.json`; if you create another JSON, include its
path in that index.

JSON doesn't accept a comma after the last property. A syntax error can prevent
the whole file from loading.

### 4. Give the item to the player

To start with it, in `Player_CustomInitialData()`:

```gml
var items = Item_GetInventoryItems();
items.Add(ITEM_TORTA);
```

To give it during the game:

```gml
var items = Item_GetInventoryItems();

if (items.Add(ITEM_TORTA)) {
    Dialog_Add("* You got the Pie!{sound `snd_item_get`}");
} else {
    Dialog_Add("* Your inventory is full.");
}
Dialog_Start();
```

`Add()` returns `false` if there's no capacity.

## `ItemType` vs `ItemTypeSimple`

### Full base: `ItemType`

Use when the name or info is computed at runtime:

```gml
function CustomItem_MoedaEstranha() : ItemType() constructor {
    function GetName() {
        return choose("Coin?", "Coin!", "Coin");
    }

    function OnUse(inventory, index) {
        var ganho = irandom_range(1, 5);
        Player_SetGold(Player_GetGold() + ganho);
        Dialog_Add("* The coin turned into " + string(ganho) + "G.");
        Dialog_Start();
        inventory.Remove(index);
    }

    function OnInfo(inventory, index) {
        Dialog_Add("* Nobody knows where it came from.");
        Dialog_Start();
    }

    // OnDrop is optional; the base already removes and shows localized text.
}
```

### Localized shortcut: `ItemTypeSimple`

Use when name and info come from the language:

```gml
function CustomItem_Chave() : ItemTypeSimple("chave") constructor {
    function OnUse(inventory, index) {
        Dialog_Add("* The key doesn't fit here.");
        Dialog_Start();
    }

    // An important key probably shouldn't be droppable.
    function OnDrop(inventory, index) {
        Dialog_Add("* Better hold on to it.");
        Dialog_Start();
    }
}
```

## Item contract

| Method | When it's called | Responsibility |
|---|---|---|
| `GetName()` | menus and lists | return a short string |
| `OnUse(inventory, index)` | Use option or the battle ITEM menu | apply the effect and decide whether to remove/swap |
| `OnInfo(inventory, index)` | Info option | start an informative dialogue |
| `OnDrop(inventory, index)` | Drop option | confirm/refuse and, if desired, remove |

`inventory` is the inventory that holds the item; don't assume it will always be
the main inventory. `index` starts at zero and can change when a previous item
is removed.

## Weapons

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

Register:

```gml
#macro ITEM_ESPADA_MADEIRA "espada_madeira"
itemTypes.Register(
    ITEM_ESPADA_MADEIRA,
    new CustomItem_EspadaMadeira()
);
```

`Inventory.Set(index, ITEM_EMPTY)` removes the slot. Therefore equipping works
even when there was no previous weapon.

## Armors

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

Register `ITEM_CACHECOL` like any other item.

> [!NOTE]
> The equipment bonus is separate from the ID: `Player_SetAtkItem`,
> `Player_SetDefItem`, `Player_SetSpdItem` and `Player_SetInvItem`. When
> switching equipment, update the matching bonuses.

## Phone

Phone calls are also item types, but they live in the `phones` inventory:

```gml
function CustomItem_TelefoneMaya() : ItemType() constructor {
    function GetName() {
        return "Call Maya";
    }

    function OnUse(inventory, index) {
        audio_play_sound(snd_phone_call, 0, false);
        Dialog_Add("* Dialing...{pause}{clear}");

        if (room == room_corredor) {
            Dialog_Add("* Maya: I'm right around the corner.");
        } else {
            Dialog_Add("* Maya: Keep going forward!");
        }

        Dialog_Start();
    }

    function OnInfo(inventory, index) {
        Dialog_Add("* An old phone.");
        Dialog_Start();
    }
}
```

In `Item_Custom`:

```gml
#macro ITEM_TELEFONE_MAYA "telefone_maya"
itemTypes.Register(ITEM_TELEFONE_MAYA, new CustomItem_TelefoneMaya());
```

In `Player_CustomInitialData`:

```gml
Item_GetInventoryPhones().Add(ITEM_TELEFONE_MAYA);
```

## Default inventories

`Item_Custom` registers:

| ID | Recommended getter | Default capacity |
|---|---|---:|
| `items` | `Item_GetInventoryItems()` | 8 |
| `phones` | `Item_GetInventoryPhones()` | 8 |
| `box1` | manager or `Item_GetInventoryBoxes()` | 10 |
| `box2` | manager or `Item_GetInventoryBoxes()` | 10 |

To create another inventory inside `Item_Custom()`:

```gml
inventories.Register("key_items", new Inventory(itemTypes, 16));
```

And a getter:

```gml
function Item_GetInventoryKeyItems() {
    return Item_GetInventoryManager().Get("key_items");
}
```

The `inventories` zone of the static storage saves all registered inventories.
If the new inventory is registered before `Storage_Init`, it enters the save
automatically.

> [!WARNING]
> In the analyzed commit, the `switch` in `Item_GetInventoryBoxes(index)` has no
> `break`; index 0 falls into case 1 and can return `box2`. Until this is fixed
> in your base, access explicitly with
> `Item_GetInventoryManager().Get("box1")` or add the `break`s.

## `Inventory` API

Indexes start at `0`.

| Method | Result |
|---|---|
| `GetCapacity()` | maximum capacity |
| `GetCount()` | current amount |
| `Get(index)` | ID; errors when outside the count |
| `GetOrEmpty(index)` | ID or `ITEM_EMPTY` within capacity |
| `GetItem(index)` | `ItemType` object of the slot |
| `GetItemOrUndefined(index)` | type or `undefined` for empty |
| `GetItemName(index)` | display name |
| `Add(itemId)` | adds at the end; returns success |
| `Insert(index, itemId)` | inserts and shifts the following ones |
| `Set(index, itemId)` | replaces; `ITEM_EMPTY` removes |
| `Remove(index)` | deletes and compacts |
| `Clear()` | empties |
| `Normalize()` | removes invalid IDs and limits to capacity |
| `InvokeItemUse(index)` | calls `OnUse` |
| `InvokeItemInfo(index)` | calls `OnInfo` |
| `InvokeItemDrop(index)` | calls `OnDrop` |
| `GetRawArray()` | raw array of IDs; useful for serialization |
| `SetRawArray(array)` | restores and normalizes |

## Finding and removing by ID

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

Don't keep looping with a growing index after removing: the following indexes
change.

## Helper texts

| Function | Produces |
|---|---|
| `Item_GetTextEat(name)` | localized consumption text |
| `Item_GetTextEquip(name)` | localized equipment text |
| `Item_GetTextHeal(hp, newLine=true)` | full/partial healing text |

These functions return text; you still need to pass it to `Dialog_Add()` and
use `Dialog_Start()` when in the overworld.

## Item checklist

- [ ] The constructor inherits `ItemType` or `ItemTypeSimple`.
- [ ] The constructor name matches the one used in the registration.
- [ ] The ID/macro is unique and not empty.
- [ ] The item was registered in `Item_Custom`.
- [ ] The language keys exist in all languages.
- [ ] `OnUse`, `OnInfo` and `OnDrop` start the dialogue when needed.
- [ ] Consumable items remove their own slot.
- [ ] Equipment swaps the old ID and updates the bonus.
- [ ] `Add()` has handling for a full inventory.
- [ ] The item was tested in the menu and in battle.

Next: [Enemies and battles](/guides/enemies-encounters-and-battles).
