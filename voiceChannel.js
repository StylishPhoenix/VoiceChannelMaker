const { Client, GatewayIntentBits } = require('discord.js');
const config = require('./config.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMembers]});

const monitoredChannelId = config.channelId;

client.on('ready', async () => {
    console.log(`Bot has connected to Discord!`);
});

client.on('voiceStateUpdate', async (oldState, newState) => {
  // Check if the user joined the monitored voice channel
 if (newState.channel && newState.channel.type === 2 && newState.channel.id === monitoredChannelId) {
  const member = await newState.guild.members.fetch(newState.member.id);
  let gameName = "New Voice Channel";

  if (member.presence.activities.length > 0) {
    const activity = member.presence.activities.find(act => act.type === 'PLAYING');
    if (activity && activity.name) {
      gameName = getValidChannelName(activity.name);
    }
  }

  newState.guild.channels.create(gameName, {
    type: 'GUILD_VOICE', // Change to 'GUILD_VOICE'
    parent: newState.channel.parent
  }).then((channel) => {
    newState.setChannel(channel);
  });
}


  // Check if the user left any voice channel
  if (oldState.channel && oldState.channel.type === 'voice') {
    const voiceChannel = oldState.channel;
    const members = voiceChannel.members.filter((member) => !member.user.bot);
    if (members.size === 0 && voiceChannel.parentID === oldState.channel.parentID) {
      voiceChannel.delete();
    }
  }
});

client.login(config.token);
