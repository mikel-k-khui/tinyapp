const express = require("express");
const app = express();
const PORT = 8080;

app.set("view enging", "ejs");
//setup Express app to use ejs as templating engine

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (request, response) => {
  response.end("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
// return the JSON file of the URL database

app.get("/hello", (requ, resp) => {
  resp.send(`<html><body>Hello <b>World</b></body></html>\n`);
});
//send respond about getting url for selected route

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});

app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});