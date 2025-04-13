const express = require("express");
const app = express();
const port = 3000;
const path = require('path')

require('dotenv').config();
app.use(express.json());
const passport = require('./passport'); 
const session = require('express-session');
const bcrypt=require('bcrypt');
const saltRounds = 10
const { db,addUserToDb,connectToDb } = require("./db");
const { error } = require("console");


app.use(express.urlencoded({ extended: true }));
(async () => {
  try {
    await connectToDb();
  } catch (err) {
    console.error("Failed to connect to DB:", err);
  }
})();

// Middleware setup
app.use(express.json());
app.use(session({
  secret: 'TheKey',
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize()); // Initialize Passport
app.use(passport.session()); // Enable sessions for Passport

const hashPassword = async(password) => {
  const hashedPassword = await bcrypt.hash(password, saltRounds)
  return hashedPassword
}


app.post("/signup", async (req, res) => { 
  const { username, password } = req.body
  const userData = {
    "username": username,
    "password":await hashPassword(password)
  }
  console.log("userData: ",userData.password)
  try {
    const result = await addUserToDb(userData);
    res.status(200).send({ message: "User signed up successfully!" });
}
catch (error) {
  // Handle any errors that occur during the process
  console.error("Error during user signup:", error);
  res.status(500).send({ message: "There was an issue signing up." });
}
  

})


app.post("/login/password", (req, res, next) => {
  console.log("Route /login/password triggered");
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error("Error during authentication:", err);
      return res.status(500).send({ message: "Server error." });
    }
    if (!user) {
      console.log("Authentication failed:", info.message);
      return res.redirect('/login');
    }
    req.login(user, (err) => {
      if (err) {
        console.error("Login error:", err);
        return res.status(500).send({ message: "Login error." });
      }
      console.log("Login successful:", user);
      return res.redirect('/main');
    });
  })(req, res, next);
});




// for ejs view

app.set("view engine", "ejs");
// Set the views folder
app.set("views", path.join(__dirname, "views"));

// Route to render the login page
app.get("/", (req, res) => {
  res.render("main"); // 'main' refers to main.ejs
});

app.get("/signup", (req, res) => {
  res.render("signup"); // 'main' refers to main.ejs
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});