const app = document.querySelector('.weather-app');
const temp = document.querySelector('.temp');
const dateOutput = document.querySelector('.date');
const timeOutput = document.querySelector('.time');
const conditionOutput = document.querySelector('.condition');
const nameOutput = document.querySelector('.name');
const icon = document.querySelector('.icon');
const cloudOutput = document.querySelector('.cloud');
const humidityOutput = document.querySelector('.humidity');
const windOutput = document.querySelector('.wind');
const form = document.querySelector('#locationInput');
const search = document.querySelector('.search');
const cities = document.querySelectorAll('.city');
const loading = document.querySelector('.loading'); // Loading icon
const threeDayForecast = document.querySelector('.three-day');
const sevenDayForecast = document.querySelector('.seven-day');
const mapContainer = document.getElementById('map'); // Assuming the map is in an element with id "map"

let cityInput = "Toronto"; // Change the default city to Toronto

let map; // Store map instance to update position dynamically

// Add event listener to predefined city buttons
cities.forEach((city) => {
    city.addEventListener('click', (e) => {
        cityInput = e.target.innerHTML;
        fetchWeatherData();
        app.style.opacity = "0";
        loading.style.display = "block"; // Show loading icon
    });
});

// Add event listener for the search form submission
form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (search.value.trim().length === 0) {
        alert('Please type in a city name');
    } else {
        cityInput = search.value.trim();
        fetchWeatherData();
        search.value = "";
        app.style.opacity = "0";
        loading.style.display = "block"; // Show loading icon
    }
});

// Function to get the day of the week
function dayOfTheWeek(day, month, year) {
    const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return weekday[new Date(`${year}-${month}-${day}`).getDay()];
}

// Function to update the background based on weather
function updateBackground(code, isDay) {
    let timeOfDay = isDay ? "day" : "night";
    
    // Array of possible background images for each weather type
    const clearImages = [
        `./images/${timeOfDay}/clear.jpg`,
        `./images/${timeOfDay}/clear1.jpg`,
        `./images/${timeOfDay}/clear2.jpg`
   

    ];
    
    const cloudyImages = [
        `./images/${timeOfDay}/cloudy.jpg`,
        `./images/${timeOfDay}/cloudy1.jpg`,
        `./images/${timeOfDay}/cloudy2.jpg`
       

    ];
    const rainyImages = [
        `./images/${timeOfDay}/rainy.jpg`,
        `./images/${timeOfDay}/rainy1.jpg`,
        `./images/${timeOfDay}/rainy2.jpg`
   

    ];
    const snowyImages = [
        `./images/${timeOfDay}/snowy.jpg`,
        `./images/${timeOfDay}/snowy1.jpg`,
        `./images/${timeOfDay}/snowy2.jpg`
    

    ];
    
    // Function to randomly select an image from an array
    function getRandomImage(images) {
        return images[Math.floor(Math.random() * images.length)];
    }

    if (code === 1000) { // Clear
        app.style.backgroundImage = `url(${getRandomImage(clearImages)})`;
        document.querySelector('.submit').style.background = isDay ? "#e5ba92" : "#181e27";
    } else if ([1003, 1006, 1009, 1030, 1069, 1087, 1135, 1273, 1276, 1279, 1282].includes(code)) { // Cloudy
        app.style.backgroundImage = `url(${getRandomImage(cloudyImages)})`;
        document.querySelector('.submit').style.background = "#fa6d1b";
    } else if ([1063, 1069, 1072, 1150, 1153, 1180, 1183, 1186, 1189, 1192, 1195, 1204, 1207, 1240, 1243, 1246, 1249, 1252].includes(code)) { // Rainy
        app.style.backgroundImage = `url(${getRandomImage(rainyImages)})`;
        document.querySelector('.submit').style.background = isDay ? "#647d75" : "#325c80";
    } else { // Snowy
        app.style.backgroundImage = `url(${getRandomImage(snowyImages)})`;
        document.querySelector('.submit').style.background = "#4d72aa";
    }
}

// Function to fetch weather data
// Function to fetch weather data
function fetchWeatherData() {
    const apiKey = "6b805e9661444733b12192512240112";
    const currentUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${cityInput}`;
    const forecastUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${cityInput}&days=7`;

    fetch(currentUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error("City not found");
            }
            return response.json();
        })
        .then(data => {
            // Update weather details
            temp.innerHTML = data.current.temp_c + "&#176;";
            conditionOutput.innerHTML = data.current.condition.text;
            nameOutput.innerHTML = data.location.name;

            // Extract and format date and time
            const date = data.location.localtime;
            const y = parseInt(date.substr(0, 4));
            const m = parseInt(date.substr(5, 2));
            const d = parseInt(date.substr(8, 2));
            const time = date.substr(11);

            // Add country next to the time
            const country = data.location.country;
            dateOutput.innerHTML = `${dayOfTheWeek(d, m, y)} ${d}, ${m} ${y}`;
            timeOutput.innerHTML = `${time} | ${country}`; // Display country beside time

            // Update weather icon
            icon.src = `https:${data.current.condition.icon}`;

            // Update weather statistics
            cloudOutput.innerHTML = data.current.cloud + "%";
            humidityOutput.innerHTML = data.current.humidity + "%";
            windOutput.innerHTML = data.current.wind_kph + " km/h";

            // Update additional weather details
            document.querySelector('.pressure').innerHTML = data.current.pressure_mb + " mb";
            document.querySelector('.visibility').innerHTML = data.current.vis_km + " km";
            document.querySelector('.uv').innerHTML = data.current.uv;
            document.querySelector('.dew').innerHTML = data.current.dewpoint_c + "&#176;C";
            document.querySelector('.feels-like').innerHTML = data.current.feelslike_c + "&#176;C";

            // Update background
            updateBackground(data.current.condition.code, data.current.is_day);

            // Update map with city coordinates
            updateMap(data.location.lat, data.location.lon);

            app.style.opacity = "1";
            loading.style.display = "none"; // Hide loading icon
        })
        .catch(() => {
            app.style.opacity = "1";
            loading.style.display = "none"; // Hide loading if there's an error
        });

    fetch(forecastUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error("Forecast not found");
            }
            return response.json();
        })
        .then(data => {
            // Get the current date
            const currentDate = new Date();
            
            // Filter forecast data to include the next 7 days
            const upcomingForecast = data.forecast.forecastday.filter(day => {
                const forecastDate = new Date(day.date);
                return forecastDate > currentDate;
            });

            // If there are less than 7 days (which can happen if the API provides fewer days), ensure we fill the forecast list with upcoming days
            const allDays = [...upcomingForecast]; // Start with the upcoming days
            let additionalDaysNeeded = 7 - upcomingForecast.length;

            // Add remaining forecast days if available
            if (additionalDaysNeeded > 0) {
                const remainingDays = data.forecast.forecastday.slice(0, additionalDaysNeeded);
                allDays.push(...remainingDays);
            }

            // Update 3-day and 7-day forecasts with filtered data
            updateForecast(allDays.slice(0, 3), threeDayForecast); // Next 3 days
            updateForecast(allDays, sevenDayForecast); // All 7 days
        })
        .catch(() => {
            // If there's an error fetching the forecast, leave the interface unchanged
        });


    fetch(forecastUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error("Forecast not found");
            }
            return response.json();
        })
        .then(data => {
            // Get the current date
            const currentDate = new Date();
            
            // Filter forecast data to include the next 7 days
            const upcomingForecast = data.forecast.forecastday.filter(day => {
                const forecastDate = new Date(day.date);
                return forecastDate > currentDate;
            });

            // If there are less than 7 days (which can happen if the API provides fewer days), ensure we fill the forecast list with upcoming days
            const allDays = [...upcomingForecast]; // Start with the upcoming days
            let additionalDaysNeeded = 7 - upcomingForecast.length;

            // Add remaining forecast days if available
            if (additionalDaysNeeded > 0) {
                const remainingDays = data.forecast.forecastday.slice(0, additionalDaysNeeded);
                allDays.push(...remainingDays);
            }

            // Update 3-day and 7-day forecasts with filtered data
            updateForecast(allDays.slice(0, 3), threeDayForecast); // Next 3 days
            updateForecast(allDays, sevenDayForecast); // All 7 days
        })
        .catch(() => {
            // If there's an error fetching the forecast, leave the interface unchanged
        });


    fetch(forecastUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error("Forecast not found");
            }
            return response.json();
        })
        .then(data => {
            // Get the current date
            const currentDate = new Date();
            
            // Filter forecast data to include the next 7 days
            const upcomingForecast = data.forecast.forecastday.filter(day => {
                const forecastDate = new Date(day.date);
                return forecastDate > currentDate;
            });

            // If there are less than 7 days (which can happen if the API provides fewer days), ensure we fill the forecast list with upcoming days
            const allDays = [...upcomingForecast]; // Start with the upcoming days
            let additionalDaysNeeded = 7 - upcomingForecast.length;

            // Add remaining forecast days if available
            if (additionalDaysNeeded > 0) {
                const remainingDays = data.forecast.forecastday.slice(0, additionalDaysNeeded);
                allDays.push(...remainingDays);
            }

            // Update 3-day and 7-day forecasts with filtered data
            updateForecast(allDays.slice(0, 3), threeDayForecast); // Next 3 days
            updateForecast(allDays, sevenDayForecast); // All 7 days
        })
        .catch(() => {
            // If there's an error fetching the forecast, leave the interface unchanged
        });
}

// Function to update the forecast
function updateForecast(forecastDays, container) {
    container.innerHTML = ""; // Clear previous forecast
    forecastDays.forEach(day => {
        const date = new Date(day.date);
        const dayName = dayOfTheWeek(date.getDate(), date.getMonth() + 1, date.getFullYear());
        const conditionText = day.day.condition.text;  // Weather condition (e.g., "Sunny")
        const icon = day.day.condition.icon;
        const temp = `${day.day.maxtemp_c}&#176; / ${day.day.mintemp_c}&#176;`;

        container.innerHTML += `
            <li>
                <span>${dayName}, ${date.getDate()} ${date.toLocaleString('default', { month: 'long' })}</span>
                <span class="condition">${conditionText}</span> <!-- Added condition -->
                <img src="https:${icon}" alt="${conditionText}" />
                <span>${temp}</span>
            </li>
        `;
    });
}

// Function to initialize and update the map
function updateMap(lat, lon) {
    if (!map) {
        map = L.map(mapContainer).setView([lat, lon], 10); // Zoom level set to 10

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
    } else {
        map.setView([lat, lon], 10); // Pan and zoom to the new city
    }

    L.marker([lat, lon]).addTo(map)
        .bindPopup(`<b>${cityInput}</b>`)
        .openPopup();
}
document.getElementById('toggle-panel').addEventListener('click', () => {
    const weatherApp = document.querySelector('.weather-app');
    weatherApp.classList.toggle('full-view'); // Toggle the 'full-view' class
});

// Initial call to fetch weather data
fetchWeatherData();
