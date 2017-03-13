const assert = require('assert');
const fetch = require('node-fetch');
const api = require('./api')();

describe('Express server integration should', () => {

  before(() => api.start({port: 8787}))
  after(() => api.stop())

  it('yield a result', () => {
    return fetch('http://localhost:8787/graphql', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({query: '{ search(term: "something") { content } }'}),
    })
    .then(response => response.json())
    .then(actual => {
      const expected = { data: { search: { content: 'something' } } };
      assert.deepEqual(actual, expected);
    });
  });

});