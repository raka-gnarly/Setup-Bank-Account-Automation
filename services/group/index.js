const { bot, createGroup } = require("../../group");
const { saveMessage, checkDir, waitMessage, readFile } = require("../../helpers");
const jsonfile = require("jsonfile");
const fs = require("fs");
const path = require("path");

let groupCreator = "-4616249484";
let basePath = path.dirname(__dirname) + "\\group";

const init = async () => {
    console.log("Starting Bot Group Generator ...");
    const files = fs.readdirSync(path.join(basePath, "data"));

    for (const file of files) {
        if (path.extname(file) === ".json") {
            const filePath = path.join(basePath, "data", file);
            const data = await readFile(filePath);
            await jsonfile.writeFile(filePath, { ...data, start: false });
        }
    }
    await new Promise((r) => setTimeout(r, 2000));
    console.log("Bot Group Generator Started!");
}

const start = async (msg) => {
    await checkDir(basePath);
    console.log(__dirname);
    const id = msg.chat.id?.toString()?.replace("-", "");
    const filePath = path.join(__dirname, `data/${id}.json`);
    const data = await readFile(filePath);
    await jsonfile.writeFile(filePath, { ...data, start: true });

    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "Welcome to Telegram Group Maker Bot! Please type name of the group.");
    console.log(basePath);
    let groupName = await waitMessage(msg.chat.id, basePath);
    bot.sendMessage(chatId, `Group name: ${groupName}\n\nPlease type the bot username.`);

    let botName = await waitMessage(msg.chat.id, basePath);
    bot.sendMessage(chatId, `Bot username: ${botName}\n\nPlease wait while creating group`);

    await createGroup(groupName, botName, chatId, basePath);
}

bot.onText("/create", async (msg) => {
    if (msg.chat.id == groupCreator) {
        await start(msg);
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
    if (msg.chat.id == groupCreator) {
        await checkDir(basePath);
        const id = msg.chat.id?.toString()?.replace("-", "");
        const filePath = path.join(basePath, `data/${id}.json`);
        if (!fs.existsSync(filePath)) {
            await jsonfile.writeFile(filePath, { start: false });
        }
        const data = await readFile(filePath);

        if (data?.start) {
            await saveMessage(msg, basePath);
        } else if (msg.text !== "/create" && msg.text !== "/stop") {
            await bot.sendMessage(msg.chat.id, "Please type /start to start the bot.");
        }
    }
});

init();