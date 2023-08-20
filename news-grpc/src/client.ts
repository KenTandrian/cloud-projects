import * as grpc from "@grpc/grpc-js";
import { NewsServiceClient } from "../dist/news";

const client = new NewsServiceClient(
  "localhost:50051",
  grpc.credentials.createInsecure()
);

export default client;
