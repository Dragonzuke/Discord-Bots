const { promptMessage } = require("../../functions");
const { RichEmbed } = require("discord.js");
const ms = require("ms");
const { stripIndents } = require("common-tags");
const fs = require("file-system");

let users = require("../../users.json");

module.exports = {
    name: "mute",
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
        if(message.author.id === toMute.id) return message.reply("Why don't you just stay quiet? (Can't mute yourself)");
        if(!toMute.kickable) return message.reply("Can't mute staff 😋").then(m => m.delete(5000));

        const embed = new RichEmbed()
            .setColor("#ff6e00")
            .setThumbnail(toMute.user.displayAvatarURL)
            .setFooter(message.member.displayName, message.author.displayAvatarURL)
            .setTimestamp()
            .setDescription(stripIndents`**> Muted Member:** ${toMute}
            **> Muted By:** ${message.author}
            **> Reason:** ${args.slice(2).join(" ")}
            **> Muted for:** ${args[1]}`);
        const promptEmbed = new RichEmbed()
            .setColor("#ff6e00")
            .setAuthor("This verification becomes invalid after 30s")
            .setDescription(`Do you want to mute the person ${toMute}?`);

        const chEmbed = new RichEmbed()
            .setColor("#ff6e00")
            .setThumbnail(toMute.user.displayAvatarURL)
            .setFooter(message.member.displayName, message.author.displayAvatarURL)
            .setTimestamp()
            .setDescription(stripIndents`**${toMute}** has been muted for **${args.slice(2).join(" ")}**`);
        
        message.channel.send(promptEmbed).then(async msg => {
            const emoji = await promptMessage(msg, message.author, 30, ["✔", "❌"]);

            if(emoji === "✔") {
                msg.delete();

                if(!users[toMute.id]) {
                    users[toMute.id] = {
                        warnings: 0,
                        mutes: 0,
                        bans: 0
                    };
                }
                let curMutes = users[toMute.id].mutes;
                users[toMute.id].mutes = curMutes + 1;

                fs.writeFile("./users.json", JSON.stringify(users, null, 4), (err) => {
                    if(err) console.log(err);
                });

                await toMute.addRole(muteRole.id)
                    .catch(err => {
                        if (err) return message.channel.send("Something horrible has happened. Please contact Zuke about it")
                    });
                await logChannel.send(embed);
                await message.channel.send(chEmbed);
                setTimeout(async function () {
                    await toMute.removeRole(muteRole.id);
                    const unmuteEmbed = new RichEmbed()
                        .setColor("#ff6e00")
                        .setThumbnail(toMute.user.displayAvatarURL)
                        .setFooter(message.member.displayName, message.author.displayAvatarURL)
                        .setTimestamp()
                        .setDescription(stripIndents`**> Unmuted Member:** ${toMute}
                        **> Unmuted By:** ${message.guild.me.displayName}`);
                    await logChannel.send(unmuteEmbed);
                }, ms(args[1]));
            } else if(emoji === "❌") {
                msg.delete();
                return message.reply("Mute cancelled.").then(m => m.delete(5000));
            }
        });
    }
};