module.exports = {
  articles,
  article,
};

async function articles(_, __, { datasources }) {
  const articleList = await datasources.articles.list();
  return articleList;
}

async function article(_, { id }, { datasources }) {
  const article = await datasources.articles.getById(id);
  return article;
}
