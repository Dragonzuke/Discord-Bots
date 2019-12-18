const { promptMessage } = require("../../functions");
const { RichEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");
const fs = require("file-system");

let users = require("../../users.json");

module.exports = {
    name: "warn",
    category: "moderation",
    run: async (client, message, args) => {
        const logChannel = message.guild.channels.find(channel => channel.name === "logs") || message.channel;
        if(message.deletable) message.delete();

        if(!message.member.hasPermission("KICK_MEMBERS")) return message.reply("❌ You don't have permission to use this.");
        if(!message.guild.me.hasPermission("KICK_MEMBERS")) return message.reply("❌ I don't have permission to use this.");
        if(!args[0]) return message.reply("Please provide a person to warn.").then(m => m.delete(5000));
        if(!args[1]) return message.reply("Please provide a reason to warn.").then(m => m.delete(5000));
        const toWarn = message.mentions.members.first() || message.guild.members.get(args[0]);

        if(!toWarn) return message.reply("Couldn't find that member.").then(m => m.delete(5000));
        if(message.author.id === toWarn.id) return message.reply("Why don't you just behave? (Can't warn yourself)").then(m => m.delete(5000));
        if(!toWarn.kickable) return message.reply("Can't warn staff 😋").then(m => m.delete(5000));

        const embed = new RichEmbed()
            .setColor("#ffdf00")
            .setThumbnail(toWarn.user.displayAvatarURL)
            .setFooter(message.member.displayName, message.author.displayAvatarURL)
            .setTimestamp()
            .setDescription(stripIndents`**> Warned Member:** ${toWarn}
            **> Warned By:** ${message.author}
            **> Reason:** ${args.slice(1).join(" ")}`);
        const promptEmbed = new RichEmbed()
            .setColor("#ffdf00")
            .setAuthor("This verification becomes invalid after 30s")
            .setDescription(`Do you want to warn the person ${toWarn}?`);

        const chEmbed = new RichEmbed()
            .setColor("#ff6e00")
            .setThumbnail(toWarn.user.displayAvatarURL)
            .setFooter(message.member.displayName, message.author.displayAvatarURL)
            .setTimestamp()
            .setDescription(stripIndents`**${toWarn}** has been warned for **${args.slice(1).join(" ")}**`);

        message.channel.send(promptEmbed).then(async msg => {
            const emoji = await promptMessage(msg, message.author, 30, ["✔", "❌"]);

            if(emoji === "✔") {
                msg.delete();
                await logChannel.send(embed);
                await message.channel.send(chEmbed);

                if(!users[toWarn.id]) {
                    users[toWarn.id] = {
                        warnings: 0,
                        mutes: 0,
                        bans: 0
                    };
                }
                let curWarnings = users[toWarn.id].warnings;
                users[toWarn.id].warnings = curWarnings + 1;

                fs.writeFile("./users.json", JSON.stringify(users, null, 4), (err) => {
                    if(err) console.log(err);
                });
            } else if(emoji === "❌") {
                msg.delete();
                return message.reply("Warn cancelled.").then(m => m.delete(5000));
            }
        });
    }
};