const { RichEmbed } = require("discord.js");
const { promptMessage } = require("../../functions");
const { stripIndents } = require("common-tags");

module.exports = {
    name: "game",
    category: "fun",
    run: async (client, message, args) => {

        const promptEmbed = new RichEmbed()
            .setColor("#7cff00")
            .setAuthor("This verification becomes invalid after 30s")
            .setDescription(`You have choosen to play the game. Are you sure you want to play **THE GAME**? This may result in DEATH`);

        message.channel.send(promptEmbed).then(async msg => {
            const emoji = await promptMessage(msg, message.author, 30, ["✔", "❌"]);

            if(emoji === "✔") {
                await game_start(message);
            } else if(emoji === "❌") {
                msg.delete();
                return message.reply("I guess you're weak... **hahahahahaha**").then(m => m.delete(5000));
            }
        });
    }
};

async function game_start(message) {
    const startEmbed = new RichEmbed()
        .setColor("#7cff00")
        .setFooter(message.member.displayName, message.author.displayAvatarURL)
        .setTimestamp()
        .setDescription(stripIndents`Well then.... Good luck my fellow member...`);
    await message.channel.send(startEmbed);

    const q1 = new RichEmbed()
        .setColor("#7cff00")
        .setFooter(message.member.displayName, message.author.displayAvatarURL)
        .setTimestamp()
        .setDescription(stripIndents`Question one. Do you want to play the game still?`);
    await message.channel.send(q1).then(async msg => {
        const yesno = await promptMessage(msg, message.author, 30, ["✔", "❌"]);

        if(yesno === "✔") {
            //TODO: Q2
        } else if(yesno === "❌") {
            msg.delete();
            return message.reply("I guess you're weak... **hahahahahaha**").then(m => m.delete(5000));
        }
    })
}