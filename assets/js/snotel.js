async function getSNOTELStations(state) {
  let requestOptions = {
    method: "GET",
    redirect: "follow",
  };

  var params = {
    state: state,
  };

  let apiUrl = "https://powderlines.kellysoftware.org/api/stations?";

  for (let p in params) {
    apiUrl += `${p}=${params[p]}&`;
  }
  apiUrl = encodeURI(apiUrl.slice(0, -1));

  const response = await fetch(apiUrl, requestOptions);

  const data = await response.json();
  return data;
}

async function getClosestStations(skiArea, number) {
  let requestOptions = {
    method: "GET",
    redirect: "follow",
  };

  var params = {
    lat: skiArea.latitude,
    lng: skiArea.longitude,
    count: number,
  };

  let apiUrl = "https://powderlines.kellysoftware.org/api/closest_stations?";

  for (let p in params) {
    apiUrl += `${p}=${params[p]}&`;
  }
  apiUrl = encodeURI(apiUrl.slice(0, -1));

  const response = await fetch(apiUrl, requestOptions);

  const data = await response.json();
  return data;
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

    if (lcData.data) {
      // Create date from input value
      let lcDate = new Date(`${lcData.data[0].Date}T12:00`);

      // Get today's date
      let today = new Date();

      // call setHours to take the time out of the comparison
      if (lcDate.setHours(0, 0, 0, 0) == today.setHours(0, 0, 0, 0)) {
        // Date equals today's date
        // return the object in localStorage
        return lcData;
      }
    }
  }

  let requestOptions = {
    method: "GET",
    redirect: "follow",
  };

  var params = {
    days: 0,
  };

  let apiUrl = `https://powderlines.kellysoftware.org/api/station/${triplet}?`;

  for (let p in params) {
    apiUrl += `${p}=${params[p]}&`;
  }
  apiUrl = encodeURI(apiUrl.slice(0, -1));

  const response = await fetch(apiUrl, requestOptions);

  const data = await response.json();

  localStorage.setItem(triplet, JSON.stringify(data));

  return data;
}

async function getSnowDataForClosestStation(skiArea) {
  const closestStations = await getClosestStations(skiArea, 3);

  for (let station of closestStations) {
    const returnData = await getStationData(
      station.station_information.triplet
    );
    if (returnData.data) {
      const stationData = returnData;

      const stationDistance = getDistanceAsCrowFlies(
        [
          station.station_information.location.lng,
          station.station_information.location.lat,
        ],
        [skiArea.longitude, skiArea.latitude]
      );

      if (!("distance" in stationData.station_information)) {
        stationData.station_information.distance = stationDistance.toFixed(2);
      }
      return stationData;
    }
  }
  return null; // No data in the closest 3 stations
}
