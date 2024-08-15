const NodeHelper = require("node_helper");
const request = require("request");

module.exports = NodeHelper.create({
    start: function () {
        console.log("MMM-Weatherapp helper started");
    },

    getWeather: function (url) {
        const self = this;
        request(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                const weatherData = JSON.parse(body);
                self.sendSocketNotification("WEATHER_DATA", weatherData);
            } else {
                console.error("MMM-Weatherapp: Could not load weather data.");
            }
        });
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "GET_WEATHER") {
            this.getWeather(payload);
        }
    },
});
