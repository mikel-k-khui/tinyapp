//Helpers functions
const generateRandomString = function(length) {
  return Math.floor((1 + Math.random()) * 0x1000 * 0x1000).toString(16).substring(1,length);
};

//check if the email eixsts in the users
const getUserByEmail = function(email, usersDatabase) {
  let found = false;
  for (const user in usersDatabase) {
    if (usersDatabase[user].email === email) {
      found = user;
      break;
    }
  }
  return found;
};

const userIDExist = (id, usersDatabase) => (id in usersDatabase) ? usersDatabase[id].email : undefined;

const regOK = (email, password) => (
  email !== '' &&
  password !== '');

const urlsForUser = function(userID, urlDatabase) {
  let userURLs = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url]["userID"] === userID) {
      userURLs[url] = urlDatabase[url]["longURL"];
    }
  }
  return userURLs;
};

module.exports = {
  getUserByEmail,
  generateRandomString,
  regOK,
  urlsForUser,
  userIDExist
};