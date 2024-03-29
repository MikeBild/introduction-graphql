const { articles, article, articleAdd } = require("./articles");
const { search } = require("./search");
const { posts } = require("./posts");

module.exports = {
  Post: {
    __resolveType(obj, context, info) {
      console.log({ obj });
      if (obj.content) return "Article";
      if (obj.text) return "Comment";

      return null;
    },
  },
  Search: {
    __resolveType(obj, context, info) {
      if (obj.content) return "Article";
      if (obj.text) return "Comment";

      return null;
    },
  },
  Query: {
    articles,
    article,
    search,
    posts,
  },
  Mutation: { articleAdd },
  Subscription: {
    articleAdded: {
      subscribe: (_, __, {  pubsub }) => pubsub.asyncIterator(["ARTICLE_ADDED"]),
    },
  },
};
