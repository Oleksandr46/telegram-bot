// const token = "8242274403:AAEgdl3W_T_rdu7u4_g_V8NPfocGl_CNRQY";

require("dotenv").config();

const TelegramBot = require("node-telegram-bot-api");
const OpenAI = require("openai");

// 🔐 беремо ключі з .env
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const OPENAI_KEY = process.env.OPENAI_API_KEY;

// Telegram bot
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

// OpenAI client
const openai = new OpenAI({
  apiKey: OPENAI_KEY,
});

// /start + кнопки
bot.onText(/\/start/, msg => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, "Привіт 👋 Я AI-бот.\nНапиши будь-що 🙂", {
    reply_markup: {
      keyboard: [["ℹ️ Про бота"], ["❌ Закрити меню"]],
      resize_keyboard: true,
    },
  });
});

// обробка повідомлень
bot.on("message", async msg => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // кнопки
  if (text === "ℹ️ Про бота") {
    return bot.sendMessage(chatId, "Я Telegram-бот з AI 🤖");
  }

  if (text === "❌ Закрити меню") {
    return bot.sendMessage(chatId, "Меню закрито", {
      reply_markup: { remove_keyboard: true },
    });
  }

  if (text === "/start") return;

  // ⏳ повідомлення "думаю"
  await bot.sendMessage(chatId, "🤖 Думаю...");

  try {
    // 🧠 AI відповідь
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",

      messages: [
        { role: "system", content: "Ти корисний, короткий помічник." },
        { role: "user", content: text },
      ],
    });

    const aiText = response.choices[0].message.content;

    bot.sendMessage(chatId, aiText);
  } catch (error) {
    console.error("OPENAI ERROR:", error.message);
    bot.sendMessage(chatId, "❌ Помилка AI (дивись консоль)");
  }
});

console.log("AI бот запущений...");
