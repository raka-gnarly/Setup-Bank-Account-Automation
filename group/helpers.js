
const jsonfile = require("jsonfile");

const getCode = async (path) => {
    try {
      let telegramConfig = jsonfile.readFileSync(path);
  
      return telegramConfig?.code ?? null;
    } catch (error) {
      throw error;
    }
};


async function fetchCode(path){
    let loginCode = await getCode(path);
    while (!loginCode) {
        console.log("waiting for code....");
        await new Promise((r) => setTimeout(r, 2000));
        loginCode = await getCode(path);

        if (loginCode) {
            console.log("loginCode", loginCode);
            return loginCode;
        }
    }

}

module.exports = {
    fetchCode
}