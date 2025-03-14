const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { Api } = require("telegram");

const fs = require("fs");
const TelegramBot = require("node-telegram-bot-api");
const { TELEGRAM_BOT_GROUP_TOKEN, TELEGRAM_API_HASH, TELEGRAM_PHONE_NUMBER, TELEGRAM_API_ID } = require("../config/index");
const path = require("path");
const { waitMessage, saveMessage } = require("../helpers");

const apiId = parseInt(TELEGRAM_API_ID); // Replace with your actual API ID
const apiHash = TELEGRAM_API_HASH; // Replace with your actual API Hash
const SESSION_FILE = path.join(__dirname, "/session.json");
const phoneNumber = TELEGRAM_PHONE_NUMBER; // Replace with your phone number
const password = '';

const bot = new TelegramBot(TELEGRAM_BOT_GROUP_TOKEN, { polling: true });
const botBank = require("../telegram");

// Load session if it exists
let stringSession = new StringSession(
    fs.existsSync(SESSION_FILE) ? fs.readFileSync(SESSION_FILE, "utf8") : ""
);

const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
});

async function createGroup(groupName, botScraper = '@paykassma_automation_scraper_bot', chatId, basePath = path.dirname(__dirname), bulk = false) {   
    bot.on("message", async (msg) => {
        await saveMessage(msg, basePath);
    });

    // ✅ Login only if session doesn't exist
    if (!fs.existsSync(SESSION_FILE)) {
        await bot.sendMessage(chatId, "[REQUEST CODE FOR TELEGRAM LOGIN]\n\nPlease send the code for login to the bot.");

        await client.start({
            phoneNumber: async () => phoneNumber,
            password: async () => password,
            phoneCode: async () => await waitMessage(chatId),
            onError: (err) => console.log(err),
        });

        await bot.sendMessage(chatId, "Success login to telegram, please wait for the bot to create the group.");
        
        // Save session
        fs.writeFileSync(SESSION_FILE, client.session.save());
        console.log("✅ Session saved! You won't need to log in again.");
    } else {
        await client.connect();
        console.log("✅ Logged in using saved session!");
    }

    // ✅ Step 1: Create a basic Telegram group
    const groupResult = await client.invoke(
        new Api.messages.CreateChat({
            users: [botScraper, "@myidbot", "@xyz_group_generator_bot"], // Add at least one user to create the group
            title: groupName,
        })
    );
    
    let groupId = groupResult.updates.chats[0].id;
    console.log(`✅ Group Created: ID = -${groupId}`);

    // ✅ Step 3: Promote a member to admin
    try {
        await client.invoke(
            new Api.messages.EditChatAdmin({
                chatId: groupId,
                userId: botScraper,
                isAdmin: true,
            })
        );
        await client.invoke(
            new Api.messages.EditChatAdmin({
                chatId: groupId,
                userId: '@xyz_group_generator_bot',
                isAdmin: true,
            })
        );
        console.log(`✅ ${botScraper} is now an admin!`);
    } catch (e) {
        console.error(`❌ Failed to promote ${botScraper} to admin: ${e}`);
    }

    let message = `[ ${new Date().toLocaleString()} ]\n` +
        "[ SUCCESS CREATING BOT GROUP ]\n" +
        "Group Name: " + groupName + "\n" +
        "Group ID: `-" + groupId + "`\n";
        
    let link = await bot.exportChatInviteLink("-" + groupId?.toString());
    message += "Group Invite Link: " + link;
    // console.log("Group Invite Link: " + link);
    
    if (bulk) {
        return {
            message,
            link: link,
        };
    }

    let retries = 0;
    while(true) {
        try {
            await bot.sendMessage(chatId, message, {
                parse_mode: "Markdown"
            });
            
            break;
        } catch (err) {
            console.error("retries");
            console.log(chatId, message);
            await new Promise((r) => setTimeout(r, 1000));
            retries++;
            if (retries > 3) {
                await botBank.sendMessage(chatId, message, {
                    parseMode: "Markdown" 
                });
                break;
            }

        }
    }

    return {
        groupId: "-" + groupId,
        groupName,
        link,
    }
}

module.exports = {
    bot,
    createGroup
};