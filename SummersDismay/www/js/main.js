

function submitName() {
    var host = window.location.protocol + "//" + window.location.host;
    window.location.href = host + "/play?name=" + document.getElementById("name_input").value;
}

function httpGetAsync(theUrl, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous
    xmlHttp.send(null);
}


function httpPostAsync(theUrl, params, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("POST", theUrl, true); // true for asynchronous
    xmlHttp.send(params);
}

function startGame() {
    var url = new URL(window.location.href);
    var c = url.searchParams.get("name");

    document.getElementById("show_name").innerHTML = c;
}

//httpGetAsync($('#meme'), function(a){$('#meme').text('meme')});
