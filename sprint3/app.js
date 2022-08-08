//calling upon npm packages
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const https = require("https");
const weatherData = require(__dirname + '/weatherData.js');

//port to heroku
const PORT = process.env.PORT || 3000;

//calling upon express to create a server
const app = express();
const path = __dirname;

//mongodb atlas
const { MongoClient, ServerApiVersion } = require('mongodb');
//password saved into .env file
const password =  process.env.PASSWORD
const uri = "mongodb+srv://garion_morgan49:" + password + "@weatherwizarddb.1h1xxce.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});

//enables usage of embedded javascript
app.set('view engine', 'ejs');
//calling upon body parser to gather data from front End
app.use(bodyParser.urlencoded({extended: true}));
//calls upon public folders within Project
app.use(express.static('public'));

//connecting to database called WeatherWizardDB
mongoose.connect(uri);

//creating a weather schema for the WeatherWizardDB
const weatherSchema = new mongoose.Schema ({
  city: String,
  temp: Number,
  weather: String,
  img: String
});

//initializing the schema
const Weather = mongoose.model("Weather", weatherSchema);

//creating a fiveDay schema for DB
const fiveDaySchema = new mongoose.Schema ({
  city: String
});
//initializing the schema
const FiveDayWeather = mongoose.model("FiveDayWeather", fiveDaySchema);

//creating an observation Schema
const observationSchema = new mongoose.Schema ({
  user: String,
  location: String,
  time: Date,
  post: String
});

//initializing observation Schema
const Observation = mongoose.model("Observation", observationSchema);

//creatomg a profile schema
const userSchema = new mongoose.Schema ({
  username: String,
  password: String
});

const User = mongoose.model("User", userSchema);



//RESTful API's that communicate with the server
//
//
app.get("/" , function(req,res) {

  //call upon mongodb to aquire currentWXList documents
  Weather.find({}, function(err, foundItems) {
    if(!err) {
      if(foundItems.length === 0){
        res.render('emptyCurrentWX', {CURRENTWX: "/", FIVEDAYWX: "fiveDayWX", OBS: "observation", REQUEST: "request", PROFILE: "profile"});
      } else {
        res.render('currentWX', {CURRENTWX: "/", FIVEDAYWX: "fiveDayWX", OBS: "observation", REQUEST: "request", PROFILE: "profile", newListItems: foundItems});
      }
    } else {
      console.log(err);
    };
  });
});

app.get("/fiveDayWX" , function(req,res) {
  //call upon mongodb to aquire fiveDayWXList documents
  FiveDayWeather.find({}, function(err, foundItems) {
    if(!err) {
      if(foundItems.length === 0){
        res.render('emptyFiveDayWX', {CURRENTWX: "/", FIVEDAYWX: "fiveDayWX", OBS: "observation", REQUEST: "request", PROFILE: "profile"});
      } else {
        res.render('fiveDayWX', {CURRENTWX: "/", FIVEDAYWX: "fiveDayWX", OBS: "observation", REQUEST: "request", PROFILE: "profile", newListItems: foundItems});
      }
    } else {
      console.log(err);
    };
  });
});

app.get("/observation" , function(req,res) {
  //call upon mongodb to aquire observation documents
  Observation.find({}, function(err, foundItems) {
    if(!err){
      if(foundItems.length === 0){
        res.render('emptyObservation', {CURRENTWX: "/", FIVEDAYWX: "fiveDayWX", OBS: "observation", REQUEST: "request", PROFILE: "profile", newListItems: foundItems});
      } else{
        res.render('observation', {CURRENTWX: "/", FIVEDAYWX: "fiveDayWX", OBS: "observation", REQUEST: "request", PROFILE: "profile", newListItems: foundItems});
      }
    } else {
      console.log(err);
    }
  });
});

app.get("/request" , function(req,res) {
  res.render('request', {CURRENTWX: "/", FIVEDAYWX: "fiveDayWX", OBS: "observation", REQUEST: "request", PROFILE: "profile"});
});

app.get("/profile" , function(req,res) {
  res.render('profile', {CURRENTWX: "/", FIVEDAYWX: "fiveDayWX", OBS: "observation", REQUEST: "request", PROFILE: "profile"});
});

app.post("/currentWX", function(req,res) {

  const query = req.body.cityName;
  const apiKey = process.env.WEATHERAPI;

  let currentWXPost = new weatherData.ProcessWeather(query, apiKey);

  const weatherURL = currentWXPost.getWeather();

  https.get(weatherURL, function(response) {

    response.on("data", function(data) {
      try {
          const weatherData = JSON.parse(data);
          const temp = weatherData.main.temp;
          const weatherDescription = weatherData.weather[0].description;
          const icon = weatherData.weather[0].icon;
          const imageURL = "http://openweathermap.org/img/wn/" + icon + "@2x.png";

          const weather = new Weather({
            city: query,
            temp: temp,
            weather: weatherDescription,
            img: imageURL
          });

          weather.save();

          res.redirect("/");

        } catch(e) {
          console.log("error logged for rendering current weather");
          res.redirect("/");
        }
    });
  });
});

app.post("/deleteCurrentWX", function(req, res) {
  console.log("delete button pressed...");
  const clickedItemID = req.body.itemID;
  Weather.findByIdAndRemove(clickedItemID, function(err) {
    if(!err){
      console.log("successfully deleted clicked item...");
      res.redirect("/");
    };
  });
});

app.post("/fiveDayWX", function(req, res) {
  const city = req.body.cityName;

  const weather = new FiveDayWeather({
    city: city
  });

  weather.save();

  res.redirect("fiveDayWX");
});

app.post("/deleteFiveDayWX", function(req, res) {
  console.log("delete button pressed...");
  const clickedItemID = req.body.itemID;
  FiveDayWeather.findByIdAndRemove(clickedItemID, function(err) {
    if(!err){
      console.log("successfully deleted clicked item...");
      res.redirect("fiveDayWX");
    };
  });
});

app.post("/observation", function(req, res) {
  const city = req.body.cityName;
  const post = req.body.post;

  const observation = new Observation({
    location: city,
    post: post
  });

  observation.save();

  res.redirect("observation");
});

app.post("/personalizedRequest", function(req, res) {
  console.log("personalized request button pressed...");
  res.render("personalizedWeatherRequest", {CURRENTWX: "/", FIVEDAYWX: "fiveDayWX", OBS: "observation", REQUEST: "request", PROFILE: "profile"});
});

app.post("/flightPlanRequest", function(req, res) {
  console.log("flight plan request button pressed...");
  res.render("flightPlanRequest", {CURRENTWX: "/", FIVEDAYWX: "fiveDayWX", OBS: "observation", REQUEST: "request", PROFILE: "profile"});
});

app.post("/climatologyRequest", function(req, res) {
  console.log("climatology request button pressed...");
  res.render("climatologyRequest", {CURRENTWX: "/", FIVEDAYWX: "fiveDayWX", OBS: "observation", REQUEST: "request", PROFILE: "profile"});
});

app.post("/signIn", function(req, res) {
  console.log("signin post clicked...");

  const username = req.body.username;
  const password = req.body.password;

  User.findOne({username: username}, function(err, foundUser) {
    if(err) {
      console.log(err);
    } else {
      if(foundUser) {
        if (foundUser.password === password) {
          res.render("signedIn");
        }
      }
    }
  });
  res.redirect("profile");
});

app.post("/newProfile", function(req, res) {
  console.log("new profile post clicked...");

  const username = req.body.username;
  console.log(username);

  const password = req.body.password;
  console.log(password);

  const user = new User({
    username: username,
    password: password
  });

  user.save();

  res.redirect("profile");

});

//listening to port
app.listen(PORT , function() {
  console.log("Server is up...");
});
