require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, {
  polling: true,
});

const { getUser } = require("./state/userState");
const { mainMenu, languageMenu, honeyMenu } = require("./keyboards/menus");
const { handleOrder } = require("./handlers/order");

// /start
bot.onText(/\/start/, msg => {
  const chatId = msg.chat.id;
  const user = getUser(chatId);

  user.lang = null;
  user.mode = "menu";

  bot.sendMessage(chatId, "Оберіть мову / Wybierz język:", {
    reply_markup: languageMenu(),
  });
});

// ЄДИНИЙ listener
bot.on("message", msg => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const user = getUser(chatId);

  // 🌍 мова
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

  // 🍯 Види меду
  if (text === "🍯 Види меду") {
    return bot.sendMessage(chatId, "Оберіть мед:", {
      reply_markup: honeyMenu("ua"),
    });
  }

  if (text === "🍯 Rodzaje miodu") {
    return bot.sendMessage(chatId, "Wybierz miód:", {
      reply_markup: honeyMenu("pl"),
    });
  }

  // 🤖 консультант (поки заглушка)
  if (text === "🤖 Консультант" || text === "🤖 Konsultant") {
    return bot.sendMessage(chatId, "🤖 Консультант скоро буде доступний 🙂");
  }

  // 🛒 замовлення
  if (user.mode === "order") {
    return handleOrder(bot, msg, user);
  }
});

console.log("✅ Бот запущений");
