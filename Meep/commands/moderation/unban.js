const { RichEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");

module.exports = {
    name: "unban",
    category: "moderation",
    run: async (client, message, args) => {
        const logChannel = message.guild.channels.find(channel => channel.name === "logs") || message.channel;
        if(message.deletable) message.delete();

        if(!message.member.hasPermission("BAN_MEMBERS")) return message.reply("❌ You don't have permission to use this.");
        if(!message.guild.me.hasPermission("BAN_MEMBERS")) return message.reply("❌ I don't have permission to use this.");
        if(!args[0]) return message.reply("Please provide a person to unban.").then(m => m.delete(5000));

        try {
            const banList = await message.guild.fetchBans();
            const toUnban = banList.find(user => user.id === args[0]);

            if (!toUnban) return message.reply("Couldn't find that member.");
            if (message.author.id === toUnban.id) return message.reply("But... you're already here? (Can't unban yourself)");

            message.guild.fetchBans().then(banned => {
                let list = banned.map(user => user.tag).join('\n');

                if (list.includes(toUnban.id)) {
                    const embed = new RichEmbed()
                        .setColor("#a50001")
                        .setFooter(message.member.displayName, message.author.displayAvatarURL)
                        .setTimestamp()
                        .setDescription(stripIndents`**> Unbanned Member:** ${toUnban}
                                        **> Unbanned By:** ${message.author}`);

                     message.guild.unban(toUnban);
                     logChannel.send(embed);
                } else {
                    return message.reply("That user isn't banned!");
                }
            });
        }
         catch (e) {
            console.error(e);
        }
    }
};