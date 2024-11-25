const apiKey = '1a57d1d5f41764029769b694b4c94a41'; // Your actual OpenWeatherMap API key
const apiUrl = 'https://api.openweathermap.org/data/2.5/weather';
const forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';

// Cache DOM elements
const searchButton = document.getElementById('searchButton');
const cityInput = document.getElementById('cityInput');
const weatherData = document.getElementById('weatherData');
const forecastData = document.getElementById('forecastData');
const cityName = document.getElementById('cityName');
const temp = document.getElementById('temp');
const humidity = document.getElementById('humidity');
const wind = document.getElementById('wind');
const weatherIcon = document.getElementById('weatherIcon');
const recentCitiesDropdown = document.getElementById('recentCitiesDropdown');

// Event listeners
searchButton.addEventListener('click', handleSearchCity);
recentCitiesDropdown.addEventListener('change', handleSelectCityFromDropdown);

// Fetch weather data from the API
async function getWeatherData(city) {
  try {
    const response = await axios.get(`${apiUrl}?q=${city}&appid=${apiKey}&units=metric`);
    if (response.status === 200) {
      return response.data;  // Successfully fetched data
    } else {
      throw new Error('Error fetching weather data');
    }
  } catch (error) {
    console.error('Error fetching weather data:', error.message);
    alert('Error fetching weather data! ' + error.message);  // Show a more specific error
    return null;
  }
}

// Fetch 5-day forecast data from the API
async function getFiveDayForecast(city) {
  try {
    const response = await axios.get(`${forecastUrl}?q=${city}&appid=${apiKey}&units=metric`);
    return response.data.list;
  } catch (error) {
    console.error('Error fetching forecast data:', error.message);
    alert('Error fetching forecast data!');
    return null;
  }
}

// Handle city search by the user
async function handleSearchCity() {
  const city = cityInput.value.trim();
  if (!city) {
    alert('Please enter a city name');
    return;
  }

  // Fetch current weather data
  const weatherDataResponse = await getWeatherData(city);
  if (!weatherDataResponse) return;

  // Display the current weather
  displayWeatherData(weatherDataResponse);

  // Fetch 5-day forecast data
  const forecastResponse = await getFiveDayForecast(city);
  if (!forecastResponse) return;

  // Display the forecast
  displayForecastData(forecastResponse);

  // Update the dropdown with recently searched cities
  updateDropdown(city);
}

// Display current weather data
function displayWeatherData(data) {
  weatherData.classList.remove('hidden');
  cityName.textContent = `${data.name}, ${data.sys.country}`;
  temp.textContent = data.main.temp;
  humidity.textContent = data.main.humidity;
  wind.textContent = data.wind.speed;
  weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
}

// Display 5-day forecast data
function displayForecastData(forecastList) {
  forecastData.innerHTML = ''; // Clear previous forecast data

  forecastList.forEach((forecast) => {
    if (forecast.dt_txt.includes('12:00:00')) { // Show weather at 12:00 PM for each day
      const forecastCard = document.createElement('div');
      forecastCard.classList.add('bg-white', 'p-4', 'rounded-lg', 'shadow-lg', 'text-center');
      
      const date = new Date(forecast.dt * 1000).toLocaleDateString();
      const iconUrl = `https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`;

      forecastCard.innerHTML = `
        <p class="font-semibold">${date}</p>
        <img src="${iconUrl}" alt="weather icon" class="mx-auto w-16 h-16" />
        <p>Temp: ${forecast.main.temp}°C</p>
        <p>Wind: ${forecast.wind.speed} km/h</p>
        <p>Humidity: ${forecast.main.humidity}%</p>
      `;

      forecastData.appendChild(forecastCard);
    }
  });
}

// Update the dropdown with recently searched cities
function updateDropdown(city) {
  let cities = JSON.parse(localStorage.getItem('recentCities')) || [];
  if (!cities.includes(city)) {
    cities.push(city);
    localStorage.setItem('recentCities', JSON.stringify(cities));
  }
  loadDropdown();
}

// Load recently searched cities into the dropdown
function loadDropdown() {
  let cities = JSON.parse(localStorage.getItem('recentCities')) || [];
  recentCitiesDropdown.innerHTML = '<option value="">Recently Searched Cities</option>'; // Reset dropdown
  cities.forEach((city) => {
    const option = document.createElement('option');
    option.value = city;
    option.textContent = city;
    recentCitiesDropdown.appendChild(option);
  });
}

// Handle selecting a city from the dropdown
async function handleSelectCityFromDropdown(e) {
  const selectedCity = e.target.value;
  if (selectedCity) {
    const weatherDataResponse = await getWeatherData(selectedCity);
    if (!weatherDataResponse) return;
    displayWeatherData(weatherDataResponse);
    const forecastResponse = await getFiveDayForecast(selectedCity);
    if (!forecastResponse) return;
    displayForecastData(forecastResponse);
  }
}

// Load recent cities when the page loads
document.addEventListener('DOMContentLoaded', loadDropdown);
