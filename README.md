# Raid Helper

[If you don't know about Raid Helper, check it out.  It's amazing!](https://raid-helper.com/index)

-----

# raid-helper-sheets

The idea behind this project is to piggyback onto Raid Helper - "a feature-rich event organization tool for discord", listening in to events, taking those details and stuffing them into a Google Sheet.

Raid Helper has a ton  of useful features that can already track attendance and more.  However, by linking the events information to a Google Sheet there is great opportunity to add and customise further organisational tools in a more accessible format.

Originally Developed by @Henryprescott
Subsequent Development by @ZeroInitiative, @Industrial-Peons


# Installation on Heroku

Before going to Heroku, make sure you have an Account in Github and Click on the 'Fork' button in the upper right of the project.  Go through the steps to setup a github clone of this project under your github account.

You'll now need a Heroku account.  Go ahead and create one if you don't already and associate it with your github as a Third Party Service under your account settings > applications.

Within Heroko you want to create an app.  it can be named anything.  You don't need to add this to a pipeline. For deployment select 'GitHub' and you should see your github account. just click 'search' and then click 'connect' next to 'raid-helper-sheets' from the list (you just forked this into your github account right?)

click 'Enable Automatic Deploys'.

You can try this out on a free account however with the free tier (550 hours for anonymous) you need to add/verify a credit card to get it to (1000 hours) to get it to run continuously through the month so you may want to add your credit card to heroku if you want it run without stopping.. otherwise it will pause after the 23rd day of the month.

Updating- all you need to do is go back into github and pull any updates i've got into your fork and heroku which is watching your branch will automatically update/deploy the new version for you.

# Discord Permissions

through the discord developer portal you should generate an OAUTH authentication token with the following enabled:

* read messages

* list message history

* delete messages

you'll need this for the environment Variables.

# Google Sheets

Well you need a Google Sheet that you want this to send data to.  Open your google sheets project and note the value after  "/edit#gid=" in your browser. you'll need this for configuration.

# Google Cloud Console

You'll also need to go into the google google cloud console and create a google service account that has access to your Sheet to do the things it needs to do.  go to https://console.cloud.google.com/apis/dashboard with your google account.. if you don't have a project then create one and select it.  Go to the Service Accounts section: https://console.cloud.google.com/iam-admin/serviceaccounts .  Create a new service account..Name it anything you want.. Create and Continue.. 

# Environment variables
You pretty much need to set the following environment variables for this app to be of any use to you!.  If you're using Heroku, click Settings tab within your App that you deployed for this and click 'Reveal Config Vars' in the Config Vars section.  You'll need to add the following KEYS exactly as shown and then key in your values for those keys.

GOOGLE_SPREADSHEET_ID

create a sheet in google sheets and the number at the end of the url after "/edit#gid=" is the number to put here.

GOOGLE_SERVICE_ACCOUNT_EMAIL

You'll need to have google sheets API enabled through the google developer portal and then google will generate an email address for it.

GOOGLE_PRIVATE_KEY

through the developer portal find your service account that you created and then generate a private key for it and save the whole private key (long string) here.  If you pull this from downloaded JSON, before that you remove the quotes. the env var should start with  ----- and end with -----   wrapping the whole massive certificate.

DISCORD_BOT_TOKEN

You will need to add a discord bot token that you can generate through the discord developer portal

DISCORD_ROLES

Csv list of Roles that have accesss to the application that need to match your actual discord roles for roles that you want to be able to send commands to the bot.  if not set, this will default to:   Admin,Guild Officer

Which will grant users with (Admin) or users with (Guild OFficer) access to use the bot.


# Bot Commands

!test - attempts to delete the row

!clearConfig - clears the config - i'm guessing you call this if you delete some signups

!syncSheet - builds the config for which posts to sync

!updateSheet - takes the config and syncs the posts with your google spreadsheet

# TODO

currently have to manual edit the Roles in the app - should be exposed via parameter (see checkUserRole function)

currently have to tweak the filter to find the raid-helper posts to ingest- should be exposed via the parameter


