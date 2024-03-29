const { MockList } = require("graphql-tools");
const casual = require("casual");

module.exports = {
  Comment: () => ({
    id: casual.uuid,
    authorId: casual.email,
    text: casual.words(600),
  }),
  Query() {
    return {
      comments: [...new Array(casual.integer(2, 6))],
    };
  },
};

function comment() {
  return {
    id: casual.uuid(),
    authorId: casual.email(),
    text: casual.words(600),
  };
}
