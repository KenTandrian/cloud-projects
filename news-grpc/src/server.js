const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const {
  addNews,
  deleteNews,
  editNews,
  getAllNews,
  getNews,
} = require("./services");

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

server.addService(newsProto.NewsService.service, {
  getAllNews,
  getNews,
  addNews,
  editNews,
  deleteNews,
});

server.bindAsync(
  "127.0.0.1:50051",
  grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    console.log(`Server running at http://127.0.0.1:50051`);
    server.start();
  }
);
