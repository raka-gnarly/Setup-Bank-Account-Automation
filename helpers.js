
const jsonfile = require("jsonfile");
const path = require("path");
const fs = require("fs");
const defaultPath = path.join(__dirname, "");

const stopBot = async (bot, chatId) => {
    const id = chatId?.toString()?.replace("-", "");
    const filePath = path.join(defaultPath, `data/${id}.json`);
    const data = await jsonfile.readFile(filePath);
    await jsonfile.writeFile(filePath, { ...data, start: false });

    await bot.sendMessage(chatId, "Please type /start to start the bot again.");
}

const readFile = async (filePath) => {
    let data = null;
    let retries = 0;
    while (true) {
        try {
            data = await jsonfile.readFile(filePath);
            break;
        } catch (err) {
            console.log("retries");
            if (err?.toString()?.includes("Unexpected end of JSON input")) {
                retries++;
                if (retries > 3) {
                    await jsonfile.writeFile(filePath, { });
                }
                await new Promise((r) => setTimeout(r, 500));
            }
        }
    }

    return data;
}

const toggleConfig = async (chatId, value, basePath = defaultPath) => {
    const id = chatId?.toString()?.replace("-", "");
    const filePath = path.join(basePath, `data/${id}.json`);

    const data = jsonfile.readFileSync(filePath);
    jsonfile.writeFileSync(filePath, { ...data, on: value });

    // wait for toggle action
    await new Promise((r) => setTimeout(r, 200));
}

const resetText = async (chatId, basePath = defaultPath) => {
    const id = chatId?.toString()?.replace("-", "");
    const filePath = path.join(basePath, `data/${id}.json`);

    const data = jsonfile.readFileSync(filePath);
    jsonfile.writeFileSync(filePath, { ...data, text: null });
}

const checkDir = async (basePath = defaultPath) => {
    try {
        const parentPath = path.join(basePath, "data");
        if (!fs.existsSync(parentPath)) {
            fs.mkdirSync(parentPath, { recursive: true });
        }
    } catch (error) {
        throw error;
    }
}

const getMessage = async (chatId, basePath = defaultPath) => {
    try {
        const id = chatId?.toString()?.replace("-", "");
        const filePath = path.join(basePath, `data/${id}.json`);
        
        let message = await jsonfile.readFile(filePath);
  
        return message?.text ?? null;
    } catch (error) {
        throw error;
    }
};

async function waitMessage(chatId, basePath = defaultPath){
    await checkDir(basePath);
    await resetText(chatId, basePath);
    await toggleConfig(chatId, true, basePath);
    let message = await getMessage(chatId, basePath);

    while (!message) {
        console.log("waiting for message on group....");
        await new Promise((r) => setTimeout(r, 2000));
        message = await getMessage(chatId, basePath);

        if (message) {
            console.log("message", message);
            await toggleConfig(chatId, false, basePath);

            return message;
        }
    }
}

async function saveMessage(msg, basePath = defaultPath) {
    try {
        await checkDir(basePath);

        const id = msg.chat.id?.toString().replace("-", "");
        const filePath = path.join(basePath, `data/${id}.json`);
        if (fs.existsSync(filePath)) {
            const data = await readFile(filePath);

            if (data?.on) {
                await jsonfile.writeFile(filePath, {
                    ...data,
                    text: msg.text,
                });
            }
        }
    } catch (error) {
        throw error;
    }
}

module.exports = {
    waitMessage,
    saveMessage,
    checkDir,
    stopBot,
    readFile
}