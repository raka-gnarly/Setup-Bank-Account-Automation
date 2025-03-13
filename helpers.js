
const jsonfile = require("jsonfile");
const path = require("path");
const fs = require("fs");

const stopBot = async (bot, chatId) => {
    const id = chatId?.toString()?.replace("-", "");
    const filePath = path.join(__dirname, `data/${id}.json`);
    const data = await jsonfile.readFile(filePath);
    await jsonfile.writeFile(filePath, { ...data, start: false });

    await bot.sendMessage(chatId, "Please type /start to start the bot again.");
}

const toggleConfig = async (chatId, value) => {
    const id = chatId?.toString()?.replace("-", "");
    const filePath = path.join(__dirname, `data/${id}.json`);

    const data = jsonfile.readFileSync(filePath);
    jsonfile.writeFileSync(filePath, { ...data, on: value });

    // wait for toggle action
    await new Promise((r) => setTimeout(r, 200));
}

const resetText = async (chatId) => {
    const id = chatId?.toString()?.replace("-", "");
    const filePath = path.join(__dirname, `data/${id}.json`);

    const data = jsonfile.readFileSync(filePath);
    jsonfile.writeFileSync(filePath, { ...data, text: null });
}

const checkDir = async () => {
    try {
        const parentPath = path.join(__dirname, "data");
        if (!fs.existsSync(parentPath)) {
            fs.mkdirSync(parentPath, { recursive: true });
        }
    } catch (error) {
        throw error;
    }
}

const getMessage = async (chatId) => {
    try {
        const id = chatId?.toString()?.replace("-", "");
        const filePath = path.join(__dirname, `data/${id}.json`);
        
        let message = await jsonfile.readFile(filePath);
  
        return message?.text ?? null;
    } catch (error) {
        throw error;
    }
};

async function waitMessage(chatId){
    await checkDir();
    await resetText(chatId);
    await toggleConfig(chatId, true);
    let message = await getMessage(chatId);

    while (!message) {
        console.log("waiting for message on group....");
        await new Promise((r) => setTimeout(r, 2000));
        message = await getMessage(chatId);

        if (message) {
            console.log("message", message);
            await toggleConfig(chatId, false);

            return message;
        }
    }
}

async function saveMessage(msg) {
    try {
        await checkDir();

        const id = msg.chat.id?.toString().replace("-", "");
        const filePath = path.join(__dirname, `data/${id}.json`);
        
        const data = jsonfile.readFileSync(filePath);
        if (data?.on) {
            await jsonfile.writeFile(filePath, {
                ...data,
                text: msg.text,
            });
        }
    } catch (error) {
        throw error;
    }
}

module.exports = {
    waitMessage,
    saveMessage,
    checkDir,
    stopBot
}