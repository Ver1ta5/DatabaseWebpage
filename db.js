const { MongoClient, ServerApiVersion } = require('mongodb');
const bcrypt = require('bcrypt');


let db; 
let client;

// For database
const uri = `mongodb+srv://user:${process.env.databaseUrlPassword}@cluster0.iksbzk5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
  client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: true,
  }
});
async function connectToDb() {
    try {
      await client.connect();
      db = client.db("userDB");
      console.log("Connected to MongoDB");
    } catch (error) {
      console.error("MongoDB connection failed:", error);
      throw error;
    }
}
  
function getDb() {
    if (!db) {
      throw new Error("DB not connected yet!");
    }
    return db;
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

module.exports = {connectToDb, getDb,CheckUserInDb,addUserToDb,db}