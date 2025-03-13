const TelegramBot = require("node-telegram-bot-api");
const { TELEGRAM_BOT_TOKEN } = require("./config/index");
const SetupBankAutomation = require("./src");
const fs = require("fs");
const { saveMessage, waitMessage, checkDir, stopBot } = require("./helpers");
const jsonfile = require("jsonfile");
const path = require("path");

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
const setupBot = new SetupBankAutomation(bot);

const start = async (msg) => {
    const id = msg.chat.id?.toString()?.replace("-", "");
    const filePath = path.join(__dirname, `data/${id}.json`);
    const data = await jsonfile.readFile(filePath);
    await jsonfile.writeFile(filePath, { ...data, start: true });

    await bot.sendMessage(msg.chat.id, "Welcome to the bot. Please paste the bank details here.");
    const message = await waitMessage(msg.chat.id);

    await setupBot.start({...msg, text: message});
}

bot.onText("/test", async(msg) => {
    try {
        await setupBot.test(msg.chat.id);
    } catch (err) {
        console.error(err);
    }
})

bot.onText("/start", async (msg) => {
    try {
        await start(msg);
    } catch (err) {
        console.error(err);
    }
});

bot.onText("/stop", async (msg) => {
    try {
        await stopBot(bot, msg.chat.id);
    } catch (err) {
        console.error(err);
    }
});

bot.on("message", async (msg) => {
    await checkDir();
    const id = msg.chat.id?.toString()?.replace("-", "");
    const filePath = path.join(__dirname, `data/${id}.json`);
    if (!fs.existsSync(filePath)) {
        await jsonfile.writeFile(filePath, { start: false });
    }

    let data = await jsonfile.readFile(filePath);

    if (data?.start) {
        await saveMessage(msg);
    } else if (msg.text !== "/start" && msg.text !== "/stop") {
        await bot.sendMessage(msg.chat.id, "Please type /start to start the bot.");
    }
})


module.exports = bot;