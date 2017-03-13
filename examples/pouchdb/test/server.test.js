const SERVICE_PORT = 5000;
const BASE_URL = `http://localhost:${SERVICE_PORT}`;
const assert = require('assert');
const fetch = require('node-fetch');
const apiServer = require('../lib/server');
describe('PouchDB integration should', () => {
  before(() => apiServer.start({port: SERVICE_PORT, isMemory: true }));
  after(() => apiServer.stop());

  it('finds test database', () => {
    return fetch(`${BASE_URL}/test`)
    .then(res => res.json())
    .then(data => {
      assert.ok(data);
    });
  });

});