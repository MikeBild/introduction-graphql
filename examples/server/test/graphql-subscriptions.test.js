const assert = require('assert');
const loaders = require('../lib/loaders');
const pouchdb = require('../lib/pouchdb');
const graphqlSubscriptions = require('../lib/subscriptions')();

describe('GraphQL subscriptions with database integration should', () => {
    const authorDB = pouchdb('author');

    after(() => {
        return authorDB.removeAll();
    });

    it('receive upsertedAuthor with ID event from subscription', done => {
        let subscriptionId = undefined;

        graphqlSubscriptions.subscriptionManager
        .subscribe({
            query: `
                subscription upserted_author_subscription($id: ID){
                    upsertedAuthor(id: $id) {
                        id
                        name
                    }
                }
            `,
            variables: { id: 'Emil Muster', },
            context:  { user: {id: 'demo@domain.local'}, loaders: loaders(), },
            callback: (err, actual) => {
                assert.deepEqual(actual.data.upsertedAuthor, { id: 'Emil Muster', name: 'Emil Muster' });   
                graphqlSubscriptions.subscriptionManager.unsubscribe(subscriptionId);
                done();
            }
        })
        .then(subId => {
            return authorDB
            .get('Emil Muster').catch(() => ({id: 'Emil Muster', name: 'Emil Muster'}))
            .then(data => authorDB.upsert(data))
            .then(() => subscriptionId = subId);
        });
    });

    it('receive removedAuthor with ID event from subscription', done => {
        let subscriptionId = undefined;

        graphqlSubscriptions.subscriptionManager
        .subscribe({
            query: `
                subscription removed_author_subscription($id: ID){
                    removedAuthor(id: $id)
                }
            `,
            variables: { id: 'Emil Muster', },
            context:  { user: {id: 'demo@domain.local'}, loaders: loaders(), },
            callback: (err, actual) => {
                assert.equal(actual.data.removedAuthor, 'Emil Muster'); 
                graphqlSubscriptions.subscriptionManager.unsubscribe(subscriptionId);               
                done();
            }
        })
        .then(subId => {
            return authorDB
            .get('Emil Muster')
            .then(data => authorDB.remove(data))
            .then(() => subscriptionId = subId);
        });
    });   

    it('receive upsertedAuthor without ID event from subscription', done => {
        let subscriptionId = undefined;

        graphqlSubscriptions.subscriptionManager
        .subscribe({
            query: `
                subscription upserted_author_subscription {
                    upsertedAuthor {
                        id
                        name
                    }
                }
            `,
            variables: { },
            context:  { user: {id: 'demo@domain.local'}, loaders: loaders(), },
            callback: (err, actual) => {
                assert.deepEqual(actual.data.upsertedAuthor, { id: 'Theo Tester', name: 'Theo Tester' });   
                graphqlSubscriptions.subscriptionManager.unsubscribe(subscriptionId);
                done();
            }
        })
        .then(subId => {
            return authorDB
            .get('Theo Tester').catch(() => ({id: 'Theo Tester', name: 'Theo Tester'}))
            .then(data => authorDB.upsert(data))
            .then(() => subscriptionId = subId);
        });
    });

    it('receive removedAuthor without ID event from subscription', done => {
        let subscriptionId = undefined;

        graphqlSubscriptions.subscriptionManager
        .subscribe({
            query: `
                subscription removed_author_subscription {
                    removedAuthor
                }
            `,
            variables: { },
            context:  { user: {id: 'demo@domain.local'}, loaders: loaders(), },
            callback: (err, actual) => {
                assert.equal(actual.data.removedAuthor, 'Theo Tester'); 
                graphqlSubscriptions.subscriptionManager.unsubscribe(subscriptionId);               
                done();
            }
        })
        .then(subId => {
            return authorDB
            .get('Theo Tester')
            .then(data => authorDB.remove(data))
            .then(() => subscriptionId = subId);
        });
    });     

});