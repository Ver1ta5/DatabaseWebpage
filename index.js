const express = require("express");
const app = express();
const port = 3000;
const path = require('path')
const { MongoClient, ServerApiVersion } = require('mongodb');
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
run().catch(console.dir);


async function addUserToDb(userData) {
  if (!db) {
    throw new Error("Database not connected");
  }
  
  const accountCollection = db.collection("accounts");
  
  // Perform the insert operation
  const result = await accountCollection.insertOne(userData);
  
  // Check if the result has an insertedId
  if (result && result.insertedId) {
    console.log("Inserted ID:", result.insertedId);
    return result;  // Return result if needed
  } else {
    throw new Error("Failed to insert user into database");
  }
}


app.post("/signup", async (req, res) => { 
  const { username, password } = req.body
  const userData = {
    "username": username,
    "password":password
  }
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