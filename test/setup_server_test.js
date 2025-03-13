const TelegramBot = require("node-telegram-bot-api");
const { TELEGRAM_BOT_TOKEN } = require("../config");
const { waitMessage, saveMessage } = require("../helpers");
const { exec } = require("child_process");

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
const chatId = "-4674967499";
const data = {
    accNumber: "1234567890",
    bankName: "bankName"
}

bot.on("message", async (msg) => {
    await saveMessage(msg);
})

const setupServer = async (data) => {
    await bot.sendMessage(chatId, "Preparing setup on server....");
    await bot.sendMessage(chatId, "Please insert Proxy for this account using format: \n" +
        "PROXY|USERNAME|PASSWORD\n" + "for example: 192.x.x.x:8800|username|1234"
    );

    const rawProxy = await waitMessage(chatId);
    const proxy = rawProxy?.split("|")?.[0]?.trim();
    const username = rawProxy?.split("|")?.[1]?.trim() ?? null;
    const password = rawProxy?.split("|")?.[2]?.trim() ?? null;

    let message = "[ PROXY DATA ]\n" + "Proxy: " + proxy + "\n";
    username ? message += "Username: " + username + "\n" : null;
    password ? message += "Password: " + password + "\n" : null;

    await bot.sendMessage(chatId,  message);
    await bot.sendMessage(chatId, "Preparing setup on server. Please wait...");
    try {
        const command = `"C:\\Program Files\\Git\\bin\\sh.exe" D:\\setupBank\\auto.sh merchant ${data.accNumber} ${proxy} ${process.env.MERCHANT_ID} ${data.bankName}`;
        console.log(command);
        await new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    reject(error);
                    return;
                }
                console.log(`stdout: ${stdout}`);
                console.error(`stderr: ${stderr}`);
                bot.sendMessage(chatId, "Server setup completed successfully.");
                resolve();
            });
        });
    } catch (err) {
        console.error(err);
        await bot.sendMessage(chatId, "Failed to setup server. Please setup it manually.");
    }

    console.log('done');
}

setupServer(data);