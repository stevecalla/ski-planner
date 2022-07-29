let searchForm = document.querySelector("#searchForm");
let ddPass = document.querySelector("#ddPass");

let map;
var markers;

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

// This function is called when the Details button is clicked in the resort popup
// Use this function to pass the ski area name to other parts of the app
function getResortInfo(event) {
  event.preventDefault();

  const skiArea = skiAreas.find(
    (element) => element.Name === event.target.dataset.skiarea
  );

  alert(
    `${skiArea.Name}\n${skiArea.Pass}\n${skiArea.Latitude}\n${skiArea.Longitude}`
  );
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
        <button id="btnDetails" type="button" class="resortInfo" data-skiarea="${filteredSkiAreas[i].Name}">Details</a>
      `;

      L.popup()
        .setLatLng({
          lat: filteredSkiAreas[i].Latitude,
          lng: filteredSkiAreas[i].Longitude,
        })
        .setContent(popupText)
        .openOn(map);

      const btnDetails = document.querySelector("#btnDetails");
      btnDetails.addEventListener("click", getResortInfo);
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
