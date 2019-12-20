const { RichEmbed } = require("discord.js");
const { promptMessage } = require("../../functions");
const { stripIndents } = require("common-tags");

const chooseQuestion = [
    "Do you still want to play the game?",
    "Have you ever opened and re-wrapped a present that had your name on it?",
    "Been arrested?",
    "Ditched school to do something more fun?"];

let question = 0;
let started = false;
let successful = false;

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
    if(started) return message.reply("There is already a game going!");

    const startEmbed = new RichEmbed()
        .setColor("#7cff00")
        .setFooter(message.member.displayName, message.author.displayAvatarURL)
        .setTimestamp()
        .setDescription(stripIndents`Well then.... Good luck my fellow member...`);

    await message.channel.send(startEmbed);
    await question_ask(message);
}

async function question_end(message) {

    if(!successful) {
        const endBad = new RichEmbed()
            .setColor("#7cff00")
            .setFooter(message.member.displayName, message.author.displayAvatarURL)
            .setTitle(`The Game | END`)
            .setTimestamp()
            .setDescription(stripIndents`How could you have failed me...`);

        await message.channel.send(endBad);
    } else {
        const endGood = new RichEmbed()
            .setColor("#7cff00")
            .setFooter(message.member.displayName, message.author.displayAvatarURL)
            .setTitle(`The Game | END`)
            .setTimestamp()
            .setDescription(stripIndents`Well.... I wasn't expecting you to get this far. Congrats I guess...`);

        await message.channel.send(endGood);
    }
    question = 0;
    started = false;
}

async function question_ask(message) {
    question = question += 1;

    if(question === chooseQuestion.length) {
        successful = true;
        return await question_end(message);
    }

    let randomQuestion = chooseQuestion[Math.floor(Math.random() * chooseQuestion.length)];

    const questionAsk = new RichEmbed()
        .setColor("#7cff00")
        .setFooter(message.member.displayName, message.author.displayAvatarURL)
        .setTitle(`The Game | Question #${question}`)
        .setTimestamp()
        .setDescription(stripIndents`${randomQuestion}`);
    await message.channel.send(questionAsk).then(async msg => {
        const yes_no = await promptMessage(msg, message.author, 30, ["✔", "❌"]);

        if(randomQuestion === chooseQuestion[0]) {
            if(yes_no === "❌") {
                return await question_end(message);
            } else {
                await question_ask(message);
            }
        } else {
            await question_ask(message);
        }
    })
}