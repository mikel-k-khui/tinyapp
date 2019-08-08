const bcrypt = require('bcrypt');
const express = require('express');

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

module.exports = { users, urlDatabase };