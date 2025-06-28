// API base URLs and key
const GEO_API = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_API = "https://api.open-meteo.com/v1/forecast";

// Default app state
let currentUnit = "metric"; // "metric" for Celsius, "imperial" for Fahrenheit
let currentLang = "en";     // Language code
let isDarkMode = false;

// DOM Elements
const sidebar = document.getElementById("sidebar");
const sidebarToggleBtn = document.getElementById("sidebarToggleBtn");
const sidebarCloseBtn = document.getElementById("sidebarCloseBtn");
const sidebarItems = document.querySelectorAll(".sidebar-item");
const sections = document.querySelectorAll(".section");
const pageTitle = document.getElementById("pageTitle");
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const weatherCurrent = document.getElementById("weatherCurrent");
const weatherForecast = document.getElementById("weatherForecast");
const datetimeElem = document.getElementById("datetime");
const themeToggle = document.getElementById("themeToggle");
const unitSelect = document.getElementById("unitSelect");
const langSelect = document.getElementById("langSelect");

// Event Listeners
sidebarToggleBtn.addEventListener("click", toggleSidebar);
sidebarCloseBtn.addEventListener("click", closeSidebar);
sidebarItems.forEach(item => item.addEventListener("click", changeSection));
searchBtn.addEventListener("click", getWeather);
themeToggle.addEventListener("change", toggleTheme);
unitSelect.addEventListener("change", changeUnit);
langSelect.addEventListener("change", changeLanguage);

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  updateDateTime();
  setInterval(updateDateTime, 1000);
  loadPreferences();
  getWeather();
});

// Functions

function toggleSidebar() {
  sidebar.classList.toggle("active");
}

function closeSidebar() {
  sidebar.classList.remove("active");
}

function changeSection(e) {
  const selectedSection = e.target.getAttribute("data-section");
  if (!selectedSection) return;

  sections.forEach(sec => sec.classList.remove("active"));
  document.getElementById(selectedSection).classList.add("active");

  sidebarItems.forEach(item => item.classList.remove("active"));
  e.target.classList.add("active");

  pageTitle.textContent = capitalizeFirstLetter(selectedSection);
  closeSidebar();
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function updateDateTime() {
  const now = new Date();

  // Localized days and months for English and Bangla
  const days = {
    en: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
    bn: ['রবিবার','সোমবার','মঙ্গলবার','বুধবার','বৃহস্পতিবার','শুক্রবার','শনিবার']
  };
  const months = {
    en: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    bn: ['জানু','ফেব্রু','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্ব','অক্টো','নভে','ডিসে']
  };

  const dayName = days[currentLang][now.getDay()];
  const monthName = months[currentLang][now.getMonth()];
  const date = now.getDate();
  const year = now.getFullYear();

  let hours = now.getHours();
  let minutes = now.getMinutes();
  let seconds = now.getSeconds();

  const ampm = hours >= 12 ? (currentLang === "bn" ? "পূর্বাহ্ণ" : "PM") : (currentLang === "bn" ? "অপরাহ্ণ" : "AM");
  hours = hours % 12 || 12;
  minutes = minutes < 10 ? '0'+minutes : minutes;
  seconds = seconds < 10 ? '0'+seconds : seconds;

  const timeString = `${hours}:${minutes}:${seconds} ${ampm}`;
  const dateString = `${dayName}, ${monthName} ${date}, ${year}`;

  datetimeElem.textContent = `${dateString} | ${timeString}`;
}

function loadPreferences() {
  // Load theme preference
  const themePref = localStorage.getItem("weatherAppTheme");
  if (themePref === "dark") {
    document.body.classList.add("dark");
    isDarkMode = true;
    themeToggle.checked = true;
  } else {
    document.body.classList.remove("dark");
    isDarkMode = false;
    themeToggle.checked = false;
  }

  // Load unit preference
  const unitPref = localStorage.getItem("weatherAppUnit");
  if (unitPref) {
    currentUnit = unitPref;
    unitSelect.value = unitPref;
  }

  // Load language preference
  const langPref = localStorage.getItem("weatherAppLang");
  if (langPref) {
    currentLang = langPref;
    langSelect.value = langPref;
  }
}

function toggleTheme() {
  isDarkMode = !isDarkMode;
  if (isDarkMode) {
    document.body.classList.add("dark");
    localStorage.setItem("weatherAppTheme", "dark");
  } else {
    document.body.classList.remove("dark");
    localStorage.setItem("weatherAppTheme", "light");
  }
}

function changeUnit() {
  currentUnit = unitSelect.value;
  localStorage.setItem("weatherAppUnit", currentUnit);
  getWeather();
}

function changeLanguage() {
  currentLang = langSelect.value;
  localStorage.setItem("weatherAppLang", currentLang);
  updateDateTime();
  getWeather();
}

function getWeather() {
  const city = cityInput.value.trim();
  clearWeatherDisplay();

  if (city) {
    fetchCityCoordinates(city);
  } else {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          showError(currentLang === "bn" ? "লোকেশন অনুমতি অস্বীকার করা হয়েছে। সিটি নাম লিখুন।" : "Location permission denied. Please enter city name.");
        }
      );
    } else {
      showError(currentLang === "bn" ? "তোমার ব্রাউজারে লোকেশন সাপোর্ট নেই। সিটি নাম লিখুন।" : "Geolocation is not supported by your browser. Please enter city name.");
    }
  }
}

function clearWeatherDisplay() {
  weatherCurrent.innerHTML = "";
  weatherForecast.innerHTML = "";
}

function