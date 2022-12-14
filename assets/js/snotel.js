function getClosestStations(lon, lat) {
  const stations = snotelStations;

  stations.sort((a, b) => {
    const aDistance = getDistanceAsCrowFlies(
      [a.location.lng, a.location.lat],
      [lon, lat]
    );
    const bDistance = getDistanceAsCrowFlies(
      [b.location.lng, b.location.lat],
      [lon, lat]
    );

    return aDistance - bDistance;
  });

  return stations.slice(0, 3);
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

  var requestOptions = {
    method: "GET",
    redirect: "follow",
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

  const keys = filteredLines[0].split(",");
  const values = filteredLines[1].split(",");

  let obj = {};

  for (let j = 0; j < keys.length; j++) {
    obj[keys[j]] = values[j];
  }

  return JSON.stringify(obj);
}
