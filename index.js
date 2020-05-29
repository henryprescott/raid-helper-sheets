require('dotenv').config();

const Discord = require("discord.js")
const client = new Discord.Client()

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
            const reactions = await eventMessage.reactions.cache.array();

            let raidHelperReactions= [];

            for (let reaction in reactions) {
                const users = (await reactions[reaction].users.fetch()).array();

                for (let user in users) {
                    if (users[user].bot) {
                        raidHelperReactions.push(reactions[reaction].emoji.name)
                        // console.log(`Role: ${eventReactions[reaction].emoji.name}, username: ${users[user].username}`);
                        break;
                    }
                }
            }

            console.log(raidHelperReactions);

            // 2. build map/array of roles & map/array of sign-up order

            // 3. iterate through embed fields to extract role counts, order and populate above
            const embedFields = eventMessage.embeds[0].fields;

            let embedStartIndex = 0;

            for(let role in raidHelperReactions) {

                let field = embedStartIndex;

                console.log(embedFields[field].value);

                for ( field in embedFields) {
                    // need to do some REGEX here to grab useful info from value?
                    let role_name_regular_expression = new RegExp(":(" + raidHelperReactions[role] + "):", "gm");

                    if(role_name_regular_expression.test(embedFields[field])) {
                        let role_info_regular_expression = /\*{2}(.*?)\*{2}/gm;
                        console.log(`role: ${role}`);
                        console.log(`role_name_regular_expression: ${role_name_regular_expression}`);
                        if(role_info_regular_expression.test(embedFields[field])) {
                            console.log(`role_info_regular_expression: ${role_info_regular_expression}`);
                        }
                    }

                    embedStartIndex++;
                }
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


