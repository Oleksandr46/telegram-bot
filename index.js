require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

const { getUser } = require("./js/state");
const {
  languageMenu,
  mainMenu,
  honeyMenu,
  confirmMenu,
} = require("./js/menus");
const { handleOrder, buildOrderSummary } = require("./js/order");

// /start
bot.onText(/\/start/, msg => {
  const user = getUser(msg.chat.id);
  user.lang = null;
  user.mode = "menu";

  bot.sendMessage(msg.chat.id, "Оберіть мову:", {
    reply_markup: languageMenu(),
  });
});

bot.on("message", msg => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const user = getUser(chatId);

  // 🌍 мова
  if (text === "🇺🇦 Українська") {
    user.lang = "ua";
    return bot.sendMessage(chatId, "Меню", {
      reply_markup: mainMenu("ua"),
    });
  }

  // 🍯 види меду
  if (text === "🍯 Види меду") {
    return bot.sendMessage(chatId, "Оберіть мед:", {
      reply_markup: honeyMenu(user.lang),
    });
  }

  // 🛒 замовити
  if (text === "🛒 Замовити") {
    user.mode = "order";
    user.orderStep = "name";
    user.cart = {};
    user.order = {};

    return bot.sendMessage(chatId, "✍️ Введіть імʼя:");
  }

  // 🟡 процес замовлення
  if (user.mode === "order") {
    return handleOrder(bot, msg, user);
  }

  // ⬅ назад = ПІДТВЕРДЖЕННЯ
  if (text === "⬅ Назад" && user.mode === "order") {
    const summary = buildOrderSummary(user);

    return bot.sendMessage(chatId, summary, {
      parse_mode: "Markdown",
      reply_markup: confirmMenu(),
    });
  }

  // ✅ підтвердити
  if (text === "✅ Підтвердити") {
    const summary = buildOrderSummary(user);

    bot.sendMessage(
      process.env.ADMIN_CHAT_ID,
      `📦 НОВЕ ЗАМОВЛЕННЯ\n\n${summary}\n\n👤 ${user.order.name}\n📞 ${user.order.phone}`
    );

    user.mode = "menu";
    user.cart = {};
    user.order = {};

    return bot.sendMessage(chatId, "✅ Дякуємо! Замовлення відправлено.", {
      reply_markup: mainMenu(user.lang),
    });
  }

  // 🏠 головне меню
  if (text === "🏠 Головне меню") {
    return bot.sendMessage(chatId, "Меню", {
      reply_markup: mainMenu(user.lang),
    });
  }
});

console.log("✅ Бот запущений");
