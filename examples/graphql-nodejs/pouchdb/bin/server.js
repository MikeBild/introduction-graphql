#!/usr/bin/env node
const SERVICE_PORT = process.env.SERVICE_PORT || 8080;
const server = require('../lib/server');

server
  .start({port: SERVICE_PORT})
  .then(api => console.log(`Listen on ${api.server.address().port}`));