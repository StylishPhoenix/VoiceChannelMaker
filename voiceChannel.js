const { Client, GatewayIntentBits } = require('discord.js');
const config = require('./config.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates]});

const monitoredChannelId = config.channelId;

client.on('ready', async () => {
    console.log(`Bot has connected to Discord!`);
});

client.on('voiceStateUpdate', (oldState, newState) => {
  console.log('New state:', newState.channel.id);
  console.log('Monitored channel ID:', monitoredChannelId);
  if (newState.channel && newState.channel.type === 'voice' && newState.channel.id === monitoredChannelId) {
    newState.guild.channels.create('New Voice Channel', {
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
});

client.on('voiceStateUpdate', (oldState, newState) => {
  if (oldState.channel && oldState.channel.type === 'voice' && oldState.channel.id === monitoredChannelId) {
    const voiceChannel = oldState.channel;
    const members = voiceChannel.members.filter((member) => !member.user.bot);
    if (members.size === 0) {
      voiceChannel.delete();
    }
  }
});

client.login(config.token);
