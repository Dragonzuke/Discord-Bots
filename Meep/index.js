const { Client, RichEmbed, Collection } = require("discord.js");
const client = new Client();
const fs = require("file-system");
const { stripIndents } = require("common-tags");
let xp = require("./xp.json");
let functions = require("./functions.js");

//YouTube API: AIzaSyAamO7NK8d6nwSZ75sl2ks5vhpnwObuVxI

client.commands = new Collection();
client.aliases = new Collection();

["command"].forEach(handler => {
    require(`./handler/${handler}`)(client)
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.username}`);
    client.user.setPresence({
        game: {
            name: "Gavin's latest video",
            type: "WATCHING"
        }
    });
});

client.on("message", async message => {

    if(message.author.bot) return;
    if(!message.guild) return;

    let xpAdd = Math.floor(Math.random() * 7) + 8;
    if(!xp[message.author.id]) {
        xp[message.author.id] = {
            xp: 0,
            level: 1
        };
    }
    xp[message.author.id].xp = xp[message.author.id].xp + xpAdd;

    let curXP = xp[message.author.id].xp;
    let curLvl = xp[message.author.id].level;
    let nextLevel = 500 * (Math.pow(2, xp[message.author.id].level - 1));

    if(nextLevel <= curXP) {
        xp[message.author.id].level = curLvl + 1;
        let lvlChannel = message.guild.channels.find(channel => channel.name === "ranks") || message.channel;
        const embed = new RichEmbed()
            .setColor("#a94cff")
            .setThumbnail(message.author.displayAvatarURL)
            .setTitle('Level Up!')
            .setFooter(message.member.displayName, message.author.displayAvatarURL)
            .setTimestamp()
            .setDescription(stripIndents`${message.member.displayName} has advanced up to level **${xp[message.author.id].level}**!`);
        await lvlChannel.send(embed);

        const role = message.guild.roles.find(role => role.name === "Legendary");
        if(xp[message.author.id].level === 25) {
            await message.member.addRole(role);
            await lvlChannel.send(`@${message.author.id} has just achieved __**Legendary**__ Status!`);
        }
    }
    fs.writeFileSync("./xp.json", JSON.stringify(xp, null, 4), (err) => {
        if(err) console.log(err);
    });

    const prefix = "?";

    if(!message.content.startsWith(prefix)) return;
    if(!message.member) message.member = await message.guild.fetchMember(message);

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();

    if(cmd.length === 0) return;
    let command = client.commands.get(cmd);
    if(!command) command = client.commands.get(client.aliases.get(cmd));

    if(command)
        await command.run(client, message, args);
});

client.on("messageUpdate", async (oldMessage, newMessage) => {
    const logChannel = newMessage.guild.channels.find(channel => channel.name === "chat-logs") || newMessage.channel;

    if(newMessage.author.bot) return;

    const embed = new RichEmbed()
        .setColor("#00ffe4")
        .setTitle("Message Edit")
        .setThumbnail(newMessage.author.displayAvatarURL)
        .setFooter(newMessage.member.displayName, newMessage.author.displayAvatarURL)
        .setTimestamp()
        .setDescription(stripIndents`Edited message in ${newMessage.channel}`)
        .addField("Previous Message", functions.longMessageFix(oldMessage.content.toString(), 50), true)
        .addField("New Message", functions.longMessageFix(newMessage.content.toString(), 50), true);

    await logChannel.send(embed);
});

client.on("messageDelete", async message => {
    const logChannel = message.guild.channels.find(channel => channel.name === "chat-logs") || message.channel;
    const welcome = message.guild.channels.find(welcome => welcome.name === "welcome");

    if(message.author.bot) return;
    if(message.channel === welcome) return;

    const embed = new RichEmbed()
        .setColor("#00ffe4")
        .setTitle("Message Delete")
        .setThumbnail(message.author.displayAvatarURL)
        .setFooter(message.member.displayName, message.author.displayAvatarURL)
        .setTimestamp()
        .setDescription(stripIndents`Deleted message in ${message.channel}`)
        .addField("Message", functions.longMessageFix(message.content.toString(), 50), true);

    await logChannel.send(embed);
});

client.login('NjU3MDA2MzU4MjgxMDYwMzY0.XfrL7A.TkhJRo-zbeg7sBAKoSCqeSlu0u8');