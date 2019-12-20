const { RichEmbed } = require("discord.js");
const randomPuppy = require("random-puppy");

module.exports = {
    name: "news",
    category: "info",
    run: async (client, message, args) => {

        const img = await  randomPuppy("news");
        const embed = new RichEmbed()
            .setColor("#ff00e1")
            .setImage(img)
            .setTitle(`From r/news`)
            .setURL(`https://reddit.com/r/news`);

        await message.channel.send(embed);
    }
};