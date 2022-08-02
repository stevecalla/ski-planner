//section:query selector variables go here 👇
let searchForm = document.querySelector("#searchForm");
let ddPass = document.querySelector("#ddPass");
let modalProfileFromHomePage = document.getElementById('modal-profile-homepage-button');

//section:global variables go here 👇
let map;
var markers;

//section:event listeners go here 👇
modalProfileFromHomePage.addEventListener('click', renderProfileModal);

//section:functions and event handlers go here 👇
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
}

async function displayMarkers(pass) {
  let filteredSkiAreas = skiAreas;
  if (pass) {
    filteredSkiAreas = skiAreas.filter(function (skiArea) {
      return skiArea.Pass.trim().toLowerCase() === pass.trim().toLowerCase();
    });
  }

  // remove all the markers
  markers.clearLayers();

  const ResortIcon = L.Icon.extend({
    options: {
      shadowUrl: "./assets/images/msmarker.shadow.png",
      iconSize: [32, 32],
      shadowSize: [59, 32],
      iconAnchor: [0, 0],
      shadowAnchor: [0, 0],
      popupAnchor: [0, 0],
    },
  });
  const greenIcon = new ResortIcon({
    iconUrl: "./assets/images/green-dot.png",
  });
  const redIcon = new ResortIcon({ iconUrl: "./assets/images/red-dot.png" });
  const orangeIcon = new ResortIcon({
    iconUrl: "./assets/images/orange-dot.png",
  });
  const blueIcon = new ResortIcon({
    iconUrl: "./assets/images/blue-dot.png",
  });
  const yellowIcon = new ResortIcon({
    iconUrl: "./assets/images/yellow-dot.png",
  });
  const pinkIcon = new ResortIcon({
    iconUrl: "./assets/images/pink-dot.png",
  });
  const purpleIcon = new ResortIcon({
    iconUrl: "./assets/images/purple-dot.png",
  });

  for (let i = 0; i < filteredSkiAreas.length; i++) {
    let passIcon = blueIcon;
    if (filteredSkiAreas[i].Pass.trim().toLowerCase() === "epic") {
      passIcon = yellowIcon;
    } else if (filteredSkiAreas[i].Pass.trim().toLowerCase() === "ikon") {
      passIcon = redIcon;
    }

    var marker = L.marker(
      [filteredSkiAreas[i].Latitude, filteredSkiAreas[i].Longitude],
      { icon: passIcon }
    ).addTo(markers);

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
        <a class="button is-small is-info is-light" href="./dashboard.html?resort=${filteredSkiAreas[i].Name}">Details ➡️</a>
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

ddPass.addEventListener("change", function () {
  displayMarkers(ddPass.value);
});

function init() {
  initMap();
  displayMarkers("");
}
init();
