
var pre_nouns = [
    "the owner of", "a friend of",
    "plenty of", "more of", "as much brain as", "the cap of",
    "such a deal of", "any but", "none but"
]

var thy_nouns = [
    "mother", "child", "father", "company", "likeness", "tartness",
    "pet", "brother", "sister", "face", "rankness",
    "wife", "husband", "tongue", "lover", "wit",
    "imaginary_friend", "face", "person", "three-inch_fool",
    "ass", "friend", "brain", "conversation", "garden"
];

var solo_nouns = [
    "thine self", "ripe_grapes", "the king", "mites", "pudding", 
];

// Dutchman's
// Roasted
var other_nouns = [
    "villain", "hog", "coward", "icicle", "beard",
    "pound_of_broken_meats",
    "moonlight_flit", "tallow_catch",
    "lump_of_foul_deformity", "Tewkesbury_mustard",
    "flesh-monger", "mountain_goat",
    "worm_of_Nile", "ear-wax", "cheese",
    "parrot-teacher", "weasel", "glove",
    "Manningtree_ox", "flea", "knave"
];

var trans_verbs = [
    "is", "hast no more brain than", "has in their elbows",
    "is like", "may strike", "should lick", "tickles",
    "smells of", "sours", "butters", "is as thick as",
    "is as fat as", "is as loathsome as",
    "is unfit for", "outvenoms", "has done", "enjoys",
    "prefers", "is as dry as", "has known", "is as saucy as",
    "has seen", "is not worth", "desires", "believes that", "is much like",
    "is as", "has trodden in", "does wish that", "hath not",
    "hath", "hath no more hair than", "doth look upon",
    "hath infected", "is unfit for", "is much like", "is compound of", 
];

var intrans_verbs = [
    "sours ripe grapes", "is not for all markets",
]

var adjectives = [
    "rooting", "plague-sore", "rankest",
    "saucy", "stewed", "tart-faced",
    "unnecessary", "clay-brained", "cream-faced",
    "pigeon-liver’d",
    "beef-witted", "ill-breading", "half-faced",
    "sodden-witted", "festering", "lily-liver’d", "incontinent"
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
var curOptions = [];

function isVowel(ch) {
    return ["a", "e", "i", "o", "u"].indexOf(ch.toLowerCase()) > 0;
}

let REG_NOUNS = 0;
let POS_NOUNS = 1;
let PRE_NOUNS = 2;
let TRANS_VERBS = 3;
let INTRANS_VERBS = 4;
let ADJECTIVES = 5;
let CONJOINERS = 6;
let INTERJECTIVES = 7;

var states = [
    { // 0 (regular nouns)
        words: solo_nouns.concat(
            thy_nouns.map(function (word) { return "thy " + word; }), // thy followed by thy noun
            other_nouns.map(function (word) { return (isVowel(word.charAt(0)) ? "an " : "a ") + word; }) // article followed by other noun
        ),
        transitions: [ POS_NOUNS, TRANS_VERBS, INTRANS_VERBS, ADJECTIVES, CONJOINERS, INTERJECTIVES ],
    },
    { // 1 (posessive nouns ('s followed by a noun))
        words: thy_nouns.concat(other_nouns).map(function (word) { return "'s " + word; }),
        transitions: [ POS_NOUNS, TRANS_VERBS, INTRANS_VERBS, ADJECTIVES, CONJOINERS, INTERJECTIVES ],
    },
    { // 2 (pre-posessive nouns such as (the child of) or (none but)
        words: pre_nouns.concat(
            thy_nouns.map(function (word) { return "the " + word + " of"; })
        ),
        transitions: [ PRE_NOUNS, REG_NOUNS ],
    },
    { // 3 (transitive verbs)
        words: trans_verbs,
        transitions: [ PRE_NOUNS, REG_NOUNS ],
    },
    { // 4 (intransitive verbs and is-adjectives)
        words: intrans_verbs.concat(
            adjectives.map(function (word) { return "is " + word })
        ),
        transitions: [ CONJOINERS, INTERJECTIVES ],
    },
    { // 5 (modifier adjectives)
        words: adjectives,
        transitions: [ POS_NOUNS, TRANS_VERBS, INTRANS_VERBS, ADJECTIVES, CONJOINERS, INTERJECTIVES ],
        modifier: true,
    },
    { // 6
        words: conjoiners,
        transitions: [ PRE_NOUNS, REG_NOUNS, TRANS_VERBS, INTRANS_VERBS ],
    },
    { // 7
        words: interjectives,
        transitions: [],
    },
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
                                allInsultsDiv.innerHTML += "<p>" + insult + "\t<button style=\"display:inline\" onclick=\"voteFor('" + json.insults[i].casterID + "')\">Select</button></p>";
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
