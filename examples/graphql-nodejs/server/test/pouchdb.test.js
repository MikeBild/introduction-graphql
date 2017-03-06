const assert = require('assert');
const pouchdb = require('../lib/pouchdb');

describe('PouchDB database mutations should', () => {
    const demo1Docs = pouchdb('demo1Docs');

    after(() => {
        return demo1Docs.removeAll();
    });

    it('insert and remove an entity', () => {        
        return demo1Docs
        .upsert({
            foo: 'bar',
        })
        .then(data => {
            assert.ok(data.id);
            assert.ok(data.rev);
            assert.equal(data.foo, 'bar');
            return data;
        })
        .then(data => demo1Docs.remove(data));
    }); 
});

describe('PouchDB database queries should', () => {
    const demo1Docs = pouchdb('demo1Docs');
    const demo2Docs = pouchdb('demo2Docs');
    const database = pouchdb();

    before(() => {
        return Promise.all([
            demo1Docs.upsert({id: 'A', foo: 'bar', }),
            demo2Docs.upsert({id: 'B', bar: 'foo', }),
            demo2Docs.upsert({id: 'C', bar: 'foo', }),
        ]);
    });

    after(() => {
        return Promise.all([
            demo1Docs.removeAll(),
            demo2Docs.removeAll(),
        ]);
    });

    it('findAll demo1Docs yield 1 documents', () => {
        return demo1Docs
        .findAll()
        .then(data => {
            assert.equal(data.length, 1);
        });
    }); 

    it('findAll demo1Docs yield 2 documents', () => {
        return demo2Docs
        .findAll()
        .then(data => {
            assert.equal(data.length, 2);
        });
    });

    it('find by IDs yield 3 documents', () => {
        return database
        .find(['A', 'B', 'C'])
        .then(data => {
            assert.equal(data.length, 3);
        });
    });

    it('find by 2 IDs yield 2 documents', () => {
        return database
        .find(['A', 'K'])
        .then(data => {
            assert.equal(data.length, 2);
        });
    }); 

    it('get by ID yield a document', () => {
        return database
        .get('A')
        .then(data => {
            assert.equal(data.id, 'A');
        });
    });

    it('get by ID yield a document', () => {
        return demo1Docs
        .get('A')
        .then(data => {
            assert.equal(data.id, 'A');
        });
    });              
});