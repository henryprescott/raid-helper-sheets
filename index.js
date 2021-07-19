'use strict'

require('dotenv').config();

const fs = require('fs')

const { GoogleSpreadsheet } = require('google-spreadsheet');

var schedule = require('node-schedule');
const Discord = require("discord.js")
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] })

let roleMapping = {};

// order in which they appear in events
roleMapping["Tank"] = ["Protection", "Protection1", "Guardian"];
roleMapping["Warrior"] = ["Fury", "Arms"];
roleMapping["Rogue"] = ["Combat", "Assassination", "Subtlety"];
roleMapping["Hunter"] = ["Beastmastery", "Survival", "Marksmanship"];
roleMapping["Mage"] = ["Fire", "Frost", "Arcane"];
roleMapping["Warlock"] = ["Destruction", "Demonology", "Affliction"];
roleMapping["Druid"] = ["Restoration", "Balance", "Feral"];
roleMapping["Shaman"] = ["Elemental", "Enhancement", "Restoration1"];
roleMapping["Priest"] = ["Holy", "Shadow", "Discipline"];
roleMapping["Paladin"] = ["Holy1", "Retribution"];
roleMapping["Late"] = ["Late"];
roleMapping["Bench"] = ["Bench"];
roleMapping["Tentative"] = ["Tentative"];
roleMapping["Absence"] = ["Absence"];

let classMapping = {};

classMapping["Warrior"] = ["Protection","Fury", "Arms"];
classMapping["Rogue"] = ["Combat", "Assassination", "Subtlety"];
classMapping["Hunter"] = ["Beastmastery", "Survival", "Marksmanship"];
classMapping["Mage"] = ["Fire", "Frost", "Arcane"];
classMapping["Druid"] = ["Restoration", "Balance", "Feral", "Guardian"];
classMapping["Shaman"] = ["Elemental", "Enhancement", "Restoration1"];
classMapping["Priest"] = ["Holy", "Shadow", "Discipline"];
classMapping["Paladin"] = ["Holy1", "Retribution", "Protection1"];
classMapping["Warlock"] = ["Destruction", "Demonology", "Affliction"];
classMapping["Late"] = ["Late"];
classMapping["Bench"] = ["Bench"];
classMapping["Tentative"] = ["Tentative"];
classMapping["Absence"] = ["Absence"];

function lookupClass(spec)
{
    for (let mappedClass in classMapping) {
        if (classMapping[mappedClass].includes(spec))
            return mappedClass;
    }
}

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
        console.error(e);
        console.log("Google Sheets auth failed");
    }

    try {
        await spreadsheet.loadInfo(); // loads document properties and worksheets
    } catch (e) {
        console.error(e);
        console.log("Failed to load Google Sheet Info.");
    }

    return spreadsheet;
}

const range_of_cells_to_load = { // GridRange object
  startRowIndex: 0, endRowIndex: 100, startColumnIndex:0, endColumnIndex: 40
};

async function checkEventSheetExists(sheetName) {
    try {
        const spreadsheet = await getSpreadSheet(process.env.GOOGLE_SPREADSHEET_ID);

        try {
            for (let sheet in spreadsheet.sheetsByIndex) {
                if (spreadsheet.sheetsByIndex[sheet].title === sheetName) {
                    const found_sheet = spreadsheet.sheetsByIndex[sheet];

                    await found_sheet.loadCells(range_of_cells_to_load); // TODO this may need tweaking WARNING!

                    return found_sheet;
                }
            }
        } catch (e) {
            console.error(e);
            console.log("Failed to find test sheet and load cells.");
        }
    } catch (e) {
        console.error(e);
        console.log("Failed to get Google Sheet.");
    }

    return null;
}

async function createEventSheet(sheetName, showLogging) {
    try {
        const spreadsheet = await getSpreadSheet(process.env.GOOGLE_SPREADSHEET_ID);

        try {
            const new_sheet = await spreadsheet.addSheet({ title: sheetName });

            await new_sheet.updateProperties({ index: 0 });

            await new_sheet.loadCells(range_of_cells_to_load); // TODO this may need tweaking WARNING!

            if(showLogging)
                console.log(`Created new sheet: ${sheetName}.`);

            return new_sheet;
        } catch (e) {
            console.error(e);
            console.log(`Failed to create new sheet: ${sheetName}.`);
        }
    } catch (e) {
        console.error(e);
        console.log("Failed to get Google Sheet.");
    }

    return null;
}

async function updateEventSheet(event_sheet, sign_up_order, raid_helper_reactions, role_sign_up_data) {
    const order_title_cell = event_sheet.getCell(0, 0);
    order_title_cell.value = "Sign Up Order";
    order_title_cell.textFormat = { bold: true };

    const order_spacer_cell = event_sheet.getCell(0, 1);
    order_spacer_cell.value = "Name";


    const roles_title_cell = event_sheet.getCell(0, 2);
    roles_title_cell.value = "Role";
    
    for (let sign_up in sign_up_order) {
        if (event_sheet != null) {
            // console.log(`sign_up: ${sign_up}`);
            const order_cell = event_sheet.getCell(sign_up, 0);
            order_cell.value = sign_up;

            const username_cell = event_sheet.getCell(sign_up, 1);
            username_cell.value = sign_up_order[sign_up][0];
            
            const class_cell = event_sheet.getCell(sign_up, 2);
            
            const spec_cell =  event_sheet.getCell(sign_up, 3);
            const spec = sign_up_order[sign_up][1].replace("1", "");
            
            const role_cell = event_sheet.getCell(sign_up, 4);
            
            // Determine the Class
            class_cell.value = lookupClass(sign_up_order[sign_up][1]);
	
            
            var role = "";

            
            // Determine the Role.. needs some more refactoring.

            if(["Protection","Protection1","Guardian"].includes(sign_up_order[sign_up][1])) // Tanks / #C79C6E
            {
                role = "Tank";
            }
            else if(["Restoration","Restoration1","Holy","Holy1","Discipline"].includes(sign_up_order[sign_up][1]))  //Healers
            {
                role = "Healer";
            }
            else if(["Hunter","Mage","Warlock","Shadow","Elemental"].includes(sign_up_order[sign_up][1]))
            {
                role = "DPS-Ranged";
            }
            else
            {
                role = "DPS-Melee";
            }
        
            class_cell.value = role + " (" + spec + ")";

            // Original logic to color the cells based on class/role
            if(sign_up_order[sign_up][1] === "Protection" || sign_up_order[sign_up][1] === "Arms" || sign_up_order[sign_up][1] === "Fury") // warrior / #ac937b
            {
                username_cell.backgroundColor = {
                    "red": 0.6745,
                    "green": 0.5765,
                    "blue": 0.4824,
                    "alpha": 1.0
                };
            }
            else if(sign_up_order[sign_up][1] === "Rogue" || sign_up_order[sign_up][1] === "Assassination" || sign_up_order[sign_up][1] === "Combat" || sign_up_order[sign_up][1] === "Subtlety") // #FFF2af
            {
                username_cell.backgroundColor = {
                    "red": 1.0,
                    "green": 0.949,
                    "blue": 0.6863,
                    "alpha": 1.0
                };
            }
            else if(sign_up_order[sign_up][1] === "Hunter" || sign_up_order[sign_up][1] === "Beastmastery" || sign_up_order[sign_up][1] === "Marksmanship" || sign_up_order[sign_up][1] === "Survival") // #a7d3a1
            {
                username_cell.backgroundColor = {
                    "red": 0.6549,
                    "green": 0.8275,
                    "blue": 0.6314,
                    "alpha": 1.0
                };
            }
            else if(sign_up_order[sign_up][1] === "Mage" || sign_up_order[sign_up][1] === "Arcane" || sign_up_order[sign_up][1] === "Frost" || sign_up_order[sign_up][1] === "Fire") // #7edfff
            {
                username_cell.backgroundColor = {
                    "red": 0.4941,
                    "green": 0.8745,
                    "blue": 1.0,
                    "alpha": 1.0
                };
            }
            else if(sign_up_order[sign_up][1] === "Warlock" || sign_up_order[sign_up][1] === "Demonology" || sign_up_order[sign_up][1] === "Destruction" || sign_up_order[sign_up][1] === "Affliction") // #a482e9
            {
                username_cell.backgroundColor = {
                    "red": 0.6431,
                    "green": 0.5098,
                    "blue": 0.9137,
                    "alpha": 1.0
                };
            }
            else if(sign_up_order[sign_up][1] === "Priest" || sign_up_order[sign_up][1] === "Holy" || sign_up_order[sign_up][1] === "Discipline") // #f2e0f6
            {
                username_cell.backgroundColor = {
                    "red": 0.949,
                    "green": 0.8784,
                    "blue": 0.9647,
                    "alpha": 1.0
                };
            }
            else if(sign_up_order[sign_up][1] === "Shadow") // #f2e0f6
            {
                username_cell.backgroundColor = {
                    "red": 0.949,
                    "green": 0.8784,
                    "blue": 0.9647,
                    "alpha": 1.0
                };
            }
            else if(sign_up_order[sign_up][1] === "Restoration1" || sign_up_order[sign_up][1] === "Enhancement" || sign_up_order[sign_up][1] === "Elemental") // #4b91e7
            {
                username_cell.backgroundColor = {
                    "red": 0.2941,
                    "green": 0.5686,
                    "blue": 0.9059,
                    "alpha": 1.0
                };
            }
            else if(sign_up_order[sign_up][1] === "Restoration" || sign_up_order[sign_up][1] === "Guardian" || sign_up_order[sign_up][1] === "Feral" || sign_up_order[sign_up][1] === "Balance") // #faab6f
            {
                username_cell.backgroundColor = {
                    "red": 0.9804,
                    "green": 0.6706,
                    "blue": 0.4353,
                    "alpha": 1.0
                };
            }
            else if(sign_up_order[sign_up][1] === "Late") // #99cc33
            {
                username_cell.backgroundColor = {
                    "red": 0.6,
                    "green": 0.8,
                    "blue": 0.2,
                    "alpha": 1.0
                };
            }
            else if(sign_up_order[sign_up][1] === "Holy1" || sign_up_order[sign_up][1] === "Retribution" || sign_up_order[sign_up][1] === "Protection1") // #ffc2d2
            {
                username_cell.backgroundColor = {
                    "red": 1,
                    "green": 0.7608,
                    "blue": 0.8235,
                    "alpha": 1.0
                };
            }
            else if(sign_up_order[sign_up][1] === "Bench") // #339900
            {
                username_cell.backgroundColor = {
                    "red": 0.2,
                    "green": 0.6,
                    "blue": 0.0,
                    "alpha": 1.0
                };
            }
            else if(sign_up_order[sign_up][1] === "Tentative") // #ffcc00
            {
                username_cell.backgroundColor = {
                    "red": 1.0,
                    "green": 0.8,
                    "blue": 0.0,
                    "alpha": 1.0
                };
            }
            else if(sign_up_order[sign_up][1] === "Absence") // #cc3300
            {
                username_cell.backgroundColor = {
                    "red": 0.8,
                    "green": 0.2,
                    "blue": 0.0,
                    "alpha": 1.0
                };
            }
        }
    }

    await event_sheet.saveUpdatedCells();
}

/* Saved settings */

async function writeSavedSettings(filename, message_ids, showLogging) {

    const jsonContent = JSON.stringify(message_ids);

    fs.writeFile(filename, jsonContent, 'utf8', function (err) {
        if (err) {
            console.log(`Failed to save settings to ${filename}`);
        }
        if(showLogging)
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
        console.error(e);
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

function getEventTitle(eventMessage, showLogging) {
    const titleField = eventMessage.embeds[0].description;

    // console.log(`Title: ${titleField.value}`);

    const title_caps_text_regex = /\<\:(.*?)\:/gm; // everything between ``<find stuff here>``

    const title_blocks = regexMatchAll(title_caps_text_regex, titleField); // length 0 if nothing found

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

    if(showLogging)
        console.log(`Title: ${title_text}`);

    return title_text;
}

function getEventDate(event_message, showLogging) {
    const date_field = event_message.embeds[0].fields[0]; // assuming date is always at this index (might be dumb)
    
    console.log(`Date: ${date_field.value}`);
    if(showLogging)
        console.log(`Date: ${date_field.value}`);

    const date_text_regex = /\*{2}\[(.*?)\]/gm; // everything between `**[<find stuff here>]`

    const date_text = regexFirstMatch(date_text_regex, date_field.value); // length 0 if nothing found

    if(showLogging)
        console.log(`Date Text: ${date_text}`);

    return date_text;
}

function getEventData(event_message, raid_helper_reactions, showLogging) {
    // iterate through embed fields to extract role counts, order and populate above
    const embed_fields = event_message.embeds[0].fields;

    let role_sign_up_data = {};
    let sign_up_order = {};

    let role_and_class_data = [];

    for (let role in roleMapping) {

        let role_classes = {};

        for (let wow_class in roleMapping[role]) {
            role_classes[roleMapping[role][wow_class]] = [];
            role_sign_up_data[roleMapping[role][wow_class]] = [];
        }

        for (let field in embed_fields) { // TODO this could be improved, doesn't need to start from 0 each time
            let role_name_regex = new RegExp("__(" + role + ")__", "gm");
            let partial_role = new RegExp(":(" + role +"):", "gm"); // Late, Bench, Tentative & Absent are formatted differently
            let partial_empty = new RegExp(":(empty):", "gm"); // Late, Bench, Tentative & Absent are formatted differently

            let found_role_in_line = role_name_regex.test(embed_fields[field].value);
            let found_partial_role = partial_role.test(embed_fields[field].value);
            let looking_for_partial_role = role === "Late" || role === "Bench" || role === "Tentative" || role === "Absence";

            // used to also check for empty rows, but format changed, so adjust below to accomodate that.
            if ( found_role_in_line || (found_partial_role && looking_for_partial_role)) { // current field contains a role we're looking for
                let raw_role_data;

                if(looking_for_partial_role) {
                    const partial_sign_up_regex = new RegExp("(:"+role+":.*?)","gm"); // everything between :<find stuff here>:

                    raw_role_data = embed_fields[field].value.split("\n");

                    for(let lines in raw_role_data) {
                        let partial_sign_up_match = regexFirstMatch(partial_sign_up_regex, raw_role_data[lines]); // null if nothing found

                        if (partial_sign_up_match != null) {
                            raw_role_data = raw_role_data[lines].split(","); // all entries are grouped together, so split them
                            break;
                        } else {
                            continue;
                        }
                    }
                } else {
                    raw_role_data = embed_fields[field].value.split("\n"); // all entries are grouped together, so split them

                    // remove title as it just contains role name, no info we're interested in
                    raw_role_data.splice(0, 1);
                }

                for (let sign_up in raw_role_data) {

                    const raw_role_pattern = /^<:(?<role>[a-zA-Z0-9]+):[0-9]+>\s(?:[a-zA-Z0-9]+\s\([0-9]+\)\s:\s<:(?<realRole>[a-zA-Z0-9]+):[0-9]+>\s)?`(?<num>[0-9]+)`\s\*\*(?<name>.*)\*\*/g;
                    const match = raw_role_pattern.exec(raw_role_data[sign_up]);
                    if(role === "Late" || role === "Bench" || role === "Tentative" || role === "Absence") {
                        class_match = role;
                    }

                    if(match){
                        let sign_up_info = [];
                        const signup_username_match = match.groups.name;
                        const signup_order_match = match.groups.num;
                        const class_match = match.groups.role;
                        sign_up_info.push(signup_username_match);
                        sign_up_info.push(signup_order_match); // going to keep order just in case
                        role_classes[class_match].push(sign_up_info);

                        let name_and_role = [];

                        name_and_role.push(signup_username_match);
                        name_and_role.push(class_match);
                        if(match.groups.realRole){
                            name_and_role.push(match.groups.realRole);
                        }

                        // map sign up order to username
                        sign_up_order[signup_order_match] = name_and_role;
                    } else{
                        console.err("Unable to process " + raw_role_data[sign_up]);
                    }
                }

                role_and_class_data.push(role_classes);
            }
        }
    }

    for(let role in role_and_class_data) {
        for(let sub_role in role_and_class_data[role]) {
            role_sign_up_data[sub_role] = role_and_class_data[role][sub_role];
        }
    }
    
    // Condense from TBC roles back to something that fits in sheets.
    
    role_sign_up_data["Mage"] = [...role_sign_up_data["Fire"], ...role_sign_up_data["Frost"], ...role_sign_up_data["Arcane"]];
    delete role_sign_up_data["Fire"];
    delete role_sign_up_data["Frost"];
    delete role_sign_up_data["Arcane"];
    role_sign_up_data["Warlock"] = [...role_sign_up_data["Destruction"], ...role_sign_up_data["Demonology"], ...role_sign_up_data["Affliction"]];
    delete role_sign_up_data["Destruction"];
    delete role_sign_up_data["Demonology"];
    delete role_sign_up_data["Affliction"];
    role_sign_up_data["Hunter"] = [...role_sign_up_data["Beastmastery"], ...role_sign_up_data["Survival"], ...role_sign_up_data["Marksmanship"]];
    delete role_sign_up_data["Beastmastery"];
    delete role_sign_up_data["Survival"];
    delete role_sign_up_data["Marksmanship"];
    role_sign_up_data["Rogue"] = [...role_sign_up_data["Subtlety"], ...role_sign_up_data["Assassination"], ...role_sign_up_data["Combat"]];
    delete role_sign_up_data["Subtlety"];
    delete role_sign_up_data["Assassination"];
    delete role_sign_up_data["Combat"];

    if(showLogging) {
        // console.log("Sign up data:");
        // console.log(role_sign_up_data);
        console.log("Sign up order:");
        console.log(sign_up_order);
    }
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
                console.log(`Role: ${reactions[reaction].emoji.name}, username: ${users[user].username}`);
                break;
            }
        }
    }
    return raid_helper_reactions;
}

/* Discord JS specific code */

/* pulled from https://stackoverflow.com/questions/60609287/discord-js-get-a-list-of-all-users-sent-messages */
async function userMessages(guildID, userID, showLogging){
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

                                // const title_regex = /\*{2}(.*?)\*{2}/gm; // everything between **<find stuff here>**
                                // console.log(JSON.stringify(filtered_messages[j],null,2))

                                // const title_match = regexFirstMatch(title_regex, filtered_messages[j].embeds[0].fields[1].value); // null if nothing found
                                // console.log(JSON.stringify(filtered_messages[j].embeds[0],null,2))
                                //if(filtered_messages[j].embeds[0].description.trim().substring(0,6) === "Leader:") {
                                    // console.log(`Event found: ${filtered_messages[j].id}`)
                                let channel_and_message_ids = [];
                                channel_and_message_ids.push(channels[i].id);
                                channel_and_message_ids.push(filtered_messages[j].id);
                                event_message_ids.push(channel_and_message_ids);
                                //}
                            }
                        }
                }
            } catch (e) {
                if(showLogging)
                    console.log("Could not grab message from " + channels[i].name + ", moving on.")
                    console.log("Error " + e)
                continue;
            }
        }

        if(showLogging)
            console.log(`Event message ids: ${event_message_ids}`)

        return event_message_ids;
    } catch (e) {
        console.error(e);
        console.log(`Failed to get channels available.`)
        return [];
    }
}

async function extractInfoAndUpdateSheet(guildID, showLogging) {
    try {
        let event_message_ids = getSavedSettings(guildID);

        for (let i = 0; i < event_message_ids.length; i++) {
            const event_message = await client.channels.cache.get(event_message_ids[i][0]).messages.fetch(event_message_ids[i][1]);

            if (event_message != null && event_message.author.username === "Raid-Helper") {

                if (event_message.embeds.length <= 0 || event_message.embeds[0].fields.length <= 0) {
                    throw "Message doesn't have embeds.";
                }

                const event_title = getEventTitle(event_message, showLogging);
                //console.log("Raw Event Message");
                console.log(event_message);
                const date_text = getEventDate(event_message, showLogging);

                const sheet_name = date_text + ` | ` + event_title;

                let event_sheet = await checkEventSheetExists(sheet_name);

                if (event_sheet == null) {
                    event_sheet = await createEventSheet(sheet_name, showLogging);
                }

                if(showLogging)
                    console.log(`Sheet name: ${sheet_name}`);
                // this doesn't seem to be valid.  see TODO001
                let raid_helper_reactions = await getEventReactions(event_message);

                if(showLogging) {
                    // console.log("Roles:");
                    // console.log(raid_helper_reactions);
                }
                // this doesn't seem to the be way.. TODO001 -
                let {role_sign_up_data, sign_up_order} = getEventData(event_message, raid_helper_reactions, showLogging);
                
                if (event_sheet != null) {
                    // TODO001 - also changed 
                    // await updateEventSheet(event_sheet, sign_up_order, raid_helper_reactions, role_sign_up_data);
                    await updateEventSheet(event_sheet, sign_up_order, Object.keys(role_sign_up_data), role_sign_up_data);
                }
            }
        }
    } catch (e) {
        console.error(e);
        console.log(`failed to count roles: ${error}`);
    }
}

function checkUserRole(member, msg) {
    
    let roles_with_access = ["Admin","Guild Officer"];
    if(process.env.DISCORD_ROLES) { 
        roles_with_access = process.env.DISCORD_ROLES.split(",");
    }

    if (member.roles.cache.some(role => roles_with_access.includes(role.name))) {
        console.log(`${msg.author.username} has permission to run.`);
        return true;
    } else {
        console.log(`${msg.author.username} does not have permission to run.`);
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
        console.error(e);
        Console.log(`Failed to check permissions.`)
    }

    return has_permissions;
}

function promiseWaiting() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve('done.');
        }, 4000);
    });
}

async function autoTask() {
    const raid_bot = await client.users.fetch('579155972115660803');

    const guilds = client.guilds.cache.array();

    for( let i = 0; i < guilds.length; i++) {
        const event_message_ids = await userMessages(guilds[i].id, raid_bot.id, false);

        let filename = `./` + guilds[i].id + `.json`;

        await writeSavedSettings(filename, event_message_ids);

        await promiseWaiting();

        await extractInfoAndUpdateSheet(guilds[i].id, false);
    }
}

client.on("message", async msg => {
    try {
        if (msg.content === "!clearConfig") {
            msg.delete({timeout: 100});
            try {
                if (userCanRunCommand(msg)) {
                    let filename = `./` + msg.channel.guild.id + `.json`;

                    await writeSavedSettings(filename, [], true);
                }
            } catch (e) {
                console.error(e);
                console.log("Failed to clear config file.")
            }
        }

        if (msg.content === "!test") {
            msg.delete({timeout: 100});
            try {
                if (userCanRunCommand(msg)) {
                    await autoTask();
                }
            } catch (e) {
                console.error(e);
                console.log("Failed to auto run.")
            }
        }

        if (msg.content === "!syncSheet") {
            try {
                msg.delete({timeout: 100});
                if (userCanRunCommand(msg)) {
                    const raid_bot_member = await msg.guild.members.fetch('579155972115660803');

                    const raid_bot = raid_bot_member.user;

                    if(raid_bot  != null) {

                        const event_message_ids = await userMessages(msg.channel.guild.id, raid_bot.id, true);

                        console.log("mesages: " + event_message_ids);

                        let filename = `./` + msg.channel.guild.id + `.json`;

                        await writeSavedSettings(filename, event_message_ids, true);
                    }
                    else {
                        console.log("Could not find Raid-Helper user.")
                    }
                }
            } catch (e) {
                console.error(e);
                console.log("Failed to sync message & channel IDs.")
            }
        }

        if (msg.content === "!updateSheet") {
            msg.delete({timeout: 100});
            try {
                if (userCanRunCommand(msg)) {
                    await extractInfoAndUpdateSheet(msg.channel.guild.id, true);
                }
            } catch (e) {
                console.error(e);
                console.log("Failed to update spreadsheet.")
            }
        }
    } catch (e) {
        console.error(e);
        console.log(`Failed to process message.`);
    }
})

try {
    client.login(process.env.DISCORD_BOT_TOKEN);
} catch (e) {
    console.error(e);
    console.log("Bot failed to login to discord.");
}

schedule.scheduleJob('*/15 * * * *', async function(){  // this for one hour
    try {
        await autoTask();

        console.log('Scheduled task complete.');
    } catch (e) {
        console.error(e);
        console.log("Failed scheduled task.")
    }
});
