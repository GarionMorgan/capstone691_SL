//calling upon npm packages
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

//calling upon express to create a server
const app = express();
const path = __dirname;
//port to heroku
const port = process.env.PORT || 3000;

let currentWXList = [];
let fiveDayWXList = [];

//enables usage of embedded javascript
app.set('view engine', 'ejs');
//calling upon body parser to gather data from front End
app.use(bodyParser.urlencoded({extended: true}));
//calls upon public folders within Project
app.use(express.static('public'));

    // baseURL = "mongodb://localhost:27017/WeatherWizardDB"
//connecting to database called WeatherWizardDB
    // mongoose.connect(baseURL);

//creating a schema for the WeatherWizardDB
    // const usersSchema = new mongoose.Schema ({
    //   userName: String,
    //   passCode: String,
    //   firstName: String,
    //   lastName: String
    // });
//initializing the schema
    // const User = mongoose.model("User", usersSchema);
//creating content for DB
// const user = new User ({
//   userName: "WeatherWiz29",
//   passCode: "1qw2",
//   firstName: "Garion",
//   lastName: "Morgan"
// });
// //saving data into DB
// user.save();


//RESTful API's that communicate with the server
app.get("/" , function(req,res) {
  res.render('currentWX', {CURRENTWX: "currentWX", FIVEDAYWX: "fiveDayWX", OBS: "observation", REQUEST: "request", PROFILE: "profile"});
});

app.get("/currentWX" , function(req,res) {
  res.render('currentWX', {CURRENTWX: "currentWX", FIVEDAYWX: "fiveDayWX", OBS: "observation", REQUEST: "request", PROFILE: "profile"});
});

app.get("/fiveDayWX" , function(req,res) {
  res.render('fiveDayWX', {CURRENTWX: "currentWX", FIVEDAYWX: "fiveDayWX", OBS: "observation", REQUEST: "request", PROFILE: "profile"});
});

app.get("/observation" , function(req,res) {
  res.render('observation', {CURRENTWX: "currentWX", FIVEDAYWX: "fiveDayWX", OBS: "observation", REQUEST: "request", PROFILE: "profile"});
});

app.get("/request" , function(req,res) {
  res.render('request', {CURRENTWX: "currentWX", FIVEDAYWX: "fiveDayWX", OBS: "observation", REQUEST: "request", PROFILE: "profile"});
});

app.get("/profile" , function(req,res) {
  res.render('profile', {CURRENTWX: "currentWX", FIVEDAYWX: "fiveDayWX", OBS: "observation", REQUEST: "request", PROFILE: "profile"});
});


//listening to port
app.listen(port , function() {
  console.log("Server is up...")
});
