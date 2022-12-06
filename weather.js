const apiTomTom = 'spUtrwDG9NdZVZwD3xU0vOKQoUNyUIOI';
const apiOpenWeather = 'bfbb1f6239bee1af4c674442fe992863';

let lat = 0;
let lon = 0;

function getWeather() {
    $("#forecasts").html("");
    $("#weather").html("");
    let input = document.getElementById('search').value;

    let mapJson = $.ajax({
        url: "https://api.tomtom.com/search/2/search/" + encodeURI(input) + ".json" +
            "?key=" + apiTomTom,
        method: "GET",
        async: false
    }).done(function (data) {
        lat = data.results[0].position.lat;
        lon = data.results[0].position.lon;

        return data;
    }).fail(function (error) {
        console.log("error", error.statusText);
        $("#status").append("root error " + new Date() + "<br>");
    });

    $("#status").html(lat + "x" + lon);

    let weatherJson = $.ajax({
        url: "https://api.openweathermap.org/data/2.5/forecast" +
            "?lat=" + lat +
            "&lon=" + lon +
            "&units=imperial" +
            "&appid=" + apiOpenWeather,
        async: false,
        method: "GET"
    }).done(function (data) {
        return data;
    }).fail(function (error) {
        console.log("error", error.statusText);
        $("#status").prepend("root error " + new Date() + "<br>");
    });

    injectWeather(weatherJson.responseJSON);

    $.ajax({
        url: "http://172.17.13.84/final.php?method=setWeather" +
            "&location="+ input,
        data: {
            mapJson: mapJson.responseText,
            weatherJson: weatherJson.responseText,
        },
        async: false,
        method: "POST"
    }).fail(function (error) {
        console.log("error", error.statusText);
        $("#status").prepend("root error " + new Date() + "<br>");
    });
}

function injectWeather(weatherJson) {
    let max_maxTemp = Number.MIN_SAFE_INTEGER;
    let min_minTemp = Number.MAX_SAFE_INTEGER;

    let minArray = [];
    let maxArray = [];

    for (let i = 0; i < 5; i++) {
        let curMin = Number.MAX_SAFE_INTEGER
        let curMax = Number.MIN_SAFE_INTEGER;

        for (let k = 0; k < 8; k++) {
            let main = weatherJson.list[i * 8 + k].main;
            if (main.temp < curMin) curMin = main.temp;
            if (main.temp > curMax) curMax = main.temp;
        }

        minArray.push(curMin);
        maxArray.push(curMax);
        if (curMin < min_minTemp) min_minTemp = curMin;
        if (curMax > max_maxTemp) max_maxTemp = curMax;
    }

    let max_min_dif = max_maxTemp - min_minTemp;
    
    for (let i = 0; i < 5; i++) {
        let curPayload = weatherJson.list[i * 8];
        let curDate = new Date(curPayload.dt * 1000);

        let curMin = Math.round(minArray[i]);
        let curMax = Math.round(maxArray[i]);

        // With H:300 at -5F and H:0 at 105F, each degree is a hue jump of 3
        let curMinHue = 300 - (curMin + 5) * 3;
        let curMaxHue = 300 - (curMax + 5) * 3;

        // 15% margin each side, and a minimum of 5% for the color bar
        let width1 = (curMin - min_minTemp) / max_min_dif * 65 + 15;
        let width2 = (curMax - curMin) / max_min_dif * 65 + 5 ;
        let width3 = 100 - width1 - width2;

        $("#weather").append(
            `<div class="row gy-4 align-items-center">
                <hr class="dotted">
                <div class="col-lg-4">
                    <div class="row">
                        <div class="col-3">
                            <img class="img-fluid icon-small" src="http://openweathermap.org/img/wn/` + curPayload.weather[0].icon + `@2x.png" alt="icon">
                        </div>
                        <div class="col-7">
                            <h4>` + curDate.toDateString() +`</h4>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                 class="bi bi-droplet-half" viewBox="0 0 16 16">
                                <path fill-rule="evenodd"
                                      d="M7.21.8C7.69.295 8 0 8 0c.109.363.234.708.371 1.038.812 1.946 2.073 3.35 3.197 4.6C12.878 7.096 14 8.345 14 10a6 6 0 0 1-12 0C2 6.668 5.58 2.517 7.21.8zm.413 1.021A31.25 31.25 0 0 0 5.794 3.99c-.726.95-1.436 2.008-1.96 3.07C3.304 8.133 3 9.138 3 10c0 0 2.5 1.5 5 .5s5-.5 5-.5c0-1.201-.796-2.157-2.181-3.7l-.03-.032C9.75 5.11 8.5 3.72 7.623 1.82z"/>
                                <path fill-rule="evenodd"
                                      d="M4.553 7.776c.82-1.641 1.717-2.753 2.093-3.13l.708.708c-.29.29-1.128 1.311-1.907 2.87l-.894-.448z"/>
                            </svg>
                            <span>` + curPayload.main.humidity +`</span><br>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                 class="bi bi-eye-fill" viewBox="0 0 16 16">
                                <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                                <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                            </svg>
                            <span>` + curPayload.visibility + `</span>
                        </div>
                    </div>
                </div>
                <div class="col">
                    <div class="row" style="height: 40px; background-color: #EDEDED">
                        <span class="black black-1" style="width: ` + width1 + `%">` + curMin + `</span>
                        <span class="color" style="width: ` + width2 + `%; background: linear-gradient(to right, hsl(` + curMinHue + `, 70%, 50%), hsl(` + curMaxHue + `, 70%, 50%));"></span>
                        <span class="black black-2" style="width: ` + width3 + `%">` + curMax + `</span>
                    </div>
                </div>
            </div>`
        );
    }
}

function getQuery() {
    $("#results").html("");
    $("#weather").html("");

    let payload = $.ajax({
        url: "http://172.17.13.84/final.php?method=getWeather" +
            "&date=" + document.getElementById('datePick').value,
        async: false,
        method: "GET"
    }).done(function (data) {
        return data;
    }).fail(function (error) {
        console.log("error", error.statusText);
        $("#status").prepend("root error " + new Date() + "<br>");
    });

    let payloadJson = payload.responseJSON;

    for (let i = 0; i < Math.min(payloadJson.result.length, document.getElementById('maxline').value); i++) {
        let cur = payloadJson.result[i];
        let mapJson = JSON.parse(cur.MapJson);

        $("#results").append(
            "<tr>" +
            "<td class='align-middle'>" + cur.DateTime    + "</td>" +
            "<td class='align-middle'>" + cur.Location  + "</td>" +
            "<td class='align-middle'>" + mapJson.results[0].position.lat     + "</td>" +
            "<td class='align-middle'>" + mapJson.results[0].position.lon  + "</td>" +
            "<td class='align-middle'><button type=\"button\" class=\"btn btn-secondary\" id=\" + i + " +
            "\" onclick=\"getWeatherStored("+ i +")\">Show</button></td>" +
            "</tr>"
        );
    }
}

function getWeatherStored(i) {
    $("#weather").html("");
    window.scrollTo(0, 0);

    let payload = $.ajax({
        url: "http://172.17.13.84/final.php?method=getWeather" +
            "&date=" + document.getElementById('datePick').value,
        async: false,
        method: "GET"
    }).done(function (data) {
        return data;
    }).fail(function (error) {
        console.log("error", error.statusText);
        $("#status").prepend("root error " + new Date() + "<br>");
    });

    let payloadWeatherJson = JSON.parse(payload.responseJSON.result[i].WeatherJson);

    injectWeather(payloadWeatherJson);
}