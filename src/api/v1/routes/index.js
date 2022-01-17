var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  const docResponse = {
    greetings: "Welcome to blog rest api development",
    userSignUp: {
      description: "Register a new user ",
      ednpoint: "/api/v1/users/auth/signup",
      methods: "POST",
    },
    userSignIn: {
      description: "Login to an exist user",
      ednpoint: "/api/v1/users/auth/signin",
      methods: "POST",
    },
    users: {
      description: "To get all users only for admin role",
      ednpoint: "/api/v1/users",
      methods: "GET",
    },
    "users/uid": {
      description: " single user get, update, and delete",
      ednpoint: "/api/v1/users/:uid",
      methods: "GET, PUT, DELETE",
    },
  };
  res.json(docResponse);
});

module.exports = router;
