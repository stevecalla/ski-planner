function getClosestStations(skiArea, number) {
  const stations = snotelStations;

  stations.sort((a, b) => {
    const aDistance = getDistanceAsCrowFlies(
      [a.location.lng, a.location.lat],
      [skiArea.longitude, skiArea.latitude]
    );
    const bDistance = getDistanceAsCrowFlies(
      [b.location.lng, b.location.lat],
      [skiArea.longitude, skiArea.latitude]
    );

    return aDistance - bDistance;
  });

  return stations.slice(0, number);
}

// Modified from https://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula
function getDistanceAsCrowFlies(start, end) {
  var R = 3960; // Radius of the earth in miles
  var dLat = deg2rad(end[1] - start[1]); // deg2rad below
  var dLon = deg2rad(end[0] - start[0]);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(start[1])) *
      Math.cos(deg2rad(end[1])) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in miles
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

async function getStationData(triplet) {
  //triplet = "672:WA:SNTL";

  // see if there's station data for today in localStorage
  if (localStorage.getItem(triplet)) {
    const lcData = JSON.parse(localStorage.getItem(triplet));
    // check the date

    // Create date from input value
    let lcDate = new Date(`${lcData.Date}T12:00`);

    // Get today's date
    let today = new Date();

    // call setHours to take the time out of the comparison
    if (lcDate.setHours(0, 0, 0, 0) == today.setHours(0, 0, 0, 0)) {
      // Date equals today's date
      // return the object in localStorage
      return JSON.stringify(lcData);
    }
  }

  var requestOptions = {
    method: "GET",
    mode: "cors", // no-cors, *cors, same-origin
    cache: "default", // *default, no-cache, reload, force-cache, only-if-cached
    //credentials: "same-origin", // include, *same-origin, omit
    headers: {
      "Content-Type": "application/json",
      //"Content-Type": "application/x-www-form-urlencoded",
    },
    redirect: "follow", // manual, *follow, error
    //referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
  };

  let apiUrl = `https://wcc.sc.egov.usda.gov/reportGenerator/view_csv/customSingleStationReport/daily/${triplet}%7Cid%3D%22%22%7Cname/-0%2C0/WTEQ%3A%3Avalue%2CWTEQ%3A%3Adelta%2CSNWD%3A%3Avalue%2CSNWD%3A%3Adelta%2CTOBS%3A%3Avalue`;

  const response = await fetch(apiUrl, requestOptions);
  const data = await response.text();

  const lines = data.split("\n");
  let filteredLines = lines.filter((line) => line.indexOf("#") != 0);
  filteredLines = filteredLines.filter((line) => line.trim() != "");

  filteredLines[0] = filteredLines[0].replace(
    "Snow Water Equivalent (in) Start of Day Values",
    "Snow Water Equivalent (in)"
  );

  filteredLines[0] = filteredLines[0].replace(
    "Snow Depth (in) Start of Day Values",
    "Snow Depth (in)"
  );

  filteredLines[0] = filteredLines[0].replace(
    "Air Temperature Observed (degF) Start of Day Values",
    "Observed Air Temperature (degrees farenheit)"
  );

  let obj = {};

  const keys = filteredLines[0].split(",");

  if (filteredLines[1]) {
    const values = filteredLines[1].split(",");
    for (let j = 0; j < keys.length; j++) {
      obj[keys[j]] = values[j];
    }
  } else {
    return null;
  }

  const jsonObj = JSON.stringify(obj);

  localStorage.setItem(triplet, jsonObj);

  return jsonObj;
}

async function getSnowDataForClosestStation(skiArea) {
  const closestStations = getClosestStations(skiArea, 3);

  for (let station of closestStations) {
    const returnData = await getStationData(station.triplet);
    if (returnData) {
      const stationData = JSON.parse(returnData);

      const stationDistance = getDistanceAsCrowFlies(
        [station.location.lng, station.location.lat],
        [skiArea.longitude, skiArea.latitude]
      );

      stationData.distance = stationDistance.toFixed(2);

      const mergedStation = { ...station, ...stationData };
      return mergedStation;
    }
  }
  return null; // No data in the closest 3 stations
}
