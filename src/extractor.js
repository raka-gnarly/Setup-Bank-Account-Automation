class Extractor {
    constructor(text) {
        this.text = text;
    }

    getBankName() {
        if (this.text.toLowerCase().includes("bank") && !this.text.toLowerCase().includes("banking") && !this.text.toLowerCase().includes("account")) {
            if (this.text.includes(":")) {
                return this.text.split(":")[1].trim();
            } else {
                return this.text.trim();
            }
        }
        return null;
    }

    getAccountNumber() {
        if (this.text.toLowerCase().includes("account number") || this.text.toLowerCase().includes("acc number") || this.text.toLowerCase().includes("account no")) {
            if (this.text.includes(":")) {
                return this.text.split(":")[1].trim();
            } else if (this.text.includes("-")){
                return this.text.split("-")?.[1]?.trim();
            } else if (this.text.toLowerCase().includes("account number ")){
                return this.text.toLowerCase().split("account number ")[1].trim();
            } else if (this.text.toLowerCase().includes("acc number ")){
                return this.text.toLowerCase().split("acc number ")[1].trim();
            }
        }
        return null;
    }

    getIFSC() {
        if (this.text.toLowerCase().includes("ifsc")) {
            if (this.text.includes(":")) {
                return this.text.split(":")?.[1]?.trim();
            } else if (this.text.includes("-")){
                return this.text.split("-")?.[1]?.trim();
            } else if (this.text.toLowerCase().includes("ifsc ")){
                return this.text.toLowerCase().split("ifsc ")[1].trim().toUpperCase();
            }
        }
        return null;
    }

    getUPI() {
        if (this.text.toUpperCase().includes("UPI")) {
            if (this.text.includes(":")) {
                return this.text.split(":")?.[1]?.trim();
            } else if (this.text.includes("-")){
                return this.text.split("-")?.[1]?.trim();
            } else if (this.text.toLowerCase().includes("upi ")){
                return this.text.toLowerCase().split("upi ")[1].trim();
            }
        }
        return null;
    }

    getLoginId() {
        if (this.text.toLowerCase().includes("login") || this.text.includes("Net banking id") || this.text.toLowerCase().includes("username")) {
            if (this.text.includes(":")) {
                return this.text.split(":")?.[1]?.trim();
            } else if (this.text.includes("-")){
                return this.text.split("-")?.[1]?.trim();
            } else if (this.text.includes("login ")){
                return this.text.split("login ")[1].trim();
            }
        }
        return null;
    }

    getPassword() {
        if (this.text.includes("Password") || this.text.includes("pass")) {
            if (this.text.includes(":")) {
                return this.text.split(":")?.[1]?.trim();
            } else if (this.text.includes("-")){
                return this.text.split("-")?.[1]?.trim();
            } else if (this.text.includes("pass ")){
                return this.text.split("pass ")[1].trim();
            }
        }
        return null;
    }

    getMobileNumber() {
        let mobileNumber = null;
        if (this.text.includes("Mobile Number") || this.text.toLowerCase().includes("phone")) {
            if (this.text.includes(":")) {
                mobileNumber = this.text.split(":")?.[1]?.trim();
            } else if (this.text.includes("-")){
                mobileNumber = this.text.split("-")?.[1]?.trim();
            } else if (this.text.toLowerCase().includes("phone ")){
                mobileNumber = this.text.toLowerCase().split("phone ")[1].trim();
            }

            return "91" + mobileNumber.replace(/[^0-9]/g, "");
        }
        return null;
    }

    getName() {
        if (this.text.toUpperCase().includes("NAME") && !this.text.toUpperCase().includes("USERNAME")) {
            if (this.text.includes(":")) {
                return this.text.split(":")?.[1]?.trim();
            } else if (this.text.includes("-")){
                return this.text.split("-")?.[1]?.trim();
            } else if (this.text.toUpperCase().includes("NAME ")){
                return this.text.toUpperCase().split("NAME ")[1].trim();
            }
        }
        return null;
    }
}

module.exports = Extractor;