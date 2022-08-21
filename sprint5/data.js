//data js file

exports.getDate = function() {
  let today = new Date();

  // return today.toLocaleDateString("en-US", options);
  return today.toUTCString();
};

exports.getYear = function() {
  let date = new Date();
  let year = date.getFullYear();

  return year;
}

exports.getDay = function() {
  let date_ob = new Date();

  let options = {
    weekday: "long",
    day: "numeric",
    month: "long"
  };

  return date_ob.toLocaleDateString("en-US", options);
};

exports.getDayTwo = function() {
  let day = new Date();

  let nextDay = new Date(day);
  nextDay.setDate(day.getDate() + 1);

  let options = {
    weekday: "long",
    day: "numeric",
    month: "long"
  };

  return nextDay.toLocaleDateString("en-US", options);
};

exports.getDayThree = function() {
  let day = new Date();

  let nextDay = new Date(day);
  nextDay.setDate(day.getDate() + 2);

  let options = {
    weekday: "long",
    day: "numeric",
    month: "long"
  };

  return nextDay.toLocaleDateString("en-US", options);
};

exports.getDayFour = function() {
  let day = new Date();

  let nextDay = new Date(day);
  nextDay.setDate(day.getDate() + 3);

  let options = {
    weekday: "long",
    day: "numeric",
    month: "long"
  };

  return nextDay.toLocaleDateString("en-US", options);
};

exports.getDayFive = function() {
  let day = new Date();

  let nextDay = new Date(day);
  nextDay.setDate(day.getDate() + 4);

  let options = {
    weekday: "long",
    day: "numeric",
    month: "long"
  };

  return nextDay.toLocaleDateString("en-US", options);
};

exports.getNumericDay = function() {
  let date_ob = new Date();

  let options = {
    day: "numeric",
    month: "long"
  };

  return date_ob.toLocaleDateString("en-US", options);
};
