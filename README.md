# Raid Helper

[If you don't know about Raid Helper, check it out.  It's amazing!](https://raid-helper.com/index)

-----

# raid-helper-sheets

The idea behind this project is to piggyback onto Raid Helper - "a feature-rich event organization tool for discord", listening in to events, taking those details and stuffing them into a Google Sheet.

Raid Helper has a ton  of useful features that can already track attendance and more.  However, by linking the events information to a Google Sheet there is great opportunity to add and customise further organisational tools in a more accessible format.

# Heroku settings

Appears to run fine on a free account.  There is no UI. so set as a worker dyno instead of a web dyno.

# Environment variables

GOOGLE_SPREADSHEET_ID

create a sheet in google sheets and the number at the end of the url after "/edit#gid=" is the number to put here.

GOOGLE_SERVICE_ACCOUNT_EMAIL

You'll need to have google sheets API enabled through the google developer portal and then google will generate an email address for it.

GOOGLE_PRIVATE_KEY

through the developer portal find your service account that you created and then generate a private key for it and save the whole private key (long string) here.

DISCORD_BOT_TOKEN

You will need to add a discord bot token that you can generate through the discord developer portal

# Discord Permissions

through the discord developer portal you should generate an OAUTH authentication token with the following enabled:

read messages

list message history

delete messages

# Bot Commands

!test - attempts to delete the row

!clearConfig - clears the config - i'm guessing you call this if you delete some signups

!syncSheet - builds the config for which posts to sync

!updateSheet - takes the config and syncs the posts with your google spreadsheet

# TODO

currently have to manual edit the Roles in the app - should be exposed via parameter (see checkUserRole function)

currently have to tweak the filter to find the raid-helper posts to ingest- should be exposed via the parameter


