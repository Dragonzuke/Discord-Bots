const { promptMessage } = require("../../functions");
const { RichEmbed } = require("discord.js");
const ms = require("ms");
const { stripIndents } = require("common-tags");
const fs = require("file-system");

let users = require("../../users.json");

module.exports = {
    name: "unmute",
    category: "moderation",
    run: async (client, message, args) => {
        const logChannel = message.guild.channels.find(channel => channel.name === "logs") || message.channel;
        if(message.deletable) message.delete();

        if(!message.member.hasPermission("MANAGE_MESSAGES")) return message.reply("❌ You don't have permission to use this.");
        if(!message.guild.me.hasPermission("MANAGE_MESSAGES")) return message.reply("❌ I don't have permission to use this.");
        if(!args[0]) return message.reply("Please provide a person to mute.");
        if(!args[1]) return message.reply("Please provide a time for mute.");
        if(!args[2]) return message.reply("Please provide a reason for mute.");

        const toMute = message.mentions.members.first() || message.guild.members.get(args[0]);
        const muteRole = message.guild.roles.find("name", "Muted");

        if(!toMute) return message.reply("Couldn't find that member.");
        if(!muteRole) return message.reply("Couldn't find the mute role. Please make it manually.");

        await toMute.removeRole(muteRole.id);
        const unmuteEmbed = new RichEmbed()
            .setColor("#ff6e00")
            .setThumbnail(toMute.user.displayAvatarURL)
            .setFooter(message.member.displayName, message.author.displayAvatarURL)
            .setTimestamp()
            .setDescription(stripIndents`**> Unmuted Member:** ${toMute}
                        **> Unmuted By:** ${message.author}`);
        await logChannel.send(unmuteEmbed);
    }
};