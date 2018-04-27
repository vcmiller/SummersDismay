
var pre_nouns = [
    "the tartness of", "the owner of", "the face of",
    "the likeness of", "the company of", "a friend of",
    "plenty of", "more of", "as much brain as", "the cap of",
    "the garden of", "such a deal of", "the rankness of", "any but"
]

var start_nouns = [
    "thy mother", "thy child", "thy father",
    "thy pet", "thy brother", "thy sister",
    "thy wife", "thy husband", "thy tongue", "thy lover", "thy wit",
    "thy imaginary friend", "thy face", "thy person",
    "thy ass", "thy friend", "thy brain", "your conversation", "none but thine self"
];

var other_nouns = [
    "a villain", "a hog", "thy three-inch fool",
    "a coward", "an icicle", "a Dutchman's beard",
    "the remaining biscuit after voyage",
    "a pound of broken meats", "ripe grapes",
    "a moonlight flit", "a tallow catch",
    "a lump of foul deformity", "a Tewkesbury mustard",
    "a flesh-monger", "a mountain goat", "the king",
    "a worm of Nile", "ear-wax", "a cheese",
    "a rare parrot-teacher", "a weasel", "an easy glove",
    "mites", "pudding", "a roasted Manningtree ox", "a flea",
    "a worsted-stocking knave"
];

var verbs = [
    "is", "hast no more brain than", "has in their elbows",
    "is like", "may strike", "should lick", "tickles",
    "smells of", "sours", "butters", "is as thick as",
    "sours ripe grapes", "is as fat as", "is as loathsome as",
    "is unfit for", "outvenoms", "has done", "enjoys",
    "prefers", "is as dry as", "has known", "is as saucy as",
    "has seen", "is not worth", "desires", "believes that", "is much like",
    "is as", "has trodden in", "does wish that", "hath not",
    "hath", "hath no more hair than", "doth look upon",
    "hath infected", "breeds", "is unfit for"
];

var isAdjectives = [
    "is rooting", "is plague-sore", "is rankest",
    "is compound of", "is much like",
    "is saucy", "is stewed", "is tart-faced",
    "is unnecessary", "is clay-brained", "is cream-faced",
    "is pigeon-liver’d", "is not for all markets",
    "is beef-witted", "is ill-breading", "is half-faced",
    "sodden-witted", "is festering", "is lily-liver’d", "is incontinent"
];

var interjectives = [
    "thou elf-skin!", "thou dried neat's-tongue!",
    "thou stock-fish!", "thou fat guts!", "thou scoundrel!",
    "thou froward and unable worm!", "thou poisonous bunch-backed toad!",
    "thou beast!", "thou bolting-hutch of beastliness!", "thou huge bombard of sack!",
    "thou obscene greasy tallow-catch!", "thou knotty-pated fool!", "thou foot-licker!",
    "thou gudgeon!", "thou withered hag!", "thou artless barnicle!", "thou vile worm!"
];

var conjoiners = [
    "and", "but", "and with", "and no less,",
    "and shall be", "and he", "and she",
    ", my lord,", "and furthermore,", ", nay,", "and yet"
];

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
        transitions: [ 0, 1, 6 ],
    },
    { // 3
        words: isAdjectives,
        transitions: [ 4, 5 ],
    },
    { // 4
        words: interjectives,
        transitions: [ 5, 0, 1, 6 ],
    },
    { // 5
        words: conjoiners,
        transitions: [ 0, 1, 2, 3, 6 ],
    },
    { // 6
        words: pre_nouns,
        transitions: [ 0, 1, 6 ]
    }
];

function isOption(word) {
    for (let i = 0; i < curOptions.length; i++) {
        if (curOptions[i].word === word) {
            return true;
        }
    }

    return false;
}

function isSetOption(set) {
    for (let i = 0; i < curOptions.length; i++) {
        if (curOptions[i].set === set) {
            return true;
        }
    }

    return false;
}

function chooseSet() {
    let set = -1;

    do {
        set = curState.transitions[Math.floor(Math.random() * curState.transitions.length)];
    } while (isSetOption(set) && curState.transitions.length > curOptions.length);

    return set;
}

function chooseWord(state) {
    let word = "";

    do {
        word = state.words[Math.floor(Math.random() * state.words.length)];
    } while (isOption(word));

    return word;
}

function enterState(index) {
    curState = states[index];
    curOptions = [ ];

    for (var i = 0; i < 4; i++) {
        var set = chooseSet();

        var destState = states[set];

        var word = chooseWord(destState);
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
            let toAdd = word;

            if (sentence.length === 0) {
                toAdd = toAdd.charAt(0).toUpperCase() + toAdd.slice(1);
            } else if (word.charAt(0) !== ",") {
                toAdd = " " + toAdd;
            }

            sentence += toAdd;
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
            if (rerolls.current === 0) {
                [1, 2, 3, 4].forEach(function (t) {
                    $("#magic_" + t).hide();
                });
            }

            var set = curState.transitions[Math.floor(Math.random() * curState.transitions.length)];
            curOptions[index].set = set;
            curOptions[index].word = chooseWord(states[set]);

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
var rerolls = { current: 3, max: 3 };
var prevRoll = 0;

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
        if (xmlHttp.readyState === 4 && xmlHttp.status === 200)
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

        if (json.role === 0) {
            roleP.innerHTML = "Victim: " + json.judge;
            insultDiv.style.display = json.insulted ? "none" : "block";

            if (prevRoll !== 0) {
                enterState(2);
            }

        } else if (json.role === 1) {
            roleP.innerHTML = "Victim: YOU";
            insultDiv.style.display = "none";
        } else {
            roleP.innerHTML = "(In audience)";
            insultDiv.style.display = "none";
        }

        prevRoll = json.role;
        
        if(!json.running){
            roleP.innerHTML += "<br>Waiting for host to start game...<br>";
            insultDiv.style.display = "none";
            allInsultsDiv.style.display = "none";
        }else if (json.insults && json.insults.length > 0) {
            allInsultsDiv.style.display = "block";
            allInsultsDiv.innerHTML = "";
            insultDiv.style.display = "none";

            if (json.winner.caster === "") {

                if (json.role === 1) {
                    allInsultsDiv.innerHTML += "<h3>Let's see how people really feel about you:</h3>";
                    //The voting UI
                    for (var i = 0; i < json.insults.length; i++) {
                        let insult = json.insults[i].content;
                        if (insult && insult.length > 0) {
                            if (json.voted === false) {
                                allInsultsDiv.innerHTML += "<p>" + insult + "\t<button style=\"display:inline\" onclick=\"voteFor('" + json.insults[i].caster + "')\">Select</button></p>";
                            } else {
                                allInsultsDiv.innerHTML += "<p>" + json.insults[i].caster + " said: " + insult + "</p>";
                            }
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

    enterState(2);
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
