const apiKey = "https://api.open-meteo.com/v1/forecast";

function getWeather() {
  const city = document.getElementById("cityInput").value;
  const resultDiv = document.getElementById("weatherResult");

  if (!city) {
    resultDiv.innerHTML = "<p>Please enter a city name.</p>";
    return;
  }

  // Step 1: Get coordinates from city name
  fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}`)
    .then((res) => res.json())
    .then((data) => {
      if (!data.results || data.results.length === 0) {
        resultDiv.innerHTML = `<p>City not found.</p>`;
        return;
      }

      const { latitude, longitude, name, country } = data.results[0];

      // Step 2: Get weather from coordinates
      fetch(`${apiKey}?latitude=${latitude}&longitude=${longitude}&current_weather=true`)
        .then((res) => res.json())
        .then((weatherData) => {
          const weather = weatherData.current_weather;

          resultDiv.innerHTML = `
            <h2>${name}, ${country}</h2>
            <p>Temperature: ${weather.temperature}°C</p>
            <p>Wind Speed: ${weather.windspeed} km/h</p>
            <p>Condition Code: ${weather.weathercode}</p>
          `;
        })
        .catch((err) => {
          resultDiv.innerHTML = `<p>Error fetching weather data.</p>`;
        });
    })
    .catch((err) => {
      resultDiv.innerHTML = `<p>Error fetching location.</p>`;
    });
}