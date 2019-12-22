module.exports = {
    name: "resume",
    category: "music",
    run: async(message) => {
        if(!message.member.roles.find(role => role.name === "DJ")) return message.channel.send("You must be a DJ to manage music.");

        const serverQueue = message.client.queue.get(message.guild.id);
        if (serverQueue && !serverQueue.playing) {
            serverQueue.playing = true;
            serverQueue.connection.dispatcher.resume();
            return message.channel.send('▶ Resumed the music for you!');
        }
        return message.channel.send('There is nothing playing.');
    }
};