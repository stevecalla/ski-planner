//section:query selector variables go here 👇
let chkEpic = document.querySelector("#chkEpic");
let chkIkon = document.querySelector("#chkIkon");
let chkIndependent = document.querySelector("#chkIndependent");
let modalProfileFromHomePage = document.getElementById(
  "modal-profile-homepage-button"
);

//section:global variables go here 👇
let map;
var markers;

//section:event listeners go here 👇
modalProfileFromHomePage.addEventListener("click", renderProfileModal);

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

function displayMarkers(pass) {
  let filteredSkiAreas = skiAreas;
  if (pass) {
    filteredSkiAreas = skiAreas.filter(function (skiArea) {
      return skiArea.pass.trim().toLowerCase() === pass.trim().toLowerCase();
    });
  }

  const ResortIcon = L.Icon.extend({
    options: {
      shadowUrl: "./assets/images/msmarker.shadow.png",
      iconSize: [32, 32],
      shadowSize: [59, 32],
      iconAnchor: [16, 32],
      shadowAnchor: [16, 32],
      tooltipAnchor: [10, -24],
    },
  });

  const redIcon = new ResortIcon({ iconUrl: "./assets/images/red-dot.png" });
  const blueIcon = new ResortIcon({
    iconUrl: "./assets/images/blue-dot.png",
  });
  const yellowIcon = new ResortIcon({
    iconUrl: "./assets/images/yellow-dot.png",
  });

  for (let i = 0; i < filteredSkiAreas.length; i++) {
    let passIcon = blueIcon;
    if (filteredSkiAreas[i].pass.trim().toLowerCase() === "epic") {
      passIcon = yellowIcon;
    } else if (filteredSkiAreas[i].pass.trim().toLowerCase() === "ikon") {
      passIcon = redIcon;
    }

    var markerOptions = {
      icon: passIcon,
      riseOnHover: true,
    };
    var marker = L.marker(
      [filteredSkiAreas[i].latitude, filteredSkiAreas[i].longitude],
      markerOptions
    ).addTo(markers);

    var toolTipOptions = {
      offset: [0, 0],
      direction: "right",
      opacity: 0.8,
    };

    marker.bindTooltip(`<h4>${filteredSkiAreas[i].name}</h4>`, toolTipOptions);

    function markerClick(event) {
      const skiArea = skiAreas.find(
        (element) =>
          element.latitude === event.latlng.lat &&
          element.longitude === event.latlng.lng
      );

      // Initial popup text
      let popupText = `<h4>${skiArea.name}</h4>
                <p><progress class="progress is-small is-info" max="100"></progress></p>
                <a class="button custom-button is-small is-info is-light" href="./dashboard.html?resort=${skiArea.name}">Details ➡️</a>
              `;

      let popupOptions = {
        autoPan: true,
        keepInView: true,
        offset: [0, -24],
      };

      let popup = L.popup(popupOptions)
        .setLatLng({
          lat: skiArea.latitude,
          lng: skiArea.longitude,
        })
        .setContent(popupText)
        .openOn(map);

      displaySNOTELDataInPopup(skiArea, popup);
    }
    marker.addEventListener("click", markerClick);
  }
}

function displaySNOTELDataInPopup(skiArea, popup) {
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

          // Update the popup text with SNOTEL data
          popupText = `<h4>${skiArea.name}</h4>
                <p>Snow Depth (in): ${dataSNOTEL.data[0]["Snow Depth (in)"]}<br />
                Change In Snow Depth (in): ${dataSNOTEL.data[0]["Change In Snow Depth (in)"]}<br />
                Air Temperature: ${dataSNOTEL.data[0]["Observed Air Temperature (degrees farenheit)"]} \xB0F</p>
                <a class="button custom-button is-small is-info is-light" href="./dashboard.html?resort=${skiArea.name}">Details ➡️</a>
              `;

          popup.setContent(popupText);
        }
        // If the closest SNOTEL station does not have any data, go to the next one.  Powderhorn is this way.  Pulling 3 stations just in case.
      } while (dataSNOTEL.data.length === 0);
    })
    .fail()
    .always();
}

function passChecked(event) {
  // remove all the markers
  markers.clearLayers();

  if (chkEpic.checked) {
    displayMarkers(chkEpic.value);
  }
  if (chkIkon.checked) {
    displayMarkers(chkIkon.value);
  }
  if (chkIndependent.checked) {
    displayMarkers(chkIndependent.value);
  }
}
chkEpic.addEventListener("click", passChecked);
chkIkon.addEventListener("click", passChecked);
chkIndependent.addEventListener("click", passChecked);

function init() {
  try {
    initMap();
    displayMarkers("");
    //throw "Map Error";
  } catch (error) {
    launchValidationModal("Map Error", error, "Map");
  }
}
init();
