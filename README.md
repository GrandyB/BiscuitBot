# BiscuitBot
A small and simple Discord bot, that for a given server, allows questions to be submitted anonymously, and has an automated toggle on/off for sending messages/connecting to voice for 'everyone', as a form of server lockdown between certain hours.

## Installation

Firstly, you're going to need the latest version of NodeJS. As per the package file, this was made for NodeJS 12.x.
Once installed, there's a few files we need to add, and a few commands to run.

### Config files

There are three files required for the bot to run.

`token.json` - this contains the bot token from your Discord bot application - https://discord.com/developers/applications
Example: 
```
{
  "token": "abC123AbC123...etc"
}
```

Next are the two settings files: `liveSettings.json` and `testSettings.json` - their layout needs to include:
```
{
  "guild_id": "123456789",
  "channel_id": "123456789"
}
```
`guild_id` is the id of your Discord server, and `channel_id` is the channel where the questions anonymously submitted will end up being posted.

If you are only ever running a live copy, still make the `testSettings.json` file, but don't worry about its content - just an empty `{}` will suffice.

### Running

Now that you've got NodeJS and all the config, you now need to download all the dependencies (discordjs, basically) and run them.
NodeJS makes this easy.

Just navigate to the folder that the bot resides in, and run `npm install`

After which, assuming it grabs all the dependencies and you have a `/node_modules/` folder appear, you can then run a similar script from the same root folder, `npm start` and that will start the bot up.

### Notes

Most settings for the bot are either in the json files, or at the top of `bot.js`.
By default it checks the time every minute, locks down between 8am and 10pm (local time) and points towards the server defined in `testSettings.json`. If you want to point towards your live server, change `const TEST_SERVER = false`. You probably want `DEBUG_LOGGING` to always be true.

If deploying to the cloud, I'd recommend installing 'foreverjs' and using `forever start bot.js` to keep the script up in the background no matter what happens - it restarts on exit. Other helpful commands are `forever list` and `forever stop 123456` - where the numbers are replaced by the "PID" (process ID) that `forever list` gave you.

