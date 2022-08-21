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
  time: String,
  wind_direction: String,
  wind_speed: String,
  visibility: Number,
  weather: String,
  clouds: String,
  temp: Number,
  dew_point: Number,
  altimeter: String
});

//initializing the currentWX schema
const Weather = mongoose.model("Weather", weatherSchema);

//creating a fiveDay schema for DB
const fiveDaySchema = new mongoose.Schema ({
  city: String,
  date: String,
  wx: String,
  clouds: String,
  vis: Number,
  low: Number,
  high: Number,
  winds: String,
  date2: String,
  wx2: String,
  clouds2: String,
  vis2: Number,
  low2: Number,
  high2: Number,
  winds2: String,
  date3: String,
  wx3: String,
  clouds3: String,
  vis3: Number,
  low3: Number,
  high3: Number,
  winds3: String,
  date4: String,
  wx4: String,
  clouds4: String,
  vis4: Number,
  low4: Number,
  high4: Number,
  winds4: String,
  date5: String,
  wx5: String,
  clouds5: String,
  vis5: Number,
  low5: Number,
  high5: Number,
  winds5: String
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

//creating a request Schema
const requestSchema = new mongoose.Schema({
  email: String,
  location: String,
  date: String,
  type: String,
  personalTime: Number,
  personalWinds: Number,
  personalWX: Number,
  personalClouds: Number,
  personalSolar: Number,
  flightTakeOffLocation: String,
  flightTakeOffTime: String,
  flightLvl1: String,
  flightLvl2: String,
  flightLvl3: String,
  flightLvl4: String,
  flightType1: String,
  flightLocation1: String,
  flightLandTime1: String,
  flightType2: String,
  flightLocation2: String,
  flightLandTime2: String,
  flightType3: String,
  flightLocation3: String,
  flightLandTime3: String,
  flightType4: String,
  flightLocation4: String,
  flightLandTime4: String,
  flightType5: String,
  flightLocation5: String,
  flightLandTime5: String,
  flightType6: String,
  flightLocation6: String,
  flightLandTime6: String,
  flightType7: String,
  flightLocation7: String,
  flightLandTime7: String,
  flightType8: String,
  flightLocation8: String,
  flightLandTime8: String,
  climoTime: String,
  climoWinds: String,
  climoGusts: String,
  climoClouds: String,
  climoSolar: String,
  climoTS: String,
  climoSVR: String,
  climoSnow: String,
  climoHail: String,
  climoMist: String,
  climoFog: String,
  climoBlizzard: String,
  climoTornado: String
});
//initializing request Schema
const Request = mongoose.model("Request", requestSchema);

const verifyUserSchema = new mongoose.Schema({
  username: String,
  location: String,
  email: String
});

const VerifyRequest = mongoose.model("VerifyRequest", verifyUserSchema);

//creatomg a profile schema
const userSchema = new mongoose.Schema ({
  username: String,
  password: String,
  verified: Boolean,
  favCurrent: [String],
  favFive: [String]
});

//plugin for userSchema that saves data into a cookie for the user
userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

//enabling passport on User model
passport.use(User.createStrategy());

//serialize and deserialize user instances to and from their session
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

let guestCurrent = [];
let guestFive = [];

app.get("/", function(req, res) {

  if(req.isAuthenticated()) {
    User.findOne({username: req.user.username}, function(err, foundUser) {
      if(!err) {
        if(foundUser.favCurrent.length === 0) {
          res.render('emptyCurrentWX', {CURRENTWX: "/", FIVEDAYWX: "fiveDayWX", OBS: "observation", REQUEST: "request", PROFILE: "profile"});
        } else {

          Weather.find({city: foundUser.favCurrent}, function(err, foundItems) {
            if(!err) {
              res.render('currentWX', {CURRENTWX: "/", FIVEDAYWX: "fiveDayWX", OBS: "observation", REQUEST: "request", PROFILE: "profile", newListItems: foundItems});
            }

          });
        }
      } else {
        console.log(err);
      }
    });
  } else {
    res.render('emptyCurrentWX', {CURRENTWX: "/", FIVEDAYWX: "fiveDayWX", OBS: "observation", REQUEST: "request", PROFILE: "profile"});
  }

});

app.post("/currentWX", function(req,res) {

  const city = req.body.cityName;

  if(req.isAuthenticated()) {
    console.log("currentWX post pressed...");


    const username = req.user.username;

    User.findOneAndUpdate({username: username}, {$push: {favCurrent: city}}, function(err, foundList) {
      if(!err) {
        console.log("updated...");
        res.redirect("/");
      }
    });

  } else {
    Weather.find({city: city}, function(err, foundItems) {
      if(!err) {
        res.render('currentWX', {CURRENTWX: "/", FIVEDAYWX: "fiveDayWX", OBS: "observation", REQUEST: "request", PROFILE: "profile", newListItems: foundItems});
      }
    });
  }



});

app.post("/deleteCurrentWX", function(req, res) {

  if(req.isAuthenticated()) {

    const city = req.body.itemID;
    const username = req.user.username;
    console.log("delete pressed...");
    User.findOneAndUpdate({username: username}, {$pull: {favCurrent: city}}, function(err, foundList) {
      if(!err) {
        console.log("location removed...");
        res.redirect("/");
      }
    });

  } else {
    res.redirect("/profile");
  }

});


app.get("/fiveDayWX", function(req, res) {

  if(req.isAuthenticated()) {
    User.findOne({username: req.user.username}, function(err, foundUser) {
      if(!err) {
        if(foundUser.favFive.length === 0) {
          res.render('emptyFiveDayWX', {CURRENTWX: "/", FIVEDAYWX: "fiveDayWX", OBS: "observation", REQUEST: "request", PROFILE: "profile"});
        } else {
          FiveDayWeather.find({city: foundUser.favFive}, function(err, foundItems) {
            if(!err) {
              res.render('fiveDayWX', {CURRENTWX: "/", FIVEDAYWX: "fiveDayWX", OBS: "observation", REQUEST: "request", PROFILE: "profile", newListItems: foundItems});
            }
          });
        }
      } else {
        console.log(err);
      }
    });
  } else {
    res.render('emptyFiveDayWX', {CURRENTWX: "/", FIVEDAYWX: "fiveDayWX", OBS: "observation", REQUEST: "request", PROFILE: "profile"});
  }
});

app.post("/fiveDayWX", function(req, res) {

  const city = req.body.cityName;

  if(req.isAuthenticated()) {
    console.log("five day wx post pressed....");

    const username = req.user.username;

    User.findOneAndUpdate({username: username}, {$push: {favFive: city}}, function(err, foundList) {
      if(!err) {
        console.log("updated...");
        res.redirect("/fiveDayWX");
      }
    });

  } else {
    FiveDayWeather.find({city: city}, function(err, foundItems) {
      if(!err) {
        res.render('fiveDayWX', {CURRENTWX: "/", FIVEDAYWX: "fiveDayWX", OBS: "observation", REQUEST: "request", PROFILE: "profile", newListItems: foundItems});
      }
    });
  }
});

app.post("/deleteFiveDayWX", function(req, res) {

  if(req.isAuthenticated()) {

    const city = req.body.itemID;
    const username = req.user.username;
    console.log("delete pressed...");
    User.findOneAndUpdate({username: username}, {$pull: {favFive: city}}, function(err, foundList) {
      if(!err) {
        console.log("location removed...");
        res.redirect("/fiveDayWX");
      }
    });

  } else {
    res.redirect("/profile");
  }
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

app.post("/search", function(req, res) {
  console.log("searched button clicked...");
  const query = req.body.search;

  Observation.find({location: query}, function(err, foundItems) {
    if(!err) {
      res.render('searched', {CURRENTWX: "/", FIVEDAYWX: "fiveDayWX", OBS: "observation", REQUEST: "request", PROFILE: "profile", newListItems: foundItems, QUERY: query});
    } else {
      res.redirect("observation");
    }
  });

  // res.render("searched", {CURRENTWX: "/", FIVEDAYWX: "fiveDayWX", OBS: "observation", REQUEST: "request", PROFILE: "profile"});
});

app.get("/request", function(req, res) {
  res.render("request", {CURRENTWX: "/", FIVEDAYWX: "fiveDayWX", OBS: "observation", REQUEST: "request", PROFILE: "profile"});
});

app.post("/personalizedRequest", function(req, res) {
  if(req.isAuthenticated()) {
    if(req.user.verified === true) {
      res.render("personalizedWeatherRequest", {CURRENTWX: "/", FIVEDAYWX: "fiveDayWX", OBS: "observation", REQUEST: "request", PROFILE: "profile"});
    } else {
      res.redirect("/profileSignedIn");
    }
  } else {
    res.render("profile", {CURRENTWX: "/", FIVEDAYWX: "fiveDayWX", OBS: "observation", REQUEST: "request", PROFILE: "profile"});
  }

});

app.post("/requestedPersonal", function(req, res) {

  const date = weatherData.getNumericDay();
  const type = "personal request";
  const location = req.body.location;
  const time = req.body.time;
  const email = req.body.email;
  const winds = req.body.winds;
  const wx = req.body.weather;
  const clouds = req.body.clouds;
  const solar = req.body.solar;

  const request = new Request({
    email: email,
    location: location,
    date: date,
    type: type,
    personalTime: time,
    personalWinds: winds,
    personalWX: wx,
    personalClouds: clouds,
    personalSolar: solar
  });

  request.save();

  res.redirect("/profileSignedIn");
});

app.post("/flightPlanRequest", function(req, res) {
  if(req.isAuthenticated()) {
    if(req.user.verified === true) {
      res.render("flightPlanRequest", {CURRENTWX: "/", FIVEDAYWX: "fiveDayWX", OBS: "observation", REQUEST: "request", PROFILE: "profile"});
    } else {
      res.redirect("/profileSignedIn");
    }
  } else {
    res.render("profile", {CURRENTWX: "/", FIVEDAYWX: "fiveDayWX", OBS: "observation", REQUEST: "request", PROFILE: "profile"});
  }
});

app.post("/requestedFlight", function(req, res) {
  const takeOffLocation = req.body.takeoff;
  const takeOffTime = req.body.takeoffTime;
  const email = req.body.email;
  const date = req.body.date;
  const flightLvl1 = req.body.flightLvl1;
  const flightLvl2 = req.body.flightLvl2;
  const flightLvl3 = req.body.flightLvl3;
  const flightLvl4 = req.body.flightLvl4;
  const type1 = req.body.type1;
  const location1 = req.body.location1;
  const landTime1 = req.body.landTime1;
  const type2 = req.body.type2;
  const location2 = req.body.location2;
  const landTime2 = req.body.landTime2;
  const type3 = req.body.type3;
  const location3 = req.body.location3;
  const landTime3 = req.body.landTime3;
  const type4 = req.body.type4;
  const location4 = req.body.location4;
  const landTime4 = req.body.landTime4;
  const type5 = req.body.type5;
  const location5 = req.body.location5;
  const landTime5 = req.body.landTime5;
  const type6 = req.body.type6;
  const location6 = req.body.location6;
  const landTime6 = req.body.landTime6;
  const type7 = req.body.type7;
  const location7 = req.body.location7;
  const landTime7 = req.body.landTime7;
  const type8 = req.body.type8;
  const location8 = req.body.location8;
  const landTime8 = req.body.landTime8;

  const request = new Request({
    email: email,
    date: date,
    type: "Flight Plan",
    flightTakeOffLocation: takeOffLocation,
    flightTakeOffTime: takeOffTime,
    flightLvl1: flightLvl1,
    flightLvl2: flightLvl2,
    flightLvl3: flightLvl3,
    flightLvl4: flightLvl4,
    flightType1: type1,
    flightLocation1: location1,
    flightLandTime1: landTime1,
    flightType2: type2,
    flightLocation2: location2,
    flightLandTime2: landTime2,
    flightType3: type3,
    flightLocation3: location3,
    flightLandTime3: landTime3,
    flightType4: type4,
    flightLocation4: location4,
    flightLandTime4: landTime4,
    flightType5: type5,
    flightLocation5: location5,
    flightLandTime5: landTime5,
    flightType6: type6,
    flightLocation6: location6,
    flightLandTime6: landTime6,
    flightType7: type7,
    flightLocation7: location7,
    flightLandTime7: landTime7,
    flightType8: type8,
    flightLocation8: location8,
    flightLandTime8: landTime8
  });

  request.save();

  res.redirect("/profileSignedIn");
});

app.post("/climatologyRequest", function(req, res) {
  if(req.isAuthenticated()) {
    if(req.user.verified === true) {
      res.render("climatologyRequest", {CURRENTWX: "/", FIVEDAYWX: "fiveDayWX", OBS: "observation", REQUEST: "request", PROFILE: "profile"});
    } else {
      res.redirect("/profileSignedIn");
    }
  } else {
    res.render("profile", {CURRENTWX: "/", FIVEDAYWX: "fiveDayWX", OBS: "observation", REQUEST: "request", PROFILE: "profile"});
  }
});

app.post("/requestedClimo", function(req, res) {

  const location = req.body.location;
  const time = req.body.time;
  const email = req.body.email;
  const winds = req.body.winds;
  const gust = req.body.gust;
  const clouds = req.body.clouds;
  const solar = req.body.solar;
  const tsra = req.body.TSRA;
  const svr = req.body.SVR;
  const snow = req.body.snow;
  const hail = req.body.hail;
  const mist = req.body.mist;
  const fog = req.body.fog;
  const blizzard = req.body.blizzard;
  const tornado = req.body.tornado;

  const request = new Request({
    email: email,
    location: location,
    type: "Climatology",
    climoTime: time,
    climoWinds: winds,
    climoGusts: gust,
    climoClouds: clouds,
    climoSolar: solar,
    climoTS: tsra,
    climoSVR: svr,
    climoSnow: snow,
    climoHail: hail,
    climoMist: mist,
    climoFog: fog,
    climoBlizzard: blizzard,
    climoTornado: tornado
  });

  request.save();

  res.redirect("/profileSignedIn");
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

app.get("/verified", function(req, res) {
  if(req.user.verified === true) {
    res.redirect("/profileSignedIn");
  } else {
    res.render('verify', {CURRENTWX: "/", FIVEDAYWX: "fiveDayWX", OBS: "observation", REQUEST: "request", PROFILE: "profile"});
  }
});

app.post("/requestVerify", function(req, res) {
  const username = req.user.username;
  const location = req.body.location;
  const email = req.body.email;

  const request = new VerifyRequest({
    username: username,
    location: location,
    email: email
  });

  request.save();
  //add status to users account
  User.findOneAndUpdate({username: req.user.username}, {$set: {verified: "false"}}, function(err, foundUser) {
    if(!err) {
      console.log("Added verification status...");
    }
  });

  res.redirect("/profileSignedIn");

});

app.get("/importWX", function(req, res) {
  if(req.user.verified === true) {
    res.render("importWX", {CURRENTWX: "/", FIVEDAYWX: "fiveDayWX", OBS: "observation", REQUEST: "request", PROFILE: "profile"});
  } else {
    res.redirect("/profileSignedIn");
  }
});

app.post("/importWX", function(req, res) {

  if(req.isAuthenticated()) {

    const location = req.body.location;
    const time = weatherData.getDate();
    const wind_dir = req.body.wind_direction;
    const wind_speed = req.body.wind_speed;
    const vis = req.body.vis;
    const wx = req.body.WX;
    const clouds = req.body.clouds;
    const temp = req.body.temp;
    const dew = req.body.dew;
    const altimeter = req.body.altimeter;

    Weather.findOne({city: location}, function(err, foundLocation) {
      if(!err) {
        if(!foundLocation) {
          const weather = new Weather({
            city: location,
            time: time,
            wind_direction: wind_dir,
            wind_speed: wind_speed,
            visibility: vis,
            weather: wx,
            clouds: clouds,
            temp: temp,
            dew_point: dew,
            altimeter: altimeter
          });

          weather.save();

          res.redirect("profileSignedIn");
        } else {
          Weather.findOneAndUpdate({city: location}, {$set: {time: time, wind_direction: wind_dir, wind_speed: wind_speed, visibility: vis, weather: wx, clouds: clouds, temp: temp, dew_point: dew, altimeter: altimeter}}, function(err, foundUser) {
            if(!err) {
              console.log("Updated location...");
              res.redirect("profileSignedIn");
            }
          });
        }
      }
    });

  } else {
    res.redirect('profile');
  }
});

app.get("/forecastWX", function(req, res) {
  if(req.user.verified === true) {
    res.render("forecastWX", {CURRENTWX: "/", FIVEDAYWX: "fiveDayWX", OBS: "observation", REQUEST: "request", PROFILE: "profile"});
  } else {
    res.redirect("/profileSignedIn");
  }
});

app.post("/forecastWX", function(req, res) {

  if(req.isAuthenticated()) {

    const location = req.body.location;
    const time = weatherData.getDay();
    const wx = req.body.Weather;
    const clouds = req.body.Clouds;
    const vis = req.body.Visibility;
    const low = req.body.Low;
    const high = req.body.High;
    const winds = req.body.Winds;

    //day 2 information
    const time2 = weatherData.getDayTwo();
    const wx2 = req.body.Weather2;
    const clouds2 = req.body.Clouds2;
    const vis2 = req.body.Visibility2;
    const low2 = req.body.Low2;
    const high2 = req.body.High2;
    const winds2 = req.body.Winds2;

    //day 3 information
    const time3 = weatherData.getDayThree();
    const wx3 = req.body.Weather3;
    const clouds3 = req.body.Clouds3;
    const vis3 = req.body.Visibility3;
    const low3 = req.body.Low3;
    const high3 = req.body.High3;
    const winds3 = req.body.Winds3;

    //day 4 information
    const time4 = weatherData.getDayFour();
    const wx4 = req.body.Weather4;
    const clouds4 = req.body.Clouds4;
    const vis4 = req.body.Visibility4;
    const low4 = req.body.Low4;
    const high4 = req.body.High4;
    const winds4 = req.body.Winds4;

    //day 5 information
    const time5 = weatherData.getDayFive();
    const wx5 = req.body.Weather5;
    const clouds5 = req.body.Clouds5;
    const vis5 = req.body.Visibility5;
    const low5 = req.body.Low5;
    const high5 = req.body.High5;
    const winds5 = req.body.Winds5;

    FiveDayWeather.findOne({city: location}, function(err, foundLocation) {
      if(!err) {
        if(!foundLocation) {
          const fiveDay = new FiveDayWeather({
            city: location,
            date: time,
            wx: wx,
            clouds: clouds,
            vis: vis,
            low: low,
            high: high,
            winds: winds,
            date2: time2,
            wx2: wx2,
            clouds2: clouds2,
            vis2: vis2,
            low2: low2,
            high2: high2,
            winds2: winds2,
            date3: time3,
            wx3: wx3,
            clouds3: clouds3,
            vis3: vis3,
            low3: low3,
            high3: high3,
            winds3: winds3,
            date4: time4,
            wx4: wx4,
            clouds4: clouds4,
            vis4: vis4,
            low4: low4,
            high4: high4,
            winds4: winds4,
            date5: time5,
            wx5: wx5,
            clouds5: clouds5,
            vis5: vis5,
            low5: low5,
            high5: high5,
            winds5: winds5
          });

          fiveDay.save();

          res.redirect("profileSignedIn");
        } else {
          FiveDayWeather.findOneAndUpdate({city: location}, {$set: {date: time,wx: wx,clouds: clouds,vis: vis,low: low,high: high,winds: winds,date2: time2,wx2: wx2,clouds2: clouds2,vis2: vis2,low2: low2,high2: high2,winds2: winds2,date3: time3,wx3: wx3,clouds3: clouds3,vis3: vis3,low3: low3,high3: high3,date4: time4,wx4: wx4,clouds4: clouds4,vis4: vis4,low4: low4,high4: high4,winds4: winds4,date5: time5,wx5: wx5,clouds5: clouds5,vis5: vis5,low5: low5,high5: high5,winds5: winds5}}, function(err, foundUser) {
            if(!err) {
              console.log("Updated location...");
              res.redirect("profileSignedIn");
            }
          });
        }
      }
    });

  } else {
    res.redirect('profile');
  }
});

app.get("/error404", function(req, res) {
  res.render('error404', {CURRENTWX: "/", FIVEDAYWX: "fiveDayWX", OBS: "observation", REQUEST: "request", PROFILE: "profile"});
});

app.listen(process.env.PORT || 5000, function(){
  console.log('Server is running...');
});
