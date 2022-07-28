let searchForm = document.querySelector("#searchForm");
let searchTextElement = document.querySelector("#txtSearch");
let ddPass = document.querySelector("#ddPass");

let map;
var markers;

async function fetchCoodinates(cityName) {
  let apiKey = config.OPEN_WEATHER_KEY;
  let apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`;

  // Force it to wait for data to return before going on
  const response = await fetch(apiUrl);
  const data = await response.json();

  return [data.coord.lat, data.coord.lon];
}

// Function to remove all child nodes
function removeAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

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
}

function displayMarkers(pass) {
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
    marker.bindPopup(filteredSkiAreas[i].Name);
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
