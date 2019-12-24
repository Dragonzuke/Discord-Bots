const { promptMessage } = require("../../functions");
const { RichEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");
const fs = require("file-system");

let users = require("../../users.json");

module.exports = {
    name: "lookup",
    category: "moderation",
    run: async (client, message, args) => {
        if(message.deletable) message.delete();

        if(!message.member.hasPermission("VIEW_AUDIT_LOG")) return message.reply("❌ You don't have permission to use this.");
        if(!message.guild.me.hasPermission("VIEW_AUDIT_LOG")) return message.reply("❌ I don't have permission to use this.");
        if(!args[0]) return message.reply("Please provide a person to lookup.");

        const toLookup = message.mentions.members.first() || message.guild.members.get(args[0]);
        if(!toLookup) return message.reply("Couldn't find that member.");
        if(!users[toLookup.id]) {
            users[toLookup.id] = {
                warnings: 0,
                mutes: 0,
                bans: 0
            };
            fs.writeFileSync("./users.json", JSON.stringify(users, null, 4), (err) => {
                if(err) console.log(err);
            });
        }

        let warnings = users[toLookup.id].warnings;
        let mutes = users[toLookup.id].mutes;
        let bans = users[toLookup.id].bans;

        const embed = new RichEmbed()
            .setColor("#08ab00")
            .setTitle(`${toLookup.user.username}'s Punishment Stats`)
            .setThumbnail(toLookup.user.displayAvatarURL)
            .setFooter(message.member.displayName, message.author.displayAvatarURL)
            .setTimestamp()
            .addField("# of Warnings", `${warnings}`)
            .addField("# of Mutes", `${mutes}`)
            .addField("# of Bans", `${bans}`);

        if(warnings >= 3) embed.setColor("#fff200");
        if(mutes >= 2) embed.setColor("#ff6e00");
        if(bans >= 1) embed.setColor("#ff0e00");

        await message.channel.send(embed);
    }
};