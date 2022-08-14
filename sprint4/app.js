//calling upon npm packages
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const weatherData = require(__dirname + '/data.js');

const app = express();

//enables usage of embedded javascript
app.set('view engine', 'ejs');
//calling upon body parser to gather data from front End
app.use(bodyParser.urlencoded({extended: true}));
//calls upon public folders within Project
app.use(express.static('public'));

app.use(express.json());
//used to end warnings from heroku
app.use((req,res,next) => {
  res.header('Access-Control-Allow-Origin','*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin,X-Requested-With,Content-Type,Accept,Authorization'
  );
  if(req.method==='OPTIONS') {
    res.header('Accept-Control-Methods', 'PUT,POST,PATCH,DELETE,GET');
    return res.status(200).json({

    })
  }
  next();
});

//setting up a session for the user
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}));

//passport library used to salt and hash senstive information such as users password
app.use(passport.initialize());
app.use(passport.session());

//mongodb atlas
const { MongoClient, ServerApiVersion } = require('mongodb');
//URI saved into .env file
const uri = process.env.URI;

const client = new MongoClient(process.env.MONGODB_URI || uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});

//connecting to database called WeatherWizardDB
mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost:27017/userDB",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  () => {
    console.log("DB Connected!");
  }
);

//creating a weather schema for currentWX
const weatherSchema = new mongoose.Schema ({
  city: String,
  temp: Number,
  weather: String,
  img: String
});

//initializing the currentWX schema
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
  time: String,
  post: String
});

//initializing observation Schema
const Observation = mongoose.model("Observation", observationSchema);

//creatomg a profile schema
const userSchema = new mongoose.Schema ({
  username: String,
  password: String
});

//plugin for userSchema that saves data into a cookie for the user
userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

//enabling passport on User model
passport.use(User.createStrategy());

//serialize and deserialize user instances to and from their session
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/", function(req, res) {
//   //call upon mongodb to aquire currentWXList documents
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
  //res.render('emptyCurrentWX', {CURRENTWX: "/", FIVEDAYWX: "fiveDayWX", OBS: "observation", REQUEST: "request", PROFILE: "profile"});
});

app.post("/currentWX", function(req,res) {
  console.log("currentWX post pressed...");
  res.redirect("/");

});

app.get("/fiveDayWX", function(req, res) {
  res.render("emptyFiveDayWX", {CURRENTWX: "/", FIVEDAYWX: "fiveDayWX", OBS: "observation", REQUEST: "request", PROFILE: "profile"});
});

app.post("/fiveDayWx", function(req, res) {
  console.log("five day wx post pressed....");
  res.redirect("/fiveDayWX");
});

app.get("/observation", function(req, res) {
  //call upon mongodb to aquire observation documents
  Observation.find({}, function(err, foundItems) {
    if(!err){
      if(foundItems.length === 0){
        res.render('emptyObservation', {CURRENTWX: "/", FIVEDAYWX: "fiveDayWX", OBS: "observation", REQUEST: "request", PROFILE: "profile"});
      } else{
        res.render('observation', {CURRENTWX: "/", FIVEDAYWX: "fiveDayWX", OBS: "observation", REQUEST: "request", PROFILE: "profile", newListItems: foundItems});
      }
    } else {
      console.log(err);
    }
  });
});

app.post("/observation", function(req, res) {


  if(req.isAuthenticated()) {

    const city = req.body.cityName;
    const post = req.body.post;
    const date = weatherData.getDate();

    const observation = new Observation({
      user: req.user.username,
      location: city,
      time: date,
      post: post
    });

    observation.save();

    res.redirect("observation");

  } else {
    res.redirect('profile');
  }
});

app.get("/request", function(req, res) {
  res.render("request", {CURRENTWX: "/", FIVEDAYWX: "fiveDayWX", OBS: "observation", REQUEST: "request", PROFILE: "profile"});
});

app.post("/personalizedRequest", function(req, res) {
  if(req.isAuthenticated()) {
    res.render("personalizedWeatherRequest", {CURRENTWX: "/", FIVEDAYWX: "fiveDayWX", OBS: "observation", REQUEST: "request", PROFILE: "profile"});
  } else {
    res.render("profile", {CURRENTWX: "/", FIVEDAYWX: "fiveDayWX", OBS: "observation", REQUEST: "request", PROFILE: "profile"});
  }

});

app.post("/flightPlanRequest", function(req, res) {
  if(req.isAuthenticated()) {
    res.render("flightPlanRequest", {CURRENTWX: "/", FIVEDAYWX: "fiveDayWX", OBS: "observation", REQUEST: "request", PROFILE: "profile"});
  } else {
    res.render("profile", {CURRENTWX: "/", FIVEDAYWX: "fiveDayWX", OBS: "observation", REQUEST: "request", PROFILE: "profile"});
  }
});

app.post("/climatologyRequest", function(req, res) {
  if(req.isAuthenticated()) {
    res.render("climatologyRequest", {CURRENTWX: "/", FIVEDAYWX: "fiveDayWX", OBS: "observation", REQUEST: "request", PROFILE: "profile"});
  } else {
    res.render("profile", {CURRENTWX: "/", FIVEDAYWX: "fiveDayWX", OBS: "observation", REQUEST: "request", PROFILE: "profile"});
  }
});

app.get("/profile", function(req, res) {

  if(req.isAuthenticated()) {
    res.redirect('/profileSignedIn');
  } else {
    res.render("profile", {CURRENTWX: "/", FIVEDAYWX: "fiveDayWX", OBS: "observation", REQUEST: "request", PROFILE: "profile"});
  }
});

app.post("/register", function(req, res) {
  console.log("new profile post clicked...");

  User.register({username: req.body.username}, req.body.password, function(err, user) {
    if(err) {
      console.log(err);
      //send message to user telling them user is already in use
      res.redirect('/error404');
    } else {
      passport.authenticate('local')(req, res, function() {
        res.redirect('/profileSignedIn');
      });
    }
  });
});

app.post("/signIn", function(req, res) {

  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err) {
    if(err) {
      console.log(err);
      res.redirect('/error404');
    } else {
      passport.authenticate('local')(req, res, function() {
        res.redirect('/profileSignedIn');
      });
    }
  });
});

app.get("/profileSignedIn", function(req, res) {

  if(req.isAuthenticated()) {
    const username = req.user.username;

    res.render('profileSignedIn', {CURRENTWX: "/", FIVEDAYWX: "fiveDayWX", OBS: "observation", REQUEST: "request", PROFILE: "profile", USER: username });
  } else {
    res.redirect("/profile");
  }


});

app.get("/logout", function(req, res) {
  req.logout(function(err) {
    if(err) {
      console.log(err);
    } else {
      res.redirect('/profile');
    }
  })
});

app.get("/importWX", function(req, res) {
  res.render("importWX", {CURRENTWX: "/", FIVEDAYWX: "fiveDayWX", OBS: "observation", REQUEST: "request", PROFILE: "profile"});
});

app.get("/forecastWX", function(req, res) {
  res.render("forecastWX", {CURRENTWX: "/", FIVEDAYWX: "fiveDayWX", OBS: "observation", REQUEST: "request", PROFILE: "profile"});
});

app.get("/error404", function(req, res) {
  res.render('error404', {CURRENTWX: "/", FIVEDAYWX: "fiveDayWX", OBS: "observation", REQUEST: "request", PROFILE: "profile"});
});

app.listen(process.env.PORT || 5000, function(){
  console.log('Server is running...');
});
