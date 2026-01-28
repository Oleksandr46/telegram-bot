const { use } = require("react");
const { mainMenu } = require("../keyboards/menus");

function handleOrder(bot, msg, user) {
  const chatId = msg.chat.id;
  const text = msg.text;

  // старт замовлення
  if (text === "🛒 Замовити" || text === "🛒 Zamów") {
    user.mode = "order";
    user.orderStep = "name";
    user.cart = [];

    return bot.sendMessage(
      chatId,
      user.lang === "ua" ? "✍️ Вкажіть імʼя:" : "✍️ Podaj imię:"
    );
  }

  if (user.orderStep === "name") {
    user.order.name = text;
    user.orderStep = "phone";

    return bot.sendMessage(
      chatId,
      user.lang === "ua" ? "📞 Вкажіть телефон:" : "📞 Podaj telefon:"
    );
  }

  if (user.orderStep === "phone") {
    user.order.phone = text;
    user.orderStep = null;
    user.mode = "menu";

    return bot.sendMessage(chatId, "✅ Замовлення збережено", {
      reply_markup: mainMenu(user.lang),
    });
  }

  if (user.orderStep === "phone") {
    user.order.phone = text;
    user.orderStep = "product";

    return bot.sendMessage(
      chatId,
      user.lang === "ua" ? "🍯 Оберіть продукт:" : "🍯 Wybierz produkt:",
      {
        reply_markup: honeyMenu(user.lang),
      }
    );
  }
}

module.exports = { handleOrder };
