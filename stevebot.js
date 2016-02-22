/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          ______     ______     ______   __  __     __     ______
          /\  == \   /\  __ \   /\__  _\ /\ \/ /    /\ \   /\__  _\
          \ \  __<   \ \ \/\ \  \/_/\ \/ \ \  _"-.  \ \ \  \/_/\ \/
          \ \_____\  \ \_____\    \ \_\  \ \_\ \_\  \ \_\    \ \_\
           \/_____/   \/_____/     \/_/   \/_/\/_/   \/_/     \/_/


This is a sample Slack bot built with Botkit.

This bot demonstrates many of the core features of Botkit:

* Connect to Slack using the real time API
* Receive messages based on "spoken" patterns
* Reply to messages
* Use the conversation system to ask questions
* Use the built in storage system to store and retrieve information
  for a user.

# RUN THE BOT:

  Get a Bot token from Slack:

    -> http://my.slack.com/services/new/bot

  Run your bot from the command line:

    token=<MY TOKEN> node bot.js

# USE THE BOT:

  Find your bot inside Slack to send it a direct message.

  Say: "Hello"

  The bot will reply "Hello!"

  Say: "who are you?"

  The bot will tell you its name, where it running, and for how long.

  Say: "Call me <nickname>"

  Tell the bot your nickname. Now you are friends.

  Say: "who am I?"

  The bot will tell you your nickname, if it knows one for you.

  Say: "shutdown"

  The bot will ask if you are sure, and then shut itself down.

  Make sure to invite your bot into other channels using /invite @<my bot>!

# EXTEND THE BOT:

  Botkit is has many features for building cool and useful bots!

  Read all about it here:

    -> http://howdy.ai/botkit

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/


if (!process.env.token) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}

var Botkit = require('./lib/Botkit.js');
var os = require('os');

var controller = Botkit.slackbot({
    debug: true,
});

var bot = controller.spawn({
    token: process.env.token
}).startRTM();


controller.hears(['hello','hi'],'direct_message,direct_mention,mention',function(bot, message) {

    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'robot_face',
    },function(err, res) {
        if (err) {
            bot.botkit.log('Failed to add emoji reaction :(',err);
        }
    });


    controller.storage.users.get(message.user,function(err, user) {
        if (user && user.name) {
            bot.reply(message,'Hello ' + user.name + '!!');
        } else {
            bot.reply(message,'Hello.');
        }
    });
});

controller.hears(['call me (.*)'],'direct_message,direct_mention,mention',function(bot, message) {
    var matches = message.text.match(/call me (.*)/i);
    var name = matches[1];
    controller.storage.users.get(message.user,function(err, user) {
        if (!user) {
            user = {
                id: message.user,
            };
        }
        user.name = name;
        controller.storage.users.save(user,function(err, id) {
            bot.reply(message,'Got it. I will call you ' + user.name + ' from now on.');
        });
    });
});

controller.hears(['.giantbomb (.*)'],'direct_message,direct_mention,mention,ambient',function(bot, message) {
    var matches = message.text.match(/.giantbomb (.*)/i);
    var name = matches[1];
    name = toTitleCase(name);
    var res = matches[1].replace(" ", "%20");
    controller.storage.users.get(message.user,function(err, user) {
      if (user && user.name) {
        bot.reply(message, "Here's the Giant Bomb search results for " + name + ", " + user.name + "! http://www.giantbomb.com/search/?indices[0]=game&page=1&q=" + res);
      } else {
        bot.reply(message, "Here's the Giant Bomb search results for " + name + "! http://www.giantbomb.com/search/?indices[0]=game&page=1&q=" + res);
      }
    });
});

controller.hears(['.google (.*)'],'direct_message,direct_mention,mention,ambient',function(bot, message) {
    var matches = message.text.match(/.google (.*)/i);
    var name = matches[1];
    //name = toTitleCase(name);
    var res = matches[1].replace(" ", "+");
    controller.storage.users.get(message.user,function(err, user) {
      if (user && user.name) {
        bot.reply(message, "Here's the Google search results for " + name + ", " + user.name + "! https://www.google.com/#q=" + res);
      } else {
        bot.reply(message, "Here's the Google search results for " + name + "! https://www.google.com/#q=" + res);
      }
    });
});

controller.hears(['.wiki (.*)'],'direct_message,direct_mention,mention,ambient',function(bot, message) {
    var matches = message.text.match(/.wiki (.*)/i);
    var name = matches[1];
    name = toTitleCase(name);
    var res = matches[1].replace(" ", "_");
    controller.storage.users.get(message.user,function(err, user) {
      if (user && user.name) {
        bot.reply(message, "Here's the Wikipedia page for " + name + ", " + user.name + "! https://en.wikipedia.org/wiki/" + res);
      } else {
        bot.reply(message, "Here's the Wikipeda page for " + name + "! https://en.wikipedia.org/wiki/" + res);
      }
    });
});

controller.hears(['what can you do', 'help'], 'direct_message,direct_mention,mention', function(bot, message) {
    var response = "I, Steve, am capable of a great many things, here is a list of my current commands:\n"
      + "call me [name] will force me, against my will, to remember what to call you!\n"
      + ".giantbomb [game title] will link you to the Giant Bomb search results for [game title]\n"
      + ".google [search terms] will link you to the Google search results for [search terms]\n"
      + ".wiki [search terms] will link you to the wikipedia page for [search terms]\n"
      + "Go ahead, ask me if I am lame or dumb, I dare you!\n";
    bot.reply(message, response);
});


controller.hears(['what is my name','who am i'],'direct_message,direct_mention,mention',function(bot, message) {

    controller.storage.users.get(message.user,function(err, user) {
        if (user && user.name) {
            bot.reply(message,'Your name is ' + user.name);
        } else {
            bot.reply(message,'I don\'t know yet!');
        }
    });
});

controller.hears(['are you lame', 'are you dumb'], 'direct_message,direct_mention,mention', function(bot, message) {
  
  controller.storage.users.get(message.user,function(err,user) {
    if (user && user.name) {
      bot.reply(message,'I am Steve, omniscient and benevolent! You best watch your mouth ' + user.name + '!');
    } else {
      bot.reply(message,'I am Steve, omniscient and benevolent! You best watch your mouth pilgrim!');
    }

  });
});

controller.hears(['Benny'], 'ambient', function(bot,message) {
  bot.reply(message, 'OMG BENNY!');
});

controller.hears(['shutdown'],'direct_message,direct_mention,mention',function(bot, message) {

    bot.startConversation(message,function(err, convo) {

        convo.ask('Are you sure you want me to shutdown?',[
            {
                pattern: bot.utterances.yes,
                callback: function(response, convo) {
                    convo.say('Bye!');
                    convo.next();
                    setTimeout(function() {
                        process.exit();
                    },3000);
                }
            },
        {
            pattern: bot.utterances.no,
            default: true,
            callback: function(response, convo) {
                convo.say('*Phew!*');
                convo.next();
            }
        }
        ]);
    });
});


controller.hears(['uptime','identify yourself','who are you','what is your name'],'direct_message,direct_mention,mention',function(bot, message) {

    var hostname = os.hostname();
    var uptime = formatUptime(process.uptime());

    bot.reply(message,':robot_face: I am a bot named <@' + bot.identity.name + '>. I have been running for ' + uptime + ' on ' + hostname + '.');

});

function formatUptime(uptime) {
    var unit = 'second';
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'minute';
    }
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'hour';
    }
    if (uptime != 1) {
        unit = unit + 's';
    }

    uptime = uptime + ' ' + unit;
    return uptime;
}

function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1);});
}
