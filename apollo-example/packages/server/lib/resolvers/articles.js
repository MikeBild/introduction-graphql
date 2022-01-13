module.exports = {
  articles,
  article,
  articleAdd,
  articleAdded,
};

async function articles(_, __, { datasources, userToken }) {
  console.log({ userToken });
  const articleList = await datasources.articles.list();
  return articleList;
}

async function article(_, { id }, { datasources }) {
  const article = await datasources.articles.getById(id);
  return article;
}

async function articleAdd(_, __, { datasources, pubsub }) {
  pubsub.publish("ARTICLE_ADDED", {
    articleAdded: { id: 1, authorId: 22, content: "abc" },
  });
  return {};
}

async function articleAdded(_, __, { datasources }) {
  return {};
}
