module.exports = {
    name: "agree",
    category: "util",
    run: async (client, message, args) => {
        if(message.deletable) message.delete();
        if(!message.member.roles.find(r => r.name === "Member")) {
            const member = message.guild.roles.find("name", "Member");
            await message.member.addRole(member);
        }
    }
};