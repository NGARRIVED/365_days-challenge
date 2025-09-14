const apiKey = API_KEY; // Use API_KEY from config.js
const searchBtn = document.getElementById('search-btn');
const cityInput = document.getElementById('city-input');

searchBtn.addEventListener('click', () => {
    const city = cityInput.value;
    if (city) {
        getWeather(city);
    }
});

async function getWeather(city) {
    // Step 1: Geocoding API to get lat and lon from city name
    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;
    console.log('Fetching Geo URL:', geoUrl);

    try {
        const geoResponse = await fetch(geoUrl);
        const geoData = await geoResponse.json();

        if (!geoData || geoData.length === 0) {
            alert('City not found! Please check the spelling.');
            return;
        }

        const { lat, lon, name } = geoData[0];

        // Step 2: One Call API to get weather data using lat and lon
        const weatherUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        console.log('Fetching Weather URL:', weatherUrl);

        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();

        if (weatherResponse.status !== 200) {
            console.error('API Error:', weatherData);
            alert(`Could not fetch weather! Reason: ${weatherData.message}`);
            return;
        }

        displayWeather(weatherData, name);

    } catch (error) {
        console.error('Error fetching data:', error);
        alert('An error occurred while fetching data.');
    }
}

function displayWeather(data, cityName) {
    document.getElementById('city-name').textContent = cityName;
    document.getElementById('temperature').textContent = `Temperature: ${data.current.temp}°C`;
    document.getElementById('description').textContent = `Weather: ${data.current.weather[0].description}`;
    document.getElementById('humidity').textContent = `Humidity: ${data.current.humidity}%`;
}
