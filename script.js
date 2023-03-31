// GIVEN a weather dashboard with form inputs
    //Search bar w/ jquiry autofill?
// WHEN I click on a city in the search history
// THEN I am again presented with current and future conditions for that city

var recentCities = [];
var pulledHistory = [];
var lat;
var lon;
var city = '';
var geocodingUrl = '';
var weatherDataUrl = '';
var weatherApiKey = '33de59ca489ef80bcfed5ff29e61912e';
var currentWeatherIcon = '';
var showCurrentData = '';
var currentTemp = '';
var currentWind = '';
var currentHumidity = '';
var searchRun = false;
var recentSearches = document.getElementById('recent-searches');
var currentCitySection = document.getElementById('current-city');
var fiveDayHeader = document.getElementById('fivedayheader');
var fiveDayList = document.getElementById('fivedaylist');
//get date from day.js
var date = dayjs().format('M/DD/YYYY');

//Load recent searches on page load 
checkSearch();

//Wrap JS in function to start on search submit
function search() {

        //Get city from search
        function getCity() {
            city = document.getElementById('city').value;
            //TODO TELL USER IF ENTRY IS NOT AN OPTION
            //Clear search
            $("#search-form")[0].reset();
        }
        getCity();

        //Add city to beginning of recentCities array and save to LocalStorage
        recentCities.unshift(city);
        localStorage.setItem('recentCities', JSON.stringify(recentCities));
        
        //Openweather API Url based on city search input
        geocodingUrl = 'http://api.openweathermap.org/geo/1.0/direct?q=' + city + '&limit=1&appid=' + weatherApiKey;

        //Get Lat/Lon from geocoding API
        function getLatLon() {
            fetch(geocodingUrl)
                .then(function (response) {
                if (response.ok) {
                    response.json().then(function (data) {
                    lat = data[0].lat;
                    lon = data[0].lon;
                    console.log(data);
                    getWeatherData();
                    })
                } else {
                        console.log(error);
                    }
                })
        }
        getLatLon();        

        //Use Lat/Lon to get weather data for searched city name
        function getWeatherData() {
            weatherDataUrl = 'https://api.openweathermap.org/data/3.0/onecall?lat=' + lat + '&lon=' + lon + '&units=imperial&appid=' + weatherApiKey;
            fetch(weatherDataUrl)
                .then(function (response) {
                    if (response.ok) {
                        response.json().then(function (data) {
                            currentTemp = data.current.temp;
                            currentWind = data.current.wind_speed;
                            currentHumidity = data.current.humidity;

                            // currentWeatherIcon = data.current.weather.icon; TODO (Undefined)
                            showCurrentWeather();
                            console.log(data);
                        })
                    }
                })
        //Set variable to determine that search function has already been run
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
        fiveDayDiv.innerHTML = "<div id='fivedaydiv'><h3>" + nextDate + "</h3>\n" + showCurrentData.innerHTML + "</div>";
        fiveDayList.appendChild(fiveDayDiv);
        }
}

//Get recent cities from LocalStorage to display as recent search list
function showSearchHistory() {
    //Get search history from Local Storage (up to 10)
    pulledHistory = localStorage.getItem('recentCities');

    //If no search history, tell user there is no recent search history
    if (!pulledHistory) {
        var noHistory = document.createElement('p');
        noHistory.innerText = 'No recent Searches';
        recentSearches.append(noHistory);

    //If there is history, get it, parse array, run a loop to create buttons for each city in recent search history
    } else {
        recentCities = JSON.parse(pulledHistory);
        var recentCitiesSliced = recentCities.slice(0, 10);
        for (i = 0; i < recentCitiesSliced.length; i++) {
            var historyListItem = document.createElement('button');
            var historyName = recentCitiesSliced[i];
            historyListItem.innerText = historyName;
            recentSearches.append(historyListItem);
           // historyListItem.setAttribute('click', search(city)); TODO
        }
    }
}

//Check is search has already been executed, if so, update recent search list
function checkSearch() {
    if (searchRun === false) {
        showSearchHistory();
    } else if (searchRun === true) {
        recentSearches.replaceChildren('');
        currentCitySection.replaceChildren('');
        fiveDayHeader.replaceChildren('');
        fiveDayList.replaceChildren('');
        showSearchHistory();
        //Remove previous city data and replace with new search data

    }
}
