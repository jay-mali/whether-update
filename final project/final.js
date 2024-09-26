const apiKey = '4bb4e659b8474c0ba6831620242609';  // Your actual WeatherAPI key

// Show loading spinner
function showLoading() {
    document.getElementById('loadingSpinner').classList.remove('hidden');
}

// Hide loading spinner
function hideLoading() {
    document.getElementById('loadingSpinner').classList.add('hidden');
}

// Function to get current weather by city name using WeatherAPI
function getWeatherByCity(cityName) {
    showLoading();  // Show loading indicator while data is fetched
    const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${cityName}`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('City not found');
            }
            return response.json();
        })
        .then(data => {
            clearError(); // Clear the error if we get valid data
            displayCurrentWeather(data); // Display current weather
            getForecastByCity(cityName); // Get and display 5-day forecast
            saveRecentCity(cityName); // Save the city in the dropdown
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            showError('City not found');  // Show a custom error message
        })
        .finally(() => {
            hideLoading();  // Hide loading spinner after data is fetched
        });
}

// Function to get the 5-day forecast
function getForecastByCity(cityName) {
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${cityName}&days=5`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Unable to fetch forecast data');
            }
            return response.json();
        })
        .then(data => {
            displayForecast(data.forecast.forecastday); // Display the 5-day forecast
        })
        .catch(error => {
            console.error('Error fetching forecast data:', error);
            showError('City not found');  // Show a custom error message
        })
        .finally(() => {
            hideLoading();  // Hide loading spinner after fetching forecast
        });
}

// Function to display current weather
function displayCurrentWeather(data) {
    document.getElementById('locationName').textContent = `${data.location.name} (${data.location.localtime})`;
    document.getElementById('temperature').textContent = `Temperature: ${data.current.temp_c}°C`;
    document.getElementById('windSpeed').textContent = `Wind: ${data.current.wind_kph} kph`;
    document.getElementById('humidity').textContent = `Humidity: ${data.current.humidity}%`;
    document.getElementById('weatherDescription').textContent = data.current.condition.text;
    document.getElementById('weatherIcon').src = `https:${data.current.condition.icon}`;
    document.getElementById('currentWeather').classList.remove('hidden');
}

// Function to display 5-day forecast
function displayForecast(forecastData) {
    const forecastGrid = document.getElementById('forecastGrid');
    forecastGrid.innerHTML = ''; // Clear previous forecast

    forecastData.forEach(day => {
        const date = new Date(day.date).toLocaleDateString();
        const weatherIcon = `https:${day.day.condition.icon}`;
        const maxTemp = `${day.day.maxtemp_c}°C`;
        const minTemp = `${day.day.mintemp_c}°C`;
        const wind = `${day.day.maxwind_kph} kph`;
        const humidity = `${day.day.avghumidity}%`;

        const forecastCard = `
            <div class="forecast-card">
                <p>${date}</p>
                <img src="${weatherIcon}" alt="Weather Icon">
                <p>Temp: ${minTemp} - ${maxTemp}</p>
                <p>Wind: ${wind}</p>
                <p>Humidity: ${humidity}</p>
            </div>
        `;

        forecastGrid.innerHTML += forecastCard;
    });

    document.getElementById('forecastSection').classList.remove('hidden');
}

// Function to show error messages
function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
}

// Function to clear error message
function clearError() {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = '';
    errorMessage.classList.add('hidden');
}

// Function to save recently searched cities in localStorage
function saveRecentCity(cityName) {
    let recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];

    if (!recentCities.includes(cityName)) {
        recentCities.push(cityName);
        localStorage.setItem('recentCities', JSON.stringify(recentCities));
    }
    updateRecentCitiesDropdown();
}

// Function to update the dropdown menu with recently searched cities
function updateRecentCitiesDropdown() {
    const recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
    const dropdown = document.getElementById('cityDropdown');
    
    dropdown.innerHTML = '<option value="">Select a recently searched city</option>';
    recentCities.forEach(city => {
        const option = document.createElement('option');
        option.textContent = city;
        option.value = city;
        dropdown.appendChild(option);
    });

    if (recentCities.length > 0) {
        document.getElementById('recentCitiesSection').classList.remove('hidden');
    }
}

// Event listener for the dropdown to fetch weather when a city is selected
document.getElementById('cityDropdown').addEventListener('change', function() {
    const selectedCity = this.value;
    if (selectedCity) {
        getWeatherByCity(selectedCity); // Fetch weather for the selected city
    }
});

// Function to reset the weather dashboard
function resetDashboard() {
    document.getElementById('cityInput').value = ''; // Clear input field
    document.getElementById('currentWeather').classList.add('hidden'); // Hide current weather
    document.getElementById('forecastSection').classList.add('hidden'); // Hide forecast
    clearError(); // Clear any existing error messages
}

// Event listener for the search button
document.getElementById('searchBtn').addEventListener('click', () => {
    const cityName = document.getElementById('cityInput').value.trim();
    if (cityName) {
        getWeatherByCity(cityName);
    } else {
        showError("Please enter a valid city name.");
    }
});

// Event listener for the "Use Current Location" button
document.getElementById('locationBtn').addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${lat},${lon}`;

            fetch(url)
                .then(response => response.json())
                .then(data => {
                    displayCurrentWeather(data);
                    getForecastByCity(`${lat},${lon}`);
                })
                .catch(error => {
                    console.error('Error fetching weather data:', error);
                    showError("Error fetching weather for your location.");
                });
        });
    } else {
        showError("Geolocation is not supported by this browser.");
    }
});

// Event listener for the reset button
document.getElementById('resetBtn').addEventListener('click', resetDashboard);  // Add this button in the HTML

// Initialize the dropdown with saved cities on page load
window.onload = updateRecentCitiesDropdown;
