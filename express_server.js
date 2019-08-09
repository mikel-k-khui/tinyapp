const bcrypt = require('bcrypt');
const express = require('express');
const cookieParser = require("cookie-parser");
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const {
  getUserByEmail,
  generateRandomString,
  regOK,
  urlsForUser,
  urlsDetForUser,
  trackVisitors,
  userIDExist } = require('./helpers');
const methodOverride = require('method-override');
const app = express();
const PORT = 8080;
//setup

const {
  users,
  urlDatabase,
  visitorDatabase } = require('./constant');
// ACTION: comment out if pre-set data is not required

app.set("view engine", "ejs");
//setup Express app to use ejs as templating engine

app.use(bodyParser.urlencoded({extended: true}));
//setup body parser

app.use(cookieParser());
//setup cookie parser for visitor cookies

app.use(cookieSession({
  name: 'users',
  keys: ['12345'],
  maxAge: 24 * 60 * 60 * 1000,
  expires: true
}));
//setup the cookie for name, key and 24 hours maximum session stay if session is still open

const expiration = new Date();

app.use(cookieSession({
  name: 'visitors',
  keys: ['67890'],
  maxAge: 30 * 60 * 1000,
  expires: expiration.setTime(Date.now() + 2 * 60 * 1000)
}));
//setup the cookie for name, key and 24 hours maximum session stay if session is still open

app.use(methodOverride('_method'));
//setup method override


// DELETE route codes
//allow user to delete
app.delete("/urls/:shortURL", (req, res) => {
  if (userIDExist(req.session.userID, users) && urlDatabase.length !== 0) {
    if (req.params.shortURL in urlsForUser(req.session.userID, urlDatabase)) {
      delete urlDatabase[req.params.shortURL];
      res.redirect('/urls');
    } else {
      res.redirect(401, 'Not authorized to access /urls');
      //specific case where use does not own the URL
    }
    //end of checking authorized user
  } else {
    res.redirect(401, '/login');
  }
});

// GET routes codes
// Create new url for authorized users
app.get("/urls/new", (req, res) => {
  (userIDExist(req.session.userID, users)) ?
    res.render("urls_new", { email: userIDExist(req.session.userID, users) }) :
    res.redirect('/login');
});

//any user can visit a shorterned URL provided by an authorized user
app.get("/u/:shortURL", (req, res) => {
  if (req.params.shortURL in urlDatabase) {
    // if (req.session.user_id) {
    //   trackVisitors(visitorDatabase, req.params.shortURL, req.session.user_id);
    // } else {
      req.session.user_id = generateRandomString(5);
      console.log(req.session.user_id);
      console.log(req.body);
    //   trackVisitors(visitorDatabase, req.params.shortURL, req.visitor.user_id);
    // }

    res.redirect(urlDatabase[req.params.shortURL].longURL);
  } else {
    res.redirect(404,'/urls');
  }
});

app.get("/urls/:shortURL", (req, res) => {
  if (userIDExist(req.session.userID, users)) {
    if (req.params.shortURL in urlsForUser(req.session.userID, urlDatabase)) {
      let templateVar = {
        shortURL: req.params.shortURL,
        longURL: urlsForUser(req.session.userID, urlDatabase)[req.params.shortURL],
        email: userIDExist(req.session.userID, users)
      };
      res.render("urls_show", templateVar);
      //url exists and user authorized to view
    } else if (req.params.shortURL in urlDatabase) {
      res.redirect(401, '/urls');
      //URL not in authorized list of shortened URL of user
    } else {
      res.redirect(404, '/urls');
      //URL does not exist
    }
    //end of checking authorized users
  } else {
    res.redirect(401, '/login');
  }
});

// return the JSON file of the URL database
app.get("/urls.json", (req, res) => (userIDExist(req.session.userID, users)) ? res.json(urlDatabase) : res.redirect('/login'));

// redirect to index page with the url table
app.get("/urls", (req, res) => {
  console.log(userIDExist(req.session.userID, users));
  if (userIDExist(req.session.userID, users)) {
    let templateVar = {
      urls: urlsDetForUser(req.session.userID, urlDatabase),
      email: userIDExist(req.session.userID, users)
    };
    res.render("urls_index", templateVar);
  //ejs knows to automatically look for ejs in the views folder
  } else {
    res.redirect(401, '/login');
  }
});

// send user to the register page upon clicking the button
app.get("/register", (req, res) => {
  (req.session.userID) ?
    res.redirect('/urls') :
    res.render("urls_login", { status: 200, email: undefined });
});

// send user to the register page upon clicking the button if not logged in
app.get("/login", (req, res) => {
  (req.session.userID) ?
    res.redirect('/urls') :
    res.render("urls_login", { status: 400, email: undefined });
});

//root directory to redirect based on authorization
//default is index (/urls) versus login for unauthorized users
app.get("/", (req, res) => {
  (req.session.userID) ?
    res.redirect('/urls') :
    res.redirect('login');
});

//default to catch all other GETs routes
app.get("*", (req, res) => {
  if (userIDExist(req.session.userID, users)) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

// POST routes codes
//Function to add a new URL to the database with a randomized ID
//then redirect the edit page
app.post("/urls", (req, res) => {
  console.log(userIDExist(req.session.userID, users));
  if (userIDExist(req.session.userID, users)) {
    let newKey = generateRandomString(7);
    urlDatabase[newKey] = {};
    urlDatabase[newKey].longURL = req.body["longURL"];
    urlDatabase[newKey].userID = req.session.userID;
    urlDatabase[newKey].created = Date.now().toDateString();

    res.redirect('urls/' + newKey);
  } else {
    res.redirect(401, '/login');
  }
});

// user login
app.post("/login", (req, res) => {
  let sysId = getUserByEmail(req.body["address"], users);


  if (Object.keys(sysId).length === 0 || req.body["password"] === '') {
    res.redirect(401, 'incorrect input /login');
    //login in error due to a) new user or empty password
  } else if (!bcrypt.compareSync(req.body["password"], sysId["password"])) {
    res.redirect(401, 'incorrect password /login');
    //login in error due to incorrect password by existing user
  } else {
    req.session.userID = sysId["id"];  console.log(sysId);
    res.redirect('/urls');
    //successful login
  }
});

//user logout
app.post("/logout", (req, res) => {
  req.session.userID = null;
  res.redirect(202, '/urls');
});

//user registration
app.post("/register", (req, res) => {
  if (regOK(req.body["address"], req.body["password"]) === false) {
    res.redirect(401, '/register');
    //incorrect input error as backdrop for http form failure
  } else if (Object.keys(getUserByEmail(req.body["address"], users)).length !== 0) {
    res.redirect(401, '/login');
    //user email exists and redirect to login
  } else {
    //user is new with correct inputs and being added with a hashed password
    let newUser = {
      id: generateRandomString(5),
      email: req.body["address"],
      password: bcrypt.hashSync(req.body["password"], 10)
    // hashing with salt for 10 rounds
    };
    users[newUser["id"]] = newUser;
    req.session.userID = newUser.id;
    res.redirect('/urls');
  }
});
 
//default to catch all other POST routes
app.post("*", (req, res) => {
  if (userIDExist(req.session.userID, users)) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

// PUT route codes
// allow (authorized) user to edit an existing long URL
app.put("/urls/:id", (req, res) => {
  if (userIDExist(req.session.userID, users)) {
    // console.log(req.params);
    if (req.params.id in urlsForUser(req.session.userID, urlDatabase)) {
      urlDatabase[req.params.id]["longURL"] = req.body["newLongURL"];
      res.redirect('/urls');
    } else {
      res.redirect(401, 'Not authorized to access /urls');
      //specific case where use does not own the URL
    }
    //end of checking authorized users
  } else {
    res.redirect(401, '/login');
  }
});

//listener
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});