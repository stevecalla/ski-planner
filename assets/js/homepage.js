let searchForm = document.querySelector("#searchForm");
let ddPass = document.querySelector("#ddPass");
let drivingDirections = document.querySelector("#drivingDirections");
let txtStartAddress = document.querySelector("#txtStartAddress");
let txtStartDate = document.querySelector("#txtStartDate");
let txtStartTime = document.querySelector("#txtStartTime");
let tblDirections = document.querySelector("#tblDirections");
let gmDirections = document.querySelector("#gmDirections");
let tdTotalDistance = document.querySelector("#tdTotalDistance");
let tdTotalTime = document.querySelector("#tdTotalTime");
let tdArrivalTime = document.querySelector("#tdArrivalTime");
let weatherForecast = document.querySelector("#weatherForecast");
let snowConditions = document.querySelector("#snowConditions");
let lblStationName = document.querySelector("#lblStationName");
let lblElevation = document.querySelector("#lblElevation");
let lblDistance = document.querySelector("#lblDistance");
let lblData = document.querySelector("#lblData");

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

  displayDrivingDirections(skiArea);
  displayWeatherForecast(skiArea);
  displaySnowConditions(skiArea);

  drivingDirections.classList.remove("is-invisible");
  weatherForecast.classList.remove("is-invisible");
  snowConditions.classList.remove("is-invisible");
}

async function displayDrivingDirections(skiArea) {
  startCoordinates = txtStartAddress.value;
  if (!isLatLong(startCoordinates)) {
    startCoordinates = await fetchCoordinatesFromAddress(txtStartAddress.value);
  }

  let endCoordinates = `${skiArea.Latitude},${skiArea.Longitude}`;
  let directions = await fetchDirections(startCoordinates, endCoordinates);

  removeAllChildNodes(tblDirections);

  // Last element is the totals
  for (let i = 0; i < directions.length - 1; i++) {
    let tr = document.createElement("tr");

    // Step #
    let td = document.createElement("td");
    td.textContent = i + 1;
    tr.appendChild(td);

    // Narrative
    td = document.createElement("td");
    td.textContent = directions[i].narrative;
    tr.appendChild(td);

    // Distance
    td = document.createElement("td");
    td.textContent = `${directions[i].distance.toFixed(2)} miles`;
    tr.appendChild(td);

    // Latitude
    // td = document.createElement("td");
    // td.textContent = directions[i].latitude;
    // tr.appendChild(td);

    // Longitude
    // td = document.createElement("td");
    // td.textContent = directions[i].longitude;
    // tr.appendChild(td);

    // Time
    // td = document.createElement("td");
    // td.textContent = directions[i].time;
    // tr.appendChild(td);

    // formattedTime
    td = document.createElement("td");
    td.textContent = directions[i].formattedTime;
    tr.appendChild(td);

    // Map
    if (directions[i].mapUrl) {
      td = document.createElement("td");
      let img = document.createElement("img");
      img.src = directions[i].mapUrl;
      img.alt = "Map";
      td.appendChild(img);
      tr.appendChild(td);
    }

    tblDirections.appendChild(tr);
  }

  tdTotalDistance.textContent = `${directions[
    directions.length - 1
  ].distance.toFixed(1)} miles`;
  tdTotalTime.textContent = directions[directions.length - 1].formattedTime; // .time is in seconds
  tdTotalTime.dataset.time = directions[directions.length - 1].time;
  gmDirections.href = `https://www.google.com/maps/dir/${startCoordinates}/${endCoordinates}`;

  let startTime = moment(
    `${txtStartDate.value} ${txtStartTime.value}`,
    "YYYY-MM-DD hh:mm"
  );
  let endTime = startTime.add(directions[directions.length - 1].time, "s");
  tdArrivalTime.textContent = `Arrival Time: ${endTime.format("h:mm:ss A")}`;
}

async function fetchDirections(startCoordinates, endCoordinates) {
  var myHeaders = new Headers();
  myHeaders.append(
    "Cookie",
    "JSESSIONID=F03321F222C277ED923D3B8EF447698D; JSESSIONID=885FD8B936A29FF149EE75F9D0C469D8"
  );

  var requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  //http://www.mapquestapi.com/directions/v2/route?key=onM30fdvaziP9ykjaYeleR5hvIhOmLm1&from=39.633077,-105.1388028&to=39.68,-105.897
  let apiUrl = `http://www.mapquestapi.com/directions/v2/route?key=${config.MAPQUEST_KEY}&from=${startCoordinates}&to=${endCoordinates}`;

  const response = await fetch(apiUrl, requestOptions);
  const data = await response.json();

  const maneuvers = data.route.legs[0].maneuvers;
  const directions = [];
  for (let i = 0; i < maneuvers.length; i++) {
    let step = {
      distance: maneuvers[i].distance,
      narrative: maneuvers[i].narrative,
      latitude: maneuvers[i].startPoint.lat,
      longitude: maneuvers[i].startPoint.lng,
      time: maneuvers[i].time,
      formattedTime: maneuvers[i].formattedTime,
      mapUrl: maneuvers[i].mapUrl,
    };
    directions.push(step);
  }

  let totals = {
    distance: data.route.distance,
    time: data.route.legs[0].time,
    formattedTime: data.route.legs[0].formattedTime,
  };
  directions.push(totals);

  return directions;
}

async function fetchCoordinatesFromAddress(address) {
  var myHeaders = new Headers();
  myHeaders.append("Cookie", "JSESSIONID=F2079DB8A9017A9DEF9E1957C80C1A06");

  var requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  let apiUrl = `http://www.mapquestapi.com/geocoding/v1/address?key=${config.MAPQUEST_KEY}&location=${address}`;

  const response = await fetch(apiUrl, requestOptions);
  const data = await response.json();

  const coord = data.results[0].locations[0].latLng;
  return `${coord.lat},${coord.lng}`;
}

// This function is to display the weather data in the "weatherForecast" section
function displayWeatherForecast(skiArea) {}

function displaySnowConditions(skiArea) {
  fetchSnowConditions(skiArea.Latitude, skiArea.Longitude);
}

function fetchSnowConditions(lat, lon) {
  var settings = {
    url: "http://api.powderlin.es/closest_stations",
    method: "GET",
    timeout: 0,
    jsonp: "callback",
    dataType: "jsonp",
    data: {
      lat: lat,
      lng: lon,
      data: true,
      days: 0,
      count: 3,
    },
  };

  let dataSNOTEL;

  $.ajax(settings)
    .done(function (response) {
      let i = 0;
      do {
        dataSNOTEL = response[i++];
        lblStationName.textContent = `Closest SNOTEL: ${dataSNOTEL.station_information.name}`;
        lblElevation.textContent = `Elevation: ${dataSNOTEL.station_information.elevation} ft`;
        lblDistance.textContent = `Distance Away: ${dataSNOTEL.distance.toFixed(
          2
        )} miles`;
        lblData.textContent = "";
        if (dataSNOTEL.data.length > 0) {
          for (dataProperty in dataSNOTEL.data[0]) {
            lblData.innerHTML += `${dataProperty}: ${dataSNOTEL.data[0][dataProperty]}<br />`;
          }
          // If the closest SNOTEL station does not have any data, go to the next one.  Powderhorn is this way.  Pulling 3 stations just in case.
        }
      } while (dataSNOTEL.data.length === 0);
    })
    .fail()
    .always();
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

function getDefaultStartValue() {
  if (localStorage.getItem("StartAddress")) {
    return localStorage.getItem("StartAddress");
  } else {
    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    };

    function success(pos) {
      txtStartAddress.value = `${pos.coords.latitude},${pos.coords.longitude}`;
    }

    function error(err) {}

    navigator.geolocation.getCurrentPosition(success, error, options);
  }
}

ddPass.addEventListener("change", function () {
  displayMarkers(ddPass.value);
});

txtStartTime.addEventListener("change", function (event) {
  let startTime = moment(
    `${txtStartDate.value} ${txtStartTime.value}`,
    "YYYY-MM-DD hh:mm"
  );
  let endTime = startTime.add(tdTotalTime.dataset.time, "s");
  tdArrivalTime.textContent = `Arrival Time: ${endTime.format("h:mm:ss A")}`;
});

function init() {
  initMap();
  displayMarkers("");

  // Load default values for Directions Start Controls
  txtStartDate.value = moment().add(1, "day").format("yyyy-MM-DD");
  getDefaultStartValue();
}
init();
