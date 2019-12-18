const { RichEmbed } = require("discord.js");
const { promptMessage } = require("../../functions");

const chooseArr = ["🗻", "📰", "✂"]

module.exports = {
    name: "rps",
    category: "fun",
    run: async (client, message, args) => {
        const embed = new RichEmbed()
            .setColor("#ff00e1")
            .setFooter(message.guild.me.displayName, client.user.displayAvatarURL)
            .setDescription("Add reaction to one of these emojis to play the game!")
            .setTimestamp();

        const m = await message.channel.send(embed);
        const reacted = await promptMessage(m, message.author, 30, chooseArr);

        const botChoice = chooseArr[Math.floor(Math.random() * chooseArr.length)];
        const result = await getResult(reacted, botChoice);
        await m.clearReactions();

        embed.setDescription("").addField(result, `${reacted} v.s ${botChoice}`);
        await m.edit(embed);

        function getResult(me, clientChosen) {
            if ((me === "🗻" && clientChosen === "✂") ||
                (me === "📰" && clientChosen === "🗻") ||
                (me === "✂" && clientChosen === "📰")) {
                return "You won!";
            } else if (me === clientChosen) {
                return "It's a tie!"
            } else return "You lost 😢";
        }
    }
};