const { RichEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");

module.exports = {
    name: "report",
    category: "moderation",
    run: async (client, message, args) => {
        if(message.deletable) message.delete();

        let rMember = message.mentions.members.first() || message.guild.members.get(args[0]);
        if(!rMember) return message.reply("Couldn't find that person!").then(m => m.delete(5000));
        if(rMember.hasPermission("ADMINISTRATOR") || rMember.user.bot) return message.reply("Can't report that member").then(m => m.delete(5000));
        if(!args[1]) return message.channel.send("Please provide a reason for the report").then(m => m.delete(5000));

        const channel = message.guild.channels.find(channel => channel.name === "reports");
        if(!channel) return message.channel.send("Could not find a \`#reports\` channel").then(m => m.delete(5000));

        const embed = new RichEmbed()
            .setColor("#00cfe5")
            .setTimestamp()
            .setFooter(message.guild.name, message.guild.iconURL)
            .setAuthor("Reported Member", rMember.user.displayAvatarURL)
            .setDescription(stripIndents`**> Member:** ${rMember}
            **> Reported By:** ${message.member}
            **> Reported In:** ${message.channel}
            **> Reason:** ${args.slice(1).join(" ")}`);

        await channel.send(embed);
    }
};