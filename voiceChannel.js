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
     console.log('New state:', newState.channel ? newState.channel.id : 'None');
  console.log('Monitored channel ID:', monitoredChannelId);

    const member = await newState.guild.members.fetch(newState.member.id);
    let gameName = "New Voice Channel";

    if (member.presence.activities.length > 0) {
      const activity = member.presence.activities.find(act => act.type === 'PLAYING');
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
