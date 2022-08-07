//  <!-- FETCH & RENDER WEATHER DATA -->
//section:query selector variables go here 👇
let button = document.getElementById("button");
let dailyTab = document.getElementById("daily-tab");
let hourlyTab = document.getElementById("hourly-tab");
let weatherContainer = document.getElementById("custom-weather-container");

//section:global variables go here 👇

//section:event listeners go here 👇
dailyTab.addEventListener("click", () => renderDailyHourlyWeatherData("daily"));
hourlyTab.addEventListener("click", () =>
  renderDailyHourlyWeatherData("hourly")
);

//section:functions and event handlers go here 👇
let customTabColor = document.getElementById("custom-tab-color");

function renderDailyHourlyWeatherData(requestedData) {
  //DETERMINE RESORT FOR FETCH
  // let latitude = skiAreas[5].Latitude;
  // let longitude = skiAreas[5].Longitude;
  // let resortName = skiAreas[5].Name; //if necessary

  let skiArea = getCurrentSkiArea(); //returns skiArea object with Name, Longitude, Latitude, Pass
  let latitude = skiArea.latitude;
  let longitude = skiArea.longitude;
  let resortName = skiArea.name;
  let pass = skiArea.pass;

  // let { Latitude, Longitude, Name } = getCurrentSkiArea(); //todo:destructing
  // latitude = Latitude;
  // longitude = Longitude
  // resortName = Name;
  // console.log(latitude, longitude, resortName, requestedData)

  if (requestedData === "daily") {
    dailyTab.classList.add("is-active");
    hourlyTab.classList.remove("is-active");
    requestedData = "daily";
  } else {
    dailyTab.classList.remove("is-active");
    hourlyTab.classList.add("is-active");
    requestedData = "hourly";
  }

  // console.log(latitude, longitude, resortName, requestedData)
  fetchWeatherData(latitude, longitude, resortName, requestedData);
}

function fetchWeatherData(latitude, longitude, resortName, requestedData) {
  let currentWeatherURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=minutely,alerts&appid=f0bed1b0eff80d425a392e66c50eb063&units=imperial&units=imperial`;

  // fetch(currentWeatherURL)
  //   .then((response) => {
  //     if (response.ok) {
  //       response.json().then((data) => {
  //           requestedData === "hourly" ? createDailyHourlyWeatherData(data, "hourly", resortName) : createDailyHourlyWeatherData(data, "daily", resortName);
  //       });
  //     } else {
  // launchValidationModal(
  //   "Error: Weather Not found",
  //   // `Try Again at a Later Date: ${response.statusText}`
  //   'weather'
  // );
  //     }
  //   })
  //   .catch((error) => {
  // launchValidationModal(
  //   "Error: Weather Not found",
  //   // `Try again later, please`,: ${response.statusText}`
  //   'weather'
  // );
  //   });

  // to test in development use the 2 lines below; to test in production comment outlines below and comment in the fetch above

  // launchValidationModal(
  //   "Error: Weather Not found",
  //   // `Try Again at a Later Date: ${response.statusText}`
  //   `Try again later, please`,
  //   'weather'
  // );
  requestedData === "hourly"
    ? createDailyHourlyWeatherData(weather, "hourly", "Boulder")
    : createDailyHourlyWeatherData(weather, "daily", "Boulder");
}

function createDailyHourlyWeatherData(weather, timeframe, resortName) {
  let weatherCleanData = [];
  // console.log('2 = ', weather, resortName, timeframe);

  weather[timeframe].filter((element, index) => {
    let hourOfDay = moment.unix(element.dt).format("H"); //24 hour clock

    if (hourOfDay >= 8 && hourOfDay <= 18) {
      //hour >=8a && <=6p
      weatherCleanData.push({
        type: timeframe,
        date: (type = "hourly"
          ? moment.unix(element.dt).format("ddd, M/D/YY ha")
          : moment.unix(element.dt).format("M/D/YYYY")),
        description: element.weather[0].description,
        icon: element.weather[0].icon,
        temp: element.temp.day || element.temp, // element.temp.day is the daily array and element.temp is the hourly array
        windGust: element.wind_gust,
        windSpeed: element.wind_speed,
      });
    }
  });

  renderWeather(weatherCleanData, resortName, timeframe);
}

//RENDER WEATHER DATA
function renderWeather(weatherCleanData, resortName, timeframe) {
  // ALTERNATE BACKGROUND & BODER COLOR FOR ACTIVE TAB (REMOVE DEFAULT COLORS)
  let allCustomTabColor = document.querySelectorAll(".all-custom-tab-color");
  allCustomTabColor.forEach((element) => {
    element.parentNode.classList.contains("is-active")
      ? element.setAttribute(
          "style",
          "background-color: #3E8ED0; border: #3E8ED0"
        )
      : element.setAttribute("style", "background-color: white");
  });

  weatherContainer.textContent = "";

  //CREATE ELEMENTS
  let timeFrameContainer = document.createElement("div");
  let renderResortName = document.createElement("p");
  let weatherTitle = document.createElement("p");

  //CREATE TITLE CONTENT
  renderResortName.textContent = resortName;
  timeframe === "hourly"
    ? (weatherTitle.textContent = "Hourly Forecast")
    : (weatherTitle.textContent = "Daily Forecast");

  // timeFrameContainer.classList.add("column", "is-half", "custom-weather");
  timeFrameContainer.classList.add(
    "column",
    "is-justify-content-space-between",
    "custom-weather"
  );
  timeFrameContainer.setAttribute("id", "custom-weather");
  // timeFrameContainer.setAttribute("style", "background-color: white; border: 1px solid black; height: 500px; overflow: scroll");
  timeFrameContainer.setAttribute("style", "background-color: white;");

  //APPEND TITLE CONTENT
  timeFrameContainer.append(renderResortName);
  timeFrameContainer.append(weatherTitle);

  renderResortName.setAttribute(
    "style",
    "background-color: white; position: sticky; top: 0px;"
  );
  weatherTitle.setAttribute(
    "style",
    "background-color: white; position: sticky; top: 24px;"
  );

  //CREATE & APPEND WEATHER CONTENT/DATA
  weatherCleanData.forEach((element, index) => {
    //CREATE ELEMENTS
    let weatherElement = document.createElement("div");
    let renderDate = document.createElement("p");
    let renderTemp = document.createElement("p");
    let icon = document.createElement("img");
    let lineElement = document.createElement("hr");

    weatherContainer.setAttribute("style", "height: 783px; overflow: scroll;");
    weatherElement.setAttribute(
      "style",
      "display: flex; align-items: center; justify-content: space-around;"
    );
    lineElement.setAttribute("style", "margin: 0px");
    renderDate.setAttribute("style", "margin: 0px");
    renderTemp.setAttribute("style", "margin: 0px");

    //CREATE CONTENT
    let date = element.date;
    let temp = Math.round(element.temp);
    icon.setAttribute(
      "src",
      `https://openweathermap.org/img/w/${element.icon}.png`
    );

    renderDate.textContent = date;
    renderTemp.textContent = `${temp}℉`;

    weatherContainer.append(timeFrameContainer);
    timeFrameContainer.append(weatherElement);
    weatherElement.append(renderDate);
    weatherElement.append(renderTemp);
    weatherElement.append(icon);
    timeFrameContainer.append(lineElement);
  });
}
