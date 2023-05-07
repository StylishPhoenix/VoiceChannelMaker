const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');
const config = require('./config.json');
const letterData = require('./letterData.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMembers]});

const monitoredChannelId = config.channelId;

client.on('ready', async () => {
    console.log(`Bot has connected to Discord!`);
});

const getValidChannelName = (name) => {
  const maxLength = 100;
  const invalidCharacters = /[@#:]/g;
  const prefix = "✵┃";
  const suffix = "┃✵";
  console.log(name);
  if (!name || name.length < 2) {
    return prefix + "𝐓𝐞𝐦𝐩 𝐕𝐨𝐢𝐜𝐞" + suffix;
  }

  let validName = name.replace(invalidCharacters, "");
  validName = validName.slice(0, maxLength - (prefix.length + suffix.length));

  // Map the characters to the corresponding font data and combine
  validName = validName.split('').map(char => {
    const lowerChar = char.toLowerCase();
    return letterData[lowerChar] ? String.fromCharCode(parseInt(letterData[lowerChar], 16)) : letterData[' '];
  }).join('');
  console.log(validName);
  return prefix + validName + suffix;
};


const createdChannels = new Set();

client.on('voiceStateUpdate', async (oldState, newState) => {
  // Check if the user joined the monitored voice channel
  if (newState.channel && newState.channel.type === 2 && newState.channel.id === monitoredChannelId) {
    const member = await newState.guild.members.fetch(newState.member.id);
    let gameName = getValidChannelName(); // Assign the default channel name

    if (member.presence.activities.length > 0) {
      const activity = member.presence.activities.find(act => act.type === 'PLAYING');
      if (activity && activity.name) {
        gameName = getValidChannelName(activity.name);
      }
    }

    newState.guild.channels.create({
      name: gameName,
      type: 2,
      parent: newState.channel.parent,
      permissionOverwrites: [
        {
          id: newState.member.id,
          allow: [PermissionsBitField.Flags.ManageChannels, PermissionsBitField.Flags.ManageRoles],
        },
      ],
    }).then((channel) => {
      createdChannels.add(channel.id);
      newState.setChannel(channel);
    });
  }

  // Check if the user left any voice channel
  if (oldState.channel && oldState.channel.type === 2) {
    const voiceChannel = oldState.channel;

    // Add a delay before checking members and deleting the channel
    setTimeout(async () => {
      const updatedChannel = await oldState.guild.channels.fetch(voiceChannel.id);
      const members = updatedChannel.members;

      // Check if the channel ID is in the Set of channels created by the bot
      if (createdChannels.has(voiceChannel.id) && (members.size === 0 || members.every(member => member.user.bot))) {
        voiceChannel.delete();
        createdChannels.delete(voiceChannel.id); // Remove the channel ID from the Set after deleting the channel
      }
    }, 1000);
  }
});

client.login(config.token);
