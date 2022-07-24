//calling upon npm packages
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

baseURL = "mongodb://localhost:27017/WeatherWizardDB"
//connecting to database called WeatherWizardDB
mongoose.connect(baseURL, { useNewUrlParser: true});

//creating a schema for the WeatherWizardDB
const userSchema = new mongoose.Schema ({
  userName: String,
  passCode: String,
  firstName: String,
  lastName: String
});
//initializing the schema
const User = mongoose.model("Users", userSchema);
//creating content for DB
// const user = new User ({
//   userName: "WeatherWiz29",
//   passCode: "1qw2",
//   firstName: "Garion",
//   lastName: "Morgan"
// });
// //saving data into DB
// user.save();

//calling upon express to create a server
const app = express();
const path = __dirname;
//RESTful API's that communicate with the server
app.get("/" , function(req,res) {
  res.sendFile(path + "/index.html");
});

app.get("/index.html" , function(req,res) {
  res.sendFile(path + "/index.html");
});

app.get("/fiveDay.html" , function(req,res) {
  res.sendFile(path + "/fiveDay.html");
});

app.get("/observation.html" , function(req,res) {
  res.sendFile(path + "/observation.html");
});

app.get("/request.html" , function(req,res) {
  res.sendFile(path + "/request.html");
});

app.get("/profile.html" , function(req,res) {
  res.sendFile(path + "/profile.html");
});


//listening to port
app.listen(3000, function() {
  console.log("Listening on port 3000....")
});
