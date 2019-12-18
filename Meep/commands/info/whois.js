const { getMember, formatDate } = require("../../functions");
const { RichEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");

module.exports = {
    name: "whois",
    aliases: ["userinfo", "user", "who"],
    category: "info",
    run: async (client, message, args) => {
        const member = getMember(message, args.join(" "));

        //Member variables
        const joined = formatDate(member.joinedAt);
        const roles = member.roles
            .filter(r => r.id !== message.guild.id)
            .map(r => r)
            .join(", ") || "None";

        //User variables
        const created = formatDate(member.user.createdAt);

        const embed = new RichEmbed()
            .setFooter(member.displayName, member.user.displayAvatarURL)
            .setThumbnail(member.user.displayAvatarURL)
            .setColor("#ffa600")

            .addField('Member Information', stripIndents`**> Display Name:** ${member.displayName}
            **> Joined at:** ${joined}
            **> Roles:** ${roles}`, true)

            .addField('User Information', stripIndents`> **ID:** ${member.user.id}
            **> Username:** ${member.user.username}
            **> Discord Tag:** ${member.user.tag}
            **> Created At:** ${created}`, true)

            .setTimestamp();

        await message.channel.send(embed);
    }
};