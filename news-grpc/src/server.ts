import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { addNews, deleteNews, editNews, getAllNews, getNews } from "./services";

const PROTO_PATH = "./proto/news.proto";
const options: protoLoader.Options = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
};
var packageDefinition = protoLoader.loadSync(PROTO_PATH, options);
const newsProto = grpc.loadPackageDefinition(packageDefinition);
const newsService = newsProto.NewsService as grpc.ServiceClientConstructor;

const server = new grpc.Server();

server.addService(newsService.service, {
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
    if (err) console.error(err);
    console.log(`Server running at http://127.0.0.1:${port}`);
    server.start();
  }
);
