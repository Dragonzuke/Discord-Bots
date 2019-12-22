module.exports = {
    name: "pause",
    category: "music",
    run: async(message) => {
        if(!message.member.roles.find(role => role.name === "DJ")) return message.channel.send("You must be a DJ to manage music.");

        const serverQueue = message.client.queue.get(message.guild.id);
        if (serverQueue && serverQueue.playing) {
            serverQueue.playing = false;
            serverQueue.connection.dispatcher.pause();
            return message.channel.send('⏸ Paused the music for you!');
        }
        return message.channel.send('There is nothing playing.');
    }
};