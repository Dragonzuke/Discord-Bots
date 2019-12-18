const { RichEmbed } = require("discord.js");
const randomPuppy = require("random-puppy");

module.exports = {
    name: "meme",
    category: "fun",
    run: async (client, message, args) => {
        const subReddits = ["dank_meme", "memes", "trebuchetmemes", "MemeEconomy"]
        const random = subReddits[Math.floor(Math.random() * subReddits.length)];

        const img = await  randomPuppy(random);
        const embed = new RichEmbed()
            .setColor("#ff00e1")
            .setImage(img)
            .setTitle(`From r/${random}`)
            .setURL(`https://reddit.com/r/${random}`);

        await message.channel.send(embed);
    }
};