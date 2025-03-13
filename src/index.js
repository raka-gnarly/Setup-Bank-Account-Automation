const db = require("../db/db");
const { insertBank } = require("../db/insertBank");
const { waitMessage, stopBot } = require("../helpers")
const ExtractorV2 = require("./extractorv2");
const moment = require("moment");
const { exec } = require("child_process");

class SetupBankAutomation {
    constructor(bot) {
        this.bot = bot
    }

    start = async (msg) => {
        const text = msg.text;
        let dataText = {
            bank: "",
            accNumber: "",
            ifsc: "",
            upi: "",
            loginId: "",
            corporateId: "",
            password: "",
            mobileNumber: "",
            name: ""
        }

        this.bot.sendMessage(msg.chat.id, "Extracting bank details. Please wait...");
        dataText = await new ExtractorV2(text).extract();

        dataText.merchantId = process.env.MERCHANT_ID;
        let bankData = await new ExtractorV2(text).getBankNameByAI(dataText.bank);
        
        await this.bankDataAction(msg, bankData, dataText);
        
        await stopBot(this.bot, msg.chat.id);
    }

    bankDataAction = async (msg, bankData, data) => {
        if (bankData.length === 0) {
            this.bot.sendMessage(msg.chat.id, "Bank not found.  Please use a valid bank name.");
        } else {            
            if (bankData.length > 1) {
                const listBanks = bankData.map((bank, index) => {
                    return `${index + 1}. ${bank.name}`;
                }).join("\n");
                
                let retries = 0;
                let correct = false;
                while(!correct) {
                    if (retries > 3) {
                        this.bot.sendMessage(msg.chat.id, "Too many retries. Bot will stopped");
                        await stopBot(this.bot, msg.chat.id);
                        return;
                    }

                    this.bot.sendMessage(msg.chat.id, "Multiple banks found.\n" +
                        listBanks +
                        "\nPlease select which bank that want to choosed (1, 2, 3, etc).");
                    
                    const message = await waitMessage(msg.chat.id);
                    let index = parseInt(message) - 1;
                    correct = index >= 0 && index < bankData.length;

                    if (correct) {
                        await this.createBankAction(msg, [bankData[index]], data);
                    } else {
                        this.bot.sendMessage(msg.chat.id, "Invalid bank number. Please try again.");
                        retries++;
                    }
                }
            } else {
                await this.createBankAction(msg, bankData, data);
            }
        }  
    }

    createBankAction = async (msg, bankData, data) => {
        let isExist = await db("bank_accounts").where("account_numbers", data.accNumber).first();
        if (isExist) {
            this.bot.sendMessage(msg.chat.id, "Bank account already exists using this account number.");
        } else {
            const insertedData = {
                bankId: bankData[0].id,
                username: data.loginId,
                password: data.password,
                accountNumber: data.accNumber,
                customerId: data.corporateId,
                accountHolderName: data.name,
                ifscCode: data.ifsc,
                upi: data.upi,
                mobileNumber: data.mobileNumber
            };
            const createdMsg = `1. Bank: ${bankData[0].name}\n` +
                `2. Account Number: ${data.accNumber}\n` +
                `3. IFSC: ${data.ifsc}\n` +
                `4. UPI: ${data.upi}\n` +
                `5. Login ID: ${data.loginId}\n` +
                `6. Corporate ID: ${data.corporateId}\n` +
                `7. Password: ${data.password}\n` +
                `8. Mobile Number: ${data.mobileNumber}\n` +
                `9. Name: ${data.name}\n` +
                `-. Merchant ID: ${data.merchantId}\n` +
                `-. Bank ID: ${bankData[0].id}`;

            await this.bot.sendMessage(msg.chat.id, createdMsg);
            await this.bot.sendMessage(msg.chat.id, "Do you want to create this bank account? (yes/no)\n"
                + "\nor please type number 1-9 to edit the data."
            );

            const message = await waitMessage(msg.chat.id);

            if (message?.toLowerCase() === "yes") {
                await insertBank(insertedData, createdMsg, msg.chat.id);
                await this.bot.sendMessage(msg.chat.id, 
                    `[ ${moment().format("YYYY-MM-DD hh:mm:ss")} ]\n` +
                    "[ SUCCESS CREATING NEW BANK ACCOUNT ]\n" +
                    createdMsg
                );
                await this.setupServer(msg, { bankName: bankData[0].name, ...insertedData });
            } else if (parseInt(message) >= 1 && parseInt(message) <= 9) {
                await this.editDataAction({...msg, text: message}, bankData, data);
            } else {
                await this.bot.sendMessage(msg.chat.id, "Bank account creation has been cancelled.");
            }
        }
    }

    editDataAction = async (msg, bankData, data) => {
        const name = ['', 
            { key: 'bankData', title: 'Bank'},
            { key: 'accNumber', title: 'Account Number' },
            { key: 'ifsc', title: 'IFSC' },
            { key: 'upi', title: 'UPI' },
            { key: 'loginId', title: 'Login ID' },
            { key: 'corporateId', title: 'Corporate ID' },
            { key: 'password', title: 'Password' },
            { key: 'mobileNumber', title: 'Mobile Number' },
            { key: 'name', title: 'Name'} ];
        
        const index = parseInt(msg.text);

        await this.bot.sendMessage(msg.chat.id, "Please type the new value for " + name[index].title + ":");
        const message = await waitMessage(msg.chat.id);

        // update action
        if (index == 1) {
            bankData = await new ExtractorV2(message).getBankNameByAI(message);
        } else {
            data[name[index].key] = message;
        }

        await this.bankDataAction(msg, bankData, data);

    }

    setupServer = async (msg, data) => {
        await this.bot.sendMessage(msg.chat.id, "Preparing setup on server....");
        await this.bot.sendMessage(msg.chat.id, "Please insert Proxy for this account using format: \n" +
            "PROXY|USERNAME|PASSWORD\n" + "for example: 192.x.x.x:8800|username|1234"
        );

        const rawProxy = await waitMessage(msg.chat.id);
        const proxy = rawProxy?.split("|")?.[0]?.trim();
        const username = rawProxy?.split("|")?.[1]?.trim() ?? null;
        const password = rawProxy?.split("|")?.[2]?.trim() ?? null;

        let message = "[ PROXY DATA ]\n" + "Proxy: " + proxy + "\n";
        username ? message += "Username: " + username + "\n" : null;
        password ? message += "Password: " + password + "\n" : null;

        await this.bot.sendMessage(msg.chat.id,  message);
        await this.bot.sendMessage(msg.chat.id, "Preparing setup on server. Please wait...");
        try {
            exec(`sh auto.sh merchant ${data.accNumber} ${proxy} ${process.env.MERCHANT_ID} ${data.bankName}`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    throw error;
                }
                console.log(`stdout: ${stdout}`);
                console.error(`stderr: ${stderr}`);
                this.bot.sendMessage(msg.chat.id, "Server setup completed successfully.");
            });
        } catch (err) {
            console.error(err);
            await this.bot.sendMessage(msg.chat.id, "Failed to setup server. Please setup it manually.");
        }
    }
}

module.exports = SetupBankAutomation;