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

    // Isn't working due to CORS policy
    let dataSNOTEL = fetchClosestSNOTEL(
      filteredSkiAreas[i].Latitude,
      filteredSkiAreas[i].Longitude
    );

    let popupText = `<h4>${filteredSkiAreas[i].Name}</h4>`;
    // let popupText = `<h4>${filteredSkiAreas[i].Name}</h4>
    //   <p>Closest SNOTEL: ${dataSNOTEL.station_information.name}</p>
    //   <p>Elevation: ${dataSNOTEL.station_information.elevation}</p>
    //   <p>Distance: ${dataSNOTEL.distance}</p>
    //   <p>Data: ${dataSNOTEL.data[0]}</p>
    // `;

    marker.bindPopup(popupText);
  }
}

function fetchClosestSNOTEL(lat, lon) {
  let apiUrl = `http://api.powderlin.es/closest_stations?lat=${lat}&lng=${lon}&data=true&days=0&count=1`;

  var requestOptions = {
    method: "GET",
    redirect: "follow",
  };

  // Not working due to CORS policy
  fetch(apiUrl, requestOptions).then(function (response) {
    if (response.ok) {
      console.log(response);
      response
        .json()
        .then(function (data) {
          console.log(data);
          return data;
        })
        .catch((error) => console.log("error", error));
    }
  });

  //const response = await fetch(apiUrl, requestOptions);
  //const data = await response.json();
}

ddPass.addEventListener("change", function () {
  displayMarkers(ddPass.value);
});

function init() {
  initMap();
  displayMarkers("");
}
init();
