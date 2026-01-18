require("dotenv").config();

const TelegramBot = require("node-telegram-bot-api");
const { getUser } = require("./state/userState");
const { mainMenu, languageMenu } = require("./keyboards/menus");
const { handleOrder } = require("./handlers/order");

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

// /start
bot.onText(/\/start/, msg => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, "Оберіть мову / Wybierz język:", {
    reply_markup: languageMenu(),
  });
});

// ОСНОВНИЙ LISTENER
bot.on("message", msg => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const user = getUser(chatId);
  console.log("TEXT:", text);
  console.log("USER:", user);

  // 🌍 вибір мови
  if (text === "🇺🇦 Українська") {
    user.lang = "ua";
    user.mode = "menu";
    return bot.sendMessage(chatId, "Меню", {
      reply_markup: mainMenu("ua"),
    });
  }

  if (text === "🇵🇱 Polski") {
    user.lang = "pl";
    user.mode = "menu";
    return bot.sendMessage(chatId, "Menu", {
      reply_markup: mainMenu("pl"),
    });
  }

  // 🏠 головне меню
  if (text === "🏠 Головне меню") {
    user.mode = "menu";
    return bot.sendMessage(chatId, "Меню", {
      reply_markup: mainMenu(user.lang),
    });
  }

  // 🛒 замовлення (ЗАВЖДИ)
  if (text === "🛒 Замовити" || text === "🛒 Zamów" || user.mode === "order") {
    return handleOrder(bot, msg, user);
  }
};);

console.log("✅ Бот запущений");
