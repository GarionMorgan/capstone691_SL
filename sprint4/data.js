//data js file

exports.getDate = function() {
  let today = new Date();
  let options = {
    weekday: "long",
    day: "numeric",
    month: "long"
  };

  // return today.toLocaleDateString("en-US", options);
  return today.toUTCString();
};

exports.getYear = function() {
  let date = new Date();
  let year = date.getFullYear();

  return year;
}
