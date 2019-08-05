const express = require("express");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
//setup Express app to use ejs as templating engine

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (request, response) => {
  response.end("Hello!");
});

app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
});

app.get("/hello", (requ, resp) => {
  let template = { greeting : 'Hello World'};
  resp.render("hello_world", template);
});
//send respond about getting url for selected route

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});

app.get("/urls", (req, res) => {
  let template = { urls: urlDatabase };
  // console.log(`/urls: ${template}`);
  res.render("urls_index", template);
  //ejs knows to automatically look for ejs in the views folder
});
// return the JSON file of the URL database

app.get("/urls/:shortURL", (req, res) => {
  let input = req.params.shortURL;
  // console.log(input);
  let template = { shortURL: input, longURL: urlDatabase[input]};
  // console.log(`/urls/:shortURL ${req.params.shortURL} \n for ${urlDatabase[input]}`);

  res.render("urls_show", template);
  //ejs knows to automatically look for ejs in the views folder
});
// return the JSON file of the URL database

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
// return the JSON file of the URL databases

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});