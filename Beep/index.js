const { Client, RichEmbed, Util } = require("discord.js");
const ytdl = require("ytdl-core");
const YouTube = require("simple-youtube-api");
const { stripIndents } = require("common-tags");

const client = new Client();
const queue = new Map();
const youtube = new YouTube("AIzaSyAamO7NK8d6nwSZ75sl2ks5vhpnwObuVxI");

async function play(guild, song) {
    const serverQueue = queue.get(guild.id);

    await new Promise(done => setTimeout(done, 5000));

    if(!song) {
        serverQueue.songs = [];
        serverQueue.voiceChannel.leave();
        serverQueue.connection.dispatcher.end();
        queue.delete(guild.id);
        return;
    }
    const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
        .on('end', () => {
            serverQueue.songs.shift();
            play(guild, serverQueue.songs[0]);
        })
        .on('error', err => console.error(err));
    dispatcher.setVolume(0.5);

    const embed = new RichEmbed()
        .setColor("#74d1ff")
        .setThumbnail(`https://i.ytimg.com/vi/${song.id}/hqdefault.jpg`)
        .setDescription(`Now Playing: **${serverQueue.songs[0].title}** `)
        .addField("Requested By", `${serverQueue.songs[0].requested}`, true)
        .addField("Length", `${serverQueue.songs[0].length_m}:${serverQueue.songs[0].length_s}`, true);
    await serverQueue.textChannel.send(embed);
}
async function handleVideo(video, message, voiceChannel, playlist = false) {
    const serverQueue = queue.get(message.guild.id);
    const song = {
        title: Util.escapeMarkdown(video.title),
        url: `https://www.youtube.com/watch?v=${video.id}`,
        id: video.id,
        length_m: video.duration.minutes,
        length_s: video.duration.seconds,
        requested: message.member.user.username
    };

    if(!serverQueue) {
        const queueConstruct = {
            textChannel: message.channel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            volume: 0.5,
            playing: true
        };
        queue.set(message.guild.id, queueConstruct);
        queueConstruct.songs.push(song);

        try {
            queueConstruct.connection = await voiceChannel.join();
            await play(message.guild, queueConstruct.songs[0]);
            message.channel.stopTyping();
        } catch (e) {
            console.error(`Error joining voice channel. Error:\n${e}`);
            queue.delete(message.guild.id);
            message.channel.stopTyping();
            return message.reply("There was an error joining the voice channel. Please talk to Zuke about it.");
        }
    } else {
        serverQueue.songs.push(song);
        message.channel.stopTyping();

        if(playlist) {
            return undefined;
        } else {
            const embed = new RichEmbed()
                .setColor("#74d1ff")
                .setThumbnail(`https://i.ytimg.com/vi/${song.id}/hqdefault.jpg`)
                .setDescription(`**${song.title}** has been added to the queue.`)
                .addField("Requested By", `${song.requested}`, true)
            await serverQueue.textChannel.send(embed);
        }
    }
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.username}`);

    client.user.setPresence({
        game: {
            name: "Trace. & Mello",
            type: "LISTENING"
        }
    });
});

client.on("message", async message => {
    if(message.author.bot) return;
    if(!message.guild) return;

    const prefix = "?";
    if(!message.content.startsWith(prefix)) return;
    if(!message.member) message.member = await message.guild.fetchMember(message);

    const args = message.content.split(" ");
    const serverQueue = queue.get(message.guild.id);

    //PLay Command
    if(message.content.startsWith(`${prefix}play`)) {
        const searchString = args.slice(1).join(" ");
        const url = args[1].replace(/<(.+)>/g, "$1");

        message.channel.startTyping();

        const voiceChannel = message.member.voiceChannel;
        if(!voiceChannel) return message.reply("You must be in a voice channel to use me!").then(m => m.delete(5000));
        const permissions = voiceChannel.permissionsFor(message.guild.me.user);

        if(!permissions.has("CONNECT")) return message.reply("I don't have permission to connect to your voice channel.").then(m => m.delete(5000));
        if(!permissions.has("SPEAK")) return message.reply("I don't have permission to play music in your voice channel.").then(m => m.delete(5000));

        if(url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
            const playlist = await youtube.getPlaylist(url);
            const videos = await playlist.getVideos();

            for(const video of Object.values(videos)) {
                const video2 = await youtube.getVideoByID(video.id);
                await handleVideo(video2, message, voiceChannel, true);
            }
            const embed = new RichEmbed()
                .setColor("#74d1ff")
                .setThumbnail(`https://i.ytimg.com/vi/${playlist.id}/hqdefault.jpg`)
                .setDescription(`**${playlist.title}** has been added to the queue.`);
            await serverQueue.textChannel.send(embed);
        } else {
            let video = null;
            try {
                video = await youtube.getVideo(url);
            } catch (e) {
                try {
                    let videos = await youtube.searchVideos(searchString, 1);
                    video = await youtube.getVideoByID(videos[0].id);
                } catch (error) {
                    message.channel.stopTyping();
                    console.log(error);
                    return message.reply("I could not obtain any search results.");
                }
            }
            await handleVideo(video, message, voiceChannel);
        }
    }

    //Stop Command
    else if(message.content.startsWith(`${prefix}stop`)) {
        const voiceChannel = message.member.voiceChannel;
        if(!voiceChannel) return message.reply("You must be in a voice channel to use me!").then(m => m.delete(5000));
        if(!message.member.roles.find( r => r.name === "DJ")) return message.reply("You must be a DJ to stop songs!");
        if(!serverQueue) return message.reply("There are no songs to stop.").then(m => m.delete(5000));

        serverQueue.songs = [];
        serverQueue.connection.dispatcher.end();
        voiceChannel.leave();
    }

    //Skip Command
    else if(message.content.startsWith(`${prefix}skip`)) {
        const voiceChannel = message.member.voiceChannel;
        if(!voiceChannel) return message.reply("You must be in a voice channel to use me!").then(m => m.delete(5000));
        if(!message.member.roles.find( r => r.name === "DJ")) return message.reply("You must be a DJ to skip songs!");
        if(!serverQueue) return message.reply("There are no songs to skip.").then(m => m.delete(5000));

        serverQueue.connection.dispatcher.end();
    }

    //Now Playing Command
    else if(message.content.startsWith(`${prefix}nowplaying`) || message.content.startsWith(`${prefix}np`)) {
        const voiceChannel = message.member.voiceChannel;
        if(!voiceChannel) return message.reply("You must be in a voice channel to use me!").then(m => m.delete(5000));
        if(!serverQueue) return message.reply("There are no songs to view.").then(m => m.delete(5000));

        const embed = new RichEmbed()
            .setColor("#74d1ff")
            .setThumbnail(`https://i.ytimg.com/vi/${serverQueue.songs[0].id}/hqdefault.jpg`)
            .setDescription(`Now Playing: **${serverQueue.songs[0].title}** `)
            .addField("Requested By", `${message.author.username}`, true)
            .addField("Length", `${serverQueue.songs[0].length_m}:${serverQueue.songs[0].length_s}`, true);
        await message.channel.send(embed);
    }

    //Volume Command
    else if(message.content.startsWith(`${prefix}volume`) || message.content.startsWith(`${prefix}vol`)) {
        const voiceChannel = message.member.voiceChannel;
        if(!voiceChannel) return message.reply("You must be in a voice channel to use me!").then(m => m.delete(5000));
        if(!args[1]) return message.channel.send(`Current Volume: ${serverQueue.volume * 100}%`);

        if(!message.member.hasPermission("ADMINISTRATOR")) message.reply("You must be an Admin to change the volume!").then(m => m.delete(5000));
        serverQueue.volume = args[1] / 100;
        serverQueue.connection.dispatcher.setVolume(args[1] / 100);
        await message.channel.send(`Volume set to ${serverQueue.volume * 100}%`)
    }

    //Queue Command
    else if(message.content.startsWith(`${prefix}queue`)) {
        const voiceChannel = message.member.voiceChannel;
        if(!voiceChannel) return message.reply("You must be in a voice channel to use me!").then(m => m.delete(5000));
        if(!serverQueue) return message.reply("There are no songs to view.").then(m => m.delete(5000));

        const embed = new RichEmbed()
            .setColor("#74d1ff")
            .setTitle("Current Queue")
            .setDescription(stripIndents`
            ${serverQueue.songs.map((song, index) => `**${index + 1}.**  ${song.title}  **|**  ${serverQueue.songs[0].length_m}:${serverQueue.songs[0].length_s}`).join(`\n`)}
            
            **Now Playing:** ${serverQueue.songs[0].title} **|** ${serverQueue.songs[0].length_m}:${serverQueue.songs[0].length_s}`);
        await message.channel.send(embed);
    }

    //Pause Command
    else if(message.content.startsWith(`${prefix}pause`)) {
        const voiceChannel = message.member.voiceChannel;
        if(!voiceChannel) return message.reply("You must be in a voice channel to use me!").then(m => m.delete(5000));
        if(!serverQueue) return message.reply("There are no songs to pause.").then(m => m.delete(5000));
        if(!serverQueue.playing) return message.reply("There are no songs playing.").then(m => m.delete(5000));
        if(!message.member.roles.find( r => r.name === "DJ")) return message.reply("You must be a DJ to skip songs!");

        serverQueue.playing = false;
        serverQueue.connection.dispatcher.pause();

        await message.channel.send("Music has been paused.");
    }

    //Resume Command
    else if(message.content.startsWith(`${prefix}resume`)) {
        const voiceChannel = message.member.voiceChannel;
        if(!voiceChannel) return message.reply("You must be in a voice channel to use me!").then(m => m.delete(5000));
        if(!serverQueue) return message.reply("There are no songs to resume.").then(m => m.delete(5000));
        if(serverQueue.playing) return message.reply("There are songs playing.").then(m => m.delete(5000));
        if(!message.member.roles.find( r => r.name === "DJ")) return message.reply("You must be a DJ to skip songs!");

        serverQueue.playing = true;
        serverQueue.connection.dispatcher.resume();
        await message.channel.send("Music has been resumed.");
    }

});

client.login('NjU1MTU4NjU4MTg3MDAxODU2.XfQJug.FfymROC2u650W7iNJaAZ5RGmP94');