const bcrypt = require('bcrypt');

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
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "1234", created: "Thu Aug 8 2019" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "1234", created: "Thu Aug 1 2019"},
  "g82ms9": { longURL: "http://www.triathlon.org", userID: "abcd", created: "Wed Aug 7 2019"}
};

let visitorDatabase = {
  "g82ms9": { totVis: 1, uniVis: 1, visits: { visitor_id: Date.now() - (15 * 60 * 1000) }}

};
// example
// <url key>: { <totVis>: ###, <uniVis>: ###, >visitors>: { <visitor_id>: <random>, <timestamp>: <time>}}

module.exports = { users, urlDatabase, visitorDatabase };