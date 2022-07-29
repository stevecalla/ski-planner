let searchForm = document.querySelector("#searchForm");
let searchTextElement = document.querySelector("#txtSearch");
let ddPass = document.querySelector("#ddPass");

let map;
var markers;

//https://stackoverflow.com/questions/4878756/how-to-capitalize-first-letter-of-each-word-like-a-2-word-city
function toTitleCase(str) {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

function initMap() {
  let lat = "39.00";
  let lon = "-106.302";
  let view = 8;
  map = L.map("map").setView([lat, lon], view);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap",
  }).addTo(map);

  markers = L.layerGroup().addTo(map);

  async function onMapClick(e) {
    let weatherData = await fetchWeatherData(e.latlng.lat, e.latlng.lng);

    let popupText = `<h4>${e.latlng}</h4>
      <img src="https://openweathermap.org/img/wn/${weatherData.current.weather[0].icon}.png" />
      <p>Weather: ${weatherData.current.weather[0].main}<br />
      Temperature: ${weatherData.current.temp} \xB0F<br />
      Wind Speed: ${weatherData.current.wind_speed} MPH<br />
      Humidity: ${weatherData.current.humidity}%</p>
    `;

    L.popup().setLatLng(e.latlng).setContent(popupText).openOn(map);
  }
  map.addEventListener("click", onMapClick);
}

async function displayMarkers(pass) {
  let filteredSkiAreas = skiAreas;
  if (pass) {
    filteredSkiAreas = skiAreas.filter(function (skiArea) {
      return skiArea.Pass === pass;
    });
  }

  // remove all the markers
  markers.clearLayers();

  for (let i = 0; i < filteredSkiAreas.length; i++) {
    var marker = L.marker([
      filteredSkiAreas[i].Latitude,
      filteredSkiAreas[i].Longitude,
    ]).addTo(markers);

    async function markerClick() {
      let weatherData = await fetchWeatherData(
        filteredSkiAreas[i].Latitude,
        filteredSkiAreas[i].Longitude
      );

      let popupText = `<h4>${filteredSkiAreas[i].Name}</h4>
        <img src="https://openweathermap.org/img/wn/${weatherData.current.weather[0].icon}.png" />
        <p>Weather: ${weatherData.current.weather[0].main}<br />
        Temperature: ${weatherData.current.temp} \xB0F<br />
        Wind Speed: ${weatherData.current.wind_speed} MPH<br />
        Humidity: ${weatherData.current.humidity}%</p>
      `;

      L.popup()
        .setLatLng({
          lat: filteredSkiAreas[i].Latitude,
          lng: filteredSkiAreas[i].Longitude,
        })
        .setContent(popupText)
        .openOn(map);
    }
    marker.addEventListener("click", markerClick);
  }
}

async function fetchWeatherData(lat, lon) {
  //https://api.openweathermap.org/data/2.5/onecall?lat=33.44&lon=-94.04&exclude=minutely,hourly,alerts&appid={apiKey}
  let apiKey = config.OPEN_WEATHER_KEY;
  let lang = "en";
  let units = "imperial";
  let exclude = "minutely,hourly,alerts";
  let apiUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}&lang=${lang}&exclude=${exclude}`;

  // Force it to wait for data to return before going on
  const response = await fetch(apiUrl);
  const data = await response.json();

  return data;
}

// Function to remove all child nodes
function removeAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

ddPass.addEventListener("change", function () {
  displayMarkers(ddPass.value);
});

function init() {
  initMap();
  displayMarkers("");
}
init();
