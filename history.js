function getQuery() {
    $("#results").html("");
    document.getElementById('weather-table').style.display = 'none';

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
    $("#forecasts").html("");
    document.getElementById('weather-table').style.display = 'block';
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

    for (let k = 0; k < 5; k++) {
        let curPayload = payloadWeatherJson.list[k * 8];

        let curDate = new Date(curPayload.dt * 1000);
        let icon = "http://openweathermap.org/img/wn/" + curPayload.weather[0].icon + ".png";

        $("#forecasts").append(
            "<tr>" +
            "<td class='align-middle'>" + curDate.toDateString()    + "</td>" +
            "<td class='align-middle'>" + curPayload.main.temp_max  + "</td>" +
            "<td class='align-middle'>" + curPayload.main.temp_min  + "</td>" +
            "<td class='align-middle'><img src=\"" + icon + "\">       </td>" +
            "<td class='align-middle'>" + curPayload.visibility     + "</td>" +
            "<td class='align-middle'>" + curPayload.main.humidity  + "</td>" +
            "</tr>"
        );
    }
}

