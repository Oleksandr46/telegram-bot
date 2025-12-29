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
      orderStep: null, // 👈 ДОДАТИ
      order: {}, // дані замовлення
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
  // ⬅️ Назад
  if (text === "⬅️ Назад" || text === "⬅️ Wróć") {
    if (user.mode === "order") {
      user.mode = "menu";
      user.orderStep = null;
      user.order = {};
      return showMenu(chatId, user.lang);
    }
    return showMenu(chatId, user.lang);
  }

  //👉 ПРОДУКТ + ФІНІШ
  if (user.mode === "order" && user.orderStep === "product") {
    if (text.includes("❌")) {
      return bot.sendMessage(
        chatId,
        user.lang === "ua"
          ? "❌ Цей товар тимчасово недоступний.\nБудь ласка, оберіть інший 🍯"
          : "❌ Ten produkt jest tymczasowo niedostępny.\nProszę wybrać inny 🍯"
      );
    }
    user.order.product = text;
    //повідомлення клієнту
    bot.sendMessage(
      chatId,
      user.lang === "ua"
        ? "🧾 Підтвердження замовлення:\n\n" +
            `👤 Імʼя: ${user.order.name}\n` +
            `📞 Телефон: ${user.order.phone}\n` +
            `🍯 Продукт: ${user.order.product}\n\n`
        : "🧾 Potwierdzenie zamówienia: \n\n" +
            `👤 Nazwa: ${user.order.name}\n` +
            `📞 Telefon: ${user.order.phone}\n` +
            `🍯 Produkt: ${user.order.product}\n\n`
    );
    bot.sendMessage(
      chatId,
      user.lang === "ua"
        ? "✅ Дякуємо! Ваше замовлення прийнято.\nМи звʼяжемося з вами найближчим часом 🐝"
        : "✅ Dziękuję! Twoje zamówienie zostało przyjęte.\nSkontaktujemy się z Tobą wkrótce 🐝"
    );
    // 🔔 Повідомлення тобі
    const ADMIN_CHAT_ID = 859056348; // <- сюди свій ID

    bot.sendMessage(
      ADMIN_CHAT_ID,
      "🛒 НОВЕ ЗАМОВЛЕННЯ\n\n" +
        `👤 Імʼя: ${user.order.name}\n` +
        `📞 Телефон: ${user.order.phone}\n` +
        `🍯 Продукт: ${user.order.product}`
    );
    //reset
    user.mode = "menu";
    user.orderStep = null;
    user.order = {};
    return;
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

  // Опис продукту (PL)
  if (text === "🍯 Akacjowy" && user.mode !== "order") {
    return bot.sendMessage(
      chatId,
      "Akacjowy miód – delikatny, jasny, idealny dla dzieci."
    );
  }
  if (text === "🍯 Lipowy ❌" && user.mode !== "order") {
    return bot.sendMessage(
      chatId,
      "🍯 Miód lipowy – ❌ brak na stanie.\n\n" +
        "👉 Polecamy zamiast tego:\n" +
        "• 🍯 Akacjowy\n" +
        "• 🍯 Wielokwiatowy"
    );
  }
  if (text === "🍯 Wielokwiatowy" && user.mode !== "order") {
    return bot.sendMessage(
      chatId,
      "Miód wielokwiatowy – wzmacnia odporność, uniwersalny."
    );
  }
  if (text === "🍯 Rzepakowy" && user.mode !== "order") {
    return bot.sendMessage(
      chatId,
      "Miód rzepakowy – kremowy, dobry dla serca."
    );
  }
  if (text === "🌼 Pyłek kwiatowy" && user.mode !== "order") {
    return bot.sendMessage(
      chatId,
      "Pyłek kwiatowy – naturalne witaminy i energia."
    );
  }
  if (text === "🐝 Propolis" && user.mode !== "order") {
    return bot.sendMessage(
      chatId,
      "Propolis – naturalny antybiotyk, wzmacnia odporność."
    );
  }

  // 🍯 Види меду (UA)
  if (text === "🍯 Види меду" && user.lang === "ua") {
    return bot.sendMessage(chatId, "🍯 Доступні продукти:", {
      reply_markup: {
        keyboard: [
          ["🍯 Акацієвий мед"],
          ["🍯 Липовий мед ❌"],
          ["🍯 Багатоквітковий мед"],
          ["🍯 Рапсовий мед"],
          ["🌼 Квітковий пилок"],
          ["🐝 Прополіс"],
          ["❌ Закрити"],
        ],
        resize_keyboard: true,
      },
    });
  }

  // Опис продукту (UA)
  if (text === "🍯 Акацієвий мед") {
    return bot.sendMessage(
      chatId,
      "Акацієвий мед - ніжний, легкий, відмінно підходить для дітей."
    );
  }
  if (text === "🍯 Липовий мед ❌") {
    return bot.sendMessage(
      chatId,
      "🍯 Липовий мед – ❌ немає в наявності.\n\n" +
        "👉 Натомість рекомендуємо:\n" +
        "• 🍯 Акація\n" +
        "• 🍯 Багатоквітковий"
    );
  }
  if (text === "🍯 Багатоквітковий мед") {
    return bot.sendMessage(
      chatId,
      "Багатоквітковий мед - зміцнює імунітет, універсальний."
    );
  }
  if (text === "🍯 Рапсовий мед") {
    return bot.sendMessage(
      chatId,
      "Рапсовий мед - вершковий, корисний для серця."
    );
  }
  if (text === "🌼 Квітковий пилок") {
    return bot.sendMessage(
      chatId,
      "Квітковий пилок – натуральні вітаміни та енергія."
    );
  }
  if (text === "🐝 Прополіс") {
    return bot.sendMessage(
      chatId,
      "Прополіс - природний антибіотик, зміцнює імунітет."
    );
  }

  // 🛒 Замовити
  if (text === "🛒 Замовити" || text === "🛒 Zamów") {
    user.mode = "order";
    user.orderStep = "name";
    user.order = {};
    return bot.sendMessage(
      chatId,
      user.lang === "ua" ? "✍️ Вкажіть ваше імʼя:" : "✍️ Wpisz swoje imię:"
    );
  }
  //ОБРОБКА КРОКІВ ЗАМОВЛЕННЯ
  if (user.mode === "order" && user.orderStep === "name") {
    user.order.name = text;
    user.orderStep = "phone";
    return bot.sendMessage(
      chatId,
      user.lang === "ua"
        ? "📞 Вкажіть номер телефону:"
        : "📞 Wprowadź swój numer telefonu"
    );
  }

  //👉 ТЕЛЕФОН
  if (user.mode === "order" && user.orderStep === "phone") {
    user.order.phone = text;
    user.orderStep = "product";
    return bot.sendMessage(
      chatId,
      user.lang === "ua" ? "🍯 Оберіть продукт:" : "🍯 Wybierz produkt:",
      {
        reply_markup: {
          keyboard:
            user.lang === "pl"
              ? [
                  ["🍯 Akacjowy"],
                  ["🍯 Wielokwiatowy"],
                  ["🍯 Rzepakowy"],
                  ["🌼 Pyłek kwiatowy"],
                  ["🐝 Propolis"],
                  ["❌ Скасувати"],
                  ["⬅️ Wróć"],
                ]
              : [
                  ["🍯 Акацієвий мед"],
                  ["🍯 Багатоквітковий мед"],
                  ["🍯 Рапсовий мед"],
                  ["🌼 Квітковий пилок"],
                  ["🐝 Прополіс"],
                  ["❌ Скасувати"],
                  ["⬅️ Назад"],
                ],
          resize_keyboard: true,
        },
      }
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
    return bot.sendMessage(
      chatId,
      user.lang === "pl" ? "Menu zamknięte" : "Меню закрито",
      {
        reply_markup: { remove_keyboard: true },
      }
    );
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
