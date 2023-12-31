import http from "http";
import client from "./client";

const host = "localhost";
const port = 8000;

const requestListener: http.RequestListener = function (req, res) {
  console.log(`Received request from ${req.url}.`);
  const url = req.url!.split("/").slice(1);
  const method = req.method;

  let reqBody: any = [];
  req
    .on("data", (chunk) => {
      reqBody += chunk;
    })
    .on("end", () => {
      const body = reqBody.toString();
      if (body) reqBody = JSON.parse(body);
      handleRequest(method, url, reqBody, res);
    });
};

const handleRequest = (
  method: string | undefined,
  url: string[],
  reqBody: any,
  res: http.ServerResponse
) => {
  const { body, postImage, title } = reqBody;
  switch (method) {
    case "GET":
      if (!url[0]) {
        // GET /
        res.end("Server is running!");
      }
      if (url[0] === "news") {
        // GET /news/:id
        if (url.length > 1 && url[1]) {
          client.getNews({ id: url[1] }, (error, news) => {
            if (error) throw error;
            res.end(JSON.stringify(news));
          });
        }
        // GET /news
        client.getAllNews({}, (error, news) => {
          if (error) throw error;
          res.end(JSON.stringify(news));
        });
      }
      break;
    case "PUT":
      // PUT /news/:id
      client.editNews({ id: url[1], body, postImage, title }, (error, news) => {
        if (error) throw error;
        res.end(JSON.stringify(news));
      });
      break;
    case "DELETE":
      // DELETE /news/:id
      client.deleteNews({ id: url[1] }, (error, news) => {
        if (error) throw error;
        res.end(JSON.stringify(news));
      });
      break;
    case "POST":
      // POST /news
      client.addNews({ body, postImage, title }, (error, news) => {
        if (error) throw error;
        res.end(JSON.stringify(news));
      });
      break;
    default:
      res.end("");
      break;
  }
};

const server = http.createServer(requestListener);
server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});
