const passport = require('passport');
const LocalStrategy = require('passport-local');
const {getDb,CheckUserInDb}=require('./db')
const { ObjectId } = require('mongodb');
 

passport.use(new LocalStrategy(async function verify(username, password, cb) {
    console.log("Calling CheckUserInDb with username:", username);
  try {
      const account = await CheckUserInDb(username, password)
      if (account) {
          console.log("accountData:",account)
        return cb(null, account);
      } else {
        return cb(null, false, { message: 'Incorrect username or password.' });
      }
    } catch (err) {
      return cb(err);
    }
}));

passport.serializeUser((user, done) => {
    console.log("Serializing user:", user._id);
    done(null, user._id); 
  });


  passport.deserializeUser(async (id, done) => {
    console.log("Deserializing user with ID:", id);
      try {
          const db=getDb()
        accountDeserialise=await db.collection("accounts")
      const user = await accountDeserialise.findOne({ _id: new ObjectId(id) });
      if (!user) {
        console.error("User not found during deserialization");
        return done(null, false);
      }
      done(null, user);
    } catch (err) {
      console.error("Error deserializing user:", err);
      done(err, null);
    }
  });
  
  


module.exports = passport;