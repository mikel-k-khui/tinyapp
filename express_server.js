const bcrypt = require('bcrypt');
const express = require('express');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
// const { addURL,
//   emailExist,
//   generateRandomString,
//   regOK,
//   urlsForUser,
//   userIDExist } = require('./helpers')
const app = express();
const PORT = 8081;

const users = {
  "1234": {
    id: "1234",
    email: "me@me.com",
    password: bcrypt.hashSync("bob", 10)
  },
  "abcd": {
    id: "abcd",
    email: "i@me.com",
    password: bcrypt.hashSync("bob", 10)
  }
};

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "1234" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "1234"},
  "g82ms9": { longURL: "http://www.triathlon.org", userID: "abcd"}
};

app.set("view engine", "ejs");
//setup Express app to use ejs as templating engine

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['12345'],
  maxAge: 24 * 60 * 60 * 1000
}));

//Helper functions
const generateRandomString = function(length) {
  return Math.floor((1 + Math.random()) * 0x1000 * 0x1000).toString(16).substring(1,length);
};

//take in a long URL and return the new short URL as key
const addURL = function(address, user) {
  let newKey = generateRandomString(7);
  urlDatabase[newKey] = {};
  urlDatabase[newKey].longURL = address;
  urlDatabase[newKey].userID = user;
  // console.log(urlDatabase);
  return newKey;
};

//check if the email eixsts in the users
const emailExist = function(email) {
  let found = false;
  for (const user in users) {
    if (users[user].email === email) {
      found = user;
      break;
    }
  }
  return found;
};

const userIDExist = (id) => (id in users) ? users[id].email : undefined;

const regOK = (email, password) => (
  emailExist(email) === false &&
  email !== '' &&
  password !== '');

const urlsForUser = function(userID) {
  let userURLs = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url]["userID"] === userID) {
      userURLs[url] = urlDatabase[url]["longURL"];
    }
  }
  return userURLs;
};


// console.log(regOK("i@me.com", users["1234"].password));
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


//
// GET codes
//
// User request to add a new long url from the header
app.get("/urls/new", (req, res) => {
  (userIDExist(req.session.userID)) ?
    res.render("urls_new", { email: userIDExist(req.session.userID) }) :
    res.redirect('/login');
});

//any user can visit a shorterned URL provided by an authorized user
app.get("/u/:shortURL", (req, res) => {
  (req.params.shortURL in urlDatabase) ? res.redirect(urlDatabase[req.params.shortURL].longURL) : res.send({ error: "URL not found"});
});

app.get("/urls/:shortURL", (req, res) => {
  //assumes users are not authorized
  if (userIDExist(req.session.userID)) {
    let templateVar = {
      shortURL: req.params.shortURL,
      longURL: urlsForUser(req.session.userID)[req.params.shortURL],
      email: userIDExist(req.session.userID)
    };
    res.render("urls_show", templateVar);
  } else {
    res.redirect('/login');
  }
});

app.get("/hello", (requ, resp) => resp.render("hello_world", { greeting : 'Hello World'}));

//send respond about getting url for selected routes
// app.get("/set", (req, res) => {
//   const a = 1;
//   res.send(`a = ${a}`);
// });

// return the JSON file of the URL database
app.get("/urls.json", (req, res) => (userIDExist(req.session.userID)) ? res.json(urlDatabase) : res.redirect('/login'));

// redirect to index page with the url table
app.get("/urls", (req, res) => {
  if (userIDExist(req.session.userID)) {
    let templateVar = {
      urls: urlsForUser(req.session.userID),
      email: userIDExist(req.session.userID)
    };
    res.render("urls_index", templateVar);
  //ejs knows to automatically look for ejs in the views folder
  }
  res.render('urls_login', { status: 200, email: undefined });
});

// send user to the register page upon clicking the button
app.get("/register", (req, res) => {
  (req.session.userID) ?
    res.render("urls_login", { status: 200, email: users[req.session.userID].email }) :
    res.render("urls_login", { status: 200, email: undefined });
});

// send user to the register page upon clicking the button
app.get("/login", (req, res) => {
  (req.session.userID) ?
    res.render("urls_login", { status: 400, email: users[req.session.userID].email }) :
    res.render("urls_login", { status: 400, email: undefined });
});

app.get("/", (req, res) => res.redirect('/urls'));
// res.render("hello_world", { greeting: "Hello World"});

//
// POST codes
//
//allow user to delete
app.post("/urls/:shortURL/delete", (req, res) => {
  let userURLs = urlsForUser(req.session.userID);

  if (userIDExist(req.session.userID) && req.params.shortURL in userURLs) {
    delete urlDatabase[req.params.shortURL];
    //delete the url
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});
// allow (authorized) user to edit an existing long URL
app.post("/urls/:id", (req, res) => {
  if (userIDExist(req.session.userID) && urlDatabase !== {}) {
    let userURLs = urlsForUser(req.session.userID);

    if (req.params.id in userURLs) {
      urlDatabase[req.params.id]["longURL"] = req.body["newLongURL"];
      res.redirect('/urls');
    } else {
      res.redirect('/urls');
    }
  } else {
    res.redirect('/login');
  }
});

//Function to add a new URL to the database with a randomized ID
//then redirect the edit page
app.post("/urls", (req, res) => {
  console.log(req);
  userIDExist(req.session.userID) ?
    res.redirect('urls/' + addURL(req.body["longURL"], req.session.userID)) :
    res.redirect('/login');
});

app.post("/login", (req, res) => {
  let sysId = emailExist(req.body["address"]);

  if (sysId === false || !bcrypt.compareSync(req.body["password"], users[sysId].password)) {
    res.redirect('/login');
  } else {
    // res.cookie("user_id", sysId);
    req.session.userID = sysId;
    console.log("what is in the cookie?", req.session);
    res.redirect('/urls');
  }
});

app.post("/logout", (req, res) => {
  req.session.userID = null;
  res.redirect('/urls');
});

app.post("/register", (req, res) => {
  if (regOK(req.body["address"], req.body["password"]) === false) {
    res.redirect('/login');
    //user email already exists
  } else {
    let newUser = {
      id: generateRandomString(5),
      email: req.body["address"],
      password: bcrypt.hashSync(req.body["password"], 10)
    // hashing with salt for 10 rounds
    };

    users[newUser["id"]] = newUser;
    req.session.userID = newUser.id;

    // console.log("Register's passwords are hash:", users, "and id still good:", req.session.userID);
    res.redirect('/urls');
  }
});
 
app.post("*", (req, res) => {
  if (userIDExist(req.cookies["user_id"])) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});
