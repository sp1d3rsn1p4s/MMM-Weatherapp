Module.register("MMM-Weatherapp", {
  defaults: {
      apiKey: "",           // Your OpenWeatherMap API key
      lat: 40.7128,         // Default latitude (can be overridden in config.js)
      lon: -74.0060,        // Default longitude (can be overridden in config.js)
      updateInterval: 600000, // Update interval in milliseconds (10 minutes)
      iconSet: "default",   // The name of your custom icon set
  },

  start: function () {
      this.weatherData = null;
      this.scheduleUpdate();
  },

  isDaytime: function(currentTime, sunrise, sunset) {
    return currentTime >= sunrise && currentTime < sunset;
  },

  getIconFromWeatherId: function(weatherId, isDaytime) {
    if (weatherId === 200) return "thunderstorms-rain.svg";
    if (weatherId >= 201 && weatherId <= 232) return "thunderstorm.svg";
    if (weatherId >= 300 && weatherId <= 321) return "drizzle.svg";
    if (weatherId >= 500 && weatherId <= 531) return "rain.svg";
    if (weatherId >= 600 && weatherId <= 622) return "snow.svg";
    if (weatherId === 800) return isDaytime ? "clear-day.svg" : "clear-night.svg";
    if (weatherId === 804) return "overcast.svg";
    if (weatherId >= 801 && weatherId <= 803) return "cloudy.svg";
    if (weatherId === 701) return "mist.svg";
    if (weatherId === 711) return "smoke.svg";
    if (weatherId === 721) return "haze.svg";
    if (weatherId === 731) return "dust.svg";
    if (weatherId === 741) return "fog.svg";
    return "default.svg";  // Default icon in case none match
  },

  getStyles: function () {
      return ["MMM-Weatherapp.css"];
  },

  getScripts: function () {
      return ["moment.js"];
  },

  getDom: function () {
    var wrapper = document.createElement("div");

    if (!this.weatherData) {
        wrapper.innerHTML = "Loading...";
    } else {
        var weatherInfo = document.createElement("div");
        weatherInfo.className = "weather-info";

        var isDay = this.isDaytime(this.weatherData.current.dt, this.weatherData.current.sunrise, this.weatherData.current.sunset);
        var iconSrc = `modules/MMM-Weatherapp/icons/${this.getIconFromWeatherId(this.weatherData.current.weather[0].id, isDay)}`;

        var iconAndTempDiv = document.createElement("div");
        iconAndTempDiv.className = "icon-and-temp";

        var iconDiv = document.createElement("div");
        iconDiv.className = "weather-icon";
        var iconImg = document.createElement("img");
        iconImg.src = iconSrc;
        iconImg.alt = "Weather Icon";
        iconDiv.appendChild(iconImg);

        var temperatureDiv = document.createElement("div");
        temperatureDiv.className = "weather-temperature";
        temperatureDiv.innerHTML = `${parseInt(this.weatherData.current.temp)}°F`;

        iconAndTempDiv.appendChild(iconDiv);
        iconAndTempDiv.appendChild(temperatureDiv);

        var descriptionDiv = document.createElement("div");
        descriptionDiv.className = "weather-description";
        descriptionDiv.innerHTML = this.weatherData.current.weather[0].description;

        weatherInfo.appendChild(iconAndTempDiv);
        weatherInfo.appendChild(descriptionDiv);

        var detailsDiv = document.createElement("div");
        detailsDiv.className = "weather-details";

        var tempHighLowDiv = document.createElement("div");
        tempHighLowDiv.className = "temp-high-low";
        var highTempSpan = document.createElement("span");
        
        highTempSpan.className = "high-temp";
        highTempSpan.innerHTML = `${parseInt(this.weatherData.daily[0].temp.max)}°`;
        
        
        var separator = document.createTextNode(" / ");
        
        var lowTempSpan = document.createElement("span");
        lowTempSpan.className = "low-temp";
        lowTempSpan.innerHTML = `${parseInt(this.weatherData.daily[0].temp.min)}°`;
        
        tempHighLowDiv.appendChild(lowTempSpan);
        tempHighLowDiv.appendChild(separator);
        tempHighLowDiv.appendChild(highTempSpan);
        detailsDiv.appendChild(tempHighLowDiv);

        var rainChanceDiv = document.createElement("div");
        rainChanceDiv.className = "rain-chance";
        rainChanceDiv.innerHTML = `<img src="modules/MMM-Weatherapp/icons/rain-icon.svg" alt="Rain Icon" />${Math.round(this.weatherData.hourly[0].pop * 100)}%`;
        detailsDiv.appendChild(rainChanceDiv);

        var windDiv = document.createElement("div");
        windDiv.className = "weather-wind";
        windDiv.innerHTML = `<img src="modules/MMM-Weatherapp/icons/wind-icon.svg" alt="Wind Icon" />${Math.round(this.weatherData.current.wind_speed)} mph`;
        detailsDiv.appendChild(windDiv);

        // Assuming you have humidity data in your weatherData:
        var humidityDiv = document.createElement("div");
        humidityDiv.className = "humidity";
        humidityDiv.innerHTML = `<img src="modules/MMM-Weatherapp/icons/humidity-icon.svg" alt="humidity Icon" />${this.weatherData.current.humidity}%`;
        detailsDiv.appendChild(humidityDiv);

        weatherInfo.appendChild(detailsDiv);


        if (this.weatherData.alerts) {
            var alertsDiv = document.createElement("div");
            alertsDiv.className = "weather-alerts";

            this.weatherData.alerts.forEach(alert => {
                var alertDiv = document.createElement("div");
                alertDiv.className = "weather-alert";

                var alertTitle = document.createElement("div");
                alertTitle.className = "alert-title";
                alertTitle.innerHTML = alert.event;
                alertDiv.appendChild(alertTitle);

                var alertDescription = document.createElement("div");
                alertDescription.className = "alert-description";
                alertDescription.innerHTML = alert.description;
                alertDiv.appendChild(alertDescription);

                alertsDiv.appendChild(alertDiv);
            });

            weatherInfo.appendChild(alertsDiv);
        }

        wrapper.appendChild(weatherInfo);

        var hourlyForecast = document.createElement("div");
        hourlyForecast.className = "hourly-forecast";
        for (let i = 1; i <= 3; i++) {
            var hour = document.createElement("div");
            hour.className = "forecast-hour";
            
            var hourlyIconSrc = `modules/MMM-Weatherapp/icons/${this.getIconFromWeatherId(this.weatherData.hourly[i].weather[0].id, isDay)}`;  // New icon logic based on group ID
            hour.innerHTML = `
                <div class="hour-time">${moment.unix(this.weatherData.hourly[i].dt).format('ha')}</div>
                <img src="${hourlyIconSrc}" alt="Weather Icon" />
                <div class="hour-temp">${parseInt(this.weatherData.hourly[i].temp)}°</div>
                <div class="hour-rain"><img src="modules/MMM-Weatherapp/icons/rain-icon.svg" alt="Rain Icon" /> ${Math.round(this.weatherData.hourly[i].pop * 100)}%</div>
            `;
            hourlyForecast.appendChild(hour);
        }
        wrapper.appendChild(hourlyForecast);
        
 

var dailyForecast = document.createElement("div");
dailyForecast.className = "daily-forecast";

for (let i = 1; i <= 3; i++) { // Skip today's forecast
    var day = document.createElement("div");
    day.className = "forecast-day";
    
    var dailyIconSrc = `modules/MMM-Weatherapp/icons/${this.getIconFromWeatherId(this.weatherData.daily[i].weather[0].id, isDay)}`;  // New icon logic based on group ID
    
    var temperatureWrapper = document.createElement("div");
    temperatureWrapper.className = "temp-wrapper";

    var lowTempSpan = document.createElement("span");
    lowTempSpan.className = "low-temp";
    lowTempSpan.innerHTML = `${parseInt(this.weatherData.daily[i].temp.min)}°`;

    var separator = document.createTextNode(" / ");

    var highTempSpan = document.createElement("span");
    highTempSpan.className = "high-temp";
    highTempSpan.innerHTML = `${parseInt(this.weatherData.daily[i].temp.max)}°`;

    temperatureWrapper.appendChild(lowTempSpan);
    temperatureWrapper.appendChild(separator);
    temperatureWrapper.appendChild(highTempSpan);

    day.innerHTML = `
        <div class="day-name">${moment.unix(this.weatherData.daily[i].dt).format('ddd')}</div>
        <img src="${dailyIconSrc}" alt="Weather Icon" />
    `;

    day.appendChild(temperatureWrapper);

    day.innerHTML += `
        <div class="day-rain"><img src="modules/MMM-Weatherapp/icons/rain-icon.svg" alt="Rain Icon" /> ${Math.round(this.weatherData.daily[i].pop * 100)}%</div>
    `;
    
    dailyForecast.appendChild(day);
}
wrapper.appendChild(dailyForecast);

    }

    return wrapper;
},


  scheduleUpdate: function () {
      var self = this;
      setInterval(function () {
          self.getWeather();
      }, this.config.updateInterval);
      self.getWeather();
  },

  getWeather: function () {
    var url =
        `https://api.openweathermap.org/data/2.5/onecall?lat=${this.config.lat}&lon=${this.config.lon}&appid=` +
        this.config.apiKey +
        "&units=imperial"; // Use imperial units

    this.sendSocketNotification("GET_WEATHER", url);
},

  socketNotificationReceived: function (notification, payload) {
      if (notification === "WEATHER_DATA") {
          this.weatherData = payload;
          this.updateDom();
      }
  },
});
