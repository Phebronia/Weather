let humidity = document.getElementById("humidity");
let temperature = document.getElementById("temperature")
let feelsLike = document.getElementById("feels-like")
let windSpeed = document.getElementById("wind-speed")
let visibility = document.getElementById("visibility")
let pressure = document.getElementById("pressure")
let uvIndex = document.getElementById("uv-index")
let uvLevel = document.getElementById("uv-level");

let searchForm = document.getElementById("search-form")
let cityInput = document.getElementById("city-input")
let errorMessage = document.getElementById("error-message");

let cityNameElement = document.getElementById("city-name");
let countryNameElement = document.getElementById("country-name");
let weatherDescription = document.getElementById("weather-description")

let forecastCard = document.querySelectorAll(".forecast-card")
let currentDate = document.getElementById("current-date");
 currentDate.textContent = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric"
    });


async function getWeather(latitude, longitude) {
  try{ let response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,visibility,pressure_msl,uv_index,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&forecast_days=6`);
  if (response.ok === false) throw new Error("Failed to fetch weather data");
    
  let data = await response.json();

  errorMessage.textContent = ""
  humidity.textContent = data.current.relative_humidity_2m + "%";
  temperature.textContent = data.current.temperature_2m;
  feelsLike.textContent = data.current.apparent_temperature + "°C";
  windSpeed.textContent = data.current.wind_speed_10m+ " km/h";
  visibility.textContent = data.current.visibility / 1000 + " km";
  pressure.textContent = data.current.pressure_msl +" hPa";

  let uvValue = data.current.uv_index;
  uvIndex.textContent = uvValue;
  if (uvValue < 3) {
    uvLevel.textContent = "Low";
  } else if (uvValue < 6) {
    uvLevel.textContent = "Moderate";
  } else if (uvValue < 8) {
    uvLevel.textContent = "High";
  } else if (uvValue < 11) {
    uvLevel.textContent = "Very High";
  } else {
    uvLevel.textContent = "Extreme";
  }

  let weatherCode = data.current.weather_code;
  switch (weatherCode) {
    case 0:
      weatherDescription.textContent = "Clear sky"
      break;

    case 1:
      weatherDescription.textContent = "Mainly clear"
      break;

    case 2:
      weatherDescription.textContent = "Partly cloudy"
      break;
    
    case 45:
    case 48:
      weatherDescription.textContent = "Fog";
      break;

    default:
      weatherDescription.textContent = "Unknown weather"
  }

  forecastCard.forEach((card,index) => {
    let forecastIndex = index + 1;
    let forecastDay = card.querySelector(".forecast-day");
    let forecastDates = card.querySelector(".forecast-date");
    let forecastIcons = card.querySelector(".forecast-icon");
    let forecastConditions = card.querySelector(".forecast-condition");
    let forecastTemp = card.querySelector(".forecast-temp")

    let maxTemp = data.daily.temperature_2m_max[forecastIndex];
    let minTemp = data.daily.temperature_2m_min[forecastIndex]
    let maxT = card.querySelector("strong")
    let minT = card.querySelector(".forecast-temp span")
    maxT.textContent = maxTemp + " °"
    minT.textContent = minTemp + " °"

    let dateString = data.daily.time[forecastIndex];
    let [year, month, day] = dateString.split("-").map(Number);
    let datee = new Date(year, month - 1, day);
    let dayName = datee.toLocaleDateString("en-US", { weekday: "long" });
   

    forecastDates.textContent = datee.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric"
    });
    forecastDay.textContent = dayName;
    let weatherCode = data.daily.weather_code[forecastIndex];
    switch (weatherCode) {
    case 0:
      forecastConditions.textContent = "Clear sky";
      forecastIcons.textContent = "☀️";
      break;

    case 1:
      forecastConditions.textContent = "Mainly clear";
      forecastIcons.textContent = "🌤️";
      break;

    case 2:
      forecastConditions.textContent = "Partly cloudy";
      forecastIcons.textContent = "⛅";
      break;

    case 45:
    case 48:
      forecastConditions.textContent = "Fog";
      forecastIcons.textContent = "🌫️";
      break;

    default:
      forecastConditions.textContent = "Cloudy";
      forecastIcons.textContent = "☁️";
    }
  });

  } catch (error) {
    errorMessage.textContent = error.message
  }
}


searchForm.addEventListener("submit", (event) => {
  event.preventDefault()
  geGeo(cityInput.value)
})


async function geGeo (cityName) {
  cityName = cityName.trim();
  try{  let geourl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`
  errorMessage.textContent = ""   
  if (cityName === "")  return errorMessage.textContent = "Please enter a city name";

  let response = await fetch (geourl)
  if (response.ok === false) throw new Error("Failed to fetch geographic data");
  
  let data = await response.json()
  if (!data.results || data.results.length === 0) {
    cityInput.value = "";
    throw new Error("City not found");
  }
  let latitude = data.results[0].latitude
  let longitude = data.results[0].longitude
  cityNameElement.textContent = data.results[0].name
  countryNameElement.textContent = data.results[0].country

  localStorage.setItem("lastCity", cityName);
  
  await getWeather(latitude,longitude)
  
  }catch (error) {
    errorMessage.textContent = error.message
  }

}


let lastCity = localStorage.getItem("lastCity");
if (lastCity){
  cityInput.value = lastCity
  geGeo(lastCity)
}
