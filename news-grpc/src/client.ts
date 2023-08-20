import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { NewsServiceClient } from "../dist/news";

const PROTO_PATH = "./proto/news.proto";
const options = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
};
var packageDefinition = protoLoader.loadSync(PROTO_PATH, options);
const NewsService = grpc.loadPackageDefinition(packageDefinition).NewsService;

const client = new NewsServiceClient(
  "localhost:50051",
  grpc.credentials.createInsecure()
);

export default client;
