
var pre_nouns = [
    "the owner of", "a friend of",
    "plenty of", "more of", "as much brain as", "the cap of",
    "such a deal of", "any but", "none but", "a lack of"
]

var thy_nouns = [
    "mother", "child", "father", "company", "likeness", "tartness",
    "pet", "brother", "sister", "face", "rankness",
    "wife", "husband", "tongue", "lover", "wit",
    "imaginary_friend", "face", "person", "three-inch_fool",
    "ass", "friend", "brain", "conversation", "garden", "lack of wit"
];

var solo_nouns = [
    "the king", "pudding", "the remaining_biscuit_after_voyage"
];

var obj_only_nouns = [
    "ripe_grapes", "mites", "thine self", "thy children"
];

var other_nouns = [
    "villain", "hog", "coward", "icicle", "beard",
    "pound_of_broken_meats", "Dutchman",
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
    "smells of", "is as thick as", "is as fat as", "is as loathsome as",
    "is unfit for", "outvenoms", "has done", "enjoys",
    "prefers", "is as dry as", "has known", "is as saucy as",
    "has seen", "is not worth", "desires", "believes that", "is much like",
    "has trodden in", "does wish for", "hath not",
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
    "pigeon-liver’d", "roasted",
    "beef-witted", "ill-breading", "half-faced",
    "sodden-witted", "festering", "lily-liver’d", "incontinent", "sodden-witted"
];

var interject_adj = [
    "dried", "fat", "froward", "unable", "poisonous", "mouldy",
    "bunch-backed", "bolting", "huge", "obscene", "foul-spoken",
    "greasy", "knotty-pated", "withered", "artless", "vile", "sodden-witted"
];

var interject_noun = [
    "elf-skin", "neat's-tongue", "stock-fish", "guts",
    "scoundrel", "worm", "toad", "beast", "hutch of beastliness",
    "bombard of sack", "tallow-catch", "fool", "foot-licker",
    "gudgeon", "hag", "barnicle", "worm", "lord", "rag", "whoreson", "rogue"
];

var conjoiners = [
    ", and", ", but", ", and no less,",
    ", my lord,", ", and furthermore,", ", nay,", ", and yet, "
];

var curState = null;
var curOptions = [];

var sentence = "";
var stateHistory = [];
var rerolls = { current: 3, max: 5 };

function isVowel(ch) {
    return ["a", "e", "i", "o", "u"].indexOf(ch.toLowerCase()) >= 0;
}

function needsSpace(ch) {
    return ["'", ","].indexOf(ch) < 0;
}

function toView(str) {
    return str.replace(/_/g, " ");
}

function standardApply(sentence, word) {
    let result = sentence;
    if (sentence.length > 0 && needsSpace(word.charAt(0))) {
        result += " ";
    }

    if (stateHistory.length === 0 || stateHistory[0] === INTERJECT_NOUN) {
        word = word.charAt(0).toUpperCase() + word.substring(1);
    }
    result += word;
    return result;
}

function mostRecentUsed(history, options) {
    for (let i = 0; i < history.length; i++) {
        let cur = history[i];
        if (options.indexOf(cur) >= 0) {
            return cur;
        }
    }

    return -1;
}

function hist_mostRecentIs(options, desired) {
    return function (history) {
        return mostRecentUsed(history, options) === desired;
    };
}

function hist_mostRecentOneOf(options, desired) {
    return function (history) {
        return desired.indexOf(mostRecentUsed(history, options)) >= 0;
    };
}

function hist_not(func) {
    return function (history) {
        return !func(history);
    };
}

let i = 0;

let SUBJ_NOUNS = i++;
let OBJ_NOUNS = i++;
let POS_NOUNS = i++;
let PRE_NOUNS = i++;
let TRANS_VERBS = i++;
let INTRANS_VERBS = i++;
let ADJECTIVES = i++;
let CONJOINERS = i++;
let INTERJECT_START = i++;
let INTERJECT_ADJ = i++;
let INTERJECT_NOUN = i++;

var states = [
    { // subject nouns
        words: solo_nouns.concat(
            thy_nouns.concat(thy_nouns, thy_nouns).map(function (word) { return "thy " + word; }), // thy followed by thy noun
            other_nouns.map(function (word) { return (isVowel(word.charAt(0)) ? "an " : "a ") + word; }) // article followed by other noun
        ),
        transitions: [
            { to: POS_NOUNS },
            { to: TRANS_VERBS },
            { to: INTRANS_VERBS },
            { to: ADJECTIVES }
        ],
        apply: standardApply
    },
    { // object nouns
        words: solo_nouns.concat(
            obj_only_nouns,
            thy_nouns.map(function (word) { return "thy " + word; }), // thy followed by thy noun
            other_nouns.map(function (word) { return (isVowel(word.charAt(0)) ? "an " : "a ") + word; }) // article followed by other noun
        ),
        transitions: [
            { to: POS_NOUNS },
            { to: ADJECTIVES },
            { to: CONJOINERS },
            { to: INTERJECT_START }
        ],
        apply: standardApply
    },
    { // posessive nouns ('s followed by a noun)
        words: thy_nouns.concat(other_nouns).map(function (word) { return "'s " + word; }),
        transitions: [
            { to: TRANS_VERBS, valid: hist_mostRecentIs([SUBJ_NOUNS, OBJ_NOUNS], SUBJ_NOUNS) },
            { to: INTRANS_VERBS, valid: hist_mostRecentIs([SUBJ_NOUNS, OBJ_NOUNS], SUBJ_NOUNS) },
            { to: ADJECTIVES },
            { to: CONJOINERS, valid: hist_mostRecentIs([SUBJ_NOUNS, OBJ_NOUNS], OBJ_NOUNS) },
            { to: INTERJECT_START, valid: hist_mostRecentIs([SUBJ_NOUNS, OBJ_NOUNS], OBJ_NOUNS) }
        ],
        apply: standardApply
    },
    { // pre-posessive nouns such as (the child of) or (none but)
        words: pre_nouns.concat(
            pre_nouns,
            pre_nouns,
            pre_nouns,
            thy_nouns.map(function (word) { return "the " + word + " of"; })
        ),
        transitions: [
            { to: SUBJ_NOUNS, valid: hist_not(hist_mostRecentIs([CONJOINERS, TRANS_VERBS, INTRANS_VERBS, INTERJECT_START], TRANS_VERBS)) },
            { to: OBJ_NOUNS, valid: hist_mostRecentIs([CONJOINERS, TRANS_VERBS, INTRANS_VERBS, INTERJECT_START], TRANS_VERBS) },
        ],
        apply: standardApply
    },
    { // transitive verbs
        words: trans_verbs,
        transitions: [
            { to: PRE_NOUNS, weight: 1 },
            { to: OBJ_NOUNS, weight: 3 }
        ],
        apply: standardApply
    },
    { // intransitive verbs and is-adjectives
        words: intrans_verbs.concat(
            intrans_verbs,
            adjectives.map(function (word) { return "is " + word })
        ),
        transitions: [
            { to: CONJOINERS },
            { to: INTERJECT_START }
        ],
        apply: standardApply
    },
    { // modifier adjectives
        words: adjectives,
        apply: function (sentence, word) {
            let insertPos = sentence.lastIndexOf(" ");
            let before = sentence.substring(0, insertPos);
            let after = sentence.substring(insertPos);

            if (stateHistory[0] === ADJECTIVES) {
                return before + ", " + word + after;
            } else {
                return before + " " + word + after;
            }
        },
        modifier: true,
    },
    { // 
        words: conjoiners,
        transitions: [
            { to: PRE_NOUNS },
            { to: SUBJ_NOUNS },
            { to: TRANS_VERBS },
            { to: INTRANS_VERBS }
        ],
        apply: standardApply
    },
    { // Interjective start
        words: [ ", thou" ],
        transitions: [
            { to: INTERJECT_ADJ, weight: 4 },
            { to: INTERJECT_NOUN, weight: 1 },
        ],
        apply: standardApply
    },
    { // Interjective adjectives
        words: adjectives.concat(interject_adj, interject_adj),
        transitions: [
            { to: INTERJECT_ADJ, weight: 2 },
            { to: INTERJECT_NOUN, weight: 1 },
        ],
        apply: function (sentence, word) {
            if (stateHistory[0] === INTERJECT_ADJ) {
                sentence += ", ";
            } else {
                sentence += " ";
            }

            return sentence + word;
        }
    },
    { // Interjective nouns
        words: other_nouns.concat(interject_noun, interject_noun).map(function (word) { return word + "!"; }),
        transitions: [
            { to: PRE_NOUNS, weight: 1 },
            { to: SUBJ_NOUNS, weight: 4 },
        ],
        apply: standardApply
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

function validSets() {
    let result = [];

    for (let i = 0; i < curState.transitions.length; i++) {
        let t = curState.transitions[i];
        
        if (!t.valid || (t.valid(stateHistory))) {
            if (!t.weight) {
                t.weight = 1.0;
            };
            result.push(t);
        }
    }

    return result;
}

function chooseSet() {
    let set = -1;
    let options = validSets();

    let maxWeight = 0;

    for (let i = 0; i < options.length; i++) {
        maxWeight += options[i].weight;
    }

    do {
        let rand = Math.random() * maxWeight;
        let compound = 0;

        for (let i = 0; i < options.length; i++) {
            compound += options[i].weight;

            if (rand <= compound) {
                set = options[i].to;
                break;
            }
        }

    } while (isSetOption(set) && (options.length > curOptions.length || (states[set].words.length === 1)));

    return set;
}

function chooseWord(state) {
    if (state.words.length === 1) {
        return state.words[0];
    }

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

        var dispWord = word;
        if (states[state].modifier) {
            dispWord = "+ " + word;
        }

        button.text(toView(dispWord));
        button.off("click");
        button.click(function () {
            let toAdd = word;

            sentence = states[state].apply(sentence, word);
            stateHistory.unshift(state);
            $("#sentence_display").text(toView(sentence));

            rerolls.current = Math.min(rerolls.current + 1, rerolls.max);
            $("#reroll_text").text("Rerolls: " + rerolls.current);
            [1, 2, 3, 4].forEach(function (t) {
                $("#magic_" + t).show();
            });

            if (states[state].modifier) {
                reroll(index);
            } else {
                enterState(state);
            }
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

            reroll(index);
        });
    });
}

function reroll(index) {
    curOptions.splice(index, 1);

    var set = chooseSet();
    curOptions.push({
        set: set, word: chooseWord(states[set])
    });

    updateOptionButtons();
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
        window.location.replace(host + "/play?name=" + escape(name));
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
            

        } else if (json.role === 1) {
            roleP.innerHTML = "Victim: YOU";
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
        insult: escape(toView(sentence))
    };

    clearInsult();
    httpPostAsync(getUpdateUrl(), showUpdateResponse, JSON.stringify(obj));

}

function clearInsult() {
    sentence = "";
    stateHistory = [];
    $("#sentence_display").text("");
    enterState(INTERJECT_NOUN);
}

function startGame() {
    httpPostAsync(getUpdateUrl(), showUpdateResponse, null);
    window.setInterval(function () {
        httpPostAsync(getUpdateUrl(), showUpdateResponse, null);
    }, 1000);

    clearInsult();
}

function die() {
    window.location.href = "https://www.google.com";
}
