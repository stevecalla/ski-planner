  //  <!-- FETCH & RENDER WEATHER DATA -->
  //section:query selector variables go here 👇
  let button = document.getElementById('button');
  let dailyTab = document.getElementById('daily-tab');
  let hourlyTab = document.getElementById('hourly-tab');
  let weatherContainer = document.getElementById('custom-weather-container');

  //section:global variables go here 👇

  //section:event listeners go here 👇
  dailyTab.addEventListener('click', handleTabNavigation);
  hourlyTab.addEventListener('click', handleTabNavigation);

  //section:functions and event handlers go here 👇
  function handleTabNavigation() {
  // function handleTabNavigation(event, requestedData) {
  // function handleWeatherbutton(event) {
    //GET LATITUDE & LONGITUDE FOR LOCATION EVENT... 
    // let latitude = event.target.getAttribute('data-lat');
    // let longitude = event.target.getAttribute('data-lon');
    // let resortName = event.target.getAttribute('data-resort');

    //DETERMINE RESORT FOR FETCH
    let latitude = skiAreas[0].Latitude;
    let longitude = skiAreas[0].Longitude;
    let resortName = skiAreas[0].Name; //if necessary

    //DETERIME IF DAILY OR HOURLY DATA SHOULD BE DISPLAYED
    let requestedData = "";
    if (event.target.parentNode.classList.contains('hourly')) {
      // console.log('hourly weather js')
      dailyTab.classList.remove('is-active');
      hourlyTab.classList.add('is-active');
      requestedData = "hourly";
    } else {
      // console.log('daily weather js');
      dailyTab.classList.add('is-active');
      hourlyTab.classList.remove('is-active');
      requestedData = "daily";
    }
    
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
    //       console.log('Error: ', error);
    //     }
    //   })
    //   .catch((error) => {
    //     console.log('Error: ', error);
    //   });

    // to test in development use the 2 lines below; to test in production comment outlines below and comment in the fetch above
    requestedData === "hourly" ? createDailyHourlyWeatherData(weather, "hourly", "Boulder") : createDailyHourlyWeatherData(weather, "daily", "Boulder");
  }

  function createDailyHourlyWeatherData(weather, timeframe, resortName) {
    let weatherCleanData = [];
    // console.log('2 = ', weather, resortName, timeframe);

    weather[timeframe].filter((element, index) => {
      let hourOfDay = moment.unix(element.dt).format("H") //24 hour clock

      if (hourOfDay >= 8 && hourOfDay <= 18) { //hour >=8a && <=6p
        weatherCleanData.push({
          type: timeframe,
          date: type = "hourly" ? moment.unix(element.dt).format("ddd, M/D/YY ha") : moment.unix(element.dt).format("M/D/YYYY"),
          description: element.weather[0].description,
          icon: element.weather[0].icon,
          temp: element.temp.day || element.temp, // element.temp.day is the daily array and element.temp is the hourly array
          windGust: element.wind_gust,
          windSpeed: element.wind_speed,
        });
      }
    })

    renderWeather(weatherCleanData, resortName, timeframe);
  }

  //RENDER WEATHER DATA
  function renderWeather(weatherCleanData, resortName, timeframe) {
    // console.log('3 = ', weatherCleanData, resortName, timeframe);

    weatherContainer.textContent = "";

    //CREATE ELEMENTS
    let timeFrameContainer = document.createElement('div');
    let renderResortName = document.createElement('p');
    let weatherTitle = document.createElement('p');

    //CREATE TITLE CONTENT
    renderResortName.textContent = resortName;
    timeframe === "hourly" ? weatherTitle.textContent = "Hourly Forecast" : weatherTitle.textContent = "Daily Forecast";
    
    // timeFrameContainer.classList.add("column", "is-half", "custom-weather");
    timeFrameContainer.classList.add("column", "is-justify-content-space-between", "custom-weather");
    timeFrameContainer.setAttribute("id", "custom-weather");
    // timeFrameContainer.setAttribute("style", "background-color: white; border: 1px solid black; height: 500px; overflow: scroll");
    timeFrameContainer.setAttribute("style", "background-color: white; height: 500px; overflow: scroll");

    //APPEND TITLE CONTENT
    timeFrameContainer.append(renderResortName);
    timeFrameContainer.append(weatherTitle);

    renderResortName.setAttribute("style", "background-color: white; position: sticky; top: 0;");
    weatherTitle.setAttribute("style", "background-color: white; position: sticky; top: 0;");
    
    //CREATE & APPEND WEATHER CONTENT/DATA
    weatherCleanData.forEach((element,index) => {
      //CREATE ELEMENTS
      let weatherElement = document.createElement('div');
      let renderDate = document.createElement('p');
      let renderTemp = document.createElement('p');
      let icon = document.createElement("img");
      let lineElement = document.createElement('hr');

      weatherElement.setAttribute("style", "display: flex; align-items: center; justify-content: space-around;");
      lineElement.setAttribute("style", "margin: 0px");
      renderDate.setAttribute("style", "margin: 0px");
      renderTemp.setAttribute("style", "margin: 0px");
      
      //CREATE CONTENT
      let date = element.date;
      let temp = Math.round(element.temp);
      icon.setAttribute("src", `https://openweathermap.org/img/w/${element.icon}.png`);

      renderDate.textContent = date;
      renderTemp.textContent = `${temp}℉`;

      weatherContainer.append(timeFrameContainer);
      timeFrameContainer.append(weatherElement);
      weatherElement.append(renderDate);
      weatherElement.append(renderTemp);
      weatherElement.append(icon);
      timeFrameContainer.append(lineElement);
    })
  }