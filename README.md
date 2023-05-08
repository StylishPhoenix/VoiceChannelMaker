# Discord Voice Channel Creator Bot

This Discord bot automatically creates voice channels based on the game a user is playing when they join a monitored voice channel. The bot will also delete the created voice channel when all users leave it.

## Features

- Creates a new voice channel with the game name when a user joins the monitored voice channel
- Sets the user who joined the monitored voice channel as the manager of the new voice channel
- Automatically deletes the created voice channel when all users leave it

## Prerequisites

- Node.js v16.6.0 or higher
- NPM v7 or higher (usually comes with Node.js)
- A Discord bot token

## Installation and Setup

1. Clone this repository or download the source code:

```
git clone https://github.com/your-repo-url/voice-channel-creator.git
```
Change the working directory to the project folder:
```
cd VoiceChannelMaker
```

Install the required dependencies:
```
npm install discord.js@latest
```
Create a config.json file in the project folder and add your Discord bot token and the monitored voice channel ID:
```
{
  "token": "YOUR_BOT_TOKEN",
  "channelId": "YOUR_MONITORED_CHANNEL_ID"
}
```
Run the bot:
```
node voiceChannel.js
```
Your bot should now be running and connected to your Discord server.

## Contributing
If you'd like to contribute, please fork the repository and submit your changes as a pull request.
