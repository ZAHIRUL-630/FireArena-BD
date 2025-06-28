const apiKey = "https://api.open-meteo.com/v1/forecast";

function getWeather() {
  const city = document.getElementById("cityInput").value;
  const resultDiv = document.getElementById("weatherResult");

  if (!city) {
    resultDiv.innerHTML = "<p>Please enter a city name.</p>";
    return;
  }

  fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}`)
    .then((res) => res.json())
    .then((data) => {
      if (!data.results || data.results.length === 0) {
        resultDiv.innerHTML = "<p>City not found.</p>";
        return;
      }

      const { latitude, longitude, name, country } = data.results[0];

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
        .catch(() => {
          resultDiv.innerHTML = "<p>Weather data error.</p>";
        });
    })
    .catch(() => {
      resultDiv.innerHTML = "<p>Location not found.</p>";
    });
}

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.style.display = sidebar.style.display === "none" ? "block" : "none";
}

function showSection(id) {
  document.querySelectorAll('.section').forEach((sec) => {
    sec.classList.remove('active');
  });
  document.getElementById(id).classList.add('active');
}

function toggleTheme() {
  document.body.classList.toggle('dark');
}