let xp = require("../../xp.json");
const fs = require("file-system");

module.exports = {
    name: "setlevel",
    category: "moderation",
    run: async (client, message, args) => {

        if(!message.member.hasPermission("ADMINISTRATOR")) return message.reply("❌ You don't have permission to use this.");
        if(!args[0]) return message.reply("Please provide a user to set the level");
        if(!args[1]) return message.reply("Please provide a level");
        if(typeof(args[1]) === "number") return message.reply("The level must be a number!");
        const toLevel = message.mentions.members.first() || message.guild.members.get(args[0]);

        if(!xp[toLevel.id]) {
            xp[toLevel.id] = {
                xp: 0,
                level: 1
            };
        }

        xp[toLevel.id].level = args[1];
        fs.writeFileSync("./xp.json", JSON.stringify(xp, null, 4), (err) => {
            if(err) console.log(err);
        });
        message.channel.send(`${toLevel.user.username}'s level has been set to **${args[1]}**`)
    }
};