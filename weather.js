const apiTomTom = 'spUtrwDG9NdZVZwD3xU0vOKQoUNyUIOI';
const apiOpenWeather = 'bfbb1f6239bee1af4c674442fe992863';

let lat = 0;
let lon = 0;

function getWeather() {
    $("#forecasts").html("");
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
            "&units=metric" +
            "&appid=" + apiOpenWeather,
        async: false,
        method: "GET"
    }).done(function (data) {
        for (let i = 0; i < 5; i++) {
            let curPayload = data.list[i * 8];

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

        return data;
    }).fail(function (error) {
        console.log("error", error.statusText);
        $("#status").prepend("root error " + new Date() + "<br>");
    });

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