const api = require('./api');

api()
  .start({ port: 8888 })
  .then(server => console.log(`Listen on ${server.address().port}`))
  .catch(err => console.error(err));
