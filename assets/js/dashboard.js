//section:query selector variables go here 👇
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
let lblSnowDepth = document.querySelector("#lblSnowDepth");
let lblChangeInSnowDepth = document.querySelector("#lblChangeInSnowDepth");
let powMeterImage = document.querySelector("#powMeterImage");
let profileModalDesktopButton = document.getElementById(
  "profile-button-desktop"
);
let profileModalMobileButton = document.getElementById("profile-button-mobile");

//section:global variables go here 👇

//section:event listeners go here 👇
profileModalDesktopButton.addEventListener("click", renderProfileModal);
profileModalMobileButton.addEventListener("click", renderProfileModal);
// SEE UTILS.JS FOR THE FUNCTIONS TO FETCH AND RENDER AUTOCOMPLETE
txtStartAddress.addEventListener("input", () =>
  fetchMapquestCreateAutoComplete(txtStartAddress)
); //todo:make live

// This event handler updates the page based on the start location, date, & time fields
btnUpdate.addEventListener("click", function (event) {
  event.preventDefault();

  const skiArea = getCurrentSkiArea();

  displayDrivingDirections(skiArea);

  renderDailyHourlyWeatherData("daily"); // loads weather data upon page load -- function is is weather.js
});

// This function reads the querystring and returns the appropriate skiArea object
function getCurrentSkiArea() {
  // https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
  const queryString = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  });

  // Theoretically, this should never execute
  if (!queryString.resort) {
    launchValidationModal(
      "Querystring Error",
      "Please Select a Ski Area",
      "getCurrentSkiArea"
    );
  }

  const skiArea = skiAreas.find(
    (element) =>
      element.name.trim().toLowerCase() ===
      queryString.resort.trim().toLowerCase()
  );

  return skiArea;
}

//section:functions and event handlers go here 👇
// This function is called on init and will pull the resort name from the QueryString
function getResortInfo() {
  if (document.location.search.length > 0) {
    const skiArea = getCurrentSkiArea();

    skiAreaName.textContent = skiArea.name;

    try {
      displayStaticMap(skiArea);
      //throw "Static Map Error";
    } catch (error) {
      launchValidationModal("Static Map Error", error, "staticmap-wrapper");
    }

    try {
      displayDrivingDirections(skiArea);
      //throw "Driving Directions Error";
    } catch (error) {
      launchValidationModal(
        "Driving Directions Error",
        error,
        "directions-wrapper"
      );
    }

    // displayWeatherForecast(skiArea);

    try {
      displaySnowConditions(skiArea);
      //throw "POW Meter Error";  // testing purposes
    } catch (error) {
      launchValidationModal("POW Meter Error", error, "powmeter-wrapper");
    }
  } else {
    document.location.replace("./index.html");
  }
}

// This function displays a static map of the Ski Area
function displayStaticMap(skiArea) {
  // MapQuest
  // let zoom = 14;
  // staticMap.src = `https://www.mapquestapi.com/staticmap/v5/map?key=${config.MAPQUEST_KEY}&center=${skiArea.latitude},${skiArea.longitude}&zoom=${zoom}`;
  // staticMap.alt = skiArea.name;

  // Google Maps - Looks better since it'll show ski runs for the bigger ski areas
  let apiKey = config.GOOGLE_STATIC_MAPS_KEY;
  let lat = skiArea.latitude;
  let lon = skiArea.longitude;
  let zoom = 13;
  let size = "1000x1000";
  staticMap.src = `https://maps.googleapis.com/maps/api/staticmap?center=${lat}%2c%20${lon}&zoom=${zoom}&size=${size}&key=${apiKey}`;
  staticMap.alt = skiArea.name;
}

// This function displays the driving directions from the user's start location to the Ski Area
async function displayDrivingDirections(skiArea) {
  let startCoordinates = txtStartAddress.value;
  let userCurrentPosition = {
    address: "Denver, CO",
    coordinates: "39.74,-104.99",
  }; // Default to Denver, CO

  if (localStorage.getItem("userCurrentPosition")) {
    userCurrentPosition = JSON.parse(
      localStorage.getItem("userCurrentPosition")
    );
  }

  if (
    txtStartAddress.value.trim().toLowerCase() ===
    userCurrentPosition.address.trim().toLowerCase()
  ) {
    // If the Start Address is the same as what's in local storage, don't have to fetch the coordinates.
    startCoordinates = userCurrentPosition.coordinates;
  } else if (!isLatLong(startCoordinates)) {
    // If the textbox and localstorage is different, we do have to fetch the coordinates
    startCoordinates = await fetchCoordinatesFromAddress(txtStartAddress.value);
  }
  // Else, the text box should have Lat/Long in it

  let endCoordinates = `${skiArea.latitude},${skiArea.longitude}`;
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

    // The below 3 sections that are commented out are for potential future development: syncing weather during driving

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

    // Distance
    td = document.createElement("td");
    td.textContent = `${directions[i].distance.toFixed(2)} miles`;
    tr.appendChild(td);

    // If testing, comment out the below Map section

    // Map
    // if (directions[i].mapUrl) {
    //   td = document.createElement("td");
    //   let img = document.createElement("img");
    //   img.src = directions[i].mapUrl.replace("http://", "https://");
    //   img.alt = "Map";
    //   td.appendChild(img);
    //   tr.appendChild(td);
    // }

    tblDirections.appendChild(tr);
  }

  tdTotalDistance.textContent = `${directions[
    directions.length - 1
  ].distance.toFixed(1)} miles`;
  tdTotalTime.textContent = directions[directions.length - 1].formattedTime;
  tdTotalTime.dataset.time = directions[directions.length - 1].time; // .time is in seconds
  gmDirections.href = `https://www.google.com/maps/dir/${startCoordinates}/${endCoordinates}`;

  let startTime = moment(
    `${txtStartDate.value} ${txtStartTime.value}`,
    "YYYY-MM-DD hh:mm"
  );
  let endTime = startTime.add(directions[directions.length - 1].time, "s");
  tdArrivalTime.textContent = `Arrival Time: ${endTime.format("h:mm:ss A")}`;
}

// This function fetches directions from a start lat/long to an end lat/long
async function fetchDirections(startCoordinates, endCoordinates) {
  var requestOptions = {
    method: "GET",
    redirect: "follow",
  };

  // http://www.mapquestapi.com/directions/v2/route?key=onM30fdvaziP9ykjaYeleR5hvIhOmLm1&from=39.74,-104.99&to=39.68,-105.897
  let apiUrl = `https://www.mapquestapi.com/directions/v2/route?key=${config.MAPQUEST_KEY}&from=${startCoordinates}&to=${endCoordinates}`;

  // const response = await fetch(apiUrl, requestOptions);
  // const data = await response.json();
  const data = testDirections; // For testing, comment out the previous 2 lines

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

// This function fetches latitude & longitude coordinates from a mailing address
async function fetchCoordinatesFromAddress(address) {
  var requestOptions = {
    method: "GET",
    redirect: "follow",
  };

  let apiUrl = `https://www.mapquestapi.com/geocoding/v1/address?key=${config.MAPQUEST_KEY}&location=${address}`;

  const response = await fetch(apiUrl, requestOptions);
  const data = await response.json();

  const coord = data.results[0].locations[0].latLng;
  return `${coord.lat},${coord.lng}`;
}

// This function fetches and displays SNOTEL info
function displaySnowConditions(skiArea) {
  // http://api.powderlin.es/closest_stations
  // https://dqmoczhn0pnkc.cloudfront.net/closest_stations

  var settings = {
    url: "https://dqmoczhn0pnkc.cloudfront.net/closest_stations",
    method: "GET",
    timeout: 0,
    jsonp: "callback",
    dataType: "jsonp",
    data: {
      lat: skiArea.latitude,
      lng: skiArea.longitude,
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
        if (dataSNOTEL.data.length > 0) {
          // Data is:
          // `Closest SNOTEL: ${dataSNOTEL.station_information.name}`
          // `Elevation: ${dataSNOTEL.station_information.elevation} ft`
          // `Distance Away: ${dataSNOTEL.distance.toFixed(2)} miles`
          // `Date: ${dataSNOTEL.data[0]["Date"]}`
          // `Snow Water Equivalent (in): ${dataSNOTEL.data[0]["Snow Water Equivalent (in)"]}`
          // `Change In Snow Water Equivalent (in): ${dataSNOTEL.data[0]["Change In Snow Water Equivalent (in)"]}`
          // `Snow Depth (in): ${dataSNOTEL.data[0]["Snow Depth (in)"]}`
          // `Change In Snow Depth (in): ${dataSNOTEL.data[0]["Change In Snow Depth (in)"]}`
          // `Observed Air Temperature (degrees farenheit): ${dataSNOTEL.data[0]["Observed Air Temperature (degrees farenheit)"]}`

          lblSnowDepth.textContent = `Snow Depth (in): ${dataSNOTEL.data[0]["Snow Depth (in)"]}`;
          lblChangeInSnowDepth.textContent = `Change In Snow Depth (in): ${dataSNOTEL.data[0]["Change In Snow Depth (in)"]}`;

          // console.log(`${dataSNOTEL.data[0]["Change In Snow Depth (in)"]}`);
        }
        if (`${dataSNOTEL.data[0]["Change In Snow Depth (in)"]}` >= 6) {
          powMeterImage.src = "./assets/images/rad.png";
        } else if (
          `${dataSNOTEL.data[0]["Change In Snow Depth (in)"]}` >= 1 &&
          `${dataSNOTEL.data[0]["Change In Snow Depth (in)"]}` < 6
        ) {
          powMeterImage.src = "./assets/images/good.png";
        } else powMeterImage.src = "./assets/images/bad.png";
        // If the closest SNOTEL station does not have any data, go to the next one.  Powderhorn is this way.  Pulling 3 stations just in case.
      } while (dataSNOTEL.data.length === 0);
    })
    .fail()
    .always();
}

function init() {
  if (!document.location.search) {
    document.location.href = "./index.html";
  }

  // Set the return location for the Profile Page
  sessionStorage.setItem("returnPage", document.location.href);

  // Load default values for Directions Start Controls
  txtStartDate.value = moment().add(1, "day").format("yyyy-MM-DD");

  renderDailyHourlyWeatherData("daily"); // loads weather data upon page load -- function is is weather.js

  // Get user's current location or preferred start location, then start loading the resort info
  let skiProfile = JSON.parse(localStorage.getItem("ski-profile"));

  if (skiProfile && skiProfile.address) {
    // Pull the current position from the profile
    txtStartAddress.value = skiProfile.address;
    getResortInfo();
  } else if (localStorage.getItem("userCurrentPosition")) {
    // If they don't have a profile and have already used navigator to get the user's current position, don't ask again.

    let userCurrentPosition = JSON.parse(
      localStorage.getItem("userCurrentPosition")
    );

    txtStartAddress.value = userCurrentPosition.address;
    txtStartAddress.setAttribute("placeholder", userCurrentPosition.address);
    txtStartAddress.focus();

    getResortInfo();
  } else {
    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    };

    function success(pos) {
      let address = `${pos.coords.latitude},${pos.coords.longitude}`; //Deault address to the coordinates
      let apiUrl = `https://www.mapquestapi.com/geocoding/v1/reverse?key=${config.MAPQUEST_KEY}&location=${address}`;

      fetch(apiUrl)
        .then(function (response) {
          if (response.ok) {
            response.json().then(function (data) {
              let location = data.results[0].locations[0];
              // Build the address starting at the state, then city, then street address
              if (location.adminArea3) {
                address = location.adminArea3; // State

                if (location.adminArea5) {
                  address = location.adminArea5 + ", " + address; // City

                  if (location.street) {
                    address = location.street + ", " + address; // Street
                  }
                }
              }

              let jUserCurrentPosition = {
                address: address,
                coordinates: `${pos.coords.latitude},${pos.coords.longitude}`,
              };

              txtStartAddress.value = address;
              // Save the current position to localStorage
              localStorage.setItem(
                "userCurrentPosition",
                JSON.stringify(jUserCurrentPosition)
              );
            });
          } else {
            launchValidationModal(
              "Reverse Geolocation Error",
              "Error: " + response.statusText
            );
          }
        })
        .catch(function (error) {
          launchValidationModal("Reverse Geolocation Error", "Error: " + error);
        });

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

$(document).ready(function () {
  $(this).scrollTop(0);
});

init();
