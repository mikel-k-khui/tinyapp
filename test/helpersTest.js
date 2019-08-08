const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";

    assert.strictEqual(user["email"], testUsers[expectedOutput]["email"]);
  });
  it('should return a user\'s valid password', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";

    assert.strictEqual(user["password"], testUsers[expectedOutput]["password"]);
  });
  it('incorrect id should return {}', function() {
    const user = getUserByEmail("test@example.com", testUsers);
    const expectedOutput = undefined;
  
    assert.strictEqual(user[""], expectedOutput);
  });
});