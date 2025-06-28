const apiKey = "https://api.open-meteo.com/v1/forecast";

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

  // 12-hour format & am/pm
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  minutes = minutes < 10 ? '0'+minutes : minutes;
  seconds = seconds < 10 ? '0'+seconds : seconds;

  const timeString = `${hours}:${minutes}:${seconds} ${ampm}`;
  const dateString = `${dayName}, ${monthName} ${date}, ${year}`;

  dtElem.innerHTML = `<p>${dateString} | ${timeString}</p>`;
}

// Call updateDateTime every second
setInterval(updateDateTime, 1000);
updateDateTime();

function getWeather() {
  const cityInput = document.getElementById("cityInput");
  const city = cityInput.value.trim();
  const resultDiv = document.getElementById("weatherResult");
  const forecastDiv = document.getElementById("forecast");

  resultDiv.innerHTML = "";
  forecastDiv.innerHTML = "";

  if (city) {
    fetchWeatherByCity(city);
  } else {
    // If no city, use browser geolocation
    if (navigator.geolocation) {
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
}

function fetchWeatherByCity(city) {
  const resultDiv = document.getElementById("weatherResult");
  const forecastDiv = document.getElementById("forecast");

  fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}`)
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
      document.getElementById("weatherResult").innerHTML = "<p>Error fetching location data.</p>";
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

      // Weather condition codes reference: https://open-meteo.com/en/docs#latitude=52.52&longitude=13.41&hourly=temperature_2m

      resultDiv.innerHTML = `
        <h2>${cityName || 'Current Location'}, ${country || ''}</h2>
        <p><strong>Temperature:</strong> ${current.temperature} °C</p>
        <p><strong>Wind Speed:</strong> ${current.windspeed} km/h</p>
        <p><strong>Condition Code:</strong> ${current.weathercode}</p>
      `;

      // Show daily forecast
      let forecastHTML = '';
      for (let i = 0; i < daily.time.length; i++) {
        const dayDate = new Date(daily.time[i]);
        const dayName = dayDate.toLocaleDateString('en-US', { weekday: 'short' });
        forecastHTML += `
          <div class="forecast-day">
            <h4>${dayName}</h4>
            <p>Max: ${daily.temperature_2m_max[i]} °C</p>
            <p>Min: ${daily.temperature_2m_min[i]} °C</p>
            <p>Code: ${daily.weathercode[i]}</p>
          </div>
        `;
      }
      forecastDiv.innerHTML = forecastHTML;
    })
    .catch(() => {
      resultDiv.innerHTML = "<p>Error fetching weather data.</p>";
    });
}

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  if(sidebar.style.display === "none" || sidebar.style.display === "") {
    sidebar.style.display = "block";
  } else {
    sidebar.style.display = "none";
  }
}

function showSection(id) {
  document.querySelectorAll('.section').forEach(sec => {
    sec.classList.remove('active');
  });
  document.getElementById(id).classList.add('active');
}

function toggleTheme() {
  document.body.classList.toggle('dark');
}