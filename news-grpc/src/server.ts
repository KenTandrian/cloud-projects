import * as grpc from "@grpc/grpc-js";
import { addNews, deleteNews, editNews, getAllNews, getNews } from "./services";
import { NewsServiceService } from "../dist/news";

const server = new grpc.Server();
server.addService(NewsServiceService, {
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
