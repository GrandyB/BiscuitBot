//  This file is part of Biscuit, created by Mark "Grandy" Bishop.
//
//  Biscuit is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation, either version 3 of the License, or
//  (at your option) any later version.
//
//  Biscuit is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//
//  You should have received a copy of the GNU General Public License
//  along with Biscuit. If not, see <https://www.gnu.org/licenses/>.

const { Permissions, Client } = require('discord.js');
const client = new Client();

// Master switch for going between mass debug
const TEST_SERVER = true;
const DEBUG_LOGGING = true;

// If DEBUG_LOGGING, check every 10s, otherwise every 60s - needs milliseconds
const TIMER_TICK = (DEBUG_LOGGING ? 10 : 60) * 1000;

// 24-hr based opening/closing times, based on where this bot is being hosted
const OPENING_HOUR = 8;
const CLOSING_HOUR = 22;

/*
 * Settings files have 'guild_id' for the server, and 'channel_id' for which channel
 * messages (question submissions) should appear in.
 */
const LIVE_SETTINGS = require('./liveSettings.json');
const TEST_SETTINGS = require('./testSettings.json');
const TOKEN = require('./token.json').token; // One single property, token, from Discord app dev

let chosenSettings = TEST_SERVER ? TEST_SETTINGS : LIVE_SETTINGS;
const GUILD_ID = chosenSettings.guild_id;
const CHANNEL_ID = chosenSettings.channel_id;

var answerChannel, guild, status;

// Perform this when first connecting
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    guild = client.guilds.cache.get(GUILD_ID);
    answerChannel = guild.channels.cache.get(CHANNEL_ID);

    // When first starting up, enable everyone
    enableEveryone(true);
    console.log("Startup Complete.");

    // Start the main loop 3s later, just to ensure no timing issues from startup
    setTimeout(loop, 3000);
});

// Start the engines!
client.login(TOKEN);

// Perform this when receiving a message
client.on('message', msg => {
    // !ping - just to check if online
    if (msg.content == ("!ping")) {
        msg.reply("pong");
    }

    // Forced commands, but only when using the test server
    if (msg.content == ("!off") && TEST_SERVER) {
        enableEveryone(false);
    }
    if (msg.content == ("!on") && TEST_SERVER) {
        enableEveryone(true);
    }

    // If a private message to the bot, and starts with Q: or q:, send it to an arbitrary channel
    if (msg.guild === null && msg.content.toUpperCase().startsWith("Q:")) {
        answerChannel.send(msg.content).then(() => {
            console.log("Question passed on: " + msg.content);
            msg.react('☑️').catch(console.error);
        }).catch(console.error);
    }
});

// Central loop, defined as a var so we can setTimeout and re-run it every TIMER_TICK.
var loop = function timeLoop() {
    var cur = new Date();
    var hour = cur.getHours();
    var infoMessage = "[" + cur + "] " + "Current hour: " + hour + ". ";

    if (hour >= CLOSING_HOUR || hour < OPENING_HOUR) {
        infoMessage += "Hour is >= " + CLOSING_HOUR 
                    + " or < " + OPENING_HOUR + ". ";

        // Turn server off
        if (status) {
            infoMessage += "Turning server off.";
            enableEveryone(false);
        } else {
            infoMessage += "Server already off.";
        }
    } else {
        // Turn server on
        if (!status) {
            infoMessage += "Turning server on.";
            enableEveryone(true);
        } else {
            infoMessage += "Server already on.";
        }
    }

    // One single info message with general info.
    console.log(infoMessage);

    // Loop
    setTimeout(loop, TIMER_TICK);
}

// Enable 'SEND_MESSAGES' and 'CONNECT' for everyone, or disable them (enable = true/false).
function enableEveryone(enable) {
    console.log("enableEveryone: " + enable);
    let permissions = getEveryonePermissions();

    if (DEBUG_LOGGING) {
        console.log("All permissions:");
        console.log(permissions.toArray());
    }

    if (enable) {
        permissions.add("SEND_MESSAGES");
        permissions.add("CONNECT");
    } else {
        permissions.remove("SEND_MESSAGES");
        permissions.remove("CONNECT");
    }

    if (DEBUG_LOGGING) {
        console.log("Altered permissions:");
        console.log(permissions.toArray());
    }

    guild.roles.everyone.setPermissions(permissions)
        .then(() => {
            // Success
            if (DEBUG_LOGGING) {
                console.log("End permissions:");
                console.log(getEveryonePermissions().toArray());
            }
            status = enable;
            console.log("Status updated to: " + status);
        })
        .catch(err => {
            // Fail
            console.log("Error while setting Permissions");
            console.error(err);
            console.log("Status will remain at: " + status);
        });
}

// Slightly odd looking, but need to create a new permissions object so that it is editable
function getEveryonePermissions() {
    return new Permissions([...guild.roles.everyone.permissions.toArray()]);
}