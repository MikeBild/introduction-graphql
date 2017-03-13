# Testing GraphQL

* Testing Queries, Mutations and Subscriptions
* Async test structure
* Mocking data loaders

## Example

```bash
npm i -g mocha
mocha
```

```javascript
const assert = require('assert');
const schema = require('./schema');
const graphql = require('graphql');

describe('GraphQL schema query should', () => {
    describe('for simple ', () => {

        it('yield query result', () => {
            return graphql.graphql(schema, `query fetch_search($term: String) {
                search(term: $term) {
                    content
                }
            }`, {}, {}, { term: 'search something' })
            .then(actual => {
                const expected = { data: { search: { content: 'search something' } } };
                assert.deepEqual(actual, expected);
            });
        });
    });
});
```
