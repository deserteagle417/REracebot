const tmi = require('tmi.js');
const race = require("./race.mjs");
require('dotenv').config();

// Define configuration options
const opts = {
    identity: {
        username: process.env.BOT_USERNAME,
        password: process.env.OAUTH_TOKEN
    },
    channels: process.env.BOT_CHANNELS.split(',')
};

// Create a client with our options
const trigger = process.env.BOT_TRIGGER;
const client = new tmi.client(opts);
const race_plugin = new race(client);
race_plugin.set_trigger_character(trigger);

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect to Twitch:
client.connect();

// Called every time a message comes in
function onMessageHandler (channel, userstate, msg, self) {
    if (self) { return; } // Ignore messages from the bot

    if (msg.charAt(0) !== trigger) {
        return;
    }

    // Remove trigger & whitespace from chat message
    const commandName = msg.substr(1).split(' ')[0].trim();
    const username = userstate.username;

    switch(commandName) {
        case "open":
            race_plugin.open(channel, username);
            break;

        case "join":
        case "enter":
            race_plugin.join(channel, username);
            break;

        case "unjoin":
            race_plugin.unjoin(channel, username);
            break;

        case "start":
            race_plugin.start(channel, username);
            break;

        case "forfeit":
        case "quit":
            race_plugin.forfeit(channel, username);
            break;

        case "done":
            race_plugin.done(channel, username);
            break;

        case "end":
            race_plugin.end(channel, username);
            break;

        case "restart":
        case "reset":
            race_plugin.restart(channel, username);
            break;

        case "entrants":
            race_plugin.shoutout(channel);
            break;

        case "bop":
            const bopped_user = msg.split(' ')[1];
            race_plugin.bop_user(channel, username, bopped_user);
            break;

        case "howtorace":
            race_plugin.how_to(channel);
            break;

        case "test":
            race_plugin.test(channel,username);
            break;

        case "debug":
            race_plugin.debug(channel);
            break;

        default:
            console.log(username, msg);
            break;
    }
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
    console.log(`* Connected to ${addr}:${port}`);
}
