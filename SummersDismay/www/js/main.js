

function submitName() {
    var host = window.location.protocol + "//" + window.location.host;
    window.location.replace(host + "/play?name=" + document.getElementById("name_input").value);
}

function getUpdateUrl() {
    return window.location.protocol + "//" + window.location.host + "/update";
}

function httpPostAsync(theUrl, callback, params) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("POST", theUrl, true);
    xmlHttp.send(params);
}

function showUpdateResponse(text) {
    var json = JSON.parse(text);

    var roleP = document.getElementById("show_role");
    var insultDiv = document.getElementById("insult_area");
    var insultInput = document.getElementById("enter_insult");
    var allInsultsDiv = document.getElementById("show_insults_area");

    if (json) {
        document.getElementById("show_name").innerHTML = json.name;

        if (json.role == 0) {
            roleP.innerHTML = "You are a participant.<br>";
            roleP.innerHTML += "The judge is " + json.judge + ".";
            insultDiv.style.display = "block";
        } else if (json.role == 1) {
            roleP.innerHTML = "You are the judge.";
            insultDiv.style.display = "none";
        } else {
            roleP.innerHTML = "You are in the audience.";
            insultDiv.style.display = "none";
        }

        if (json.insults && json.insults.length > 0) {
            allInsultsDiv.style.display = "block";
            allInsultsDiv.innerHTML = "";
            insultDiv.style.display = "none";

            if (json.winner.caster == "") {

                if (json.role == 1) {
                    allInsultsDiv.innerHTML += "<h3>Let's see how people really feel about you:</h3>";
                } else {
                    allInsultsDiv.innerHTML += "<h3>Let's see how people really feel about " + json.judge + ":</h3>";
                }

                for (var i = 0; i < json.insults.length; i++) {
                    if ((json.role == 0 || json.role == 1) && json.voted == false) {
                        allInsultsDiv.innerHTML += "<p>" + json.insults[i].caster + " says: " + json.insults[i].content + "\t<button style=\"display:inline\" onclick=\"voteFor('" + json.insults[i].caster + "')\">Vote</button></p>";
                    } else {
                        allInsultsDiv.innerHTML += "<p>" + json.insults[i].caster + " says: " + json.insults[i].content + "</p>";
                    }
                }
            } else {
                allInsultsDiv.innerHTML += "<h3>And the winner is...</h3>";
                allInsultsDiv.innerHTML += "<p>" + json.winner.caster + ": " + json.winner.content + "</p>";
            }
            
        } else {
            allInsultsDiv.style.display = "none";
        }
    }
}

function voteFor(person) {
    var obj = {
        vote: person
    }

    httpPostAsync(getUpdateUrl(), showUpdateResponse, JSON.stringify(obj));
}

function sendInsult() {
    var obj = {
        insult: document.getElementById("enter_insult").value
    }

    httpPostAsync(getUpdateUrl(), showUpdateResponse, JSON.stringify(obj));
}

function startGame() {
    httpPostAsync(getUpdateUrl(), showUpdateResponse, null);
    window.setInterval(function () {
        httpPostAsync(getUpdateUrl(), showUpdateResponse, null);
    }, 1000);
}

function leaveGame() {
    window.location.replace(window.location.protocol + "//" + window.location.host);
}
