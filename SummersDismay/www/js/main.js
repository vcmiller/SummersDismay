
var start_nouns = ["thy mother", "thy child", "thy father", "thy pet", "thy brother", "thy sister", "thy wife", "thy husband", "thy tongue", "thy imaginary friend", "thy face", "you", "thy ass"];
var other_nouns = ["a villain", "a hog", "thy three-inch fool", "a coward", "an icicle", "a Dutchman's beard", "the remaining biscuit after voyage", "a pound of broken meats", "ripe grapes", "a moonlight flit", "a tallow catch", "a lump of foul deformity"];
var verbs = ["is", "hast no more brain than", "has in their elbows", "is like", "may strike", "should lick", "tickles", "smells of", "sours", "butters"];
var isAdjectives = ["is rooting", "is plague-sore", "is rankest", "is compound of", "is much like a cheese", "is saucy", "is stewed", "is tart-faced", "is unnecessary", "is clay-brained", "is cream-faced"];
var interjectives = ["you elf-skin!", "you dried neat's-tongue!", "you stock-fish!", "ye fat guts!"];
var conjoiners = ["and", "but", "and with", "and no less", "and shall be", "and they"];

var curState = null;
var curOptions = [ ];

var states = [
    { // 0
        words: start_nouns,
        transitions: [ 2, 3, 4, 5 ],
    },
    { // 1
        words: other_nouns,
        transitions: [ 2, 3, 4, 5 ],
    },
    { // 2
        words: verbs,
        transitions: [ 0, 1 ],
    },
    { // 3
        words: isAdjectives,
        transitions: [ 4, 5 ],
    },
    { // 4
        words: interjectives,
        transitions: [ 5, 0, 1 ],
    },
    { // 5
        words: conjoiners,
        transitions: [ 0, 1, 3 ],
    },
];



function enterState(index) {
    curState = states[index];
    curOptions = [ ];

    for (var i = 0; i < 4; i++) {
        var set = curState.transitions[i % curState.transitions.length];

        var destState = states[set];

        var word = destState.words[Math.floor(Math.random() * destState.words.length)];
        curOptions.push({ set: set, word: word });
    }

    updateOptionButtons();
}

function updateOptionButtons() {
    [1, 2, 3, 4].forEach(function (t) {
        var button = $("#particle_" + t);

        var index = t - 1;
        var word = curOptions[index].word;
        var state = curOptions[index].set;
        button.text(word);
        button.off("click");
        button.click(function () {
            sentence += word + " ";
            $("#sentence_display").text(sentence);

            rerolls.current = Math.min(rerolls.current + 1, rerolls.max);
            $("#reroll_text").text("Rerolls: " + rerolls.current);
            [1, 2, 3, 4].forEach(function (t) {
                $("#magic_" + t).show();
            });

            console.log(state);
            enterState(state);
        });

        var magic = $("#magic_" + t);

        magic.off("click");
        magic.click(function () {
            rerolls.current--;
            $("#reroll_text").text("Rerolls: " + rerolls.current);
            if (rerolls.current == 0) {
                [1, 2, 3, 4].forEach(function (t) {
                    $("#magic_" + t).hide();
                });
            }

            var set = curState.transitions[Math.floor(Math.random() * curState.transitions.length)];
            curOptions[index].set = set;
            curOptions[index].word = states[set].words[Math.floor(Math.random() * states[set].words.length)];

            updateOptionButtons();
        });
    });
}

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;

    }


    return array;
}

var sentence = "";
var rerolls = {current:3, max:3};

//HTTP Shit

function backToStart() {
    var obj = {
        leaving: true
    };

    httpPostAsync(getUpdateUrl(), showUpdateResponse, JSON.stringify(obj));

    window.location.href = window.location.protocol + "//" + window.location.host;
}

function submitName() {
    var name = document.getElementById("name_input").value;

    if (name.length > 0) {
        var host = window.location.protocol + "//" + window.location.host;
        window.location.replace(host + "/play?name=" + name);
    } else {
        alert("You must enter your name.");
    }
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

    // json.role = json.role == 0 ? 1 : 0;

    var roleP = document.getElementById("show_role");
    var insultDiv = document.getElementById("insult_area");
    // var insultInput = document.getElementById("enter_insult");
    var allInsultsDiv = document.getElementById("show_insults_area");

    if (json) {
        document.getElementById("show_name").innerHTML = json.name;

        if (json.role == 0) {
            roleP.innerHTML = "Judge: " + json.judge;
            insultDiv.style.display = "block";
        } else if (json.role == 1) {
            roleP.innerHTML = "Judge: YOU";
            insultDiv.style.display = "none";
        } else {
            roleP.innerHTML = "(In audience)";
            insultDiv.style.display = "none";
        }


        if(!json.running){
            roleP.innerHTML += "<br>Waiting for host to start game...<br>";
            insultDiv.style.display = "none";
            allInsultsDiv.style.display = "none";
        }else if (json.insults && json.insults.length > 0) {
            allInsultsDiv.style.display = "block";
            allInsultsDiv.innerHTML = "";
            insultDiv.style.display = "none";

            if (json.winner.caster == "") {

                if (json.role == 1) {
                    allInsultsDiv.innerHTML += "<h3>Let's see how people really feel about you:</h3>";
                    //The voting UI
                    for (var i = 0; i < json.insults.length; i++) {
                        if ((json.role == 0 || json.role == 1) && json.voted == false) {
                            allInsultsDiv.innerHTML += "<p>" + json.insults[i].caster + " says: " + json.insults[i].content + "\t<button style=\"display:inline\" onclick=\"voteFor('" + json.insults[i].caster + "')\">Select</button></p>";
                        } else {
                            allInsultsDiv.innerHTML += "<p>" + json.insults[i].caster + " says: " + json.insults[i].content + "</p>";
                        }
                    }
                } else {
                    allInsultsDiv.innerHTML += "<h3>Let's see how people really feel about " + json.judge + ":</h3>";

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
    };

    httpPostAsync(getUpdateUrl(), showUpdateResponse, JSON.stringify(obj));
}

function sendInsult() {
    var obj = {
        // insult: document.getElementById("enter_insult").value
        insult: sentence
    };

    sentence = "";
    $("#sentence_display").text("");
    httpPostAsync(getUpdateUrl(), showUpdateResponse, JSON.stringify(obj));
}

function clearInsult() {
    sentence = "";
    $("#sentence_display").text("");
}

function startGame() {
    httpPostAsync(getUpdateUrl(), showUpdateResponse, null);
    window.setInterval(function () {
        httpPostAsync(getUpdateUrl(), showUpdateResponse, null);
    }, 1000);

    enterState(2);
}

function die() {
    window.location.href = "https://www.google.com";
}
