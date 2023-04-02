var recentCities = [];
var pulledHistory = [];
var lat;
var lon;
var city = '';
var historyName = '';
var historyListItem = '';
var geocodingUrl = '';
var weatherDataUrl = '';
var weatherApiKey = '33de59ca489ef80bcfed5ff29e61912e';
var currentWeatherIcon = '';
var showCurrentData = '';
var currentTemp = '';
var currentWind = '';
var currentHumidity = '';
var dailyTemp = [];
var dailyWind = [];
var dailyHumidity = [];
var searchRun = false;
var recentSearches = document.getElementById('recent-searches');
var currentCitySection = document.getElementById('current-city');
var fiveDayHeader = document.getElementById('fivedayheader');
var fiveDayList = document.getElementById('fivedaylist');
var date = dayjs().format('M/DD/YYYY');

//Check is search has already been executed, if so, update recent search list
function checkSearch() {
    if (searchRun === true) {
        recentSearches.replaceChildren('');
        currentCitySection.replaceChildren('');
        fiveDayHeader.replaceChildren('');
        fiveDayList.replaceChildren('');
        showSearchHistory();
    }
}

//Get city from search
function getCity() {

    city = document.getElementById('city').value;

    //If search is empty, alert user to enter a city
    if (!city) {
        window.alert('You must enter a city name to run a search');
    } else if (isNaN(city)) {

        //Clear search
        $("#search-form")[0].reset();

        //Get data from APIs function
        getAPIData();

    } else {
        window.alert('You can not enter numbers into this form');
    }
}

function saveCity() {
    //Add city to beginning of recentCities array and save to LocalStorage
    recentCities.unshift(city);
    localStorage.setItem('recentCities', JSON.stringify(recentCities));
}

//Get weather data from APIs
function getAPIData() {
    //Openweather API Url based on city search input
    geocodingUrl = 'http://api.openweathermap.org/geo/1.0/direct?q=' + city + '&limit=1&appid=' + weatherApiKey;

    //Get Lat/Lon from geocoding API
    fetch(geocodingUrl)
        .then(function (response) {
            if (response.ok) {
                response.json().then(function (data) {
                lat = data[0].lat;
                lon = data[0].lon;

                //Send Lat/Lon coordinates to API for city results
                getWeatherData();
                })
            }
        });     

    //Use Lat/Lon to get weather data for searched city name
    function getWeatherData() {
    weatherDataUrl = 'https://api.openweathermap.org/data/3.0/onecall?lat=' + lat + '&lon=' + lon + '&units=imperial&appid=' + weatherApiKey;

    //Get weather data for city
    fetch(weatherDataUrl)
        .then(function (response) {
            if (response.ok) {
                response.json().then(function (data) {

                    //Current weather data
                    currentTemp = data.current.temp;
                    currentWind = data.current.wind_speed;
                    currentHumidity = data.current.humidity;

                    //Forecasted weather data
                    dailyTemp = [data.daily[0].temp.day, data.daily[1].temp.day, data.daily[2].temp.day, data.daily[3].temp.day, data.daily[4].temp.day];
                    dailyWind = [data.daily[0].wind_speed, data.daily[1].wind_speed, data.daily[2].wind_speed, data.daily[3].wind_speed, data.daily[4].wind_speed];
                    dailyHumidity = [data.daily[0].humidity, data.daily[1].humidity, data.daily[2].humidity, data.daily[3].humidity, data.daily[4].humidity];

                    // currentWeatherIcon = data.current.weather.icon; TODO (Undefined)
                    showCurrentWeather();

                    //Save city to history Array
                    saveCity();

                })
            }
        })

    //Set variable to designate that search function has already been run
    searchRun = true;

    //Check if search has been run before, if so, update recent search list 
    checkSearch();
    }
}


//Fill in current weather section with current weather conditions
function showCurrentWeather() {
    //Current city heading with date & weather icon
    var showCity = document.createElement('h3');
    showCity.innerText = city + ' (' + date + ')' + currentWeatherIcon;
    currentCitySection.appendChild(showCity);

    //Current city temp, wind, and humidity list
    showCurrentData = document.createElement('ul');
    showCurrentData.innerHTML = "<li>Temp: " + currentTemp + "  \u00B0F</li>\n<li>Wind: " + currentWind + " MPH</li>\n<li>Humidity: " + currentHumidity + " %</li>";
    currentCitySection.appendChild(showCurrentData);

    //5 Day forecast header and list
    var fiveDayTitle = document.createElement('h3');
    fiveDayTitle.innerText = "5 Day Forecast";
    fiveDayHeader.appendChild(fiveDayTitle);

        //Run loop to create 5 day forecast blocks
        for ( var i = 1; i < 6; i++) {
            var nextDate = dayjs().add([i], 'day').format('M/DD/YYYY');
            var fiveDayDiv = document.createElement('div');
        fiveDayDiv.innerHTML = "<div id='fivedaydiv'><h3>" + nextDate + "</h3>\n<ul><li>Temp: " + dailyTemp[i-1] + "  \u00B0F</li>\n<li>Wind: " + dailyWind[i-1] + " MPH</li>\n<li>Humidity: " + dailyHumidity[i-1] + " %</li></ul></div>";
        fiveDayList.appendChild(fiveDayDiv);
        }
}

//Get recent cities from LocalStorage to display as recent search list
function showSearchHistory() {
    pulledHistory = localStorage.getItem('recentCities');

    //If no search history, tell user there is no recent search history
    if (!pulledHistory) {
        var noHistory = document.createElement('p');
        noHistory.innerText = 'No recent Searches';
        recentSearches.append(noHistory);

    //If there is history, parse array, run a loop to create buttons for each city in recent search history, use name attribute to pass to search functions
    } else {
        recentCities = JSON.parse(pulledHistory);
        var recentCitiesSliced = recentCities.slice(0, 10);
        for (i = 0; i < recentCitiesSliced.length; i++) {
            historyListItem = document.createElement('button');
            historyListItem.name = 'history-button';
            historyListItem.id = recentCitiesSliced[i];
            historyName = recentCitiesSliced[i];
            historyListItem.innerText = historyName;
            recentSearches.append(historyListItem);
        }
    }   
      
    //Get city from history button selected
    var buttons = document.getElementsByName("history-button");
    var buttonPressed = e => {
        city = e.target.id;
        console.log(city);
        searchRun === true;
        getAPIData();
    }

    for (let button of buttons) {
        button.addEventListener('click', buttonPressed);
    }
}

//Show search history on page load
showSearchHistory();
