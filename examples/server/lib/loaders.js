const DataLoader = require('dataloader');
const database = require('./pouchdb');

module.exports = () => {
    const batchingLoader = new DataLoader(keys => database().find(keys), { cache: false });      

    return {
        load: (key = '') => batchingLoader.load(key),
        loadMany: (keys = []) => batchingLoader.loadMany(keys),        
        authors: {
            load: (key = '') => batchingLoader.load(key),
            loadMany: (keys = [], skip = 0, limit = 10) => keys && keys.length ? batchingLoader.loadMany(keys) : database('authors').findAll({}, skip, limit),
            loadQuery: (selector = {},  skip = 0, limit = 10) => database('authors').findAll(selector, skip, limit),
            upsert: entity => database('authors').upsert(entity).then(data => { batchingLoader.clear(data.id); return data;}),
            remove: entity => database('authors').remove(entity).then(data => { batchingLoader.clear(data.id); return data;}),
        },      
        posts: {
            load: (key = '') => batchingLoader.load(key),
            loadMany: (keys = [], skip = 0, limit = 10) => keys && keys.length ? batchingLoader.loadMany(keys) : database('posts').findAll({}, skip, limit),
            loadQuery: (selector = {},  skip = 0, limit = 10) => database('posts').findAll(selector, skip, limit),
            upsert: entity => database('posts').upsert(entity).then(data => { batchingLoader.clear(data.id); return data;}),
            remove: entity => database('posts').remove(entity).then(data => { batchingLoader.clear(data.id); return data;}),
        },    
    }
};