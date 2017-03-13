const express = require('express');
const expressCors = require('cors');
const expressMorgan = require('morgan');
const expressBodyParser = require('body-parser');
const PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-adapter-node-websql'))
const DefaultPouch = PouchDB.defaults({prefix: 'databases/', adapter: 'websql'});
const expressPouchDB = require('express-pouchdb')(DefaultPouch, {
  logPath: 'databases/pouchdb.log',
  configPath: 'pouchdb-config.json',
  mode: 'fullCouchDB',
});
const app = express();
const databases = {};

app.enable('trust proxy');
app.disable('x-powered-by');
app.use(expressMorgan('dev'));
app.use(expressPouchDB);
app.use(expressCors());
app.use(expressBodyParser.json({limit: '10mb'}));

let server = undefined;
module.exports = {
  start: ({port, isMemory = false }) => {
    return new Promise(resolve => {
      databases.test = new DefaultPouch('test');
      server = app.listen(port, () => resolve({
        server: server,
        databases: databases,
      }));
    });
  },
  stop: () => new Promise(resolve => server.close(() => resolve())),
};