const { RichEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");

module.exports = {
    name: "clear",
    aliases: ["purge", "nuke"],
    category: "moderation",
    run: async (client, message, args) => {
        if(message.deletable) message.delete();

        if(!message.member.hasPermission("MANAGE_MESSAGES")) return message.reply("❌ You don't have permission to do this.");
        if(!message.guild.me.hasPermission("MANAGE_MESSAGES")) return message.reply("❌ I don't have permission to do this.");
        if(isNaN(args[0]) || parseInt(args[0]) <= 0) return message.reply("I didn't know letters are numbers.");

        let deleteAmount;

        if(parseInt(args[0]) > 100) deleteAmount = 100;
        else deleteAmount = parseInt(args[0]);

        await message.channel.bulkDelete(deleteAmount, true)
            .then(deleted => message.channel.send(`I deleted \`${deleted.size}\` messages.`))
            .catch(err => message.reply(`Something horrible has happened. Please contact Zuke about it. Error: ${err}`));
    }
};