// game.js for Perlenspiel 3.2

// The "use strict" directive in the following line is important. Don't alter or remove it!
"use strict";

// The following comment lines are for JSLint/JSHint. Don't alter or remove them!

/*jslint nomen: true, white: true */
/*global PS */

/*
This is a template for creating new Perlenspiel games.
All event-handling functions are commented out by default.
Uncomment and add code to the event handlers required by your project.
*/

/*
PS.init( system, options )
Called once after engine is initialized but before event-polling begins.
[system] = an object containing engine and platform information; see API documentation for details.
[options] = an object with optional parameters; see API documentation for details.
*/

// Uncomment the following BLOCK to expose PS.init() event handler:


class State{

    //choices = {string, string}[]
    constructor(prompt, choices, onEnter){
        this.prompt = prompt;
        this.choices = choices;
        this.onEnter = onEnter;
    }

    goto(choice){
        let result = this.choices.find(function (cho) {
            return cho.prompt == choice;
        }).result;

        let s = states.find(function (s) {
             return s.prompt.startsWith(result);
        });

        // PS.debug(s);

        return s;
    }
};

var states = [new State("It's a normal, bright, sunny day in Dunwich. The stars are shining, the ground is singing, all in all, an average .̸̢̡̢̧̡̢̛̛͎̳̬̺̰̥͍̜̟̞̦̬͖̟̜͎̯̣̗̥̮̦̺̮̗̥̭̦̘͎̬̟̲̘̭͈̰̭̫̤͓̦͎̺̩͕̹͇̗͚̠̤̠̟̞͉̭̱̹̺̠̤̞̠̞̝̠͚̤͎̬̹̪͍̰͉̫̘̫̙̝̅̐̀͊̐͐̈́̓̊̃̋͋̐̇̽̍̃̽́̅̇̍̍̈́͑̓͋̐̉́̆̀̈́̀̓̔̑̇͐̈́̈̈́͆̉̃̏͐̎̈́̃̐̾̅̓͋̆̈́̃̈́̀̋́̍́͌̽̑̓̔́͒͐͆̏̊̐̾̎̅̐̋̇̓̓̄͂̇̓̀̉̇͊͂̃̇̽̾͐̍̿̇̈́͑͛̏̑͌̋̐̉̂̊̈́̀́̌̒́̈́̊̐̆̀̑̄̓͒̄͊͗̏̇̈́̈́̍͆͘̕̚̚͘̕͘̕̚͜͝͝͝͠͝͝ͅ.̷̡̧̡̛̛̛̛̲̟̲̖̝̭̺̻̪̪̘̮̤̫͙̤̙̜̗̤̱̱̞̩͇̠̗̙͕̟̻̠̣̤̘̯͗́̃͋̇̍̐̽̀͂́̅̊͌͌̉̆̍̌̊̍͐̓̃̌͊̇̓̅͒̀̆̈́͆͌͋̌͋̽͛̒̊͗͋̔̉͒̈́̅͂̌̉̍̀̋̆̾̈́̂̎̓̄̽̒̂́͆͐͛̾̈́̽͆̉̎̅̂̌̈͐̓̐̎̀̒̃̑̓͒̉̈́̽̇͂̀̄̾̅̃̈́̐̑́̾̔̎͆̒̊͒̽̀́̓̐͆͐̃̃̌̋̎̓̐̓̓̍͆̎̇́̀̈̊͐͋̊̔̍͋̌̀̔͂̋̿̑̿͋̂̄̎̆̃̓́̊̊̈͗̂͒̋̀̂̾̓̽͗́͌͛̆́̈́̽̈́̅̐̈͆̀̍͋̒̈́̍̐̉̅̊̇̒̋̈́̌̀̾̄̓͛̆̆̊́̒́̊̎͗̔̇̉̔̑͊̚̚̕̕̕͘͘̕̚͘͘͘̚̚̚̕̚̚͜͜͝͝͠͠͠͝͝͠͠͠͝͝͝͝͝͝͝͝͝͠͝͝ͅ.̴̡̧̡̧̡̡̧̡̡̡̧̨̨̧̡̛̛̛̛̛̛̛̛̛͇̭͉͚̦̟̘̣͍͈͙̭͕͔̯̱̼̺͎̠̭͍͈̻̙̖̫̠̗͔̗͕͇̲̭̝͎̦͕̫͎̭̘̬͍̞̫̬̭͕̗̺̩͓̳̺̻̞̬̫͓̮͕͉͖̣̺̣̯͍͓͎͍̪͓̫̬̼̼̬̰͚͙̼̺̘̪̙̭̯̝̰̮͚̤͉̪̬͉̮̘͉̦͈͇̦̲̪̤̙̦̠̪̫͕͙͓͓̫͇̲̼͔̬͎̬̮̫̱̙̲̗̼͙̰̣̺͇̞͖̪͔͉̫̝̬͉̮̰͖̺̬̪̝̳͔̩͚̱͔͍͛̾̃̈́̽͗̍͋̄̈́̌̉͑͊̾͆͒̏̓̈͒̀̈́͌͌͌̿̀̈͂̋͑́́̐̇̎̑͐͑̔̓́̓̑̄̐͒͐̒̈́̔͋̂̃͐̐́͑͋̉̄͌̈́̄͋͆̅͒͆̌́̇͗̾̈́̓̉̔̔̌̃̀͂̒̉́̇̏̋͊̽̐̃́̄̈́̔͒̐͌̅͛͋͆̅͒̾̒͗̀̐̉̓̍̀̓͌̑̓̄͑̿̀͑͛̃̾̎̓̅̂̑̀͌͋́́͌̽͂͋͂̆̈́̐̔̈́͌̈́̉̐͑̆̊̐̄̈́͋͒̊͋͆̊̈̄̆̽̉̈͆́̃͋͐̑͋̎͂́̉͋͗͒̽͌̀͑̄̅́̋̎̿͊̉̂́̎͒̎͊̑͑̀̓̋̀͂͛̆̉͘̚̚̚͘̚͘̕̚̚͘̕̕̚̚̕̕̚̚̚͜͜͜͝͝͝͝͠͝͝͝͝͠͠͠͝͠͝͠͝͝͠͝͝͝͝͠͝͝ͅͅͅͅͅ.̸̧̨̡̧̢̨̨̧̡̨̨̧̡̢̧̧̨̧̢̨̢̧̧̡̨̧̡̨̢̢̡̛̛̛̛̼̻̩͕̬̣̖̙̫̼̲̲̦̜͉̙͈͙͍̗̼͉̪̼̯̜̲̜̫̘̬̹̪̹̟̫̜̲͖̬̖̙͓̦̹̹̜̥̲̻̬̖͇̺̫̞̞̬̠͇͇̞͙̘̬̬̳͉̥̖̳̜̹͍̥̲͙͙̞͎̖̠̬͎̞̖̖̬̯̼̺̤͍̲̘̤̜̳͕͍̠͈̦̮̤̩͚̗͇͙̱̹͇͈̖͙̖̮̦̞̗͈̝̟͉͔̟̝̳̼̰̦͍͙̰͕̣͖̣̟̰̙̗̲̺̗͔͔͇̦̟̲̪̪͈̻͍̹͖̦̩̬̳̫̘̤͓̦̯̟̤͈̩͈̜͕̬͓̖̹̝̠̘̬̩̭͓̼͚̳͓͍̮̪͚̪͕͙͇̮̘̬͕̺̭͖͚̼̲̰̖̳͙̬̳̣̮̖͎͙̤̩̲̲͚̟͓͇̯̝̫̺̂͂̐̋̑̂̎̏̂̊̀͊͌̒́̑͆̂́͌̄͊͒͊̈̈́͗̑͐́͐̍̆̑͂̀̑͋̓̆̐̌͑̄͋̊̈́͗͑̂͂̈́͊̓́͑̿́̌̑̇̓̔̋̇̎̾͋̌̄̂̅̽̈́͊̽̄̀̓̓̀͋̏͌̿̽̆̾̋̀̃̓͑͆͊̉̓̽͗̽̈̏̄̿̓̃̔͒͗̀̔̀̿͑̈́͐͌̋͋̅̀̓̏̄̈́̏̃̓̆̏̀̈́́͐͂̏͊̾͐͆̋̌͋͒͗̎̿͌͐̀͛͛͑̀̀̾̏̍̌͛̊̽̄̋̎̃̀̌̂̽̈́̋̑̔̓̋̀̅̿̍̃̉̆̽͂͑̎͂̀̌̎̆̈́̎͋̀̿̎͌͋̿͊̓̀̎̉͛̍́̅́͆͘̕̕̚̕͘̕͘͘̚͜͜͜͜͜͜͜͝͝͝͠͝͝͝͠͝ͅͅͅͅͅͅͅͅͅͅ.̶̨̧̧̡̡̡̡̡̡̢̨̧̡̨̢̨̢̧̛̻̭̘̯̳͖͎̪͉͍̥̭̩̟͎̮̙͕͎̣͓͕̝̗̩̹̲̠̭̫̯̻̠̘̗͓̦̯̟͚̭̫͍̬̤͇̫̲͕̭̲̗̭̱̙͚̫͓̞͚͚̲̥͉̰̖̘̖̺̤̰̬̭͇͈͚̹̻̝̥͔̭̮̻͍̪̲̦̳̹͎̺͕͉͕̬̺͍̩̯̳͔̠͖̹͔̝̠̩͈̹̒̇͌̄̀̋̈́͒͂̉̂̾́͛̀̾̐̆͆̀̐̄͗͂̇̉͊̽͛̃̾͐̊̊̀͘̕̚͜͜͜͝͠ͅͅ.̸̧̧̧̧̡̨̨̧̧̡̡̧̧̡̧̨̢̢̢̢̧̢̧̛̛̛͍̭͉̩͇͎̻͉̣̭̘̱̠͕̫̹͚̗̠̪̣̟̥̫̺͍͓̣̝̪̯̠̹̩̥͚̼̳͓͉͍̟̮͚̪̝̰̺̤̳̪͖̼̟̯͉̟͇̫̪͖̼̻̰̳̻͍̯̞̣̼̲̤̪̦͈͕͈̜̻̤̬͇͍̦̮͕͔͖̙̲̥̬̥͔̫̭̼̹̤̝̬̲̭̫͉̙͉͎̣̭̼̳̫̮̺̱̟̬̫̮̯͇̺̞̺̹̗̲͍͉̭̹̠̖̦̯̦̰̙͓̤̱͔̟̠̹̯̏̂̒͗̽̈̓̋̓̈́̐̓͐̍́͌̋̌͋́̈́̍͑̀͋̇̈̀͂̑̀̂̋̃̑̈́̅̎̍̄͂͗͒̂͐̃͐̈́̀̃͌̉̅̉̇̃̇̀̃̄͛͂̊̏̏̀̔̈́͛̓̉̿̏͊͋͗̇͛͌̈́̿́͛͛̀̆̃͒͋́̈̉̒̃̈̍̌̈͌́̎̊̌͋̒͗̈́̿̅́̆͑̈́͑̍͊̒̎͐̆̐́̈́͗͊́̈́̓͊̒͂̾̌̂̅̇̔̃̐͂̃̎̆͗̎̿̉̌̏͂̋̔̂̆̏̏̚̚̚͘̕̚̚̕̕̚͜͜͜͜͜͜͜͝͝͝͝͠͠ͅ.̶̛̛̗̇͛̓͆̒̔́̉̂͆͗͂̋̽͛͂͌̊̈́̑̐̅́͗̒͌̄̒̉͒̇̽́͑̓̋͂̄͂̈́̀̊͑̎͗̔͆͛̉̈́̾͋̆̆͗̉̋̈́͐̈́̊̆͊̈͆̒͌̐͊̒̑̅̋͌͊́̔͛̒̓̂̊̀̎̇́́̋͂̄̂̌͗̂̊͑͆̏̔̇͋̐͛̆̈̈́͌̆͛́̄̽̓͑̆͗͛̊͗̀̓̂̾̎͂̈́͗̄̅́̇̈́͗͊͆̒̋̀̔̔̈͗̏̽̊͐͐͑̈́̍̿̂̉̋̌̍̀͘͘͘̚͘̚̕̕̚͘͠͠͝͝͠͝͝͝͝day.",
    [{prompt:"See girlfriend", result:"You skip down"}, {prompt:"Stay inside", result:"Lame"}]),

    new State("You skip down the street, making sure to step over the thing on your doorstep, you see her in the distance.",
        [{prompt:"Ogle her", result:"Your eyes swell"}, {prompt:"Wave to her", result:"She s..s you, and w.v.es back"}]),
    new State("Lame. You go to bed, and your pointless existence continues, blissfully ignorant", [{prompt:"Continue.", result:"Lame"}]),

    new State("Your eyes swell up at the shape of her ̈́̓̊̃̋͋̐̇̽̍̃̽́̅̇̍̍̈́͑̓͋̐̉́̆̀̈́̀̓̔̑̇͐̈́̈̈́͆̉̃̏͐̎̈́͘̕̚̚͝body. They don't stop swelling.", [], fuckitup),
    new State("She s..s you, and w.v.es back. You can hear her call.", [{prompt:"Go on date", result:"You go on your date"},{prompt:"Go on date", result:"You go on your date"},{prompt:"Go on date", result:"You go on your date"},{prompt:"Go on date", result:"You go on your date"},{prompt:"Go on date", result:"You go on your date"},{prompt:"Go on date", result:"You go on your date"}]),
    new State("You go on your date, as was determined long ago. Where do you want to go?",
        [{prompt:"Hiking",result:"The crusted peaks"}, {prompt:"For Coffee", result:"A brief respite against"}, {prompt:"The Flesh", result:"Mouth meets writhing flesh"}]),

    new State("The crusted peaks stretch past comprehension, thus is the brief foretaste of your voyage.", [{prompt: "Push on", result:"You grasp her protuberance"}]),
    new State("You grasp her protuberance in your hand as your ascent begins. She clutches it.", [{prompt: "Take a break", result:"Stargazing"}]),
    new State("Stargazing. She always talks about the stars, the stars, the stars. She shimmers as she watches", [{prompt: "Have a favorite?", result:"She excitedly lists"}]),
    new State("She excitedly lists off a bunch of names, usually weird ones with hyphens and such. You don't really get it, but her smile is.... it is.", [{prompt: "Kiss her.", result:"Your lips"}]),
    new State("Your lips meet her .̧̆̍̊̑ͭ̌̾͋̓̈͐̆̄҉̸̞̦͔̫̝̘̟̘̪̼͙̩̞͖̟̕ͅ[̫̞̠̞͔͇͇̹̘̭͖̻̈́͑̊̊ͣͯ̃͟]̰̠̳͎̩̪͉͙̪͓͍̈́̈͌ͣ͐͗́ͭ̐̇̆ͪͫ̊̆́̚͠:̜̩̖͉̣̗̺̦̲͇̝̤̞̟͇ͣͮ͂͂̊̐ͣ̂ͤ͒̐͆̀͑́̀ͅ:̛̥̺̯̱ͦͮ͊̒ͪ́ͦ͑ͫ́͟<̡̖͚̦̮̦͖̗̖̟͍͙̒ͬͤ̅̃͗̌́ͣͮ̓̄̒͛ͣͫ́́͠ͅ and you both lay down, washed away in the sea of stars",[],function () {
       PS.timerStart(33, function () {
           PS.color(PS.random(15), PS.random(15), PS.COLOR_WHITE);
       })
    }),

    new State("A brief respite against the cold sea air, you take your enterprise to Starbucks. ...e always loved stars",
        [{prompt:"Your day?", result:"Aeons pass"}, {prompt:"I love you", result:"You d"}]),
    new State("Aeons pass as she gives her answer. You hear her wisdom. Your coffee is cold.",
        [{prompt:"Drink it.", result:"Iron."}]),
    new State(new Array(50).fill("You don't. ",0,50).join(".̸̢̡̢̧̡̢̛̛͎̳̬̺̰̥͍̜̟̞̦̬͖̟̜͎̯̣̗̥̮̦̺̮̗̥̭̦̘͎̬̟̲̘̭͈̰̭̫̤͓̦͎̺̩͕̹͇̗͚̠̤̠̟̞͉̭̱̹̺̠̤̞̠̞̝̠͚̤͎̬̹̪͍̰͉̫̘̫̙̝̅̐̀͊̐͐̈́̓̊̃̋͋̐̇̽̍̃̽́̅̇̍̍̈́͑̓͋̐̉́̆̀̈́̀̓̔̑̇͐̈́̈̈́͆̉̃̏͐̎̈́̃̐̾̅̓͋̆̈́̃̈́̀̋́̍́͌̽̑̓̔́͒͐͆̏̊̐̾̎̅̐̋̇̓̓̄͂̇̓̀̉̇͊͂̃̇̽̾͐̍̿̇̈́͑͛̏̑͌̋̐̉̂̊̈́̀́̌̒́̈́̊̐̆̀̑̄̓͒̄͊͗̏̇̈́̈́̍͆͘̕̚̚͘̕͘̕̚͜͝͝͝͠͝͝ͅ.̷̡̧̡̛̛̛̛̲̟̲̖̝̭̺̻̪̪̘̮̤̫͙̤̙̜̗̤̱̱̞̩͇̠̗̙͕̟̻̠̣̤̘̯͗́̃͋̇̍̐̽̀͂́̅̊͌͌̉̆̍̌̊̍͐̓̃̌͊̇̓̅͒̀̆̈́͆͌͋̌͋̽͛̒̊͗͋̔̉͒̈́̅͂̌̉̍̀̋̆̾̈́̂̎̓̄̽̒̂́͆͐͛̾̈́̽͆̉̎̅̂̌̈͐̓̐̎̀̒̃̑̓͒̉̈́̽̇͂̀̄̾̅̃̈́̐̑́̾̔̎͆̒̊͒̽̀́̓̐͆͐̃̃̌̋̎̓̐̓̓̍͆̎̇́̀̈̊͐͋̊̔̍͋̌̀̔͂̋̿̑̿͋̂̄̎̆̃̓́̊̊̈͗̂͒̋̀̂̾̓̽͗́͌͛̆́̈́̽̈́̅̐̈͆̀̍͋̒̈́̍̐̉̅̊̇̒̋̈́̌̀̾̄̓͛̆̆̊́̒́̊̎͗̔̇̉̔̑͊̚̚̕̕̕͘͘̕̚͘͘͘̚̚̚̕̚̚͜͜͝͝͠͠͠͝͝͠͠͠͝͝͝͝͝͝͝͝͝͠͝͝ͅ.̴̡̧̡̧̡̡̧̡̡̡̧̨̨̧̡̛̛̛̛̛̛̛̛̛͇̭͉͚̦̟̘̣͍͈͙̭͕͔̯̱̼̺͎̠̭͍͈̻̙̖̫̠̗͔̗͕͇̲̭̝͎̦͕̫͎̭̘̬͍̞̫̬̭͕̗̺̩͓̳̺̻̞̬̫͓̮͕͉͖̣̺̣̯͍͓͎͍̪͓̫̬̼̼̬̰͚͙̼̺̘̪̙̭̯̝̰̮͚̤͉̪̬͉̮̘͉̦͈͇̦̲̪̤̙̦̠̪̫͕͙͓͓̫͇̲̼͔̬͎̬̮̫̱̙̲̗̼͙̰̣̺͇̞͖̪͔͉̫̝̬͉̮̰͖̺̬̪̝̳͔̩͚̱͔͍͛̾̃̈́̽͗̍͋̄̈́̌̉͑͊̾͆͒̏̓̈͒̀̈́͌͌͌̿̀̈͂̋͑́́̐̇̎̑͐͑̔̓́̓̑̄̐͒͐̒̈́̔͋̂̃͐̐́͑͋̉̄͌̈́̄͋͆̅͒͆̌́̇͗̾̈́̓̉̔̔̌̃̀͂̒̉́̇̏̋͊̽̐̃́̄̈́̔͒̐͌̅͛͋͆̅͒̾̒͗̀̐̉̓̍̀̓͌̑̓̄͑̿̀͑͛̃̾̎̓̅̂̑̀͌͋́́͌̽͂͋͂̆̈́̐̔̈́͌̈́̉̐͑̆̊̐̄̈́͋͒̊͋͆̊̈̄̆̽̉̈͆́̃͋͐̑͋̎͂́̉͋͗͒̽͌̀͑̄̅́̋̎̿͊̉̂́̎͒̎͊̑͑̀̓̋̀͂͛̆̉͘̚̚̚͘̚͘̕̚̚͘̕̕̚̚̕̕̚̚̚͜͜͜͝͝͝͝͠͝͝͝͝͠͠͠͝͠͝͠͝͝͠͝͝͝͝͠͝͝ͅͅͅͅͅ.̸̧̨̡̧̢̨̨̧̡̨̨̧̡̢̧̧̨̧̢̨̢̧̧̡̨̧̡̨̢̢̡̛̛̛̛̼̻̩͕̬̣̖̙̫̼̲̲̦̜͉̙͈͙͍̗̼͉̪̼̯̜̲̜̫̘̬̹̪̹̟̫̜̲͖̬̖̙͓̦̹̹̜̥̲̻̬̖͇̺̫̞̞̬̠͇͇̞͙̘̬̬̳͉̥̖̳̜̹͍̥̲͙͙̞͎̖̠̬͎̞̖̖̬̯̼̺̤͍̲̘̤̜̳͕͍̠͈̦̮̤̩͚̗͇͙̱̹͇͈̖͙̖̮̦̞̗͈̝̟͉͔̟̝̳̼̰̦͍͙̰͕̣͖̣̟̰̙̗̲̺̗͔͔͇̦̟̲̪̪͈̻͍̹͖̦̩̬̳̫̘̤͓̦̯̟̤͈̩͈̜͕̬͓̖̹̝̠̘̬̩̭͓̼͚̳͓͍̮̪͚̪͕͙͇̮̘̬͕̺̭͖͚̼̲̰̖̳͙̬̳̣̮̖͎͙̤̩̲̲͚̟͓͇̯̝̫̺̂͂̐̋̑̂̎̏̂̊̀͊͌̒́̑͆̂́͌̄͊͒͊̈̈́͗̑͐́͐̍̆̑͂̀̑͋̓̆̐̌͑̄͋̊̈́͗͑̂͂̈́͊̓́͑̿́̌̑̇̓̔̋̇̎̾͋̌̄̂̅̽̈́͊̽̄̀̓̓̀͋̏͌̿̽̆̾̋̀̃̓͑͆͊̉̓̽͗̽̈̏̄̿̓̃̔͒͗̀̔̀̿͑̈́͐͌̋͋̅̀̓̏̄̈́̏̃̓̆̏̀̈́́͐͂̏͊̾͐͆̋̌͋͒͗̎̿͌͐̀͛͛͑̀̀̾̏̍̌͛̊̽̄̋̎̃̀̌̂̽̈́̋̑̔̓̋̀̅̿̍̃̉̆̽͂͑̎͂̀̌̎̆̈́̎͋̀̿̎͌͋̿͊̓̀̎̉͛̍́̅́͆͘̕̕̚̕͘̕͘͘̚͜͜͜͜͜͜͜͝͝͝͠͝͝͝͠͝ͅͅͅͅͅͅͅͅͅͅ.̶̨̧̧̡̡̡̡̡̡̢̨̧̡̨̢̨̢̧̛̻̭̘̯̳͖͎̪͉͍̥̭̩̟͎̮̙͕͎̣͓͕̝̗̩̹̲̠̭̫̯̻̠̘̗͓̦̯̟͚̭̫͍̬̤͇̫̲͕̭̲̗̭̱̙͚̫͓̞͚͚̲̥͉̰̖̘̖̺̤̰̬̭͇͈͚̹̻̝̥͔̭̮̻͍̪̲̦̳̹͎̺͕͉͕̬̺͍̩̯̳͔̠͖̹͔̝̠̩͈̹̒̇͌̄̀̋̈́͒͂̉̂̾́͛̀̾̐̆͆̀̐̄͗͂̇̉͊̽͛̃̾͐̊̊̀͘̕̚͜͜͜͝͠ͅͅ.̸̧̧̧̧̡̨̨̧̧̡̡̧̧̡̧̨̢̢̢̢̧̢̧̛̛̛͍̭͉̩͇͎̻͉̣̭̘̱̠͕̫̹͚̗̠̪̣̟̥̫̺͍͓̣̝̪̯̠̹̩̥͚̼̳͓͉͍̟̮͚̪̝̰̺̤̳̪͖̼̟̯͉̟͇̫̪͖̼̻̰̳̻͍̯̞̣̼̲̤̪̦͈͕͈̜̻̤̬͇͍̦̮͕͔͖̙̲̥̬̥͔̫̭̼̹̤̝̬̲̭̫͉̙͉͎̣̭̼̳̫̮̺̱̟̬̫̮̯͇̺̞̺̹̗̲͍͉̭̹̠̖̦̯̦̰̙͓̤̱͔̟̠̹̯̏̂̒͗̽̈̓̋̓̈́̐̓͐̍́͌̋̌͋́̈́̍͑̀͋̇̈̀͂̑̀̂̋̃̑̈́̅̎̍̄͂͗͒̂͐̃͐̈́̀̃͌̉̅̉̇̃̇̀̃̄͛͂̊̏̏̀̔̈́͛̓̉̿̏͊͋͗̇͛͌̈́̿́͛͛̀̆̃͒͋́̈̉̒̃̈̍̌̈͌́̎̊̌͋̒͗̈́̿̅́̆͑̈́͑̍͊̒̎͐̆̐́̈́͗͊́̈́̓͊̒͂̾̌̂̅̇̔̃̐͂̃̎̆͗̎̿̉̌̏͂̋̔̂̆̏̏̚̚̚͘̕̚̚̕̕̚͜͜͜͜͜͜͜͝͝͝͝͠͠ͅ.̶̛̛̇͛̓͆̒̔́̉̂͆͗͂̋̽͛͂͌̊̈́̑̐̅́͗̒͌̄̒̉͒̇̽́͑̓̋͂̄͂̈́̀̊͑̎͗̔͆͛̉̈́̾͋̆̆͗̉̋̈́͐̈́̊̆͊̈͆̒͌̐͊̒̑̅̋͌͊́̔͛̒̓̂̊̀̎̇́́̋͂̄̂̌͗̂̊͑͆̏̔̇͋̐͛̆̈̈́͌̆͛́̄̽̓͑̆͗͛̊͗̀̓̂̾̎͂̈́͗̄̅́̇̈́͗͊͆̒̋̀̔̔̈͗̏̽̊͐͐͑̈́̍̿̂̉̋̌̍͘͘͘̚͘̚̕̕̚͘͠͠͝͝͠͝͝͝͝"),
        [], function () {
            for(var x =0; x < 16; x+= 2){
                PS.color(x, PS.ALL, PS.COLOR_GREEN);
            }
        }),

    new State("Iron. It always is here. Her eyes are like stars.", [{prompt: "Like Stars.", result: "Stars."}]),
    new State("Stars. The ground is always stars when she's around.", [{prompt: "Hear Them?", result: "The stars."}]),
    new State("The stars. The stars are ringing an inch at a time. They smell like diamonds.", [{prompt: "Listen.", result:"\"Just another"}]),
    new State("\"Just another day at the office\", she says. \"C.thy's been a royal bitch lately...\"", [{prompt: "Sip your drink", result:"\"And to think"}]),
    new State("\"And to think all she does is slumber around, I wish she would lie eternal.\", she says as she gulps down laughter", [{prompt: "Kill your drink", result:"\"So,"}]),
    new State("\"So, want to go back to your place?", [{prompt: "Let her in", result:"You get back to"}, {prompt:"Run, run, run", result: "The earth"}]),
    new State("You get back to your home, making sure to step over the thing on your doorstep.",[],function () {
        function print_text_at(str, yval){
            var starting_x = 8 - str.length/ 2;

            str.split("").forEach(function (ch, i) {
                PS.glyph(starting_x+ i, yval, ch);
            })
        }


        print_text_at("You grab her by", 0);
        print_text_at("her fulsome", 1);
        print_text_at("appendage.", 2);
        print_text_at("She takes your", 3);
        print_text_at("hand as well.", 4);
        print_text_at("She worms up", 5);
        print_text_at("and cuddles with", 6);
        print_text_at("you, as you", 7);
        print_text_at("put on Netflix", 8);
        print_text_at("or something.", 9);

        print_text_at("GOOD END.", 13);

        PS.timerStop(flash_timer);

        for(var x = 0; x < 16; x++){
            for(var y = 0; y < 16; y++){
                let coords = [x,y];
                let color =  PS.color(coords[0], coords[1], PS.random(255),0,0);
                let inverse = [];
                PS.unmakeRGB(color, inverse);
                inverse = inverse.map(function (x) {
                    return 255 - x;
                });
                PS.glyphColor(coords[0], coords[1], PS.makeRGB(inverse[0], inverse[1], inverse[2]) );
            }
        }

    }),
    new State("The earth slips beneath your feet. You remain at the coffee table. Your date leaves, disappointed. You sink into your chair.",[],
        function () {

            PS.timerStart(100, function () {
                for(var x = 0; x < 16; x++){
                    for(var y = 15; y >= 1; y--){
                        PS.color(x,y, PS.color(x, y-1));
                    }
                }
            });
        }
    ),

    new State("Mouth meets writhing flesh, and your hands can feel the lipid texture of her ribs, it melts against your tongue",
        [{prompt:"Consume it", result:"It tastes like hyacinth."}, {prompt:"Savor it", result:"It tastes like hyacinth."}, {prompt:"Remember it", result:"It tastes like hyacinth."}]),
    new State("It tastes like hyacinth.", [{prompt:"Delicious", result:"Mouth meets writhing"},{prompt:"Delicious", result:"Mouth meets writhing"},{prompt:"Delicious", result:"Mouth meets writhing"},{prompt:"Delicious", result:"Mouth meets writhing"},{prompt:"Delicious", result:"Mouth meets writhing"},{prompt:"Delicious", result:"Mouth meets writhing"}],
        function () {
            for(var x = 0; x < 16; x++){
                for (var y = 0; y < 16; y++){
                    var colorobj = [];
                    PS.unmakeRGB(PS.color(x,y), colorobj);
                    colorobj[0] += 8;
                    PS.color(x,y, colorobj[0], colorobj[1], colorobj[2]);
                }
            }
        })
];
var current_state = states[0];

var to_display;
var flash_timer;

PS.init = function( system, options ) {
	// Uncomment the following code line to verify operation:

	// This function should normally begin with a call to PS.gridSize( x, y )
	// where x and y are the desired initial dimensions of the grid.
	// Call PS.gridSize() FIRST to avoid problems!
	// The sample call below sets the grid to the default dimensions (8 x 8).
	// Uncomment the following code line and change the x and y parameters as needed.

	PS.gridSize( 16,16 );
    PS.border(PS.ALL, PS.ALL, 0);
	// This is also a good place to display your game title or a welcome message
	// in the status line above the grid.
	// Uncomment the following code line and change the string parameter as needed.

	// PS.statusText(to_display = states[0].prompt);
    PS.statusText("Lame");
    choose(states[0]);
    flash_timer = PS.timerStart(6, function () {


        PS.glyphColor(PS.ALL, PS.ALL, PS.glyphColor(0,0) == PS.COLOR_BLACK ? PS.COLOR_WHITE : PS.COLOR_BLACK);

        do{
            PS.statusText(PS.statusText().substr(1));
         }while(PS.statusText().charCodeAt(0) > 255);
        if(PS.statusText().length < 2){
            PS.statusText(PS.statusText()+"             "+to_display);
        }
    })

    // for(var x  = 0; x < 16; x++){
    //     for(var y = 0; y < 16; y++){
    //          let color =  PS.color(x, y, PS.random(255),PS.random(255),PS.random(255));
    //     }
    // }
    PS.imageLoad("mooon.jpg", function (img) {
        PS.imageBlit(img, 0,0);
    })

    // PS.timerStart(100, function () {
    //     let coords = [PS.random(16) -1 , PS.random(16) - 1];
    //     let color =  PS.color(coords[0], coords[1], PS.random(255),PS.random(255),PS.random(255));
    //     // let inverse = [];
    //     // PS.unmakeRGB(color, inverse);
    //     // inverse = inverse.map(function (x) {
    //     //     return 255 - x;
    //     // });
    //     // PS.glyphColor(coords[0], coords[1], PS.makeRGB(inverse[0], inverse[1], inverse[2]) );
    // });


	// Add any other initialization code you need here.
};

function choose(state){
    PS.glyph(PS.ALL, PS.ALL, "");
    PS.data(PS.ALL, PS.ALL, 0);

    current_state = state;
    to_display = current_state.prompt;
    if(current_state.onEnter) {
        current_state.onEnter();
    }
    PS.statusText(".................."+to_display);

    var starting_y = 8 - state.choices.length;
    state.choices.forEach(function (choice, i) {
        print_choice_at(choice.prompt, starting_y + 2 * i);
    })

}
function print_choice_at(str, yval){
    var starting_x = 8 - str.length/ 2;

    str.split("").forEach(function (ch, i) {
        PS.glyph(starting_x+ i, yval, ch);
        PS.data(starting_x+ i, yval, str);
    })
}

function fuckitup(){
    PS.timerStart(100, function () {
    let coords = [PS.random(16) -1 , PS.random(16) - 1];
    let color =  PS.color(coords[0], coords[1], PS.random(255),PS.random(255),PS.random(255));});
}
/*
PS.touch ( x, y, data, options )
Called when the mouse button is clicked on a bead, or when a bead is touched.
It doesn't have to do anything.
[x] = zero-based x-position of the bead on the grid.
[y] = zero-based y-position of the bead on the grid.
[data] = the data value assigned to this bead by a call to PS.data(); default = 0.
[options] = an object with optional parameters; see API documentation for details.
*/

// Uncomment the following BLOCK to expose PS.touch() event handler:



PS.touch = function( x, y, data, options ) {
	// Uncomment the following code line to inspect x/y parameters:

	 // PS.debug( "PS.touch() @ " + x + ", " + y + ": " + data +"\n");

	 if(data){
	     choose(current_state.goto(data));
     }
	// Add code here for mouse clicks/touches over a bead.
};



/*
PS.release ( x, y, data, options )
Called when the mouse button is released over a bead, or when a touch is lifted off a bead
It doesn't have to do anything
[x] = zero-based x-position of the bead on the grid
[y] = zero-based y-position of the bead on the grid
[data] = the data value assigned to this bead by a call to PS.data(); default = 0.
[options] = an object with optional parameters; see API documentation for details.
*/

// Uncomment the following BLOCK to expose PS.release() event handler:

/*

PS.release = function( x, y, data, options ) {
	// Uncomment the following code line to inspect x/y parameters:

	// PS.debug( "PS.release() @ " + x + ", " + y + "\n" );

	// Add code here for when the mouse button/touch is released over a bead.
};

*/

/*
PS.enter ( x, y, button, data, options )
Called when the mouse/touch enters a bead.
It doesn't have to do anything.
[x] = zero-based x-position of the bead on the grid.
[y] = zero-based y-position of the bead on the grid.
[data] = the data value assigned to this bead by a call to PS.data(); default = 0.
[options] = an object with optional parameters; see API documentation for details.
*/

// Uncomment the following BLOCK to expose PS.enter() event handler:

/*

PS.enter = function( x, y, data, options ) {
	// Uncomment the following code line to inspect x/y parameters:

	// PS.debug( "PS.enter() @ " + x + ", " + y + "\n" );

	// Add code here for when the mouse cursor/touch enters a bead.
};

*/

/*
PS.exit ( x, y, data, options )
Called when the mouse cursor/touch exits a bead.
It doesn't have to do anything.
[x] = zero-based x-position of the bead on the grid.
[y] = zero-based y-position of the bead on the grid.
[data] = the data value associated with this bead, 0 if none has been set.
[options] = an object with optional parameters; see API documentation for details.
*/

// Uncomment the following BLOCK to expose PS.exit() event handler:

/*

PS.exit = function( x, y, data, options ) {
	// Uncomment the following code line to inspect x/y parameters:

	// PS.debug( "PS.exit() @ " + x + ", " + y + "\n" );

	// Add code here for when the mouse cursor/touch exits a bead.
};

*/

/*
PS.exitGrid ( options )
Called when the mouse cursor/touch exits the grid perimeter.
It doesn't have to do anything.
[options] = an object with optional parameters; see API documentation for details.
*/

// Uncomment the following BLOCK to expose PS.exitGrid() event handler:

/*

PS.exitGrid = function( options ) {
	// Uncomment the following code line to verify operation:

	// PS.debug( "PS.exitGrid() called\n" );

	// Add code here for when the mouse cursor/touch moves off the grid.
};

*/

/*
PS.keyDown ( key, shift, ctrl, options )
Called when a key on the keyboard is pressed.
It doesn't have to do anything.
[key] = ASCII code of the pressed key, or one of the PS.KEY constants documented at:
http://users.wpi.edu/~bmoriarty/ps/constants.html
[shift] = true if shift key is held down, else false.
[ctrl] = true if control key is held down, else false.
[options] = an object with optional parameters; see API documentation for details.
*/

// Uncomment the following BLOCK to expose PS.keyDown() event handler:

/*

PS.keyDown = function( key, shift, ctrl, options ) {
	// Uncomment the following code line to inspect first three parameters:

	// PS.debug( "PS.keyDown(): key=" + key + ", shift=" + shift + ", ctrl=" + ctrl + "\n" );

	// Add code here for when a key is pressed.
};

*/

/*
PS.keyUp ( key, shift, ctrl, options )
Called when a key on the keyboard is released.
It doesn't have to do anything.
[key] = ASCII code of the pressed key, or one of the PS.KEY constants documented at:
http://users.wpi.edu/~bmoriarty/ps/constants.html
[shift] = true if shift key is held down, else false.
[ctrl] = true if control key is held down, else false.
[options] = an object with optional parameters; see API documentation for details.
*/

// Uncomment the following BLOCK to expose PS.keyUp() event handler:

/*

PS.keyUp = function( key, shift, ctrl, options ) {
	// Uncomment the following code line to inspect first three parameters:

	// PS.debug( "PS.keyUp(): key=" + key + ", shift=" + shift + ", ctrl=" + ctrl + "\n" );

	// Add code here for when a key is released.
};

*/

/*
PS.input ( sensors, options )
Called when an input device event (other than mouse/touch/keyboard) is detected.
It doesn't have to do anything.
[sensors] = an object with sensor information; see API documentation for details.
[options] = an object with optional parameters; see API documentation for details.
NOTE: Mouse wheel events occur ONLY when the cursor is positioned over the grid.
*/

// Uncomment the following BLOCK to expose PS.input() event handler:

/*

PS.input = function( sensors, options ) {
	// Uncomment the following code lines to inspect first parameter:

//	 var device = sensors.wheel; // check for scroll wheel
//
//	 if ( device ) {
//	   PS.debug( "PS.input(): " + device + "\n" );
//	 }

	// Add code here for when an input event is detected.
};

*/

/*
PS.shutdown ( options )
Called when the browser window running Perlenspiel is about to close.
It doesn't have to do anything.
[options] = an object with optional parameters; see API documentation for details.
NOTE: This event is only used for applications utilizing server communication.
*/

// Uncomment the following BLOCK to expose PS.shutdown() event handler:

/*

PS.shutdown = function( options ) {
	// Uncomment the following code line to verify operation:

	// PS.debug( "Daisy, Daisy ...\n" );

	// Add code here for when Perlenspiel is about to close.
};

*/

/*
Perlenspiel is a scheme by Professor Moriarty (bmoriarty@wpi.edu).
Perlenspiel is Copyright © 2009-17 Worcester Polytechnic Institute.
This file is part of Perlenspiel.

Perlenspiel is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Perlenspiel is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You may have received a copy of the GNU Lesser General Public License
along with Perlenspiel. If not, see <http://www.gnu.org/licenses/>.
*/
