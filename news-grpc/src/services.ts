import { ServerUnaryCall, sendUnaryData } from "@grpc/grpc-js";
import { Empty, News, NewsId, NewsList } from "../dist/news";

let news = [
  { id: "1", title: "News 1", body: "Content 1", postImage: "Post image 1" },
  { id: "2", title: "News 2", body: "Content 2", postImage: "Post image 2" },
];

export const getAllNews = (
  _: ServerUnaryCall<Empty, NewsList>,
  callback: sendUnaryData<NewsList>
) => {
  callback(null, { news });
};

export const getNews = (
  _: ServerUnaryCall<NewsId, News>,
  callback: sendUnaryData<News>
) => {
  const newsId = _.request.id;
  const newsItem = news.find(({ id }) => newsId === id);
  callback(null, newsItem);
};

export const addNews = (
  _: ServerUnaryCall<News, News>,
  callback: sendUnaryData<News>
) => {
  const _news = { ..._.request, id: Date.now().toString() };
  news.push(_news);
  callback(null, _news);
};

export const editNews = (
  _: ServerUnaryCall<News, News>,
  callback: sendUnaryData<News>
) => {
  const newsId = _.request.id;
  const _news = news.find(({ id }) => newsId === id);
  if (_news) {
    _news.body = _.request.body;
    _news.postImage = _.request.postImage;
    _news.title = _.request.title;
  }
  callback(null, _news);
};

export const deleteNews = (
  _: ServerUnaryCall<NewsId, Empty>,
  callback: sendUnaryData<Empty>
) => {
  const newsId = _.request.id;
  news = news.filter(({ id }) => id !== newsId);
  callback(null, {});
};
