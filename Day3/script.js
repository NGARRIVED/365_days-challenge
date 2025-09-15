const apiKey = API_KEY; // Use API_KEY from config.js
const searchBtn = document.getElementById('search-btn');
const cityInput = document.getElementById('city-input');
const weatherInfo = document.querySelector('.weather-info');
const loader = document.getElementById('loader');
const errorMessage = document.getElementById('error-message');

searchBtn.addEventListener('click', () => {
    const city = cityInput.value;
    if (city) {
        getWeather(city);
    }
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchBtn.click();
    }
});

async function getWeather(city) {
    weatherInfo.style.display = 'none';
    errorMessage.style.display = 'none';
    loader.style.display = 'block';

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    console.log('Fetching URL:', url);

    try {
        const response = await fetch(url);
        const data = await response.json();

        loader.style.display = 'none';

        if (data.cod === 200) {
            displayWeather(data);
            weatherInfo.style.display = 'block';
        } else {
            showError(`City not found! Reason: ${data.message}`);
        }
    } catch (error) {
        loader.style.display = 'none';
        showError('An error occurred while fetching data.');
        console.error('Error fetching weather data:', error);
    }
}

function displayWeather(data) {
    document.getElementById('city-name').textContent = data.name;
    document.getElementById('temperature').textContent = `Temperature: ${data.main.temp}°C`;
    document.getElementById('description').textContent = `Weather: ${data.weather[0].description}`;
    document.getElementById('humidity').textContent = `Humidity: ${data.main.humidity}%`;
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}
