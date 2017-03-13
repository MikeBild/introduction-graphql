const assert = require('assert');
const schema = require('./schema');
const graphql = require('graphql');

describe('GraphQL schema query and mutation should', () => {
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

        it('yield mutation result', () => {
            return graphql.graphql(schema, `mutation do_something {
                doSomething
            }`, {}, {}, {})
            .then(actual => {
                assert.deepEqual(actual, { data: { doSomething: 'Transaction ID' } });
            });
        });

    });
});