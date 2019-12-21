const { RichEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");

module.exports = {
    name: "helpme",
    category: "util",
    run: async (client, message, args) => {
        if(message.deletable) message.delete();

        if(!args[0]) return message.channel.send("Please provide a reason for the help").then(m => m.delete(5000));

        const channel = message.guild.channels.find(channel => channel.name === "support-requests");
        if(!channel) return message.channel.send("Could not find a \`#support-requests\` channel");

        const embed = new RichEmbed()
            .setColor("#ffb982")
            .setTimestamp()
            .setFooter(message.guild.name, message.guild.iconURL)
            .setAuthor("Help Requested", message.author.displayAvatarURL)
            .addField("Reason", args.slice(0).join(" "))
            .addField("Channel", `\`#${message.channel}\``);

        await channel.send(embed);
    }
};