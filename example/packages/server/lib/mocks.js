const { MockList } = require('graphql-tools');
const faker = require('faker');

module.exports = {
  Query() {
    return {
      articles,
    };
  },
};

function articles() {
  return new MockList(10, () => ({
    id       : faker.random.uuid(),
    authorId : faker.internet.email(),
    content  : faker.lorem.words(600),
  }));
}
