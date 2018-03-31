//Succ

$(document).ready(function () {
    $("#ip_name_submit").click(function () {
        // httpPostAsync($('#ip_input').text(),'user='+$('#name_input').text(),function(a){alert('hey')});
        alert($("#name_input").text());
    });
});

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

//httpGetAsync($('#meme'), function(a){$('#meme').text('meme')});
