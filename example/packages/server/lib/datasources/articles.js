module.exports = {
  list,
  getById,
};

async function list() {
  return [
    { id: 1, content: 'ac', releasedAt: new Date() },
  ];
}

async function getById(id) {
  
}
