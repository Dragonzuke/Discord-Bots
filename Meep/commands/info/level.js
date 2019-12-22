const { RichEmbed } = require("discord.js");
let xp = require("../../xp.json");

module.exports = {
    name: "level",
    category: "info",
    run: async (client, message, args) => {
        if(args[0]) {
            const toCheck = message.mentions.members.first() || message.guild.members.get(args[0]);

            if(!xp[toCheck.id]) {
                xp[toCheck.id] = {
                    xp: 0,
                    level: 1
                };
            }

            let curXP = xp[toCheck.id].xp;
            let curLvl = xp[toCheck.id].level;
            let nextLevel = 500 * (Math.pow(2, xp[toCheck.id].level - 1));
            let xpToNextLvl = nextLevel - curXP;
            const embed = new RichEmbed()
                .setColor("#a94cff")
                .setThumbnail(toCheck.user.displayAvatarURL)
                .setTitle(`${toCheck.user.username}'s Level Stats`)
                .setFooter(toCheck.displayName, toCheck.user.displayAvatarURL)
                .setTimestamp()
                .addField("Current Level", `${curLvl}`)
                .addField("Current XP", `${curXP}`)
                .addField("XP to Next Level", `${xpToNextLvl}`);
            return await message.channel.send(embed);
        }

        if(!xp[message.author.id]) {
            xp[message.author.id] = {
                xp: 0,
                level: 1
            };
        }

        let curXP = xp[message.author.id].xp;
        let curLvl = xp[message.author.id].level;
        let nextLevel = 500 * (Math.pow(2, xp[message.author.id].level - 1));
        let xpToNextLvl = nextLevel - curXP;
        const embed = new RichEmbed()
            .setColor("#a94cff")
            .setThumbnail(message.author.displayAvatarURL)
            .setTitle(`${message.member.user.username}'s Level Stats`)
            .setFooter(message.member.displayName, message.author.displayAvatarURL)
            .setTimestamp()
            .addField("Current Level", `${curLvl}`)
            .addField("Current XP", `${curXP}`)
            .addField("XP to Next Level", `${xpToNextLvl}`);
        await message.channel.send(embed);
    }
};