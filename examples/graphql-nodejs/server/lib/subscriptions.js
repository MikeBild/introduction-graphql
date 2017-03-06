const graphqlSubscriptions = require('graphql-subscriptions');
const schema = require('./schema');
const pouchdb = require('../lib/pouchdb');  

module.exports = () => {    
    const pubsub = new graphqlSubscriptions.PubSub();
    const subscriptionManager = new graphqlSubscriptions.SubscriptionManager({
        schema,
        pubsub,
        setupFunctions: {
            upsertedAuthor: (options, args) => ({
                changedChannel: { 
                    filter: event => args.id ? event.id === args.id && !event.$deleted : !event.$deleted,
                },
            }),
            removedAuthor: (options, args) => ({
                changedChannel: { 
                    filter: event => args.id ? event.id === args.id && event.$deleted : event.$deleted,
                },
            }),
            upsertedPost: (options, args) => ({
                changedChannel: { 
                    filter: event => args.id ? event.id === args.id && !event.$deleted : !event.$deleted,
                },
            }),
            removedPost: (options, args) => ({
                changedChannel: { 
                    filter: event => args.id ? event.id === args.id && event.$deleted : event.$deleted,
                },
            }),                                   
        },
    });

    pouchdb.subscribe('event', msg => pubsub.publish('changedChannel', msg));

    return {
        subscriptionManager: subscriptionManager,
        pubsub: pubsub,
    };
};
