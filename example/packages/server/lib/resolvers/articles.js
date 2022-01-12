module.exports = {
  articles,
  article,
  search,
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

async function search(_, __, { datasources }) {
  const articleList = await datasources.articles.list();
  return [...articleList, { id: 1, text: "A comment!" }];
}
