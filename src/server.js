const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const PROTO_PATH = "./proto/news.proto";
const options = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
};
var packageDefinition = protoLoader.loadSync(PROTO_PATH, options);
const newsProto = grpc.loadPackageDefinition(packageDefinition);

const server = new grpc.Server();
let news = [
  { id: "1", title: "Note 1", body: "Content 1", postImage: "Post image 1" },
  { id: "2", title: "Note 2", body: "Content 2", postImage: "Post image 2" },
];

server.addService(newsProto.NewsService.service, {
  getAllNews: (_, callback) => {
    callback(null, { news });
  },
  getNews: (_, callback) => {
    const newsId = _.request.id;
    const newsItem = news.find(({ id }) => newsId === id);
    callback(null, newsItem);
  },
  addNews: (call, callback) => {
    const _news = { ...call.request, id: Date.now().toString() };
    news.push(_news);
    callback(null, _news);
  },
  editNews: (_, callback) => {
    const newsId = _.request.id;
    const _news = news.find(({ id }) => newsId === id);
    if (_news) {
      _news.body = _.request.body;
      _news.postImage = _.request.postImage;
      _news.title = _.request.title;
    }
    callback(null, _news);
  },
  deleteNews: (_, callback) => {
    const newsId = _.request.id;
    news = news.filter(({ id }) => id !== newsId);
    callback(null, {});
  },
});

server.bindAsync(
  "127.0.0.1:50051",
  grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    console.log(`Server running at http://127.0.0.1:50051`);
    server.start();
  }
);
