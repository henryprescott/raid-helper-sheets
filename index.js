require('dotenv').config();

const Discord = require("discord.js")
const client = new Discord.Client()

var raidHelperReactions= [];

var userRoles = {};

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`)
})
client.on("message", async msg => {
    if (msg.content === "!roleCount") {
        msg.delete({ timeout: 100 });

        try {
            // replace with event tracking/searching - currently hardcoded to a specific message
            const eventMessage = await client.channels.cache.get("714872746072473621").messages.fetch("715509947214856252");

            // 1. build up role list from raid-helper bot reactions (as roles & classes may vary across factions etc)
            const eventReactions = await eventMessage.reactions.cache.array();

            for (let reaction in eventReactions) {
                const users = (await eventReactions[reaction].users.fetch()).array();

                for (let user in users) {
                    if (users[user].bot) {
                        raidHelperReactions.push(eventReactions[reaction].emoji.name)
                        // console.log(`Role: ${eventReactions[reaction].emoji.name}, username: ${users[user].username}`);
                        break;
                    }
                }
            }

            console.log(raidHelperReactions);

            // 2. build map/array of roles & map/array of sign-up order

            // 3. iterate through embed fields to extract role counts, order and populate above
            const embedFields = eventMessage.embeds[0].fields;

            for (let field in embedFields) {
                // need to do some REGEX here to grab useful info from value?
                console.log(embedFields[field].value)
            }
        } catch (error) {
            console.log(`failed to count roles: ${error}`);
        }
    }
})

try {
    client.login(process.env.DISCORD_BOT_TOKEN)
} catch (e) {
    console.log("Bot failed to login to discord.");
}


