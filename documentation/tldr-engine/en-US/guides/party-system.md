<!-- locale: en-US; content-id: party-system -->

# Party System

## How party members are represented

Party members are controlled through structs.

Default party-member constructors are in:

```text
party_init
```

and are children of:

```gml
party_m()
```

A member's **internal name** and the member's **data** are separate.

```gml
global.party_names
```

contains party-member names. It does **not** contain the full member structs.

> [!IMPORTANT]
> When the engine asks for a party member's name, it means the name used when that member was initialized with `party_m_initialize`, not necessarily a name field stored inside the constructor.

## Read party-member data

Use:

```gml
party_get_data(...)
```

`party_get_data(...)` takes:

1. the party member's internal name;
2. the hash of the variable you want to retrieve.

The documentation does not provide the exact hash syntax, so use the current JSDoc/implementation for that part.

## Add a custom party member

### 1. Create a constructor

Create a child constructor of:

```gml
party_m()
```

Use the existing constructors in `party_init` as the template for the fields your member needs.

### 2. Initialize it

Initialize the member with:

```gml
party_m_initialize(_name, _constructor)
```

Do this in `o_world`'s **Game Start** event, immediately after:

```gml
party_init()
```

The `_name` passed here becomes the member's internal name used by the party APIs.

## Add and remove members from the active party

Use the party helpers:

```gml
party_member_add(...)
party_member_kick(...)
```

Both use the target member's internal name.

Changing `global.party_names` directly does not remove actor instances already present in the room. Use the add/kick helpers for the normal party-management flow.

## Party checklist

- [ ] The custom constructor inherits from `party_m()`.
- [ ] Its data layout is based on an existing constructor in `party_init`.
- [ ] It is initialized with `party_m_initialize`.
- [ ] Initialization happens after `party_init()` in `o_world` Game Start.
- [ ] Code that references the member uses the internal initialization name.
- [ ] `party_get_data` is used for member data instead of treating `global.party_names` as data storage.
- [ ] Party membership changes account for actor instances already present in the room.
