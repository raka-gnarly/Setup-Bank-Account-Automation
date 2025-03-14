require("dotenv").config({ path: ".env" });

const DATABASE_URL = process.env.DATABASE_URL;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_BOT_GROUP_TOKEN = process.env.TELEGRAM_BOT_GROUP_TOKEN;
const TELEGRAM_API_HASH = process.env.TELEGRAM_API_HASH;
const TELEGRAM_PHONE_NUMBER = process.env.TELEGRAM_PHONE_NUMBER;
const TELEGRAM_API_ID = process.env.TELEGRAM_API_ID;
const AI_TOKEN = process.env.AI_TOKEN;

module.exports = {
  AI_TOKEN,
  DATABASE_URL,
  TELEGRAM_BOT_TOKEN,
  TELEGRAM_BOT_GROUP_TOKEN,
  TELEGRAM_API_HASH,
  TELEGRAM_PHONE_NUMBER,
  TELEGRAM_API_ID
};
