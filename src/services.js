let news = [
  { id: "1", title: "News 1", body: "Content 1", postImage: "Post image 1" },
  { id: "2", title: "News 2", body: "Content 2", postImage: "Post image 2" },
];

const getAllNews = (_, callback) => {
  callback(null, { news });
};

const getNews = (_, callback) => {
  const newsId = _.request.id;
  const newsItem = news.find(({ id }) => newsId === id);
  callback(null, newsItem);
};

const addNews = (call, callback) => {
  const _news = { ...call.request, id: Date.now().toString() };
  news.push(_news);
  callback(null, _news);
};

const editNews = (_, callback) => {
  const newsId = _.request.id;
  const _news = news.find(({ id }) => newsId === id);
  if (_news) {
    _news.body = _.request.body;
    _news.postImage = _.request.postImage;
    _news.title = _.request.title;
  }
  callback(null, _news);
};

const deleteNews = (_, callback) => {
  const newsId = _.request.id;
  news = news.filter(({ id }) => id !== newsId);
  callback(null, {});
};

module.exports = {
  getAllNews,
  getNews,
  addNews,
  editNews,
  deleteNews,
};
