// const users = {
// }

const users = {
  "1234": {
    id: "1234",
    email: "me@me.com",
    password: "bob"
  },
  "abcd": {
    id: "abcd",
    email: "i@me.com",
    password: "bob"
  }
};

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "1234" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "1234"},
  "g82ms9": { longURL: "http://www.triathlon.org", userID: "abcd"}
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

const generateRandomString = function(length) {
  return Math.floor((1 + Math.random()) * 0x1000 * 0x1000).toString(16).substring(1,length);
};

//take in a long URL and return the new short URL as key
const addURL = function(address, user) {
  let newKey = generateRandomString(7);
  urlDatabase[newKey] = {};
  urlDatabase[newKey].longURL = address;
  urlDatabase[newKey].userID = user;
  console.log(urlDatabase);
  return newKey;
};

//check if the email eixsts in the users
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

const userIDExist = function(id) {
  return (id in users) ? users[id].email : undefined
};

const regOK = function(email, password) {
  // console.log(`email exists? ${emailExist(email)}`);

  return (emailExist(email) === false && email !== '' && password !== '') ? true : false;
};

const urlsForUser = function(userID) {
  let userURLs = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url]["userID"] === userID) {
      // console.log("In url loop:", urlDatabase[url]["longURL"], urlDatabase[url]["userID"]);
      userURLs[url] = urlDatabase[url]["longURL"];
      // console.log("End of url loop:", userURLs);
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
  let templateVar = {};
  // console.log(templateVar, "id:", req.cookies["user_id"]);

  templateVar.email = userIDExist(req.cookies["user_id"]);

  //assumes users are not authorized
  if (templateVar.email) {
    res.render("urls_new", { email: templateVar.email });
  } else {
    console.log("Not authorized: ", templateVar, "id:", req.cookies["user_id"]);
    res.redirect(403, "/login");
  }
});

//any user can visit a shorterned URL provided by an authorized user
app.get("/u/:shortURL", (req, res) => {
  if (req.params.shortURL in urlDatabase) {
    res.redirect(urlDatabase[req.params.shortURL].longURL);
  }
});

//
app.get("/urls/:shortURL", (req, res) => {
  let templateVar = {};
  console.log(templateVar, "id:", req.cookies["user_id"]);

  templateVar.email = userIDExist(req.cookies["user_id"]);

  //assumes users are not authorized
  if (templateVar.email) {
    let input = req.params.shortURL;
    let userUrls = urlsForUser(req.cookies["user_id"]);

    // console.log("What is available to user?", userUrls, " input:", input);
    templateVar.shortURL = input;
    templateVar.longURL = userUrls[input];

    console.log("template var for edit page: ", templateVar);

    res.render("urls_show", templateVar);
    //ejs knows to automatically look for ejs in the views folder
  } else {
    res.redirect(403, "/login");
  }
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
  // console.log(userIDExist(req.cookies["user_id"]));
  if (userIDExist(req.cookies["user_id"])) {
    res.json(urlDatabase);
  } else {
    res.redirect(403, "/login");
  }
});

// redirect to index page with the url table
app.get("/urls", (req, res) => {
  
  let templateVar = {};
  // console.log(templateVar, "id:", req.cookies["user_id"]);

  templateVar.email = userIDExist(req.cookies["user_id"]);
  console.log(`any cookies? ${req.cookies["user_id"]}, `,users);

  //assumes users are not authorized
  if (templateVar.email) {
    templateVar.urls = urlsForUser(req.cookies["user_id"]);
    res.render("urls_index", templateVar);
  //ejs knows to automatically look for ejs in the views folder
  } else {
    res.redirect(403, '/login');
    //should we send user to a nicer page?
  }
});

// send user to the register page upon clicking the button
app.get("/register", (req, res) => {
  let templateVar = { status: 200, email: undefined };
  
  if (req.cookies["user_id"]) {
    templateVar.email = users[req.cookies["user_id"]].email;
  }

  res.render("urls_login", templateVar);
});

// send user to the register page upon clicking the button
app.get("/login", (req, res) => {
  let templateVar = { status: 400, email: undefined};
  
  if (req.cookies["user_id"]) {
    templateVar.email = users[req.cookies["user_id"]].email;
  }

  res.render("urls_login", templateVar);
});

app.get("/", (req, res) => {
  res.redirect('/urls');
  // res.render("hello_world", { greeting: "Hello World"});
});

//
// POST codes
//
// allow (authorized) user to edit an existing long URL
app.post("/urls/:id", (req, res) => {
  // console.log(urlDatabase, req.params.id);

  let templateVar = {};
  // console.log(templateVar, "id:", req.cookies["user_id"]);

  templateVar.email = userIDExist(req.cookies["user_id"]);
  // console.log(`any cookies? ${req.cookies["user_id"]}, `,users);

  //assumes users are not authorized
  if (templateVar.email) {
    if (urlDatabase === {}) {
      res.end("There is no url in the database");
    }

    let userURLs = urlsForUser(req.cookies["user_id"]);
    // console.log("Page parameter:", req.params.id);
    if (req.params.id in userURLs) {
      urlDatabase[req.params.id]["longURL"] = req.body["newLongURL"];
      res.redirect('/urls');
    } else {
      redirect(404, '/urls');
      // url id not found
    }
  } else {
    res.redirect(403, '/login');
  }
});

//Function to add a new URL to the database with a randomized ID
//then redirect the edit page
app.post("/urls", (req, res) => {
  let templateVar = {};
  // console.log(templateVar, "id:", req.cookies["user_id"]);

  templateVar.email = userIDExist(req.cookies["user_id"]);
  // console.log(`any cookies? ${req.cookies["user_id"]}, `,users);

  //assumes users are not authorized
  if (templateVar.email) {
    let tempURL = 'urls/' + addURL(req.body["longURL"], req.cookies["user_id"]);
    console.log(`new URL: ${tempURL}`);  // Log the POST request body to the console

    res.redirect(tempURL);
    //redirect users to the new page /urls/
  } else {
    res.redirect('/urls'); //s/b 302?
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  console.log(urlDatabase, req.params.shortURL);
  let templateVar = {};
  // console.log(templateVar, "id:", req.cookies["user_id"]);

  templateVar.email = userIDExist(req.cookies["user_id"]);
  // console.log(`any cookies? ${req.cookies["user_id"]}, `,users);

  //assumes users are not authorized
  if (templateVar.email) {
    if (urlDatabase === {}) {
      res.end("There is no url in the database");
    }
    
    let userURLs = urlsForUser(req.cookies["user_id"]);
    // look for a list of user's URL for security check
    
    if (req.params.shortURL in userURLs) {
      delete urlDatabase[req.params.shortURL];
    }
    //delete the url

    res.redirect('/urls'); //s/b 302?
  } else {
    res.redirect(403, '/login');
  }
});

app.post("/login", (req, res) => {
  // console.log(req.body["user_id"]);
  let sysId = emailExist(req.body["address"]);

  if (sysId === false || users[sysId].password !== req.body["password"]) {
    console.log(`User info does not match: ${users[sysId].password} ${req.body["password"]}`);

    let templateVar = { status : 403, email: undefined};
    
    res.redirect(403, res.render("urls_login", templateVar));
  } else {
    console.log(`User matched: ${users[sysId]} ${req.body["password"]}`);
    res.cookie("user_id", sysId);
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
  // console.log(users);

  if (regOK(newUser.email, newUser.password) === false) {
    console.log("User exists and send to login page:", users);
    let templateVar = { status : 400, email: undefined};

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
  let templateVar = {};
  // console.log(templateVar, "id:", req.cookies["user_id"]);

  templateVar.email = userIDExist(req.cookies["user_id"]);
  // console.log(`any cookies? ${req.cookies["user_id"]}, `,users);

  //assumes users are not authorized
  if (templateVar.email) {
    res.redirect(302, '/urls');
  } else {
    res.redirect(403, '/login');
  }
});
