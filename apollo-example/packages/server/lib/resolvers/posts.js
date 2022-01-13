module.exports = {
  posts,
};

async function posts(_, __, { datasources }) {
  const articleList = await datasources.articles.list();
  return [...articleList, { id: 1, text: "A comment!" }];
}
