'use strict'

require('dotenv').config();

const { GoogleSpreadsheet } = require('google-spreadsheet');

const Discord = require("discord.js")
const client = new Discord.Client()

client.on("ready",() => {
    console.log(`Logged in as ${client.user.tag}!`)
})

client.on("message", async msg => {
    if (msg.content === "!roleCount") {
        msg.delete({ timeout: 100 });

        try {
            // spreadsheet key is the long id in the sheets URL

            console.log(process.env.GOOGLE_SPREADSHEET_ID);

            const doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_ID);

            console.log(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
            console.log(process.env.GOOGLE_PRIVATE_KEY);

            // use service account creds
            // await doc.useServiceAccountAuth({
            //     client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            //     private_key: process.env.GOOGLE_PRIVATE_KEY,
            // });
            //
            // await doc.loadInfo(); // loads document properties and worksheets
            // console.log(doc.title);
            //
            // let testSheet;
            //
            // for(let sheet in doc.sheetsByIndex) {
            //     // const sheet = doc.sheetsByIndex[0]; // or use doc.sheetsById[id]
            //     // console.log(doc.sheetsByIndex[sheet].title);
            //     // console.log(doc.sheetsByIndex[sheet].rowCount);
            //
            //     if(doc.sheetsByIndex[sheet].title == "Test Sheet")
            //     {
            //         testSheet = doc.sheetsByIndex[sheet];
            //
            //         await testSheet.loadCells('A1:E100');
            //     }
            // }

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

            console.log("Roles:");
            console.log(raidHelperReactions);

            // 2. build map/array of roles & map/array of sign-up order

            // 3. iterate through embed fields to extract role counts, order and populate above
            const embedFields = eventMessage.embeds[0].fields;

            let embedStartIndex = 0;

            let role_sign_up_data = {};
            let sign_up_order = {};

            for(let role in raidHelperReactions) {

                let field = embedStartIndex;

                let role_data = [];

                for ( field in embedFields) {
                    let role_name_regex = new RegExp(":(" + raidHelperReactions[role] + "):", "gm");

                    // console.log(embedFields[field].value)

                    if(role_name_regex.test(embedFields[field].value)) {
                        let raw_role_data = embedFields[field].value.split("\n");

                        // remove title
                        raw_role_data.splice(0, 1);

                        for(let sign_up in raw_role_data) {
                            let sign_up_order_regex = /\`{2}(.*?)\`{2}/gm;
                            let username_regex = /\*{2}(.*?)\*{2}/gm;
                            const signup_order_match = sign_up_order_regex.exec(raw_role_data[sign_up]);
                            const signup_username_match = username_regex.exec(raw_role_data[sign_up]);

                            if (signup_order_match != null && signup_username_match != null) {
                                let sign_up_info = [];
                                sign_up_info.push(signup_username_match[1]);
                                sign_up_info.push(signup_order_match[1]); // going to keep order just in case

                                role_data.push(sign_up_info);

                                // map sign up order to username
                                sign_up_order[signup_order_match[1]] = signup_username_match[1];
                            }
                        }
                    }
                    else {
                        role_sign_up_data[raidHelperReactions[role]] = role_data;
                    }
                    embedStartIndex++;
                }
            }

            // console.log("Sign up data:");
            // console.log(role_sign_up_data);
            // console.log("Sign up order:");
            // console.log(sign_up_order);

            // for(let i = 0; i < raidHelperReactions.length; i++) {
            //     for(let j = 0; j < role_sign_up_data[raidHelperReactions[i]].length; j++) {
            //         console.log(role_sign_up_data[raidHelperReactions[i]][j]);
            //         const a1 = testSheet.getCell(i, j);
            //         a1.value = role_sign_up_data[raidHelperReactions[i]][j][0];
            //     }
            // }
            //
            // await testSheet.saveUpdatedCells();

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


