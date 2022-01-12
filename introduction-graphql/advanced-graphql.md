# Advanced GraphQL

## Unions

- polymorphic type queries
  
**Query**
```graphql
query search {
  search {
    __typename
    ... on Article {
      content
    }
    ... on Comment {
      text
    }
  }
}
```

**Schema**
```graphql
union Search = Article | Comment
```

**Type Resolver**
```javascript
Search: {
  __resolveType(obj, context, info) {
    if (obj.content) return "Article";
    if (obj.text) return "Comment";
    return null;
  },
},
```

## Interfaces

**Query**
```graphql
query posts {
  posts {
    id
    authorId
    __typename
  }
}
```

**Schema** 
```graphql
interface Post {
  id: ID!
  authorId: ID
}

type Article implements Post {
  id: ID
  authorId: ID
  content: String
}

type Comment implements Post {
  id: ID
  authorId: ID
  text: String
}
```

**Type Resolver**
```javascript
Post: {
  __resolveType: (source, context, info) => {
    if(source.content) return 'Article';
    if(source.text) return 'Comment';
    return null;
  },
},
```
