const { bot, createGroup } = require("../group");

let chatId = null;
let requestName = false;
let requestBot = false;

let groupName = null;
let botUsername = null;

let groupCreator = "-4616249484";

bot.onText("/create", async (msg) => {
    if (msg.chat.id == groupCreator) {
        chatId = msg.chat.id;
        bot.sendMessage(chatId, "Welcome to Telegram Group Maker Bot! Please type name of the group.");
        requestName = true;
    }
});

bot.onText("/test", async (msg) => {
    if (msg.chat.id == groupCreator) {
        bot.sendMessage(msg.chat.id, "Test Link\n\n https://samolet.ru/project/bogdanovskij-les/flats/277126/", {
            disable_web_page_preview: false,
            parse_mode: "Markdown"
        });
    }
})

bot.on("message", async (msg) => {
    if (requestName) {
        groupName = msg.text;
        bot.sendMessage(chatId, `Group name: ${groupName}\n\nPlease type the bot username.`);
        requestName = false;
        requestBot = true;
    } else if (requestBot) {
        botUsername = msg.text;
        bot.sendMessage(chatId, `Bot username: ${botUsername}\n\nPlease wait while creating group`);
        requestBot = false;
        
        await createGroup(groupName, botUsername, chatId);
        chatId = null;
        groupName = null;
        botUsername = null;
    }

    if (
        !requestName && 
        !requestBot && 
        !msg.text?.includes("@") && 
        msg.text !== undefined && 
        msg.chat.id == groupCreator &&
        msg.text !== "/create"
    ) {
        console.log("cek ", msg.text);
        bot.sendMessage(groupCreator, "Please type /create to create a group.");
    }
});