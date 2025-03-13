const path = require("path");
const fs = require("fs");
const jsonfile = require("jsonfile");
const { readFile } = require("./helpers");

require("./telegram");
const fastify = require("fastify")({
    logger: false,
  });

(async () => {
    console.log("Starting Bot Auto Setup Bank Account ...");
    const files = fs.readdirSync(path.join(__dirname, "data"));

    for (const file of files) {
        if (path.extname(file) === ".json") {
            const filePath = path.join(__dirname, "data", file);
            const data = await readFile(filePath);
            await jsonfile.writeFile(filePath, { ...data, start: false });
        }
    }
    await new Promise((r) => setTimeout(r, 2000));
    console.log("Bot Auto Setup Bank Account Started!");
    
    await fastify.listen({ port: process.env.PORT, host: "0.0.0.0" });
    console.info(`Server Started at ${process.env.API_SERVER_URL}:${process.env.PORT}`);
})();