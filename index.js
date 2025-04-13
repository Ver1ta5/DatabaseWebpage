const express = require("express");
const app = express();
const port = 3000;
const path = require('path')
const { MongoClient, ServerApiVersion } = require('mongodb');
const bcrypt = require('bcrypt');
const { error } = require("console");
const saltRounds=10
require('dotenv').config();
app.use(express.json());



let db; 
let client;

// For database
const uri = `mongodb+srv://user:${process.env.databaseUrlPassword}@cluster0.iksbzk5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
  client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    db = client.db("userDB")
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) { 
    return error
  }

}

//used to clear the database
async function dropAllCollections() {
  if (!db) {
    console.error("Database not connected");
    return;
  }

  try {
    const collections = await db.listCollections().toArray();
    for (const collection of collections) {
      await db.collection(collection.name).drop();
      console.log(`Dropped collection: ${collection.name}`);
    }
  } catch (error) {
    console.error("Error dropping collections:", error);
    throw error;
  }
}

(async () => {
  await run().catch(console.dir);
})();




async function addUserToDb(userData) {
  if (!db) {
    throw new Error("Database not connected");
  }
  
  const accountCollection = db.collection("accounts");
  
  // Perform the insert operation
  const result = await accountCollection.insertOne(userData);
  console.log("userData:",userData)
  
  // Check if the result has an insertedId
  if (result && result.insertedId) {
    console.log("Inserted ID:", result.insertedId);
    return result;  // Return result if needed
  } else {
    throw new Error("Failed to insert user into database");
  }
}

async function CheckUserInDb(username,inputPassword) {
  const accountCollection = db.collection("accounts");
  try { 
    console.log("Username from client:", username);
    const account = await accountCollection.findOne({ username: username });
    console.log("Account from DB:", account);
    if (account) { 
      console.log("Account found:", account);
      const passwordMatch = await bcrypt.compare(inputPassword, account.password)
      if (passwordMatch) {
        console.log("password match, logged in")
        return account
      } else { 
        console.log("invalid Password")
      }
    } else {
      console.log("No account matches the given criteria.");
      return null;
    }
  } catch (error) {
    console.error("Error finding account:", error);
    throw error; // Re-throw the error for higher-level handling
  }
  }


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


app.post("/login", async (req, res) => { 
  const { username, password } = req.body
  const userData = {
    "username": username,
    "password":password
  }
  try {
    const validAccount = await CheckUserInDb(userData.username, userData.password)
    if (validAccount) {
      res.status(200).send({ message: "Login successful!" });
    } else {
      res.status(401).send({ message: "Invalid login info." });
    }
  } catch { 
    console.log(error)
  }
  


})




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