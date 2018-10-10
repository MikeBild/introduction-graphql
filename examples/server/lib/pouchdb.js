const uuid = require('uuid');
const EventEmitter = require('events');
const PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-adapter-node-websql'));
PouchDB.plugin(require('pouchdb-find'));
const database = new PouchDB(`database.sqlite`, {
  adapter: 'websql',
  auto_compaction: true,
});
const eventemitter = new EventEmitter();

if (process.env.SYNC_URL)
  database.sync(process.env.SYNC_URL, { live: true, retry: true });

database
  .changes({
    since: 'now',
    live: true,
    include_docs: true,
    open_revs: 'all',
    revs_info: true,
  })
  .on('change', msg => {
    msg.doc.id = msg.doc._id;
    msg.doc.rev = msg.doc._rev;
    delete msg.doc._id;
    delete msg.doc._rev;

    if (msg.doc._deleted) {
      msg.doc.$deleted = msg.doc._deleted;
      delete msg.doc._deleted;
    }

    eventemitter.emit('event', msg.doc);
  })
  .on('error', err => console.error(err));

module.exports = name => {
  name = name || 'default';

  return {
    findAll: (selector, skip, limit) =>
      findAll(database, name, selector, skip, limit),
    find: ids => find(database, ids),
    get: id => get(database, id),
    upsert: entity => upsert(database, name, entity),
    remove: entity => remove(database, name, entity),
    removeAll: () => removeAll(database, name),
  };
};

module.exports.subscribe = (name, cb) => eventemitter.on(name, cb);
module.exports.publish = (name, msg) => eventemitter.emit(name, msg);

function findAll(database, name, selector = {}, skip = 0, limit = 10) {
  const querySelector = Object.assign({}, { $type: name }, selector);

  if (limit > 10) limit = 10;

  return database
    .find({ selector: querySelector, skip: skip, limit: limit })
    .then(data => data.docs)
    .then(data =>
      data.map(doc => {
        doc.id = doc._id;
        doc.rev = doc._rev;
        delete doc._id;
        delete doc._rev;

        return doc;
      }),
    );
}

function find(database, ids) {
  return database
    .bulkGet({ docs: ids.map(id => ({ id: id })) })
    .then(data => data.results.map(x => x.docs.map(y => y.ok)))
    .then(data =>
      data.reduce((s, n) => {
        s = s.concat(n);
        return s;
      }, []),
    )
    .then(data => data.filter(x => x))
    .then(data =>
      data.map(doc => {
        doc.id = doc._id;
        doc.rev = doc._rev;
        delete doc._id;
        delete doc._rev;
        return doc;
      }),
    )
    .then(data => ids.map(id => data.find(y => y.id === id)));
}

function get(database, id) {
  return database.get(id).then(doc => {
    doc.id = doc._id;
    doc.rev = doc._rev;
    delete doc._id;
    delete doc._rev;
    return doc;
  });
}

function upsert(database, name, entity) {
  const doc = Object.assign({}, entity, { $type: name });
  doc._id = entity.id || uuid.v1();
  doc._rev = entity.rev;
  delete doc.id;
  delete doc.rev;
  return database
    .put(doc)
    .then(data => {
      delete data.ok;
      return data;
    })
    .then(data => Object.assign(data, entity));
}

function remove(database, name, entity) {
  const doc = Object.assign({}, entity, { _id: entity.id, _rev: entity.rev });

  return database.remove(doc).then(data => data.id);
}

function removeAll(database, name) {
  return database
    .find({ selector: { $type: name } })
    .then(data => Promise.all(data.docs.map(doc => database.remove(doc))));
}
