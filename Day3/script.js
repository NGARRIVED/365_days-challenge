const apiKey = API_KEY; // Use API_KEY from config.js
const searchBtn = document.getElementById('search-btn');
const cityInput = document.getElementById('city-input');
const weatherInfo = document.querySelector('.weather-info');
const forecastContainer = document.querySelector('.forecast-container');
const loader = document.getElementById('loader');
const errorMessage = document.getElementById('error-message');

// --- EVENT LISTENERS ---

// Handle search button click
searchBtn.addEventListener('click', () => {
    const city = cityInput.value;
    if (city) {
        getWeatherByCity(city);
    }
});

// Handle 'Enter' key press in the input field
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchBtn.click();
    }
});

// Get user's location on page load
window.addEventListener('load', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            fetchDataByCoords(latitude, longitude);
        }, () => {
            // If user denies geolocation, do nothing. They can still search manually.
            showError('Geolocation denied. Search for a city manually.');
        });
    }
});


// --- DATA FETCHING ---

// Fetch weather and forecast data by city name
async function getWeatherByCity(city) {
    showLoading();
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
    
    await fetchData(weatherUrl, forecastUrl);
}

// Fetch weather and forecast data by coordinates
async function fetchDataByCoords(lat, lon) {
    showLoading();
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    await fetchData(weatherUrl, forecastUrl);
}

// Generic function to fetch and process data
async function fetchData(weatherUrl, forecastUrl) {
    try {
        const [weatherResponse, forecastResponse] = await Promise.all([
            fetch(weatherUrl),
            fetch(forecastUrl)
        ]);

        const weatherData = await weatherResponse.json();
        const forecastData = await forecastResponse.json();

        hideLoading();

        if (weatherData.cod === 200 && forecastData.cod === "200") {
            displayWeather(weatherData);
            displayForecast(forecastData);
            weatherInfo.style.display = 'block';
            forecastContainer.style.display = 'flex';
        } else {
            // Use the error message from the API response
            showError(weatherData.message || 'City not found.');
        }
    } catch (error) {
        hideLoading();
        showError('An error occurred. Please try again.');
        console.error('Fetch Error:', error);
    }
}


// --- UI DISPLAY FUNCTIONS ---

// Display current weather data
function displayWeather(data) {
    const iconCode = data.weather[0].icon;
    document.getElementById('weather-icon').src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    document.getElementById('city-name').textContent = data.name;
    document.getElementById('temperature').textContent = `${Math.round(data.main.temp)}°C`;
    document.getElementById('description').textContent = data.weather[0].description;
    document.getElementById('feels-like').textContent = `Feels like: ${Math.round(data.main.feels_like)}°C`;
    document.getElementById('humidity').textContent = `Humidity: ${data.main.humidity}%`;
    document.getElementById('wind-speed').textContent = `Wind: ${data.wind.speed} m/s`;
}

// Display 5-day forecast
function displayForecast(data) {
    forecastContainer.innerHTML = ''; // Clear previous forecast
    const dailyForecasts = {};

    // The API returns a forecast every 3 hours. We need to group them by day.
    for (const forecast of data.list) {
        // Get the date part of the timestamp (e.g., "2023-10-27")
        const date = forecast.dt_txt.split(' ')[0];
        if (!dailyForecasts[date]) {
            dailyForecasts[date] = forecast; // Store the first forecast for that day
        }
    }

    // Get the next 5 days, excluding today
    const forecastDays = Object.values(dailyForecasts).slice(1, 6);

    for (const day of forecastDays) {
        const dayElement = document.createElement('div');
        dayElement.classList.add('forecast-day');

        const dayName = new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' });
        const dayIcon = day.weather[0].icon;
        const dayTemp = Math.round(day.main.temp);

        dayElement.innerHTML = `
            <p>${dayName}</p>
            <img class="forecast-icon" src="https://openweathermap.org/img/wn/${dayIcon}.png" alt="Weather Icon">
            <p>${dayTemp}°C</p>
        `;
        forecastContainer.appendChild(dayElement);
    }
}

// --- UI HELPER FUNCTIONS ---

function showLoading() {
    weatherInfo.style.display = 'none';
    forecastContainer.style.display = 'none';
    errorMessage.style.display = 'none';
    loader.style.display = 'block';
}

function hideLoading() {
    loader.style.display = 'none';
}

function showError(message) {
    hideLoading();
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}
