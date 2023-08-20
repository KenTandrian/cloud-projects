import client from "./client";

client.getAllNews({}, (error, news) => {
  if (error) throw error;
  console.log(news);
});
