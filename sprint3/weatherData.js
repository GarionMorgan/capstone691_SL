//weatherdata js file
exports.ProcessWeather = class {
  constructor(location, apiKey) {
    this.location = location;
    this.apiKey = apiKey;
  }

  getWeather() {
    console.log("getWeather function...");
    const query = this.location;
    const key = this.apiKey;
    const unit = "imperial";
    const weatherUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + query + "&appid=" + key + "&units=" + unit;

    this.url = weatherUrl;

    return weatherUrl;
  }

};
