# GraphQL Types

- Build-In Scalar Types

  - ID (identity value)
  - String
  - Int
  - Float
  - Boolean

- Special Custom Types

  - Enums
  - Scalar
  - Input

- Type modifiers
  - List `[]`
  - Non-Null `!`

- Build-In Abstract Types to group other types

  - Interface
  - Union

## Scalars

TBD

## Objects

TBD


## Collections

TBD


## Enumns

TBD


## Inputs

TBD

## Unions

TBD

## Interfaces

```graphql
interface Contact {
  id: ID
  name: String
}

type Person implements Contact {
  id: ID
  firstname: String
  lastname: String
}

type Organization implements Contact {
  id: ID
  name: String
}
```

```javascript
Contact: {
  __resolveType: (source, context, info) => {
    if(source.name) return 'Organization';
    if(source.vorname && source.nachname) return 'Person';
    return null;
  },
},
```

![GraphQL Short-Hand Notation](cheatsheet.png)
