const DataLoader = require('dataloader');
const database = require('./pouchdb');

module.exports = () => {
    const batchingLoader = new DataLoader(keys => database().find(keys), { cache: false });      

    return {
        load: key => batchingLoader.load(key),
        loadMany: keys => batchingLoader.loadMany(keys),        
        authors: {
            load: key => batchingLoader.load(key),
            loadMany: (keys = []) => batchingLoader.loadMany(keys).then(data => Boolean(data.length) ? data : database('authors').findAll()),
            loadQuery: selector => database('authors').findAll(selector),
            upsert: entity => database('authors').upsert(entity).then(data => { batchingLoader.clear(data.id); return data;}),
            remove: entity => database('authors').remove(entity).then(data => { batchingLoader.clear(data.id); return data;}),
        },      
        posts: {
            load: key => batchingLoader.load(key),
            loadMany: (keys = []) => batchingLoader.loadMany(keys).then(data => Boolean(data.length) ? data : database('posts').findAll()),
            loadQuery: selector => database('posts').findAll(selector),
            upsert: entity => database('posts').upsert(entity).then(data => { batchingLoader.clear(data.id); return data;}),
            remove: entity => database('posts').remove(entity).then(data => { batchingLoader.clear(data.id); return data;}),
        },    
    }
};