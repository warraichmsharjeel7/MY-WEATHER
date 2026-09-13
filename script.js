const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");
const loading = document.getElementById("loading");

// OpenWeatherMap free icon mappings based on WMO weather codes
function getWeatherIcon(code) {
    if (code === 0) return "https://openweathermap.org/img/wn/01d@2x.png"; // Clear Sky
    if (code === 1 || code === 2) return "https://openweathermap.org/img/wn/02d@2x.png"; // Partly Cloudy
    if (code === 3) return "https://openweathermap.org/img/wn/04d@2x.png"; // Overcast
    if (code >= 45 && code <= 48) return "https://openweathermap.org/img/wn/50d@2x.png"; // Fog
    if (code >= 51 && code <= 55) return "https://openweathermap.org/img/wn/09d@2x.png"; // Drizzle
    if (code >= 61 && code <= 67) return "https://openweathermap.org/img/wn/10d@2x.png"; // Rain
    if (code >= 71 && code <= 77) return "https://openweathermap.org/img/wn/13d@2x.png"; // Snow
    if (code >= 80 && code <= 82) return "https://openweathermap.org/img/wn/09d@2x.png"; // Rain Showers
    if (code >= 95 && code <= 99) return "https://openweathermap.org/img/wn/11d@2x.png"; // Thunderstorm
    return "https://openweathermap.org/img/wn/01d@2x.png";
}

// Weather descriptions mapping
const weatherDescriptions = {
    0: "Clear Sky", 1: "Mainly Clear", 2: "Partly Cloudy", 3: "Overcast",
    45: "Foggy", 48: "Depositing Rime Fog", 51: "Light Drizzle", 53: "Moderate Drizzle",
    61: "Slight Rain", 63: "Moderate Rain", 65: "Heavy Rain",
    80: "Rain Showers", 95: "Thunderstorm"
};

// Auto load Karachi on launch
window.addEventListener("load", () => {
    getWeather("Karachi");
});

searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if (city !== "") {
        getWeather(city);
    } else {
        alert("Kripya kisi city ka naam likhein!");
    }
});

cityInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
        searchBtn.click();
    }
});

async function getWeather(city) {
    loading.classList.remove("hidden");

    try {
        // Step 1: Geocoding API to get Lat & Lon
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
        const geoRes = await fetch(geoUrl);
        const geoData = await geoRes.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City nahi mili! Kripya sahi naam likhein.");
        }

        const location = geoData.results[0];
        const lat = location.latitude;
        const lon = location.longitude;

        // Step 2: Weather API fetch
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m`;
        const weatherRes = await fetch(weatherUrl);
        const weatherData = await weatherRes.json();

        const current = weatherData.current;

        // Step 3: Update UI Elements
        document.getElementById("cityName").innerText = location.name;
        document.getElementById("country").innerText = location.country || "";
        document.getElementById("temperature").innerText = `${Math.round(current.temperature_2m)}°C`;
        document.getElementById("description").innerText = weatherDescriptions[current.weather_code] || "Sunny";
        document.getElementById("humidity").innerText = `${current.relative_humidity_2m}%`;
        document.getElementById("wind").innerText = `${current.wind_speed_10m} km/h`;
        document.getElementById("feelsLike").innerText = `${Math.round(current.apparent_temperature)}°C`;
        
        // Update Dynamic Weather Icon
        document.getElementById("weatherIcon").src = getWeatherIcon(current.weather_code);

    } catch (error) {
        alert(error.message);
    } finally {
        loading.classList.add("hidden");
    }
}