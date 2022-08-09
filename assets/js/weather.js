//section:query selector variables go here 👇
// let button = document.getElementById("button");
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
  let skiArea = getCurrentSkiArea(); //returns skiArea object with Name, Longitude, Latitude, Pass
  let latitude = skiArea.latitude;
  let longitude = skiArea.longitude;
  let resortName = skiArea.name;
  // let pass = skiArea.pass;

  if (requestedData === "daily") {
    dailyTab.classList.add("is-active");
    hourlyTab.classList.remove("is-active");
    requestedData = "daily";
  } else {
    dailyTab.classList.remove("is-active");
    hourlyTab.classList.add("is-active");
    requestedData = "hourly";
  }

  fetchWeatherData(latitude, longitude, resortName, requestedData);
}

function fetchWeatherData(latitude, longitude, resortName, requestedData) {
  let exclusions = "minutely,alerts";
  let key = config.OPEN_WEATHER_KEY_V2;
  let units = "imperial";

  let currentWeatherURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=${exclusions}&appid=${key}&units=${units}`;

  // fetch(currentWeatherURL) //todo fetch code in productoin
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

  // MODAL TEST CODE: WILL POP MODAL ON DASH & REMOVE THE WEATHER TILE
  // launchValidationModal(
  //   "Error: Weather Not found",
  //   // `Try Again at a Later Date: ${response.statusText}`
  //   `Try again later, please`,
  //   "weather"
  // );

  // to test in development use the 2 lines below; to test in production comment outlines below and comment in the fetch above
  // console.log(weather);
  requestedData === "hourly"
    ? createDailyHourlyWeatherData(weather, "hourly", "Boulder")
    : createDailyHourlyWeatherData(weather, "daily", "Boulder"); //todo test data/code
}

function createDailyHourlyWeatherData(weather, timeframe, resortName) {
  let weatherRawData = weather[timeframe];
  let weatherFiltered = [];
  let weatherRenderData = [];
  let hourOfDay = "";
  let previousDate = "";

  //FILTER FOR ONLY WEATHER BETWEEN 8AM AND 6PM
  for (let i = 0; i < weatherRawData.length; i++) {
    hourOfDay = moment.unix(weatherRawData[i].dt).format("H"); //24 hour clock
    if (hourOfDay >= 8 && hourOfDay <= 18) {
      weatherFiltered.push(weatherRawData[i]);
    }
  }

  //CREATE WEATHER DATA TO RENDER
  weatherFiltered.forEach((element) => {
    let dailyDate = moment.unix(element.dt).format("ddd, M/D/YY");
    let hourlyDate = moment.unix(element.dt).format("ddd, M/D/YY ha");
    let onlyAMPMDate = moment.unix(element.dt).format("ha");
    let date = timeframe === "hourly" ? hourlyDate : dailyDate;
    let renderDate =
      timeframe === "daily"
        ? dailyDate
        : previousDate === dailyDate
        ? onlyAMPMDate
        : hourlyDate;

    weatherRenderData.push({
      [timeframe]: timeframe,
      date: date,
      renderDate: renderDate,
      description: element.weather[0].description,
      icon: element.weather[0].icon,
      temp: element.temp.day || element.temp, // element.temp.day is the daily array and element.temp is the hourly array
      windGust: element.wind_gust,
      windSpeed: element.wind_speed,
    });
    previousDate = dailyDate;
  });

  renderWeather(weatherRenderData, resortName, timeframe);
}

//RENDER WEATHER DATA
function renderWeather(weatherRenderData, resortName, timeframe) {
  // ALTERNATE BACKGROUND & BORDER COLOR FOR ACTIVE TAB (REMOVE DEFAULT COLORS)
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

  timeFrameContainer.classList.add(
    "column",
    "is-justify-content-space-between",
    "custom-weather"
  );
  timeFrameContainer.setAttribute("id", "custom-weather");
  timeFrameContainer.setAttribute("style", "background-color: white;");

  //APPEND TITLE CONTENT
  // timeFrameContainer.append(renderResortName); //todo:comment out for production
  // timeFrameContainer.append(weatherTitle); //todo:comment out for producton

  // renderResortName.setAttribute( //ONLY NECESSARY IF RESORT NAME IS DISPLAYED //todo:comment out for producton
  //   "style",
  //   "background-color: white; position: sticky; top: 0px;"
  // );
  // weatherTitle.setAttribute( //ONLY NECESSARY IF WEATHER TITLE IS DISPLAYED //todo:comment out for producton
  //   "style",
  //   "background-color: white; position: sticky; top: 24px;"
  // );

  //CREATE & APPEND WEATHER CONTENT/DATA
  weatherRenderData.forEach((element) => {
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
    renderDate.setAttribute(
      "style",
      "margin: 0px; width: 120px; text-align: center;"
    );
    renderTemp.setAttribute("style", "margin: 0px");

    //CREATE CONTENT
    renderDate.textContent = element.renderDate;
    let temp = Math.round(element.temp);
    renderTemp.textContent = `${temp} \xB0F`;
    icon.setAttribute(
      "src",
      `https://openweathermap.org/img/w/${element.icon}.png`
    );

    //APPEND ELEMENTS (TO DASHBOARD TILE)
    weatherContainer.append(timeFrameContainer);
    timeFrameContainer.append(weatherElement);
    weatherElement.append(renderDate);
    weatherElement.append(renderTemp);
    weatherElement.append(icon);
    timeFrameContainer.append(lineElement);
  });
}
