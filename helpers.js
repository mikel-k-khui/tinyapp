//Helpers functions
const generateRandomString = function(length) {
  return Math.floor((1 + Math.random()) * 0x1000 * 0x1000).toString(16).substring(1,length);
};

//check if the email eixsts in the users
const getUserByEmail = function(email, usersDatabase) {
  let found = {};
  for (const user in usersDatabase) {
    if (usersDatabase[user].email === email) {
      found = usersDatabase[user];
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

const urlsDetForUser = function(userID, urlDatabase) {
  let userURLs = {};

  for (const url in urlDatabase) {
    if (urlDatabase[url]["userID"] === userID) {
      let urlDet = {};
      urlDet["longURL"] = urlDatabase[url]["longURL"];
      urlDet["created"] = urlDatabase[url]["created"];
      userURLs[url] = urlDet;
    }
  }
  return userURLs;
};

const trackVisitors = function(visDB, url, visCookie) {
  // if (Object.keys(visDB).length === 0) {
  //   //set up an empty object
  //   let urlVisInfo = {};
  //   let visDet = {};
  //   urlVisInfo[url]["totVis"] = 1;
  //   urlVisInfo[url]["uniVis"] = 1;
  //   visDet[visitor_id] = visCookie;
  //   visDet[visCookie][timeStampe] = Date.now();
  //   urlVisInfo[url]["visits"] = visDet;
  // } else {

  // }

  // return visDB;
};

const getVisitorById = function(visDB, visitor_id) {
  // for (const url in visDB) {
  //   let visDet = visDB[url]["visits"];
  //   for (const visitor in visDet) {
  //     if (visitor_id === visitor[])
  //   }

  // }
};

module.exports = {
  getUserByEmail,
  generateRandomString,
  regOK,
  urlsForUser,
  urlsDetForUser,
  userIDExist
};