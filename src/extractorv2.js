const { default: axios } = require("axios");
const db = require("../db/db");
const { AI_TOKEN } = require("../config/index");

class ExtractorV2 {
    constructor(text) {
        this.text = text;
    }

    extract = async () => {
        let formatted = [];
        const command = "convert this into \n" + 
                        "Bank Name: (name of the bank)\n" + 
                        "Account Number: (account number)\n" + 
                        "IFSC: (ifsc code from the bank account)\n" + 
                        "UPI: (upi id from the bank account)\n" + 
                        "Login ID: (login id or username that used for login)\n" + 
                        "Corporate ID: (corporate id or customer id, it nullable)\n" + 
                        "Password: (password for login)\n" + 
                        "Mobile Number: (mobile number, consist of number only)\n" + 
                        "Holder Name: (the account name that owner of this account)\n" +
                        this.text + "\n" +
                        "replace any \\n and ** on the result, just plain text and mobile number will only have numbers\n" +
                        "for corporate id, if you don't have it, just leave it blank";

        try {
            let response = await this.prompt(command) ?? "";
            formatted = response?.toString().split("\n");
            return {
                bank: this.getValue(formatted, "Bank Name") ?? "",
                accNumber: this.getValue(formatted, "Account Number") ?? "",
                ifsc: this.getValue(formatted, "IFSC") ?? "",
                upi: this.getValue(formatted, "UPI") ?? "",
                loginId: this.getValue(formatted, "Login ID") ?? "",
                corporateId: this.getValue(formatted, "Corporate ID") ?? "",
                password: this.getValue(formatted, "Password") ?? "",
                name: this.getValue(formatted, "Holder Name") ?? "",
                mobileNumber: "91" + this.getValue(formatted, "Mobile Number")?.replace(/[^0-9]/g, "") ?? "",
            }
        } catch(err) {
            console.error(err);
            return null;
        };
    }

    getBankNameByAI = async (bankName) => {
        let formatted = [];
        let banks = await db("banks").select("name", "id").where("merchant_id", process.env.MERCHANT_ID);
        banks = banks.map((bank) => {
            return `Bank id: ${bank.id}. Bank Name : ${bank.name}`;
        }
        ).join("\n");

        const command = "i have list bank like this \n" +  
                        banks + "\n" +
                        `please choose which bank that suitable for ${bankName}. Please just give me the result as plain text like this\n` +
                        "(name of bank suitable) || " + "(id of bank that suitable)";

        try {
            let response = await this.prompt(command) ?? ""
            formatted = response?.toString().split("\n");
            formatted = formatted.map((item) => ({
                name: item.split("||")[0].trim(),
                id: item.split("||")[1].trim(),
            }));
            console.log(formatted);
            return formatted;
        } catch(err) {
            console.error(err);
            return null;
        };
    }
  
    getValue(text, name) {
        return text.filter((item) => item.includes(name))[0].replace(`${name}:`, "").trim()
    }

    prompt = async (text) => {
        let message = '';

        while (message === '') {
            message = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
                model: "deepseek/deepseek-chat:free",
                messages: [{ role: "user", content: text  }]
            }, {
                headers: {
                    'Authorization': AI_TOKEN
                }
            });
            message = message.data.choices[0].message.content;
            console.log(message);
        }
        
        return message;
    }
}

module.exports = ExtractorV2;