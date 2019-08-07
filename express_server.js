// const users = {
// }

const users = {
  "1234": {
    id: "1234",
    email: "me@me.com",
    password: "bob"
  }
};

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

const generateRandomString = function(length) {
  return Math.floor((1 + Math.random()) * 0x1000 * 0x1000).toString(16).substring(1,length);
};

const addURL = function(address) {
  let newKey = generateRandomString(7);
  urlDatabase[newKey] = address;
  // console.log(urlDatabase);
  return newKey;
};

const emailExist = function(email) {
  let found = false;
  for (const user in users) {
    // console.log(users[user].email, email);
    if (users[user].email === email) {
      found = user;
      break;
    }
  }
  return found;
};

const regOK = function(email, password) {
  // console.log(`email exists? ${emailExist(email)}`);

  return (emailExist(email) === false && email !== '' && password !== '') ? true : false;
};

// console.log(regOK("i@me.com", users["1234"].password));
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


//
// GET codes
//
app.get("/urls/new", (req, res) => {
  let templateVar = req.cookies["user_id"];
  res.render("urls_new", { user_id: templateVar});
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  let input = req.params.shortURL;
  let templateVar = { shortURL: input, longURL: urlDatabase[input], user_id: req.cookies["user_id"]};
  // console.log(input);
  // console.log(`/urls/:shortURL ${req.params.shortURL} \n for ${urlDatabase[input]}`);

  res.render("urls_show", templateVar);
  //ejs knows to automatically look for ejs in the views folder
});

app.get("/hello", (requ, resp) => {
  let templateVar = { greeting : 'Hello World'};
  resp.render("hello_world", templateVar);
});

//send respond about getting url for selected routes
app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});

// return the JSON file of the URL database
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// redirect to index page with the url table
app.get("/urls", (req, res) => {
  let templateVar = { urls: urlDatabase, user_id: req.cookies["user_id"]};
  
  res.render("urls_index", templateVar);
  //ejs knows to automatically look for ejs in the views folder
});

// send user to the register page upon clicking the button
app.get("/register", (req, res) => {
  let templateVar = { user_id: req.cookies["user_id"], status: 200};
  res.render("urls_login", templateVar);
});

// send user to the register page upon clicking the button
app.get("/login", (req, res) => {
  let templateVar = { user_id: req.cookies["user_id"], status: 400};
  res.render("urls_login", templateVar);
});

app.get("/", (req, res) => {
  res.redirect('/urls');
  // res.render("hello_world", { greeting: "Hello World"});
});

//
// POST codes
//
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
  // console.log(req.body);
  // insert logic to check URL
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
  // console.log(req.body["user_id"]);
  let sysPassword = emailExist(req.body["address"]);

  if (sysPassword === false || sysPassword !== req.body["password"]) {
    console.log(`User info does not match: ${sysPassword} ${req.body["password"]}`);
    let templateVar = { status : 403, user_id: undefined };
    res.redirect(403, res.render("urls_login", templateVar));
  } else {
    res.cookie("user_id", req.body["user_id"]);
    res.redirect(302, '/urls');
  }
});

app.post("/logout", (req, res) => {
  // console.log(req.body["user_id"]);  // Log the POST request body to the console
  res.clearCookie("user_id");
  res.redirect(302, '/urls');
});

app.post("/register", (req, res) => {
  // console.log(req.body["address"], req.body["password"]);

  let newUser = {};

  newUser.email = req.body["address"];
  newUser.password = req.body["password"];
  console.log(users);

  if (regOK(newUser.email, newUser.password) === false) {
    console.log("User exists and send to login page:", users);
    let templateVar = { status : 400, user_id: undefined };

    res.redirect(400, res.render("urls_login", templateVar));
  } else {

    let id = generateRandomString(5);
  
    newUser.id = id;
    newUser.email = req.body["address"];
    newUser.password = req.body["password"];

    users[id] = newUser;
    res.cookie('user_id', id);

    console.log(users);
    res.redirect(302, '/urls');
  }
});
 
app.post("*", (req, res) => {
  res.redirect(302, '/urls');
});
