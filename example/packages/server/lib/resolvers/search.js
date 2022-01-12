module.exports = {
  search,
};

async function search(_, __, { datasources }) {
  const articleList = await datasources.articles.list();
  return [...articleList, { id: 1, text: "A comment!" }];
}
