$(document).ready(function () {
  let searchForm = document.querySelector("#searchForm");
  let searchTextElement = document.querySelector("#txtSearch");
  let ddPass = document.querySelector("#ddPass");

  let map;
  let markers = [];

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

  // Initialize and add the map
  function initMap() {
    const mapCenter = { lat: 39.0, lng: -106.302 };
    map = new google.maps.Map(document.getElementById("map"), {
      zoom: 8,
      center: mapCenter,
    });
  }

  //Display the markers
  function displayMarkers(pass) {
    // Create an info window to share between markers.
    const infoWindow = new google.maps.InfoWindow();

    // This doesn't do anything since pass is undefined from the initial callback
    let filteredSkiAreas = skiAreas;
    if (pass) {
      filteredSkiAreas = skiAreas.filter(function (skiArea) {
        return skiArea.Pass === pass;
      });
    }

    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(null);
    }
    markers = [];

    for (let i = 0; i < filteredSkiAreas.length; i++) {
      let marker = new google.maps.Marker({
        position: {
          lat: filteredSkiAreas[i].Latitude,
          lng: filteredSkiAreas[i].Longitude,
        },
        map: map,
        title: `${filteredSkiAreas[i].Name}`,
        icon: "http://maps.google.com/mapfiles/ms/micons/blue-dot.png",
      });

      // Add a click listener for each marker, and set up the info window.
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
      `;

        infoWindow.close();
        infoWindow.setContent(popupText);
        infoWindow.open(marker.getMap(), marker);
      }
      marker.addListener("click", markerClick);

      //Add marker to the array.
      markers.push(marker);
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
});
