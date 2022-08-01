let skiAreaName = document.querySelector("#skiAreaName");
let staticMap = document.querySelector("#staticMap");
let drivingDirections = document.querySelector("#drivingDirections");
let txtStartAddress = document.querySelector("#txtStartAddress");
let txtStartDate = document.querySelector("#txtStartDate");
let txtStartTime = document.querySelector("#txtStartTime");
let btnUpdate = document.querySelector("#btnUpdate");
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
let lblDate = document.querySelector("#lblDate");
let lblSnowWaterEquivalent = document.querySelector("#lblSnowWaterEquivalent");
let lblChangeInSnowWaterEquivalent = document.querySelector(
  "#lblChangeInSnowWaterEquivalent"
);
let lblSnowDepth = document.querySelector("#lblSnowDepth");
let lblChangeInSnowDepth = document.querySelector("#lblChangeInSnowDepth");
let lblObservedAirTemperature = document.querySelector(
  "#lblObservedAirTemperature"
);

// This function is called on init and will pull the resort name from the QueryString
function getResortInfo() {
  if (document.location.search.length > 0) {
    // https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
    const queryString = new Proxy(new URLSearchParams(window.location.search), {
      get: (searchParams, prop) => searchParams.get(prop),
    });

    const skiArea = skiAreas.find(
      (element) => element.Name === queryString.resort
    );

    skiAreaName.textContent = ` - ${queryString.resort}`;

    displayStaticMap(skiArea);
    displayDrivingDirections(skiArea);
    displayWeatherForecast(skiArea);
    displaySnowConditions(skiArea);
  } else {
    document.location.replace("./index.html");
  }
}

function displayStaticMap(skiArea) {
  // MapQuest
  // let zoom = 14;
  // staticMap.src = `https://www.mapquestapi.com/staticmap/v5/map?key=${config.MAPQUEST_KEY}&center=${skiArea.Latitude},${skiArea.Longitude}&zoom=${zoom}`;
  // staticMap.alt = skiArea.Name;

  // Google Maps - Looks better since it'll show ski runs for the bigger ski areas
  let apiKey = config.GOOGLE_STATIC_MAPS_KEY;
  let lat = skiArea.Latitude;
  let lon = skiArea.Longitude;
  let zoom = 13;
  let size = "400x400";
  staticMap.src = `https://maps.googleapis.com/maps/api/staticmap?center=${lat}%2c%20${lon}&zoom=${zoom}&size=${size}&key=${apiKey}`;
  staticMap.alt = skiArea.Name;
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
  let apiUrl = `https://www.mapquestapi.com/directions/v2/route?key=${config.MAPQUEST_KEY}&from=${startCoordinates}&to=${endCoordinates}`;

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

  let apiUrl = `https://www.mapquestapi.com/geocoding/v1/address?key=${config.MAPQUEST_KEY}&location=${address}`;

  const response = await fetch(apiUrl, requestOptions);
  const data = await response.json();

  const coord = data.results[0].locations[0].latLng;
  return `${coord.lat},${coord.lng}`;
}

// This function is to display the weather data in the "weatherForecast" section
function displayWeatherForecast(skiArea) {}

function displaySnowConditions(skiArea) {
  var settings = {
    url: "http://api.powderlin.es/closest_stations",
    method: "GET",
    timeout: 0,
    jsonp: "callback",
    dataType: "jsonp",
    data: {
      lat: skiArea.Latitude,
      lng: skiArea.Longitude,
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
        if (dataSNOTEL.data.length > 0) {
          lblDate.textContent = `Date: ${dataSNOTEL.data[0]["Date"]}`;
          lblSnowWaterEquivalent.textContent = `Snow Water Equivalent (in): ${dataSNOTEL.data[0]["Snow Water Equivalent (in)"]}`;
          lblChangeInSnowWaterEquivalent.textContent = `Change In Snow Water Equivalent (in): ${dataSNOTEL.data[0]["Change In Snow Water Equivalent (in)"]}`;
          lblSnowDepth.textContent = `Snow Depth (in): ${dataSNOTEL.data[0]["Snow Depth (in)"]}`;
          lblChangeInSnowDepth.textContent = `Change In Snow Depth (in): ${dataSNOTEL.data[0]["Change In Snow Depth (in)"]}`;
          lblObservedAirTemperature.textContent = `Observed Air Temperature (degrees farenheit): ${dataSNOTEL.data[0]["Observed Air Temperature (degrees farenheit)"]}`;
        }
        // If the closest SNOTEL station does not have any data, go to the next one.  Powderhorn is this way.  Pulling 3 stations just in case.
      } while (dataSNOTEL.data.length === 0);
    })
    .fail()
    .always();
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

btnUpdate.addEventListener("click", function (event) {
  // https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
  const queryString = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  });

  const skiArea = skiAreas.find(
    (element) => element.Name === queryString.resort
  );

  displayDrivingDirections(skiArea);
});

function init() {
  // Load default values for Directions Start Controls
  txtStartDate.value = moment().add(1, "day").format("yyyy-MM-DD");

  if (localStorage.getItem("StartAddress")) {
    txtStartAddress.value = localStorage.getItem("StartAddress");
    getResortInfo();
  } else {
    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    };

    function success(pos) {
      txtStartAddress.value = `${pos.coords.latitude},${pos.coords.longitude}`;
      getResortInfo();
    }

    function error(err) {
      // On Error, just pick Denver, CO
      txtStartAddress.value = "39.74,-104.99";
      getResortInfo();
    }

    navigator.geolocation.getCurrentPosition(success, error, options);
  }
}
init();
