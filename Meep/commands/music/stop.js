module.exports = {
    name: "stop",
    category: "music",
    run: async(message) => {
        if(!message.member.roles.find(role => role.name === "DJ")) return message.channel.send("You must be a DJ to manage music.");

        const { voiceChannel } = message.member.voiceChannel;
        if (!voiceChannel) return message.channel.send('I\'m sorry but you need to be in a voice channel to play music!');
        const serverQueue = message.client.queue.get(message.guild.id);
        if (!serverQueue) return message.channel.send('There is nothing playing that I could stop for you.');
        serverQueue.songs = [];
        serverQueue.connection.dispatcher.end('Stop command has been used!');
    }
};