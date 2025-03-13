const db = require("./db/db");

require("./telegram");
const fastify = require("fastify")({
    logger: false,
  });

(async () => {
    await fastify.listen({ port: process.env.PORT, host: "0.0.0.0" });

    console.info(`Server Started at ${process.env.API_SERVER_URL}:${process.env.PORT}`);
})();