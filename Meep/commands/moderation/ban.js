const { promptMessage } = require("../../functions");
const { RichEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");
const fs = require("file-system");

let users = require("../../users.json");

module.exports = {
    name: "ban",
    category: "moderation",
    run: async (client, message, args) => {
        const logChannel = message.guild.channels.find(channel => channel.name === "logs") || message.channel;
        if(message.deletable) message.delete();

        if(!message.member.hasPermission("BAN_MEMBERS")) return message.reply("❌ You don't have permission to use this.");
        if(!message.guild.me.hasPermission("BAN_MEMBERS")) return message.reply("❌ I don't have permission to use this.");
        if(!args[0]) return message.reply("Please provide a person to ban.");
        if(!args[1]) return message.reply("Please provide a reason to ban.");
        const toBan = message.mentions.members.first() || message.guild.members.get(args[0]);

        if(!toBan) return message.reply("Couldn't find that member.");
        if(message.author.id === toBan.id) return message.reply("Why don't you just leave? (Can't ban yourself)");
        if(!toBan.bannable) return message.reply("Can't ban staff 😋");

        const embed = new RichEmbed()
            .setColor("#a50001")
            .setThumbnail(toBan.user.displayAvatarURL)
            .setFooter(message.member.displayName, message.author.displayAvatarURL)
            .setTimestamp()
            .setDescription(stripIndents`**> Banned Member:** ${toBan}
            **> Banned By:** ${message.author}
            **> Reason:** ${args.slice(1).join(" ")}`);
        const promptEmbed = new RichEmbed()
            .setColor("#a50001")
            .setAuthor("This verification becomes invalid after 30s")
            .setDescription(`Do you want to ban the person ${toBan}?`);

        message.channel.send(promptEmbed).then(async msg => {
            const emoji = await promptMessage(msg, message.author, 30, ["✔", "❌"]);

            if(emoji === "✔") {
                msg.delete();
                if(!users[toBan.id]) {
                    users[toBan.id] = {
                        warnings: 0,
                        mutes: 0,
                        bans: 0
                    };
                }
                let curBans = users[toBan.id].bans;
                users[toBan.id].bans = curBans + 1;

                fs.writeFile("./users.json", JSON.stringify(users, null, 4), (err) => {
                    if(err) console.log(err);
                });

                toBan.ban(args.slice(1).join(" "))
                    .catch(err => {
                        if (err) return message.channel.send("Something horrible has happened. Please contact Zuke about it")
                    });
                await logChannel.send(embed);
            } else if(emoji === "❌") {
                msg.delete();
                return message.reply("Ban cancelled.").then(m => m.delete(5000));
            }
        });
    }
};