const { createGroup } = require("../group");
const db = require("./db");
const moment = require("moment");

const insertBank = async ({
    bankId,
    username,
    password,
    accountNumber,
    customerId,
    accountHolderName,
    ifscCode,
    upi,
    mobileNumber
}, createdMsg, chatId) => {
    try {
        const latestBank = await db("bank_accounts")
            .select("api_server_port as port")
            .whereNotNull("api_server_port")
            .orderBy("api_server_port", "desc")
            .first();
            
        const data = {
            merchantId: process.env.MERCHANT_ID,
            bankId,
            username,
            password,
            accountNumber,
            customerId,
            accountHolderName,
            ifscCode,
            upi,
            balanceLimit: 120000,
            apiServerPort: latestBank.port + 1,
            isActive: 1,
            createdAt: moment().startOf("day").format("YYYY-MM-DD HH:mm:ss"),
            updatedAt: moment().startOf("day").format("YYYY-MM-DD HH:mm:ss"),
            dailyMaxTransaction: 0,
            dailyMaxAmount: 1000000,
            minAmount: 300,
            maxAmount: 50000,
            telegramChatId: "",
            mobileNumber,
        }

        const bankData = createdMsg?.split("\n");
        const bankName = bankData.filter((data) => data.includes("Bank:"))[0].split(":")[1].trim();
        const numberAccount = bankData.filter((data) => data.includes("Account Number:"))[0].split(":")[1].trim();
        const accountName = bankData.filter((data) => data.includes("Name:"))[0].split(":")[1].trim();

        const groupName = `BOT - ${bankName} - ${numberAccount} - ${accountName}`;
        const botScraper = '@paykassma_automation_scraper_bot';

        const { groupId } = await createGroup(groupName, botScraper, chatId);
        data.telegramChatId = groupId;
        
        await db.raw(generateSQL(data));
    } catch (err) {
        console.error(err);
    }
}

const generateSQL = (data) =>  `INSERT INTO paybo2.bank_accounts (
    id,
    merchant_id,
    bank_id,
    username,
    password,
    account_numbers,
    customer_id,
    account_holder_name,
    company_name,
    ifsc_code,
    upi, balance,
    balance_limit,
    image_qr,
    code,
    api_server_port,
    is_active,
    is_available,
    is_available_b2b,
    get_transaction_status,
    created_at,
    updated_at,
    running_from,
    scraper_status,
    scraper_proxy_id,
    headers,
    token_status,
    daily_max_transaction,
    daily_max_amount,
    min_amount,
    max_amount,
    is_deleted,
    telegram_chat_id,
    failed_login_count,
    mobile_number,
    bo_chat,
    is_telegram,
    order_id,
    is_deposit,
    is_payout,
    is_used,
    is_auto,
    is_pmi,
    is_testing,
    username_idfc,
    is_notification,
    time_notification,
    cs_code,
    start_bo,
    oauth_token,
    client_name,
    telegram_payout,
    support_for,
    description,
    master_currency_id,
    notify_chat_id,
    running_at
) VALUES (
    NULL,
    ${data.merchantId},
    ${data.bankId},
    '${data.username}',
    '${data.password}',
    '${data.accountNumber}',
    '${data.customerId}',
    '${data.accountHolderName}',
    '',
    '${data.ifscCode}',
    '${data.upi}',
    0,
    ${data.balanceLimit},
    NULL,
    NULL,
    ${data.apiServerPort},
    ${data.isActive},
    0,
    0,
    0,
    '${data.createdAt}',
    '${data.updatedAt}',
    NULL,
    'stopped',
    NULL,
    NULL,
    NULL,
    ${data.dailyMaxTransaction},
    ${data.dailyMaxAmount},
    ${data.minAmount},
    ${data.maxAmount},
    0,
    '${data.telegramChatId}',
    0,
    '${data.mobileNumber}',
    0,
    1,
    NULL,
    1,
    0,
    0,
    0,
    NULL,
    0,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    'ALL',
    NULL,
    8,
    NULL,
    NULL);`


module.exports = {
    insertBank,
    generateSQL
}