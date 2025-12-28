require("dotenv").config();

const TelegramBot = require("node-telegram-bot-api");
const OpenAI = require("openai");

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const OPENAI_KEY = process.env.OPENAI_API_KEY;

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });
const openai = new OpenAI({ apiKey: OPENAI_KEY });

// 🧠 стан користувачів
const users = {};

function getUser(chatId) {
  if (!users[chatId]) {
    users[chatId] = {
      lang: null,
      mode: "menu", // menu | ai | order
      aiCount: 0,
    };
  }
  return users[chatId];
}

function showMenu(chatId, lang) {
  const menus = {
    ua: ["🍯 Види меду", "🤖 Консультант", "🛒 Замовити", "❌ Закрити"],
    pl: ["🍯 Rodzaje miodu", "🤖 Konsultant", "🛒 Zamów", "❌ Zamknij"],
  };

  bot.sendMessage(chatId, lang === "ua" ? "Оберіть дію:" : "Wybierz opcję:", {
    reply_markup: {
      keyboard: menus[lang].map(b => [b]),
      resize_keyboard: true,
    },
  });
}

// /start — вибір мови
bot.onText(/\/start/, msg => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, "Оберіть мову / Wybierz język:", {
    reply_markup: {
      keyboard: [["🇺🇦 Українська", "🇵🇱 Polski"]],
      resize_keyboard: true,
    },
  });
});

// основна логіка
bot.on("message", async msg => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const user = getUser(chatId);

  // 🌍 мова
  if (text === "🇺🇦 Українська") {
    user.lang = "ua";
    return showMenu(chatId, "ua");
  }

  if (text === "🇵🇱 Polski") {
    user.lang = "pl";
    return showMenu(chatId, "pl");
  }

  // 🍯 Rodzaje miodu (PL)
  if (text === "🍯 Rodzaje miodu" && user.lang === "pl") {
    return bot.sendMessage(chatId, "🍯 Dostępne produkty:", {
      reply_markup: {
        keyboard: [
          ["🍯 Akacjowy"],
          ["🍯 Lipowy ❌"],
          ["🍯 Wielokwiatowy"],
          ["🍯 Rzepakowy"],
          ["🌼 Pyłek kwiatowy"],
          ["🐝 Propolis"],
          ["❌ Zamknij"],
        ],
        resize_keyboard: true,
      },
    });
  }

  // Опис продукту

  if (text === "🍯 Akacjowy") {
    return bot.sendMessage(
      chatId,
      "Akacjowy miód – delikatny, jasny, idealny dla dzieci."
    );
  }

  if (text === "🍯 Lipowy ❌") {
    return bot.sendMessage(
      chatId,
      "🍯 Miód lipowy – ❌ brak na stanie.\n\n" +
        "👉 Polecamy zamiast tego:\n" +
        "• 🍯 Akacjowy\n" +
        "• 🍯 Wielokwiatowy"
    );
  }

  if (text === "🍯 Wielokwiatowy") {
    return bot.sendMessage(
      chatId,
      "Miód wielokwiatowy – wzmacnia odporność, uniwersalny."
    );
  }

  if (text === "🍯 Rzepakowy") {
    return bot.sendMessage(
      chatId,
      "Miód rzepakowy – kremowy, dobry dla serca."
    );
  }

  if (text === "🌼 Pyłek kwiatowy") {
    return bot.sendMessage(
      chatId,
      "Pyłek kwiatowy – naturalne witaminy i energia."
    );
  }

  if (text === "🐝 Propolis") {
    return bot.sendMessage(
      chatId,
      "Propolis – naturalny antybiotyk, wzmacnia odporność."
    );
  }

  // 🤖 AI режим
  if (text === "🤖 Konsultant" || text === "🤖 Консультант") {
    user.mode = "ai";
    return bot.sendMessage(chatId, "🤖 Напишіть ваше питання про мед:");
  }

  // ❌ закриття
  if (text.includes("❌")) {
    user.mode = "menu";
    return bot.sendMessage(chatId, "Меню закрито", {
      reply_markup: { remove_keyboard: true },
    });
  }

  // 🧠 AI відповідає ТІЛЬКИ в ai-режимі
  if (user.mode === "ai") {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "Jesteś konsultantem sprzedaży naturalnego miodu. Odpowiadaj krótko i uprzejmie.",
          },
          { role: "user", content: text },
        ],
      });

      return bot.sendMessage(chatId, response.choices[0].message.content);
    } catch (error) {
      if (error.status === 429) {
        return bot.sendMessage(
          chatId,
          "🤖 Konsultant chwilowo niedostępny. Spróbuj później 🙂"
        );
      }
      console.error(error);
    }
  }
});

console.log("✅ AI бот запущений");
