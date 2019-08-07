const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const app = express();
const PORT = 8081;

app.set("view engine", "ejs");
//setup Express app to use ejs as templating engine

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const generateRandomString = function() {
  return Math.floor((1 + Math.random()) * 0x1000 * 0x1000).toString(16).substring(1,7);
};

const addURL = function(address) {
  let newKey = generateRandomString();
  urlDatabase[newKey] = address;
  // console.log(urlDatabase);
  return newKey;
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//
// app.get("/fetch", (req, res) => {
//   res.send(`a = ${a}`);
// });
//
/*
* GET codes
*/
app.get("/urls", (req, res) => {
  let template = { urls: urlDatabase, username: req.cookies["username"]};
  
  res.render("urls_index", template);
  //ejs knows to automatically look for ejs in the views folder
});

app.get("/urls/new", (req, res) => {
  let templateVar = req.cookies["username"];
  res.render("urls_new", { username: templateVar});
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  let input = req.params.shortURL;
  let template = { shortURL: input, longURL: urlDatabase[input], username: req.cookies["username"]};
  // console.log(input);
  // console.log(`/urls/:shortURL ${req.params.shortURL} \n for ${urlDatabase[input]}`);

  res.render("urls_show", template);
  //ejs knows to automatically look for ejs in the views folder
});

app.get("/hello", (requ, resp) => {
  let template = { greeting : 'Hello World'};
  resp.render("hello_world", template);
});

//send respond about getting url for selected routes
//
app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});
//

app.get("/", (req, res) => {
  res.redirect('/urls');
  // res.render("hello_world", { greeting: "Hello World"});
});

// return the JSON file of the URL database
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.post("/urls/:id", (req, res) => {
  // console.log(urlDatabase, req.params.id);

  if (urlDatabase === {}) {
    res.end("There is no url in the database");
  }

  if (req.params.id in urlDatabase) {
    urlDatabase[req.params.id] = req.body["newLongURL"];
  }

  // console.log(urlDatabase);
  res.redirect('/urls'); //s/b 302?
});

//Function to add a new URL to the database with a randomized ID
app.post("/urls", (req, res) => {
  // console.log(req.body);  // Log the POST request body to the console
  let tempURL = 'urls/' + addURL(req.body["longURL"]);
  console.log(`new URL: ${tempURL}`);  // Log the POST request body to the console

  res.redirect(tempURL);
  // res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:shortURL/delete", (req, res) => {
  console.log(urlDatabase, req.params.shortURL);

  if (urlDatabase === {}) {
    res.end("There is no url in the database");
  }

  if (req.params.shortURL in urlDatabase) {
    delete urlDatabase[req.params.shortURL];
  }

  res.redirect('/urls'); //s/b 302?
});

app.post("/login", (req, res) => {
  // console.log(req.body["username"]);  // Log the POST request body to the console
 
  res.cookie('username', req.body["username"]);
  res.redirect(302, '/urls');
});

app.post("/logout", (req, res) => {
  // console.log(req.body["username"]);  // Log the POST request body to the console
 
  res.clearCookie("username");
  res.redirect(302, '/urls');
});
 
app.post("*", (req, res) => {
  res.redirect(302, '/urls');
});