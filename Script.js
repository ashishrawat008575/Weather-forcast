// OpenWeatherMap API key
const apiKey = '1a57d1d5f41764029769b694b4c94a41';

// Function to format the date as dd/mm/yyyy
function formatDate(date) {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

// Function to get the day name (e.g., Monday, Tuesday)
function getDayName(date) {
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return daysOfWeek[date.getDay()];
}

// Function to fetch weather data based on city (for 5-day forecast)
async function fetchWeatherByCity(city) {
  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`);
    if (!response.ok) {
      throw new Error("City not found or API request failed.");
    }
    const data = await response.json();
    displayWeather(data);
  } catch (error) {
    displayError(error.message);
  }
}

// Function to fetch weather data based on current location (for 5-day forecast)
async function fetchWeatherByLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`);
        if (!response.ok) {
          throw new Error("Unable to fetch weather for current location.");
        }
        const data = await response.json();
        displayWeather(data);
      } catch (error) {
        displayError(error.message);
      }
    }, (error) => {
      displayError("Geolocation error: " + error.message);
    });
  } else {
    displayError("Geolocation is not supported by this browser.");
  }
}

// Function to display weather data (current and 5-day forecast)
function displayWeather(data) {
  const weatherContainer = document.getElementById('weather-display');
  const currentDate = new Date(); 
  const formattedDate = formatDate(currentDate);
  const dayName = getDayName(currentDate);

  let weatherHTML = `
    <div class="bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transform transition-all hover:scale-105 text-center">
      <h2 class="text-3xl font-semibold text-blue-700">${data.city.name}</h2>
      <img src="https://openweathermap.org/img/wn/${data.list[0].weather[0].icon}.png" alt="${data.list[0].weather[0].description}" class="w-24 h-24 mx-auto">
      <p class="text-3xl font-bold text-blue-700">${data.list[0].main.temp}°C</p>
      <p class="text-lg text-gray-600">Humidity: ${data.list[0].main.humidity}%</p>
      <p class="text-lg text-gray-600">Wind Speed: ${data.list[0].wind.speed} m/s</p>
    </div>
  `;

  // 5-Day Forecast Container
  weatherHTML += `<div class="flex overflow-x-auto gap-6 mt-8">`;
  data.list.forEach((forecast, index) => {
    if (index % 8 === 0) { // Display one forecast per day (every 8th data point)
      const forecastDate = new Date(forecast.dt * 1000);
      const day = getDayName(forecastDate);
      const date = formatDate(forecastDate);
      weatherHTML += `
        <div class="bg-gradient-to-r from-blue-600 to-blue-400 text-white p-6 rounded-xl shadow-xl w-64 text-center transform transition-all hover:scale-105 hover:shadow-2xl">
          <p class="text-xl font-semibold">${day} (${date})</p>
          <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" alt="${forecast.weather[0].description}" class="w-16 h-16 mx-auto">
          <p class="text-2xl font-bold">${forecast.main.temp}°C</p>
          <p class="text-lg">Humidity: ${forecast.main.humidity}%</p>
          <p class="text-lg">Wind: ${forecast.wind.speed} m/s</p>
        </div>
      `;
    }
  });

  weatherHTML += `</div>`;
  weatherContainer.classList.remove('hidden');
  weatherContainer.innerHTML = weatherHTML;
}

// Function to display error message
function displayError(message) {
  const weatherContainer = document.getElementById('weather-display');
  weatherContainer.classList.remove('hidden');
  weatherContainer.innerHTML = `
    <div class="bg-red-600 text-white p-6 rounded-lg shadow-lg text-center w-full">
      <h2 class="text-3xl font-semibold">Error</h2>
      <p class="text-xl">${message}</p>
    </div>
  `;
}

// Event listener for the search button
document.getElementById('search-btn').addEventListener('click', () => {
  const city = document.getElementById('city-input').value;
  if (city) {
    fetchWeatherByCity(city);
  } else {
    displayError("Please enter a city name.");
  }
});

// Event listener for the current location button
document.getElementById('current-location-btn').addEventListener('click', () => {
  fetchWeatherByLocation();
});
