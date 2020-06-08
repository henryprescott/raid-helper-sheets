'use strict'

require('dotenv').config();

const fs = require('fs')

const { GoogleSpreadsheet } = require('google-spreadsheet');

const Discord = require("discord.js")
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] })

client.on("ready",() => {
    console.log(`Logged in as ${client.user.tag}!`)
})

/* Google Spreadsheet code */

async function getSpreadSheet(spreadsheetID) {
    const spreadsheet = new GoogleSpreadsheet(spreadsheetID);

    // console.log(process.env.GOOGLE_SPREADSHEET_ID);

    // console.log(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
    // console.log(process.env.GOOGLE_PRIVATE_KEY);

    try {
        // use service account creds
        await spreadsheet.useServiceAccountAuth({
            client_email: JSON.parse(`"${process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL}"`),
            private_key: JSON.parse(`"${process.env.GOOGLE_PRIVATE_KEY}"`),
        });
    } catch (e) {
        console.log("Google Sheets auth failed");
    }

    try {
        await spreadsheet.loadInfo(); // loads document properties and worksheets
    } catch (e) {
        console.log("Failed to load Google Sheet Info.")
    }

    return spreadsheet;
}

const range_of_cells_to_load = 'A1:K100';

async function checkEventSheetExists(sheetName) {
    try {
        const spreadsheet = await getSpreadSheet(process.env.GOOGLE_SPREADSHEET_ID);

        try {
            for (let sheet in spreadsheet.sheetsByIndex) {
                // const sheet = doc.sheetsByIndex[0]; // or use doc.sheetsById[id]
                // console.log(doc.sheetsByIndex[sheet].title);
                // console.log(doc.sheetsByIndex[sheet].rowCount);

                if (spreadsheet.sheetsByIndex[sheet].title === sheetName) {
                    const found_sheet = spreadsheet.sheetsByIndex[sheet];

                    await found_sheet.loadCells(range_of_cells_to_load); // TODO this may need tweaking WARNING!

                    return found_sheet;
                }
            }
        } catch (e) {
            console.log("Failed to find test sheet and load cells.")
        }
    } catch (e) {
        console.log("Failed to get Google Sheet.")
    }

    return null;
}

async function createEventSheet(sheetName) {
    try {
        const spreadsheet = await getSpreadSheet(process.env.GOOGLE_SPREADSHEET_ID);

        try {
            const new_sheet = await spreadsheet.addSheet({ title: sheetName });

            await new_sheet.updateProperties({ index: 0 });

            await new_sheet.loadCells(range_of_cells_to_load); // TODO this may need tweaking WARNING!

            console.log(`Created new sheet: ${sheetName}.`);

            return new_sheet;
        } catch (e) {
            console.log(`Failed to create new sheet: ${sheetName}.`);
        }
    } catch (e) {
        console.log("Failed to get Google Sheet.");
    }

    return null;
}

async function updateEventSheet(event_sheet, sign_up_order, raid_helper_reactions, role_sign_up_data) {
    const order_title_cell = event_sheet.getCell(0, 0);
    order_title_cell.value = "Sign Up Order";

    const order_spacer_cell = event_sheet.getCell(0, 1);
    order_spacer_cell.value = "";

    const roles_title_cell = event_sheet.getCell(0, 2);
    roles_title_cell.value = "Roles";

    const roles_spacer_cell = event_sheet.getCell(0, 3);
    roles_spacer_cell.value = "";

    for (let sign_up in sign_up_order) {
        if (event_sheet != null) {
            // console.log(`sign_up: ${sign_up}`);
            const order_cell = event_sheet.getCell(sign_up, 0);
            order_cell.value = sign_up;

            const username_cell = event_sheet.getCell(sign_up, 1);
            username_cell.value = sign_up_order[sign_up];
        }
    }

    for (let i = 0; i < raid_helper_reactions.length; i++) {
        const role_title = event_sheet.getCell(i + 1, 2);
        role_title.value = raid_helper_reactions[i];
        for (let j = 0; j < role_sign_up_data[raid_helper_reactions[i]].length; j++) {
            // console.log(`Cell: ${i}, ${j} - ${role_sign_up_data[raid_helper_reactions[i]][j]}`);
            if (event_sheet != null) {
                const cell = event_sheet.getCell(i + 1, j + 3);
                cell.value = role_sign_up_data[raid_helper_reactions[i]][j][0];
            }
        }
    }

    await event_sheet.saveUpdatedCells();
}

/* Saved settings */

function writeSavedSettings(filename, message_ids) {

    const jsonContent = JSON.stringify(message_ids);

    fs.writeFile(filename, jsonContent, 'utf8', function (err) {
        if (err) {
            console.log(`Failed to save settings to ${filename}`);
        }

        console.log(`Settings saved to ${filename}: ${jsonContent}`);
    });
}

function getSavedSettings(guild_id) {

    let filename = `./` + guild_id + `.json`;

    let savedData = [];

    try {
        if(fs.existsSync(filename)) {
            savedData = JSON.parse(fs.readFileSync(filename, 'utf8')); // Load save data
        }
        else
        {
            savedData = [];
        }
    } catch (e) {
        throw `Failed to load saved settings for: ${guild_id}.`;
    }

    return savedData;
}

/* Regular expression code */

function regexMatchAll(regular_expression, content) {
    let result = [...content.matchAll(regular_expression)];

    let clean_result = [];

    // clean array of full matches similar to first match method
    for(let i = 0; i < result.length; i++) {
        clean_result.push(result[i][1]);
    }

    // return 1D array of matches
    result = clean_result;

    return result;
}

function regexFirstMatch(regular_expression, content) {
    const result = regular_expression.exec(content);

    if(result != null) {
        // returns index 1 as that is 1st group match
        // index 0 is full match (not what we want)
        return result[1];
    }
    else    {
        // didn't find anything
        return null;
    }
}

/* functions pulling details out of raid-helper events*/

function getEventTitle(eventMessage) {
    const titleField = eventMessage.embeds[0].fields[0];

    // console.log(`Title: ${titleField.value}`);

    const title_caps_text_regex = /\<\:(.*?)\:/gm; // everything between ``<find stuff here>``

    const title_blocks = regexMatchAll(title_caps_text_regex, titleField.value); // length 0 if nothing found

    let title_text = ``;

    if(title_blocks.length) {
        // remove trailing _ to leave correct characters
        // replace empty with " "
        // keep track of spaces to capitalise afterwards
        let space_indices = [-1]; // to force first letter to be capitalised

        for (let i = 0; i < title_blocks.length; i++) {
            if (title_blocks[i].length < 3) { // assume (char)_
                title_blocks[i] = title_blocks[i].replace(`_`, ``);
            } else { // everything else must be space
                title_blocks[i] = title_blocks[i].replace(`empty`, ` `);
                space_indices.push(i);
            }
            title_text += title_blocks[i];
        }

        // fix cases
        for (let i = 0; i < space_indices.length; i++) {
            let charIndex = space_indices[i] + 1;
            title_text = title_text.substr(0, charIndex) + title_text.charAt(charIndex).toLocaleUpperCase() + title_text.substr(charIndex + 1);
        }
    } else { // no caps blocks found so just go with as is, but strip outer ** **

        const title_regex = /\*{2}(.*?)\*{2}/gm; // everything between **<find stuff here>**

        const title_match = regexFirstMatch(title_regex, titleField.value); // null if nothing found

        title_text = title_match;
    }

    // console.log(`Title: ${title_text}`);

    return title_text;
}

function getEventDate(event_message) {
    const date_field = event_message.embeds[0].fields[3]; // assuming date is always at this index (might be dumb)

    console.log(`Date: ${date_field.value}`);

    const date_text_regex = /\*{2}\[(.*?)\]/gm; // everything between `**[<find stuff here>]`

    const date_text = regexFirstMatch(date_text_regex, date_field.value); // length 0 if nothing found

    console.log(`Date Text: ${date_text}`);
    return date_text;
}

function getEventData(event_message, raid_helper_reactions) {
    // iterate through embed fields to extract role counts, order and populate above
    const embed_fields = event_message.embeds[0].fields;

    let embed_start_index = 0;

    let role_sign_up_data = {};
    let sign_up_order = {};

    for (let role in raid_helper_reactions) {

        let field = embed_start_index; // trying to optimise loop, start from where we left off rather that scratch for each role

        let role_data = [];

        for (field in embed_fields) {
            let role_name_regex = new RegExp(":(" + raid_helper_reactions[role] + "):", "gm");

            // console.log(embed_fields[field].value)

            if (role_name_regex.test(embed_fields[field].value)) { // current field contains a role we're looking for
                let raw_role_data = embed_fields[field].value.split("\n"); // all entries are grouped together, so split them

                // remove title as it just contains role name, no info we're interested in
                raw_role_data.splice(0, 1);

                for (let sign_up in raw_role_data) {
                    const sign_up_order_regex = /\`{2}(.*?)\`{2}/gm; // everything between ``<find stuff here>``
                    const username_regex = /\*{2}(.*?)\*{2}/gm; // everything between **<find stuff here>**

                    const signup_order_match = regexFirstMatch(sign_up_order_regex, raw_role_data[sign_up]); // null if nothing found
                    const signup_username_match = regexFirstMatch(username_regex, raw_role_data[sign_up]); // null if nothing found

                    if (signup_order_match != null && signup_username_match != null) {
                        let sign_up_info = [];
                        sign_up_info.push(signup_username_match);
                        sign_up_info.push(signup_order_match); // going to keep order just in case

                        role_data.push(sign_up_info);

                        // map sign up order to username
                        sign_up_order[signup_order_match] = signup_username_match;
                    }
                }
            } else {
                role_sign_up_data[raid_helper_reactions[role]] = role_data;
            }
            embed_start_index++;
        }
    }

    // console.log("Sign up data:");
    // console.log(role_sign_up_data);
    // console.log("Sign up order:");
    // console.log(sign_up_order);
    return {role_sign_up_data, sign_up_order};
}

async function getEventReactions(event_message) {
    // build up role list from raid-helper bot reactions (as roles & classes may vary across factions etc)
    const reactions = await event_message.reactions.cache.array();

    let raid_helper_reactions = [];

    for (let reaction in reactions) {
        const users = (await reactions[reaction].users.fetch()).array();

        for (let user in users) {
            if (users[user].bot) {
                raid_helper_reactions.push(reactions[reaction].emoji.name)
                // console.log(`Role: ${eventReactions[reaction].emoji.name}, username: ${users[user].username}`);
                break;
            }
        }
    }
    return raid_helper_reactions;
}

/* Discord JS specific code */

/* pulled from https://stackoverflow.com/questions/60609287/discord-js-get-a-list-of-all-users-sent-messages */
async function userMessages(guildID, userID){
    try {
        let event_message_ids = [];

        const channels = await client.guilds.cache.get(guildID).channels.cache.array();

        for(let i = 0; i < channels.length; i++) {
            try {
                if (channels[i].type === 'text') {

                        const messages = await channels[i].messages.fetch();

                        const filtered_messages = messages.filter(m => m.author.id === userID).array();

                        for(let j = 0; j < filtered_messages.length; j++) {
                            if(filtered_messages[j].embeds.length > 0) {

                                const title_regex = /\*{2}(.*?)\*{2}/gm; // everything between **<find stuff here>**

                                const title_match = regexFirstMatch(title_regex, filtered_messages[j].embeds[0].fields[1].value); // null if nothing found

                                if(title_match != null && title_match === "Info:") {
                                    // console.log(`Event found: ${filtered_messages[j].id}`)
                                    let channel_and_message_ids = [];
                                    channel_and_message_ids.push(channels[i].id);
                                    channel_and_message_ids.push(filtered_messages[j].id);
                                    event_message_ids.push(channel_and_message_ids);
                                }
                            }
                        }
                }
            } catch (e) {
                console.log("Could not grab message from channel, moving on.")
                continue;
            }
        }

        console.log(`Event message ids: ${event_message_ids}`)
        return event_message_ids;
    } catch (e) {
        console.log(`Failed to get channels available.`)
        return [];
    }
}

async function extractInfoAndUpdateSheet(msg) {
    try {
        let event_message_ids = getSavedSettings(msg.channel.guild.id);

        for (let i = 0; i < event_message_ids.length; i++) {
            const event_message = await client.channels.cache.get(event_message_ids[i][0]).messages.fetch(event_message_ids[i][1]);

            if (event_message != null && event_message.author.username === "Raid-Helper") {

                if (event_message.embeds.length <= 0 || event_message.embeds[0].fields.length <= 0) {
                    throw "Message doesn't have embeds.";
                }

                const event_title = getEventTitle(event_message);

                const date_text = getEventDate(event_message);

                const sheet_name = date_text + ` | ` + event_title;

                let event_sheet = await checkEventSheetExists(sheet_name);

                if (event_sheet == null) {
                    event_sheet = await createEventSheet(sheet_name);
                }

                console.log(`Sheet name: ${sheet_name}`);

                let raid_helper_reactions = await getEventReactions(event_message);

                console.log("Roles:");
                console.log(raid_helper_reactions);

                let {role_sign_up_data, sign_up_order} = getEventData(event_message, raid_helper_reactions);

                if (event_sheet != null) {
                    await updateEventSheet(event_sheet, sign_up_order, raid_helper_reactions, role_sign_up_data);
                }
            }
        }
    } catch (error) {
        console.log(`failed to count roles: ${error}`);
    }
}

function checkUserRole(member, msg) {
    // if admin or officer then has permission
    if (member.roles.cache.some(role => role.name === 'Admin' || role.name === 'Officer')) {
        // console.log(`${msg.author.username} has permission to run.`);
        return true;
    } else {
        // console.log(`${msg.author.username} does not have permission to run.`);
        return false;
    }
}

function userCanRunCommand(msg) {
    let has_permissions = false;

    try {
        // get member info
        const member = msg.channel.guild.members.cache.find(currentMember => currentMember.id === msg.author.id);

        has_permissions = checkUserRole(member, msg);

    } catch (e) {
        Console.log(`Failed to check permissions.`)
    }

    return has_permissions;
}

client.on("message", async msg => {
    try {
        if (msg.content === "!clearConfig") {
            msg.delete({timeout: 100});

            try {
                if (userCanRunCommand(msg)) {
                    let filename = `./` + msg.channel.guild.id + `.json`;

                    writeSavedSettings(filename, []);
                }
            } catch (e) {
                console.log("Failed to clear config file.")
            }
        }

        if (msg.content === "!sync") {
            msg.delete({timeout: 100});
            
            try {
                if (userCanRunCommand(msg)) {
                    const raid_bot = msg.channel.client.users.cache.find(currentMember => currentMember.username === "Raid-Helper");

                    const event_message_ids = await userMessages(msg.channel.guild.id, raid_bot.id);

                    let filename = `./` + msg.channel.guild.id + `.json`;

                    writeSavedSettings(filename, event_message_ids);
                }
            } catch (e) {
                console.log("Failed to sync message & channel IDs.")
            }
        }

        if (msg.content === "!updateSheet") {
            msg.delete({timeout: 100});

            try {
                if (userCanRunCommand(msg)) {
                    await extractInfoAndUpdateSheet(msg);
                }
            } catch (e) {
                console.log("Failed to update spreadsheet.")
            }
        }
    } catch (e) {
        console.log(`Failed to process message.`);
    }
})

try {
    client.login(process.env.DISCORD_BOT_TOKEN)
} catch (e) {
    console.log("Bot failed to login to discord.");
}


