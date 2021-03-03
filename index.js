'use strict'

//I just don't have a option to push the git from here so it'll be from desktop

require('dotenv').config();

const fs = require('fs')

const { GoogleSpreadsheet } = require('google-spreadsheet');

var schedule = require('node-schedule');
const Discord = require("discord.js");
const { title } = require('process');
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] })

client.on("ready",() => {
    console.log(`Logged in as ${client.user.tag}!`)
    console.log(process.env.GOOGLE_SPREADSHEET_ID);
    console.log(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
})

/* Google Spreadsheet code */

async function getSpreadSheet(spreadsheetID) {
    const spreadsheet = new GoogleSpreadsheet(spreadsheetID);

    //console.log(process.env.GOOGLE_SPREADSHEET_ID);

    //console.log(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
    //console.log(process.env.GOOGLE_PRIVATE_KEY);

    try {
        // use service account creds
        await spreadsheet.useServiceAccountAuth({
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY,
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

const range_of_cells_to_load = 'A1:Z100';

async function checkEventSheetExists(sheetName) {
    try {
        const spreadsheet = await getSpreadSheet(process.env.GOOGLE_SPREADSHEET_ID);
        
        try {
            for (let sheet in spreadsheet.sheetsByIndex) {
                //const sheet = use doc.sheetsByIndex[0]; // or use doc.sheetsById[id] 
                console.log(spreadsheet.sheetsByIndex[sheet].title);
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
    order_title_cell.textFormat = { bold: true };

    const order_spacer_cell = event_sheet.getCell(0, 1);
    order_spacer_cell.value = "";

    const empty_spacer_cell = event_sheet.getCell(0, 2);
    empty_spacer_cell.value = "";

    const roles_title_cell = event_sheet.getCell(0, 3);
    roles_title_cell.value = "Roles";
    roles_title_cell.textFormat = { bold: true };


    const roles_spacer_cell = event_sheet.getCell(0, 4);
    roles_spacer_cell.value = "";


    for (let sign_up in sign_up_order) {
        if (event_sheet != null) {
            // console.log(`sign_up: ${sign_up}`);
            const order_cell = event_sheet.getCell(sign_up, 0);
            order_cell.value = sign_up;

            const username_cell = event_sheet.getCell(sign_up, 1);
            username_cell.value = sign_up_order[sign_up][0];

            if(sign_up_order[sign_up][1] === "Tank" || sign_up_order[sign_up][1] === "Warrior") // #C79C6E
            {
                username_cell.backgroundColor = {
                    "red": 0.898,
                    "green": 0.823,
                    "blue": 0.741,
                    "alpha": 1.0
                };
            }
            else if(sign_up_order[sign_up][1] === "Rogue") // #FFF569
            {
                username_cell.backgroundColor = {
                    "red": 1.0,
                    "green": 0.988,
                    "blue": 0.8,
                    "alpha": 1.0
                };
            }
            else if(sign_up_order[sign_up][1] === "Hunter") // #ABD473
            {
                username_cell.backgroundColor = {
                    "red": 0.870,
                    "green": 0.933,
                    "blue": 0.788,
                    "alpha": 1.0
                };
            }
            else if(sign_up_order[sign_up][1] === "Mage") // #69CCF0
            {
                username_cell.backgroundColor = {
                    "red": 0.780,
                    "green": 0.925,
                    "blue": 0.980,
                    "alpha": 1.0
                };
            }
            else if(sign_up_order[sign_up][1] === "Warlock") // #9482C9
            {
                username_cell.backgroundColor = {
                    "red": 0.831,
                    "green": 0.803,
                    "blue": 0.913,
                    "alpha": 1.0
                };
            }
            else if(sign_up_order[sign_up][1] === "Priest") // #FFFFFF
            {
                username_cell.backgroundColor = {
                    "red": 1.0,
                    "green": 1.0,
                    "blue": 1.0,
                    "alpha": 1.0
                };
            }
            else if(sign_up_order[sign_up][1] === "Shadow") // #FFFFFF
            {
                username_cell.backgroundColor = {
                    "red": 1.0,
                    "green": 1.0,
                    "blue": 1.0,
                    "alpha": 1.0
                };
            }
            else if(sign_up_order[sign_up][1] === "RestoShaman" || sign_up_order[sign_up][1] === "Enhancer" || sign_up_order[sign_up][1] === "Elemental") // #0070DE
            {
                username_cell.backgroundColor = {
                    "red": 0.701,
                    "green": 0.850,
                    "blue": 1.0,
                    "alpha": 1.0
                };
            }
            else if(sign_up_order[sign_up][1] === "RestoDruid" || sign_up_order[sign_up][1] === "Bear" || sign_up_order[sign_up][1] === "Feral" || sign_up_order[sign_up][1] === "Balance") // #FF7D0A
            {
                username_cell.backgroundColor = {
                    "red": 1.0,
                    "green": 0.862,
                    "blue": 0.741,
                    "alpha": 1.0
                };
            }
            else if(sign_up_order[sign_up][1] === "Late") // #F58CBA
            {
                username_cell.backgroundColor = {
                    "red": 0.984,
                    "green": 0.796,
                    "blue": 0.878,
                    "alpha": 1.0
                };
            }
            else if(sign_up_order[sign_up][1] === "Bench") // #A330C9
            {
                username_cell.backgroundColor = {
                    "red": 0.898,
                    "green": 0.756,
                    "blue": 0.941,
                    "alpha": 1.0
                };
            }
            else if(sign_up_order[sign_up][1] === "Tentative") // #00FF96
            {
                username_cell.backgroundColor = {
                    "red": 0.741,
                    "green": 1.0,
                    "blue": 0.894,
                    "alpha": 1.0
                };
            }
            else if(sign_up_order[sign_up][1] === "Absence") // #C41F3B
            {
                username_cell.backgroundColor = {
                    "red": 0.921,
                    "green": 0.458,
                    "blue": 0.537,
                    "alpha": 1.0
                };
            }
        }
    }

    for (let i = 0; i < raid_helper_reactions.length; i++) {
        const role_title = event_sheet.getCell(1, i + 3);

        const role_count_regex = /\(([^)]*)\)/g; // everything between `**[<find stuff here>]`

        const role_count_match = regexFirstMatch(role_count_regex, role_title.value); // length 0 if nothing found

        let role_count = 0;
        let less = false;

        if(role_count_match != null && role_count_match.length > 0)
        {
            role_count = parseInt(role_count_match[0]);

            less = role_count > role_sign_up_data[raid_helper_reactions[i]].length;
        }

        if(less)
        {
            const difference = role_count - role_sign_up_data[raid_helper_reactions[i]].length;

            for (let j = 2 + role_sign_up_data[raid_helper_reactions[i]].length + difference - 1; j > role_sign_up_data[raid_helper_reactions[i]].length + 1; j--) {
                if (event_sheet != null) {
                    const cell = event_sheet.getCell(j, i + 3);
                    cell.value = "";
                    cell.clearAllFormatting();
                }
            }
        }

        role_title.value = raid_helper_reactions[i] + " (" + role_sign_up_data[raid_helper_reactions[i]].length + ")";
        role_title.textFormat = { bold: true };

        console.log(`Colour: ${role_title}`);

        if(raid_helper_reactions[i] === "Tank" || raid_helper_reactions[i] === "Warrior") // #C79C6E
        {
            role_title.backgroundColor = {
                "red": 0.78,
                "green": 0.612,
                "blue": 0.431,
                "alpha": 1.0
            };
        }
        else if(raid_helper_reactions[i] === "Rogue") // #FFF569
        {
            role_title.backgroundColor = {
                "red": 1.0,
                "green": 0.961,
                "blue": 0.412,
                "alpha": 1.0
            };
        }
        else if(raid_helper_reactions[i] === "Hunter") // #ABD473
        {
            role_title.backgroundColor = {
                "red": 0.671,
                "green": 0.831,
                "blue": 0.451,
                "alpha": 1.0
            };
        }
        else if(raid_helper_reactions[i] === "Mage") // #69CCF0
        {
            role_title.backgroundColor = {
                "red": 0.412,
                "green": 0.8,
                "blue": 0.941,
                "alpha": 1.0
            };
        }
        else if(raid_helper_reactions[i] === "Warlock") // #9482C9
        {
            role_title.backgroundColor = {
                "red": 0.58,
                "green": 0.51,
                "blue": 0.788,
                "alpha": 1.0
            };
        }
        else if(raid_helper_reactions[i] === "Priest") // #FFFFFF
        {
            role_title.backgroundColor = {
                "red": 1.0,
                "green": 1.0,
                "blue": 1.0,
                "alpha": 1.0
            };
        }
        else if(raid_helper_reactions[i] === "Shadow") // #FFFFFF
        {
            role_title.backgroundColor = {
                "red": 1.0,
                "green": 1.0,
                "blue": 1.0,
                "alpha": 1.0
            };
        }
        else if(raid_helper_reactions[i] === "RestoShaman" || raid_helper_reactions[i] === "Enhancer" || raid_helper_reactions[i] === "Elemental") // #0070DE
        {
            role_title.backgroundColor = {
                "red": 0.0,
                "green": 0.439,
                "blue": 0.871,
                "alpha": 1.0
            };
        }
        else if(raid_helper_reactions[i] === "RestoDruid" || raid_helper_reactions[i] === "Bear" || raid_helper_reactions[i] === "Feral" || raid_helper_reactions[i] === "Balance") // #FF7D0A
        {
            role_title.backgroundColor = {
                "red": 1.0,
                "green": 0.49,
                "blue": 0.039,
                "alpha": 1.0
            };
        }
        else if(raid_helper_reactions[i] === "Late") // #F58CBA
        {
            role_title.backgroundColor = {
                "red": 0.960,
                "green": 0.549,
                "blue": 0.729,
                "alpha": 1.0
            };
        }
        else if(raid_helper_reactions[i] === "Bench") // #A330C9
        {
            role_title.backgroundColor = {
                "red": 0.639,
                "green": 0.188,
                "blue": 0.788,
                "alpha": 1.0
            };
        }
        else if(raid_helper_reactions[i] === "Tentative") // #00FF96
        {
            role_title.backgroundColor = {
                "red": 0.0,
                "green": 1.0,
                "blue": 0.588,
                "alpha": 1.0
            };
        }
        else if(raid_helper_reactions[i] === "Absence") // #C41F3B
        {
            role_title.backgroundColor = {
                "red": 0.768,
                "green": 0.768,
                "blue": 0.121,
                "alpha": 1.0
            };
        }

        for (let j = 0; j < role_sign_up_data[raid_helper_reactions[i]].length; j++) {
            // console.log(`Cell: ${i}, ${j} - ${role_sign_up_data[raid_helper_reactions[i]][j]}`);
            if (event_sheet != null) {
                const cell = event_sheet.getCell(j + 2, i + 3);
                cell.value = role_sign_up_data[raid_helper_reactions[i]][j][0];

                if(raid_helper_reactions[i] === "Tank" || raid_helper_reactions[i] === "Warrior") // #C79C6E
                {
                    cell.backgroundColor = {
                        "red": 0.898,
                        "green": 0.823,
                        "blue": 0.741,
                        "alpha": 1.0
                    };
                }
                else if(raid_helper_reactions[i] === "Rogue") // #FFF569
                {
                    cell.backgroundColor = {
                        "red": 1.0,
                        "green": 0.988,
                        "blue": 0.8,
                        "alpha": 1.0
                    };
                }
                else if(raid_helper_reactions[i] === "Hunter") // #ABD473
                {
                    cell.backgroundColor = {
                        "red": 0.870,
                        "green": 0.933,
                        "blue": 0.788,
                        "alpha": 1.0
                    };
                }
                else if(raid_helper_reactions[i] === "Mage") // #69CCF0
                {
                    cell.backgroundColor = {
                        "red": 0.780,
                        "green": 0.925,
                        "blue": 0.980,
                        "alpha": 1.0
                    };
                }
                else if(raid_helper_reactions[i] === "Warlock") // #9482C9
                {
                    cell.backgroundColor = {
                        "red": 0.831,
                        "green": 0.803,
                        "blue": 0.913,
                        "alpha": 1.0
                    };
                }
                else if(raid_helper_reactions[i] === "Priest") // #FFFFFF
                {
                    cell.backgroundColor = {
                        "red": 1.0,
                        "green": 1.0,
                        "blue": 1.0,
                        "alpha": 1.0
                    };
                }
                else if(raid_helper_reactions[i] === "Shadow") // #FFFFFF
                {
                    cell.backgroundColor = {
                        "red": 1.0,
                        "green": 1.0,
                        "blue": 1.0,
                        "alpha": 1.0
                    };
                }
                else if(raid_helper_reactions[i] === "RestoShaman" || raid_helper_reactions[i] === "Enhancer" || raid_helper_reactions[i] === "Elemental") // #0070DE
                {
                    cell.backgroundColor = {
                        "red": 0.701,
                        "green": 0.850,
                        "blue": 1.0,
                        "alpha": 1.0
                    };
                }
                else if(raid_helper_reactions[i] === "RestoDruid" || raid_helper_reactions[i] === "Bear" || raid_helper_reactions[i] === "Feral" || raid_helper_reactions[i] === "Balance") // #FF7D0A
                {
                    cell.backgroundColor = {
                        "red": 1.0,
                        "green": 0.862,
                        "blue": 0.741,
                        "alpha": 1.0
                    };
                }
                else if(raid_helper_reactions[i] === "Late") // #F58CBA
                {
                    cell.backgroundColor = {
                        "red": 0.984,
                        "green": 0.796,
                        "blue": 0.878,
                        "alpha": 1.0
                    };
                }
                else if(raid_helper_reactions[i] === "Bench") // #A330C9
                {
                    cell.backgroundColor = {
                        "red": 0.898,
                        "green": 0.756,
                        "blue": 0.941,
                        "alpha": 1.0
                    };
                }
                else if(raid_helper_reactions[i] === "Tentative") // #00FF96
                {
                    cell.backgroundColor = {
                        "red": 0.741,
                        "green": 1.0,
                        "blue": 0.894,
                        "alpha": 1.0
                    };
                }
                else if(raid_helper_reactions[i] === "Absence") // #C41F3B
                {
                    cell.backgroundColor = {
                        "red": 0.921,
                        "green": 0.458,
                        "blue": 0.537,
                        "alpha": 1.0
                    };
                }
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

    let filename = `./data/` + guild_id + `.json`;

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

function getEventTitle(eventMessage, showLogging) {
    const titleField = eventMessage.embeds[0].description;
    
    console.log(`Title: ${titleField}`);

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
    const date_field = event_message.embeds[0].fields[1]; // assuming date is always at this index (might be dumb)

    if(showLogging)
        console.log(`Date: ${date_field.value}`);

    const date_text_regex = /\*{2}\[(.*?)\]/gm; // everything between `**[<find stuff here>]`

    const date_text = regexFirstMatch(date_text_regex, date_field.value); // length 0 if nothing found

    if(showLogging)
        console.log(`Date Text: ${date_text}`);

    return date_text;
}

let roleMapping = {};

// order in which they appear in event
roleMapping["Tank"] = ["Tank", "Bear", "ProtPaladin"];
roleMapping["Warrior"] = ["Warrior"];
roleMapping["Rogue"] = ["Rogue"];
roleMapping["Hunter"] = ["Hunter"];
roleMapping["Mage"] = ["Mage"];
roleMapping["Warlock"] = ["Warlock"];
roleMapping["Druid"] = ["RestoDruid", "Balance", "Feral"];
roleMapping["Shaman"] = ["Elemental", "Enhancer", "RestoShaman"];
roleMapping["Priest"] = ["Priest", "Shadow"];
roleMapping["Paladin"] = ["HolyPaladin", "Retri"];
roleMapping["Late"] = ["Late"];
roleMapping["Bench"] = ["Bench"];
roleMapping["Tentative"] = ["Tentative"];
roleMapping["Absence"] = ["Absence"];

// [
// 'Tank',        'Warrior',
//     'Rogue',       'Hunter',
//     'Mage',        'Warlock',
//     'Priest',      'Shadow',
//     'RestoShaman', 'Enhancer',
//     'Elemental',   'RestoDruid',
//     'Bear',        'Feral',
//     'Balance',     'Late',
//     'Bench',       'Tentative',
//     'Absence'
// ]

// [
// 'Tank',        'Warrior',
//     'Rogue',       'Hunter',
//     'Mage',        'Warlock',
//     'Priest',      'Shadow',
//     'HolyPaladin', 'Retri',
//     'ProtPaladin', 'RestoDruid',
//     'Bear',        'Feral',
//     'Balance',     'Late',
//     'Bench',       'Tentative',
//     'Absence'
// ]

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
                    const class_regex = /\:(.*?)\:/gm; // everything between :<find stuff here>:
                    const sign_up_order_regex = /\`{1}(.*?)\`{1}/gm; // everything between ``<find stuff here>``
                    const username_regex = /\*{2}(.*?)\*{2}/gm; // everything between **<find stuff here>**

                    let class_match = regexFirstMatch(class_regex, raw_role_data[sign_up]); // null if nothing found
                    const signup_order_match = regexFirstMatch(sign_up_order_regex, raw_role_data[sign_up]); // null if nothing found
                    const signup_username_match = regexFirstMatch(username_regex, raw_role_data[sign_up]); // null if nothing found

                    if(role === "Late" || role === "Bench" || role === "Tentative" || role === "Absence") {
                        class_match = role;
                    }

                    if (class_match != null && signup_order_match != null && signup_username_match != null) {
                        let sign_up_info = [];
                        sign_up_info.push(signup_username_match);
                        sign_up_info.push(signup_order_match); // going to keep order just in case

                        role_classes[class_match].push(sign_up_info);

                        let name_and_role = [];

                        name_and_role.push(signup_username_match);
                        name_and_role.push(class_match);

                        // map sign up order to username
                        sign_up_order[signup_order_match] = name_and_role;
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
                // console.log(`Role: ${eventReactions[reaction].emoji.name}, username: ${users[user].username}`);
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
                            const title_regex = /\*{2}(.*?)\*{2}/gm; // everything between **<find stuff here>**

                            const title_match = regexFirstMatch(title_regex, filtered_messages[j].embeds[0].fields[1].value); // null if nothing found
                            
                            if(title_match != null/* && title_match === "Info:"*/) {
                                console.log(`Event found: ${filtered_messages[j].id}`)
                                let channel_and_message_ids = [];
                                channel_and_message_ids.push(channels[i].id);
                                channel_and_message_ids.push(filtered_messages[j].id);
                                event_message_ids.push(channel_and_message_ids);
                            }
                        }
                    }
                }
            } catch (e) {
                if(showLogging)
                    console.log("Could not grab message from " + channels[i].name + ", moving on.")
                continue;
            }
        }

        if(showLogging)
            console.log(`Event message ids: ${event_message_ids}`)

        return event_message_ids;
    } catch (e) {
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

                const date_text = getEventDate(event_message, showLogging);

                const sheet_name = date_text + ` | ` + event_title;

                let event_sheet = await checkEventSheetExists(sheet_name);

                if (event_sheet == null) {
                    event_sheet = await createEventSheet(sheet_name, showLogging);
                }

                if(showLogging)
                    console.log(`Sheet name: ${sheet_name}`);

                let raid_helper_reactions = await getEventReactions(event_message);

                if(showLogging) {
                    console.log("Roles:");
                    console.log(raid_helper_reactions);
                }

                let {role_sign_up_data, sign_up_order} = getEventData(event_message, raid_helper_reactions, showLogging);

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

        let filename = `./data/` + guilds[i].id + `.json`;

        await writeSavedSettings(filename, event_message_ids);

        await promiseWaiting();

        await extractInfoAndUpdateSheet(guilds[i].id, false);
    }
}

client.on("message", async msg => {
    try {
        if (msg.content === "!clearConfig") {
            //msg.delete({timeout: 100});
            try {
                if (userCanRunCommand(msg)) {
                    let filename = `./data/` + msg.channel.guild.id + `.json`;

                    await writeSavedSettings(filename, [], true);
                }
            } catch (e) {
                console.log("Failed to clear config file.")
            }
        }

        if (msg.content === "!test") {
            //msg.delete({timeout: 100});
            try {
                if (userCanRunCommand(msg)) {
                    console.log("Running autoTask");
                    await autoTask();
                }
            } catch (e) {
                console.log("Failed to auto run.")
            }
        }

        if (msg.content === "!syncSheet") {
            try {
                //msg.delete({timeout: 100});
                if (userCanRunCommand(msg)) {
                    const raid_bot_member = await msg.guild.members.fetch('579155972115660803');

                    const raid_bot = raid_bot_member.user;

                    if(raid_bot  != null) {

                        const event_message_ids = await userMessages(msg.channel.guild.id, raid_bot.id, true);

                        console.log("mesages: " + event_message_ids);

                        let filename = `./data/` + msg.channel.guild.id + `.json`;

                        await writeSavedSettings(filename, event_message_ids, true);
                    }
                    else {
                        console.log("Could not find Raid-Helper user.")
                    }
                }
            } catch (e) {
                console.log("Failed to sync message & channel IDs.")
            }
        }

        if (msg.content === "!updateSheet") {
            //msg.delete({timeout: 100});
            try {
                if (userCanRunCommand(msg)) {
                    await extractInfoAndUpdateSheet(msg.channel.guild.id, true);
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
    client.login(process.env.DISCORD_BOT_TOKEN);
} catch (e) {
    console.log("Bot failed to login to discord.");
}

schedule.scheduleJob('*/15 * * * *', async function(){  // this for one hour
    try {
        await autoTask();

        console.log('Scheduled task complete.');
    } catch (e) {
        console.log("Failed scheduled task.")
    }
});
