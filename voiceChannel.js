const { Client, GatewayIntentBits } = require('discord.js');
const config = require('./config.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildPresences]});

const monitoredChannelId = config.channelId;

client.on('ready', async () => {
    console.log(`Bot has connected to Discord!`);
});

client.on('voiceStateUpdate', (oldState, newState) => {
  console.log('New state:', newState.channel ? newState.channel.id : 'None');
  console.log('Monitored channel ID:', monitoredChannelId);

  // Check if the user joined the monitored voice channel
  if (newState.channel && newState.channel.type === 'voice' && newState.channel.id === monitoredChannelId) {
    let gameName = "New Voice Channel";
    if (newState.member.presence.activities.length > 0) {
      const activity = newState.member.presence.activities.find(act => act.type === 'PLAYING');
      if (activity) {
        gameName = activity.name;
      }
    }

    newState.guild.channels.create(gameName, {
      type: 'voice',
      userLimit: 2,
      parent: newState.channel.parent,
      permissionOverwrites: [
        {
          id: newState.guild.roles.everyone.id,
          deny: ['VIEW_CHANNEL'],
        },
        {
          id: newState.member.id,
          allow: ['MANAGE_CHANNELS', 'MANAGE_ROLES'],
        },
      ],
    }).then((channel) => {
      channel.updateOverwrite(newState.member.id, {
        MANAGE_CHANNELS: true,
        MANAGE_ROLES: true,
      });

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
