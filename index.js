var config = require('./config.js');

const Discord = require("discord.js")
const client = new Discord.Client()

var classReactionsMap = ["Tank", "Warrior", "Rogue", "Hunter", "Mage", "Warlock", "Priest", "Shadow", "RestoShaman", "Enhancer", "Elemental", "RestoDruid", "Bear", "Feral", "Balance", "Late", "Bench", "Tentative", "Absence"];


client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`)
})
client.on("message", msg => {
    if (msg.content === "!roleCount") {
        msg.delete({ timeout: 100 });

        var reactionIndex = 0;

        client.channels.cache.get("714872746072473621").messages.fetch()
            .then(messages => messages.forEach(message => message.reactions.cache.forEach( reaction =>  {
                if(reaction.count > 1) {
                    msg.channel.send(`Role: ${classReactionsMap[reactionIndex]}`);
                }
                reactionIndex++;
            })))
    }
})
client.login(config.botToken)

