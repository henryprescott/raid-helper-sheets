var config = require('./config.js');

const Discord = require("discord.js")
const client = new Discord.Client()

var classReactionsMap = ["Tank", "Warrior", "Rogue", "Hunter", "Mage", "Warlock", "Priest", "Shadow", "RestoShaman", "Enhancer", "Elemental", "RestoDruid", "Bear", "Feral", "Balance", "Late", "Bench", "Tentative", "Absence"];

var userRoles = {};

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`)
})
client.on("message", async msg => {
    if (msg.content === "!roleCount") {
        msg.delete({ timeout: 100 });

        try {

            const eventMessage = await client.channels.cache.get("714872746072473621").messages.fetch("715509947214856252");

            const embedFields = eventMessage.embeds[0].fields;

            for (let field in embedFields) {
                console.log(embedFields[field].value)
            }

            const eventReactions = await eventMessage.reactions.cache.array();

            for (let reaction in eventReactions) {
                if (eventReactions[reaction].count > 1) {
                    const users = (await eventReactions[reaction].users.fetch()).array();

                    for (let user in users) {
                        if (!users[user].bot) {
                            console.log(`Role: ${eventReactions[reaction].emoji.name}, username: ${users[user].username}`);
                        }
                    }
                }
            }
        } catch (error) {
            console.log(`failed to count roles: ${error}`);
        }
    }
})

try {
    client.login(config.botToken)
} catch (e) {
    console.log("Bot failed to login to discord.");
}


