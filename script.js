const apiKey = "https://api.open-meteo.com/v1/forecast";

document.addEventListener("DOMContentLoaded", () => {
  updateDateTime();
  setInterval(updateDateTime, 1000);
  getWeather(); // Auto load current location weather on page load
});

function updateDateTime() {
  const dtElem = document.getElementById("datetime");
  const now = new Date();

  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const dayName = days[now.getDay()];
  const monthName = months[now.getMonth()];
  const date = now.getDate();
  const year = now.getFullYear();

  let hours = now.getHours();
  let minutes = now.getMinutes();
  let seconds = now.getSeconds();

  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  minutes = minutes < 10 ? '0'+minutes : minutes;
  seconds = seconds < 10 ? '0'+seconds : seconds;

  const timeString = `${hours}:${minutes}:${seconds} ${ampm}`;
  const dateString = `${dayName}, ${monthName} ${date}, ${year}`;

  dtElem.innerHTML = `<p>${dateString} | ${timeString}</p>`;
}

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.toggle("active");
}

function showSection(id) {
  document.querySelectorAll(".section").forEach((sec) => {
    sec.classList.remove("active");
  });
  document.getElementById(id).classList.add("active");
}

function toggleTheme() {
  document.body.classList.toggle("dark");
}

function getWeather() {
  const cityInput = document.getElementById("cityInput");
  const city = cityInput.value.trim();
  const resultDiv = document.getElementById("weatherResult");
  const forecastDiv = document.getElementById("forecast");

  resultDiv.innerHTML = "";
  forecastDiv.innerHTML = "";

  if (city) {
    fetchWeatherByCity(city);
  } else if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
      },
      () => {
        resultDiv.innerHTML = "<p>Geolocation permission denied. Please enter city manually.</p>";
      }
    );
  } else {
    resultDiv.innerHTML = "<p>Geolocation not supported. Please enter city manually.</p>";
  }
}

function fetchWeatherByCity(city) {
  const resultDiv = document.getElementById("weatherResult");

  fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}`)
    .then(res => res.json())
    .then(data => {
      if (!data.results || data.results.length === 0) {
        resultDiv.innerHTML = "<p>City not found.</p>";
        return;
      }
      const { latitude, longitude, name, country } = data.results[0];
      fetchWeatherByCoords(latitude, longitude, name, country);
    })
    .catch(() => {
      resultDiv.innerHTML = "<p>Error fetching location data.</p>";
    });
}

function fetchWeatherByCoords(lat, lon, cityName = '', country = '') {
  const resultDiv = document.getElementById("weatherResult");
  const forecastDiv = document.getElementById("forecast");

  const url = `${apiKey}?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (!data.current_weather) {
        resultDiv.innerHTML = "<p>No weather data available.</p>";
        return;
      }

      const current = data.current_weather;
      const daily = data.daily;

      // Map weathercode to description & icon (simplified)
      const weatherDescriptions = {
        0: "Clear sky",
        1: "Mainly clear",
        2: "Partly cloudy",
        3: "Overcast",
        45: "Fog",
        48: "Depositing r